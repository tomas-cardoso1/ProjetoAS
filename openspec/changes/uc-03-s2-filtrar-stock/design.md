## Context

Ver `proposal.md` para a motivação. Esta change estende UC-03.S1 (`uc-03-s1-consultar-stock`) e reutiliza a mesma capability `stock-validades` e a consulta de inventário por máquina. Os fluxos adicionais são filtros, pesquisa por nome e apresentação do último stock conhecido quando offline.

## Goals / Non-Goals

**Goals:**
- Acrescentar filtros sem alterar a informação base por produto e lote definida no S1.
- Tornar a pesquisa por nome de produto compatível com os filtros.
- Preservar contexto e timestamp do último stock recebido quando a máquina está offline.
- Comunicar a remoção obrigatória de produtos expirados conforme BR-05.

**Non-Goals:**
- Fazer a remoção física automática dos produtos da máquina ou registar a execução dessa operação.
- Alterar os parâmetros de stock mínimo e capacidade definidos para a consulta base.
- Definir uma nova origem de dados IoT ou sincronizar o inventário durante a consulta offline.

## Decisions

- Reutilizar a consulta e a estrutura de produto/lote da S1 e aplicar filtros à lista resultante. Os filtros disponíveis são Stock baixo, Perto da validade e Expirado, para que o gestor possa restringir a listagem sem criar fluxos separados.
- Definir Perto da validade como lote cuja data de validade está dentro do número de dias do parâmetro de alerta, com valor por defeito de 7 dias; definir Expirado quando a data já passou. O limite inclusivo no dia de validade segue o parâmetro de dias restantes; expirados têm prioridade e recebem o aviso de remoção obrigatória. Isto aplica BR-05 de forma previsível.
- Permitir pesquisa textual pelo nome do produto e combinar a pesquisa com os filtros selecionados, usando a pesquisa para restringir o resultado filtrado. A alternativa de ignorar o filtro ao pesquisar impediria localizar um produto dentro do subconjunto operacional relevante.
- Se a máquina estiver Offline, manter a última leitura de stock conhecida visível com a hora da última atualização, identificando-a claramente como dado anterior e sem refrescar ou apresentar como atual. Isto reutiliza a regra BR-03 sem inventar sincronização enquanto a máquina está sem ligação.
- A indicação de remoção é um aviso operacional ao gestor; a retirada física continua a ser uma ação humana, pois o sistema não pode remover produtos da máquina por software.

## Risks / Trade-offs

- [Dados offline podem ficar progressivamente desatualizados] → Mostrar timestamp da última atualização junto à lista e distingui-la visualmente de dados atuais.
- [Filtros por validade dependem de datas e parâmetros corretos] → Aplicar o parâmetro configurado com defeito de 7 dias e testar limites de data, validade expirada e valor exato do parâmetro.
- [Avisos de remoção podem não ser executados] → Tornar a remoção obrigatória explícita no resultado expirado e conservar o aviso enquanto o lote continuar listado.
