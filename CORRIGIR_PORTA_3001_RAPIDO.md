# 🚨 CORRIGIR PORTA 3001 - Comandos Rápidos

O `.env` está correto, mas o PM2 pode não estar carregando. Execute estes comandos:

---

## ✅ SOLUÇÃO RÁPIDA

### 1. Verificar se server.js tem dotenv

```bash
cd /home/cyberpanel/app/backend
head -3 server.js
```

**Deve começar com:**
```javascript
require('dotenv').config();
```

### 2. Se NÃO tiver, adicionar:

```bash
# Fazer backup
cp server.js server.js.backup

# Adicionar dotenv na primeira linha
sed -i '1i require("dotenv").config();' server.js
```

### 3. Verificar se dotenv está instalado:

```bash
npm list dotenv
```

**Se não estiver:**
```bash
npm install dotenv
```

### 4. Reiniciar PM2 com --update-env:

```bash
pm2 restart api-protese-capilar --update-env
```

### 5. Verificar logs:

```bash
pm2 logs api-protese-capilar --lines 5
```

**Deve aparecer:**
```
✓ Servidor rodando na porta 3001
```

### 6. Testar:

```bash
curl http://localhost:3001/health
```

---

## 🔍 Verificar se Funcionou

```bash
# Ver se porta está escutando
sudo netstat -tlnp | grep 3001

# Deve mostrar:
# tcp  0  0  0.0.0.0:3001  0.0.0.0:*  LISTEN  [PID]/node
```

---

## 📋 Comandos em Sequência (Copiar e Colar)

```bash
cd /home/cyberpanel/app/backend
head -3 server.js
npm list dotenv || npm install dotenv
pm2 restart api-protese-capilar --update-env
sleep 2
pm2 logs api-protese-capilar --lines 5 | grep -i port
curl http://localhost:3001/health
```

---

**Execute estes comandos na VPS!**

