import mqtt, { type MqttClient, type IPublishPacket } from 'mqtt';
import {
  SensorUnavailableError,
  type SensorAssociation,
  type SensorIntegration,
  type SensorReading,
} from '../machines/registration';

interface ReadingHandler {
  active: boolean;
  onReading: (reading: SensorReading) => Promise<void>;
  queued: SensorReading[];
  delivery: Promise<void>;
}

type PresenceWaiter = (isOnline: boolean) => void;

export class MqttSensorIntegration implements SensorIntegration {
  private client?: MqttClient;
  private readonly readingHandlers = new Map<string, ReadingHandler>();
  private readonly reservations = new Set<string>();
  private readonly presenceWaiters = new Map<string, Set<PresenceWaiter>>();

  constructor(
    private readonly url = process.env.MQTT_URL ?? 'mqtt://localhost:1883',
    private readonly presenceTimeoutMs = 3000,
  ) {}

  async associate(
    sensorId: string,
    onReading: (reading: SensorReading) => Promise<void>,
  ): Promise<SensorAssociation> {
    if (!this.isValidSensorId(sensorId) || this.reservations.has(sensorId)) {
      throw new SensorUnavailableError();
    }

    this.reservations.add(sensorId);
    const deadline = Date.now() + this.presenceTimeoutMs;
    const statusTopic = `godseye/machines/${sensorId}/status`;
    const readingsTopic = `godseye/machines/${sensorId}/readings`;
    let readingsSubscribed = false;

    try {
      const client = await this.connectUntil(deadline);
      await this.waitForRetainedOnline(client, statusTopic, deadline);
      await this.unsubscribe(client, statusTopic);

      const handler: ReadingHandler = {
        active: false,
        onReading,
        queued: [],
        delivery: Promise.resolve(),
      };
      this.readingHandlers.set(sensorId, handler);
      await this.subscribe(client, readingsTopic, 1);
      readingsSubscribed = true;

      let closed = false;
      return {
        activate: () => {
          if (closed || handler.active) return;
          handler.active = true;
          const queued = handler.queued.splice(0);
          for (const reading of queued) this.enqueue(handler, reading);
        },
        close: async () => {
          if (closed) return;
          closed = true;
          this.readingHandlers.delete(sensorId);
          this.reservations.delete(sensorId);
          if (this.client?.connected) await this.unsubscribe(this.client, readingsTopic);
        },
      };
    } catch {
      this.readingHandlers.delete(sensorId);
      this.reservations.delete(sensorId);
      if (this.client?.connected) {
        await this.unsubscribe(this.client, statusTopic).catch(() => undefined);
        if (readingsSubscribed) {
          await this.unsubscribe(this.client, readingsTopic).catch(() => undefined);
        }
      }
      throw new SensorUnavailableError();
    }
  }

  private isValidSensorId(sensorId: string): boolean {
    return sensorId.trim().length > 0 && !/[\s+#\/]/.test(sensorId) && !sensorId.includes('\0');
  }

  private async connectUntil(deadline: number): Promise<MqttClient> {
    let client = this.client;
    if (!client) {
      client = mqtt.connect(this.url, {
        protocolVersion: 5,
        connectTimeout: this.presenceTimeoutMs,
        reconnectPeriod: 1000,
      });
      this.client = client;
      client.on('message', (topic, payload, packet) => this.receive(topic, payload, packet));
      client.on('error', () => undefined);
    }

    if (client.connected) return client;

    const remaining = deadline - Date.now();
    if (remaining <= 0) throw new SensorUnavailableError();

    await new Promise<void>((resolve, reject) => {
      let settled = false;
      const finish = (error?: Error) => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        client!.off('connect', onConnect);
        client!.off('error', onError);
        if (error) reject(error);
        else resolve();
      };
      const onConnect = () => finish();
      const onError = () => finish(new SensorUnavailableError());
      const timer = setTimeout(() => finish(new SensorUnavailableError()), remaining);

      client!.on('connect', onConnect);
      client!.on('error', onError);
      if (client!.connected) finish();
    });

    return client;
  }

  private async waitForRetainedOnline(
    client: MqttClient,
    topic: string,
    deadline: number,
  ): Promise<void> {
    const remaining = deadline - Date.now();
    if (remaining <= 0) throw new SensorUnavailableError();

    await new Promise<void>((resolve, reject) => {
      let settled = false;
      const waiters = this.presenceWaiters.get(topic) ?? new Set<PresenceWaiter>();
      const finish = (isOnline: boolean) => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        waiters.delete(onPresence);
        if (waiters.size === 0) this.presenceWaiters.delete(topic);
        if (isOnline) resolve();
        else reject(new SensorUnavailableError());
      };
      const onPresence: PresenceWaiter = (isOnline) => finish(isOnline);
      const timer = setTimeout(() => finish(false), remaining);

      waiters.add(onPresence);
      this.presenceWaiters.set(topic, waiters);
      client.subscribe(topic, { qos: 1, rap: true, rh: 0 }, (error) => {
        if (error) finish(false);
      });
    });
  }

  private receive(topic: string, payload: Buffer, packet: IPublishPacket): void {
    const waiters = this.presenceWaiters.get(topic);
    if (waiters && packet.retain) {
      const isOnline = payload.toString() === 'online';
      for (const waiter of [...waiters]) waiter(isOnline);
      return;
    }

    const match = /^godseye\/machines\/([^/]+)\/readings$/.exec(topic);
    const sensorId = match?.[1];
    if (!sensorId) return;

    const handler = this.readingHandlers.get(sensorId);
    if (!handler) return;

    const reading = this.parseReading(payload);
    if (!reading) return;

    if (!handler.active) handler.queued.push(reading);
    else this.enqueue(handler, reading);
  }

  private parseReading(payload: Buffer): SensorReading | undefined {
    try {
      const value: unknown = JSON.parse(payload.toString());
      if (!value || typeof value !== 'object') return undefined;

      const reading = value as Record<string, unknown>;
      if (
        typeof reading.timestamp !== 'string' ||
        Number.isNaN(Date.parse(reading.timestamp)) ||
        typeof reading.temperatura !== 'number' ||
        !Number.isFinite(reading.temperatura) ||
        typeof reading.estadoOperacional !== 'string' ||
        !Array.isArray(reading.produtos) ||
        !Array.isArray(reading.lotes)
      ) {
        return undefined;
      }

      return {
        timestamp: reading.timestamp,
        temperatura: reading.temperatura,
        estadoOperacional: reading.estadoOperacional,
        produtos: reading.produtos,
        lotes: reading.lotes,
      };
    } catch {
      return undefined;
    }
  }

  private enqueue(handler: ReadingHandler, reading: SensorReading): void {
    handler.delivery = handler.delivery
      .then(() => handler.onReading(reading))
      .catch(() => undefined);
  }

  private subscribe(client: MqttClient, topic: string, qos: 0 | 1 | 2): Promise<void> {
    return new Promise((resolve, reject) => {
      client.subscribe(topic, { qos }, (error) => {
        if (error) reject(error);
        else resolve();
      });
    });
  }

  private unsubscribe(client: MqttClient, topic: string): Promise<void> {
    return new Promise((resolve, reject) => {
      client.unsubscribe(topic, (error) => {
        if (error) reject(error);
        else resolve();
      });
    });
  }
}
