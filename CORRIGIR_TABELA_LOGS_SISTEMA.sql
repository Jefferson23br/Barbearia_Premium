-- Corrigir a tabela logs_sistema para permitir usuario_id NULL
-- (para casos de ações do sistema que não têm usuário específico)

-- 1. Alterar coluna usuario_id para permitir NULL (se ainda não estiver)
ALTER TABLE protese.logs_sistema 
ALTER COLUMN usuario_id DROP NOT NULL;

-- 2. Alterar coluna usuario_tipo para permitir NULL também (se ainda não estiver)
ALTER TABLE protese.logs_sistema 
ALTER COLUMN usuario_tipo DROP NOT NULL;

-- 3. Atualizar CHECK constraint para permitir 'sistema'
ALTER TABLE protese.logs_sistema 
DROP CONSTRAINT IF EXISTS logs_sistema_usuario_tipo_check;

ALTER TABLE protese.logs_sistema 
ADD CONSTRAINT logs_sistema_usuario_tipo_check 
CHECK (usuario_tipo IS NULL OR usuario_tipo IN ('cliente', 'administrativo', 'sistema'));

-- Verificar estrutura
\d protese.logs_sistema

