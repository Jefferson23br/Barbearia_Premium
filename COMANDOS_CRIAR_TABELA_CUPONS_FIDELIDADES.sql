-- protese.cupons definição
-- Drop table
-- DROP TABLE protese.cupons;

CREATE TABLE protese.cupons (
	id uuid DEFAULT gen_random_uuid() NOT NULL,
	codigo varchar(50) NOT NULL, -- Código único do cupom (ex: DESCONTO10, FIDELIDADE100)
	nome varchar(255) NOT NULL, -- Nome do cupom (ex: "Desconto de 10%", "Serviço Gratuito")
	descricao text NULL, -- Descrição do cupom
	tipo_desconto varchar(50) NOT NULL, -- Tipo: percentual, valor_fixo
	valor_desconto numeric(15, 2) DEFAULT 0.00 NULL, -- Valor do desconto (percentual ou valor fixo)
	aplicar_em varchar(50) NOT NULL, -- Onde aplicar: total (serviços + produtos), apenas_servicos, apenas_produtos
	regra_uso varchar(50) NOT NULL, -- Regra: unico (1x), limitado (N vezes), fidelidade (baseado em compras)
	limite_usos int4 DEFAULT 1 NULL, -- Limite de usos (se regra_uso = 'limitado')
	regra_fidelidade varchar(50) NULL, -- Regra de fidelidade: compras_servicos, compras_produtos, compras_total, pagamento_online, agendamento_pago
	quantidade_fidelidade int4 DEFAULT 0 NULL, -- Quantidade necessária para liberar (ex: 10 serviços)
	validade_inicio date NULL, -- Data de início da validade
	validade_fim date NULL, -- Data de fim da validade
	is_active bool DEFAULT true NULL, -- Se o cupom está ativo
	created_at timestamp DEFAULT CURRENT_TIMESTAMP NULL,
	updated_at timestamp DEFAULT CURRENT_TIMESTAMP NULL,
	created_by uuid NULL,
	updated_by uuid NULL,
	CONSTRAINT cupons_pkey PRIMARY KEY (id),
	CONSTRAINT cupons_codigo_key UNIQUE (codigo),
	CONSTRAINT cupons_tipo_desconto_check CHECK (tipo_desconto IN ('percentual', 'valor_fixo')),
	CONSTRAINT cupons_aplicar_em_check CHECK (aplicar_em IN ('total', 'apenas_servicos', 'apenas_produtos')),
	CONSTRAINT cupons_regra_uso_check CHECK (regra_uso IN ('unico', 'limitado', 'fidelidade')),
	CONSTRAINT cupons_regra_fidelidade_check CHECK (regra_fidelidade IS NULL OR regra_fidelidade IN ('compras_servicos', 'compras_produtos', 'compras_total', 'pagamento_online', 'agendamento_pago'))
);

CREATE INDEX idx_cupons_codigo ON protese.cupons USING btree (codigo);
CREATE INDEX idx_cupons_is_active ON protese.cupons USING btree (is_active);
CREATE INDEX idx_cupons_regra_uso ON protese.cupons USING btree (regra_uso);
CREATE INDEX idx_cupons_validade ON protese.cupons USING btree (validade_inicio, validade_fim);

COMMENT ON TABLE protese.cupons IS 'Cupons de desconto e fidelidade';
COMMENT ON COLUMN protese.cupons.codigo IS 'Código único do cupom (ex: DESCONTO10, FIDELIDADE100)';
COMMENT ON COLUMN protese.cupons.nome IS 'Nome do cupom (ex: "Desconto de 10%", "Serviço Gratuito")';
COMMENT ON COLUMN protese.cupons.tipo_desconto IS 'Tipo: percentual, valor_fixo';
COMMENT ON COLUMN protese.cupons.valor_desconto IS 'Valor do desconto (percentual ou valor fixo)';
COMMENT ON COLUMN protese.cupons.aplicar_em IS 'Onde aplicar: total (serviços + produtos), apenas_servicos, apenas_produtos';
COMMENT ON COLUMN protese.cupons.regra_uso IS 'Regra: unico (1x), limitado (N vezes), fidelidade (baseado em compras)';
COMMENT ON COLUMN protese.cupons.limite_usos IS 'Limite de usos (se regra_uso = limitado)';
COMMENT ON COLUMN protese.cupons.regra_fidelidade IS 'Regra de fidelidade: compras_servicos, compras_produtos, compras_total, pagamento_online, agendamento_pago';
COMMENT ON COLUMN protese.cupons.quantidade_fidelidade IS 'Quantidade necessária para liberar (ex: 10 serviços)';

-- Table Triggers
-- Nota: A função atualizar_updated_at_romaneios() deve existir ou criar uma função genérica
-- Se não existir, usar: CREATE OR REPLACE FUNCTION protese.atualizar_updated_at() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = CURRENT_TIMESTAMP; RETURN NEW; END; $$ LANGUAGE plpgsql;
CREATE TRIGGER trigger_atualizar_updated_at_cupons 
BEFORE UPDATE ON protese.cupons 
FOR EACH ROW 
EXECUTE FUNCTION protese.update_updated_at_column();

-- Permissions
ALTER TABLE protese.cupons OWNER TO protese_user;
GRANT TRIGGER, UPDATE, DELETE, TRUNCATE, SELECT, INSERT, REFERENCES ON TABLE protese.cupons TO protese_user;

-- protese.cupons_usados definição
-- Drop table
-- DROP TABLE protese.cupons_usados;

CREATE TABLE protese.cupons_usados (
	id uuid DEFAULT gen_random_uuid() NOT NULL,
	cupom_id uuid NOT NULL,
	cliente_id uuid NULL, -- Cliente que usou o cupom (NULL se não houver cliente)
	venda_id uuid NULL, -- Venda onde o cupom foi usado
	valor_desconto_aplicado numeric(15, 2) DEFAULT 0.00 NOT NULL, -- Valor do desconto aplicado nesta venda
	created_at timestamp DEFAULT CURRENT_TIMESTAMP NULL,
	created_by uuid NULL,
	CONSTRAINT cupons_usados_pkey PRIMARY KEY (id),
	CONSTRAINT cupons_usados_cupom_id_fkey FOREIGN KEY (cupom_id) REFERENCES protese.cupons(id) ON DELETE RESTRICT,
	CONSTRAINT cupons_usados_cliente_id_fkey FOREIGN KEY (cliente_id) REFERENCES protese.usuarios_clientes(id) ON DELETE SET NULL,
	CONSTRAINT cupons_usados_venda_id_fkey FOREIGN KEY (venda_id) REFERENCES protese.vendas(id) ON DELETE SET NULL
);

CREATE INDEX idx_cupons_usados_cupom ON protese.cupons_usados USING btree (cupom_id);
CREATE INDEX idx_cupons_usados_cliente ON protese.cupons_usados USING btree (cliente_id);
CREATE INDEX idx_cupons_usados_venda ON protese.cupons_usados USING btree (venda_id);
CREATE INDEX idx_cupons_usados_created_at ON protese.cupons_usados USING btree (created_at DESC);

COMMENT ON TABLE protese.cupons_usados IS 'Registro de uso de cupons';
COMMENT ON COLUMN protese.cupons_usados.valor_desconto_aplicado IS 'Valor do desconto aplicado nesta venda';

-- Permissions
ALTER TABLE protese.cupons_usados OWNER TO protese_user;
GRANT TRIGGER, UPDATE, DELETE, TRUNCATE, SELECT, INSERT, REFERENCES ON TABLE protese.cupons_usados TO protese_user;

-- protese.fidelidades definição
-- Drop table
-- DROP TABLE protese.fidelidades;

CREATE TABLE protese.fidelidades (
	id uuid DEFAULT gen_random_uuid() NOT NULL,
	cliente_id uuid NOT NULL,
	cupom_id uuid NOT NULL, -- Cupom de fidelidade relacionado
	tipo_contagem varchar(50) NOT NULL, -- Tipo: compras_servicos, compras_produtos, compras_total, pagamento_online, agendamento_pago
	quantidade_atual int4 DEFAULT 0 NOT NULL, -- Quantidade atual acumulada
	quantidade_necessaria int4 DEFAULT 0 NOT NULL, -- Quantidade necessária para liberar o cupom
	cupom_liberado bool DEFAULT false NULL, -- Se o cupom foi liberado (atingiu a quantidade necessária)
	cupom_usado bool DEFAULT false NULL, -- Se o cupom liberado já foi usado
	data_liberacao date NULL, -- Data em que o cupom foi liberado
	data_uso date NULL, -- Data em que o cupom foi usado
	created_at timestamp DEFAULT CURRENT_TIMESTAMP NULL,
	updated_at timestamp DEFAULT CURRENT_TIMESTAMP NULL,
	CONSTRAINT fidelidades_pkey PRIMARY KEY (id),
	CONSTRAINT fidelidades_cliente_cupom_key UNIQUE (cliente_id, cupom_id),
	CONSTRAINT fidelidades_cliente_id_fkey FOREIGN KEY (cliente_id) REFERENCES protese.usuarios_clientes(id) ON DELETE CASCADE,
	CONSTRAINT fidelidades_cupom_id_fkey FOREIGN KEY (cupom_id) REFERENCES protese.cupons(id) ON DELETE RESTRICT,
	CONSTRAINT fidelidades_tipo_contagem_check CHECK (tipo_contagem IN ('compras_servicos', 'compras_produtos', 'compras_total', 'pagamento_online', 'agendamento_pago'))
);

CREATE INDEX idx_fidelidades_cliente ON protese.fidelidades USING btree (cliente_id);
CREATE INDEX idx_fidelidades_cupom ON protese.fidelidades USING btree (cupom_id);
CREATE INDEX idx_fidelidades_liberado ON protese.fidelidades USING btree (cupom_liberado, cupom_usado);

COMMENT ON TABLE protese.fidelidades IS 'Controle de fidelidade dos clientes para cupons';
COMMENT ON COLUMN protese.fidelidades.tipo_contagem IS 'Tipo: compras_servicos, compras_produtos, compras_total, pagamento_online, agendamento_pago';
COMMENT ON COLUMN protese.fidelidades.quantidade_atual IS 'Quantidade atual acumulada';
COMMENT ON COLUMN protese.fidelidades.quantidade_necessaria IS 'Quantidade necessária para liberar o cupom';
COMMENT ON COLUMN protese.fidelidades.cupom_liberado IS 'Se o cupom foi liberado (atingiu a quantidade necessária)';
COMMENT ON COLUMN protese.fidelidades.cupom_usado IS 'Se o cupom liberado já foi usado';

-- Table Triggers
CREATE TRIGGER trigger_atualizar_updated_at_fidelidades 
BEFORE UPDATE ON protese.fidelidades 
FOR EACH ROW 
EXECUTE FUNCTION protese.update_updated_at_column();

-- Permissions
ALTER TABLE protese.fidelidades OWNER TO protese_user;
GRANT TRIGGER, UPDATE, DELETE, TRUNCATE, SELECT, INSERT, REFERENCES ON TABLE protese.fidelidades TO protese_user;

-- Adicionar campo cupom_id na tabela vendas
ALTER TABLE protese.vendas ADD COLUMN cupom_id uuid NULL;
ALTER TABLE protese.vendas ADD CONSTRAINT fk_venda_cupom FOREIGN KEY (cupom_id) REFERENCES protese.cupons(id) ON DELETE SET NULL;
CREATE INDEX idx_vendas_cupom ON protese.vendas USING btree (cupom_id);

COMMENT ON COLUMN protese.vendas.cupom_id IS 'Cupom aplicado na venda';

