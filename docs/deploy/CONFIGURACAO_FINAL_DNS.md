# 🌐 Configuração Final DNS - Cloudflare

## 🎯 Arquitetura Definida

### VPS Backend (82.25.65.201)
- API Node.js + conexão ao **Oracle** em produção (variáveis `ORACLE_*`)
- Domínio: api6.auctusconsultoria.com.br
- Porta: 3001

### VPS Frontend (45.132.157.28)
- Sites estáticos
- Domínios: www, app, admin

---

## 📋 Configuração EXATA no Cloudflare

Acesse: https://dash.cloudflare.com → Seu domínio → **DNS** → **Records**

### Adicionar estes 5 registros:

```
═══════════════════════════════════════════════════════════════
REGISTRO 1 - API (Backend)
═══════════════════════════════════════════════════════════════
Type:          A
Name:          api
IPv4 address:  82.25.65.201
Proxy status:  DNS only (clique para ficar cinza ☁️)
TTL:           Auto

═══════════════════════════════════════════════════════════════
REGISTRO 2 - Site Principal (www)
═══════════════════════════════════════════════════════════════
Type:          A
Name:          www
IPv4 address:  45.132.157.28
Proxy status:  Proxied (deve estar laranja 🟠)
TTL:           Auto

═══════════════════════════════════════════════════════════════
REGISTRO 3 - Painel Cliente
═══════════════════════════════════════════════════════════════
Type:          A
Name:          app
IPv4 address:  45.132.157.28
Proxy status:  Proxied (deve estar laranja 🟠)
TTL:           Auto

═══════════════════════════════════════════════════════════════
REGISTRO 4 - Painel Admin
═══════════════════════════════════════════════════════════════
Type:          A
Name:          admin
IPv4 address:  45.132.157.28
Proxy status:  Proxied (deve estar laranja 🟠)
TTL:           Auto

═══════════════════════════════════════════════════════════════
REGISTRO 5 - Domínio Raiz (@)
═══════════════════════════════════════════════════════════════
Type:          A
Name:          @ (ou deixe vazio)
IPv4 address:  45.132.157.28
Proxy status:  Proxied (deve estar laranja 🟠)
TTL:           Auto
```

---

## 🎯 Resumo Visual

```
api6.auctusconsultoria.com.br    → 82.25.65.201 (Backend)
appbarber.auctusconsultoria.com.br    → 45.132.157.28 (Frontend)
appbarber.auctusconsultoria.com.br    → 45.132.157.28 (Frontend)
appbarber.auctusconsultoria.com.br  → 45.132.157.28 (Frontend)
```

---

## ⚙️ Configurações do Cloudflare

### SSL/TLS

1. **SSL/TLS** → **Overview**
   - Modo: **Full (strict)**

2. **Edge Certificates**
   - ✅ Always Use HTTPS
   - ✅ Automatic HTTPS Rewrites
   - TLS Mínimo: TLS 1.2

### Performance

1. **Speed** → **Optimization**
   - ✅ Auto Minify (JS, CSS, HTML)
   - ✅ Brotli

### Security

1. **Security** → **Settings**
   - Security Level: Medium

---

## ⏰ Aguardar Propagação

Após adicionar os registros, aguardar **2-4 horas** para DNS propagar.

**Verificar propagação:**

```powershell
# No PowerShell
nslookup api6.auctusconsultoria.com.br
nslookup appbarber.auctusconsultoria.com.br
```

Deve retornar os IPs corretos!

---

## ✅ Checklist

- [ ] Registros DNS adicionados no Cloudflare
- [ ] Proxy status correto (API = DNS only, resto = Proxied)
- [ ] IPs corretos (82.25.65.201 e 45.132.157.28)
- [ ] SSL mode: Full (strict)
- [ ] Always Use HTTPS ativado
- [ ] Aguardando propagação DNS

---

**Configuração DNS completa!** 🌐

