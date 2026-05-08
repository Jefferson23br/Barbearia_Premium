-- Adicionar campo movimentacao_caixa_id na tabela despesas_parcelas
-- Verificar se a coluna já existe antes de adicionar
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'protese' 
        AND table_name = 'despesas_parcelas' 
        AND column_name = 'movimentacao_caixa_id'
    ) THEN
        ALTER TABLE protese.despesas_parcelas
        ADD COLUMN movimentacao_caixa_id UUID REFERENCES protese.movimentacoes_caixa(id) ON DELETE SET NULL;
    END IF;
END $$;

COMMENT ON COLUMN protese.despesas_parcelas.movimentacao_caixa_id IS 'Referência à movimentação de caixa gerada quando a parcela é paga';

