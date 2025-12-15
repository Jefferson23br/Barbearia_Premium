const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { registrarLog, getClientIp, getUserAgent } = require('../utils/logger');

/**
 * Função auxiliar para validar e aplicar cupom
 */
async function validarEAplicarCupom(client, cupomCodigo, clienteId, valorServicos, valorProdutos, valorTotal) {
  if (!cupomCodigo) {
    return { cupomId: null, descontoCupom: 0, cupom: null };
  }

  // Buscar cupom
  const cupomResult = await client.query(
    'SELECT * FROM protese.cupons WHERE codigo = $1 AND is_active = true',
    [cupomCodigo.toUpperCase()]
  );

  if (cupomResult.rows.length === 0) {
    throw new Error('Cupom não encontrado ou inativo');
  }

  const cupom = cupomResult.rows[0];

  // Verificar validade
  const hoje = new Date();
  if (cupom.validade_inicio && new Date(cupom.validade_inicio) > hoje) {
    throw new Error('Cupom ainda não está válido');
  }

  if (cupom.validade_fim && new Date(cupom.validade_fim) < hoje) {
    throw new Error('Cupom expirado');
  }

  // Verificar regra de uso
  if (cupom.regra_uso === 'unico') {
    const usoCheck = await client.query(
      'SELECT COUNT(*) as total FROM protese.cupons_usados WHERE cupom_id = $1',
      [cupom.id]
    );

    if (parseInt(usoCheck.rows[0].total) > 0) {
      throw new Error('Cupom já foi usado (uso único)');
    }
  }

  if (cupom.regra_uso === 'limitado') {
    const usoCheck = await client.query(
      'SELECT COUNT(*) as total FROM protese.cupons_usados WHERE cupom_id = $1',
      [cupom.id]
    );

    if (parseInt(usoCheck.rows[0].total) >= cupom.limite_usos) {
      throw new Error('Cupom atingiu o limite de usos');
    }
  }

  if (cupom.regra_uso === 'fidelidade') {
    if (!clienteId) {
      throw new Error('Cliente é obrigatório para cupons de fidelidade');
    }

    const fidelidadeCheck = await client.query(
      'SELECT * FROM protese.fidelidades WHERE cliente_id = $1 AND cupom_id = $2',
      [clienteId, cupom.id]
    );

    if (fidelidadeCheck.rows.length === 0) {
      throw new Error('Cliente não possui fidelidade para este cupom');
    }

    const fidelidade = fidelidadeCheck.rows[0];

    if (!fidelidade.cupom_liberado) {
      throw new Error(`Cupom ainda não foi liberado. Progresso: ${fidelidade.quantidade_atual}/${fidelidade.quantidade_necessaria}`);
    }

    if (fidelidade.cupom_usado) {
      throw new Error('Cupom de fidelidade já foi usado');
    }
  }

  // Calcular desconto do cupom
  let valorBaseDesconto = 0;

  if (cupom.aplicar_em === 'total') {
    valorBaseDesconto = valorTotal;
  } else if (cupom.aplicar_em === 'apenas_servicos') {
    valorBaseDesconto = valorServicos;
  } else if (cupom.aplicar_em === 'apenas_produtos') {
    valorBaseDesconto = valorProdutos;
  }

  let descontoCupom = 0;
  if (cupom.tipo_desconto === 'percentual') {
    descontoCupom = valorBaseDesconto * (parseFloat(cupom.valor_desconto) / 100);
  } else if (cupom.tipo_desconto === 'valor_fixo') {
    descontoCupom = Math.min(parseFloat(cupom.valor_desconto), valorBaseDesconto);
  }

  return { cupomId: cupom.id, descontoCupom, cupom };
}

/**
 * Função auxiliar para validar e aplicar cupom
 */
async function validarEAplicarCupom(client, cupomCodigo, clienteId, valorServicos, valorProdutos, valorTotal) {
  if (!cupomCodigo) {
    return { cupomId: null, descontoCupom: 0, cupom: null };
  }

  // Buscar cupom
  const cupomResult = await client.query(
    'SELECT * FROM protese.cupons WHERE codigo = $1 AND is_active = true',
    [cupomCodigo.toUpperCase()]
  );

  if (cupomResult.rows.length === 0) {
    throw new Error('Cupom não encontrado ou inativo');
  }

  const cupom = cupomResult.rows[0];

  // Verificar validade
  const hoje = new Date();
  if (cupom.validade_inicio && new Date(cupom.validade_inicio) > hoje) {
    throw new Error('Cupom ainda não está válido');
  }

  if (cupom.validade_fim && new Date(cupom.validade_fim) < hoje) {
    throw new Error('Cupom expirado');
  }

  // Verificar regra de uso
  if (cupom.regra_uso === 'unico') {
    const usoCheck = await client.query(
      'SELECT COUNT(*) as total FROM protese.cupons_usados WHERE cupom_id = $1',
      [cupom.id]
    );

    if (parseInt(usoCheck.rows[0].total) > 0) {
      throw new Error('Cupom já foi usado (uso único)');
    }
  }

  if (cupom.regra_uso === 'limitado') {
    const usoCheck = await client.query(
      'SELECT COUNT(*) as total FROM protese.cupons_usados WHERE cupom_id = $1',
      [cupom.id]
    );

    if (parseInt(usoCheck.rows[0].total) >= cupom.limite_usos) {
      throw new Error('Cupom atingiu o limite de usos');
    }
  }

  if (cupom.regra_uso === 'fidelidade') {
    if (!clienteId) {
      throw new Error('Cliente é obrigatório para cupons de fidelidade');
    }

    const fidelidadeCheck = await client.query(
      'SELECT * FROM protese.fidelidades WHERE cliente_id = $1 AND cupom_id = $2',
      [clienteId, cupom.id]
    );

    if (fidelidadeCheck.rows.length === 0) {
      throw new Error('Cliente não possui fidelidade para este cupom');
    }

    const fidelidade = fidelidadeCheck.rows[0];

    if (!fidelidade.cupom_liberado) {
      throw new Error(`Cupom ainda não foi liberado. Progresso: ${fidelidade.quantidade_atual}/${fidelidade.quantidade_necessaria}`);
    }

    if (fidelidade.cupom_usado) {
      throw new Error('Cupom de fidelidade já foi usado');
    }
  }

  // Calcular desconto do cupom
  let valorBaseDesconto = 0;

  if (cupom.aplicar_em === 'total') {
    valorBaseDesconto = valorTotal;
  } else if (cupom.aplicar_em === 'apenas_servicos') {
    valorBaseDesconto = valorServicos;
  } else if (cupom.aplicar_em === 'apenas_produtos') {
    valorBaseDesconto = valorProdutos;
  }

  let descontoCupom = 0;
  if (cupom.tipo_desconto === 'percentual') {
    descontoCupom = valorBaseDesconto * (parseFloat(cupom.valor_desconto) / 100);
  } else if (cupom.tipo_desconto === 'valor_fixo') {
    descontoCupom = Math.min(parseFloat(cupom.valor_desconto), valorBaseDesconto);
  }

  return { cupomId: cupom.id, descontoCupom, cupom };
}

/**
 * Função auxiliar para calcular data de vencimento das parcelas
 */
function calcularDataVencimento(dataVenda, formaPagamento, numeroParcela, primeiroVencimentoBoleto = null) {
  const data = new Date(dataVenda);
  
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
      // Para parcelas seguintes, usar a data da primeira parcela + (parcela - 1) * 30 dias
      const primeiraParcela = primeiroVencimentoBoleto ? new Date(primeiroVencimentoBoleto) : new Date(dataVenda);
      const novaData = new Date(primeiraParcela);
      const diasAdicionais = (numeroParcela - 1) * 30;
      novaData.setDate(novaData.getDate() + diasAdicionais);
      return novaData;
    }
  }
  
  // Cartão: primeira parcela = data_venda + 31 dias, depois +30 dias
  if (formaPagamento.startsWith('cartao_')) {
    const primeiraParcela = new Date(dataVenda);
    primeiraParcela.setDate(primeiraParcela.getDate() + 31); // 30 + 1
    
    if (numeroParcela === 1) {
      return primeiraParcela;
    } else {
      // Parcelas seguintes: primeira + (parcela - 1) * 30
      const novaData = new Date(primeiraParcela);
      const diasAdicionais = (numeroParcela - 1) * 30;
      novaData.setDate(novaData.getDate() + diasAdicionais);
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
 * GET /api/v1/vendas/agendamentos
 * Busca agendamentos por data e funcionário
 */
router.get('/agendamentos', async (req, res) => {
  try {
    const usuarioId = req.headers['x-user-id'];
    const usuarioTipo = req.headers['x-user-tipo'] || 'administrativo';
    const usuarioNome = req.headers['x-user-nome'] || null;

    // Verificar permissão
    if (usuarioTipo !== 'master') {
      const permissoesResult = await pool.query(
        'SELECT vendas_ver FROM protese.permissoes_usuarios WHERE usuario_id = $1',
        [usuarioId]
      );

      if (permissoesResult.rows.length === 0 || !permissoesResult.rows[0].vendas_ver) {
        return res.status(403).json({ error: 'Acesso negado. Permissão insuficiente.' });
      }
    }

    const { data, funcionario_id } = req.query;

    if (!data || !funcionario_id) {
      return res.status(400).json({ error: 'Data e funcionário são obrigatórios' });
    }

    const query = `
      SELECT 
        a.*,
        c.nome_completo as cliente_nome,
        s.nome as servico_nome,
        s.duracao_minutos,
        s.preco as servico_preco
      FROM protese.agendamentos a
      INNER JOIN protese.usuarios_clientes c ON a.cliente_id = c.id
      INNER JOIN protese.servicos s ON a.servico_id = s.id
      WHERE a.data_agendamento = $1 
        AND a.funcionario_id = $2
        AND a.status = 'agendado'
      ORDER BY a.hora_inicio ASC
    `;

    const result = await pool.query(query, [data, funcionario_id]);

    res.json({ agendamentos: result.rows });
  } catch (error) {
    console.error('Erro ao buscar agendamentos:', error);
    res.status(500).json({ error: 'Erro ao buscar agendamentos' });
  }
});

/**
 * GET /api/v1/vendas
 * Lista todas as vendas
 */
router.get('/', async (req, res) => {
  try {
    const usuarioId = req.headers['x-user-id'];
    const usuarioTipo = req.headers['x-user-tipo'] || 'administrativo';
    const usuarioNome = req.headers['x-user-nome'] || null;

    // Verificar permissão
    if (usuarioTipo !== 'master') {
      const permissoesResult = await pool.query(
        'SELECT vendas_ver FROM protese.permissoes_usuarios WHERE usuario_id = $1',
        [usuarioId]
      );

      if (permissoesResult.rows.length === 0 || !permissoesResult.rows[0].vendas_ver) {
        return res.status(403).json({ error: 'Acesso negado. Permissão insuficiente.' });
      }
    }

    const { data_inicio, data_fim, funcionario_id, cliente_id, status } = req.query;
    let query = `
      SELECT 
        v.*,
        f.nome_completo as funcionario_nome,
        c.nome_completo as cliente_nome,
        ca.nome as caixa_nome
      FROM protese.vendas v
      LEFT JOIN protese.usuarios_administrativos f ON v.funcionario_id = f.id
      LEFT JOIN protese.usuarios_clientes c ON v.cliente_id = c.id
      LEFT JOIN protese.contas ca ON v.caixa_id = ca.id
      WHERE 1=1
    `;
    const params = [];
    let paramIndex = 1;

    if (data_inicio) {
      query += ` AND v.data_venda >= $${paramIndex}`;
      params.push(data_inicio);
      paramIndex++;
    }

    if (data_fim) {
      query += ` AND v.data_venda <= $${paramIndex}`;
      params.push(data_fim);
      paramIndex++;
    }

    if (funcionario_id) {
      query += ` AND v.funcionario_id = $${paramIndex}`;
      params.push(funcionario_id);
      paramIndex++;
    }

    if (cliente_id) {
      query += ` AND v.cliente_id = $${paramIndex}`;
      params.push(cliente_id);
      paramIndex++;
    }

    if (status) {
      query += ` AND v.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    query += ' ORDER BY v.data_venda DESC, v.created_at DESC';

    const result = await pool.query(query, params);

    // Buscar serviços e produtos de cada venda
    const vendasComDetalhes = await Promise.all(result.rows.map(async (venda) => {
      const servicosResult = await pool.query(
        `SELECT 
          vs.*,
          s.nome as servico_nome
         FROM protese.vendas_servicos vs
         INNER JOIN protese.servicos s ON vs.servico_id = s.id
         WHERE vs.venda_id = $1`,
        [venda.id]
      );

      const produtosResult = await pool.query(
        `SELECT 
          vp.*,
          p.descricao as produto_descricao,
          p.codigo as produto_codigo
         FROM protese.vendas_produtos vp
         INNER JOIN protese.produtos p ON vp.produto_id = p.id
         WHERE vp.venda_id = $1`,
        [venda.id]
      );

      const parcelasResult = await pool.query(
        `SELECT * FROM protese.vendas_parcelas WHERE venda_id = $1 ORDER BY numero_parcela ASC`,
        [venda.id]
      );

      return {
        ...venda,
        servicos: servicosResult.rows,
        produtos: produtosResult.rows,
        parcelas: parcelasResult.rows
      };
    }));

    await registrarLog({
      usuario_id: usuarioId,
      usuario_tipo: usuarioTipo,
      usuario_nome: usuarioNome,
      acao: 'visualizar',
      modulo: 'vendas',
      descricao: 'Listou vendas',
      ip: getClientIp(req),
      user_agent: getUserAgent(req)
    });

    res.json({ vendas: vendasComDetalhes });
  } catch (error) {
    console.error('Erro ao listar vendas:', error);
    res.status(500).json({ error: 'Erro ao listar vendas' });
  }
});

/**
 * GET /api/v1/vendas/:id
 * Busca uma venda específica
 */
router.get('/:id', async (req, res) => {
  try {
    const usuarioId = req.headers['x-user-id'];
    const usuarioTipo = req.headers['x-user-tipo'] || 'administrativo';
    const usuarioNome = req.headers['x-user-nome'] || null;

    // Verificar permissão
    if (usuarioTipo !== 'master') {
      const permissoesResult = await pool.query(
        'SELECT vendas_ver FROM protese.permissoes_usuarios WHERE usuario_id = $1',
        [usuarioId]
      );

      if (permissoesResult.rows.length === 0 || !permissoesResult.rows[0].vendas_ver) {
        return res.status(403).json({ error: 'Acesso negado. Permissão insuficiente.' });
      }
    }

    const vendaResult = await pool.query(
      `SELECT 
        v.*,
        f.nome_completo as funcionario_nome,
        c.nome_completo as cliente_nome,
        ca.nome as caixa_nome
       FROM protese.vendas v
       LEFT JOIN protese.usuarios_administrativos f ON v.funcionario_id = f.id
       LEFT JOIN protese.usuarios_clientes c ON v.cliente_id = c.id
       LEFT JOIN protese.contas ca ON v.caixa_id = ca.id
       WHERE v.id = $1`,
      [req.params.id]
    );

    if (vendaResult.rows.length === 0) {
      return res.status(404).json({ error: 'Venda não encontrada' });
    }

    const venda = vendaResult.rows[0];

    // Buscar serviços, produtos e parcelas
    const servicosResult = await pool.query(
      `SELECT 
        vs.*,
        s.nome as servico_nome
       FROM protese.vendas_servicos vs
       INNER JOIN protese.servicos s ON vs.servico_id = s.id
       WHERE vs.venda_id = $1`,
      [venda.id]
    );

    const produtosResult = await pool.query(
      `SELECT 
        vp.*,
        p.descricao as produto_descricao,
        p.codigo as produto_codigo
       FROM protese.vendas_produtos vp
       INNER JOIN protese.produtos p ON vp.produto_id = p.id
       WHERE vp.venda_id = $1`,
      [venda.id]
    );

    const parcelasResult = await pool.query(
      `SELECT * FROM protese.vendas_parcelas WHERE venda_id = $1 ORDER BY numero_parcela ASC`,
      [venda.id]
    );

    res.json({
      venda: {
        ...venda,
        servicos: servicosResult.rows,
        produtos: produtosResult.rows,
        parcelas: parcelasResult.rows
      }
    });
  } catch (error) {
    console.error('Erro ao buscar venda:', error);
    res.status(500).json({ error: 'Erro ao buscar venda' });
  }
});

/**
 * POST /api/v1/vendas
 * Cria uma nova venda
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
        'SELECT vendas_editar FROM protese.permissoes_usuarios WHERE usuario_id = $1',
        [usuarioId]
      );

      if (permissoesResult.rows.length === 0 || !permissoesResult.rows[0].vendas_editar) {
        await client.query('ROLLBACK');
        return res.status(403).json({ error: 'Acesso negado. Permissão insuficiente.' });
      }
    }

    const {
      funcionario_id,
      cliente_id,
      data_venda,
      servicos,
      produtos,
      desconto_percentual,
      desconto_valor,
      cupom_codigo,
      forma_pagamento,
      caixa_id,
      observacoes,
      primeiro_vencimento_boleto
    } = req.body;

    // Validações
    if (!funcionario_id || !data_venda || !forma_pagamento || !caixa_id) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Funcionário, data, forma de pagamento e caixa são obrigatórios' });
    }

    if ((!servicos || servicos.length === 0) && (!produtos || produtos.length === 0)) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'É necessário pelo menos um serviço ou produto' });
    }

    // Calcular valor total
    let valorTotal = 0;

    if (servicos && servicos.length > 0) {
      for (const servico of servicos) {
        if (!servico.servico_id || !servico.valor) {
          await client.query('ROLLBACK');
          return res.status(400).json({ error: 'Serviços devem ter ID e valor' });
        }
        valorTotal += parseFloat(servico.valor);
      }
    }

    if (produtos && produtos.length > 0) {
      for (const produto of produtos) {
        if (!produto.produto_id || !produto.quantidade || !produto.valor_unitario) {
          await client.query('ROLLBACK');
          return res.status(400).json({ error: 'Produtos devem ter ID, quantidade e valor unitário' });
        }
        const valorProduto = parseFloat(produto.quantidade) * parseFloat(produto.valor_unitario);
        valorTotal += valorProduto;
      }
    }

    // Calcular descontos
    const descontoPercentualValue = parseFloat(desconto_percentual) || 0;
    const descontoValorValue = parseFloat(desconto_valor) || 0;
    
    const descontoPorPercentual = valorTotal * (descontoPercentualValue / 100);
    const valorLiquido = valorTotal - descontoPorPercentual - descontoValorValue;

    if (valorLiquido < 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Valor líquido não pode ser negativo' });
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
    const ticketResult = await client.query('SELECT protese.gerar_proximo_ticket_venda() as ticket');
    const ticketBase = ticketResult.rows[0].ticket;

    // Inserir venda
    const vendaResult = await client.query(
      `INSERT INTO protese.vendas 
       (ticket, funcionario_id, cliente_id, data_venda, valor_total, desconto_percentual, 
        desconto_valor, valor_liquido, forma_pagamento, numero_parcelas, caixa_id, cupom_id, observacoes, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
       RETURNING *`,
      [
        ticketBase,
        funcionario_id,
        cliente_id || null,
        data_venda,
        valorTotal,
        descontoPercentualValue,
        descontoValorValue,
        valorLiquido,
        forma_pagamento,
        numeroParcelas,
        caixa_id,
        cupomId,
        observacoes || null,
        usuarioId
      ]
    );

    const venda = vendaResult.rows[0];

    // Inserir serviços e atualizar status dos agendamentos para 'concluido'
    if (servicos && servicos.length > 0) {
      for (const servico of servicos) {
        await client.query(
          `INSERT INTO protese.vendas_servicos (venda_id, servico_id, agendamento_id, valor)
           VALUES ($1, $2, $3, $4)`,
          [venda.id, servico.servico_id, servico.agendamento_id || null, servico.valor]
        );
        
        // Se o serviço está vinculado a um agendamento, atualizar status para 'concluido'
        if (servico.agendamento_id) {
          await client.query(
            `UPDATE protese.agendamentos 
             SET status = 'concluido', updated_at = CURRENT_TIMESTAMP
             WHERE id = $1`,
            [servico.agendamento_id]
          );
        }
      }
    }

    // Inserir produtos e abater estoque
    if (produtos && produtos.length > 0) {
      for (const produto of produtos) {
        const quantidadeVendida = parseFloat(produto.quantidade);
        const produtoId = produto.produto_id;
        
        // Verificar se há estoque suficiente
        const produtoCheck = await client.query(
          'SELECT id, descricao, codigo, quantidade_estoque FROM protese.produtos WHERE id = $1',
          [produtoId]
        );
        
        if (produtoCheck.rows.length === 0) {
          await client.query('ROLLBACK');
          return res.status(400).json({ error: `Produto não encontrado` });
        }
        
        const estoqueAtual = parseFloat(produtoCheck.rows[0].quantidade_estoque) || 0;
        
        if (estoqueAtual < quantidadeVendida) {
          await client.query('ROLLBACK');
          return res.status(400).json({ 
            error: `Estoque insuficiente para o produto ${produtoCheck.rows[0].codigo} - ${produtoCheck.rows[0].descricao}. Estoque disponível: ${estoqueAtual}, quantidade solicitada: ${quantidadeVendida}` 
          });
        }
        
        const valorTotalProduto = quantidadeVendida * parseFloat(produto.valor_unitario);
        
        // Inserir produto na venda
        await client.query(
          `INSERT INTO protese.vendas_produtos (venda_id, produto_id, quantidade, valor_unitario, valor_total)
           VALUES ($1, $2, $3, $4, $5)`,
          [
            venda.id,
            produtoId,
            quantidadeVendida,
            produto.valor_unitario,
            valorTotalProduto
          ]
        );
        
        // Abater estoque do produto
        await client.query(
          `UPDATE protese.produtos 
           SET quantidade_estoque = quantidade_estoque - $1,
               updated_at = CURRENT_TIMESTAMP
           WHERE id = $2`,
          [quantidadeVendida, produtoId]
        );
      }
    }

    // Calcular valor por parcela
    const valorPorParcela = valorLiquido / numeroParcelas;

    // Criar parcelas
    const parcelas = [];
    for (let i = 1; i <= numeroParcelas; i++) {
      const dataVencimento = calcularDataVencimento(
        data_venda,
        forma_pagamento,
        i,
        primeiro_vencimento_boleto
      );
      
      const ticketParcela = gerarTicketParcela(ticketBase, i, numeroParcelas);
      
      // Ajustar última parcela para compensar diferenças de arredondamento
      let valorParcela = valorPorParcela;
      if (i === numeroParcelas) {
        // Última parcela recebe o restante para garantir que a soma seja exata
        const valorJaDistribuido = valorPorParcela * (numeroParcelas - 1);
        valorParcela = valorLiquido - valorJaDistribuido;
      }

      const parcelaResult = await client.query(
        `INSERT INTO protese.vendas_parcelas 
         (venda_id, numero_parcela, ticket_parcela, valor, data_vencimento, forma_pagamento, created_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING *`,
        [
          venda.id,
          i,
          ticketParcela,
          valorParcela,
          dataVencimento.toISOString().split('T')[0],
          forma_pagamento,
          usuarioId
        ]
      );

      parcelas.push(parcelaResult.rows[0]);
    }

    // Criar receitas para cada parcela
    const receitasCriadas = [];
    for (let i = 0; i < parcelas.length; i++) {
      const parcela = parcelas[i];
      const isPagamentoVista = ['dinheiro', 'pix', 'ted'].includes(forma_pagamento);
      
      // Para pagamentos à vista, criar receita já quitada
      // Para cartão/boleto, criar receita pendente
      const receitaResult = await client.query(
        `INSERT INTO protese.receitas 
         (ticket_venda, parcela_id, venda_id, cliente_id, forma_pagamento, caixa_id, 
          data_emissao, data_vencimento, data_pagamento, valor_vencimento, valor_pago, 
          status, created_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
         RETURNING *`,
        [
          parcela.ticket_parcela,
          parcela.id,
          venda.id,
          cliente_id || null,
          forma_pagamento,
          isPagamentoVista ? caixa_id : null, // Caixa só preenchido para pagamentos à vista
          data_venda,
          parcela.data_vencimento,
          isPagamentoVista ? data_venda : null, // Data de pagamento só para à vista
          parcela.valor,
          isPagamentoVista ? parcela.valor : 0, // Valor pago só para à vista
          isPagamentoVista ? 'paga' : 'pendente', // Status
          usuarioId
        ]
      );

      const receita = receitaResult.rows[0];
      receitasCriadas.push(receita);

      // Se for pagamento à vista, criar movimentação no caixa e vincular à receita
      if (isPagamentoVista) {
        const movimentacaoResult = await client.query(
          `INSERT INTO protese.movimentacoes_caixa 
           (conta_id, tipo_movimentacao, valor, descricao, data_movimentacao, referencia_id, referencia_tipo, created_by)
           VALUES ($1, 'entrada', $2, $3, $4, $5, 'receita', $6)
           RETURNING id`,
          [
            caixa_id,
            parcela.valor,
            `Receita ${parcela.ticket_parcela} - Venda ${ticketBase} - ${forma_pagamento}`,
            data_venda,
            receita.id,
            usuarioId
          ]
        );

        // Atualizar receita com o ID da movimentação
        await client.query(
          `UPDATE protese.receitas 
           SET movimentacao_caixa_id = $1 
           WHERE id = $2`,
          [movimentacaoResult.rows[0].id, receita.id]
        );
      }
    }

    // Registrar uso do cupom se aplicado
    if (cupomId) {
      await client.query(
        `INSERT INTO protese.cupons_usados 
         (cupom_id, cliente_id, venda_id, valor_desconto_aplicado, created_by)
         VALUES ($1, $2, $3, $4, $5)`,
        [
          cupomId,
          cliente_id || null,
          venda.id,
          descontoCupom,
          usuarioId
        ]
      );

      // Se for cupom de fidelidade, marcar como usado e resetar contagem
      if (cupomAplicado && cupomAplicado.regra_uso === 'fidelidade' && cliente_id) {
        await client.query(
          `UPDATE protese.fidelidades 
           SET cupom_usado = true,
               data_uso = CURRENT_DATE,
               quantidade_atual = 0,
               cupom_liberado = false,
               updated_at = CURRENT_TIMESTAMP
           WHERE cliente_id = $1 AND cupom_id = $2`,
          [cliente_id, cupomId]
        );
      }
    }

    // Atualizar fidelidades (contar compras para liberar novos cupons)
    if (cliente_id) {
      const temServicos = servicos && servicos.length > 0;
      const temProdutos = produtos && produtos.length > 0;
      const isPagamentoOnline = ['pix', 'ted', 'cartao_1x'].includes(forma_pagamento);

      // Buscar cupons de fidelidade ativos
      const cuponsFidelidade = await client.query(
        `SELECT * FROM protese.cupons 
         WHERE regra_uso = 'fidelidade' 
         AND is_active = true
         AND (validade_inicio IS NULL OR validade_inicio <= CURRENT_DATE)
         AND (validade_fim IS NULL OR validade_fim >= CURRENT_DATE)`
      );

      // Processar cada cupom de fidelidade
      for (const cupomFid of cuponsFidelidade.rows) {
        // Não atualizar o cupom que acabou de ser usado
        if (cupomId && cupomFid.id === cupomId) {
          continue;
        }

        let deveContar = false;

        // Verificar se deve contar baseado na regra de fidelidade
        switch (cupomFid.regra_fidelidade) {
          case 'compras_servicos':
            deveContar = temServicos;
            break;
          case 'compras_produtos':
            deveContar = temProdutos;
            break;
          case 'compras_total':
            deveContar = temServicos || temProdutos;
            break;
          case 'pagamento_online':
            deveContar = isPagamentoOnline;
            break;
          case 'agendamento_pago':
            // Verificar se há agendamento vinculado e se foi pago
            const agendamentoCheck = await client.query(
              `SELECT a.id FROM protese.vendas_servicos vs
               INNER JOIN protese.agendamentos a ON vs.agendamento_id = a.id
               WHERE vs.venda_id = $1 AND a.id IS NOT NULL`,
              [venda.id]
            );
            deveContar = agendamentoCheck.rows.length > 0 && isPagamentoOnline;
            break;
        }

        if (!deveContar) continue;

        // Buscar ou criar registro de fidelidade
        let fidelidadeResult = await client.query(
          'SELECT * FROM protese.fidelidades WHERE cliente_id = $1 AND cupom_id = $2',
          [cliente_id, cupomFid.id]
        );

        if (fidelidadeResult.rows.length === 0) {
          // Criar novo registro
          await client.query(
            `INSERT INTO protese.fidelidades 
             (cliente_id, cupom_id, tipo_contagem, quantidade_atual, quantidade_necessaria)
             VALUES ($1, $2, $3, 1, $4)`,
            [cliente_id, cupomFid.id, cupomFid.regra_fidelidade, cupomFid.quantidade_fidelidade]
          );
        } else {
          const fidelidade = fidelidadeResult.rows[0];

          // Se já usou o cupom, não incrementa até usar novamente
          if (fidelidade.cupom_usado) {
            // Resetar e começar a contar novamente
            await client.query(
              `UPDATE protese.fidelidades 
               SET quantidade_atual = 1,
                   cupom_liberado = false,
                   cupom_usado = false,
                   data_liberacao = NULL,
                   data_uso = NULL,
                   updated_at = CURRENT_TIMESTAMP
               WHERE cliente_id = $1 AND cupom_id = $2`,
              [cliente_id, cupomFid.id]
            );
          } else {
            // Incrementar contagem
            const novaQuantidade = fidelidade.quantidade_atual + 1;
            const quantidadeNecessaria = cupomFid.quantidade_fidelidade;

            let cupomLiberado = false;
            if (novaQuantidade >= quantidadeNecessaria) {
              cupomLiberado = true;
            }

            await client.query(
              `UPDATE protese.fidelidades 
               SET quantidade_atual = $1,
                   cupom_liberado = $2,
                   data_liberacao = CASE WHEN $2 = true AND data_liberacao IS NULL THEN CURRENT_DATE ELSE data_liberacao END,
                   updated_at = CURRENT_TIMESTAMP
               WHERE cliente_id = $3 AND cupom_id = $4`,
              [novaQuantidade, cupomLiberado, cliente_id, cupomFid.id]
            );
          }
        }
      }
    }

    await client.query('COMMIT');

    await registrarLog({
      usuario_id: usuarioId,
      usuario_tipo: usuarioTipo,
      usuario_nome: usuarioNome,
      acao: 'criar',
      modulo: 'vendas',
      descricao: `Criou venda ${ticketBase}`,
      ip: getClientIp(req),
      user_agent: getUserAgent(req)
    });

    // Buscar venda completa para retornar
    const vendaCompletaResult = await pool.query(
      `SELECT 
        v.*,
        f.nome_completo as funcionario_nome,
        c.nome_completo as cliente_nome,
        ca.nome as caixa_nome
       FROM protese.vendas v
       LEFT JOIN protese.usuarios_administrativos f ON v.funcionario_id = f.id
       LEFT JOIN protese.usuarios_clientes c ON v.cliente_id = c.id
       LEFT JOIN protese.contas ca ON v.caixa_id = ca.id
       WHERE v.id = $1`,
      [venda.id]
    );

    const servicosResult = await pool.query(
      `SELECT 
        vs.*,
        s.nome as servico_nome
       FROM protese.vendas_servicos vs
       INNER JOIN protese.servicos s ON vs.servico_id = s.id
       WHERE vs.venda_id = $1`,
      [venda.id]
    );

    const produtosResult = await pool.query(
      `SELECT 
        vp.*,
        p.descricao as produto_descricao,
        p.codigo as produto_codigo
       FROM protese.vendas_produtos vp
       INNER JOIN protese.produtos p ON vp.produto_id = p.id
       WHERE vp.venda_id = $1`,
      [venda.id]
    );

    res.status(201).json({
      venda: {
        ...vendaCompletaResult.rows[0],
        servicos: servicosResult.rows,
        produtos: produtosResult.rows,
        parcelas: parcelas
      }
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Erro ao criar venda:', error);
    res.status(500).json({ error: 'Erro ao criar venda', details: error.message });
  } finally {
    client.release();
  }
});

/**
 * DELETE /api/v1/vendas/:id
 * Exclui uma venda (e todas suas parcelas, serviços e produtos)
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
        'SELECT vendas_excluir FROM protese.permissoes_usuarios WHERE usuario_id = $1',
        [usuarioId]
      );

      if (permissoesResult.rows.length === 0 || !permissoesResult.rows[0].vendas_excluir) {
        await client.query('ROLLBACK');
        return res.status(403).json({ error: 'Acesso negado. Permissão insuficiente.' });
      }
    }

    // Buscar venda antes de excluir
    const vendaResult = await client.query(
      'SELECT ticket FROM protese.vendas WHERE id = $1',
      [req.params.id]
    );

    if (vendaResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Venda não encontrada' });
    }

    const ticket = vendaResult.rows[0].ticket;

    // Buscar produtos da venda antes de excluir para restaurar estoque
    const produtosVenda = await client.query(
      'SELECT produto_id, quantidade FROM protese.vendas_produtos WHERE venda_id = $1',
      [req.params.id]
    );
    
    // Restaurar estoque dos produtos
    for (const produtoVenda of produtosVenda.rows) {
      await client.query(
        `UPDATE protese.produtos 
         SET quantidade_estoque = quantidade_estoque + $1,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $2`,
        [produtoVenda.quantidade, produtoVenda.produto_id]
      );
    }
    
    // Excluir parcelas (cascade vai excluir automaticamente, mas vamos fazer explicitamente)
    await client.query('DELETE FROM protese.vendas_parcelas WHERE venda_id = $1', [req.params.id]);
    
    // Excluir serviços e produtos (cascade)
    await client.query('DELETE FROM protese.vendas_servicos WHERE venda_id = $1', [req.params.id]);
    await client.query('DELETE FROM protese.vendas_produtos WHERE venda_id = $1', [req.params.id]);
    
    // Excluir receitas relacionadas (cascade vai excluir automaticamente)
    await client.query('DELETE FROM protese.receitas WHERE venda_id = $1', [req.params.id]);
    
    // Excluir movimentações de caixa relacionadas (receitas e vendas)
    await client.query(
      `DELETE FROM protese.movimentacoes_caixa 
       WHERE (referencia_id = $1 AND referencia_tipo = 'venda') 
          OR (referencia_id IN (SELECT id FROM protese.receitas WHERE venda_id = $1) AND referencia_tipo = 'receita')`,
      [req.params.id]
    );
    
    // Excluir venda
    await client.query('DELETE FROM protese.vendas WHERE id = $1', [req.params.id]);

    await client.query('COMMIT');

    await registrarLog({
      usuario_id: usuarioId,
      usuario_tipo: usuarioTipo,
      usuario_nome: usuarioNome,
      acao: 'excluir',
      modulo: 'vendas',
      descricao: `Excluiu venda ${ticket}`,
      ip: getClientIp(req),
      user_agent: getUserAgent(req)
    });

    res.json({ message: 'Venda excluída com sucesso' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Erro ao excluir venda:', error);
    res.status(500).json({ error: 'Erro ao excluir venda' });
  } finally {
    client.release();
  }
});

module.exports = router;

