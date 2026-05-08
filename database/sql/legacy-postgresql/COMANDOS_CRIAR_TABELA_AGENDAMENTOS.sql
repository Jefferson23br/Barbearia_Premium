-- ============================================================
-- CRIAÇÃO DA TABELA DE AGENDAMENTOS
-- ============================================================
-- Este script cria a tabela protese.agendamentos no PostgreSQL
-- que armazena os agendamentos de serviços da barbearia.
-- ============================================================

-- Criar tabela de agendamentos
CREATE TABLE IF NOT EXISTS protese.agendamentos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cliente_id UUID NOT NULL,
    funcionario_id UUID NOT NULL,
    servico_id UUID NOT NULL,
    data_agendamento DATE NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_fim TIME NOT NULL,
    status VARCHAR(20) DEFAULT 'agendado' CHECK (status IN ('agendado', 'confirmado', 'em_andamento', 'concluido', 'cancelado', 'nao_compareceu')),
    observacoes TEXT,
    valor_servico DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID,
    updated_by UUID,
    CONSTRAINT fk_cliente FOREIGN KEY (cliente_id) REFERENCES protese.usuarios_clientes(id) ON DELETE RESTRICT,
    CONSTRAINT fk_funcionario FOREIGN KEY (funcionario_id) REFERENCES protese.usuarios_administrativos(id) ON DELETE RESTRICT,
    CONSTRAINT fk_servico FOREIGN KEY (servico_id) REFERENCES protese.servicos(id) ON DELETE RESTRICT,
    CONSTRAINT check_hora_fim_maior_inicio CHECK (hora_fim > hora_inicio),
    CONSTRAINT unique_agendamento_funcionario_horario UNIQUE (funcionario_id, data_agendamento, hora_inicio)
);

-- Criar índices para melhorar performance
CREATE INDEX IF NOT EXISTS idx_agendamentos_cliente ON protese.agendamentos(cliente_id);
CREATE INDEX IF NOT EXISTS idx_agendamentos_funcionario ON protese.agendamentos(funcionario_id);
CREATE INDEX IF NOT EXISTS idx_agendamentos_servico ON protese.agendamentos(servico_id);
CREATE INDEX IF NOT EXISTS idx_agendamentos_data ON protese.agendamentos(data_agendamento);
CREATE INDEX IF NOT EXISTS idx_agendamentos_data_hora ON protese.agendamentos(data_agendamento, hora_inicio);
CREATE INDEX IF NOT EXISTS idx_agendamentos_data_funcionario ON protese.agendamentos(data_agendamento, funcionario_id);
CREATE INDEX IF NOT EXISTS idx_agendamentos_status ON protese.agendamentos(status);

-- Comentários na tabela
COMMENT ON TABLE protese.agendamentos IS 'Armazena os agendamentos de serviços da barbearia';
COMMENT ON COLUMN protese.agendamentos.cliente_id IS 'ID do cliente que fez o agendamento';
COMMENT ON COLUMN protese.agendamentos.funcionario_id IS 'ID do funcionário que irá realizar o serviço';
COMMENT ON COLUMN protese.agendamentos.servico_id IS 'ID do serviço a ser realizado';
COMMENT ON COLUMN protese.agendamentos.data_agendamento IS 'Data do agendamento';
COMMENT ON COLUMN protese.agendamentos.hora_inicio IS 'Hora de início do serviço';
COMMENT ON COLUMN protese.agendamentos.hora_fim IS 'Hora de término do serviço';
COMMENT ON COLUMN protese.agendamentos.status IS 'Status do agendamento: agendado, confirmado, em_andamento, concluido, cancelado, nao_compareceu';
COMMENT ON COLUMN protese.agendamentos.observacoes IS 'Observações sobre o agendamento';
COMMENT ON COLUMN protese.agendamentos.valor_servico IS 'Valor do serviço no momento do agendamento';

-- Criar função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION protese.update_agendamentos_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger para atualizar updated_at
DROP TRIGGER IF EXISTS trigger_update_agendamentos_updated_at ON protese.agendamentos;
CREATE TRIGGER trigger_update_agendamentos_updated_at
    BEFORE UPDATE ON protese.agendamentos
    FOR EACH ROW
    EXECUTE FUNCTION protese.update_agendamentos_updated_at();

-- Permissões
ALTER TABLE protese.agendamentos OWNER TO protese_user;
GRANT DELETE, TRIGGER, TRUNCATE, SELECT, REFERENCES, UPDATE, INSERT ON TABLE protese.agendamentos TO protese_user;

