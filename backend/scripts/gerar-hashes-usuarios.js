/**
 * Script para gerar hashes de senha dos usuários administrativos
 * Execute na VPS: node scripts/gerar-hashes-usuarios.js
 */

const bcrypt = require('bcrypt');
const fs = require('fs');
const path = require('path');

async function gerarHashes() {
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('   GERADOR DE HASHES PARA USUÁRIOS ADMINISTRATIVOS');
  console.log('═══════════════════════════════════════════════════════════\n');

  try {
    // Gerar hashes
    const senhaMaster = '010216Dp@';
    const senhaProprietario = 'Proprietario@2025';
    const senhaFuncionario = 'Funcionario@2025';

    console.log('⏳ Gerando hashes...\n');

    const hashMaster = await bcrypt.hash(senhaMaster, 10);
    const hashProprietario = await bcrypt.hash(senhaProprietario, 10);
    const hashFuncionario = await bcrypt.hash(senhaFuncionario, 10);

    // Exibir hashes
    console.log('═══════════════════════════════════════════════════════════');
    console.log('   HASHS GERADOS COM SUCESSO!');
    console.log('═══════════════════════════════════════════════════════════\n');

    console.log('📌 MASTER (Jefferson Lima)');
    console.log(`   Senha: ${senhaMaster}`);
    console.log(`   Hash:  ${hashMaster}\n`);

    console.log('📌 PROPRIETÁRIO (Carlos Silva)');
    console.log(`   Senha: ${senhaProprietario}`);
    console.log(`   Hash:  ${hashProprietario}\n`);

    console.log('📌 FUNCIONÁRIO (Maria Santos)');
    console.log(`   Senha: ${senhaFuncionario}`);
    console.log(`   Hash:  ${hashFuncionario}\n`);

    // Gerar arquivo SQL com hashes
    const sqlContent = `-- ============================================================
-- COMANDOS SQL PARA CRIAR USUÁRIOS ADMINISTRATIVOS
-- Sistema: Prótese Capilar Cuiabá
-- Hashes gerados automaticamente
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
    '${hashMaster}',
    true,
    NULL
);

-- NÍVEL 2: PROPRIETÁRIO - Carlos Silva
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

-- NÍVEL 3: FUNCIONÁRIO - Maria Santos
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

-- Verificar usuários criados
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

    // Salvar arquivo SQL
    const sqlFilePath = path.join(__dirname, '..', 'COMANDOS_INSERIR_USUARIOS_ADMIN_FINAL.sql');
    fs.writeFileSync(sqlFilePath, sqlContent, 'utf8');

    console.log('═══════════════════════════════════════════════════════════');
    console.log(`✅ Arquivo SQL criado: ${sqlFilePath}`);
    console.log('═══════════════════════════════════════════════════════════\n');
    console.log('📋 PRÓXIMOS PASSOS:');
    console.log('   1. Abra o arquivo SQL gerado no DBeaver');
    console.log('   2. Revise e ajuste os dados (CPF, RG, endereço)');
    console.log('   3. Execute os comandos INSERT');
    console.log('   4. Execute o SELECT para verificar os usuários criados\n');

  } catch (error) {
    console.error('❌ Erro ao gerar hashes:', error);
    process.exit(1);
  }
}

gerarHashes();

