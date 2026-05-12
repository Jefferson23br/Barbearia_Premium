# Guia de atualização (deploy) — Barbearia Premium

Documento para atualizar produção após mudanças no repositório. URLs oficiais usam sempre **`auctusconsultoria.com.br`** (com **u**), por exemplo `https://api6.auctusconsultoria.com.br` — não use o typo `actusconsultoria`.

## Visão rápida da infra

| Peça | IP (referência) | URL pública |
|------|-----------------|-------------|
| API (Node + PM2) | 82.25.65.201 | https://api6.auctusconsultoria.com.br |
| Frontends (Next) | 45.132.157.28 | https://appbarber.auctusconsultoria.com.br (e `/admin`) |

Caminhos típicos na VPS (ajuste se o seu servidor usar outra pasta):

- Backend: `/home/cyberpanel/app/backend/`
- Front: `/home/cyberpanel/app/frontend-admin/`, `frontend-cliente/`, `frontend-site/`

Mais detalhes: [INFRAESTRUTURA.md](../INFRAESTRUTURA.md), [COMANDOS_ESSENCIAIS.md](COMANDOS_ESSENCIAIS.md).

---

## 1. Antes de subir código

1. **Domínios no `.env`**
   - Backend: `API_BASE_URL=https://api6.auctusconsultoria.com.br`
   - Backend: `CORS_ORIGINS` deve incluir `https://appbarber.auctusconsultoria.com.br` e `https://appbarber.auctusconsultoria.com.br/admin` (e localhost se precisar em dev).
   - Cada app Next: `NEXT_PUBLIC_API_URL=https://api6.auctusconsultoria.com.br`
2. **Banco**: produção atual orientada a **Oracle** — variáveis `ORACLE_*` no `backend/.env` conforme [ORACLE_BOOTSTRAP.md](ORACLE_BOOTSTRAP.md).
3. Faça **backup** ou tag Git antes de atualizar ambiente crítico.

---

## 2. Atualizar o backend (VPS da API)

No seu PC (com Git) ou diretamente na VPS:

```bash
cd /caminho/do/repositorio
git pull origin main   # ou a branch que você usa
cd backend
npm install
```

Se houver **scripts ou migração Oracle** novos, rode o bootstrap apenas quando fizer sentido (ambiente novo ou mudança de schema):

```bash
npm run db:oracle:bootstrap
```

Veja o que o bootstrap faz em [ORACLE_BOOTSTRAP.md](ORACLE_BOOTSTRAP.md).

Envie os arquivos para a VPS (exemplo com `scp` da raiz do repo):

```bash
scp -r backend/* root@82.25.65.201:/home/cyberpanel/app/backend/
```

Na VPS:

```bash
ssh root@82.25.65.201
cd /home/cyberpanel/app/backend
npm install --production
pm2 restart api-barbearia-premium --update-env
pm2 logs api-barbearia-premium --lines 80
```

`--update-env` garante que o PM2 releia variáveis do `.env` / ambiente.

---

## 3. Atualizar o frontend (VPS do app)

Build **com a URL da API correta** (`NEXT_PUBLIC_API_URL` já apontando para `api6.auctusconsultoria.com.br`).

Exemplo — painel admin (repita o padrão para `painel-cliente` e `site-entrada` se aplicável):

```bash
cd frontend/painel-admin
# Confira .env ou .env.production com NEXT_PUBLIC_API_URL
npm install
npm run build
```

Deploy dos artefatos (ajuste se o projeto usar `out/` estático ou outro diretório de saída do Next):

```bash
scp -r out/* root@45.132.157.28:/home/cyberpanel/app/frontend-admin/
```

Na VPS do front:

```bash
ssh root@45.132.157.28
pm2 restart painel-admin
pm2 restart painel-cliente
# pm2 restart ... para cada app que existir
```

Se usar apenas Nginx servindo arquivos estáticos (sem PM2 Node), substitua `pm2 restart` por atualizar a pasta em `/var/www/...` e `sudo nginx -t && sudo systemctl reload nginx` — ver [VPS_FRONTEND_45.md](VPS_FRONTEND_45.md).

---

## 4. Smoke test após deploy

Substitua `localhost:3001` se estiver testando só na VPS.

```bash
curl -sS https://api6.auctusconsultoria.com.br/health
curl -sS https://api6.auctusconsultoria.com.br/api/test-db
curl -sS "https://api6.auctusconsultoria.com.br/api/v1/modulos" -H "Authorization: Bearer SEU_TOKEN"
```

No navegador:

- https://appbarber.auctusconsultoria.com.br
- https://appbarber.auctusconsultoria.com.br/admin

Login, menu e um módulo crítico (ex.: agenda ou dashboard) validam CORS + API.

---

## 5. Nginx / SSL com nome correto do host

Templates do repositório: `scripts/templates-nginx/api.conf` usam **`api6.auctusconsultoria.com.br`**.

Se no passado o certificado ou o `server_name` foi gerado com o domínio errado (`actus...`), corrija o vhost para **`auctus...`** e emita certificado de novo para o FQDN certo (CyberPanel, Certbot ou fluxo da sua VPS — ver [API_GO_LIVE_VPS.md](API_GO_LIVE_VPS.md) e [VPS_BACKEND_COM_CYBERPANEL.md](VPS_BACKEND_COM_CYBERPANEL.md)).

---

## 6. Referências cruzadas

- Oracle: [ORACLE_BOOTSTRAP.md](ORACLE_BOOTSTRAP.md), [ORACLE_MIGRACAO_STATUS.md](ORACLE_MIGRACAO_STATUS.md)
- API fora do ar: [DIAGNOSTICO_API_CAIU.md](DIAGNOSTICO_API_CAIU.md)
- Handoff técnico: [../historico-conversas/HANDOFF.md](../historico-conversas/HANDOFF.md)

---

## Checklist mínimo

- [ ] `git pull` e dependências (`npm install`) backend e frontends afetados
- [ ] `.env` com `auctusconsultoria` em todas as URLs públicas
- [ ] `pm2 restart ... --update-env` na API após mudar env
- [ ] `curl` em `/health` e `/api/test-db` na URL pública
- [ ] Teste manual no app e no admin em HTTPS
