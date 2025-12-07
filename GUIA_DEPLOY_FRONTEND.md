# 🚀 Guia Completo - Deploy Frontend para Produção

## ✅ Resposta à Sua Dúvida

**Sim! É exatamente assim!**

1. **Build** → `npm run build` (gera arquivos estáticos)
2. **Upload** → Enviar pasta `out/` para hospedagem
3. **API REST** → ✅ Funciona automaticamente com os endpoints oficiais

---

## 🎯 Como Funciona

### Arquitetura

```
┌─────────────────────────────────────┐
│   Hospedagem (Arquivos Estáticos)   │
│   - admin.protesecapilarcuiaba.com  │
│   - app.protesecapilarcuiaba.com    │
│   - www.protesecapilarcuiaba.com    │
└──────────────┬──────────────────────┘
               │
               │ HTTPS (chamadas API)
               │
               ▼
┌─────────────────────────────────────┐
│   VPS Backend (API REST)            │
│   https://api.protesecapilarcuiaba  │
│   - Node.js + Express               │
│   - PostgreSQL                      │
└─────────────────────────────────────┘
```

### O Que Acontece

1. **Usuário acessa:** `https://admin.protesecapilarcuiaba.com.br`
2. **Hospedagem serve:** Arquivos HTML/CSS/JS estáticos
3. **JavaScript roda no navegador** e faz chamadas para:
   - `https://api.protesecapilarcuiaba.com.br/api/v1/auth/admin/login`
4. **API responde** e tudo funciona! ✅

---

## 📋 Processo de Deploy Passo a Passo

### 1️⃣ Build do Projeto

#### Painel Admin
```bash
cd frontend/painel-admin
npm run build
```

Isso cria a pasta `out/` com todos os arquivos estáticos.

#### Painel Cliente
```bash
cd frontend/painel-cliente
npm run build
```

#### Site Entrada
```bash
cd frontend/site-entrada
npm run build
```

---

### 2️⃣ Verificar Build

Após o build, verifique se a pasta `out/` foi criada:

```bash
ls -la out/
# Deve ter: index.html, _next/, images/, etc.
```

---

### 3️⃣ Enviar para Hospedagem

Envie o **conteúdo** da pasta `out/` para a hospedagem:

#### Via FTP/SFTP:
- Conecte na hospedagem
- Navegue até a pasta do domínio
- Upload de todos os arquivos da pasta `out/`

#### Via Painel de Controle:
- Acesse o gerenciador de arquivos
- Faça upload dos arquivos

---

### 4️⃣ Verificar Domínios

Cada projeto vai para seu domínio:

| Projeto | Domínio | Pasta |
|---------|---------|-------|
| Painel Admin | `admin.protesecapilarcuiaba.com.br` | Conteúdo de `out/` |
| Painel Cliente | `app.protesecapilarcuiaba.com.br` | Conteúdo de `out/` |
| Site Entrada | `www.protesecapilarcuiaba.com.br` | Conteúdo de `out/` |

---

## ⚠️ Configurações Importantes

### 1. API URL

Os projetos já estão configurados para usar:
```javascript
const apiUrl = 'https://api.protesecapilarcuiaba.com.br';
```

**Não precisa configurar nada adicional!** ✅

### 2. CORS no Backend

O backend já permite requisições dos domínios:
- ✅ `https://admin.protesecapilarcuiaba.com.br`
- ✅ `https://app.protesecapilarcuiaba.com.br`
- ✅ `https://www.protesecapilarcuiaba.com.br`

---

## 🔍 O Que É Gerado no Build

### Estrutura da Pasta `out/`

```
out/
├── index.html              # Página inicial
├── dashboard/
│   └── index.html          # Dashboard
├── _next/
│   ├── static/             # JavaScript/CSS
│   └── chunks/             # Código compilado
├── images/
│   └── logo.webp           # Imagens
└── 404.html                # Página de erro
```

**Todos esses arquivos são estáticos e podem ser servidos por qualquer servidor web!**

---

## ✅ Checklist de Deploy

### Antes do Deploy

- [ ] Testar localmente (`npm run dev`)
- [ ] Verificar se login funciona
- [ ] Verificar se dashboard aparece
- [ ] Verificar se API está acessível

### Durante o Deploy

- [ ] Fazer build (`npm run build`)
- [ ] Verificar se pasta `out/` foi criada
- [ ] Fazer backup dos arquivos atuais (se houver)
- [ ] Upload dos arquivos para hospedagem

### Após o Deploy

- [ ] Acessar o domínio no navegador
- [ ] Testar login
- [ ] Verificar se dashboard funciona
- [ ] Verificar console do navegador (F12) para erros

---

## 🧪 Testar Produção

Após fazer deploy, teste:

1. **Acesse:** `https://admin.protesecapilarcuiaba.com.br`
2. **Faça login** com suas credenciais
3. **Verifique console** (F12) - não deve ter erros
4. **Teste funcionalidades** básicas

---

## 📝 Exemplo Completo

### Painel Admin

```bash
# 1. Build
cd frontend/painel-admin
npm run build

# 2. Verificar
ls -la out/

# 3. Upload (via FTP/SFTP/Painel)
# - Conectar na hospedagem
# - Navegar até pasta do domínio admin.protesecapilarcuiaba.com.br
# - Upload de todos os arquivos de out/

# 4. Testar
# Acesse: https://admin.protesecapilarcuiaba.com.br
```

---

## ⚡ Dicas

1. **Sempre faça backup** antes de fazer deploy
2. **Teste localmente primeiro** antes de fazer upload
3. **Use HTTPS** (já configurado nos domínios)
4. **Verifique logs** do servidor se houver problemas

---

## ✅ Resumo

- ✅ Build gera arquivos estáticos
- ✅ Upload para hospedagem
- ✅ Frontend se conecta automaticamente à API REST
- ✅ Tudo funciona! 🚀

**É simples assim! Build → Upload → Funciona!**

