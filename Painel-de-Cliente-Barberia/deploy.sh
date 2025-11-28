#!/bin/bash

# Script de deploy automatizado para Hostinger
# Execute: chmod +x deploy.sh && ./deploy.sh

echo "🚀 Iniciando deploy do Painel de Cliente Barberia..."

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Verificar se Node.js está instalado
if ! command -v node &> /dev/null; then
    echo -e "${YELLOW}⚠️  Node.js não encontrado. Instalando...${NC}"
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
    source ~/.bashrc
    nvm install 18
    nvm use 18
fi

# Instalar dependências
echo -e "${GREEN}📦 Instalando dependências...${NC}"
npm install

# Fazer build
echo -e "${GREEN}🏗️  Criando build de produção...${NC}"
npm run build

# Verificar se PM2 está instalado
if ! command -v pm2 &> /dev/null; then
    echo -e "${YELLOW}⚠️  PM2 não encontrado. Instalando...${NC}"
    npm install -g pm2
fi

# Parar aplicação existente (se houver)
pm2 stop barberia-painel-cliente 2>/dev/null || true
pm2 delete barberia-painel-cliente 2>/dev/null || true

# Iniciar aplicação
echo -e "${GREEN}▶️  Iniciando aplicação...${NC}"
pm2 start ecosystem.config.js

# Salvar configuração
pm2 save

echo -e "${GREEN}✅ Deploy concluído com sucesso!${NC}"
echo -e "${GREEN}🌐 Acesse: http://localhost:3000${NC}"
echo ""
echo "Comandos úteis:"
echo "  pm2 logs barberia-painel-cliente  - Ver logs"
echo "  pm2 restart barberia-painel-cliente - Reiniciar"
echo "  pm2 stop barberia-painel-cliente - Parar"

