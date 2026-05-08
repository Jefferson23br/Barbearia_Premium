-- ============================================================
-- TABELAS: contas (caixas) e movimentacoes_caixa
-- Descrição: Sistema de gerenciamento de contas bancárias e caixas
-- ============================================================

-- Tabela de Contas (Caixas)
CREATE TABLE IF NOT EXISTS protese.contas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR(255) NOT NULL,
    tipo VARCHAR(50) NOT NULL CHECK (tipo IN ('caixa', 'conta_corrente', 'poupanca', 'investimento', 'outro')),
    banco VARCHAR(255),
    agencia VARCHAR(20),
    conta VARCHAR(50),
    saldo_inicial DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    saldo_atual DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    descricao TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID,
    updated_by UUID,
    CONSTRAINT uq_contas_nome UNIQUE(nome)
);

-- Tabela de Movimentações de Caixa
CREATE TABLE IF NOT EXISTS protese.movimentacoes_caixa (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conta_id UUID NOT NULL,
    tipo_movimentacao VARCHAR(50) NOT NULL CHECK (tipo_movimentacao IN ('entrada', 'saida', 'transferencia', 'saldo_inicial')),
    conta_origem_id UUID, -- Para transferências
    conta_destino_id UUID, -- Para transferências
    valor DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    descricao TEXT NOT NULL,
    categoria VARCHAR(255),
    data_movimentacao DATE NOT NULL DEFAULT CURRENT_DATE,
    observacoes TEXT,
    referencia_id UUID, -- Para vincular com receitas/despesas futuras
    referencia_tipo VARCHAR(50), -- 'receita', 'despesa', etc.
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID,
    CONSTRAINT fk_movimentacao_conta FOREIGN KEY (conta_id) REFERENCES protese.contas(id) ON DELETE CASCADE,
    CONSTRAINT fk_movimentacao_conta_origem FOREIGN KEY (conta_origem_id) REFERENCES protese.contas(id) ON DELETE SET NULL,
    CONSTRAINT fk_movimentacao_conta_destino FOREIGN KEY (conta_destino_id) REFERENCES protese.contas(id) ON DELETE SET NULL,
    CONSTRAINT chk_transferencia CHECK (
        (tipo_movimentacao = 'transferencia' AND conta_origem_id IS NOT NULL AND conta_destino_id IS NOT NULL) OR
        (tipo_movimentacao != 'transferencia')
    )
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_contas_nome ON protese.contas(nome);
CREATE INDEX IF NOT EXISTS idx_contas_tipo ON protese.contas(tipo);
CREATE INDEX IF NOT EXISTS idx_contas_is_active ON protese.contas(is_active);
CREATE INDEX IF NOT EXISTS idx_movimentacoes_conta_id ON protese.movimentacoes_caixa(conta_id);
CREATE INDEX IF NOT EXISTS idx_movimentacoes_tipo ON protese.movimentacoes_caixa(tipo_movimentacao);
CREATE INDEX IF NOT EXISTS idx_movimentacoes_data ON protese.movimentacoes_caixa(data_movimentacao DESC);
CREATE INDEX IF NOT EXISTS idx_movimentacoes_referencia ON protese.movimentacoes_caixa(referencia_id, referencia_tipo);

-- Comentários
COMMENT ON TABLE protese.contas IS 'Contas bancárias e caixas do sistema';
COMMENT ON COLUMN protese.contas.nome IS 'Nome da conta/caixa';
COMMENT ON COLUMN protese.contas.tipo IS 'Tipo da conta: caixa, conta_corrente, poupanca, investimento, outro';
COMMENT ON COLUMN protese.contas.saldo_inicial IS 'Saldo inicial da conta';
COMMENT ON COLUMN protese.contas.saldo_atual IS 'Saldo atual da conta (atualizado automaticamente)';

COMMENT ON TABLE protese.movimentacoes_caixa IS 'Movimentações financeiras das contas';
COMMENT ON COLUMN protese.movimentacoes_caixa.tipo_movimentacao IS 'Tipo: entrada, saida, transferencia, saldo_inicial';
COMMENT ON COLUMN protese.movimentacoes_caixa.conta_origem_id IS 'Conta de origem (para transferências)';
COMMENT ON COLUMN protese.movimentacoes_caixa.conta_destino_id IS 'Conta de destino (para transferências)';
COMMENT ON COLUMN protese.movimentacoes_caixa.referencia_id IS 'ID de referência (para vincular com receitas/despesas)';
COMMENT ON COLUMN protese.movimentacoes_caixa.referencia_tipo IS 'Tipo de referência (receita, despesa, etc.)';

-- Trigger para atualizar updated_at na tabela contas
CREATE OR REPLACE FUNCTION protese.atualizar_updated_at_contas()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_atualizar_updated_at_contas ON protese.contas;
CREATE TRIGGER trigger_atualizar_updated_at_contas
    BEFORE UPDATE ON protese.contas
    FOR EACH ROW
    EXECUTE FUNCTION protese.atualizar_updated_at_contas();

-- Trigger para atualizar saldo da conta quando houver movimentação
CREATE OR REPLACE FUNCTION protese.atualizar_saldo_conta()
RETURNS TRIGGER AS $$
BEGIN
    -- Se for transferência, atualizar ambas as contas
    IF NEW.tipo_movimentacao = 'transferencia' THEN
        -- Debitar da conta origem
        UPDATE protese.contas
        SET saldo_atual = saldo_atual - NEW.valor,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = NEW.conta_origem_id;
        
        -- Creditar na conta destino (conta_id é a conta destino para transferências)
        UPDATE protese.contas
        SET saldo_atual = saldo_atual + NEW.valor,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = NEW.conta_id;
        
    ELSIF NEW.tipo_movimentacao = 'entrada' OR NEW.tipo_movimentacao = 'saldo_inicial' THEN
        -- Adicionar ao saldo
        UPDATE protese.contas
        SET saldo_atual = saldo_atual + NEW.valor,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = NEW.conta_id;
        
    ELSIF NEW.tipo_movimentacao = 'saida' THEN
        -- Subtrair do saldo
        UPDATE protese.contas
        SET saldo_atual = saldo_atual - NEW.valor,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = NEW.conta_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_atualizar_saldo_conta ON protese.movimentacoes_caixa;
CREATE TRIGGER trigger_atualizar_saldo_conta
    AFTER INSERT ON protese.movimentacoes_caixa
    FOR EACH ROW
    EXECUTE FUNCTION protese.atualizar_saldo_conta();

-- Trigger para reverter saldo quando uma movimentação for excluída
CREATE OR REPLACE FUNCTION protese.reverter_saldo_conta()
RETURNS TRIGGER AS $$
BEGIN
    -- Se for transferência, reverter ambas as contas
    IF OLD.tipo_movimentacao = 'transferencia' THEN
        -- Reverter na conta origem (adicionar de volta)
        UPDATE protese.contas
        SET saldo_atual = saldo_atual + OLD.valor,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = OLD.conta_origem_id;
        
        -- Reverter na conta destino (subtrair) - conta_id é a conta destino para transferências
        UPDATE protese.contas
        SET saldo_atual = saldo_atual - OLD.valor,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = OLD.conta_id;
        
    ELSIF OLD.tipo_movimentacao = 'entrada' OR OLD.tipo_movimentacao = 'saldo_inicial' THEN
        -- Reverter entrada (subtrair)
        UPDATE protese.contas
        SET saldo_atual = saldo_atual - OLD.valor,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = OLD.conta_id;
        
    ELSIF OLD.tipo_movimentacao = 'saida' THEN
        -- Reverter saída (adicionar de volta)
        UPDATE protese.contas
        SET saldo_atual = saldo_atual + OLD.valor,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = OLD.conta_id;
    END IF;
    
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_reverter_saldo_conta ON protese.movimentacoes_caixa;
CREATE TRIGGER trigger_reverter_saldo_conta
    AFTER DELETE ON protese.movimentacoes_caixa
    FOR EACH ROW
    EXECUTE FUNCTION protese.reverter_saldo_conta();

-- Permissions
ALTER TABLE protese.contas OWNER TO protese_user;
GRANT ALL ON TABLE protese.contas TO protese_user;

ALTER TABLE protese.movimentacoes_caixa OWNER TO protese_user;
GRANT ALL ON TABLE protese.movimentacoes_caixa TO protese_user;

