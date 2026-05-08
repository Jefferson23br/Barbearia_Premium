-- Tabela para armazenar relacionamentos/interações do CRM
CREATE TABLE IF NOT EXISTS protese.crm_relacionamentos (
	id uuid DEFAULT gen_random_uuid() NOT NULL,
	cliente_id uuid NOT NULL,
	funcionario_id uuid NOT NULL,
	data_interacao date NOT NULL,
	tipo_interacao varchar(100) NOT NULL, -- Tipo: contato_telefonico, email, visita, reuniao, observacao, etc.
	descricao text NOT NULL,
	observacoes text NULL,
	created_at timestamp DEFAULT CURRENT_TIMESTAMP NULL,
	updated_at timestamp DEFAULT CURRENT_TIMESTAMP NULL,
	created_by uuid NULL,
	updated_by uuid NULL,
	CONSTRAINT crm_relacionamentos_pkey PRIMARY KEY (id),
	CONSTRAINT fk_crm_relacionamento_cliente FOREIGN KEY (cliente_id) REFERENCES protese.usuarios_clientes(id) ON DELETE CASCADE,
	CONSTRAINT fk_crm_relacionamento_funcionario FOREIGN KEY (funcionario_id) REFERENCES protese.usuarios_administrativos(id) ON DELETE RESTRICT
);

CREATE INDEX idx_crm_relacionamentos_cliente ON protese.crm_relacionamentos USING btree (cliente_id);
CREATE INDEX idx_crm_relacionamentos_funcionario ON protese.crm_relacionamentos USING btree (funcionario_id);
CREATE INDEX idx_crm_relacionamentos_data ON protese.crm_relacionamentos USING btree (data_interacao DESC);

COMMENT ON TABLE protese.crm_relacionamentos IS 'Registra interações e relacionamentos com clientes no CRM';

COMMENT ON COLUMN protese.crm_relacionamentos.tipo_interacao IS 'Tipo: contato_telefonico, email, visita, reuniao, observacao, etc.';

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION protese.update_crm_relacionamentos_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_crm_relacionamentos_updated_at
BEFORE UPDATE ON protese.crm_relacionamentos
FOR EACH ROW
EXECUTE FUNCTION protese.update_crm_relacionamentos_updated_at();

-- Permissions
ALTER TABLE protese.crm_relacionamentos OWNER TO protese_user;
GRANT ALL ON TABLE protese.crm_relacionamentos TO protese_user;

