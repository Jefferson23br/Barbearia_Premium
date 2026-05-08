-- Adicionar item "Assinaturas" no módulo "Operação"
-- Este script adiciona o item de menu e as colunas de permissão necessárias

-- 1. Adicionar item "Assinaturas" no módulo "Operação"
INSERT INTO protese.modulos_itens (modulo_id, item_id, item_label, item_path, item_icon, ordem, ativo)
SELECT 
    m.id,
    'assinaturas',
    'Assinaturas',
    '/dashboard/assinaturas',
    'FileText',
    3,
    true
FROM protese.modulos m WHERE m.nome = 'Operação'
ON CONFLICT (item_id) DO UPDATE 
SET item_label = 'Assinaturas',
    item_path = '/dashboard/assinaturas',
    item_icon = 'FileText',
    ordem = 3,
    ativo = true,
    updated_at = CURRENT_TIMESTAMP;

-- 2. Adicionar colunas de permissão na tabela permissoes_usuarios
ALTER TABLE protese.permissoes_usuarios 
ADD COLUMN IF NOT EXISTS assinaturas_ver BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS assinaturas_editar BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS assinaturas_excluir BOOLEAN DEFAULT false;

-- 3. Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_permissoes_assinaturas_ver ON protese.permissoes_usuarios (assinaturas_ver);
CREATE INDEX IF NOT EXISTS idx_permissoes_assinaturas_editar ON protese.permissoes_usuarios (assinaturas_editar);

-- 4. Comentários nas colunas
COMMENT ON COLUMN protese.permissoes_usuarios.assinaturas_ver IS 'Permissão para visualizar assinaturas';
COMMENT ON COLUMN protese.permissoes_usuarios.assinaturas_editar IS 'Permissão para criar e editar assinaturas';
COMMENT ON COLUMN protese.permissoes_usuarios.assinaturas_excluir IS 'Permissão para excluir assinaturas';

