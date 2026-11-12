## Context

Ver `proposal.md` para a motivação e `specs/gestao-maquinas/spec.md` para o contrato observável. O repositório não contém ainda código da aplicação nem especificações de capabilities; o design limita-se por isso ao fluxo e aos limites de integração indicados no contexto do projeto.

## Goals / Non-Goals

**Goals:**
- Definir uma sequência que só torna a máquina monitorizável depois da validação da ligação e da associação dos sensores.
- Manter a criação do gémeo digital dependente do registo bem-sucedido e da associação IoT.

**Non-Goals:**
- Escolher protocolos, fornecedores, tecnologias de armazenamento ou detalhes de interface não determinados pelo slice.
- Definir gestão de falhas IoT após a ativação ou operações posteriores sobre máquinas registadas.

## Decisions

- Tratar o registo como um fluxo condicionado: recolher os dados indicados, verificar a ligação, associar o sensor e só então confirmar a máquina e ativar o gémeo digital. Isto implementa BR-01; criar o gémeo antes da associação permitiria monitorização prematura. A alternativa de aceitar o registo offline não satisfaz CT-01.2.
- A tentativa sem ligação termina sem concluir o registo e apresenta a mensagem definida na especificação. A alternativa de guardar uma máquina pendente criaria um estado adicional não previsto neste slice.
- Manter a integração com o sistema IoT atrás de uma fronteira de serviço adaptável, deixando a seleção do protocolo e a forma de confirmar dados em tempo real para a implementação, quando os detalhes da máquina estiverem disponíveis.

## Risks / Trade-offs

- [A ligação pode falhar transitoriamente] → Interromper o registo conforme CT-01.2 e permitir uma nova tentativa administrativa sem criar uma máquina monitorizada parcial.
- [A associação pode confirmar antes de a máquina responder com dados] → Só indicar que o gémeo recebe dados em tempo real quando a integração confirmar a receção, conforme CT-01.1.
