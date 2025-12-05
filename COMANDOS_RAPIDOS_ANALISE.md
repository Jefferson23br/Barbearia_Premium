# ⚡ Comandos Rápidos para Análise de Serviços

## 🚀 Script Automático (RECOMENDADO)

Execute este comando para fazer análise completa:

```bash
# Criar e executar script de análise
cat > /tmp/analisar_vps.sh << 'EOFSCRIPT'
#!/bin/bash
echo "════════════════════════════════════════════════════════════════"
echo "  🔍 ANÁLISE COMPLETA DE SERVIÇOS"
echo "════════════════════════════════════════════════════════════════"
echo ""
echo "1️⃣ PORTAS EM USO:"
sudo ss -tlnp | sort -k 4
echo ""
echo "2️⃣ VHOSTS OPENLITESPEED:"
sudo ls -la /usr/local/lsws/conf/vhosts/ 2>/dev/null || echo "Não encontrado"
echo ""
echo "3️⃣ CONFIGURAÇÕES NGINX:"
sudo ls -la /etc/nginx/conf.d/
echo ""
echo "4️⃣ DOMÍNIOS NGINX:"
sudo grep -rh "server_name" /etc/nginx/conf.d/ 2>/dev/null | grep -v "^#"
echo ""
echo "5️⃣ PROCESSOS NODE.JS:"
ps aux | grep node | grep -v grep
echo ""
echo "6️⃣ SERVIÇOS ATIVOS:"
sudo systemctl list-units --type=service --state=running | grep -E "nginx|litespeed|postgres|mysql"
EOFSCRIPT

chmod +x /tmp/analisar_vps.sh
/tmp/analisar_vps.sh
```

---

## 📋 Comandos Individuais (Mais Detalhado)

Execute um por um se preferir mais controle:

### 1. Ver TODAS as portas

```bash
sudo ss -tlnp | sort -k 4
```

### 2. Ver vHosts do OpenLiteSpeed

```bash
sudo ls -la /usr/local/lsws/conf/vhosts/
```

### 3. Ver domínios configurados no OpenLiteSpeed

```bash
for vhost in /usr/local/lsws/conf/vhosts/*/vhconf.conf; do
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "vHost: $(dirname $vhost)"
    sudo grep -E "vhDomain|docRoot" $vhost 2>/dev/null | head -3
done
```

### 4. Ver configurações do Nginx

```bash
sudo ls -la /etc/nginx/conf.d/
sudo grep -rh "server_name" /etc/nginx/conf.d/ 2>/dev/null
```

### 5. Ver processos Node.js/PM2

```bash
pm2 list 2>/dev/null || echo "PM2 não encontrado"
ps aux | grep node | grep -v grep
```

---

## 📊 Formato para Enviar

Após executar, me envie os resultados assim:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. PORTAS EM USO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[COLE RESULTADO AQUI]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
2. VHOSTS OPENLITESPEED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[COLE RESULTADO AQUI]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
3. CONFIGURAÇÕES NGINX
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[COLE RESULTADO AQUI]
```

---

**Execute e me envie os resultados! Vamos garantir que nada será afetado!** ✅

