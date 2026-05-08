#!/bin/bash

# ============================================
# Script: Configurar SSL para API
# Domínio: api6.auctusconsultoria.com.br
# VPS: 82.25.65.201
# ============================================

set -e  # Parar em caso de erro

echo "═══════════════════════════════════════════════════════"
echo "  Configuração SSL - API Barbearia Premium"
echo "═══════════════════════════════════════════════════════"
echo ""

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Verificar se está rodando como root
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}❌ Por favor, execute como root ou com sudo${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Executando como root${NC}"
echo ""

# ============================================
# PASSO 1: Verificar DNS
# ============================================
echo -e "${YELLOW}[1/6] Verificando DNS...${NC}"
DOMAIN="api6.auctusconsultoria.com.br"
DNS_RESULT=$(dig +short $DOMAIN | tail -1)

if [ -z "$DNS_RESULT" ]; then
    echo -e "${RED}❌ Erro: DNS não resolveu para $DOMAIN${NC}"
    echo -e "${YELLOW}⚠️  Verifique se o DNS foi configurado no Cloudflare${NC}"
    exit 1
fi

echo -e "${GREEN}✅ DNS resolvendo: $DOMAIN → $DNS_RESULT${NC}"
echo ""

# ============================================
# PASSO 2: Instalar Certbot
# ============================================
echo -e "${YELLOW}[2/6] Instalando Certbot...${NC}"

if ! command -v certbot &> /dev/null; then
    echo "Instalando Certbot..."
    dnf install -y certbot python3-certbot-nginx
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Certbot instalado${NC}"
    else
        echo -e "${RED}❌ Erro ao instalar Certbot${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}✅ Certbot já instalado${NC}"
fi

echo ""

# ============================================
# PASSO 3: Verificar Nginx
# ============================================
echo -e "${YELLOW}[3/6] Verificando Nginx...${NC}"

if ! command -v nginx &> /dev/null; then
    echo -e "${RED}❌ Nginx não encontrado. Instale primeiro.${NC}"
    exit 1
fi

# Testar configuração atual
if nginx -t 2>&1 | grep -q "successful"; then
    echo -e "${GREEN}✅ Configuração Nginx válida${NC}"
else
    echo -e "${YELLOW}⚠️  Configuração Nginx tem problemas, mas continuando...${NC}"
fi

echo ""

# ============================================
# PASSO 4: Verificar Porta 80
# ============================================
echo -e "${YELLOW}[4/6] Verificando porta 80...${NC}"

PORT_80_IN_USE=$(ss -tlnp | grep ':80 ' || true)

if [ ! -z "$PORT_80_IN_USE" ]; then
    echo -e "${YELLOW}⚠️  Porta 80 está em uso:${NC}"
    echo "$PORT_80_IN_USE"
    echo ""
    echo -e "${YELLOW}Se for OpenLiteSpeed, vamos parar temporariamente...${NC}"
    read -p "Deseja continuar? (s/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Ss]$ ]]; then
        exit 1
    fi
    
    # Parar OpenLiteSpeed se estiver rodando
    if systemctl is-active --quiet lsws; then
        echo "Parando OpenLiteSpeed..."
        systemctl stop lsws
        echo -e "${GREEN}✅ OpenLiteSpeed parado${NC}"
    fi
else
    echo -e "${GREEN}✅ Porta 80 livre${NC}"
fi

echo ""

# ============================================
# PASSO 5: Gerar Certificado SSL
# ============================================
echo -e "${YELLOW}[5/6] Gerando certificado SSL...${NC}"
echo ""

# Pedir email
read -p "Digite seu email para notificações do Let's Encrypt: " EMAIL

if [ -z "$EMAIL" ]; then
    echo -e "${RED}❌ Email é obrigatório${NC}"
    exit 1
fi

echo ""
echo "Gerando certificado para $DOMAIN..."
echo ""

# Verificar se Nginx está rodando
if systemctl is-active --quiet nginx; then
    echo "Usando plugin Nginx do Certbot..."
    certbot --nginx \
        -d $DOMAIN \
        --email $EMAIL \
        --agree-tos \
        --non-interactive \
        --redirect
else
    echo "Usando modo standalone (Nginx parado)..."
    certbot certonly --standalone \
        --preferred-challenges http \
        -d $DOMAIN \
        --email $EMAIL \
        --agree-tos \
        --non-interactive
    
    echo ""
    echo -e "${YELLOW}⚠️  Certificado gerado, mas você precisa configurar Nginx manualmente${NC}"
    echo "Consulte: GUIA_SSL_DNS_COMPLETO.md"
fi

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Certificado SSL gerado com sucesso!${NC}"
else
    echo -e "${RED}❌ Erro ao gerar certificado SSL${NC}"
    exit 1
fi

echo ""

# ============================================
# PASSO 6: Verificar Certificado
# ============================================
echo -e "${YELLOW}[6/6] Verificando certificado...${NC}"

CERT_PATH="/etc/letsencrypt/live/$DOMAIN/fullchain.pem"

if [ -f "$CERT_PATH" ]; then
    echo -e "${GREEN}✅ Certificado encontrado em: $CERT_PATH${NC}"
    
    # Mostrar data de expiração
    EXPIRY=$(openssl x509 -enddate -noout -in "$CERT_PATH" | cut -d= -f2)
    echo "📅 Data de expiração: $EXPIRY"
else
    echo -e "${RED}❌ Certificado não encontrado${NC}"
    exit 1
fi

echo ""

# ============================================
# PASSO 7: Reiniciar Serviços
# ============================================
echo -e "${YELLOW}[7/7] Reiniciando serviços...${NC}"

# Reiniciar Nginx
if systemctl restart nginx; then
    echo -e "${GREEN}✅ Nginx reiniciado${NC}"
else
    echo -e "${YELLOW}⚠️  Erro ao reiniciar Nginx${NC}"
    echo "Verifique os logs: sudo tail -f /var/log/nginx/error.log"
fi

# Reiniciar OpenLiteSpeed se estava rodando
if systemctl list-units --type=service | grep -q lsws.service; then
    if ! systemctl is-active --quiet lsws; then
        echo "Reiniciando OpenLiteSpeed..."
        systemctl start lsws
    fi
fi

echo ""

# ============================================
# RESUMO FINAL
# ============================================
echo "═══════════════════════════════════════════════════════"
echo -e "${GREEN}✅ CONFIGURAÇÃO SSL CONCLUÍDA!${NC}"
echo "═══════════════════════════════════════════════════════"
echo ""
echo "📋 Próximos passos:"
echo ""
echo "1. Testar HTTPS:"
echo "   curl https://$DOMAIN/health"
echo ""
echo "2. Verificar no navegador:"
echo "   https://$DOMAIN/health"
echo ""
echo "3. Verificar renovação automática:"
echo "   sudo certbot renew --dry-run"
echo ""
echo "═══════════════════════════════════════════════════════"

