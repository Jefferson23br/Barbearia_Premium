# 🔍 Verificar vHost da API no OpenLiteSpeed

## 📋 Comandos para Executar

Execute estes comandos na VPS para verificarmos se já existe configuração para a API:

```bash
# 1. Ver todos os vHosts do OpenLiteSpeed
sudo ls -la /usr/local/lsws/conf/vhosts/

# 2. Verificar se existe vHost para API
sudo ls -la /usr/local/lsws/conf/vhosts/ | grep api

# 3. Procurar configuração da API nos arquivos
sudo grep -r "api.protesecapilarcuiaba.com.br" /usr/local/lsws/conf/ 2>/dev/null

# 4. Ver configuração do OpenLiteSpeed principal
sudo grep -i "api" /usr/local/lsws/conf/httpd_config.conf | head -10
```

---

## 🎯 Após Executar

Me envie os resultados e vamos decidir a melhor estratégia!

---

**Execute os comandos e me envie os resultados!** 🚀

