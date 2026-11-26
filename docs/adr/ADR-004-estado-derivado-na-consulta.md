# ADR-004 — Estado da máquina calculado na consulta

**Estado:** proposto (a confirmar pelo grupo)

## Contexto
BR-02 e BR-03: uma máquina é Online, Com alerta ou Offline; passa a Offline após mais de 15 minutos sem enviar dados. RNF-06: em Offline mostrar a hora da última atualização.

## Decisão
O estado não é guardado. Calcula-se a cada consulta a partir da hora da última leitura e dos alertas ativos, com prioridade para Offline. Cada leitura guarda a hora de origem.

## Alternativas consideradas
Guardar o estado e atualizá-lo por tarefa periódica.

## Consequências
Nunca se mostra um estado desatualizado. Cada consulta faz um pequeno cálculo, atenuado por um índice na última leitura da máquina.
