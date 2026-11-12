## Why

O gestor de operações precisa de encontrar rapidamente produtos que exigem reposição ou remoção e de consultar o estado de lotes sem percorrer manualmente todo o inventário. Este slice estende a consulta UC-03.S1 com filtros, pesquisa por nome e apresentação segura do último stock conhecido quando a máquina está offline.

## What Changes

- Estende a consulta de stock existente com filtros para Stock baixo, perto da validade e expirados.
- Permite pesquisar produtos pelo nome.
- Apresenta o último stock conhecido e a hora da última atualização quando a máquina está offline, sem o apresentar como atual.
- Destaca lotes dentro dos parâmetros de alerta de validade (7 dias por defeito) e indica a remoção obrigatória de lotes expirados.

## Capabilities

### New Capabilities
- `stock-validades`: extensão da capability planeada em UC-03.S1 (`uc-03-s1-consultar-stock`) com filtragem, pesquisa e consulta de stock offline.

### Modified Capabilities

## Impact

Afeta a consulta de stock por máquina, os controlos de filtro e pesquisa e a apresentação temporal dos dados IoT. Depende do inventário e da consulta base definidos no slice UC-03.S1.
