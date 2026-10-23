# Handoff — sessão 23/10/2026 (diagnóstico VPS + Oracle + DBeaver)

**Status:** **FECHADO nesta sessão** · Oracle e API com DB OK no momento da manutenção.  
Não inventar features. Próxima chamada = demanda explícita ou correção se Oracle/API cair de novo.

Workspace: `C:\Users\jefferson.lima\Documents\Barbearia_Premium`  
Código local: `backend/` · `frontend/painel-admin/` · `frontend/painel-cliente/` · `frontend/site-entrada/`  
Código VPS: `/Projetos/Barbearia_Premium/backend`  
PM2: `api-barbearia-premium` (porta **3016**, `NODE_ENV=production`)  
API pública: `https://api6.auctusconsultoria.com.br`  
Admin: `https://appbarber.auctusconsultoria.com.br/admin/`  
VPS: `72.60.61.215` (`srv987261` · Ubuntu) · SSH `root`

**Prompt:** `PROMPT_COPIAR_COLAR.md` · **Cenário:** `CENARIO_ATUAL.md` · **Manutenção:** `CHECKLIST_MANUTENCAO.md` · **Infra/DBeaver:** `INFRA_VPS_ORACLE.md`  
**REGRA UNIVERSAL:** só esta pasta `2026-10-23/`. Dias anteriores = só se o usuário pedir.

---

## Panorama

Estado do **Barbearia Premium** (no ar / atenção / riscos): **[`CENARIO_ATUAL.md`](./CENARIO_ATUAL.md)**.

---

## O que o dia fechou

### 1. Análise do projeto (local)

- Sistema **Barbearia Premium v2.0** em produção: gestão multi-filial.
- Backend Express modular (~30 rotas): auth, RBAC, agenda, vendas, financeiro, estoque, NFe, assinaturas, CRM, etc.
- Front: painel-admin (prod), painel-cliente (prod), site-entrada (em evolução).
- Banco alvo: **Oracle** via `ORACLE_*` em `databaseV2.js` (PostgreSQL só fallback local).

### 2. Realidade da VPS (docs antigos desatualizados)

README ainda cita backend `82.25.65.201` e frontend `45.132.157.28`.  
**Na prática**, em `72.60.61.215` rodam juntos:

| Peça | Onde |
|---|---|
| API | PM2 `api-barbearia-premium` → `:3016` |
| Nginx API | `api6.auctusconsultoria.com.br` → `localhost:3016` |
| Nginx Admin | `appbarber…` → `/var/www/appbarber-admin/` |
| Oracle | Docker `oracle-db` (`gvenzl/oracle-xe`) → `1521` |

### 3. Manutenção executada

1. Oracle estava **Exited ~7 dias** (shutdown 16/10 por *heavy swapping*).
2. `docker start oracle-db` — PDB `XEPDB1` abriu; porta 1521 escutando.
3. Firewall: liberada **1521/tcp** (`firewall-cmd`).
4. Validação: `GET /api/test-db` → `{"status":"ok","database":"connected"}` (local e via `api6`).
5. Credenciais/acesso no `INFRA_VPS_ORACLE.md` (só deste projeto).

### 4. DBeaver

Parâmetros e passo a passo em `INFRA_VPS_ORACLE.md` (mesmo dia).

---

## Arquivos / paths relevantes

| Área | Path |
|---|---|
| API VPS | `/Projetos/Barbearia_Premium/backend` (`server.js`, `.env`) |
| PM2 | `api-barbearia-premium` · logs em `backend/logs/pm2-*.log` |
| Oracle | container `oracle-db` |
| Front estático | `/var/www/appbarber-admin/` |
| Nginx | `/etc/nginx/conf.d/api.conf` · `sites-enabled/appbarber.auctusconsultoria.com.br` |
| Código local | `backend/` · `frontend/painel-admin/` |

---

## Pendências / riscos

- [ ] VPS com **pouca RAM** (~3,8 GiB; Oracle consome bastante) — risco de novo swap e queda do container
- [ ] Documentação de arquitetura “2 VPS” desatualizada (corrigir quando houver demanda)
- [ ] Senha root / Oracle / JWT frágeis — migrar para chave SSH + secrets distintos (quando pedir)

---

## Não repetir

- Assumir backend só em `82.25.65.201` sem checar esta VPS
- Documentar outros produtos da VPS neste handoff
- Inventar feature sem pedido
- Reler `docs/` histórico inteiro no início do chat
