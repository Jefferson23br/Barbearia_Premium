#!/bin/bash

# Deploy do Painel Administrativo (Next.js export estático -> Nginx)
# Execute na VPS: chmod +x deploy.sh && ./deploy.sh

set -euo pipefail

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

DEST_DIR="/var/www/appbarber-admin"
APP_DIR="$(cd "$(dirname "$0")" && pwd)"

echo -e "${GREEN}🚀 Deploy Painel Administrativo${NC}"
echo "  Origem : ${APP_DIR}/out"
echo "  Destino: ${DEST_DIR}"
echo ""

if ! command -v node >/dev/null 2>&1; then
  echo -e "${RED}❌ Node.js não encontrado.${NC}"
  exit 1
fi

cd "$APP_DIR"

echo -e "${GREEN}📦 Instalando dependências...${NC}"
if [ -f package-lock.json ]; then
  npm ci
else
  npm install
fi

echo -e "${GREEN}🏗️  Gerando build estático (out/)...${NC}"
rm -rf .next out
npm run build

if [ ! -d "out" ]; then
  echo -e "${RED}❌ Pasta 'out' não foi gerada. Verifique 'output: export' no next.config.js.${NC}"
  exit 1
fi

echo -e "${GREEN}📁 Garantindo destino ${DEST_DIR}...${NC}"
sudo mkdir -p "$DEST_DIR"

echo -e "${GREEN}🔄 Sincronizando arquivos (rsync --delete)...${NC}"
sudo rsync -av --delete out/ "$DEST_DIR/"

echo -e "${GREEN}🔐 Ajustando permissões...${NC}"
sudo chown -R nginx:nginx "$DEST_DIR" 2>/dev/null \
  || sudo chown -R www-data:www-data "$DEST_DIR" 2>/dev/null \
  || true
sudo find "$DEST_DIR" -type d -exec chmod 755 {} \;
sudo find "$DEST_DIR" -type f -exec chmod 644 {} \;

if command -v nginx >/dev/null 2>&1; then
  echo -e "${GREEN}🧪 Testando configuração do Nginx...${NC}"
  if sudo nginx -t; then
    echo -e "${GREEN}♻️  Recarregando Nginx...${NC}"
    sudo systemctl reload nginx || sudo nginx -s reload
  else
    echo -e "${YELLOW}⚠️  nginx -t falhou. Não recarreguei. Revise a configuração.${NC}"
  fi
fi

echo ""
echo -e "${GREEN}✅ Deploy concluído!${NC}"
echo "  Conteúdo publicado em: $DEST_DIR"
