#!/bin/bash

# Script Rápido de Configuração da VPS
# Execute como root: sudo bash quick-setup-vps.sh

echo "═══════════════════════════════════════════════════════════════"
echo "  Configuração Rápida da VPS - AlmaLinux 9"
echo "═══════════════════════════════════════════════════════════════"

# Atualizar sistema
echo "[1/7] Atualizando sistema..."
dnf update -y -q

# Instalar dependências
echo "[2/7] Instalando dependencias..."
dnf install -y -q curl wget git nano htop

# Configurar firewall
echo "[3/7] Configurando firewall..."
systemctl start firewalld
systemctl enable firewalld
firewall-cmd --permanent --add-service=ssh
firewall-cmd --permanent --add-service=http
firewall-cmd --permanent --add-service=https
firewall-cmd --permanent --add-port=3001/tcp
firewall-cmd --reload

# Instalar Node.js
echo "[4/7] Instalando Node.js 20..."
curl -fsSL https://rpm.nodesource.com/setup_20.x | bash -
dnf install -y -q nodejs
npm install -g pm2

# Instalar Nginx
echo "[5/7] Instalando Nginx..."
dnf install -y -q nginx
systemctl start nginx
systemctl enable nginx

# Instalar Certbot
echo "[6/7] Instalando Certbot..."
dnf install -y -q certbot python3-certbot-nginx

# Instalar fail2ban
echo "[7/7] Instalando fail2ban..."
dnf install -y -q fail2ban
cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local
systemctl start fail2ban
systemctl enable fail2ban

# Estrutura de projeto
mkdir -p /Projetos/Barbearia_Premium/{backend,frontend,scripts,docs}
mkdir -p /Projetos/Barbearia_Premium/backend/{logs,uploads/fotos,uploads/help-desk,uploads/servicos}
chmod -R 755 /Projetos/Barbearia_Premium

echo ""
echo "✅ Configuração básica concluída!"
echo ""
echo "Próximos passos:"
echo "1. Enviar projeto para /Projetos/Barbearia_Premium"
echo "2. Configurar Oracle no .env da API"
echo "3. Configurar Nginx (dominios) e SSL"
echo ""
echo "Consulte: docs/deploy/GUIA_COMPLETO_VPS.md"





