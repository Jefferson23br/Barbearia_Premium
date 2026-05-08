-- ============================================================
-- TABELAS: vendas, vendas_servicos, vendas_produtos, vendas_parcelas
-- Descrição: Sistema completo de lançamento de vendas
-- ============================================================

-- Tabela principal de Vendas
CREATE TABLE IF NOT EXISTS protese.vendas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket VARCHAR(50) NOT NULL UNIQUE, -- Ex: 0001, 0001/01, 0001/02
    funcionario_id UUID NOT NULL,
    cliente_id UUID, -- Pode ser NULL se venda não vinculada a agendamento
    data_venda DATE NOT NULL DEFAULT CURRENT_DATE,
    valor_total DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    desconto_percentual DECIMAL(5, 2) DEFAULT 0.00, -- Desconto em porcentagem
    desconto_valor DECIMAL(15, 2) DEFAULT 0.00, -- Desconto em valor direto
    valor_liquido DECIMAL(15, 2) NOT NULL DEFAULT 0.00, -- Valor total - descontos
    forma_pagamento VARCHAR(50) NOT NULL, -- cartao_1x, cartao_2x, ..., boleto_1x, ..., dinheiro, pix, ted
    numero_parcelas INTEGER DEFAULT 1, -- Número de parcelas (1 para dinheiro, pix, ted)
    caixa_id UUID NOT NULL, -- Caixa selecionado
    observacoes TEXT,
    status VARCHAR(50) DEFAULT 'pendente' CHECK (status IN ('pendente', 'paga', 'cancelada', 'parcial')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID,
    updated_by UUID,
    CONSTRAINT fk_venda_funcionario FOREIGN KEY (funcionario_id) REFERENCES protese.usuarios_administrativos(id) ON DELETE RESTRICT,
    CONSTRAINT fk_venda_cliente FOREIGN KEY (cliente_id) REFERENCES protese.usuarios_clientes(id) ON DELETE SET NULL,
    CONSTRAINT fk_venda_caixa FOREIGN KEY (caixa_id) REFERENCES protese.contas(id) ON DELETE RESTRICT
);

-- Tabela de Serviços da Venda
CREATE TABLE IF NOT EXISTS protese.vendas_servicos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    venda_id UUID NOT NULL,
    servico_id UUID NOT NULL,
    agendamento_id UUID, -- Pode ser NULL se serviço não vinculado a agendamento
    valor DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_venda_servico_venda FOREIGN KEY (venda_id) REFERENCES protese.vendas(id) ON DELETE CASCADE,
    CONSTRAINT fk_venda_servico_servico FOREIGN KEY (servico_id) REFERENCES protese.servicos(id) ON DELETE RESTRICT,
    CONSTRAINT fk_venda_servico_agendamento FOREIGN KEY (agendamento_id) REFERENCES protese.agendamentos(id) ON DELETE SET NULL
);

-- Tabela de Produtos da Venda
CREATE TABLE IF NOT EXISTS protese.vendas_produtos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    venda_id UUID NOT NULL,
    produto_id UUID NOT NULL,
    quantidade INTEGER NOT NULL DEFAULT 1,
    valor_unitario DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    valor_total DECIMAL(15, 2) NOT NULL DEFAULT 0.00, -- quantidade * valor_unitario
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_venda_produto_venda FOREIGN KEY (venda_id) REFERENCES protese.vendas(id) ON DELETE CASCADE,
    CONSTRAINT fk_venda_produto_produto FOREIGN KEY (produto_id) REFERENCES protese.produtos(id) ON DELETE RESTRICT
);

-- Tabela de Parcelas da Venda
CREATE TABLE IF NOT EXISTS protese.vendas_parcelas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    venda_id UUID NOT NULL,
    numero_parcela INTEGER NOT NULL, -- 1, 2, 3, ...
    ticket_parcela VARCHAR(50) NOT NULL, -- Ex: 0001/01, 0001/02
    valor DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    data_vencimento DATE NOT NULL,
    data_pagamento DATE, -- NULL até ser paga
    status VARCHAR(50) DEFAULT 'pendente' CHECK (status IN ('pendente', 'paga', 'vencida', 'cancelada')),
    forma_pagamento VARCHAR(50) NOT NULL, -- Mesma da venda ou pode ser alterada
    caixa_id UUID, -- Caixa onde foi paga (NULL até ser paga)
    observacoes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID,
    updated_by UUID,
    CONSTRAINT fk_parcela_venda FOREIGN KEY (venda_id) REFERENCES protese.vendas(id) ON DELETE CASCADE,
    CONSTRAINT fk_parcela_caixa FOREIGN KEY (caixa_id) REFERENCES protese.contas(id) ON DELETE SET NULL,
    CONSTRAINT uq_parcela_ticket UNIQUE(ticket_parcela)
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_vendas_funcionario ON protese.vendas(funcionario_id);
CREATE INDEX IF NOT EXISTS idx_vendas_cliente ON protese.vendas(cliente_id);
CREATE INDEX IF NOT EXISTS idx_vendas_data ON protese.vendas(data_venda);
CREATE INDEX IF NOT EXISTS idx_vendas_ticket ON protese.vendas(ticket);
CREATE INDEX IF NOT EXISTS idx_vendas_caixa ON protese.vendas(caixa_id);
CREATE INDEX IF NOT EXISTS idx_vendas_status ON protese.vendas(status);

CREATE INDEX IF NOT EXISTS idx_vendas_servicos_venda ON protese.vendas_servicos(venda_id);
CREATE INDEX IF NOT EXISTS idx_vendas_servicos_servico ON protese.vendas_servicos(servico_id);
CREATE INDEX IF NOT EXISTS idx_vendas_servicos_agendamento ON protese.vendas_servicos(agendamento_id);

CREATE INDEX IF NOT EXISTS idx_vendas_produtos_venda ON protese.vendas_produtos(venda_id);
CREATE INDEX IF NOT EXISTS idx_vendas_produtos_produto ON protese.vendas_produtos(produto_id);

CREATE INDEX IF NOT EXISTS idx_vendas_parcelas_venda ON protese.vendas_parcelas(venda_id);
CREATE INDEX IF NOT EXISTS idx_vendas_parcelas_vencimento ON protese.vendas_parcelas(data_vencimento);
CREATE INDEX IF NOT EXISTS idx_vendas_parcelas_status ON protese.vendas_parcelas(status);
CREATE INDEX IF NOT EXISTS idx_vendas_parcelas_ticket ON protese.vendas_parcelas(ticket_parcela);

-- Trigger para atualizar updated_at em vendas
CREATE OR REPLACE FUNCTION protese.atualizar_updated_at_vendas()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_atualizar_updated_at_vendas ON protese.vendas;
CREATE TRIGGER trigger_atualizar_updated_at_vendas
    BEFORE UPDATE ON protese.vendas
    FOR EACH ROW
    EXECUTE FUNCTION protese.atualizar_updated_at_vendas();

-- Trigger para atualizar updated_at em vendas_parcelas
CREATE OR REPLACE FUNCTION protese.atualizar_updated_at_vendas_parcelas()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_atualizar_updated_at_vendas_parcelas ON protese.vendas_parcelas;
CREATE TRIGGER trigger_atualizar_updated_at_vendas_parcelas
    BEFORE UPDATE ON protese.vendas_parcelas
    FOR EACH ROW
    EXECUTE FUNCTION protese.atualizar_updated_at_vendas_parcelas();

-- Função para gerar próximo ticket de venda
CREATE OR REPLACE FUNCTION protese.gerar_proximo_ticket_venda()
RETURNS VARCHAR(50) AS $$
DECLARE
    ultimo_ticket VARCHAR(50);
    proximo_numero INTEGER;
    novo_ticket VARCHAR(50);
BEGIN
    -- Buscar o último ticket (apenas número base, sem /XX)
    -- Usar regex para extrair apenas o número base antes de qualquer /
    SELECT ticket INTO ultimo_ticket
    FROM protese.vendas
    WHERE ticket NOT LIKE '%/%'
    ORDER BY 
        CASE 
            WHEN ticket ~ '^[0-9]+$' THEN CAST(ticket AS INTEGER)
            ELSE 0
        END DESC,
        created_at DESC
    LIMIT 1;
    
    IF ultimo_ticket IS NULL THEN
        proximo_numero := 1;
    ELSE
        -- Extrair número do ticket (remover zeros à esquerda)
        -- Garantir que seja apenas números
        IF ultimo_ticket ~ '^[0-9]+$' THEN
            proximo_numero := CAST(ultimo_ticket AS INTEGER) + 1;
        ELSE
            -- Tentar extrair número do início
            proximo_numero := COALESCE(
                CAST(SUBSTRING(ultimo_ticket FROM '^([0-9]+)') AS INTEGER),
                0
            ) + 1;
        END IF;
    END IF;
    
    -- Se ainda for 0 ou NULL, começar em 1
    IF proximo_numero IS NULL OR proximo_numero <= 0 THEN
        proximo_numero := 1;
    END IF;
    
    -- Formatar com zeros à esquerda (4 dígitos)
    novo_ticket := LPAD(proximo_numero::TEXT, 4, '0');
    
    RETURN novo_ticket;
END;
$$ LANGUAGE plpgsql;

-- Permissions
ALTER TABLE protese.vendas OWNER TO protese_user;
GRANT ALL ON TABLE protese.vendas TO protese_user;

ALTER TABLE protese.vendas_servicos OWNER TO protese_user;
GRANT ALL ON TABLE protese.vendas_servicos TO protese_user;

ALTER TABLE protese.vendas_produtos OWNER TO protese_user;
GRANT ALL ON TABLE protese.vendas_produtos TO protese_user;

ALTER TABLE protese.vendas_parcelas OWNER TO protese_user;
GRANT ALL ON TABLE protese.vendas_parcelas TO protese_user;

-- Comentários nas tabelas
COMMENT ON TABLE protese.vendas IS 'Tabela principal de vendas';
COMMENT ON TABLE protese.vendas_servicos IS 'Serviços vinculados a uma venda';
COMMENT ON TABLE protese.vendas_produtos IS 'Produtos vinculados a uma venda';
COMMENT ON TABLE protese.vendas_parcelas IS 'Parcelas de pagamento de uma venda';

