-- Script para adicionar permissões de Produtos e Estoque na tabela protese.permissoes_usuarios
-- Data: 12 de Dezembro de 2025

-- Adicionar colunas de permissão para Produtos
ALTER TABLE protese.permissoes_usuarios
ADD COLUMN IF NOT EXISTS produtos_ver bool DEFAULT false NULL,
ADD COLUMN IF NOT EXISTS produtos_editar bool DEFAULT false NULL,
ADD COLUMN IF NOT EXISTS produtos_excluir bool DEFAULT false NULL;

-- Adicionar colunas de permissão para Estoque
ALTER TABLE protese.permissoes_usuarios
ADD COLUMN IF NOT EXISTS estoque_ver bool DEFAULT false NULL,
ADD COLUMN IF NOT EXISTS estoque_editar bool DEFAULT false NULL,
ADD COLUMN IF NOT EXISTS estoque_excluir bool DEFAULT false NULL;

-- Adicionar comentários nas colunas
COMMENT ON COLUMN protese.permissoes_usuarios.produtos_ver IS 'Permissão para visualizar produtos';
COMMENT ON COLUMN protese.permissoes_usuarios.produtos_editar IS 'Permissão para criar e editar produtos';
COMMENT ON COLUMN protese.permissoes_usuarios.produtos_excluir IS 'Permissão para excluir produtos';

COMMENT ON COLUMN protese.permissoes_usuarios.estoque_ver IS 'Permissão para visualizar estoque';
COMMENT ON COLUMN protese.permissoes_usuarios.estoque_editar IS 'Permissão para criar e editar estoque';
COMMENT ON COLUMN protese.permissoes_usuarios.estoque_excluir IS 'Permissão para excluir estoque';

-- Verificar se as colunas foram criadas
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'protese' 
  AND table_name = 'permissoes_usuarios'
  AND column_name IN ('produtos_ver', 'produtos_editar', 'produtos_excluir', 'estoque_ver', 'estoque_editar', 'estoque_excluir')
ORDER BY column_name;

