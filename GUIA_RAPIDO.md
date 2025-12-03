# ⚡ Guia Rápido do Projeto

## 🎯 Informações Essenciais

**Cliente:** Próteses Capilares Cuiabá  
**Domínio:** protesecapilarcuiaba.com.br  
**Prazo:** 60 dias úteis (até 19/02/2026)

---

## 🏗️ Arquitetura

```
VPS Backend (82.25.65.201):
└── api.protesecapilarcuiaba.com.br
    ├── Node.js 20 + PostgreSQL 15
    └── Porta: 3001

VPS Frontend (45.132.157.28):
├── www.protesecapilarcuiaba.com.br   (Site de entrada)
├── app.protesecapilarcuiaba.com.br   (Painel cliente)
└── admin.protesecapilarcuiaba.com.br (Painel admin)
```

---

## 🚀 Desenvolvimento Local

```bash
# Painel Cliente
cd frontend/painel-cliente && npm run dev
# http://localhost:3000

# Painel Admin
cd frontend/painel-admin && npm run dev
# http://localhost:3000

# Site Entrada
cd frontend/site-entrada && npm run dev
# http://localhost:3002
```

---

## 📚 Documentação Principal

- **[Cronograma.txt](./Cronograma.txt)** - Cronograma de 60 dias
- **[STATUS_PROJETO.md](./STATUS_PROJETO.md)** - Status atual
- **[SCHEMA_DATABASE.md](./SCHEMA_DATABASE.md)** - Estrutura do banco
- **[CONFIGURACAO_DNS_CLOUDFLARE.txt](./CONFIGURACAO_DNS_CLOUDFLARE.txt)** - DNS
- **[docs/deploy/](./docs/deploy/)** - Guias de deploy

---

## 🔐 Acessos VPS

```bash
# VPS Backend
ssh root@82.25.65.201

# VPS Frontend
ssh root@45.132.157.28
```

---

## 🗄️ PostgreSQL

```
Host: localhost (via SSH Tunnel)
Port: 5432
Database: protese_capilar
User: protese_user
Password: AppProtese@2025!
```

**DBeaver:** Conectado via SSH Tunnel ✅

---

## ✅ Progresso

- ✅ Estrutura criada
- ✅ Frontend (3 projetos) funcionando
- ✅ VPS Backend configurada
- ✅ PostgreSQL rodando
- ✅ DBeaver conectado
- 🔄 Backend (API) - próximo passo

---

*Guia rápido para consulta* ⚡



