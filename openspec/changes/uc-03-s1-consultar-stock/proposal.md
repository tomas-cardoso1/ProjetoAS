## Why

O gestor de operações precisa de consultar remotamente a disponibilidade dos produtos e antecipar ruturas ou perdas por validade. Este slice do UC-03 reúne quantidades, capacidade e informação de lotes numa consulta que deve carregar em até três segundos.

## What Changes

- Permite selecionar uma máquina a partir da lista ou do mapa e consultar o respetivo stock.
- Apresenta por produto as unidades atuais, a capacidade máxima e os lotes presentes.
- Apresenta por lote a validade e os dias restantes, destacando lotes próximos do fim da validade ou expirados.
- Destaca produtos abaixo do stock mínimo e identifica os estados Stock baixo e Esgotado conforme BR-04.
- Define o limite de carregamento da página de três segundos (RNF-02).

## Capabilities

### New Capabilities
- `stock-validades`: consulta do stock por produto e dos prazos de validade por lote.

### Modified Capabilities

## Impact

Abrange a vista de stock e validades por máquina e os dados de inventário fornecidos pelo sistema IoT. Não define os critérios concretos de proximidade da validade, ainda não especificados para este slice.
