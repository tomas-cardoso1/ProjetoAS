## Context

Ver `proposal.md` para a motivação e `specs/estado-maquinas/spec.md` para o contrato observável. Esta change implementa o slice UC-02.S1 sobre a arquitetura definida em `docs/design/E5-Desenho.md`.

- Módulos (E5, Tabela 4): Aplicação Web; API de serviços; Gestão de máquinas e estado; Repositório de dados. As leituras chegam pela Integração com sensores IoT, já implementada na change uc-01-s1-registar-maquina.
- Endpoints: `GET /api/machines` (filtro opcional `?estado=online|alerta|offline`) e `GET /api/machines/{id}`, conforme `docs/api/openapi.yaml`.
- ADR aplicáveis: ADR-001 (stack), ADR-002 (testes), ADR-003 (contrato da API) e ADR-004 (estado calculado na consulta).

## Goals / Non-Goals

**Goals:**
- Apresentar ao gestor o estado atual da máquina (Online, Com alerta ou Offline) e os dados de funcionamento recebidos dos sensores (BR-02, BR-03).
- Nunca mostrar dados antigos como se fossem atuais quando a máquina está offline (RNF-06).
- Respeitar os tempos definidos: dados no ecrã até 30 segundos depois da leitura (RNF-01) e páginas a carregar em até 3 segundos (RNF-02).

**Non-Goals:**
- Redefinir o protocolo IoT estabelecido pelo ADR-005, o algoritmo de deteção de alertas, o fornecedor de mapas ou o desenho visual detalhado.
- Alterar a origem ou frequência de leitura configurada nos sensores.

## Decisions

- Calcular o estado a partir de dois sinais: idade da última leitura e existência de alertas ativos. Se não houver transmissão há mais de 15 minutos, mostrar Offline; caso contrário, mostrar Com alerta quando existir pelo menos um alerta ativo; nos restantes casos, Online. Esta ordem respeita a definição de Offline como ausência de ligação. A alternativa de deixar o alerta sobrepor-se a Offline esconderia a falta de comunicação.
- Transportar a hora da última leitura junto com cada conjunto de dados e apresentá-la como referência temporal. Leituras sem atualização recente permanecem identificadas como últimas recebidas, nunca como atuais. A alternativa de mostrar apenas valores sem timestamp viola RNF-06.
- Atualizar o ecrã à medida que as leituras chegam, com propagação máxima de 30 segundos entre leitura do sensor e apresentação. A alternativa de atualizar apenas ao recarregar a página não garante RNF-01.
- Para estado Offline, manter visíveis os últimos dados recebidos juntamente com a hora da última atualização, em vez de substituir os valores por zeros ou ocultá-los; isso preserva contexto sem sugerir atualidade.
- Obter a última leitura e a associação do sensor no Repositório de dados do sistema, conforme ADR-006. A leitura é recebida pelo módulo IoT via broker MQTT (ADR-005); a consulta de estado continua pela API REST.

## Risks / Trade-offs

- [O cálculo do estado em cada consulta pode ficar pesado com muitas máquinas] → Usar um índice na última leitura da máquina e paginar a lista (RNF-02, RNF-10).
- [Os relógios dos sensores podem estar desfasados] → Calcular o estado com a hora de origem guardada em cada leitura e testar o limite dos 15 minutos.