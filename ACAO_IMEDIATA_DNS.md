# 🚨 AÇÃO IMEDIATA - Criar Registro DNS para API

## ❌ Problema

O comando `nslookup api.protesecapilarcuiaba.com.br` está dando **timeout** porque o registro DNS ainda **não existe** na Cloudflare.

---

## ✅ FAÇA AGORA (5 minutos)

### 1. Acesse o Cloudflare

👉 **https://dash.cloudflare.com**

1. Faça login
2. Selecione o domínio: **protesecapilarcuiaba.com.br**
3. Clique em **DNS** (menu lateral)
4. Clique em **Records**

### 2. Adicione o Registro para API

1. Clique no botão **"+ Add record"** (ou **"Adicionar registro"**)

2. Preencha **EXATAMENTE** assim:

   ```
   Type:          A
   Name:          api
   IPv4 address:  82.25.65.201
   Proxy status:  ☁️ DNS only (CINZA) ← CLIQUE PARA FICAR CINZA!
   TTL:           Auto
   ```

3. **⚠️ ATENÇÃO CRÍTICA:**
   - O botão de proxy (ícone de nuvem) deve estar **CINZA** ☁️ (DNS only)
   - **NÃO** pode estar **LARANJA** 🟠 (Proxied)
   - Por quê? O Certbot precisa acessar o servidor diretamente para validar o SSL

4. Clique em **Save**

### 3. Verifique se Foi Criado

Você deve ver na lista de registros:

```
✅ A  api  →  82.25.65.201  ☁️ DNS only
```

---

## ⏳ Aguarde Propagação (5-30 minutos)

### 4. Teste Novamente

Aguarde alguns minutos e teste:

```powershell
# Limpar cache DNS do Windows
ipconfig /flushdns

# Testar API
nslookup api.protesecapilarcuiaba.com.br
```

**Resultado Esperado:**

```
Nome:    api.protesecapilarcuiaba.com.br
Address: 82.25.65.201  ✅
```

### 5. Se Ainda Não Funcionar

Teste com DNS público (força usar DNS do Google):

```powershell
nslookup api.protesecapilarcuiaba.com.br 8.8.8.8
```

**Ou verifique online:**
🌐 https://www.whatsmydns.net/#A/api.protesecapilarcuiaba.com.br

---

## 📋 Checklist

- [ ] Acessei Cloudflare Dashboard
- [ ] Fui em DNS → Records
- [ ] Cliquei em "Add record"
- [ ] Preenchi:
  - Type: A
  - Name: api
  - IPv4: 82.25.65.201
  - Proxy: ☁️ DNS only (CINZA)
- [ ] Salvei o registro
- [ ] Verifiquei que aparece na lista
- [ ] Aguardei 5-30 minutos
- [ ] Testei nslookup
- [ ] Funcionou! ✅

---

## 🎯 Depois que Funcionar

Quando o DNS estiver funcionando (retornando `82.25.65.201`), continue com:

➡️ **`GUIA_SSL_DNS_COMPLETO.md`** → **PASSO 2** (Configurar Nginx)

---

**Status:** ⏳ Aguardando você criar o registro DNS no Cloudflare

