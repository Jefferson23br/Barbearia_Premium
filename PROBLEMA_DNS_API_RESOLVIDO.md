# ✅ PROBLEMA DNS API - Solução Rápida

## 🔴 Problema Identificado

```
nslookup api.protesecapilarcuiaba.com.br
DNS request timed out. ❌

nslookup www.protesecapilarcuiaba.com.br
Address: 104.21.85.71 ✅ (funciona)
```

**Causa:** Registro DNS para `api` ainda não foi criado na Cloudflare.

---

## 🎯 Solução em 3 Passos

### PASSO 1: Acessar Cloudflare

1. Acesse: **https://dash.cloudflare.com**
2. Faça login
3. Selecione: **protesecapilarcuiaba.com.br**
4. Clique: **DNS** → **Records**

### PASSO 2: Adicionar Registro para API

1. Clique: **"Add record"** ou **"Adicionar registro"**

2. Preencha EXATAMENTE assim:

   ```
   ┌─────────────────────────────────────────┐
   │ Type:          A                        │
   │ Name:          api                      │
   │ IPv4 address:  82.25.65.201            │
   │ Proxy status:  ☁️ DNS only (CINZA)    │ ← CRÍTICO!
   │ TTL:           Auto                     │
   └─────────────────────────────────────────┘
   ```

3. **⚠️ IMPORTANTE:**
   - Deve estar em **DNS only** (ícone cinza ☁️)
   - **NÃO** pode estar em "Proxied" (laranja 🟠)
   - Por quê? O Certbot precisa acessar o servidor diretamente

4. Clique: **Save**

### PASSO 3: Verificar Propagação

Aguarde **5-30 minutos** e teste:

```powershell
# Limpar cache DNS
ipconfig /flushdns

# Testar API
nslookup api.protesecapilarcuiaba.com.br

# Resultado esperado:
# Address: 82.25.65.201 ✅
```

---

## 📊 Estado Atual dos Registros

| Subdomínio | IP | Proxy | Status |
|------------|-----|-------|--------|
| `www` | 45.132.157.28 | 🟠 Proxied | ✅ OK |
| `app` | 45.132.157.28 | 🟠 Proxied | ✅ OK |
| `admin` | 45.132.157.28 | 🟠 Proxied | ✅ OK |
| `@` (raiz) | 45.132.157.28 | 🟠 Proxied | ✅ OK |
| **`api`** | **82.25.65.201** | **☁️ DNS only** | **❌ FALTA CRIAR!** |

---

## 🔍 Como Verificar no Cloudflare

Na página de DNS Records, você deve ver:

```
✅ A  www    → 45.132.157.28   🟠 Proxied
✅ A  app    → 45.132.157.28   🟠 Proxied
✅ A  admin  → 45.132.157.28   🟠 Proxied
✅ A  @      → 45.132.157.28   🟠 Proxied
❌ A  api    → ???             ??? ← ESTE FALTA!
```

Se não aparecer `api`, você precisa criar!

---

## 🧪 Teste Alternativo (Forçar DNS Público)

Se o DNS local ainda não atualizou, teste com DNS público:

```powershell
# Usar DNS do Google
nslookup api.protesecapilarcuiaba.com.br 8.8.8.8

# Ou DNS da Cloudflare
nslookup api.protesecapilarcuiaba.com.br 1.1.1.1
```

**Ou acesse online:**

🌐 https://www.whatsmydns.net/#A/api.protesecapilarcuiaba.com.br

Deve mostrar `82.25.65.201` em vários países.

---

## ✅ Checklist Rápido

- [ ] Acessei Cloudflare Dashboard
- [ ] Fui em DNS → Records
- [ ] Verifiquei se `api` existe
- [ ] Adicionei registro A para `api`
- [ ] IP configurado: `82.25.65.201`
- [ ] Proxy: **DNS only** (☁️ cinza)
- [ ] Salvei o registro
- [ ] Aguardei 5-30 minutos
- [ ] Limpei cache DNS
- [ ] Testei nslookup
- [ ] Funcionou! ✅

---

## 🎯 Próximo Passo

Quando o DNS estiver funcionando (retornando `82.25.65.201`):

➡️ Continue no **`GUIA_SSL_DNS_COMPLETO.md`** → **PASSO 2**

---

**Criado:** $(Get-Date -Format "dd/MM/yyyy HH:mm")  
**Status:** Aguardando criação do registro DNS ⏳

