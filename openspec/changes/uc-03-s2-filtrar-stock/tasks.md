## 1. Filtros e pesquisa de produtos

- [ ] 1.1 Acrescentar filtros para Stock baixo, Perto da validade e Expirado à listagem definida em UC-03.S1; verificar que cada filtro apresenta apenas os produtos/lotes correspondentes.
- [ ] 1.2 Aplicar os parâmetros de alerta de validade, com valor por defeito de 7 dias; verificar lotes dentro e fora do limite, no dia da validade e com validade já passada.
- [ ] 1.3 Implementar pesquisa pelo nome do produto combinável com os filtros ativos; verificar correspondências por nome e que a pesquisa restringe os resultados filtrados.

## 2. Lotes expirados e máquinas offline

- [ ] 2.1 Destacar lotes expirados a vermelho com etiqueta "Expirado" e aviso de remoção obrigatória; verificar CT-03.2 para um lote expirado há um dia.
- [ ] 2.2 Apresentar o último stock conhecido quando a máquina está Offline, acompanhado da hora da última atualização e de indicação de que os dados não são atuais; verificar o fluxo E1 sem uma nova leitura IoT.
- [ ] 2.3 Verificar os fluxos integrados A1, A2 e E1 e a consulta básica, incluindo filtros, pesquisa, estado offline, parâmetro BR-05 e aviso para remoção de produtos expirados.
