# 💈 Sistema Prótese Capilar Cuiabá

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-14.2-black?style=for-the-badge&logo=next.js&logoColor=white)
![React](https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-20-339933?style=for-the-badge&logo=node.js&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-316192?style=for-the-badge&logo=postgresql&logoColor=white)

**Sistema completo de gestão para clínica de prótese capilar** ✂️

[![Status](https://img.shields.io/badge/status-fase_1_concluída-green?style=flat-square)](https://github.com)
[![API](https://img.shields.io/badge/API-online-brightgreen?style=flat-square)](http://api.protesecapilarcuiaba.com.br:8080/health)

</div>

---

## 🎯 Sobre o Projeto

Sistema completo desenvolvido para **Próteses Capilares Cuiabá** com gestão de clientes, planos, agendamentos e controle financeiro.

**Domínio Principal:** protesecapilarcuiaba.com.br  
**Prazo:** 60 dias úteis (Conclusão: 19/02/2026)

---

## 🏗️ Arquitetura

### VPS Backend (82.25.65.201) ✅
```
api.protesecapilarcuiaba.com.br:8080
├── Node.js 20.19.6
├── Express + PostgreSQL 15.15
├── PM2 (24/7 online)
└── Nginx (proxy reverso)
```

### VPS Frontend (45.132.157.28) ⏳
```
www.protesecapilarcuiaba.com.br   → Site de Entrada
app.protesecapilarcuiaba.com.br   → Painel do Cliente
admin.protesecapilarcuiaba.com.br → Painel Administrativo
```

---

## 📁 Estrutura do Projeto

```
Barbearia_Premium/
│
├── frontend/
│   ├── site-entrada/      ✅ Página "Em Desenvolvimento"
│   ├── painel-cliente/    ✅ Painel do cliente
│   ├── painel-admin/      ✅ Painel administrativo
│   └── site-publico/      🔄 Site comercial (futuro)
│
├── backend/               ✅ API rodando (teste)
│
├── docs/
│   └── deploy/            📚 Guias VPS e configuração
│
└── scripts/               🔧 Scripts e templates
```

---

## 🛠️ Tecnologias

### Frontend
- **Framework**: Next.js 14
- **UI**: React 18 + TypeScript
- **Estilização**: Tailwind CSS
- **Componentes**: Radix UI
- **Animações**: Motion (Framer Motion)

### Backend
- **Runtime**: Node.js 20 LTS
- **Framework**: Express (atual) → NestJS (futuro)
- **Banco**: PostgreSQL 15
- **Process Manager**: PM2
- **Proxy**: Nginx

### Infraestrutura
- **VPS Backend**: Hostinger KVM 2 (AlmaLinux 9 + CyberPanel)
- **VPS Frontend**: Hostinger
- **CDN**: Cloudflare
- **SSL**: Let's Encrypt (pendente)

---

## 🚀 Desenvolvimento Local

### Frontend

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

### Testar API (Produção)

```bash
# Health check
curl http://api.protesecapilarcuiaba.com.br:8080/health

# Test database
curl http://api.protesecapilarcuiaba.com.br:8080/api/test-db
```

---

## 📊 Status Atual

### ✅ Concluído (FASE 1)

**Frontend:**
- ✅ 3 projetos criados e funcionando
- ✅ Design system implementado
- ✅ SEO otimizado (B2B e B2C)
- ✅ Favicon configurado

**Backend:**
- ✅ VPS configurada (82.25.65.201)
- ✅ Node.js + PM2 + PostgreSQL
- ✅ API de teste rodando 24/7
- ✅ Nginx configurado (porta 8080)
- ✅ DBeaver conectado

### 🔄 Em Andamento

- ⏳ SSL/HTTPS na API
- ⏳ DNS no Cloudflare
- ⏳ Backend completo (NestJS)

### 📋 Próximo

- [ ] Configurar SSL
- [ ] Mover para porta 443
- [ ] Deploy frontend (VPS 45.132.157.28)

---

## 🔐 Credenciais

### PostgreSQL
```
Host: localhost (SSH Tunnel)
Port: 5432
Database: protese_capilar
User: protese_user
Password: AppProtese@2025!
```

### SSH
```bash
# Backend
ssh root@82.25.65.201

# Frontend (quando configurar)
ssh root@45.132.157.28
```

### API
```
Desenvolvimento: http://localhost:3001
Produção Atual: http://api.protesecapilarcuiaba.com.br:8080
Produção Final: https://api.protesecapilarcuiaba.com.br (pendente SSL)
```

---

## 📚 Documentação

- **[STATUS_PROJETO.md](./STATUS_PROJETO.md)** - Status detalhado
- **[O_QUE_FIZEMOS_HOJE.md](./O_QUE_FIZEMOS_HOJE.md)** - Última sessão
- **[PROXIMOS_PASSOS.md](./PROXIMOS_PASSOS.md)** - Roadmap
- **[Cronograma.txt](./Cronograma.txt)** - Cronograma completo
- **[SCHEMA_DATABASE.md](./SCHEMA_DATABASE.md)** - Estrutura do banco
- **[docs/deploy/](./docs/deploy/)** - Guias de configuração

---

## 🎯 Progresso

```
FASE 1: ████████████████████ 100% ✅ Infraestrutura
FASE 2: ░░░░░░░░░░░░░░░░░░░░   0% 🔄 Backend Core
FASE 3: ░░░░░░░░░░░░░░░░░░░░   0%    Módulos
```

**FASE 1 CONCLUÍDA COM SUCESSO!** 🎉

---

## 📄 Licença

Projeto privado - Próteses Capilares Cuiabá

---

<div align="center">

**Transformando vidas através do cabelo** 💈

*FASE 1 Concluída | API Online | PostgreSQL Configurado*

**Última atualização:** 05/12/2025

</div>
