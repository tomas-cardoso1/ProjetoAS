## Purpose

Define a consulta remota do estado e dos dados de funcionamento das máquinas, incluindo a apresentação clara da atualização mais recente.

## ADDED Requirements

### Requirement: UC-02 Consultar estado de uma máquina
O sistema SHALL apresentar ao gestor de operações o estado atual de uma máquina e os dados de funcionamento recebidos dos sensores (BR-02, BR-03).

#### Scenario: CT-02.1 Máquina online
- WHEN o gestor seleciona uma máquina registada, online e com sensores a enviar dados em tempo real
- THEN o sistema indica o estado "Online", a temperatura atual e os dados de funcionamento

#### Scenario: CT-02.2 Máquina offline
- WHEN o gestor seleciona no mapa uma máquina sem transmissão de dados
- THEN o sistema indica o estado "Offline" e apresenta a data do último dado recebido
