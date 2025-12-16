-- Adicionar campo controle_relatorios_ver na tabela protese.permissoes_usuarios
-- Este campo controla se o usuário pode visualizar e usar relatórios

-- Adicionar coluna controle_relatorios_ver
ALTER TABLE protese.permissoes_usuarios 
ADD COLUMN IF NOT EXISTS controle_relatorios_ver BOOLEAN DEFAULT false NULL;

-- Adicionar comentário na coluna
COMMENT ON COLUMN protese.permissoes_usuarios.controle_relatorios_ver IS 'Permissão para visualizar e usar relatórios (Emissão de Relatórios e Balanço Demonstrativo)';

-- Criar índice para melhor performance
CREATE INDEX IF NOT EXISTS idx_permissoes_controle_relatorios_ver 
ON protese.permissoes_usuarios USING btree (controle_relatorios_ver);

-- Atualizar permissões existentes de Master para ter acesso
UPDATE protese.permissoes_usuarios pu
SET controle_relatorios_ver = true
FROM protese.usuarios_administrativos ua
WHERE pu.usuario_id = ua.id 
  AND ua.tipo_usuario = 'master';

-- Atualizar permissões existentes de Proprietário para ter acesso
UPDATE protese.permissoes_usuarios pu
SET controle_relatorios_ver = true
FROM protese.usuarios_administrativos ua
WHERE pu.usuario_id = ua.id 
  AND ua.tipo_usuario = 'proprietario';

