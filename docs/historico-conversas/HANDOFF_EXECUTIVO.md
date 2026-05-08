# Handoff Executivo - Barbearia Premium

## Estado atual
- Projeto em migracao de operacao PostgreSQL para Oracle.
- Frontend e backend em producao com foco de estabilidade no admin legado.
- Dominios ativos:
  - App: `https://appbarber.auctusconsultoria.com.br`
  - API: `https://api6.auctusconsultoria.com.br`

## O que ja esta consolidado
- Estrutura SQL organizada:
  - Oracle: `database/sql/oracle`
  - Legado PostgreSQL: `database/sql/legacy-postgresql`
- Scripts base Oracle convertidos para sintaxe Oracle nativa:
  - `database/sql/oracle/001_init_multifilial.sql`
  - `database/sql/oracle/002_base_operacao_storage.sql`
- Backend com camada de compatibilidade Oracle ativa em `backend/config/databaseV2.js`.
- Rotas do backend revisadas em lotes (P0/P1/P2) para reduzir dependencia de dialeto PostgreSQL.
- Mapeamento completo de chamadas Frontend -> Backend consolidado.

## Risco atual
- Ainda existe risco de erro `500` em modulos financeiros/dashboard se o schema Oracle real nao estiver completo com tabelas/colunas esperadas pelas rotas v1.
- Alinhamento total `Frontend <> Backend <> Oracle` depende de homologacao runtime com base Oracle operacional completa.

## Proximo passo recomendado (ordem)
1. Executar bootstrap Oracle:
   - `npm run db:oracle:bootstrap` (em `backend/`)
   - ou scripts manuais em `database/sql/oracle`
2. Reiniciar API:
   - `pm2 restart api-barbearia-premium --update-env`
3. Rodar smoke tecnico:
   - `GET /health`
   - `GET /api/test-db`
   - `GET /api/v1/modulos`
   - `GET /api/v1/permissoes/:usuarioId`
   - `GET /api/v1/dashboard`
4. Rodar smoke funcional por modulo:
   - Agenda, Vendas, Financeiro, Relatorios, NFe, CRM, Assinaturas, Cupons/Fidelidades

## Referencias de retomada
- Estado detalhado: `docs/historico-conversas/HANDOFF.md`
- Historico tecnico: `docs/historico-conversas/CHANGELOG.md`
- Contexto de origem: `docs/historico-conversas/2026-05-06-refatoracao-inicial.md`
