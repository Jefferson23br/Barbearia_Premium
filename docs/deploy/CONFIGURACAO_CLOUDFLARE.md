# ☁️ Configuração Cloudflare - protesecapilarcuiaba.com.br

## 🎯 Estrutura de Domínios Definida

```
www.protesecapilarcuiaba.com.br      → Site Público
app.protesecapilarcuiaba.com.br      → Painel do Cliente
admin.protesecapilarcuiaba.com.br    → Painel Administrativo
api.protesecapilarcuiaba.com.br      → API Backend
```

---

## 📋 PASSO 1: ADICIONAR DOMÍNIO AO CLOUDFLARE

### 1.1 Adicionar Site

1. Acesse https://dash.cloudflare.com
2. Clique em **"Add a Site"**
3. Digite: `protesecapilarcuiaba.com.br`
4. Selecione o plano (Free é suficiente)
5. Clique em **"Add site"**

### 1.2 Aguardar Scan de DNS

O Cloudflare irá escanear os registros DNS existentes.

---

## 🌐 PASSO 2: CONFIGURAR REGISTROS DNS

### 2.1 Adicionar/Editar Registros DNS

No painel do Cloudflare, vá em **DNS** → **Records** e configure:

```
┌─────────┬─────────┬─────────────────────────────────┬─────────────────┬──────────┐
│ Type    │ Name    │ Content                         │ Proxy Status    │ TTL      │
├─────────┼─────────┼─────────────────────────────────┼─────────────────┼──────────┤
│ A       │ @       │ IP_DA_VPS                       │ Proxied (🟠)    │ Auto     │
│ A       │ www     │ IP_DA_VPS                       │ Proxied (🟠)    │ Auto     │
│ A       │ app     │ IP_DA_VPS                       │ Proxied (🟠)    │ Auto     │
│ A       │ admin   │ IP_DA_VPS                       │ Proxied (🟠)    │ Auto     │
│ A       │ api     │ IP_DA_VPS                       │ DNS only (☁️)   │ Auto     │
└─────────┴─────────┴─────────────────────────────────┴─────────────────┴──────────┘
```

**⚠️ IMPORTANTE:**

- **Site, App, Admin**: Use **Proxied** (🟠 laranja)
  - Vantagens: CDN, DDoS protection, cache
  
- **API**: Use **DNS only** (☁️ cinza)
  - Motivo: Evitar conflitos com SSL próprio e certificados
  - APIs precisam de conexão direta

### 2.2 Explicação dos Registros

```
Tipo A - Nome: @
  → Aponta o domínio raiz (protesecapilarcuiaba.com.br) para o IP da VPS

Tipo A - Nome: www
  → Aponta www.protesecapilarcuiaba.com.br para o IP da VPS

Tipo A - Nome: app
  → Aponta app.protesecapilarcuiaba.com.br para o IP da VPS

Tipo A - Nome: admin
  → Aponta admin.protesecapilarcuiaba.com.br para o IP da VPS

Tipo A - Nome: api
  → Aponta api.protesecapilarcuiaba.com.br para o IP da VPS
  → SEM proxy (DNS only)
```

---

## 🔧 PASSO 3: CONFIGURAR NAMESERVERS

### 3.1 Obter Nameservers do Cloudflare

O Cloudflare fornecerá algo como:

```
chloe.ns.cloudflare.com
noel.ns.cloudflare.com
```

### 3.2 Alterar Nameservers no Registro.br

1. Acesse https://registro.br
2. Faça login com sua conta
3. Vá em **Meus Domínios** → `protesecapilarcuiaba.com.br`
4. Clique em **Alterar Servidores DNS**
5. Remova os nameservers atuais
6. Adicione os nameservers do Cloudflare:
   ```
   chloe.ns.cloudflare.com
   noel.ns.cloudflare.com
   ```
7. Salve as alterações

### 3.3 Aguardar Propagação

- **Tempo**: 2-48 horas (geralmente 2-4 horas)
- **Verificar**: https://www.whatsmydns.net/#NS/protesecapilarcuiaba.com.br

---

## 🛡️ PASSO 4: CONFIGURAR SSL/HTTPS NO CLOUDFLARE

### 4.1 SSL Mode

1. Vá em **SSL/TLS** → **Overview**
2. Selecione: **Full (strict)**
   - ⚠️ Isso requer SSL válido na VPS também

### 4.2 Always Use HTTPS

1. Vá em **SSL/TLS** → **Edge Certificates**
2. Ative **Always Use HTTPS**

### 4.3 Automatic HTTPS Rewrites

1. Na mesma página
2. Ative **Automatic HTTPS Rewrites**

### 4.4 Minimum TLS Version

1. Na mesma página
2. Configure: **TLS 1.2** (ou superior)

---

## 🚀 PASSO 5: CONFIGURAÇÕES DE PERFORMANCE

### 5.1 Auto Minify

1. Vá em **Speed** → **Optimization**
2. Ative **Auto Minify** para:
   - ✅ JavaScript
   - ✅ CSS
   - ✅ HTML

### 5.2 Brotli

1. Na mesma página
2. Ative **Brotli** (compressão melhor que Gzip)

### 5.3 Caching

1. Vá em **Caching** → **Configuration**
2. **Caching Level**: Standard
3. **Browser Cache TTL**: 4 hours (ou conforme necessidade)

### 5.4 Page Rules (Opcional)

Para otimizar cache do site público:

1. Vá em **Rules** → **Page Rules**
2. Criar regra:
   ```
   URL: www.protesecapilarcuiaba.com.br/*
   Settings:
   - Cache Level: Cache Everything
   - Edge Cache TTL: 2 hours
   ```

---

## 🔒 PASSO 6: SEGURANÇA NO CLOUDFLARE

### 6.1 Security Level

1. Vá em **Security** → **Settings**
2. **Security Level**: Medium (ou High se tiver muitos ataques)

### 6.2 Challenge Passage

1. Na mesma página
2. **Challenge Passage**: 30 minutes

### 6.3 Browser Integrity Check

1. Na mesma página
2. Ative **Browser Integrity Check**

### 6.4 Firewall Rules (Opcional)

Criar regra para proteger painel admin:

1. Vá em **Security** → **WAF**
2. Criar regra:
   ```
   Field: Hostname
   Operator: equals
   Value: admin.protesecapilarcuiaba.com.br
   
   Action: Challenge (ou JS Challenge)
   ```

---

## 🎯 PASSO 7: CONFIGURAÇÃO ESPECÍFICA PARA API

### 7.1 API Bypass Cloudflare (DNS Only)

⚠️ **IMPORTANTE**: A API deve usar **DNS only** (não proxied)

**Por quê?**
- Evita problemas com SSL
- Conexão direta é melhor para APIs
- Evita timeouts em requisições longas
- Certificado Let's Encrypt funcionará normalmente

### 7.2 Configurar Rate Limiting (Opcional)

Se quiser proteção adicional na API:

1. Vá em **Security** → **WAF**
2. Criar regra de rate limiting:
   ```
   Field: Hostname
   Operator: equals
   Value: api.protesecapilarcuiaba.com.br
   
   Rate: 100 requests per 10 seconds
   Action: Block
   ```

---

## ✅ PASSO 8: VERIFICAÇÃO

### 8.1 Verificar Propagação DNS

```bash
# No PowerShell ou terminal
nslookup www.protesecapilarcuiaba.com.br
nslookup app.protesecapilarcuiaba.com.br
nslookup admin.protesecapilarcuiaba.com.br
nslookup api.protesecapilarcuiaba.com.br
```

Todos devem apontar para o IP da VPS.

### 8.2 Verificar SSL

Após configurar SSL na VPS:

```bash
curl -I https://www.protesecapilarcuiaba.com.br
curl -I https://app.protesecapilarcuiaba.com.br
curl -I https://admin.protesecapilarcuiaba.com.br
curl -I https://api.protesecapilarcuiaba.com.br
```

Todos devem retornar **200 OK** ou **301/302**.

---

## 🔄 FLUXO DE DADOS

```
Cliente
  ↓
[Cloudflare] (Proxy para www, app, admin)
  ↓
[VPS Nginx] (SSL + Proxy)
  ↓
  ├─→ Site Público (Next.js Static)
  ├─→ Painel Cliente (Next.js Static)
  ├─→ Painel Admin (Next.js Static)
  └─→ API (Node.js :3001) ← Conexão direta, sem Cloudflare
```

---

## 📝 CONFIGURAÇÕES RECOMENDADAS NO CLOUDFLARE

### Security (Segurança)

- ✅ Security Level: Medium
- ✅ Challenge Passage: 30 minutes
- ✅ Browser Integrity Check: On
- ✅ Hotlink Protection: Off (pode ativar depois)

### Speed (Performance)

- ✅ Auto Minify: JavaScript, CSS, HTML
- ✅ Brotli: On
- ✅ Rocket Loader: Off (pode causar problemas com React)
- ✅ Early Hints: On

### Caching

- ✅ Caching Level: Standard
- ✅ Browser Cache TTL: 4 hours

### SSL/TLS

- ✅ SSL/TLS encryption mode: Full (strict)
- ✅ Always Use HTTPS: On
- ✅ Minimum TLS Version: TLS 1.2
- ✅ Automatic HTTPS Rewrites: On

---

## ⚙️ INTEGRAÇÃO COM VPS

### Configurar CORS na API

Como a API não passará pelo Cloudflare, configure CORS para aceitar os domínios:

```javascript
// No backend
const allowedOrigins = [
  'https://www.protesecapilarcuiaba.com.br',
  'https://app.protesecapilarcuiaba.com.br',
  'https://admin.protesecapilarcuiaba.com.br',
  'http://localhost:3000', // Desenvolvimento
];
```

---

## 📊 Resumo da Configuração

| Serviço | Domínio | Cloudflare | SSL | Servidor |
|---------|---------|------------|-----|----------|
| Site | www.protesecapilarcuiaba.com.br | ✅ Proxied | Cloudflare + VPS | Nginx → Static |
| App | app.protesecapilarcuiaba.com.br | ✅ Proxied | Cloudflare + VPS | Nginx → Static |
| Admin | admin.protesecapilarcuiaba.com.br | ✅ Proxied | Cloudflare + VPS | Nginx → Static |
| API | api.protesecapilarcuiaba.com.br | ⚠️ DNS Only | VPS (Let's Encrypt) | Nginx → Node.js :3001 |

---

## ✅ CHECKLIST CLOUDFLARE

- [ ] Domínio adicionado ao Cloudflare
- [ ] Nameservers obtidos do Cloudflare
- [ ] Nameservers alterados no Registro.br
- [ ] Propagação DNS concluída
- [ ] Registros A configurados
- [ ] API configurada como DNS only
- [ ] Site, App e Admin configurados como Proxied
- [ ] SSL mode: Full (strict)
- [ ] Always Use HTTPS ativado
- [ ] Auto Minify ativado
- [ ] Brotli ativado
- [ ] Security Level configurado

---

**Cloudflare configurado e pronto!** ☁️🔒

