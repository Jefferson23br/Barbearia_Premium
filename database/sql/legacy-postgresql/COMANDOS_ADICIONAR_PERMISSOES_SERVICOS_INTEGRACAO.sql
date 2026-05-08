-- Adicionar permissões para Serviços de Integração
-- Este script adiciona as colunas de permissão para o módulo de Serviços de Integração

-- Adicionar colunas de permissão para Serviços de Integração
ALTER TABLE protese.permissoes_usuarios 
ADD COLUMN IF NOT EXISTS servicos_integracao_ver BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS servicos_integracao_editar BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS servicos_integracao_excluir BOOLEAN DEFAULT false;

-- Adicionar comentários nas colunas
COMMENT ON COLUMN protese.permissoes_usuarios.servicos_integracao_ver IS 'Permissão para visualizar serviços de integração';
COMMENT ON COLUMN protese.permissoes_usuarios.servicos_integracao_editar IS 'Permissão para criar e editar serviços de integração';
COMMENT ON COLUMN protese.permissoes_usuarios.servicos_integracao_excluir IS 'Permissão para excluir serviços de integração';

-- Criar índices para melhor performance (opcional)
CREATE INDEX IF NOT EXISTS idx_permissoes_servicos_integracao_ver ON protese.permissoes_usuarios(servicos_integracao_ver);
CREATE INDEX IF NOT EXISTS idx_permissoes_servicos_integracao_editar ON protese.permissoes_usuarios(servicos_integracao_editar);

