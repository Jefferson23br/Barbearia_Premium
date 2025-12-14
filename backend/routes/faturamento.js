const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { registrarLog, getClientIp, getUserAgent } = require('../utils/logger');

/**
 * GET /api/v1/faturamento/movimentacoes
 * Lista todas as movimentações (vendas, despesas, estoque) para o faturamento
 */
router.get('/movimentacoes', async (req, res) => {
  try {
    const usuarioId = req.headers['x-user-id'];
    const usuarioTipo = req.headers['x-user-tipo'] || 'administrativo';
    const usuarioNome = req.headers['x-user-nome'] || null;

    // Verificar permissão
    if (usuarioTipo !== 'master') {
      const permissoesResult = await pool.query(
        'SELECT faturamento_ver FROM protese.permissoes_usuarios WHERE usuario_id = $1',
        [usuarioId]
      );

      if (permissoesResult.rows.length === 0 || !permissoesResult.rows[0].faturamento_ver) {
        return res.status(403).json({ error: 'Acesso negado. Permissão insuficiente.' });
      }
    }

    const { 
      data_inicio, 
      data_fim, 
      tipo, // venda, despesa, estoque, all
      status,
      search 
    } = req.query;

    const movimentacoes = [];

    // Buscar Vendas
    if (!tipo || tipo === 'all' || tipo === 'venda') {
      let queryVendas = `
        SELECT 
          v.id,
          v.ticket,
          v.data_venda as data,
          v.valor_liquido as valor,
          v.status,
          v.forma_pagamento,
          v.numero_parcelas,
          v.observacoes,
          c.nome_completo as cliente_nome,
          f.nome_completo as funcionario_nome,
          ca.nome as caixa_nome,
          'venda' as tipo_movimentacao,
          v.created_at,
          v.updated_at
        FROM protese.vendas v
        LEFT JOIN protese.usuarios_clientes c ON v.cliente_id = c.id
        LEFT JOIN protese.usuarios_administrativos f ON v.funcionario_id = f.id
        LEFT JOIN protese.contas ca ON v.caixa_id = ca.id
        WHERE 1=1
      `;
      const paramsVendas = [];
      let paramIndex = 1;

      if (data_inicio) {
        queryVendas += ` AND v.data_venda >= $${paramIndex}`;
        paramsVendas.push(data_inicio);
        paramIndex++;
      }

      if (data_fim) {
        queryVendas += ` AND v.data_venda <= $${paramIndex}`;
        paramsVendas.push(data_fim);
        paramIndex++;
      }

      if (status) {
        queryVendas += ` AND v.status = $${paramIndex}`;
        paramsVendas.push(status);
        paramIndex++;
      }

      if (search) {
        queryVendas += ` AND (v.ticket ILIKE $${paramIndex} OR c.nome_completo ILIKE $${paramIndex} OR f.nome_completo ILIKE $${paramIndex})`;
        paramsVendas.push(`%${search}%`);
        paramIndex++;
      }

      queryVendas += ` ORDER BY v.data_venda DESC, v.created_at DESC`;

      const vendasResult = await pool.query(queryVendas, paramsVendas);
      movimentacoes.push(...vendasResult.rows.map(v => ({
        ...v,
        tipo_movimentacao: 'venda'
      })));
    }

    // Buscar Despesas
    if (!tipo || tipo === 'all' || tipo === 'despesa') {
      let queryDespesas = `
        SELECT 
          d.id,
          d.ticket,
          d.data_emissao as data,
          d.valor_liquido as valor,
          d.status,
          d.forma_pagamento,
          d.numero_parcelas,
          d.observacoes,
          d.fornecedor as cliente_nome,
          NULL as funcionario_nome,
          ca.nome as caixa_nome,
          'despesa' as tipo_movimentacao,
          d.created_at,
          d.updated_at
        FROM protese.despesas d
        LEFT JOIN protese.contas ca ON d.caixa_id = ca.id
        WHERE 1=1
      `;
      const paramsDespesas = [];
      let paramIndex = 1;

      if (data_inicio) {
        queryDespesas += ` AND d.data_emissao >= $${paramIndex}`;
        paramsDespesas.push(data_inicio);
        paramIndex++;
      }

      if (data_fim) {
        queryDespesas += ` AND d.data_emissao <= $${paramIndex}`;
        paramsDespesas.push(data_fim);
        paramIndex++;
      }

      if (status) {
        queryDespesas += ` AND d.status = $${paramIndex}`;
        paramsDespesas.push(status);
        paramIndex++;
      }

      if (search) {
        queryDespesas += ` AND (d.ticket ILIKE $${paramIndex} OR d.fornecedor ILIKE $${paramIndex} OR d.descricao ILIKE $${paramIndex})`;
        paramsDespesas.push(`%${search}%`);
        paramIndex++;
      }

      queryDespesas += ` ORDER BY d.data_emissao DESC, d.created_at DESC`;

      const despesasResult = await pool.query(queryDespesas, paramsDespesas);
      movimentacoes.push(...despesasResult.rows.map(d => ({
        ...d,
        tipo_movimentacao: 'despesa'
      })));
    }

    // Buscar Movimentações de Estoque
    if (!tipo || tipo === 'all' || tipo === 'estoque') {
      let queryEstoque = `
        SELECT 
          e.id,
          p.codigo || ' - ' || p.descricao as ticket,
          e.data_movimentacao as data,
          e.valor_total as valor,
          'entrada' as status,
          'estoque' as forma_pagamento,
          1 as numero_parcelas,
          e.observacoes,
          e.fornecedor as cliente_nome,
          NULL as funcionario_nome,
          NULL as caixa_nome,
          'estoque' as tipo_movimentacao,
          e.created_at,
          e.created_at as updated_at
        FROM protese.estoque_movimentacoes e
        JOIN protese.produtos p ON e.produto_id = p.id
        WHERE 1=1
      `;
      const paramsEstoque = [];
      let paramIndex = 1;

      if (data_inicio) {
        queryEstoque += ` AND e.data_movimentacao >= $${paramIndex}`;
        paramsEstoque.push(data_inicio);
        paramIndex++;
      }

      if (data_fim) {
        queryEstoque += ` AND e.data_movimentacao <= $${paramIndex}`;
        paramsEstoque.push(data_fim);
        paramIndex++;
      }

      if (search) {
        queryEstoque += ` AND (p.codigo ILIKE $${paramIndex} OR p.descricao ILIKE $${paramIndex} OR e.fornecedor ILIKE $${paramIndex})`;
        paramsEstoque.push(`%${search}%`);
        paramIndex++;
      }

      queryEstoque += ` ORDER BY e.data_movimentacao DESC, e.created_at DESC`;

      const estoqueResult = await pool.query(queryEstoque, paramsEstoque);
      movimentacoes.push(...estoqueResult.rows.map(e => ({
        ...e,
        tipo_movimentacao: 'estoque'
      })));
    }

    // Ordenar todas as movimentações por data (mais recente primeiro)
    movimentacoes.sort((a, b) => {
      const dateA = new Date(a.data || a.created_at);
      const dateB = new Date(b.data || b.created_at);
      return dateB - dateA;
    });

    await registrarLog({
      usuario_id: usuarioId,
      usuario_tipo: usuarioTipo,
      usuario_nome: usuarioNome,
      acao: 'visualizar',
      modulo: 'faturamento',
      descricao: 'Listou movimentações do faturamento',
      ip: getClientIp(req),
      user_agent: getUserAgent(req)
    });

    res.json({ movimentacoes });
  } catch (error) {
    console.error('Erro ao listar movimentações:', error);
    res.status(500).json({ error: 'Erro ao listar movimentações', details: error.message });
  }
});

/**
 * GET /api/v1/faturamento/venda/:id
 * Busca uma venda específica para edição
 */
router.get('/venda/:id', async (req, res) => {
  try {
    const usuarioId = req.headers['x-user-id'];
    const usuarioTipo = req.headers['x-user-tipo'] || 'administrativo';

    if (usuarioTipo !== 'master') {
      const permissoesResult = await pool.query(
        'SELECT faturamento_editar FROM protese.permissoes_usuarios WHERE usuario_id = $1',
        [usuarioId]
      );

      if (permissoesResult.rows.length === 0 || !permissoesResult.rows[0].faturamento_editar) {
        return res.status(403).json({ error: 'Acesso negado. Permissão insuficiente.' });
      }
    }

    const vendaResult = await pool.query(
      `SELECT v.*, 
              c.nome_completo as cliente_nome,
              f.nome_completo as funcionario_nome
       FROM protese.vendas v
       LEFT JOIN protese.usuarios_clientes c ON v.cliente_id = c.id
       LEFT JOIN protese.usuarios_administrativos f ON v.funcionario_id = f.id
       WHERE v.id = $1`,
      [req.params.id]
    );

    if (vendaResult.rows.length === 0) {
      return res.status(404).json({ error: 'Venda não encontrada' });
    }

    // Buscar serviços e produtos
    const servicosResult = await pool.query(
      `SELECT vs.*, s.nome as servico_nome
       FROM protese.vendas_servicos vs
       JOIN protese.servicos s ON vs.servico_id = s.id
       WHERE vs.venda_id = $1`,
      [req.params.id]
    );

    const produtosResult = await pool.query(
      `SELECT vp.*, p.descricao as produto_descricao, p.codigo as produto_codigo
       FROM protese.vendas_produtos vp
       JOIN protese.produtos p ON vp.produto_id = p.id
       WHERE vp.venda_id = $1`,
      [req.params.id]
    );

    res.json({
      venda: {
        ...vendaResult.rows[0],
        servicos: servicosResult.rows,
        produtos: produtosResult.rows
      }
    });
  } catch (error) {
    console.error('Erro ao buscar venda:', error);
    res.status(500).json({ error: 'Erro ao buscar venda' });
  }
});

/**
 * PUT /api/v1/faturamento/venda/:id
 * Edita uma venda pelo faturamento
 */
router.put('/venda/:id', async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    const usuarioId = req.headers['x-user-id'];
    const usuarioTipo = req.headers['x-user-tipo'] || 'administrativo';
    const usuarioNome = req.headers['x-user-nome'] || null;

    if (usuarioTipo !== 'master') {
      const permissoesResult = await client.query(
        'SELECT faturamento_editar FROM protese.permissoes_usuarios WHERE usuario_id = $1',
        [usuarioId]
      );

      if (permissoesResult.rows.length === 0 || !permissoesResult.rows[0].faturamento_editar) {
        await client.query('ROLLBACK');
        return res.status(403).json({ error: 'Acesso negado. Permissão insuficiente.' });
      }
    }

    const {
      data_venda,
      cliente_id,
      funcionario_id,
      valor_total,
      desconto_percentual,
      desconto_valor,
      valor_liquido,
      forma_pagamento,
      caixa_id,
      observacoes,
      status
    } = req.body;

    await client.query(
      `UPDATE protese.vendas 
       SET data_venda = $1,
           cliente_id = $2,
           funcionario_id = $3,
           valor_total = $4,
           desconto_percentual = $5,
           desconto_valor = $6,
           valor_liquido = $7,
           forma_pagamento = $8,
           caixa_id = $9,
           observacoes = $10,
           status = $11,
           updated_by = $12
       WHERE id = $13`,
      [
        data_venda,
        cliente_id || null,
        funcionario_id,
        valor_total,
        desconto_percentual || 0,
        desconto_valor || 0,
        valor_liquido,
        forma_pagamento,
        caixa_id,
        observacoes || null,
        status || 'pendente',
        usuarioId,
        req.params.id
      ]
    );

    await client.query('COMMIT');

    await registrarLog({
      usuario_id: usuarioId,
      usuario_tipo: usuarioTipo,
      usuario_nome: usuarioNome,
      acao: 'editar',
      modulo: 'faturamento',
      descricao: `Editou venda ${req.params.id} pelo faturamento`,
      ip: getClientIp(req),
      user_agent: getUserAgent(req)
    });

    res.json({ message: 'Venda atualizada com sucesso' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Erro ao editar venda:', error);
    res.status(500).json({ error: 'Erro ao editar venda', details: error.message });
  } finally {
    client.release();
  }
});

/**
 * DELETE /api/v1/faturamento/venda/:id
 * Exclui uma venda pelo faturamento
 */
router.delete('/venda/:id', async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    const usuarioId = req.headers['x-user-id'];
    const usuarioTipo = req.headers['x-user-tipo'] || 'administrativo';
    const usuarioNome = req.headers['x-user-nome'] || null;

    if (usuarioTipo !== 'master') {
      const permissoesResult = await client.query(
        'SELECT faturamento_excluir FROM protese.permissoes_usuarios WHERE usuario_id = $1',
        [usuarioId]
      );

      if (permissoesResult.rows.length === 0 || !permissoesResult.rows[0].faturamento_excluir) {
        await client.query('ROLLBACK');
        return res.status(403).json({ error: 'Acesso negado. Permissão insuficiente.' });
      }
    }

    // Buscar venda para log
    const vendaResult = await client.query(
      'SELECT ticket FROM protese.vendas WHERE id = $1',
      [req.params.id]
    );

    if (vendaResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Venda não encontrada' });
    }

    // Excluir venda (CASCADE vai excluir serviços, produtos e parcelas)
    await client.query('DELETE FROM protese.vendas WHERE id = $1', [req.params.id]);

    await client.query('COMMIT');

    await registrarLog({
      usuario_id: usuarioId,
      usuario_tipo: usuarioTipo,
      usuario_nome: usuarioNome,
      acao: 'excluir',
      modulo: 'faturamento',
      descricao: `Excluiu venda ${vendaResult.rows[0].ticket} pelo faturamento`,
      ip: getClientIp(req),
      user_agent: getUserAgent(req)
    });

    res.json({ message: 'Venda excluída com sucesso' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Erro ao excluir venda:', error);
    res.status(500).json({ error: 'Erro ao excluir venda', details: error.message });
  } finally {
    client.release();
  }
});

/**
 * GET /api/v1/faturamento/despesa/:id
 * Busca uma despesa específica para edição
 */
router.get('/despesa/:id', async (req, res) => {
  try {
    const usuarioId = req.headers['x-user-id'];
    const usuarioTipo = req.headers['x-user-tipo'] || 'administrativo';

    if (usuarioTipo !== 'master') {
      const permissoesResult = await pool.query(
        'SELECT faturamento_editar FROM protese.permissoes_usuarios WHERE usuario_id = $1',
        [usuarioId]
      );

      if (permissoesResult.rows.length === 0 || !permissoesResult.rows[0].faturamento_editar) {
        return res.status(403).json({ error: 'Acesso negado. Permissão insuficiente.' });
      }
    }

    const despesaResult = await pool.query(
      `SELECT * FROM protese.despesas WHERE id = $1`,
      [req.params.id]
    );

    if (despesaResult.rows.length === 0) {
      return res.status(404).json({ error: 'Despesa não encontrada' });
    }

    // Buscar parcelas
    const parcelasResult = await pool.query(
      `SELECT * FROM protese.despesas_parcelas WHERE despesa_id = $1 ORDER BY numero_parcela ASC`,
      [req.params.id]
    );

    res.json({
      despesa: {
        ...despesaResult.rows[0],
        parcelas: parcelasResult.rows
      }
    });
  } catch (error) {
    console.error('Erro ao buscar despesa:', error);
    res.status(500).json({ error: 'Erro ao buscar despesa' });
  }
});

/**
 * PUT /api/v1/faturamento/despesa/:id
 * Edita uma despesa pelo faturamento
 */
router.put('/despesa/:id', async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    const usuarioId = req.headers['x-user-id'];
    const usuarioTipo = req.headers['x-user-tipo'] || 'administrativo';
    const usuarioNome = req.headers['x-user-nome'] || null;

    if (usuarioTipo !== 'master') {
      const permissoesResult = await client.query(
        'SELECT faturamento_editar FROM protese.permissoes_usuarios WHERE usuario_id = $1',
        [usuarioId]
      );

      if (permissoesResult.rows.length === 0 || !permissoesResult.rows[0].faturamento_editar) {
        await client.query('ROLLBACK');
        return res.status(403).json({ error: 'Acesso negado. Permissão insuficiente.' });
      }
    }

    const {
      data_emissao,
      data_vencimento,
      fornecedor,
      descricao,
      categoria_custo_id,
      valor_bruto,
      valor_liquido,
      forma_pagamento,
      caixa_id,
      observacoes,
      status
    } = req.body;

    await client.query(
      `UPDATE protese.despesas 
       SET data_emissao = $1,
           data_vencimento = $2,
           fornecedor = $3,
           descricao = $4,
           categoria_custo_id = $5,
           valor_bruto = $6,
           valor_liquido = $7,
           forma_pagamento = $8,
           caixa_id = $9,
           observacoes = $10,
           status = $11,
           updated_by = $12
       WHERE id = $13`,
      [
        data_emissao,
        data_vencimento,
        fornecedor,
        descricao,
        categoria_custo_id || null,
        valor_bruto,
        valor_liquido,
        forma_pagamento,
        caixa_id || null,
        observacoes || null,
        status || 'pendente',
        usuarioId,
        req.params.id
      ]
    );

    await client.query('COMMIT');

    await registrarLog({
      usuario_id: usuarioId,
      usuario_tipo: usuarioTipo,
      usuario_nome: usuarioNome,
      acao: 'editar',
      modulo: 'faturamento',
      descricao: `Editou despesa ${req.params.id} pelo faturamento`,
      ip: getClientIp(req),
      user_agent: getUserAgent(req)
    });

    res.json({ message: 'Despesa atualizada com sucesso' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Erro ao editar despesa:', error);
    res.status(500).json({ error: 'Erro ao editar despesa', details: error.message });
  } finally {
    client.release();
  }
});

/**
 * DELETE /api/v1/faturamento/despesa/:id
 * Exclui uma despesa pelo faturamento
 */
router.delete('/despesa/:id', async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    const usuarioId = req.headers['x-user-id'];
    const usuarioTipo = req.headers['x-user-tipo'] || 'administrativo';
    const usuarioNome = req.headers['x-user-nome'] || null;

    if (usuarioTipo !== 'master') {
      const permissoesResult = await client.query(
        'SELECT faturamento_excluir FROM protese.permissoes_usuarios WHERE usuario_id = $1',
        [usuarioId]
      );

      if (permissoesResult.rows.length === 0 || !permissoesResult.rows[0].faturamento_excluir) {
        await client.query('ROLLBACK');
        return res.status(403).json({ error: 'Acesso negado. Permissão insuficiente.' });
      }
    }

    // Buscar despesa para log
    const despesaResult = await client.query(
      'SELECT ticket FROM protese.despesas WHERE id = $1',
      [req.params.id]
    );

    if (despesaResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Despesa não encontrada' });
    }

    // Excluir despesa (CASCADE vai excluir parcelas)
    await client.query('DELETE FROM protese.despesas WHERE id = $1', [req.params.id]);

    await client.query('COMMIT');

    await registrarLog({
      usuario_id: usuarioId,
      usuario_tipo: usuarioTipo,
      usuario_nome: usuarioNome,
      acao: 'excluir',
      modulo: 'faturamento',
      descricao: `Excluiu despesa ${despesaResult.rows[0].ticket} pelo faturamento`,
      ip: getClientIp(req),
      user_agent: getUserAgent(req)
    });

    res.json({ message: 'Despesa excluída com sucesso' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Erro ao excluir despesa:', error);
    res.status(500).json({ error: 'Erro ao excluir despesa', details: error.message });
  } finally {
    client.release();
  }
});

/**
 * GET /api/v1/faturamento/estoque/:id
 * Busca uma movimentação de estoque específica para edição
 */
router.get('/estoque/:id', async (req, res) => {
  try {
    const usuarioId = req.headers['x-user-id'];
    const usuarioTipo = req.headers['x-user-tipo'] || 'administrativo';

    if (usuarioTipo !== 'master') {
      const permissoesResult = await pool.query(
        'SELECT faturamento_editar FROM protese.permissoes_usuarios WHERE usuario_id = $1',
        [usuarioId]
      );

      if (permissoesResult.rows.length === 0 || !permissoesResult.rows[0].faturamento_editar) {
        return res.status(403).json({ error: 'Acesso negado. Permissão insuficiente.' });
      }
    }

    const estoqueResult = await pool.query(
      `SELECT e.*, p.codigo, p.descricao as produto_descricao
       FROM protese.estoque_movimentacoes e
       JOIN protese.produtos p ON e.produto_id = p.id
       WHERE e.id = $1`,
      [req.params.id]
    );

    if (estoqueResult.rows.length === 0) {
      return res.status(404).json({ error: 'Movimentação de estoque não encontrada' });
    }

    res.json({ movimentacao: estoqueResult.rows[0] });
  } catch (error) {
    console.error('Erro ao buscar movimentação de estoque:', error);
    res.status(500).json({ error: 'Erro ao buscar movimentação de estoque' });
  }
});

/**
 * PUT /api/v1/faturamento/estoque/:id
 * Edita uma movimentação de estoque pelo faturamento
 */
router.put('/estoque/:id', async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    const usuarioId = req.headers['x-user-id'];
    const usuarioTipo = req.headers['x-user-tipo'] || 'administrativo';
    const usuarioNome = req.headers['x-user-nome'] || null;

    if (usuarioTipo !== 'master') {
      const permissoesResult = await client.query(
        'SELECT faturamento_editar FROM protese.permissoes_usuarios WHERE usuario_id = $1',
        [usuarioId]
      );

      if (permissoesResult.rows.length === 0 || !permissoesResult.rows[0].faturamento_editar) {
        await client.query('ROLLBACK');
        return res.status(403).json({ error: 'Acesso negado. Permissão insuficiente.' });
      }
    }

    // Buscar movimentação atual para reverter quantidade
    const movimentacaoAtual = await client.query(
      'SELECT produto_id, quantidade FROM protese.estoque_movimentacoes WHERE id = $1',
      [req.params.id]
    );

    if (movimentacaoAtual.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Movimentação não encontrada' });
    }

    const { produto_id, quantidade: quantidadeAntiga } = movimentacaoAtual.rows[0];

    const {
      produto_id: novo_produto_id,
      fornecedor,
      quantidade,
      valor_unitario,
      data_movimentacao,
      observacoes
    } = req.body;

    // Reverter quantidade antiga
    await client.query(
      'UPDATE protese.produtos SET quantidade_estoque = quantidade_estoque - $1 WHERE id = $2',
      [quantidadeAntiga, produto_id]
    );

    // Atualizar movimentação
    await client.query(
      `UPDATE protese.estoque_movimentacoes 
       SET produto_id = $1,
           fornecedor = $2,
           quantidade = $3,
           valor_unitario = $4,
           data_movimentacao = $5,
           observacoes = $6
       WHERE id = $7`,
      [
        novo_produto_id || produto_id,
        fornecedor,
        quantidade,
        valor_unitario,
        data_movimentacao,
        observacoes || null,
        req.params.id
      ]
    );

    // Aplicar nova quantidade
    const produtoFinal = novo_produto_id || produto_id;
    await client.query(
      'UPDATE protese.produtos SET quantidade_estoque = quantidade_estoque + $1, ultimo_preco_custo = $2, fornecedor = $3 WHERE id = $4',
      [quantidade, valor_unitario, fornecedor, produtoFinal]
    );

    await client.query('COMMIT');

    await registrarLog({
      usuario_id: usuarioId,
      usuario_tipo: usuarioTipo,
      usuario_nome: usuarioNome,
      acao: 'editar',
      modulo: 'faturamento',
      descricao: `Editou movimentação de estoque ${req.params.id} pelo faturamento`,
      ip: getClientIp(req),
      user_agent: getUserAgent(req)
    });

    res.json({ message: 'Movimentação de estoque atualizada com sucesso' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Erro ao editar movimentação de estoque:', error);
    res.status(500).json({ error: 'Erro ao editar movimentação de estoque', details: error.message });
  } finally {
    client.release();
  }
});

/**
 * DELETE /api/v1/faturamento/estoque/:id
 * Exclui uma movimentação de estoque pelo faturamento
 */
router.delete('/estoque/:id', async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    const usuarioId = req.headers['x-user-id'];
    const usuarioTipo = req.headers['x-user-tipo'] || 'administrativo';
    const usuarioNome = req.headers['x-user-nome'] || null;

    if (usuarioTipo !== 'master') {
      const permissoesResult = await client.query(
        'SELECT faturamento_excluir FROM protese.permissoes_usuarios WHERE usuario_id = $1',
        [usuarioId]
      );

      if (permissoesResult.rows.length === 0 || !permissoesResult.rows[0].faturamento_excluir) {
        await client.query('ROLLBACK');
        return res.status(403).json({ error: 'Acesso negado. Permissão insuficiente.' });
      }
    }

    // Excluir movimentação (trigger vai reverter quantidade)
    await client.query('DELETE FROM protese.estoque_movimentacoes WHERE id = $1', [req.params.id]);

    await client.query('COMMIT');

    await registrarLog({
      usuario_id: usuarioId,
      usuario_tipo: usuarioTipo,
      usuario_nome: usuarioNome,
      acao: 'excluir',
      modulo: 'faturamento',
      descricao: `Excluiu movimentação de estoque ${req.params.id} pelo faturamento`,
      ip: getClientIp(req),
      user_agent: getUserAgent(req)
    });

    res.json({ message: 'Movimentação de estoque excluída com sucesso' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Erro ao excluir movimentação de estoque:', error);
    res.status(500).json({ error: 'Erro ao excluir movimentação de estoque', details: error.message });
  } finally {
    client.release();
  }
});

/**
 * POST /api/v1/faturamento/romaneios
 * Cria um novo romaneio
 */
router.post('/romaneios', async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    const usuarioId = req.headers['x-user-id'];
    const usuarioTipo = req.headers['x-user-tipo'] || 'administrativo';
    const usuarioNome = req.headers['x-user-nome'] || null;

    if (usuarioTipo !== 'master') {
      const permissoesResult = await client.query(
        'SELECT faturamento_editar FROM protese.permissoes_usuarios WHERE usuario_id = $1',
        [usuarioId]
      );

      if (permissoesResult.rows.length === 0 || !permissoesResult.rows[0].faturamento_editar) {
        await client.query('ROLLBACK');
        return res.status(403).json({ error: 'Acesso negado. Permissão insuficiente.' });
      }
    }

    const { tipo_romaneio, data_romaneio, descricao, observacoes, itens, status } = req.body;

    if (!tipo_romaneio || !itens || !Array.isArray(itens) || itens.length === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Tipo de romaneio e itens são obrigatórios' });
    }

    // Gerar número do romaneio
    let numeroRomaneio;
    try {
      const numeroResult = await client.query('SELECT protese.gerar_proximo_numero_romaneio() as numero');
      if (!numeroResult.rows || numeroResult.rows.length === 0 || !numeroResult.rows[0].numero) {
        throw new Error('Função retornou resultado vazio');
      }
      numeroRomaneio = numeroResult.rows[0].numero;
    } catch (error) {
      // Se a função não existir ou falhar, gerar manualmente
      console.warn('Função gerar_proximo_numero_romaneio não encontrada ou falhou, gerando manualmente:', error.message);
      const anoAtual = new Date().getFullYear();
      try {
        const ultimoResult = await client.query(
          `SELECT numero_romaneio FROM protese.romaneios 
           WHERE numero_romaneio LIKE $1 
           ORDER BY numero_romaneio DESC LIMIT 1`,
          [`ROM-${anoAtual}-%`]
        );
        
        let proximoNumero = 1;
        if (ultimoResult.rows.length > 0 && ultimoResult.rows[0].numero_romaneio) {
          const ultimoNumero = ultimoResult.rows[0].numero_romaneio;
          const match = ultimoNumero.match(/ROM-\d+-(\d+)/);
          if (match && match[1]) {
            proximoNumero = parseInt(match[1], 10) + 1;
          }
        }
        numeroRomaneio = `ROM-${anoAtual}-${String(proximoNumero).padStart(6, '0')}`;
      } catch (fallbackError) {
        console.error('Erro ao gerar número manualmente:', fallbackError);
        // Último recurso: usar timestamp
        numeroRomaneio = `ROM-${anoAtual}-${Date.now().toString().slice(-6)}`;
      }
    }

    // Criar romaneio (status padrão: fechado, pois já foi criado com itens)
    const romaneioResult = await client.query(
      `INSERT INTO protese.romaneios 
       (numero_romaneio, tipo_romaneio, data_romaneio, descricao, observacoes, status, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        numeroRomaneio,
        tipo_romaneio,
        data_romaneio || new Date().toISOString().split('T')[0],
        descricao || null,
        observacoes || null,
        status || 'fechado', // Status padrão: fechado (já foi criado com itens)
        usuarioId
      ]
    );

    const romaneio = romaneioResult.rows[0];

    // Adicionar itens ao romaneio
    for (const item of itens) {
      if (!item.tipo || !item.id) {
        await client.query('ROLLBACK');
        return res.status(400).json({ error: 'Item inválido: tipo e id são obrigatórios' });
      }
      
      try {
        await client.query(
          `INSERT INTO protese.romaneios_itens 
           (romaneio_id, tipo_movimentacao, movimentacao_id, created_by)
           VALUES ($1, $2, $3, $4)
           ON CONFLICT (romaneio_id, tipo_movimentacao, movimentacao_id) DO NOTHING`,
          [romaneio.id, item.tipo, item.id, usuarioId]
        );
      } catch (itemError) {
        console.error('Erro ao inserir item do romaneio:', itemError);
        await client.query('ROLLBACK');
        return res.status(500).json({ 
          error: 'Erro ao adicionar item ao romaneio', 
          details: itemError.message,
          item: item
        });
      }
    }

    await client.query('COMMIT');

    await registrarLog({
      usuario_id: usuarioId,
      usuario_tipo: usuarioTipo,
      usuario_nome: usuarioNome,
      acao: 'criar',
      modulo: 'faturamento',
      descricao: `Criou romaneio ${numeroRomaneio}`,
      ip: getClientIp(req),
      user_agent: getUserAgent(req)
    });

    res.status(201).json({ romaneio });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Erro ao criar romaneio:', error);
    console.error('Stack trace:', error.stack);
    console.error('Request body:', req.body);
    res.status(500).json({ 
      error: 'Erro ao criar romaneio', 
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  } finally {
    client.release();
  }
});

/**
 * GET /api/v1/faturamento/romaneios
 * Lista todos os romaneios
 */
router.get('/romaneios', async (req, res) => {
  try {
    const usuarioId = req.headers['x-user-id'];
    const usuarioTipo = req.headers['x-user-tipo'] || 'administrativo';

    if (usuarioTipo !== 'master') {
      const permissoesResult = await pool.query(
        'SELECT faturamento_ver FROM protese.permissoes_usuarios WHERE usuario_id = $1',
        [usuarioId]
      );

      if (permissoesResult.rows.length === 0 || !permissoesResult.rows[0].faturamento_ver) {
        return res.status(403).json({ error: 'Acesso negado. Permissão insuficiente.' });
      }
    }

    const result = await pool.query(
      `SELECT r.*, 
              COUNT(ri.id) as total_itens
       FROM protese.romaneios r
       LEFT JOIN protese.romaneios_itens ri ON r.id = ri.romaneio_id
       GROUP BY r.id
       ORDER BY r.data_romaneio DESC, r.created_at DESC`
    );

    res.json({ romaneios: result.rows });
  } catch (error) {
    console.error('Erro ao listar romaneios:', error);
    res.status(500).json({ error: 'Erro ao listar romaneios' });
  }
});

/**
 * GET /api/v1/faturamento/romaneios/:id
 * Busca um romaneio específico com seus itens
 */
router.get('/romaneios/:id', async (req, res) => {
  try {
    const usuarioId = req.headers['x-user-id'];
    const usuarioTipo = req.headers['x-user-tipo'] || 'administrativo';

    if (usuarioTipo !== 'master') {
      const permissoesResult = await pool.query(
        'SELECT faturamento_ver FROM protese.permissoes_usuarios WHERE usuario_id = $1',
        [usuarioId]
      );

      if (permissoesResult.rows.length === 0 || !permissoesResult.rows[0].faturamento_ver) {
        return res.status(403).json({ error: 'Acesso negado. Permissão insuficiente.' });
      }
    }

    const romaneioResult = await pool.query(
      'SELECT * FROM protese.romaneios WHERE id = $1',
      [req.params.id]
    );

    if (romaneioResult.rows.length === 0) {
      return res.status(404).json({ error: 'Romaneio não encontrado' });
    }

    const itensResult = await pool.query(
      'SELECT * FROM protese.romaneios_itens WHERE romaneio_id = $1',
      [req.params.id]
    );

    res.json({
      romaneio: {
        ...romaneioResult.rows[0],
        itens: itensResult.rows
      }
    });
  } catch (error) {
    console.error('Erro ao buscar romaneio:', error);
    res.status(500).json({ error: 'Erro ao buscar romaneio' });
  }
});

module.exports = router;

