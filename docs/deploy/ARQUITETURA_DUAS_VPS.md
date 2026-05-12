# 🏗️ Arquitetura com Duas VPS

## 🎯 Estrutura Definida

### VPS 1 - Backend (82.25.65.201)
```
IP: 82.25.65.201
Uso: API Node.js + conexao ao Oracle em producao (PostgreSQL apenas se ambiente legado local)
Sistema: AlmaLinux 9
Domínio: api6.auctusconsultoria.com.br
```

### VPS 2 - Frontend (45.132.157.28)
```
IP: 45.132.157.28
Uso: Sites estáticos (Frontend)
Sistema: [Hostinger]
Domínios: 
  - appbarber.auctusconsultoria.com.br
  - appbarber.auctusconsultoria.com.br
  - appbarber.auctusconsultoria.com.br
```

---

## 🌐 Configuração DNS no Cloudflare

```
┌──────┬────────┬───────────────┬──────────────┬──────┐
│ Type │ Name   │ Content       │ Proxy Status │ TTL  │
├──────┼────────┼───────────────┼──────────────┼──────┤
│ A    │ api    │ 82.25.65.201  │ DNS only ☁️  │ Auto │
│ A    │ www    │ 45.132.157.28 │ Proxied 🟠   │ Auto │
│ A    │ app    │ 45.132.157.28 │ Proxied 🟠   │ Auto │
│ A    │ admin  │ 45.132.157.28 │ Proxied 🟠   │ Auto │
│ A    │ @      │ 45.132.157.28 │ Proxied 🟠   │ Auto │
└──────┴────────┴───────────────┴──────────────┴──────┘
```

---

## 🔧 Configuração VPS Backend (82.25.65.201)

### O que instalar:

```bash
# Node.js 20 LTS
# Nginx (proxy reverso)
# PM2
# Certbot (SSL)
# fail2ban
# Oracle: listener em host remoto ou local (porta 1521 tipica) — ver ORACLE_* no .env
```

### Estrutura:

```
/home/desenvolvedor/app/backend/
├── src/
├── node_modules/
└── .env

Oracle (remoto ou local via ORACLE_HOST / ORACLE_SERVICE_NAME)
└── Schema/usuario conforme ORACLE_USER (ex.: BARBEARIA_PREMIUM)
```

### Nginx apenas para API:

```nginx
# /etc/nginx/conf.d/api.conf
server {
    listen 80;
    server_name api6.auctusconsultoria.com.br;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api6.auctusconsultoria.com.br;
    
    # SSL
    ssl_certificate /etc/letsencrypt/live/api6.auctusconsultoria.com.br/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api6.auctusconsultoria.com.br/privkey.pem;
    
    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

---

## 🖥️ Configuração VPS Frontend (45.132.157.28)

### O que instalar:

```bash
# Nginx (servidor de arquivos estáticos)
# Certbot (SSL)
# [Opcional] Node.js (se quiser fazer build na VPS)
```

### Estrutura:

```
/var/www/
├── site-entrada/       → appbarber.auctusconsultoria.com.br
│   ├── index.html
│   └── _next/
│
├── painel-cliente/     → appbarber.auctusconsultoria.com.br
│   ├── index.html
│   └── _next/
│
└── painel-admin/       → appbarber.auctusconsultoria.com.br
    ├── index.html
    └── _next/
```

### Nginx para cada frontend:

**www.conf:**
```nginx
server {
    listen 80;
    server_name appbarber.auctusconsultoria.com.br appbarber.auctusconsultoria.com.br;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name appbarber.auctusconsultoria.com.br appbarber.auctusconsultoria.com.br;
    
    ssl_certificate /etc/letsencrypt/live/appbarber.auctusconsultoria.com.br/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/appbarber.auctusconsultoria.com.br/privkey.pem;
    
    root /var/www/site-entrada;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

**app.conf:**
```nginx
server {
    listen 80;
    server_name appbarber.auctusconsultoria.com.br;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name appbarber.auctusconsultoria.com.br;
    
    ssl_certificate /etc/letsencrypt/live/appbarber.auctusconsultoria.com.br/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/appbarber.auctusconsultoria.com.br/privkey.pem;
    
    root /var/www/painel-cliente;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

**admin.conf:**
```nginx
server {
    listen 80;
    server_name appbarber.auctusconsultoria.com.br;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name appbarber.auctusconsultoria.com.br;
    
    ssl_certificate /etc/letsencrypt/live/appbarber.auctusconsultoria.com.br/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/appbarber.auctusconsultoria.com.br/privkey.pem;
    
    root /var/www/painel-admin;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

---

## 📋 Configuração DNS no Cloudflare (COMPLETA)

### Adicione estes registros:

```
┌──────┬────────┬───────────────┬──────────────┬──────┐
│ Type │ Name   │ Content       │ Proxy Status │ TTL  │
├──────┼────────┼───────────────┼──────────────┼──────┤
│ A    │ api    │ 82.25.65.201  │ DNS only ☁️  │ Auto │
│ A    │ www    │ 45.132.157.28 │ Proxied 🟠   │ Auto │
│ A    │ app    │ 45.132.157.28 │ Proxied 🟠   │ Auto │
│ A    │ admin  │ 45.132.157.28 │ Proxied 🟠   │ Auto │
│ A    │ @      │ 45.132.157.28 │ Proxied 🟠   │ Auto │
└──────┴────────┴───────────────┴──────────────┴──────┘
```

---

## ✅ Resposta Direta

**Configure assim:**

```
Type: A
Name: app
IPv4 address: 45.132.157.28    ← Número do IP, não domínio!
Proxy Status: Proxied (ícone laranja 🟠)
TTL: Auto
```

Repita para:
- `www` → 45.132.157.28
- `admin` → 45.132.157.28
- `api` → 82.25.65.201 (IP diferente!)

---

## 🎯 Resumo da Arquitetura

```
Usuário acessa:
    ↓
[Cloudflare DNS]
    ↓
    ├─→ api.* → 82.25.65.201 (VPS Backend)
    │              └─→ Node.js + Oracle (produção)
    │
    └─→ www.*, app.*, admin.* → 45.132.157.28 (VPS Frontend)
                                   └─→ Nginx serve arquivos estáticos
```

Está claro agora? 🎯
