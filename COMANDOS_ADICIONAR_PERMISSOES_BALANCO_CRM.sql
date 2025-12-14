-- Adicionar permissões para Balanço Demonstrativo e CRM
-- Execute este script no PostgreSQL

ALTER TABLE protese.permissoes_usuarios
ADD COLUMN IF NOT EXISTS balanco_demonstrativo_ver bool DEFAULT false NULL,
ADD COLUMN IF NOT EXISTS balanco_demonstrativo_editar bool DEFAULT false NULL,
ADD COLUMN IF NOT EXISTS balanco_demonstrativo_excluir bool DEFAULT false NULL,
ADD COLUMN IF NOT EXISTS crm_ver bool DEFAULT false NULL,
ADD COLUMN IF NOT EXISTS crm_editar bool DEFAULT false NULL,
ADD COLUMN IF NOT EXISTS crm_excluir bool DEFAULT false NULL;

-- Comentários nas colunas
COMMENT ON COLUMN protese.permissoes_usuarios.balanco_demonstrativo_ver IS 'Permissão para visualizar balanço demonstrativo';
COMMENT ON COLUMN protese.permissoes_usuarios.balanco_demonstrativo_editar IS 'Permissão para criar e editar balanço demonstrativo';
COMMENT ON COLUMN protese.permissoes_usuarios.balanco_demonstrativo_excluir IS 'Permissão para excluir balanço demonstrativo';

COMMENT ON COLUMN protese.permissoes_usuarios.crm_ver IS 'Permissão para visualizar CRM';
COMMENT ON COLUMN protese.permissoes_usuarios.crm_editar IS 'Permissão para criar e editar CRM';
COMMENT ON COLUMN protese.permissoes_usuarios.crm_excluir IS 'Permissão para excluir CRM';

-- Permissões
GRANT ALL ON TABLE protese.permissoes_usuarios TO protese_user;

