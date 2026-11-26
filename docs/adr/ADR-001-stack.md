# ADR-001 — Stack e ferramenta de testes do 1.º incremento

**Estado:** proposto (a confirmar pelo grupo)

## Contexto
O 1.º incremento (UC-01.S1, UC-02.S1, UC-03.S1, UC-03.S2) precisa de uma aplicação web testável com Playwright, com uma API REST que possa servir outros frontends (E5, secção 3).

## Decisão
- Frontend: React + TypeScript (Vite).
- Backend: Node.js + TypeScript (Fastify), API REST.
- Base de dados: PostgreSQL.
- Testes E2E: Playwright.

## Alternativas consideradas
- Next.js full-stack, com chamadas diretas: afastado porque a API deve servir outros frontends e parceiros.
- Java/Spring Boot com páginas no servidor.
- SQLite ou MongoDB.

## Consequências
Uma só linguagem nas duas camadas e Playwright nativo em TypeScript. PostgreSQL trata bem consultas por lote e validade e a escala de 1000 máquinas (RNF-10). Há dois projetos para manter.
