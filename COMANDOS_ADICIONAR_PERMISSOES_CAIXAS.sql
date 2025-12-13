-- Script para adicionar permissões de Caixas na tabela protese.permissoes_usuarios
-- Data: 12 de Dezembro de 2025

-- Adicionar colunas de permissão para Caixas
ALTER TABLE protese.permissoes_usuarios
ADD COLUMN IF NOT EXISTS caixas_ver bool DEFAULT false NULL,
ADD COLUMN IF NOT EXISTS caixas_editar bool DEFAULT false NULL,
ADD COLUMN IF NOT EXISTS caixas_excluir bool DEFAULT false NULL;

-- Adicionar comentários nas colunas
COMMENT ON COLUMN protese.permissoes_usuarios.caixas_ver IS 'Permissão para visualizar contas e movimentações';
COMMENT ON COLUMN protese.permissoes_usuarios.caixas_editar IS 'Permissão para criar e editar contas e movimentações';
COMMENT ON COLUMN protese.permissoes_usuarios.caixas_excluir IS 'Permissão para excluir contas e movimentações';

-- Verificar se as colunas foram criadas
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'protese' 
  AND table_name = 'permissoes_usuarios'
  AND column_name IN ('caixas_ver', 'caixas_editar', 'caixas_excluir')
ORDER BY column_name;

