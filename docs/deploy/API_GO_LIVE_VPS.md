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

API_BASE_URL=https://api6.auctusconsultoria.com.br
```

## 3) Banco Oracle e tabelas basicas

Como o banco alvo e Oracle, rode os scripts SQL Oracle via SQLcl/SQL*Plus (ou DBeaver)
com o usuario/schema ja criado. Use os arquivos em **`database/sql/oracle/`** e, se
preferir automatizar, `npm run db:oracle:bootstrap` no diretorio `backend/` — ver
[ORACLE_BOOTSTRAP.md](./ORACLE_BOOTSTRAP.md).

> Scripts SQL antigos em dialeto PostgreSQL estao em `database/sql/legacy-postgresql/`
> apenas para referencia; nao os use como fonte primaria em producao Oracle.

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
certbot --nginx -d api6.auctusconsultoria.com.br
nginx -t
systemctl reload nginx
```

## 7) Testes finais

```bash
curl -I https://api6.auctusconsultoria.com.br/health
curl https://api6.auctusconsultoria.com.br/health
curl https://api6.auctusconsultoria.com.br/api/test-db
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

## 9) Conexao e dialeto SQL

Em producao, configure **`ORACLE_*`** no `.env` do backend. O `database.js` aponta para
`databaseV2.js`, que escolhe **Oracle** quando `ORACLE_*` esta definido; caso contrario,
usa **PostgreSQL** apenas para desenvolvimento local. Apos alterar o `.env`, reinicie com
`pm2 restart api-barbearia-premium --update-env`.
