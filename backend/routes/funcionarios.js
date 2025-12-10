const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const pool = require('../config/database');
const { registrarLog, getClientIp, getUserAgent } = require('../utils/logger');

/**
 * POST /api/v1/funcionarios
 * Cria um novo funcionário
 */
router.post('/', async (req, res) => {
  try {
    const {
      nome_completo,
      email,
      cpf,
      tipo_usuario,
      senha,
    } = req.body;

    // Validações
    if (!nome_completo || !email || !tipo_usuario || !senha) {
      return res.status(400).json({
        error: 'Campos obrigatórios: nome_completo, email, tipo_usuario, senha',
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
        'SELECT id FROM protese.usuarios_administrativos WHERE cpf = $1',
        [cpfLimpo]
      );
      if (cpfCheck.rows.length > 0) {
        return res.status(409).json({ error: 'CPF já cadastrado' });
      }
    }

    // Verificar se email já existe
    const emailCheck = await pool.query(
      'SELECT id FROM protese.usuarios_administrativos WHERE email = $1',
      [email]
    );
    if (emailCheck.rows.length > 0) {
      return res.status(409).json({ error: 'Email já cadastrado' });
    }

    // Hash da senha
    const senhaHash = await bcrypt.hash(senha, 10);

    // Inserir no banco de dados
    const result = await pool.query(
      `INSERT INTO protese.usuarios_administrativos (
        nome_completo, email, cpf, tipo_usuario, senha_hash, is_active
      ) VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, nome_completo, email, cpf, tipo_usuario, is_active, created_at`,
      [
        nome_completo,
        email,
        cpfLimpo,
        tipo_usuario,
        senhaHash,
        true, // is_active padrão
      ]
    );

    const novoFuncionario = result.rows[0];

    // Registrar log
    const usuarioId = req.headers['x-user-id'] || null;
    const usuarioTipo = req.headers['x-user-tipo'] || 'administrativo';
    if (usuarioId) {
      await registrarLog({
        usuarioId,
        usuarioTipo,
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
    }

    res.status(201).json({
      message: 'Funcionário cadastrado com sucesso!',
      funcionario: novoFuncionario,
    });
  } catch (error) {
    console.error('Erro ao cadastrar funcionário:', error);
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
               FROM protese.usuarios_administrativos
               WHERE is_active = true
               ORDER BY nome_completo ASC`;
      console.log('👥 Query para Master: retornando TODOS os funcionários ativos');
    } else {
      // Proprietário e Funcionário NÃO veem Masters
      // Retorna TODOS os funcionários ativos (não apenas os que têm agendamentos)
      // IMPORTANTE: Comparar com LOWER() para garantir case-insensitive
      query = `SELECT id, nome_completo, email, cpf, tipo_usuario, is_active, created_at
               FROM protese.usuarios_administrativos
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
      `SELECT id, nome_completo, email, cpf, tipo_usuario, is_active, created_at, updated_at
       FROM protese.usuarios_administrativos
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
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      nome_completo,
      email,
      cpf,
      tipo_usuario,
      senha,
      is_active,
    } = req.body;

    // Buscar funcionário atual
    const funcionarioAtual = await pool.query(
      'SELECT * FROM protese.usuarios_administrativos WHERE id = $1',
      [id]
    );

    if (funcionarioAtual.rows.length === 0) {
      return res.status(404).json({ error: 'Funcionário não encontrado' });
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
        'SELECT id FROM protese.usuarios_administrativos WHERE cpf = $1 AND id != $2',
        [cpfLimpo, id]
      );
      if (cpfCheck.rows.length > 0) {
        return res.status(409).json({ error: 'CPF já cadastrado para outro funcionário' });
      }
    }

    // Verificar se email já existe em outro funcionário
    if (email) {
      const emailCheck = await pool.query(
        'SELECT id FROM protese.usuarios_administrativos WHERE email = $1 AND id != $2',
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

    const query = `UPDATE protese.usuarios_administrativos SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`;
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
      'SELECT id, nome_completo, email FROM protese.usuarios_administrativos WHERE id = $1',
      [id]
    );

    if (funcionarioCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Funcionário não encontrado' });
    }

    const funcionario = funcionarioCheck.rows[0];

    // Deletar funcionário do banco
    await pool.query('DELETE FROM protese.usuarios_administrativos WHERE id = $1', [id]);

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





