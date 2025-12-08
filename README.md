# 💈 Sistema Prótese Capilar - Prótese Capilar Cuiabá

Sistema completo de gestão para clínica de prótese capilar desenvolvido com tecnologias modernas.

> **Status**: ✅ Sistema base completo e em produção  
> **Última atualização**: Dezembro 2024

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
├── backend/                     # ⚙️ API Backend (Estrutura Modular)
│   ├── server.js               # Servidor Express central
│   ├── config/                 # Configurações (database, cors, multer)
│   ├── routes/                 # Rotas modulares por funcionalidade
│   ├── middlewares/            # Middlewares customizados
│   ├── utils/                  # Utilitários (logger, etc)
│   └── README.md
│
├── docs/                        # 📚 Documentação
│   ├── deploy/                 # Documentação de deploy
│   ├── SISTEMA_LOGS.md         # Documentação de logs (consolidada)
│   ├── HISTORICO_IMPLEMENTACOES.md  # Histórico completo
│   ├── ARQUIVOS_PROJETO.md     # Estrutura de arquivos
│   └── SEO_GUIA.md            # Guia de SEO
│
├── scripts/                     # 🔧 Scripts de configuração VPS
│   ├── setup-vps.sh           # Setup completo
│   ├── configurar-postgres.sh # Configurar PostgreSQL
│   └── templates-nginx/        # Templates Nginx
│
└── [Scripts SQL na raiz]       # Scripts SQL de criação/correção
```
```

---

## 🎯 Status do Projeto

### ✅ Funcionalidades Implementadas e em Produção

#### 🔐 Autenticação e Segurança
- ✅ Login de clientes (`POST /api/v1/auth/login`)
- ✅ Login de administradores (`POST /api/v1/auth/admin/login`)
- ✅ Senhas hasheadas com bcrypt
- ✅ Validação de contas ativas/inativas
- ✅ CORS configurado para múltiplas origens
- ✅ Headers customizados (`x-user-id`, `x-user-tipo`)

#### 👥 Gerenciamento de Usuários

**Painel Administrativo:**
- ✅ **Gerenciamento de Funcionários** (`/dashboard/funcionarios`)
  - CRUD completo (criar, ler, atualizar, excluir)
  - Upload de foto de perfil
  - Busca por CPF, nome ou email
  - Filtro de Master (só Master vê Master)
  - Botão mostrar/ocultar senha
  - Layout responsivo
  - Logs de ações

- ✅ **Gerenciamento de Clientes** (`/dashboard/usuarios`)
  - CRUD completo
  - Upload de foto de perfil
  - Campo "Funcionário Responsável"
  - Busca unificada por CPF, nome ou email
  - Botão mostrar/ocultar senha
  - Layout responsivo
  - Cache control (dados sempre atualizados)
  - Logs detalhados de ações

**Painel Cliente:**
- ✅ Sistema de login e autenticação
- ✅ Dashboard básico
- ✅ Cadastro de cliente

#### 🔐 Sistema de Permissões (RBAC)

**Status**: ✅ **Completo e Funcionando**

- ✅ Permissões granulares por módulo
- ✅ Interface de gerenciamento (`/dashboard/controle-permissoes`)
- ✅ Controle de acesso no sidebar (itens aparecem/desaparecem)
- ✅ Controle de acesso em botões (editar/excluir)
- ✅ Tipos de usuário: Master, Proprietário, Funcionário
- ✅ Proteção: Master não pode ser excluído, só Master vê Master

**Módulos com Permissões:**
- Dashboard, Agenda, Lançamento de Venda/Despesa
- Receitas, Despesas, Faturamento
- Usuários, Funcionários
- Controle de Acessos, Controle de Logs, Help Desk
- Controle de Permissões (Master apenas)

#### 📊 Controle de Acessos

**Status**: ✅ **Completo e Funcionando**

- ✅ Dashboard de estatísticas (`/dashboard/controle-acessos`)
- ✅ Logs de login automáticos
- ✅ Filtros por data e funcionário responsável
- ✅ Estatísticas: total de usuários, logins, por tipo, por dia
- ✅ Visualização de funcionário responsável por cliente

#### 📋 Controle de Logs do Sistema

**Status**: ✅ **Completo e Funcionando**

- ✅ Middleware automático de logging (`backend/middlewares/apiLogger.js`)
- ✅ Logs manuais em endpoints específicos
- ✅ Interface de visualização (`/dashboard/controle-logs`)
- ✅ Filtros avançados (data, módulo, ação, usuário, status)
- ✅ Exibição de dados anteriores e novos (JSON)
- ✅ Normalização automática de tipos (`master` → `administrativo`)
- ✅ Remoção de campos sensíveis (senhas)

#### 🎨 Interface e UX

- ✅ Favicon/Logo em todas as páginas (3 frontends)
- ✅ Layout responsivo em todas as páginas
- ✅ Botão mostrar/ocultar senha em todos os formulários
- ✅ Animações suaves (Framer Motion)
- ✅ Componentes shadcn/ui (Radix UI)
- ✅ Design system consistente
- ✅ Sidebar colapsável
- ✅ Feedback visual (loading, sucesso, erro)

#### Backend (`backend/`)

**Status**: ✅ **Completo e Funcionando**

- ✅ API REST completa (~21 endpoints)
- ✅ Autenticação de clientes e administradores
- ✅ CRUD de funcionários (5 endpoints)
- ✅ CRUD de clientes (5 endpoints)
- ✅ Sistema de permissões (2 endpoints)
- ✅ Controle de acessos (2 endpoints)
- ✅ Sistema de logs (3 endpoints)
- ✅ Upload de fotos de perfil (Multer)
- ✅ Integração com PostgreSQL
- ✅ Middleware de logging automático
- ✅ Health checks

#### 🗄️ Banco de Dados

**Schema**: `protese`

**Tabelas Implementadas:**
- ✅ `usuarios_administrativos` - Administradores/Funcionários
- ✅ `usuarios_clientes` - Clientes
- ✅ `permissoes_usuarios` - Permissões granulares
- ✅ `controle_acessos` - Logs de login
- ✅ `logs_sistema` - Logs de ações do sistema

**Relacionamentos:**
- ✅ `funcionario_responsavel_id` em `usuarios_clientes` (FK)
- ✅ 1:1 entre `usuarios_administrativos` e `permissoes_usuarios`

---

## 🛠️ Stack Tecnológica Completa

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Linguagem**: TypeScript
- **Estilização**: Tailwind CSS
- **Componentes UI**: Radix UI (shadcn/ui)
- **Animações**: Framer Motion
- **Ícones**: Lucide React
- **Formulários**: React Hook Form
- **Validação**: Validação customizada
- **Gerenciamento de Estado**: React Hooks (useState, useEffect)
- **Armazenamento Local**: localStorage

**Projetos Frontend:**
- `painel-admin` - Painel Administrativo (Porta 3000, Produção)
- `painel-cliente` - Painel do Cliente (Porta 3001, Produção)
- `site-entrada` - Site Público (Porta 3002, Desenvolvimento)

### Backend
- **Runtime**: Node.js 20 LTS
- **Framework**: Express.js
- **Linguagem**: JavaScript
- **Banco de Dados**: PostgreSQL 15+
- **Autenticação**: bcrypt (hash de senhas, 10 rounds)
- **Upload**: Multer (5MB, apenas imagens)
- **CORS**: express-cors (múltiplas origens)
- **Variáveis de Ambiente**: dotenv
- **Logging**: Sistema customizado com middleware automático

**Estrutura Modular:**
- `server.js` - Servidor Express central (98 linhas)
- `config/` - Configurações compartilhadas (database, cors, multer)
- `routes/` - Rotas modulares organizadas por funcionalidade:
  - `clientes.js` - CRUD de clientes
  - `funcionarios.js` - CRUD de funcionários
  - `auth.js` - Autenticação
  - `permissoes.js` - Permissões
  - `controle-acessos.js` - Controle de acessos
  - `logs.js` - Sistema de logs
  - `help-desk.js` - Help Desk
- `middlewares/apiLogger.js` - Middleware de logs automático
- `utils/logger.js` - Helper de logs com normalização

### Infraestrutura
- **Hospedagem**: VPS Hostinger (KVM 2)
- **Sistema Operacional**: AlmaLinux 9
- **Painel**: CyberPanel
- **Servidor Web**: Nginx (proxy reverso)
- **Process Manager**: PM2
- **DNS**: Cloudflare
- **SSL**: Certbot (Let's Encrypt)

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

**Documentação completa**: Sistema implementado com permissões granulares por módulo. Ver código em `frontend/painel-admin/src/app/dashboard/controle-permissoes/`

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

## 📚 Documentação Completa

### 📖 Documentação Principal
- **[README Principal](./README.md)** - Este arquivo (visão geral)
- **[Histórico de Implementações](./docs/HISTORICO_IMPLEMENTACOES.md)** - ✅ Tudo que foi feito até agora
- **[Estrutura do Projeto](./docs/ESTRUTURA_PROJETO.md)** - Arquitetura e organização completa
- **[Estrutura de Arquivos](./docs/ARQUIVOS_PROJETO.md)** - Organização do projeto
- **[Sistema de Logs](./docs/SISTEMA_LOGS.md)** - Documentação consolidada de logs

### 🚀 Documentação de Deploy
- **[Comandos Essenciais](./docs/deploy/COMANDOS_ESSENCIAIS.md)** - ⚠️ **NÃO ALTERAR** (usado muito)
- **[README Deploy](./docs/deploy/README.md)** - Visão geral de deploy
- **[Configuração DNS](./docs/deploy/CONFIGURACAO_FINAL_DNS.md)** - Setup de domínios
- **[Arquitetura VPS](./docs/deploy/ARQUITETURA_DUAS_VPS.md)** - Estrutura do servidor
- **[Segurança VPS](./docs/deploy/SEGURANCA_VPS.md)** - Boas práticas de segurança

### 🎨 Frontend
- **[README Frontend](./frontend/README.md)** - Visão geral dos frontends
- **[README Painel Admin](./frontend/painel-admin/README.md)** - Painel administrativo
- **[README Painel Cliente](./frontend/painel-cliente/README.md)** - Painel do cliente

### ⚙️ Backend
- **[README Backend](./backend/README.md)** - Documentação da API
- **[Estrutura Modular](./backend/ESTRUTURA_MODULAR.md)** - Documentação da estrutura modular
- **[Guia de Migração VPS](./backend/GUIA_MIGRACAO_VPS.md)** - Passo a passo para migração

### 🗄️ Scripts SQL
- `COMANDOS_CRIAR_TABELA_PERMISSOES_SIMPLES.sql` - Criar tabela de permissões
- `COMANDOS_CRIAR_TABELA_CONTROLE_ACESSOS.sql` - Criar controle de acessos
- `COMANDOS_ADICIONAR_FUNCIONARIO_RESPONSAVEL.sql` - Adicionar campo funcionário responsável
- `COMANDOS_CRIAR_TABELA_LOGS_SISTEMA.sql` - Criar tabela de logs
- `CORRIGIR_TABELA_LOGS_SISTEMA.sql` - Correções na tabela de logs
- `ATUALIZAR_CHECK_CONSTRAINT_LOGS.sql` - Atualizar constraint

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

## 📊 Estatísticas do Projeto

- **Endpoints API**: ~30 endpoints implementados
- **Módulos Backend**: 8 módulos modulares
- **Páginas Frontend**: 15+ páginas principais
- **Tabelas no Banco**: 8 tabelas principais
- **Linhas de Código Backend**: ~2.000 linhas (modularizado)
- **Componentes UI**: 48 componentes shadcn/ui
- **Módulos Implementados**: 8 módulos completos

---

## 📋 Próximos Passos

**Status Atual**: ✅ Sistema base completo e funcional com estrutura modular

**Última Implementação (Dezembro 2024):**
- ✅ **Refatoração Backend**: Estrutura modular implementada
  - Backend reorganizado em módulos independentes
  - Facilita manutenção e escalabilidade
  - Documentação completa criada

**Foco Atual:**
- 🔄 Sistema de agendamentos
- 🔄 Módulos financeiros (vendas, despesas, receitas)
- 🔄 Faturamento
- 🔄 Melhorias no Help Desk

**Funcionalidades Planejadas:**
- Sistema de agendamentos (visualizar, criar, editar, cancelar)
- Lançamento de vendas e despesas
- Relatórios financeiros (gráficos, filtros, exportação)
- Faturamento (geração, envio, controle de pagamentos)
- Melhorias no Help Desk (notificações, templates)

---

## 🎯 Módulos do Sistema

### ✅ Implementados e Funcionando
1. **Autenticação** - Login cliente e admin
2. **Gerenciamento de Funcionários** - CRUD completo
3. **Gerenciamento de Clientes** - CRUD completo
4. **Sistema de Permissões** - RBAC granular
5. **Controle de Acessos** - Logs de login
6. **Controle de Logs** - Sistema de auditoria completo
7. **Help Desk** - Sistema completo de tickets
8. **Estrutura Modular Backend** - Arquitetura modular implementada

### 🔄 Estrutura Criada (Aguardando Implementação)
9. **Agenda** - Estrutura básica
10. **Lançamento de Venda** - Planejado
11. **Lançamento de Despesa** - Planejado
12. **Receitas/Despesas** - Planejado
13. **Faturamento** - Planejado

---

---

## 🧹 Organização do Projeto

O projeto está organizado com:
- ✅ Estrutura modular no backend
- ✅ Documentação consolidada
- ✅ Arquivos temporários removidos
- ✅ READMEs atualizados

**Ver detalhes**: [Estrutura do Projeto](./docs/ESTRUTURA_PROJETO.md) e [Estrutura de Arquivos](./docs/ARQUIVOS_PROJETO.md)

---

## 📄 Licença

Projeto privado - Uso comercial

---

*Sistema em desenvolvimento ativo* 🚀
