# 💻 Guia PowerShell - Configurar VPS Backend

## 🎯 VPS Backend: 82.25.65.201

---

## PASSO 1: Conectar via PowerShell

```powershell
# No PowerShell do Windows
ssh root@82.25.65.201
```

Digite a senha quando solicitado.

---

## PASSO 2: Verificar Node.js

```bash
# Verificar se Node.js está instalado
node --version
npm --version
```

**Se NÃO estiver instalado:**

```bash
# Instalar Node.js 20 LTS
curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
sudo dnf install -y nodejs

# Verificar novamente
node --version
npm --version
```

---

## PASSO 3: Instalar PM2

```bash
# Instalar PM2 globalmente
sudo npm install -g pm2

# Verificar
pm2 --version
```

---

## PASSO 4: Instalar PostgreSQL 15

```bash
# Adicionar repositório PostgreSQL
sudo dnf install -y https://download.postgresql.org/pub/repos/yum/reporpms/EL-9-x86_64/pgdg-redhat-repo-latest.noarch.rpm

# Instalar PostgreSQL
sudo dnf install -y postgresql15-server postgresql15

# Inicializar banco de dados
sudo postgresql-15-setup initdb

# Iniciar e habilitar
sudo systemctl start postgresql-15
sudo systemctl enable postgresql-15

# Verificar status
sudo systemctl status postgresql-15
```

Pressione `q` para sair do status.

---

## PASSO 5: Configurar PostgreSQL

```bash
# Acessar PostgreSQL como usuário postgres
sudo -u postgres psql
```

**No prompt do PostgreSQL (postgres=#), execute linha por linha:**

```sql
-- Definir senha do postgres
ALTER USER postgres WITH PASSWORD 'SenhaPostgres2025!@#';

-- Criar banco de dados
CREATE DATABASE protese_capilar;

-- Criar usuário da aplicação
CREATE USER protese_user WITH PASSWORD 'SenhaApp2025!@#';

-- Dar permissões
GRANT ALL PRIVILEGES ON DATABASE protese_capilar TO protese_user;

-- Verificar bancos criados
\l

-- Sair
\q
```

### Configurar Autenticação

```bash
# Editar arquivo de configuração
sudo nano /var/lib/pgsql/15/data/pg_hba.conf
```

**Localize estas linhas e altere de `peer/ident` para `md5`:**

```ini
# Antes:
local   all             all                                     peer
host    all             all             127.0.0.1/32            ident
host    all             all             ::1/128                 ident

# Depois:
local   all             all                                     md5
host    all             all             127.0.0.1/32            md5
host    all             all             ::1/128                 md5
```

**Salvar:**
- Pressione `Ctrl+X`
- Digite `Y`
- Pressione `Enter`

**Reiniciar PostgreSQL:**

```bash
sudo systemctl restart postgresql-15
```

### Testar Conexão

```bash
# Testar conexão com o banco
psql -h localhost -U protese_user -d protese_capilar

# Digite a senha quando solicitado
# Se conectar com sucesso, você verá: protese_capilar=>

# Para sair, digite:
\q
```

---

## PASSO 6: Abrir Porta 3001 no Firewall

```bash
# Adicionar porta 3001
sudo firewall-cmd --permanent --add-port=3001/tcp

# Recarregar firewall
sudo firewall-cmd --reload

# Verificar se foi adicionada
sudo firewall-cmd --list-all | grep 3001
```

---

## PASSO 7: Criar Estrutura de Pastas

```bash
# Criar pasta para o backend
mkdir -p /home/cyberpanel/app/backend
cd /home/cyberpanel/app/backend

# Criar pasta de logs
mkdir -p logs
```

---

## PASSO 8: Criar API de Teste

```bash
# Criar package.json
cat > package.json << 'EOF'
{
  "name": "api-protese-capilar",
  "version": "1.0.0",
  "scripts": {
    "start": "node server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "pg": "^8.11.3"
  }
}
EOF

# Criar server.js
cat > server.js << 'EOF'
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
const PORT = 3001;

// Configurar PostgreSQL
const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'protese_capilar',
  user: 'protese_user',
  password: 'SenhaApp2025!@#',
});

// CORS
const allowedOrigins = [
  'https://www.protesecapilarcuiaba.com.br',
  'https://app.protesecapilarcuiaba.com.br',
  'https://admin.protesecapilarcuiaba.com.br',
  'http://localhost:3000',
  'http://localhost:3002',
];

app.use(cors({
  origin: function(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
}));

app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'API Prótese Capilar funcionando!',
    timestamp: new Date()
  });
});

// Testar conexão com banco
app.get('/api/test-db', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ 
      success: true, 
      message: 'Conexão com PostgreSQL OK!',
      timestamp: result.rows[0].now
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✓ API rodando na porta ${PORT}`);
});
EOF

# Instalar dependências
npm install
```

---

## PASSO 9: Testar API Localmente

```bash
# Iniciar API (teste)
node server.js

# Abrir NOVA aba do PowerShell e conectar novamente:
# ssh root@82.25.65.201

# Na nova aba, testar:
curl http://localhost:3001/health
curl http://localhost:3001/api/test-db
```

Se retornar JSON, está funcionando!

**Parar API:**
- Volte para a aba onde está rodando
- Pressione `Ctrl+C`

---

## PASSO 10: Rodar com PM2 (Produção)

```bash
# Iniciar com PM2
pm2 start server.js --name api-protese

# Verificar
pm2 status

# Ver logs em tempo real
pm2 logs api-protese

# Parar logs (Ctrl+C)

# Salvar configuração
pm2 save

# Configurar auto-start no boot
pm2 startup systemd

# COPIE E EXECUTE o comando que aparecer
# Será algo como:
# sudo env PATH=... pm2 startup systemd -u root --hp /root
```

---

## PASSO 11: Configurar Domínio no CyberPanel

### Via Interface Web:

1. Abra navegador: https://212.85.12.84:8090
2. Login (senha: `sudo cat .litespeed_password`)
3. **Websites** → **Create Website**
4. Preencher:
   ```
   Domain Name: api.protesecapilarcuiaba.com.br
   Email: seu@email.com
   Package: Default
   ```
5. Clique **Create Website**

### Configurar Proxy Reverso:

1. **Websites** → **List Websites**
2. Clique em `api.protesecapilarcuiaba.com.br`
3. **Manage** → **Rewrite Rules**
4. Adicionar:
   ```
   RewriteCond %{REQUEST_FILENAME} !-f
   RewriteCond %{REQUEST_FILENAME} !-d
   RewriteRule ^(.*)$ http://localhost:3001/$1 [P,L]
   ```
5. **Save Rewrite Rules**

---

## PASSO 12: Configurar SSL

### Via CyberPanel:

1. **SSL** → **Manage SSL**
2. Selecione: `api.protesecapilarcuiaba.com.br`
3. **Issue SSL**
4. Selecione: **Lets Encrypt**
5. **Issue Now**

⚠️ **Aguarde DNS propagar antes!** (2-4 horas após configurar no Cloudflare)

---

## ✅ VERIFICAÇÃO FINAL

```bash
# Verificar se API está rodando
pm2 status

# Testar localmente
curl http://localhost:3001/health

# Testar banco
curl http://localhost:3001/api/test-db

# Testar via domínio (após DNS e SSL)
curl https://api.protesecapilarcuiaba.com.br/health
```

---

## 📝 Resumo de Credenciais

**PostgreSQL:**
```
Host: localhost
Port: 5432
Database: protese_capilar
User: protese_user
Password: SenhaApp2025!@#
```

**CyberPanel:**
```
URL: https://212.85.12.84:8090
Senha: sudo cat .litespeed_password
```

**SSH:**
```powershell
ssh root@82.25.65.201
```

---

## 🔄 Comandos Úteis

```bash
# Ver logs da API
pm2 logs api-protese

# Reiniciar API
pm2 restart api-protese

# Ver status de tudo
pm2 status

# Ver processos rodando
ps aux | grep node

# Ver portas abertas
sudo netstat -tlnp | grep 3001
```

---

**Guia completo via PowerShell criado!** 💻

Arquivos importantes:
- `GUIA_POWERSHELL_VPS_BACKEND.md` - Este guia
- `docs/deploy/INSTALAR_API_TESTE.md` - Instalação da API
- `PROXIMOS_PASSOS_VPS.txt` - Resumo rápido
- `scripts/teste-api-simples.js` - Código da API de teste

Quer começar instalando Node.js e PostgreSQL na VPS agora?

