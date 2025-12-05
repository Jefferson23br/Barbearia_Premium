# 🌐 Configurar DNS no Cloudflare - PASSO A PASSO

## 🎯 Objetivo

Configurar os 5 registros DNS necessários para o projeto funcionar.

---

## 📋 Registros a Adicionar

### ⚠️ IMPORTANTE: Ordem de Prioridade

1. **API (api.protesecapilarcuiaba.com.br)** - DNS ONLY (cinza ☁️)
   - Precisa estar DNS only para o Certbot validar
   
2. **Demais domínios** - Proxied (laranja 🟠)
   - Podem usar proxy do Cloudflare

---

## 🚀 PASSO A PASSO

### 1. Acessar Cloudflare

1. Abra: https://dash.cloudflare.com
2. Faça login na sua conta
3. Selecione o domínio: **protesecapilarcuiaba.com.br**
4. Clique em **DNS** no menu lateral
5. Clique em **Records**

### 2. Verificar Registros Existentes

**Antes de adicionar, verifique se já existem alguns registros.**

Se já existir algum registro para `api`, `www`, `app`, `admin` ou `@`, você pode:
- **Deletar** e recriar (mais limpo)
- **Editar** o existente

### 3. Adicionar Registro 1: API (Backend)

1. Clique em **Add record**
2. Preencha:
   - **Type:** `A`
   - **Name:** `api`
   - **IPv4 address:** `82.25.65.201`
   - **Proxy status:** Clique no ícone para ficar **CINZA** ☁️ (DNS only)
   - **TTL:** `Auto`
3. Clique em **Save**

**✅ Resultado:** `api.protesecapilarcuiaba.com.br` → `82.25.65.201` (sem proxy)

### 4. Adicionar Registro 2: Site Principal (WWW)

1. Clique em **Add record**
2. Preencha:
   - **Type:** `A`
   - **Name:** `www`
   - **IPv4 address:** `45.132.157.28`
   - **Proxy status:** Deixe **LARANJA** 🟠 (Proxied)
   - **TTL:** `Auto`
3. Clique em **Save**

**✅ Resultado:** `www.protesecapilarcuiaba.com.br` → `45.132.157.28` (com proxy)

### 5. Adicionar Registro 3: Painel Cliente (APP)

1. Clique em **Add record**
2. Preencha:
   - **Type:** `A`
   - **Name:** `app`
   - **IPv4 address:** `45.132.157.28`
   - **Proxy status:** Deixe **LARANJA** 🟠 (Proxied)
   - **TTL:** `Auto`
3. Clique em **Save**

**✅ Resultado:** `app.protesecapilarcuiaba.com.br` → `45.132.157.28` (com proxy)

### 6. Adicionar Registro 4: Painel Admin (ADMIN)

1. Clique em **Add record**
2. Preencha:
   - **Type:** `A`
   - **Name:** `admin`
   - **IPv4 address:** `45.132.157.28`
   - **Proxy status:** Deixe **LARANJA** 🟠 (Proxied)
   - **TTL:** `Auto`
3. Clique em **Save**

**✅ Resultado:** `admin.protesecapilarcuiaba.com.br` → `45.132.157.28` (com proxy)

### 7. Adicionar Registro 5: Domínio Raiz (@)

1. Clique em **Add record**
2. Preencha:
   - **Type:** `A`
   - **Name:** `@` (ou deixe vazio)
   - **IPv4 address:** `45.132.157.28`
   - **Proxy status:** Deixe **LARANJA** 🟠 (Proxied)
   - **TTL:** `Auto`
3. Clique em **Save**

**✅ Resultado:** `protesecapilarcuiaba.com.br` → `45.132.157.28` (com proxy)

---

## ⚙️ Configurar SSL/TLS no Cloudflare

### 1. SSL/TLS Overview

1. No menu lateral, clique em **SSL/TLS**
2. Clique em **Overview**
3. Selecione: **Full (strict)**
4. Salve

### 2. Edge Certificates

1. Ainda em **SSL/TLS**, clique em **Edge Certificates**
2. Ative estas opções:
   - ✅ **Always Use HTTPS** (ativar)
   - ✅ **Automatic HTTPS Rewrites** (ativar)
3. Em **TLS 1.3**, deixe ativado
4. Em **Minimum TLS Version**, selecione: **TLS 1.2**

---

## ✅ Verificar Registros Adicionados

Você deve ver na lista de registros:

```
Type | Name  | Content          | Proxy | TTL
-----|-------|------------------|-------|----
A    | api   | 82.25.65.201    | 🟡    | Auto
A    | www   | 45.132.157.28   | 🟠    | Auto
A    | app   | 45.132.157.28   | 🟠    | Auto
A    | admin | 45.132.157.28   | 🟠    | Auto
A    | @     | 45.132.157.28   | 🟠    | Auto
```

**⚠️ IMPORTANTE:**
- `api` deve ter ícone **CINZA** ☁️ (DNS only)
- Demais devem ter ícone **LARANJA** 🟠 (Proxied)

---

## ⏰ Aguardar Propagação DNS

**Tempo estimado:** 2-4 horas (pode ser mais rápido, mas até 48h em alguns casos)

### Como Verificar Propagação

**Opção 1: PowerShell (Windows)**
```powershell
nslookup api.protesecapilarcuiaba.com.br
nslookup www.protesecapilarcuiaba.com.br
```

**Opção 2: Online**
- Acesse: https://www.whatsmydns.net/
- Digite: `api.protesecapilarcuiaba.com.br`
- Clique em **Search**
- Deve mostrar: `82.25.65.201`

**Opção 3: Linux/Mac**
```bash
dig api.protesecapilarcuiaba.com.br
dig www.protesecapilarcuiaba.com.br
```

### O Que Esperar

**Antes da propagação:**
- Pode retornar erro ou IP antigo

**Após propagação:**
- `api.*` → `82.25.65.201`
- `www.*` → `45.132.157.28` (ou IP do Cloudflare se estiver Proxied)

---

## 📝 Checklist

- [ ] 5 registros DNS adicionados
- [ ] Registro `api` com proxy **DESATIVADO** (cinza ☁️)
- [ ] Registros `www`, `app`, `admin`, `@` com proxy **ATIVADO** (laranja 🟠)
- [ ] IPs corretos:
  - `api` → `82.25.65.201`
  - Demais → `45.132.157.28`
- [ ] SSL/TLS configurado: **Full (strict)**
- [ ] Always Use HTTPS ativado
- [ ] Aguardando propagação DNS

---

## 🎯 Próximo Passo

**Após DNS propagar (2-4 horas):**

→ Continuar com: [GUIA_SSL_DNS_COMPLETO.md](./GUIA_SSL_DNS_COMPLETO.md) (PASSO 2)

---

**DNS configurado! Aguardar propagação e continuar com SSL! 🚀**

