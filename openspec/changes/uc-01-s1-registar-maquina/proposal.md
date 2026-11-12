## Why

O God's Eye precisa de um fluxo consistente para ativar a monitorização de uma máquina DPVending. Este slice do UC-01 garante que a máquina só começa a ser monitorizada depois de registada e de os seus sensores IoT estarem associados, conforme BR-01.

## What Changes

- Permite ao administrador registar a ativação com identificador do sensor, localização, modelo e cliente.
- Liga-se à máquina, associa os sensores IoT e cria o gémeo digital para receber dados em tempo real.
- Interrompe o registo e apresenta uma mensagem quando a máquina não tem ligação à Internet.

## Capabilities

### New Capabilities
- `gestao-maquinas`: registo de máquinas, associação de sensores IoT e ativação do gémeo digital.

### Modified Capabilities

## Impact

Abrange o fluxo de registo no God's Eye, a integração com o sistema IoT da máquina e a criação do gémeo digital. Não define alterações a APIs ou tecnologias específicas neste slice.
