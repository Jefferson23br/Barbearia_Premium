# ⚙️ Backend - Sistema Prótese Capilar

## 📁 Estrutura do Backend

Backend desenvolvido com Node.js seguindo arquitetura modular.

```
backend/
├── src/
│   ├── modules/              # Módulos da aplicação
│   ├── common/               # Código compartilhado
│   ├── database/             # Configuração do banco
│   ├── config/               # Configurações
│   └── main.ts               # Entry point
├── tests/                    # Testes
├── package.json
└── tsconfig.json
```

---

## 🛠️ Stack Tecnológica

- **Runtime**: Node.js 20 LTS ✅
- **Framework**: Express (atual) → NestJS (futuro)
- **Linguagem**: JavaScript (atual) → TypeScript (futuro)
- **Banco de Dados**: PostgreSQL 15 ✅
- **Upload**: Multer ✅
- **Hash**: bcrypt ✅
- **Autenticação**: JWT (a implementar)
- **Validação**: Express validator

---

## 📦 Módulos Principais

1. **Auth** - Autenticação e autorização
2. **Users** - Gerenciamento de usuários/clientes
3. **Plans** - Planos e pacotes
4. **Services** - Serviços oferecidos
5. **Appointments** - Agendamentos
6. **Transactions** - Pagamentos e transações
7. **Usage** - Controle de uso de saldo
8. **Notifications** - Sistema de notificações
9. **NFe** - Integração com emissor de notas fiscais
10. **Dashboard** - Relatórios e indicadores

---

## 🔌 API REST

Base URL: `/api/v1`

### Status Atual ✅

**Produção:**
- URL: `https://api.protesecapilarcuiaba.com.br`
- SSL: ✅ Let's Encrypt (HTTPS funcionando)
- Status: Online 24/7 via PM2

**Endpoints Funcionando:**

#### Health & Test
- `GET /health` - Health check da API ✅
- `GET /api/test-db` - Teste de conexão PostgreSQL ✅
- `GET /api/v1/test` - Teste geral ✅

#### Autenticação
- `POST /api/v1/auth/login` - Login de cliente ✅

#### Clientes
- `POST /api/v1/clientes` - Cadastro de cliente (com upload de foto) ✅
- `GET /api/v1/clientes/:id` - Buscar cliente por ID ✅

### Principais Endpoints (A Desenvolver)

- `POST /api/v1/auth/admin/login` - Login administrativo
- `PUT /api/v1/clientes/:id` - Atualizar cliente
- `/plans/*` - Planos
- `/appointments/*` - Agendamentos
- `/transactions/*` - Pagamentos
- `/notifications/*` - Notificações

---

## 🗄️ Banco de Dados

- **SGBD**: PostgreSQL 15.15 ✅
- **Host**: VPS Backend (82.25.65.201)
- **Database**: `protese_capilar` ✅
- **User**: `protese_user` ✅
- **Schema**: Ver `SCHEMA_DATABASE.md` na raiz do projeto
- **Acesso**: DBeaver via SSH Tunnel ✅

---

## 🚀 Comandos

### Instalar dependências
```bash
npm install
```

### Desenvolvimento
```bash
npm run dev
```

### Build
```bash
npm run build
```

### Produção
```bash
npm run start:prod
```

---

## 🔐 Variáveis de Ambiente

Criar arquivo `.env`:

```env
PORT=3001
NODE_ENV=production

DB_HOST=localhost
DB_PORT=5432
DB_NAME=protese_capilar
DB_USER=protese_user
DB_PASSWORD=AppProtese@2025!

API_BASE_URL=https://api.protesecapilarcuiaba.com.br

CORS_ORIGINS=https://www.protesecapilarcuiaba.com.br,https://app.protesecapilarcuiaba.com.br,https://admin.protesecapilarcuiaba.com.br
```

---

## 📚 Documentação

- Ver `SCHEMA_DATABASE.md` para estrutura do banco
- Ver `ROADMAP_DESENVOLVIMENTO.md` para progresso

---

*Backend modular e escalável para suportar todo o sistema*






