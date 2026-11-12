## 1. Consulta por máquina e produto

- [ ] 1.1 Implementar a consulta de stock para a máquina selecionada a partir da lista ou do mapa; verificar que ambas as origens apresentam os mesmos dados para a mesma máquina.
- [ ] 1.2 Apresentar por produto quantidade atual, capacidade máxima e lotes; verificar a consulta CT-03.1 com 10 unidades de "Leite com Chocolate" e lotes válidos.
- [ ] 1.3 Associar e aplicar o stock mínimo definido para o produto nessa máquina; verificar que zero apresenta Esgotado, abaixo do mínimo apresenta Stock baixo e quantidade igual ao mínimo não é destacada como baixa.

## 2. Validades e desempenho

- [ ] 2.1 Apresentar validade e dias restantes por lote e destacar lotes expirados ou dentro do limiar configurado de proximidade; verificar os casos antes, no limite e após o limiar aprovado.
- [ ] 2.2 Cumprir RNF-02 no carregamento da página de stock; verificar que a página com dados representativos da máquina selecionada carrega em até 3 segundos.
- [ ] 2.3 Verificar o fluxo integrado de consulta, quantidades, capacidade, lotes e destaques, confirmando a cobertura do CT-03.1 e da regra BR-04.
