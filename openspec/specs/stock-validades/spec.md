# stock-validades Specification

## Purpose
Define a consulta do stock de produtos de uma máquina e a visualização das datas de validade por lote, para apoiar decisões operacionais.

## Requirements

### Requirement: UC-03 Consultar stock e validades por lote
O sistema SHALL apresentar ao gestor de operações o stock de uma máquina por produto e a validade de cada lote (BR-04).

#### Scenario: CT-03.1 Consulta do stock e validades
- WHEN o gestor consulta o stock e validades de uma máquina com 10 unidades de "Leite com Chocolate" registadas e lotes válidos
- THEN o sistema apresenta a lista de produtos, as quantidades, a capacidade máxima e os dias restantes para o fim da validade de cada lote

### Requirement: UC-03 Filtrar stock e destacar lotes expirados
O sistema SHALL destacar os lotes expirados na listagem de stock por lote, com aviso de remoção obrigatória (BR-05).

#### Scenario: CT-03.2 Lote expirado
- WHEN o gestor consulta a listagem de stock por lote de uma máquina com um lote cuja validade expirou há 1 dia
- THEN o lote aparece destacado a vermelho com a etiqueta "Expirado" e um aviso de remoção obrigatória
