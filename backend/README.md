# ⚙️ Backend - Sistema Prótese Capilar

API REST desenvolvida com Node.js, Express.js e PostgreSQL.

---

## 🚀 Status

**Status**: ✅ Em Produção  
**URL**: https://api.protesecapilarcuiaba.com.br

---

## 🛠️ Tecnologias

- **Runtime**: Node.js 20 LTS
- **Framework**: Express.js
- **Banco de Dados**: PostgreSQL 15+
- **Autenticação**: bcrypt (hash de senhas)
- **Upload**: Multer
- **CORS**: Configurado para múltiplas origens

---

## 📁 Estrutura Modular

```
backend/
├── server.js           # Servidor Express central (98 linhas)
├── config/             # Configurações compartilhadas
│   ├── database.js    # Configuração PostgreSQL
│   ├── cors.js        # Configuração CORS
│   └── multer.js      # Configuração upload
├── routes/             # Rotas modulares por funcionalidade
│   ├── index.js       # Agrupa todas as rotas
│   ├── clientes.js    # CRUD de clientes
│   ├── funcionarios.js # CRUD de funcionários
│   ├── auth.js        # Autenticação
│   ├── permissoes.js  # Permissões
│   ├── controle-acessos.js # Controle de acessos
│   ├── logs.js        # Sistema de logs
│   └── help-desk.js   # Help Desk
├── middlewares/         # Middlewares customizados
│   └── apiLogger.js   # Middleware de logs automático
├── utils/              # Utilitários
│   ├── logger.js      # Sistema de logs
│   └── logHelper.js   # Helpers de logs
└── README.md
```

**Benefícios da Estrutura Modular:**
- ✅ Manutenibilidade: Cada módulo é independente
- ✅ Escalabilidade: Fácil adicionar novos módulos
- ✅ Organização: Código organizado por funcionalidade
- ✅ Colaboração: Múltiplos desenvolvedores podem trabalhar em paralelo

---

## 🔧 Configuração

### Pré-requisitos
- Node.js 20+
- PostgreSQL 15+
- npm ou yarn

### Instalação

```bash
cd backend
npm install
```

### Variáveis de Ambiente

Criar arquivo `.env` na raiz do backend:

```env
PORT=3001
NODE_ENV=production

DB_HOST=localhost
DB_PORT=5432
DB_NAME=protese_capilar
DB_USER=protese_user
DB_PASSWORD=sua_senha_segura

API_BASE_URL=https://api.protesecapilarcuiaba.com.br
CORS_ORIGINS=https://www.protesecapilarcuiaba.com.br,https://app.protesecapilarcuiaba.com.br,https://admin.protesecapilarcuiaba.com.br,http://localhost:3000,http://localhost:3001,http://localhost:3002
```

---

## 🏃 Executar

### Desenvolvimento

```bash
npm run dev
# ou
node server.js
```

### Produção (PM2)

```bash
pm2 start server.js --name api-protese-capilar
pm2 save
```

---

## 📡 Endpoints Principais

> **Nota**: Todos os endpoints estão organizados em módulos em `routes/`. O `server.js` central apenas inicializa o servidor e registra as rotas.

### Autenticação

- `POST /api/v1/auth/login` - Login de cliente
- `POST /api/v1/auth/admin/login` - Login de administrador

### Funcionários

- `GET /api/v1/funcionarios` - Listar funcionários
- `POST /api/v1/funcionarios` - Criar funcionário
- `GET /api/v1/funcionarios/:id` - Buscar funcionário
- `PUT /api/v1/funcionarios/:id` - Atualizar funcionário
- `DELETE /api/v1/funcionarios/:id` - Excluir funcionário

### Clientes

- `GET /api/v1/clientes` - Listar clientes
- `POST /api/v1/clientes` - Criar cliente
- `GET /api/v1/clientes/:id` - Buscar cliente
- `PUT /api/v1/clientes/:id` - Atualizar cliente
- `DELETE /api/v1/clientes/:id` - Excluir cliente

### Permissões

- `GET /api/v1/permissoes/:usuarioId` - Buscar permissões
- `PUT /api/v1/permissoes/:usuarioId` - Atualizar permissões

### Controle de Acessos

- `GET /api/v1/controle-acessos` - Listar acessos (com filtros)
- `GET /api/v1/controle-acessos/estatisticas` - Estatísticas de acesso

### Logs

- `GET /api/v1/logs` - Listar logs (com filtros)
- `GET /api/v1/logs/estatisticas` - Estatísticas de logs
- `GET /api/v1/logs/:id` - Buscar log específico

### Help Desk

- `GET /api/v1/help-desk/chamados` - Listar chamados
- `POST /api/v1/help-desk/chamados` - Criar chamado
- `GET /api/v1/help-desk/chamados/:id` - Buscar chamado
- `PUT /api/v1/help-desk/chamados/:id` - Atualizar chamado
- `POST /api/v1/help-desk/chamados/:id/respostas` - Adicionar resposta
- `GET /api/v1/help-desk/funcionarios` - Listar funcionários para responsável

### Health Check

- `GET /health` - Status da API
- `GET /api/test-db` - Teste de conexão com banco

---

## 🗄️ Banco de Dados

### Schema: `protese`

**Tabelas principais:**
- `usuarios_administrativos` - Administradores/Funcionários
- `usuarios_clientes` - Clientes
- `permissoes_usuarios` - Permissões granulares
- `controle_acessos` - Logs de login
- `logs_sistema` - Logs de ações do sistema
- `help_desk_chamados` - Chamados do Help Desk
- `help_desk_respostas` - Respostas dos chamados
- `help_desk_anexos` - Anexos dos chamados/respostas

Ver documentação completa: [Estrutura do Projeto](../docs/ESTRUTURA_PROJETO.md)

### Scripts SQL

Scripts para criar tabelas estão na raiz do projeto:
- `COMANDOS_CRIAR_TABELA_PERMISSOES_SIMPLES.sql`
- `COMANDOS_CRIAR_TABELA_CONTROLE_ACESSOS.sql`
- `COMANDOS_ADICIONAR_FUNCIONARIO_RESPONSAVEL.sql`

---

## 📁 Uploads

### Fotos de Perfil

- Diretório: `backend/uploads/fotos/`
- Endpoint: `/uploads/fotos/{filename}`
- Limite: 5MB por arquivo
- Formatos aceitos: Imagens (image/*)

### Anexos Help Desk

- Diretório: `backend/uploads/help-desk/`
- Endpoint: `/uploads/help-desk/{filename}`
- Limite: 10MB por arquivo
- Formatos aceitos: Imagens (image/*) e PDFs (application/pdf)

---

## 🔐 Segurança

- Senhas hasheadas com bcrypt (10 rounds)
- CORS configurado para origens específicas
- Validação de inputs
- Sanitização de dados

**TODOs de Segurança:**
- [ ] Implementar JWT tokens
- [ ] Rate limiting
- [ ] Validação mais robusta
- [ ] Middleware de autenticação nas rotas protegidas

---

## 📊 Logs

### PM2

```bash
pm2 logs api-protese-capilar
pm2 logs api-protese-capilar --lines 100
```

### Nginx

```bash
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

---

## 🐛 Debugging

### Testar conexão com banco

```bash
curl http://localhost:3001/api/test-db
```

### Verificar saúde da API

```bash
curl http://localhost:3001/health
```

### Verificar logs

```bash
# Logs do PM2
pm2 logs api-protese-capilar --lines 50

# Logs do servidor
tail -f /var/log/nodejs/api-protese-capilar.log
```

---

## 🔄 Deploy

### VPS Hostinger (srv842883)

**Localização do código:**
```
/home/backend/
```

**Comandos úteis:**
```bash
# Reiniciar API
pm2 restart api-protese-capilar

# Ver status
pm2 status

# Ver logs
pm2 logs api-protese-capilar

# Parar API
pm2 stop api-protese-capilar

# Iniciar API
pm2 start api-protese-capilar
```

### Atualizar código no servidor

```bash
# No servidor
cd /home/backend
git pull  # se usando git
# ou fazer upload via SCP

# Reiniciar
pm2 restart api-protese-capilar
```

---

## 📚 Scripts Auxiliares

Scripts úteis estão em `scripts/`:
- `configurar-postgres.sh` - Setup inicial do PostgreSQL
- `configurar-ssl-api.sh` - Configurar SSL
- `setup-vps.sh` - Setup completo da VPS
- `verificar-vps-backend.sh` - Verificar status

---

## 📝 Próximas Melhorias

- [ ] Implementar JWT tokens
- [ ] Rate limiting
- [ ] Validação com biblioteca (Joi/Zod)
- [ ] Testes automatizados
- [ ] Documentação Swagger/OpenAPI
- [ ] Cache de queries frequentes
- [ ] Paginação em endpoints de listagem

## 📚 Documentação Adicional

- [Estrutura Modular](./ESTRUTURA_MODULAR.md) - Documentação da estrutura modular
- [Guia de Migração VPS](./GUIA_MIGRACAO_VPS.md) - Passo a passo para migração
- [Resumo da Migração](./RESUMO_MIGRACAO.md) - Resumo rápido

---

**Última atualização**: Dezembro 2024  
**Estrutura**: ✅ Modular (implementada em Dezembro 2024)
