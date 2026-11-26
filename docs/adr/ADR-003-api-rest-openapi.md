# ADR-003 — API REST com contrato OpenAPI

**Estado:** proposto (a confirmar pelo grupo)

## Contexto
A Aplicação Web deve ficar separada da lógica do domínio, e a mesma API pode servir outros frontends e parceiros.

## Decisão
API REST em JSON, com contrato em `docs/api/openapi.yaml`. Não há endpoints fora do contrato.

## Alternativas consideradas
GraphQL; RPC; chamadas diretas da interface à lógica.

## Consequências
O contrato serve de base aos testes de API. Tem de ser mantido atualizado a cada change.
