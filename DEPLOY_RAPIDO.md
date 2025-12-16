# ⚡ Deploy Rápido - Frontend para Produção

**Guia rápido para fazer deploy dos 3 projetos frontend na Hostinger**

---

## 🚀 Passo a Passo Rápido

### 1️⃣ Gerar os Builds

**No Windows (PowerShell):**
```powershell
.\scripts\deploy-frontend.ps1
```

**No Linux/Mac:**
```bash
chmod +x scripts/deploy-frontend.sh
./scripts/deploy-frontend.sh
```

**Ou manualmente:**
```bash
# Site Entrada
cd frontend/site-entrada
npm install
npm run build

# Painel Cliente
cd ../painel-cliente
npm install
npm run build

# Painel Admin
cd ../painel-admin
npm install
npm run build
```

### 2️⃣ Localizar os Arquivos Gerados

Após o build, você terá 3 pastas `out/`:

- ✅ `frontend/site-entrada/out/` → **Site Principal**
- ✅ `frontend/painel-cliente/out/` → **Painel Cliente**
- ✅ `frontend/painel-admin/out/` → **Painel Admin**

### 3️⃣ Fazer Upload para Hostinger

**Via FTP/SFTP (FileZilla, WinSCP, etc):**

1. Conecte-se ao servidor: `45.132.157.28`
2. Navegue até a pasta pública do domínio
3. Faça upload de **TODOS** os arquivos de cada pasta `out/`:

   - **Site Principal**: Upload de `site-entrada/out/*` para `/public_html/`
   - **Painel Cliente**: Upload de `painel-cliente/out/*` para `/public_html/app/`
   - **Painel Admin**: Upload de `painel-admin/out/*` para `/public_html/admin/`

### 4️⃣ Configurar .htaccess

Crie arquivos `.htaccess` em cada pasta (veja exemplos no `GUIA_DEPLOY_FRONTEND.md`)

### 5️⃣ Verificar

Acesse os sites:
- ✅ https://www.protesecapilarcuiaba.com.br
- ✅ https://app.protesecapilarcuiaba.com.br
- ✅ https://admin.protesecapilarcuiaba.com.br

---

## 📝 Notas Importantes

- ⚠️ **Sempre faça backup** antes de substituir arquivos
- ⚠️ **Envie TODOS os arquivos** da pasta `out/`, não apenas alguns
- ⚠️ **Mantenha a estrutura de pastas** intacta
- ⚠️ **Configure o .htaccess** para rotas funcionarem corretamente

---

## 📖 Documentação Completa

Para detalhes completos, consulte: **`GUIA_DEPLOY_FRONTEND.md`**

---

**Última atualização**: 14 de Dezembro de 2025

