## Why

O gestor de operações precisa de verificar remotamente o funcionamento das máquinas e distinguir dados atuais de dados desatualizados. Este slice do UC-02 apresenta estado, temperatura e dados operacionais, respeitando os limites de atualização e a indicação explícita da última leitura.

## What Changes

- Apresenta o estado da máquina e os dados operacionais recebidos dos sensores IoT.
- Classifica as máquinas como Online, Com alerta ou Offline, aplicando o limite de 15 minutos sem transmissão.
- Apresenta os últimos dados recebidos e a hora da última atualização quando a máquina está Offline.
- Atualiza os dados no ecrã no máximo 30 segundos após a leitura do sensor e evita apresentar dados antigos como atuais.

## Capabilities

### New Capabilities
- `estado-maquinas`: consulta do estado e dos dados de funcionamento das máquinas.

### Modified Capabilities

## Impact

Abrange a vista de consulta da máquina, a apresentação dos dados do gémeo digital e a integração de leitura com o sistema IoT. Os requisitos de atualização e indicação temporal condicionam a apresentação, sem definir tecnologia ou protocolo específico.
