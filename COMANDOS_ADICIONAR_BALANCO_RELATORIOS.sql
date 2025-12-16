-- Adicionar Balanço Demonstrativo ao módulo Relatórios
-- Primeiro, remover se já existir (caso tenha sido criado como item individual)
DELETE FROM protese.modulos_itens WHERE item_id = 'balanco_demonstrativo';

-- Inserir Balanço Demonstrativo no módulo Relatórios
INSERT INTO protese.modulos_itens (modulo_id, item_id, item_label, item_path, item_icon, ordem, ativo)
SELECT 
    m.id,
    'balanco_demonstrativo',
    'Balanço Demonstrativo',
    '/dashboard/balanco-demonstrativo',
    'FileBarChart',
    2, -- Ordem 2, depois de Emissão de Relatórios
    true
FROM protese.modulos m 
WHERE m.nome = 'Relatórios'
ON CONFLICT (item_id) DO UPDATE SET
    modulo_id = EXCLUDED.modulo_id,
    item_label = EXCLUDED.item_label,
    item_path = EXCLUDED.item_path,
    item_icon = EXCLUDED.item_icon,
    ordem = EXCLUDED.ordem,
    updated_at = NOW();

