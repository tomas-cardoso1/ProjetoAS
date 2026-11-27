## Purpose

Extende a consulta de stock por lote definida em UC-03.S1 com filtros, pesquisa e tratamento explícito de dados de máquinas offline.

## ADDED Requirements

### Requirement: UC-03 Filtrar stock e destacar lotes expirados
O sistema SHALL destacar os lotes expirados na listagem de stock por lote, com aviso de remoção obrigatória (BR-05).

#### Scenario: CT-03.2 Lote expirado
- WHEN o gestor consulta a listagem de stock por lote de uma máquina com um lote cuja validade expirou há 1 dia
- THEN o lote aparece destacado a vermelho com a etiqueta "Expirado" e um aviso de remoção obrigatória
