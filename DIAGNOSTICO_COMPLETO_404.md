# 🔍 Diagnóstico Completo - Erro 404 Login Admin

## 🎯 Problema

O endpoint retorna 404 mesmo após atualizar o `server.js` e reiniciar o PM2.

---

## 📋 Checklist de Diagnóstico

Execute estes comandos na VPS e verifique cada item:

### 1️⃣ Verificar se o Arquivo Foi Atualizado

```bash
ssh root@82.25.65.201
cd /home/cyberpanel/app/backend

# Procurar o endpoint no arquivo
grep -n "auth/admin/login" server.js
```

**Deve mostrar algo como:**
```
340:app.post('/api/v1/auth/admin/login', async (req, res) => {
```

**Se não aparecer nada, o arquivo não foi atualizado.**

---

### 2️⃣ Verificar se o PM2 Está Rodando o Arquivo Correto

```bash
# Ver processo do PM2
pm2 list

# Ver informações detalhadas
pm2 info api-protese-capilar | grep -E "script path|interpreter|cwd"
```

**Verifique se o caminho está correto:**
- Script path deve ser: `/home/cyberpanel/app/backend/server.js`

---

### 3️⃣ Ver Logs do PM2 para Erros

```bash
# Ver todos os logs
pm2 logs api-protese-capilar --lines 50

# Ver apenas erros
pm2 logs api-protese-capilar --err --lines 50
```

**Procure por:**
- `SyntaxError` - Erro de sintaxe no código
- `Cannot find module` - Módulo faltando
- `EADDRINUSE` - Porta já em uso

---

### 4️⃣ Testar o Endpoint Diretamente na Porta 3001

```bash
# Testar localmente na VPS (via porta 3001)
curl -X POST http://localhost:3001/api/v1/auth/admin/login \
  -H "Content-Type: application/json" \
  -d '{"email":"teste@teste.com","senha":"teste123"}'
```

**Se funcionar aqui:**
- ✅ O endpoint existe e está funcionando
- ❌ O problema está no proxy (OpenLiteSpeed/Nginx)

**Se não funcionar:**
- ❌ O problema está no código Node.js ou no PM2

---

### 5️⃣ Verificar se o Servidor Está Escutando

```bash
# Verificar processos na porta 3001
ss -tlnp | grep 3001

# Ou
netstat -tlnp | grep 3001
```

**Deve mostrar:**
```
LISTEN  0  511  0.0.0.0:3001  0.0.0.0:*  users:(("node",pid=XXXXX,fd=XX))
```

---

### 6️⃣ Verificar Configuração do Proxy

O problema pode estar no proxy não encaminhando a rota corretamente.

#### Se usar OpenLiteSpeed:

```bash
# Ver configuração do vhost
cat /usr/local/lsws/conf/vhosts/api.protesecapilarcuiaba.com.br/vhconf.conf

# Ver configuração do extProcessor (handler)
grep -A 10 "api-node" /usr/local/lsws/conf/httpd_config.conf
```

#### Se usar Nginx:

```bash
# Ver configuração
cat /etc/nginx/conf.d/api.conf

# Testar configuração
nginx -t
```

---

## 🔧 Soluções

### Solução 1: Forçar Reinicialização Completa do PM2

```bash
# Parar e deletar o processo
pm2 stop api-protese-capilar
pm2 delete api-protese-capilar

# Verificar se o arquivo está correto ANTES de iniciar
cd /home/cyberpanel/app/backend
grep "auth/admin/login" server.js

# Se não aparecer, o arquivo não foi atualizado!
# Nesse caso, copie novamente ou verifique

# Iniciar novamente
pm2 start server.js --name api-protese-capilar
pm2 save

# Ver logs
pm2 logs api-protese-capilar --lines 20
```

---

### Solução 2: Reiniciar o Proxy

```bash
# Se usar OpenLiteSpeed
systemctl restart lshttpd
# Ou
/usr/local/lsws/bin/lswsctrl restart

# Se usar Nginx
systemctl restart nginx
```

---

### Solução 3: Testar Manualmente (Sem PM2)

```bash
# Parar PM2
pm2 stop api-protese-capilar

# Ir para o diretório
cd /home/cyberpanel/app/backend

# Rodar manualmente
node server.js
```

**Aguarde alguns segundos e teste em outro terminal:**

```bash
# Em outro terminal, testar
curl -X POST http://localhost:3001/api/v1/auth/admin/login \
  -H "Content-Type: application/json" \
  -d '{"email":"teste","senha":"teste"}'
```

**Se funcionar aqui, o problema é com o PM2.**

Pressione `Ctrl+C` para parar o servidor manual.

---

### Solução 4: Verificar Cache do Proxy

Alguns proxies fazem cache de rotas. Tente:

```bash
# Reiniciar tudo
pm2 restart api-protese-capilar
systemctl restart lshttpd  # ou nginx
```

---

## 🎯 Comandos de Diagnóstico Rápido

Execute todos estes comandos e me envie os resultados:

```bash
# 1. Verificar endpoint no arquivo
echo "=== 1. Endpoint no arquivo ==="
grep -n "auth/admin/login" /home/cyberpanel/app/backend/server.js

# 2. Ver status do PM2
echo "=== 2. Status PM2 ==="
pm2 list

# 3. Ver logs recentes
echo "=== 3. Logs PM2 (últimas 20 linhas) ==="
pm2 logs api-protese-capilar --lines 20 --nostream

# 4. Testar endpoint localmente
echo "=== 4. Teste endpoint local ==="
curl -X POST http://localhost:3001/api/v1/auth/admin/login \
  -H "Content-Type: application/json" \
  -d '{"email":"teste","senha":"teste"}' \
  -v

# 5. Verificar porta 3001
echo "=== 5. Processos na porta 3001 ==="
ss -tlnp | grep 3001

# 6. Verificar processo Node
echo "=== 6. Processos Node.js ==="
ps aux | grep node | grep -v grep
```

---

## 📝 Resultados Esperados

### Se o arquivo foi atualizado corretamente:
- Comando 1 deve mostrar: `340:app.post('/api/v1/auth/admin/login'...`

### Se o PM2 está rodando:
- Comando 2 deve mostrar o processo `online`
- Comando 3 não deve mostrar erros

### Se o endpoint funciona:
- Comando 4 deve retornar erro 401 (credenciais inválidas), NÃO 404
- Se retornar 404 aqui, o problema é no código/PM2

---

**Execute esses comandos e me envie os resultados para identificarmos exatamente onde está o problema!**

