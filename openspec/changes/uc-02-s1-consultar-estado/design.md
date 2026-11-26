## Context

Ver `proposal.md` para a motivação e `specs/estado-maquinas/spec.md` para o contrato observável. Esta change implementa o slice UC-02.S1 sobre a arquitetura definida em `docs/design/E5-Desenho.md`.

- Módulos (E5, Tabela 4): Aplicação Web; API de serviços; Gestão de máquinas e estado; Repositório de dados. As leituras chegam pela Integração com sensores IoT, já implementada na change uc-01-s1-registar-maquina.
- Endpoints: `GET /api/machines` (filtro opcional `?estado=online|alerta|offline`) e `GET /api/machines/{id}`, conforme `docs/api/openapi.yaml`.
- ADR aplicáveis: ADR-001 (stack), ADR-002 (testes), ADR-003 (contrato da API) e ADR-004 (estado calculado na consulta).

## Goals / Non-Goals

**Goals:**
- Apresentar ao gestor o estado atual da máquina (Online, Com alerta ou Offline) e os dados de funcionamento recebidos dos sensores (BR-02, BR-03).
- Nunca mostrar dados antigos como se fossem atuais quando a máquina está offline (RNF-06).
- Respeitar os tempos definidos: dados no ecrã até 30 segundos depois da leitura (RNF-01) e páginas a carregar em até 3 segundos (RNF-02).

**Non-Goals:**
- Criar ou tratar alertas (módulo de Alertas, Épico #3).
- Receber leituras dos sensores, que já está implementado em UC-01.S1.

## Decisions

- O estado não é guardado: calcula-se em cada consulta a partir da hora da última leitura (ADR-004). A alternativa de o guardar e atualizar por tarefa periódica foi afastada, porque podia mostrar um estado desatualizado.
- Uma máquina fica Offline quando passaram mais de 15 minutos desde a última leitura, com prioridade sobre Com alerta (BR-03).
- Enquanto não existir o módulo de Alertas, não há alertas ativos para ler e uma máquina com dados recentes aparece como Online (E5, secção 2.3).
- Em Offline, a API devolve os últimos dados com a hora da última atualização, assinalados como não atuais (RNF-06, CT-02.2).
- A lista de máquinas é paginada e usa o índice da última leitura de cada máquina (E5, secção 2.2).

## Risks / Trade-offs

- [O cálculo do estado em cada consulta pode ficar pesado com muitas máquinas] → Usar um índice na última leitura da máquina e paginar a lista (RNF-02, RNF-10).
- [Os relógios dos sensores podem estar desfasados] → Calcular o estado com a hora de origem guardada em cada leitura e testar o limite dos 15 minutos.