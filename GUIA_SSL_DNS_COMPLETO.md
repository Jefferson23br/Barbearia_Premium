# 🔐 Guia Completo: SSL + DNS Cloudflare

**Data:** 05/12/2025  
**Objetivo:** Configurar SSL/HTTPS na API e DNS no Cloudflare

---

## 📋 Ordem de Execução

1. **Configurar DNS no Cloudflare** (primeiro!)
2. **Aguardar propagação DNS** (2-4 horas)
3. **Configurar Nginx para portas 80/443**
4. **Instalar e configurar SSL com Certbot**
5. **Testar HTTPS**

---

## 🌐 PASSO 1: Configurar DNS no Cloudflare

### 1.1 Acessar Cloudflare

1. Acesse: https://dash.cloudflare.com
2. Selecione o domínio: **protesecapilarcuiaba.com.br**
3. Vá em **DNS** → **Records**

### 1.2 Adicionar Registros DNS

**⚠️ IMPORTANTE: Adicione apenas os registros que faltam!**

#### ✅ Registro 1 - API (Backend)
```
Type:          A
Name:          api
IPv4 address:  82.25.65.201
Proxy status:  DNS only (ícone CINZA ☁️) ← IMPORTANTE!
TTL:           Auto
```

**Por que DNS only?** 
- Let's Encrypt precisa validar via HTTP na porta 80
- Cloudflare proxy bloqueia validação do Certbot

#### ✅ Registro 2 - Site Principal
```
Type:          A
Name:          www
IPv4 address:  45.132.157.28
Proxy status:  Proxied (ícone LARANJA 🟠)
TTL:           Auto
```

#### ✅ Registro 3 - Painel Cliente
```
Type:          A
Name:          app
IPv4 address:  45.132.157.28
Proxy status:  Proxied (ícone LARANJA 🟠)
TTL:           Auto
```

#### ✅ Registro 4 - Painel Admin
```
Type:          A
Name:          admin
IPv4 address:  45.132.157.28
Proxy status:  Proxied (ícone LARANJA 🟠)
TTL:           Auto
```

#### ✅ Registro 5 - Domínio Raiz
```
Type:          A
Name:          @ (ou deixe vazio)
IPv4 address:  45.132.157.28
Proxy status:  Proxied (ícone LARANJA 🟠)
TTL:           Auto
```

### 1.3 Configurar SSL/TLS no Cloudflare

1. Vá em **SSL/TLS** → **Overview**
   - Modo: **Full (strict)**
   
2. Vá em **SSL/TLS** → **Edge Certificates**
   - ✅ **Always Use HTTPS** (ativar)
   - ✅ **Automatic HTTPS Rewrites** (ativar)
   - TLS mínimo: **TLS 1.2**

### 1.4 Verificar Propagação DNS

**Aguardar 2-4 horas, depois verificar:**

```powershell
# No PowerShell (Windows)
nslookup api.protesecapilarcuiaba.com.br
nslookup www.protesecapilarcuiaba.com.br
```

**Ou no Linux/VPS:**
```bash
dig api.protesecapilarcuiaba.com.br
dig www.protesecapilarcuiaba.com.br
```

**Deve retornar os IPs corretos:**
- `api.*` → 82.25.65.201
- `www.*` → 45.132.157.28

---

## 🔧 PASSO 2: Preparar Nginx na VPS Backend

### 2.1 Conectar na VPS

```bash
ssh root@82.25.65.201
```

### 2.2 Verificar Nginx Atual

```bash
# Ver status
sudo systemctl status nginx

# Ver configuração atual
cat /etc/nginx/conf.d/api.conf
```

### 2.3 Desabilitar OpenLiteSpeed vHost da API

```bash
# Verificar se existe vHost no OpenLiteSpeed
sudo ls -la /usr/local/lsws/conf/vhosts/ | grep api

# Se existir, renomear para desabilitar
sudo mv /usr/local/lsws/conf/vhosts/api.protesecapilarcuiaba.com.br \
        /usr/local/lsws/conf/vhosts/api.protesecapilarcuiaba.com.br.disabled

# Reiniciar OpenLiteSpeed
sudo systemctl restart lsws
```

### 2.4 Configurar Nginx para Portas Padrão

```bash
# Editar configuração
sudo nano /etc/nginx/conf.d/api.conf
```

**Substitua TODO o conteúdo por:**

```nginx
# Servidor HTTP (porta 80) - Redireciona para HTTPS
server {
    listen 80;
    server_name api.protesecapilarcuiaba.com.br;
    
    # Redireciona tudo para HTTPS
    return 301 https://$server_name$request_uri;
}

# Servidor HTTPS (porta 443) - Proxy para Node.js
server {
    listen 443 ssl http2;
    server_name api.protesecapilarcuiaba.com.br;
    
    # Certificados SSL (serão adicionados pelo Certbot)
    # ssl_certificate /etc/letsencrypt/live/api.protesecapilarcuiaba.com.br/fullchain.pem;
    # ssl_certificate_key /etc/letsencrypt/live/api.protesecapilarcuiaba.com.br/privkey.pem;
    
    # Configurações SSL (serão adicionadas pelo Certbot)
    # include /etc/letsencrypt/options-ssl-nginx.conf;
    # ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;
    
    # Logs
    access_log /var/log/nginx/api-access.log;
    error_log /var/log/nginx/api-error.log;
    
    # Proxy para Node.js
    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        
        # Headers importantes
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Cache
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
```

**Salve (Ctrl+O, Enter, Ctrl+X)**

### 2.5 Remover Conflito de Porta 80

```bash
# Verificar o que está usando a porta 80
sudo netstat -tlnp | grep :80
sudo ss -tlnp | grep :80

# Se OpenLiteSpeed estiver usando, vamos deixar assim
# O Nginx vai funcionar na porta 80 também (pode haver conflito)
# Ou configurar OpenLiteSpeed para não usar porta 80
```

**Se houver conflito, vamos resolver depois com o Certbot.**

### 2.6 Testar Configuração Nginx

```bash
# Testar sintaxe
sudo nginx -t

# Se OK, reiniciar
sudo systemctl restart nginx
sudo systemctl status nginx
```

---

## 🔐 PASSO 3: Instalar e Configurar SSL

### 3.1 Instalar Certbot

```bash
# Na VPS Backend
sudo dnf install -y certbot python3-certbot-nginx

# Verificar instalação
certbot --version
```

### 3.2 Temporariamente Habilitar HTTP na Porta 80

**⚠️ IMPORTANTE:** Certbot precisa validar via HTTP na porta 80!

Se houver conflito com OpenLiteSpeed na porta 80, vamos usar método standalone:

```bash
# Parar Nginx temporariamente
sudo systemctl stop nginx

# Certbot em modo standalone
sudo certbot certonly --standalone \
  --preferred-challenges http \
  -d api.protesecapilarcuiaba.com.br \
  --email seu-email@exemplo.com \
  --agree-tos \
  --non-interactive
```

**Ou se Nginx estiver funcionando na porta 80:**

```bash
# Certbot com plugin Nginx (mais fácil)
sudo certbot --nginx \
  -d api.protesecapilarcuiaba.com.br \
  --email seu-email@exemplo.com \
  --agree-tos \
  --redirect
```

### 3.3 Atualizar Configuração Nginx com Certificados

O Certbot deve atualizar automaticamente o arquivo `/etc/nginx/conf.d/api.conf`.

**Verificar:**

```bash
cat /etc/nginx/conf.d/api.conf
```

**Deve ter as linhas SSL descomentadas e configuradas!**

### 3.4 Reiniciar Nginx

```bash
# Testar configuração
sudo nginx -t

# Reiniciar
sudo systemctl restart nginx
sudo systemctl status nginx
```

### 3.5 Verificar Certificados

```bash
# Ver certificados gerados
sudo certbot certificates

# Ver detalhes do certificado
sudo openssl x509 -in /etc/letsencrypt/live/api.protesecapilarcuiaba.com.br/cert.pem -text -noout
```

---

## ✅ PASSO 4: Testar SSL/HTTPS

### 4.1 Testar Localmente (na VPS)

```bash
# Testar HTTP (deve redirecionar para HTTPS)
curl -I http://api.protesecapilarcuiaba.com.br/health

# Testar HTTPS
curl -I https://api.protesecapilarcuiaba.com.br/health

# Testar endpoint completo
curl https://api.protesecapilarcuiaba.com.br/api/test-db
```

### 4.2 Testar de Fora (do seu computador)

```powershell
# PowerShell
curl https://api.protesecapilarcuiaba.com.br/health
```

**Ou abra no navegador:**
- https://api.protesecapilarcuiaba.com.br/health

### 4.3 Verificar Certificado SSL

1. Acesse: https://api.protesecapilarcuiaba.com.br/health
2. Clique no cadeado no navegador
3. Veja os detalhes do certificado
4. Deve mostrar: **Let's Encrypt**

---

## 🔄 PASSO 5: Renovação Automática

### 5.1 Testar Renovação

```bash
# Testar renovação (não renova de verdade)
sudo certbot renew --dry-run
```

### 5.2 Configurar Auto-Renovação

O Certbot cria um timer systemd automaticamente.

**Verificar:**

```bash
# Ver timer
sudo systemctl status certbot-renew.timer

# Habilitar (se não estiver)
sudo systemctl enable certbot-renew.timer
sudo systemctl start certbot-renew.timer
```

---

## 📝 Checklist Final

- [ ] DNS configurado no Cloudflare
- [ ] Registro `api` com **DNS only** (cinza ☁️)
- [ ] DNS propagado (2-4 horas)
- [ ] Nginx configurado nas portas 80/443
- [ ] OpenLiteSpeed vHost da API desabilitado
- [ ] Certbot instalado
- [ ] Certificado SSL gerado
- [ ] HTTPS funcionando
- [ ] HTTP redireciona para HTTPS
- [ ] Auto-renovação configurada

---

## 🐛 Troubleshooting

### Erro: "Port 80 already in use"

```bash
# Ver o que está usando
sudo ss -tlnp | grep :80

# Se OpenLiteSpeed, parar temporariamente
sudo systemctl stop lsws

# Gerar certificado
sudo certbot certonly --standalone -d api.protesecapilarcuiaba.com.br

# Reiniciar OpenLiteSpeed
sudo systemctl start lsws
```

### Erro: "Failed to validate domain"

1. Verificar DNS propagou: `dig api.protesecapilarcuiaba.com.br`
2. Verificar porta 80 acessível: `curl http://82.25.65.201`
3. Verificar firewall permite porta 80: `sudo firewall-cmd --list-ports`

### Erro: "Connection refused"

```bash
# Verificar Nginx
sudo systemctl status nginx
sudo nginx -t

# Verificar logs
sudo tail -f /var/log/nginx/error.log
```

---

## 🎯 Próximos Passos

Após SSL configurado:

1. ✅ Atualizar variáveis de ambiente do backend (HTTPS)
2. ✅ Atualizar CORS para aceitar HTTPS
3. ✅ Configurar frontends para usar HTTPS na API
4. ✅ Testar integração completa

---

**Guia completo criado! Vamos começar! 🚀**

