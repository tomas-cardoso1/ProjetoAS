## 1. Estado e dados apresentados

- [ ] 1.1 Implementar a apresentação da temperatura e dos dados operacionais recebidos para uma máquina selecionada; verificar o cenário CT-02.1 com leituras recentes.
- [ ] 1.2 Implementar a classificação Online, Com alerta ou Offline a partir da última transmissão e dos alertas ativos; verificar que mais de 15 minutos sem dados resulta em Offline e que um alerta ativo com transmissão recente resulta em Com alerta.
- [ ] 1.3 Apresentar a última leitura e a respetiva data/hora quando a máquina está Offline; verificar que os valores mantidos são identificados como últimos dados recebidos e não como atuais.

## 2. Atualização e consistência temporal

- [ ] 2.1 Propagar leituras dos sensores para o ecrã em até 30 segundos; verificar o intervalo entre timestamp da leitura e apresentação.
- [ ] 2.2 Associar timestamp a cada conjunto apresentado e impedir que dados antigos sejam rotulados como atuais; verificar a indicação temporal após a máquina deixar de transmitir.
- [ ] 2.3 Verificar o fluxo integrado para máquina Online e Offline, incluindo seleção no mapa, temperatura, dados de funcionamento e cumprimento de BR-02, BR-03, RNF-01 e RNF-06.
