# 📋 Resumo Rápido - Configuração da VPS

## ⚡ Comandos Essenciais (Execute na Ordem)

### 1️⃣ Segurança Básica

```bash
# Criar usuário
adduser desenvolvedor
usermod -aG wheel desenvolvedor
passwd desenvolvedor

# Configurar SSH (no seu PC)
ssh-keygen -t ed25519
ssh-copy-id desenvolvedor@IP_DA_VPS

# Na VPS - Desabilitar root e senha
sudo nano /etc/ssh/sshd_config
# Alterar: PermitRootLogin no
# Alterar: PasswordAuthentication no
sudo systemctl restart sshd
```

### 2️⃣ Firewall

```bash
sudo systemctl start firewalld
sudo systemctl enable firewalld
sudo firewall-cmd --permanent --add-service=ssh
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --permanent --add-port=3001/tcp
sudo firewall-cmd --reload
```

### 3️⃣ Instalar Tudo

```bash
# Atualizar
sudo dnf update -y

# Node.js
curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
sudo dnf install -y nodejs
sudo npm install -g pm2

# PostgreSQL
sudo dnf install -y https://download.postgresql.org/pub/repos/yum/reporpms/EL-9-x86_64/pgdg-redhat-repo-latest.noarch.rpm
sudo dnf install -y postgresql15-server postgresql15
sudo postgresql-15-setup initdb
sudo systemctl start postgresql-15
sudo systemctl enable postgresql-15

# Nginx
sudo dnf install -y nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# SSL
sudo dnf install -y certbot python3-certbot-nginx

# Segurança
sudo dnf install -y fail2ban
sudo systemctl start fail2ban
sudo systemctl enable fail2ban
```

### 4️⃣ Configurar PostgreSQL

```bash
sudo -u postgres psql
# No prompt:
ALTER USER postgres WITH PASSWORD 'SENHA_FORTE';
CREATE DATABASE protese_capilar;
CREATE USER protese_user WITH PASSWORD 'SENHA_FORTE';
GRANT ALL PRIVILEGES ON DATABASE protese_capilar TO protese_user;
\q
```

### 5️⃣ Configurar Nginx (API)

```bash
sudo nano /etc/nginx/conf.d/api.conf
# Cole o template de api.conf
sudo nginx -t
sudo systemctl reload nginx
```

### 6️⃣ Configurar SSL

```bash
# Aguardar propagação DNS primeiro!
sudo certbot --nginx -d api.seudominio.com
```

---

## 🎯 Estrutura de Domínios

```
api.seudominio.com    → Backend (Node.js :3001)
app.seudominio.com    → Painel Cliente
admin.seudominio.com  → Painel Admin
www.seudominio.com    → Site Público
```

---

## 🔐 Segurança Implementada

✅ Firewall ativo  
✅ fail2ban instalado  
✅ SSH apenas com chaves  
✅ Root desabilitado  
✅ SSL/HTTPS obrigatório  
✅ Rate limiting na API  
✅ Headers de segurança  

---

**Para guia completo, consulte: GUIA_COMPLETO_VPS.md**


