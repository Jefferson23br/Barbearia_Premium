# 🔧 Corrigir DNS para API - Problema Resolvido

**Problema:** `nslookup api.protesecapilarcuiaba.com.br` está dando timeout.

**Solução:** Adicionar registro A para `api` na Cloudflare.

---

## 📋 PASSO A PASSO RÁPIDO

### 1. Acessar Cloudflare DNS

1. Acesse: **https://dash.cloudflare.com**
2. Selecione o domínio: **protesecapilarcuiaba.com.br**
3. Clique em **DNS** → **Records** (ou **DNS** → **Registros**)

### 2. Verificar Registros Existentes

Você deve ver algo assim:

```
✅ Type: A | Name: www   | Content: 45.132.157.28 | Proxy: 🟠 Proxied
✅ Type: A | Name: app   | Content: 45.132.157.28 | Proxy: 🟠 Proxied
✅ Type: A | Name: admin | Content: 45.132.157.28 | Proxy: 🟠 Proxied
✅ Type: A | Name: @     | Content: 45.132.157.28 | Proxy: 🟠 Proxied
❌ Type: A | Name: api   | Content: ???           | Proxy: ??? ← ESTE FALTA!
```

### 3. Adicionar Registro para API

1. Clique no botão **"Add record"** ou **"Adicionar registro"**

2. Preencha exatamente assim:

   ```
   Type:          A
   Name:          api
   IPv4 address:  82.25.65.201
   Proxy status:  DNS only (ícone CINZA ☁️) ← MUITO IMPORTANTE!
   TTL:           Auto
   ```

3. **⚠️ ATENÇÃO CRÍTICA:**
   - O **Proxy status** DEVE estar em **DNS only** (ícone CINZA ☁️)
   - **NÃO** use "Proxied" (ícone laranja 🟠)
   - Por quê? O Certbot precisa validar via HTTP direto no servidor

4. Clique em **"Save"** ou **"Salvar"**

### 4. Verificar o Registro Criado

Você deve ver na lista:

```
✅ Type: A | Name: api   | Content: 82.25.65.201 | Proxy: ☁️ DNS only
```

---

## ⏳ Aguardar Propagação DNS

Após adicionar o registro, aguarde **5-30 minutos** para propagação.

### 5. Verificar Propagação (Windows PowerShell)

Abra o PowerShell e execute:

```powershell
# Limpar cache DNS do Windows
ipconfig /flushdns

# Verificar propagação do API
nslookup api.protesecapilarcuiaba.com.br

# Verificar propagação do WWW (já funciona)
nslookup www.protesecapilarcuiaba.com.br
```

**Resultado Esperado para API:**

```
Servidor:  UnKnown
Address:   [seu DNS local]

Nome:    api.protesecapilarcuiaba.com.br
Address:  82.25.65.201  ← DEVE APARECER ESTE IP!
```

### 6. Se Ainda Não Funcionar

**Opção 1: Verificar na Cloudflare**

1. Volte no Cloudflare
2. Verifique se o registro está salvo corretamente
3. Verifique se não tem dois registros duplicados para `api`

**Opção 2: Usar DNS Público**

No PowerShell, force o uso de um DNS público:

```powershell
# Usar DNS do Google
nslookup api.protesecapilarcuiaba.com.br 8.8.8.8

# Ou usar DNS da Cloudflare
nslookup api.protesecapilarcuiaba.com.br 1.1.1.1
```

**Opção 3: Verificar Online**

Acesse: https://www.whatsmydns.net/#A/api.protesecapilarcuiaba.com.br

Deve mostrar o IP `82.25.65.201` em vários locais do mundo.

---

## ✅ Checklist

- [ ] Acessei Cloudflare Dashboard
- [ ] Verifiquei registros existentes
- [ ] Adicionei registro A para `api`
- [ ] IP configurado: `82.25.65.201`
- [ ] Proxy status: **DNS only** (☁️ cinza)
- [ ] Registro salvo com sucesso
- [ ] Aguardei 5-30 minutos
- [ ] Limpei cache DNS (`ipconfig /flushdns`)
- [ ] Testei `nslookup api.protesecapilarcuiaba.com.br`
- [ ] IP retornado: `82.25.65.201` ✅

---

## 🎯 Próximo Passo

Quando o DNS estiver funcionando (retornando `82.25.65.201`), volte para o guia principal:

**`GUIA_SSL_DNS_COMPLETO.md`** → PASSO 2 (Configurar Nginx)

---

**Criado em:** $(Get-Date -Format "dd/MM/yyyy HH:mm")  
**Status:** Pronto para executar ✅

