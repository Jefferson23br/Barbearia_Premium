-- ============================================================
-- SOLUCIONAR PROBLEMA DE PERMISSÕES
-- ============================================================
-- O erro "permission denied for schema public" indica que
-- o usuário não tem permissão para criar tabelas.
-- ============================================================

-- ============================================================
-- OPÇÃO 1: Executar como superusuário (postgres)
-- ============================================================
-- Conecte como superusuário:
-- psql -h localhost -U postgres -d protese_capilar
-- 
-- Depois execute os comandos abaixo para dar permissões:

-- Dar permissões ao usuário protese_user
GRANT ALL PRIVILEGES ON DATABASE protese_capilar TO protese_user;
GRANT ALL PRIVILEGES ON SCHEMA public TO protese_user;
GRANT CREATE ON SCHEMA public TO protese_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO protese_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO protese_user;

-- ============================================================
-- OPÇÃO 2: Se ainda não funcionar, criar schema próprio
-- ============================================================
-- CREATE SCHEMA IF NOT EXISTS protese AUTHORIZATION protese_user;
-- SET search_path TO protese;

-- ============================================================
-- OPÇÃO 3: Verificar usuário atual e permissões
-- ============================================================
-- SELECT current_user;
-- SELECT * FROM information_schema.role_table_grants WHERE grantee = 'protese_user';





