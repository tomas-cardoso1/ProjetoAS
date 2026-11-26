## 1. Registo, ligação e associação do sensor

- [ ] 1.1 Implementar `POST /api/machines` na API de serviços e na Gestão de máquinas e estado, conforme `docs/api/openapi.yaml`, recebendo identificador do sensor, localização, modelo e cliente.
- [ ] 1.2 Implementar na Integração com sensores IoT a verificação da ligação e a associação do sensor pelo broker MQTT (simulador no 1.º incremento); o registo só se conclui depois da associação (BR-01).
- [ ] 1.3 Guardar a máquina e criar o gémeo digital no Repositório de dados apenas após a associação confirmada e devolver 201 com `{id, estado}`.
- [ ] 1.4 Quando não há ligação ou o sensor é inválido, devolver 502 com "Falha de ligação ao sensor" e não guardar nada.
- [ ] 1.5 Guardar no Repositório de dados cada leitura recebida (temperatura, estado operacional, produtos e lotes) com a hora de origem, para serem usadas pelos slices seguintes (ADR-004).
## 2. Interface

- [ ] 2.1 Criar na Aplicação Web o formulário de registo (sensor, localização, modelo e cliente) com seletores `data-testid` estáveis, que mostra o resultado ou a mensagem de erro.

## 3. Testes (um por scenario)

- [ ] 3.1 Teste "CT-01.1 Registo com sucesso": registar uma máquina com ligação e sensor instalado, indicando sensor, localização, modelo e cliente; verificar que a máquina fica guardada, o gémeo digital é criado e os primeiros dados chegam no máximo 1 minuto depois (com o simulador).
- [ ] 3.2 Teste "CT-01.2 Máquina sem ligação": tentar registar uma máquina sem ligação; verificar a mensagem "Falha de ligação ao sensor", o código 502 e que nenhuma máquina fica registada nem monitorizada (BR-01).
- [ ] 3.3 Correr todos os testes do slice; têm de passar antes do arquivo.