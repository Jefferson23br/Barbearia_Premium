# 🔧 CORRIGIR: Registro DNS Duplicado para API

## ❌ Problema Identificado

Na sua configuração DNS do Cloudflare, existem **DOIS registros A** para `api`:

1. ❌ **INCORRETO:** `api` → `45.132.157.28` (Proxied 🟠) ← **DELETAR ESTE!**
2. ✅ **CORRETO:** `api` → `82.25.65.201` (DNS only ☁️) ← **MANTER ESTE!**

**O registro duplicado está causando conflito no DNS!**

---

## ✅ Solução: Deletar o Registro Incorreto

### Passo a Passo:

1. **Acesse Cloudflare:**
   - URL: https://dash.cloudflare.com
   - Domínio: **protesecapilarcuiaba.com.br**
   - Menu: **DNS** → **Records**

2. **Encontre o Registro Incorreto:**
   - Procure na lista o registro:
     ```
     Type: A | Name: api | Content: 45.132.157.28 | Proxy: 🟠 Proxied
     ```

3. **Deletar o Registro:**
   - Clique no ícone **"Edit"** (lápis) ou **"..."** (três pontos)
   - Clique em **"Delete"** ou **"Deletar"**
   - Confirme a exclusão

4. **Verificar que Restou Apenas o Correto:**
   
   Você deve ver apenas:
   ```
   ✅ Type: A | Name: api | Content: 82.25.65.201 | Proxy: ☁️ DNS only
   ```

---

## 📊 Configuração Final Correta

Após corrigir, seus registros devem estar assim:

| Name | Type | Content | Proxy | Status |
|------|------|---------|-------|--------|
| `api` | A | `82.25.65.201` | ☁️ DNS only | ✅ Correto |
| `www` | CNAME | `protesecapilarcuiaba.com.br` | 🟠 Proxied | ✅ OK |
| `app` | A | `45.132.157.28` | 🟠 Proxied | ✅ OK |
| `admin` | A | `45.132.157.28` | 🟠 Proxied | ✅ OK |
| `@` (raiz) | A | `45.132.157.28` | 🟠 Proxied | ✅ OK |

---

## 🎯 Arquitetura Correta

```
┌─────────────────────────────────────────────────────────────┐
│                    ARQUITETURA DNS                          │
└─────────────────────────────────────────────────────────────┘

📦 FRONTEND (Hospedagem Compartilhada)
   IP: 45.132.157.28
   │
   ├── www.protesecapilarcuiaba.com.br    → 45.132.157.28 🟠
   ├── app.protesecapilarcuiaba.com.br    → 45.132.157.28 🟠
   ├── admin.protesecapilarcuiaba.com.br  → 45.132.157.28 🟠
   └── protesecapilarcuiaba.com.br        → 45.132.157.28 🟠

🖥️  BACKEND (VPS com Banco de Dados)
   IP: 82.25.65.201
   │
   └── api.protesecapilarcuiaba.com.br    → 82.25.65.201 ☁️
       (Node.js API + PostgreSQL)
```

---

## ⏳ Após Deletar o Duplicado

1. **Aguarde 5-10 minutos** para propagação DNS

2. **Limpe o cache DNS:**
   ```powershell
   ipconfig /flushdns
   ```

3. **Teste novamente:**
   ```powershell
   nslookup api.protesecapilarcuiaba.com.br
   ```

   **Resultado esperado:**
   ```
   Nome:    api.protesecapilarcuiaba.com.br
   Address: 82.25.65.201  ✅
   ```

---

## ✅ Checklist

- [ ] Acessei Cloudflare Dashboard
- [ ] Encontrei o registro duplicado (`api` → `45.132.157.28`)
- [ ] Deletei o registro incorreto
- [ ] Verifiquei que restou apenas o correto (`api` → `82.25.65.201` com DNS only)
- [ ] Aguardei 5-10 minutos
- [ ] Limpei cache DNS
- [ ] Testei nslookup
- [ ] Funcionou! ✅

---

## 🎯 Próximo Passo

Quando o DNS estiver funcionando corretamente (apenas um registro para `api`):

➡️ Continue no **`GUIA_SSL_DNS_COMPLETO.md`** → **PASSO 2** (Configurar Nginx)

---

**Criado:** $(Get-Date -Format "dd/MM/yyyy HH:mm")  
**Status:** ⚠️ Aguardando deletar registro duplicado

