-- ============================================================
-- TABELA: produtos
-- Descrição: Armazena os produtos da barbearia
-- ============================================================

CREATE TABLE IF NOT EXISTS protese.produtos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    codigo VARCHAR(50) NOT NULL UNIQUE,
    descricao VARCHAR(255) NOT NULL,
    fornecedor VARCHAR(255),
    preco_venda DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    ultimo_preco_custo DECIMAL(10, 2) DEFAULT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID,
    updated_by UUID
);

-- Tabela de histórico de preços de custo
CREATE TABLE IF NOT EXISTS protese.produtos_precos_custo (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    produto_id UUID NOT NULL,
    preco_custo DECIMAL(10, 2) NOT NULL,
    data_lancamento DATE NOT NULL DEFAULT CURRENT_DATE,
    observacoes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID,
    CONSTRAINT fk_produto_preco_custo FOREIGN KEY (produto_id) REFERENCES protese.produtos(id) ON DELETE CASCADE
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_produtos_codigo ON protese.produtos(codigo);
CREATE INDEX IF NOT EXISTS idx_produtos_fornecedor ON protese.produtos(fornecedor);
CREATE INDEX IF NOT EXISTS idx_produtos_is_active ON protese.produtos(is_active);
CREATE INDEX IF NOT EXISTS idx_produtos_created_at ON protese.produtos(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_produtos_precos_custo_produto_id ON protese.produtos_precos_custo(produto_id);
CREATE INDEX IF NOT EXISTS idx_produtos_precos_custo_data ON protese.produtos_precos_custo(data_lancamento DESC);

-- Comentários
COMMENT ON TABLE protese.produtos IS 'Armazena os produtos da barbearia';
COMMENT ON COLUMN protese.produtos.codigo IS 'Código único do produto';
COMMENT ON COLUMN protese.produtos.descricao IS 'Descrição do produto';
COMMENT ON COLUMN protese.produtos.fornecedor IS 'Nome do fornecedor do produto';
COMMENT ON COLUMN protese.produtos.preco_venda IS 'Preço de venda do produto em reais (R$)';
COMMENT ON COLUMN protese.produtos.ultimo_preco_custo IS 'Último preço de custo lançado para o produto';
COMMENT ON COLUMN protese.produtos.is_active IS 'Indica se o produto está ativo';

COMMENT ON TABLE protese.produtos_precos_custo IS 'Histórico de preços de custo dos produtos';
COMMENT ON COLUMN protese.produtos_precos_custo.preco_custo IS 'Preço de custo lançado';
COMMENT ON COLUMN protese.produtos_precos_custo.data_lancamento IS 'Data em que o preço de custo foi lançado';

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION protese.update_produtos_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_produtos_updated_at
    BEFORE UPDATE ON protese.produtos
    FOR EACH ROW
    EXECUTE FUNCTION protese.update_produtos_updated_at();

-- Trigger para atualizar ultimo_preco_custo quando um novo preço de custo é lançado
CREATE OR REPLACE FUNCTION protese.update_ultimo_preco_custo()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE protese.produtos
    SET ultimo_preco_custo = NEW.preco_custo,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = NEW.produto_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_ultimo_preco_custo
    AFTER INSERT ON protese.produtos_precos_custo
    FOR EACH ROW
    EXECUTE FUNCTION protese.update_ultimo_preco_custo();

-- Permissions
ALTER TABLE protese.produtos OWNER TO protese_user;
ALTER TABLE protese.produtos_precos_custo OWNER TO protese_user;
GRANT ALL ON TABLE protese.produtos TO protese_user;
GRANT ALL ON TABLE protese.produtos_precos_custo TO protese_user;

