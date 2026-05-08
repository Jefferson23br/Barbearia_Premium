-- protese.modulos definição
-- Tabela para organizar os módulos do sistema

-- Drop table
-- DROP TABLE IF EXISTS protese.modulos;

CREATE TABLE IF NOT EXISTS protese.modulos (
	id uuid DEFAULT gen_random_uuid() NOT NULL,
	nome varchar(100) NOT NULL,
	icone varchar(50) NULL,
	ordem integer NOT NULL,
	ativo bool DEFAULT true NOT NULL,
	created_at timestamp DEFAULT now() NULL,
	updated_at timestamp DEFAULT now() NULL,
	CONSTRAINT modulos_pkey PRIMARY KEY (id),
	CONSTRAINT modulos_nome_key UNIQUE (nome)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_modulos_ordem ON protese.modulos USING btree (ordem);
CREATE INDEX IF NOT EXISTS idx_modulos_ativo ON protese.modulos USING btree (ativo);

-- Tabela para relacionar módulos com itens do menu
CREATE TABLE IF NOT EXISTS protese.modulos_itens (
	id uuid DEFAULT gen_random_uuid() NOT NULL,
	modulo_id uuid NOT NULL,
	item_id varchar(100) NOT NULL, -- ID do item no frontend (ex: 'lancamento_despesa')
	item_label varchar(100) NOT NULL, -- Label do item (ex: 'Lançamento de Despesa')
	item_path varchar(200) NOT NULL, -- Path do item (ex: '/dashboard/lancamento-despesa')
	item_icon varchar(50) NULL, -- Nome do ícone do lucide-react
	ordem integer NOT NULL,
	ativo bool DEFAULT true NOT NULL,
	created_at timestamp DEFAULT now() NULL,
	updated_at timestamp DEFAULT now() NULL,
	CONSTRAINT modulos_itens_pkey PRIMARY KEY (id),
	CONSTRAINT modulos_itens_modulo_id_fkey FOREIGN KEY (modulo_id) REFERENCES protese.modulos(id) ON DELETE CASCADE,
	CONSTRAINT modulos_itens_item_id_key UNIQUE (item_id)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_modulos_itens_modulo_id ON protese.modulos_itens USING btree (modulo_id);
CREATE INDEX IF NOT EXISTS idx_modulos_itens_ordem ON protese.modulos_itens USING btree (ordem);

-- Permissions
ALTER TABLE protese.modulos OWNER TO protese_user;
ALTER TABLE protese.modulos_itens OWNER TO protese_user;
GRANT ALL ON TABLE protese.modulos TO protese_user;
GRANT ALL ON TABLE protese.modulos_itens TO protese_user;

-- Inserir módulos conforme especificação
INSERT INTO protese.modulos (nome, icone, ordem, ativo) VALUES
('Financeiro', 'Wallet', 1, true),
('Fiscal', 'FileCheck', 2, true),
('Operação', 'Package', 3, true),
('Estoque', 'Warehouse', 4, true),
('Marketing & Fidelização', 'Gift', 5, true),
('Relatórios', 'BarChart3', 6, true),
('Administração', 'Settings', 7, true),
('Integrações', 'Plug', 8, true)
ON CONFLICT (nome) DO NOTHING;

-- Inserir itens do módulo Financeiro
INSERT INTO protese.modulos_itens (modulo_id, item_id, item_label, item_path, item_icon, ordem, ativo)
SELECT 
    m.id,
    'lancamento_despesa',
    'Lançamento de Despesa',
    '/dashboard/lancamento-despesa',
    'TrendingDown',
    1,
    true
FROM protese.modulos m WHERE m.nome = 'Financeiro'
ON CONFLICT (item_id) DO NOTHING;

INSERT INTO protese.modulos_itens (modulo_id, item_id, item_label, item_path, item_icon, ordem, ativo)
SELECT 
    m.id,
    'receitas',
    'Receitas',
    '/dashboard/receitas',
    'TrendingUp',
    2,
    true
FROM protese.modulos m WHERE m.nome = 'Financeiro'
ON CONFLICT (item_id) DO NOTHING;

INSERT INTO protese.modulos_itens (modulo_id, item_id, item_label, item_path, item_icon, ordem, ativo)
SELECT 
    m.id,
    'despesas',
    'Despesas',
    '/dashboard/despesas',
    'FileText',
    3,
    true
FROM protese.modulos m WHERE m.nome = 'Financeiro'
ON CONFLICT (item_id) DO NOTHING;

INSERT INTO protese.modulos_itens (modulo_id, item_id, item_label, item_path, item_icon, ordem, ativo)
SELECT 
    m.id,
    'faturamento',
    'Faturamento',
    '/dashboard/faturamento',
    'Receipt',
    4,
    true
FROM protese.modulos m WHERE m.nome = 'Financeiro'
ON CONFLICT (item_id) DO NOTHING;

INSERT INTO protese.modulos_itens (modulo_id, item_id, item_label, item_path, item_icon, ordem, ativo)
SELECT 
    m.id,
    'caixas',
    'Caixas',
    '/dashboard/caixas',
    'Wallet',
    5,
    true
FROM protese.modulos m WHERE m.nome = 'Financeiro'
ON CONFLICT (item_id) DO NOTHING;

-- Inserir itens do módulo Fiscal
INSERT INTO protese.modulos_itens (modulo_id, item_id, item_label, item_path, item_icon, ordem, ativo)
SELECT 
    m.id,
    'emissao_nfe',
    'Emissão de Nota Fiscal',
    '/dashboard/emissao-nfe',
    'FileCheck',
    1,
    true
FROM protese.modulos m WHERE m.nome = 'Fiscal'
ON CONFLICT (item_id) DO NOTHING;

-- Inserir itens do módulo Operação
INSERT INTO protese.modulos_itens (modulo_id, item_id, item_label, item_path, item_icon, ordem, ativo)
SELECT 
    m.id,
    'servicos',
    'Serviços',
    '/dashboard/servicos',
    'Scissors',
    1,
    true
FROM protese.modulos m WHERE m.nome = 'Operação'
ON CONFLICT (item_id) DO NOTHING;

INSERT INTO protese.modulos_itens (modulo_id, item_id, item_label, item_path, item_icon, ordem, ativo)
SELECT 
    m.id,
    'produtos',
    'Produtos',
    '/dashboard/produtos',
    'Package',
    2,
    true
FROM protese.modulos m WHERE m.nome = 'Operação'
ON CONFLICT (item_id) DO NOTHING;

-- Inserir itens do módulo Estoque
INSERT INTO protese.modulos_itens (modulo_id, item_id, item_label, item_path, item_icon, ordem, ativo)
SELECT 
    m.id,
    'estoque',
    'Estoque',
    '/dashboard/estoque',
    'Warehouse',
    1,
    true
FROM protese.modulos m WHERE m.nome = 'Estoque'
ON CONFLICT (item_id) DO NOTHING;

-- Inserir itens do módulo Marketing & Fidelização
INSERT INTO protese.modulos_itens (modulo_id, item_id, item_label, item_path, item_icon, ordem, ativo)
SELECT 
    m.id,
    'cupons_fidelidades',
    'Cupons e Fidelidades',
    '/dashboard/cupons-fidelidades',
    'FileCheck',
    1,
    true
FROM protese.modulos m WHERE m.nome = 'Marketing & Fidelização'
ON CONFLICT (item_id) DO NOTHING;

-- Inserir itens do módulo Relatórios
INSERT INTO protese.modulos_itens (modulo_id, item_id, item_label, item_path, item_icon, ordem, ativo)
SELECT 
    m.id,
    'emissao_relatorios',
    'Emissão de Relatórios',
    '/dashboard/emissao-relatorios',
    'BarChart3',
    1,
    true
FROM protese.modulos m WHERE m.nome = 'Relatórios'
ON CONFLICT (item_id) DO NOTHING;

-- Inserir itens do módulo Administração
INSERT INTO protese.modulos_itens (modulo_id, item_id, item_label, item_path, item_icon, ordem, ativo)
SELECT 
    m.id,
    'controle_acessos',
    'Gerenciamento de Acessos',
    '/dashboard/controle-acessos',
    'Shield',
    1,
    true
FROM protese.modulos m WHERE m.nome = 'Administração'
ON CONFLICT (item_id) DO NOTHING;

INSERT INTO protese.modulos_itens (modulo_id, item_id, item_label, item_path, item_icon, ordem, ativo)
SELECT 
    m.id,
    'controle_logs',
    'Gerenciamento de Logs',
    '/dashboard/controle-logs',
    'FileSearch',
    2,
    true
FROM protese.modulos m WHERE m.nome = 'Administração'
ON CONFLICT (item_id) DO NOTHING;

INSERT INTO protese.modulos_itens (modulo_id, item_id, item_label, item_path, item_icon, ordem, ativo)
SELECT 
    m.id,
    'usuarios',
    'Gerenciamento de Usuários',
    '/dashboard/usuarios',
    'Users',
    3,
    true
FROM protese.modulos m WHERE m.nome = 'Administração'
ON CONFLICT (item_id) DO NOTHING;

INSERT INTO protese.modulos_itens (modulo_id, item_id, item_label, item_path, item_icon, ordem, ativo)
SELECT 
    m.id,
    'funcionarios',
    'Gerenciamento de Funcionários',
    '/dashboard/funcionarios',
    'UserCog',
    4,
    true
FROM protese.modulos m WHERE m.nome = 'Administração'
ON CONFLICT (item_id) DO NOTHING;

INSERT INTO protese.modulos_itens (modulo_id, item_id, item_label, item_path, item_icon, ordem, ativo)
SELECT 
    m.id,
    'controle_permissoes',
    'Controle de Permissão',
    '/dashboard/controle-permissoes',
    'Settings',
    5,
    true
FROM protese.modulos m WHERE m.nome = 'Administração'
ON CONFLICT (item_id) DO NOTHING;

-- Inserir itens do módulo Integrações
INSERT INTO protese.modulos_itens (modulo_id, item_id, item_label, item_path, item_icon, ordem, ativo)
SELECT 
    m.id,
    'integracao_apis',
    'Integração de APIs',
    '/dashboard/integracoes-apis',
    'Plug',
    1,
    true
FROM protese.modulos m WHERE m.nome = 'Integrações'
ON CONFLICT (item_id) DO NOTHING;

INSERT INTO protese.modulos_itens (modulo_id, item_id, item_label, item_path, item_icon, ordem, ativo)
SELECT 
    m.id,
    'habilitar_api',
    'Habilitar API',
    '/dashboard/habilitar-api',
    'Key',
    2,
    true
FROM protese.modulos m WHERE m.nome = 'Integrações'
ON CONFLICT (item_id) DO NOTHING;

-- Comentários
COMMENT ON TABLE protese.modulos IS 'Módulos do sistema para organização do menu';
COMMENT ON TABLE protese.modulos_itens IS 'Itens do menu agrupados por módulos';

