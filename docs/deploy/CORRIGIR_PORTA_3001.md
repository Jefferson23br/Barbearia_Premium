# 🔧 Corrigir Porta 3001 - Backend

Guia para corrigir a configuração da porta 3001 no backend.

---

## 🔍 Problema

A porta localhost:3001 não está funcionando, provavelmente porque:
- A porta não está configurada no `.env`
- O servidor não está escutando na porta correta
- Há conflito de porta

---

## ✅ SOLUÇÃO 1: Verificar e Corrigir .env

### Na VPS, editar o arquivo .env:

```bash
cd /home/cyberpanel/app/backend
nano .env
```

### Verificar se contém:

```env
PORT=3001
NODE_ENV=production

DB_HOST=localhost
DB_PORT=5432
DB_NAME=protese_capilar
DB_USER=protese_user
DB_PASSWORD=AppProtese@2025!

API_BASE_URL=https://api.protesecapilarcuiaba.com.br
CORS_ORIGINS=https://www.protesecapilarcuiaba.com.br,https://app.protesecapilarcuiaba.com.br,https://admin.protesecapilarcuiaba.com.br,http://localhost:3000,http://localhost:3001,http://localhost:3002
```

**Importante**: A linha `PORT=3001` deve estar presente!

---

## ✅ SOLUÇÃO 2: Verificar server.js

### Verificar se o server.js está usando a variável PORT:

```bash
cd /home/cyberpanel/app/backend
grep -n "PORT\|listen" server.js | head -5
```

**Deve conter algo como:**

```javascript
const PORT = process.env.PORT || 3001;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✓ Servidor rodando na porta ${PORT}`);
});
```

---

## ✅ SOLUÇÃO 3: Reiniciar com Variáveis Atualizadas

Após editar o `.env`, reiniciar o PM2 com `--update-env`:

```bash
# Parar
pm2 stop api-protese-capilar

# Reiniciar com variáveis atualizadas
pm2 restart api-protese-capilar --update-env

# Ou deletar e recriar
pm2 delete api-protese-capilar
cd /home/cyberpanel/app/backend
pm2 start server.js --name api-protese-capilar --update-env
pm2 save
```

---

## ✅ SOLUÇÃO 4: Verificar se Porta Está em Uso

```bash
# Verificar se porta 3001 está em uso
sudo netstat -tlnp | grep 3001
sudo ss -tlnp | grep 3001

# Se estiver em uso por outro processo, matar:
sudo lsof -i :3001
# Anotar o PID e matar:
sudo kill -9 PID
```

---

## ✅ SOLUÇÃO 5: Testar Localmente

```bash
# Testar se API responde
curl http://localhost:3001/health

# Se não responder, verificar logs
pm2 logs api-protese-capilar --lines 20
```

---

## 📋 Checklist Rápido

```bash
# 1. Verificar .env
cat /home/cyberpanel/app/backend/.env | grep PORT

# 2. Verificar server.js
grep "PORT\|listen" /home/cyberpanel/app/backend/server.js

# 3. Reiniciar com --update-env
pm2 restart api-protese-capilar --update-env

# 4. Testar
curl http://localhost:3001/health
```

---

## 🔍 Verificar Logs do PM2

```bash
# Ver logs de inicialização
pm2 logs api-protese-capilar --lines 50

# Procurar por mensagem de porta
pm2 logs api-protese-capilar | grep -i "port\|3001"
```

**Deve aparecer algo como:**
```
✓ Servidor rodando na porta 3001
```

---

## 🆘 Se Ainda Não Funcionar

### Verificar se o processo está rodando:

```bash
pm2 status
ps aux | grep node
```

### Verificar firewall:

```bash
sudo firewall-cmd --query-port=3001/tcp
# Se retornar "no", adicionar:
sudo firewall-cmd --permanent --add-port=3001/tcp
sudo firewall-cmd --reload
```

### Verificar se o servidor está escutando:

```bash
# Deve mostrar algo como:
# tcp 0 0 0.0.0.0:3001 0.0.0.0:* LISTEN
sudo netstat -tlnp | grep 3001
```

---

**Última atualização**: Dezembro 2024


