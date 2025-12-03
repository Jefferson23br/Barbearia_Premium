# ⚡ Início Rápido - Configuração VPS

## 🎯 Domínio: protesecapilarcuiaba.com.br

---

## 📋 PRÉ-REQUISITOS

- [ ] Acesso SSH da VPS (IP + senha root)
- [ ] Domínio em mãos
- [ ] Conta no Cloudflare (gratuito)
- [ ] Conta no Registro.br
- [ ] PowerShell (Windows)

---

## ☁️ PARTE 1: CLOUDFLARE (5 minutos)

### 1. Adicionar Domínio

- Acesse: https://dash.cloudflare.com
- Add a Site → `protesecapilarcuiaba.com.br`
- Plano: Free

### 2. Configurar DNS

Adicionar registros A:

```
www   → IP_DA_VPS (Proxied 🟠)
app   → IP_DA_VPS (Proxied 🟠)
admin → IP_DA_VPS (Proxied 🟠)
api   → IP_DA_VPS (DNS only ☁️)
@     → IP_DA_VPS (Proxied 🟠)
```

### 3. Alterar Nameservers

- Registro.br → Alterar DNS
- Adicionar nameservers do Cloudflare
- Aguardar 2-4 horas

### 4. Configurar SSL

- SSL Mode: **Full (strict)**
- Always Use HTTPS: ✅

---

## 💻 PARTE 2: VPS (30-40 minutos)

### PowerShell - Conectar

```powershell
ssh root@IP_DA_VPS
```

### 1. Criar Usuário e SSH

```bash
adduser desenvolvedor
usermod -aG wheel desenvolvedor
passwd desenvolvedor
```

**PowerShell (nova aba):**

```powershell
ssh-keygen -t ed25519
Get-Content ~\.ssh\id_ed25519.pub | Set-Clipboard
```

**VPS:**

```bash
mkdir -p /home/desenvolvedor/.ssh
nano /home/desenvolvedor/.ssh/authorized_keys
# Cole e salve

chmod 600 /home/desenvolvedor/.ssh/authorized_keys
chown -R desenvolvedor:desenvolvedor /home/desenvolvedor/.ssh
```

### 2. Instalar Tudo (copie e cole)

```bash
# Firewall
sudo systemctl start firewalld
sudo systemctl enable firewalld
sudo firewall-cmd --permanent --add-service={ssh,http,https}
sudo firewall-cmd --permanent --add-port=3001/tcp
sudo firewall-cmd --reload

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

# SSL + Segurança
sudo dnf install -y certbot python3-certbot-nginx fail2ban
sudo systemctl start fail2ban
sudo systemctl enable fail2ban
```

### 3. PostgreSQL

```bash
sudo -u postgres psql
```

```sql
ALTER USER postgres WITH PASSWORD 'SenhaForte123!';
CREATE DATABASE protese_capilar;
CREATE USER protese_user WITH PASSWORD 'SenhaApp123!';
GRANT ALL PRIVILEGES ON DATABASE protese_capilar TO protese_user;
\q
```

```bash
sudo nano /var/lib/pgsql/15/data/pg_hba.conf
# Mudar peer/ident para md5
sudo systemctl restart postgresql-15
```

### 4. Nginx - API

```bash
sudo nano /etc/nginx/conf.d/api.conf
```

Cole o template de `scripts/templates-nginx/api.conf`

```bash
sudo nginx -t
sudo systemctl reload nginx
```

### 5. SSL (Aguardar DNS!)

```bash
# Testar DNS
curl http://api.protesecapilarcuiaba.com.br

# Se responder, configurar SSL:
sudo certbot --nginx -d api.protesecapilarcuiaba.com.br
```

---

## ✅ PRONTO!

VPS configurada. Próximo: criar backend.

**Documentação completa:** `docs/deploy/GUIA_VIA_POWERSHELL.md`



