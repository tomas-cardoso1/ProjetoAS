## 1. Filtros, pesquisa e destaque

- [x] 1.1 Estender `GET /api/machines/{id}/stock` com os parâmetros `filtro` (stock-baixo, perto-validade ou expirado) e `q` (pesquisa pelo nome do produto), que se combinam, conforme `docs/api/openapi.yaml`.
- [x] 1.2 Marcar como "Expirado" os lotes cuja validade já passou e devolver o aviso de remoção obrigatória (BR-05).
- [x] 1.3 Com a máquina Offline, devolver o último stock conhecido e a hora da última atualização, assinalados como não atuais (BR-03, RNF-06).

## 2. Interface

- [x] 2.1 Acrescentar na Aplicação Web os controlos de filtro e o campo de pesquisa, e mostrar os lotes expirados a vermelho com a etiqueta "Expirado" e o aviso de remoção obrigatória, usando seletores `data-testid` estáveis.

## 3. Testes (um por scenario)

- [x] 3.1 Teste "CT-03.2 Lote expirado": com um lote cuja validade expirou há 1 dia (seed), consultar a listagem de stock por lote; verificar que o lote aparece a vermelho com a etiqueta "Expirado" e o aviso de remoção obrigatória (BR-05).
- [x] 3.2 Testes unitários (Vitest) do filtro e da pesquisa: filtrar por "expirado" devolve só os lotes expirados e pesquisar "Leite" devolve só produtos com esse nome.
- [x] 3.3 Correr todos os testes do slice; têm de passar antes do arquivo.
