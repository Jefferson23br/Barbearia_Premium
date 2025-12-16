-- Adicionar permissões individuais para cada relatório na tabela protese.permissoes_usuarios
-- Cada relatório terá sua própria permissão de visualização

-- Relatórios de Receitas/Vendas
ALTER TABLE protese.permissoes_usuarios 
ADD COLUMN IF NOT EXISTS vendas_totais_ver BOOLEAN DEFAULT false NULL;

ALTER TABLE protese.permissoes_usuarios 
ADD COLUMN IF NOT EXISTS vendas_por_servico_ver BOOLEAN DEFAULT false NULL;

ALTER TABLE protese.permissoes_usuarios 
ADD COLUMN IF NOT EXISTS vendas_por_produto_ver BOOLEAN DEFAULT false NULL;

ALTER TABLE protese.permissoes_usuarios 
ADD COLUMN IF NOT EXISTS vendas_por_funcionario_totais_ver BOOLEAN DEFAULT false NULL;

ALTER TABLE protese.permissoes_usuarios 
ADD COLUMN IF NOT EXISTS vendas_por_funcionario_separado_ver BOOLEAN DEFAULT false NULL;

ALTER TABLE protese.permissoes_usuarios 
ADD COLUMN IF NOT EXISTS vendas_por_funcionario_tipo_ver BOOLEAN DEFAULT false NULL;

-- Relatórios de Despesas
ALTER TABLE protese.permissoes_usuarios 
ADD COLUMN IF NOT EXISTS despesas_totais_ver BOOLEAN DEFAULT false NULL;

ALTER TABLE protese.permissoes_usuarios 
ADD COLUMN IF NOT EXISTS despesas_por_tipo_ver BOOLEAN DEFAULT false NULL;

-- Relatórios de Produtos
ALTER TABLE protese.permissoes_usuarios 
ADD COLUMN IF NOT EXISTS produtos_estoque_ver BOOLEAN DEFAULT false NULL;

ALTER TABLE protese.permissoes_usuarios 
ADD COLUMN IF NOT EXISTS produtos_vendidos_ver BOOLEAN DEFAULT false NULL;

-- Relatórios de Clientes
ALTER TABLE protese.permissoes_usuarios 
ADD COLUMN IF NOT EXISTS clientes_compras_ver BOOLEAN DEFAULT false NULL;

-- Adicionar comentários nas colunas
COMMENT ON COLUMN protese.permissoes_usuarios.vendas_totais_ver IS 'Permissão para visualizar relatório de Vendas Totais';
COMMENT ON COLUMN protese.permissoes_usuarios.vendas_por_servico_ver IS 'Permissão para visualizar relatório de Vendas por Serviço';
COMMENT ON COLUMN protese.permissoes_usuarios.vendas_por_produto_ver IS 'Permissão para visualizar relatório de Vendas por Produto';
COMMENT ON COLUMN protese.permissoes_usuarios.vendas_por_funcionario_totais_ver IS 'Permissão para visualizar relatório de Vendas por Funcionário (Totais)';
COMMENT ON COLUMN protese.permissoes_usuarios.vendas_por_funcionario_separado_ver IS 'Permissão para visualizar relatório de Vendas por Funcionário (Separado)';
COMMENT ON COLUMN protese.permissoes_usuarios.vendas_por_funcionario_tipo_ver IS 'Permissão para visualizar relatório de Vendas por Funcionário/Tipo';
COMMENT ON COLUMN protese.permissoes_usuarios.despesas_totais_ver IS 'Permissão para visualizar relatório de Despesas Totais';
COMMENT ON COLUMN protese.permissoes_usuarios.despesas_por_tipo_ver IS 'Permissão para visualizar relatório de Despesas por Tipo';
COMMENT ON COLUMN protese.permissoes_usuarios.produtos_estoque_ver IS 'Permissão para visualizar relatório de Produtos em Estoque';
COMMENT ON COLUMN protese.permissoes_usuarios.produtos_vendidos_ver IS 'Permissão para visualizar relatório de Produtos Vendidos';
COMMENT ON COLUMN protese.permissoes_usuarios.clientes_compras_ver IS 'Permissão para visualizar relatório de Histórico de Clientes';

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_permissoes_vendas_totais_ver ON protese.permissoes_usuarios USING btree (vendas_totais_ver);
CREATE INDEX IF NOT EXISTS idx_permissoes_vendas_por_servico_ver ON protese.permissoes_usuarios USING btree (vendas_por_servico_ver);
CREATE INDEX IF NOT EXISTS idx_permissoes_vendas_por_produto_ver ON protese.permissoes_usuarios USING btree (vendas_por_produto_ver);
CREATE INDEX IF NOT EXISTS idx_permissoes_vendas_por_funcionario_totais_ver ON protese.permissoes_usuarios USING btree (vendas_por_funcionario_totais_ver);
CREATE INDEX IF NOT EXISTS idx_permissoes_vendas_por_funcionario_separado_ver ON protese.permissoes_usuarios USING btree (vendas_por_funcionario_separado_ver);
CREATE INDEX IF NOT EXISTS idx_permissoes_vendas_por_funcionario_tipo_ver ON protese.permissoes_usuarios USING btree (vendas_por_funcionario_tipo_ver);
CREATE INDEX IF NOT EXISTS idx_permissoes_despesas_totais_ver ON protese.permissoes_usuarios USING btree (despesas_totais_ver);
CREATE INDEX IF NOT EXISTS idx_permissoes_despesas_por_tipo_ver ON protese.permissoes_usuarios USING btree (despesas_por_tipo_ver);
CREATE INDEX IF NOT EXISTS idx_permissoes_produtos_estoque_ver ON protese.permissoes_usuarios USING btree (produtos_estoque_ver);
CREATE INDEX IF NOT EXISTS idx_permissoes_produtos_vendidos_ver ON protese.permissoes_usuarios USING btree (produtos_vendidos_ver);
CREATE INDEX IF NOT EXISTS idx_permissoes_clientes_compras_ver ON protese.permissoes_usuarios USING btree (clientes_compras_ver);

-- Atualizar permissões existentes de Master para ter acesso a todos os relatórios
-- Apenas Master tem acesso total por padrão
UPDATE protese.permissoes_usuarios pu
SET 
  vendas_totais_ver = true,
  vendas_por_servico_ver = true,
  vendas_por_produto_ver = true,
  vendas_por_funcionario_totais_ver = true,
  vendas_por_funcionario_separado_ver = true,
  vendas_por_funcionario_tipo_ver = true,
  despesas_totais_ver = true,
  despesas_por_tipo_ver = true,
  produtos_estoque_ver = true,
  produtos_vendidos_ver = true,
  clientes_compras_ver = true
FROM protese.usuarios_administrativos ua
WHERE pu.usuario_id = ua.id 
  AND ua.tipo_usuario = 'master';

