## 1. Consulta do estado

- [x] 1.1 Implementar `GET /api/machines/{id}` (404 se a máquina não existir) e `GET /api/machines` com o filtro opcional `?estado=`, na API de serviços e na Gestão de máquinas e estado, conforme `docs/api/openapi.yaml`.
- [x] 1.2 Calcular o estado na consulta a partir da hora da última leitura (ADR-004): Offline se passaram mais de 15 minutos, com prioridade sobre Com alerta (BR-02, BR-03); sem módulo de Alertas, uma máquina com dados recentes é Online.
- [x] 1.3 Devolver a temperatura, os dados de funcionamento e a hora da última leitura; em Offline, devolver os últimos dados assinalados como não atuais (RNF-06).

## 2. Interface

- [x] 2.1 Mostrar na Aplicação Web o estado, a temperatura, os dados de funcionamento e a hora da última atualização da máquina selecionada, com seletores `data-testid` estáveis (ADR-002).

## 3. Testes (um por scenario)

- [x] 3.1 Teste "CT-02.1 Máquina online": com uma máquina registada e uma leitura recente (seed), consultar o estado; verificar que aparece "Online", a temperatura atual e os dados de funcionamento.
- [x] 3.2 Teste "CT-02.2 Máquina offline": com uma máquina cuja última leitura tem 16 minutos, consultá-la; verificar que aparece "Offline" e a data e hora do último dado recebido, sem esses dados serem mostrados como atuais (BR-03, RNF-06).
- [x] 3.3 Testes unitários (Vitest) da regra de estado: uma leitura de há 14 minutos dá Online e uma de há 16 minutos dá Offline (BR-03).
- [x] 3.4 Correr todos os testes do slice; têm de passar antes do arquivo.
