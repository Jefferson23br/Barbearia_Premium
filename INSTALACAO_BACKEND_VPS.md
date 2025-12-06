# 🚀 Instalação do Backend na VPS

## 📋 Pré-requisitos

- ✅ Node.js 20 instalado
- ✅ PM2 instalado
- ✅ PostgreSQL 15 configurado
- ✅ Banco de dados `protese_capilar` criado
- ✅ Usuário `protese_user` configurado
- ✅ Schema `protese` criado

---

## 📤 Passo 1: Upload dos Arquivos para VPS

**IMPORTANTE:** Primeiro, você precisa fazer upload dos arquivos do backend para a VPS.

### Opção A: Via SCP/SFTP
```bash
# Do seu computador local (PowerShell/CMD)
scp -r backend/* root@82.25.65.201:/home/cyberpanel/app/backend/
```

### Opção B: Via FTP/SFTP Client
- Conectar via FileZilla, WinSCP ou similar
- Upload da pasta `backend/` para `/home/cyberpanel/app/backend/`

### Opção C: Via Git (se usar Git na VPS)
```bash
# Na VPS
cd /home/cyberpanel/app
git clone <seu-repositorio> .
# ou fazer pull se já existe
```

### Arquivos necessários:
- ✅ `server.js`
- ✅ `package.json`
- ✅ `.env` (ou copiar do `env.example`)
- ✅ `COMANDOS_ADCIONAR_CAMPO_FOTO_URL.sql` (na raiz do projeto)

---

## 📦 Passo 2: Instalar Dependências

```bash
cd /home/cyberpanel/app/backend
npm install
```

---

## 📝 Passo 3: Configurar Variáveis de Ambiente

Criar arquivo `.env`:

### Opção A: Via nano (editor)

```bash
cd /home/cyberpanel/app/backend
nano .env
```

Cole o conteúdo abaixo e salve (Ctrl+O, Enter, Ctrl+X).

### Opção B: Via comando direto (mais rápido)

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

**Conteúdo do arquivo .env:**

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

---

## 🗄️ Passo 4: Executar Comandos SQL

Executar no DBeaver ou via psql:

```bash
psql -U protese_user -d protese_capilar -f COMANDOS_ADCIONAR_CAMPO_FOTO_URL.sql
```

Ou executar os comandos individualmente (ver arquivo `COMANDOS_ADCIONAR_CAMPO_FOTO_URL.sql`).

---

## 📁 Passo 5: Criar Diretório de Uploads

```bash
mkdir -p /home/cyberpanel/app/backend/uploads/fotos
chmod 755 /home/cyberpanel/app/backend/uploads
chmod 755 /home/cyberpanel/app/backend/uploads/fotos
```

---

## 🔧 Passo 6: Configurar Servir Arquivos Estáticos

### Opção A: Usar Nginx (Recomendado)

Adicionar no arquivo `/etc/nginx/conf.d/api.conf`:

```nginx
server {
    listen 8080;
    server_name api.protesecapilarcuiaba.com.br;

    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # Servir arquivos de upload diretamente
    location /uploads/ {
        alias /home/cyberpanel/app/backend/uploads/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
```

Reiniciar Nginx:

```bash
sudo systemctl restart nginx
```

### Opção B: Usar Express (já configurado no server.js)

O Express já está configurado para servir arquivos estáticos em `/uploads`.

---

## 🚀 Passo 7: Parar Processo Antigo e Iniciar Novo

### Verificar se já existe processo rodando:

```bash
pm2 list
```

### Se o processo já existe, parar primeiro:

```bash
pm2 stop api-protese-capilar
pm2 delete api-protese-capilar
```

### Ou forçar reinício:

```bash
pm2 restart api-protese-capilar
```

### Iniciar novo processo:

```bash
cd /home/cyberpanel/app/backend
pm2 start server.js --name api-protese-capilar
pm2 save
pm2 startup
```

**Se der erro de "already launched":**
```bash
# Parar o processo antigo
pm2 stop api-protese-capilar
pm2 delete api-protese-capilar

# Iniciar novamente
pm2 start server.js --name api-protese-capilar
pm2 save
```

Verificar status:

```bash
pm2 list
pm2 logs api-protese-capilar
```

---

## ✅ Passo 8: Verificar Funcionamento

### Testar Health Check:

```bash
curl https://api.protesecapilarcuiaba.com.br/health
```

### Testar Conexão com Banco:

```bash
curl https://api.protesecapilarcuiaba.com.br/api/test-db
```

### Testar Endpoint de Clientes:

```bash
curl -X POST https://api.protesecapilarcuiaba.com.br/api/v1/clientes \
  -H "Content-Type: application/json" \
  -d '{
    "nome_completo": "Teste",
    "email": "teste@teste.com",
    "cpf": "12345678901",
    "rua": "Rua Teste",
    "numero": "123",
    "bairro": "Centro",
    "cidade": "Cuiabá",
    "estado": "MT",
    "cep": "78000000",
    "senha": "senha123"
  }'
```

---

## 🔄 Comandos Úteis

### Reiniciar API:

```bash
pm2 restart api-protese-capilar
```

### Ver logs:

```bash
pm2 logs api-protese-capilar --lines 50
```

### Parar API:

```bash
pm2 stop api-protese-capilar
```

### Atualizar código:

```bash
cd /home/cyberpanel/app/backend
git pull  # ou fazer upload dos arquivos
pm2 restart api-protese-capilar
```

---

## 📂 Estrutura Final

```
/home/cyberpanel/app/backend/
├── server.js
├── package.json
├── .env
├── uploads/
│   └── fotos/
│       └── (fotos dos usuários)
└── node_modules/
```

---

## 🔐 Segurança

1. ✅ Arquivo `.env` não deve ser commitado
2. ✅ Permissões corretas nos diretórios de upload
3. ✅ Validação de tipos de arquivo (apenas imagens)
4. ✅ Limite de tamanho (5MB)
5. ✅ Hash de senhas com bcrypt
6. ✅ Validação de dados no backend

---

**Backend pronto para receber cadastros!** 🎉

