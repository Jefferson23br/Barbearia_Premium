-- Adicionar "Serviços de Integração" como item dentro do módulo "Integrações"
-- Esta página lista todas as integrações disponíveis para uso e configuração

-- Adicionar item "Serviços de Integração" dentro do módulo "Integrações"
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

