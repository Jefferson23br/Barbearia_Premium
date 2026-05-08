CREATE SCHEMA IF NOT EXISTS protese;

CREATE TABLE IF NOT EXISTS protese.integracoes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tipo_integracao VARCHAR(50) NOT NULL,
    nome VARCHAR(255) NOT NULL,
    ativo BOOLEAN DEFAULT false,
    ambiente VARCHAR(20) DEFAULT 'homologacao',
    token_producao VARCHAR(255),
    token_homologacao VARCHAR(255),
    certificado_digital_path VARCHAR(500),
    senha_certificado VARCHAR(255),
    cnpj VARCHAR(18),
    configuracao_json JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_by UUID,
    CONSTRAINT unique_tipo_integracao UNIQUE (tipo_integracao)
);

CREATE INDEX IF NOT EXISTS idx_integracoes_tipo ON protese.integracoes(tipo_integracao);
CREATE INDEX IF NOT EXISTS idx_integracoes_ativo ON protese.integracoes(ativo);

ALTER TABLE protese.integracoes OWNER TO protese_user;
GRANT ALL ON TABLE protese.integracoes TO protese_user;

CREATE TABLE IF NOT EXISTS protese.integracoes_habilitadas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    integracao_id UUID NOT NULL,
    funcionalidade VARCHAR(100) NOT NULL,
    habilitado BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_integracao FOREIGN KEY (integracao_id) REFERENCES protese.integracoes(id) ON DELETE CASCADE,
    CONSTRAINT unique_integracao_funcionalidade UNIQUE (integracao_id, funcionalidade)
);

CREATE INDEX IF NOT EXISTS idx_integracoes_habilitadas_integracao ON protese.integracoes_habilitadas(integracao_id);
CREATE INDEX IF NOT EXISTS idx_integracoes_habilitadas_funcionalidade ON protese.integracoes_habilitadas(funcionalidade);

ALTER TABLE protese.integracoes_habilitadas OWNER TO protese_user;
GRANT ALL ON TABLE protese.integracoes_habilitadas TO protese_user;

