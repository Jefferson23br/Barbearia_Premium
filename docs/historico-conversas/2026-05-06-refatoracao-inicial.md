# 2026-05-06 - Refatoracao Inicial

## Decisoes iniciais
- Rebranding para Barbearia Premium.
- Nova API alvo: `https://api6.auctusconsultoria.com.br`.
- Novo app alvo: `https://appbarber.auctusconsultoria.com.br`.
- Frontend e backend na mesma VPS.
- Base do produto em modelo multi-filial.

## Acoes executadas na fase inicial
- Criada pasta `docs/historico-conversas`.
- Iniciada substituicao de branding e dominios no frontend.
- Estruturada base tecnica v2 no backend.

## Etapa 1 concluida (base tecnica)
- Criado `backend/package.json`.
- Criado `backend/.env.example`.
- Criado SQL inicial multi-filial: `backend/sql/001_init_multifilial.sql`.
- Criadas rotas v2:
  - `/api/v2/auth`
  - `/api/v2/filiais`
  - `/api/v2/clientes`
- Implementado cadastro publico por slug de filial.
- Implementado escopo por filial via JWT (`filial_id`).

## Complemento de contexto (2026-05-08)
- O projeto avancou para migracao Oracle e operacao do admin legado.
- Permissoes/menu passaram por ajustes para funcionar sem dependencia total do schema antigo.
- Estado corrente detalhado esta em `docs/historico-conversas/HANDOFF.md`.
