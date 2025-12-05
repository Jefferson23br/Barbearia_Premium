# 🔧 Corrigir Handler OpenLiteSpeed - Erro 500

## ⚠️ Problema

```
Proxy target is not defined on external application list, please add a 'web server' with name '127.0.0.1:3001'
```

## ✅ Solução

### 1. Recarregar OpenLiteSpeed

```bash
sudo systemctl reload lsws
```

### 2. Se não funcionar, verificar configuração

```bash
# Ver handler
sudo grep -A 10 "api-node" /usr/local/lsws/conf/httpd_config.conf

# Ver vHost
sudo cat /usr/local/lsws/conf/vhosts/api.protesecapilarcuiaba.com.br/vhconf.conf
```

### 3. Reiniciar se necessário

```bash
sudo systemctl restart lsws
```

---

**Execute e me diga o resultado!**

