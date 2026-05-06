-- Etapa 1 - Base multi-filial (Barbearia Premium)
-- Execute este script em banco novo/limpo.

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS filiais (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome VARCHAR(120) NOT NULL,
  slug VARCHAR(120) NOT NULL UNIQUE,
  dominio_landing VARCHAR(255),
  ativo BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS usuarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  filial_id UUID NOT NULL REFERENCES filiais(id),
  nome VARCHAR(120) NOT NULL,
  email VARCHAR(180) NOT NULL,
  senha_hash TEXT NOT NULL,
  papel VARCHAR(30) NOT NULL CHECK (papel IN ('proprietario', 'gestor', 'cliente')),
  ativo BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE (filial_id, email)
);

CREATE TABLE IF NOT EXISTS clientes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  filial_id UUID NOT NULL REFERENCES filiais(id),
  usuario_id UUID NOT NULL UNIQUE REFERENCES usuarios(id),
  telefone VARCHAR(30),
  observacoes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_usuarios_filial ON usuarios(filial_id);
CREATE INDEX IF NOT EXISTS idx_clientes_filial ON clientes(filial_id);

-- Filial padrão para bootstrap local
INSERT INTO filiais (nome, slug, dominio_landing)
VALUES ('Barbearia Premium Matriz', 'matriz', 'appbarber.auctusconsultoria.com.br')
ON CONFLICT (slug) DO NOTHING;
