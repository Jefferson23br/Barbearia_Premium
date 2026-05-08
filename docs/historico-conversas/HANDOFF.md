# Handoff - Barbearia Premium

## Status atual
- Fase: migracao operacional PostgreSQL -> Oracle com foco em manter admin funcionando.
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

## Estado do Oracle (operacao)
- Usuario/schema em uso: `BARBEARIA_PREMIUM`.
- Tabela `USUARIOS` existente e usada no login.
- Tabela `PERMISSOES_USUARIOS` criada manualmente via DBeaver.
- Colunas de permissao estao sendo adicionadas via PL/SQL (mais estavel que blocos SQL grandes no DBeaver).

## Problema atual (aberto)
- Menus aparecem parcialmente e dashboard retorna erro `500`.
- Causa mais provavel do `500`: `backend/routes/dashboard.js` ainda depende de varias tabelas legadas (`receitas`, `despesas`, `agendamentos`, `vendas`, etc.) que podem nao existir/estar incompletas no Oracle.

## Proximo passo imediato (nova maquina)
1. Subir backend atualizado e reiniciar API:
   - `pm2 restart api-barbearia-premium --update-env`
2. Garantir deploy do frontend estatico:
   - origem: `/Projetos/Barbearia_Premium/frontend/painel-admin/out`
   - destino: `/var/www/appbarber-admin`
   - comando recomendado: `rsync -avh --delete /Projetos/Barbearia_Premium/frontend/painel-admin/out/ /var/www/appbarber-admin/`
3. Recarregar Nginx:
   - `nginx -t && systemctl reload nginx`
4. Validar endpoints chave:
   - `GET /api/v1/modulos`
   - `GET /api/v1/permissoes/:usuarioId`
   - `GET /api/v1/dashboard` (esperado ainda com risco de 500)

## Bloqueios reais
- Modelo legado v1 usa muitas tabelas `protese.*` historicas; nem todas estao criadas no Oracle.
- Enquanto isso nao for migrado, algumas abas/indicadores vao depender de fallback ou retornar erro.

## Checklist de transferencia
- [x] Login admin funcional no Oracle
- [x] Tabela `PERMISSOES_USUARIOS` criada
- [x] Menu com fallback de modulos ativo
- [x] Frontend com mapeamento de permissoes ajustado
- [ ] Dashboard sem erro `500`
- [ ] Migracao das tabelas legadas principais para Oracle

