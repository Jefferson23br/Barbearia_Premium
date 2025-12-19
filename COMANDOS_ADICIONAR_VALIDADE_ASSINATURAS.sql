-- ============================================================
-- ADICIONAR VALIDADE EM DIAS NAS ASSINATURAS
-- Descrição: Adiciona campo validade_em_dias para controle de expiração
-- ============================================================

-- Adicionar coluna validade_em_dias na tabela assinaturas
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'protese' 
        AND table_name = 'assinaturas' 
        AND column_name = 'validade_em_dias'
    ) THEN
        ALTER TABLE protese.assinaturas
        ADD COLUMN validade_em_dias INTEGER DEFAULT 30;
    END IF;
END $$;

-- Comentário
COMMENT ON COLUMN protese.assinaturas.validade_em_dias IS 'Validade da assinatura em dias corridos (ex: 30 dias)';

-- Atualizar assinaturas existentes para ter validade padrão de 30 dias se NULL
UPDATE protese.assinaturas 
SET validade_em_dias = 30 
WHERE validade_em_dias IS NULL;

