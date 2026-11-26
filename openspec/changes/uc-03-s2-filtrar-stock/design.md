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

- O filtro e a pesquisa fazem-se no servidor, através dos parâmetros `filtro` e `q` do mesmo endpoint, e combinam-se. A alternativa de filtrar só na interface foi afastada, porque os outros frontends e parceiros teriam de repetir a lógica.
- Um lote é "Expirado" quando a data de validade já passou (BR-05); na interface aparece a vermelho com a etiqueta "Expirado" e o aviso de remoção obrigatória.
- Com a máquina Offline (mais de 15 minutos sem leituras, ADR-004), a API devolve o último stock conhecido e a hora da última atualização, assinalados como não atuais.

## Risks / Trade-offs

- [A pesquisa por nome pode ser lenta com muitos produtos] → Pesquisar apenas dentro do stock da máquina consultada.
- [Os filtros e a pesquisa ainda não têm scenarios próprios na spec] → Cobrir as regras com testes unitários e propor novos casos de teste na SRS (por exemplo, para o filtro, a pesquisa e a máquina offline).