# 🔍 Verificar Configuração do vHost da API

## 📋 Execute Estes Comandos

```bash
# 1. Ver configuração COMPLETA do vHost
sudo cat /usr/local/lsws/conf/vhosts/api.protesecapilarcuiaba.com.br/vhconf.conf

# 2. Ver se handler está no lugar certo
sudo grep -B 5 -A 15 "api-node" /usr/local/lsws/conf/httpd_config.conf

# 3. Ver logs de erro mais recentes
sudo tail -10 /usr/local/lsws/logs/error.log | grep api
```

---

**Execute e me envie os resultados!**

