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

### Changed
- `backend/server.js` atualizado para registrar rotas `/api/v2`.
- Frontend atualizado para o branding **Barbearia Premium**.
- Frontend atualizado para novos dominios:
  - API: `https://api6.actusconsultoria.com.br`
  - App: `https://appbarber.auctusconsultoria.com.br`
  - Admin: `https://appbarber.auctusconsultoria.com.br/admin`

### Fixed
- Padronizacao dos arquivos de historico com encoding consistente para GitHub.

### Security
- Isolamento inicial por `filial_id` implementado no fluxo autenticado da API v2.

## [2026-05-06] - Inicio da refatoracao

### Added
- Inicio da base tecnica v2 para migracao gradual do legado.

