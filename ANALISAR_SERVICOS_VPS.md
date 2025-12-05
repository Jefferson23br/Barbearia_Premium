# 🔍 Análise Completa de Serviços na VPS

## ⚠️ IMPORTANTE: Verificar Antes de Mudar Nada!

Vamos identificar TODOS os serviços rodando para garantir que não vamos quebrar nada.

---

## 📋 PASSO 1: Identificar Todos os Serviços

Execute estes comandos para ver todos os serviços:

```bash
# 1. Ver todos os serviços ativos
sudo systemctl list-units --type=service --state=running | grep -E "nginx|litespeed|httpd|apache|mysql|postgres|node|pm2"

# 2. Ver portas em uso por TODOS os serviços
sudo ss -tlnp | sort -k 4

# 3. Ver processos relacionados a web servers
ps aux | grep -E "nginx|litespeed|httpd|apache|node" | grep -v grep

# 4. Ver sites/domínios configurados no OpenLiteSpeed
sudo ls -la /usr/local/lsws/conf/vhosts/

# 5. Ver sites/domínios configurados no Nginx
sudo ls -la /etc/nginx/conf.d/
sudo ls -la /etc/nginx/sites-enabled/ 2>/dev/null || echo "Diretório não existe"
```

---

## 📋 PASSO 2: Verificar Sites/Domínios no OpenLiteSpeed

```bash
# 1. Listar todos os vHosts
sudo ls -la /usr/local/lsws/conf/vhosts/

# 2. Ver configuração de cada vHost
for vhost in /usr/local/lsws/conf/vhosts/*/vhconf.conf; do
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "vHost: $(dirname $vhost)"
    sudo grep -E "vhDomain|docRoot|context" $vhost | head -5
    echo ""
done

# 3. Ver lista de domínios no CyberPanel (se possível)
sudo ls -la /usr/local/CyberCP/logs/ 2>/dev/null || echo "CyberPanel não encontrado"
```

---

## 📋 PASSO 3: Verificar Configurações do Nginx

```bash
# 1. Ver todos os arquivos de configuração do Nginx
sudo find /etc/nginx -name "*.conf" -type f

# 2. Ver configurações específicas de servidores
sudo grep -r "server_name" /etc/nginx/conf.d/ 2>/dev/null
sudo grep -r "listen" /etc/nginx/conf.d/ 2>/dev/null

# 3. Ver configuração principal do Nginx
sudo cat /etc/nginx/nginx.conf | grep -E "include|server" | head -20
```

---

## 📋 PASSO 4: Verificar Outros Serviços Importantes

```bash
# 1. Ver serviços de banco de dados
sudo systemctl status postgresql 2>/dev/null || echo "PostgreSQL não encontrado"
sudo systemctl status mariadb 2>/dev/null || echo "MariaDB não encontrado"
sudo systemctl status mysql 2>/dev/null || echo "MySQL não encontrado"

# 2. Ver processos Node.js/PM2
pm2 list 2>/dev/null || echo "PM2 não encontrado ou sem processos"
ps aux | grep node | grep -v grep

# 3. Ver outros serviços de rede
sudo systemctl list-units --type=service --state=running | grep -E "dns|mail|ftp|ssh"
```

---

## 📋 PASSO 5: Verificar Firewall e Portas Externas

```bash
# 1. Ver regras do firewall
sudo firewall-cmd --list-all 2>/dev/null || sudo iptables -L -n | head -20

# 2. Ver portas abertas externamente
sudo ss -tlnp | grep LISTEN | grep -E ":80|:443|:8080|:3001|:5432|:3306"

# 3. Ver conexões ativas
sudo ss -tnp | grep ESTAB | head -10
```

---

## 📊 Formato para Reportar

Execute TODOS os comandos acima e me envie os resultados organizados assim:

```bash
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. SERVIÇOS ATIVOS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[COLE O RESULTADO AQUI]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
2. PORTAS EM USO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[COLE O RESULTADO AQUI]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
3. VHOSTS OPENLITESPEED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[COLE O RESULTADO AQUI]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
4. CONFIGURAÇÕES NGINX
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[COLE O RESULTADO AQUI]
```

---

## 🎯 O que Vamos Fazer com os Resultados

Após receber os resultados, vou:

1. ✅ **Identificar** todos os sites/serviços rodando
2. ✅ **Mapear** quais portas estão sendo usadas e por quê
3. ✅ **Propor** uma solução que NÃO afete os serviços existentes
4. ✅ **Criar** um plano específico para sua VPS

---

## ⚠️ IMPORTANTE

**NÃO vamos alterar nada antes de analisar todos os serviços!**

Precisamos garantir que:
- ✅ Outros sites continuem funcionando
- ✅ Outros serviços não sejam afetados
- ✅ A configuração seja segura e reversível

---

**Execute os comandos e me envie os resultados completos!** 🚀

**Vamos garantir que nada será quebrado!** ✅

