# 💈 Sistema Prótese Capilar - Prótese Capilar Cuiabá

Sistema completo de gestão para clínica de prótese capilar desenvolvido com tecnologias modernas.

---

## 📁 Estrutura do Projeto

```
Barbearia_Premium/
│
├── frontend/                    # 🎨 Projetos Frontend
│   ├── painel-admin/           # ✅ Painel Administrativo (Em produção)
│   ├── painel-cliente/         # ✅ Painel do Cliente (Em produção)
│   └── site-entrada/           # ✅ Site de Entrada (Em desenvolvimento)
│
├── backend/                     # ⚙️ API Backend
│   ├── server.js               # Servidor Express principal
│   ├── scripts/                # Scripts auxiliares
│   └── README.md
│
├── docs/                        # 📚 Documentação
│   ├── deploy/                 # Documentação de deploy
│   └── SEO_GUIA.md            # Guia de SEO
│
├── scripts/                     # 🔧 Scripts de configuração VPS
│   └── templates-nginx/        # Templates Nginx
│
├── database/                    # 🗄️ Scripts SQL (na raiz)
│   ├── COMANDOS_CRIAR_TABELA_PERMISSOES_SIMPLES.sql
│   ├── COMANDOS_CRIAR_TABELA_CONTROLE_ACESSOS.sql
│   └── COMANDOS_ADICIONAR_FUNCIONARIO_RESPONSAVEL.sql
│
├── SCHEMA_DATABASE.md          # Schema do banco de dados
├── ROADMAP_DESENVOLVIMENTO.md  # Roadmap do projeto
└── PASSO_A_PASSO_PERMISSOES.md # Guia de sistema de permissões
```

---

## 🎯 Status do Projeto

### ✅ Implementado e em Produção

#### Painel Administrativo (`painel-admin/`)
- ✅ Sistema de login e autenticação
- ✅ Dashboard administrativo completo
- ✅ Sistema de permissões granular (RBAC)
- ✅ Gerenciamento de Funcionários (CRUD completo)
- ✅ Gerenciamento de Clientes/Usuários (CRUD completo)
- ✅ Controle de Permissões (Master apenas)
- ✅ Controle de Acessos (logs de login)
- ✅ Help Desk (em desenvolvimento)
- ✅ Controle de Logs (em desenvolvimento)

#### Painel Cliente (`painel-cliente/`)
- ✅ Sistema de login e autenticação
- ✅ Dashboard básico (em desenvolvimento)
- ✅ Cadastro de cliente

#### Backend (`backend/`)
- ✅ API REST completa
- ✅ Autenticação de clientes e administradores
- ✅ CRUD de funcionários
- ✅ CRUD de clientes
- ✅ Sistema de permissões
- ✅ Controle de acessos/logins
- ✅ Upload de fotos de perfil
- ✅ Integração com PostgreSQL

#### Banco de Dados
- ✅ Schema `protese` criado
- ✅ Tabela `usuarios_administrativos`
- ✅ Tabela `usuarios_clientes`
- ✅ Tabela `permissoes_usuarios`
- ✅ Tabela `controle_acessos`
- ✅ Relacionamento funcionário responsável

---

## 🛠️ Stack Tecnológica

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Linguagem**: TypeScript
- **Estilização**: Tailwind CSS
- **Componentes**: Radix UI
- **Animações**: Framer Motion
- **Ícones**: Lucide React

### Backend
- **Runtime**: Node.js 20 LTS
- **Framework**: Express.js
- **Linguagem**: JavaScript
- **Banco de Dados**: PostgreSQL 15+
- **Autenticação**: bcrypt (hash de senhas)
- **Upload**: Multer

### Infraestrutura
- **Hospedagem**: VPS Hostinger (KVM 2)
- **Sistema**: AlmaLinux 9
- **Painel**: CyberPanel
- **Servidor Web**: Nginx
- **Process Manager**: PM2
- **DNS**: Cloudflare

---

## 🚀 Início Rápido

### Pré-requisitos
- Node.js 20+ instalado
- PostgreSQL 15+ instalado e configurado
- Git instalado

### Backend
```bash
cd backend
npm install
cp .env.example .env  # Configurar variáveis de ambiente
npm run dev
```

### Frontend - Painel Admin
```bash
cd frontend/painel-admin
npm install
npm run dev
# Acesse: http://localhost:3000
```

### Frontend - Painel Cliente
```bash
cd frontend/painel-cliente
npm install
npm run dev
# Acesse: http://localhost:3001
```

---

## 🔐 Sistema de Permissões

O sistema possui um controle granular de permissões baseado em roles:

- **Master**: Acesso total ao sistema (não pode ser excluído)
- **Proprietário**: Acesso definido por permissões específicas
- **Funcionário**: Acesso definido por permissões específicas

**Documentação completa**: Ver `PASSO_A_PASSO_PERMISSOES.md`

---

## 🗄️ Banco de Dados

### Schema: `protese`

**Tabelas principais:**
- `usuarios_administrativos` - Administradores/Funcionários
- `usuarios_clientes` - Clientes do sistema
- `permissoes_usuarios` - Permissões granulares por módulo
- `controle_acessos` - Logs de acesso/login

**Documentação completa**: Ver `SCHEMA_DATABASE.md`

**Scripts SQL importantes:**
- `COMANDOS_CRIAR_TABELA_PERMISSOES_SIMPLES.sql`
- `COMANDOS_CRIAR_TABELA_CONTROLE_ACESSOS.sql`
- `COMANDOS_ADICIONAR_FUNCIONARIO_RESPONSAVEL.sql`

---

## 📚 Documentação

### Documentação Principal
- [Schema do Banco de Dados](./SCHEMA_DATABASE.md)
- [Roadmap de Desenvolvimento](./ROADMAP_DESENVOLVIMENTO.md)
- [Guia de Permissões](./PASSO_A_PASSO_PERMISSOES.md)

### Documentação de Deploy
- [Comandos Essenciais](./docs/deploy/COMANDOS_ESSENCIAIS.md)
- [Configuração DNS](./docs/deploy/CONFIGURACAO_FINAL_DNS.md)
- [Arquitetura VPS](./docs/deploy/ARQUITETURA_DUAS_VPS.md)
- [Segurança VPS](./docs/deploy/SEGURANCA_VPS.md)

### Frontend
- [README Frontend](./frontend/README.md)
- [README Painel Admin](./frontend/painel-admin/README.md)
- [README Painel Cliente](./frontend/painel-cliente/README.md)

### Backend
- [README Backend](./backend/README.md)

---

## 🌐 URLs de Produção

- **Painel Admin**: https://admin.protesecapilarcuiaba.com.br
- **Painel Cliente**: https://app.protesecapilarcuiaba.com.br
- **Site Público**: https://www.protesecapilarcuiaba.com.br
- **API Backend**: https://api.protesecapilarcuiaba.com.br

---

## 🔧 Variáveis de Ambiente

### Backend (`.env`)
```env
PORT=3001
NODE_ENV=production

DB_HOST=localhost
DB_PORT=5432
DB_NAME=protese_capilar
DB_USER=protese_user
DB_PASSWORD=senha_segura

API_BASE_URL=https://api.protesecapilarcuiaba.com.br
CORS_ORIGINS=https://www.protesecapilarcuiaba.com.br,https://app.protesecapilarcuiaba.com.br,https://admin.protesecapilarcuiaba.com.br,http://localhost:3000,http://localhost:3001,http://localhost:3002
```

---

## 📋 Próximos Passos

Ver documento: `PROXIMOS_PASSOS.md`

**Status Atual**: 
- ✅ Sistema base completo e funcional
- ✅ Autenticação e permissões implementadas
- ✅ CRUD de funcionários e clientes funcionando
- ✅ Controle de acessos e logs implementado
- 🔄 Próximo foco: Sistema de agendamentos e módulos financeiros

---

## 📄 Licença

Projeto privado - Uso comercial

---

*Sistema em desenvolvimento ativo* 🚀
