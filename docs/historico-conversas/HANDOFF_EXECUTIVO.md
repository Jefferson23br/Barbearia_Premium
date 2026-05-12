# Handoff executivo — Barbearia Premium

**Última revisão:** 2026-05-11

## Estado atual
- API em produção com **Oracle** (`ORACLE_*` em `backend/.env`); camada em `backend/config/databaseV2.js` (`database.js` reexporta).
- Scripts legados PostgreSQL apenas em `database/sql/legacy-postgresql` (referência).
- Frontends e API em produção; foco de estabilidade no admin legado (`/api/v1/*`).
- Domínios (sempre **auctusconsultoria**):
  - App / admin: `https://appbarber.auctusconsultoria.com.br`
  - API: `https://api6.auctusconsultoria.com.br`

## O que já está consolidado
- SQL organizado: Oracle em `database/sql/oracle`; legado em `legacy-postgresql`.
- Scripts base Oracle nativos: `001_init_multifilial.sql`, `002_base_operacao_storage.sql`.
- Rotas revisadas em lotes P0/P1/P2 (menos dialeto PostgreSQL nas queries).
- Mapeamento frontend → endpoints backend documentado no repositório.
- Guias: `docs/deploy/ORACLE_BOOTSTRAP.md`, `docs/deploy/GUIA_ATUALIZACAO_DEPLOY.md`.

## Risco atual
- Possível HTTP **500** em financeiro/dashboard se o schema Oracle não tiver todas as tabelas/colunas esperadas pelas rotas v1.
- Homologação completa **Frontend ↔ Backend ↔ Oracle** depende de runtime com base Oracle completa e dados reais.

## Próximos passos (ordem sugerida)
1. Bootstrap Oracle: `npm run db:oracle:bootstrap` em `backend/` ou scripts em `database/sql/oracle`.
2. Reiniciar API: `pm2 restart api-barbearia-premium --update-env`.
3. Smoke técnico: `GET /health`, `GET /api/test-db`, `GET /api/v1/modulos`, `GET /api/v1/permissoes/:usuarioId`, `GET /api/v1/dashboard`.
4. Smoke por módulo: Agenda, Vendas, Financeiro, Relatórios, NFe, CRM, Assinaturas, Cupons/Fidelidades.

## Referências de retomada
| Documento | Uso |
|-----------|-----|
| `HANDOFF.md` | Estado operacional detalhado, checklist, bloqueios |
| `CHANGELOG.md` | Histórico técnico por release |
| `2026-05-06-refatoracao-inicial.md` | Marco e decisões de origem |
| `../deploy/GUIA_ATUALIZACAO_DEPLOY.md` | Atualizar produção após `git pull` |
