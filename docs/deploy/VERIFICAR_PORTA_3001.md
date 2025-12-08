# 🔍 Verificar e Corrigir Porta 3001

Guia para verificar por que localhost:3001 não está funcionando.

---

## 🔍 PASSO 1: Verificar se server.js está usando PORT do .env

```bash
cd /home/cyberpanel/app/backend
grep -n "PORT\|listen" server.js | head -10
```

**Deve conter algo como:**

```javascript
const PORT = process.env.PORT || 3001;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✓ Servidor rodando na porta ${PORT}`);
});
```

---

## 🔍 PASSO 2: Verificar se PM2 está carregando .env

O PM2 **NÃO carrega automaticamente** o arquivo `.env`! Você precisa:

### Opção A: Usar --update-env ao reiniciar

```bash
pm2 restart api-protese-capilar --update-env
```

### Opção B: Usar dotenv no server.js

Verificar se o `server.js` tem no início:

```javascript
require('dotenv').config();
```

**Se não tiver, adicionar na primeira linha:**

```bash
cd /home/cyberpanel/app/backend
nano server.js
```

**Adicionar no topo (primeira linha):**

```javascript
require('dotenv').config();
```

---

## 🔍 PASSO 3: Verificar se dotenv está instalado

```bash
cd /home/cyberpanel/app/backend
npm list dotenv
```

**Se não estiver instalado:**

```bash
npm install dotenv
```

---

## 🔍 PASSO 4: Verificar Logs do PM2

```bash
pm2 logs api-protese-capilar --lines 20
```

**Procurar por:**
- `✓ Servidor rodando na porta 3001` ✅
- Ou `Servidor rodando na porta 3001` ✅

**Se aparecer porta diferente ou erro, há problema.**

---

## 🔍 PASSO 5: Testar se porta está escutando

```bash
# Verificar se porta está em uso
sudo netstat -tlnp | grep 3001

# Deve mostrar algo como:
# tcp  0  0  0.0.0.0:3001  0.0.0.0:*  LISTEN  530957/node
```

**Se não aparecer nada, a porta não está sendo usada.**

---

## ✅ SOLUÇÃO COMPLETA

### 1. Verificar dotenv no server.js

```bash
cd /home/cyberpanel/app/backend
head -5 server.js
```

**Deve começar com:**

```javascript
require('dotenv').config();
const express = require('express');
// ...
```

### 2. Se não tiver, adicionar:

```bash
# Fazer backup
cp server.js server.js.backup

# Adicionar dotenv no início
sed -i '1i require("dotenv").config();' server.js
```

### 3. Verificar se dotenv está instalado:

```bash
npm list dotenv || npm install dotenv
```

### 4. Reiniciar PM2:

```bash
pm2 restart api-protese-capilar --update-env
```

### 5. Verificar logs:

```bash
pm2 logs api-protese-capilar --lines 10
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

## 🆘 Se Ainda Não Funcionar

### Verificar se o processo está realmente rodando:

```bash
ps aux | grep "node.*server.js"
```

### Verificar variáveis de ambiente do processo:

```bash
pm2 env 0
# Ou
pm2 describe api-protese-capilar | grep -A 20 "env:"
```

### Testar manualmente (fora do PM2):

```bash
cd /home/cyberpanel/app/backend
node server.js
```

**Se funcionar manualmente mas não no PM2, o problema é no PM2.**

---

## 📋 Checklist Rápido

```bash
# 1. Verificar dotenv no server.js
head -1 /home/cyberpanel/app/backend/server.js

# 2. Verificar se dotenv está instalado
cd /home/cyberpanel/app/backend && npm list dotenv

# 3. Reiniciar com --update-env
pm2 restart api-protese-capilar --update-env

# 4. Ver logs
pm2 logs api-protese-capilar --lines 10 | grep -i port

# 5. Testar
curl http://localhost:3001/health
```

---

**Última atualização**: Dezembro 2024

