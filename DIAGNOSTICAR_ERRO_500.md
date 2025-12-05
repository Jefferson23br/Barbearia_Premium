# 🔍 Diagnosticar Erro 500 - API HTTPS

## ⚠️ Problema Identificado

- ✅ SSL funcionando (HTTP/2)
- ✅ OpenLiteSpeed respondendo
- ❌ Erro 500 Internal Server Error

## 🔧 Diagnóstico

### 1. Testar Node.js Diretamente

```bash
# Verificar se Node.js está rodando
curl http://127.0.0.1:3001/health

# Ver processos Node.js
ps aux | grep node | grep 3001

# Verificar PM2
pm2 list
pm2 logs api-protese-capilar --lines 20
```

### 2. Ver Logs do OpenLiteSpeed

```bash
# Ver logs de erro do OpenLiteSpeed
sudo tail -50 /usr/local/lsws/logs/error.log

# Ver logs de acesso
sudo tail -50 /usr/local/lsws/logs/access.log | grep api
```

### 3. Verificar Configuração do Proxy

```bash
# Ver configuração do handler
sudo grep -A 10 "api-node" /usr/local/lsws/conf/httpd_config.conf

# Ver configuração do vHost
sudo cat /usr/local/lsws/conf/vhosts/api.protesecapilarcuiaba.com.br/vhconf.conf
```

---

**Execute os comandos e me envie os resultados!**

