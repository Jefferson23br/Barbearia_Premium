-- ============================================================
-- ADICIONAR CAMPO: funcionario_responsavel_id
-- Descrição: Adiciona campo para associar um funcionário responsável a cada cliente
-- ============================================================

-- 1. Adicionar coluna funcionario_responsavel_id na tabela usuarios_clientes
ALTER TABLE protese.usuarios_clientes
ADD COLUMN IF NOT EXISTS funcionario_responsavel_id UUID NULL;

-- 2. Adicionar foreign key para usuarios_administrativos
ALTER TABLE protese.usuarios_clientes
ADD CONSTRAINT fk_funcionario_responsavel
FOREIGN KEY (funcionario_responsavel_id)
REFERENCES protese.usuarios_administrativos(id)
ON DELETE SET NULL;

-- 3. Criar índice para melhor performance nas consultas
CREATE INDEX IF NOT EXISTS idx_cliente_funcionario_responsavel 
ON protese.usuarios_clientes(funcionario_responsavel_id);

-- Comentário
COMMENT ON COLUMN protese.usuarios_clientes.funcionario_responsavel_id IS 'ID do funcionário responsável por este cliente (FK para usuarios_administrativos.id)';

-- Verificar se foi aplicado corretamente
-- \d protese.usuarios_clientes






