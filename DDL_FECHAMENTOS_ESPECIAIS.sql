-- protese.fechamentos_especiais definição
-- Tabela para armazenar datas de fechamento especiais (feriados, férias, etc.)

CREATE TABLE IF NOT EXISTS protese.fechamentos_especiais (
	id uuid DEFAULT gen_random_uuid() NOT NULL,
	data_fechamento date NOT NULL, -- Data do fechamento
	descricao varchar(255) NOT NULL, -- Descrição do motivo do fechamento (ex: "Feriado - Natal", "Férias coletivas")
	is_active bool DEFAULT true NULL, -- Se o fechamento está ativo
	created_at timestamp DEFAULT CURRENT_TIMESTAMP NULL,
	updated_at timestamp DEFAULT CURRENT_TIMESTAMP NULL,
	created_by uuid NULL, -- ID do usuário que criou
	updated_by uuid NULL, -- ID do usuário que atualizou
	CONSTRAINT fechamentos_especiais_pkey PRIMARY KEY (id),
	CONSTRAINT unique_fechamento_data UNIQUE (data_fechamento) -- Uma data só pode ter um fechamento
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_fechamentos_especiais_data ON protese.fechamentos_especiais USING btree (data_fechamento);
CREATE INDEX IF NOT EXISTS idx_fechamentos_especiais_ativo ON protese.fechamentos_especiais USING btree (is_active);
CREATE INDEX IF NOT EXISTS idx_fechamentos_especiais_data_ativo ON protese.fechamentos_especiais USING btree (data_fechamento, is_active);

-- Comentários
COMMENT ON TABLE protese.fechamentos_especiais IS 'Armazena datas de fechamento especiais da barbearia (feriados, férias, etc.)';
COMMENT ON COLUMN protese.fechamentos_especiais.data_fechamento IS 'Data do fechamento';
COMMENT ON COLUMN protese.fechamentos_especiais.descricao IS 'Descrição do motivo do fechamento';
COMMENT ON COLUMN protese.fechamentos_especiais.is_active IS 'Se o fechamento está ativo';

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION protese.update_fechamentos_especiais_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_fechamentos_especiais_updated_at
    BEFORE UPDATE ON protese.fechamentos_especiais
    FOR EACH ROW
    EXECUTE FUNCTION protese.update_fechamentos_especiais_updated_at();

-- Permissões
ALTER TABLE protese.fechamentos_especiais OWNER TO protese_user;
GRANT TRIGGER, DELETE, SELECT, INSERT, TRUNCATE, UPDATE, REFERENCES ON TABLE protese.fechamentos_especiais TO protese_user;

