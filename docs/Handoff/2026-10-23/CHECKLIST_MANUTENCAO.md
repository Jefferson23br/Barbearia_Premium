# Checklist manutenção — 23/10/2026 — VPS Barbearia

Ambiente: `72.60.61.215` · API `api6.auctusconsultoria.com.br` · PM2 `api-barbearia-premium`.  
Não misturar com produção de outros produtos sem pedido.

## Já feito nesta leva

- [x] Inspecionar VPS (PM2 Barbearia, Nginx, disco, memória, Oracle)
- [x] Confirmar Oracle `oracle-db` estava Exited
- [x] `docker start oracle-db` e aguardar `XEPDB1` OPEN
- [x] Liberar firewall `1521/tcp`
- [x] Validar `http://127.0.0.1:3016/api/test-db` e `https://api6…/api/test-db`
- [x] Documentar DBeaver em `INFRA_VPS_ORACLE.md`
- [x] Criar pasta `docs/Handoff/` (só Barbearia Premium)

## Smoke rápido (repetir se algo falhar)

1. [ ] `ssh root@72.60.61.215`
2. [ ] `docker ps --filter name=oracle-db` → **Up**
3. [ ] `ss -tlnp | grep 1521` → escutando
4. [ ] `pm2 show api-barbearia-premium` → **online**
5. [ ] `curl -sS http://127.0.0.1:3016/health`
6. [ ] `curl -sS http://127.0.0.1:3016/api/test-db` → `database":"connected"`
7. [ ] DBeaver: host `72.60.61.215` · `1521` · service `XEPDB1` · user `Barbearia_Premium`
8. [ ] Admin abre: `https://appbarber.auctusconsultoria.com.br/admin/`

## Se Oracle cair de novo

1. [ ] `free -h` / `uptime` — checar swap e load
2. [ ] `pm2 show api-barbearia-premium` — API ainda online
3. [ ] `docker start oracle-db` e acompanhar `docker logs -f oracle-db`
4. [ ] Revalidar `/api/test-db`
5. [ ] Anotar no handoff do **dia seguinte** (não reescrever este dia além de correção factual)

## Fora desta leva (só se pedir)

- [ ] Atualizar README/arquitetura “2 VPS” no repo
- [ ] Migrar SSH para chave e rotacionar senhas
- [ ] Separar Oracle / API em host dedicado
