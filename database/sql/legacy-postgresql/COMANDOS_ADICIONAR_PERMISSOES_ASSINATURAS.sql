-- ============================================================
-- ADICIONAR PERMISSÕES DE ASSINATURAS NA TABELA permissoes_usuarios
-- Descrição: Adiciona as colunas de permissões para o módulo Assinaturas
-- ============================================================

-- Adicionar colunas de permissões de assinaturas (se não existirem)

-- assinaturas_ver
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'protese' 
        AND table_name = 'permissoes_usuarios' 
        AND column_name = 'assinaturas_ver'
    ) THEN
        ALTER TABLE protese.permissoes_usuarios
        ADD COLUMN assinaturas_ver BOOLEAN DEFAULT false;
    END IF;
END $$;

-- assinaturas_editar
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'protese' 
        AND table_name = 'permissoes_usuarios' 
        AND column_name = 'assinaturas_editar'
    ) THEN
        ALTER TABLE protese.permissoes_usuarios
        ADD COLUMN assinaturas_editar BOOLEAN DEFAULT false;
    END IF;
END $$;

-- assinaturas_excluir
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'protese' 
        AND table_name = 'permissoes_usuarios' 
        AND column_name = 'assinaturas_excluir'
    ) THEN
        ALTER TABLE protese.permissoes_usuarios
        ADD COLUMN assinaturas_excluir BOOLEAN DEFAULT false;
    END IF;
END $$;

-- Comentários
COMMENT ON COLUMN protese.permissoes_usuarios.assinaturas_ver IS 'Permissão para visualizar assinaturas';
COMMENT ON COLUMN protese.permissoes_usuarios.assinaturas_editar IS 'Permissão para criar e editar assinaturas';
COMMENT ON COLUMN protese.permissoes_usuarios.assinaturas_excluir IS 'Permissão para excluir assinaturas';

