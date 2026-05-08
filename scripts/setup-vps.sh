#!/bin/bash

# Script de Configuração Inicial da VPS
# AlmaLinux 9 - Hostinger KVM 2
# Execute como root: sudo bash setup-vps.sh

set -e

echo "═══════════════════════════════════════════════════════════════"
echo "  Configuracao Inicial da VPS - Barbearia Premium"
echo "═══════════════════════════════════════════════════════════════"
echo ""

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Função para verificar se comando foi executado com sucesso
check_status() {
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓${NC} $1"
    else
        echo -e "${RED}✗${NC} $1"
        exit 1
    fi
}

# 1. Atualizar Sistema
echo "[1/10] Atualizando sistema..."
dnf update -y -q
check_status "Sistema atualizado"

# 2. Instalar Dependências Básicas
echo "[2/10] Instalando dependências básicas..."
dnf install -y -q curl wget git nano htop
check_status "Dependências instaladas"

# 3. Configurar Firewall
echo "[3/10] Configurando firewall..."
systemctl start firewalld
systemctl enable firewalld
firewall-cmd --permanent --add-service=ssh
firewall-cmd --permanent --add-service=http
firewall-cmd --permanent --add-service=https
firewall-cmd --permanent --add-port=3001/tcp
firewall-cmd --reload
check_status "Firewall configurado"

# 4. Instalar fail2ban
echo "[4/10] Instalando fail2ban..."
dnf install -y -q fail2ban
systemctl start fail2ban
systemctl enable fail2ban
check_status "fail2ban instalado"

# 5. Instalar Node.js 20 LTS
echo "[5/10] Instalando Node.js 20 LTS..."
curl -fsSL https://rpm.nodesource.com/setup_20.x | bash -
dnf install -y -q nodejs
check_status "Node.js instalado"
echo "  Node.js version: $(node --version)"

# 6. Instalar PM2
echo "[6/10] Instalando PM2..."
npm install -g pm2
check_status "PM2 instalado"

# 7. Instalar Nginx
echo "[7/10] Instalando Nginx..."
dnf install -y -q nginx
systemctl start nginx
systemctl enable nginx
check_status "Nginx instalado e iniciado"

# 8. Instalar Certbot
echo "[8/10] Instalando Certbot (SSL)..."
dnf install -y -q certbot python3-certbot-nginx
check_status "Certbot instalado"

# 9. Criar Estrutura de Diretórios
echo "[9/10] Criando estrutura de diretorios..."
mkdir -p /var/www/{site-publico,painel-cliente,painel-admin}
mkdir -p /Projetos/Barbearia_Premium/{backend,frontend,scripts,docs}
mkdir -p /Projetos/Barbearia_Premium/backend/{logs,uploads/fotos,uploads/help-desk,uploads/servicos}
chown -R root:root /Projetos/Barbearia_Premium
chown -R root:nginx /var/www
check_status "Estrutura de diretórios criada"

# 10. Confirmacao de versoes
echo "[10/10] Validando stack..."
node --version
npm --version
pm2 --version
nginx -v
check_status "Stack validada"

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo -e "${GREEN}Configuração inicial concluída com sucesso!${NC}"
echo "═══════════════════════════════════════════════════════════════"
echo ""
echo "Próximos passos:"
echo "1. Enviar projeto para /Projetos/Barbearia_Premium"
echo "2. Configurar variaveis Oracle no .env da API"
echo "3. Configurar Nginx (dominios)"
echo "4. Configurar SSL (Certbot)"
echo "5. Configurar usuario e chaves SSH"
echo ""
echo "Consulte: docs/deploy/CONFIGURACAO_VPS.md"





