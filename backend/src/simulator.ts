import mqtt, { type MqttClient } from 'mqtt';

const defaultSensorIds = (process.env.SIMULATOR_SENSOR_IDS ?? 'sensor-ct-01-1,sensor-simulador-2')
  .split(',')
  .map((sensorId) => sensorId.trim())
  .filter(Boolean);

export class SensorSimulator {
  private client: MqttClient | undefined;
  private interval: NodeJS.Timeout | undefined;

  constructor(
    private readonly brokerUrl = process.env.MQTT_URL ?? 'mqtt://localhost:1883',
    private readonly sensorIds = defaultSensorIds,
  ) {}

  async start(): Promise<void> {
    if (this.client) throw new Error('O simulador já foi iniciado.');

    const client = mqtt.connect(this.brokerUrl, { connectTimeout: 5000, reconnectPeriod: 1000 });
    this.client = client;
    client.on('error', (error) => {
      console.error(`Falha no simulador MQTT: ${error.message}`);
    });

    try {
      await this.waitForConnection(client);
      await Promise.all(this.sensorIds.map((sensorId) => this.publishStatus(client, sensorId, 'online')));
      this.publishReadings(client);
      this.interval = setInterval(() => this.publishReadings(client), 5000);
    } catch (error) {
      client.end(true);
      this.client = undefined;
      throw error;
    }
  }

  async stop(): Promise<void> {
    const client = this.client;
    this.client = undefined;
    if (this.interval) clearInterval(this.interval);
    this.interval = undefined;
    if (!client) return;

    if (!client.connected) {
      client.end(true);
      return;
    }

    let publishTimeout: NodeJS.Timeout | undefined;
    await Promise.race([
      Promise.all(this.sensorIds.map((sensorId) => this.publishStatus(client, sensorId, 'offline')))
        .catch(() => undefined),
      new Promise<void>((resolve) => {
        publishTimeout = setTimeout(resolve, 1000);
      }),
    ]);
    if (publishTimeout) clearTimeout(publishTimeout);

    await new Promise<void>((resolve) => {
      let closed = false;
      const finish = () => {
        if (closed) return;
        closed = true;
        clearTimeout(forceCloseTimeout);
        resolve();
      };
      const forceCloseTimeout = setTimeout(() => {
        client.end(true);
        finish();
      }, 1000);
      client.end(false, {}, finish);
    });
  }

  private waitForConnection(client: MqttClient): Promise<void> {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => finish(new Error('Tempo limite de ligação ao broker excedido.')), 5000);
      const finish = (error?: Error) => {
        clearTimeout(timer);
        client.off('connect', onConnect);
        client.off('error', onError);
        if (error) reject(error);
        else resolve();
      };
      const onConnect = () => finish();
      const onError = (error: Error) => finish(error);

      client.once('connect', onConnect);
      client.once('error', onError);
      if (client.connected) finish();
    });
  }

  private publishReadings(client: MqttClient): void {
    for (const sensorId of this.sensorIds) {
      const reading = {
        timestamp: new Date().toISOString(),
        temperatura: 6.5,
        estadoOperacional: 'normal',
        produtos: [],
        lotes: [],
      };
      client.publish(
        `godseye/machines/${sensorId}/readings`,
        JSON.stringify(reading),
        { qos: 1 },
      );
    }
  }

  private publishStatus(
    client: MqttClient,
    sensorId: string,
    status: 'online' | 'offline',
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      client.publish(
        `godseye/machines/${sensorId}/status`,
        status,
        { qos: 1, retain: true },
        (error) => {
          if (error) reject(error);
          else resolve();
        },
      );
    });
  }
}

if (require.main === module) {
  const simulator = new SensorSimulator();
  void simulator
    .start()
    .then(() => console.log(`Simulador MQTT pronto; sensores: ${defaultSensorIds.join(', ')}`))
    .catch((error: unknown) => {
      console.error('Falha ao iniciar o simulador MQTT:', error);
      process.exitCode = 1;
    });

  const stop = () => {
    void simulator.stop().catch((error: unknown) => {
      console.error('Falha ao parar o simulador MQTT:', error);
      process.exitCode = 1;
    });
  };
  process.once('SIGINT', stop);
  process.once('SIGTERM', stop);
}
