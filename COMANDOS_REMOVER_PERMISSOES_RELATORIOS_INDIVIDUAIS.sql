-- Script para remover campos de permissões de relatórios individuais
-- Mantém apenas emissao_relatorios_ver, emissao_relatorios_editar, emissao_relatorios_excluir

-- Remover índices relacionados
DROP INDEX IF EXISTS protese.idx_permissoes_clientes_compras_ver;
DROP INDEX IF EXISTS protese.idx_permissoes_controle_relatorios_ver;
DROP INDEX IF EXISTS protese.idx_permissoes_despesas_por_tipo_ver;
DROP INDEX IF EXISTS protese.idx_permissoes_despesas_totais_ver;
DROP INDEX IF EXISTS protese.idx_permissoes_produtos_estoque_ver;
DROP INDEX IF EXISTS protese.idx_permissoes_produtos_vendidos_ver;
DROP INDEX IF EXISTS protese.idx_permissoes_vendas_por_funcionario_separado_ver;
DROP INDEX IF EXISTS protese.idx_permissoes_vendas_por_funcionario_tipo_ver;
DROP INDEX IF EXISTS protese.idx_permissoes_vendas_por_funcionario_totais_ver;
DROP INDEX IF EXISTS protese.idx_permissoes_vendas_por_produto_ver;
DROP INDEX IF EXISTS protese.idx_permissoes_vendas_por_servico_ver;
DROP INDEX IF EXISTS protese.idx_permissoes_vendas_totais_ver;

-- Remover colunas de permissões de relatórios individuais
ALTER TABLE protese.permissoes_usuarios 
  DROP COLUMN IF EXISTS controle_relatorios_ver,
  DROP COLUMN IF EXISTS vendas_totais_ver,
  DROP COLUMN IF EXISTS vendas_por_servico_ver,
  DROP COLUMN IF EXISTS vendas_por_produto_ver,
  DROP COLUMN IF EXISTS vendas_por_funcionario_totais_ver,
  DROP COLUMN IF EXISTS vendas_por_funcionario_separado_ver,
  DROP COLUMN IF EXISTS vendas_por_funcionario_tipo_ver,
  DROP COLUMN IF EXISTS despesas_totais_ver,
  DROP COLUMN IF EXISTS despesas_por_tipo_ver,
  DROP COLUMN IF EXISTS produtos_estoque_ver,
  DROP COLUMN IF EXISTS produtos_vendidos_ver,
  DROP COLUMN IF EXISTS clientes_compras_ver;

-- Verificar se as colunas foram removidas
SELECT column_name 
FROM information_schema.columns 
WHERE table_schema = 'protese' 
  AND table_name = 'permissoes_usuarios'
  AND column_name LIKE '%relatorios%' OR column_name LIKE '%vendas_%' OR column_name LIKE '%despesas_%' OR column_name LIKE '%produtos_%' OR column_name LIKE '%clientes_%'
ORDER BY column_name;

