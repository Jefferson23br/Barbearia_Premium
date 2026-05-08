# 🚨 Diagnóstico e Recuperação - API Caiu

Guia rápido para diagnosticar e recuperar quando a API `api6.auctusconsultoria.com.br` cai.

---

## 🔍 PASSO 1: Conectar na VPS

```bash
ssh root@82.25.65.201
```

---

## 🔍 PASSO 2: Verificar Status do PM2

```bash
# Ver status de todos os processos
pm2 status

# Ver logs da API
pm2 logs api-barbearia-premium --lines 50

# Ver logs de erro
pm2 logs api-barbearia-premium --err --lines 50
```

**Se o processo não estiver rodando:**
```bash
# Verificar se existe
pm2 list

# Se não existir, verificar se o arquivo server.js existe
cd /home/cyberpanel/app/backend
ls -la server.js
```

---

## 🔄 PASSO 3: Reiniciar a API

### Opção A: Se o processo existe mas está parado

```bash
# Iniciar
pm2 start api-barbearia-premium

# Ou reiniciar
pm2 restart api-barbearia-premium

# Salvar configuração
pm2 save
```

### Opção B: Se o processo não existe

```bash
# Navegar para pasta do backend
cd /home/cyberpanel/app/backend

# Verificar se server.js existe
ls -la server.js

# Iniciar manualmente
pm2 start server.js --name api-barbearia-premium

# Salvar
pm2 save
```

---

## 🔍 PASSO 4: Verificar Porta 3001

```bash
# Ver se a porta está em uso
sudo netstat -tlnp | grep 3001

# Ou
sudo ss -tlnp | grep 3001

# Testar se a API responde localmente
curl http://localhost:3001/health
curl http://localhost:3001/api/test-db
```

**Se não responder:**
- Verificar logs do PM2 para erros
- Verificar se o banco de dados está acessível

---

## 🗄️ PASSO 5: Verificar Banco de Dados

```bash
# Verificar se PostgreSQL está rodando
sudo systemctl status postgresql-15

# Se não estiver rodando, iniciar
sudo systemctl start postgresql-15
sudo systemctl enable postgresql-15

# Testar conexão
psql -h localhost -U protese_user -d protese_capilar -c "SELECT 1;"
```

---

## 🌐 PASSO 6: Verificar OpenLiteSpeed

```bash
# Ver status do OpenLiteSpeed
sudo systemctl status lsws

# Se não estiver rodando, iniciar
sudo systemctl start lsws
sudo systemctl enable lsws

# Ver logs
sudo tail -f /usr/local/lsws/logs/error.log
```

---

## 🔥 PASSO 7: Verificar Firewall

```bash
# Ver regras ativas
sudo firewall-cmd --list-all

# Verificar se porta 3001 está aberta
sudo firewall-cmd --query-port=3001/tcp

# Se não estiver, adicionar
sudo firewall-cmd --permanent --add-port=3001/tcp
sudo firewall-cmd --reload
```

---

## 📊 PASSO 8: Verificar Recursos do Sistema

```bash
# Ver uso de memória
free -h

# Ver espaço em disco
df -h

# Ver processos consumindo mais recursos
top
# Ou
htop
```

**Se memória ou disco estiverem cheios:**
- Limpar logs antigos do PM2: `pm2 flush`
- Limpar espaço em disco
- Reiniciar a VPS se necessário

---

## 🔍 PASSO 9: Verificar Variáveis de Ambiente

```bash
cd /home/cyberpanel/app/backend

# Verificar se .env existe
ls -la .env

# Ver conteúdo (sem mostrar senha completa)
cat .env | grep -v PASSWORD
```

**Se .env não existir ou estiver incorreto:**
- Recriar o arquivo .env com as variáveis corretas
- Reiniciar o PM2 após atualizar: `pm2 restart api-barbearia-premium --update-env`

---

## 🔄 PASSO 10: Reiniciar Tudo (Último Recurso)

```bash
# Parar tudo
pm2 stop api-barbearia-premium
sudo systemctl stop lsws

# Iniciar serviços na ordem
sudo systemctl start postgresql-15
sudo systemctl start lsws
pm2 start api-barbearia-premium

# Verificar status
pm2 status
sudo systemctl status lsws
sudo systemctl status postgresql-15
```

---

## 🧪 PASSO 11: Testar API

### Localmente (na VPS)
```bash
curl http://localhost:3001/health
curl http://localhost:3001/api/test-db
```

### Externamente (do seu computador)
```bash
curl https://api6.auctusconsultoria.com.br/health
curl https://api6.auctusconsultoria.com.br/api/test-db
```

---

## 📝 Checklist Rápido

Execute estes comandos em sequência:

```bash
# 1. Conectar
ssh root@82.25.65.201

# 2. Verificar PM2
pm2 status
pm2 logs api-barbearia-premium --lines 20

# 3. Reiniciar API
cd /home/cyberpanel/app/backend
pm2 restart api-barbearia-premium

# 4. Verificar serviços
sudo systemctl status postgresql-15
sudo systemctl status lsws

# 5. Testar
curl http://localhost:3001/health
```

---

## 🆘 Problemas Comuns

### Erro: "Cannot find module"
```bash
cd /home/cyberpanel/app/backend
npm install
pm2 restart api-barbearia-premium
```

### Erro: "Port 3001 already in use"
```bash
# Encontrar processo usando a porta
sudo lsof -i :3001
# Matar processo (substituir PID)
sudo kill -9 PID
# Reiniciar PM2
pm2 restart api-barbearia-premium
```

### Erro: "ECONNREFUSED" (banco de dados)
```bash
# Verificar PostgreSQL
sudo systemctl status postgresql-15
sudo systemctl start postgresql-15
```

### Erro: "EADDRINUSE" (porta em uso)
```bash
# Verificar processos na porta
sudo netstat -tlnp | grep 3001
# Parar PM2 e reiniciar
pm2 stop all
pm2 start api-barbearia-premium
```

---

## 📞 Informações Importantes

- **IP VPS**: 82.25.65.201
- **Caminho Backend**: `/home/cyberpanel/app/backend`
- **Nome PM2**: `api-barbearia-premium`
- **Porta API**: 3001
- **Domínio**: api6.auctusconsultoria.com.br

---

## ⚠️ Se API Reiniciou Muitas Vezes

Se você vê **↺ 16** (ou muitos restarts), isso indica instabilidade:

1. **Ver logs de erro**: `pm2 logs api-barbearia-premium --err --lines 100`
2. **Verificar memória**: `pm2 monit` ou `free -h`
3. **Configurar limites**: Ver guia [PREVENIR_QUEDAS_API.md](./PREVENIR_QUEDAS_API.md)

**Guia completo de prevenção**: [PREVENIR_QUEDAS_API.md](./PREVENIR_QUEDAS_API.md)

---

**Última atualização**: Dezembro 2025

