## Context

Ver `proposal.md` para a motivação e `specs/gestao-maquinas/spec.md` para o contrato observável. Esta change implementa o slice UC-01.S1 sobre a arquitetura definida em `docs/design/E5-Desenho.md`.

- Módulos (E5, Tabela 4): Aplicação Web; API de serviços; Gestão de máquinas e estado; Integração com sensores IoT; Broker de mensagens (MQTT); Repositório de dados.
- Endpoint: `POST /api/machines`, conforme `docs/api/openapi.yaml` (201 em caso de sucesso; 502 com "Falha de ligação ao sensor").
- ADR aplicáveis: ADR-001 (stack), ADR-002 (testes), ADR-003 (contrato da API) e ADR-005 (broker MQTT).

## Goals / Non-Goals

**Goals:**
- Só tornar a máquina monitorizável depois de verificar a ligação e associar o sensor (BR-01, CT-01.2).
- Expor o registo através de `POST /api/machines`, sem endpoints fora do contrato.
- Criar o gémeo digital apenas após o registo bem-sucedido, com os primeiros dados da máquina no máximo 1 minuto depois (CT-01.1).

**Non-Goals:**
- Definir detalhes de instalação/configuração do broker, credenciais dos sensores ou detalhes de interface não determinados pelo slice.
- Definir gestão de falhas IoT após a ativação ou operações posteriores sobre máquinas registadas.

## Decisions

- Tratar o registo como um fluxo condicionado: recolher os dados indicados, verificar a ligação, associar o sensor e só então confirmar a máquina e ativar o gémeo digital. Isto implementa BR-01; criar o gémeo antes da associação permitiria monitorização prematura. A alternativa de aceitar o registo offline não satisfaz CT-01.2.
- A tentativa sem ligação termina sem concluir o registo e apresenta a mensagem definida na especificação. A alternativa de guardar uma máquina pendente criaria um estado adicional não previsto neste slice.
- Usar o módulo de Integração com sensores IoT como fronteira dos sensores. Conforme ADR-005, o sensor (ou simulador no 1.º incremento) publica no broker MQTT e o módulo subscreve as mensagens. A compatibilidade dos sensores reais e o mecanismo de confirmar presença/ligação continuam por validar.
- Validar o cliente no Repositório de dados dos clientes e persistir a máquina e a associação sensor–máquina no Repositório de dados do sistema, conforme ADR-006. A separação é lógica; localização física e tecnologia não são definidas por este slice.

## Risks / Trade-offs

- [A ligação pode falhar transitoriamente] → Interromper o registo conforme CT-01.2 e permitir nova tentativa, sem criar uma máquina monitorizada parcial.
- [O protocolo e o formato das mensagens ainda não estão confirmados] → Isolar tudo no adaptador de Integração com sensores IoT e usar o simulador, para poder mudar sem alterar o domínio.
- [A associação pode confirmar antes de chegarem dados] → Só considerar que o gémeo recebe dados quando chega a primeira leitura, no máximo 1 minuto depois do registo (CT-01.1).