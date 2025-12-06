# 📝 Criar Arquivo .env na VPS

## ❌ Erro Encontrado

```
cp: cannot stat 'env.example': No such file or directory
```

## ✅ Solução: Criar .env Manualmente

Execute estes comandos na VPS:

```bash
cd /home/cyberpanel/app/backend
nano .env
```

**Cole este conteúdo no editor:**

```env
PORT=3001
NODE_ENV=production

DB_HOST=localhost
DB_PORT=5432
DB_NAME=protese_capilar
DB_USER=protese_user
DB_PASSWORD=AppProtese@2025!

API_BASE_URL=https://api.protesecapilarcuiaba.com.br

CORS_ORIGINS=https://www.protesecapilarcuiaba.com.br,https://app.protesecapilarcuiaba.com.br,https://admin.protesecapilarcuiaba.com.br
```

**Para salvar no nano:**
1. Pressione `Ctrl + O` (salvar)
2. Pressione `Enter` (confirmar nome)
3. Pressione `Ctrl + X` (sair)

---

## 🔄 Alternativa: Criar via echo (mais rápido)

Execute este comando completo na VPS:

```bash
cat > /home/cyberpanel/app/backend/.env << 'EOF'
PORT=3001
NODE_ENV=production

DB_HOST=localhost
DB_PORT=5432
DB_NAME=protese_capilar
DB_USER=protese_user
DB_PASSWORD=AppProtese@2025!

API_BASE_URL=https://api.protesecapilarcuiaba.com.br

CORS_ORIGINS=https://www.protesecapilarcuiaba.com.br,https://app.protesecapilarcuiaba.com.br,https://admin.protesecapilarcuiaba.com.br
EOF
```

---

## ✅ Verificar se foi criado

```bash
cat /home/cyberpanel/app/backend/.env
```

---

**Depois disso, continue com:**
```bash
npm install
mkdir -p uploads/fotos
chmod 755 uploads uploads/fotos
pm2 start server.js --name api-protese-capilar
```

