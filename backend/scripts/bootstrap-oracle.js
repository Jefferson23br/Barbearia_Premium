/* eslint-disable no-console */
require('dotenv').config();
const oracledb = require('oracledb');

function isAlreadyExistsError(error) {
  if (!error || typeof error.errorNum !== 'number') return false;
  return (
    error.errorNum === 955 || // ORA-00955 name already used
    error.errorNum === 1408 || // ORA-01408 column list already indexed
    error.errorNum === 2275 // ORA-02275 such a referential constraint already exists
  );
}

async function execDDL(conn, sql, label) {
  try {
    await conn.execute(sql);
    console.log(`✓ ${label}`);
  } catch (error) {
    if (isAlreadyExistsError(error)) {
      console.log(`~ ${label} (ja existe)`);
      return;
    }
    throw error;
  }
}

async function run() {
  const host = process.env.ORACLE_HOST;
  const port = process.env.ORACLE_PORT || '1521';
  const serviceName = process.env.ORACLE_SERVICE_NAME;
  const user = process.env.ORACLE_USER;
  const password = process.env.ORACLE_PASSWORD;

  if (!host || !serviceName || !user || !password) {
    throw new Error(
      'Variaveis ORACLE_HOST, ORACLE_SERVICE_NAME, ORACLE_USER e ORACLE_PASSWORD sao obrigatorias.'
    );
  }

  const connectString = `${host}:${port}/${serviceName}`;
  const conn = await oracledb.getConnection({ user, password, connectString });

  try {
    console.log(`Conectado ao Oracle: ${connectString}`);

    await execDDL(
      conn,
      `CREATE TABLE filiais (
        id VARCHAR2(36) DEFAULT LOWER(REGEXP_REPLACE(RAWTOHEX(SYS_GUID()), '(.{8})(.{4})(.{4})(.{4})(.{12})', '\\1-\\2-\\3-\\4-\\5')) PRIMARY KEY,
        nome VARCHAR2(120) NOT NULL,
        slug VARCHAR2(120) NOT NULL UNIQUE,
        dominio_landing VARCHAR2(255),
        ativo NUMBER(1) DEFAULT 1 NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      )`,
      'Tabela filiais'
    );

    await execDDL(
      conn,
      `CREATE TABLE usuarios (
        id VARCHAR2(36) DEFAULT LOWER(REGEXP_REPLACE(RAWTOHEX(SYS_GUID()), '(.{8})(.{4})(.{4})(.{4})(.{12})', '\\1-\\2-\\3-\\4-\\5')) PRIMARY KEY,
        filial_id VARCHAR2(36) NOT NULL,
        nome VARCHAR2(120) NOT NULL,
        email VARCHAR2(180) NOT NULL,
        senha_hash CLOB NOT NULL,
        papel VARCHAR2(30) NOT NULL,
        ativo NUMBER(1) DEFAULT 1 NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        CONSTRAINT fk_usuarios_filial FOREIGN KEY (filial_id) REFERENCES filiais(id),
        CONSTRAINT ck_usuarios_papel CHECK (papel IN ('proprietario', 'gestor', 'cliente')),
        CONSTRAINT uq_usuarios_filial_email UNIQUE (filial_id, email)
      )`,
      'Tabela usuarios'
    );

    await execDDL(
      conn,
      `CREATE TABLE clientes (
        id VARCHAR2(36) DEFAULT LOWER(REGEXP_REPLACE(RAWTOHEX(SYS_GUID()), '(.{8})(.{4})(.{4})(.{4})(.{12})', '\\1-\\2-\\3-\\4-\\5')) PRIMARY KEY,
        filial_id VARCHAR2(36) NOT NULL,
        usuario_id VARCHAR2(36) NOT NULL UNIQUE,
        telefone VARCHAR2(30),
        observacoes CLOB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        CONSTRAINT fk_clientes_filial FOREIGN KEY (filial_id) REFERENCES filiais(id),
        CONSTRAINT fk_clientes_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
      )`,
      'Tabela clientes'
    );

    await execDDL(
      conn,
      `CREATE TABLE servicos (
        id VARCHAR2(36) DEFAULT LOWER(REGEXP_REPLACE(RAWTOHEX(SYS_GUID()), '(.{8})(.{4})(.{4})(.{4})(.{12})', '\\1-\\2-\\3-\\4-\\5')) PRIMARY KEY,
        filial_id VARCHAR2(36) NOT NULL,
        nome VARCHAR2(120) NOT NULL,
        descricao CLOB,
        duracao_minutos NUMBER(6) DEFAULT 30 NOT NULL,
        valor NUMBER(12,2) DEFAULT 0 NOT NULL,
        ativo NUMBER(1) DEFAULT 1 NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        CONSTRAINT fk_servicos_filial FOREIGN KEY (filial_id) REFERENCES filiais(id),
        CONSTRAINT ck_servicos_duracao CHECK (duracao_minutos > 0),
        CONSTRAINT ck_servicos_valor CHECK (valor >= 0)
      )`,
      'Tabela servicos'
    );

    await execDDL(
      conn,
      `CREATE TABLE agendamentos (
        id VARCHAR2(36) DEFAULT LOWER(REGEXP_REPLACE(RAWTOHEX(SYS_GUID()), '(.{8})(.{4})(.{4})(.{4})(.{12})', '\\1-\\2-\\3-\\4-\\5')) PRIMARY KEY,
        filial_id VARCHAR2(36) NOT NULL,
        cliente_id VARCHAR2(36) NOT NULL,
        servico_id VARCHAR2(36) NOT NULL,
        data_hora_inicio TIMESTAMP NOT NULL,
        data_hora_fim TIMESTAMP NOT NULL,
        status VARCHAR2(30) DEFAULT 'agendado' NOT NULL,
        observacoes CLOB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        CONSTRAINT fk_agend_filial FOREIGN KEY (filial_id) REFERENCES filiais(id),
        CONSTRAINT fk_agend_cliente FOREIGN KEY (cliente_id) REFERENCES clientes(id),
        CONSTRAINT fk_agend_servico FOREIGN KEY (servico_id) REFERENCES servicos(id),
        CONSTRAINT ck_agend_status CHECK (status IN ('agendado', 'confirmado', 'concluido', 'cancelado')),
        CONSTRAINT ck_agend_intervalo CHECK (data_hora_fim > data_hora_inicio)
      )`,
      'Tabela agendamentos'
    );

    await execDDL(
      conn,
      `CREATE TABLE vendas (
        id VARCHAR2(36) DEFAULT LOWER(REGEXP_REPLACE(RAWTOHEX(SYS_GUID()), '(.{8})(.{4})(.{4})(.{4})(.{12})', '\\1-\\2-\\3-\\4-\\5')) PRIMARY KEY,
        filial_id VARCHAR2(36) NOT NULL,
        cliente_id VARCHAR2(36),
        agendamento_id VARCHAR2(36),
        valor_bruto NUMBER(12,2) DEFAULT 0 NOT NULL,
        desconto NUMBER(12,2) DEFAULT 0 NOT NULL,
        valor_liquido NUMBER(12,2) DEFAULT 0 NOT NULL,
        forma_pagamento VARCHAR2(30) DEFAULT 'pix' NOT NULL,
        status VARCHAR2(30) DEFAULT 'paga' NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        CONSTRAINT fk_vendas_filial FOREIGN KEY (filial_id) REFERENCES filiais(id),
        CONSTRAINT fk_vendas_cliente FOREIGN KEY (cliente_id) REFERENCES clientes(id),
        CONSTRAINT fk_vendas_agendamento FOREIGN KEY (agendamento_id) REFERENCES agendamentos(id),
        CONSTRAINT ck_vendas_valores CHECK (valor_bruto >= 0 AND desconto >= 0 AND valor_liquido >= 0),
        CONSTRAINT ck_vendas_pagamento CHECK (forma_pagamento IN ('dinheiro', 'pix', 'cartao', 'boleto', 'transferencia')),
        CONSTRAINT ck_vendas_status CHECK (status IN ('pendente', 'paga', 'cancelada'))
      )`,
      'Tabela vendas'
    );

    await execDDL(
      conn,
      `CREATE TABLE storage_arquivos (
        id VARCHAR2(36) DEFAULT LOWER(REGEXP_REPLACE(RAWTOHEX(SYS_GUID()), '(.{8})(.{4})(.{4})(.{4})(.{12})', '\\1-\\2-\\3-\\4-\\5')) PRIMARY KEY,
        filial_id VARCHAR2(36),
        uploader_usuario_id VARCHAR2(36),
        entidade_tipo VARCHAR2(50) NOT NULL,
        entidade_id VARCHAR2(36),
        bucket VARCHAR2(50) DEFAULT 'uploads' NOT NULL,
        diretorio_relativo VARCHAR2(255) NOT NULL,
        nome_original VARCHAR2(255) NOT NULL,
        nome_armazenado VARCHAR2(255) NOT NULL,
        mime_type VARCHAR2(120),
        tamanho_bytes NUMBER(20) DEFAULT 0 NOT NULL,
        checksum_sha256 VARCHAR2(64),
        url_publica CLOB,
        ativo NUMBER(1) DEFAULT 1 NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        CONSTRAINT fk_storage_filial FOREIGN KEY (filial_id) REFERENCES filiais(id),
        CONSTRAINT fk_storage_uploader FOREIGN KEY (uploader_usuario_id) REFERENCES usuarios(id),
        CONSTRAINT ck_storage_tamanho CHECK (tamanho_bytes >= 0)
      )`,
      'Tabela storage_arquivos'
    );

    await execDDL(conn, 'CREATE INDEX idx_usuarios_filial ON usuarios(filial_id)', 'Indice idx_usuarios_filial');
    await execDDL(conn, 'CREATE INDEX idx_clientes_filial ON clientes(filial_id)', 'Indice idx_clientes_filial');
    await execDDL(conn, 'CREATE INDEX idx_servicos_filial ON servicos(filial_id)', 'Indice idx_servicos_filial');
    await execDDL(
      conn,
      'CREATE INDEX idx_agendamentos_filial_data ON agendamentos(filial_id, data_hora_inicio)',
      'Indice idx_agendamentos_filial_data'
    );
    await execDDL(conn, 'CREATE INDEX idx_vendas_filial_data ON vendas(filial_id, created_at)', 'Indice idx_vendas_filial_data');
    await execDDL(conn, 'CREATE INDEX idx_storage_filial ON storage_arquivos(filial_id)', 'Indice idx_storage_filial');
    await execDDL(
      conn,
      'CREATE INDEX idx_storage_entidade ON storage_arquivos(entidade_tipo, entidade_id)',
      'Indice idx_storage_entidade'
    );
    await execDDL(
      conn,
      'CREATE UNIQUE INDEX uq_storage_nome_armazenado ON storage_arquivos(bucket, diretorio_relativo, nome_armazenado)',
      'Indice unico uq_storage_nome_armazenado'
    );

    await conn.execute(
      `MERGE INTO filiais f
       USING (SELECT 'matriz' slug FROM dual) src
          ON (f.slug = src.slug)
       WHEN NOT MATCHED THEN
         INSERT (id, nome, slug, dominio_landing, ativo, created_at, updated_at)
         VALUES (
           LOWER(REGEXP_REPLACE(RAWTOHEX(SYS_GUID()), '(.{8})(.{4})(.{4})(.{4})(.{12})', '\\1-\\2-\\3-\\4-\\5')),
           'Barbearia Premium Matriz',
           'matriz',
           'appbarber.auctusconsultoria.com.br',
           1,
           CURRENT_TIMESTAMP,
           CURRENT_TIMESTAMP
         )`
    );
    console.log('✓ Seed filial matriz');

    await conn.commit();
    console.log('Bootstrap Oracle concluido.');
  } finally {
    await conn.close();
  }
}

run().catch((error) => {
  console.error('Falha no bootstrap Oracle:', error);
  process.exit(1);
});
