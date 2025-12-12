-- ============================================================
-- ADICIONAR CAMPOS DE IMAGENS NA TABELA servicos
-- Descrição: Adiciona campos para armazenar até 3 URLs de imagens
-- ============================================================

-- Adicionar campos de imagens (se não existirem)
DO $$ 
BEGIN
    -- imagem_capa_url (primeira imagem, sempre a capa)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'protese' 
        AND table_name = 'servicos' 
        AND column_name = 'imagem_capa_url'
    ) THEN
        ALTER TABLE protese.servicos
        ADD COLUMN imagem_capa_url TEXT NULL;
    END IF;

    -- imagem_2_url (segunda imagem opcional)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'protese' 
        AND table_name = 'servicos' 
        AND column_name = 'imagem_2_url'
    ) THEN
        ALTER TABLE protese.servicos
        ADD COLUMN imagem_2_url TEXT NULL;
    END IF;

    -- imagem_3_url (terceira imagem opcional)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'protese' 
        AND table_name = 'servicos' 
        AND column_name = 'imagem_3_url'
    ) THEN
        ALTER TABLE protese.servicos
        ADD COLUMN imagem_3_url TEXT NULL;
    END IF;
END $$;

-- Comentários
COMMENT ON COLUMN protese.servicos.imagem_capa_url IS 'URL da imagem de capa do serviço (primeira imagem, obrigatória se houver imagens)';
COMMENT ON COLUMN protese.servicos.imagem_2_url IS 'URL da segunda imagem do serviço (opcional)';
COMMENT ON COLUMN protese.servicos.imagem_3_url IS 'URL da terceira imagem do serviço (opcional)';







