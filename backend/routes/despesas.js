const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { registrarLog, getClientIp, getUserAgent } = require('../utils/logger');

/**
 * Função auxiliar para calcular data de vencimento das parcelas (mesma lógica de vendas)
 */
function calcularDataVencimento(dataEmissao, formaPagamento, numeroParcela, primeiroVencimentoBoleto = null) {
  const data = new Date(dataEmissao);
  
  // Dinheiro, Pix, TED: mesma data
  if (['dinheiro', 'pix', 'ted'].includes(formaPagamento)) {
    return data;
  }
  
  // Boleto: primeiro vencimento é a data informada, depois +30 dias
  if (formaPagamento.startsWith('boleto_')) {
    if (numeroParcela === 1) {
      if (primeiroVencimentoBoleto) {
        return new Date(primeiroVencimentoBoleto);
      }
      return data; // Fallback
    } else {
      const primeiraParcela = primeiroVencimentoBoleto ? new Date(primeiroVencimentoBoleto) : new Date(dataEmissao);
      const novaData = new Date(primeiraParcela);
      const diasAdicionais = (numeroParcela - 1) * 30;
      novaData.setTRUNC(novaData.getTRUNC() + diasAdicionais);
      return novaData;
    }
  }
  
  // Cartão: primeira parcela = data_emissao + 31 dias, depois +30 dias
  if (formaPagamento.startsWith('cartao_')) {
    const primeiraParcela = new Date(dataEmissao);
    primeiraParcela.setTRUNC(primeiraParcela.getTRUNC() + 31); // 30 + 1
    
    if (numeroParcela === 1) {
      return primeiraParcela;
    } else {
      const novaData = new Date(primeiraParcela);
      const diasAdicionais = (numeroParcela - 1) * 30;
      novaData.setTRUNC(novaData.getTRUNC() + diasAdicionais);
      return novaData;
    }
  }
  
  return data;
}

/**
 * Função auxiliar para gerar ticket de parcela
 */
function gerarTicketParcela(ticketBase, numeroParcela, totalParcelas) {
  if (totalParcelas === 1) {
    return ticketBase;
  }
  return `${ticketBase}/${numeroParcela.toString().padStart(2, '0')}`;
}

/**
 * GET /api/v1/despesas
 * Lista todas as despesas
 */
router.get('/', async (req, res) => {
  try {
    const usuarioId = req.headers['x-user-id'];
    const usuarioTipo = req.headers['x-user-tipo'] || 'administrativo';
    const usuarioNome = req.headers['x-user-nome'] || null;

    // Verificar permissão
    if (usuarioTipo !== 'master') {
      const permissoesResult = await pool.query(
        'SELECT despesas_ver FROM permissoes_usuarios WHERE usuario_id = $1',
        [usuarioId]
      );

      if (permissoesResult.rows.length === 0 || !permissoesResult.rows[0].despesas_ver) {
        return res.status(403).json({ error: 'Acesso negado. Permissão insuficiente.' });
      }
    }

    const { 
      data_inicio, 
      data_fim, 
      data_vencimento_inicio,
      data_vencimento_fim,
      fornecedor, 
      status, 
      forma_pagamento,
      categoria_custo_id,
      busca 
    } = req.query;
    
    // Query que funciona mesmo sem a tabela categorias_custo existir
    // Quando a tabela for criada, podemos adicionar o JOIN depois
    let query = `
      SELECT 
        d.*,
        ca.nome as caixa_nome,
        c.nome as categoria_custo_nome
      FROM despesas d
      LEFT JOIN contas ca ON d.caixa_id = ca.id
      LEFT JOIN categorias_custo c ON d.categoria_custo_id = c.id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 1;

    if (data_inicio) {
      query += ` AND d.data_emissao >= $${paramCount}`;
      params.push(data_inicio);
      paramCount++;
    }

    if (data_fim) {
      query += ` AND d.data_emissao <= $${paramCount}`;
      params.push(data_fim);
      paramCount++;
    }

    if (data_vencimento_inicio) {
      query += ` AND d.data_vencimento >= $${paramCount}`;
      params.push(data_vencimento_inicio);
      paramCount++;
    }

    if (data_vencimento_fim) {
      query += ` AND d.data_vencimento <= $${paramCount}`;
      params.push(data_vencimento_fim);
      paramCount++;
    }

    if (fornecedor) {
      query += ` AND d.fornecedor LIKE $${paramCount}`;
      params.push(`%${fornecedor}%`);
      paramCount++;
    }

    if (status) {
      query += ` AND d.status = $${paramCount}`;
      params.push(status);
      paramCount++;
    }

    if (forma_pagamento) {
      query += ` AND d.forma_pagamento = $${paramCount}`;
      params.push(forma_pagamento);
      paramCount++;
    }

    if (categoria_custo_id) {
      query += ` AND d.categoria_custo_id = $${paramCount}`;
      params.push(categoria_custo_id);
      paramCount++;
    }

    if (busca) {
      query += ` AND (d.ticket LIKE $${paramCount} OR d.descricao LIKE $${paramCount} OR d.fornecedor LIKE $${paramCount})`;
      params.push(`%${busca}%`);
      paramCount++;
    }

    query += ` ORDER BY d.data_vencimento DESC, d.created_at DESC`;

    const result = await pool.query(query, params);

    // Buscar parcelas para cada despesa
    const despesasComParcelas = await Promise.all(result.rows.map(async (despesa) => {
      const parcelasResult = await pool.query(
        `SELECT * FROM despesas_parcelas WHERE despesa_id = $1 ORDER BY numero_parcela ASC`,
        [despesa.id]
      );
      return {
        ...despesa,
        parcelas: parcelasResult.rows
      };
    }));

    await registrarLog({
      usuario_id: usuarioId,
      usuario_tipo: usuarioTipo,
      usuario_nome: usuarioNome,
      acao: 'visualizar',
      modulo: 'despesas',
      descricao: 'Listou despesas',
      ip: getClientIp(req),
      user_agent: getUserAgent(req)
    });

    res.json({ despesas: despesasComParcelas });
  } catch (error) {
    console.error('Erro ao listar despesas:', error);
    res.status(500).json({ error: 'Erro ao listar despesas' });
  }
});

/**
 * GET /api/v1/despesas/:id
 * Busca uma despesa específica
 */
router.get('/:id', async (req, res) => {
  try {
    const usuarioId = req.headers['x-user-id'];
    const usuarioTipo = req.headers['x-user-tipo'] || 'administrativo';
    const usuarioNome = req.headers['x-user-nome'] || null;

    // Verificar permissão
    if (usuarioTipo !== 'master') {
      const permissoesResult = await pool.query(
        'SELECT despesas_ver FROM permissoes_usuarios WHERE usuario_id = $1',
        [usuarioId]
      );

      if (permissoesResult.rows.length === 0 || !permissoesResult.rows[0].despesas_ver) {
        return res.status(403).json({ error: 'Acesso negado. Permissão insuficiente.' });
      }
    }

    const despesaResult = await pool.query(
      `SELECT 
        d.*,
        ca.nome as caixa_nome,
        c.nome as categoria_custo_nome
       FROM despesas d
       LEFT JOIN contas ca ON d.caixa_id = ca.id
       LEFT JOIN categorias_custo c ON d.categoria_custo_id = c.id
       WHERE d.id = $1`,
      [req.params.id]
    );

    if (despesaResult.rows.length === 0) {
      return res.status(404).json({ error: 'Despesa não encontrada' });
    }

    const despesa = despesaResult.rows[0];

    // Buscar parcelas
    const parcelasResult = await pool.query(
      `SELECT * FROM despesas_parcelas WHERE despesa_id = $1 ORDER BY numero_parcela ASC`,
      [despesa.id]
    );

    res.json({
      despesa: {
        ...despesa,
        parcelas: parcelasResult.rows
      }
    });
  } catch (error) {
    console.error('Erro ao buscar despesa:', error);
    res.status(500).json({ error: 'Erro ao buscar despesa' });
  }
});

/**
 * POST /api/v1/despesas
 * Cria uma nova despesa
 */
router.post('/', async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    const usuarioId = req.headers['x-user-id'];
    const usuarioTipo = req.headers['x-user-tipo'] || 'administrativo';
    const usuarioNome = req.headers['x-user-nome'] || null;

    // Verificar permissão
    if (usuarioTipo !== 'master') {
      const permissoesResult = await client.query(
        'SELECT despesas_editar FROM permissoes_usuarios WHERE usuario_id = $1',
        [usuarioId]
      );

      if (permissoesResult.rows.length === 0 || !permissoesResult.rows[0].despesas_editar) {
        await client.query('ROLLBACK');
        return res.status(403).json({ error: 'Acesso negado. Permissão insuficiente.' });
      }
    }

    const {
      data_emissao,
      data_vencimento,
      data_pagamento, // Opcional, se já foi pago
      fornecedor,
      descricao,
      categoria_custo_id, // Opcional, será usado no Balanço
      valor_bruto,
      valor_liquido,
      forma_pagamento,
      caixa_id,
      primeiro_vencimento_boleto,
      observacoes
    } = req.body;

    // Validações
    if (!data_emissao || !data_vencimento || !fornecedor || !descricao || !valor_bruto || !valor_liquido || !forma_pagamento || !caixa_id) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Campos obrigatórios: data_emissao, data_vencimento, fornecedor, descricao, valor_bruto, valor_liquido, forma_pagamento e caixa_id' });
    }

    if (parseFloat(valor_liquido) <= 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Valor líquido deve ser maior que zero' });
    }

    // Validação para boleto
    if (forma_pagamento.startsWith('boleto_') && !primeiro_vencimento_boleto) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Informe a data do primeiro vencimento para boleto' });
    }

    // Extrair número de parcelas da forma de pagamento
    let numeroParcelas = 1;
    if (forma_pagamento.startsWith('cartao_') || forma_pagamento.startsWith('boleto_')) {
      const match = forma_pagamento.match(/(\d+)x/);
      if (match) {
        numeroParcelas = parseInt(match[1]);
      }
    }

    // Gerar ticket
    const ticketResult = await client.query('SELECT gerar_proximo_ticket_despesa() as ticket');
    const ticketBase = ticketResult.rows[0].ticket;

    // Determinar status inicial
    let statusInicial = 'pendente';
    if (data_pagamento) {
      statusInicial = 'paga';
    }

    // Inserir despesa
    const despesaResult = await client.query(
      `INSERT INTO despesas 
       (ticket, data_emissao, data_vencimento, data_pagamento, fornecedor, descricao, 
        categoria_custo_id, valor_bruto, valor_liquido, forma_pagamento, numero_parcelas, 
        caixa_id, status, observacoes, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
       RETURNING *`,
      [
        ticketBase,
        data_emissao,
        data_vencimento,
        data_pagamento || null,
        fornecedor,
        descricao,
        categoria_custo_id || null,
        parseFloat(valor_bruto),
        parseFloat(valor_liquido),
        forma_pagamento,
        numeroParcelas,
        caixa_id,
        statusInicial,
        observacoes || null,
        usuarioId
      ]
    );

    const despesa = despesaResult.rows[0];

    // Calcular valor por parcela
    const valorPorParcela = parseFloat(valor_liquido) / numeroParcelas;

    // Criar parcelas
    const parcelas = [];
    for (let i = 1; i <= numeroParcelas; i++) {
      const dataVencimentoParcela = calcularDataVencimento(
        data_emissao,
        forma_pagamento,
        i,
        primeiro_vencimento_boleto
      );
      
      const ticketParcela = gerarTicketParcela(ticketBase, i, numeroParcelas);
      
      // Ajustar última parcela para compensar diferenças de arredondamento
      let valorParcela = valorPorParcela;
      if (i === numeroParcelas) {
        const valorJaDistribuido = valorPorParcela * (numeroParcelas - 1);
        valorParcela = parseFloat(valor_liquido) - valorJaDistribuido;
      }

      // Se foi marcado como pago no ato do lançamento, definir data_pagamento e valor_pago
      // Apenas para pagamentos à vista (dinheiro, pix, ted) ou se data_pagamento foi informada
      const isPagamentoVista = ['dinheiro', 'pix', 'ted'].includes(forma_pagamento);
      const isPago = data_pagamento ? true : false;
      const valorPago = isPago ? valorParcela : 0;
      const statusParcela = isPago ? 'paga' : 'pendente';

      const parcelaResult = await client.query(
        `INSERT INTO despesas_parcelas 
         (despesa_id, numero_parcela, ticket_parcela, valor, data_vencimento, data_pagamento, 
          valor_pago, forma_pagamento, status, caixa_id, created_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
         RETURNING *`,
        [
          despesa.id,
          i,
          ticketParcela,
          valorParcela,
          dataVencimentoParcela.toISOString().split('T')[0],
          data_pagamento || null,
          valorPago,
          forma_pagamento,
          statusParcela,
          isPago ? caixa_id : null,
          usuarioId
        ]
      );

      parcelas.push(parcelaResult.rows[0]);

      // Se foi marcado como pago (pagamentos à vista ou se data_pagamento foi informada), criar movimentação de saída no caixa
      if (isPago) {
        await client.query(
          `INSERT INTO movimentacoes_caixa 
           (conta_id, tipo_movimentacao, valor, descricao, data_movimentacao, referencia_id, referencia_tipo, created_by)
           VALUES ($1, 'saida', $2, $3, $4, $5, 'despesa', $6)`,
          [
            caixa_id,
            valorParcela,
            `Despesa ${ticketParcela} - ${fornecedor} - ${descricao}`,
            data_pagamento || data_emissao,
            parcelaResult.rows[0].id,
            usuarioId
          ]
        );
      }
    }

    await client.query('COMMIT');

    await registrarLog({
      usuario_id: usuarioId,
      usuario_tipo: usuarioTipo,
      usuario_nome: usuarioNome,
      acao: 'criar',
      modulo: 'despesas',
      descricao: `Criou despesa ${ticketBase}`,
      ip: getClientIp(req),
      user_agent: getUserAgent(req)
    });

    res.status(201).json({
      despesa: {
        ...despesa,
        parcelas
      }
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Erro ao criar despesa:', error);
    res.status(500).json({ error: 'Erro ao criar despesa', detalhes: error.message });
  } finally {
    client.release();
  }
});

/**
 * PUT /api/v1/despesas/:id
 * Atualiza uma despesa
 */
router.put('/:id', async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    const usuarioId = req.headers['x-user-id'];
    const usuarioTipo = req.headers['x-user-tipo'] || 'administrativo';
    const usuarioNome = req.headers['x-user-nome'] || null;

    // Verificar permissão
    if (usuarioTipo !== 'master') {
      const permissoesResult = await client.query(
        'SELECT despesas_editar FROM permissoes_usuarios WHERE usuario_id = $1',
        [usuarioId]
      );

      if (permissoesResult.rows.length === 0 || !permissoesResult.rows[0].despesas_editar) {
        await client.query('ROLLBACK');
        return res.status(403).json({ error: 'Acesso negado. Permissão insuficiente.' });
      }
    }

    // Verificar se despesa existe
    const despesaExistente = await client.query(
      'SELECT * FROM despesas WHERE id = $1',
      [req.params.id]
    );

    if (despesaExistente.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Despesa não encontrada' });
    }

    const {
      data_emissao,
      data_vencimento,
      fornecedor,
      descricao,
      categoria_custo_id,
      valor_bruto,
      valor_liquido,
      observacoes
    } = req.body;

    // Atualizar despesa
    await client.query(
      `UPDATE despesas 
       SET data_emissao = $1, data_vencimento = $2, fornecedor = $3, descricao = $4,
           categoria_custo_id = $5, valor_bruto = $6, valor_liquido = $7, observacoes = $8,
           updated_at = CURRENT_TIMESTAMP, updated_by = $9
       WHERE id = $10`,
      [
        data_emissao,
        data_vencimento,
        fornecedor,
        descricao,
        categoria_custo_id || null,
        parseFloat(valor_bruto),
        parseFloat(valor_liquido),
        observacoes || null,
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
      modulo: 'despesas',
      descricao: `Atualizou despesa ${req.params.id}`,
      ip: getClientIp(req),
      user_agent: getUserAgent(req)
    });

    res.json({ message: 'Despesa atualizada com sucesso' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Erro ao atualizar despesa:', error);
    res.status(500).json({ error: 'Erro ao atualizar despesa' });
  } finally {
    client.release();
  }
});

/**
 * DELETE /api/v1/despesas/:id
 * Exclui uma despesa
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
        'SELECT despesas_excluir FROM permissoes_usuarios WHERE usuario_id = $1',
        [usuarioId]
      );

      if (permissoesResult.rows.length === 0 || !permissoesResult.rows[0].despesas_excluir) {
        await client.query('ROLLBACK');
        return res.status(403).json({ error: 'Acesso negado. Permissão insuficiente.' });
      }
    }

    // Buscar despesa e parcelas
    const despesaResult = await client.query(
      'SELECT * FROM despesas WHERE id = $1',
      [req.params.id]
    );

    if (despesaResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Despesa não encontrada' });
    }

    const despesa = despesaResult.rows[0];

    // Buscar parcelas pagas para reverter movimentações
    const parcelasPagas = await client.query(
      `SELECT * FROM despesas_parcelas 
       WHERE despesa_id = $1 AND status = 'paga' AND valor_pago > 0`,
      [req.params.id]
    );

    // Reverter movimentações de caixa das parcelas pagas
    for (const parcela of parcelasPagas.rows) {
      await client.query(
        `DELETE FROM movimentacoes_caixa 
         WHERE referencia_id = $1 AND referencia_tipo = 'despesa'`,
        [parcela.id]
      );
    }

    // Excluir parcelas (CASCADE vai excluir automaticamente)
    await client.query('DELETE FROM despesas_parcelas WHERE despesa_id = $1', [req.params.id]);

    // Excluir despesa
    await client.query('DELETE FROM despesas WHERE id = $1', [req.params.id]);

    await client.query('COMMIT');

    await registrarLog({
      usuario_id: usuarioId,
      usuario_tipo: usuarioTipo,
      usuario_nome: usuarioNome,
      acao: 'excluir',
      modulo: 'despesas',
      descricao: `Excluiu despesa ${despesa.ticket}`,
      ip: getClientIp(req),
      user_agent: getUserAgent(req)
    });

    res.json({ message: 'Despesa excluída com sucesso' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Erro ao excluir despesa:', error);
    res.status(500).json({ error: 'Erro ao excluir despesa' });
  } finally {
    client.release();
  }
});

/**
 * POST /api/v1/despesas/efetivar-pagamento
 * Efetiva pagamento de uma ou múltiplas parcelas de despesas
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
        'SELECT despesas_editar FROM permissoes_usuarios WHERE usuario_id = $1',
        [usuarioId]
      );

      if (permissoesResult.rows.length === 0 || !permissoesResult.rows[0].despesas_editar) {
        await client.query('ROLLBACK');
        return res.status(403).json({ error: 'Acesso negado. Permissão insuficiente.' });
      }
    }

    const { parcelas, caixa_id, data_pagamento } = req.body;

    if (!parcelas || !Array.isArray(parcelas) || parcelas.length === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Lista de parcelas é obrigatória' });
    }

    if (!caixa_id) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Caixa é obrigatório' });
    }

    const dataPagamento = data_pagamento || new Date().toISOString().split('T')[0];
    const parcelasAtualizadas = [];
    let valorTotal = 0;

    for (const parcelaItem of parcelas) {
      const { parcela_id, valor_pago } = parcelaItem;

      if (!parcela_id) {
        await client.query('ROLLBACK');
        return res.status(400).json({ error: 'ID da parcela é obrigatório' });
      }

      // Buscar parcela
      const parcelaResult = await client.query(
        `SELECT dp.*, d.fornecedor, d.descricao 
         FROM despesas_parcelas dp
         JOIN despesas d ON dp.despesa_id = d.id
         WHERE dp.id = $1`,
        [parcela_id]
      );

      if (parcelaResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ error: `Parcela ${parcela_id} não encontrada` });
      }

      const parcela = parcelaResult.rows[0];

      // Se já está paga, pular
      if (parcela.status === 'paga') {
        continue;
      }

      const valorPago = parseFloat(valor_pago) || parseFloat(parcela.valor);
      valorTotal += valorPago;

      // Atualizar parcela
      const statusParcela = valorPago >= parseFloat(parcela.valor) ? 'paga' : 'parcial';

      await client.query(
        `UPDATE despesas_parcelas 
         SET data_pagamento = $1, 
             valor_pago = $2, 
             status = $3,
             caixa_id = $4,
             updated_by = $5
         WHERE id = $6`,
        [dataPagamento, valorPago, statusParcela, caixa_id, usuarioId, parcela_id]
      );

      // Criar movimentação de saída no caixa
      const movimentacaoResult = await client.query(
        `INSERT INTO movimentacoes_caixa 
         (conta_id, tipo_movimentacao, valor, descricao, data_movimentacao, referencia_id, referencia_tipo, created_by)
         VALUES ($1, 'saida', $2, $3, $4, $5, 'despesa_parcela', $6)
         RETURNING id`,
        [
          caixa_id,
          valorPago,
          `Pagamento Despesa ${parcela.ticket_parcela} - ${parcela.fornecedor}`,
          dataPagamento,
          parcela_id,
          usuarioId
        ]
      );

      // Atualizar parcela com o ID da movimentação
      await client.query(
        `UPDATE despesas_parcelas 
         SET movimentacao_caixa_id = $1 
         WHERE id = $2`,
        [movimentacaoResult.rows[0].id, parcela_id]
      );

      // Buscar parcela atualizada
      const parcelaAtualizada = await client.query(
        `SELECT * FROM despesas_parcelas WHERE id = $1`,
        [parcela_id]
      );

      parcelasAtualizadas.push(parcelaAtualizada.rows[0]);
    }

    await client.query('COMMIT');

    await registrarLog({
      usuario_id: usuarioId,
      usuario_tipo: usuarioTipo,
      usuario_nome: usuarioNome,
      acao: 'editar',
      modulo: 'despesas',
      descricao: `Efetivou pagamento de ${parcelasAtualizadas.length} parcela(s) de despesa(s)`,
      ip: getClientIp(req),
      user_agent: getUserAgent(req)
    });

    res.json({
      message: `${parcelasAtualizadas.length} parcela(s) paga(s) com sucesso`,
      parcelas: parcelasAtualizadas,
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
 * PUT /api/v1/despesas/modificar-pagamento/:parcela_id
 * Modifica o pagamento de uma parcela (edita data, valor, caixa)
 */
router.put('/modificar-pagamento/:parcela_id', async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    const usuarioId = req.headers['x-user-id'];
    const usuarioTipo = req.headers['x-user-tipo'] || 'administrativo';
    const usuarioNome = req.headers['x-user-nome'] || null;

    // Verificar permissão
    if (usuarioTipo !== 'master') {
      const permissoesResult = await client.query(
        'SELECT despesas_editar FROM permissoes_usuarios WHERE usuario_id = $1',
        [usuarioId]
      );

      if (permissoesResult.rows.length === 0 || !permissoesResult.rows[0].despesas_editar) {
        await client.query('ROLLBACK');
        return res.status(403).json({ error: 'Acesso negado. Permissão insuficiente.' });
      }
    }

    const { caixa_id, data_pagamento, valor_pago } = req.body;

    if (!caixa_id || !data_pagamento || !valor_pago) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Caixa, data de pagamento e valor pago são obrigatórios' });
    }

    // Buscar parcela atual
    const parcelaResult = await client.query(
      `SELECT dp.*, d.fornecedor, d.descricao 
       FROM despesas_parcelas dp
       JOIN despesas d ON dp.despesa_id = d.id
       WHERE dp.id = $1`,
      [req.params.parcela_id]
    );

    if (parcelaResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Parcela não encontrada' });
    }

    const parcela = parcelaResult.rows[0];

    // Se não está paga, não pode modificar
    if (parcela.status !== 'paga') {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Apenas parcelas pagas podem ser modificadas' });
    }

    const valorPago = parseFloat(valor_pago);
    const statusParcela = valorPago >= parseFloat(parcela.valor) ? 'paga' : 'parcial';

    // Se havia movimentação anterior, deletar
    if (parcela.movimentacao_caixa_id) {
      await client.query(
        'DELETE FROM movimentacoes_caixa WHERE id = $1',
        [parcela.movimentacao_caixa_id]
      );
    }

    // Atualizar parcela
    await client.query(
      `UPDATE despesas_parcelas 
       SET data_pagamento = $1, 
           valor_pago = $2, 
           status = $3,
           caixa_id = $4,
           updated_by = $5
       WHERE id = $6`,
      [data_pagamento, valorPago, statusParcela, caixa_id, usuarioId, req.params.parcela_id]
    );

    // Criar nova movimentação de saída no caixa
    const movimentacaoResult = await client.query(
      `INSERT INTO movimentacoes_caixa 
       (conta_id, tipo_movimentacao, valor, descricao, data_movimentacao, referencia_id, referencia_tipo, created_by)
       VALUES ($1, 'saida', $2, $3, $4, $5, 'despesa_parcela', $6)
       RETURNING id`,
      [
        caixa_id,
        valorPago,
        `Pagamento Despesa ${parcela.ticket_parcela} - ${parcela.fornecedor}`,
        data_pagamento,
        req.params.parcela_id,
        usuarioId
      ]
    );

    // Atualizar parcela com o ID da nova movimentação
    await client.query(
      `UPDATE despesas_parcelas 
       SET movimentacao_caixa_id = $1 
       WHERE id = $2`,
      [movimentacaoResult.rows[0].id, req.params.parcela_id]
    );

    // Buscar parcela atualizada
    const parcelaAtualizada = await client.query(
      `SELECT * FROM despesas_parcelas WHERE id = $1`,
      [req.params.parcela_id]
    );

    await client.query('COMMIT');

    await registrarLog({
      usuario_id: usuarioId,
      usuario_tipo: usuarioTipo,
      usuario_nome: usuarioNome,
      acao: 'editar',
      modulo: 'despesas',
      descricao: `Modificou pagamento da parcela ${parcela.ticket_parcela}`,
      ip: getClientIp(req),
      user_agent: getUserAgent(req)
    });

    res.json({
      message: 'Pagamento modificado com sucesso',
      parcela: parcelaAtualizada.rows[0]
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Erro ao modificar pagamento:', error);
    res.status(500).json({ error: 'Erro ao modificar pagamento', details: error.message });
  } finally {
    client.release();
  }
});

module.exports = router;

