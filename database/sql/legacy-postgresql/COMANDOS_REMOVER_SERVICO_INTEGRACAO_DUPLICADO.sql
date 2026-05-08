-- Remover módulo duplicado "Serviços de Integração" 
-- Mantendo apenas o item "Serviços de Integração" dentro do módulo "Integrações"

-- 1. Primeiro, remover todos os itens do módulo "Serviços de Integração" (se existir como módulo separado)
DELETE FROM protese.modulos_itens 
WHERE modulo_id IN (
    SELECT id FROM protese.modulos 
    WHERE nome = 'Serviços de Integração'
);

-- 2. Remover o módulo "Serviços de Integração" se existir como módulo separado
DELETE FROM protese.modulos 
WHERE nome = 'Serviços de Integração';

-- 3. Remover item duplicado "Serviço de Integração" (singular) se existir
DELETE FROM protese.modulos_itens 
WHERE item_id = 'servico_integracao' 
   OR (item_label ILIKE 'Serviço de Integração' AND item_id != 'servicos_integracao');

-- 4. Garantir que o item "Serviços de Integração" existe apenas dentro do módulo "Integrações"
-- Primeiro, remover se existir em outro lugar
DELETE FROM protese.modulos_itens 
WHERE item_id = 'servicos_integracao' 
  AND modulo_id NOT IN (
    SELECT id FROM protese.modulos WHERE nome = 'Integrações'
  );

-- 5. Garantir que o item "Serviços de Integração" existe no módulo "Integrações"
INSERT INTO protese.modulos_itens (modulo_id, item_id, item_label, item_path, item_icon, ordem, ativo)
SELECT 
    m.id,
    'servicos_integracao',
    'Serviços de Integração',
    '/dashboard/servicos-integracao',
    'Settings',
    3,
    true
FROM protese.modulos m 
WHERE m.nome = 'Integrações'
ON CONFLICT (item_id) DO UPDATE
SET modulo_id = EXCLUDED.modulo_id,
    item_label = EXCLUDED.item_label,
    item_path = EXCLUDED.item_path,
    item_icon = EXCLUDED.item_icon,
    ordem = EXCLUDED.ordem,
    ativo = EXCLUDED.ativo;

