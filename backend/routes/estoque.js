const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { registrarLog, getClientIp, getUserAgent } = require('../utils/logger');

/**
 * GET /api/v1/estoque/produtos
 * Lista todos os produtos com informações de estoque
 */
router.get('/produtos', async (req, res) => {
  try {
    const usuarioId = req.headers['x-user-id'];
    const usuarioTipo = req.headers['x-user-tipo'] || 'administrativo';

    // Verificar permissão de visualização
    if (usuarioTipo !== 'master') {
      const permissoesResult = await pool.query(
        'SELECT estoque_ver FROM permissoes_usuarios WHERE usuario_id = $1',
        [usuarioId]
      );

      if (permissoesResult.rows.length === 0 || !permissoesResult.rows[0].estoque_ver) {
        return res.status(403).json({ error: 'Acesso negado. Permissão insuficiente.' });
      }
    }

    const { search, fornecedor, estoque_baixo } = req.query;
    let query = `
      SELECT 
        p.id,
        p.codigo,
        p.descricao,
        p.fornecedor,
        p.preco_venda,
        COALESCE(p.quantidade_estoque, 0) as quantidade_estoque,
        p.ultimo_preco_custo,
        p.is_active,
        (SELECT valor_unitario 
         FROM estoque_movimentacoes 
         WHERE produto_id = p.id 
         ORDER BY data_movimentacao DESC, created_at DESC 
         LIMIT 1) as ultimo_preco_compra
      FROM produtos p
      WHERE 1=1
    `;
    const params = [];
    let paramIndex = 1;

    if (search) {
      query += ` AND (p.codigo LIKE $${paramIndex} OR p.descricao LIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    if (fornecedor) {
      query += ` AND p.fornecedor LIKE $${paramIndex}`;
      params.push(`%${fornecedor}%`);
      paramIndex++;
    }

    if (estoque_baixo === 'true') {
      query += ` AND COALESCE(p.quantidade_estoque, 0) <= 10`;
    }

    query += ' ORDER BY p.descricao ASC';

    const result = await pool.query(query, params);

    // Processar produtos com último preço de compra
    const produtos = result.rows.map((produto) => ({
      ...produto,
      ultimo_preco_compra: produto.ultimo_preco_compra || produto.ultimo_preco_custo || null,
      quantidade_estoque: produto.quantidade_estoque || 0,
    }));

    res.json({
      produtos,
    });
  } catch (error) {
    console.error('Erro ao buscar produtos com estoque:', error);
    res.status(500).json({
      error: 'Erro ao buscar produtos com estoque',
      message: error.message,
    });
  }
});

/**
 * GET /api/v1/estoque/movimentacoes
 * Lista todas as movimentações de estoque
 */
router.get('/movimentacoes', async (req, res) => {
  try {
    const usuarioId = req.headers['x-user-id'];
    const usuarioTipo = req.headers['x-user-tipo'] || 'administrativo';

    // Verificar permissão de visualização
    if (usuarioTipo !== 'master') {
      const permissoesResult = await pool.query(
        'SELECT estoque_ver FROM permissoes_usuarios WHERE usuario_id = $1',
        [usuarioId]
      );

      if (permissoesResult.rows.length === 0 || !permissoesResult.rows[0].estoque_ver) {
        return res.status(403).json({ error: 'Acesso negado. Permissão insuficiente.' });
      }
    }

    const { produto_id, fornecedor, data_inicio, data_fim } = req.query;
    let query = `
      SELECT 
        em.*,
        p.codigo as produto_codigo,
        p.descricao as produto_descricao
      FROM estoque_movimentacoes em
      INNER JOIN produtos p ON em.produto_id = p.id
      WHERE 1=1
    `;
    const params = [];
    let paramIndex = 1;

    if (produto_id) {
      query += ` AND em.produto_id = $${paramIndex}`;
      params.push(produto_id);
      paramIndex++;
    }

    if (fornecedor) {
      query += ` AND em.fornecedor LIKE $${paramIndex}`;
      params.push(`%${fornecedor}%`);
      paramIndex++;
    }

    if (data_inicio) {
      query += ` AND em.data_movimentacao >= $${paramIndex}`;
      params.push(data_inicio);
      paramIndex++;
    }

    if (data_fim) {
      query += ` AND em.data_movimentacao <= $${paramIndex}`;
      params.push(data_fim);
      paramIndex++;
    }

    query += ' ORDER BY em.data_movimentacao DESC, em.created_at DESC';

    const result = await pool.query(query, params);

    res.json({
      movimentacoes: result.rows,
    });
  } catch (error) {
    console.error('Erro ao buscar movimentações:', error);
    res.status(500).json({
      error: 'Erro ao buscar movimentações',
      message: error.message,
    });
  }
});

/**
 * GET /api/v1/estoque/movimentacoes/:id
 * Busca uma movimentação específica
 */
router.get('/movimentacoes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const usuarioId = req.headers['x-user-id'];
    const usuarioTipo = req.headers['x-user-tipo'] || 'administrativo';

    // Verificar permissão de visualização
    if (usuarioTipo !== 'master') {
      const permissoesResult = await pool.query(
        'SELECT estoque_ver FROM permissoes_usuarios WHERE usuario_id = $1',
        [usuarioId]
      );

      if (permissoesResult.rows.length === 0 || !permissoesResult.rows[0].estoque_ver) {
        return res.status(403).json({ error: 'Acesso negado. Permissão insuficiente.' });
      }
    }

    const result = await pool.query(
      `SELECT 
        em.*,
        p.codigo as produto_codigo,
        p.descricao as produto_descricao
      FROM estoque_movimentacoes em
      INNER JOIN produtos p ON em.produto_id = p.id
      WHERE em.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Movimentação não encontrada' });
    }

    res.json({
      movimentacao: result.rows[0],
    });
  } catch (error) {
    console.error('Erro ao buscar movimentação:', error);
    res.status(500).json({
      error: 'Erro ao buscar movimentação',
      message: error.message,
    });
  }
});

/**
 * POST /api/v1/estoque/entrada
 * Lança uma entrada de estoque
 */
router.post('/entrada', async (req, res) => {
  try {
    const usuarioId = req.headers['x-user-id'];
    const usuarioTipo = req.headers['x-user-tipo'] || 'administrativo';
    const usuarioNome = req.headers['x-user-nome'] || null;

    // Verificar permissão de edição
    if (usuarioTipo !== 'master') {
      const permissoesResult = await pool.query(
        'SELECT estoque_editar FROM permissoes_usuarios WHERE usuario_id = $1',
        [usuarioId]
      );

      if (permissoesResult.rows.length === 0 || !permissoesResult.rows[0].estoque_editar) {
        return res.status(403).json({ error: 'Acesso negado. Permissão insuficiente.' });
      }
    }

    const {
      produto_id,
      fornecedor,
      quantidade,
      valor_unitario,
      data_movimentacao,
      observacoes,
    } = req.body;

    // Validações
    if (!produto_id || !fornecedor || !quantidade || valor_unitario === undefined) {
      return res.status(400).json({
        error: 'Campos obrigatórios: produto_id, fornecedor, quantidade, valor_unitario',
      });
    }

    const quantidadeNumber = parseInt(quantidade);
    const valorUnitarioNumber = parseFloat(valor_unitario);

    if (isNaN(quantidadeNumber) || quantidadeNumber <= 0) {
      return res.status(400).json({ error: 'Quantidade inválida' });
    }

    if (isNaN(valorUnitarioNumber) || valorUnitarioNumber < 0) {
      return res.status(400).json({ error: 'Valor unitário inválido' });
    }

    // Verificar se produto existe
    const produtoCheck = await pool.query(
      'SELECT id, descricao, codigo FROM produtos WHERE id = $1',
      [produto_id]
    );

    if (produtoCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }

    // Inserir movimentação
    const result = await pool.query(
      `INSERT INTO estoque_movimentacoes (
        produto_id, fornecedor, quantidade, valor_unitario, 
        data_movimentacao, observacoes, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *`,
      [
        produto_id,
        fornecedor.trim(),
        quantidadeNumber,
        valorUnitarioNumber,
        data_movimentacao || new Date().toISOString().split('T')[0],
        observacoes || null,
        usuarioId,
      ]
    );

    const novaMovimentacao = result.rows[0];

    // O trigger vai atualizar automaticamente:
    // - quantidade_estoque na tabela produtos
    // - ultimo_preco_custo na tabela produtos
    // - fornecedor na tabela produtos
    // - histórico de preços de custo

    // Registrar log
    if (usuarioId) {
      try {
        await registrarLog({
          usuarioId,
          usuarioTipo,
          usuarioNome,
          acao: 'criar',
          modulo: 'estoque',
          entidadeId: novaMovimentacao.id,
          entidadeTipo: 'estoque_movimentacao',
          descricao: `Entrada de estoque: ${quantidadeNumber} unidades de ${produtoCheck.rows[0].descricao} (${produtoCheck.rows[0].codigo}) - Fornecedor: ${fornecedor}`,
          dadosNovos: {
            produto_id,
            fornecedor,
            quantidade: quantidadeNumber,
            valor_unitario: valorUnitarioNumber,
            valor_total: novaMovimentacao.valor_total,
          },
          ipAddress: getClientIp(req),
          userAgent: getUserAgent(req),
        });
      } catch (logError) {
        console.error('Erro ao registrar log:', logError);
      }
    }

    res.status(201).json({
      message: 'Entrada de estoque lançada com sucesso!',
      movimentacao: novaMovimentacao,
    });
  } catch (error) {
    console.error('Erro ao lançar entrada de estoque:', error);
    res.status(500).json({
      error: 'Erro ao lançar entrada de estoque',
      message: error.message,
    });
  }
});

/**
 * DELETE /api/v1/estoque/movimentacoes/:id
 * Exclui uma movimentação de estoque
 */
router.delete('/movimentacoes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const usuarioId = req.headers['x-user-id'];
    const usuarioTipo = req.headers['x-user-tipo'] || 'administrativo';
    const usuarioNome = req.headers['x-user-nome'] || null;

    // Verificar permissão de exclusão
    if (usuarioTipo !== 'master') {
      const permissoesResult = await pool.query(
        'SELECT estoque_excluir FROM permissoes_usuarios WHERE usuario_id = $1',
        [usuarioId]
      );

      if (permissoesResult.rows.length === 0 || !permissoesResult.rows[0].estoque_excluir) {
        return res.status(403).json({ error: 'Acesso negado. Permissão insuficiente.' });
      }
    }

    // Buscar movimentação para log
    const movimentacao = await pool.query(
      `SELECT 
        em.*,
        p.descricao as produto_descricao,
        p.codigo as produto_codigo
      FROM estoque_movimentacoes em
      INNER JOIN produtos p ON em.produto_id = p.id
      WHERE em.id = $1`,
      [id]
    );

    if (movimentacao.rows.length === 0) {
      return res.status(404).json({ error: 'Movimentação não encontrada' });
    }

    // Excluir movimentação (trigger vai reverter quantidade automaticamente)
    await pool.query('DELETE FROM estoque_movimentacoes WHERE id = $1', [id]);

    // Registrar log
    if (usuarioId) {
      try {
        await registrarLog({
          usuarioId,
          usuarioTipo,
          usuarioNome,
          acao: 'excluir',
          modulo: 'estoque',
          entidadeId: id,
          entidadeTipo: 'estoque_movimentacao',
          descricao: `Movimentação de estoque excluída: ${movimentacao.rows[0].quantidade} unidades de ${movimentacao.rows[0].produto_descricao} (${movimentacao.rows[0].produto_codigo})`,
          dadosAnteriores: movimentacao.rows[0],
          ipAddress: getClientIp(req),
          userAgent: getUserAgent(req),
        });
      } catch (logError) {
        console.error('Erro ao registrar log:', logError);
      }
    }

    res.json({
      message: 'Movimentação excluída com sucesso!',
    });
  } catch (error) {
    console.error('Erro ao excluir movimentação:', error);
    res.status(500).json({
      error: 'Erro ao excluir movimentação',
      message: error.message,
    });
  }
});

module.exports = router;

