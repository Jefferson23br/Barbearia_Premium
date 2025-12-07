const bcrypt = require('bcrypt');

async function gerar() {
  const senhaMaster = '010216Dp@';
  const senhaProprietario = 'Proprietario@2025';
  const senhaFuncionario = 'Funcionario@2025';
  
  const hashMaster = await bcrypt.hash(senhaMaster, 10);
  const hashProprietario = await bcrypt.hash(senhaProprietario, 10);
  const hashFuncionario = await bcrypt.hash(senhaFuncionario, 10);
  
  console.log('\n=== HASHES GERADOS ===\n');
  console.log('MASTER:', hashMaster);
  console.log('\nPROPRIETARIO:', hashProprietario);
  console.log('\nFUNCIONARIO:', hashFuncionario);
  
  // Gerar arquivo SQL
  const fs = require('fs');
  const sql = `-- ============================================================
-- COMANDOS SQL PARA CRIAR USUÁRIOS ADMINISTRATIVOS
-- Sistema: Prótese Capilar Cuiabá
-- Execute no DBeaver
-- ============================================================

-- ============================================================
-- NÍVEL 1: MASTER (Desenvolvedor) - Jefferson Lima
-- ============================================================
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
    '000.000.000-00',
    '00.000.000-0',
    'Rua Exemplo',
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
    '${hashMaster}',
    true,
    NULL
);

-- ============================================================
-- NÍVEL 2: PROPRIETÁRIO - Carlos Silva
-- ============================================================
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
    '${hashProprietario}',
    true,
    NULL
);

-- ============================================================
-- NÍVEL 3: FUNCIONÁRIO - Maria Santos
-- ============================================================
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
    3500.00,
    'funcionario',
    '${hashFuncionario}',
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
-- SENHAS PARA TESTE:
-- Master: 010216Dp@
-- Proprietário: Proprietario@2025
-- Funcionário: Funcionario@2025
-- ============================================================
`;
  
  fs.writeFileSync('COMANDOS_INSERIR_USUARIOS_ADMIN.sql', sql, 'utf8');
  console.log('\n✅ Arquivo COMANDOS_INSERIR_USUARIOS_ADMIN.sql criado com sucesso!');
}

gerar().catch(console.error);

