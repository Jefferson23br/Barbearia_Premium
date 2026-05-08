-- ============================================================
-- TABELAS: Help Desk - Sistema de Chamados
-- Descrição: Sistema completo de chamados de manutenção
-- ============================================================

-- ============================================================
-- TABELA: help_desk_chamados
-- Descrição: Armazena os chamados de manutenção
-- ============================================================

-- Criar tabela help_desk_chamados
CREATE TABLE IF NOT EXISTS protese.help_desk_chamados (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    data_emissao TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    tipo_chamado VARCHAR(100) NOT NULL,
    funcionario_abriu_id UUID NOT NULL,
    responsavel_id UUID NOT NULL,
    descricao TEXT NOT NULL,
    email_contato VARCHAR(255),
    telefone_whatsapp VARCHAR(20),
    temperatura VARCHAR(20) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'ABERTO',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Adicionar constraints CHECK (se não existirem)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'check_temperatura'
    ) THEN
        ALTER TABLE protese.help_desk_chamados 
        ADD CONSTRAINT check_temperatura 
        CHECK (temperatura IN ('verde', 'amarelo', 'vermelho'));
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'check_status'
    ) THEN
        ALTER TABLE protese.help_desk_chamados 
        ADD CONSTRAINT check_status 
        CHECK (status IN ('INICIADO', 'ABERTO', 'EM DESENVOLVIMENTO', 'RESOLVIDO'));
    END IF;
END $$;

-- Adicionar foreign keys (se não existirem)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'fk_funcionario_abriu'
    ) THEN
        ALTER TABLE protese.help_desk_chamados 
        ADD CONSTRAINT fk_funcionario_abriu 
        FOREIGN KEY (funcionario_abriu_id) 
        REFERENCES protese.usuarios_administrativos(id) 
        ON DELETE RESTRICT;
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'fk_responsavel'
    ) THEN
        ALTER TABLE protese.help_desk_chamados 
        ADD CONSTRAINT fk_responsavel 
        FOREIGN KEY (responsavel_id) 
        REFERENCES protese.usuarios_administrativos(id) 
        ON DELETE RESTRICT;
    END IF;
END $$;

-- Índices para help_desk_chamados
CREATE INDEX IF NOT EXISTS idx_help_desk_chamados_funcionario_abriu ON protese.help_desk_chamados(funcionario_abriu_id);
CREATE INDEX IF NOT EXISTS idx_help_desk_chamados_responsavel ON protese.help_desk_chamados(responsavel_id);
CREATE INDEX IF NOT EXISTS idx_help_desk_chamados_status ON protese.help_desk_chamados(status);
CREATE INDEX IF NOT EXISTS idx_help_desk_chamados_temperatura ON protese.help_desk_chamados(temperatura);
CREATE INDEX IF NOT EXISTS idx_help_desk_chamados_data_emissao ON protese.help_desk_chamados(data_emissao DESC);
CREATE INDEX IF NOT EXISTS idx_help_desk_chamados_tipo ON protese.help_desk_chamados(tipo_chamado);

-- Comentários
COMMENT ON TABLE protese.help_desk_chamados IS 'Armazena os chamados de manutenção do sistema';
COMMENT ON COLUMN protese.help_desk_chamados.tipo_chamado IS 'Tipo do chamado: erro de sistema, erro de lançamento, averiguação de modificação, criação de cadastro, atualização, aperfeiçoamento, etc.';
COMMENT ON COLUMN protese.help_desk_chamados.temperatura IS 'Prioridade: verde (baixa), amarelo (média), vermelho (alta)';
COMMENT ON COLUMN protese.help_desk_chamados.status IS 'Status do chamado: INICIADO, ABERTO, EM DESENVOLVIMENTO, RESOLVIDO';

-- ============================================================
-- TABELA: help_desk_respostas
-- Descrição: Armazena as respostas/histórico de cada chamado
-- ============================================================

-- Criar tabela help_desk_respostas
CREATE TABLE IF NOT EXISTS protese.help_desk_respostas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chamado_id UUID NOT NULL,
    funcionario_id UUID NOT NULL,
    mensagem TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Adicionar foreign keys (se não existirem)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'fk_chamado'
    ) THEN
        ALTER TABLE protese.help_desk_respostas 
        ADD CONSTRAINT fk_chamado 
        FOREIGN KEY (chamado_id) 
        REFERENCES protese.help_desk_chamados(id) 
        ON DELETE CASCADE;
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'fk_funcionario_resposta'
    ) THEN
        ALTER TABLE protese.help_desk_respostas 
        ADD CONSTRAINT fk_funcionario_resposta 
        FOREIGN KEY (funcionario_id) 
        REFERENCES protese.usuarios_administrativos(id) 
        ON DELETE RESTRICT;
    END IF;
END $$;

-- Índices para help_desk_respostas
CREATE INDEX IF NOT EXISTS idx_help_desk_respostas_chamado ON protese.help_desk_respostas(chamado_id);
CREATE INDEX IF NOT EXISTS idx_help_desk_respostas_funcionario ON protese.help_desk_respostas(funcionario_id);
CREATE INDEX IF NOT EXISTS idx_help_desk_respostas_created_at ON protese.help_desk_respostas(created_at DESC);

-- Comentários
COMMENT ON TABLE protese.help_desk_respostas IS 'Armazena as respostas e histórico de conversas de cada chamado';
COMMENT ON COLUMN protese.help_desk_respostas.mensagem IS 'Mensagem/resposta deixada no chamado';

-- ============================================================
-- TABELA: help_desk_anexos
-- Descrição: Armazena os anexos (imagens e PDFs) dos chamados e respostas
-- ============================================================

-- Criar tabela help_desk_anexos
CREATE TABLE IF NOT EXISTS protese.help_desk_anexos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chamado_id UUID,
    resposta_id UUID,
    nome_arquivo VARCHAR(255) NOT NULL,
    url_arquivo TEXT NOT NULL,
    tipo_arquivo VARCHAR(50) NOT NULL,
    tamanho_bytes BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Adicionar foreign keys (se não existirem)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'fk_chamado_anexo'
    ) THEN
        ALTER TABLE protese.help_desk_anexos 
        ADD CONSTRAINT fk_chamado_anexo 
        FOREIGN KEY (chamado_id) 
        REFERENCES protese.help_desk_chamados(id) 
        ON DELETE CASCADE;
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'fk_resposta_anexo'
    ) THEN
        ALTER TABLE protese.help_desk_anexos 
        ADD CONSTRAINT fk_resposta_anexo 
        FOREIGN KEY (resposta_id) 
        REFERENCES protese.help_desk_respostas(id) 
        ON DELETE CASCADE;
    END IF;
END $$;

-- Garantir que o anexo está vinculado a um chamado OU uma resposta
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'check_anexo_vinculo'
    ) THEN
        ALTER TABLE protese.help_desk_anexos 
        ADD CONSTRAINT check_anexo_vinculo 
        CHECK (
            (chamado_id IS NOT NULL AND resposta_id IS NULL) OR 
            (chamado_id IS NULL AND resposta_id IS NOT NULL)
        );
    END IF;
END $$;

-- Índices para help_desk_anexos
CREATE INDEX IF NOT EXISTS idx_help_desk_anexos_chamado ON protese.help_desk_anexos(chamado_id);
CREATE INDEX IF NOT EXISTS idx_help_desk_anexos_resposta ON protese.help_desk_anexos(resposta_id);
CREATE INDEX IF NOT EXISTS idx_help_desk_anexos_tipo ON protese.help_desk_anexos(tipo_arquivo);

-- Comentários
COMMENT ON TABLE protese.help_desk_anexos IS 'Armazena os anexos (imagens e PDFs) dos chamados e respostas';
COMMENT ON COLUMN protese.help_desk_anexos.tipo_arquivo IS 'Tipo do arquivo: imagem ou pdf';

