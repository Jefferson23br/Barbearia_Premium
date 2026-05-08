const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const fs = require('fs');
const path = require('path');
const pool = require('../config/database');
const { upload } = require('../config/multer');
const { registrarLog, getClientIp, getUserAgent } = require('../utils/logger');

/**
 * POST /api/v1/funcionarios
 * Cria um novo funcionário
 */
router.post('/', upload.single('foto'), async (req, res) => {
  let fotoUrl = null;
  const uploadsDir = path.join(__dirname, '..', 'uploads', 'fotos');

  try {
    // Processar foto se enviada
    if (req.file) {
      const baseUrl = process.env.API_BASE_URL || 'https://api6.auctusconsultoria.com.br';
      fotoUrl = `${baseUrl}/uploads/fotos/${req.file.filename}`;
    }

    const {
      nome_completo,
      email,
      cpf,
      rg,
      tipo_usuario,
      senha,
      rua,
      numero,
      complemento,
      bairro,
      cidade,
      estado,
      cep,
      data_admissao,
      tipo_contrato,
      salario,
      nis,
      foto_url,
    } = req.body;

    // Validações
    if (!nome_completo || !email || !tipo_usuario || !senha) {
      return res.status(400).json({
        error: 'Campos obrigatórios: nome_completo, email, tipo_usuario, senha',
      });
    }
    
    // Validar campos obrigatórios
    if (!rua) {
      return res.status(400).json({
        error: 'Campo obrigatório: rua',
      });
    }
    
    if (!data_admissao) {
      return res.status(400).json({
        error: 'Campo obrigatório: data_admissao',
      });
    }
    
    if (!tipo_contrato) {
      return res.status(400).json({
        error: 'Campo obrigatório: tipo_contrato',
      });
    }
    
    if (!['CLT', 'PJ'].includes(tipo_contrato)) {
      return res.status(400).json({
        error: 'tipo_contrato deve ser: CLT ou PJ',
      });
    }

    if (!['master', 'proprietario', 'funcionario'].includes(tipo_usuario)) {
      return res.status(400).json({
        error: 'tipo_usuario deve ser: master, proprietario ou funcionario',
      });
    }

    // Validar CPF se fornecido
    let cpfLimpo = null;
    if (cpf) {
      cpfLimpo = cpf.replace(/\D/g, '');
      if (cpfLimpo.length !== 11) {
        return res.status(400).json({ error: 'CPF inválido' });
      }

      // Verificar se CPF já existe
      const cpfCheck = await pool.query(
        'SELECT id FROM usuarios_administrativos WHERE cpf = $1',
        [cpfLimpo]
      );
      if (cpfCheck.rows.length > 0) {
        return res.status(409).json({ error: 'CPF já cadastrado' });
      }
    }

    // Verificar se email já existe
    const emailCheck = await pool.query(
      'SELECT id FROM usuarios_administrativos WHERE email = $1',
      [email]
    );
    if (emailCheck.rows.length > 0) {
      return res.status(409).json({ error: 'Email já cadastrado' });
    }

    // Hash da senha
    console.log('🔐 [POST FUNCIONARIO] Gerando hash da senha...');
    const senhaHash = await bcrypt.hash(senha, 10);
    console.log('✅ [POST FUNCIONARIO] Hash gerado com sucesso');

    // Preparar valores para inserção incluindo endereço e trabalho
    const valoresInsercao = [
      nome_completo,
      email,
      cpfLimpo,
      rg || null,
      rua || '',
      numero || '',
      complemento || null,
      bairro || '',
      cidade || '',
      estado || '',
      cep || '',
      nis || null,
      data_admissao,
      tipo_contrato,
      salario ? parseFloat(salario) : null,
      tipo_usuario,
      senhaHash,
      true, // is_active padrão
      fotoUrl || foto_url || null,
    ];
    
    console.log('📝 [POST FUNCIONARIO] Valores para inserção:', {
      nome_completo,
      email,
      cpf: cpfLimpo || 'NULL',
      tipo_usuario,
      senha_hash: '*** (oculto)',
      is_active: true,
      rua: rua || '',
      numero: numero || '',
      complemento: complemento || '',
      bairro: bairro || '',
      cidade: cidade || '',
      estado: estado || '',
      cep: cep || '',
      rg: rg || null,
      data_admissao: data_admissao || '',
      tipo_contrato: tipo_contrato || 'CLT',
      salario: salario || null,
      nis: nis || null,
      foto_url: foto_url || null,
    });

    // Inserir no banco de dados
    console.log('💾 [POST FUNCIONARIO] Tentando inserir no banco de dados...');
    const queryInsert = `INSERT INTO usuarios_administrativos (
        nome_completo, email, cpf, rg, rua, numero, complemento, bairro, cidade, estado, cep,
        nis, data_admissao, tipo_contrato, salario, tipo_usuario, senha_hash, is_active, foto_url
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
      RETURNING id, nome_completo, email, cpf, tipo_usuario, is_active, created_at`;
    
    console.log('📋 [POST FUNCIONARIO] Query SQL:', queryInsert);
    console.log('📋 [POST FUNCIONARIO] Parâmetros:', valoresInsercao.map((v, i) => `$${i+1}: ${v === null ? 'NULL' : (typeof v === 'string' && v.length > 50 ? v.substring(0, 50) + '...' : v)}`));
    
    let result;
    try {
      result = await pool.query(queryInsert, valoresInsercao);
      console.log('✅ [POST FUNCIONARIO] Inserção bem-sucedida! ID:', result.rows[0]?.id);
    } catch (dbError) {
      console.error('❌ [POST FUNCIONARIO] Erro na inserção no banco:', dbError.message);
      console.error('❌ [POST FUNCIONARIO] Código do erro:', dbError.code);
      console.error('❌ [POST FUNCIONARIO] Detalhes do erro:', dbError.detail);
      console.error('❌ [POST FUNCIONARIO] Stack:', dbError.stack);
      
      // Verificar se é erro de constraint ou campo obrigatório
      if (dbError.code === '23502') {
        throw new Error(`Campo obrigatório não fornecido: ${dbError.column || 'desconhecido'}`);
      } else if (dbError.code === '23505') {
        throw new Error(`Violação de constraint única: ${dbError.detail || 'dados duplicados'}`);
      } else if (dbError.code === '23503') {
        throw new Error(`Violação de foreign key: ${dbError.detail || 'referência inválida'}`);
      }
      
      throw dbError;
    }

    const novoFuncionario = result.rows[0];

    // Registrar log
    const usuarioId = req.headers['x-user-id'] || null;
    const usuarioTipo = req.headers['x-user-tipo'] || 'administrativo';
    const usuarioNome = req.headers['x-user-nome'] || null;
    
    console.log('📝 [POST FUNCIONARIO] Tentando registrar log:', {
      usuarioId,
      usuarioTipo,
      usuarioNome,
      entidadeId: novoFuncionario.id
    });
    
    if (usuarioId) {
      try {
        await registrarLog({
          usuarioId,
          usuarioTipo,
          usuarioNome,
          acao: 'criar',
          modulo: 'funcionario',
          entidadeId: novoFuncionario.id,
          entidadeTipo: 'funcionario',
          descricao: `Funcionário ${nome_completo} (${email}) - ${tipo_usuario} criado`,
          dadosNovos: {
            nome_completo,
            email,
            cpf: cpfLimpo,
            tipo_usuario,
          },
          ipAddress: getClientIp(req),
          userAgent: getUserAgent(req),
        });
        console.log('✅ [POST FUNCIONARIO] Log registrado com sucesso');
      } catch (logError) {
        // Não falhar a requisição se o log falhar
        console.error('⚠️ [POST FUNCIONARIO] Erro ao registrar log (não crítico):', logError.message);
      }
    } else {
      console.log('⚠️ [POST FUNCIONARIO] usuarioId não fornecido, pulando registro de log');
    }

    console.log('✅ [POST FUNCIONARIO] Funcionário cadastrado com sucesso:', novoFuncionario.id);
    
    res.status(201).json({
      message: 'Funcionário cadastrado com sucesso!',
      funcionario: novoFuncionario,
    });
  } catch (error) {
    console.error('❌ [POST FUNCIONARIO] Erro ao cadastrar funcionário:', error);
    console.error('❌ [POST FUNCIONARIO] Stack:', error.stack);
    res.status(500).json({
      error: 'Erro ao cadastrar funcionário',
      message: error.message,
    });
  }
});

/**
 * GET /api/v1/funcionarios
 * Lista todos os funcionários
 */
router.get('/', async (req, res) => {
  try {
    // Verificar tipo de usuário da requisição (prioridade: query param > header x-user-tipo > header x-user-type > default 'funcionario')
    const tipoUsuarioRequisicao = (req.query.tipo_usuario || 
                                  req.query.requestingUserType || 
                                  req.headers['x-user-tipo'] || 
                                  req.headers['x-user-type'] || 
                                  'funcionario').toLowerCase(); // Normalizar para lowercase

    console.log('👥 GET /api/v1/funcionarios - Headers recebidos:', {
      'x-user-tipo': req.headers['x-user-tipo'],
      'x-user-type': req.headers['x-user-type'],
      'x-user-id': req.headers['x-user-id'],
      'tipo_usuario_query': req.query.tipo_usuario,
      'tipoUsuarioRequisicao_final': tipoUsuarioRequisicao
    });

    let query;
    let params = [];

    if (tipoUsuarioRequisicao === 'master') {
      // Master vê TODOS os funcionários (incluindo outros Masters)
      query = `SELECT id, nome_completo, email, cpf, tipo_usuario, is_active, created_at
               FROM usuarios_administrativos
               WHERE is_active = true
               ORDER BY nome_completo ASC`;
      console.log('👥 Query para Master: retornando TODOS os funcionários ativos');
    } else {
      // Proprietário e Funcionário NÃO veem Masters
      // Retorna TODOS os funcionários ativos (não apenas os que têm agendamentos)
      // IMPORTANTE: Comparar com LOWER() para garantir case-insensitive
      query = `SELECT id, nome_completo, email, cpf, tipo_usuario, is_active, created_at
               FROM usuarios_administrativos
               WHERE LOWER(tipo_usuario) != 'master' AND is_active = true
               ORDER BY nome_completo ASC`;
      console.log('👥 Query para não-Master: retornando funcionários ativos (exceto masters)');
    }

    console.log('📋 Executando query:', query);
    const result = await pool.query(query, params);
    console.log('✅ Resultado da query:', result.rows.length, 'funcionários encontrados');
    console.log('📋 Lista de funcionários:', result.rows.map(f => ({ 
      id: f.id, 
      nome: f.nome_completo, 
      tipo: f.tipo_usuario, 
      ativo: f.is_active 
    })));

    res.json({
      funcionarios: result.rows,
    });
  } catch (error) {
    console.error('❌ Erro ao buscar funcionários:', error);
    res.status(500).json({
      error: 'Erro ao buscar funcionários',
      message: error.message,
    });
  }
});

/**
 * GET /api/v1/funcionarios/:id
 * Busca um funcionário por ID
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT id, nome_completo, email, cpf, rg, rua, numero, complemento, bairro, cidade, estado, cep, 
              tipo_usuario, is_active, foto_url, created_at, updated_at
       FROM usuarios_administrativos
       WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Funcionário não encontrado' });
    }

    res.json({ funcionario: result.rows[0] });
  } catch (error) {
    console.error('Erro ao buscar funcionário:', error);
    res.status(500).json({
      error: 'Erro ao buscar funcionário',
      message: error.message,
    });
  }
});

/**
 * PUT /api/v1/funcionarios/:id
 * Atualiza um funcionário
 */
router.put('/:id', upload.single('foto'), async (req, res) => {
  let fotoUrl = null;
  const uploadsDir = path.join(__dirname, '..', 'uploads', 'fotos');

  try {
    const { id } = req.params;
    const {
      nome_completo,
      email,
      cpf,
      rg,
      tipo_usuario,
      senha,
      is_active,
      rua,
      numero,
      complemento,
      bairro,
      cidade,
      estado,
      cep,
      data_admissao,
      tipo_contrato,
      salario,
      nis,
      foto_url,
    } = req.body;

    // Buscar funcionário atual
    const funcionarioAtual = await pool.query(
      'SELECT * FROM usuarios_administrativos WHERE id = $1',
      [id]
    );

    if (funcionarioAtual.rows.length === 0) {
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(404).json({ error: 'Funcionário não encontrado' });
    }

    // Processar foto se enviada
    if (req.file) {
      // Deletar foto antiga se existir
      if (funcionarioAtual.rows[0].foto_url) {
        const fotoAntigaPath = path.join(uploadsDir, path.basename(funcionarioAtual.rows[0].foto_url));
        if (fs.existsSync(fotoAntigaPath)) {
          try {
            fs.unlinkSync(fotoAntigaPath);
          } catch (err) {
            console.error('Erro ao deletar foto antiga:', err);
          }
        }
      }

      const baseUrl = process.env.API_BASE_URL || 'https://api6.auctusconsultoria.com.br';
      fotoUrl = `${baseUrl}/uploads/fotos/${req.file.filename}`;
    }

    // Validações
    if (tipo_usuario && !['master', 'proprietario', 'funcionario'].includes(tipo_usuario)) {
      return res.status(400).json({
        error: 'tipo_usuario deve ser: master, proprietario ou funcionario',
      });
    }

    // Validar CPF se fornecido
    let cpfLimpo = funcionarioAtual.rows[0].cpf;
    if (cpf) {
      cpfLimpo = cpf.replace(/\D/g, '');
      if (cpfLimpo.length !== 11) {
        return res.status(400).json({ error: 'CPF inválido' });
      }

      // Verificar se CPF já existe em outro funcionário
      const cpfCheck = await pool.query(
        'SELECT id FROM usuarios_administrativos WHERE cpf = $1 AND id != $2',
        [cpfLimpo, id]
      );
      if (cpfCheck.rows.length > 0) {
        return res.status(409).json({ error: 'CPF já cadastrado para outro funcionário' });
      }
    }

    // Verificar se email já existe em outro funcionário
    if (email) {
      const emailCheck = await pool.query(
        'SELECT id FROM usuarios_administrativos WHERE email = $1 AND id != $2',
        [email, id]
      );
      if (emailCheck.rows.length > 0) {
        return res.status(409).json({ error: 'Email já cadastrado para outro funcionário' });
      }
    }

    // Preparar valores para atualização
    let senhaHash = null;
    if (senha && senha.trim() !== '') {
      senhaHash = await bcrypt.hash(senha, 10);
    }

    // Construir query de atualização
    const updates = [];
    const params = [];
    let paramIndex = 1;

    if (nome_completo) {
      updates.push(`nome_completo = $${paramIndex}`);
      params.push(nome_completo);
      paramIndex++;
    }

    if (email) {
      updates.push(`email = $${paramIndex}`);
      params.push(email);
      paramIndex++;
    }

    if (cpfLimpo) {
      updates.push(`cpf = $${paramIndex}`);
      params.push(cpfLimpo);
      paramIndex++;
    }

    if (rg !== undefined) {
      updates.push(`rg = $${paramIndex}`);
      params.push(rg || null);
      paramIndex++;
    }

    if (rua !== undefined) {
      updates.push(`rua = $${paramIndex}`);
      params.push(rua);
      paramIndex++;
    }

    if (numero !== undefined) {
      updates.push(`numero = $${paramIndex}`);
      params.push(numero);
      paramIndex++;
    }

    if (complemento !== undefined) {
      updates.push(`complemento = $${paramIndex}`);
      params.push(complemento || null);
      paramIndex++;
    }

    if (bairro !== undefined) {
      updates.push(`bairro = $${paramIndex}`);
      params.push(bairro);
      paramIndex++;
    }

    if (cidade !== undefined) {
      updates.push(`cidade = $${paramIndex}`);
      params.push(cidade);
      paramIndex++;
    }

    if (estado !== undefined) {
      updates.push(`estado = $${paramIndex}`);
      params.push(estado);
      paramIndex++;
    }

    if (cep !== undefined) {
      updates.push(`cep = $${paramIndex}`);
      params.push(cep);
      paramIndex++;
    }

    if (nis !== undefined) {
      updates.push(`nis = $${paramIndex}`);
      params.push(nis || null);
      paramIndex++;
    }

    if (data_admissao) {
      updates.push(`data_admissao = $${paramIndex}`);
      params.push(data_admissao);
      paramIndex++;
    }

    if (tipo_contrato) {
      if (!['CLT', 'PJ'].includes(tipo_contrato)) {
        return res.status(400).json({
          error: 'tipo_contrato deve ser: CLT ou PJ',
        });
      }
      updates.push(`tipo_contrato = $${paramIndex}`);
      params.push(tipo_contrato);
      paramIndex++;
    }

    if (salario !== undefined) {
      updates.push(`salario = $${paramIndex}`);
      params.push(salario ? parseFloat(salario) : null);
      paramIndex++;
    }

    // Usar fotoUrl do upload se disponível, senão usar foto_url do body, senão manter a atual
    if (fotoUrl) {
      updates.push(`foto_url = $${paramIndex}`);
      params.push(fotoUrl);
      paramIndex++;
    } else if (foto_url !== undefined) {
      updates.push(`foto_url = $${paramIndex}`);
      params.push(foto_url || null);
      paramIndex++;
    }

    if (tipo_usuario) {
      updates.push(`tipo_usuario = $${paramIndex}`);
      params.push(tipo_usuario);
      paramIndex++;
    }

    if (senhaHash) {
      updates.push(`senha_hash = $${paramIndex}`);
      params.push(senhaHash);
      paramIndex++;
    }

    if (is_active !== undefined) {
      updates.push(`is_active = $${paramIndex}`);
      params.push(is_active);
      paramIndex++;
    }

    updates.push(`updated_at = NOW()`);
    params.push(id);

    const query = `UPDATE usuarios_administrativos SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`;
    const result = await pool.query(query, params);

    // Registrar log
    const usuarioId = req.headers['x-user-id'] || null;
    const usuarioTipo = req.headers['x-user-tipo'] || 'administrativo';
    if (usuarioId) {
      await registrarLog({
        usuarioId,
        usuarioTipo,
        acao: 'editar',
        modulo: 'funcionario',
        entidadeId: id,
        entidadeTipo: 'funcionario',
        descricao: `Funcionário ${nome_completo || funcionarioAtual.rows[0].nome_completo} atualizado`,
        dadosAnteriores: funcionarioAtual.rows[0],
        dadosNovos: result.rows[0],
        ipAddress: getClientIp(req),
        userAgent: getUserAgent(req),
      });
    }

    res.json({
      message: 'Funcionário atualizado com sucesso!',
      funcionario: result.rows[0],
    });
  } catch (error) {
    console.error('Erro ao atualizar funcionário:', error);
    res.status(500).json({
      error: 'Erro ao atualizar funcionário',
      message: error.message,
    });
  }
});

/**
 * DELETE /api/v1/funcionarios/:id
 * Exclui um funcionário
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar se funcionário existe
    const funcionarioCheck = await pool.query(
      'SELECT id, nome_completo, email FROM usuarios_administrativos WHERE id = $1',
      [id]
    );

    if (funcionarioCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Funcionário não encontrado' });
    }

    const funcionario = funcionarioCheck.rows[0];

    // Deletar funcionário do banco
    await pool.query('DELETE FROM usuarios_administrativos WHERE id = $1', [id]);

    // Registrar log
    const usuarioId = req.headers['x-user-id'] || null;
    const usuarioTipo = req.headers['x-user-tipo'] || 'administrativo';
    if (usuarioId) {
      await registrarLog({
        usuarioId,
        usuarioTipo,
        acao: 'excluir',
        modulo: 'funcionario',
        entidadeId: id,
        entidadeTipo: 'funcionario',
        descricao: `Funcionário ${funcionario.nome_completo} (${funcionario.email}) excluído`,
        dadosAnteriores: funcionario,
        ipAddress: getClientIp(req),
        userAgent: getUserAgent(req),
      });
    }

    res.json({
      message: 'Funcionário excluído com sucesso!',
    });
  } catch (error) {
    console.error('Erro ao excluir funcionário:', error);
    res.status(500).json({
      error: 'Erro ao excluir funcionário',
      message: error.message,
    });
  }
});

module.exports = router;





