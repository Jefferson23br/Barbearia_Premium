# Go Live API - Nginx + PM2 + Oracle

Guia rapido para publicar a API da Barbearia Premium em VPS (AlmaLinux/CentOS).

## 1) Preparar backend na VPS

```bash
ssh root@SEU_IP
bash /Projetos/Barbearia_Premium/scripts/preparar-vps-projetos.sh
cd /Projetos/Barbearia_Premium/backend
```

Suba os arquivos do projeto para `/Projetos/Barbearia_Premium` e instale dependencias:

```bash
cd /Projetos/Barbearia_Premium/backend
npm install --omit=dev
```

## 2) Configurar variaveis de ambiente

Crie `/Projetos/Barbearia_Premium/backend/.env`:

```env
NODE_ENV=production
PORT=3001

ORACLE_HOST=72.60.61.215
ORACLE_PORT=1521
ORACLE_SERVICE_NAME=XEPDB1
ORACLE_USER=Barbearia_Premium
ORACLE_PASSWORD=trocar_senha_forte

JWT_SECRET=trocar_por_valor_forte
JWT_EXPIRES_IN=12h

API_BASE_URL=https://api6.actusconsultoria.com.br
```

## 3) Banco Oracle e tabelas basicas

Como o banco agora e Oracle remoto, rode os scripts SQL Oracle via SQLcl/SQL*Plus
com o usuario ja criado. Use os arquivos SQL de inicializacao adaptados para Oracle.

> Observacao: os scripts atuais em `backend/sql/*.sql` estao em dialeto PostgreSQL
> e precisam de versao Oracle antes da execucao.

## 4) Subir API no PM2

```bash
cd /Projetos/Barbearia_Premium/backend
pm2 start ecosystem.config.js
pm2 save
pm2 startup
pm2 status
pm2 logs api-barbearia-premium --lines 100
```

Teste local da API:

```bash
curl http://127.0.0.1:3001/health
curl http://127.0.0.1:3001/api/test-db
```

## 5) Configurar Nginx (proxy reverso)

Copie o template:

```bash
cp /Projetos/Barbearia_Premium/scripts/templates-nginx/api.conf /etc/nginx/conf.d/api.conf
nginx -t
systemctl reload nginx
```

## 6) SSL com Certbot

```bash
certbot --nginx -d api6.actusconsultoria.com.br
nginx -t
systemctl reload nginx
```

## 7) Testes finais

```bash
curl -I https://api6.actusconsultoria.com.br/health
curl https://api6.actusconsultoria.com.br/health
curl https://api6.actusconsultoria.com.br/api/test-db
```

## 8) Storage de arquivos (disco local)

A API serve arquivos em `/uploads` via Express. Garanta os diretorios:

```bash
mkdir -p /Projetos/Barbearia_Premium/backend/uploads/fotos
mkdir -p /Projetos/Barbearia_Premium/backend/uploads/help-desk
mkdir -p /Projetos/Barbearia_Premium/backend/uploads/servicos
chown -R root:root /Projetos/Barbearia_Premium/backend/uploads
chmod -R 755 /Projetos/Barbearia_Premium/backend/uploads
```

A tabela `storage_arquivos` (versao Oracle) deve guardar metadados dos uploads.

## 9) Ponto critico atual

O backend atual ainda usa `pg` (PostgreSQL) em `backend/config/database.js` e
rotas com SQL especifico de PostgreSQL. Antes do go-live com Oracle, e obrigatorio
migrar camada de conexao e queries para Oracle.
