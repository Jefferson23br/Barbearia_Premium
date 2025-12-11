-- ============================================================
-- TABELA: servicos_imagens
-- Descrição: Armazena as imagens dos serviços (até 3 por serviço)
-- ============================================================

CREATE TABLE IF NOT EXISTS protese.servicos_imagens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    servico_id UUID NOT NULL,
    url_imagem TEXT NOT NULL,
    nome_arquivo VARCHAR(255) NOT NULL,
    is_capa BOOLEAN DEFAULT false,
    ordem INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_servico_imagem 
        FOREIGN KEY (servico_id) 
        REFERENCES protese.servicos(id) 
        ON DELETE CASCADE
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_servicos_imagens_servico_id ON protese.servicos_imagens(servico_id);
CREATE INDEX IF NOT EXISTS idx_servicos_imagens_is_capa ON protese.servicos_imagens(servico_id, is_capa) WHERE is_capa = true;
CREATE INDEX IF NOT EXISTS idx_servicos_imagens_ordem ON protese.servicos_imagens(servico_id, ordem);

-- Constraint para garantir apenas uma capa por serviço
CREATE UNIQUE INDEX IF NOT EXISTS idx_servicos_imagens_unica_capa 
ON protese.servicos_imagens(servico_id) 
WHERE is_capa = true;

-- Constraint para limitar a 3 imagens por serviço (através de trigger)
CREATE OR REPLACE FUNCTION protese.verificar_limite_imagens_servico()
RETURNS TRIGGER AS $$
DECLARE
    total_imagens INTEGER;
BEGIN
    SELECT COUNT(*) INTO total_imagens
    FROM protese.servicos_imagens
    WHERE servico_id = NEW.servico_id;
    
    IF total_imagens >= 3 THEN
        RAISE EXCEPTION 'Limite de 3 imagens por serviço atingido';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_verificar_limite_imagens_servico ON protese.servicos_imagens;
CREATE TRIGGER trigger_verificar_limite_imagens_servico
    BEFORE INSERT ON protese.servicos_imagens
    FOR EACH ROW
    EXECUTE FUNCTION protese.verificar_limite_imagens_servico();

-- Comentários
COMMENT ON TABLE protese.servicos_imagens IS 'Armazena as imagens dos serviços (máximo 3 por serviço)';
COMMENT ON COLUMN protese.servicos_imagens.url_imagem IS 'URL completa da imagem armazenada';
COMMENT ON COLUMN protese.servicos_imagens.is_capa IS 'Indica se a imagem é a capa do serviço (primeira imagem automaticamente)';
COMMENT ON COLUMN protese.servicos_imagens.ordem IS 'Ordem de exibição das imagens';






