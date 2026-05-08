-- ============================================================
-- ADICIONAR NOVAS PERMISSÕES NA TABELA permissoes_usuarios
-- ============================================================
-- Este script adiciona os novos campos de permissão:
-- - Emissão de NFe (ver, editar, excluir)
-- - Emissão de Relatórios (ver, editar, excluir)
-- - Integração de APIs Externas (ver, editar, excluir)
-- - Habilitar API (ver, editar, excluir)
-- ============================================================

-- Adicionar colunas de Emissão de NFe
ALTER TABLE protese.permissoes_usuarios
ADD COLUMN IF NOT EXISTS emissao_nfe_ver BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS emissao_nfe_editar BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS emissao_nfe_excluir BOOLEAN DEFAULT false;

-- Adicionar colunas de Emissão de Relatórios
ALTER TABLE protese.permissoes_usuarios
ADD COLUMN IF NOT EXISTS emissao_relatorios_ver BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS emissao_relatorios_editar BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS emissao_relatorios_excluir BOOLEAN DEFAULT false;

-- Adicionar colunas de Integração de APIs Externas
ALTER TABLE protese.permissoes_usuarios
ADD COLUMN IF NOT EXISTS integracao_apis_ver BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS integracao_apis_editar BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS integracao_apis_excluir BOOLEAN DEFAULT false;

-- Adicionar colunas de Habilitar API
ALTER TABLE protese.permissoes_usuarios
ADD COLUMN IF NOT EXISTS habilitar_api_ver BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS habilitar_api_editar BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS habilitar_api_excluir BOOLEAN DEFAULT false;

-- Adicionar colunas de Configurações
ALTER TABLE protese.permissoes_usuarios
ADD COLUMN IF NOT EXISTS configuracoes_ver BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS configuracoes_editar BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS configuracoes_excluir BOOLEAN DEFAULT false;

-- Adicionar comentários nas colunas
COMMENT ON COLUMN protese.permissoes_usuarios.emissao_nfe_ver IS 'Permissão para visualizar emissão de NFe';
COMMENT ON COLUMN protese.permissoes_usuarios.emissao_nfe_editar IS 'Permissão para criar e editar emissão de NFe';
COMMENT ON COLUMN protese.permissoes_usuarios.emissao_nfe_excluir IS 'Permissão para excluir emissão de NFe';

COMMENT ON COLUMN protese.permissoes_usuarios.emissao_relatorios_ver IS 'Permissão para visualizar emissão de relatórios';
COMMENT ON COLUMN protese.permissoes_usuarios.emissao_relatorios_editar IS 'Permissão para criar e editar emissão de relatórios';
COMMENT ON COLUMN protese.permissoes_usuarios.emissao_relatorios_excluir IS 'Permissão para excluir emissão de relatórios';

COMMENT ON COLUMN protese.permissoes_usuarios.integracao_apis_ver IS 'Permissão para visualizar integração de APIs externas';
COMMENT ON COLUMN protese.permissoes_usuarios.integracao_apis_editar IS 'Permissão para criar e editar integração de APIs externas';
COMMENT ON COLUMN protese.permissoes_usuarios.integracao_apis_excluir IS 'Permissão para excluir integração de APIs externas';

COMMENT ON COLUMN protese.permissoes_usuarios.habilitar_api_ver IS 'Permissão para visualizar habilitar API';
COMMENT ON COLUMN protese.permissoes_usuarios.habilitar_api_editar IS 'Permissão para criar e editar habilitar API';
COMMENT ON COLUMN protese.permissoes_usuarios.habilitar_api_excluir IS 'Permissão para excluir habilitar API';

COMMENT ON COLUMN protese.permissoes_usuarios.configuracoes_ver IS 'Permissão para visualizar configurações';
COMMENT ON COLUMN protese.permissoes_usuarios.configuracoes_editar IS 'Permissão para criar e editar configurações';
COMMENT ON COLUMN protese.permissoes_usuarios.configuracoes_excluir IS 'Permissão para excluir configurações';

-- Verificar se as colunas foram criadas
SELECT 
    column_name, 
    data_type, 
    column_default,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'protese' 
  AND table_name = 'permissoes_usuarios'
  AND column_name IN (
    'emissao_nfe_ver', 'emissao_nfe_editar', 'emissao_nfe_excluir',
    'emissao_relatorios_ver', 'emissao_relatorios_editar', 'emissao_relatorios_excluir',
    'integracao_apis_ver', 'integracao_apis_editar', 'integracao_apis_excluir',
    'habilitar_api_ver', 'habilitar_api_editar', 'habilitar_api_excluir',
    'configuracoes_ver', 'configuracoes_editar', 'configuracoes_excluir'
  )
ORDER BY column_name;

-- ============================================================
-- FIM DO SCRIPT
-- ============================================================
-- Após executar este script, reinicie o backend para que as
-- novas permissões sejam reconhecidas.
-- ============================================================

