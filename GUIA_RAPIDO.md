# ⚡ Guia Rápido - Prótese Capilar Cuiabá

**Atualizado:** 05/12/2025

---

## 🎯 Informações Essenciais

**Cliente:** Próteses Capilares Cuiabá  
**Domínio:** protesecapilarcuiaba.com.br  
**Prazo:** 60 dias úteis (até 19/02/2026)  
**Status:** FASE 1 CONCLUÍDA ✅

---

## 🏗️ Arquitetura Atual

```
VPS Backend (82.25.65.201):
└── api.protesecapilarcuiaba.com.br:8080 ✅
    ├── Node.js 20 (porta 3001)
    ├── PostgreSQL 15
    ├── PM2 (24/7)
    └── Nginx (proxy 8080 → 3001)

VPS Frontend (45.132.157.28):
├── www.protesecapilarcuiaba.com.br   (a configurar)
├── app.protesecapilarcuiaba.com.br   (a configurar)
└── admin.protesecapilarcuiaba.com.br (a configurar)
```

---

## 🚀 Desenvolvimento Local

```bash
# Painel Cliente
cd frontend/painel-cliente
npm run dev
# http://localhost:3000

# Painel Admin
cd frontend/painel-admin
npm run dev
# http://localhost:3000

# Site Entrada
cd frontend/site-entrada
npm run dev
# http://localhost:3002
```

---

## 🔐 Acessos

### VPS Backend
```bash
ssh root@82.25.65.201
```

### PostgreSQL (via DBeaver)
```
SSH Tunnel:
- Host: 82.25.65.201
- User: root
- Port: 22

PostgreSQL:
- Host: localhost
- Port: 5432
- Database: protese_capilar
- User: protese_user
- Password: AppProtese@2025!
```

### API
```
Atual: http://api.protesecapilarcuiaba.com.br:8080
Futuro: https://api.protesecapilarcuiaba.com.br
```

---

## 🔧 Comandos Úteis (VPS Backend)

```bash
# Status da API
pm2 status

# Logs da API
pm2 logs api-protese-capilar

# Reiniciar API
pm2 restart api-protese-capilar

# Testar API
curl http://localhost:3001/health
curl http://api.protesecapilarcuiaba.com.br:8080/health

# Testar banco
curl http://localhost:3001/api/test-db

# Reiniciar Nginx
sudo systemctl restart nginx

# PostgreSQL
psql -h localhost -U protese_user -d protese_capilar
```

---

## 📚 Documentação Principal

| Documento | Descrição |
|-----------|-----------|
| `STATUS_PROJETO.md` | Status completo e detalhado |
| `O_QUE_FIZEMOS_HOJE.md` | Resumo da última sessão |
| `PROXIMOS_PASSOS.md` | O que fazer a seguir |
| `Cronograma.txt` | Cronograma de 60 dias |
| `SCHEMA_DATABASE.md` | Estrutura do banco |
| `docs/deploy/` | Guias de configuração |

---

## ✅ Status Rápido

- ✅ Frontend: 3 projetos funcionando
- ✅ Backend: API rodando 24/7
- ✅ Banco: PostgreSQL configurado
- ⏳ SSL: Aguardando configuração
- ⏳ DNS: Aguardando configuração no Cloudflare
- ⏳ Deploy Frontend: VPS 45.132.157.28

---

## 🎯 Próximo Passo

1. Configurar SSL na API
2. Configurar DNS no Cloudflare
3. Criar estrutura NestJS do backend

---

*Consulta rápida para o projeto* ⚡




