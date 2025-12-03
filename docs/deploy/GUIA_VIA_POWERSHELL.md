# 💻 Guia Completo - Configuração VPS via PowerShell

## 🎯 Informações do Projeto

- **Domínio**: protesecapilarcuiaba.com.br
- **API**: api.protesecapilarcuiaba.com.br
- **VPS**: Hostinger KVM 2 (AlmaLinux 9)
- **CDN**: Cloudflare
- **Acesso**: PowerShell (Windows)

---

## 📖 PARTE 1: CLOUDFLARE (Interface Web)

### 1️⃣ Adicionar Domínio ao Cloudflare

1. Acesse: https://dash.cloudflare.com
2. Clique em **"Add a Site"**
3. Digite: `protesecapilarcuiaba.com.br`
4. Plano: **Free** (gratuito)
5. Clique em **"Continue"**

### 2️⃣ Configurar DNS no Cloudflare

Adicione os seguintes registros DNS:

**Registros A:**

| Type | Name  | Content       | Proxy Status    | TTL  |
|------|-------|---------------|-----------------|------|
| A    | @     | IP_DA_VPS     | 🟠 Proxied      | Auto |
| A    | www   | IP_DA_VPS     | 🟠 Proxied      | Auto |
| A    | app   | IP_DA_VPS     | 🟠 Proxied      | Auto |
| A    | admin | IP_DA_VPS     | 🟠 Proxied      | Auto |
| A    | api   | IP_DA_VPS     | ☁️ DNS only     | Auto |

**⚠️ IMPORTANTE:**
- **www, app, admin**: Use **Proxied** (ícone laranja 🟠)
- **api**: Use **DNS only** (ícone cinza ☁️)

### 3️⃣ Alterar Nameservers

1. Cloudflare mostrará nameservers (exemplo):
   ```
   chloe.ns.cloudflare.com
   noel.ns.cloudflare.com
   ```

2. Acesse: https://registro.br
3. Login → **Meus Domínios**
4. Selecione: `protesecapilarcuiaba.com.br`
5. **Alterar Servidores DNS**
6. Adicione os nameservers do Cloudflare
7. Aguarde propagação (2-4 horas geralmente)

### 4️⃣ Configurar SSL no Cloudflare

1. **SSL/TLS** → **Overview**
   - Modo: **Full (strict)** ⚠️ IMPORTANTE!

2. **Edge Certificates** → Ativar:
   - ✅ Always Use HTTPS
   - ✅ Automatic HTTPS Rewrites
   - TLS Mínimo: **TLS 1.2**

3. **Speed** → **Optimization**:
   - ✅ Auto Minify (JS, CSS, HTML)
   - ✅ Brotli

4. **Security** → **Settings**:
   - Security Level: **Medium**

---

## 📖 PARTE 2: VPS (Via PowerShell)

### 🔐 ETAPA 1: PRIMEIRO ACESSO

**No PowerShell:**

```powershell
# Conectar na VPS como root
ssh root@IP_DA_VPS
```

Digite a senha fornecida pela Hostinger.

---

### 👤 ETAPA 2: CRIAR USUÁRIO SEGURO

```bash
# Criar usuário desenvolvedor
adduser desenvolvedor

# Adicionar ao grupo wheel (permissões sudo)
usermod -aG wheel desenvolvedor

# Definir senha forte
passwd desenvolvedor
```

Digite uma senha forte (mínimo 16 caracteres, letras, números e símbolos).

---

### 🔑 ETAPA 3: CONFIGURAR CHAVES SSH

**No PowerShell (nova aba, não feche a VPS):**

```powershell
# Verificar se já tem chave SSH
Test-Path ~\.ssh\id_ed25519

# Se retornar False, criar chave SSH
ssh-keygen -t ed25519 -C "seu-email@exemplo.com"

# Pressione Enter 3 vezes para aceitar padrões

# Copiar chave pública
Get-Content ~\.ssh\id_ed25519.pub | Set-Clipboard
Write-Host "Chave copiada! Cole na VPS."
```

**Na VPS (aba conectada como root):**

```bash
# Criar pasta .ssh
mkdir -p /home/desenvolvedor/.ssh
chmod 700 /home/desenvolvedor/.ssh

# Adicionar chave pública
nano /home/desenvolvedor/.ssh/authorized_keys
```

**Cole a chave** (Ctrl+V no nano) e salve (Ctrl+X, Y, Enter)

```bash
# Configurar permissões
chmod 600 /home/desenvolvedor/.ssh/authorized_keys
chown -R desenvolvedor:desenvolvedor /home/desenvolvedor/.ssh
```

**Testar no PowerShell:**

```powershell
ssh desenvolvedor@IP_DA_VPS
# Deve conectar SEM pedir senha
```

✅ Se conectou sem senha, está funcionando!

---

### 🔒 ETAPA 4: DESABILITAR ROOT E SENHA SSH

**Na VPS:**

```bash
# Editar configuração SSH
sudo nano /etc/ssh/sshd_config
```

**Localizar e alterar estas linhas:**

```ini
PermitRootLogin no
PasswordAuthentication no
PubkeyAuthentication yes
```

**Salvar (Ctrl+X, Y, Enter) e reiniciar SSH:**

```bash
sudo systemctl restart sshd
```

⚠️ **Mantenha uma conexão aberta** e teste em outra janela antes de fechar!

---

### 🛡️ ETAPA 5: CONFIGURAR FIREWALL

```bash
# Iniciar firewall
sudo systemctl start firewalld
sudo systemctl enable firewalld

# Abrir portas
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

### 📦 ETAPA 6: INSTALAR TODAS AS DEPENDÊNCIAS

**Copie e cole cada bloco:**

#### Atualizar Sistema

```bash
sudo dnf update -y
```

#### Ferramentas Básicas

```bash
sudo dnf install -y curl wget git nano htop
```

#### Node.js 20 LTS

```bash
curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
sudo dnf install -y nodejs
node --version
npm --version
```

#### PM2

```bash
sudo npm install -g pm2
pm2 startup systemd
```

⚠️ **Copie e execute** o comando que aparecer na tela!

#### PostgreSQL 15

```bash
sudo dnf install -y https://download.postgresql.org/pub/repos/yum/reporpms/EL-9-x86_64/pgdg-redhat-repo-latest.noarch.rpm
sudo dnf install -y postgresql15-server postgresql15
sudo postgresql-15-setup initdb
sudo systemctl start postgresql-15
sudo systemctl enable postgresql-15
```

#### Nginx

```bash
sudo dnf install -y nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

#### Certbot (SSL)

```bash
sudo dnf install -y certbot python3-certbot-nginx
```

#### fail2ban

```bash
sudo dnf install -y fail2ban
sudo cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local
sudo systemctl start fail2ban
sudo systemctl enable fail2ban
```

---

### 🗄️ ETAPA 7: CONFIGURAR POSTGRESQL

```bash
# Acessar PostgreSQL
sudo -u postgres psql
```

**Execute linha por linha:**

```sql
-- Senha do postgres
ALTER USER postgres WITH PASSWORD 'SuaSenhaPostgres123!@#';

-- Criar banco
CREATE DATABASE protese_capilar;

-- Criar usuário
CREATE USER protese_user WITH PASSWORD 'SenhaApp123!@#';

-- Permissões
GRANT ALL PRIVILEGES ON DATABASE protese_capilar TO protese_user;

-- Sair
\q
```

**Configurar autenticação:**

```bash
sudo nano /var/lib/pgsql/15/data/pg_hba.conf
```

**Alterar todas as ocorrências de `peer` e `ident` para `md5`:**

```ini
local   all             all                                     md5
host    all             all             127.0.0.1/32            md5
host    all             all             ::1/128                 md5
```

**Reiniciar PostgreSQL:**

```bash
sudo systemctl restart postgresql-15
```

**Testar conexão:**

```bash
psql -h localhost -U protese_user -d protese_capilar
# Digite a senha quando solicitado
# Se conectar, digite \q para sair
```

---

### 📁 ETAPA 8: CRIAR ESTRUTURA DE PASTAS

```bash
# Criar diretórios
sudo mkdir -p /var/www/site-publico
sudo mkdir -p /var/www/painel-cliente
sudo mkdir -p /var/www/painel-admin
sudo mkdir -p /home/desenvolvedor/app/backend
sudo mkdir -p /home/desenvolvedor/app/frontend
sudo mkdir -p /home/desenvolvedor/app/backend/logs

# Configurar permissões
sudo chown -R desenvolvedor:desenvolvedor /home/desenvolvedor/app
sudo chown -R desenvolvedor:nginx /var/www
sudo chmod -R 755 /var/www
```

---

### 🌐 ETAPA 9: CONFIGURAR NGINX

#### 9.1 Criar Configuração da API

```bash
sudo nano /etc/nginx/conf.d/api.conf
```

**Copie o conteúdo de:** `scripts/templates-nginx/api.conf`

Cole e salve (Ctrl+X, Y, Enter)

#### 9.2 Testar Configuração

```bash
sudo nginx -t
```

Deve mostrar: **syntax is ok** e **test is successful**

```bash
sudo systemctl reload nginx
```

---

### 🔐 ETAPA 10: CONFIGURAR SSL

⚠️ **AGUARDE** a propagação DNS do Cloudflare (2-4 horas)!

**Verificar propagação no PowerShell:**

```powershell
nslookup api.protesecapilarcuiaba.com.br
```

Deve retornar o IP da VPS.

**Quando DNS estiver propagado, na VPS:**

```bash
# Gerar certificado SSL para API
sudo certbot --nginx -d api.protesecapilarcuiaba.com.br

# Seguir instruções:
# 1. Email de contato
# 2. (A) Aceitar termos
# 3. (Y) Compartilhar email
# 4. (2) Redirecionar HTTP para HTTPS
```

---

## ✅ VERIFICAÇÃO FINAL

### No PowerShell:

```powershell
# Testar DNS
nslookup api.protesecapilarcuiaba.com.br
nslookup www.protesecapilarcuiaba.com.br

# Testar HTTPS (quando SSL estiver configurado)
curl.exe -I https://api.protesecapilarcuiaba.com.br
```

### Na VPS:

```bash
# Verificar todos os serviços
sudo systemctl status firewalld
sudo systemctl status nginx
sudo systemctl status postgresql-15
sudo systemctl status fail2ban

# Verificar portas abertas
sudo firewall-cmd --list-all

# Verificar SSL
sudo certbot certificates
```

---

## 📝 RESUMO DE CREDENCIAIS

```
═══════════════════════════════════════════════════════════
POSTGRESQL
═══════════════════════════════════════════════════════════
Host: localhost
Port: 5432
Database: protese_capilar
User: protese_user
Password: [a senha que você definiu]

═══════════════════════════════════════════════════════════
SSH (PowerShell)
═══════════════════════════════════════════════════════════
ssh desenvolvedor@IP_DA_VPS
Chave: C:\Users\SEU_USUARIO\.ssh\id_ed25519

═══════════════════════════════════════════════════════════
DOMÍNIOS
═══════════════════════════════════════════════════════════
API:   https://api.protesecapilarcuiaba.com.br
App:   https://app.protesecapilarcuiaba.com.br
Admin: https://admin.protesecapilarcuiaba.com.br
Site:  https://www.protesecapilarcuiaba.com.br
```

---

## 🔄 PRÓXIMOS PASSOS

1. ✅ Cloudflare configurado
2. ✅ VPS configurada via PowerShell
3. ✅ PostgreSQL pronto
4. ✅ Nginx configurado
5. ✅ SSL configurado
6. 🔄 Criar backend
7. 🔄 Deploy da API

---

## 📞 COMANDOS ÚTEIS (PowerShell)

```powershell
# Conectar na VPS
ssh desenvolvedor@IP_DA_VPS

# Copiar arquivos para VPS
scp -r .\pasta\ desenvolvedor@IP_DA_VPS:/home/desenvolvedor/app/

# Ver logs em tempo real (na VPS)
sudo tail -f /var/log/nginx/api.access.log
```

---

**VPS configurada com sucesso via PowerShell!** 🎉



