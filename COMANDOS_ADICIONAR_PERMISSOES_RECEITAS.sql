-- Adicionar permissões de receitas à tabela de permissões (se ainda não existirem)
-- Nota: As permissões receitas_ver, receitas_editar, receitas_excluir já devem existir
-- Este script garante que existam

DO $$
BEGIN
    -- Verificar e adicionar receitas_ver se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'protese' 
        AND table_name = 'permissoes_usuarios' 
        AND column_name = 'receitas_ver'
    ) THEN
        ALTER TABLE protese.permissoes_usuarios
        ADD COLUMN receitas_ver bool DEFAULT false NULL;
    END IF;

    -- Verificar e adicionar receitas_editar se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'protese' 
        AND table_name = 'permissoes_usuarios' 
        AND column_name = 'receitas_editar'
    ) THEN
        ALTER TABLE protese.permissoes_usuarios
        ADD COLUMN receitas_editar bool DEFAULT false NULL;
    END IF;

    -- Verificar e adicionar receitas_excluir se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'protese' 
        AND table_name = 'permissoes_usuarios' 
        AND column_name = 'receitas_excluir'
    ) THEN
        ALTER TABLE protese.permissoes_usuarios
        ADD COLUMN receitas_excluir bool DEFAULT false NULL;
    END IF;
END $$;

-- Comentários
COMMENT ON COLUMN protese.permissoes_usuarios.receitas_ver IS 'Permissão para visualizar receitas';
COMMENT ON COLUMN protese.permissoes_usuarios.receitas_editar IS 'Permissão para criar, editar e efetivar pagamentos de receitas';
COMMENT ON COLUMN protese.permissoes_usuarios.receitas_excluir IS 'Permissão para excluir receitas';

