# 🚀 Instalar API de Teste na VPS

## 📋 Passo a Passo

### 1️⃣ Conectar na VPS

```powershell
# No PowerShell
ssh root@82.25.65.201
```

### 2️⃣ Verificar Node.js

```bash
node --version
npm --version

# Se não tiver, instalar:
curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
sudo dnf install -y nodejs
```

### 3️⃣ Criar Pasta para API

```bash
mkdir -p /home/cyberpanel/app/backend
cd /home/cyberpanel/app/backend
```

### 4️⃣ Criar Arquivos da API

**Criar package.json:**

```bash
cat > package.json << 'EOF'
{
  "name": "api-barbearia-premium-teste",
  "version": "1.0.0",
  "scripts": {
    "start": "node server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5"
  }
}
EOF
```

**Criar server.js:**

```bash
cat > server.js << 'EOF'
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'API Barbearia Premium funcionando!',
    timestamp: new Date()
  });
});

app.get('/api/test', (req, res) => {
  res.json({ 
    success: true, 
    message: 'API Barbearia Premium',
    version: '1.0.0'
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`API rodando na porta ${PORT}`);
});
EOF
```

### 5️⃣ Instalar Dependências

```bash
npm install
```

### 6️⃣ Testar API

```bash
# Iniciar API (teste rápido)
node server.js

# Em outro terminal (ou Ctrl+C e continuar):
curl http://localhost:3001/health
```

Deve retornar:
```json
{"status":"OK","message":"API Barbearia Premium funcionando!","timestamp":"..."}
```

### 7️⃣ Rodar com PM2 (Produção)

```bash
# Parar teste (se estiver rodando)
# Ctrl+C

# Instalar PM2
sudo npm install -g pm2

# Iniciar com PM2
pm2 start server.js --name api-barbearia-premium

# Salvar
pm2 save

# Configurar auto-start
pm2 startup systemd
# Execute o comando que aparecer

# Ver status
pm2 status
pm2 logs
```

### 8️⃣ Abrir Porta no Firewall

```bash
sudo firewall-cmd --permanent --add-port=3001/tcp
sudo firewall-cmd --reload
```

### 9️⃣ Configurar Proxy no CyberPanel

**Via Interface Web:**

1. https://212.85.12.84:8090
2. **Websites** → Create Website
3. Domain: `api6.auctusconsultoria.com.br`
4. Depois: **Manage** → **Rewrite Rules**
5. Adicionar regra de proxy para `http://localhost:3001`

### 🔟 Configurar SSL

**Via CyberPanel:**

1. **SSL** → **Manage SSL**
2. Selecione: `api6.auctusconsultoria.com.br`
3. **Issue SSL** (Let's Encrypt)

---

## ✅ Testar Resultado Final

```bash
# Local
curl http://localhost:3001/health

# Via domínio (após DNS propagar e SSL configurar)
curl https://api6.auctusconsultoria.com.br/health
```

---

## 📝 Comandos PM2 Úteis

```bash
pm2 status              # Ver status
pm2 logs api-barbearia-premium    # Ver logs
pm2 restart api-barbearia-premium # Reiniciar
pm2 stop api-barbearia-premium    # Parar
pm2 delete api-barbearia-premium  # Remover
```

---

**API de teste pronta para rodar!** 🚀

