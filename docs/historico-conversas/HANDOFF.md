# Handoff — Barbearia Premium

## Status atual
- **Fase:** Operação em **Oracle** com backend legado estabilizado; migração PostgreSQL → Oracle aplicada na camada de rotas (detalhes no `CHANGELOG.md`).
- **Última atualização deste documento:** 2026-05-11
- **Ambientes de produção:**
  - App: `https://appbarber.auctusconsultoria.com.br`
  - API: `https://api6.auctusconsultoria.com.br`
- **Infra:** duas VPS (API em 82.25.65.201; frontends em 45.132.157.28) — ver `docs/INFRAESTRUTURA.md`.

## O que foi consolidado
- `backend/config/databaseV2.js` como camada de dados; `database.js` reexporta (único ponto de acesso).
- Login admin v1 para Oracle com tabela `USUARIOS` (`backend/routes/auth.js`).
- `modulos.js` com fallback estático quando tabelas Oracle ainda não existem.
- `permissoes.js`: leitura Oracle (`permissoes_usuarios`), retorno padrão, papéis `gestor`/`proprietario` com permissão ampla quando aplicável.
- Frontend admin: `NEXT_PUBLIC_API_URL`; `Sidebar.tsx` com `item_id` → `permissionKey` consistente.
- Lotes de migração SQL no backend concluídos (P0/P1/P2): ver `CHANGELOG.md`.
- Scripts Oracle base: `database/sql/oracle/001_init_multifilial.sql`, `002_base_operacao_storage.sql`.
- Documentação de bootstrap: `docs/deploy/ORACLE_BOOTSTRAP.md`; deploy/atualização: `docs/deploy/GUIA_ATUALIZACAO_DEPLOY.md`.

## Estado do Oracle (operação)
- Usuário/schema típico: `BARBEARIA_PREMIUM` (ajustar ao ambiente real).
- `USUARIOS` em uso no login.
- `PERMISSOES_USUARIOS` (criação/checagem conforme processo do time — ex.: DBeaver + PL/SQL).
- Scripts atuais em `database/sql/oracle`; histórico PostgreSQL em `database/sql/legacy-postgresql`.

## Problemas em aberto
- Validação runtime completa Frontend ↔ Backend ↔ Oracle com schema real.
- Rotas v1 dependentes de tabelas legadas (`receitas`, `despesas`, `agendamentos`, `vendas`, `movimentacoes_caixa`, …): sem todas no Oracle, risco de **500** em financeiro e dashboard.

## Próximo passo imediato (nova máquina ou recuperação)
1. Schema Oracle base: `npm run db:oracle:bootstrap` em `backend/` ou execução manual de `001` + `002` em `database/sql/oracle`.
2. Backend atualizado e `.env` com `ORACLE_*` corretos: `pm2 restart api-barbearia-premium --update-env`.
3. Smoke mínimo:
   - `GET /health`
   - `GET /api/test-db`
   - `GET /api/v1/modulos`
   - `GET /api/v1/permissoes/:usuarioId`
   - `GET /api/v1/dashboard`
4. Smoke funcional: Agenda, Vendas, Financeiro (caixas/receitas/despesas/faturamento), Relatórios, NFe, CRM, Assinaturas, Cupons/Fidelidades.

## Bloqueios reais
- Homologação funcional plena exige dados reais e schema Oracle alinhado ao legado v1.
- Risco de divergência de tipo/constraint nas rotas financeiras vs. Oracle real.

## Checklist de transferência
- [x] Login admin funcional no Oracle
- [x] Tabela `PERMISSOES_USUARIOS` criada (processo do ambiente)
- [x] Menu com fallback de módulos ativo
- [x] Frontend com mapeamento de permissões ajustado
- [x] Scripts base Oracle em `database/sql/oracle` (nativos)
- [x] Lotes P0/P1/P2 no backend concluídos
- [x] Mapeamento frontend → endpoints consolidado
- [x] Documentação de deploy/atualização revisada (2026-05-11)
- [ ] Smoke test runtime completo em Oracle remoto (homologação)
- [ ] Confirmação de schema legado completo no Oracle para módulos financeiros/dashboard
