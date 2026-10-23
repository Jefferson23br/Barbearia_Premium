# Cenário atual — Barbearia Premium

**Snapshot:** 23/10/2026 (após manutenção Oracle)  
**Escopo:** somente este projeto.  
Atualizar neste dia se o estado mudar; no dia seguinte, refazer em `AAAA-MM-DD/`.

---

## 1. O que é o projeto

Sistema de gestão para barbearia **multi-filial**, versão **2.0.0**, em produção.

| Camada | Tecnologia | Situação |
|---|---|---|
| Painel Admin | Next.js 14 (export estático na VPS) | **No ar** |
| Painel Cliente | Next.js 14 | No repo; smoke de hoje focou admin + API + DB |
| Site entrada | Next.js 14 | Em evolução |
| API | Express modular (`backend/`) | **No ar** (PM2) |
| Banco | Oracle XE (Docker `oracle-db`) | **No ar** (reiniciado hoje) |
| Proxy / SSL | Nginx + Let's Encrypt | **No ar** |

### Módulos de negócio (implementados no código)

Auth/RBAC · Funcionários · Clientes · Agenda · Serviços · Produtos/Estoque · Vendas · Receitas/Despesas/Caixas · Faturamento · Balanço · NFe (Focus) · Cupons/Fidelidade · Assinaturas · CRM · Help Desk · Logs · Relatórios · Integrações · Módulos de menu.

---

## 2. Onde roda (realidade vs docs antigos)

| Docs antigos | Fato atual |
|---|---|
| Backend em `82.25.65.201` | API nesta VPS `72.60.61.215` |
| Frontend em `45.132.157.28` | Admin estático nesta VPS (`/var/www/appbarber-admin`) |
| Oracle em host dedicado | Oracle Docker na mesma VPS |

**URLs**

| Papel | URL |
|---|---|
| API | `https://api6.auctusconsultoria.com.br` → `localhost:3016` |
| Admin | `https://appbarber.auctusconsultoria.com.br/admin/` |
| Health | `GET /health` → ok |
| DB | `GET /api/test-db` → `database: connected` |

**Paths**

```
Local:  C:\Users\jefferson.lima\Documents\Barbearia_Premium
VPS:    /Projetos/Barbearia_Premium/backend   ← API (PM2)
        /Projetos/Barbearia_Premium/frontend
        /var/www/appbarber-admin/             ← build Nginx
```

---

## 3. Status agora (só Barbearia)

| Componente | Status | Detalhe |
|---|---|---|
| PM2 `api-barbearia-premium` | **ONLINE** | porta **3016** · `NODE_ENV=production` |
| Nginx `api6` | **OK** | proxy → 3016 |
| Nginx `appbarber` | **OK** | `/var/www/appbarber-admin/` |
| Oracle `oracle-db` | **UP** | service `XEPDB1` · porta `1521` |
| Firewall `1521/tcp` | **Aberto** | para DBeaver |
| API ↔ Oracle | **OK** | `/api/test-db` connected |
| DBeaver | **OK** | ver `INFRA_VPS_ORACLE.md` |

### Antes da manutenção de hoje

- Oracle **Exited ~7 dias** (shutdown 16/10 por *heavy swapping* na VPS).
- API online, mas **sem banco** (`ECONNREFUSED :1521`).
- Porta 1521 fechada no firewall → liberada hoje.

**Nada da Barbearia está parado de propósito.** API, admin e Oracle estão no ar.

---

## 4. Atenção / incompleto (produto)

| Item | Nota |
|---|---|
| Site entrada | Em desenvolvimento no repo |
| Docs “2 VPS” no README | Desatualizados vs deploy atual |
| Painel cliente nesta VPS | Não validado no smoke de hoje |
| RAM da VPS | ~3,8 GiB total · host compartilhado · Oracle pode sofrer swap de novo |

---

## 5. Saúde do host (impacto no Oracle)

| Recurso | Snapshot |
|---|---|
| Host | `72.60.61.215` · `srv987261` · Ubuntu |
| RAM | 3,8 GiB · ~1,0 GiB available com Oracle UP |
| Swap | ~872 MiB em uso |
| Disco `/` | 48G · **66%** |
| Risco | Pouca RAM → Oracle pode cair de novo por swapping |

---

## 6. Mapa mental

```
[Cliente / DBeaver]
        │
        ▼
72.60.61.215
├── Nginx :443
│   ├── api6…     → PM2 api-barbearia-premium :3016
│   └── appbarber → /var/www/appbarber-admin
└── Docker oracle-db (XEPDB1 :1521)  ← UP
```

---

## 7. Uso pela IA

1. Panorama deste projeto: este arquivo.
2. Credenciais / DBeaver: `INFRA_VPS_ORACLE.md`.
3. Smoke Oracle/API: `CHECKLIST_MANUTENCAO.md`.
4. Não misturar com outros produtos da VPS no handoff.
