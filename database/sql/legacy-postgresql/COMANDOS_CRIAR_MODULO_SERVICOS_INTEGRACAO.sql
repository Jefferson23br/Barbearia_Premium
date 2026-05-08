-- Criar módulo "Serviços de Integração" com itens para cada integração
-- Este módulo será separado do módulo "Integrações"

-- 1. Criar o módulo "Serviços de Integração"
INSERT INTO protese.modulos (nome, icone, ordem, ativo)
VALUES ('Serviços de Integração', 'Settings', 9, true)
ON CONFLICT (nome) DO UPDATE
SET icone = EXCLUDED.icone,
    ordem = EXCLUDED.ordem,
    ativo = EXCLUDED.ativo;

-- 2. Adicionar itens de menu para cada integração
-- Focus NFe
INSERT INTO protese.modulos_itens (modulo_id, item_id, item_label, item_path, item_icon, ordem, ativo)
SELECT 
    m.id,
    'servico_focus_nfe',
    'Focus NFe',
    '/dashboard/servicos-integracao/focus-nfe',
    'FileText',
    1,
    true
FROM protese.modulos m 
WHERE m.nome = 'Serviços de Integração'
ON CONFLICT (item_id) DO UPDATE
SET modulo_id = EXCLUDED.modulo_id,
    item_label = EXCLUDED.item_label,
    item_path = EXCLUDED.item_path,
    item_icon = EXCLUDED.item_icon,
    ordem = EXCLUDED.ordem,
    ativo = EXCLUDED.ativo;

-- PLUG NFe
INSERT INTO protese.modulos_itens (modulo_id, item_id, item_label, item_path, item_icon, ordem, ativo)
SELECT 
    m.id,
    'servico_plug_nfe',
    'PLUG NFe',
    '/dashboard/servicos-integracao/plug-nfe',
    'Plug',
    2,
    true
FROM protese.modulos m 
WHERE m.nome = 'Serviços de Integração'
ON CONFLICT (item_id) DO UPDATE
SET modulo_id = EXCLUDED.modulo_id,
    item_label = EXCLUDED.item_label,
    item_path = EXCLUDED.item_path,
    item_icon = EXCLUDED.item_icon,
    ordem = EXCLUDED.ordem,
    ativo = EXCLUDED.ativo;

-- Asaas
INSERT INTO protese.modulos_itens (modulo_id, item_id, item_label, item_path, item_icon, ordem, ativo)
SELECT 
    m.id,
    'servico_asaas',
    'Asaas',
    '/dashboard/servicos-integracao/asaas',
    'CreditCard',
    3,
    true
FROM protese.modulos m 
WHERE m.nome = 'Serviços de Integração'
ON CONFLICT (item_id) DO UPDATE
SET modulo_id = EXCLUDED.modulo_id,
    item_label = EXCLUDED.item_label,
    item_path = EXCLUDED.item_path,
    item_icon = EXCLUDED.item_icon,
    ordem = EXCLUDED.ordem,
    ativo = EXCLUDED.ativo;

-- Mercado Pago
INSERT INTO protese.modulos_itens (modulo_id, item_id, item_label, item_path, item_icon, ordem, ativo)
SELECT 
    m.id,
    'servico_mercado_pago',
    'Mercado Pago',
    '/dashboard/servicos-integracao/mercado-pago',
    'ShoppingCart',
    4,
    true
FROM protese.modulos m 
WHERE m.nome = 'Serviços de Integração'
ON CONFLICT (item_id) DO UPDATE
SET modulo_id = EXCLUDED.modulo_id,
    item_label = EXCLUDED.item_label,
    item_path = EXCLUDED.item_path,
    item_icon = EXCLUDED.item_icon,
    ordem = EXCLUDED.ordem,
    ativo = EXCLUDED.ativo;

-- PagSeguro
INSERT INTO protese.modulos_itens (modulo_id, item_id, item_label, item_path, item_icon, ordem, ativo)
SELECT 
    m.id,
    'servico_pagseguro',
    'PagSeguro',
    '/dashboard/servicos-integracao/pagseguro',
    'Banknote',
    5,
    true
FROM protese.modulos m 
WHERE m.nome = 'Serviços de Integração'
ON CONFLICT (item_id) DO UPDATE
SET modulo_id = EXCLUDED.modulo_id,
    item_label = EXCLUDED.item_label,
    item_path = EXCLUDED.item_path,
    item_icon = EXCLUDED.item_icon,
    ordem = EXCLUDED.ordem,
    ativo = EXCLUDED.ativo;

-- Twilio
INSERT INTO protese.modulos_itens (modulo_id, item_id, item_label, item_path, item_icon, ordem, ativo)
SELECT 
    m.id,
    'servico_twilio',
    'Twilio',
    '/dashboard/servicos-integracao/twilio',
    'MessageSquare',
    6,
    true
FROM protese.modulos m 
WHERE m.nome = 'Serviços de Integração'
ON CONFLICT (item_id) DO UPDATE
SET modulo_id = EXCLUDED.modulo_id,
    item_label = EXCLUDED.item_label,
    item_path = EXCLUDED.item_path,
    item_icon = EXCLUDED.item_icon,
    ordem = EXCLUDED.ordem,
    ativo = EXCLUDED.ativo;

-- WhatsApp
INSERT INTO protese.modulos_itens (modulo_id, item_id, item_label, item_path, item_icon, ordem, ativo)
SELECT 
    m.id,
    'servico_whatsapp',
    'WhatsApp',
    '/dashboard/servicos-integracao/whatsapp',
    'MessageCircle',
    7,
    true
FROM protese.modulos m 
WHERE m.nome = 'Serviços de Integração'
ON CONFLICT (item_id) DO UPDATE
SET modulo_id = EXCLUDED.modulo_id,
    item_label = EXCLUDED.item_label,
    item_path = EXCLUDED.item_path,
    item_icon = EXCLUDED.item_icon,
    ordem = EXCLUDED.ordem,
    ativo = EXCLUDED.ativo;

-- SendGrid
INSERT INTO protese.modulos_itens (modulo_id, item_id, item_label, item_path, item_icon, ordem, ativo)
SELECT 
    m.id,
    'servico_sendgrid',
    'SendGrid',
    '/dashboard/servicos-integracao/sendgrid',
    'Mail',
    8,
    true
FROM protese.modulos m 
WHERE m.nome = 'Serviços de Integração'
ON CONFLICT (item_id) DO UPDATE
SET modulo_id = EXCLUDED.modulo_id,
    item_label = EXCLUDED.item_label,
    item_path = EXCLUDED.item_path,
    item_icon = EXCLUDED.item_icon,
    ordem = EXCLUDED.ordem,
    ativo = EXCLUDED.ativo;

-- DocSales
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
ON CONFLICT (item_id) DO UPDATE
SET modulo_id = EXCLUDED.modulo_id,
    item_label = EXCLUDED.item_label,
    item_path = EXCLUDED.item_path,
    item_icon = EXCLUDED.item_icon,
    ordem = EXCLUDED.ordem,
    ativo = EXCLUDED.ativo;

-- Clicksign
INSERT INTO protese.modulos_itens (modulo_id, item_id, item_label, item_path, item_icon, ordem, ativo)
SELECT 
    m.id,
    'servico_clicksign',
    'Clicksign',
    '/dashboard/servicos-integracao/clicksign',
    'PenTool',
    10,
    true
FROM protese.modulos m 
WHERE m.nome = 'Serviços de Integração'
ON CONFLICT (item_id) DO UPDATE
SET modulo_id = EXCLUDED.modulo_id,
    item_label = EXCLUDED.item_label,
    item_path = EXCLUDED.item_path,
    item_icon = EXCLUDED.item_icon,
    ordem = EXCLUDED.ordem,
    ativo = EXCLUDED.ativo;

-- Remover o item "Serviços de Integração" do módulo "Integrações" se existir
DELETE FROM protese.modulos_itens 
WHERE item_id = 'servicos_integracao' 
  AND modulo_id IN (SELECT id FROM protese.modulos WHERE nome = 'Integrações');

