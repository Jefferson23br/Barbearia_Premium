-- Adicionar permissões individuais para cada serviço de integração
-- Isso permite controlar o acesso a cada integração separadamente

-- Adicionar colunas de permissão para cada serviço de integração
ALTER TABLE protese.permissoes_usuarios
ADD COLUMN IF NOT EXISTS servico_focus_nfe_ver BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS servico_plug_nfe_ver BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS servico_asaas_ver BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS servico_mercado_pago_ver BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS servico_pagseguro_ver BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS servico_twilio_ver BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS servico_whatsapp_ver BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS servico_sendgrid_ver BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS servico_docsales_ver BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS servico_clicksign_ver BOOLEAN DEFAULT false;

-- Comentários nas colunas
COMMENT ON COLUMN protese.permissoes_usuarios.servico_focus_nfe_ver IS 'Permissão para visualizar serviço Focus NFe';
COMMENT ON COLUMN protese.permissoes_usuarios.servico_plug_nfe_ver IS 'Permissão para visualizar serviço PLUG NFe';
COMMENT ON COLUMN protese.permissoes_usuarios.servico_asaas_ver IS 'Permissão para visualizar serviço Asaas';
COMMENT ON COLUMN protese.permissoes_usuarios.servico_mercado_pago_ver IS 'Permissão para visualizar serviço Mercado Pago';
COMMENT ON COLUMN protese.permissoes_usuarios.servico_pagseguro_ver IS 'Permissão para visualizar serviço PagSeguro';
COMMENT ON COLUMN protese.permissoes_usuarios.servico_twilio_ver IS 'Permissão para visualizar serviço Twilio';
COMMENT ON COLUMN protese.permissoes_usuarios.servico_whatsapp_ver IS 'Permissão para visualizar serviço WhatsApp';
COMMENT ON COLUMN protese.permissoes_usuarios.servico_sendgrid_ver IS 'Permissão para visualizar serviço SendGrid';
COMMENT ON COLUMN protese.permissoes_usuarios.servico_docsales_ver IS 'Permissão para visualizar serviço DocSales';
COMMENT ON COLUMN protese.permissoes_usuarios.servico_clicksign_ver IS 'Permissão para visualizar serviço Clicksign';

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_permissoes_servico_focus_nfe_ver ON protese.permissoes_usuarios(servico_focus_nfe_ver);
CREATE INDEX IF NOT EXISTS idx_permissoes_servico_plug_nfe_ver ON protese.permissoes_usuarios(servico_plug_nfe_ver);
CREATE INDEX IF NOT EXISTS idx_permissoes_servico_asaas_ver ON protese.permissoes_usuarios(servico_asaas_ver);
CREATE INDEX IF NOT EXISTS idx_permissoes_servico_mercado_pago_ver ON protese.permissoes_usuarios(servico_mercado_pago_ver);
CREATE INDEX IF NOT EXISTS idx_permissoes_servico_pagseguro_ver ON protese.permissoes_usuarios(servico_pagseguro_ver);
CREATE INDEX IF NOT EXISTS idx_permissoes_servico_twilio_ver ON protese.permissoes_usuarios(servico_twilio_ver);
CREATE INDEX IF NOT EXISTS idx_permissoes_servico_whatsapp_ver ON protese.permissoes_usuarios(servico_whatsapp_ver);
CREATE INDEX IF NOT EXISTS idx_permissoes_servico_sendgrid_ver ON protese.permissoes_usuarios(servico_sendgrid_ver);
CREATE INDEX IF NOT EXISTS idx_permissoes_servico_docsales_ver ON protese.permissoes_usuarios(servico_docsales_ver);
CREATE INDEX IF NOT EXISTS idx_permissoes_servico_clicksign_ver ON protese.permissoes_usuarios(servico_clicksign_ver);

