-- ============================================================
-- TABELA: servicos
-- Descrição: Armazena os serviços oferecidos pela barbearia
-- ============================================================

CREATE TABLE IF NOT EXISTS protese.servicos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    preco DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    duracao_minutos INTEGER DEFAULT 30,
    categoria VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_servicos_nome ON protese.servicos(nome);
CREATE INDEX IF NOT EXISTS idx_servicos_categoria ON protese.servicos(categoria);
CREATE INDEX IF NOT EXISTS idx_servicos_is_active ON protese.servicos(is_active);
CREATE INDEX IF NOT EXISTS idx_servicos_created_at ON protese.servicos(created_at DESC);

-- Comentários
COMMENT ON TABLE protese.servicos IS 'Armazena os serviços oferecidos pela barbearia';
COMMENT ON COLUMN protese.servicos.nome IS 'Nome do serviço';
COMMENT ON COLUMN protese.servicos.descricao IS 'Descrição detalhada do serviço';
COMMENT ON COLUMN protese.servicos.preco IS 'Preço do serviço em reais (R$)';
COMMENT ON COLUMN protese.servicos.duracao_minutos IS 'Duração estimada do serviço em minutos';
COMMENT ON COLUMN protese.servicos.categoria IS 'Categoria do serviço (ex: Corte, Barba, Tratamento, etc.)';
COMMENT ON COLUMN protese.servicos.is_active IS 'Indica se o serviço está ativo e disponível';











