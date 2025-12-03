# 💈 Sistema Prótese Capilar Cuiabá

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-14.2-black?style=for-the-badge&logo=next.js&logoColor=white)
![React](https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-20-339933?style=for-the-badge&logo=node.js&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-316192?style=for-the-badge&logo=postgresql&logoColor=white)

**Sistema completo de gestão para clínica de prótese capilar** ✂️

[![Status](https://img.shields.io/badge/status-em_desenvolvimento-yellow?style=flat-square)](https://github.com)

</div>

---

## 🎯 Sobre o Projeto

Sistema completo desenvolvido para **Próteses Capilares Cuiabá** com gestão de clientes, planos, agendamentos e controle financeiro.

**Domínio Principal:** protesecapilarcuiaba.com.br

---

## 🏗️ Arquitetura

### VPS Backend (82.25.65.201)
```
api.protesecapilarcuiaba.com.br
├── Node.js 20 + Express/NestJS
└── PostgreSQL 15
```

### VPS Frontend (45.132.157.28)
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
│   ├── site-entrada/      ✅ Página inicial (em desenvolvimento)
│   ├── painel-cliente/    ✅ Painel do cliente (em desenvolvimento)
│   ├── painel-admin/      ✅ Painel administrativo (em desenvolvimento)
│   └── site-publico/      🔄 Site comercial completo (a criar)
│
├── backend/               🔄 API Node.js (a criar)
│
├── docs/
│   └── deploy/            📚 Guias de configuração VPS
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
- **Framework**: NestJS ou Express
- **Banco de Dados**: PostgreSQL 15
- **ORM**: TypeORM ou Prisma

### Infraestrutura
- **VPS Backend**: Hostinger KVM 2 (AlmaLinux 9)
- **VPS Frontend**: Hostinger
- **CDN**: Cloudflare
- **Painel**: CyberPanel

---

## 🚀 Desenvolvimento Local

### Frontend - Painel Cliente
```bash
cd frontend/painel-cliente
npm install
npm run dev
# http://localhost:3000
```

### Frontend - Painel Admin
```bash
cd frontend/painel-admin
npm install
npm run dev
# http://localhost:3000
```

### Frontend - Site de Entrada
```bash
cd frontend/site-entrada
npm install
npm run dev
# http://localhost:3002
```

---

## 📊 Status do Projeto

### ✅ Concluído
- Estrutura do projeto organizada
- Painel Cliente - Login/Registro
- Painel Admin - Login/Registro
- Site de Entrada - Em desenvolvimento
- VPS Backend configurada (Node.js + PostgreSQL)
- DBeaver conectado ao banco

### 🔄 Em Andamento
- Criação do backend (API)
- Configuração DNS
- Deploy em produção

### 📋 Próximas Etapas
- Desenvolver API REST
- Criar módulos de autenticação
- Desenvolver dashboard do cliente
- Desenvolver painel administrativo completo
- Integrar pagamentos e NFe

---

## 📚 Documentação

- **[Cronograma](./Cronograma.txt)** - Cronograma de 60 dias
- **[Schema do Banco](./SCHEMA_DATABASE.md)** - Estrutura do PostgreSQL
- **[Roadmap](./ROADMAP_DESENVOLVIMENTO.md)** - Fases do desenvolvimento
- **[Deploy Backend](./docs/deploy/VPS_BACKEND_COM_CYBERPANEL.md)** - Configurar VPS Backend
- **[Deploy Frontend](./docs/deploy/VPS_FRONTEND_45.md)** - Configurar VPS Frontend
- **[Configuração DNS](./CONFIGURACAO_DNS_CLOUDFLARE.txt)** - DNS no Cloudflare

---

## 🔐 Informações de Produção

```
VPS Backend:  82.25.65.201 (API + PostgreSQL)
VPS Frontend: 45.132.157.28 (Sites estáticos)

Domínios:
- API:   https://api.protesecapilarcuiaba.com.br
- Site:  https://www.protesecapilarcuiaba.com.br
- App:   https://app.protesecapilarcuiaba.com.br
- Admin: https://admin.protesecapilarcuiaba.com.br
```

---

## 📄 Licença

Projeto privado - Próteses Capilares Cuiabá

---

<div align="center">

**Transformando vidas através do cabelo** 💈

*Sistema em desenvolvimento ativo - Prazo: 60 dias úteis*

</div>
