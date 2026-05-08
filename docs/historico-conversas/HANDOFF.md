# Handoff - Barbearia Premium

## Status atual
- Fase: migracao operacional PostgreSQL -> Oracle com backend legado estabilizado por camadas.
- Ambientes:
  - App: `https://appbarber.auctusconsultoria.com.br`
  - API: `https://api6.auctusconsultoria.com.br`
- Ultima atualizacao: `2026-05-08`
- Responsavel: `Cursor Agent`

## O que foi consolidado
- Backend com camada Oracle ativa em `backend/config/databaseV2.js`.
- `backend/config/database.js` reexporta `databaseV2` (ponto unico de acesso ao BD).
- Login admin v1 ajustado para Oracle usando tabela `USUARIOS` (`backend/routes/auth.js`).
- Rota de modulos com fallback estatico no Oracle (`backend/routes/modulos.js`) quando tabelas nao existem.
- Rota de permissoes com comportamento Oracle (`backend/routes/permissoes.js`):
  - leitura de `permissoes_usuarios`;
  - retorno padrao;
  - permissao ampla para papel `gestor`/`proprietario` sem cadastro manual completo.
- Frontend admin:
  - URLs centralizadas por `NEXT_PUBLIC_API_URL`;
  - ajuste em `Sidebar.tsx` para mapear `item_id` -> `permissionKey` de forma consistente.
- Migracao SQL em lotes concluida no backend:
  - Lote 1: fortalecimento de adaptacao Oracle em `databaseV2.js`
  - Lote 2: ajuste de rotas P0 (`dashboard`, `logs`, `vendas`, `agendamentos`, `emissao-nfe`, `relatorios`)
  - Lote 3: ajuste restante de rotas/utils/services e remocao de `ON CONFLICT` residual
- Scripts Oracle base atualizados:
  - `database/sql/oracle/001_init_multifilial.sql` (Oracle nativo, UUID texto `VARCHAR2(36)`)
  - `database/sql/oracle/002_base_operacao_storage.sql` (Oracle nativo)
- Guia de execucao Oracle atualizado em `docs/deploy/ORACLE_BOOTSTRAP.md`.

## Estado do Oracle (operacao)
- Usuario/schema em uso: `BARBEARIA_PREMIUM`.
- Tabela `USUARIOS` existente e usada no login.
- Tabela `PERMISSOES_USUARIOS` criada manualmente via DBeaver.
- Colunas de permissao estao sendo adicionadas via PL/SQL (mais estavel que blocos SQL grandes no DBeaver).
- Scripts SQL organizados em:
  - `database/sql/oracle` (base atual Oracle)
  - `database/sql/legacy-postgresql` (historico legado para referencia/migracao)

## Problema atual (aberto)
- Alinhamento total Frontend <> Backend <> Oracle ainda depende de validacao runtime com banco Oracle real.
- Parte das rotas v1 depende de tabelas legadas completas (`receitas`, `despesas`, `agendamentos`, `vendas`, `movimentacoes_caixa`, etc.).
- Se o schema Oracle de operacao nao tiver essas tabelas/colunas, ainda pode ocorrer `500` em modulos financeiros e dashboard.

## Proximo passo imediato (nova maquina)
1. Preparar schema Oracle base (uma das opcoes):
   - `npm run db:oracle:bootstrap` em `backend/`
   - ou executar manualmente `database/sql/oracle/001_init_multifilial.sql` e `002_base_operacao_storage.sql`
2. Subir backend atualizado:
   - `pm2 restart api-barbearia-premium --update-env`
3. Executar smoke test minimo:
   - `GET /health`
   - `GET /api/test-db`
   - `GET /api/v1/modulos`
   - `GET /api/v1/permissoes/:usuarioId`
   - `GET /api/v1/dashboard`
4. Executar smoke funcional por frentes:
   - Agenda, Vendas, Financeiro (Caixas/Receitas/Despesas/Faturamento), Relatorios, NFe, CRM, Assinaturas, Cupons/Fidelidades

## Bloqueios reais
- A homologacao funcional completa exige dados reais e schema Oracle completo das tabelas do legado v1.
- Ainda ha risco de divergencia de tipo/constraint entre ambiente Oracle atual e expectativas das rotas financeiras.

## Checklist de transferencia
- [x] Login admin funcional no Oracle
- [x] Tabela `PERMISSOES_USUARIOS` criada
- [x] Menu com fallback de modulos ativo
- [x] Frontend com mapeamento de permissoes ajustado
- [x] Scripts base Oracle em pasta `database/sql/oracle` convertidos para Oracle nativo
- [x] Lotes de ajuste SQL no backend concluido (P0/P1/P2)
- [x] Mapeamento de chamadas Frontend -> endpoints Backend consolidado
- [ ] Smoke test runtime completo em Oracle remoto (homologacao)
- [ ] Confirmacao de schema legado completo no Oracle para modulos financeiros/dashboard

