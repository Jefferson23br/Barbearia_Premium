-- Tabela de Romaneios de Faturamento
CREATE TABLE IF NOT EXISTS protese.romaneios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    numero_romaneio VARCHAR(50) NOT NULL UNIQUE,
    tipo_romaneio VARCHAR(50) NOT NULL CHECK (tipo_romaneio IN ('faturamento', 'estoque', 'despesa', 'misto')),
    data_romaneio DATE NOT NULL DEFAULT CURRENT_DATE,
    descricao TEXT,
    observacoes TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'fechado' CHECK (status IN ('aberto', 'fechado', 'cancelado')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID,
    updated_by UUID
);

-- Tabela de Itens do Romaneio (vincula movimentações ao romaneio)
CREATE TABLE IF NOT EXISTS protese.romaneios_itens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    romaneio_id UUID NOT NULL REFERENCES protese.romaneios(id) ON DELETE CASCADE,
    tipo_movimentacao VARCHAR(50) NOT NULL CHECK (tipo_movimentacao IN ('venda', 'despesa', 'estoque')),
    movimentacao_id UUID NOT NULL, -- ID da venda, despesa ou estoque_movimentacao
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID,
    UNIQUE (romaneio_id, tipo_movimentacao, movimentacao_id)
);

-- Função para gerar próximo número de romaneio
CREATE OR REPLACE FUNCTION protese.gerar_proximo_numero_romaneio()
RETURNS VARCHAR AS $$
DECLARE
    proximo_numero INTEGER;
    numero_gerado VARCHAR(50);
    ano_atual VARCHAR(4);
    ultimo_numero_text VARCHAR(50);
BEGIN
    ano_atual := EXTRACT(YEAR FROM CURRENT_DATE)::VARCHAR;
    
    -- Buscar o último número do ano atual
    SELECT numero_romaneio INTO ultimo_numero_text
    FROM protese.romaneios
    WHERE numero_romaneio LIKE 'ROM-' || ano_atual || '-%'
    ORDER BY numero_romaneio DESC
    LIMIT 1;
    
    IF ultimo_numero_text IS NULL THEN
        proximo_numero := 1;
    ELSE
        -- Extrair o número após o ano (ex: ROM-2025-000001 -> 1)
        BEGIN
            proximo_numero := CAST(SUBSTRING(ultimo_numero_text FROM 'ROM-' || ano_atual || '-(.+)$') AS INTEGER) + 1;
        EXCEPTION
            WHEN OTHERS THEN
                proximo_numero := 1;
        END;
    END IF;
    
    -- Formatar: ROM-YYYY-000001
    numero_gerado := 'ROM-' || ano_atual || '-' || LPAD(proximo_numero::TEXT, 6, '0');
    
    RETURN numero_gerado;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION protese.atualizar_updated_at_romaneios()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_atualizar_updated_at_romaneios ON protese.romaneios;
CREATE TRIGGER trigger_atualizar_updated_at_romaneios
    BEFORE UPDATE ON protese.romaneios
    FOR EACH ROW
    EXECUTE FUNCTION protese.atualizar_updated_at_romaneios();

-- Índices
CREATE INDEX IF NOT EXISTS idx_romaneios_numero ON protese.romaneios(numero_romaneio);
CREATE INDEX IF NOT EXISTS idx_romaneios_data ON protese.romaneios(data_romaneio DESC);
CREATE INDEX IF NOT EXISTS idx_romaneios_tipo ON protese.romaneios(tipo_romaneio);
CREATE INDEX IF NOT EXISTS idx_romaneios_status ON protese.romaneios(status);
CREATE INDEX IF NOT EXISTS idx_romaneios_itens_romaneio ON protese.romaneios_itens(romaneio_id);
CREATE INDEX IF NOT EXISTS idx_romaneios_itens_movimentacao ON protese.romaneios_itens(tipo_movimentacao, movimentacao_id);

-- Comentários
COMMENT ON TABLE protese.romaneios IS 'Romaneios de faturamento, estoque ou despesas';
COMMENT ON TABLE protese.romaneios_itens IS 'Itens vinculados a um romaneio (vendas, despesas ou movimentações de estoque)';
COMMENT ON COLUMN protese.romaneios.tipo_romaneio IS 'Tipo: faturamento (vendas), estoque, despesa ou misto';
COMMENT ON COLUMN protese.romaneios_itens.tipo_movimentacao IS 'Tipo: venda, despesa ou estoque';
COMMENT ON COLUMN protese.romaneios_itens.movimentacao_id IS 'ID da venda, despesa ou estoque_movimentacao';

-- Permissões
GRANT ALL ON TABLE protese.romaneios TO protese_user;
GRANT ALL ON TABLE protese.romaneios_itens TO protese_user;

