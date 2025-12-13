-- ============================================================
-- TABELA: receitas
-- Descrição: Sistema de receitas geradas a partir de vendas
-- ============================================================

-- Tabela de Receitas
CREATE TABLE IF NOT EXISTS protese.receitas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_venda VARCHAR(50) NOT NULL, -- Ticket da venda (ex: 0001, 0001/01)
    parcela_id UUID, -- ID da parcela da venda (se houver)
    venda_id UUID NOT NULL, -- ID da venda
    cliente_id UUID, -- Cliente da venda
    forma_pagamento VARCHAR(50) NOT NULL, -- cartao_1x, boleto_2x, dinheiro, pix, ted
    caixa_id UUID, -- Caixa onde será pago (pode ser NULL até efetivar)
    data_emissao DATE NOT NULL DEFAULT CURRENT_DATE, -- Data da venda
    data_vencimento DATE NOT NULL, -- Data de vencimento da parcela
    data_pagamento DATE, -- NULL até ser paga
    valor_vencimento DECIMAL(15, 2) NOT NULL DEFAULT 0.00, -- Valor original da parcela
    valor_pago DECIMAL(15, 2) DEFAULT 0.00, -- Valor efetivamente pago (pode ser diferente se houver desconto/juros)
    status VARCHAR(50) DEFAULT 'pendente' CHECK (status IN ('pendente', 'paga', 'vencida', 'cancelada', 'parcial')),
    observacoes TEXT,
    movimentacao_caixa_id UUID, -- ID da movimentação criada quando paga (NULL até ser paga)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID,
    updated_by UUID,
    CONSTRAINT fk_receita_venda FOREIGN KEY (venda_id) REFERENCES protese.vendas(id) ON DELETE CASCADE,
    CONSTRAINT fk_receita_parcela FOREIGN KEY (parcela_id) REFERENCES protese.vendas_parcelas(id) ON DELETE SET NULL,
    CONSTRAINT fk_receita_cliente FOREIGN KEY (cliente_id) REFERENCES protese.usuarios_clientes(id) ON DELETE SET NULL,
    CONSTRAINT fk_receita_caixa FOREIGN KEY (caixa_id) REFERENCES protese.contas(id) ON DELETE SET NULL,
    CONSTRAINT fk_receita_movimentacao FOREIGN KEY (movimentacao_caixa_id) REFERENCES protese.movimentacoes_caixa(id) ON DELETE SET NULL
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_receitas_venda ON protese.receitas(venda_id);
CREATE INDEX IF NOT EXISTS idx_receitas_parcela ON protese.receitas(parcela_id);
CREATE INDEX IF NOT EXISTS idx_receitas_cliente ON protese.receitas(cliente_id);
CREATE INDEX IF NOT EXISTS idx_receitas_caixa ON protese.receitas(caixa_id);
CREATE INDEX IF NOT EXISTS idx_receitas_status ON protese.receitas(status);
CREATE INDEX IF NOT EXISTS idx_receitas_vencimento ON protese.receitas(data_vencimento);
CREATE INDEX IF NOT EXISTS idx_receitas_ticket ON protese.receitas(ticket_venda);
CREATE INDEX IF NOT EXISTS idx_receitas_pagamento ON protese.receitas(data_pagamento);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION protese.atualizar_updated_at_receitas()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_atualizar_updated_at_receitas ON protese.receitas;
CREATE TRIGGER trigger_atualizar_updated_at_receitas
    BEFORE UPDATE ON protese.receitas
    FOR EACH ROW
    EXECUTE FUNCTION protese.atualizar_updated_at_receitas();

-- Trigger para atualizar status baseado em data_pagamento e valor_pago
CREATE OR REPLACE FUNCTION protese.atualizar_status_receita()
RETURNS TRIGGER AS $$
BEGIN
    -- Se tem data de pagamento e valor pago >= valor vencimento, está paga
    IF NEW.data_pagamento IS NOT NULL AND NEW.valor_pago >= NEW.valor_vencimento THEN
        NEW.status = 'paga';
    -- Se tem data de pagamento mas valor pago < valor vencimento, está parcial
    ELSIF NEW.data_pagamento IS NOT NULL AND NEW.valor_pago > 0 AND NEW.valor_pago < NEW.valor_vencimento THEN
        NEW.status = 'parcial';
    -- Se não tem data de pagamento e já passou do vencimento, está vencida
    ELSIF NEW.data_pagamento IS NULL AND NEW.data_vencimento < CURRENT_DATE THEN
        NEW.status = 'vencida';
    -- Se não tem data de pagamento e ainda não venceu, está pendente
    ELSIF NEW.data_pagamento IS NULL AND NEW.data_vencimento >= CURRENT_DATE THEN
        NEW.status = 'pendente';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_atualizar_status_receita ON protese.receitas;
CREATE TRIGGER trigger_atualizar_status_receita
    BEFORE INSERT OR UPDATE ON protese.receitas
    FOR EACH ROW
    EXECUTE FUNCTION protese.atualizar_status_receita();

-- Permissions
ALTER TABLE protese.receitas OWNER TO protese_user;
GRANT ALL ON TABLE protese.receitas TO protese_user;

-- Comentários
COMMENT ON TABLE protese.receitas IS 'Receitas geradas a partir de vendas';
COMMENT ON COLUMN protese.receitas.ticket_venda IS 'Ticket da venda/parcela (ex: 0001, 0001/01)';
COMMENT ON COLUMN protese.receitas.parcela_id IS 'ID da parcela da venda (NULL se venda à vista)';
COMMENT ON COLUMN protese.receitas.valor_vencimento IS 'Valor original da parcela';
COMMENT ON COLUMN protese.receitas.valor_pago IS 'Valor efetivamente pago (pode ser diferente se houver desconto/juros)';
COMMENT ON COLUMN protese.receitas.movimentacao_caixa_id IS 'ID da movimentação criada quando a receita é paga';

