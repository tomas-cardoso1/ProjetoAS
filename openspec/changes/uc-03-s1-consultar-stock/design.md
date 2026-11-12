## Context

Ver `proposal.md` para a motivação e `specs/stock-validades/spec.md` para o contrato solicitado. O repositório não contém implementação nem specs de capabilities existentes. BR-04 define os estados de stock por máquina; RNF-02 define o limite de carregamento da página.

## Goals / Non-Goals

**Goals:**
- Manter quantidades, capacidade, níveis mínimos e lotes associados à máquina e ao produto consultados.
- Calcular dias restantes a partir da validade do lote e da data corrente, destacando lotes expirados ou próximos da validade.
- Cumprir o limite de carregamento de três segundos sem perder o contexto da máquina selecionada.

**Non-Goals:**
- Alterar stock, registar reposições ou gerir compras e fornecedores.
- Definir limiar operacional concreto para "perto do fim da validade", não indicado no contexto.
- Definir tecnologia de UI, armazenamento, cache ou integração IoT.

## Decisions

- Carregar a consulta no âmbito de uma única máquina selecionada, mantendo a origem da seleção (lista ou mapa) como detalhe de navegação e usando os mesmos dados de stock para ambas. A alternativa de duas consultas distintas poderia apresentar resultados divergentes.
- Apresentar para cada produto unidades atuais, capacidade máxima e lotes; para cada lote, validade e dias restantes. Manter o stock mínimo específico da máquina associado ao produto, pois o mesmo produto pode ter limites operacionais diferentes em máquinas diferentes.
- Derivar o estado do produto por quantidade: zero significa Esgotado; acima de zero e abaixo do mínimo significa Stock baixo; quantidade igual ou acima do mínimo não recebe esses destaques. A regra para zero tem prioridade para tornar explícito o caso de esgotamento.
- Ordenar/estruturar os dados para que lotes expirados e próximos da validade recebam destaque visual separado do estado de stock. Usar um limiar configurável de proximidade; assim a decisão de negócio pode ser ajustada sem mudar a estrutura da consulta. O valor inicial do limiar pode ser definido durante a implementação.
- Tratar três segundos como orçamento de carregamento da página com dados de stock para a máquina selecionada. A implementação pode otimizar consulta e renderização, mas deve medir o tempo do carregamento completo em condições representativas; não introduzir paginação que esconda lotes necessários sem uma decisão de produto.

## Risks / Trade-offs

- [Dados de stock ou lotes podem estar desatualizados no sistema IoT] → Apresentar apenas informação recebida para a máquina selecionada e validar a frescura dos dados disponíveis; a política de sincronização pertence à integração.
- [Catálogo ou lotes extensos podem exceder o orçamento de três segundos] → Medir a consulta completa com volumes representativos e otimizar acesso e renderização antes de introduzir paginação que afete a visibilidade de todos os lotes.

## Open Questions

- Qual o valor inicial do limiar configurável para destacar lotes próximos da validade? A escolha do valor não altera a estrutura do fluxo nem o modelo de cálculo por lote.
