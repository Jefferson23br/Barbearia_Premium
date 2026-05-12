# Changelog

Todas as mudanças relevantes deste projeto devem ser documentadas aqui.

Formato inspirado em Keep a Changelog:
- `Added` para novas funcionalidades
- `Changed` para mudanças em comportamento existente
- `Deprecated` para funcionalidades em desuso
- `Removed` para funcionalidades removidas
- `Fixed` para correção de bugs
- `Security` para ajustes de segurança

## [Unreleased]

### Added
- (reservado para próximas entradas)

## [2026-05-11] - Documentação e handoff

### Added
- `docs/deploy/GUIA_ATUALIZACAO_DEPLOY.md` — guia de atualização de produção (git pull, Oracle, PM2, smoke).
- Referências cruzadas nos handoffs para o guia de deploy e `ORACLE_BOOTSTRAP.md`.

### Changed
- Documentação de infra (`docs/INFRAESTRUTURA.md`, `docs/deploy/*`, READMEs) alinhada a **Oracle** em produção e fallback PostgreSQL apenas em `databaseV2.js` sem `ORACLE_*`.
- URLs unificadas para **`api6.auctusconsultoria.com.br`** e **`appbarber.auctusconsultoria.com.br`** (correção de `actusconsultoria` onde era typo).
- `HANDOFF.md` e `HANDOFF_EXECUTIVO.md` atualizados com data e referências atuais.
- `docs/historico-conversas/README.md` — índice e regras de atualização revisados.

### Fixed
- Inconsistências entre documentos que ainda descreviam apenas PostgreSQL ou domínio incorreto da API.

---

## [2026-05-06 a 2026-05-08] - Base técnica, Oracle e lotes backend

### Added
- Base de histórico em `docs/historico-conversas`.
- Backend v2 multi-filial:
  - `backend/package.json`
  - `backend/.env.example`
  - `database/sql/oracle/001_init_multifilial.sql`
  - `backend/config/databaseV2.js`
  - `backend/middlewares/authV2.js`
  - `backend/middlewares/filialScope.js`
  - `backend/routes/v2/index.js`
  - `backend/routes/v2/auth.js`
  - `backend/routes/v2/filiais.js`
  - `backend/routes/v2/clientes.js`
- Endpoints v2:
  - `POST /api/v2/auth/login`
  - `GET /api/v2/filiais/publicas`
  - `GET /api/v2/filiais/slug/:slug`
  - `POST /api/v2/clientes/publico/cadastro/:slugFilial`
  - `GET /api/v2/clientes`
- Base operacional Oracle para admin:
  - tabela `PERMISSOES_USUARIOS` criada manualmente no schema `BARBEARIA_PREMIUM`
  - scripts SQL/PLSQL de apoio para adicionar colunas de permissão e liberar usuário

### Changed
- `backend/server.js` atualizado para registrar rotas `/api/v2`.
- Reorganização de scripts SQL:
  - scripts Oracle centralizados em `database/sql/oracle`
  - scripts legados PostgreSQL centralizados em `database/sql/legacy-postgresql`
- Migração SQL PostgreSQL → Oracle em lotes:
  - Lote 1: fortalecer `backend/config/databaseV2.js` para ampliar adaptação de dialeto
  - Lote 2 (P0): corrigir rotas `dashboard`, `logs`, `vendas`, `agendamentos`, `emissao-nfe`, `relatorios`
  - Lote 3 (P1/P2): fechar ajustes restantes e checklist de validação por endpoint
- Lote 2 concluído:
  - padronização Oracle nas rotas P0 com remoção de schema legado, casts PostgreSQL e ajustes de funções/data
- Lote 3 concluído:
  - padronização Oracle aplicada no restante de `backend/routes`, `backend/utils` e `backend/services`
  - remoção de `ON CONFLICT` residual com fallback de upsert por `UPDATE` + `INSERT`
  - fechamento de incompatibilidades SQL legadas no backend (mantida adaptação central em `databaseV2.js`)
- Correção crítica de alinhamento Oracle:
  - `database/sql/oracle/001_init_multifilial.sql` reescrito para Oracle nativo (`VARCHAR2(36)` UUID texto, `SYS_GUID()`, `NUMBER(1)`, `MERGE`)
  - `database/sql/oracle/002_base_operacao_storage.sql` reescrito para Oracle nativo
  - ajuste de função mensal em `backend/routes/balanco-demonstrativo.js` para `TRUNC(data, 'MM')`
- Validação de alinhamento Frontend <> Backend:
  - mapeamento completo das chamadas HTTP do frontend para rotas `/api/v1/*`
  - inventário de endpoints por módulo do menu admin legado
- Validação técnica de backend:
  - `node --check` em todos os arquivos `.js` do backend
  - carregamento de todas as rotas via `require(...)` após `npm install`
  - varredura de padrões SQL legados removidos das rotas (`protese.`, `ILIKE`, `::`, `DATE_TRUNC`, `ON CONFLICT`)
- Frontend atualizado para o branding **Barbearia Premium**.
- Frontend atualizado para domínios:
  - API: `https://api6.auctusconsultoria.com.br`
  - App: `https://appbarber.auctusconsultoria.com.br`
  - Admin: `https://appbarber.auctusconsultoria.com.br/admin`
- API ajustada para Oracle em pontos críticos de admin:
  - `backend/config/databaseV2.js` com adaptações SQL (`protese.` removido em Oracle, `NOW()` → `CURRENT_TIMESTAMP`, parâmetros e limit adaptados)
  - `backend/routes/permissoes.js` com leitura/origem Oracle e normalização de booleans
  - `backend/routes/modulos.js` com fallback para manter menu funcional sem todas as tabelas migradas
- Frontend admin ajustado em `Sidebar.tsx` para mapear corretamente `item_id` → chave de permissão

### Fixed
- Padronização dos arquivos de histórico com encoding consistente para GitHub.
- Falha de exibição parcial de menus causada por mapeamento incorreto de permissões no frontend.
- Correção de regressão introduzida em lote de refatoração (`new TRUNC(...)`) revertida para `new Date(...)` em rotas/serviços.

### Security
- Isolamento inicial por `filial_id` implementado no fluxo autenticado da API v2.

## [2026-05-06] - Início da refatoração

### Added
- Início da base técnica v2 para migração gradual do legado.
