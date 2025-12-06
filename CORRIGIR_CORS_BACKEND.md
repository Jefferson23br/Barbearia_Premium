# 🔧 Corrigir CORS no Backend (VPS)

## ⚠️ Problema

O erro "Failed to fetch" geralmente é causado por CORS bloqueando requisições de `localhost:3000`.

## ✅ Solução: Atualizar CORS no Backend

### Passo 1: Na VPS, editar arquivo `.env`

```bash
nano /home/cyberpanel/app/backend/.env
```

### Passo 2: Verificar/Atualizar CORS_ORIGINS

O arquivo deve ter:

```env
CORS_ORIGINS=https://www.protesecapilarcuiaba.com.br,https://app.protesecapilarcuiaba.com.br,https://admin.protesecapilarcuiaba.com.br,http://localhost:3000
```

**OU mais completo (para desenvolvimento):**

```env
CORS_ORIGINS=https://www.protesecapilarcuiaba.com.br,https://app.protesecapilarcuiaba.com.br,https://admin.protesecapilarcuiaba.com.br,http://localhost:3000,http://localhost:3002,http://127.0.0.1:3000
```

### Passo 3: Reiniciar Backend

```bash
pm2 restart api-protese-capilar
```

### Passo 4: Verificar Logs

```bash
pm2 logs api-protese-capilar --lines 20
```

---

## 🔍 Alternativa: Testar se CORS está funcionando

Execute no PowerShell (do seu computador):

```powershell
Invoke-WebRequest -Uri "https://api.protesecapilarcuiaba.com.br/health" -Method GET
```

Se funcionar, o problema pode ser no código do frontend.

---

## ✅ Verificação Rápida

1. **Backend permite localhost:3000 no CORS?** ✅ Verificar `.env`
2. **Backend reiniciado?** ✅ `pm2 restart api-protese-capilar`
3. **Next.js reiniciado após criar .env.local?** ✅ Parar e iniciar novamente

---

**Execute na VPS e depois teste novamente!** 🚀

