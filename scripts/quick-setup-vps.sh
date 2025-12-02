#!/bin/bash

# Script Rápido de Configuração da VPS
# Execute como root: sudo bash quick-setup-vps.sh

echo "═══════════════════════════════════════════════════════════════"
echo "  Configuração Rápida da VPS - AlmaLinux 9"
echo "═══════════════════════════════════════════════════════════════"

# Atualizar sistema
echo "[1/8] Atualizando sistema..."
dnf update -y -q

# Instalar dependências
echo "[2/8] Instalando dependências..."
dnf install -y -q curl wget git nano htop

# Configurar firewall
echo "[3/8] Configurando firewall..."
systemctl start firewalld
systemctl enable firewalld
firewall-cmd --permanent --add-service=ssh
firewall-cmd --permanent --add-service=http
firewall-cmd --permanent --add-service=https
firewall-cmd --permanent --add-port=3001/tcp
firewall-cmd --reload

# Instalar Node.js
echo "[4/8] Instalando Node.js 20..."
curl -fsSL https://rpm.nodesource.com/setup_20.x | bash -
dnf install -y -q nodejs
npm install -g pm2

# Instalar PostgreSQL
echo "[5/8] Instalando PostgreSQL..."
dnf install -y -q https://download.postgresql.org/pub/repos/yum/reporpms/EL-9-x86_64/pgdg-redhat-repo-latest.noarch.rpm
dnf install -y -q postgresql15-server postgresql15
postgresql-15-setup initdb
systemctl start postgresql-15
systemctl enable postgresql-15

# Instalar Nginx
echo "[6/8] Instalando Nginx..."
dnf install -y -q nginx
systemctl start nginx
systemctl enable nginx

# Instalar Certbot
echo "[7/8] Instalando Certbot..."
dnf install -y -q certbot python3-certbot-nginx

# Instalar fail2ban
echo "[8/8] Instalando fail2ban..."
dnf install -y -q fail2ban
cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local
systemctl start fail2ban
systemctl enable fail2ban

echo ""
echo "✅ Configuração básica concluída!"
echo ""
echo "Próximos passos:"
echo "1. Configurar PostgreSQL (senhas e banco)"
echo "2. Configurar Nginx (domínios)"
echo "3. Configurar SSL"
echo ""
echo "Consulte: docs/deploy/GUIA_COMPLETO_VPS.md"



