-- Adicionar permissões de Cupons e Fidelidades na tabela permissoes_usuarios

ALTER TABLE protese.permissoes_usuarios 
ADD COLUMN IF NOT EXISTS cupons_fidelidades_ver bool DEFAULT false NULL,
ADD COLUMN IF NOT EXISTS cupons_fidelidades_editar bool DEFAULT false NULL,
ADD COLUMN IF NOT EXISTS cupons_fidelidades_excluir bool DEFAULT false NULL;

-- Comentários
COMMENT ON COLUMN protese.permissoes_usuarios.cupons_fidelidades_ver IS 'Permissão para visualizar cupons e fidelidades';
COMMENT ON COLUMN protese.permissoes_usuarios.cupons_fidelidades_editar IS 'Permissão para criar e editar cupons e fidelidades';
COMMENT ON COLUMN protese.permissoes_usuarios.cupons_fidelidades_excluir IS 'Permissão para excluir cupons e fidelidades';

