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

- **Runtime**: Node.js 20 LTS
- **Framework**: NestJS ou Express (a definir)
- **Linguagem**: TypeScript
- **Banco de Dados**: PostgreSQL
- **ORM**: TypeORM ou Prisma (a definir)
- **Autenticação**: JWT (Passport.js)
- **Validação**: class-validator
- **Documentação**: Swagger/OpenAPI

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

### Principais Endpoints

- `/auth/*` - Autenticação
- `/users/*` - Usuários
- `/plans/*` - Planos
- `/appointments/*` - Agendamentos
- `/transactions/*` - Pagamentos
- `/notifications/*` - Notificações

---

## 🗄️ Banco de Dados

- **SGBD**: PostgreSQL 15+
- **Host**: Local (dev) / VPS Hostinger (prod)
- **Schema**: Ver `SCHEMA_DATABASE.md` na raiz do projeto

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
# Database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=senha
DATABASE_NAME=protese_capilar

# JWT
JWT_SECRET=seu_secret_aqui
JWT_EXPIRES_IN=1d

# Server
PORT=3001
NODE_ENV=development
```

---

## 📚 Documentação

- Ver `SCHEMA_DATABASE.md` para estrutura do banco
- Ver `ROADMAP_DESENVOLVIMENTO.md` para progresso

---

*Backend modular e escalável para suportar todo o sistema*



