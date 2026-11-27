## Purpose

Define o comportamento do registo de máquinas DPVending, da associação dos sensores IoT e da ativação do gémeo digital para monitorização.

## ADDED Requirements

### Requirement: UC-01 Registar máquina e ativar gémeo digital

O sistema SHALL permitir ao administrador registar uma máquina e associar-lhe os sensores IoT, para que passe a ser monitorizada (BR-01).

#### Scenario: CT-01.1 Registo com sucesso

* WHEN o administrador regista uma máquina com ligação à Internet e sensores IoT instalados, indicando identificador do sensor, localização, modelo e cliente
* THEN a máquina é guardada e o gémeo digital recebe os primeiros dados da máquina no máximo 1 minuto depois do registo

#### Scenario: CT-01.2 Máquina sem ligação

* WHEN o administrador tenta registar e ativar uma máquina sem ligação à Internet
* THEN o sistema apresenta a mensagem "Falha de ligação ao sensor" e interrompe o registo

