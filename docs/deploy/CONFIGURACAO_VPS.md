# 🛡️ Configuração Completa da VPS - Segurança e Infraestrutura

## 📋 Informações da VPS

- **Provedor**: Hostinger
- **Tipo**: KVM 2
- **Sistema Operacional**: AlmaLinux 9
- **Domínio**: [INFORME O DOMÍNIO AQUI]

---

## 🎯 Estrutura de Domínios Proposta

```
api.seudominio.com        → API Backend (Node.js)
app.seudominio.com        → Painel do Cliente (Next.js)
admin.seudominio.com      → Painel Administrativo (Next.js)
www.seudominio.com        → Site Público (Next.js)
```

OU (se preferir subpastas):

```
seudominio.com/api/       → API Backend
seudominio.com/app/       → Painel do Cliente
seudominio.com/admin/     → Painel Admin
seudominio.com/           → Site Público
```

**Recomendação**: Usar subdomínios (mais profissional e seguro)

---

## 🔒 PASSO 1: CONFIGURAÇÃO INICIAL E SEGURANÇA

### 1.1 Primeiro Acesso e Usuário

```bash
# Conectar via SSH (use as credenciais fornecidas pela Hostinger)
ssh root@IP_DA_VPS

# Criar usuário não-root (boa prática de segurança)
adduser desenvolvedor
usermod -aG wheel desenvolvedor

# Definir senha forte para o usuário
passwd desenvolvedor

# Criar diretório .ssh para chaves
mkdir -p /home/desenvolvedor/.ssh
chmod 700 /home/desenvolvedor/.ssh
```

### 1.2 Configurar Chaves SSH (Mais Seguro)

**No seu computador local:**

```bash
# Gerar par de chaves SSH (se ainda não tiver)
ssh-keygen -t ed25519 -C "seu-email@exemplo.com"

# Copiar chave pública para o servidor
ssh-copy-id desenvolvedor@IP_DA_VPS
```

**Na VPS, configurar autorização:**

```bash
# Permitir apenas autenticação por chave
sudo nano /etc/ssh/sshd_config

# Alterar as seguintes linhas:
PermitRootLogin no
PasswordAuthentication no
PubkeyAuthentication yes

# Reiniciar serviço SSH
sudo systemctl restart sshd
```

### 1.3 Configurar Firewall (firewalld)

```bash
# Verificar status do firewall
sudo systemctl status firewalld

# Iniciar e habilitar firewall
sudo systemctl start firewalld
sudo systemctl enable firewalld

# Abrir portas necessárias
sudo firewall-cmd --permanent --add-service=ssh
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https

# Porta da API (por padrão 3001, pode mudar)
sudo firewall-cmd --permanent --add-port=3001/tcp

# Porta do PostgreSQL (somente localhost, não abrir externamente)
# PostgreSQL será acessível apenas via localhost

# Recarregar firewall
sudo firewall-cmd --reload

# Verificar regras ativas
sudo firewall-cmd --list-all
```

### 1.4 Instalar fail2ban (Proteção contra ataques)

```bash
# Instalar fail2ban
sudo dnf install -y fail2ban

# Criar configuração local
sudo cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local

# Editar configuração
sudo nano /etc/fail2ban/jail.local

# Configurar [sshd] section:
[sshd]
enabled = true
port = ssh
logpath = %(sshd_log)s
maxretry = 5
bantime = 3600

# Iniciar e habilitar fail2ban
sudo systemctl start fail2ban
sudo systemctl enable fail2ban

# Verificar status
sudo fail2ban-client status sshd
```

---

## 🔧 PASSO 2: INSTALAÇÃO DE DEPENDÊNCIAS

### 2.1 Atualizar Sistema

```bash
sudo dnf update -y
sudo dnf upgrade -y
```

### 2.2 Instalar Node.js 20 LTS

```bash
# Adicionar repositório NodeSource
curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -

# Instalar Node.js
sudo dnf install -y nodejs

# Verificar instalação
node --version
npm --version

# Instalar PM2 globalmente
sudo npm install -g pm2
```

### 2.3 Instalar PostgreSQL 15

```bash
# Instalar repositório oficial PostgreSQL
sudo dnf install -y https://download.postgresql.org/pub/repos/yum/reporpms/EL-9-x86_64/pgdg-redhat-repo-latest.noarch.rpm

# Instalar PostgreSQL
sudo dnf install -y postgresql15-server postgresql15

# Inicializar banco de dados
sudo postgresql-15-setup initdb

# Iniciar e habilitar PostgreSQL
sudo systemctl start postgresql-15
sudo systemctl enable postgresql-15

# Configurar senha do usuário postgres
sudo -u postgres psql -c "ALTER USER postgres WITH PASSWORD 'SENHA_FORTE_AQUI';"

# Criar banco de dados da aplicação
sudo -u postgres psql -c "CREATE DATABASE protese_capilar;"
sudo -u postgres psql -c "CREATE USER protese_user WITH PASSWORD 'SENHA_FORTE_AQUI';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE protese_capilar TO protese_user;"
```

### 2.4 Configurar PostgreSQL para Acesso Local

```bash
# Editar configuração do PostgreSQL
sudo nano /var/lib/pgsql/15/data/pg_hba.conf

# Alterar para (permite conexão local com senha):
local   all             all                                     md5
host    all             all             127.0.0.1/32            md5
host    all             all             ::1/128                 md5

# Reiniciar PostgreSQL
sudo systemctl restart postgresql-15
```

### 2.5 Instalar Nginx

```bash
sudo dnf install -y nginx

# Iniciar e habilitar Nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# Verificar status
sudo systemctl status nginx
```

### 2.6 Instalar Certbot (Let's Encrypt SSL)

```bash
sudo dnf install -y certbot python3-certbot-nginx
```

---

## 🌐 PASSO 3: CONFIGURAR DOMÍNIOS E NGINX

### 3.1 Configurar DNS (Na Hostinger)

Adicionar os seguintes registros A no painel da Hostinger:

```
A    api.seudominio.com        → IP_DA_VPS
A    app.seudominio.com        → IP_DA_VPS
A    admin.seudominio.com      → IP_DA_VPS
A    www.seudominio.com        → IP_DA_VPS
A    seudominio.com            → IP_DA_VPS
```

### 3.2 Configurar Nginx para API (api.seudominio.com)

```bash
# Criar arquivo de configuração
sudo nano /etc/nginx/conf.d/api.conf
```

**Conteúdo do arquivo:**

```nginx
# API Backend
server {
    listen 80;
    server_name api.seudominio.com;

    # Redirecionar HTTP para HTTPS (será configurado depois do SSL)
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.seudominio.com;

    # SSL será configurado pelo Certbot
    # ssl_certificate /etc/letsencrypt/live/api.seudominio.com/fullchain.pem;
    # ssl_certificate_key /etc/letsencrypt/live/api.seudominio.com/privkey.pem;

    # Headers de segurança
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # Tamanho máximo de upload
    client_max_body_size 10M;

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
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Rate limiting (proteção contra ataques)
    limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;
    limit_req zone=api_limit burst=20 nodelay;
}
```

### 3.3 Configurar Nginx para Frontend (Site Público)

```bash
sudo nano /etc/nginx/conf.d/www.conf
```

**Conteúdo:**

```nginx
# Site Público
server {
    listen 80;
    server_name www.seudominio.com seudominio.com;

    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name www.seudominio.com seudominio.com;

    # SSL será configurado pelo Certbot
    # ssl_certificate /etc/letsencrypt/live/seudominio.com/fullchain.pem;
    # ssl_certificate_key /etc/letsencrypt/live/seudominio.com/privkey.pem;

    # Headers de segurança
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    root /var/www/site-publico;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache de arquivos estáticos
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### 3.4 Configurar Nginx para Painel Cliente

```bash
sudo nano /etc/nginx/conf.d/app.conf
```

**Conteúdo:**

```nginx
# Painel do Cliente
server {
    listen 80;
    server_name app.seudominio.com;

    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name app.seudominio.com;

    # SSL será configurado pelo Certbot

    root /var/www/painel-cliente;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache de arquivos estáticos
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### 3.5 Testar Configuração do Nginx

```bash
# Testar configuração
sudo nginx -t

# Se estiver OK, recarregar
sudo systemctl reload nginx
```

---

## 🔐 PASSO 4: CONFIGURAR SSL (HTTPS)

### 4.1 Gerar Certificados SSL

```bash
# Para API
sudo certbot --nginx -d api.seudominio.com

# Para Site Público
sudo certbot --nginx -d www.seudominio.com -d seudominio.com

# Para Painel Cliente
sudo certbot --nginx -d app.seudominio.com

# Para Painel Admin (quando criado)
sudo certbot --nginx -d admin.seudominio.com
```

### 4.2 Configurar Renovação Automática

```bash
# Testar renovação
sudo certbot renew --dry-run

# Certbot já cria um cronjob automático, mas verificar:
sudo systemctl status certbot.timer
```

---

## 📁 PASSO 5: ESTRUTURA DE DIRETÓRIOS

```bash
# Criar estrutura de diretórios
sudo mkdir -p /var/www/{site-publico,painel-cliente,painel-admin}
sudo mkdir -p /home/desenvolvedor/app/{backend,frontend}
sudo mkdir -p /home/desenvolvedor/app/backend/logs

# Configurar permissões
sudo chown -R desenvolvedor:desenvolvedor /home/desenvolvedor/app
sudo chown -R desenvolvedor:nginx /var/www
```

---

## 🔒 PASSO 6: SEGURANÇA ADICIONAL

### 6.1 Desabilitar Acesso Root via SSH

```bash
sudo nano /etc/ssh/sshd_config

# Alterar:
PermitRootLogin no

# Reiniciar SSH
sudo systemctl restart sshd
```

### 6.2 Configurar Limites do Sistema

```bash
sudo nano /etc/security/limits.conf

# Adicionar no final:
desenvolvedor soft nofile 65535
desenvolvedor hard nofile 65535
```

### 6.3 Instalar e Configurar UFW (Opcional, alternativo ao firewalld)

```bash
# Se preferir usar UFW ao invés de firewalld
sudo dnf install -y ufw
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow http
sudo ufw allow https
sudo ufw enable
```

---

## ✅ CHECKLIST DE SEGURANÇA

- [ ] Usuário não-root criado
- [ ] SSH configurado para usar apenas chaves
- [ ] Firewall configurado e ativo
- [ ] fail2ban instalado e ativo
- [ ] Root login desabilitado
- [ ] Portas desnecessárias fechadas
- [ ] SSL/HTTPS configurado
- [ ] Backups automáticos configurados (próximo passo)

---

## 📝 PRÓXIMOS PASSOS

1. Configurar backups automáticos
2. Configurar monitoramento (opcional)
3. Deploy da API
4. Deploy dos frontends

---

**Importante**: Guarde todas as senhas e chaves SSH em local seguro!

