-- ============================================================
-- TABELA: permissoes_usuarios
-- Descrição: Armazena as permissões granulares de cada usuário administrativo
-- ============================================================

CREATE TABLE IF NOT EXISTS protese.permissoes_usuarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID NOT NULL,
    
    -- Dashboard
    dashboard_ver BOOLEAN DEFAULT false,
    
    -- Agenda
    agenda_ver BOOLEAN DEFAULT false,
    agenda_editar BOOLEAN DEFAULT false,
    agenda_excluir BOOLEAN DEFAULT false,
    
    -- Lançamento de Venda
    lancamento_venda_ver BOOLEAN DEFAULT false,
    lancamento_venda_editar BOOLEAN DEFAULT false,
    lancamento_venda_excluir BOOLEAN DEFAULT false,
    
    -- Lançamento de Despesa
    lancamento_despesa_ver BOOLEAN DEFAULT false,
    lancamento_despesa_editar BOOLEAN DEFAULT false,
    lancamento_despesa_excluir BOOLEAN DEFAULT false,
    
    -- Receitas
    receitas_ver BOOLEAN DEFAULT false,
    receitas_editar BOOLEAN DEFAULT false,
    receitas_excluir BOOLEAN DEFAULT false,
    
    -- Despesas
    despesas_ver BOOLEAN DEFAULT false,
    despesas_editar BOOLEAN DEFAULT false,
    despesas_excluir BOOLEAN DEFAULT false,
    
    -- Faturamento
    faturamento_ver BOOLEAN DEFAULT false,
    faturamento_editar BOOLEAN DEFAULT false,
    faturamento_excluir BOOLEAN DEFAULT false,
    
    -- Usuários (Clientes)
    usuarios_ver BOOLEAN DEFAULT false,
    usuarios_editar BOOLEAN DEFAULT false,
    usuarios_excluir BOOLEAN DEFAULT false,
    
    -- Funcionários
    funcionarios_ver BOOLEAN DEFAULT false,
    funcionarios_editar BOOLEAN DEFAULT false,
    funcionarios_excluir BOOLEAN DEFAULT false,
    
    -- Controle de Acessos (apenas visualização)
    controle_acessos_ver BOOLEAN DEFAULT false,
    
    -- Controle de Logs (apenas visualização)
    controle_logs_ver BOOLEAN DEFAULT false,
    
    -- Help Desk
    help_desk_ver BOOLEAN DEFAULT false,
    help_desk_editar BOOLEAN DEFAULT false,
    help_desk_excluir BOOLEAN DEFAULT false,
    
    -- Controle de Permissões (Master apenas)
    controle_permissoes_ver BOOLEAN DEFAULT false,
    controle_permissoes_editar BOOLEAN DEFAULT false,
    controle_permissoes_excluir BOOLEAN DEFAULT false,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT permissoes_usuarios_usuario_id_fkey 
        FOREIGN KEY (usuario_id) 
        REFERENCES protese.usuarios_administrativos(id) 
        ON DELETE CASCADE
);

-- Constraint UNIQUE para garantir que cada usuário tenha apenas um registro de permissões
ALTER TABLE protese.permissoes_usuarios 
ADD CONSTRAINT permissoes_usuarios_usuario_id_key UNIQUE(usuario_id);

-- Índice para melhor performance
CREATE INDEX IF NOT EXISTS idx_permissoes_usuario_id ON protese.permissoes_usuarios(usuario_id);

-- Comentários
COMMENT ON TABLE protese.permissoes_usuarios IS 'Armazena as permissões granulares de cada usuário administrativo';
COMMENT ON COLUMN protese.permissoes_usuarios.usuario_id IS 'ID do usuário administrativo (FK para usuarios_administrativos.id)';
COMMENT ON COLUMN protese.permissoes_usuarios.dashboard_ver IS 'Permissão para visualizar o dashboard';
COMMENT ON COLUMN protese.permissoes_usuarios.controle_permissoes_ver IS 'Permissão para visualizar controle de permissões (Master apenas)';






















