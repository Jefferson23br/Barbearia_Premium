-- ============================================================
-- COMANDOS PARA CRIAR SCHEMA E TABELAS
-- Sistema: Prótese Capilar Cuiabá
-- Execute cada comando separadamente, na ordem apresentada
-- ============================================================

-- ============================================================
-- PASSO 1: Criar schema protese
-- ============================================================

CREATE SCHEMA IF NOT EXISTS protese AUTHORIZATION protese_user;

-- ============================================================
-- PASSO 2: Definir o schema padrão para a sessão
-- ============================================================

SET search_path TO protese;

-- ============================================================
-- PASSO 3: Criar tabela usuarios_clientes
-- ============================================================

CREATE TABLE IF NOT EXISTS protese.usuarios_clientes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome_completo VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    cpf VARCHAR(14) UNIQUE NOT NULL,
    rg VARCHAR(20),
    rua VARCHAR(255) NOT NULL,
    numero VARCHAR(20) NOT NULL,
    complemento VARCHAR(100),
    bairro VARCHAR(100) NOT NULL,
    cidade VARCHAR(100) NOT NULL,
    estado VARCHAR(2) NOT NULL,
    cep VARCHAR(9) NOT NULL,
    senha_hash VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- PASSO 4: Criar índices para usuarios_clientes
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_usuarios_clientes_email ON protese.usuarios_clientes(email);

CREATE INDEX IF NOT EXISTS idx_usuarios_clientes_cpf ON protese.usuarios_clientes(cpf);

CREATE INDEX IF NOT EXISTS idx_usuarios_clientes_created_at ON protese.usuarios_clientes(created_at);

CREATE INDEX IF NOT EXISTS idx_usuarios_clientes_is_active ON protese.usuarios_clientes(is_active);

-- ============================================================
-- PASSO 5: Criar tabela usuarios_administrativos
-- ============================================================

CREATE TABLE IF NOT EXISTS protese.usuarios_administrativos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome_completo VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    cpf VARCHAR(14) UNIQUE NOT NULL,
    rg VARCHAR(20),
    rua VARCHAR(255) NOT NULL,
    numero VARCHAR(20) NOT NULL,
    complemento VARCHAR(100),
    bairro VARCHAR(100) NOT NULL,
    cidade VARCHAR(100) NOT NULL,
    estado VARCHAR(2) NOT NULL,
    cep VARCHAR(9) NOT NULL,
    nis VARCHAR(11),
    data_admissao DATE NOT NULL,
    tipo_contrato VARCHAR(2) NOT NULL,
    salario DECIMAL(10,2),
    tipo_usuario VARCHAR(50) NOT NULL DEFAULT 'operador',
    senha_hash VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- PASSO 6: Adicionar constraint para tipo_contrato
-- ============================================================

ALTER TABLE protese.usuarios_administrativos 
    ADD CONSTRAINT check_tipo_contrato CHECK (tipo_contrato IN ('CLT', 'PJ'));

-- ============================================================
-- PASSO 7: Criar índices para usuarios_administrativos
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_usuarios_admin_email ON protese.usuarios_administrativos(email);

CREATE INDEX IF NOT EXISTS idx_usuarios_admin_cpf ON protese.usuarios_administrativos(cpf);

CREATE INDEX IF NOT EXISTS idx_usuarios_admin_tipo_usuario ON protese.usuarios_administrativos(tipo_usuario);

CREATE INDEX IF NOT EXISTS idx_usuarios_admin_created_at ON protese.usuarios_administrativos(created_at);

CREATE INDEX IF NOT EXISTS idx_usuarios_admin_is_active ON protese.usuarios_administrativos(is_active);

CREATE INDEX IF NOT EXISTS idx_usuarios_admin_data_admissao ON protese.usuarios_administrativos(data_admissao);

-- ============================================================
-- PASSO 8: Criar função para atualizar updated_at
-- ============================================================

CREATE OR REPLACE FUNCTION protese.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- ============================================================
-- PASSO 9: Criar trigger para usuarios_clientes
-- ============================================================

CREATE TRIGGER update_usuarios_clientes_updated_at 
    BEFORE UPDATE ON protese.usuarios_clientes
    FOR EACH ROW
    EXECUTE FUNCTION protese.update_updated_at_column();

-- ============================================================
-- PASSO 10: Criar trigger para usuarios_administrativos
-- ============================================================

CREATE TRIGGER update_usuarios_administrativos_updated_at 
    BEFORE UPDATE ON protese.usuarios_administrativos
    FOR EACH ROW
    EXECUTE FUNCTION protese.update_updated_at_column();





