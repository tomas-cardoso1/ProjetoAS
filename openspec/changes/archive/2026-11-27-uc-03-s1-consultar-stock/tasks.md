## 1. Consulta do stock

- [x] 1.1 Implementar `GET /api/machines/{id}/stock` (404 se a máquina não existir) na API de serviços e na Gestão de stock e validades, devolvendo por produto as unidades, a capacidade, o mínimo, o estado e os lotes (validade e dias restantes), conforme `docs/api/openapi.yaml`.
- [x] 1.2 Aplicar os estados "Stock baixo" e "Esgotado" (BR-04) e "Perto da validade" com 7 dias por defeito (BR-05).
- [x] 1.3 Calcular os dias restantes de cada lote na consulta, a partir da data de validade.

## 2. Interface

- [x] 2.1 Mostrar na Aplicação Web a listagem por produto e lote, com quantidade, capacidade máxima e dias restantes, e com os estados destacados, usando seletores `data-testid` estáveis; a página carrega em até 3 segundos (RNF-02).

## 3. Testes (um por scenario)

- [x] 3.1 Teste "CT-03.1 Consulta do stock e validades": com uma máquina com 10 unidades de "Leite com Chocolate" e lotes válidos (seed), consultar o stock; verificar a lista de produtos, as quantidades, a capacidade máxima e os dias restantes de cada lote.
- [x] 3.2 Testes unitários (Vitest) das regras BR-04 e BR-05: unidades abaixo do mínimo dão "Stock baixo", zero dá "Esgotado" e uma validade a 7 dias dá "Perto da validade".
- [x] 3.3 Correr todos os testes do slice; têm de passar antes do arquivo.
