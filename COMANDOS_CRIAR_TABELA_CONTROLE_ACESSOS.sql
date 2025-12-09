-- ============================================================
-- TABELA: controle_acessos
-- Descrição: Registra cada acesso/login de usuários (clientes e administrativos)
-- ============================================================

CREATE TABLE IF NOT EXISTS protese.controle_acessos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID NOT NULL,
    usuario_tipo VARCHAR(50) NOT NULL, -- 'cliente' ou 'administrativo'
    data_acesso DATE NOT NULL,
    quantidade_login INTEGER DEFAULT 1,
    primeiro_acesso TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ultimo_acesso TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraint UNIQUE: um registro por usuário por dia
    CONSTRAINT unique_acesso_por_dia UNIQUE (usuario_id, usuario_tipo, data_acesso)
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_controle_acessos_usuario_id ON protese.controle_acessos(usuario_id);
CREATE INDEX IF NOT EXISTS idx_controle_acessos_data_acesso ON protese.controle_acessos(data_acesso);
CREATE INDEX IF NOT EXISTS idx_controle_acessos_usuario_tipo ON protese.controle_acessos(usuario_tipo);
CREATE INDEX IF NOT EXISTS idx_controle_acessos_usuario_data ON protese.controle_acessos(usuario_id, data_acesso);

-- Comentários
COMMENT ON TABLE protese.controle_acessos IS 'Registra cada acesso/login de usuários (clientes e administrativos)';
COMMENT ON COLUMN protese.controle_acessos.usuario_id IS 'ID do usuário (pode ser cliente ou administrativo)';
COMMENT ON COLUMN protese.controle_acessos.usuario_tipo IS 'Tipo do usuário: cliente ou administrativo';
COMMENT ON COLUMN protese.controle_acessos.data_acesso IS 'Data do acesso (um registro por usuário por dia)';
COMMENT ON COLUMN protese.controle_acessos.quantidade_login IS 'Quantidade de logins no dia';
COMMENT ON COLUMN protese.controle_acessos.primeiro_acesso IS 'Timestamp do primeiro login do dia';
COMMENT ON COLUMN protese.controle_acessos.ultimo_acesso IS 'Timestamp do último login do dia';





