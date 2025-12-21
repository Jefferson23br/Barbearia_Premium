#!/bin/bash

# 🚨 Script de Diagnóstico Rápido - API Prótese Capilar
# Execute na VPS: bash diagnostico-api-rapido.sh

echo "═══════════════════════════════════════════════════════════"
echo "  DIAGNÓSTICO RÁPIDO - API PROTESE CAPILAR"
echo "═══════════════════════════════════════════════════════════"
echo ""

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. Verificar PM2
echo "1️⃣  Verificando PM2..."
echo "───────────────────────────────────────────────────────────"
pm2 status
echo ""

# 2. Verificar se API está rodando
echo "2️⃣  Verificando se API está rodando..."
echo "───────────────────────────────────────────────────────────"
if pm2 list | grep -q "api-protese-capilar"; then
    STATUS=$(pm2 jlist | jq -r '.[] | select(.name=="api-protese-capilar") | .pm2_env.status')
    if [ "$STATUS" == "online" ]; then
        echo -e "${GREEN}✅ API está rodando${NC}"
    else
        echo -e "${RED}❌ API está parada (status: $STATUS)${NC}"
        echo "Tentando reiniciar..."
        pm2 restart api-protese-capilar
    fi
else
    echo -e "${RED}❌ Processo api-protese-capilar não encontrado no PM2${NC}"
    echo "Verificando se server.js existe..."
    if [ -f "/home/cyberpanel/app/backend/server.js" ]; then
        echo -e "${YELLOW}⚠️  server.js encontrado. Iniciando...${NC}"
        cd /home/cyberpanel/app/backend
        pm2 start server.js --name api-protese-capilar
        pm2 save
    else
        echo -e "${RED}❌ server.js não encontrado em /home/cyberpanel/app/backend${NC}"
    fi
fi
echo ""

# 3. Verificar porta 3001
echo "3️⃣  Verificando porta 3001..."
echo "───────────────────────────────────────────────────────────"
if netstat -tlnp 2>/dev/null | grep -q ":3001"; then
    echo -e "${GREEN}✅ Porta 3001 está em uso${NC}"
    netstat -tlnp | grep ":3001"
else
    echo -e "${RED}❌ Porta 3001 não está em uso${NC}"
fi
echo ""

# 4. Testar API localmente
echo "4️⃣  Testando API localmente..."
echo "───────────────────────────────────────────────────────────"
HEALTH=$(curl -s http://localhost:3001/health 2>/dev/null)
if [ -n "$HEALTH" ]; then
    echo -e "${GREEN}✅ API respondeu:${NC}"
    echo "$HEALTH"
else
    echo -e "${RED}❌ API não respondeu em http://localhost:3001/health${NC}"
fi
echo ""

# 5. Verificar PostgreSQL
echo "5️⃣  Verificando PostgreSQL..."
echo "───────────────────────────────────────────────────────────"
if systemctl is-active --quiet postgresql-15; then
    echo -e "${GREEN}✅ PostgreSQL está rodando${NC}"
else
    echo -e "${RED}❌ PostgreSQL não está rodando${NC}"
    echo "Tentando iniciar..."
    systemctl start postgresql-15
    sleep 2
    if systemctl is-active --quiet postgresql-15; then
        echo -e "${GREEN}✅ PostgreSQL iniciado com sucesso${NC}"
    else
        echo -e "${RED}❌ Falha ao iniciar PostgreSQL${NC}"
    fi
fi
echo ""

# 6. Verificar OpenLiteSpeed
echo "6️⃣  Verificando OpenLiteSpeed..."
echo "───────────────────────────────────────────────────────────"
if systemctl is-active --quiet lsws; then
    echo -e "${GREEN}✅ OpenLiteSpeed está rodando${NC}"
else
    echo -e "${RED}❌ OpenLiteSpeed não está rodando${NC}"
    echo "Tentando iniciar..."
    systemctl start lsws
    sleep 2
    if systemctl is-active --quiet lsws; then
        echo -e "${GREEN}✅ OpenLiteSpeed iniciado com sucesso${NC}"
    else
        echo -e "${RED}❌ Falha ao iniciar OpenLiteSpeed${NC}"
    fi
fi
echo ""

# 7. Verificar logs recentes
echo "7️⃣  Últimos logs da API (erros)..."
echo "───────────────────────────────────────────────────────────"
pm2 logs api-protese-capilar --err --lines 10 --nostream
echo ""

# 8. Verificar recursos do sistema
echo "8️⃣  Recursos do Sistema..."
echo "───────────────────────────────────────────────────────────"
echo "Memória:"
free -h | grep Mem
echo ""
echo "Disco:"
df -h / | tail -1
echo ""

# 9. Resumo
echo "═══════════════════════════════════════════════════════════"
echo "  RESUMO"
echo "═══════════════════════════════════════════════════════════"
echo ""

# Verificar se tudo está OK
ALL_OK=true

if ! pm2 list | grep -q "api-protese-capilar.*online"; then
    echo -e "${RED}❌ API não está rodando${NC}"
    ALL_OK=false
fi

if ! systemctl is-active --quiet postgresql-15; then
    echo -e "${RED}❌ PostgreSQL não está rodando${NC}"
    ALL_OK=false
fi

if ! systemctl is-active --quiet lsws; then
    echo -e "${RED}❌ OpenLiteSpeed não está rodando${NC}"
    ALL_OK=false
fi

if [ "$ALL_OK" = true ]; then
    echo -e "${GREEN}✅ Todos os serviços estão rodando!${NC}"
    echo ""
    echo "Teste externamente:"
    echo "curl https://api.protesecapilarcuiaba.com.br/health"
else
    echo -e "${YELLOW}⚠️  Alguns serviços precisam de atenção${NC}"
    echo ""
    echo "Comandos úteis:"
    echo "  pm2 restart api-protese-capilar"
    echo "  sudo systemctl start postgresql-15"
    echo "  sudo systemctl start lsws"
fi

echo ""
echo "═══════════════════════════════════════════════════════════"





















