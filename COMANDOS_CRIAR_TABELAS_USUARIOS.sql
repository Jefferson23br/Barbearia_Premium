-- ============================================================
-- COMANDOS SQL PARA CRIAR TABELAS DE USUÁRIOS
-- Sistema: Prótese Capilar Cuiabá
-- Data: 05/12/2025
-- ============================================================

-- ============================================================
-- 1. TABELA: usuarios_clientes
-- ============================================================

CREATE TABLE IF NOT EXISTS usuarios_clientes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Dados Pessoais
    nome_completo VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    cpf VARCHAR(14) UNIQUE NOT NULL,
    rg VARCHAR(20),
    
    -- Endereço
    rua VARCHAR(255) NOT NULL,
    numero VARCHAR(20) NOT NULL,
    complemento VARCHAR(100),
    bairro VARCHAR(100) NOT NULL,
    cidade VARCHAR(100) NOT NULL,
    estado VARCHAR(2) NOT NULL,
    cep VARCHAR(9) NOT NULL,
    
    -- Autenticação
    senha_hash VARCHAR(255) NOT NULL,
    
    -- Status e Controle
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Constraints para validação (adicionadas após criação da tabela)
ALTER TABLE usuarios_clientes 
    ADD CONSTRAINT check_estado_length CHECK (LENGTH(estado) = 2);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_usuarios_clientes_email ON usuarios_clientes(email);
CREATE INDEX IF NOT EXISTS idx_usuarios_clientes_cpf ON usuarios_clientes(cpf);
CREATE INDEX IF NOT EXISTS idx_usuarios_clientes_created_at ON usuarios_clientes(created_at);
CREATE INDEX IF NOT EXISTS idx_usuarios_clientes_is_active ON usuarios_clientes(is_active);

-- ============================================================
-- 2. TABELA: usuarios_administrativos
-- ============================================================

CREATE TABLE IF NOT EXISTS usuarios_administrativos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Dados Pessoais
    nome_completo VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    cpf VARCHAR(14) UNIQUE NOT NULL,
    rg VARCHAR(20),
    
    -- Endereço
    rua VARCHAR(255) NOT NULL,
    numero VARCHAR(20) NOT NULL,
    complemento VARCHAR(100),
    bairro VARCHAR(100) NOT NULL,
    cidade VARCHAR(100) NOT NULL,
    estado VARCHAR(2) NOT NULL,
    cep VARCHAR(9) NOT NULL,
    
    -- Dados Profissionais (Específicos Administrativos)
    nis VARCHAR(11),
    data_admissao DATE NOT NULL,
    tipo_contrato VARCHAR(2) NOT NULL, -- 'CLT' ou 'PJ'
    salario DECIMAL(10,2),
    tipo_usuario VARCHAR(50) NOT NULL DEFAULT 'operador', -- 'super_admin', 'admin', 'operador', 'atendente', etc.
    
    -- Autenticação
    senha_hash VARCHAR(255) NOT NULL,
    
    -- Status e Controle
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Constraints para validação (adicionadas após criação da tabela)
ALTER TABLE usuarios_administrativos 
    ADD CONSTRAINT check_estado_length CHECK (LENGTH(estado) = 2),
    ADD CONSTRAINT check_tipo_contrato CHECK (tipo_contrato IN ('CLT', 'PJ')),
    ADD CONSTRAINT check_salario_positive CHECK (salario IS NULL OR salario >= 0);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_usuarios_admin_email ON usuarios_administrativos(email);
CREATE INDEX IF NOT EXISTS idx_usuarios_admin_cpf ON usuarios_administrativos(cpf);
CREATE INDEX IF NOT EXISTS idx_usuarios_admin_tipo_usuario ON usuarios_administrativos(tipo_usuario);
CREATE INDEX IF NOT EXISTS idx_usuarios_admin_created_at ON usuarios_administrativos(created_at);
CREATE INDEX IF NOT EXISTS idx_usuarios_admin_is_active ON usuarios_administrativos(is_active);
CREATE INDEX IF NOT EXISTS idx_usuarios_admin_data_admissao ON usuarios_administrativos(data_admissao);

-- ============================================================
-- 3. FUNÇÃO: Atualizar updated_at automaticamente
-- ============================================================

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para atualizar updated_at automaticamente
CREATE TRIGGER update_usuarios_clientes_updated_at 
    BEFORE UPDATE ON usuarios_clientes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_usuarios_administrativos_updated_at 
    BEFORE UPDATE ON usuarios_administrativos
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- 4. COMENTÁRIOS NAS TABELAS E COLUNAS (Documentação)
-- ============================================================

COMMENT ON TABLE usuarios_clientes IS 'Tabela de usuários clientes do sistema';
COMMENT ON TABLE usuarios_administrativos IS 'Tabela de usuários administrativos do sistema';

COMMENT ON COLUMN usuarios_administrativos.tipo_contrato IS 'Tipo de contrato: CLT ou PJ';
COMMENT ON COLUMN usuarios_administrativos.tipo_usuario IS 'Nível de acesso: super_admin, admin, operador, atendente';
COMMENT ON COLUMN usuarios_administrativos.salario IS 'Salário do funcionário (NULL se PJ)';

-- ============================================================
-- FIM DOS COMANDOS
-- ============================================================

-- Para verificar se as tabelas foram criadas:
-- SELECT table_name FROM information_schema.tables 
-- WHERE table_schema = 'public' 
-- AND table_name IN ('usuarios_clientes', 'usuarios_administrativos');

-- Para ver a estrutura de uma tabela:
-- \d usuarios_clientes
-- \d usuarios_administrativos

