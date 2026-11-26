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

- Consultar produtos, stock e lotes no Repositório de dados do sistema (ADR-006). A integração com sensores que atualiza esses dados passa pelo broker MQTT e pelo módulo de Integração com sensores IoT (ADR-005); este slice apenas expõe a consulta por REST.

- Carregar a consulta no âmbito de uma única máquina selecionada, mantendo a origem da seleção (lista ou mapa) como detalhe de navegação e usando os mesmos dados de stock para ambas. A alternativa de duas consultas distintas poderia apresentar resultados divergentes.
- Apresentar para cada produto unidades atuais, capacidade máxima e lotes; para cada lote, validade e dias restantes. Manter o stock mínimo específico da máquina associado ao produto, pois o mesmo produto pode ter limites operacionais diferentes em máquinas diferentes.
- Derivar o estado do produto por quantidade: zero significa Esgotado; acima de zero e abaixo do mínimo significa Stock baixo; quantidade igual ou acima do mínimo não recebe esses destaques. A regra para zero tem prioridade para tornar explícito o caso de esgotamento.
- Ordenar/estruturar os dados para que lotes expirados e próximos da validade recebam destaque visual separado do estado de stock. Usar um limiar configurável de proximidade; assim a decisão de negócio pode ser ajustada sem mudar a estrutura da consulta. O valor inicial do limiar pode ser definido durante a implementação.
- Tratar três segundos como orçamento de carregamento da página com dados de stock para a máquina selecionada. A implementação pode otimizar consulta e renderização, mas deve medir o tempo do carregamento completo em condições representativas; não introduzir paginação que esconda lotes necessários sem uma decisão de produto.

## Risks / Trade-offs

- [Os sensores podem não fornecer os lotes e as validades] → O formato das leituras ainda está por confirmar (E5, secção 2.4); usar o simulador e manter a leitura dos lotes isolada na integração.
- [A lista de produtos e lotes pode ser grande] → Devolver só o necessário e usar índices por máquina para manter o carregamento em 3 segundos (RNF-02).