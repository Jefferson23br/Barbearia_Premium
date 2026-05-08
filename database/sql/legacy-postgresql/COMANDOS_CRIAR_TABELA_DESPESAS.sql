-- Tabela principal de Despesas
CREATE TABLE IF NOT EXISTS protese.despesas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket VARCHAR(50) NOT NULL UNIQUE,
    data_emissao DATE NOT NULL DEFAULT CURRENT_DATE,
    data_vencimento DATE NOT NULL,
    data_pagamento DATE, -- Opcional, se já foi pago no ato do lançamento
    fornecedor VARCHAR(255) NOT NULL,
    descricao TEXT NOT NULL,
    categoria_custo_id UUID, -- Será criada no módulo de Balanço Demonstrativo
    valor_bruto DECIMAL(15, 2) NOT NULL,
    valor_liquido DECIMAL(15, 2) NOT NULL,
    forma_pagamento VARCHAR(50) NOT NULL,
    numero_parcelas INTEGER NOT NULL DEFAULT 1,
    caixa_id UUID REFERENCES protese.contas(id), -- Caixa onde o pagamento foi registrado
    observacoes TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'paga', 'cancelada', 'parcial')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID,
    updated_by UUID
);

-- Tabela de Parcelas da Despesa
CREATE TABLE IF NOT EXISTS protese.despesas_parcelas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    despesa_id UUID NOT NULL REFERENCES protese.despesas(id) ON DELETE CASCADE,
    numero_parcela INTEGER NOT NULL,
    ticket_parcela VARCHAR(50) NOT NULL UNIQUE, -- Ex: 0001/01 - 0001/02
    valor DECIMAL(15, 2) NOT NULL,
    data_vencimento DATE NOT NULL,
    data_pagamento DATE, -- Data em que foi pago
    valor_pago DECIMAL(15, 2) DEFAULT 0.00,
    forma_pagamento VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'paga', 'vencida', 'parcial', 'cancelada')),
    observacoes TEXT,
    caixa_id UUID REFERENCES protese.contas(id), -- Caixa onde esta parcela foi paga
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID,
    updated_by UUID,
    CONSTRAINT uq_despesa_parcela UNIQUE (despesa_id, numero_parcela)
);

-- Função para gerar próximo ticket de despesa
CREATE OR REPLACE FUNCTION protese.gerar_proximo_ticket_despesa()
RETURNS VARCHAR(50) AS $$
DECLARE
    ultimo_ticket VARCHAR(50);
    proximo_numero INTEGER;
    novo_ticket VARCHAR(50);
BEGIN
    -- Buscar o último ticket (apenas número base, sem /XX)
    SELECT ticket INTO ultimo_ticket
    FROM protese.despesas
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
        -- Extrair número do ticket
        IF ultimo_ticket ~ '^[0-9]+$' THEN
            proximo_numero := CAST(ultimo_ticket AS INTEGER) + 1;
        ELSE
            proximo_numero := COALESCE(
                CAST(SUBSTRING(ultimo_ticket FROM '^([0-9]+)') AS INTEGER),
                0
            ) + 1;
        END IF;
    END IF;
    
    IF proximo_numero IS NULL OR proximo_numero <= 0 THEN
        proximo_numero := 1;
    END IF;
    
    -- Formatar com zeros à esquerda (4 dígitos)
    novo_ticket := LPAD(proximo_numero::TEXT, 4, '0');
    
    RETURN novo_ticket;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION protese.atualizar_updated_at_despesas()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_atualizar_updated_at_despesas ON protese.despesas;
CREATE TRIGGER trigger_atualizar_updated_at_despesas
    BEFORE UPDATE ON protese.despesas
    FOR EACH ROW
    EXECUTE FUNCTION protese.atualizar_updated_at_despesas();

-- Trigger para atualizar updated_at das parcelas
CREATE OR REPLACE FUNCTION protese.atualizar_updated_at_despesas_parcelas()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_atualizar_updated_at_despesas_parcelas ON protese.despesas_parcelas;
CREATE TRIGGER trigger_atualizar_updated_at_despesas_parcelas
    BEFORE UPDATE ON protese.despesas_parcelas
    FOR EACH ROW
    EXECUTE FUNCTION protese.atualizar_updated_at_despesas_parcelas();

-- Índices
CREATE INDEX IF NOT EXISTS idx_despesas_data_vencimento ON protese.despesas(data_vencimento);
CREATE INDEX IF NOT EXISTS idx_despesas_data_pagamento ON protese.despesas(data_pagamento);
CREATE INDEX IF NOT EXISTS idx_despesas_status ON protese.despesas(status);
CREATE INDEX IF NOT EXISTS idx_despesas_fornecedor ON protese.despesas(fornecedor);
CREATE INDEX IF NOT EXISTS idx_despesas_parcelas_despesa_id ON protese.despesas_parcelas(despesa_id);
CREATE INDEX IF NOT EXISTS idx_despesas_parcelas_data_vencimento ON protese.despesas_parcelas(data_vencimento);

-- Comentários
COMMENT ON TABLE protese.despesas IS 'Tabela principal de despesas';
COMMENT ON TABLE protese.despesas_parcelas IS 'Parcelas das despesas';
COMMENT ON COLUMN protese.despesas.ticket IS 'Ticket único da despesa (ex: 0001, 0001/01)';
COMMENT ON COLUMN protese.despesas.data_pagamento IS 'Data de pagamento se já foi pago no ato do lançamento';
COMMENT ON COLUMN protese.despesas.categoria_custo_id IS 'Categoria de custo (será criada no módulo de Balanço Demonstrativo)';

-- Permissões
GRANT ALL ON TABLE protese.despesas TO protese_user;
GRANT ALL ON TABLE protese.despesas_parcelas TO protese_user;

