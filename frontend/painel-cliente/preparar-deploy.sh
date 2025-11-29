#!/bin/bash

echo "========================================"
echo "Preparando arquivos para deploy"
echo "========================================"
echo ""

echo "[1/3] Instalando dependências..."
npm install
if [ $? -ne 0 ]; then
    echo "ERRO: Falha ao instalar dependências"
    exit 1
fi

echo ""
echo "[2/3] Criando build de produção..."
npm run build
if [ $? -ne 0 ]; then
    echo "ERRO: Falha ao criar build"
    exit 1
fi

echo ""
echo "[3/3] Copiando .htaccess para pasta out..."
cp .htaccess out/.htaccess 2>/dev/null || true

echo ""
echo "========================================"
echo "CONCLUÍDO!"
echo "========================================"
echo ""
echo "Os arquivos estão na pasta 'out'"
echo ""
echo "PRÓXIMOS PASSOS:"
echo "1. Acesse o Gerenciador de Arquivos da Hostinger"
echo "2. Vá até a pasta 'public_html'"
echo "3. Copie TODOS os arquivos da pasta 'out' para 'public_html'"
echo "4. Acesse: http://seu-dominio-provisorio.com"
echo ""

