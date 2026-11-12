## Context

Ver `proposal.md` para a motivação e `specs/estado-maquinas/spec.md` para o contrato fornecido. O repositório não contém ainda implementação nem outras specs de capabilities; o contexto define os limites temporais e a regra de classificação a cumprir.

## Goals / Non-Goals

**Goals:**
- Derivar o estado visível dos dados recebidos e do estado de alertas, com prioridade para Offline quando excedido o limite de ausência de transmissão.
- Manter a indicação temporal associada aos dados apresentados para que leituras antigas não pareçam atuais.
- Propagar leituras para o ecrã dentro do limite máximo de 30 segundos.

**Non-Goals:**
- Definir protocolo IoT, algoritmo de deteção de alertas, fornecedor de mapas ou desenho visual detalhado.
- Alterar a origem ou frequência de leitura configurada nos sensores.

## Decisions

- Calcular o estado a partir de dois sinais: idade da última leitura e existência de alertas ativos. Se não houver transmissão há mais de 15 minutos, mostrar Offline; caso contrário, mostrar Com alerta quando existir pelo menos um alerta ativo; nos restantes casos, Online. Esta ordem respeita a definição de Offline como ausência de ligação. A alternativa de deixar o alerta sobrepor-se a Offline esconderia a falta de comunicação.
- Transportar a hora da última leitura junto com cada conjunto de dados e apresentá-la como referência temporal. Leituras sem atualização recente permanecem identificadas como últimas recebidas, nunca como atuais. A alternativa de mostrar apenas valores sem timestamp viola RNF-06.
- Atualizar o ecrã à medida que as leituras chegam, com propagação máxima de 30 segundos entre leitura do sensor e apresentação. A alternativa de atualizar apenas ao recarregar a página não garante RNF-01.
- Para estado Offline, manter visíveis os últimos dados recebidos juntamente com a hora da última atualização, em vez de substituir os valores por zeros ou ocultá-los; isso preserva contexto sem sugerir atualidade.

## Risks / Trade-offs

- [Atrasos ou interrupções de rede podem atrasar a leitura] → Exibir sempre timestamp de origem e estado Offline após mais de 15 minutos sem dados; sinalizar dados retidos como última leitura.
- [Relógios ou timestamps inconsistentes podem alterar a classificação temporal] → Usar uma referência temporal consistente para calcular a idade da leitura e manter a marca de tempo original visível.
