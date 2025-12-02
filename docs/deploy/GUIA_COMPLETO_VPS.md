# 🚀 Guia Completo - Configuração da VPS Hostinger

## 📋 Informações do Projeto

- **Cliente**: Próteses Capilares Cuiabá
- **VPS**: Hostinger KVM 2
- **Sistema**: AlmaLinux 9
- **Domínio**: [INFORME AQUI]

---

## 🎯 Estrutura de Domínios Recomendada

```
api.seudominio.com        → API Backend (Node.js) - Porta 3001
app.seudominio.com        → Painel do Cliente (Next.js)
admin.seudominio.com      → Painel Administrativo (Next.js)
www.seudominio.com        → Site Público (Next.js)
```

**Vantagens dos subdomínios:**
- ✅ Organização clara
- ✅ SSL independente
- ✅ Fácil manutenção
- ✅ Melhor segurança
- ✅ Escalabilidade

---

## 🔐 PASSO 1: PRIMEIRO ACESSO E SEGURANÇA BÁSICA

### 1.1 Conectar na VPS

```bash
# Use as credenciais fornecidas pela Hostinger
ssh root@IP_DA_VPS
```

### 1.2 Criar Usuário Não-Root (IMPORTANTE!)

```bash
# Criar usuário
adduser desenvolvedor

# Adicionar ao grupo wheel (para usar sudo)
usermod -aG wheel desenvolvedor

# Definir senha forte (mínimo 16 caracteres)
passwd desenvolvedor
```

### 1.3 Configurar Chaves SSH (Eliminar Senhas)

**No seu computador local:**

```bash
# Gerar par de chaves SSH (se ainda não tiver)
ssh-keygen -t ed25519 -C "seu-email@exemplo.com"

# Copiar chave pública para o servidor
ssh-copy-id desenvolvedor@IP_DA_VPS
```

**Testar acesso sem senha:**

```bash
ssh desenvolvedor@IP_DA_VPS
# Deve conectar sem pedir senha
```

**Na VPS, configurar SSH para usar apenas chaves:**

```bash
sudo nano /etc/ssh/sshd_config
```

**Alterar estas linhas:**

```ini
# Desabilitar login root
PermitRootLogin no

# Desabilitar autenticação por senha
PasswordAuthentication no

# Habilitar autenticação por chave
PubkeyAuthentication yes
```

**Reiniciar SSH:**

```bash
sudo systemctl restart sshd
```

⚠️ **IMPORTANTE**: Teste o acesso antes de fechar a conexão atual!

---

## 🛡️ PASSO 2: CONFIGURAR FIREWALL

### 2.1 Iniciar e Configurar Firewalld

```bash
# Iniciar firewall
sudo systemctl start firewalld
sudo systemctl enable firewalld

# Abrir portas essenciais
sudo firewall-cmd --permanent --add-service=ssh
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https

# Porta da API (será acessada via Nginx, mas manter aberta)
sudo firewall-cmd --permanent --add-port=3001/tcp

# Aplicar configurações
sudo firewall-cmd --reload

# Verificar regras
sudo firewall-cmd --list-all
```

### 2.2 (OPCIONAL) Limitar SSH por IP

```bash
# Permitir SSH apenas do seu IP
sudo firewall-cmd --permanent --add-rich-rule='rule family="ipv4" source address="SEU_IP_AQUI" port protocol="tcp" port="22" accept'

# Remover regra genérica de SSH
sudo firewall-cmd --permanent --remove-service=ssh

# Recarregar
sudo firewall-cmd --reload
```

---

## 🔧 PASSO 3: INSTALAR DEPENDÊNCIAS

### 3.1 Atualizar Sistema

```bash
sudo dnf update -y
sudo dnf upgrade -y
```

### 3.2 Instalar Ferramentas Básicas

```bash
sudo dnf install -y curl wget git nano htop
```

### 3.3 Instalar Node.js 20 LTS

```bash
# Adicionar repositório NodeSource
curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -

# Instalar Node.js
sudo dnf install -y nodejs

# Verificar instalação
node --version  # Deve mostrar v20.x.x
npm --version
```

### 3.4 Instalar PM2 (Process Manager)

```bash
sudo npm install -g pm2

# Configurar PM2 para iniciar no boot
pm2 startup systemd
# Execute o comando que aparecer na tela
```

### 3.5 Instalar PostgreSQL 15

```bash
# Adicionar repositório oficial PostgreSQL
sudo dnf install -y https://download.postgresql.org/pub/repos/yum/reporpms/EL-9-x86_64/pgdg-redhat-repo-latest.noarch.rpm

# Instalar PostgreSQL
sudo dnf install -y postgresql15-server postgresql15

# Inicializar banco de dados
sudo postgresql-15-setup initdb

# Iniciar e habilitar PostgreSQL
sudo systemctl start postgresql-15
sudo systemctl enable postgresql-15

# Verificar status
sudo systemctl status postgresql-15
```

### 3.6 Configurar PostgreSQL

```bash
# Definir senha do usuário postgres
sudo -u postgres psql

# No prompt do PostgreSQL, execute:
ALTER USER postgres WITH PASSWORD 'SENHA_FORTE_AQUI';
CREATE DATABASE protese_capilar;
CREATE USER protese_user WITH PASSWORD 'SENHA_FORTE_AQUI';
GRANT ALL PRIVILEGES ON DATABASE protese_capilar TO protese_user;
\q
```

**Configurar acesso local:**

```bash
sudo nano /var/lib/pgsql/15/data/pg_hba.conf
```

**Alterar para:**

```
local   all             all                                     md5
host    all             all             127.0.0.1/32            md5
host    all             all             ::1/128                 md5
```

**Reiniciar PostgreSQL:**

```bash
sudo systemctl restart postgresql-15
```

### 3.7 Instalar Nginx

```bash
sudo dnf install -y nginx

# Iniciar e habilitar
sudo systemctl start nginx
sudo systemctl enable nginx

# Verificar status
sudo systemctl status nginx
```

### 3.8 Instalar Certbot (SSL/HTTPS)

```bash
sudo dnf install -y certbot python3-certbot-nginx
```

### 3.9 Instalar fail2ban (Proteção contra Ataques)

```bash
sudo dnf install -y fail2ban

# Criar configuração
sudo cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local

# Editar configuração
sudo nano /etc/fail2ban/jail.local
```

**Configurar [sshd]:**

```ini
[sshd]
enabled = true
port = ssh
logpath = %(sshd_log)s
maxretry = 5
bantime = 3600
findtime = 600
```

**Iniciar fail2ban:**

```bash
sudo systemctl start fail2ban
sudo systemctl enable fail2ban

# Verificar status
sudo fail2ban-client status sshd
```

---

## 🌐 PASSO 4: CONFIGURAR DNS (Na Hostinger)

No painel da Hostinger, adicionar os seguintes registros A:

```
Tipo    Nome                    Valor
A       api                     IP_DA_VPS
A       app                     IP_DA_VPS
A       admin                   IP_DA_VPS
A       www                     IP_DA_VPS
A       @ (ou vazio)            IP_DA_VPS
```

**Aguarde a propagação DNS** (pode levar alguns minutos até 24 horas)

---

## 🔧 PASSO 5: CONFIGURAR NGINX PARA API

### 5.1 Criar Configuração da API

```bash
sudo nano /etc/nginx/conf.d/api.conf
```

**Conteúdo completo:**

```nginx
# API Backend - api.seudominio.com
server {
    listen 80;
    server_name api.seudominio.com;

    # Redirecionar HTTP para HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.seudominio.com;

    # SSL será configurado pelo Certbot
    # As linhas abaixo serão adicionadas automaticamente pelo Certbot:
    # ssl_certificate /etc/letsencrypt/live/api.seudominio.com/fullchain.pem;
    # ssl_certificate_key /etc/letsencrypt/live/api.seudominio.com/privkey.pem;
    # include /etc/letsencrypt/options-ssl-nginx.conf;
    # ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    # Headers de Segurança
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;

    # Tamanho máximo de upload
    client_max_body_size 10M;

    # Rate Limiting (proteção contra DDoS)
    limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;
    limit_req zone=api_limit burst=20 nodelay;

    # Proxy para API Node.js
    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        
        # Headers importantes
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

    # Health check endpoint (sem rate limit)
    location /health {
        proxy_pass http://localhost:3001/health;
        limit_req off;
    }
}
```

### 5.2 Testar Configuração

```bash
# Testar sintaxe
sudo nginx -t

# Se estiver OK, recarregar
sudo systemctl reload nginx
```

---

## 🔐 PASSO 6: CONFIGURAR SSL/HTTPS

### 6.1 Gerar Certificado SSL para API

**Aguardar propagação DNS antes de continuar!**

```bash
# Gerar certificado SSL
sudo certbot --nginx -d api.seudominio.com

# Seguir as instruções:
# - Email de contato
# - Aceitar termos
# - Escolher redirecionar HTTP para HTTPS
```

### 6.2 Verificar Certificado

```bash
# Testar renovação (não renova, apenas testa)
sudo certbot renew --dry-run

# Certbot já configura renovação automática
sudo systemctl status certbot.timer
```

---

## 📁 PASSO 7: CRIAR ESTRUTURA DE DIRETÓRIOS

```bash
# Criar estrutura para aplicações
sudo mkdir -p /var/www/{site-publico,painel-cliente,painel-admin}
sudo mkdir -p /home/desenvolvedor/app/{backend,frontend}
sudo mkdir -p /home/desenvolvedor/app/backend/logs

# Configurar permissões
sudo chown -R desenvolvedor:desenvolvedor /home/desenvolvedor/app
sudo chown -R desenvolvedor:nginx /var/www
sudo chmod -R 755 /var/www
```

---

## ✅ PASSO 8: VERIFICAÇÃO FINAL

### 8.1 Verificar Todos os Serviços

```bash
# Status dos serviços
sudo systemctl status firewalld
sudo systemctl status fail2ban
sudo systemctl status nginx
sudo systemctl status postgresql-15
sudo systemctl status sshd

# Todos devem estar "active (running)"
```

### 8.2 Verificar Portas Abertas

```bash
sudo firewall-cmd --list-all

# Deve mostrar:
# - ssh
# - http
# - https
# - 3001/tcp
```

### 8.3 Testar Acesso

```bash
# Testar API (quando backend estiver rodando)
curl http://localhost:3001/health

# Testar Nginx
curl http://localhost

# Testar SSL (após configurar)
curl https://api.seudominio.com
```

---

## 📝 RESUMO DE CREDENCIAIS

**Guarde estas informações em local seguro:**

```
PostgreSQL:
- Host: localhost
- Port: 5432
- Database: protese_capilar
- User: protese_user
- Password: [senha definida]

SSH:
- User: desenvolvedor
- IP: [IP da VPS]
- Port: 22

Domínios:
- API: api.seudominio.com
- App: app.seudominio.com
- Admin: admin.seudominio.com
- Site: www.seudominio.com
```

---

## 🔄 PRÓXIMOS PASSOS

1. ✅ VPS configurada e segura
2. 🔄 Criar estrutura inicial do backend
3. 🔄 Deploy da API na porta 3001
4. 🔄 Configurar variáveis de ambiente
5. 🔄 Testar conexão API → Banco de dados

---

**VPS configurada e pronta para receber o backend!** 🚀



