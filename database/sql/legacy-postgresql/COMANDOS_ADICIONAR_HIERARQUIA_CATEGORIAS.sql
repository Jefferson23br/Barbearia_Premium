-- Adicionar campos de hierarquia na tabela categorias_custo
-- Execute este script no PostgreSQL

-- Adicionar colunas de hierarquia
ALTER TABLE protese.categorias_custo
ADD COLUMN IF NOT EXISTS categoria_pai_id UUID,
ADD COLUMN IF NOT EXISTS nivel INTEGER DEFAULT 1 CHECK (nivel IN (1, 2, 3)),
ADD COLUMN IF NOT EXISTS codigo_hierarquico VARCHAR(50);

-- Adicionar foreign key para categoria pai
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_categorias_custo_pai' 
        AND table_schema = 'protese'
    ) THEN
        ALTER TABLE protese.categorias_custo
        ADD CONSTRAINT fk_categorias_custo_pai
        FOREIGN KEY (categoria_pai_id) 
        REFERENCES protese.categorias_custo(id) 
        ON DELETE CASCADE;
    END IF;
END $$;

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_categorias_custo_pai ON protese.categorias_custo(categoria_pai_id);
CREATE INDEX IF NOT EXISTS idx_categorias_custo_nivel ON protese.categorias_custo(nivel);
CREATE INDEX IF NOT EXISTS idx_categorias_custo_codigo_hierarquico ON protese.categorias_custo(codigo_hierarquico);

-- Comentários
COMMENT ON COLUMN protese.categorias_custo.categoria_pai_id IS 'ID da categoria pai (NULL para nível 1)';
COMMENT ON COLUMN protese.categorias_custo.nivel IS 'Nível da hierarquia: 1 (categoria), 2 (subcategoria), 3 (sub-subcategoria)';
COMMENT ON COLUMN protese.categorias_custo.codigo_hierarquico IS 'Código hierárquico (ex: 2, 2.1, 2.1.1)';

-- Atualizar categorias existentes para nível 1
UPDATE protese.categorias_custo 
SET nivel = 1, codigo_hierarquico = codigo 
WHERE nivel IS NULL OR codigo_hierarquico IS NULL;

-- Permissões
GRANT ALL ON TABLE protese.categorias_custo TO protese_user;

