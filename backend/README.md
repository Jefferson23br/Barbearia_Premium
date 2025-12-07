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

## 📁 Estrutura

```
backend/
├── server.js           # Servidor Express principal
├── scripts/            # Scripts auxiliares
└── README.md
```

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

Ver documentação completa: `../SCHEMA_DATABASE.md`

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

---

**Última atualização**: Dezembro 2024
