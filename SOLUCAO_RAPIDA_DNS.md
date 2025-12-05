# ⚡ SOLUÇÃO RÁPIDA - DNS API Não Funciona

## 🔴 Problema

```powershell
nslookup api.protesecapilarcuiaba.com.br
DNS request timed out. ❌
```

## ✅ Solução: Adicionar Registro na Cloudflare

O registro DNS para `api` ainda **não foi criado** na Cloudflare.

---

## 📝 Passo a Passo (5 minutos)

### 1️⃣ Acesse Cloudflare
- URL: https://dash.cloudflare.com
- Domínio: **protesecapilarcuiaba.com.br**
- Menu: **DNS** → **Records**

### 2️⃣ Adicione Registro para API

Clique em **"Add record"** e preencha:

```
Type:          A
Name:          api
IPv4 address:  82.25.65.201
Proxy status:  ☁️ DNS only (CINZA) ← MUITO IMPORTANTE!
TTL:           Auto
```

**⚠️ CRÍTICO:** Proxy deve estar em **DNS only** (cinza ☁️), **NÃO** Proxied (laranja 🟠)

### 3️⃣ Salve e Aguarde

- Clique em **Save**
- Aguarde **5-30 minutos** para propagação

### 4️⃣ Teste Novamente

```powershell
# Limpar cache DNS
ipconfig /flushdns

# Testar
nslookup api.protesecapilarcuiaba.com.br

# Deve retornar:
# Address: 82.25.65.201 ✅
```

---

## 📊 Verificação Visual na Cloudflare

Após adicionar, você deve ver:

```
✅ A  www    → 45.132.157.28   🟠 Proxied
✅ A  app    → 45.132.157.28   🟠 Proxied  
✅ A  admin  → 45.132.157.28   🟠 Proxied
✅ A  @      → 45.132.157.28   🟠 Proxied
✅ A  api    → 82.25.65.201    ☁️ DNS only ← DEVE APARECER!
```

---

## 🔍 Teste Alternativo

Se ainda não funcionar, teste com DNS público:

```powershell
nslookup api.protesecapilarcuiaba.com.br 8.8.8.8
```

**Ou verifique online:**
🌐 https://www.whatsmydns.net/#A/api.protesecapilarcuiaba.com.br

---

## ✅ Pronto!

Quando o DNS funcionar, continue no guia:
➡️ **`GUIA_SSL_DNS_COMPLETO.md`** → PASSO 2

