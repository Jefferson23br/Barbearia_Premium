# 🚀 Deploy na Hostinger - Hospedagem Compartilhada

**Tipo**: Hospedagem Compartilhada (não VPS)  
**Painel**: hPanel (Gerenciador de Arquivos da Hostinger)

Este guia é específico para fazer deploy na hospedagem compartilhada da Hostinger.

---

## 📁 Estrutura de Pastas na Hostinger

Na hospedagem compartilhada da Hostinger, a estrutura é:

```
/home/usuario/domains/protesecapilarcuiaba.com.br/public_html/
  ├── index.html (site principal)
  ├── app/
  │   └── index.html (painel cliente)
  └── admin/
      └── index.html (painel admin)
```

**OU** (dependendo da configuração):

```
/public_html/
  ├── index.html (site principal)
  ├── app/
  │   └── index.html (painel cliente)
  └── admin/
      └── index.html (painel admin)
```

---

## 🔧 Passo 1: Acessar o Gerenciador de Arquivos

1. Acesse o **hPanel** da Hostinger
2. Vá em **Gerenciador de Arquivos** (File Manager)
3. Navegue até a pasta `public_html`

---

## 📤 Passo 2: Fazer Upload dos Arquivos

### Opção A: Via Gerenciador de Arquivos (Interface Web)

1. **No Gerenciador de Arquivos:**
   - Navegue até `public_html`
   - Clique em **Upload** (botão no topo)

2. **Para Site Principal:**
   - Faça upload de **TODOS** os arquivos de `frontend/site-entrada/out/`
   - Selecione todos os arquivos e pastas
   - Aguarde o upload completar

3. **Para Painel Cliente:**
   - Crie a pasta `app` dentro de `public_html` (se não existir)
   - Entre na pasta `app`
   - Faça upload de **TODOS** os arquivos de `frontend/painel-cliente/out/`

4. **Para Painel Admin:**
   - Crie a pasta `admin` dentro de `public_html` (se não existir)
   - Entre na pasta `admin`
   - Faça upload de **TODOS** os arquivos de `frontend/painel-admin/out/`

### Opção B: Via FTP (Recomendado para muitos arquivos)

1. **Conecte-se via FTP:**
   - Host: `ftp.protesecapilarcuiaba.com.br` ou IP fornecido pela Hostinger
   - Usuário: (seu usuário FTP)
   - Senha: (sua senha FTP)
   - Porta: 21

2. **Use FileZilla, WinSCP ou similar:**
   - Navegue até `public_html`
   - Faça upload dos arquivos conforme descrito acima

---

## ⚙️ Passo 3: Configurar Subdomínios no hPanel

### Criar Subdomínios

1. No **hPanel**, vá em **Domínios** → **Subdomínios**
2. Crie os subdomínios:

   **Subdomínio `app`:**
   - Nome: `app`
   - Document Root: `public_html/app`
   - Clique em **Criar**

   **Subdomínio `admin`:**
   - Nome: `admin`
   - Document Root: `public_html/admin`
   - Clique em **Criar**

### Verificar Configuração

Após criar, verifique se os subdomínios estão apontando para as pastas corretas:
- `app.protesecapilarcuiaba.com.br` → `public_html/app`
- `admin.protesecapilarcuiaba.com.br` → `public_html/admin`

---

## 📝 Passo 4: Criar Arquivos .htaccess

### Via Gerenciador de Arquivos

1. **Para Site Principal (`public_html/.htaccess`):**
   - Clique em **Novo Arquivo**
   - Nome: `.htaccess`
   - Cole o conteúdo:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

2. **Para Painel Cliente (`public_html/app/.htaccess`):**
   - Entre na pasta `app`
   - Clique em **Novo Arquivo**
   - Nome: `.htaccess`
   - Cole o conteúdo:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /app/
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /app/index.html [L]
</IfModule>
```

3. **Para Painel Admin (`public_html/admin/.htaccess`):**
   - Entre na pasta `admin`
   - Clique em **Novo Arquivo**
   - Nome: `.htaccess`
   - Cole o conteúdo:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /admin/
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /admin/index.html [L]
</IfModule>
```

---

## 🔐 Passo 5: Configurar Permissões (se necessário)

No Gerenciador de Arquivos:

1. Selecione os arquivos/pastas
2. Clique com botão direito → **Permissões** ou **Change Permissions**
3. Configure:
   - **Arquivos**: `644`
   - **Pastas**: `755`

---

## ✅ Passo 6: Verificar Estrutura Final

A estrutura deve estar assim:

```
public_html/
├── index.html ✅
├── .htaccess ✅
├── _next/ ✅
├── app/
│   ├── index.html ✅
│   ├── .htaccess ✅
│   └── _next/ ✅
└── admin/
    ├── index.html ✅
    ├── .htaccess ✅
    └── _next/ ✅
```

---

## 🧪 Passo 7: Testar

Aguarde alguns minutos para propagação e teste:

1. **Site Principal**: https://www.protesecapilarcuiaba.com.br
2. **Painel Cliente**: https://app.protesecapilarcuiaba.com.br
3. **Painel Admin**: https://admin.protesecapilarcuiaba.com.br

---

## 🐛 Resolver Erro 403

Se ainda aparecer erro 403:

### Verificação 1: Arquivos no lugar certo?

No Gerenciador de Arquivos, verifique:
- ✅ `public_html/index.html` existe?
- ✅ `public_html/app/index.html` existe?
- ✅ `public_html/admin/index.html` existe?

### Verificação 2: Subdomínios configurados?

1. No hPanel, vá em **Domínios** → **Subdomínios**
2. Verifique se `app` e `admin` estão criados
3. Verifique se o **Document Root** está correto:
   - `app` → `public_html/app`
   - `admin` → `public_html/admin`

### Verificação 3: .htaccess existe?

Verifique se os arquivos `.htaccess` existem em cada pasta.

### Verificação 4: Permissões

1. Selecione `index.html` em cada pasta
2. Clique em **Permissões**
3. Configure como `644`

---

## 📋 Checklist Completo

- [ ] Builds foram gerados (`npm run build` em cada projeto)
- [ ] Arquivos foram enviados para `public_html/`
- [ ] Arquivo `index.html` existe em cada pasta
- [ ] Pasta `_next/` foi enviada junto
- [ ] Subdomínios `app` e `admin` foram criados no hPanel
- [ ] Document Root dos subdomínios está correto
- [ ] Arquivos `.htaccess` foram criados em cada pasta
- [ ] Permissões estão corretas (644 para arquivos, 755 para pastas)
- [ ] Aguardou alguns minutos para propagação
- [ ] Testou acessar os sites

---

## 🔄 Atualizar Arquivos no Futuro

Para atualizar os sites:

1. Gere novos builds localmente:
   ```bash
   cd frontend/site-entrada && npm run build
   cd ../painel-cliente && npm run build
   cd ../painel-admin && npm run build
   ```

2. Via Gerenciador de Arquivos:
   - Delete os arquivos antigos (ou faça backup)
   - Faça upload dos novos arquivos da pasta `out/`

3. Via FTP:
   - Substitua os arquivos antigos pelos novos

---

## 📞 Informações Importantes

**Tipo de Hospedagem**: Compartilhada (hPanel)  
**Painel**: hPanel da Hostinger  
**Pasta Pública**: `public_html/`

**URLs:**
- Site Principal: https://www.protesecapilarcuiaba.com.br
- Painel Cliente: https://app.protesecapilarcuiaba.com.br
- Painel Admin: https://admin.protesecapilarcuiaba.com.br

---

**Última atualização**: 14 de Dezembro de 2025


