# 🚀 Passo a Passo Completo - VPS + Cloudflare

## 📋 Informações do Projeto

- **Domínio**: protesecapilarcuiaba.com.br
- **VPS**: Hostinger KVM 2 (AlmaLinux 9)
- **CDN**: Cloudflare
- **Acesso**: PowerShell via SSH

---

## 🎯 Estrutura Final

```
Cloudflare (Proxy)
    ↓
www.protesecapilarcuiaba.com.br    → Site Público
app.protesecapilarcuiaba.com.br    → Painel Cliente
admin.protesecapilarcuiaba.com.br  → Painel Admin

Direto (DNS Only)
    ↓
api.protesecapilarcuiaba.com.br    → API Backend (Node.js :3001)
```

---

## 📖 PARTE 1: CLOUDFLARE

### 1.1 Adicionar Domínio

1. Acesse https://dash.cloudflare.com
2. Clique em **"Add a Site"**
3. Digite: `protesecapilarcuiaba.com.br`
4. Selecione plano **Free**
5. Clique em **"Continue"**

### 1.2 Configurar DNS

Adicione os seguintes registros A:

| Type | Name  | Content    | Proxy Status | TTL  |
|------|-------|------------|--------------|------|
| A    | @     | IP_DA_VPS  | Proxied 🟠   | Auto |
| A    | www   | IP_DA_VPS  | Proxied 🟠   | Auto |
| A    | app   | IP_DA_VPS  | Proxied 🟠   | Auto |
| A    | admin | IP_DA_VPS  | Proxied 🟠   | Auto |
| A    | api   | IP_DA_VPS  | DNS only ☁️  | Auto |

### 1.3 Alterar Nameservers

1. Cloudflare mostrará nameservers (ex: `chloe.ns.cloudflare.com`)
2. Acesse https://registro.br
3. Faça login
4. Vá em **Meus Domínios** → `protesecapilarcuiaba.com.br`
5. **Alterar Servidores DNS**
6. Adicione os nameservers do Cloudflare
7. Aguarde propagação (2-48h, geralmente 2-4h)

### 1.4 Configurar SSL no Cloudflare

1. **SSL/TLS** → **Overview** → Selecione: **Full (strict)**
2. **Edge Certificates** → Ative:
   - Always Use HTTPS ✅
   - Automatic HTTPS Rewrites ✅
   - Minimum TLS Version: TLS 1.2

### 1.5 Configurar Performance

1. **Speed** → **Optimization**:
   - Auto Minify: JS, CSS, HTML ✅
   - Brotli ✅

2. **Caching**:
   - Caching Level: Standard
   - Browser Cache TTL: 4 hours

---

## 📖 PARTE 2: VPS (VIA POWERSHELL)

### 2.1 Conectar na VPS

**No PowerShell:**

```powershell
ssh root@IP_DA_VPS
```

### 2.2 Criar Usuário e Configurar SSH

```bash
# Criar usuário
adduser desenvolvedor
usermod -aG wheel desenvolvedor
passwd desenvolvedor
```

**No PowerShell (nova aba):**

```powershell
# Gerar chave SSH (se não tiver)
ssh-keygen -t ed25519 -C "seu-email@exemplo.com"

# Copiar chave
Get-Content ~\.ssh\id_ed25519.pub | clip
```

**Na VPS:**

```bash
# Configurar SSH
mkdir -p /home/desenvolvedor/.ssh
nano /home/desenvolvedor/.ssh/authorized_keys
# Cole a chave (Ctrl+V) e salve (Ctrl+X, Y, Enter)

chmod 600 /home/desenvolvedor/.ssh/authorized_keys
chmod 700 /home/desenvolvedor/.ssh
chown -R desenvolvedor:desenvolvedor /home/desenvolvedor/.ssh

# Desabilitar root e senha
sudo nano /etc/ssh/sshd_config
```

**Alterar:**

```ini
PermitRootLogin no
PasswordAuthentication no
```

**Reiniciar SSH:**

```bash
sudo systemctl restart sshd
```

**Testar no PowerShell:**

```powershell
ssh desenvolvedor@IP_DA_VPS
# Deve conectar sem senha
```

### 2.3 Configurar Firewall

```bash
sudo systemctl start firewalld
sudo systemctl enable firewalld
sudo firewall-cmd --permanent --add-service=ssh
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --permanent --add-port=3001/tcp
sudo firewall-cmd --reload
```

### 2.4 Instalar Tudo

**Copie e cole bloco por bloco:**

```bash
# Atualizar sistema
sudo dnf update -y

# Node.js
curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
sudo dnf install -y nodejs
sudo npm install -g pm2
pm2 startup systemd
# Execute o comando que aparecer

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

# Certbot
sudo dnf install -y certbot python3-certbot-nginx

# fail2ban
sudo dnf install -y fail2ban
sudo cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local
sudo systemctl start fail2ban
sudo systemctl enable fail2ban
```

### 2.5 Configurar PostgreSQL

```bash
sudo -u postgres psql
```

```sql
ALTER USER postgres WITH PASSWORD 'SuaSenhaSuperForte123!@#';
CREATE DATABASE protese_capilar;
CREATE USER protese_user WITH PASSWORD 'SenhaDaApp123!@#';
GRANT ALL PRIVILEGES ON DATABASE protese_capilar TO protese_user;
\q
```

```bash
# Configurar pg_hba.conf
sudo nano /var/lib/pgsql/15/data/pg_hba.conf
```

Alterar `peer/ident` para `md5` e salvar.

```bash
sudo systemctl restart postgresql-15
```

### 2.6 Criar Estrutura de Diretórios

```bash
sudo mkdir -p /var/www/{site-publico,painel-cliente,painel-admin}
sudo mkdir -p /home/desenvolvedor/app/{backend,frontend}
sudo mkdir -p /home/desenvolvedor/app/backend/logs
sudo chown -R desenvolvedor:desenvolvedor /home/desenvolvedor/app
sudo chown -R desenvolvedor:nginx /var/www
```

### 2.7 Configurar Nginx para API

```bash
sudo nano /etc/nginx/conf.d/api.conf
```

**Cole o template (ver TEMPLATES_NGINX.md)** e substitua pelo domínio real.

```bash
sudo nginx -t
sudo systemctl reload nginx
```

### 2.8 Configurar SSL

⚠️ **Aguardar propagação DNS do Cloudflare antes!**

```bash
# Testar se DNS está propagado
curl -I http://api.protesecapilarcuiaba.com.br

# Se responder, configurar SSL:
sudo certbot --nginx -d api.protesecapilarcuiaba.com.br

# Seguir instruções
# Escolher redirecionar HTTP → HTTPS
```

---

## ✅ VERIFICAÇÃO FINAL

### No PowerShell:

```powershell
# Testar DNS
nslookup api.protesecapilarcuiaba.com.br
nslookup www.protesecapilarcuiaba.com.br

# Testar SSL
curl -I https://api.protesecapilarcuiaba.com.br
```

### Na VPS:

```bash
# Verificar serviços
sudo systemctl status firewalld
sudo systemctl status nginx
sudo systemctl status postgresql-15
sudo systemctl status fail2ban
```

Todos devem estar **active (running)**.

---

## 📝 RESUMO DE CREDENCIAIS

**PostgreSQL:**
```
Host: localhost
Port: 5432
Database: protese_capilar
User: protese_user
Password: [a senha que você definiu]
```

**SSH (PowerShell):**
```powershell
ssh desenvolvedor@IP_DA_VPS
```

**Domínios:**
```
API:   https://api.protesecapilarcuiaba.com.br
App:   https://app.protesecapilarcuiaba.com.br
Admin: https://admin.protesecapilarcuiaba.com.br
Site:  https://www.protesecapilarcuiaba.com.br
```

---

## 🎯 PRÓXIMOS PASSOS

1. ✅ Cloudflare configurado
2. ✅ VPS configurada e segura
3. ✅ PostgreSQL pronto
4. ✅ Nginx configurado
5. ✅ SSL configurado
6. 🔄 Criar estrutura do backend
7. 🔄 Deploy da API

---

**Infraestrutura pronta!** 🎉

---

## 📞 Comandos Úteis para o Dia a Dia

```bash
# Conectar na VPS
ssh desenvolvedor@IP_DA_VPS

# Ver logs do Nginx
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# Ver processos PM2
pm2 status
pm2 logs

# Reiniciar serviços
sudo systemctl restart nginx
sudo systemctl restart postgresql-15

# Ver tentativas de ataque
sudo fail2ban-client status sshd
```



