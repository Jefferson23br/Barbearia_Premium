-- Script para criar tabela de Notas Fiscais
-- Execute este script no PostgreSQL antes de usar o módulo de Emissão de NFe

-- Criar tabela de notas fiscais
CREATE TABLE IF NOT EXISTS protese.notas_fiscais (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    venda_id UUID NOT NULL,
    romaneio_id UUID,
    numero VARCHAR(50) NOT NULL,
    serie VARCHAR(10) DEFAULT '1',
    chave_acesso VARCHAR(50) UNIQUE,
    status VARCHAR(20) DEFAULT 'pendente',
    xml_path TEXT,
    pdf_path TEXT,
    observacoes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID,
    updated_by UUID
);

-- Adicionar foreign keys após criar a tabela
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'fk_nota_fiscal_venda'
    ) THEN
        ALTER TABLE protese.notas_fiscais 
        ADD CONSTRAINT fk_nota_fiscal_venda 
        FOREIGN KEY (venda_id) REFERENCES protese.vendas(id) ON DELETE CASCADE;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'fk_nota_fiscal_romaneio'
    ) THEN
        ALTER TABLE protese.notas_fiscais 
        ADD CONSTRAINT fk_nota_fiscal_romaneio 
        FOREIGN KEY (romaneio_id) REFERENCES protese.romaneios(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Criar índices
CREATE INDEX IF NOT EXISTS idx_notas_fiscais_venda_id ON protese.notas_fiscais(venda_id);
CREATE INDEX IF NOT EXISTS idx_notas_fiscais_romaneio_id ON protese.notas_fiscais(romaneio_id);
CREATE INDEX IF NOT EXISTS idx_notas_fiscais_numero ON protese.notas_fiscais(numero);
CREATE INDEX IF NOT EXISTS idx_notas_fiscais_chave_acesso ON protese.notas_fiscais(chave_acesso);
CREATE INDEX IF NOT EXISTS idx_notas_fiscais_status ON protese.notas_fiscais(status);
CREATE INDEX IF NOT EXISTS idx_notas_fiscais_created_at ON protese.notas_fiscais(created_at);

-- Comentários
COMMENT ON TABLE protese.notas_fiscais IS 'Notas fiscais emitidas para vendas';
COMMENT ON COLUMN protese.notas_fiscais.venda_id IS 'ID da venda relacionada';
COMMENT ON COLUMN protese.notas_fiscais.romaneio_id IS 'ID do romaneio relacionado (opcional)';
COMMENT ON COLUMN protese.notas_fiscais.numero IS 'Número da nota fiscal';
COMMENT ON COLUMN protese.notas_fiscais.serie IS 'Série da nota fiscal';
COMMENT ON COLUMN protese.notas_fiscais.chave_acesso IS 'Chave de acesso da NFe';
COMMENT ON COLUMN protese.notas_fiscais.status IS 'Status da nota fiscal (pendente, emitida, cancelada, rejeitada)';
COMMENT ON COLUMN protese.notas_fiscais.xml_path IS 'Caminho do arquivo XML da nota fiscal';
COMMENT ON COLUMN protese.notas_fiscais.pdf_path IS 'Caminho do arquivo PDF da nota fiscal';

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION protese.atualizar_updated_at_notas_fiscais()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_atualizar_updated_at_notas_fiscais ON protese.notas_fiscais;
CREATE TRIGGER trigger_atualizar_updated_at_notas_fiscais
    BEFORE UPDATE ON protese.notas_fiscais
    FOR EACH ROW
    EXECUTE FUNCTION protese.atualizar_updated_at_notas_fiscais();

-- Permissões
ALTER TABLE protese.notas_fiscais OWNER TO protese_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE protese.notas_fiscais TO protese_user;

