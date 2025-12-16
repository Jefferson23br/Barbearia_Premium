# 🔧 Como Corrigir Erro 403 - Forbidden

**Problema**: Erro 403 ao acessar `app.protesecapilarcuiaba.com.br` e `admin.protesecapilarcuiaba.com.br`

**Causa**: O servidor está negando acesso aos arquivos. Pode ser por:
- Permissões de arquivo incorretas
- Arquivo `index.html` não encontrado
- Arquivos na pasta errada
- Configuração do servidor web

---

## ✅ Solução 1: Verificar se os Arquivos Estão na Pasta Correta

### Para Hostinger (Apache)

Os arquivos devem estar em:

**Site Principal (`www.protesecapilarcuiaba.com.br`):**
```
/public_html/
  ├── index.html
  ├── _next/
  └── ... (todos os arquivos da pasta out/)
```

**Painel Cliente (`app.protesecapilarcuiaba.com.br`):**
```
/public_html/app/
  ├── index.html
  ├── _next/
  └── ... (todos os arquivos da pasta out/)
```

**Painel Admin (`admin.protesecapilarcuiaba.com.br`):**
```
/public_html/admin/
  ├── index.html
  ├── _next/
  └── ... (todos os arquivos da pasta out/)
```

### Verificar via FTP/SFTP

1. Conecte-se ao servidor via FTP
2. Navegue até `/public_html/`
3. Verifique se existe:
   - `index.html` na raiz (para site principal)
   - `app/index.html` (para painel cliente)
   - `admin/index.html` (para painel admin)

---

## ✅ Solução 2: Verificar Permissões dos Arquivos

### Via FTP/SFTP

1. Conecte-se ao servidor
2. Clique com botão direito nos arquivos/pastas
3. Selecione "File Permissions" ou "Permissões"
4. Configure:
   - **Arquivos**: `644` (rw-r--r--)
   - **Pastas**: `755` (rwxr-xr-x)

### Via SSH (se tiver acesso)

```bash
# Conecte-se ao servidor
ssh usuario@45.132.157.28

# Navegue até a pasta
cd /home/usuario/public_html/

# Corrigir permissões dos arquivos
find . -type f -exec chmod 644 {} \;

# Corrigir permissões das pastas
find . -type d -exec chmod 755 {} \;

# Dar permissão de leitura para o servidor web
chown -R usuario:usuario .
```

---

## ✅ Solução 3: Verificar se o index.html Existe

### Verificar via FTP

1. Conecte-se ao servidor
2. Navegue até a pasta correta
3. Verifique se existe `index.html`

**Se não existir:**
- Os arquivos não foram enviados corretamente
- Faça upload novamente de TODOS os arquivos da pasta `out/`

---

## ✅ Solução 4: Configurar .htaccess Corretamente

Crie ou edite o arquivo `.htaccess` em cada pasta:

### `/public_html/.htaccess` (Site Principal)

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>

# Permitir acesso a arquivos estáticos
<FilesMatch "\.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot|json)$">
  Order Allow,Deny
  Allow from all
</FilesMatch>

# Permitir acesso ao index.html
<Files "index.html">
  Order Allow,Deny
  Allow from all
</Files>
```

### `/public_html/app/.htaccess` (Painel Cliente)

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /app/
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /app/index.html [L]
</IfModule>

# Permitir acesso a arquivos estáticos
<FilesMatch "\.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot|json)$">
  Order Allow,Deny
  Allow from all
</FilesMatch>

# Permitir acesso ao index.html
<Files "index.html">
  Order Allow,Deny
  Allow from all
</Files>
```

### `/public_html/admin/.htaccess` (Painel Admin)

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /admin/
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /admin/index.html [L]
</IfModule>

# Permitir acesso a arquivos estáticos
<FilesMatch "\.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot|json)$">
  Order Allow,Deny
  Allow from all
</FilesMatch>

# Permitir acesso ao index.html
<Files "index.html">
  Order Allow,Deny
  Allow from all
</Files>
```

---

## ✅ Solução 5: Verificar Estrutura de Pastas no Hostinger

### Via Painel Hostinger (hPanel)

1. Acesse o painel da Hostinger
2. Vá em **Gerenciador de Arquivos**
3. Navegue até `public_html`
4. Verifique a estrutura:

```
public_html/
├── index.html (site principal)
├── .htaccess (site principal)
├── _next/ (assets do site principal)
├── app/
│   ├── index.html
│   ├── .htaccess
│   └── _next/
└── admin/
    ├── index.html
    ├── .htaccess
    └── _next/
```

---

## ✅ Solução 6: Reenviar Arquivos Corretamente

### Passo a Passo

1. **No seu computador local:**
   ```bash
   # Verifique se os builds foram gerados
   cd frontend/site-entrada
   ls out/  # Deve mostrar index.html e outras pastas
   
   cd ../painel-cliente
   ls out/  # Deve mostrar index.html e outras pastas
   
   cd ../painel-admin
   ls out/  # Deve mostrar index.html e outras pastas
   ```

2. **Via FTP/SFTP:**
   - Conecte-se ao servidor
   - Navegue até `/public_html/`
   - **Para Site Principal**: Faça upload de TODOS os arquivos de `frontend/site-entrada/out/` para `/public_html/`
   - **Para Painel Cliente**: Faça upload de TODOS os arquivos de `frontend/painel-cliente/out/` para `/public_html/app/`
   - **Para Painel Admin**: Faça upload de TODOS os arquivos de `frontend/painel-admin/out/` para `/public_html/admin/`

3. **Importante:**
   - ✅ Envie TODOS os arquivos e pastas
   - ✅ Mantenha a estrutura de pastas intacta
   - ✅ Não envie apenas alguns arquivos

---

## ✅ Solução 7: Verificar Configuração do Domínio no Hostinger

### Via Painel Hostinger

1. Acesse o painel da Hostinger
2. Vá em **Domínios**
3. Verifique se os subdomínios estão configurados:
   - `app.protesecapilarcuiaba.com.br` → aponta para `/public_html/app/`
   - `admin.protesecapilarcuiaba.com.br` → aponta para `/public_html/admin/`

**Se não estiverem configurados:**
1. Vá em **Subdomínios**
2. Crie os subdomínios:
   - `app` → `/public_html/app`
   - `admin` → `/public_html/admin`

---

## 🐛 Troubleshooting

### Ainda aparece 403 após seguir todos os passos?

1. **Verifique os logs do servidor:**
   - Via SSH: `tail -f /var/log/apache2/error.log` ou `/var/log/nginx/error.log`
   - Via painel Hostinger: Verifique os logs de erro

2. **Teste acessar diretamente o IP:**
   - `http://45.132.157.28` (deve mostrar o site principal)
   - `http://45.132.157.28/app/` (deve mostrar o painel cliente)
   - `http://45.132.157.28/admin/` (deve mostrar o painel admin)

3. **Verifique se o servidor web está rodando:**
   - Via SSH: `sudo systemctl status apache2` ou `sudo systemctl status nginx`

4. **Limpe o cache:**
   - Limpe o cache do navegador (Ctrl+Shift+R)
   - Limpe o cache do Cloudflare (se estiver usando)

---

## 📋 Checklist de Verificação

- [ ] Arquivos estão na pasta correta (`/public_html/`, `/public_html/app/`, `/public_html/admin/`)
- [ ] Arquivo `index.html` existe em cada pasta
- [ ] Permissões dos arquivos estão corretas (644 para arquivos, 755 para pastas)
- [ ] Arquivo `.htaccess` existe e está configurado corretamente
- [ ] Todos os arquivos da pasta `out/` foram enviados
- [ ] Subdomínios estão configurados no painel Hostinger
- [ ] Estrutura de pastas está correta

---

## 📞 Informações Importantes

**Servidor Frontend**: 45.132.157.28 (Hostinger)  
**Pasta Pública**: `/public_html/` ou `/home/usuario/public_html/`

**Estrutura Esperada:**
```
public_html/
├── index.html (site principal)
├── .htaccess
├── _next/
├── app/
│   ├── index.html
│   ├── .htaccess
│   └── _next/
└── admin/
    ├── index.html
    ├── .htaccess
    └── _next/
```

---

**Última atualização**: 14 de Dezembro de 2025


