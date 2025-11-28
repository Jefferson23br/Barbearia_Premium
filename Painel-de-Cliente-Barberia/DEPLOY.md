# Guia de Deploy - Hostinger

Este guia explica como fazer o deploy do Painel de Cliente Barberia na Hostinger.

## Opções de Deploy na Hostinger

### Opção 1: VPS ou Cloud Hosting (Recomendado)

Se você tem um VPS ou Cloud Hosting na Hostinger com suporte a Node.js:

#### Passo 1: Acessar o servidor via SSH

```bash
ssh usuario@seu-dominio.com
```

#### Passo 2: Instalar Node.js (se necessário)

```bash
# Verificar versão do Node.js
node -v

# Se não tiver Node.js 18+, instalar via nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 18
nvm use 18
```

#### Passo 3: Clonar o repositório

```bash
cd /home/usuario/public_html
# ou
cd /var/www/html

git clone seu-repositorio.git
cd Painel-de-Cliente-Barberia
```

#### Passo 4: Instalar dependências e fazer build

```bash
npm install
npm run build
```

#### Passo 5: Configurar PM2 (Process Manager)

```bash
# Instalar PM2 globalmente
npm install -g pm2

# Iniciar aplicação
pm2 start npm --name "barberia-painel" -- start

# Salvar configuração do PM2
pm2 save
pm2 startup
```

#### Passo 6: Configurar Nginx (se necessário)

Criar arquivo `/etc/nginx/sites-available/barberia-painel`:

```nginx
server {
    listen 80;
    server_name seu-dominio-provisorio.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Ativar o site:
```bash
sudo ln -s /etc/nginx/sites-available/barberia-painel /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### Opção 2: Hospedagem Compartilhada (Build Estático)

Se você tem apenas hospedagem compartilhada sem suporte a Node.js:

#### Passo 1: Fazer build local

```bash
npm install
npm run build
```

#### Passo 2: Configurar para export estático

Editar `next.config.js` e adicionar:
```javascript
output: 'export',
```

#### Passo 3: Fazer export

```bash
npm run build
```

Isso criará uma pasta `out/` com os arquivos estáticos.

#### Passo 4: Fazer upload via FTP

1. Conectar via FTP na Hostinger
2. Fazer upload de todos os arquivos da pasta `out/` para `public_html/`
3. Acessar o domínio provisório

### Opção 3: Usando o File Manager da Hostinger

1. Acessar o painel da Hostinger
2. Ir em **File Manager**
3. Navegar até `public_html` ou criar uma subpasta
4. Fazer upload de todos os arquivos do projeto
5. Via terminal SSH, executar:
   ```bash
   cd public_html
   npm install
   npm run build
   npm start
   ```

## Configuração de Variáveis de Ambiente

Se precisar de variáveis de ambiente, criar arquivo `.env` na raiz:

```env
NEXT_PUBLIC_API_URL=https://api.seudominio.com
NODE_ENV=production
PORT=3000
```

## Verificação

Após o deploy, acesse:
- `http://seu-dominio-provisorio.com` ou
- `https://seu-dominio-provisorio.com`

## Comandos Úteis

```bash
# Ver logs do PM2
pm2 logs barberia-painel

# Reiniciar aplicação
pm2 restart barberia-painel

# Parar aplicação
pm2 stop barberia-painel

# Ver status
pm2 status
```

## Suporte

Se encontrar problemas:
1. Verificar logs: `pm2 logs` ou `npm run dev` para debug
2. Verificar se a porta 3000 está aberta
3. Verificar permissões dos arquivos
4. Contatar suporte da Hostinger se necessário

