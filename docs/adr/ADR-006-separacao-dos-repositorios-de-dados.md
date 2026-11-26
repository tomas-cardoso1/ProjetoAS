# ADR-006 — Separação dos repositórios de dados

**Estado:** proposto (a confirmar pelo grupo)

## Contexto
O sistema gere conjuntos de dados com responsabilidades diferentes: dados dos clientes associados às máquinas, dados operacionais do sistema (máquinas, associações a sensores, leituras, produtos, stock e lotes) e, num incremento futuro, dados necessários à integração com parceiros. A vista lógica da arquitetura deve tornar explícita a responsabilidade de cada conjunto e indicar que módulos o utilizam.

## Decisão
Separar os dados em três repositórios lógicos:

- **Repositório de dados dos clientes:** dados dos clientes necessários para validar o cliente associado a uma máquina.
- **Repositório de dados do sistema:** máquinas, associações entre máquinas e sensores, leituras IoT, produtos, stock e lotes.
- **Repositório de dados dos parceiros:** dados necessários à futura integração com parceiros.

No 1.º incremento são utilizados os repositórios de dados dos clientes e do sistema. O repositório de dados dos parceiros fica previsto para o incremento em que a integração com parceiros for desenvolvida. Esta decisão define a separação lógica das responsabilidades; a tecnologia, a localização física e a eventual utilização de instâncias distintas ainda têm de ser confirmadas.

## Alternativas consideradas
- Guardar todos os dados num único repositório, sem separação explícita por responsabilidade.
- Separar os dados em repositórios lógicos por responsabilidade, mantendo em aberto a sua concretização física.

## Consequências
A separação clarifica a responsabilidade sobre os dados e ajuda a limitar cada módulo ao conjunto de que necessita. A vista da arquitetura e o mapeamento dos slices têm de indicar os repositórios usados por cada módulo. A configuração, as ligações e a manutenção podem tornar-se mais complexas; se forem adotadas bases de dados ou instâncias físicas distintas, haverá também custos operacionais adicionais. A decisão não implica, por si só, que sejam usadas tecnologias ou servidores diferentes.
