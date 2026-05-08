-- Etapa 2 - Estrutura base operacional + storage de arquivos (Oracle)
-- Execute apos o 001_init_multifilial.sql

CREATE TABLE servicos (
  id VARCHAR2(36) DEFAULT LOWER(REGEXP_REPLACE(RAWTOHEX(SYS_GUID()), '(.{8})(.{4})(.{4})(.{4})(.{12})', '\1-\2-\3-\4-\5')) PRIMARY KEY,
  filial_id VARCHAR2(36) NOT NULL,
  nome VARCHAR2(120) NOT NULL,
  descricao CLOB,
  duracao_minutos NUMBER(6) DEFAULT 30 NOT NULL CHECK (duracao_minutos > 0),
  valor NUMBER(12,2) DEFAULT 0 NOT NULL CHECK (valor >= 0),
  ativo NUMBER(1) DEFAULT 1 NOT NULL CHECK (ativo IN (0, 1)),
  created_at TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL,
  CONSTRAINT fk_servicos_filial FOREIGN KEY (filial_id) REFERENCES filiais(id)
);

CREATE TABLE agendamentos (
  id VARCHAR2(36) DEFAULT LOWER(REGEXP_REPLACE(RAWTOHEX(SYS_GUID()), '(.{8})(.{4})(.{4})(.{4})(.{12})', '\1-\2-\3-\4-\5')) PRIMARY KEY,
  filial_id VARCHAR2(36) NOT NULL,
  cliente_id VARCHAR2(36) NOT NULL,
  servico_id VARCHAR2(36) NOT NULL,
  data_hora_inicio TIMESTAMP NOT NULL,
  data_hora_fim TIMESTAMP NOT NULL,
  status VARCHAR2(30) DEFAULT 'agendado' NOT NULL
    CHECK (status IN ('agendado', 'confirmado', 'concluido', 'cancelado')),
  observacoes CLOB,
  created_at TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL,
  CONSTRAINT fk_agendamentos_filial FOREIGN KEY (filial_id) REFERENCES filiais(id),
  CONSTRAINT fk_agendamentos_cliente FOREIGN KEY (cliente_id) REFERENCES clientes(id),
  CONSTRAINT fk_agendamentos_servico FOREIGN KEY (servico_id) REFERENCES servicos(id),
  CONSTRAINT ck_agendamentos_periodo CHECK (data_hora_fim > data_hora_inicio)
);

CREATE TABLE vendas (
  id VARCHAR2(36) DEFAULT LOWER(REGEXP_REPLACE(RAWTOHEX(SYS_GUID()), '(.{8})(.{4})(.{4})(.{4})(.{12})', '\1-\2-\3-\4-\5')) PRIMARY KEY,
  filial_id VARCHAR2(36) NOT NULL,
  cliente_id VARCHAR2(36),
  agendamento_id VARCHAR2(36),
  valor_bruto NUMBER(12,2) DEFAULT 0 NOT NULL CHECK (valor_bruto >= 0),
  desconto NUMBER(12,2) DEFAULT 0 NOT NULL CHECK (desconto >= 0),
  valor_liquido NUMBER(12,2) DEFAULT 0 NOT NULL CHECK (valor_liquido >= 0),
  forma_pagamento VARCHAR2(30) DEFAULT 'pix' NOT NULL
    CHECK (forma_pagamento IN ('dinheiro', 'pix', 'cartao', 'boleto', 'transferencia')),
  status VARCHAR2(30) DEFAULT 'paga' NOT NULL
    CHECK (status IN ('pendente', 'paga', 'cancelada')),
  created_at TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL,
  CONSTRAINT fk_vendas_filial FOREIGN KEY (filial_id) REFERENCES filiais(id),
  CONSTRAINT fk_vendas_cliente FOREIGN KEY (cliente_id) REFERENCES clientes(id),
  CONSTRAINT fk_vendas_agendamento FOREIGN KEY (agendamento_id) REFERENCES agendamentos(id)
);

CREATE TABLE storage_arquivos (
  id VARCHAR2(36) DEFAULT LOWER(REGEXP_REPLACE(RAWTOHEX(SYS_GUID()), '(.{8})(.{4})(.{4})(.{4})(.{12})', '\1-\2-\3-\4-\5')) PRIMARY KEY,
  filial_id VARCHAR2(36),
  uploader_usuario_id VARCHAR2(36),
  entidade_tipo VARCHAR2(50) NOT NULL,
  entidade_id VARCHAR2(36),
  bucket VARCHAR2(50) DEFAULT 'uploads' NOT NULL,
  diretorio_relativo VARCHAR2(255) NOT NULL,
  nome_original VARCHAR2(255) NOT NULL,
  nome_armazenado VARCHAR2(255) NOT NULL,
  mime_type VARCHAR2(120),
  tamanho_bytes NUMBER(19) DEFAULT 0 NOT NULL CHECK (tamanho_bytes >= 0),
  checksum_sha256 VARCHAR2(64),
  url_publica CLOB,
  ativo NUMBER(1) DEFAULT 1 NOT NULL CHECK (ativo IN (0, 1)),
  created_at TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL,
  CONSTRAINT fk_storage_filial FOREIGN KEY (filial_id) REFERENCES filiais(id),
  CONSTRAINT fk_storage_usuario FOREIGN KEY (uploader_usuario_id) REFERENCES usuarios(id)
);

CREATE UNIQUE INDEX uq_storage_nome_armazenado
  ON storage_arquivos (bucket, diretorio_relativo, nome_armazenado);

CREATE INDEX idx_servicos_filial ON servicos(filial_id);
CREATE INDEX idx_agendamentos_filial_data ON agendamentos(filial_id, data_hora_inicio);
CREATE INDEX idx_vendas_filial_data ON vendas(filial_id, created_at);
CREATE INDEX idx_storage_filial ON storage_arquivos(filial_id);
CREATE INDEX idx_storage_entidade ON storage_arquivos(entidade_tipo, entidade_id);
