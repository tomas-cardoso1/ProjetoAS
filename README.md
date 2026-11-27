# Projeto de AS — God's Eye

**Versão:** Ultima atualização : 27/11/2026

## Elementos do grupo

- Luís Oliveira [125016]
- Tomás Cardoso [125050]
- Margarida Teixeira [126011]
- Jéssica Zheng [126541]

## Descrição

Projeto desenvolvido no âmbito da unidade curricular de Análise de Sistemas (AS).

## Agente e ferramentas de AI

| | |
|---|---|
| **Agente** | Codex |
| **Modelo** | gpt-6-luna |
| **Versão do OpenSpec** | 1.17.0 |

As skills do OpenSpec usadas pelo agente estão em `.agents/skills`; as changes arquivadas estão em `openspec/changes/archive/` e as specs resultantes em `openspec/specs/`.

## Como correr o 1.º incremento

1. Base de dados e broker MQTT: `docker compose up -d`
2. Backend (pasta `backend`): `npm install`, `npm run db:reset` e `npm run dev`
3. Frontend (pasta `frontend`): `npm install` e `npm run dev`
4. Testes:
   - unitários e de API (pasta `backend`): `npm test`
   - E2E com Playwright (pasta `frontend`): `npm run test:e2e`
