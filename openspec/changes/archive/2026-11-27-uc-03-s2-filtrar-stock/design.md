## Context

Ver `proposal.md` para a motivação e `specs/stock-validades/spec.md` para o contrato observável. Esta change implementa o slice UC-03.S2, que estende a consulta de stock do slice UC-03.S1 (change uc-03-s1-consultar-stock), por isso deve ser aplicada e arquivada depois dela.

- Módulos (E5, Tabela 4): Aplicação Web; API de serviços; Gestão de stock e validades; Repositório de dados.
- Endpoint: `GET /api/machines/{id}/stock?filtro=&q=`, conforme `docs/api/openapi.yaml`. Não cria endpoints novos: acrescenta parâmetros ao existente.
- ADR aplicáveis: ADR-001 (stack), ADR-002 (testes) e ADR-003 (contrato da API).

## Goals / Non-Goals

**Goals:**
- Destacar os lotes expirados com aviso de remoção obrigatória (BR-05, CT-03.2).
- Permitir filtrar por estado (stock baixo, perto da validade ou expirado) e pesquisar um produto pelo nome.
- Quando a máquina está offline, mostrar o último stock conhecido com a hora da última atualização, sem o apresentar como atual (BR-03, RNF-06).

**Non-Goals:**
- Alterar as regras de estado de UC-03.S1.
- Alertas de validade (módulo de Alertas).

## Decisions

- Reutilizar os dados consultados no Repositório de dados do sistema, conforme ADR-006. Este slice aplica filtros e pesquisa à consulta REST e não altera a ingestão MQTT definida no ADR-005.

- Reutilizar a consulta e a estrutura de produto/lote da S1 e aplicar filtros à lista resultante. Os filtros disponíveis são Stock baixo, Perto da validade e Expirado, para que o gestor possa restringir a listagem sem criar fluxos separados.
- Definir Perto da validade como lote cuja data de validade está dentro do número de dias do parâmetro de alerta, com valor por defeito de 7 dias; definir Expirado quando a data já passou. O limite inclusivo no dia de validade segue o parâmetro de dias restantes; expirados têm prioridade e recebem o aviso de remoção obrigatória. Isto aplica BR-05 de forma previsível.
- Permitir pesquisa textual pelo nome do produto e combinar a pesquisa com os filtros selecionados, usando a pesquisa para restringir o resultado filtrado. A alternativa de ignorar o filtro ao pesquisar impediria localizar um produto dentro do subconjunto operacional relevante.
- Se a máquina estiver Offline, manter a última leitura de stock conhecida visível com a hora da última atualização, identificando-a claramente como dado anterior e sem refrescar ou apresentar como atual. Isto reutiliza a regra BR-03 sem inventar sincronização enquanto a máquina está sem ligação.
- A indicação de remoção é um aviso operacional ao gestor; a retirada física continua a ser uma ação humana, pois o sistema não pode remover produtos da máquina por software.

## Risks / Trade-offs

- [A pesquisa por nome pode ser lenta com muitos produtos] → Pesquisar apenas dentro do stock da máquina consultada.
- [Os filtros e a pesquisa ainda não têm scenarios próprios na spec] → Cobrir as regras com testes unitários e propor novos casos de teste na SRS (por exemplo, para o filtro, a pesquisa e a máquina offline).