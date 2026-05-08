-- Corrigir função de geração de número de romaneio
CREATE OR REPLACE FUNCTION protese.gerar_proximo_numero_romaneio()
RETURNS VARCHAR AS $$
DECLARE
    proximo_numero INTEGER;
    numero_gerado VARCHAR(50);
    ano_atual VARCHAR(4);
    ultimo_numero_text VARCHAR(50);
BEGIN
    ano_atual := EXTRACT(YEAR FROM CURRENT_DATE)::VARCHAR;
    
    -- Buscar o último número do ano atual
    SELECT numero_romaneio INTO ultimo_numero_text
    FROM protese.romaneios
    WHERE numero_romaneio LIKE 'ROM-' || ano_atual || '-%'
    ORDER BY numero_romaneio DESC
    LIMIT 1;
    
    IF ultimo_numero_text IS NULL THEN
        proximo_numero := 1;
    ELSE
        -- Extrair o número após o ano (ex: ROM-2025-000001 -> 1)
        BEGIN
            -- Usar regex para extrair apenas os números após o último hífen
            proximo_numero := CAST(SUBSTRING(ultimo_numero_text FROM 'ROM-' || ano_atual || '-(.+)$') AS INTEGER) + 1;
        EXCEPTION
            WHEN OTHERS THEN
                -- Se falhar, tentar extrair de outra forma
                BEGIN
                    proximo_numero := CAST(SUBSTRING(ultimo_numero_text FROM '[0-9]+$') AS INTEGER) + 1;
                EXCEPTION
                    WHEN OTHERS THEN
                        proximo_numero := 1;
                END;
        END;
    END IF;
    
    -- Formatar: ROM-YYYY-000001
    numero_gerado := 'ROM-' || ano_atual || '-' || LPAD(proximo_numero::TEXT, 6, '0');
    
    RETURN numero_gerado;
END;
$$ LANGUAGE plpgsql;

-- Atualizar status padrão dos romaneios existentes para 'fechado' se estiverem 'aberto'
UPDATE protese.romaneios 
SET status = 'fechado' 
WHERE status = 'aberto';

