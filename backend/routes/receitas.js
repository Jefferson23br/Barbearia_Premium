const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { registrarLog, getClientIp, getUserAgent } = require('../utils/logger');

/**
 * GET /api/v1/receitas
 * Lista todas as receitas com filtros
 */
router.get('/', async (req, res) => {
  try {
    const usuarioId = req.headers['x-user-id'];
    const usuarioTipo = req.headers['x-user-tipo'] || 'administrativo';
    const usuarioNome = req.headers['x-user-nome'] || null;

    // Verificar permissão
    if (usuarioTipo !== 'master') {
      const permissoesResult = await pool.query(
        'SELECT receitas_ver FROM protese.permissoes_usuarios WHERE usuario_id = $1',
        [usuarioId]
      );

      if (permissoesResult.rows.length === 0 || !permissoesResult.rows[0].receitas_ver) {
        return res.status(403).json({ error: 'Acesso negado. Permissão insuficiente.' });
      }
    }

    const { 
      data_inicio, 
      data_fim, 
      data_vencimento_inicio,
      data_vencimento_fim,
      cliente_id, 
      status, 
      forma_pagamento,
      caixa_id,
      search 
    } = req.query;

    let query = `
      SELECT 
        r.*,
        c.nome_completo as cliente_nome,
        ca.nome as caixa_nome,
        v.ticket as venda_ticket
      FROM protese.receitas r
      LEFT JOIN protese.usuarios_clientes c ON r.cliente_id = c.id
      LEFT JOIN protese.contas ca ON r.caixa_id = ca.id
      LEFT JOIN protese.vendas v ON r.venda_id = v.id
      WHERE 1=1
    `;
    const params = [];
    let paramIndex = 1;

    if (data_inicio) {
      query += ` AND r.data_emissao >= $${paramIndex}`;
      params.push(data_inicio);
      paramIndex++;
    }

    if (data_fim) {
      query += ` AND r.data_emissao <= $${paramIndex}`;
      params.push(data_fim);
      paramIndex++;
    }

    if (data_vencimento_inicio) {
      query += ` AND r.data_vencimento >= $${paramIndex}`;
      params.push(data_vencimento_inicio);
      paramIndex++;
    }

    if (data_vencimento_fim) {
      query += ` AND r.data_vencimento <= $${paramIndex}`;
      params.push(data_vencimento_fim);
      paramIndex++;
    }

    if (cliente_id) {
      query += ` AND r.cliente_id = $${paramIndex}`;
      params.push(cliente_id);
      paramIndex++;
    }

    if (status) {
      query += ` AND r.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    if (forma_pagamento) {
      query += ` AND r.forma_pagamento = $${paramIndex}`;
      params.push(forma_pagamento);
      paramIndex++;
    }

    if (caixa_id) {
      query += ` AND r.caixa_id = $${paramIndex}`;
      params.push(caixa_id);
      paramIndex++;
    }

    if (search) {
      query += ` AND (r.ticket_venda ILIKE $${paramIndex} OR c.nome_completo ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    query += ' ORDER BY r.data_vencimento ASC, r.created_at DESC';

    console.log('[Receitas] Query:', query);
    console.log('[Receitas] Params:', params);
    
    const result = await pool.query(query, params);

    console.log('[Receitas] Total de receitas encontradas:', result.rows.length);

    await registrarLog({
      usuario_id: usuarioId,
      usuario_tipo: usuarioTipo,
      usuario_nome: usuarioNome,
      acao: 'visualizar',
      modulo: 'receitas',
      descricao: 'Listou receitas',
      ip: getClientIp(req),
      user_agent: getUserAgent(req)
    });

    res.json({ receitas: result.rows });
  } catch (error) {
    console.error('Erro ao listar receitas:', error);
    res.status(500).json({ error: 'Erro ao listar receitas' });
  }
});

/**
 * GET /api/v1/receitas/:id
 * Busca uma receita específica
 */
router.get('/:id', async (req, res) => {
  try {
    const usuarioId = req.headers['x-user-id'];
    const usuarioTipo = req.headers['x-user-tipo'] || 'administrativo';
    const usuarioNome = req.headers['x-user-nome'] || null;

    // Verificar permissão
    if (usuarioTipo !== 'master') {
      const permissoesResult = await pool.query(
        'SELECT receitas_ver FROM protese.permissoes_usuarios WHERE usuario_id = $1',
        [usuarioId]
      );

      if (permissoesResult.rows.length === 0 || !permissoesResult.rows[0].receitas_ver) {
        return res.status(403).json({ error: 'Acesso negado. Permissão insuficiente.' });
      }
    }

    const result = await pool.query(
      `SELECT 
        r.*,
        c.nome_completo as cliente_nome,
        ca.nome as caixa_nome,
        v.ticket as venda_ticket
       FROM protese.receitas r
       LEFT JOIN protese.usuarios_clientes c ON r.cliente_id = c.id
       LEFT JOIN protese.contas ca ON r.caixa_id = ca.id
       LEFT JOIN protese.vendas v ON r.venda_id = v.id
       WHERE r.id = $1`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Receita não encontrada' });
    }

    res.json({ receita: result.rows[0] });
  } catch (error) {
    console.error('Erro ao buscar receita:', error);
    res.status(500).json({ error: 'Erro ao buscar receita' });
  }
});

/**
 * POST /api/v1/receitas/efetivar-pagamento
 * Efetiva pagamento de uma ou múltiplas receitas
 */
router.post('/efetivar-pagamento', async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    const usuarioId = req.headers['x-user-id'];
    const usuarioTipo = req.headers['x-user-tipo'] || 'administrativo';
    const usuarioNome = req.headers['x-user-nome'] || null;

    // Verificar permissão
    if (usuarioTipo !== 'master') {
      const permissoesResult = await client.query(
        'SELECT receitas_editar FROM protese.permissoes_usuarios WHERE usuario_id = $1',
        [usuarioId]
      );

      if (permissoesResult.rows.length === 0 || !permissoesResult.rows[0].receitas_editar) {
        await client.query('ROLLBACK');
        return res.status(403).json({ error: 'Acesso negado. Permissão insuficiente.' });
      }
    }

    const { receitas, caixa_id, data_pagamento } = req.body;

    if (!receitas || !Array.isArray(receitas) || receitas.length === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Lista de receitas é obrigatória' });
    }

    if (!caixa_id) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Caixa é obrigatório' });
    }

    const dataPagamento = data_pagamento || new Date().toISOString().split('T')[0];
    const receitasAtualizadas = [];
    let valorTotal = 0;

    for (const receitaItem of receitas) {
      const { receita_id, valor_pago } = receitaItem;

      if (!receita_id) {
        await client.query('ROLLBACK');
        return res.status(400).json({ error: 'ID da receita é obrigatório' });
      }

      // Buscar receita
      const receitaResult = await client.query(
        'SELECT * FROM protese.receitas WHERE id = $1',
        [receita_id]
      );

      if (receitaResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ error: `Receita ${receita_id} não encontrada` });
      }

      const receita = receitaResult.rows[0];

      // Se já está paga, pular
      if (receita.status === 'paga') {
        continue;
      }

      const valorPago = parseFloat(valor_pago) || parseFloat(receita.valor_vencimento);
      valorTotal += valorPago;

      // Atualizar receita
      const statusReceita = valorPago >= parseFloat(receita.valor_vencimento) ? 'paga' : 'parcial';

      await client.query(
        `UPDATE protese.receitas 
         SET data_pagamento = $1, 
             valor_pago = $2, 
             status = $3,
             caixa_id = $4,
             updated_by = $5
         WHERE id = $6`,
        [dataPagamento, valorPago, statusReceita, caixa_id, usuarioId, receita_id]
      );

      // Criar movimentação no caixa
      const movimentacaoResult = await client.query(
        `INSERT INTO protese.movimentacoes_caixa 
         (conta_id, tipo_movimentacao, valor, descricao, data_movimentacao, referencia_id, referencia_tipo, created_by)
         VALUES ($1, 'entrada', $2, $3, $4, $5, 'receita', $6)
         RETURNING id`,
        [
          caixa_id,
          valorPago,
          `Receita ${receita.ticket_venda} - Pagamento`,
          dataPagamento,
          receita_id,
          usuarioId
        ]
      );

      // Atualizar receita com o ID da movimentação
      await client.query(
        `UPDATE protese.receitas 
         SET movimentacao_caixa_id = $1 
         WHERE id = $2`,
        [movimentacaoResult.rows[0].id, receita_id]
      );

      // Buscar receita atualizada
      const receitaAtualizada = await client.query(
        `SELECT 
          r.*,
          c.nome_completo as cliente_nome,
          ca.nome as caixa_nome
         FROM protese.receitas r
         LEFT JOIN protese.usuarios_clientes c ON r.cliente_id = c.id
         LEFT JOIN protese.contas ca ON r.caixa_id = ca.id
         WHERE r.id = $1`,
        [receita_id]
      );

      receitasAtualizadas.push(receitaAtualizada.rows[0]);
    }

    await client.query('COMMIT');

    await registrarLog({
      usuario_id: usuarioId,
      usuario_tipo: usuarioTipo,
      usuario_nome: usuarioNome,
      acao: 'editar',
      modulo: 'receitas',
      descricao: `Efetivou pagamento de ${receitasAtualizadas.length} receita(s)`,
      ip: getClientIp(req),
      user_agent: getUserAgent(req)
    });

    res.json({
      message: `${receitasAtualizadas.length} receita(s) pagas com sucesso`,
      receitas: receitasAtualizadas,
      valor_total: valorTotal
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Erro ao efetivar pagamento:', error);
    res.status(500).json({ error: 'Erro ao efetivar pagamento', details: error.message });
  } finally {
    client.release();
  }
});

/**
 * PUT /api/v1/receitas/:id
 * Atualiza uma receita (apenas observações e valor_pago se ainda não paga)
 */
router.put('/:id', async (req, res) => {
  try {
    const usuarioId = req.headers['x-user-id'];
    const usuarioTipo = req.headers['x-user-tipo'] || 'administrativo';
    const usuarioNome = req.headers['x-user-nome'] || null;

    // Verificar permissão
    if (usuarioTipo !== 'master') {
      const permissoesResult = await pool.query(
        'SELECT receitas_editar FROM protese.permissoes_usuarios WHERE usuario_id = $1',
        [usuarioId]
      );

      if (permissoesResult.rows.length === 0 || !permissoesResult.rows[0].receitas_editar) {
        return res.status(403).json({ error: 'Acesso negado. Permissão insuficiente.' });
      }
    }

    const { observacoes, valor_pago } = req.body;

    // Buscar receita atual
    const receitaAtual = await pool.query(
      'SELECT * FROM protese.receitas WHERE id = $1',
      [req.params.id]
    );

    if (receitaAtual.rows.length === 0) {
      return res.status(404).json({ error: 'Receita não encontrada' });
    }

    const receita = receitaAtual.rows[0];

    // Se já está paga, só pode alterar observações
    if (receita.status === 'paga' && valor_pago !== undefined) {
      return res.status(400).json({ error: 'Não é possível alterar valor de receita já paga' });
    }

    let query = 'UPDATE protese.receitas SET updated_by = $1';
    const params = [usuarioId];
    let paramIndex = 2;

    if (observacoes !== undefined) {
      query += `, observacoes = $${paramIndex}`;
      params.push(observacoes);
      paramIndex++;
    }

    if (valor_pago !== undefined && receita.status !== 'paga') {
      query += `, valor_pago = $${paramIndex}`;
      params.push(parseFloat(valor_pago));
      paramIndex++;
    }

    query += ` WHERE id = $${paramIndex}`;
    params.push(req.params.id);

    await pool.query(query, params);

    // Buscar receita atualizada
    const receitaAtualizada = await pool.query(
      `SELECT 
        r.*,
        c.nome_completo as cliente_nome,
        ca.nome as caixa_nome
       FROM protese.receitas r
       LEFT JOIN protese.usuarios_clientes c ON r.cliente_id = c.id
       LEFT JOIN protese.contas ca ON r.caixa_id = ca.id
       WHERE r.id = $1`,
      [req.params.id]
    );

    await registrarLog({
      usuario_id: usuarioId,
      usuario_tipo: usuarioTipo,
      usuario_nome: usuarioNome,
      acao: 'editar',
      modulo: 'receitas',
      descricao: `Atualizou receita ${receitaAtualizada.rows[0].ticket_venda}`,
      ip: getClientIp(req),
      user_agent: getUserAgent(req)
    });

    res.json({ receita: receitaAtualizada.rows[0] });
  } catch (error) {
    console.error('Erro ao atualizar receita:', error);
    res.status(500).json({ error: 'Erro ao atualizar receita' });
  }
});

/**
 * DELETE /api/v1/receitas/:id
 * Exclui uma receita (apenas se não estiver paga)
 */
router.delete('/:id', async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    const usuarioId = req.headers['x-user-id'];
    const usuarioTipo = req.headers['x-user-tipo'] || 'administrativo';
    const usuarioNome = req.headers['x-user-nome'] || null;

    // Verificar permissão
    if (usuarioTipo !== 'master') {
      const permissoesResult = await client.query(
        'SELECT receitas_excluir FROM protese.permissoes_usuarios WHERE usuario_id = $1',
        [usuarioId]
      );

      if (permissoesResult.rows.length === 0 || !permissoesResult.rows[0].receitas_excluir) {
        await client.query('ROLLBACK');
        return res.status(403).json({ error: 'Acesso negado. Permissão insuficiente.' });
      }
    }

    // Buscar receita
    const receitaResult = await client.query(
      'SELECT ticket_venda, status, movimentacao_caixa_id FROM protese.receitas WHERE id = $1',
      [req.params.id]
    );

    if (receitaResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Receita não encontrada' });
    }

    const receita = receitaResult.rows[0];

    // Não permitir excluir receita paga
    if (receita.status === 'paga') {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Não é possível excluir receita já paga' });
    }

    // Excluir movimentação de caixa se existir
    if (receita.movimentacao_caixa_id) {
      await client.query(
        'DELETE FROM protese.movimentacoes_caixa WHERE id = $1',
        [receita.movimentacao_caixa_id]
      );
    }

    // Excluir receita
    await client.query('DELETE FROM protese.receitas WHERE id = $1', [req.params.id]);

    await client.query('COMMIT');

    await registrarLog({
      usuario_id: usuarioId,
      usuario_tipo: usuarioTipo,
      usuario_nome: usuarioNome,
      acao: 'excluir',
      modulo: 'receitas',
      descricao: `Excluiu receita ${receita.ticket_venda}`,
      ip: getClientIp(req),
      user_agent: getUserAgent(req)
    });

    res.json({ message: 'Receita excluída com sucesso' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Erro ao excluir receita:', error);
    res.status(500).json({ error: 'Erro ao excluir receita' });
  } finally {
    client.release();
  }
});

module.exports = router;

