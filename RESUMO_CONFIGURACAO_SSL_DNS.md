# 🔐 Resumo: Configuração SSL + DNS

**Data:** 05/12/2025  
**Status:** Em andamento

---

## 🎯 Objetivo

Configurar HTTPS na API e DNS no Cloudflare para ter tudo funcionando com segurança.

---

## ✅ O Que Foi Preparado

### Documentos Criados

1. **[COMECAR_AQUI_SSL_DNS.md](./COMECAR_AQUI_SSL_DNS.md)** ⭐
   - Guia rápido de início
   - Ordem de execução

2. **[CONFIGURAR_DNS_CLOUDFLARE.md](./CONFIGURAR_DNS_CLOUDFLARE.md)** ⭐⭐
   - Passo a passo DNS no Cloudflare
   - Com screenshots e explicações

3. **[GUIA_SSL_DNS_COMPLETO.md](./GUIA_SSL_DNS_COMPLETO.md)** ⭐⭐⭐
   - Guia completo técnico
   - Troubleshooting incluído

4. **[scripts/configurar-ssl-api.sh](./scripts/configurar-ssl-api.sh)**
   - Script automático para SSL
   - Executa todos os passos

---

## 📋 Ordem de Execução

### 1️⃣ AGORA: DNS no Cloudflare

**Tempo:** 10 minutos  
**Documento:** [CONFIGURAR_DNS_CLOUDFLARE.md](./CONFIGURAR_DNS_CLOUDFLARE.md)

**Passos:**
1. Acessar: https://dash.cloudflare.com
2. Selecionar domínio: `protesecapilarcuiaba.com.br`
3. Ir em: DNS → Records
4. Adicionar 5 registros A:
   - `api` → `82.25.65.201` (DNS only - cinza ☁️)
   - `www` → `45.132.157.28` (Proxied - laranja 🟠)
   - `app` → `45.132.157.28` (Proxied - laranja 🟠)
   - `admin` → `45.132.157.28` (Proxied - laranja 🟠)
   - `@` → `45.132.157.28` (Proxied - laranja 🟠)
5. Configurar SSL/TLS → Full (strict)
6. Ativar "Always Use HTTPS"

**⏰ Aguardar:** 2-4 horas para propagação DNS

---

### 2️⃣ DEPOIS: Configurar SSL (Quando DNS propagar)

**Tempo:** 30 minutos  
**Documento:** [GUIA_SSL_DNS_COMPLETO.md](./GUIA_SSL_DNS_COMPLETO.md)

**Passos:**
1. Verificar DNS propagou:
   ```powershell
   nslookup api.protesecapilarcuiaba.com.br
   ```
   Deve retornar: `82.25.65.201`

2. Conectar na VPS Backend:
   ```bash
   ssh root@82.25.65.201
   ```

3. Configurar Nginx para portas 80/443

4. Instalar Certbot:
   ```bash
   sudo dnf install -y certbot python3-certbot-nginx
   ```

5. Gerar certificado SSL:
   ```bash
   sudo certbot --nginx -d api.protesecapilarcuiaba.com.br
   ```

6. Testar HTTPS:
   ```bash
   curl https://api.protesecapilarcuiaba.com.br/health
   ```

---

## ⚠️ Pontos Críticos

### 1. API com DNS Only (Cinza ☁️)

**POR QUÊ?**
- Let's Encrypt precisa validar via HTTP na porta 80
- Cloudflare proxy bloqueia essa validação
- Por isso `api` DEVE estar sem proxy

### 2. Aguardar Propagação DNS

**Tempo:** 2-4 horas (pode ser mais rápido)

**Como verificar:**
```powershell
nslookup api.protesecapilarcuiaba.com.br
```

### 3. Conflito de Portas

**OpenLiteSpeed pode estar usando porta 80**

**Solução:**
- Parar OpenLiteSpeed temporariamente
- Gerar certificado
- Reiniciar serviços

---

## 📊 Status Atual

### DNS
- [ ] Registros adicionados no Cloudflare
- [ ] SSL/TLS configurado (Full strict)
- [ ] Aguardando propagação

### SSL
- [ ] Nginx configurado (portas 80/443)
- [ ] Certbot instalado
- [ ] Certificado gerado
- [ ] HTTPS funcionando

---

## 🔗 Links Úteis

- **Cloudflare:** https://dash.cloudflare.com
- **Verificar DNS:** https://www.whatsmydns.net/
- **VPS Backend:** `ssh root@82.25.65.201`
- **API Atual:** http://api.protesecapilarcuiaba.com.br:8080/health

---

## 📚 Documentação Completa

1. **[COMECAR_AQUI_SSL_DNS.md](./COMECAR_AQUI_SSL_DNS.md)** - Início rápido
2. **[CONFIGURAR_DNS_CLOUDFLARE.md](./CONFIGURAR_DNS_CLOUDFLARE.md)** - DNS passo a passo
3. **[GUIA_SSL_DNS_COMPLETO.md](./GUIA_SSL_DNS_COMPLETO.md)** - Guia técnico completo
4. **[scripts/configurar-ssl-api.sh](./scripts/configurar-ssl-api.sh)** - Script automático

---

## 🎯 Próximos Passos

### Hoje
1. ✅ Configurar DNS no Cloudflare
2. ⏳ Aguardar propagação (2-4h)

### Quando DNS propagar
1. ✅ Configurar SSL na VPS
2. ✅ Testar HTTPS
3. ✅ Atualizar variáveis de ambiente

---

**🚀 Tudo preparado! Vamos começar pelo DNS!**

👉 **[Ir para: CONFIGURAR_DNS_CLOUDFLARE.md](./CONFIGURAR_DNS_CLOUDFLARE.md)**

