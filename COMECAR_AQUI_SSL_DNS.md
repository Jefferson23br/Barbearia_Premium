# 🚀 COMECE AQUI: SSL + DNS Cloudflare

## ⚡ Ordem de Execução Rápida

### ✅ PASSO 1: Configurar DNS (AGORA)

👉 **[CONFIGURAR_DNS_CLOUDFLARE.md](./CONFIGURAR_DNS_CLOUDFLARE.md)**

**Tempo:** 10 minutos  
**Onde:** Dashboard Cloudflare (https://dash.cloudflare.com)

**O que fazer:**
1. Acessar Cloudflare
2. Adicionar 5 registros DNS
3. Configurar SSL/TLS
4. **AGUARDAR 2-4 horas** ⏰

---

### ⏸️ PASSO 2: Aguardar Propagação DNS

**⏰ Aguardar 2-4 horas**

**Como verificar se propagou:**
```powershell
nslookup api.protesecapilarcuiaba.com.br
```

**Deve retornar:** `82.25.65.201`

---

### ✅ PASSO 3: Configurar SSL (Após DNS propagar)

👉 **[GUIA_SSL_DNS_COMPLETO.md](./GUIA_SSL_DNS_COMPLETO.md)**

**Tempo:** 30 minutos  
**Onde:** VPS Backend (82.25.65.201)

**O que fazer:**
1. Conectar na VPS
2. Configurar Nginx para portas 80/443
3. Instalar Certbot
4. Gerar certificado SSL
5. Testar HTTPS

---

## 📋 Checklist Rápido

### Agora (DNS)
- [ ] Abrir Cloudflare Dashboard
- [ ] Adicionar 5 registros DNS
- [ ] Configurar SSL/TLS → Full (strict)
- [ ] Ativar "Always Use HTTPS"
- [ ] **Aguardar propagação (2-4h)**

### Depois (SSL - quando DNS propagar)
- [ ] Conectar na VPS Backend
- [ ] Configurar Nginx
- [ ] Instalar Certbot
- [ ] Gerar certificado
- [ ] Testar HTTPS

---

## 🎯 Informações Importantes

### Registros DNS

```
api.protesecapilarcuiaba.com.br → 82.25.65.201 (DNS ONLY - Cinza ☁️)
www.protesecapilarcuiaba.com.br → 45.132.157.28 (Proxied - Laranja 🟠)
app.protesecapilarcuiaba.com.br → 45.132.157.28 (Proxied - Laranja 🟠)
admin.protesecapilarcuiaba.com.br → 45.132.157.28 (Proxied - Laranja 🟠)
protesecapilarcuiaba.com.br → 45.132.157.28 (Proxied - Laranja 🟠)
```

**⚠️ CRÍTICO:** O registro `api` DEVE estar com proxy **DESATIVADO** (cinza ☁️)

### Por quê?

- Let's Encrypt precisa validar o domínio via HTTP na porta 80
- Cloudflare proxy bloqueia essa validação
- Por isso `api` deve estar DNS only

---

## 🔗 Links Úteis

- **Cloudflare Dashboard:** https://dash.cloudflare.com
- **Verificar DNS:** https://www.whatsmydns.net/
- **VPS Backend SSH:** `ssh root@82.25.65.201`

---

## 📚 Documentação Completa

1. **[CONFIGURAR_DNS_CLOUDFLARE.md](./CONFIGURAR_DNS_CLOUDFLARE.md)** ⭐ - DNS passo a passo
2. **[GUIA_SSL_DNS_COMPLETO.md](./GUIA_SSL_DNS_COMPLETO.md)** ⭐ - Guia completo SSL
3. **[scripts/configurar-ssl-api.sh](./scripts/configurar-ssl-api.sh)** - Script automático

---

## 🆘 Precisa de Ajuda?

1. **DNS não propagou?** → Aguarde até 4 horas (pode ser mais rápido)
2. **Erro no Cloudflare?** → Verifique se o domínio está ativo
3. **Erro no Certbot?** → Veja troubleshooting no guia completo

---

**🚀 Vamos começar pelo DNS! Abra o Cloudflare agora!**

👉 **[Ir para: CONFIGURAR_DNS_CLOUDFLARE.md](./CONFIGURAR_DNS_CLOUDFLARE.md)**

