CREATE SCHEMA IF NOT EXISTS protese;

CREATE TABLE IF NOT EXISTS protese.configuracoes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome_empresarial VARCHAR(255),
    nome_fantasia VARCHAR(255),
    cnpj VARCHAR(18),
    cnae VARCHAR(10),
    cnae_secundario TEXT,
    inscricao_estadual VARCHAR(20),
    endereco_rua VARCHAR(255),
    endereco_numero VARCHAR(20),
    endereco_complemento VARCHAR(100),
    endereco_bairro VARCHAR(100),
    endereco_cidade VARCHAR(100),
    endereco_estado VARCHAR(2),
    endereco_cep VARCHAR(10),
    email_contato VARCHAR(255),
    telefone_principal VARCHAR(20),
    telefone_secundario VARCHAR(20),
    whatsapp VARCHAR(20),
    segunda_abertura TIME,
    segunda_fechamento TIME,
    segunda_ativo BOOLEAN DEFAULT true,
    terca_abertura TIME,
    terca_fechamento TIME,
    terca_ativo BOOLEAN DEFAULT true,
    quarta_abertura TIME,
    quarta_fechamento TIME,
    quarta_ativo BOOLEAN DEFAULT true,
    quinta_abertura TIME,
    quinta_fechamento TIME,
    quinta_ativo BOOLEAN DEFAULT true,
    sexta_abertura TIME,
    sexta_fechamento TIME,
    sexta_ativo BOOLEAN DEFAULT true,
    sabado_abertura TIME,
    sabado_fechamento TIME,
    sabado_ativo BOOLEAN DEFAULT true,
    domingo_abertura TIME,
    domingo_fechamento TIME,
    domingo_ativo BOOLEAN DEFAULT false,
    intervalo_agendamento INTEGER DEFAULT 30,
    tempo_antecedencia_agendamento INTEGER DEFAULT 60,
    tempo_cancelamento_agendamento INTEGER DEFAULT 120,
    logo_url VARCHAR(500),
    cor_primaria VARCHAR(7) DEFAULT '#F59E0B',
    cor_secundaria VARCHAR(7) DEFAULT '#3B82F6',
    timezone VARCHAR(50) DEFAULT 'America/Cuiaba',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_by UUID
);

CREATE INDEX IF NOT EXISTS idx_configuracoes_cnpj ON protese.configuracoes(cnpj);
CREATE INDEX IF NOT EXISTS idx_configuracoes_updated_at ON protese.configuracoes(updated_at);

ALTER TABLE protese.configuracoes OWNER TO protese_user;
GRANT ALL ON TABLE protese.configuracoes TO protese_user;

ALTER TABLE protese.configuracoes ALTER COLUMN ambiente_nfe TYPE VARCHAR(20);

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM protese.configuracoes LIMIT 1) THEN
        INSERT INTO protese.configuracoes (
            nome_empresarial,
            nome_fantasia,
            intervalo_agendamento,
            tempo_antecedencia_agendamento,
            tempo_cancelamento_agendamento,
            cor_primaria,
            cor_secundaria,
            timezone
        ) VALUES (
            NULL,
            NULL,
            30,
            60,
            120,
            '#F59E0B',
            '#3B82F6',
            'America/Cuiaba'
        );
    END IF;
END $$;
