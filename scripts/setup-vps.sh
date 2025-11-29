#!/bin/bash

# Script de Configuração Inicial da VPS
# AlmaLinux 9 - Hostinger KVM 2
# Execute como root: sudo bash setup-vps.sh

set -e

echo "═══════════════════════════════════════════════════════════════"
echo "  Configuração Inicial da VPS - Sistema Prótese Capilar"
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

# 7. Instalar PostgreSQL
echo "[7/10] Instalando PostgreSQL 15..."
dnf install -y -q https://download.postgresql.org/pub/repos/yum/reporpms/EL-9-x86_64/pgdg-redhat-repo-latest.noarch.rpm
dnf install -y -q postgresql15-server postgresql15
postgresql-15-setup initdb
systemctl start postgresql-15
systemctl enable postgresql-15
check_status "PostgreSQL instalado e iniciado"

# 8. Instalar Nginx
echo "[8/10] Instalando Nginx..."
dnf install -y -q nginx
systemctl start nginx
systemctl enable nginx
check_status "Nginx instalado e iniciado"

# 9. Instalar Certbot
echo "[9/10] Instalando Certbot (SSL)..."
dnf install -y -q certbot python3-certbot-nginx
check_status "Certbot instalado"

# 10. Criar Estrutura de Diretórios
echo "[10/10] Criando estrutura de diretórios..."
mkdir -p /var/www/{site-publico,painel-cliente,painel-admin}
mkdir -p /home/desenvolvedor/app/{backend,frontend}
mkdir -p /home/desenvolvedor/app/backend/logs
chown -R desenvolvedor:desenvolvedor /home/desenvolvedor/app
chown -R desenvolvedor:nginx /var/www
check_status "Estrutura de diretórios criada"

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo -e "${GREEN}Configuração inicial concluída com sucesso!${NC}"
echo "═══════════════════════════════════════════════════════════════"
echo ""
echo "Próximos passos:"
echo "1. Configurar PostgreSQL (senhas e banco de dados)"
echo "2. Configurar Nginx (domínios)"
echo "3. Configurar SSL (Certbot)"
echo "4. Configurar usuário e chaves SSH"
echo ""
echo "Consulte: docs/deploy/CONFIGURACAO_VPS.md"

