-- Adicionar permissões de vendas à tabela de permissões
ALTER TABLE protese.permissoes_usuarios
ADD COLUMN IF NOT EXISTS vendas_ver bool DEFAULT false NULL,
ADD COLUMN IF NOT EXISTS vendas_editar bool DEFAULT false NULL,
ADD COLUMN IF NOT EXISTS vendas_excluir bool DEFAULT false NULL;

-- Comentários
COMMENT ON COLUMN protese.permissoes_usuarios.vendas_ver IS 'Permissão para visualizar vendas';
COMMENT ON COLUMN protese.permissoes_usuarios.vendas_editar IS 'Permissão para criar e editar vendas';
COMMENT ON COLUMN protese.permissoes_usuarios.vendas_excluir IS 'Permissão para excluir vendas';

