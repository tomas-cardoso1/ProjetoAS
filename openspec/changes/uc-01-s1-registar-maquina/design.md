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
- Gestão de falhas dos sensores depois da ativação e operações posteriores sobre máquinas registadas.
- Alertas e integração com parceiros (incrementos futuros).
- Fixar o formato e a frequência definitivos das mensagens dos sensores, que dependem dos equipamentos.

## Decisions

- Fluxo do registo (E5, Figura 2): a API chama a Gestão de máquinas e estado, que pede à Integração com sensores IoT para verificar a ligação do sensor no broker e subscrever o tópico `godseye/machines/{sensorId}/readings`; só depois da associação confirmada a máquina é guardada e o gémeo digital é criado, e a API devolve 201 com `{id, estado}`. Isto implementa BR-01.
- Se o sensor não estiver ligado ou for inválido, o fluxo termina com a mensagem "Falha de ligação ao sensor", a API devolve 502 e nada é guardado (CT-01.2). A alternativa de guardar uma máquina pendente foi afastada, porque criava um estado não previsto neste slice.
- O contacto com os sensores faz-se só pelo módulo de Integração com sensores IoT, sobre MQTT (ADR-005). No 1.º incremento, um simulador publica no broker; o tópico de estado do sensor ainda tem de ser confirmado com os equipamentos.
- O estado devolvido na resposta é calculado e não guardado (ADR-004).

## Risks / Trade-offs

- [A ligação pode falhar transitoriamente] → Interromper o registo conforme CT-01.2 e permitir nova tentativa, sem criar uma máquina monitorizada parcial.
- [O protocolo e o formato das mensagens ainda não estão confirmados] → Isolar tudo no adaptador de Integração com sensores IoT e usar o simulador, para poder mudar sem alterar o domínio.
- [A associação pode confirmar antes de chegarem dados] → Só considerar que o gémeo recebe dados quando chega a primeira leitura, no máximo 1 minuto depois do registo (CT-01.1).