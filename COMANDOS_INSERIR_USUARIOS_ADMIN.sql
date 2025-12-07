-- ============================================================
-- COMANDOS SQL PARA CRIAR USUÁRIOS ADMINISTRATIVOS
-- Sistema: Prótese Capilar Cuiabá
-- 
-- IMPORTANTE: Execute este arquivo no DBeaver após gerar os hashes
-- Os hashes serão gerados pelo script Node.js na VPS
-- ============================================================

-- ============================================================
-- PASSO 1: Gerar os hashes na VPS
-- ============================================================
-- Execute na VPS (onde o bcrypt está instalado):
-- cd /home/cyberpanel/app/backend
-- node scripts/gerar-hashes-usuarios.js
--
-- Isso gerará um arquivo com os hashes que você deve copiar
-- para os comandos INSERT abaixo.

-- ============================================================
-- PASSO 2: Inserir os usuários (substitua os hashes abaixo)
-- ============================================================

-- NÍVEL 1: MASTER (Desenvolvedor) - Jefferson Lima
INSERT INTO protese.usuarios_administrativos (
    nome_completo,
    email,
    cpf,
    rg,
    rua,
    numero,
    complemento,
    bairro,
    cidade,
    estado,
    cep,
    nis,
    data_admissao,
    tipo_contrato,
    salario,
    tipo_usuario,
    senha_hash,
    is_active,
    foto_url
) VALUES (
    'Jefferson Lima',
    'jeffersonlima@jeffersonlima.net.br',
    '000.000.000-00',  -- ATENÇÃO: Altere para o CPF real
    '00.000.000-0',    -- ATENÇÃO: Altere para o RG real
    'Rua Exemplo',     -- ATENÇÃO: Altere para endereço real
    '123',
    'Sala 01',
    'Centro',
    'Cuiabá',
    'MT',
    '78000-000',
    NULL,
    '2025-01-01',
    'PJ',
    NULL,
    'master',
    'SUBSTITUIR_PELO_HASH_DA_SENHA_010216Dp@',  -- ATENÇÃO: Substitua pelo hash gerado
    true,
    NULL
);

-- NÍVEL 2: PROPRIETÁRIO - Carlos Silva (Usuário de teste)
INSERT INTO protese.usuarios_administrativos (
    nome_completo,
    email,
    cpf,
    rg,
    rua,
    numero,
    complemento,
    bairro,
    cidade,
    estado,
    cep,
    nis,
    data_admissao,
    tipo_contrato,
    salario,
    tipo_usuario,
    senha_hash,
    is_active,
    foto_url
) VALUES (
    'Carlos Silva',
    'proprietario@protesecapilarcuiaba.com.br',
    '111.111.111-11',
    '11.111.111-1',
    'Avenida Principal',
    '456',
    'Andar 2',
    'Jardim das Flores',
    'Cuiabá',
    'MT',
    '78010-000',
    NULL,
    '2025-01-01',
    'PJ',
    NULL,
    'proprietario',
    'E0BC60C82713F64EF8A57C0C40D02CE24FD0141D5CC3086259C19B1E62A62BEA',  -- ATENÇÃO: Substitua pelo hash gerado
    true,
    NULL
);

-- NÍVEL 3: FUNCIONÁRIO - Maria Santos (Usuário de teste)
INSERT INTO protese.usuarios_administrativos (
    nome_completo,
    email,
    cpf,
    rg,
    rua,
    numero,
    complemento,
    bairro,
    cidade,
    estado,
    cep,
    nis,
    data_admissao,
    tipo_contrato,
    salario,
    tipo_usuario,
    senha_hash,
    is_active,
    foto_url
) VALUES (
    'Maria Santos',
    'funcionario@protesecapilarcuiaba.com.br',
    '222.222.222-22',
    '22.222.222-2',
    'Rua dos Trabalhadores',
    '789',
    'Apto 101',
    'Boa Esperança',
    'Cuiabá',
    'MT',
    '78020-000',
    '12345678901',
    '2025-01-15',
    'CLT',
    '3500.00',
    'funcionario',
    'E0BC60C82713F64EF8A57C0C40D02CE24FD0141D5CC3086259C19B1E62A62BEA',  -- ATENÇÃO: Substitua pelo hash gerado
    true,
    NULL
);

-- ============================================================
-- VERIFICAR USUÁRIOS CRIADOS
-- ============================================================
SELECT 
    id,
    nome_completo,
    email,
    tipo_usuario,
    is_active,
    created_at
FROM protese.usuarios_administrativos
ORDER BY 
    CASE tipo_usuario 
        WHEN 'master' THEN 1
        WHEN 'proprietario' THEN 2
        WHEN 'funcionario' THEN 3
    END;

-- ============================================================
-- SENHAS PARA TESTE (NÃO COMPARTILHAR):
-- Master: 010216Dp@
-- Proprietário: Proprietario@2025
-- Funcionário: Funcionario@2025
-- ============================================================
# 1. Defina a senha
$Senha = "MinhaSenhaSecreta123"

# 2. Converte a string para array de bytes
$SenhaBytes = [System.Text.Encoding]::UTF8.GetBytes($Senha)

# 3. Cria uma instância do objeto de hash SHA256
$SHA256 = New-Object System.Security.Cryptography.SHA256Managed

# 4. Calcula o hash (resulta em array de bytes)
$HashBytes = $SHA256.ComputeHash($SenhaBytes)

# 5. Converte o array de bytes do hash para string hexadecimal e exibe
$HashHexadecimal = [System.BitConverter]::ToString($HashBytes) -replace '-'
Write-Host "Senha Original: $Senha"
Write-Host "Hash SHA256: $HashHexadecimal"
