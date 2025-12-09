# 🚀 Guia de Migração para Estrutura Modular - VPS

Este guia detalha como migrar o backend do formato monolítico para a estrutura modular na VPS.

---

## 📋 Pré-requisitos

- Acesso SSH à VPS
- Backup do `server.js` atual
- Node.js e PM2 instalados
- PostgreSQL funcionando

---

## 📦 Passo 1: Fazer Backup

```bash
# Conectar na VPS
ssh root@seu-servidor

# Navegar para o diretório do backend
cd /home/cyberpanel/app/backend

# Fazer backup do server.js atual
cp server.js server.js.backup.$(date +%Y%m%d_%H%M%S)

# Verificar se o backup foi criado
ls -la server.js*
```

---

## 📁 Passo 2: Criar Estrutura de Pastas

```bash
# Criar pasta de configurações
mkdir -p config

# Criar pasta de rotas
mkdir -p routes

# Verificar estrutura
ls -la
```

---

## 📝 Passo 3: Criar Arquivos de Configuração

### 3.1. Criar `config/database.js`

```bash
nano config/database.js
```

Cole o conteúdo do arquivo `backend/config/database.js` do projeto local.

### 3.2. Criar `config/cors.js`

```bash
nano config/cors.js
```

Cole o conteúdo do arquivo `backend/config/cors.js` do projeto local.

### 3.3. Criar `config/multer.js`

```bash
nano config/multer.js
```

Cole o conteúdo do arquivo `backend/config/multer.js` do projeto local.

---

## 🛣️ Passo 4: Criar Módulos de Rotas

### 4.1. Criar `routes/clientes.js`

```bash
nano routes/clientes.js
```

Cole o conteúdo do arquivo `backend/routes/clientes.js` do projeto local.

### 4.2. Criar `routes/funcionarios.js`

```bash
nano routes/funcionarios.js
```

Cole o conteúdo do arquivo `backend/routes/funcionarios.js` do projeto local.

### 4.3. Criar `routes/auth.js`

```bash
nano routes/auth.js
```

Cole o conteúdo do arquivo `backend/routes/auth.js` do projeto local.

### 4.4. Criar `routes/permissoes.js`

```bash
nano routes/permissoes.js
```

Cole o conteúdo do arquivo `backend/routes/permissoes.js` do projeto local.

### 4.5. Criar `routes/controle-acessos.js`

```bash
nano routes/controle-acessos.js
```

Cole o conteúdo do arquivo `backend/routes/controle-acessos.js` do projeto local.

### 4.6. Criar `routes/logs.js`

```bash
nano routes/logs.js
```

Cole o conteúdo do arquivo `backend/routes/logs.js` do projeto local.

### 4.7. Criar `routes/help-desk.js`

```bash
nano routes/help-desk.js
```

Cole o conteúdo do arquivo `backend/routes/help-desk.js` do projeto local.

### 4.8. Criar `routes/index.js`

```bash
nano routes/index.js
```

Cole o conteúdo do arquivo `backend/routes/index.js` do projeto local.

---

## 🔧 Passo 5: Atualizar `server.js`

```bash
# Fazer backup do server.js atual
cp server.js server.js.old

# Substituir pelo novo server.js modular
nano server.js
```

Cole o conteúdo do arquivo `backend/server.js` do projeto local (o novo arquivo modular).

---

## ✅ Passo 6: Verificar Estrutura

```bash
# Verificar se todos os arquivos foram criados
tree -L 2
# ou
find . -type f -name "*.js" | sort

# Estrutura esperada:
# backend/
# ├── config/
# │   ├── database.js
# │   ├── cors.js
# │   └── multer.js
# ├── routes/
# │   ├── index.js
# │   ├── clientes.js
# │   ├── funcionarios.js
# │   ├── auth.js
# │   ├── permissoes.js
# │   ├── controle-acessos.js
# │   ├── logs.js
# │   └── help-desk.js
# ├── middlewares/
# │   └── apiLogger.js (já existe)
# ├── utils/
# │   └── logger.js (já existe)
# └── server.js (novo)
```

---

## 🧪 Passo 7: Testar Localmente (Antes de Reiniciar PM2)

```bash
# Verificar sintaxe do Node.js
node -c server.js
node -c config/database.js
node -c config/cors.js
node -c config/multer.js
node -c routes/index.js

# Se algum arquivo tiver erro de sintaxe, corrigir antes de continuar
```

---

## 🔄 Passo 8: Reiniciar PM2

```bash
# Parar o PM2
pm2 stop api-protese-capilar

# Verificar se parou
pm2 status

# Iniciar novamente
pm2 start server.js --name api-protese-capilar

# Verificar logs
pm2 logs api-protese-capilar --lines 50

# Verificar se está rodando
pm2 status
```

---

## 🧪 Passo 9: Testar Endpoints

```bash
# Testar health check
curl http://localhost:3001/health

# Testar conexão com banco
curl http://localhost:3001/api/test-db

# Testar endpoint de clientes (se tiver autenticação, ajustar)
curl http://localhost:3001/api/v1/clientes
```

---

## 🔍 Passo 10: Verificar Logs

```bash
# Ver logs em tempo real
pm2 logs api-protese-capilar

# Ver últimas 100 linhas
pm2 logs api-protese-capilar --lines 100

# Verificar se há erros
pm2 logs api-protese-capilar --err --lines 50
```

---

## ⚠️ Troubleshooting

### Erro: "Cannot find module './config/database'"

**Solução:**
```bash
# Verificar se os arquivos existem
ls -la config/
ls -la routes/

# Verificar se os caminhos estão corretos
pwd
```

### Erro: "EADDRINUSE: address already in use"

**Solução:**
```bash
# Verificar se há outro processo na porta 3001
lsof -i :3001

# Parar todos os processos PM2
pm2 stop all
pm2 delete all

# Reiniciar
pm2 start server.js --name api-protese-capilar
```

### Erro: "Cannot find module 'express'"

**Solução:**
```bash
# Instalar dependências
cd /home/cyberpanel/app/backend
npm install
```

### Erro ao acessar rotas

**Solução:**
```bash
# Verificar se o PM2 está rodando
pm2 status

# Verificar logs de erro
pm2 logs api-protese-capilar --err

# Verificar se o servidor está escutando na porta correta
netstat -tulpn | grep 3001
```

---

## 🔄 Rollback (Se Necessário)

Se algo der errado, você pode voltar ao formato antigo:

```bash
# Parar PM2
pm2 stop api-protese-capilar

# Restaurar backup
cp server.js.backup.* server.js

# Reiniciar PM2
pm2 restart api-protese-capilar
```

---

## ✅ Checklist Final

- [ ] Backup do `server.js` criado
- [ ] Estrutura de pastas criada (`config/`, `routes/`)
- [ ] Todos os arquivos de configuração criados
- [ ] Todos os módulos de rotas criados
- [ ] `server.js` atualizado
- [ ] Sintaxe verificada (sem erros)
- [ ] PM2 reiniciado
- [ ] Health check funcionando
- [ ] Endpoints testados
- [ ] Logs verificados (sem erros)

---

## 📝 Notas Importantes

1. **Ordem de criação**: Crie os arquivos na ordem apresentada
2. **Permissões**: Certifique-se de que os arquivos têm permissão de leitura
3. **Variáveis de ambiente**: O arquivo `.env` deve estar configurado corretamente
4. **Dependências**: Todas as dependências do `package.json` devem estar instaladas
5. **Banco de dados**: As tabelas devem estar criadas (especialmente as do Help Desk)

---

## 🎯 Após a Migração

Após confirmar que tudo está funcionando:

1. Testar todos os endpoints principais
2. Verificar se os logs estão sendo registrados
3. Testar upload de arquivos (fotos e anexos)
4. Verificar permissões e autenticação
5. Monitorar por algumas horas para garantir estabilidade

---

**Última atualização**: Dezembro 2025




