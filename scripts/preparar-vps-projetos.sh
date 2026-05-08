#!/bin/bash

# Prepara apenas pastas base na VPS usando /Projetos
# Execute como root: sudo bash preparar-vps-projetos.sh

set -e

echo "Criando estrutura em /Projetos..."
mkdir -p /Projetos
mkdir -p /Projetos/Barbearia_Premium

echo "Concluido."
echo "Projeto base: /Projetos/Barbearia_Premium"
