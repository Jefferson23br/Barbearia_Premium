# Changelog

Todas as mudancas relevantes deste projeto devem ser documentadas aqui.

Formato inspirado em Keep a Changelog:
- `Added` para novas funcionalidades
- `Changed` para mudancas em comportamento existente
- `Deprecated` para funcionalidades em desuso
- `Removed` para funcionalidades removidas
- `Fixed` para correcao de bugs
- `Security` para ajustes de seguranca

## [Unreleased]

### Added
- Base de historico em `docs/historico-conversas`.
- Backend v2 multi-filial:
  - `backend/package.json`
  - `backend/.env.example`
  - `backend/sql/001_init_multifilial.sql`
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
  - scripts SQL/PLSQL de apoio para adicionar colunas de permissao e liberar usuario

### Changed
- `backend/server.js` atualizado para registrar rotas `/api/v2`.
- Frontend atualizado para o branding **Barbearia Premium**.
- Frontend atualizado para novos dominios:
  - API: `https://api6.actusconsultoria.com.br`
  - App: `https://appbarber.auctusconsultoria.com.br`
  - Admin: `https://appbarber.auctusconsultoria.com.br/admin`
- API ajustada para Oracle em pontos criticos de admin:
  - `backend/config/databaseV2.js` com adaptacoes SQL (`protese.` removido em Oracle, `NOW()` -> `CURRENT_TIMESTAMP`, parametros e limit adaptados)
  - `backend/routes/permissoes.js` com leitura/origem Oracle e normalizacao de booleans
  - `backend/routes/modulos.js` com fallback para manter menu funcional sem todas as tabelas migradas
- Frontend admin ajustado em `Sidebar.tsx` para mapear corretamente `item_id` -> chave de permissao

### Fixed
- Padronizacao dos arquivos de historico com encoding consistente para GitHub.
- Falha de exibicao parcial de menus causada por mapeamento incorreto de permissoes no frontend.

### Security
- Isolamento inicial por `filial_id` implementado no fluxo autenticado da API v2.

## [2026-05-06] - Inicio da refatoracao

### Added
- Inicio da base tecnica v2 para migracao gradual do legado.

