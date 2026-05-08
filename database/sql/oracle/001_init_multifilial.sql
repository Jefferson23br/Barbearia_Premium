-- Etapa 1 - Base multi-filial (Oracle)
-- Execute este script em banco Oracle novo/limpo.

CREATE TABLE filiais (
  id VARCHAR2(36) DEFAULT LOWER(REGEXP_REPLACE(RAWTOHEX(SYS_GUID()), '(.{8})(.{4})(.{4})(.{4})(.{12})', '\1-\2-\3-\4-\5')) PRIMARY KEY,
  nome VARCHAR2(120) NOT NULL,
  slug VARCHAR2(120) NOT NULL UNIQUE,
  dominio_landing VARCHAR2(255),
  ativo NUMBER(1) DEFAULT 1 NOT NULL CHECK (ativo IN (0, 1)),
  created_at TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL
);

CREATE TABLE usuarios (
  id VARCHAR2(36) DEFAULT LOWER(REGEXP_REPLACE(RAWTOHEX(SYS_GUID()), '(.{8})(.{4})(.{4})(.{4})(.{12})', '\1-\2-\3-\4-\5')) PRIMARY KEY,
  filial_id VARCHAR2(36) NOT NULL,
  nome VARCHAR2(120) NOT NULL,
  email VARCHAR2(180) NOT NULL,
  senha_hash CLOB NOT NULL,
  papel VARCHAR2(30) NOT NULL CHECK (papel IN ('proprietario', 'gestor', 'cliente')),
  ativo NUMBER(1) DEFAULT 1 NOT NULL CHECK (ativo IN (0, 1)),
  created_at TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL,
  CONSTRAINT fk_usuarios_filial FOREIGN KEY (filial_id) REFERENCES filiais(id),
  CONSTRAINT uq_usuarios_filial_email UNIQUE (filial_id, email)
);

CREATE TABLE clientes (
  id VARCHAR2(36) DEFAULT LOWER(REGEXP_REPLACE(RAWTOHEX(SYS_GUID()), '(.{8})(.{4})(.{4})(.{4})(.{12})', '\1-\2-\3-\4-\5')) PRIMARY KEY,
  filial_id VARCHAR2(36) NOT NULL,
  usuario_id VARCHAR2(36) NOT NULL,
  telefone VARCHAR2(30),
  observacoes CLOB,
  created_at TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL,
  CONSTRAINT fk_clientes_filial FOREIGN KEY (filial_id) REFERENCES filiais(id),
  CONSTRAINT fk_clientes_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
  CONSTRAINT uq_clientes_usuario UNIQUE (usuario_id)
);

CREATE INDEX idx_usuarios_filial ON usuarios(filial_id);
CREATE INDEX idx_clientes_filial ON clientes(filial_id);

-- Filial padrão para bootstrap local (upsert Oracle)
MERGE INTO filiais f
USING (
  SELECT
    'Barbearia Premium Matriz' AS nome,
    'matriz' AS slug,
    'appbarber.auctusconsultoria.com.br' AS dominio_landing
  FROM dual
) src
ON (f.slug = src.slug)
WHEN NOT MATCHED THEN
  INSERT (id, nome, slug, dominio_landing, ativo, created_at, updated_at)
  VALUES (LOWER(REGEXP_REPLACE(RAWTOHEX(SYS_GUID()), '(.{8})(.{4})(.{4})(.{4})(.{12})', '\1-\2-\3-\4-\5')), src.nome, src.slug, src.dominio_landing, 1, SYSTIMESTAMP, SYSTIMESTAMP);
