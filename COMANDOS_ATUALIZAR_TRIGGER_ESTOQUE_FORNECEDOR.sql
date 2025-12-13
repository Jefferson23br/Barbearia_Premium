-- ============================================================
-- ATUALIZAÇÃO: Trigger de Estoque para Atualizar Fornecedor
-- Descrição: Atualiza o trigger para também atualizar o fornecedor
--            do produto quando uma entrada de estoque for lançada
-- ============================================================

-- Atualizar função do trigger para incluir atualização do fornecedor
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

-- Comentário atualizado
COMMENT ON FUNCTION protese.atualizar_quantidade_estoque() IS 
'Atualiza quantidade em estoque, último preço de custo e fornecedor do produto quando uma entrada de estoque é lançada';

