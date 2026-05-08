-- ============================================================
-- ADICIONAR ASSINATURAS AO SISTEMA DE VENDAS
-- Descrição: Cria tabela para vincular assinaturas às vendas
-- ============================================================

-- Tabela de Assinaturas da Venda
CREATE TABLE IF NOT EXISTS protese.vendas_assinaturas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    venda_id UUID NOT NULL,
    assinatura_id UUID NOT NULL,
    valor DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_venda_assinatura_venda FOREIGN KEY (venda_id) REFERENCES protese.vendas(id) ON DELETE CASCADE,
    CONSTRAINT fk_venda_assinatura_assinatura FOREIGN KEY (assinatura_id) REFERENCES protese.assinaturas(id) ON DELETE RESTRICT
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_vendas_assinaturas_venda ON protese.vendas_assinaturas(venda_id);
CREATE INDEX IF NOT EXISTS idx_vendas_assinaturas_assinatura ON protese.vendas_assinaturas(assinatura_id);

-- Comentários
COMMENT ON TABLE protese.vendas_assinaturas IS 'Assinaturas vinculadas a uma venda';

-- Permissions
ALTER TABLE protese.vendas_assinaturas OWNER TO protese_user;
GRANT ALL ON TABLE protese.vendas_assinaturas TO protese_user;

