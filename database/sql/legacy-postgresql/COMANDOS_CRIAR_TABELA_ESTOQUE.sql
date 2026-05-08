-- ============================================================
-- TABELA: estoque_movimentacoes
-- Descrição: Armazena as movimentações de entrada de estoque
-- ============================================================

CREATE TABLE IF NOT EXISTS protese.estoque_movimentacoes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    produto_id UUID NOT NULL,
    fornecedor VARCHAR(255) NOT NULL,
    quantidade INTEGER NOT NULL DEFAULT 0,
    valor_unitario DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    valor_total DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    data_movimentacao DATE NOT NULL DEFAULT CURRENT_DATE,
    observacoes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID,
    CONSTRAINT fk_estoque_produto FOREIGN KEY (produto_id) REFERENCES protese.produtos(id) ON DELETE CASCADE
);

-- Adicionar coluna quantidade_estoque na tabela produtos se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'protese' 
        AND table_name = 'produtos' 
        AND column_name = 'quantidade_estoque'
    ) THEN
        ALTER TABLE protese.produtos ADD COLUMN quantidade_estoque INTEGER DEFAULT 0;
        COMMENT ON COLUMN protese.produtos.quantidade_estoque IS 'Quantidade atual em estoque do produto';
    END IF;
END $$;

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_estoque_movimentacoes_produto_id ON protese.estoque_movimentacoes(produto_id);
CREATE INDEX IF NOT EXISTS idx_estoque_movimentacoes_data ON protese.estoque_movimentacoes(data_movimentacao DESC);
CREATE INDEX IF NOT EXISTS idx_estoque_movimentacoes_fornecedor ON protese.estoque_movimentacoes(fornecedor);
CREATE INDEX IF NOT EXISTS idx_produtos_quantidade_estoque ON protese.produtos(quantidade_estoque);

-- Comentários
COMMENT ON TABLE protese.estoque_movimentacoes IS 'Armazena as movimentações de entrada de estoque';
COMMENT ON COLUMN protese.estoque_movimentacoes.produto_id IS 'ID do produto relacionado';
COMMENT ON COLUMN protese.estoque_movimentacoes.fornecedor IS 'Nome do fornecedor da compra';
COMMENT ON COLUMN protese.estoque_movimentacoes.quantidade IS 'Quantidade comprada nesta movimentação';
COMMENT ON COLUMN protese.estoque_movimentacoes.valor_unitario IS 'Valor unitário de compra nesta movimentação';
COMMENT ON COLUMN protese.estoque_movimentacoes.valor_total IS 'Valor total da compra (quantidade * valor_unitario)';
COMMENT ON COLUMN protese.estoque_movimentacoes.data_movimentacao IS 'Data da movimentação/compra';

-- Trigger para calcular valor_total automaticamente
CREATE OR REPLACE FUNCTION protese.calcular_valor_total_estoque()
RETURNS TRIGGER AS $$
BEGIN
    NEW.valor_total = NEW.quantidade * NEW.valor_unitario;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_calcular_valor_total_estoque ON protese.estoque_movimentacoes;
CREATE TRIGGER trigger_calcular_valor_total_estoque
    BEFORE INSERT OR UPDATE ON protese.estoque_movimentacoes
    FOR EACH ROW
    EXECUTE FUNCTION protese.calcular_valor_total_estoque();

-- Trigger para atualizar quantidade_estoque quando houver entrada
CREATE OR REPLACE FUNCTION protese.atualizar_quantidade_estoque()
RETURNS TRIGGER AS $$
BEGIN
    -- Atualizar quantidade em estoque, último preço de custo e fornecedor do produto
    UPDATE protese.produtos
    SET quantidade_estoque = quantidade_estoque + NEW.quantidade,
        ultimo_preco_custo = NEW.valor_unitario,
        fornecedor = NEW.fornecedor,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = NEW.produto_id;
    
    -- Registrar preço de custo no histórico
    INSERT INTO protese.produtos_precos_custo (
        produto_id,
        preco_custo,
        data_lancamento,
        observacoes,
        created_by
    ) VALUES (
        NEW.produto_id,
        NEW.valor_unitario,
        NEW.data_movimentacao,
        CONCAT('Entrada de estoque - ', NEW.quantidade, ' unidades - Fornecedor: ', NEW.fornecedor),
        NEW.created_by
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_atualizar_quantidade_estoque ON protese.estoque_movimentacoes;
CREATE TRIGGER trigger_atualizar_quantidade_estoque
    AFTER INSERT ON protese.estoque_movimentacoes
    FOR EACH ROW
    EXECUTE FUNCTION protese.atualizar_quantidade_estoque();

-- Trigger para reverter quantidade quando uma movimentação for excluída
CREATE OR REPLACE FUNCTION protese.reverter_quantidade_estoque()
RETURNS TRIGGER AS $$
BEGIN
    -- Reverter quantidade em estoque do produto
    UPDATE protese.produtos
    SET quantidade_estoque = quantidade_estoque - OLD.quantidade,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = OLD.produto_id;
    
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_reverter_quantidade_estoque ON protese.estoque_movimentacoes;
CREATE TRIGGER trigger_reverter_quantidade_estoque
    AFTER DELETE ON protese.estoque_movimentacoes
    FOR EACH ROW
    EXECUTE FUNCTION protese.reverter_quantidade_estoque();

-- Permissions
ALTER TABLE protese.estoque_movimentacoes OWNER TO protese_user;
GRANT ALL ON TABLE protese.estoque_movimentacoes TO protese_user;

