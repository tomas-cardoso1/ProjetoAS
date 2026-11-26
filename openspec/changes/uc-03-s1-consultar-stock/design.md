## Context

Ver `proposal.md` para a motivação e `specs/stock-validades/spec.md` para o contrato observável. Esta change implementa o slice UC-03.S1 sobre a arquitetura definida em `docs/design/E5-Desenho.md`.

- Módulos (E5, Tabela 4): Aplicação Web; API de serviços; Gestão de stock e validades; Repositório de dados. As leituras de stock e lotes chegam pela Integração com sensores IoT, já implementada em UC-01.S1.
- Endpoint: `GET /api/machines/{id}/stock`, conforme `docs/api/openapi.yaml`.
- ADR aplicáveis: ADR-001 (stack), ADR-002 (testes) e ADR-003 (contrato da API).

## Goals / Non-Goals

**Goals:**
- Apresentar ao gestor o stock da máquina por produto (unidades, capacidade máxima e estado) e a validade de cada lote, com os dias que faltam.
- Aplicar os estados de stock (BR-04) e de validade (BR-05) na listagem.
- Carregar a página em até 3 segundos (RNF-02).

**Non-Goals:**
- Filtros, pesquisa e consulta de máquinas offline, que ficam no slice UC-03.S2.
- Gerar alertas de stock ou de validade (módulo de Alertas).

## Decisions

- O stock devolve-se por produto, cada um com os seus lotes (validade e dias restantes). Os dias restantes calculam-se na consulta a partir da data de validade, para nunca ficarem desatualizados.
- Um produto está em "Stock baixo" quando as unidades ficam abaixo do mínimo definido para ele e "Esgotado" quando chegam a zero (BR-04).
- Um lote está "Perto da validade" quando faltam 7 dias ou menos, que é o valor por defeito da BR-05. Isto resolve a questão em aberto do limiar.
- A lógica de estados fica na Gestão de stock e validades e não na interface, para poder ser testada com testes unitários (ADR-002).

## Risks / Trade-offs

- [Os sensores podem não fornecer os lotes e as validades] → O formato das leituras ainda está por confirmar (E5, secção 2.4); usar o simulador e manter a leitura dos lotes isolada na integração.
- [A lista de produtos e lotes pode ser grande] → Devolver só o necessário e usar índices por máquina para manter o carregamento em 3 segundos (RNF-02).