## Context

Ver `proposal.md` para a motivação e `specs/gestao-maquinas/spec.md` para o contrato observável. O repositório não contém ainda código da aplicação nem especificações de capabilities; o design limita-se por isso ao fluxo e aos limites de integração indicados no contexto do projeto.

## Goals / Non-Goals

**Goals:**
- Definir uma sequência que só torna a máquina monitorizável depois da validação da ligação e da associação dos sensores.
- Manter a criação do gémeo digital dependente do registo bem-sucedido e da associação IoT.

**Non-Goals:**
- Definir detalhes de instalação/configuração do broker, credenciais dos sensores ou detalhes de interface não determinados pelo slice.
- Definir gestão de falhas IoT após a ativação ou operações posteriores sobre máquinas registadas.

## Decisions

- Tratar o registo como um fluxo condicionado: recolher os dados indicados, verificar a ligação, associar o sensor e só então confirmar a máquina e ativar o gémeo digital. Isto implementa BR-01; criar o gémeo antes da associação permitiria monitorização prematura. A alternativa de aceitar o registo offline não satisfaz CT-01.2.
- A tentativa sem ligação termina sem concluir o registo e apresenta a mensagem definida na especificação. A alternativa de guardar uma máquina pendente criaria um estado adicional não previsto neste slice.
- Usar o módulo de Integração com sensores IoT como fronteira dos sensores. Conforme ADR-005, o sensor (ou simulador no 1.º incremento) publica no broker MQTT e o módulo subscreve as mensagens. A compatibilidade dos sensores reais e o mecanismo de confirmar presença/ligação continuam por validar.
- Validar o cliente no Repositório de dados dos clientes e persistir a máquina e a associação sensor–máquina no Repositório de dados do sistema, conforme ADR-006. A separação é lógica; localização física e tecnologia não são definidas por este slice.

## Risks / Trade-offs

- [A ligação pode falhar transitoriamente] → Interromper o registo conforme CT-01.2 e permitir uma nova tentativa administrativa sem criar uma máquina monitorizada parcial.
- [A associação pode confirmar antes de a máquina responder com dados] → Só indicar que o gémeo recebe dados em tempo real quando a integração confirmar a receção, conforme CT-01.1.
