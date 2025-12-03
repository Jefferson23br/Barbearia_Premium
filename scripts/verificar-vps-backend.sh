#!/bin/bash

# Script para Verificar VPS Backend
# Execute: bash verificar-vps-backend.sh

echo "═══════════════════════════════════════════════════════════════"
echo "  Verificação da VPS Backend - 82.25.65.201"
echo "═══════════════════════════════════════════════════════════════"
echo ""

# Cores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "📋 Verificando serviços instalados..."
echo ""

# Node.js
if command -v node &> /dev/null; then
    echo -e "${GREEN}✓${NC} Node.js instalado: $(node --version)"
else
    echo -e "${RED}✗${NC} Node.js NÃO instalado"
fi

# NPM
if command -v npm &> /dev/null; then
    echo -e "${GREEN}✓${NC} NPM instalado: $(npm --version)"
else
    echo -e "${RED}✗${NC} NPM NÃO instalado"
fi

# PM2
if command -v pm2 &> /dev/null; then
    echo -e "${GREEN}✓${NC} PM2 instalado"
else
    echo -e "${RED}✗${NC} PM2 NÃO instalado"
fi

# PostgreSQL
if systemctl is-active --quiet postgresql-15; then
    echo -e "${GREEN}✓${NC} PostgreSQL rodando"
elif systemctl is-active --quiet postgresql; then
    echo -e "${GREEN}✓${NC} PostgreSQL rodando"
else
    echo -e "${RED}✗${NC} PostgreSQL NÃO está rodando"
fi

# Nginx
if systemctl is-active --quiet nginx; then
    echo -e "${GREEN}✓${NC} Nginx rodando"
else
    echo -e "${RED}✗${NC} Nginx NÃO está rodando"
fi

# Firewall
if systemctl is-active --quiet firewalld; then
    echo -e "${GREEN}✓${NC} Firewall ativo"
else
    echo -e "${YELLOW}⚠${NC} Firewall NÃO está ativo"
fi

# fail2ban
if systemctl is-active --quiet fail2ban; then
    echo -e "${GREEN}✓${NC} fail2ban ativo"
else
    echo -e "${YELLOW}⚠${NC} fail2ban NÃO está ativo"
fi

echo ""
echo "🔌 Verificando portas em uso..."
echo ""

# Porta 3001 (API)
if netstat -tlnp 2>/dev/null | grep -q ":3001"; then
    echo -e "${YELLOW}⚠${NC} Porta 3001 em uso:"
    netstat -tlnp | grep ":3001"
else
    echo -e "${GREEN}✓${NC} Porta 3001 disponível"
fi

echo ""
echo "📁 Verificando estrutura de pastas..."
echo ""

if [ -d "/home/desenvolvedor/app/backend" ]; then
    echo -e "${GREEN}✓${NC} Pasta backend existe"
else
    echo -e "${YELLOW}⚠${NC} Pasta backend não existe"
fi

echo ""
echo "🔥 Regras do Firewall:"
echo ""
firewall-cmd --list-all 2>/dev/null || echo "Firewall não configurado"

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "  Verificação concluída!"
echo "═══════════════════════════════════════════════════════════════"

