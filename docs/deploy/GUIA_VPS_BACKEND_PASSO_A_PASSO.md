# 🔧 Guia VPS Backend - Passo a Passo via PowerShell

## 🎯 VPS Backend: 82.25.65.201

---

## PASSO 1: Conectar e Verificar o Que Está Rodando

### 1.1 Conectar via PowerShell

```powershell
ssh root@82.25.65.201
```

### 1.2 Verificar Processos Rodando

```bash
# Ver todos os processos Node.js
ps aux | grep node

# Ver processos em portas
sudo netstat -tlnp | grep LISTEN

# Ver serviços ativos
sudo systemctl list-units --type=service --state=running

# Ver uso de recursos
htop
# Pressione 'q' para sair
```

### 1.3 Verificar Portas em Uso

```bash
# Ver quais portas estão abertas
sudo netstat -tlnp

# Verificar porta 3001 (nossa API)
sudo netstat -tlnp | grep 3001

# Verificar PostgreSQL
sudo systemctl status postgresql-15
# ou
sudo systemctl status postgresql
```

### 1.4 Verificar Nginx

```bash
# Status do Nginx
sudo systemctl status nginx

# Ver configurações do Nginx
ls -la /etc/nginx/conf.d/

# Ver sites configurados
cat /etc/nginx/conf.d/*.conf
```

---

## PASSO 2: Criar Usuário Seguro (Se Ainda Não Tiver)

```bash
# Verificar se usuário desenvolvedor existe
id desenvolvedor

# Se não existir, criar:
adduser desenvolvedor
usermod -aG wheel desenvolvedor
passwd desenvolvedor
```

---

## PASSO 3: Configurar Firewall

```bash
# Verificar status do firewall
sudo systemctl status firewalld

# Se não estiver ativo, ativar:
sudo systemctl start firewalld
sudo systemctl enable firewalld

# Adicionar regras
sudo firewall-cmd --permanent --add-service=ssh
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --permanent --add-port=3001/tcp

# Aplicar
sudo firewall-cmd --reload

# Verificar regras
sudo firewall-cmd --list-all
```

---

## PASSO 4: Instalar/Verificar Node.js

```bash
# Verificar se Node.js está instalado
node --version
npm --version

# Se não estiver instalado:
curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
sudo dnf install -y nodejs

# Instalar PM2
sudo npm install -g pm2
```

---

## PASSO 5: Instalar/Verificar PostgreSQL

```bash
# Verificar se PostgreSQL está instalado
sudo systemctl status postgresql-15
# ou
sudo systemctl status postgresql

# Se não estiver, instalar:
sudo dnf install -y https://download.postgresql.org/pub/repos/yum/reporpms/EL-9-x86_64/pgdg-redhat-repo-latest.noarch.rpm
sudo dnf install -y postgresql15-server postgresql15
sudo postgresql-15-setup initdb
sudo systemctl start postgresql-15
sudo systemctl enable postgresql-15
```

---

## PASSO 6: Configurar PostgreSQL

```bash
# Acessar PostgreSQL
sudo -u postgres psql
```

**No prompt do PostgreSQL:**

```sql
-- Ver bancos existentes
\l

-- Criar banco (se não existir)
CREATE DATABASE protese_capilar;

-- Criar usuário
CREATE USER protese_user WITH PASSWORD 'SuaSenhaForte123!@#';

-- Dar permissões
GRANT ALL PRIVILEGES ON DATABASE protese_capilar TO protese_user;

-- Sair
\q
```

### Configurar Acesso Local

```bash
# Editar pg_hba.conf
sudo nano /var/lib/pgsql/15/data/pg_hba.conf
```

**Alterar as linhas para:**

```
local   all             all                                     md5
host    all             all             127.0.0.1/32            md5
host    all             all             ::1/128                 md5
```

**Salvar (Ctrl+X, Y, Enter) e reiniciar:**

```bash
sudo systemctl restart postgresql-15
```

---

## PASSO 7: Instalar Nginx

```bash
# Verificar se está instalado
sudo systemctl status nginx

# Se não estiver:
sudo dnf install -y nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

---

## PASSO 8: Configurar Nginx para API

### 8.1 Criar Configuração da API

```bash
sudo nano /etc/nginx/conf.d/api.conf
```

**Cole este conteúdo:**

```nginx
# API Backend - api.protesecapilarcuiaba.com.br
server {
    listen 80;
    server_name api.protesecapilarcuiaba.com.br;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.protesecapilarcuiaba.com.br;

    # SSL (será configurado pelo Certbot)
    # ssl_certificate /etc/letsencrypt/live/api.protesecapilarcuiaba.com.br/fullchain.pem;
    # ssl_certificate_key /etc/letsencrypt/live/api.protesecapilarcuiaba.com.br/privkey.pem;

    # Headers de Segurança
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # Tamanho máximo de upload
    client_max_body_size 10M;

    # Rate Limiting (proteção contra DDoS)
    limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;
    limit_req zone=api_limit burst=20 nodelay;

    # Logs
    access_log /var/log/nginx/api.access.log;
    error_log /var/log/nginx/api.error.log;

    # Proxy para API Node.js
    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Health check
    location /health {
        proxy_pass http://localhost:3001/health;
        access_log off;
        limit_req off;
    }
}
```

**Salvar (Ctrl+X, Y, Enter)**

### 8.2 Testar Configuração

```bash
# Testar sintaxe
sudo nginx -t

# Se OK, recarregar
sudo systemctl reload nginx
```

---

## PASSO 9: Criar Estrutura de Pastas

```bash
# Criar pasta para o backend
sudo mkdir -p /home/desenvolvedor/app/backend
sudo mkdir -p /home/desenvolvedor/app/backend/logs

# Configurar permissões
sudo chown -R desenvolvedor:desenvolvedor /home/desenvolvedor/app
```

---

## PASSO 10: Instalar Certbot e Configurar SSL

```bash
# Instalar Certbot
sudo dnf install -y certbot python3-certbot-nginx

# IMPORTANTE: Aguardar DNS propagar antes!
# Testar se DNS está propagado:
curl -I http://api.protesecapilarcuiaba.com.br

# Se responder, configurar SSL:
sudo certbot --nginx -d api.protesecapilarcuiaba.com.br

# Seguir instruções:
# 1. Email de contato
# 2. Aceitar termos
# 3. Redirecionar HTTP → HTTPS? Sim (2)
```

---

## PASSO 11: Instalar fail2ban (Segurança)

```bash
sudo dnf install -y fail2ban
sudo cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local

# Iniciar
sudo systemctl start fail2ban
sudo systemctl enable fail2ban

# Verificar
sudo fail2ban-client status sshd
```

---

## ✅ VERIFICAÇÃO FINAL

### Verificar Todos os Serviços

```bash
sudo systemctl status firewalld    # Deve estar active
sudo systemctl status nginx         # Deve estar active
sudo systemctl status postgresql-15 # Deve estar active
sudo systemctl status fail2ban      # Deve estar active
```

### Verificar Portas

```bash
sudo firewall-cmd --list-all
# Deve mostrar: ssh, http, https, 3001/tcp
```

### Testar PostgreSQL

```bash
psql -h localhost -U protese_user -d protese_capilar
# Digite a senha
# Se conectar, está funcionando!
# Digite \q para sair
```

---

## 📋 Próximo Passo: Criar Backend

Agora a VPS está pronta para receber o backend!

Precisamos:
1. Criar estrutura do backend (Node.js/NestJS)
2. Fazer upload para `/home/desenvolvedor/app/backend/`
3. Rodar com PM2
4. Testar `https://api.protesecapilarcuiaba.com.br`

---

## 🔐 Resumo de Credenciais

```
SSH:
ssh root@82.25.65.201
(ou: ssh desenvolvedor@82.25.65.201)

PostgreSQL:
Host: localhost
Port: 5432
Database: protese_capilar
User: protese_user
Password: [a senha que você definiu]

API:
URL: https://api.protesecapilarcuiaba.com.br
Porta interna: 3001
```

---

**VPS Backend configurada e segura!** 🔒

