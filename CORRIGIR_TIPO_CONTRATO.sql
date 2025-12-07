-- ============================================================
-- CORREÇÃO: Aumentar tamanho do campo tipo_contrato
-- ============================================================
-- O campo tipo_contrato está como VARCHAR(2) mas precisa aceitar 'CLT' (3 caracteres)
-- Este comando altera o campo para VARCHAR(3)

ALTER TABLE protese.usuarios_administrativos 
    ALTER COLUMN tipo_contrato TYPE VARCHAR(3);

-- Verificar se a alteração foi aplicada
SELECT 
    column_name,
    data_type,
    character_maximum_length
FROM information_schema.columns
WHERE table_schema = 'protese'
    AND table_name = 'usuarios_administrativos'
    AND column_name = 'tipo_contrato';

