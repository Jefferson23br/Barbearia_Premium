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
  - Banco de dados **Oracle** (alvo operacional atual; conexão via `backend/config/databaseV2.js`)
  - PM2 para gerenciamento de processos
  - Nginx (proxy reverso para a API)
  - *Opcional:* PostgreSQL apenas se ainda existir instância legada na mesma VPS; o código de produção foi migrado para Oracle.

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
| **Painel Admin** | https://appbarber.auctusconsultoria.com.br/admin | 45.132.157.28 |
| **Painel Cliente** | https://appbarber.auctusconsultoria.com.br | 45.132.157.28 |
| **Site Público** | https://appbarber.auctusconsultoria.com.br | 45.132.157.28 |
| **API Backend** | https://api6.auctusconsultoria.com.br | 82.25.65.201 |

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
pm2 start server.js --name api-barbearia-premium
pm2 save
```

### Variáveis de Ambiente
O backend usa principalmente **Oracle**. Variáveis legadas `DB_*` (PostgreSQL) podem permanecer no `.env` para referência ou ambientes antigos, mas a API em produção deve ter **`ORACLE_*`** corretas. Lista completa e exemplos: `backend/.env.example`.

```env
PORT=3001
NODE_ENV=production

# Oracle (produção)
ORACLE_HOST=[host]
ORACLE_PORT=1521
ORACLE_SERVICE_NAME=[service_name]
ORACLE_USER=[usuario_schema]
ORACLE_PASSWORD=[senha]

JWT_SECRET=[valor_forte]
JWT_EXPIRES_IN=12h

API_BASE_URL=https://api6.auctusconsultoria.com.br
CORS_ORIGINS=https://appbarber.auctusconsultoria.com.br,https://appbarber.auctusconsultoria.com.br/admin,http://localhost:3000,http://localhost:3001,http://localhost:3002
```

### Banco de dados (Oracle)
- **Motor**: Oracle Database (acesso via driver `oracledb` no Node).
- **Usuário/schema** típico em homologação: `BARBEARIA_PREMIUM` (ajuste ao seu ambiente).
- **Bootstrap / scripts SQL**: pasta `database/sql/oracle` e comando `npm run db:oracle:bootstrap` no diretório `backend/` — ver [deploy/ORACLE_BOOTSTRAP.md](deploy/ORACLE_BOOTSTRAP.md).
- **Legado**: scripts e histórico PostgreSQL em `database/sql/legacy-postgresql` (referência, não é o alvo da API atual).

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
NEXT_PUBLIC_API_URL=https://api6.auctusconsultoria.com.br
```

---

## 🔧 Comandos de Deploy

### Deploy Backend
Passo a passo consolidado: [deploy/GUIA_ATUALIZACAO_DEPLOY.md](deploy/GUIA_ATUALIZACAO_DEPLOY.md).

```bash
# Conectar na VPS
ssh root@82.25.65.201

# Enviar arquivos
scp backend/routes/[arquivo].js root@82.25.65.201:/home/cyberpanel/app/backend/routes/

# Reiniciar (reler .env)
pm2 restart api-barbearia-premium --update-env
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
- **Domínio**: `appbarber.auctusconsultoria.com.br`
- **Subdomínios**:
  - `appbarber.auctusconsultoria.com.br` → Frontend (45.132.157.28)
  - `appbarber.auctusconsultoria.com.br` → Frontend (45.132.157.28)
  - `appbarber.auctusconsultoria.com.br` → Frontend (45.132.157.28)
  - `api6.auctusconsultoria.com.br` → Backend (82.25.65.201)

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
- Backup do banco (Oracle conforme política do provedor / export periódico)
- Backup dos arquivos de configuração
- Retenção de backups configurada

---

## 📊 Monitoramento

### PM2
```bash
# Status
pm2 status

# Logs
pm2 logs api-barbearia-premium
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

### Oracle (API)
```bash
# Teste rápido pela API (com backend no ar)
curl -sS https://api6.auctusconsultoria.com.br/api/test-db
```

Ferramentas no servidor ou estação (SQL*Plus, SQLcl, DBeaver) usando `ORACLE_HOST`, `ORACLE_SERVICE_NAME`, `ORACLE_USER` e `ORACLE_PASSWORD` do `.env`.

### PostgreSQL (somente se legado ainda existir na VPS)
```bash
psql -U [usuario] -d [database]
systemctl status postgresql
```

---

## 🚨 Troubleshooting

### API não responde
1. Verificar PM2: `pm2 status`
2. Verificar logs: `pm2 logs api-barbearia-premium`
3. Verificar Nginx: `systemctl status nginx`
4. Verificar porta: `netstat -tulpn | grep 3001`

### Frontend não carrega
1. Verificar PM2: `pm2 status`
2. Verificar build: `ls -la /home/cyberpanel/app/frontend-admin/`
3. Verificar Nginx: `systemctl status nginx`
4. Verificar logs: `pm2 logs painel-admin`

### Banco de dados não conecta
1. Verificar variáveis `ORACLE_*` no `.env` da API e reiniciar com `pm2 restart api-barbearia-premium --update-env`
2. Chamar `GET /api/test-db` na API (local ou `https://api6.auctusconsultoria.com.br/api/test-db`)
3. Validar rede/firewall até o listener Oracle (porta 1521 ou a configurada)
4. Se ainda houver PostgreSQL legado na mesma máquina, conferir `systemctl status postgresql` apenas nesse cenário

---

## 📝 Notas Importantes

1. **Contas separadas**: Backend e frontend estão em contas Hostinger diferentes.
2. **Domínio liberado**: A conta do frontend (m.br) tem domínio liberado e ilimitado.
3. **Banco em produção**: API orientada a **Oracle**; permissões e login admin dependem de tabelas como `USUARIOS` e `PERMISSOES_USUARIOS` no schema em uso — ver [historico-conversas/HANDOFF.md](historico-conversas/HANDOFF.md).
4. **Nomes de processos PM2**:
   - Backend: `api-barbearia-premium`
   - Frontend Admin: `painel-admin`
   - Frontend Cliente: `painel-cliente`

---

**Última atualização**: 11 de maio de 2026  
**Versão**: 1.3

**Informações importantes:**
- **Site / app**: `appbarber.auctusconsultoria.com.br`
- **API pública**: `https://api6.auctusconsultoria.com.br`
- **Banco**: Oracle (`ORACLE_*` no `.env` do backend)
- **CORS**: origens do app em `https://appbarber.auctusconsultoria.com.br` (e `/admin`), mais localhost em desenvolvimento

