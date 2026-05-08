-- Remover duplicatas do DocSales no módulo "Serviços de Integração"
-- Este script remove qualquer item duplicado relacionado ao DocSales

-- 1. Identificar todos os itens DocSales (para debug)
SELECT 
    mi.id,
    mi.item_id,
    mi.item_label,
    mi.item_path,
    m.nome as modulo_nome
FROM protese.modulos_itens mi
JOIN protese.modulos m ON mi.modulo_id = m.id
WHERE mi.item_id = 'servico_docsales'
   OR mi.item_label ILIKE '%DocSales%'
   OR mi.item_path ILIKE '%docsales%'
ORDER BY m.nome, mi.item_id;

-- 2. Remover TODOS os itens DocSales do módulo "Serviços de Integração" (vamos recriar depois)
DELETE FROM protese.modulos_itens
WHERE modulo_id IN (
    SELECT id FROM protese.modulos WHERE nome = 'Serviços de Integração'
)
AND (
    item_id = 'servico_docsales'
    OR item_label ILIKE '%DocSales%'
    OR item_path ILIKE '%docsales%'
    OR item_path = '/dashboard/servicos-integracao/docsales'
);

-- 3. Remover itens DocSales de outros módulos (caso existam)
DELETE FROM protese.modulos_itens
WHERE (
    item_id = 'servico_docsales'
    OR item_path = '/dashboard/servicos-integracao/docsales'
    OR (item_label ILIKE '%DocSales%' AND item_path ILIKE '%docsales%')
)
AND modulo_id NOT IN (
    SELECT id FROM protese.modulos WHERE nome = 'Serviços de Integração'
);

-- 4. Remover qualquer item com path duplicado relacionado ao DocSales
-- Manter apenas o primeiro (menor id) de cada path
DELETE FROM protese.modulos_itens
WHERE id IN (
    SELECT id
    FROM (
        SELECT id,
               ROW_NUMBER() OVER (PARTITION BY item_path ORDER BY id) as rn
        FROM protese.modulos_itens
        WHERE item_path = '/dashboard/servicos-integracao/docsales'
          AND modulo_id IN (SELECT id FROM protese.modulos WHERE nome = 'Serviços de Integração')
    ) sub
    WHERE rn > 1
);

-- 5. Garantir que existe apenas um item DocSales no módulo "Serviços de Integração"
INSERT INTO protese.modulos_itens (modulo_id, item_id, item_label, item_path, item_icon, ordem, ativo)
SELECT 
    m.id,
    'servico_docsales',
    'DocSales',
    '/dashboard/servicos-integracao/docsales',
    'FileSignature',
    9,
    true
FROM protese.modulos m 
WHERE m.nome = 'Serviços de Integração'
  AND NOT EXISTS (
      SELECT 1 FROM protese.modulos_itens mi
      WHERE mi.item_id = 'servico_docsales'
        AND mi.modulo_id = m.id
        AND mi.item_path = '/dashboard/servicos-integracao/docsales'
  )
ON CONFLICT (item_id) DO UPDATE
SET modulo_id = EXCLUDED.modulo_id,
    item_label = EXCLUDED.item_label,
    item_path = EXCLUDED.item_path,
    item_icon = EXCLUDED.item_icon,
    ordem = EXCLUDED.ordem,
    ativo = EXCLUDED.ativo;

-- 6. Verificar resultado final - deve retornar apenas 1 item
SELECT 
    mi.id,
    mi.item_id,
    mi.item_label,
    mi.item_path,
    m.nome as modulo_nome
FROM protese.modulos_itens mi
JOIN protese.modulos m ON mi.modulo_id = m.id
WHERE mi.item_id = 'servico_docsales'
   OR (mi.item_label ILIKE '%DocSales%' AND mi.item_path ILIKE '%docsales%')
ORDER BY m.nome, mi.item_id;

