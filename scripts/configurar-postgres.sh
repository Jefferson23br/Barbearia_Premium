#!/bin/bash

# Script para Configurar PostgreSQL
# Execute como root: sudo bash configurar-postgres.sh

set -e

echo "═══════════════════════════════════════════════════════════════"
echo "  Configuração do PostgreSQL"
echo "═══════════════════════════════════════════════════════════════"
echo ""

read -sp "Digite a senha para o usuário postgres: " POSTGRES_PASSWORD
echo ""
read -sp "Digite a senha para o usuário da aplicação: " APP_PASSWORD
echo ""

# Alterar senha do postgres
sudo -u postgres psql -c "ALTER USER postgres WITH PASSWORD '$POSTGRES_PASSWORD';"
echo "✓ Senha do usuário postgres alterada"

# Criar banco de dados
sudo -u postgres psql -c "CREATE DATABASE protese_capilar;"
echo "✓ Banco de dados 'protese_capilar' criado"

# Criar usuário da aplicação
sudo -u postgres psql -c "CREATE USER protese_user WITH PASSWORD '$APP_PASSWORD';"
echo "✓ Usuário 'protese_user' criado"

# Dar permissões
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE protese_capilar TO protese_user;"
echo "✓ Permissões concedidas"

# Configurar pg_hba.conf
echo "Configurando pg_hba.conf..."
sed -i 's/^host    all             all             127.0.0.1\/32            ident/host    all             all             127.0.0.1\/32            md5/' /var/lib/pgsql/15/data/pg_hba.conf
sed -i 's/^host    all             all             ::1\/128                 ident/host    all             all             ::1\/128                 md5/' /var/lib/pgsql/15/data/pg_hba.conf

# Reiniciar PostgreSQL
systemctl restart postgresql-15
echo "✓ PostgreSQL reiniciado"

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "Configuração do PostgreSQL concluída!"
echo ""
echo "Informações de conexão:"
echo "  Host: localhost"
echo "  Port: 5432"
echo "  Database: protese_capilar"
echo "  User: protese_user"
echo "  Password: [A senha que você definiu]"
echo "═══════════════════════════════════════════════════════════════"



