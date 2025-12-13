const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { registrarLog, getClientIp, getUserAgent } = require('../utils/logger');

/**
 * GET /api/v1/caixas/contas
 * Lista todas as contas
 */
router.get('/contas', async (req, res) => {
  try {
    const usuarioId = req.headers['x-user-id'];
    const usuarioTipo = req.headers['x-user-tipo'] || 'administrativo';
    const usuarioNome = req.headers['x-user-nome'] || null;

    // Verificar permissão de visualização
    if (usuarioTipo !== 'master') {
      const permissoesResult = await pool.query(
        'SELECT caixas_ver FROM protese.permissoes_usuarios WHERE usuario_id = $1',
        [usuarioId]
      );

      if (permissoesResult.rows.length === 0 || !permissoesResult.rows[0].caixas_ver) {
        return res.status(403).json({ error: 'Acesso negado. Permissão insuficiente.' });
      }
    }

    const { tipo, is_active, search } = req.query;
    let query = 'SELECT * FROM protese.contas WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    if (tipo) {
      query += ` AND tipo = $${paramIndex}`;
      params.push(tipo);
      paramIndex++;
    }

    if (is_active !== undefined) {
      query += ` AND is_active = $${paramIndex}`;
      params.push(is_active === 'true');
      paramIndex++;
    }

    if (search) {
      query += ` AND (nome ILIKE $${paramIndex} OR banco ILIKE $${paramIndex} OR conta ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    query += ' ORDER BY nome ASC';

    const result = await pool.query(query, params);

    await registrarLog({
      usuario_id: usuarioId,
      usuario_tipo: usuarioTipo,
      usuario_nome: usuarioNome,
      acao: 'visualizar',
      modulo: 'caixas',
      descricao: 'Listou contas',
      ip: getClientIp(req),
      user_agent: getUserAgent(req)
    });

    res.json({ contas: result.rows });
  } catch (error) {
    console.error('Erro ao listar contas:', error);
    res.status(500).json({ error: 'Erro ao listar contas' });
  }
});

/**
 * GET /api/v1/caixas/contas/:id
 * Busca uma conta específica
 */
router.get('/contas/:id', async (req, res) => {
  try {
    const usuarioId = req.headers['x-user-id'];
    const usuarioTipo = req.headers['x-user-tipo'] || 'administrativo';
    const usuarioNome = req.headers['x-user-nome'] || null;

    // Verificar permissão de visualização
    if (usuarioTipo !== 'master') {
      const permissoesResult = await pool.query(
        'SELECT caixas_ver FROM protese.permissoes_usuarios WHERE usuario_id = $1',
        [usuarioId]
      );

      if (permissoesResult.rows.length === 0 || !permissoesResult.rows[0].caixas_ver) {
        return res.status(403).json({ error: 'Acesso negado. Permissão insuficiente.' });
      }
    }

    const result = await pool.query(
      'SELECT * FROM protese.contas WHERE id = $1',
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Conta não encontrada' });
    }

    await registrarLog({
      usuario_id: usuarioId,
      usuario_tipo: usuarioTipo,
      usuario_nome: usuarioNome,
      acao: 'visualizar',
      modulo: 'caixas',
      descricao: `Visualizou conta: ${result.rows[0].nome}`,
      ip: getClientIp(req),
      user_agent: getUserAgent(req)
    });

    res.json({ conta: result.rows[0] });
  } catch (error) {
    console.error('Erro ao buscar conta:', error);
    res.status(500).json({ error: 'Erro ao buscar conta' });
  }
});

/**
 * POST /api/v1/caixas/contas
 * Cria uma nova conta
 */
router.post('/contas', async (req, res) => {
  try {
    const usuarioId = req.headers['x-user-id'];
    const usuarioTipo = req.headers['x-user-tipo'] || 'administrativo';
    const usuarioNome = req.headers['x-user-nome'] || null;

    // Verificar permissão de edição
    if (usuarioTipo !== 'master') {
      const permissoesResult = await pool.query(
        'SELECT caixas_editar FROM protese.permissoes_usuarios WHERE usuario_id = $1',
        [usuarioId]
      );

      if (permissoesResult.rows.length === 0 || !permissoesResult.rows[0].caixas_editar) {
        return res.status(403).json({ error: 'Acesso negado. Permissão insuficiente.' });
      }
    }

    const { nome, tipo, banco, agencia, conta, saldo_inicial, descricao, is_active } = req.body;

    if (!nome || !tipo) {
      return res.status(400).json({ error: 'Nome e tipo são obrigatórios' });
    }

    const saldoInicialValue = parseFloat(saldo_inicial) || 0;
    
    const result = await pool.query(
      `INSERT INTO protese.contas 
       (nome, tipo, banco, agencia, conta, saldo_inicial, saldo_atual, descricao, is_active, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [
        nome,
        tipo,
        banco || null,
        agencia || null,
        conta || null,
        saldoInicialValue,
        0, // saldo_atual inicia em 0, será atualizado pelo trigger quando criar movimentação
        descricao || null,
        is_active !== undefined ? is_active : true,
        usuarioId
      ]
    );

    // Se houver saldo inicial, criar movimentação de saldo inicial (trigger vai atualizar saldo_atual)
    if (saldoInicialValue > 0) {
      await pool.query(
        `INSERT INTO protese.movimentacoes_caixa 
         (conta_id, tipo_movimentacao, valor, descricao, data_movimentacao, created_by)
         VALUES ($1, $2, $3, $4, CURRENT_DATE, $5)`,
        [
          result.rows[0].id,
          'saldo_inicial',
          saldoInicialValue,
          `Saldo inicial da conta ${nome}`,
          usuarioId
        ]
      );
      
      // Buscar conta atualizada com saldo correto
      const contaAtualizada = await pool.query(
        'SELECT * FROM protese.contas WHERE id = $1',
        [result.rows[0].id]
      );
      
      if (contaAtualizada.rows.length > 0) {
        result.rows[0] = contaAtualizada.rows[0];
      }
    }

    await registrarLog({
      usuario_id: usuarioId,
      usuario_tipo: usuarioTipo,
      usuario_nome: usuarioNome,
      acao: 'criar',
      modulo: 'caixas',
      descricao: `Criou conta: ${nome}`,
      ip: getClientIp(req),
      user_agent: getUserAgent(req)
    });

    res.status(201).json({ conta: result.rows[0] });
  } catch (error) {
    console.error('Erro ao criar conta:', error);
    if (error.code === '23505') { // Unique violation
      return res.status(400).json({ error: 'Já existe uma conta com este nome' });
    }
    res.status(500).json({ error: 'Erro ao criar conta' });
  }
});

/**
 * PUT /api/v1/caixas/contas/:id
 * Atualiza uma conta
 */
router.put('/contas/:id', async (req, res) => {
  try {
    const usuarioId = req.headers['x-user-id'];
    const usuarioTipo = req.headers['x-user-tipo'] || 'administrativo';
    const usuarioNome = req.headers['x-user-nome'] || null;

    // Verificar permissão de edição
    if (usuarioTipo !== 'master') {
      const permissoesResult = await pool.query(
        'SELECT caixas_editar FROM protese.permissoes_usuarios WHERE usuario_id = $1',
        [usuarioId]
      );

      if (permissoesResult.rows.length === 0 || !permissoesResult.rows[0].caixas_editar) {
        return res.status(403).json({ error: 'Acesso negado. Permissão insuficiente.' });
      }
    }

    const { nome, tipo, banco, agencia, conta, descricao, is_active } = req.body;

    const result = await pool.query(
      `UPDATE protese.contas 
       SET nome = $1, tipo = $2, banco = $3, agencia = $4, conta = $5, 
           descricao = $6, is_active = $7, updated_by = $8, updated_at = CURRENT_TIMESTAMP
       WHERE id = $9
       RETURNING *`,
      [nome, tipo, banco || null, agencia || null, conta || null, descricao || null, is_active, usuarioId, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Conta não encontrada' });
    }

    await registrarLog({
      usuario_id: usuarioId,
      usuario_tipo: usuarioTipo,
      usuario_nome: usuarioNome,
      acao: 'editar',
      modulo: 'caixas',
      descricao: `Atualizou conta: ${result.rows[0].nome}`,
      ip: getClientIp(req),
      user_agent: getUserAgent(req)
    });

    res.json({ conta: result.rows[0] });
  } catch (error) {
    console.error('Erro ao atualizar conta:', error);
    if (error.code === '23505') {
      return res.status(400).json({ error: 'Já existe uma conta com este nome' });
    }
    res.status(500).json({ error: 'Erro ao atualizar conta' });
  }
});

/**
 * DELETE /api/v1/caixas/contas/:id
 * Exclui uma conta
 */
router.delete('/contas/:id', async (req, res) => {
  try {
    const usuarioId = req.headers['x-user-id'];
    const usuarioTipo = req.headers['x-user-tipo'] || 'administrativo';
    const usuarioNome = req.headers['x-user-nome'] || null;

    // Verificar permissão de exclusão
    if (usuarioTipo !== 'master') {
      const permissoesResult = await pool.query(
        'SELECT caixas_excluir FROM protese.permissoes_usuarios WHERE usuario_id = $1',
        [usuarioId]
      );

      if (permissoesResult.rows.length === 0 || !permissoesResult.rows[0].caixas_excluir) {
        return res.status(403).json({ error: 'Acesso negado. Permissão insuficiente.' });
      }
    }

    // Buscar nome da conta antes de excluir
    const contaResult = await pool.query(
      'SELECT nome FROM protese.contas WHERE id = $1',
      [req.params.id]
    );

    if (contaResult.rows.length === 0) {
      return res.status(404).json({ error: 'Conta não encontrada' });
    }

    const nomeConta = contaResult.rows[0].nome;

    // Verificar se há movimentações
    const movimentacoesResult = await pool.query(
      'SELECT COUNT(*) as total FROM protese.movimentacoes_caixa WHERE conta_id = $1 OR conta_origem_id = $1 OR conta_destino_id = $1',
      [req.params.id]
    );

    if (parseInt(movimentacoesResult.rows[0].total) > 0) {
      return res.status(400).json({ 
        error: 'Não é possível excluir conta com movimentações. Desative a conta ao invés de excluir.' 
      });
    }

    await pool.query('DELETE FROM protese.contas WHERE id = $1', [req.params.id]);

    await registrarLog({
      usuario_id: usuarioId,
      usuario_tipo: usuarioTipo,
      usuario_nome: usuarioNome,
      acao: 'excluir',
      modulo: 'caixas',
      descricao: `Excluiu conta: ${nomeConta}`,
      ip: getClientIp(req),
      user_agent: getUserAgent(req)
    });

    res.json({ message: 'Conta excluída com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir conta:', error);
    res.status(500).json({ error: 'Erro ao excluir conta' });
  }
});

/**
 * GET /api/v1/caixas/movimentacoes
 * Lista movimentações
 */
router.get('/movimentacoes', async (req, res) => {
  try {
    const usuarioId = req.headers['x-user-id'];
    const usuarioTipo = req.headers['x-user-tipo'] || 'administrativo';
    const usuarioNome = req.headers['x-user-nome'] || null;

    // Verificar permissão de visualização
    if (usuarioTipo !== 'master') {
      const permissoesResult = await pool.query(
        'SELECT caixas_ver FROM protese.permissoes_usuarios WHERE usuario_id = $1',
        [usuarioId]
      );

      if (permissoesResult.rows.length === 0 || !permissoesResult.rows[0].caixas_ver) {
        return res.status(403).json({ error: 'Acesso negado. Permissão insuficiente.' });
      }
    }

    const { conta_id, tipo_movimentacao, data_inicio, data_fim } = req.query;
    let query = `
      SELECT 
        m.*,
        c.nome as conta_nome,
        co.nome as conta_origem_nome,
        cd.nome as conta_destino_nome
      FROM protese.movimentacoes_caixa m
      LEFT JOIN protese.contas c ON m.conta_id = c.id
      LEFT JOIN protese.contas co ON m.conta_origem_id = co.id
      LEFT JOIN protese.contas cd ON m.conta_destino_id = cd.id
      WHERE 1=1
    `;
    const params = [];
    let paramIndex = 1;

    if (conta_id) {
      query += ` AND (m.conta_id = $${paramIndex} OR m.conta_origem_id = $${paramIndex} OR m.conta_destino_id = $${paramIndex})`;
      params.push(conta_id);
      paramIndex++;
    }

    if (tipo_movimentacao) {
      query += ` AND m.tipo_movimentacao = $${paramIndex}`;
      params.push(tipo_movimentacao);
      paramIndex++;
    }

    if (data_inicio) {
      query += ` AND m.data_movimentacao >= $${paramIndex}`;
      params.push(data_inicio);
      paramIndex++;
    }

    if (data_fim) {
      query += ` AND m.data_movimentacao <= $${paramIndex}`;
      params.push(data_fim);
      paramIndex++;
    }

    query += ' ORDER BY m.data_movimentacao DESC, m.created_at DESC';

    const result = await pool.query(query, params);

    await registrarLog({
      usuario_id: usuarioId,
      usuario_tipo: usuarioTipo,
      usuario_nome: usuarioNome,
      acao: 'visualizar',
      modulo: 'caixas',
      descricao: 'Listou movimentações',
      ip: getClientIp(req),
      user_agent: getUserAgent(req)
    });

    res.json({ movimentacoes: result.rows });
  } catch (error) {
    console.error('Erro ao listar movimentações:', error);
    res.status(500).json({ error: 'Erro ao listar movimentações' });
  }
});

/**
 * POST /api/v1/caixas/movimentacoes/entrada
 * Cria uma entrada manual
 */
router.post('/movimentacoes/entrada', async (req, res) => {
  try {
    const usuarioId = req.headers['x-user-id'];
    const usuarioTipo = req.headers['x-user-tipo'] || 'administrativo';
    const usuarioNome = req.headers['x-user-nome'] || null;

    // Verificar permissão de edição
    if (usuarioTipo !== 'master') {
      const permissoesResult = await pool.query(
        'SELECT caixas_editar FROM protese.permissoes_usuarios WHERE usuario_id = $1',
        [usuarioId]
      );

      if (permissoesResult.rows.length === 0 || !permissoesResult.rows[0].caixas_editar) {
        return res.status(403).json({ error: 'Acesso negado. Permissão insuficiente.' });
      }
    }

    const { conta_id, valor, descricao, categoria, data_movimentacao, observacoes } = req.body;

    if (!conta_id || !valor || !descricao) {
      return res.status(400).json({ error: 'Conta, valor e descrição são obrigatórios' });
    }

    if (parseFloat(valor) <= 0) {
      return res.status(400).json({ error: 'Valor deve ser maior que zero' });
    }

    const result = await pool.query(
      `INSERT INTO protese.movimentacoes_caixa 
       (conta_id, tipo_movimentacao, valor, descricao, categoria, data_movimentacao, observacoes, created_by)
       VALUES ($1, 'entrada', $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        conta_id,
        valor,
        descricao,
        categoria || null,
        data_movimentacao || new Date().toISOString().split('T')[0],
        observacoes || null,
        usuarioId
      ]
    );

    await registrarLog({
      usuario_id: usuarioId,
      usuario_tipo: usuarioTipo,
      usuario_nome: usuarioNome,
      acao: 'criar',
      modulo: 'caixas',
      descricao: `Criou entrada manual: ${descricao} - R$ ${valor}`,
      ip: getClientIp(req),
      user_agent: getUserAgent(req)
    });

    res.status(201).json({ movimentacao: result.rows[0] });
  } catch (error) {
    console.error('Erro ao criar entrada:', error);
    res.status(500).json({ error: 'Erro ao criar entrada' });
  }
});

/**
 * POST /api/v1/caixas/movimentacoes/saida
 * Cria uma saída manual
 */
router.post('/movimentacoes/saida', async (req, res) => {
  try {
    const usuarioId = req.headers['x-user-id'];
    const usuarioTipo = req.headers['x-user-tipo'] || 'administrativo';
    const usuarioNome = req.headers['x-user-nome'] || null;

    // Verificar permissão de edição
    if (usuarioTipo !== 'master') {
      const permissoesResult = await pool.query(
        'SELECT caixas_editar FROM protese.permissoes_usuarios WHERE usuario_id = $1',
        [usuarioId]
      );

      if (permissoesResult.rows.length === 0 || !permissoesResult.rows[0].caixas_editar) {
        return res.status(403).json({ error: 'Acesso negado. Permissão insuficiente.' });
      }
    }

    const { conta_id, valor, descricao, categoria, data_movimentacao, observacoes } = req.body;

    if (!conta_id || !valor || !descricao) {
      return res.status(400).json({ error: 'Conta, valor e descrição são obrigatórios' });
    }

    if (parseFloat(valor) <= 0) {
      return res.status(400).json({ error: 'Valor deve ser maior que zero' });
    }

    const result = await pool.query(
      `INSERT INTO protese.movimentacoes_caixa 
       (conta_id, tipo_movimentacao, valor, descricao, categoria, data_movimentacao, observacoes, created_by)
       VALUES ($1, 'saida', $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        conta_id,
        valor,
        descricao,
        categoria || null,
        data_movimentacao || new Date().toISOString().split('T')[0],
        observacoes || null,
        usuarioId
      ]
    );

    await registrarLog({
      usuario_id: usuarioId,
      usuario_tipo: usuarioTipo,
      usuario_nome: usuarioNome,
      acao: 'criar',
      modulo: 'caixas',
      descricao: `Criou saída manual: ${descricao} - R$ ${valor}`,
      ip: getClientIp(req),
      user_agent: getUserAgent(req)
    });

    res.status(201).json({ movimentacao: result.rows[0] });
  } catch (error) {
    console.error('Erro ao criar saída:', error);
    res.status(500).json({ error: 'Erro ao criar saída' });
  }
});

/**
 * POST /api/v1/caixas/movimentacoes/transferencia
 * Cria uma transferência entre contas
 */
router.post('/movimentacoes/transferencia', async (req, res) => {
  try {
    const usuarioId = req.headers['x-user-id'];
    const usuarioTipo = req.headers['x-user-tipo'] || 'administrativo';
    const usuarioNome = req.headers['x-user-nome'] || null;

    // Verificar permissão de edição
    if (usuarioTipo !== 'master') {
      const permissoesResult = await pool.query(
        'SELECT caixas_editar FROM protese.permissoes_usuarios WHERE usuario_id = $1',
        [usuarioId]
      );

      if (permissoesResult.rows.length === 0 || !permissoesResult.rows[0].caixas_editar) {
        return res.status(403).json({ error: 'Acesso negado. Permissão insuficiente.' });
      }
    }

    const { conta_origem_id, conta_destino_id, valor, descricao, data_movimentacao, observacoes } = req.body;

    if (!conta_origem_id || !conta_destino_id || !valor || !descricao) {
      return res.status(400).json({ error: 'Contas de origem e destino, valor e descrição são obrigatórios' });
    }

    if (conta_origem_id === conta_destino_id) {
      return res.status(400).json({ error: 'Conta de origem e destino não podem ser a mesma' });
    }

    if (parseFloat(valor) <= 0) {
      return res.status(400).json({ error: 'Valor deve ser maior que zero' });
    }

    // Verificar saldo da conta origem
    const contaOrigemResult = await pool.query(
      'SELECT saldo_atual, nome FROM protese.contas WHERE id = $1',
      [conta_origem_id]
    );

    if (contaOrigemResult.rows.length === 0) {
      return res.status(404).json({ error: 'Conta de origem não encontrada' });
    }

    if (parseFloat(contaOrigemResult.rows[0].saldo_atual) < parseFloat(valor)) {
      return res.status(400).json({ error: 'Saldo insuficiente na conta de origem' });
    }

    // Verificar se conta destino existe
    const contaDestinoResult = await pool.query(
      'SELECT nome FROM protese.contas WHERE id = $1',
      [conta_destino_id]
    );

    if (contaDestinoResult.rows.length === 0) {
      return res.status(404).json({ error: 'Conta de destino não encontrada' });
    }

    // Criar movimentação de transferência
    // A movimentação é registrada na conta destino, mas tem referência à conta origem
    const result = await pool.query(
      `INSERT INTO protese.movimentacoes_caixa 
       (conta_id, tipo_movimentacao, conta_origem_id, conta_destino_id, valor, descricao, data_movimentacao, observacoes, created_by)
       VALUES ($1, 'transferencia', $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        conta_destino_id, // conta_id é a conta destino para transferências
        conta_origem_id,
        conta_destino_id,
        valor,
        descricao,
        data_movimentacao || new Date().toISOString().split('T')[0],
        observacoes || null,
        usuarioId
      ]
    );

    await registrarLog({
      usuario_id: usuarioId,
      usuario_tipo: usuarioTipo,
      usuario_nome: usuarioNome,
      acao: 'criar',
      modulo: 'caixas',
      descricao: `Criou transferência: ${contaOrigemResult.rows[0].nome} → ${contaDestinoResult.rows[0].nome} - R$ ${valor}`,
      ip: getClientIp(req),
      user_agent: getUserAgent(req)
    });

    res.status(201).json({ movimentacao: result.rows[0] });
  } catch (error) {
    console.error('Erro ao criar transferência:', error);
    res.status(500).json({ error: 'Erro ao criar transferência' });
  }
});

/**
 * DELETE /api/v1/caixas/movimentacoes/:id
 * Exclui uma movimentação
 */
router.delete('/movimentacoes/:id', async (req, res) => {
  try {
    const usuarioId = req.headers['x-user-id'];
    const usuarioTipo = req.headers['x-user-tipo'] || 'administrativo';
    const usuarioNome = req.headers['x-user-nome'] || null;

    // Verificar permissão de exclusão
    if (usuarioTipo !== 'master') {
      const permissoesResult = await pool.query(
        'SELECT caixas_excluir FROM protese.permissoes_usuarios WHERE usuario_id = $1',
        [usuarioId]
      );

      if (permissoesResult.rows.length === 0 || !permissoesResult.rows[0].caixas_excluir) {
        return res.status(403).json({ error: 'Acesso negado. Permissão insuficiente.' });
      }
    }

    // Buscar movimentação antes de excluir
    const movimentacaoResult = await pool.query(
      'SELECT * FROM protese.movimentacoes_caixa WHERE id = $1',
      [req.params.id]
    );

    if (movimentacaoResult.rows.length === 0) {
      return res.status(404).json({ error: 'Movimentação não encontrada' });
    }

    const movimentacao = movimentacaoResult.rows[0];

    // Não permitir excluir saldo inicial
    if (movimentacao.tipo_movimentacao === 'saldo_inicial') {
      return res.status(400).json({ error: 'Não é possível excluir movimentação de saldo inicial' });
    }

    await pool.query('DELETE FROM protese.movimentacoes_caixa WHERE id = $1', [req.params.id]);

    await registrarLog({
      usuario_id: usuarioId,
      usuario_tipo: usuarioTipo,
      usuario_nome: usuarioNome,
      acao: 'excluir',
      modulo: 'caixas',
      descricao: `Excluiu movimentação: ${movimentacao.descricao} - R$ ${movimentacao.valor}`,
      ip: getClientIp(req),
      user_agent: getUserAgent(req)
    });

    res.json({ message: 'Movimentação excluída com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir movimentação:', error);
    res.status(500).json({ error: 'Erro ao excluir movimentação' });
  }
});

module.exports = router;

