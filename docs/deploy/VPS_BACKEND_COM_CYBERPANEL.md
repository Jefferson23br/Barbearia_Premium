# 🔧 Configuração VPS Backend com CyberPanel

## 🎯 Informações da VPS

- **IP**: 82.25.65.201
- **Sistema**: CyberPanel + OpenLiteSpeed
- **Painel**: https://212.85.12.84:8090
- **Servidor Web**: OpenLiteSpeed (não Nginx)
- **Banco**: MariaDB (não PostgreSQL)

---

## 📊 O Que Já Está Rodando

### Serviços Ativos:
- ✅ OpenLiteSpeed (portas 80, 443, 7080)
- ✅ MariaDB (porta 3306)
- ✅ Redis (porta 6379)
- ✅ CyberPanel (porta 8090)
- ✅ SSH (porta 22)
- ✅ Firewall ativo

### Portas Disponíveis para API:
- ✅ **3001** - Livre (recomendada)
- ✅ **3002** - Livre
- ✅ **4000** - Livre

---

## 🚀 PASSO 1: Verificar Node.js

```bash
# Verificar se Node.js está instalado
node --version
npm --version

# Se não estiver, instalar:
curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
sudo dnf install -y nodejs

# Verificar novamente
node --version
npm --version
```

---

## 🗄️ PASSO 2: Escolher Banco de Dados

### Opção A: Usar MariaDB (Já instalado)

```bash
# Acessar MariaDB
mysql -u root -p
# Use a senha de: sudo cat .db_password
```

**No MariaDB:**

```sql
-- Criar banco
CREATE DATABASE protese_capilar CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Criar usuário
CREATE USER 'protese_user'@'localhost' IDENTIFIED BY 'SenhaForte123!';

-- Dar permissões
GRANT ALL PRIVILEGES ON protese_capilar.* TO 'protese_user'@'localhost';
FLUSH PRIVILEGES;

-- Sair
EXIT;
```

### Opção B: Instalar PostgreSQL (Recomendado para o projeto)

```bash
# Instalar PostgreSQL
sudo dnf install -y https://download.postgresql.org/pub/repos/yum/reporpms/EL-9-x86_64/pgdg-redhat-repo-latest.noarch.rpm
sudo dnf install -y postgresql15-server postgresql15

# Inicializar
sudo postgresql-15-setup initdb

# Iniciar
sudo systemctl start postgresql-15
sudo systemctl enable postgresql-15

# Configurar
sudo -u postgres psql
```

**No PostgreSQL:**

```sql
ALTER USER postgres WITH PASSWORD 'SenhaPostgres123!';
CREATE DATABASE protese_capilar;
CREATE USER protese_user WITH PASSWORD 'SenhaApp123!';
GRANT ALL PRIVILEGES ON DATABASE protese_capilar TO protese_user;
\q
```

---

## 🔥 PASSO 3: Abrir Porta 3001 no Firewall

```bash
# Adicionar porta 3001
sudo firewall-cmd --permanent --add-port=3001/tcp

# Recarregar
sudo firewall-cmd --reload

# Verificar
sudo firewall-cmd --list-all
```

---

## 📁 PASSO 4: Criar Estrutura para API

```bash
# Criar pasta
mkdir -p /home/root/app/backend
mkdir -p /home/root/app/backend/logs

# Ou criar para outro usuário
sudo mkdir -p /home/cyberpanel/app/backend
sudo chown -R cyberpanel:cyberpanel /home/cyberpanel/app
```

---

## 🔧 PASSO 5: Instalar PM2

```bash
# Instalar PM2 globalmente
sudo npm install -g pm2

# Configurar para iniciar no boot
pm2 startup systemd
# Execute o comando que aparecer
```

---

## 🌐 PASSO 6: Configurar Domínio no CyberPanel

### Via Interface Web:

1. Acesse: https://212.85.12.84:8090
2. Login com credenciais (senha em `sudo cat .litespeed_password`)
3. **Websites** → **Create Website**
4. Preencher:
   - Domain Name: `api6.auctusconsultoria.com.br`
   - Email: seu@email.com
   - Package: Default
5. **Create Website**

### Via Terminal (Alternativo):

```bash
# Adicionar vHost manualmente
sudo /usr/local/lsws/admin/misc/lsws_extra_config.sh
```

---

## 🔀 PASSO 7: Configurar Proxy Reverso (OpenLiteSpeed → Node.js)

### Opção 1: Via CyberPanel (Interface)

1. CyberPanel → **Websites**
2. Selecione: `api6.auctusconsultoria.com.br`
3. **Manage** → **Rewrite Rules**
4. Adicionar:

```
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ http://localhost:3001/$1 [P,L]
```

### Opção 2: Via Terminal

```bash
# Editar configuração do vHost
sudo nano /usr/local/lsws/conf/vhosts/api6.auctusconsultoria.com.br/vhost.conf
```

**Adicionar contexto de proxy:**

```
context / {
  type                    proxy
  handler                 lsapi:lsphp
  location                http://localhost:3001
  addDefaultCharset       off
}
```

**Reiniciar OpenLiteSpeed:**

```bash
sudo systemctl restart lsws
```

---

## 🔐 PASSO 8: Configurar SSL

### Via CyberPanel (Fácil):

1. CyberPanel → **SSL** → **Manage SSL**
2. Selecione: `api6.auctusconsultoria.com.br`
3. Escolha: **Issue SSL**
4. Selecione: **Let's Encrypt**
5. **Issue Now**

### Via Terminal:

```bash
# CyberPanel usa acme.sh
/root/.acme.sh/acme.sh --issue -d api6.auctusconsultoria.com.br \
  --webroot /home/api6.auctusconsultoria.com.br/public_html
```

---

## 📋 PASSO 9: Criar API de Teste

Criar uma API simples para testar:

```bash
cd /home/root/app/backend

# Criar package.json
cat > package.json << 'EOF'
{
  "name": "api-barbearia-premium",
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

# Instalar dependências
npm install

# Criar server.js de teste
cat > server.js << 'EOF'
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'API Funcionando!' });
});

app.get('/api/test', (req, res) => {
  res.json({ 
    success: true, 
    message: 'API Barbearia Premium',
    timestamp: new Date()
  });
});

app.listen(PORT, () => {
  console.log(`API rodando na porta ${PORT}`);
});
EOF

# Iniciar com PM2
pm2 start server.js --name api-barbearia-premium
pm2 save
```

---

## ✅ PASSO 10: Testar

```bash
# Testar localmente
curl http://localhost:3001/health

# Deve retornar: {"status":"OK","message":"API Funcionando!"}

# Testar via domínio (após DNS propagar e SSL configurar)
curl https://api6.auctusconsultoria.com.br/health
```

---

## 🔄 Comandos Úteis CyberPanel

```bash
# Ver logs do OpenLiteSpeed
sudo tail -f /usr/local/lsws/logs/error.log

# Reiniciar OpenLiteSpeed
sudo systemctl restart lsws

# Ver processos PM2
pm2 status
pm2 logs

# Reiniciar API
pm2 restart api-barbearia-premium
```

---

## 📝 Resumo da Configuração

```
VPS Backend (82.25.65.201):
├── OpenLiteSpeed (80, 443, 7080)
├── MariaDB ou PostgreSQL
├── Node.js API (porta 3001)
│   └── PM2 gerenciando
└── CyberPanel (gerenciamento)

Fluxo:
Cliente → api6.auctusconsultoria.com.br
    ↓
OpenLiteSpeed (proxy reverso)
    ↓
Node.js API (porta 3001)
    ↓
Banco de Dados (MariaDB ou PostgreSQL)
```

---

## ⚠️ Observações Importantes

1. **OpenLiteSpeed** já está na porta 80 e 443
2. **CyberPanel** gerencia tudo via interface web
3. **MariaDB** já disponível (pode usar ou instalar PostgreSQL)
4. **Porta 3001** livre para API
5. Proxy reverso via OpenLiteSpeed (não Nginx)

---

**Documentação adaptada para CyberPanel!** 🎛️

