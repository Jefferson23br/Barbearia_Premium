-- ============================================================
-- ADICIONAR PERMISSÕES DE SERVIÇOS NA TABELA permissoes_usuarios
-- Descrição: Adiciona as colunas de permissões para o módulo Serviços
-- ============================================================

-- Adicionar colunas de permissões de serviços (se não existirem)
DO $$ 
BEGIN
    -- servicos_ver
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'protese' 
        AND table_name = 'permissoes_usuarios' 
        AND column_name = 'servicos_ver'
    ) THEN
        ALTER TABLE protese.permissoes_usuarios
        ADD COLUMN servicos_ver BOOLEAN DEFAULT false;
    END IF;

    -- servicos_editar
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'protese' 
        AND table_name = 'permissoes_usuarios' 
        AND column_name = 'servicos_editar'
    ) THEN
        ALTER TABLE protese.permissoes_usuarios
        ADD COLUMN servicos_editar BOOLEAN DEFAULT false;
    END IF;

    -- servicos_excluir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'protese' 
        AND table_name = 'permissoes_usuarios' 
        AND column_name = 'servicos_excluir'
    ) THEN
        ALTER TABLE protese.permissoes_usuarios
        ADD COLUMN servicos_excluir BOOLEAN DEFAULT false;
    END IF;
END $$;

-- Comentários
COMMENT ON COLUMN protese.permissoes_usuarios.servicos_ver IS 'Permissão para visualizar serviços';
COMMENT ON COLUMN protese.permissoes_usuarios.servicos_editar IS 'Permissão para criar e editar serviços';
COMMENT ON COLUMN protese.permissoes_usuarios.servicos_excluir IS 'Permissão para excluir serviços';











