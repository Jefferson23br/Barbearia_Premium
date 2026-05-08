-- Tabela de Categorias de Custo (Centro de Custo)
CREATE TABLE IF NOT EXISTS protese.categorias_custo (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR(255) NOT NULL UNIQUE,
    descricao TEXT,
    codigo VARCHAR(50) UNIQUE, -- Código opcional para categorização
    tipo VARCHAR(50) DEFAULT 'despesa' CHECK (tipo IN ('despesa', 'receita', 'ambos')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID,
    updated_by UUID
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_categorias_custo_nome ON protese.categorias_custo(nome);
CREATE INDEX IF NOT EXISTS idx_categorias_custo_codigo ON protese.categorias_custo(codigo);
CREATE INDEX IF NOT EXISTS idx_categorias_custo_tipo ON protese.categorias_custo(tipo);
CREATE INDEX IF NOT EXISTS idx_categorias_custo_active ON protese.categorias_custo(is_active);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION protese.atualizar_updated_at_categorias_custo()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_atualizar_updated_at_categorias_custo ON protese.categorias_custo;
CREATE TRIGGER trigger_atualizar_updated_at_categorias_custo
    BEFORE UPDATE ON protese.categorias_custo
    FOR EACH ROW
    EXECUTE FUNCTION protese.atualizar_updated_at_categorias_custo();

-- Adicionar foreign key na tabela despesas (se ainda não existir)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_despesas_categoria_custo' 
        AND table_schema = 'protese'
    ) THEN
        ALTER TABLE protese.despesas
        ADD CONSTRAINT fk_despesas_categoria_custo
        FOREIGN KEY (categoria_custo_id) 
        REFERENCES protese.categorias_custo(id) 
        ON DELETE SET NULL;
    END IF;
END $$;

-- Comentários
COMMENT ON TABLE protese.categorias_custo IS 'Categorias de custo (centro de custo) para classificação de despesas';
COMMENT ON COLUMN protese.categorias_custo.nome IS 'Nome da categoria (ex: Marketing, Aluguel, Salários)';
COMMENT ON COLUMN protese.categorias_custo.codigo IS 'Código opcional para categorização (ex: MKT, ALU, SAL)';
COMMENT ON COLUMN protese.categorias_custo.tipo IS 'Tipo: despesa, receita ou ambos';

-- Permissões
GRANT ALL ON TABLE protese.categorias_custo TO protese_user;

