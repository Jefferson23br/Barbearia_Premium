# Infra VPS + Oracle + DBeaver — 23/10/2026

**Uso operacional.** Não commitar em repo público se o remote for aberto. Preferir chave SSH no médio prazo.

---

## SSH

| Campo | Valor |
|---|---|
| Host | `72.60.61.215` |
| Hostname | `srv987261` |
| Usuário | `root` |
| Senha | `000356985Dp@` |
| Comando | `ssh root@72.60.61.215` |

---

## Aplicação Barbearia

| Item | Valor |
|---|---|
| Código | `/Projetos/Barbearia_Premium/backend` |
| PM2 | `api-barbearia-premium` |
| Porta app | `3016` |
| `.env` | `/Projetos/Barbearia_Premium/backend/.env` |
| API pública | `https://api6.auctusconsultoria.com.br` |
| Health | `GET /health` |
| Teste DB | `GET /api/test-db` |
| Admin | `https://appbarber.auctusconsultoria.com.br/admin/` |
| Static admin | `/var/www/appbarber-admin/` |

### Nginx

- API: `/etc/nginx/conf.d/api.conf` → `proxy_pass http://localhost:3016`
- Front: `/etc/nginx/sites-enabled/appbarber.auctusconsultoria.com.br`

### Variáveis Oracle no `.env` (prod)

```
ORACLE_HOST=72.60.61.215
ORACLE_PORT=1521
ORACLE_SERVICE_NAME=XEPDB1
ORACLE_USER=Barbearia_Premium
ORACLE_PASSWORD=000356985Dp@
```

---

## Oracle (Docker)

| Item | Valor |
|---|---|
| Container | `oracle-db` |
| Image | `gvenzl/oracle-xe` |
| Porta | `1521` (host ↔ container) |
| Service name | `XEPDB1` |

Comandos úteis:

```bash
docker ps -a --filter name=oracle-db
docker start oracle-db
docker logs -f --tail 100 oracle-db
# smoke API
curl -sS http://127.0.0.1:3016/api/test-db
```

**16/10/2026:** container desligou após *heavy swapping*.  
**23/10/2026:** reiniciado; firewall `1521/tcp` liberado; teste DB OK.

---

## DBeaver — como conectar

1. **Database → New Database Connection → Oracle**
2. Preencher:

| Campo | Valor |
|---|---|
| Host | `72.60.61.215` |
| Port | `1521` |
| Connection type | **Service name** (não SID) |
| Database / Service | `XEPDB1` |
| Username | `Barbearia_Premium` |
| Password | `000356985Dp@` |

3. Se pedir driver JDBC Oracle → download / permitir.
4. **Test Connection** → Connect.
5. Explorar schema do usuário `BARBEARIA_PREMIUM` (ou equivalente listado).

Se a porta falhar do seu PC: confirmar `firewall-cmd --query-port=1521/tcp` = `yes` e `docker ps` com `oracle-db` **Up**.

Alternativa segura (túnel SSH, se fechar 1521 no futuro):

```text
Host local no DBeaver: localhost
Port local: 1521
Túnel: ssh -L 1521:127.0.0.1:1521 root@72.60.61.215
```

---

## Memória (impacto no Oracle da Barbearia)

- RAM total do host ~**3,8 GiB** — com Oracle UP a margem fica apertada.
- Monitorar se o container cair de novo:

```bash
pm2 show api-barbearia-premium
docker ps --filter name=oracle-db
free -h
uptime
```
