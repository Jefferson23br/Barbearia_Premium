# 🚨 AÇÃO URGENTE: Deletar Registro DNS Duplicado

## ❌ Problema Encontrado

Você tem **DOIS registros A** para `api` na Cloudflare:

1. ❌ `api` → `45.132.157.28` (Proxied 🟠) ← **DELETAR ESTE!**
2. ✅ `api` → `82.25.65.201` (DNS only ☁️) ← **MANTER ESTE!**

O primeiro está **ERRADO** e está causando conflito DNS!

---

## ✅ SOLUÇÃO: Deletar o Registro Incorreto

### Passo a Passo (2 minutos):

1. **No Cloudflare Dashboard:**
   - Você já está na página DNS → Records
   - Encontre na lista o registro:
     ```
     Type: A
     Name: api
     Content: 45.132.157.28
     Proxy: 🟠 Proxied (nuvem laranja)
     ```

2. **Deletar:**
   - Clique no ícone **"..."** (três pontos) ou **lápis (Edit)**
   - Clique em **"Delete"** ou **"Deletar"**
   - Confirme

3. **Resultado Final:**
   
   Você deve ter apenas:
   ```
   ✅ Type: A | Name: api | Content: 82.25.65.201 | Proxy: ☁️ DNS only
   ```

---

## 📊 Configuração Final Esperada

| Name | Type | Content | Proxy | Uso |
|------|------|---------|-------|-----|
| `api` | A | `82.25.65.201` | ☁️ DNS only | Backend API |
| `www` | CNAME | `protesecapilarcuiaba.com.br` | 🟠 Proxied | Site principal |
| `app` | A | `45.132.157.28` | 🟠 Proxied | Painel cliente |
| `admin` | A | `45.132.157.28` | 🟠 Proxied | Painel admin |

---

## ⏳ Após Deletar

1. **Aguarde 5-10 minutos**
2. **Teste:**
   ```powershell
   ipconfig /flushdns
   nslookup api.protesecapilarcuiaba.com.br
   ```
3. **Deve retornar:** `82.25.65.201` ✅

---

**Depois continue no PASSO 2 do guia SSL!** 🚀

