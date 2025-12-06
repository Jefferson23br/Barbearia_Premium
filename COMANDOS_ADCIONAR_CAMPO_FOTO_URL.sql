-- ============================================================
-- COMANDOS PARA ADICIONAR CAMPO foto_url
-- Sistema: Prótese Capilar Cuiabá
-- Execute cada comando separadamente, na ordem apresentada
-- ============================================================

-- ============================================================
-- PASSO 1: Adicionar campo foto_url na tabela usuarios_clientes
-- ============================================================

ALTER TABLE protese.usuarios_clientes
    ADD COLUMN IF NOT EXISTS foto_url VARCHAR(500);

-- Adicionar comentário para documentação
COMMENT ON COLUMN protese.usuarios_clientes.foto_url IS 'URL da foto de perfil do cliente';

-- ============================================================
-- PASSO 2: Adicionar campo foto_url na tabela usuarios_administrativos
-- ============================================================

ALTER TABLE protese.usuarios_administrativos
    ADD COLUMN IF NOT EXISTS foto_url VARCHAR(500);

-- Adicionar comentário para documentação
COMMENT ON COLUMN protese.usuarios_administrativos.foto_url IS 'URL da foto de perfil do usuário administrativo';

-- ============================================================
-- PASSO 3: Criar índice para facilitar buscas por foto_url (opcional)
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_usuarios_clientes_foto_url 
    ON protese.usuarios_clientes(foto_url) 
    WHERE foto_url IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_usuarios_admin_foto_url 
    ON protese.usuarios_administrativos(foto_url) 
    WHERE foto_url IS NOT NULL;

-- ============================================================
-- VERIFICAÇÃO: Verificar se os campos foram adicionados
-- ============================================================

-- Verificar estrutura da tabela usuarios_clientes
SELECT column_name, data_type, character_maximum_length 
FROM information_schema.columns 
WHERE table_schema = 'protese' 
  AND table_name = 'usuarios_clientes' 
  AND column_name = 'foto_url';

-- Verificar estrutura da tabela usuarios_administrativos
SELECT column_name, data_type, character_maximum_length 
FROM information_schema.columns 
WHERE table_schema = 'protese' 
  AND table_name = 'usuarios_administrativos' 
  AND column_name = 'foto_url';

