# 🎯 PRÓXIMO PASSO: Configurar SSL na VPS Backend

## ✅ Status Atual

- ✅ DNS configurado corretamente no Cloudflare
- ✅ Registro duplicado removido
- ✅ DNS propagado (testado com sucesso!)
- ✅ `api.protesecapilarcuiaba.com.br` → `82.25.65.201` funcionando

---

## 🚀 PASSO 2: Configurar Nginx e SSL na VPS

Agora vamos configurar o servidor backend (`82.25.65.201`) para aceitar HTTPS.

### 📋 O que vamos fazer:

1. ✅ Conectar na VPS backend via SSH
2. ✅ Verificar configuração atual do Nginx
3. ✅ Desabilitar vHost do OpenLiteSpeed para API (se existir)
4. ✅ Configurar Nginx para portas 80 e 443
5. ✅ Instalar Certbot
6. ✅ Gerar certificado SSL
7. ✅ Testar HTTPS

---

## 🔧 PASSO 2.1: Conectar na VPS

Abra o PowerShell ou terminal e conecte:

```bash
ssh root@82.25.65.201
```

---

## 📝 Guia Completo

Siga o guia detalhado:

➡️ **`GUIA_SSL_DNS_COMPLETO.md`** → **PASSO 2**

---

## ✅ Checklist do PASSO 2

Quando estiver na VPS:

- [ ] Conectado via SSH
- [ ] Verificou status do Nginx: `sudo systemctl status nginx`
- [ ] Verificou configuração atual: `cat /etc/nginx/conf.d/api.conf`
- [ ] Verificou se OpenLiteSpeed tem vHost da API: `ls -la /usr/local/lsws/conf/vhosts/ | grep api`
- [ ] Desabilitou vHost do OpenLiteSpeed (se existir)
- [ ] Configurou Nginx para portas 80/443
- [ ] Testou configuração: `sudo nginx -t`
- [ ] Reiniciou Nginx: `sudo systemctl restart nginx`
- [ ] Instalou Certbot: `sudo dnf install -y certbot python3-certbot-nginx`
- [ ] Gerou certificado SSL
- [ ] Testou HTTPS

---

## 🎯 Meta Final

**Antes:**
- ❌ http://api.protesecapilarcuiaba.com.br:8080

**Depois:**
- ✅ https://api.protesecapilarcuiaba.com.br

---

**Pronto para começar o PASSO 2?** 🚀

Abra o guia completo: **`GUIA_SSL_DNS_COMPLETO.md`**

