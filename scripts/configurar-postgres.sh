#!/bin/bash

# Script para Configurar PostgreSQL
# Execute como root: sudo bash configurar-postgres.sh

set -e

echo "═══════════════════════════════════════════════════════════════"
echo "  Configuracao do PostgreSQL - Barbearia Premium"
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
sudo -u postgres psql -c "CREATE DATABASE barbearia_premium;"
echo "✓ Banco de dados 'barbearia_premium' criado"

# Criar usuário da aplicação
sudo -u postgres psql -c "CREATE USER barbearia_user WITH PASSWORD '$APP_PASSWORD';"
echo "✓ Usuario 'barbearia_user' criado"

# Dar permissões
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE barbearia_premium TO barbearia_user;"
echo "✓ Permissões concedidas"

# Permissoes no schema public
sudo -u postgres psql -d barbearia_premium -c "GRANT USAGE, CREATE ON SCHEMA public TO barbearia_user;"
sudo -u postgres psql -d barbearia_premium -c "ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO barbearia_user;"
echo "✓ Permissoes de schema aplicadas"

# Configurar pg_hba.conf
echo "Configurando pg_hba.conf..."
sed -i 's/^host    all             all             127.0.0.1\/32            ident/host    all             all             127.0.0.1\/32            md5/' /var/lib/pgsql/15/data/pg_hba.conf
sed -i 's/^host    all             all             ::1\/128                 ident/host    all             all             ::1\/128                 md5/' /var/lib/pgsql/15/data/pg_hba.conf

# Reiniciar PostgreSQL
systemctl restart postgresql-15
echo "✓ PostgreSQL reiniciado"

# Executar scripts SQL base
echo "Aplicando scripts SQL base..."
sudo -u postgres psql -d barbearia_premium -f /home/cyberpanel/app/backend/sql/001_init_multifilial.sql
sudo -u postgres psql -d barbearia_premium -f /home/cyberpanel/app/backend/sql/002_base_operacao_storage.sql
echo "✓ Scripts SQL base aplicados"

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "Configuração do PostgreSQL concluída!"
echo ""
echo "Informações de conexão:"
echo "  Host: localhost"
echo "  Port: 5432"
echo "  Database: barbearia_premium"
echo "  User: barbearia_user"
echo "  Password: [A senha que você definiu]"
echo "═══════════════════════════════════════════════════════════════"





