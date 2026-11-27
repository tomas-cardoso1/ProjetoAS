# ADR-002 — Estratégia de teste

**Estado:** aceite

## Contexto
A SRS define casos de teste (CT-01.1 a CT-03.2) com valores e resultado esperado. A aplicação tem de ser testável com Playwright (RT-1).

## Decisão
- Testes unitários (Vitest) das regras BR-02 a BR-05.
- Testes de API (Supertest, base de dados de teste).
- Testes E2E com Playwright por slice, usando os valores dos CT da SRS.
- Seletores `data-testid` estáveis; base de dados reposta (seed) antes de cada execução.
- Tudo corre na pipeline a cada push.

## Alternativas consideradas
Só E2E; só unitários; testes manuais.

## Consequências
Cada CT tem pelo menos um teste automático. A pipeline demora mais e exige seed e seletores estáveis.
