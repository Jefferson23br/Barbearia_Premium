-- ============================================================
-- TABELA: logs_sistema
-- Descrição: Armazena logs de todas as ações importantes do sistema
-- ============================================================

CREATE TABLE IF NOT EXISTS protese.logs_sistema (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID NOT NULL,
    usuario_tipo VARCHAR(20) NOT NULL CHECK (usuario_tipo IN ('cliente', 'administrativo')),
    usuario_nome VARCHAR(255),
    acao VARCHAR(50) NOT NULL, -- 'criar', 'editar', 'excluir', 'visualizar', 'login', 'logout', 'venda', 'despesa', etc.
    modulo VARCHAR(50) NOT NULL, -- 'funcionario', 'cliente', 'venda', 'despesa', 'agendamento', 'permissao', etc.
    entidade_id UUID, -- ID da entidade afetada (opcional)
    entidade_tipo VARCHAR(50), -- Tipo da entidade (opcional)
    descricao TEXT, -- Descrição detalhada da ação
    dados_anteriores JSONB, -- Dados antes da alteração (para edições)
    dados_novos JSONB, -- Dados após a alteração (para edições/criações)
    ip_address VARCHAR(45), -- IP do usuário
    user_agent TEXT, -- User agent do navegador
    status VARCHAR(20) DEFAULT 'sucesso', -- 'sucesso', 'erro', 'cancelado'
    mensagem_erro TEXT, -- Mensagem de erro (se status = 'erro')
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_logs_sistema_usuario_id ON protese.logs_sistema(usuario_id);
CREATE INDEX IF NOT EXISTS idx_logs_sistema_usuario_tipo ON protese.logs_sistema(usuario_tipo);
CREATE INDEX IF NOT EXISTS idx_logs_sistema_acao ON protese.logs_sistema(acao);
CREATE INDEX IF NOT EXISTS idx_logs_sistema_modulo ON protese.logs_sistema(modulo);
CREATE INDEX IF NOT EXISTS idx_logs_sistema_created_at ON protese.logs_sistema(created_at);
CREATE INDEX IF NOT EXISTS idx_logs_sistema_entidade ON protese.logs_sistema(entidade_id, entidade_tipo);
CREATE INDEX IF NOT EXISTS idx_logs_sistema_status ON protese.logs_sistema(status);

-- Índice composto para consultas frequentes
CREATE INDEX IF NOT EXISTS idx_logs_sistema_modulo_acao ON protese.logs_sistema(modulo, acao);
CREATE INDEX IF NOT EXISTS idx_logs_sistema_data_modulo ON protese.logs_sistema(created_at DESC, modulo);

-- Comentários
COMMENT ON TABLE protese.logs_sistema IS 'Registra todas as ações importantes realizadas no sistema';
COMMENT ON COLUMN protese.logs_sistema.usuario_id IS 'ID do usuário que realizou a ação';
COMMENT ON COLUMN protese.logs_sistema.usuario_tipo IS 'Tipo do usuário: cliente ou administrativo';
COMMENT ON COLUMN protese.logs_sistema.acao IS 'Tipo de ação: criar, editar, excluir, visualizar, etc.';
COMMENT ON COLUMN protese.logs_sistema.modulo IS 'Módulo onde a ação foi realizada: funcionario, cliente, venda, etc.';
COMMENT ON COLUMN protese.logs_sistema.entidade_id IS 'ID da entidade afetada pela ação';
COMMENT ON COLUMN protese.logs_sistema.entidade_tipo IS 'Tipo da entidade afetada';
COMMENT ON COLUMN protese.logs_sistema.dados_anteriores IS 'Dados antes da alteração (JSON)';
COMMENT ON COLUMN protese.logs_sistema.dados_novos IS 'Dados após a alteração (JSON)';
COMMENT ON COLUMN protese.logs_sistema.status IS 'Status da ação: sucesso, erro, cancelado';






