#!/bin/bash
# Script completo para analisar todos os serviços da VPS

echo "════════════════════════════════════════════════════════════════"
echo "  🔍 ANÁLISE COMPLETA DE SERVIÇOS DA VPS"
echo "════════════════════════════════════════════════════════════════"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "1️⃣  SERVIÇOS ATIVOS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📦 Serviços web e banco de dados:"
sudo systemctl list-units --type=service --state=running | grep -E "nginx|litespeed|httpd|apache|mysql|postgres|node|pm2" || echo "   Nenhum serviço relacionado encontrado"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "2️⃣  TODAS AS PORTAS EM USO"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📊 Portas TCP em uso:"
sudo ss -tlnp | sort -k 4
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "3️⃣  PROCESSOS WEB SERVER"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🔧 Nginx:"
ps aux | grep nginx | grep -v grep || echo "   Nginx não encontrado"
echo ""
echo "🔧 OpenLiteSpeed:"
ps aux | grep litespeed | grep -v grep || echo "   OpenLiteSpeed não encontrado"
echo ""
echo "🔧 Node.js:"
ps aux | grep node | grep -v grep || echo "   Node.js não encontrado"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "4️⃣  VHOSTS OPENLITESPEED"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
if [ -d "/usr/local/lsws/conf/vhosts" ]; then
    echo "📁 Lista de vHosts:"
    sudo ls -la /usr/local/lsws/conf/vhosts/
    echo ""
    echo "📄 Configuração de cada vHost:"
    for vhost_dir in /usr/local/lsws/conf/vhosts/*/; do
        if [ -d "$vhost_dir" ]; then
            vhost_name=$(basename "$vhost_dir")
            echo "   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
            echo "   vHost: $vhost_name"
            if [ -f "$vhost_dir/vhconf.conf" ]; then
                sudo grep -E "vhDomain|docRoot" "$vhost_dir/vhconf.conf" | head -3
            fi
            echo ""
        fi
    done
else
    echo "   Diretório de vHosts não encontrado"
fi
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "5️⃣  CONFIGURAÇÕES NGINX"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📁 Arquivos de configuração:"
sudo find /etc/nginx -name "*.conf" -type f 2>/dev/null | head -10
echo ""
echo "📄 Domínios configurados:"
sudo grep -rh "server_name" /etc/nginx/conf.d/ 2>/dev/null | grep -v "^#" | grep -v "^$" || echo "   Nenhum domínio encontrado"
echo ""
echo "📄 Portas configuradas:"
sudo grep -rh "listen" /etc/nginx/conf.d/ 2>/dev/null | grep -v "^#" | grep -v "^$" | sort -u || echo "   Nenhuma porta encontrada"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "6️⃣  BANCO DE DADOS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🐘 PostgreSQL:"
sudo systemctl status postgresql --no-pager 2>/dev/null | head -3 || echo "   PostgreSQL não encontrado"
echo ""
echo "🐬 MariaDB/MySQL:"
sudo systemctl status mariadb --no-pager 2>/dev/null | head -3 || sudo systemctl status mysql --no-pager 2>/dev/null | head -3 || echo "   MySQL/MariaDB não encontrado"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "7️⃣  PROCESSOS NODE.JS / PM2"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
if command -v pm2 &> /dev/null; then
    echo "📦 Processos PM2:"
    pm2 list
else
    echo "   PM2 não encontrado"
fi
echo ""
echo "📦 Processos Node.js:"
ps aux | grep -E "node.*3001|node.*api" | grep -v grep || echo "   Nenhum processo Node.js encontrado na porta 3001"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "8️⃣  FIREWALL"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
if command -v firewall-cmd &> /dev/null; then
    echo "🔥 Regras do firewall:"
    sudo firewall-cmd --list-all
else
    echo "   Firewall-cmd não encontrado, verificando iptables:"
    sudo iptables -L -n | head -20
fi
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "9️⃣  PORTAS CRÍTICAS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🔑 Portas web (80, 443, 8080):"
sudo ss -tlnp | grep -E ":80|:443|:8080"
echo ""
echo "🔑 Porta API Node.js (3001):"
sudo ss -tlnp | grep ":3001" || echo "   Porta 3001 não está em uso"
echo ""
echo "🔑 Portas banco de dados (5432, 3306):"
sudo ss -tlnp | grep -E ":5432|:3306" || echo "   Nenhuma porta de banco encontrada"
echo ""

echo "════════════════════════════════════════════════════════════════"
echo "  ✅ ANÁLISE CONCLUÍDA!"
echo "════════════════════════════════════════════════════════════════"
echo ""
echo "📋 Copie todo o resultado acima e envie para análise."
echo ""

