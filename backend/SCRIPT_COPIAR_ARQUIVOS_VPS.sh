#!/bin/bash

# Script para copiar arquivos da estrutura modular para a VPS
# Execute este script na sua máquina local (não na VPS)

echo "🚀 Script de Cópia de Arquivos para VPS"
echo "========================================"
echo ""

# Configurações
VPS_USER="root"
VPS_HOST="seu-servidor.com.br"  # ALTERE AQUI
VPS_PATH="/home/cyberpanel/app/backend"
LOCAL_BACKEND_PATH="./backend"

# Verificar se o diretório local existe
if [ ! -d "$LOCAL_BACKEND_PATH" ]; then
    echo "❌ Erro: Diretório $LOCAL_BACKEND_PATH não encontrado!"
    exit 1
fi

echo "📁 Estrutura de arquivos a copiar:"
echo "  - config/"
echo "  - routes/"
echo "  - server.js"
echo ""

read -p "Deseja continuar? (s/n): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Ss]$ ]]; then
    echo "❌ Operação cancelada."
    exit 1
fi

echo ""
echo "📤 Copiando arquivos..."

# Criar estrutura de pastas na VPS
ssh ${VPS_USER}@${VPS_HOST} "mkdir -p ${VPS_PATH}/config ${VPS_PATH}/routes"

# Copiar arquivos de configuração
echo "  → Copiando config/database.js"
scp ${LOCAL_BACKEND_PATH}/config/database.js ${VPS_USER}@${VPS_HOST}:${VPS_PATH}/config/

echo "  → Copiando config/cors.js"
scp ${LOCAL_BACKEND_PATH}/config/cors.js ${VPS_USER}@${VPS_HOST}:${VPS_PATH}/config/

echo "  → Copiando config/multer.js"
scp ${LOCAL_BACKEND_PATH}/config/multer.js ${VPS_USER}@${VPS_PATH}/config/

# Copiar módulos de rotas
echo "  → Copiando routes/index.js"
scp ${LOCAL_BACKEND_PATH}/routes/index.js ${VPS_USER}@${VPS_HOST}:${VPS_PATH}/routes/

echo "  → Copiando routes/clientes.js"
scp ${LOCAL_BACKEND_PATH}/routes/clientes.js ${VPS_USER}@${VPS_HOST}:${VPS_PATH}/routes/

echo "  → Copiando routes/funcionarios.js"
scp ${LOCAL_BACKEND_PATH}/routes/funcionarios.js ${VPS_USER}@${VPS_HOST}:${VPS_PATH}/routes/

echo "  → Copiando routes/auth.js"
scp ${LOCAL_BACKEND_PATH}/routes/auth.js ${VPS_USER}@${VPS_HOST}:${VPS_PATH}/routes/

echo "  → Copiando routes/permissoes.js"
scp ${LOCAL_BACKEND_PATH}/routes/permissoes.js ${VPS_USER}@${VPS_HOST}:${VPS_PATH}/routes/

echo "  → Copiando routes/controle-acessos.js"
scp ${LOCAL_BACKEND_PATH}/routes/controle-acessos.js ${VPS_USER}@${VPS_HOST}:${VPS_PATH}/routes/

echo "  → Copiando routes/logs.js"
scp ${LOCAL_BACKEND_PATH}/routes/logs.js ${VPS_USER}@${VPS_HOST}:${VPS_PATH}/routes/

echo "  → Copiando routes/help-desk.js"
scp ${LOCAL_BACKEND_PATH}/routes/help-desk.js ${VPS_USER}@${VPS_HOST}:${VPS_PATH}/routes/

# Fazer backup do server.js atual
echo "  → Fazendo backup do server.js atual"
ssh ${VPS_USER}@${VPS_HOST} "cd ${VPS_PATH} && cp server.js server.js.backup.\$(date +%Y%m%d_%H%M%S)"

# Copiar novo server.js
echo "  → Copiando server.js (novo)"
scp ${LOCAL_BACKEND_PATH}/server.js ${VPS_USER}@${VPS_HOST}:${VPS_PATH}/

echo ""
echo "✅ Arquivos copiados com sucesso!"
echo ""
echo "📋 Próximos passos na VPS:"
echo "  1. Verificar sintaxe: node -c server.js"
echo "  2. Reiniciar PM2: pm2 restart api-protese-capilar"
echo "  3. Verificar logs: pm2 logs api-protese-capilar"
echo ""

