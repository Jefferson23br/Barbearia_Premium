# 🎨 Configuração VPS Frontend - 45.132.157.28

## 🎯 Informações

- **IP**: 45.132.157.28
- **Uso**: Apenas arquivos estáticos (Frontend)
- **Sistema**: [Sistema da Hostinger]
- **Domínios**:
  - appbarber.auctusconsultoria.com.br
  - appbarber.auctusconsultoria.com.br
  - appbarber.auctusconsultoria.com.br

---

## 📦 O Que Instalar

Esta VPS é mais simples, só precisa servir arquivos estáticos!

```bash
# Conectar via PowerShell
ssh root@45.132.157.28
```

### 1. Segurança Básica

```bash
# Criar usuário
adduser desenvolvedor
usermod -aG wheel desenvolvedor
passwd desenvolvedor

# Configurar SSH com chaves
```

### 2. Firewall

```bash
sudo systemctl start firewalld
sudo systemctl enable firewalld
sudo firewall-cmd --permanent --add-service=ssh
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --reload
```

### 3. Instalar Apenas Nginx e Certbot

```bash
# Atualizar
sudo dnf update -y

# Nginx
sudo dnf install -y nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# Certbot
sudo dnf install -y certbot python3-certbot-nginx

# fail2ban (opcional mas recomendado)
sudo dnf install -y fail2ban
sudo systemctl start fail2ban
sudo systemctl enable fail2ban
```

**NÃO precisa instalar:**
- ❌ Node.js (opcional, só se quiser fazer build aqui)
- ❌ Oracle / banco da API (fica na VPS do backend ou serviço gerenciado — não no servidor de front estático)
- ❌ PM2 (não tem Node rodando)

---

## 📁 Criar Estrutura de Pastas

```bash
sudo mkdir -p /var/www/site-entrada
sudo mkdir -p /var/www/painel-cliente
sudo mkdir -p /var/www/painel-admin

# Permissões
sudo chown -R desenvolvedor:nginx /var/www
sudo chmod -R 755 /var/www
```

---

## 🌐 Configurar Nginx

### Criar configurações:

```bash
sudo nano /etc/nginx/conf.d/www.conf
# Cole o template

sudo nano /etc/nginx/conf.d/app.conf
# Cole o template

sudo nano /etc/nginx/conf.d/admin.conf
# Cole o template

# Testar
sudo nginx -t

# Recarregar
sudo systemctl reload nginx
```

---

## 🔐 Configurar SSL

```bash
# Aguardar DNS propagar primeiro!

sudo certbot --nginx -d appbarber.auctusconsultoria.com.br -d appbarber.auctusconsultoria.com.br
sudo certbot --nginx -d appbarber.auctusconsultoria.com.br
sudo certbot --nginx -d appbarber.auctusconsultoria.com.br
```

---

## 📤 Como Fazer Deploy

### Opção 1: Build local e copiar

```powershell
# No seu PC, para cada projeto:
cd frontend/site-entrada
npm run build

# Copiar pasta out/ para VPS
scp -r out/* desenvolvedor@45.132.157.28:/var/www/site-entrada/
```

### Opção 2: Via FTP/Gerenciador de Arquivos

1. Fazer build local
2. Copiar pasta `out/` via FTP para `/var/www/site-entrada/`

---

## ✅ Estrutura Final

```
VPS Frontend (45.132.157.28):
├── /var/www/site-entrada/
│   ├── index.html
│   └── _next/
│
├── /var/www/painel-cliente/
│   ├── index.html
│   └── _next/
│
└── /var/www/painel-admin/
    ├── index.html
    └── _next/
```

---

## 🔗 Conexão com API

Nos frontends, configurar variável de ambiente:

```env
NEXT_PUBLIC_API_URL=https://api6.auctusconsultoria.com.br
```

---

**Esta VPS é EXCLUSIVA para frontend (arquivos estáticos)!**

