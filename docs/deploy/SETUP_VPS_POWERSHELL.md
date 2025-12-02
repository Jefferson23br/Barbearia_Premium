# 💻 Configuração da VPS via PowerShell (SSH)

## 🎯 Informações do Projeto

- **Domínio**: protesecapilarcuiaba.com.br
- **API**: api.protesecapilarcuiaba.com.br
- **VPS**: Hostinger KVM 2
- **Sistema**: AlmaLinux 9
- **Acesso**: PowerShell via SSH

---

## 🔐 PASSO 1: CONECTAR VIA SSH (PowerShell)

### 1.1 Primeiro Acesso

No PowerShell do Windows:

```powershell
# Conectar como root (primeira vez)
ssh root@IP_DA_VPS

# Digite a senha fornecida pela Hostinger
```

---

## 👤 PASSO 2: CRIAR USUÁRIO SEGURO

### 2.1 Criar Usuário Desenvolvedor

```bash
# Criar usuário
adduser desenvolvedor

# Adicionar ao grupo wheel (permite usar sudo)
usermod -aG wheel desenvolvedor

# Definir senha forte (mínimo 16 caracteres)
passwd desenvolvedor
```

Digite uma senha forte e guarde-a em local seguro.

### 2.2 Configurar Chaves SSH

**No seu PowerShell (Windows):**

```powershell
# Verificar se já tem chave SSH
Test-Path ~\.ssh\id_ed25519

# Se não tiver, gerar chave SSH
ssh-keygen -t ed25519 -C "seu-email@exemplo.com"

# Pressione Enter 3 vezes (aceita padrões)
```

**Copiar chave para o servidor:**

```powershell
# Exibir chave pública
Get-Content ~\.ssh\id_ed25519.pub
```

**Na VPS (conectado como root):**

```bash
# Criar pasta .ssh para o usuário desenvolvedor
mkdir -p /home/desenvolvedor/.ssh
chmod 700 /home/desenvolvedor/.ssh

# Adicionar chave pública (cole a chave que copiou)
nano /home/desenvolvedor/.ssh/authorized_keys
# Cole a chave e salve (Ctrl+X, Y, Enter)

# Configurar permissões
chmod 600 /home/desenvolvedor/.ssh/authorized_keys
chown -R desenvolvedor:desenvolvedor /home/desenvolvedor/.ssh
```

**Testar conexão sem senha:**

```powershell
# No PowerShell
ssh desenvolvedor@IP_DA_VPS
# Deve conectar SEM pedir senha
```

### 2.3 Desabilitar Login Root e Senha

**Na VPS:**

```bash
sudo nano /etc/ssh/sshd_config
```

**Alterar estas linhas:**

```ini
# Encontre e altere:
PermitRootLogin no
PasswordAuthentication no
PubkeyAuthentication yes
```

**Salvar (Ctrl+X, Y, Enter) e reiniciar SSH:**

```bash
sudo systemctl restart sshd
```

⚠️ **NÃO FECHE A CONEXÃO ATUAL!** Teste em outra janela primeiro.

---

## 🛡️ PASSO 3: CONFIGURAR FIREWALL

```bash
# Iniciar firewall
sudo systemctl start firewalld
sudo systemctl enable firewalld

# Abrir portas necessárias
sudo firewall-cmd --permanent --add-service=ssh
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --permanent --add-port=3001/tcp

# Aplicar
sudo firewall-cmd --reload

# Verificar
sudo firewall-cmd --list-all
```

---

## 🔧 PASSO 4: INSTALAR DEPENDÊNCIAS

### 4.1 Atualizar Sistema

```bash
sudo dnf update -y
sudo dnf upgrade -y
```

### 4.2 Instalar Ferramentas Básicas

```bash
sudo dnf install -y curl wget git nano htop
```

### 4.3 Instalar Node.js 20 LTS

```bash
# Adicionar repositório
curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -

# Instalar Node.js
sudo dnf install -y nodejs

# Verificar
node --version
npm --version
```

### 4.4 Instalar PM2

```bash
sudo npm install -g pm2

# Configurar para iniciar no boot
pm2 startup systemd
# Copie e execute o comando que aparecer
```

### 4.5 Instalar PostgreSQL 15

```bash
# Adicionar repositório PostgreSQL
sudo dnf install -y https://download.postgresql.org/pub/repos/yum/reporpms/EL-9-x86_64/pgdg-redhat-repo-latest.noarch.rpm

# Instalar PostgreSQL
sudo dnf install -y postgresql15-server postgresql15

# Inicializar
sudo postgresql-15-setup initdb

# Iniciar e habilitar
sudo systemctl start postgresql-15
sudo systemctl enable postgresql-15

# Verificar
sudo systemctl status postgresql-15
```

### 4.6 Instalar Nginx

```bash
sudo dnf install -y nginx

# Iniciar e habilitar
sudo systemctl start nginx
sudo systemctl enable nginx

# Verificar
sudo systemctl status nginx
```

### 4.7 Instalar Certbot (SSL)

```bash
sudo dnf install -y certbot python3-certbot-nginx
```

### 4.8 Instalar fail2ban

```bash
sudo dnf install -y fail2ban

# Copiar configuração
sudo cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local

# Iniciar
sudo systemctl start fail2ban
sudo systemctl enable fail2ban
```

---

## 🗄️ PASSO 5: CONFIGURAR POSTGRESQL

### 5.1 Definir Senhas e Criar Banco

```bash
# Acessar PostgreSQL
sudo -u postgres psql
```

**No prompt do PostgreSQL:**

```sql
-- Definir senha do postgres
ALTER USER postgres WITH PASSWORD 'SENHA_FORTE_POSTGRES';

-- Criar banco de dados
CREATE DATABASE protese_capilar;

-- Criar usuário da aplicação
CREATE USER protese_user WITH PASSWORD 'SENHA_FORTE_APP';

-- Dar permissões
GRANT ALL PRIVILEGES ON DATABASE protese_capilar TO protese_user;

-- Sair
\q
```

### 5.2 Configurar Acesso Local

```bash
# Editar pg_hba.conf
sudo nano /var/lib/pgsql/15/data/pg_hba.conf
```

**Alterar as linhas para usar md5:**

```ini
# Antes:
local   all             all                                     peer
host    all             all             127.0.0.1/32            ident
host    all             all             ::1/128                 ident

# Depois:
local   all             all                                     md5
host    all             all             127.0.0.1/32            md5
host    all             all             ::1/128                 md5
```

**Salvar e reiniciar:**

```bash
sudo systemctl restart postgresql-15
```

### 5.3 Testar Conexão

```bash
# Testar conexão
psql -h localhost -U protese_user -d protese_capilar

# Digite a senha quando solicitado
# Se conectar com sucesso, digite \q para sair
```

---

## 🌐 PASSO 6: CONFIGURAR NGINX PARA API

### 6.1 Criar Configuração da API

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

    # SSL (será adicionado pelo Certbot)
    # ssl_certificate /etc/letsencrypt/live/api.protesecapilarcuiaba.com.br/fullchain.pem;
    # ssl_certificate_key /etc/letsencrypt/live/api.protesecapilarcuiaba.com.br/privkey.pem;

    # Headers de Segurança
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

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
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Health check
    location /health {
        proxy_pass http://localhost:3001/health;
        access_log off;
    }
}
```

**Testar e recarregar:**

```bash
sudo nginx -t
sudo systemctl reload nginx
```

---

## 🔐 PASSO 7: CONFIGURAR SSL (HTTPS)

### 7.1 Aguardar Propagação DNS

Antes de configurar SSL, verifique se o DNS está propagado:

```bash
# Testar
curl -I http://api.protesecapilarcuiaba.com.br
```

Se retornar algo, o DNS está propagado.

### 7.2 Gerar Certificado SSL

```bash
# Gerar certificado para API
sudo certbot --nginx -d api.protesecapilarcuiaba.com.br

# Seguir as instruções:
# - Email de contato
# - Aceitar termos
# - Redirecionar HTTP para HTTPS? Sim (2)
```

### 7.3 Testar Renovação Automática

```bash
sudo certbot renew --dry-run
```

Se mostrar sucesso, a renovação automática está configurada.

---

## 📁 PASSO 8: CRIAR ESTRUTURA DE DIRETÓRIOS

```bash
# Criar pastas
sudo mkdir -p /var/www/{site-publico,painel-cliente,painel-admin}
sudo mkdir -p /home/desenvolvedor/app/{backend,frontend}
sudo mkdir -p /home/desenvolvedor/app/backend/logs

# Configurar permissões
sudo chown -R desenvolvedor:desenvolvedor /home/desenvolvedor/app
sudo chown -R desenvolvedor:nginx /var/www
sudo chmod -R 755 /var/www
```

---

## ✅ VERIFICAÇÃO FINAL

### Verificar Todos os Serviços

```bash
# Status dos serviços
sudo systemctl status firewalld
sudo systemctl status fail2ban
sudo systemctl status nginx
sudo systemctl status postgresql-15
sudo systemctl status sshd
```

Todos devem estar **active (running)**.

### Testar Acesso

```bash
# Testar Nginx
curl http://localhost

# Testar API (quando backend estiver rodando)
curl http://localhost:3001/health
```

---

## 📝 CREDENCIAIS PARA GUARDAR

```
═══════════════════════════════════════════════════════════
POSTGRESQL
═══════════════════════════════════════════════════════════
Host: localhost
Port: 5432
Database: protese_capilar
User: protese_user
Password: [senha que você definiu]

═══════════════════════════════════════════════════════════
SSH
═══════════════════════════════════════════════════════════
Host: IP_DA_VPS
User: desenvolvedor
Porta: 22
Chave: ~\.ssh\id_ed25519

═══════════════════════════════════════════════════════════
DOMÍNIOS
═══════════════════════════════════════════════════════════
Site:  https://www.protesecapilarcuiaba.com.br
App:   https://app.protesecapilarcuiaba.com.br
Admin: https://admin.protesecapilarcuiaba.com.br
API:   https://api.protesecapilarcuiaba.com.br
```

---

## 🔄 PRÓXIMOS PASSOS

1. ✅ VPS configurada
2. ✅ Segurança implementada
3. ✅ Cloudflare configurado
4. 🔄 Criar estrutura do backend
5. 🔄 Deploy da API
6. 🔄 Conectar frontend com API

---

**VPS pronta para receber o backend!** 🚀

