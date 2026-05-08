const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { registrarLog, getClientIp, getUserAgent } = require('../utils/logger');

/**
 * GET /api/v1/produtos
 * Lista todos os produtos
 */
router.get('/', async (req, res) => {
  try {
    const usuarioId = req.headers['x-user-id'];
    const usuarioTipo = req.headers['x-user-tipo'] || 'administrativo';
    const usuarioNome = req.headers['x-user-nome'] || null;

    // Verificar permissão de visualização
    if (usuarioTipo !== 'master') {
      const permissoesResult = await pool.query(
        'SELECT produtos_ver FROM permissoes_usuarios WHERE usuario_id = $1',
        [usuarioId]
      );

      if (permissoesResult.rows.length === 0 || !permissoesResult.rows[0].produtos_ver) {
        return res.status(403).json({ error: 'Acesso negado. Permissão insuficiente.' });
      }
    }

    const { fornecedor, is_active, search } = req.query;
    let query = `
      SELECT 
        p.*,
        (SELECT preco_custo 
         FROM produtos_precos_custo 
         WHERE produto_id = p.id 
         ORDER BY data_lancamento DESC, created_at DESC 
         LIMIT 1) as ultimo_preco_custo_real
      FROM produtos p
      WHERE 1=1
    `;
    const params = [];
    let paramIndex = 1;

    if (fornecedor) {
      query += ` AND p.fornecedor = $${paramIndex}`;
      params.push(fornecedor);
      paramIndex++;
    }

    if (is_active !== undefined) {
      query += ` AND p.is_active = $${paramIndex}`;
      params.push(is_active === 'true');
      paramIndex++;
    }

    if (search) {
      query += ` AND (p.codigo LIKE $${paramIndex} OR p.descricao LIKE $${paramIndex} OR p.fornecedor LIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    query += ' ORDER BY p.descricao ASC';

    const result = await pool.query(query, params);

    // Processar produtos com último preço de custo
    const produtos = result.rows.map((produto) => ({
      ...produto,
      ultimo_preco_custo: produto.ultimo_preco_custo_real || produto.ultimo_preco_custo || null,
    }));

    res.json({
      produtos,
    });
  } catch (error) {
    console.error('Erro ao buscar produtos:', error);
    res.status(500).json({
      error: 'Erro ao buscar produtos',
      message: error.message,
    });
  }
});

/**
 * GET /api/v1/produtos/:id
 * Busca um produto por ID
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const usuarioId = req.headers['x-user-id'];
    const usuarioTipo = req.headers['x-user-tipo'] || 'administrativo';

    // Verificar permissão de visualização
    if (usuarioTipo !== 'master') {
      const permissoesResult = await pool.query(
        'SELECT produtos_ver FROM permissoes_usuarios WHERE usuario_id = $1',
        [usuarioId]
      );

      if (permissoesResult.rows.length === 0 || !permissoesResult.rows[0].produtos_ver) {
        return res.status(403).json({ error: 'Acesso negado. Permissão insuficiente.' });
      }
    }

    const result = await pool.query(
      `SELECT 
        p.*,
        (SELECT preco_custo 
         FROM produtos_precos_custo 
         WHERE produto_id = p.id 
         ORDER BY data_lancamento DESC, created_at DESC 
         LIMIT 1) as ultimo_preco_custo_real
      FROM produtos p
      WHERE p.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }

    const produto = result.rows[0];
    produto.ultimo_preco_custo = produto.ultimo_preco_custo_real || produto.ultimo_preco_custo || null;
    delete produto.ultimo_preco_custo_real;

    res.json({
      produto,
    });
  } catch (error) {
    console.error('Erro ao buscar produto:', error);
    res.status(500).json({
      error: 'Erro ao buscar produto',
      message: error.message,
    });
  }
});

/**
 * POST /api/v1/produtos
 * Cria um novo produto
 */
router.post('/', async (req, res) => {
  try {
    const usuarioId = req.headers['x-user-id'];
    const usuarioTipo = req.headers['x-user-tipo'] || 'administrativo';
    const usuarioNome = req.headers['x-user-nome'] || null;

    // Verificar permissão de edição
    if (usuarioTipo !== 'master') {
      const permissoesResult = await pool.query(
        'SELECT produtos_editar FROM permissoes_usuarios WHERE usuario_id = $1',
        [usuarioId]
      );

      if (permissoesResult.rows.length === 0 || !permissoesResult.rows[0].produtos_editar) {
        return res.status(403).json({ error: 'Acesso negado. Permissão insuficiente.' });
      }
    }

    const {
      codigo,
      descricao,
      fornecedor,
      preco_venda,
      is_active = true,
    } = req.body;

    // Validações
    if (!codigo || !descricao || preco_venda === undefined) {
      return res.status(400).json({
        error: 'Campos obrigatórios: codigo, descricao, preco_venda',
      });
    }

    const precoVendaNumber = parseFloat(preco_venda);
    if (isNaN(precoVendaNumber) || precoVendaNumber < 0) {
      return res.status(400).json({ error: 'Preço de venda inválido' });
    }

    // Verificar se código já existe
    const codigoCheck = await pool.query(
      'SELECT id FROM produtos WHERE codigo = $1',
      [codigo]
    );

    if (codigoCheck.rows.length > 0) {
      return res.status(409).json({ error: 'Código já cadastrado' });
    }

    // Inserir no banco de dados
    const result = await pool.query(
      `INSERT INTO produtos (
        codigo, descricao, fornecedor, preco_venda, is_active, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *`,
      [codigo, descricao, fornecedor || null, precoVendaNumber, is_active, usuarioId]
    );

    const novoProduto = result.rows[0];

    // Registrar log
    if (usuarioId) {
      try {
        await registrarLog({
          usuarioId,
          usuarioTipo,
          usuarioNome,
          acao: 'criar',
          modulo: 'produto',
          entidadeId: novoProduto.id,
          entidadeTipo: 'produto',
          descricao: `Produto ${descricao} (${codigo}) criado`,
          dadosNovos: { codigo, descricao, fornecedor, preco_venda: precoVendaNumber },
          ipAddress: getClientIp(req),
          userAgent: getUserAgent(req),
        });
      } catch (logError) {
        console.error('Erro ao registrar log:', logError);
      }
    }

    res.status(201).json({
      message: 'Produto criado com sucesso!',
      produto: novoProduto,
    });
  } catch (error) {
    console.error('Erro ao criar produto:', error);
    
    if (error.code === '23505') {
      return res.status(409).json({ error: 'Código já cadastrado' });
    }

    res.status(500).json({
      error: 'Erro ao criar produto',
      message: error.message,
    });
  }
});

/**
 * PUT /api/v1/produtos/:id
 * Atualiza um produto
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const usuarioId = req.headers['x-user-id'];
    const usuarioTipo = req.headers['x-user-tipo'] || 'administrativo';
    const usuarioNome = req.headers['x-user-nome'] || null;

    // Verificar permissão de edição
    if (usuarioTipo !== 'master') {
      const permissoesResult = await pool.query(
        'SELECT produtos_editar FROM permissoes_usuarios WHERE usuario_id = $1',
        [usuarioId]
      );

      if (permissoesResult.rows.length === 0 || !permissoesResult.rows[0].produtos_editar) {
        return res.status(403).json({ error: 'Acesso negado. Permissão insuficiente.' });
      }
    }

    // Buscar produto atual para log
    const produtoAtual = await pool.query(
      'SELECT * FROM produtos WHERE id = $1',
      [id]
    );

    if (produtoAtual.rows.length === 0) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }

    const {
      codigo,
      descricao,
      fornecedor,
      preco_venda,
      is_active,
    } = req.body;

    // Validações
    if (!codigo || !descricao || preco_venda === undefined) {
      return res.status(400).json({
        error: 'Campos obrigatórios: codigo, descricao, preco_venda',
      });
    }

    const precoVendaNumber = parseFloat(preco_venda);
    if (isNaN(precoVendaNumber) || precoVendaNumber < 0) {
      return res.status(400).json({ error: 'Preço de venda inválido' });
    }

    // Verificar se código já existe em outro produto
    const codigoCheck = await pool.query(
      'SELECT id FROM produtos WHERE codigo = $1 AND id != $2',
      [codigo, id]
    );

    if (codigoCheck.rows.length > 0) {
      return res.status(409).json({ error: 'Código já cadastrado para outro produto' });
    }

    // Atualizar no banco de dados
    const result = await pool.query(
      `UPDATE produtos SET
        codigo = $1,
        descricao = $2,
        fornecedor = $3,
        preco_venda = $4,
        is_active = $5,
        updated_by = $6
      WHERE id = $7
      RETURNING *`,
      [codigo, descricao, fornecedor || null, precoVendaNumber, is_active !== undefined ? is_active : true, usuarioId, id]
    );

    const produtoAtualizado = result.rows[0];

    // Registrar log
    if (usuarioId) {
      try {
        await registrarLog({
          usuarioId,
          usuarioTipo,
          usuarioNome,
          acao: 'editar',
          modulo: 'produto',
          entidadeId: id,
          entidadeTipo: 'produto',
          descricao: `Produto ${descricao} (${codigo}) atualizado`,
          dadosAnteriores: produtoAtual.rows[0],
          dadosNovos: produtoAtualizado,
          ipAddress: getClientIp(req),
          userAgent: getUserAgent(req),
        });
      } catch (logError) {
        console.error('Erro ao registrar log:', logError);
      }
    }

    res.json({
      message: 'Produto atualizado com sucesso!',
      produto: produtoAtualizado,
    });
  } catch (error) {
    console.error('Erro ao atualizar produto:', error);
    
    if (error.code === '23505') {
      return res.status(409).json({ error: 'Código já cadastrado' });
    }

    res.status(500).json({
      error: 'Erro ao atualizar produto',
      message: error.message,
    });
  }
});

/**
 * DELETE /api/v1/produtos/:id
 * Exclui um produto
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const usuarioId = req.headers['x-user-id'];
    const usuarioTipo = req.headers['x-user-tipo'] || 'administrativo';
    const usuarioNome = req.headers['x-user-nome'] || null;

    // Verificar permissão de exclusão
    if (usuarioTipo !== 'master') {
      const permissoesResult = await pool.query(
        'SELECT produtos_excluir FROM permissoes_usuarios WHERE usuario_id = $1',
        [usuarioId]
      );

      if (permissoesResult.rows.length === 0 || !permissoesResult.rows[0].produtos_excluir) {
        return res.status(403).json({ error: 'Acesso negado. Permissão insuficiente.' });
      }
    }

    // Buscar produto para log
    const produto = await pool.query(
      'SELECT * FROM produtos WHERE id = $1',
      [id]
    );

    if (produto.rows.length === 0) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }

    // Excluir produto (cascade vai excluir histórico de preços)
    await pool.query('DELETE FROM produtos WHERE id = $1', [id]);

    // Registrar log
    if (usuarioId) {
      try {
        await registrarLog({
          usuarioId,
          usuarioTipo,
          usuarioNome,
          acao: 'excluir',
          modulo: 'produto',
          entidadeId: id,
          entidadeTipo: 'produto',
          descricao: `Produto ${produto.rows[0].descricao} (${produto.rows[0].codigo}) excluído`,
          dadosAnteriores: produto.rows[0],
          ipAddress: getClientIp(req),
          userAgent: getUserAgent(req),
        });
      } catch (logError) {
        console.error('Erro ao registrar log:', logError);
      }
    }

    res.json({
      message: 'Produto excluído com sucesso!',
    });
  } catch (error) {
    console.error('Erro ao excluir produto:', error);
    res.status(500).json({
      error: 'Erro ao excluir produto',
      message: error.message,
    });
  }
});

/**
 * POST /api/v1/produtos/:id/preco-custo
 * Lança um novo preço de custo para o produto
 */
router.post('/:id/preco-custo', async (req, res) => {
  try {
    const { id } = req.params;
    const usuarioId = req.headers['x-user-id'];
    const usuarioTipo = req.headers['x-user-tipo'] || 'administrativo';
    const usuarioNome = req.headers['x-user-nome'] || null;

    // Verificar permissão de edição
    if (usuarioTipo !== 'master') {
      const permissoesResult = await pool.query(
        'SELECT produtos_editar FROM permissoes_usuarios WHERE usuario_id = $1',
        [usuarioId]
      );

      if (permissoesResult.rows.length === 0 || !permissoesResult.rows[0].produtos_editar) {
        return res.status(403).json({ error: 'Acesso negado. Permissão insuficiente.' });
      }
    }

    // Verificar se produto existe
    const produtoCheck = await pool.query(
      'SELECT id, descricao, codigo FROM produtos WHERE id = $1',
      [id]
    );

    if (produtoCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }

    const { preco_custo, data_lancamento, observacoes } = req.body;

    // Validações
    if (preco_custo === undefined) {
      return res.status(400).json({
        error: 'Campo obrigatório: preco_custo',
      });
    }

    const precoCustoNumber = parseFloat(preco_custo);
    if (isNaN(precoCustoNumber) || precoCustoNumber < 0) {
      return res.status(400).json({ error: 'Preço de custo inválido' });
    }

    // Inserir preço de custo no histórico
    const result = await pool.query(
      `INSERT INTO produtos_precos_custo (
        produto_id, preco_custo, data_lancamento, observacoes, created_by
      ) VALUES ($1, $2, $3, $4, $5)
      RETURNING *`,
      [
        id,
        precoCustoNumber,
        data_lancamento || new Date().toISOString().split('T')[0],
        observacoes || null,
        usuarioId,
      ]
    );

    const novoPrecoCusto = result.rows[0];

    // O trigger vai atualizar automaticamente o ultimo_preco_custo na tabela produtos

    // Registrar log
    if (usuarioId) {
      try {
        await registrarLog({
          usuarioId,
          usuarioTipo,
          usuarioNome,
          acao: 'criar',
          modulo: 'produto_preco_custo',
          entidadeId: novoPrecoCusto.id,
          entidadeTipo: 'produto_preco_custo',
          descricao: `Preço de custo R$ ${precoCustoNumber.toFixed(2)} lançado para produto ${produtoCheck.rows[0].descricao} (${produtoCheck.rows[0].codigo})`,
          dadosNovos: { preco_custo: precoCustoNumber, data_lancamento: novoPrecoCusto.data_lancamento },
          ipAddress: getClientIp(req),
          userAgent: getUserAgent(req),
        });
      } catch (logError) {
        console.error('Erro ao registrar log:', logError);
      }
    }

    res.status(201).json({
      message: 'Preço de custo lançado com sucesso!',
      preco_custo: novoPrecoCusto,
    });
  } catch (error) {
    console.error('Erro ao lançar preço de custo:', error);
    res.status(500).json({
      error: 'Erro ao lançar preço de custo',
      message: error.message,
    });
  }
});

/**
 * GET /api/v1/produtos/:id/precos-custo
 * Busca histórico de preços de custo de um produto
 */
router.get('/:id/precos-custo', async (req, res) => {
  try {
    const { id } = req.params;
    const usuarioId = req.headers['x-user-id'];
    const usuarioTipo = req.headers['x-user-tipo'] || 'administrativo';

    // Verificar permissão de visualização
    if (usuarioTipo !== 'master') {
      const permissoesResult = await pool.query(
        'SELECT produtos_ver FROM permissoes_usuarios WHERE usuario_id = $1',
        [usuarioId]
      );

      if (permissoesResult.rows.length === 0 || !permissoesResult.rows[0].produtos_ver) {
        return res.status(403).json({ error: 'Acesso negado. Permissão insuficiente.' });
      }
    }

    const result = await pool.query(
      `SELECT * FROM produtos_precos_custo
       WHERE produto_id = $1
       ORDER BY data_lancamento DESC, created_at DESC`,
      [id]
    );

    res.json({
      precos_custo: result.rows,
    });
  } catch (error) {
    console.error('Erro ao buscar preços de custo:', error);
    res.status(500).json({
      error: 'Erro ao buscar preços de custo',
      message: error.message,
    });
  }
});

module.exports = router;

