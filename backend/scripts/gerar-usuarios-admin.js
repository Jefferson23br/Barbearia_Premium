/**
 * Script para gerar comandos SQL de inserção de usuários administrativos
 * Execute: node scripts/gerar-usuarios-admin.js
 */

const bcrypt = require('bcrypt');

async function gerarHashSenha(senha) {
  const saltRounds = 10;
  return await bcrypt.hash(senha, saltRounds);
}

async function gerarComandosSQL() {
  console.log('-- ============================================================');
  console.log('-- COMANDOS SQL PARA CRIAR USUÁRIOS ADMINISTRATIVOS');
  console.log('-- Sistema: Prótese Capilar Cuiabá');
  console.log('-- Execute este script no DBeaver após gerar os hashes');
  console.log('-- ============================================================\n');

  // Nível 1: Master (Desenvolvedor)
  const senhaMaster = '010216Dp@';
  const hashMaster = await gerarHashSenha(senhaMaster);
  
  console.log('-- ============================================================');
  console.log('-- NÍVEL 1: MASTER (Desenvolvedor)');
  console.log('-- ============================================================');
  console.log(`INSERT INTO protese.usuarios_administrativos (
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
    '000.000.000-00', -- CPF de teste, altere conforme necessário
    '00.000.000-0',   -- RG de teste
    'Rua Exemplo',
    '123',
    'Sala 01',
    'Centro',
    'Cuiabá',
    'MT',
    '78000-000',
    NULL, -- NIS opcional
    '2025-01-01', -- Data de admissão
    'PJ', -- Tipo de contrato
    NULL, -- Salário (NULL para PJ)
    'master',
    '${hashMaster}',
    true,
    NULL -- foto_url será preenchido depois se necessário
);\n`);

  // Nível 2: Proprietário
  const senhaProprietario = 'Proprietario@2025';
  const hashProprietario = await gerarHashSenha(senhaProprietario);
  
  console.log('-- ============================================================');
  console.log('-- NÍVEL 2: PROPRIETÁRIO');
  console.log('-- ============================================================');
  console.log(`INSERT INTO protese.usuarios_administrativos (
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
    '111.111.111-11', -- CPF de teste
    '11.111.111-1',   -- RG de teste
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
);\n`);

  // Nível 3: Funcionário
  const senhaFuncionario = 'Funcionario@2025';
  const hashFuncionario = await gerarHashSenha(senhaFuncionario);
  
  console.log('-- ============================================================');
  console.log('-- NÍVEL 3: FUNCIONÁRIO');
  console.log('-- ============================================================');
  console.log(`INSERT INTO protese.usuarios_administrativos (
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
    '222.222.222-22', -- CPF de teste
    '22.222.222-2',   -- RG de teste
    'Rua dos Trabalhadores',
    '789',
    'Apto 101',
    'Boa Esperança',
    'Cuiabá',
    'MT',
    '78020-000',
    '12345678901', -- NIS de teste
    '2025-01-15',
    'CLT',
    3500.00, -- Salário
    'funcionario',
    '${hashFuncionario}',
    true,
    NULL
);\n`);

  console.log('-- ============================================================');
  console.log('-- VERIFICAR USUÁRIOS CRIADOS');
  console.log('-- ============================================================');
  console.log(`SELECT 
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
    END;\n`);

  console.log('-- ============================================================');
  console.log('-- SENHAS PARA TESTE:');
  console.log('-- Master: 010216Dp@');
  console.log('-- Proprietário: Proprietario@2025');
  console.log('-- Funcionário: Funcionario@2025');
  console.log('-- ============================================================');
}

// Executar
gerarComandosSQL().catch(console.error);

