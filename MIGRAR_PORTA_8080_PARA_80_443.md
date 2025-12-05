# 🔄 Migrar Nginx da Porta 8080 para 80/443 (SSL)

## 📊 Situação Atual

Sua configuração atual está **correta** para a porta 8080:
- ✅ Nginx escutando na porta 8080
- ✅ Proxy funcionando para Node.js na porta 3001
- ✅ API acessível via: `http://api.protesecapilarcuiaba.com.br:8080`

## ⚠️ O que Precisamos Fazer

Para configurar SSL/HTTPS, precisamos migrar para as **portas padrão**:
- **Porta 80** → HTTP (redireciona para HTTPS)
- **Porta 443** → HTTPS (com SSL)

---

## 🔍 PASSO 1: Verificar Conflito de Porta

Antes de mudar, vamos verificar o que está usando a porta 80:

```bash
# Verificar o que está usando a porta 80
sudo ss -tlnp | grep :80
sudo netstat -tlnp | grep :80
```

**Possíveis resultados:**

### Caso 1: Porta 80 Livre ✅
```
(nenhum resultado ou apenas nginx)
```
→ Podemos usar a porta 80 normalmente!

### Caso 2: OpenLiteSpeed Usando Porta 80 ⚠️
```
tcp LISTEN 0 128 *:80 *:* users:(("litespeed",pid=...))
```
→ Precisamos desabilitar o vHost da API no OpenLiteSpeed primeiro

---

## 🔧 PASSO 2: Verificar OpenLiteSpeed vHost da API

```bash
# Verificar se existe vHost no OpenLiteSpeed
sudo ls -la /usr/local/lsws/conf/vhosts/ | grep api
```

**Se existir:**
- Precisamos desabilitá-lo para evitar conflito
- O Nginx vai cuidar da API agora

---

## 📝 PASSO 3: Atualizar Configuração Nginx

Agora vamos atualizar a configuração para portas 80/443:

```bash
# Fazer backup da configuração atual (por segurança)
sudo cp /etc/nginx/conf.d/api.conf /etc/nginx/conf.d/api.conf.backup

# Editar configuração
sudo nano /etc/nginx/conf.d/api.conf
```

**Substitua TODO o conteúdo por:**

```nginx
# Servidor HTTP (porta 80) - Redireciona para HTTPS
# NOTA: Inicialmente vai servir HTTP normal, depois do SSL vai redirecionar
server {
    listen 80;
    server_name api.protesecapilarcuiaba.com.br;
    
    # Por enquanto, serve HTTP normalmente (para Certbot validar)
    # Depois do SSL, mudaremos para redirecionar
    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# Servidor HTTPS (porta 443) - Será configurado após SSL
# Por enquanto, comentado (será descomentado pelo Certbot)
# server {
#     listen 443 ssl http2;
#     server_name api.protesecapilarcuiaba.com.br;
#     
#     # Certificados SSL (serão adicionados pelo Certbot)
#     # ssl_certificate /etc/letsencrypt/live/api.protesecapilarcuiaba.com.br/fullchain.pem;
#     # ssl_certificate_key /etc/letsencrypt/live/api.protesecapilarcuiaba.com.br/privkey.pem;
#     
#     location / {
#         proxy_pass http://127.0.0.1:3001;
#         proxy_http_version 1.1;
#         
#         proxy_set_header Host $host;
#         proxy_set_header X-Real-IP $remote_addr;
#         proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
#         proxy_set_header X-Forwarded-Proto $scheme;
#     }
# }
```

**Salve:** `Ctrl+O`, `Enter`, `Ctrl+X`

---

## ✅ PASSO 4: Testar e Reiniciar Nginx

```bash
# Testar sintaxe da configuração
sudo nginx -t

# Se der erro, verifique o arquivo novamente
# Se OK, reiniciar Nginx
sudo systemctl restart nginx

# Verificar status
sudo systemctl status nginx
```

---

## 🔍 PASSO 5: Verificar Portas

```bash
# Verificar se Nginx está escutando nas portas corretas
sudo ss -tlnp | grep nginx

# Deve mostrar:
# :80 (HTTP)
# (Porta 443 só vai aparecer depois do SSL)
```

---

## ⚠️ IMPORTANTE: Desabilitar OpenLiteSpeed vHost da API

Se o OpenLiteSpeed tiver um vHost para a API, precisamos desabilitá-lo:

```bash
# Verificar se existe
sudo ls -la /usr/local/lsws/conf/vhosts/ | grep api

# Se existir, renomear para desabilitar
sudo mv /usr/local/lsws/conf/vhosts/api.protesecapilarcuiaba.com.br \
        /usr/local/lsws/conf/vhosts/api.protesecapilarcuiaba.com.br.disabled

# Reiniciar OpenLiteSpeed
sudo systemctl restart lsws
```

---

## 🧪 PASSO 6: Testar API na Nova Porta

```bash
# Testar HTTP na porta 80 (sem porta explícita)
curl http://api.protesecapilarcuiaba.com.br/health

# Deve retornar o mesmo resultado que antes na porta 8080
```

**Ou do seu computador:**

```powershell
# PowerShell
curl http://api.protesecapilarcuiaba.com.br/health
```

---

## 🎯 Próximo Passo

Depois que a porta 80 estiver funcionando:

➡️ Continue no **PASSO 3** do guia: **Instalar e Configurar SSL**

O Certbot vai:
1. Validar o domínio via HTTP (porta 80)
2. Gerar certificado SSL
3. Atualizar configuração do Nginx automaticamente
4. Configurar redirecionamento HTTP → HTTPS

---

## ✅ Checklist

- [ ] Verificou o que está usando porta 80
- [ ] Fez backup da configuração atual
- [ ] Atualizou `/etc/nginx/conf.d/api.conf` para porta 80
- [ ] Testou sintaxe: `sudo nginx -t`
- [ ] Reiniciou Nginx: `sudo systemctl restart nginx`
- [ ] Verificou status: `sudo systemctl status nginx`
- [ ] Testou API na porta 80: `curl http://api.protesecapilarcuiaba.com.br/health`
- [ ] Desabilitou vHost da API no OpenLiteSpeed (se existir)
- [ ] API funcionando na porta 80! ✅

---

**Depois disso, pode seguir para o PASSO 3 (SSL)! 🚀**

