# 📁 Estrutura do Projeto - Sistema Barbearia Premium

Documentação completa da estrutura e organização do projeto.

---

## 🗂️ Estrutura de Diretórios

```
Barbearia_Premium/
│
├── backend/                          # ⚙️ API Backend (Node.js/Express)
│   ├── config/                       # Configurações
│   │   ├── database.js              # Reexport databaseV2 (Oracle produção / PostgreSQL dev)
│   │   ├── cors.js                   # Configuração CORS
│   │   └── multer.js                 # Configuração upload
│   ├── middlewares/                  # Middlewares customizados
│   │   └── apiLogger.js             # Middleware de logs automático
│   ├── routes/                       # Rotas modulares
│   │   ├── index.js                 # Agrupa todas as rotas
│   │   ├── clientes.js               # Rotas de clientes
│   │   ├── funcionarios.js           # Rotas de funcionários
│   │   ├── auth.js                   # Rotas de autenticação
│   │   ├── permissoes.js             # Rotas de permissões
│   │   ├── controle-acessos.js       # Rotas de controle de acessos
│   │   ├── logs.js                   # Rotas de logs
│   │   ├── help-desk.js              # Rotas de Help Desk
│   │   ├── servicos.js               # Rotas de serviços
│   │   ├── configuracoes.js          # Rotas de configurações
│   │   └── integracoes.js            # Rotas de integrações
│   ├── utils/                        # Utilitários
│   │   ├── logger.js                 # Sistema de logs
│   │   └── logHelper.js              # Helpers de logs
│   ├── uploads/                      # Arquivos enviados
│   │   ├── fotos/                    # Fotos de perfil
│   │   └── help-desk/                # Anexos do Help Desk
│   ├── server.js                      # Servidor Express central
│   ├── README.md                     # Documentação do backend
│   ├── ESTRUTURA_MODULAR.md          # Documentação da estrutura modular
│   ├── GUIA_MIGRACAO_VPS.md          # Guia de migração para VPS
│   └── RESUMO_MIGRACAO.md            # Resumo da migração
│
├── frontend/                         # 🎨 Projetos Frontend (Next.js)
│   ├── painel-admin/                 # Painel Administrativo
│   │   ├── src/
│   │   │   ├── app/                  # Páginas (App Router)
│   │   │   │   ├── dashboard/        # Páginas do dashboard
│   │   │   │   ├── layout.tsx        # Layout raiz
│   │   │   │   └── page.tsx          # Página inicial (login)
│   │   │   ├── components/           # Componentes React
│   │   │   │   ├── ui/               # Componentes shadcn/ui
│   │   │   │   └── admin/            # Componentes específicos admin
│   │   │   └── hooks/                # Hooks customizados
│   │   │       └── usePermissions.ts # Hook de permissões
│   │   └── README.md
│   ├── painel-cliente/               # Painel do Cliente
│   │   └── [estrutura similar]
│   ├── site-entrada/                 # Site Público
│   │   └── [estrutura similar]
│   └── README.md                     # Documentação geral frontend
│
├── docs/                             # 📚 Documentação
│   ├── deploy/                       # Documentação de deploy
│   │   ├── COMANDOS_ESSENCIAIS.md    # ⚠️ NÃO ALTERAR
│   │   ├── README.md                 # Visão geral deploy
│   │   └── [outros guias]
│   ├── HISTORICO_IMPLEMENTACOES.md   # Histórico completo
│   ├── SISTEMA_LOGS.md               # Documentação de logs
│   ├── ARQUIVOS_PROJETO.md           # Estrutura de arquivos
│   ├── ESTRUTURA_PROJETO.md          # Este arquivo
│   └── SEO_GUIA.md                   # Guia de SEO
│
├── scripts/                          # 🔧 Scripts de configuração
│   ├── setup-vps.sh                  # Setup completo VPS
│   ├── configurar-postgres.sh        # PostgreSQL (legado / dev opcional)
│   ├── configurar-ssl-api.sh         # Configurar SSL
│   └── templates-nginx/               # Templates Nginx
│
└── [Scripts SQL na raiz]             # Scripts SQL de criação/correção
    ├── COMANDOS_CRIAR_TABELA_LOGS_SISTEMA.sql
    ├── COMANDOS_CRIAR_TABELAS_HELP_DESK.sql
    └── [outros scripts SQL]
```

---

## 🏗️ Arquitetura do Backend

### Estrutura Modular

O backend foi refatorado para uma estrutura modular onde cada funcionalidade tem seu próprio arquivo de rotas:

```
backend/
├── server.js              # Arquivo central (98 linhas)
├── config/                # Configurações compartilhadas
├── routes/                # Rotas organizadas por módulo
├── middlewares/           # Middlewares reutilizáveis
└── utils/                 # Funções utilitárias
```

### Fluxo de Requisição

1. **Requisição chega** → `server.js`
2. **Middlewares aplicados** → CORS, JSON parser, API Logger
3. **Roteamento** → `routes/index.js` → Módulo específico
4. **Processamento** → Módulo processa e retorna resposta
5. **Logging** → Middleware registra automaticamente

---

## 🎨 Arquitetura do Frontend

### Next.js App Router

Cada projeto frontend usa Next.js 14 com App Router:

```
src/app/
├── layout.tsx            # Layout raiz (metadata, providers)
├── page.tsx              # Página inicial
└── dashboard/            # Páginas do dashboard
    ├── layout.tsx        # Layout do dashboard (sidebar, etc)
    ├── page.tsx          # Dashboard principal
    └── [modulo]/
        └── page.tsx      # Páginas de módulos
```

### Componentes

- **UI Components** (`components/ui/`): Componentes shadcn/ui reutilizáveis
- **Admin Components** (`components/admin/`): Componentes específicos do admin
- **Figma Components** (`components/figma/`): Componentes customizados do design

---

## 🗄️ Banco de Dados

### Schema: `protese`

**Tabelas Principais:**
- `usuarios_administrativos` - Administradores/Funcionários
- `usuarios_clientes` - Clientes
- `permissoes_usuarios` - Permissões granulares
- `controle_acessos` - Logs de login
- `logs_sistema` - Logs de ações do sistema
- `help_desk_chamados` - Chamados do Help Desk
- `help_desk_respostas` - Respostas dos chamados
- `help_desk_anexos` - Anexos dos chamados/respostas

**Relacionamentos:**
- `usuarios_clientes.funcionario_responsavel_id` → `usuarios_administrativos.id`
- `permissoes_usuarios.usuario_id` → `usuarios_administrativos.id`
- `help_desk_chamados.funcionario_abriu_id` → `usuarios_administrativos.id`
- `help_desk_chamados.responsavel_id` → `usuarios_administrativos.id`

---

## 📦 Dependências Principais

### Backend
- `express` - Framework web
- `oracledb` - Cliente Oracle (produção quando `ORACLE_*` definido)
- `pg` - Cliente PostgreSQL (fallback em `databaseV2.js` sem Oracle)
- `bcrypt` - Hash de senhas
- `multer` - Upload de arquivos
- `dotenv` - Variáveis de ambiente
- `cors` - CORS middleware

### Frontend
- `next` - Framework React
- `react` - Biblioteca React
- `typescript` - TypeScript
- `tailwindcss` - CSS framework
- `framer-motion` - Animações
- `lucide-react` - Ícones
- `@radix-ui/*` - Componentes UI

---

## 🔐 Segurança

### Backend
- Senhas hasheadas com bcrypt (10 rounds)
- CORS configurado para origens específicas
- Validação de inputs
- Sanitização de dados
- Middleware de logging automático

### Frontend
- Dados sensíveis em localStorage (temporário)
- Validação de formulários
- Proteção de rotas baseada em permissões

**TODOs:**
- [ ] Implementar JWT tokens
- [ ] Rate limiting
- [ ] Middleware de autenticação nas rotas protegidas

---

## 📊 Estatísticas

- **Endpoints API**: ~30 endpoints
- **Módulos Backend**: 8 módulos modulares
- **Páginas Frontend**: 15+ páginas
- **Componentes UI**: 48 componentes shadcn/ui
- **Tabelas no Banco**: 8 tabelas principais
- **Linhas de Código Backend**: ~2.000 linhas (modularizado)

---

## 🚀 URLs de Produção

- **Painel Admin**: https://appbarber.auctusconsultoria.com.br/admin
- **Painel Cliente**: https://appbarber.auctusconsultoria.com.br
- **Site Público**: https://appbarber.auctusconsultoria.com.br
- **API Backend**: https://api6.auctusconsultoria.com.br

---

**Última atualização**: maio de 2026  
**Versão**: 1.10.0

**URLs de Produção:**
- Painel Admin: https://appbarber.auctusconsultoria.com.br/admin
- Painel Cliente: https://appbarber.auctusconsultoria.com.br
- Site Público: https://appbarber.auctusconsultoria.com.br
- API Backend: https://api6.auctusconsultoria.com.br

**Infraestrutura:**
- Backend/API/Banco: VPS 82.25.65.201 (Hostinger)
- Frontend: VPS 45.132.157.28 (Hostinger - conta com domínio liberado)
- Banco de dados: **Oracle** em produção (`ORACLE_*`); PostgreSQL só em dev local sem Oracle




