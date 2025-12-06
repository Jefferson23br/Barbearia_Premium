-- ============================================================
-- COMANDOS PARA EXECUTAR PRIMEIRO (Como superusuário)
-- ============================================================
-- Conecte como superusuário postgres primeiro!
-- ============================================================

-- Verificar qual usuário está conectado
SELECT current_user;

-- Dar todas as permissões ao usuário protese_user
GRANT ALL PRIVILEGES ON DATABASE protese_capilar TO protese_user;

GRANT ALL PRIVILEGES ON SCHEMA public TO protese_user;

GRANT CREATE ON SCHEMA public TO protese_user;

ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO protese_user;

ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO protese_user;

-- Verificar permissões (opcional)
SELECT * FROM information_schema.role_table_grants WHERE grantee = 'protese_user';


