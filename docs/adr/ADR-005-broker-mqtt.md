# ADR-005 — Broker de mensagens (MQTT) para os dados dos sensores

**Estado:** aceite

## Contexto
Os sensores IoT enviam leituras continuamente (estado, temperatura, stock e lotes). Os dados têm de aparecer em até 30 segundos (RNF-01) e o sistema tem de suportar pelo menos 1000 máquinas (RNF-10). O protocolo não estava definido na SRS.

## Decisão
Os sensores publicam as leituras num broker MQTT (Mosquitto como referência). O módulo de Integração com sensores IoT subscreve os tópicos e é o único ponto de contacto com os sensores.

- Tópico de leituras: `godseye/machines/{sensorId}/readings` (QoS 1).
- Estado de ligação do sensor: `godseye/machines/{sensorId}/status` (a confirmar com os equipamentos).
- Mensagem em JSON: `timestamp`, `temperatura`, `estadoOperacional`, `produtos[]`, `lotes[]`.
- As leituras não entram pela API REST; o endpoint `POST /api/iot/readings` deixou de existir.
- No 1.º incremento, um simulador publica no broker.

## Alternativas consideradas
Envio direto por HTTP para a API; fila AMQP (RabbitMQ) ou Kafka; consulta periódica aos sensores.

## Consequências
Desacopla sensores e aplicação, absorve picos e permite reenvio quando um sensor volta a ligar-se. Acrescenta um componente a instalar e operar, exige sensores com suporte MQTT (a confirmar) e obriga a definir a autenticação dos sensores no broker (utilizador por sensor e TLS).
