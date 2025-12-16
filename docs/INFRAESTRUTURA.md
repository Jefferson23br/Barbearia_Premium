# 🏗️ Infraestrutura - Sistema Barbearia Premium

Documentação completa da infraestrutura e configuração dos servidores.

---

## 🌐 Visão Geral

O sistema está hospedado em **2 VPS diferentes da Hostinger**, em contas separadas:

### VPS 1: Backend/API/Banco de Dados
- **IP**: 82.25.65.201
- **Conta**: Hostinger (conta principal)
- **Serviços**:
  - API Backend (Node.js/Express)
  - Banco de Dados PostgreSQL
  - PM2 para gerenciamento de processos

### VPS 2: Frontend
- **IP**: 45.132.157.28
- **Conta**: Hostinger (m.br - conta com domínio liberado e ilimitado)
- **Serviços**:
  - Painel Administrativo (Next.js)
  - Painel do Cliente (Next.js)
  - Site Público (Next.js)
  - PM2 para gerenciamento de processos

---

## 🔗 URLs de Produção

| Serviço | URL | VPS |
|---------|-----|-----|
| **Painel Admin** | https://admin.protesecapilarcuiaba.com.br | 45.132.157.28 |
| **Painel Cliente** | https://app.protesecapilarcuiaba.com.br | 45.132.157.28 |
| **Site Público** | https://www.protesecapilarcuiaba.com.br | 45.132.157.28 |
| **API Backend** | https://api.protesecapilarcuiaba.com.br | 82.25.65.201 |

---

## ⚙️ Configuração do Backend (VPS 82.25.65.201)

### Diretórios
```
/home/cyberpanel/app/backend/
├── routes/
├── config/
├── middlewares/
├── utils/
└── server.js
```

### Processo PM2
```bash
pm2 start server.js --name api-protese-capilar
pm2 save
```

### Variáveis de Ambiente
```env
PORT=3001
NODE_ENV=production

DB_HOST=localhost
DB_PORT=5432
DB_NAME=protese_capilar
DB_USER=protese_user
DB_PASSWORD=[senha]

API_BASE_URL=https://api.protesecapilarcuiaba.com.br
CORS_ORIGINS=https://www.protesecapilarcuiaba.com.br,https://app.protesecapilarcuiaba.com.br,https://admin.protesecapilarcuiaba.com.br,http://localhost:3000,http://localhost:3001,http://localhost:3002
```

### Banco de Dados
- **PostgreSQL 15+**
- **Schema**: `protese`
- **Database**: `protese_capilar`
- **User**: `protese_user`

---

## 🎨 Configuração do Frontend (VPS 45.132.157.28)

### Diretórios
```
/home/cyberpanel/app/
├── frontend-admin/      # Painel Administrativo
├── frontend-cliente/    # Painel do Cliente
└── frontend-site/       # Site Público
```

### Processos PM2
```bash
pm2 start server.js --name painel-admin --cwd /home/cyberpanel/app/frontend-admin
pm2 start server.js --name painel-cliente --cwd /home/cyberpanel/app/frontend-cliente
pm2 save
```

### Variáveis de Ambiente (Frontend)
```env
NEXT_PUBLIC_API_URL=https://api.protesecapilarcuiaba.com.br
```

---

## 🔧 Comandos de Deploy

### Deploy Backend
```bash
# Conectar na VPS
ssh root@82.25.65.201

# Enviar arquivos
scp backend/routes/[arquivo].js root@82.25.65.201:/home/cyberpanel/app/backend/routes/

# Reiniciar
pm2 restart api-protese-capilar
```

### Deploy Frontend
```bash
# Build local
cd frontend/painel-admin
npm run build

# Enviar para VPS
scp -r out/* root@45.132.157.28:/home/cyberpanel/app/frontend-admin/

# Reiniciar (na VPS)
ssh root@45.132.157.28
pm2 restart painel-admin
```

---

## 🌍 DNS e Domínios

### Domínio Principal
- **Domínio**: `protesecapilarcuiaba.com.br`
- **Subdomínios**:
  - `www.protesecapilarcuiaba.com.br` → Frontend (45.132.157.28)
  - `admin.protesecapilarcuiaba.com.br` → Frontend (45.132.157.28)
  - `app.protesecapilarcuiaba.com.br` → Frontend (45.132.157.28)
  - `api.protesecapilarcuiaba.com.br` → Backend (82.25.65.201)

### Configuração DNS
- **DNS**: Cloudflare
- **SSL**: Let's Encrypt (via CyberPanel)
- **CDN**: Cloudflare

---

## 🔐 Segurança

### SSL/TLS
- Certificados Let's Encrypt configurados via CyberPanel
- Renovação automática
- HTTPS obrigatório

### Firewall
- Portas abertas apenas para serviços necessários
- SSH configurado com chaves
- Nginx como reverse proxy

### Backup
- Backup automático do banco de dados
- Backup dos arquivos de configuração
- Retenção de backups configurada

---

## 📊 Monitoramento

### PM2
```bash
# Status
pm2 status

# Logs
pm2 logs api-protese-capilar
pm2 logs painel-admin

# Monitoramento
pm2 monit
```

### Nginx
```bash
# Status
systemctl status nginx

# Logs
tail -f /var/log/nginx/error.log
tail -f /var/log/nginx/access.log
```

### PostgreSQL
```bash
# Conectar
psql -U protese_user -d protese_capilar

# Status
systemctl status postgresql
```

---

## 🚨 Troubleshooting

### API não responde
1. Verificar PM2: `pm2 status`
2. Verificar logs: `pm2 logs api-protese-capilar`
3. Verificar Nginx: `systemctl status nginx`
4. Verificar porta: `netstat -tulpn | grep 3001`

### Frontend não carrega
1. Verificar PM2: `pm2 status`
2. Verificar build: `ls -la /home/cyberpanel/app/frontend-admin/`
3. Verificar Nginx: `systemctl status nginx`
4. Verificar logs: `pm2 logs painel-admin`

### Banco de dados não conecta
1. Verificar PostgreSQL: `systemctl status postgresql`
2. Verificar conexão: `psql -U protese_user -d protese_capilar`
3. Verificar variáveis de ambiente no `.env`

---

## 📝 Notas Importantes

1. **Contas Separadas**: Backend e Frontend estão em contas Hostinger diferentes
2. **Domínio Liberado**: A conta do frontend (m.br) tem domínio liberado e ilimitado
3. **Schema do Banco**: O schema é `protese`, não `barbearia`
4. **Nomes de Processos PM2**: 
   - Backend: `api-protese-capilar`
   - Frontend Admin: `painel-admin`
   - Frontend Cliente: `painel-cliente`

---

**Última Atualização**: 16 de Dezembro de 2025  
**Versão**: 1.1

