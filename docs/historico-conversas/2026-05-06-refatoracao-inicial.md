# 2026-05-06 — Refatoração inicial

## Decisões iniciais
- Rebranding para Barbearia Premium.
- API pública alvo: `https://api6.auctusconsultoria.com.br` (domínio **auctusconsultoria**, não `actus`).
- App público alvo: `https://appbarber.auctusconsultoria.com.br`.
- Modelo multi-filial na base do produto (API v2 + JWT com `filial_id`).
- *Decisão inicial de hospedagem:* frontend e backend na mesma VPS; *em produção* a arquitetura evoluiu para **duas VPS** (API/backend em 82.25.65.201 e frontends em 45.132.157.28) — ver `docs/INFRAESTRUTURA.md`.

## Ações executadas na fase inicial
- Criada pasta `docs/historico-conversas`.
- Iniciada substituição de branding e domínios no frontend.
- Estruturada base técnica v2 no backend.

## Etapa 1 concluída (base técnica)
- Criado `backend/package.json`.
- Criado `backend/.env.example`.
- Criado SQL inicial multi-filial: `database/sql/oracle/001_init_multifilial.sql`.
- Rotas v2:
  - `/api/v2/auth`
  - `/api/v2/filiais`
  - `/api/v2/clientes`
- Cadastro público por slug de filial.
- Escopo por filial via JWT (`filial_id`).

## Complemento de contexto (2026-05-08)
- Projeto avançou para migração Oracle e operação do admin legado.
- Permissões/menu ajustados para funcionar sem dependência total do schema antigo.
- Estado detalhado em `docs/historico-conversas/HANDOFF.md`.
- Migração técnica em lotes no backend (P0/P1/P2) para reduzir dependência de sintaxe PostgreSQL nas rotas.
- Scripts base em `database/sql/oracle` convertidos para Oracle nativo e documentados para bootstrap operacional.

## Atualização (2026-05-11)
- Documentação de infra/deploy alinhada a **Oracle em produção** e URLs **`auctusconsultoria.com.br`** (correção do typo `actus` onde aparecia).
- Novo guia: `docs/deploy/GUIA_ATUALIZACAO_DEPLOY.md`.
- Handoffs e `CHANGELOG` revisados nesta data.
