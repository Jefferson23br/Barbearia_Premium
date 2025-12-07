# 🔍 Troubleshooting - Erro 404 no Login Admin

## 🔴 Problema Persistente

Mesmo após atualizar o `server.js` e reiniciar o PM2, o erro 404 continua.

---

## 🔍 Diagnóstico Passo a Passo

### 1. Verificar se o Arquivo Foi Atualizado na VPS

Conecte-se na VPS e verifique:

```bash
ssh root@82.25.65.201
cd /home/cyberpanel/app/backend

# Verificar se o endpoint existe no arquivo
grep -n "auth/admin/login" server.js
```

**Deve mostrar:**
```
340:app.post('/api/v1/auth/admin/login', async (req, res) => {
```

Se não aparecer, o arquivo não foi atualizado.

---

### 2. Verificar se o PM2 Está Rodando o Arquivo Correto

```bash
# Ver qual arquivo o PM2 está executando
pm2 list
pm2 info api-protese-capilar

# Verificar o caminho do script
pm2 describe api-protese-capilar | grep script
```

---

### 3. Verificar Logs do PM2 para Erros

```bash
# Ver logs completos
pm2 logs api-protese-capilar --lines 50

# Ver erros
pm2 logs api-protese-capilar --err --lines 50
```

**Procure por:**
- Erros de sintaxe
- Erros ao iniciar
- Erros de conexão com banco

---

### 4. Verificar se o Servidor Está Escutando na Porta Correta

```bash
# Verificar se a porta 3001 está em uso
netstat -tlnp | grep 3001

# Ou
ss -tlnp | grep 3001
```

**Deve mostrar que o Node.js está escutando na porta 3001.**

---

### 5. Testar o Endpoint Diretamente na Porta 3001

```bash
# Na VPS, testar diretamente
curl -X POST http://localhost:3001/api/v1/auth/admin/login \
  -H "Content-Type: application/json" \
  -d '{"email":"teste@teste.com","senha":"teste"}'
```

**Se funcionar aqui mas não via HTTPS, o problema é no proxy (OpenLiteSpeed/Nginx).**

---

### 6. Verificar Configuração do Proxy (OpenLiteSpeed)

O problema pode estar no proxy não passando as rotas corretamente.

Verifique o vhost do OpenLiteSpeed:

```bash
# Ver configuração do vhost
cat /usr/local/lsws/conf/vhosts/api.protesecapilarcuiaba.com.br/vhconf.conf
```

---

## 🔧 Soluções Possíveis

### Solução 1: Reiniciar OpenLiteSpeed

```bash
# Reiniciar OpenLiteSpeed para recarregar configurações
systemctl restart lshttpd
# Ou
/usr/local/lsws/bin/lswsctrl restart
```

---

### Solução 2: Verificar se o Nginx Está Configurado Corretamente

Se estiver usando Nginx como proxy:

```bash
# Ver configuração do Nginx
cat /etc/nginx/conf.d/api.conf

# Testar configuração
nginx -t

# Reiniciar Nginx
systemctl restart nginx
```

---

### Solução 3: Parar e Iniciar o PM2 Completamente

```bash
# Parar completamente
pm2 stop api-protese-capilar
pm2 delete api-protese-capilar

# Verificar se o arquivo está correto
cd /home/cyberpanel/app/backend
cat server.js | grep "auth/admin/login"

# Iniciar novamente
pm2 start server.js --name api-protese-capilar
pm2 save
```

---

### Solução 4: Testar Localmente na VPS

```bash
# Parar PM2 temporariamente
pm2 stop api-protese-capilar

# Rodar manualmente para ver erros
cd /home/cyberpanel/app/backend
node server.js
```

Pressione Ctrl+C após testar.

---

## 🎯 Verificação Final

### Checklist:

- [ ] Arquivo `server.js` tem o endpoint (linha ~340)
- [ ] PM2 está rodando o arquivo correto
- [ ] PM2 não mostra erros nos logs
- [ ] Porta 3001 está em uso pelo Node.js
- [ ] Endpoint funciona via `curl localhost:3001`
- [ ] Proxy (OpenLiteSpeed/Nginx) está configurado corretamente

---

## 📝 Comandos Rápidos para Diagnóstico

Execute estes comandos na VPS e me envie os resultados:

```bash
# 1. Verificar endpoint no arquivo
grep -A 5 "auth/admin/login" /home/cyberpanel/app/backend/server.js

# 2. Ver status do PM2
pm2 list

# 3. Ver logs recentes
pm2 logs api-protese-capilar --lines 20

# 4. Testar endpoint localmente
curl -X POST http://localhost:3001/api/v1/auth/admin/login \
  -H "Content-Type: application/json" \
  -d '{"email":"teste","senha":"teste"}'

# 5. Verificar porta
ss -tlnp | grep 3001
```

---

**Execute esses comandos e me mostre os resultados para identificarmos o problema exato!**

