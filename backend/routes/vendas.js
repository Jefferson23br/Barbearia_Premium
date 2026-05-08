const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { registrarLog, getClientIp, getUserAgent } = require('../utils/logger');

/**
 * GET /api/v1/vendas/cliente/:id/servicos-produtos-disponiveis
 * Busca serviços e produtos disponíveis do cliente em assinaturas válidas
 */
router.get('/cliente/:id/servicos-produtos-disponiveis', async (req, res) => {
  try {
    const clienteId = req.params.id;
    const hoje = new Date().toISOString().split('T')[0];

    // Buscar assinaturas válidas do cliente
    const assinaturasResult = await pool.query(
      `SELECT 
        ac.id,
        ac.quantidade_servicos_restantes,
        ac.quantidade_produtos_restantes,
        ac.data_expiracao
       FROM assinaturas_clientes ac
       WHERE ac.cliente_id = $1 
         AND ac.status = 'ativa'
         AND (ac.data_expiracao IS NULL OR ac.data_expiracao >= $2)
       ORDER BY ac.data_aquisicao ASC`,
      [clienteId, hoje]
    );

    // Consolidar todos os serviços e produtos disponíveis
    const servicosDisponiveis = {};
    const produtosDisponiveis = {};

    for (const assinatura of assinaturasResult.rows) {
      const servicosRestantes = assinatura.quantidade_servicos_restantes || {};
      const produtosRestantes = assinatura.quantidade_produtos_restantes || {};

      // Consolidar serviços
      for (const [servicoId, quantidade] of Object.entries(servicosRestantes)) {
        if (quantidade > 0) {
          servicosDisponiveis[servicoId] = (servicosDisponiveis[servicoId] || 0) + quantidade;
        }
      }

      // Consolidar produtos
      for (const [produtoId, quantidade] of Object.entries(produtosRestantes)) {
        if (quantidade > 0) {
          produtosDisponiveis[produtoId] = (produtosDisponiveis[produtoId] || 0) + quantidade;
        }
      }
    }

    // Buscar detalhes dos serviços
    const servicosDetalhes = [];
    for (const [servicoId, quantidade] of Object.entries(servicosDisponiveis)) {
      const servicoInfo = await pool.query(
        'SELECT id, nome, preco FROM servicos WHERE id = $1',
        [servicoId]
      );
      if (servicoInfo.rows.length > 0) {
        servicosDetalhes.push({
          servico_id: servicoId,
          servico_nome: servicoInfo.rows[0].nome,
          servico_preco: servicoInfo.rows[0].preco,
          quantidade_disponivel: quantidade
        });
      }
    }

    // Buscar detalhes dos produtos
    const produtosDetalhes = [];
    for (const [produtoId, quantidade] of Object.entries(produtosDisponiveis)) {
      const produtoInfo = await pool.query(
        'SELECT id, descricao, codigo, preco_venda FROM produtos WHERE id = $1',
        [produtoId]
      );
      if (produtoInfo.rows.length > 0) {
        produtosDetalhes.push({
          produto_id: produtoId,
          produto_descricao: produtoInfo.rows[0].descricao,
          produto_codigo: produtoInfo.rows[0].codigo,
          produto_preco: produtoInfo.rows[0].preco_venda,
          quantidade_disponivel: quantidade
        });
      }
    }

    res.json({
      servicos_disponiveis: servicosDetalhes,
      produtos_disponiveis: produtosDetalhes
    });
  } catch (error) {
    console.error('Erro ao buscar serviços/produtos disponíveis:', error);
    res.status(500).json({ error: 'Erro ao buscar serviços/produtos disponíveis', details: error.message });
  }
});

/**
 * Função auxiliar para verificar e abater serviço/produto de assinatura válida
 * Retorna { podeAbater: boolean, assinaturaClienteId: string | null, quantidadeAbatida: number }
 */
async function verificarEAbaterDeAssinatura(client, clienteId, servicoId, produtoId, quantidade, dataVenda) {
  if (!clienteId) {
    return { podeAbater: false, assinaturaClienteId: null, quantidadeAbatida: 0 };
  }

  // Formatar data para string YYYY-MM-DD
  let dataFormatada;
  if (dataVenda) {
    try {
      const data = typeof dataVenda === 'string' ? new Date(dataVenda) : dataVenda;
      dataFormatada = data.toISOString().split('T')[0];
    } catch (error) {
      dataFormatada = new Date().toISOString().split('T')[0];
    }
  } else {
    dataFormatada = new Date().toISOString().split('T')[0];
  }
  
  // Buscar assinaturas válidas do cliente (ativas, não expiradas, não consumidas)
  const assinaturasResult = await client.query(
    `SELECT 
      ac.id,
      ac.assinatura_id,
      ac.quantidade_servicos_restantes,
      ac.quantidade_produtos_restantes,
      ac.data_expiracao,
      a.validade_em_dias
     FROM assinaturas_clientes ac
     INNER JOIN assinaturas a ON ac.assinatura_id = a.id
     WHERE ac.cliente_id = $1 
       AND ac.status = 'ativa'
       AND (ac.data_expiracao IS NULL OR ac.data_expiracao >= $2)
     ORDER BY ac.data_aquisicao ASC`,
    [clienteId, dataFormatada]
  );

  if (assinaturasResult.rows.length === 0) {
    return { podeAbater: false, assinaturaClienteId: null, quantidadeAbatida: 0 };
  }

  // Tentar abater de cada assinatura (ordem: mais antiga primeiro)
  for (const assinaturaCliente of assinaturasResult.rows) {
    let quantidadeRestante = quantidade;
    let quantidadeAbatida = 0;

    if (servicoId) {
      // Verificar se o serviço está na assinatura
      let servicosRestantes = {};
      try {
        servicosRestantes = typeof assinaturaCliente.quantidade_servicos_restantes === 'string' 
          ? JSON.parse(assinaturaCliente.quantidade_servicos_restantes) 
          : (assinaturaCliente.quantidade_servicos_restantes || {});
      } catch (error) {
        servicosRestantes = {};
      }
      const quantidadeDisponivel = servicosRestantes[servicoId] || 0;

      if (quantidadeDisponivel > 0) {
        quantidadeAbatida = Math.min(quantidadeRestante, quantidadeDisponivel);
        servicosRestantes[servicoId] = quantidadeDisponivel - quantidadeAbatida;

        // Verificar se ainda há serviços restantes
        const temServicosRestantes = Object.values(servicosRestantes).some(qtd => qtd > 0);
        let produtosRestantes = {};
        try {
          produtosRestantes = typeof assinaturaCliente.quantidade_produtos_restantes === 'string' 
            ? JSON.parse(assinaturaCliente.quantidade_produtos_restantes) 
            : (assinaturaCliente.quantidade_produtos_restantes || {});
        } catch (error) {
          produtosRestantes = {};
        }
        const temProdutosRestantes = Object.values(produtosRestantes).some(qtd => qtd > 0);

        // Atualizar assinatura
        await client.query(
          `UPDATE assinaturas_clientes 
           SET quantidade_servicos_restantes = $1,
               status = CASE WHEN $2 = false AND $3 = false THEN 'consumida' ELSE status END,
               updated_at = CURRENT_TIMESTAMP
           WHERE id = $4`,
          [
            JSON.stringify(servicosRestantes),
            temServicosRestantes,
            temProdutosRestantes,
            assinaturaCliente.id
          ]
        );

        return { 
          podeAbater: true, 
          assinaturaClienteId: assinaturaCliente.id, 
          quantidadeAbatida 
        };
      }
    }

    if (produtoId) {
      // Verificar se o produto está na assinatura
      let produtosRestantes = {};
      try {
        produtosRestantes = typeof assinaturaCliente.quantidade_produtos_restantes === 'string' 
          ? JSON.parse(assinaturaCliente.quantidade_produtos_restantes) 
          : (assinaturaCliente.quantidade_produtos_restantes || {});
      } catch (error) {
        produtosRestantes = {};
      }
      const quantidadeDisponivel = produtosRestantes[produtoId] || 0;

      if (quantidadeDisponivel > 0) {
        quantidadeAbatida = Math.min(quantidadeRestante, quantidadeDisponivel);
        produtosRestantes[produtoId] = quantidadeDisponivel - quantidadeAbatida;

        // Verificar se ainda há produtos restantes
        let servicosRestantes = {};
        try {
          servicosRestantes = typeof assinaturaCliente.quantidade_servicos_restantes === 'string' 
            ? JSON.parse(assinaturaCliente.quantidade_servicos_restantes) 
            : (assinaturaCliente.quantidade_servicos_restantes || {});
        } catch (error) {
          servicosRestantes = {};
        }
        const temServicosRestantes = Object.values(servicosRestantes).some(qtd => qtd > 0);
        const temProdutosRestantes = Object.values(produtosRestantes).some(qtd => qtd > 0);

        // Atualizar assinatura
        await client.query(
          `UPDATE assinaturas_clientes 
           SET quantidade_produtos_restantes = $1,
               status = CASE WHEN $2 = false AND $3 = false THEN 'consumida' ELSE status END,
               updated_at = CURRENT_TIMESTAMP
           WHERE id = $4`,
          [
            JSON.stringify(produtosRestantes),
            temServicosRestantes,
            temProdutosRestantes,
            assinaturaCliente.id
          ]
        );

        return { 
          podeAbater: true, 
          assinaturaClienteId: assinaturaCliente.id, 
          quantidadeAbatida 
        };
      }
    }
  }

  return { podeAbater: false, assinaturaClienteId: null, quantidadeAbatida: 0 };
}

/**
 * Função auxiliar para validar e aplicar cupom
 */
async function validarEAplicarCupom(client, cupomCodigo, clienteId, valorServicos, valorProdutos, valorTotal) {
  if (!cupomCodigo) {
    return { cupomId: null, descontoCupom: 0, cupom: null };
  }

  const cupomResult = await client.query(
    `SELECT * FROM cupons 
     WHERE codigo = $1 
       AND is_active = true
       AND (validade_inicio IS NULL OR validade_inicio <= CURRENT_DATE)
       AND (validade_fim IS NULL OR validade_fim >= CURRENT_DATE)`,
    [cupomCodigo.toUpperCase()]
  );

  if (cupomResult.rows.length === 0) {
    throw new Error('Cupom não encontrado ou inativo');
  }

  const cupom = cupomResult.rows[0];

  // Verificar limite de usos
  if (cupom.regra_uso === 'limitado') {
    const usosResult = await client.query(
      'SELECT COUNT(*) as total FROM cupons_usados WHERE cupom_id = $1',
      [cupom.id]
    );
    const totalUsos = parseInt(usosResult.rows[0].total);
    if (totalUsos >= (cupom.limite_usos || 0)) {
      throw new Error('Cupom esgotado');
    }
  }

  // Verificar se cliente já usou (se aplicável)
  if (cupom.regra_uso === 'uma_vez_por_cliente' && clienteId) {
    const usoClienteResult = await client.query(
      'SELECT COUNT(*) as total FROM cupons_usados WHERE cupom_id = $1 AND cliente_id = $2',
      [cupom.id, clienteId]
    );
    if (parseInt(usoClienteResult.rows[0].total) > 0) {
      throw new Error('Cupom já utilizado por este cliente');
    }
  }

  // Calcular desconto baseado em aplicar_em
  let valorBaseDesconto = 0;
  if (cupom.aplicar_em === 'apenas_servicos') {
    valorBaseDesconto = valorServicos;
  } else if (cupom.aplicar_em === 'apenas_produtos') {
    valorBaseDesconto = valorProdutos;
  } else {
    valorBaseDesconto = valorTotal;
  }

  // Calcular desconto
  let descontoCupom = 0;
  if (cupom.tipo_desconto === 'percentual') {
    descontoCupom = valorBaseDesconto * (cupom.valor_desconto / 100);
  } else if (cupom.tipo_desconto === 'valor_fixo') {
    descontoCupom = Math.min(cupom.valor_desconto, valorBaseDesconto);
  }

  return {
    cupomId: cupom.id,
    descontoCupom: Math.max(0, descontoCupom),
    cupom: cupom
  };
}

/**
 * GET /api/v1/vendas/agendamentos
 * Busca agendamentos por data e funcionário
 */
router.get('/agendamentos', async (req, res) => {
  try {
    const { data, funcionario_id } = req.query;

    if (!data || !funcionario_id) {
      return res.status(400).json({ error: 'Data e funcionario_id são obrigatórios' });
    }

    const agendamentosResult = await pool.query(
      `SELECT 
        a.id,
        a.cliente_id,
        c.nome_completo as cliente_nome,
        a.servico_id,
        s.nome as servico_nome,
        s.preco as servico_preco,
        a.hora_inicio,
        a.hora_fim,
        s.preco as valor_servico,
        a.status
       FROM agendamentos a
       INNER JOIN usuarios_clientes c ON a.cliente_id = c.id
       INNER JOIN servicos s ON a.servico_id = s.id
       WHERE a.data_agendamento = $1 
         AND a.funcionario_id = $2
         AND a.status = 'agendado'
       ORDER BY a.hora_inicio ASC`,
      [data, funcionario_id]
    );

    res.json({ agendamentos: agendamentosResult.rows });
  } catch (error) {
    console.error('Erro ao buscar agendamentos:', error);
    res.status(500).json({ error: 'Erro ao buscar agendamentos', details: error.message });
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

    // Verificar permissão
    if (usuarioTipo !== 'master') {
      const permissoesResult = await pool.query(
        'SELECT vendas_ver FROM permissoes_usuarios WHERE usuario_id = $1',
        [usuarioId]
      );

      if (permissoesResult.rows.length === 0 || !permissoesResult.rows[0].vendas_ver) {
        return res.status(403).json({ error: 'Acesso negado. Permissão insuficiente.' });
      }
    }

    const { data_inicio, data_fim, cliente_id, funcionario_id, status } = req.query;
    let query = `
      SELECT 
        v.*,
        c.nome_completo as cliente_nome,
        f.nome_completo as funcionario_nome,
        ca.nome as caixa_nome
      FROM vendas v
      LEFT JOIN usuarios_clientes c ON v.cliente_id = c.id
      LEFT JOIN usuarios_administrativos f ON v.funcionario_id = f.id
      LEFT JOIN contas ca ON v.caixa_id = ca.id
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

    if (cliente_id) {
      query += ` AND v.cliente_id = $${paramIndex}`;
      params.push(cliente_id);
      paramIndex++;
    }

    if (funcionario_id) {
      query += ` AND v.funcionario_id = $${paramIndex}`;
      params.push(funcionario_id);
      paramIndex++;
    }

    if (status) {
      query += ` AND v.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    query += ' ORDER BY v.data_venda DESC, v.created_at DESC';

    const result = await pool.query(query, params);

    // Buscar serviços, produtos e assinaturas de cada venda
    const vendasComDetalhes = await Promise.all(result.rows.map(async (venda) => {
      const servicosResult = await pool.query(
        `SELECT vs.*, s.nome as servico_nome 
         FROM vendas_servicos vs
         INNER JOIN servicos s ON vs.servico_id = s.id
         WHERE vs.venda_id = $1`,
        [venda.id]
      );

      const produtosResult = await pool.query(
        `SELECT vp.*, p.descricao as produto_descricao, p.codigo as produto_codigo
         FROM vendas_produtos vp
         INNER JOIN produtos p ON vp.produto_id = p.id
         WHERE vp.venda_id = $1`,
        [venda.id]
      );

      const assinaturasResult = await pool.query(
        `SELECT va.*, a.nome as assinatura_nome
         FROM vendas_assinaturas va
         INNER JOIN assinaturas a ON va.assinatura_id = a.id
         WHERE va.venda_id = $1`,
        [venda.id]
      );

      return {
        ...venda,
        servicos: servicosResult.rows,
        produtos: produtosResult.rows,
        assinaturas: assinaturasResult.rows
      };
    }));

    res.json({ vendas: vendasComDetalhes });
  } catch (error) {
    console.error('Erro ao listar vendas:', error);
    res.status(500).json({ error: 'Erro ao listar vendas', details: error.message });
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

    // Verificar permissão
    if (usuarioTipo !== 'master') {
      const permissoesResult = await pool.query(
        'SELECT vendas_ver FROM permissoes_usuarios WHERE usuario_id = $1',
        [usuarioId]
      );

      if (permissoesResult.rows.length === 0 || !permissoesResult.rows[0].vendas_ver) {
        return res.status(403).json({ error: 'Acesso negado. Permissão insuficiente.' });
      }
    }

    const vendaResult = await pool.query(
      `SELECT 
        v.*,
        c.nome_completo as cliente_nome,
        f.nome_completo as funcionario_nome,
        ca.nome as caixa_nome
       FROM vendas v
       LEFT JOIN usuarios_clientes c ON v.cliente_id = c.id
       LEFT JOIN usuarios_administrativos f ON v.funcionario_id = f.id
       LEFT JOIN contas ca ON v.caixa_id = ca.id
       WHERE v.id = $1`,
      [req.params.id]
    );

    if (vendaResult.rows.length === 0) {
      return res.status(404).json({ error: 'Venda não encontrada' });
    }

    const venda = vendaResult.rows[0];

    // Buscar serviços
    const servicosResult = await pool.query(
      `SELECT vs.*, s.nome as servico_nome 
       FROM vendas_servicos vs
       INNER JOIN servicos s ON vs.servico_id = s.id
       WHERE vs.venda_id = $1`,
      [venda.id]
    );

    // Buscar produtos
    const produtosResult = await pool.query(
      `SELECT vp.*, p.descricao as produto_descricao, p.codigo as produto_codigo
       FROM vendas_produtos vp
       INNER JOIN produtos p ON vp.produto_id = p.id
       WHERE vp.venda_id = $1`,
      [venda.id]
    );

    // Buscar assinaturas
    const assinaturasResult = await pool.query(
      `SELECT va.*, a.nome as assinatura_nome
       FROM vendas_assinaturas va
       INNER JOIN assinaturas a ON va.assinatura_id = a.id
       WHERE va.venda_id = $1`,
      [venda.id]
    );

    res.json({
      venda: {
        ...venda,
        servicos: servicosResult.rows,
        produtos: produtosResult.rows,
        assinaturas: assinaturasResult.rows
      }
    });
  } catch (error) {
    console.error('Erro ao buscar venda:', error);
    res.status(500).json({ error: 'Erro ao buscar venda', details: error.message });
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

    // Verificar permissão
    if (usuarioTipo !== 'master') {
      const permissoesResult = await client.query(
        'SELECT vendas_editar FROM permissoes_usuarios WHERE usuario_id = $1',
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
      assinaturas,
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

    if ((!servicos || servicos.length === 0) && (!produtos || produtos.length === 0) && (!assinaturas || assinaturas.length === 0)) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'É necessário pelo menos um serviço, produto ou assinatura' });
    }

    // Calcular valor total INICIAL (antes de verificar abatimentos de assinatura)
    let valorTotal = 0;

    if (servicos && servicos.length > 0) {
      for (const servico of servicos) {
        if (!servico.servico_id || servico.valor === undefined) {
          await client.query('ROLLBACK');
          return res.status(400).json({ error: 'Serviços devem ter ID e valor' });
        }
        valorTotal += parseFloat(servico.valor);
      }
    }

    if (produtos && produtos.length > 0) {
      for (const produto of produtos) {
        if (!produto.produto_id || !produto.quantidade || produto.valor_unitario === undefined) {
          await client.query('ROLLBACK');
          return res.status(400).json({ error: 'Produtos devem ter ID, quantidade e valor unitário' });
        }
        const valorProduto = parseFloat(produto.quantidade) * parseFloat(produto.valor_unitario);
        valorTotal += valorProduto;
      }
    }

    if (assinaturas && assinaturas.length > 0) {
      for (const assinatura of assinaturas) {
        if (!assinatura.assinatura_id || assinatura.valor === undefined) {
          await client.query('ROLLBACK');
          return res.status(400).json({ error: 'Assinaturas devem ter ID e valor' });
        }
        valorTotal += parseFloat(assinatura.valor);
      }
    }

    // Arrays para rastrear valores que serão abatidos de assinatura (para ajustar valorTotal)
    let valorServicosAbatidos = 0;
    let valorProdutosAbatidos = 0;

    // Arrays para serviços/produtos que NÃO serão abatidos (serão inseridos na venda)
    const servicosParaVender = [];
    const produtosParaVender = [];

    // Verificar e abater serviços/produtos de assinaturas válidas ANTES de inserir na venda
    if (servicos && servicos.length > 0 && cliente_id) {
      for (const servico of servicos) {
        const servicoId = servico.servico_id;
        const valorServico = parseFloat(servico.valor);

        const abatimento = await verificarEAbaterDeAssinatura(
          client,
          cliente_id,
          servicoId,
          null,
          1,
          data_venda
        );

        if (abatimento.podeAbater) {
          valorServicosAbatidos += valorServico;
          // NÃO adiciona à lista de serviços para vender (já foi abatido da assinatura)
        } else {
          // Adiciona à lista de serviços para vender (será cobrado normalmente)
          servicosParaVender.push(servico);
        }
      }
    } else if (servicos && servicos.length > 0) {
      // Se não há cliente, todos os serviços serão cobrados
      servicosParaVender.push(...servicos);
    }

    if (produtos && produtos.length > 0 && cliente_id) {
      for (const produto of produtos) {
        const produtoId = produto.produto_id;
        const quantidadeTotal = parseFloat(produto.quantidade);
        const valorUnitario = parseFloat(produto.valor_unitario);
        let quantidadeRestante = quantidadeTotal;

        // Tentar abater toda a quantidade possível
        while (quantidadeRestante > 0) {
          const abatimento = await verificarEAbaterDeAssinatura(
            client,
            cliente_id,
            null,
            produtoId,
            quantidadeRestante,
            data_venda
          );

          if (abatimento.podeAbater) {
            const valorAbatido = abatimento.quantidadeAbatida * valorUnitario;
            valorProdutosAbatidos += valorAbatido;
            quantidadeRestante -= abatimento.quantidadeAbatida;
          } else {
            break;
          }
        }

        // Se ainda sobrar quantidade, adicionar à venda
        if (quantidadeRestante > 0) {
          // Verificar estoque
          const estoqueResult = await client.query(
            'SELECT quantidade_estoque FROM produtos WHERE id = $1',
            [produtoId]
          );

          if (estoqueResult.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ error: `Produto ${produtoId} não encontrado` });
          }

          const estoqueDisponivel = parseFloat(estoqueResult.rows[0].quantidade_estoque || 0);
          if (estoqueDisponivel < quantidadeRestante) {
            await client.query('ROLLBACK');
            return res.status(400).json({ error: `Estoque insuficiente para o produto. Disponível: ${estoqueDisponivel}, Solicitado: ${quantidadeRestante}` });
          }

          produtosParaVender.push({
            ...produto,
            quantidade: quantidadeRestante,
            valor_total: quantidadeRestante * valorUnitario
          });
        }
      }
    } else if (produtos && produtos.length > 0) {
      // Se não há cliente, verificar estoque e adicionar todos
      for (const produto of produtos) {
        const estoqueResult = await client.query(
          'SELECT quantidade_estoque FROM produtos WHERE id = $1',
          [produto.produto_id]
        );

        if (estoqueResult.rows.length === 0) {
          await client.query('ROLLBACK');
          return res.status(404).json({ error: `Produto ${produto.produto_id} não encontrado` });
        }

        const estoqueDisponivel = parseFloat(estoqueResult.rows[0].quantidade_estoque || 0);
        const quantidade = parseFloat(produto.quantidade);
        if (estoqueDisponivel < quantidade) {
          await client.query('ROLLBACK');
          return res.status(400).json({ error: `Estoque insuficiente para o produto. Disponível: ${estoqueDisponivel}, Solicitado: ${quantidade}` });
        }

        produtosParaVender.push(produto);
      }
    }

    // Ajustar valorTotal descontando serviços/produtos abatidos de assinatura
    valorTotal = valorTotal - valorServicosAbatidos - valorProdutosAbatidos;
    
    // Garantir que valorTotal não seja negativo
    if (valorTotal < 0) {
      valorTotal = 0;
    }

    // Validar e aplicar cupom se fornecido
    let cupomId = null;
    let descontoCupom = 0;
    let cupomAplicado = null;
    
    if (cupom_codigo && valorTotal > 0) {
      try {
        // Calcular valores separados para o cupom
        const valorServicosParaCupom = servicosParaVender.reduce((sum, s) => sum + parseFloat(s.valor || 0), 0);
        const valorProdutosParaCupom = produtosParaVender.reduce((sum, p) => sum + (parseFloat(p.quantidade) * parseFloat(p.valor_unitario || 0)), 0);
        const valorAssinaturasParaCupom = assinaturas ? assinaturas.reduce((sum, a) => sum + parseFloat(a.valor || 0), 0) : 0;
        
        const cupomResult = await validarEAplicarCupom(
          client,
          cupom_codigo,
          cliente_id,
          valorServicosParaCupom,
          valorProdutosParaCupom + valorAssinaturasParaCupom, // Assinaturas contam como produtos para o cupom
          valorTotal
        );
        cupomId = cupomResult.cupomId;
        descontoCupom = cupomResult.descontoCupom;
        cupomAplicado = cupomResult.cupom;
        
        // Aplicar desconto do cupom ao valor total
        valorTotal = Math.max(0, valorTotal - descontoCupom);
      } catch (error) {
        await client.query('ROLLBACK');
        return res.status(400).json({ error: error.message });
      }
    }

    // Calcular descontos
    const descontoPercentualValue = parseFloat(desconto_percentual) || 0;
    const descontoValorValue = parseFloat(desconto_valor) || 0;
    
    const descontoPorPercentual = valorTotal * (descontoPercentualValue / 100);
    let valorLiquido = valorTotal - descontoPorPercentual - descontoValorValue;

    if (valorLiquido < 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Valor líquido não pode ser negativo' });
    }

    // Se o valor líquido for zero ou muito próximo de zero (tudo coberto por assinatura),
    // ajustar para 1 centavo para permitir que a venda seja finalizada
    if (valorLiquido < 0.01) {
      valorLiquido = 0.01;
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
    const ticketResult = await client.query('SELECT gerar_proximo_ticket_venda() as ticket');
    const ticketBase = ticketResult.rows[0].ticket;

    // Inserir venda
    const vendaResult = await client.query(
      `INSERT INTO vendas 
       (ticket, funcionario_id, cliente_id, data_venda, valor_total, desconto_percentual, 
        desconto_valor, valor_liquido, forma_pagamento, numero_parcelas, caixa_id, cupom_id, observacoes, status, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
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
        'paga',
        usuarioId
      ]
    );

    const venda = vendaResult.rows[0];

    // Inserir serviços (apenas os que NÃO foram abatidos)
    if (servicosParaVender.length > 0) {
      for (const servico of servicosParaVender) {
        await client.query(
          `INSERT INTO vendas_servicos (venda_id, servico_id, agendamento_id, valor)
           VALUES ($1, $2, $3, $4)`,
          [venda.id, servico.servico_id, servico.agendamento_id || null, servico.valor]
        );
        
        // Se o serviço está vinculado a um agendamento, atualizar status para 'concluido'
        if (servico.agendamento_id) {
          await client.query(
            `UPDATE agendamentos 
             SET status = 'concluido', updated_at = CURRENT_TIMESTAMP
             WHERE id = $1`,
            [servico.agendamento_id]
          );
        }
      }
    }

    // Inserir produtos (apenas os que NÃO foram abatidos) e abater estoque
    if (produtosParaVender.length > 0) {
      for (const produto of produtosParaVender) {
        const quantidade = parseFloat(produto.quantidade);
        const valorUnitario = parseFloat(produto.valor_unitario);

        await client.query(
          `INSERT INTO vendas_produtos (venda_id, produto_id, quantidade, valor_unitario, valor_total)
           VALUES ($1, $2, $3, $4, $5)`,
          [venda.id, produto.produto_id, quantidade, valorUnitario, quantidade * valorUnitario]
        );

        // Abater estoque
        await client.query(
          `UPDATE produtos 
           SET quantidade_estoque = quantidade_estoque - $1,
               updated_at = CURRENT_TIMESTAMP
           WHERE id = $2`,
          [quantidade, produto.produto_id]
        );
      }
    }

    // Inserir assinaturas e criar registros de estoque de uso do cliente
    if (assinaturas && assinaturas.length > 0) {
      for (const assinaturaVenda of assinaturas) {
        const assinaturaId = assinaturaVenda.assinatura_id;
        const valorAssinatura = parseFloat(assinaturaVenda.valor);

        // Verificar se assinatura existe e está ativa
        const assinaturaCheck = await client.query(
          'SELECT validade_em_dias FROM assinaturas WHERE id = $1 AND is_active = true',
          [assinaturaId]
        );
        if (assinaturaCheck.rows.length === 0) {
          await client.query('ROLLBACK');
          return res.status(404).json({ error: `Assinatura ${assinaturaId} não encontrada ou inativa` });
        }
        const validadeEmDias = assinaturaCheck.rows[0].validade_em_dias || 30;

        // Inserir venda_assinatura
        await client.query(
          `INSERT INTO vendas_assinaturas (venda_id, assinatura_id, valor)
           VALUES ($1, $2, $3)`,
          [venda.id, assinaturaId, valorAssinatura]
        );

        // Buscar serviços e produtos da assinatura
        const servicosAssinaturaResult = await client.query(
          'SELECT servico_id, quantidade FROM assinaturas_servicos WHERE assinatura_id = $1',
          [assinaturaId]
        );
        const produtosAssinaturaResult = await client.query(
          'SELECT produto_id, quantidade FROM assinaturas_produtos WHERE assinatura_id = $1',
          [assinaturaId]
        );

        // Preparar JSON de quantidades restantes
        const quantidadeServicosRestantes = {};
        for (const servicoAssinatura of servicosAssinaturaResult.rows) {
          quantidadeServicosRestantes[servicoAssinatura.servico_id] = parseFloat(servicoAssinatura.quantidade);
        }

        const quantidadeProdutosRestantes = {};
        for (const produtoAssinatura of produtosAssinaturaResult.rows) {
          quantidadeProdutosRestantes[produtoAssinatura.produto_id] = parseFloat(produtoAssinatura.quantidade);
        }

        // Calcular data de expiração
        const dataAquisicao = new Date(data_venda);
        const dataExpiracao = new Date(dataAquisicao);
        dataExpiracao.setTRUNC(dataExpiracao.getTRUNC() + validadeEmDias);

        // Criar registro de assinatura_cliente
        await client.query(
          `INSERT INTO assinaturas_clientes 
           (assinatura_id, cliente_id, venda_id, quantidade_servicos_restantes, 
            quantidade_produtos_restantes, data_aquisicao, data_expiracao, status)
           VALUES ($1, $2, $3, $4, $5, $6, $7, 'ativa')`,
          [
            assinaturaId,
            cliente_id,
            venda.id,
            JSON.stringify(quantidadeServicosRestantes),
            JSON.stringify(quantidadeProdutosRestantes),
            dataAquisicao.toISOString().split('T')[0],
            dataExpiracao.toISOString().split('T')[0]
          ]
        );
      }
    }

    // Registrar uso do cupom se aplicado
    if (cupomId && descontoCupom > 0) {
      await client.query(
        `INSERT INTO cupons_usados (cupom_id, cliente_id, venda_id, valor_desconto_aplicado, created_by)
         VALUES ($1, $2, $3, $4, $5)`,
        [cupomId, cliente_id || null, venda.id, descontoCupom, usuarioId]
      );
    }

    // Criar receitas e parcelas (agora sempre cria, pois valorLiquido mínimo é 0.01)
    if (valorLiquido >= 0.01) {
      if (forma_pagamento === 'dinheiro' || forma_pagamento === 'pix' || forma_pagamento === 'ted' || forma_pagamento.startsWith('cartao_1x')) {
        // Pagamento à vista - criar receita única
        const receitaResult = await client.query(
          `INSERT INTO receitas 
           (venda_id, cliente_id, ticket_venda, valor_vencimento, valor_pago, data_emissao, data_vencimento, data_pagamento, 
            forma_pagamento, caixa_id, status, created_by)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
           RETURNING id`,
          [
            venda.id,
            cliente_id || null,
            ticketBase,
            valorLiquido,
            valorLiquido,
            data_venda,
            data_venda,
            data_venda,
            forma_pagamento,
            caixa_id,
            'paga',
            usuarioId
          ]
        );

        const receitaId = receitaResult.rows[0].id;

        // Criar movimentação de caixa automaticamente para pagamento à vista
        const movimentacaoResult = await client.query(
          `INSERT INTO movimentacoes_caixa 
           (conta_id, tipo_movimentacao, valor, descricao, data_movimentacao, referencia_id, referencia_tipo, created_by)
           VALUES ($1, 'entrada', $2, $3, $4, $5, 'receita', $6)
           RETURNING id`,
          [
            caixa_id,
            valorLiquido,
            `Receita ${ticketBase} - Venda à vista (${forma_pagamento})`,
            data_venda,
            receitaId,
            usuarioId
          ]
        );

        // Atualizar receita com o ID da movimentação
        await client.query(
          `UPDATE receitas 
           SET movimentacao_caixa_id = $1 
           WHERE id = $2`,
          [movimentacaoResult.rows[0].id, receitaId]
        );
      } else if (forma_pagamento.startsWith('cartao_') || forma_pagamento.startsWith('boleto_')) {
        // Pagamento parcelado
        const valorParcela = valorLiquido / numeroParcelas;
        let dataVencimento = primeiro_vencimento_boleto ? new Date(primeiro_vencimento_boleto) : new Date(data_venda);

        for (let i = 1; i <= numeroParcelas; i++) {
          const dataVencimentoStr = dataVencimento.toISOString().split('T')[0];
          const ticketParcela = numeroParcelas > 1 ? `${ticketBase}/${i.toString().padStart(2, '0')}` : ticketBase;
          const statusParcela = i === 1 && (forma_pagamento.startsWith('cartao_1x') || forma_pagamento === 'boleto_1x') ? 'paga' : 'pendente';
          
          const receitaParcelaResult = await client.query(
            `INSERT INTO receitas 
             (venda_id, cliente_id, ticket_venda, valor_vencimento, valor_pago, data_emissao, data_vencimento, data_pagamento, 
              forma_pagamento, caixa_id, status, created_by)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
             RETURNING id`,
            [
              venda.id,
              cliente_id || null,
              ticketParcela,
              valorParcela,
              statusParcela === 'paga' ? valorParcela : 0,
              data_venda,
              dataVencimentoStr,
              statusParcela === 'paga' ? dataVencimentoStr : null,
              forma_pagamento,
              caixa_id,
              statusParcela,
              usuarioId
            ]
          );

          const receitaParcelaId = receitaParcelaResult.rows[0].id;

          // Se a parcela está paga (primeira parcela de cartão 1x ou boleto 1x), criar movimentação de caixa
          if (statusParcela === 'paga') {
            const movimentacaoResult = await client.query(
              `INSERT INTO movimentacoes_caixa 
               (conta_id, tipo_movimentacao, valor, descricao, data_movimentacao, referencia_id, referencia_tipo, created_by)
               VALUES ($1, 'entrada', $2, $3, $4, $5, 'receita', $6)
               RETURNING id`,
              [
                caixa_id,
                valorParcela,
                `Receita ${ticketParcela} - Parcela ${i}/${numeroParcelas} (${forma_pagamento})`,
                dataVencimentoStr,
                receitaParcelaId,
                usuarioId
              ]
            );

            // Atualizar receita com o ID da movimentação
            await client.query(
              `UPDATE receitas 
               SET movimentacao_caixa_id = $1 
               WHERE id = $2`,
              [movimentacaoResult.rows[0].id, receitaParcelaId]
            );
          }

          // Incrementar data para próxima parcela (30 dias)
          dataVencimento.setMonth(dataVencimento.getMonth() + 1);
        }
      }
    }

    // Atualizar fidelidades (chamar endpoint de fidelidades)
    if (cliente_id) {
      try {
        // Chamar função de atualização de fidelidades
        const cuponsFidelidadesRoutes = require('./cupons-fidelidades');
        // A lógica de fidelidades será tratada pelo endpoint específico se necessário
      } catch (error) {
        console.error('Erro ao atualizar fidelidades:', error);
        // Não falha a venda se houver erro na atualização de fidelidades
      }
    }

    await client.query('COMMIT');

    // Buscar venda completa para retornar
    const vendaCompletaResult = await client.query(
      `SELECT 
        v.*,
        c.nome_completo as cliente_nome,
        f.nome_completo as funcionario_nome,
        ca.nome as caixa_nome
       FROM vendas v
       LEFT JOIN usuarios_clientes c ON v.cliente_id = c.id
       LEFT JOIN usuarios_administrativos f ON v.funcionario_id = f.id
       LEFT JOIN contas ca ON v.caixa_id = ca.id
       WHERE v.id = $1`,
      [venda.id]
    );

    // Buscar serviços, produtos e assinaturas
    const servicosCompletos = await client.query(
      `SELECT vs.*, s.nome as servico_nome 
       FROM vendas_servicos vs
       INNER JOIN servicos s ON vs.servico_id = s.id
       WHERE vs.venda_id = $1`,
      [venda.id]
    );

    const produtosCompletos = await client.query(
      `SELECT vp.*, p.descricao as produto_descricao, p.codigo as produto_codigo
       FROM vendas_produtos vp
       INNER JOIN produtos p ON vp.produto_id = p.id
       WHERE vp.venda_id = $1`,
      [venda.id]
    );

    const assinaturasCompletas = await client.query(
      `SELECT va.*, a.nome as assinatura_nome
       FROM vendas_assinaturas va
       INNER JOIN assinaturas a ON va.assinatura_id = a.id
       WHERE va.venda_id = $1`,
      [venda.id]
    );

    // Registrar log (não falha a venda se o log der erro)
    try {
      await registrarLog({
        usuarioId: usuarioId,
        usuarioTipo: usuarioTipo,
        acao: 'criar',
        modulo: 'vendas',
        entidadeId: venda.id,
        entidadeTipo: 'venda',
        descricao: `Venda ${ticketBase} criada`,
        dadosNovos: vendaCompletaResult.rows[0],
        ipAddress: getClientIp(req),
        userAgent: getUserAgent(req),
      });
    } catch (logError) {
      console.error('Erro ao registrar log (não crítico):', logError);
      // Não falha a venda se o log der erro
    }

    res.status(201).json({
      venda: {
        ...vendaCompletaResult.rows[0],
        servicos: servicosCompletos.rows,
        produtos: produtosCompletos.rows,
        assinaturas: assinaturasCompletas.rows
      }
    });
  } catch (error) {
    try {
      await client.query('ROLLBACK');
    } catch (rollbackError) {
      console.error('Erro ao fazer rollback:', rollbackError);
    }
    console.error('Erro ao criar venda:', error);
    console.error('Stack trace:', error.stack);
    res.status(500).json({ 
      error: 'Erro ao criar venda', 
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  } finally {
    client.release();
  }
});

/**
 * DELETE /api/v1/vendas/:id
 * Exclui uma venda
 */
router.delete('/:id', async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    const usuarioId = req.headers['x-user-id'];
    const usuarioTipo = req.headers['x-user-tipo'] || 'administrativo';

    // Verificar permissão
    if (usuarioTipo !== 'master') {
      const permissoesResult = await client.query(
        'SELECT vendas_excluir FROM permissoes_usuarios WHERE usuario_id = $1',
        [usuarioId]
      );

      if (permissoesResult.rows.length === 0 || !permissoesResult.rows[0].vendas_excluir) {
        await client.query('ROLLBACK');
        return res.status(403).json({ error: 'Acesso negado. Permissão insuficiente.' });
      }
    }

    const vendaId = req.params.id;

    // Buscar venda
    const vendaResult = await client.query(
      'SELECT * FROM vendas WHERE id = $1',
      [vendaId]
    );

    if (vendaResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Venda não encontrada' });
    }

    const venda = vendaResult.rows[0];

    // Buscar produtos da venda para reverter estoque
    const produtosVenda = await client.query(
      'SELECT produto_id, quantidade FROM vendas_produtos WHERE venda_id = $1',
      [vendaId]
    );

    // Reverter estoque
    for (const produtoVenda of produtosVenda.rows) {
      await client.query(
        `UPDATE produtos 
         SET quantidade_estoque = quantidade_estoque + $1,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $2`,
        [produtoVenda.quantidade, produtoVenda.produto_id]
      );
    }

    // Buscar receitas vinculadas para excluir movimentações de caixa
    const receitasVenda = await client.query(
      'SELECT id, movimentacao_caixa_id FROM receitas WHERE venda_id = $1',
      [vendaId]
    );

    // Excluir movimentações de caixa vinculadas às receitas
    for (const receita of receitasVenda.rows) {
      if (receita.movimentacao_caixa_id) {
        await client.query(
          'DELETE FROM movimentacoes_caixa WHERE id = $1',
          [receita.movimentacao_caixa_id]
        );
      }
    }

    // Excluir assinaturas_clientes vinculadas a esta venda
    // IMPORTANTE: Isso remove as assinaturas adquiridas pelo cliente nesta venda
    // Quando uma venda de assinatura é excluída, a assinatura do cliente também deve ser excluída
    await client.query(
      'DELETE FROM assinaturas_clientes WHERE venda_id = $1',
      [vendaId]
    );

    // Excluir cupons usados vinculados a esta venda
    await client.query(
      'DELETE FROM cupons_usados WHERE venda_id = $1',
      [vendaId]
    );

    // Excluir relacionamentos do CRM que mencionam esta venda na descrição ou observações
    // Isso garante que não haja referências à venda excluída no CRM
    if (venda.cliente_id) {
      try {
        const relacionamentosCRM = await client.query(
          `SELECT id FROM crm_relacionamentos 
           WHERE cliente_id = $1 
           AND (descricao LIKE '%' || $2 || '%' OR observacoes LIKE '%' || $2 || '%')`,
          [venda.cliente_id, venda.ticket]
        );

        // Excluir relacionamentos encontrados
        for (const relacionamento of relacionamentosCRM.rows) {
          await client.query(
            'DELETE FROM crm_relacionamentos WHERE id = $1',
            [relacionamento.id]
          );
        }
      } catch (error) {
        // Se a tabela não existir ou houver erro, apenas logar e continuar
        console.error('Erro ao excluir relacionamentos do CRM (não crítico):', error.message);
      }
    }

    // Excluir notas fiscais vinculadas (se houver)
    const notasFiscais = await client.query(
      'SELECT id FROM notas_fiscais WHERE venda_id = $1',
      [vendaId]
    );
    for (const notaFiscal of notasFiscais.rows) {
      await client.query(
        'DELETE FROM notas_fiscais WHERE id = $1',
        [notaFiscal.id]
      );
    }

    // Excluir receitas vinculadas
    await client.query(
      'DELETE FROM receitas WHERE venda_id = $1',
      [vendaId]
    );

    // Excluir vendas_assinaturas, vendas_produtos, vendas_servicos (CASCADE vai cuidar disso)
    await client.query('DELETE FROM vendas WHERE id = $1', [vendaId]);

    await client.query('COMMIT');

    // Registrar log
    await registrarLog({
      usuarioId: usuarioId,
      usuarioTipo: usuarioTipo,
      acao: 'excluir',
      modulo: 'vendas',
      entidadeId: vendaId,
      entidadeTipo: 'venda',
      descricao: `Venda ${venda.ticket} excluída`,
      dadosAnteriores: venda,
      ipAddress: getClientIp(req),
      userAgent: getUserAgent(req),
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

module.exports = router;
