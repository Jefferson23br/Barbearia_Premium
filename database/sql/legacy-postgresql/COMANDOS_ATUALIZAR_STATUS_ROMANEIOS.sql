-- Atualizar status padrão dos romaneios para 'fechado'
-- Primeiro, alterar o valor padrão da coluna
ALTER TABLE protese.romaneios 
ALTER COLUMN status SET DEFAULT 'fechado';

-- Atualizar romaneios existentes que estão 'aberto' para 'fechado'
UPDATE protese.romaneios 
SET status = 'fechado' 
WHERE status = 'aberto';

