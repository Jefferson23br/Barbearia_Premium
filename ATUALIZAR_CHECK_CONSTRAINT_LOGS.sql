-- Atualizar CHECK constraint para permitir 'sistema' na tabela logs_sistema

ALTER TABLE protese.logs_sistema 
DROP CONSTRAINT IF EXISTS logs_sistema_usuario_tipo_check;

ALTER TABLE protese.logs_sistema 
ADD CONSTRAINT logs_sistema_usuario_tipo_check 
CHECK (usuario_tipo IS NULL OR usuario_tipo IN ('cliente', 'administrativo', 'sistema'));

-- Verificar se foi aplicado
SELECT 
    conname AS constraint_name,
    pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'protese.logs_sistema'::regclass
  AND conname = 'logs_sistema_usuario_tipo_check';



















