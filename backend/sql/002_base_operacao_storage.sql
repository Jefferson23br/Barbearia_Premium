-- Etapa 2 - Estrutura base operacional + storage de arquivos
-- Execute apos o 001_init_multifilial.sql

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS servicos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  filial_id UUID NOT NULL REFERENCES filiais(id),
  nome VARCHAR(120) NOT NULL,
  descricao TEXT,
  duracao_minutos INTEGER NOT NULL DEFAULT 30 CHECK (duracao_minutos > 0),
  valor DECIMAL(12,2) NOT NULL DEFAULT 0 CHECK (valor >= 0),
  ativo BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS agendamentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  filial_id UUID NOT NULL REFERENCES filiais(id),
  cliente_id UUID NOT NULL REFERENCES clientes(id),
  servico_id UUID NOT NULL REFERENCES servicos(id),
  data_hora_inicio TIMESTAMP NOT NULL,
  data_hora_fim TIMESTAMP NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'agendado'
    CHECK (status IN ('agendado', 'confirmado', 'concluido', 'cancelado')),
  observacoes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  CHECK (data_hora_fim > data_hora_inicio)
);

CREATE TABLE IF NOT EXISTS vendas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  filial_id UUID NOT NULL REFERENCES filiais(id),
  cliente_id UUID REFERENCES clientes(id),
  agendamento_id UUID REFERENCES agendamentos(id),
  valor_bruto DECIMAL(12,2) NOT NULL DEFAULT 0 CHECK (valor_bruto >= 0),
  desconto DECIMAL(12,2) NOT NULL DEFAULT 0 CHECK (desconto >= 0),
  valor_liquido DECIMAL(12,2) NOT NULL DEFAULT 0 CHECK (valor_liquido >= 0),
  forma_pagamento VARCHAR(30) NOT NULL DEFAULT 'pix'
    CHECK (forma_pagamento IN ('dinheiro', 'pix', 'cartao', 'boleto', 'transferencia')),
  status VARCHAR(30) NOT NULL DEFAULT 'paga'
    CHECK (status IN ('pendente', 'paga', 'cancelada')),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS storage_arquivos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  filial_id UUID REFERENCES filiais(id),
  uploader_usuario_id UUID REFERENCES usuarios(id),
  entidade_tipo VARCHAR(50) NOT NULL,
  entidade_id UUID,
  bucket VARCHAR(50) NOT NULL DEFAULT 'uploads',
  diretorio_relativo VARCHAR(255) NOT NULL,
  nome_original VARCHAR(255) NOT NULL,
  nome_armazenado VARCHAR(255) NOT NULL,
  mime_type VARCHAR(120),
  tamanho_bytes BIGINT NOT NULL DEFAULT 0 CHECK (tamanho_bytes >= 0),
  checksum_sha256 VARCHAR(64),
  url_publica TEXT,
  ativo BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_storage_nome_armazenado
  ON storage_arquivos (bucket, diretorio_relativo, nome_armazenado);

CREATE INDEX IF NOT EXISTS idx_servicos_filial ON servicos(filial_id);
CREATE INDEX IF NOT EXISTS idx_agendamentos_filial_data ON agendamentos(filial_id, data_hora_inicio);
CREATE INDEX IF NOT EXISTS idx_vendas_filial_data ON vendas(filial_id, created_at);
CREATE INDEX IF NOT EXISTS idx_storage_filial ON storage_arquivos(filial_id);
CREATE INDEX IF NOT EXISTS idx_storage_entidade ON storage_arquivos(entidade_tipo, entidade_id);
