-- ============================================================
-- TABELAS: assinaturas, assinaturas_servicos, assinaturas_produtos
-- Descrição: Sistema completo de assinaturas comercializáveis
-- ============================================================

-- Tabela principal de Assinaturas
CREATE TABLE IF NOT EXISTS protese.assinaturas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    preco_total DECIMAL(15, 2) NOT NULL DEFAULT 0.00, -- Soma de serviços e produtos
    valor_comercializado DECIMAL(15, 2) NOT NULL DEFAULT 0.00, -- Valor que será comercializado
    desconto_percentual DECIMAL(5, 2) DEFAULT 0.00, -- Desconto em porcentagem
    desconto_valor DECIMAL(15, 2) DEFAULT 0.00, -- Desconto em valor direto
    valor_liquido DECIMAL(15, 2) NOT NULL DEFAULT 0.00, -- Valor comercializado - descontos
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID,
    updated_by UUID
);

-- Tabela de Serviços da Assinatura
CREATE TABLE IF NOT EXISTS protese.assinaturas_servicos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assinatura_id UUID NOT NULL,
    servico_id UUID NOT NULL,
    quantidade INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_assinatura_servico_assinatura FOREIGN KEY (assinatura_id) REFERENCES protese.assinaturas(id) ON DELETE CASCADE,
    CONSTRAINT fk_assinatura_servico_servico FOREIGN KEY (servico_id) REFERENCES protese.servicos(id) ON DELETE RESTRICT,
    CONSTRAINT uq_assinatura_servico UNIQUE(assinatura_id, servico_id)
);

-- Tabela de Produtos da Assinatura
CREATE TABLE IF NOT EXISTS protese.assinaturas_produtos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assinatura_id UUID NOT NULL,
    produto_id UUID NOT NULL,
    quantidade INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_assinatura_produto_assinatura FOREIGN KEY (assinatura_id) REFERENCES protese.assinaturas(id) ON DELETE CASCADE,
    CONSTRAINT fk_assinatura_produto_produto FOREIGN KEY (produto_id) REFERENCES protese.produtos(id) ON DELETE RESTRICT,
    CONSTRAINT uq_assinatura_produto UNIQUE(assinatura_id, produto_id)
);

-- Tabela de Assinaturas dos Clientes (estoque de uso)
CREATE TABLE IF NOT EXISTS protese.assinaturas_clientes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assinatura_id UUID NOT NULL,
    cliente_id UUID NOT NULL,
    venda_id UUID, -- Venda que originou esta assinatura do cliente
    quantidade_servicos_restantes JSONB DEFAULT '{}', -- {servico_id: quantidade_restante}
    quantidade_produtos_restantes JSONB DEFAULT '{}', -- {produto_id: quantidade_restante}
    data_aquisicao DATE NOT NULL DEFAULT CURRENT_DATE,
    data_expiracao DATE, -- Opcional: data de expiração da assinatura
    status VARCHAR(50) DEFAULT 'ativa' CHECK (status IN ('ativa', 'expirada', 'consumida', 'cancelada')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_assinatura_cliente_assinatura FOREIGN KEY (assinatura_id) REFERENCES protese.assinaturas(id) ON DELETE RESTRICT,
    CONSTRAINT fk_assinatura_cliente_cliente FOREIGN KEY (cliente_id) REFERENCES protese.usuarios_clientes(id) ON DELETE CASCADE,
    CONSTRAINT fk_assinatura_cliente_venda FOREIGN KEY (venda_id) REFERENCES protese.vendas(id) ON DELETE SET NULL
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_assinaturas_nome ON protese.assinaturas(nome);
CREATE INDEX IF NOT EXISTS idx_assinaturas_is_active ON protese.assinaturas(is_active);
CREATE INDEX IF NOT EXISTS idx_assinaturas_created_at ON protese.assinaturas(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_assinaturas_servicos_assinatura ON protese.assinaturas_servicos(assinatura_id);
CREATE INDEX IF NOT EXISTS idx_assinaturas_servicos_servico ON protese.assinaturas_servicos(servico_id);

CREATE INDEX IF NOT EXISTS idx_assinaturas_produtos_assinatura ON protese.assinaturas_produtos(assinatura_id);
CREATE INDEX IF NOT EXISTS idx_assinaturas_produtos_produto ON protese.assinaturas_produtos(produto_id);

CREATE INDEX IF NOT EXISTS idx_assinaturas_clientes_assinatura ON protese.assinaturas_clientes(assinatura_id);
CREATE INDEX IF NOT EXISTS idx_assinaturas_clientes_cliente ON protese.assinaturas_clientes(cliente_id);
CREATE INDEX IF NOT EXISTS idx_assinaturas_clientes_venda ON protese.assinaturas_clientes(venda_id);
CREATE INDEX IF NOT EXISTS idx_assinaturas_clientes_status ON protese.assinaturas_clientes(status);
CREATE INDEX IF NOT EXISTS idx_assinaturas_clientes_data_expiracao ON protese.assinaturas_clientes(data_expiracao);

-- Trigger para atualizar updated_at em assinaturas
CREATE OR REPLACE FUNCTION protese.update_assinaturas_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_assinaturas_updated_at
    BEFORE UPDATE ON protese.assinaturas
    FOR EACH ROW
    EXECUTE FUNCTION protese.update_assinaturas_updated_at();

-- Trigger para atualizar updated_at em assinaturas_clientes
CREATE OR REPLACE FUNCTION protese.update_assinaturas_clientes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_assinaturas_clientes_updated_at
    BEFORE UPDATE ON protese.assinaturas_clientes
    FOR EACH ROW
    EXECUTE FUNCTION protese.update_assinaturas_clientes_updated_at();

-- Permissions
ALTER TABLE protese.assinaturas OWNER TO protese_user;
ALTER TABLE protese.assinaturas_servicos OWNER TO protese_user;
ALTER TABLE protese.assinaturas_produtos OWNER TO protese_user;
ALTER TABLE protese.assinaturas_clientes OWNER TO protese_user;

GRANT ALL ON TABLE protese.assinaturas TO protese_user;
GRANT ALL ON TABLE protese.assinaturas_servicos TO protese_user;
GRANT ALL ON TABLE protese.assinaturas_produtos TO protese_user;
GRANT ALL ON TABLE protese.assinaturas_clientes TO protese_user;

-- Comentários nas tabelas
COMMENT ON TABLE protese.assinaturas IS 'Tabela principal de assinaturas comercializáveis';
COMMENT ON COLUMN protese.assinaturas.preco_total IS 'Soma total dos preços dos serviços e produtos incluídos';
COMMENT ON COLUMN protese.assinaturas.valor_comercializado IS 'Valor que será comercializado (pode ser diferente do preço_total)';
COMMENT ON COLUMN protese.assinaturas.valor_liquido IS 'Valor comercializado após aplicação de descontos';

COMMENT ON TABLE protese.assinaturas_servicos IS 'Serviços incluídos em uma assinatura com suas quantidades';
COMMENT ON TABLE protese.assinaturas_produtos IS 'Produtos incluídos em uma assinatura com suas quantidades';
COMMENT ON TABLE protese.assinaturas_clientes IS 'Assinaturas adquiridas por clientes (estoque de uso)';
COMMENT ON COLUMN protese.assinaturas_clientes.quantidade_servicos_restantes IS 'Quantidades restantes de cada serviço da assinatura (JSON)';
COMMENT ON COLUMN protese.assinaturas_clientes.quantidade_produtos_restantes IS 'Quantidades restantes de cada produto da assinatura (JSON)';

