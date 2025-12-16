const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { registrarLog, getClientIp, getUserAgent } = require('../utils/logger');
// Nota: Para exportação Excel/PDF, instale as dependências:
// npm install exceljs pdfkit
// const ExcelJS = require('exceljs');
// const PDFDocument = require('pdfkit');

/**
 * Middleware para verificar permissões
 */
const verificarPermissao = async (req, res, next) => {
  const usuarioId = req.headers['x-user-id'] || req.headers['X-User-Id'];
  const usuarioTipo = req.headers['x-user-tipo'] || req.headers['X-User-Tipo'] || 'administrativo';

  // Se não tem usuário identificado, negar acesso
  if (!usuarioId) {
    return res.status(401).json({ error: 'Usuário não identificado. Faça login novamente.' });
  }

  // Master sempre tem acesso
  if (usuarioTipo === 'master') {
    return next();
  }

  try {
    // Verificar permissões: emissao_relatorios_ver
    const permissoesResult = await pool.query(
      'SELECT emissao_relatorios_ver FROM protese.permissoes_usuarios WHERE usuario_id = $1',
      [usuarioId]
    );

    if (permissoesResult.rows.length === 0) {
      // Se não tem registro de permissões, negar acesso
      return res.status(403).json({ error: 'Acesso negado. Permissão insuficiente. Configure as permissões do usuário.' });
    }

    const permissoes = permissoesResult.rows[0];
    const temAcesso = permissoes.emissao_relatorios_ver === true;

    if (!temAcesso) {
      return res.status(403).json({ error: 'Acesso negado. Permissão insuficiente para acessar relatórios.' });
    }

    next();
  } catch (error) {
    console.error('Erro ao verificar permissões:', error);
    return res.status(500).json({ error: 'Erro ao verificar permissões do usuário.' });
  }
};

/**
 * GET /api/v1/relatorios/vendas-totais
 * Relatório de vendas totais por período
 */
router.get('/vendas-totais', verificarPermissao, async (req, res) => {
  try {
    const { data_inicio, data_fim } = req.query;

    if (!data_inicio || !data_fim) {
      return res.status(400).json({ error: 'Data início e data fim são obrigatórias' });
    }

    const result = await pool.query(
      `SELECT 
        COUNT(*) as total_vendas,
        COALESCE(SUM(valor_liquido), 0)::numeric as valor_total,
        COALESCE(SUM(valor_total), 0)::numeric as valor_bruto_total,
        COALESCE(SUM(desconto_valor), 0)::numeric as total_descontos,
        COALESCE(AVG(valor_liquido), 0)::numeric as ticket_medio
      FROM protese.vendas
      WHERE data_venda >= $1 AND data_venda <= $2
        AND status != 'cancelada'`,
      [data_inicio, data_fim]
    );

    // Detalhamento por dia
    const detalhamento = await pool.query(
      `SELECT 
        data_venda,
        COUNT(*) as quantidade_vendas,
        COALESCE(SUM(valor_liquido), 0)::numeric as valor_total
      FROM protese.vendas
      WHERE data_venda >= $1 AND data_venda <= $2
        AND status != 'cancelada'
      GROUP BY data_venda
      ORDER BY data_venda ASC`,
      [data_inicio, data_fim]
    );

    res.json({
      periodo: { inicio: data_inicio, fim: data_fim },
      resumo: result.rows[0],
      detalhamento: detalhamento.rows
    });
  } catch (error) {
    console.error('Erro ao gerar relatório de vendas totais:', error);
    res.status(500).json({ error: 'Erro ao gerar relatório', details: error.message });
  }
});

/**
 * GET /api/v1/relatorios/vendas-por-servico
 * Relatório de vendas por serviço
 */
router.get('/vendas-por-servico', verificarPermissao, async (req, res) => {
  try {
    const { data_inicio, data_fim } = req.query;

    if (!data_inicio || !data_fim) {
      return res.status(400).json({ error: 'Data início e data fim são obrigatórias' });
    }

    const result = await pool.query(
      `SELECT 
        s.id,
        s.nome as servico_nome,
        s.descricao as servico_descricao,
        COUNT(DISTINCT v.id) as quantidade_vendas,
        COUNT(vs.id) as quantidade_itens,
        COALESCE(SUM(vs.valor), 0)::numeric as valor_total
      FROM protese.vendas_servicos vs
      INNER JOIN protese.vendas v ON vs.venda_id = v.id
      INNER JOIN protese.servicos s ON vs.servico_id = s.id
      WHERE v.data_venda >= $1 AND v.data_venda <= $2
        AND v.status != 'cancelada'
      GROUP BY s.id, s.nome, s.descricao
      ORDER BY valor_total DESC`,
      [data_inicio, data_fim]
    );

    res.json({
      periodo: { inicio: data_inicio, fim: data_fim },
      dados: result.rows
    });
  } catch (error) {
    console.error('Erro ao gerar relatório de vendas por serviço:', error);
    res.status(500).json({ error: 'Erro ao gerar relatório', details: error.message });
  }
});

/**
 * GET /api/v1/relatorios/vendas-por-produto
 * Relatório de vendas por produto
 */
router.get('/vendas-por-produto', verificarPermissao, async (req, res) => {
  try {
    const { data_inicio, data_fim } = req.query;

    if (!data_inicio || !data_fim) {
      return res.status(400).json({ error: 'Data início e data fim são obrigatórias' });
    }

    const result = await pool.query(
      `SELECT 
        p.id,
        p.codigo,
        p.descricao as produto_descricao,
        COUNT(DISTINCT v.id) as quantidade_vendas,
        COALESCE(SUM(vp.quantidade), 0) as quantidade_total_vendida,
        COALESCE(SUM(vp.valor_total), 0)::numeric as valor_total
      FROM protese.vendas_produtos vp
      INNER JOIN protese.vendas v ON vp.venda_id = v.id
      INNER JOIN protese.produtos p ON vp.produto_id = p.id
      WHERE v.data_venda >= $1 AND v.data_venda <= $2
        AND v.status != 'cancelada'
      GROUP BY p.id, p.codigo, p.descricao
      ORDER BY valor_total DESC`,
      [data_inicio, data_fim]
    );

    res.json({
      periodo: { inicio: data_inicio, fim: data_fim },
      dados: result.rows
    });
  } catch (error) {
    console.error('Erro ao gerar relatório de vendas por produto:', error);
    res.status(500).json({ error: 'Erro ao gerar relatório', details: error.message });
  }
});

/**
 * GET /api/v1/relatorios/vendas-por-funcionario-totais
 * Relatório de vendas totais por funcionário
 */
router.get('/vendas-por-funcionario-totais', verificarPermissao, async (req, res) => {
  try {
    const { data_inicio, data_fim, funcionario_id } = req.query;

    if (!data_inicio || !data_fim) {
      return res.status(400).json({ error: 'Data início e data fim são obrigatórias' });
    }

    let query = `
      SELECT 
        f.id,
        f.nome_completo as funcionario_nome,
        COUNT(DISTINCT v.id) as quantidade_vendas,
        COALESCE(SUM(v.valor_liquido), 0)::numeric as valor_total,
        COALESCE(AVG(v.valor_liquido), 0)::numeric as ticket_medio
      FROM protese.vendas v
      INNER JOIN protese.usuarios_administrativos f ON v.funcionario_id = f.id
      WHERE v.data_venda >= $1 AND v.data_venda <= $2
        AND v.status != 'cancelada'
    `;

    const params = [data_inicio, data_fim];

    if (funcionario_id) {
      query += ' AND f.id = $3';
      params.push(funcionario_id);
    }

    query += `
      GROUP BY f.id, f.nome_completo
      ORDER BY valor_total DESC
    `;

    const result = await pool.query(query, params);

    res.json({
      periodo: { inicio: data_inicio, fim: data_fim },
      funcionario_id: funcionario_id || null,
      dados: result.rows
    });
  } catch (error) {
    console.error('Erro ao gerar relatório de vendas por funcionário:', error);
    res.status(500).json({ error: 'Erro ao gerar relatório', details: error.message });
  }
});

/**
 * GET /api/v1/relatorios/vendas-por-funcionario-separado
 * Relatório de vendas por funcionário com serviços e produtos separados
 */
router.get('/vendas-por-funcionario-separado', verificarPermissao, async (req, res) => {
  try {
    const { data_inicio, data_fim, funcionario_id } = req.query;

    if (!data_inicio || !data_fim) {
      return res.status(400).json({ error: 'Data início e data fim são obrigatórias' });
    }

    let query = `
      SELECT 
        f.id as funcionario_id,
        f.nome_completo as funcionario_nome,
        'servico' as tipo,
        COUNT(DISTINCT v.id) as quantidade_vendas,
        COUNT(vs.id) as quantidade_itens,
        COALESCE(SUM(vs.valor), 0)::numeric as valor_total
      FROM protese.vendas v
      INNER JOIN protese.usuarios_administrativos f ON v.funcionario_id = f.id
      INNER JOIN protese.vendas_servicos vs ON v.id = vs.venda_id
      WHERE v.data_venda >= $1 AND v.data_venda <= $2
        AND v.status != 'cancelada'
    `;

    const params = [data_inicio, data_fim];

    if (funcionario_id) {
      query += ' AND f.id = $3';
      params.push(funcionario_id);
    }

    query += `
      GROUP BY f.id, f.nome_completo
      
      UNION ALL
      
      SELECT 
        f.id as funcionario_id,
        f.nome_completo as funcionario_nome,
        'produto' as tipo,
        COUNT(DISTINCT v.id) as quantidade_vendas,
        COALESCE(SUM(vp.quantidade), 0) as quantidade_itens,
        COALESCE(SUM(vp.valor_total), 0)::numeric as valor_total
      FROM protese.vendas v
      INNER JOIN protese.usuarios_administrativos f ON v.funcionario_id = f.id
      INNER JOIN protese.vendas_produtos vp ON v.id = vp.venda_id
      WHERE v.data_venda >= $1 AND v.data_venda <= $2
        AND v.status != 'cancelada'
    `;

    if (funcionario_id) {
      query += ' AND f.id = $3';
    }

    query += `
      GROUP BY f.id, f.nome_completo
      ORDER BY funcionario_nome, tipo
    `;

    const result = await pool.query(query, params);

    res.json({
      periodo: { inicio: data_inicio, fim: data_fim },
      funcionario_id: funcionario_id || null,
      dados: result.rows
    });
  } catch (error) {
    console.error('Erro ao gerar relatório de vendas por funcionário separado:', error);
    res.status(500).json({ error: 'Erro ao gerar relatório', details: error.message });
  }
});

/**
 * GET /api/v1/relatorios/vendas-por-funcionario-tipo
 * Relatório de vendas por funcionário e tipo (serviço ou produto)
 */
router.get('/vendas-por-funcionario-tipo', verificarPermissao, async (req, res) => {
  try {
    const { data_inicio, data_fim, funcionario_id, tipo } = req.query;

    if (!data_inicio || !data_fim) {
      return res.status(400).json({ error: 'Data início e data fim são obrigatórias' });
    }

    let queryServicos = '';
    let queryProdutos = '';
    const params = [data_inicio, data_fim];
    let paramCount = 3;

    // Query de serviços
    if (tipo === 'servico' || !tipo || tipo === 'todos') {
      queryServicos = `
        SELECT 
          f.id as funcionario_id,
          f.nome_completo as funcionario_nome,
          s.id as item_id,
          s.nome as item_nome,
          'servico' as tipo_item,
          COUNT(DISTINCT v.id) as quantidade_vendas,
          COUNT(vs.id) as quantidade_itens,
          COALESCE(SUM(vs.valor), 0)::numeric as valor_total
        FROM protese.vendas v
        INNER JOIN protese.usuarios_administrativos f ON v.funcionario_id = f.id
        INNER JOIN protese.vendas_servicos vs ON v.id = vs.venda_id
        INNER JOIN protese.servicos s ON vs.servico_id = s.id
        WHERE v.data_venda >= $1 AND v.data_venda <= $2
          AND v.status != 'cancelada'
      `;

      if (funcionario_id) {
        queryServicos += ` AND f.id = $${paramCount}`;
        params.push(funcionario_id);
        paramCount++;
      }

      queryServicos += `
        GROUP BY f.id, f.nome_completo, s.id, s.nome
      `;
    }

    // Query de produtos
    if (tipo === 'produto' || !tipo || tipo === 'todos') {
      queryProdutos = `
        SELECT 
          f.id as funcionario_id,
          f.nome_completo as funcionario_nome,
          p.id as item_id,
          p.descricao as item_nome,
          'produto' as tipo_item,
          COUNT(DISTINCT v.id) as quantidade_vendas,
          COALESCE(SUM(vp.quantidade), 0) as quantidade_itens,
          COALESCE(SUM(vp.valor_total), 0)::numeric as valor_total
        FROM protese.vendas v
        INNER JOIN protese.usuarios_administrativos f ON v.funcionario_id = f.id
        INNER JOIN protese.vendas_produtos vp ON v.id = vp.venda_id
        INNER JOIN protese.produtos p ON vp.produto_id = p.id
        WHERE v.data_venda >= $1 AND v.data_venda <= $2
          AND v.status != 'cancelada'
      `;

      if (funcionario_id) {
        queryProdutos += ` AND f.id = $${paramCount}`;
        if (!params.includes(funcionario_id)) {
          params.push(funcionario_id);
        }
      }

      queryProdutos += `
        GROUP BY f.id, f.nome_completo, p.id, p.descricao
      `;
    }

    // Combinar queries
    let query = '';
    if (queryServicos && queryProdutos) {
      query = `${queryServicos} UNION ALL ${queryProdutos} ORDER BY funcionario_nome, tipo_item, valor_total DESC`;
    } else if (queryServicos) {
      query = `${queryServicos} ORDER BY funcionario_nome, tipo_item, valor_total DESC`;
    } else if (queryProdutos) {
      query = `${queryProdutos} ORDER BY funcionario_nome, tipo_item, valor_total DESC`;
    } else {
      return res.json({
        periodo: { inicio: data_inicio, fim: data_fim },
        funcionario_id: funcionario_id || null,
        tipo: tipo || 'todos',
        dados: []
      });
    }

    const result = await pool.query(query, params);

    res.json({
      periodo: { inicio: data_inicio, fim: data_fim },
      funcionario_id: funcionario_id || null,
      tipo: tipo || 'todos',
      dados: result.rows
    });
  } catch (error) {
    console.error('Erro ao gerar relatório de vendas por funcionário/tipo:', error);
    res.status(500).json({ error: 'Erro ao gerar relatório', details: error.message });
  }
});

/**
 * GET /api/v1/relatorios/despesas-totais
 * Relatório de despesas totais por período
 */
router.get('/despesas-totais', verificarPermissao, async (req, res) => {
  try {
    const { data_inicio, data_fim } = req.query;

    if (!data_inicio || !data_fim) {
      return res.status(400).json({ error: 'Data início e data fim são obrigatórias' });
    }

    const result = await pool.query(
      `SELECT 
        COUNT(*) as total_despesas,
        COALESCE(SUM(valor_liquido), 0)::numeric as valor_total,
        COALESCE(SUM(valor_bruto), 0)::numeric as valor_bruto_total,
        COALESCE(SUM(CASE WHEN status = 'paga' THEN valor_liquido ELSE 0 END), 0)::numeric as valor_pago,
        COALESCE(SUM(CASE WHEN status = 'pendente' THEN valor_liquido ELSE 0 END), 0)::numeric as valor_pendente
      FROM protese.despesas
      WHERE data_emissao >= $1 AND data_emissao <= $2
        AND status != 'cancelada'`,
      [data_inicio, data_fim]
    );

    // Detalhamento por dia
    const detalhamento = await pool.query(
      `SELECT 
        data_emissao,
        COUNT(*) as quantidade_despesas,
        COALESCE(SUM(valor_liquido), 0)::numeric as valor_total
      FROM protese.despesas
      WHERE data_emissao >= $1 AND data_emissao <= $2
        AND status != 'cancelada'
      GROUP BY data_emissao
      ORDER BY data_emissao ASC`,
      [data_inicio, data_fim]
    );

    res.json({
      periodo: { inicio: data_inicio, fim: data_fim },
      resumo: result.rows[0],
      detalhamento: detalhamento.rows
    });
  } catch (error) {
    console.error('Erro ao gerar relatório de despesas totais:', error);
    res.status(500).json({ error: 'Erro ao gerar relatório', details: error.message });
  }
});

/**
 * GET /api/v1/relatorios/despesas-por-tipo
 * Relatório de despesas por categoria/tipo
 */
router.get('/despesas-por-tipo', verificarPermissao, async (req, res) => {
  try {
    const { data_inicio, data_fim, categoria_id } = req.query;

    if (!data_inicio || !data_fim) {
      return res.status(400).json({ error: 'Data início e data fim são obrigatórias' });
    }

    let query = `
      SELECT 
        c.id as categoria_id,
        c.nome as categoria_nome,
        c.codigo as categoria_codigo,
        COUNT(d.id) as quantidade_despesas,
        COALESCE(SUM(d.valor_liquido), 0)::numeric as valor_total,
        COALESCE(SUM(CASE WHEN d.status = 'paga' THEN d.valor_liquido ELSE 0 END), 0)::numeric as valor_pago,
        COALESCE(SUM(CASE WHEN d.status = 'pendente' THEN d.valor_liquido ELSE 0 END), 0)::numeric as valor_pendente
      FROM protese.despesas d
      LEFT JOIN protese.categorias_custo c ON d.categoria_custo_id = c.id
      WHERE d.data_emissao >= $1 AND d.data_emissao <= $2
        AND d.status != 'cancelada'
    `;

    const params = [data_inicio, data_fim];

    if (categoria_id) {
      query += ' AND c.id = $3';
      params.push(categoria_id);
    }

    query += `
      GROUP BY c.id, c.nome, c.codigo
      ORDER BY valor_total DESC
    `;

    const result = await pool.query(query, params);

    res.json({
      periodo: { inicio: data_inicio, fim: data_fim },
      categoria_id: categoria_id || null,
      dados: result.rows
    });
  } catch (error) {
    console.error('Erro ao gerar relatório de despesas por tipo:', error);
    res.status(500).json({ error: 'Erro ao gerar relatório', details: error.message });
  }
});

/**
 * GET /api/v1/relatorios/produtos-estoque
 * Relatório de produtos em estoque
 */
router.get('/produtos-estoque', verificarPermissao, async (req, res) => {
  try {
    // Buscar TODOS os produtos cadastrados (ativos e inativos)
    const result = await pool.query(
      `SELECT 
        p.id,
        p.codigo,
        p.descricao,
        p.fornecedor,
        p.preco_venda,
        p.ultimo_preco_custo,
        COALESCE(p.quantidade_estoque, 0) as quantidade_estoque,
        COALESCE(p.quantidade_estoque * p.preco_venda, 0)::numeric as valor_total_estoque,
        p.is_active
      FROM protese.produtos p
      ORDER BY p.descricao ASC`
    );

    // Resumo incluindo TODOS os produtos (ativos e inativos)
    const resumo = await pool.query(
      `SELECT 
        COUNT(*) as total_produtos,
        COUNT(CASE WHEN COALESCE(quantidade_estoque, 0) > 0 THEN 1 END) as produtos_com_estoque,
        COUNT(CASE WHEN COALESCE(quantidade_estoque, 0) = 0 THEN 1 END) as produtos_sem_estoque,
        COUNT(CASE WHEN is_active = true THEN 1 END) as produtos_ativos,
        COUNT(CASE WHEN is_active = false THEN 1 END) as produtos_inativos,
        COALESCE(SUM(quantidade_estoque), 0) as quantidade_total,
        COALESCE(SUM(quantidade_estoque * preco_venda), 0)::numeric as valor_total_estoque
      FROM protese.produtos`
    );

    res.json({
      resumo: resumo.rows[0],
      produtos: result.rows
    });
  } catch (error) {
    console.error('Erro ao gerar relatório de produtos em estoque:', error);
    res.status(500).json({ error: 'Erro ao gerar relatório', details: error.message });
  }
});

/**
 * GET /api/v1/relatorios/produtos-vendidos
 * Relatório de produtos vendidos por período
 */
router.get('/produtos-vendidos', verificarPermissao, async (req, res) => {
  try {
    const { data_inicio, data_fim } = req.query;

    if (!data_inicio || !data_fim) {
      return res.status(400).json({ error: 'Data início e data fim são obrigatórias' });
    }

    const result = await pool.query(
      `SELECT 
        p.id,
        p.codigo,
        p.descricao as produto_descricao,
        COUNT(DISTINCT v.id) as quantidade_vendas,
        COALESCE(SUM(vp.quantidade), 0) as quantidade_total_vendida,
        COALESCE(SUM(vp.valor_total), 0)::numeric as valor_total,
        COALESCE(AVG(vp.valor_unitario), 0)::numeric as preco_medio
      FROM protese.vendas_produtos vp
      INNER JOIN protese.vendas v ON vp.venda_id = v.id
      INNER JOIN protese.produtos p ON vp.produto_id = p.id
      WHERE v.data_venda >= $1 AND v.data_venda <= $2
        AND v.status != 'cancelada'
      GROUP BY p.id, p.codigo, p.descricao
      ORDER BY quantidade_total_vendida DESC`,
      [data_inicio, data_fim]
    );

    res.json({
      periodo: { inicio: data_inicio, fim: data_fim },
      dados: result.rows
    });
  } catch (error) {
    console.error('Erro ao gerar relatório de produtos vendidos:', error);
    res.status(500).json({ error: 'Erro ao gerar relatório', details: error.message });
  }
});

/**
 * GET /api/v1/relatorios/clientes-compras
 * Relatório de histórico de compras/serviços por cliente
 */
router.get('/clientes-compras', verificarPermissao, async (req, res) => {
  try {
    const { data_inicio, data_fim } = req.query;

    if (!data_inicio || !data_fim) {
      return res.status(400).json({ error: 'Data início e data fim são obrigatórias' });
    }

    const result = await pool.query(
      `SELECT 
        c.id as cliente_id,
        c.nome_completo as cliente_nome,
        c.email as cliente_email,
        c.cpf as cliente_cpf,
        COUNT(DISTINCT v.id) as quantidade_compras,
        COALESCE(SUM(v.valor_liquido), 0)::numeric as valor_total_gasto,
        COALESCE(SUM(CASE WHEN vs.id IS NOT NULL THEN 1 ELSE 0 END), 0) as quantidade_servicos,
        COALESCE(SUM(CASE WHEN vp.id IS NOT NULL THEN 1 ELSE 0 END), 0) as quantidade_produtos,
        COALESCE(SUM(vs.valor), 0)::numeric as valor_servicos,
        COALESCE(SUM(vp.valor_total), 0)::numeric as valor_produtos
      FROM protese.usuarios_clientes c
      INNER JOIN protese.vendas v ON v.cliente_id = c.id
      LEFT JOIN protese.vendas_servicos vs ON v.id = vs.venda_id
      LEFT JOIN protese.vendas_produtos vp ON v.id = vp.venda_id
      WHERE v.data_venda >= $1 AND v.data_venda <= $2
        AND v.status != 'cancelada'
      GROUP BY c.id, c.nome_completo, c.email, c.cpf
      ORDER BY valor_total_gasto DESC`,
      [data_inicio, data_fim]
    );

    res.json({
      periodo: { inicio: data_inicio, fim: data_fim },
      dados: result.rows
    });
  } catch (error) {
    console.error('Erro ao gerar relatório de clientes:', error);
    res.status(500).json({ error: 'Erro ao gerar relatório', details: error.message });
  }
});

// Função auxiliar para buscar dados do relatório (reutiliza lógica dos endpoints)
// Deve ser definida antes de ser usada
const buscarDadosRelatorioInterno = async (tipo, queryParams) => {
  const { data_inicio, data_fim, funcionario_id, tipo: tipoItem, categoria_id } = queryParams;

  try {
    switch(tipo) {
      case 'vendas-totais': {
        const result = await pool.query(
          `SELECT 
            COUNT(*) as total_vendas,
            COALESCE(SUM(valor_liquido), 0)::numeric as valor_total,
            COALESCE(SUM(valor_total), 0)::numeric as valor_bruto_total,
            COALESCE(SUM(desconto_valor), 0)::numeric as total_descontos,
            COALESCE(AVG(valor_liquido), 0)::numeric as ticket_medio
          FROM protese.vendas
          WHERE data_venda >= $1 AND data_venda <= $2
            AND status != 'cancelada'`,
          [data_inicio, data_fim]
        );
        const detalhamento = await pool.query(
          `SELECT 
            data_venda,
            COUNT(*) as quantidade_vendas,
            COALESCE(SUM(valor_liquido), 0)::numeric as valor_total
          FROM protese.vendas
          WHERE data_venda >= $1 AND data_venda <= $2
            AND status != 'cancelada'
          GROUP BY data_venda
          ORDER BY data_venda ASC`,
          [data_inicio, data_fim]
        );
        return { resumo: result.rows[0], detalhamento: detalhamento.rows };
      }
      
      case 'vendas-por-servico': {
        const result = await pool.query(
          `SELECT 
            s.id, s.nome as servico_nome, s.descricao as servico_descricao,
            COUNT(DISTINCT v.id) as quantidade_vendas,
            COUNT(vs.id) as quantidade_itens,
            COALESCE(SUM(vs.valor), 0)::numeric as valor_total
          FROM protese.vendas_servicos vs
          INNER JOIN protese.vendas v ON vs.venda_id = v.id
          INNER JOIN protese.servicos s ON vs.servico_id = s.id
          WHERE v.data_venda >= $1 AND v.data_venda <= $2
            AND v.status != 'cancelada'
          GROUP BY s.id, s.nome, s.descricao
          ORDER BY valor_total DESC`,
          [data_inicio, data_fim]
        );
        return { dados: result.rows };
      }
      
      case 'vendas-por-produto': {
        const result = await pool.query(
          `SELECT 
            p.id, p.codigo, p.descricao as produto_descricao,
            COUNT(DISTINCT v.id) as quantidade_vendas,
            COALESCE(SUM(vp.quantidade), 0) as quantidade_total_vendida,
            COALESCE(SUM(vp.valor_total), 0)::numeric as valor_total
          FROM protese.vendas_produtos vp
          INNER JOIN protese.vendas v ON vp.venda_id = v.id
          INNER JOIN protese.produtos p ON vp.produto_id = p.id
          WHERE v.data_venda >= $1 AND v.data_venda <= $2
            AND v.status != 'cancelada'
          GROUP BY p.id, p.codigo, p.descricao
          ORDER BY valor_total DESC`,
          [data_inicio, data_fim]
        );
        return { dados: result.rows };
      }
      
      case 'despesas-totais': {
        const result = await pool.query(
          `SELECT 
            COUNT(*) as total_despesas,
            COALESCE(SUM(valor_liquido), 0)::numeric as valor_total,
            COALESCE(SUM(valor_bruto), 0)::numeric as valor_bruto_total,
            COALESCE(SUM(CASE WHEN status = 'paga' THEN valor_liquido ELSE 0 END), 0)::numeric as valor_pago,
            COALESCE(SUM(CASE WHEN status = 'pendente' THEN valor_liquido ELSE 0 END), 0)::numeric as valor_pendente
          FROM protese.despesas
          WHERE data_emissao >= $1 AND data_emissao <= $2
            AND status != 'cancelada'`,
          [data_inicio, data_fim]
        );
        const detalhamento = await pool.query(
          `SELECT 
            data_emissao,
            COUNT(*) as quantidade_despesas,
            COALESCE(SUM(valor_liquido), 0)::numeric as valor_total
          FROM protese.despesas
          WHERE data_emissao >= $1 AND data_emissao <= $2
            AND status != 'cancelada'
          GROUP BY data_emissao
          ORDER BY data_emissao ASC`,
          [data_inicio, data_fim]
        );
        return { resumo: result.rows[0], detalhamento: detalhamento.rows };
      }
      
      case 'vendas-por-funcionario-totais': {
        let query = `
          SELECT 
            f.id, f.nome_completo as funcionario_nome,
            COUNT(DISTINCT v.id) as quantidade_vendas,
            COALESCE(SUM(v.valor_liquido), 0)::numeric as valor_total,
            COALESCE(AVG(v.valor_liquido), 0)::numeric as ticket_medio
          FROM protese.vendas v
          INNER JOIN protese.usuarios_administrativos f ON v.funcionario_id = f.id
          WHERE v.data_venda >= $1 AND v.data_venda <= $2
            AND v.status != 'cancelada'
        `;
        const params = [data_inicio, data_fim];
        if (funcionario_id) {
          query += ' AND f.id = $3';
          params.push(funcionario_id);
        }
        query += ` GROUP BY f.id, f.nome_completo ORDER BY valor_total DESC`;
        const result = await pool.query(query, params);
        return { dados: result.rows };
      }
      
      case 'vendas-por-funcionario-separado': {
        let queryServicos = `
          SELECT 
            f.id as funcionario_id, f.nome_completo as funcionario_nome,
            'servico' as tipo,
            COUNT(DISTINCT v.id) as quantidade_vendas,
            COUNT(vs.id) as quantidade_itens,
            COALESCE(SUM(vs.valor), 0)::numeric as valor_total
          FROM protese.vendas v
          INNER JOIN protese.usuarios_administrativos f ON v.funcionario_id = f.id
          INNER JOIN protese.vendas_servicos vs ON v.id = vs.venda_id
          WHERE v.data_venda >= $1 AND v.data_venda <= $2
            AND v.status != 'cancelada'
        `;
        const params = [data_inicio, data_fim];
        if (funcionario_id) {
          queryServicos += ' AND f.id = $3';
          params.push(funcionario_id);
        }
        queryServicos += ` GROUP BY f.id, f.nome_completo`;
        
        let queryProdutos = `
          SELECT 
            f.id as funcionario_id, f.nome_completo as funcionario_nome,
            'produto' as tipo,
            COUNT(DISTINCT v.id) as quantidade_vendas,
            COALESCE(SUM(vp.quantidade), 0) as quantidade_itens,
            COALESCE(SUM(vp.valor_total), 0)::numeric as valor_total
          FROM protese.vendas v
          INNER JOIN protese.usuarios_administrativos f ON v.funcionario_id = f.id
          INNER JOIN protese.vendas_produtos vp ON v.id = vp.venda_id
          WHERE v.data_venda >= $1 AND v.data_venda <= $2
            AND v.status != 'cancelada'
        `;
        if (funcionario_id) {
          queryProdutos += ' AND f.id = $3';
        }
        queryProdutos += ` GROUP BY f.id, f.nome_completo`;
        
        const query = `${queryServicos} UNION ALL ${queryProdutos} ORDER BY funcionario_nome, tipo`;
        const result = await pool.query(query, params);
        return { dados: result.rows };
      }
      
      case 'vendas-por-funcionario-tipo': {
        // Similar ao endpoint, mas simplificado para exportação
        let queryServicos = '';
        let queryProdutos = '';
        const params = [data_inicio, data_fim];
        let paramCount = 3;

        if (tipoItem === 'servico' || !tipoItem || tipoItem === 'todos') {
          queryServicos = `
            SELECT 
              f.id as funcionario_id, f.nome_completo as funcionario_nome,
              s.id as item_id, s.nome as item_nome, 'servico' as tipo_item,
              COUNT(DISTINCT v.id) as quantidade_vendas,
              COUNT(vs.id) as quantidade_itens,
              COALESCE(SUM(vs.valor), 0)::numeric as valor_total
            FROM protese.vendas v
            INNER JOIN protese.usuarios_administrativos f ON v.funcionario_id = f.id
            INNER JOIN protese.vendas_servicos vs ON v.id = vs.venda_id
            INNER JOIN protese.servicos s ON vs.servico_id = s.id
            WHERE v.data_venda >= $1 AND v.data_venda <= $2
              AND v.status != 'cancelada'
          `;
          if (funcionario_id) {
            queryServicos += ` AND f.id = $${paramCount}`;
            params.push(funcionario_id);
            paramCount++;
          }
          queryServicos += ` GROUP BY f.id, f.nome_completo, s.id, s.nome`;
        }

        if (tipoItem === 'produto' || !tipoItem || tipoItem === 'todos') {
          queryProdutos = `
            SELECT 
              f.id as funcionario_id, f.nome_completo as funcionario_nome,
              p.id as item_id, p.descricao as item_nome, 'produto' as tipo_item,
              COUNT(DISTINCT v.id) as quantidade_vendas,
              COALESCE(SUM(vp.quantidade), 0) as quantidade_itens,
              COALESCE(SUM(vp.valor_total), 0)::numeric as valor_total
            FROM protese.vendas v
            INNER JOIN protese.usuarios_administrativos f ON v.funcionario_id = f.id
            INNER JOIN protese.vendas_produtos vp ON v.id = vp.venda_id
            INNER JOIN protese.produtos p ON vp.produto_id = p.id
            WHERE v.data_venda >= $1 AND v.data_venda <= $2
              AND v.status != 'cancelada'
          `;
          if (funcionario_id) {
            queryProdutos += ` AND f.id = $${paramCount}`;
            if (!params.includes(funcionario_id)) {
              params.push(funcionario_id);
            }
          }
          queryProdutos += ` GROUP BY f.id, f.nome_completo, p.id, p.descricao`;
        }

        let query = '';
        if (queryServicos && queryProdutos) {
          query = `${queryServicos} UNION ALL ${queryProdutos} ORDER BY funcionario_nome, tipo_item, valor_total DESC`;
        } else if (queryServicos) {
          query = `${queryServicos} ORDER BY funcionario_nome, tipo_item, valor_total DESC`;
        } else if (queryProdutos) {
          query = `${queryProdutos} ORDER BY funcionario_nome, tipo_item, valor_total DESC`;
        } else {
          return { dados: [] };
        }
        const result = await pool.query(query, params);
        return { dados: result.rows };
      }
      
      case 'despesas-por-tipo': {
        let query = `
          SELECT 
            c.id as categoria_id, c.nome as categoria_nome, c.codigo as categoria_codigo,
            COUNT(d.id) as quantidade_despesas,
            COALESCE(SUM(d.valor_liquido), 0)::numeric as valor_total,
            COALESCE(SUM(CASE WHEN d.status = 'paga' THEN d.valor_liquido ELSE 0 END), 0)::numeric as valor_pago,
            COALESCE(SUM(CASE WHEN d.status = 'pendente' THEN d.valor_liquido ELSE 0 END), 0)::numeric as valor_pendente
          FROM protese.despesas d
          LEFT JOIN protese.categorias_custo c ON d.categoria_custo_id = c.id
          WHERE d.data_emissao >= $1 AND d.data_emissao <= $2
            AND d.status != 'cancelada'
        `;
        const params = [data_inicio, data_fim];
        if (categoria_id) {
          query += ' AND c.id = $3';
          params.push(categoria_id);
        }
        query += ` GROUP BY c.id, c.nome, c.codigo ORDER BY valor_total DESC`;
        const result = await pool.query(query, params);
        return { dados: result.rows };
      }
      
      case 'produtos-estoque': {
        // Buscar TODOS os produtos cadastrados (ativos e inativos)
        const result = await pool.query(
          `SELECT 
            p.id, p.codigo, p.descricao, p.fornecedor,
            p.preco_venda, p.ultimo_preco_custo, 
            COALESCE(p.quantidade_estoque, 0) as quantidade_estoque,
            COALESCE(p.quantidade_estoque * p.preco_venda, 0)::numeric as valor_total_estoque,
            p.is_active
          FROM protese.produtos p
          ORDER BY p.descricao ASC`
        );
        // Resumo incluindo TODOS os produtos (ativos e inativos)
        const resumo = await pool.query(
          `SELECT 
            COUNT(*) as total_produtos,
            COUNT(CASE WHEN COALESCE(quantidade_estoque, 0) > 0 THEN 1 END) as produtos_com_estoque,
            COUNT(CASE WHEN COALESCE(quantidade_estoque, 0) = 0 THEN 1 END) as produtos_sem_estoque,
            COUNT(CASE WHEN is_active = true THEN 1 END) as produtos_ativos,
            COUNT(CASE WHEN is_active = false THEN 1 END) as produtos_inativos,
            COALESCE(SUM(quantidade_estoque), 0) as quantidade_total,
            COALESCE(SUM(quantidade_estoque * preco_venda), 0)::numeric as valor_total_estoque
          FROM protese.produtos`
        );
        return { resumo: resumo.rows[0], produtos: result.rows };
      }
      
      case 'produtos-vendidos': {
        const result = await pool.query(
          `SELECT 
            p.id, p.codigo, p.descricao as produto_descricao,
            COUNT(DISTINCT v.id) as quantidade_vendas,
            COALESCE(SUM(vp.quantidade), 0) as quantidade_total_vendida,
            COALESCE(SUM(vp.valor_total), 0)::numeric as valor_total,
            COALESCE(AVG(vp.valor_unitario), 0)::numeric as preco_medio
          FROM protese.vendas_produtos vp
          INNER JOIN protese.vendas v ON vp.venda_id = v.id
          INNER JOIN protese.produtos p ON vp.produto_id = p.id
          WHERE v.data_venda >= $1 AND v.data_venda <= $2
            AND v.status != 'cancelada'
          GROUP BY p.id, p.codigo, p.descricao
          ORDER BY quantidade_total_vendida DESC`,
          [data_inicio, data_fim]
        );
        return { dados: result.rows };
      }
      
      case 'clientes-compras': {
        const result = await pool.query(
          `SELECT 
            c.id as cliente_id, c.nome_completo as cliente_nome,
            c.email as cliente_email, c.cpf as cliente_cpf,
            COUNT(DISTINCT v.id) as quantidade_compras,
            COALESCE(SUM(v.valor_liquido), 0)::numeric as valor_total_gasto,
            COALESCE(SUM(CASE WHEN vs.id IS NOT NULL THEN 1 ELSE 0 END), 0) as quantidade_servicos,
            COALESCE(SUM(CASE WHEN vp.id IS NOT NULL THEN 1 ELSE 0 END), 0) as quantidade_produtos,
            COALESCE(SUM(vs.valor), 0)::numeric as valor_servicos,
            COALESCE(SUM(vp.valor_total), 0)::numeric as valor_produtos
          FROM protese.usuarios_clientes c
          INNER JOIN protese.vendas v ON v.cliente_id = c.id
          LEFT JOIN protese.vendas_servicos vs ON v.id = vs.venda_id
          LEFT JOIN protese.vendas_produtos vp ON v.id = vp.venda_id
          WHERE v.data_venda >= $1 AND v.data_venda <= $2
            AND v.status != 'cancelada'
          GROUP BY c.id, c.nome_completo, c.email, c.cpf
          ORDER BY valor_total_gasto DESC`,
          [data_inicio, data_fim]
        );
        return { dados: result.rows };
      }
      
      default:
        return null;
    }
  } catch (error) {
    console.error(`Erro ao buscar dados do relatório ${tipo}:`, error);
    throw error;
  }
};

/**
 * GET /api/v1/relatorios/:tipo/exportar
 * Exportar relatório para CSV (Excel) ou JSON (PDF temporário)
 */
router.get('/:tipo/exportar', verificarPermissao, async (req, res) => {
  try {
    const { tipo } = req.params;
    const { formato, data_inicio, data_fim, funcionario_id, tipo: tipoItem, categoria_id } = req.query;

    if (!formato || !['excel', 'pdf', 'csv'].includes(formato)) {
      return res.status(400).json({ error: 'Formato deve ser "excel", "pdf" ou "csv"' });
    }

    // Buscar dados do relatório
    const dadosRelatorio = await buscarDadosRelatorioInterno(tipo, {
      data_inicio, data_fim, funcionario_id, tipo: tipoItem, categoria_id
    });

    if (!dadosRelatorio) {
      return res.status(400).json({ error: 'Tipo de relatório inválido ou não implementado para exportação' });
    }

    // Gerar arquivo baseado no formato
    if (formato === 'csv' || formato === 'excel') {
      // Gerar CSV (compatível com Excel)
      let csv = '';
      
      // Cabeçalho do documento
      csv += `Relatório: ${tipo.replace(/-/g, ' ').toUpperCase()}\n`;
      if (data_inicio && data_fim) {
        csv += `Período: ${data_inicio} a ${data_fim}\n`;
      }
      csv += `Data de Geração: ${new Date().toLocaleString('pt-BR')}\n`;
      csv += '\n';

      // Resumo se existir
      if (dadosRelatorio.resumo) {
        csv += 'RESUMO\n';
        Object.entries(dadosRelatorio.resumo).forEach(([key, value]) => {
          csv += `${key.replace(/_/g, ' ').toUpperCase()};${value}\n`;
        });
        csv += '\n';
      }

      // Dados principais (produtos-estoque retorna 'produtos', outros retornam 'dados')
      const dados = dadosRelatorio.dados || dadosRelatorio.produtos || [];
      const detalhamento = dadosRelatorio.detalhamento || [];
      
      if (dados.length > 0) {
        csv += 'DADOS\n';
        // Cabeçalho da tabela
        const headers = Object.keys(dados[0]);
        csv += headers.map(h => h.replace(/_/g, ' ').toUpperCase()).join(';') + '\n';
        
        // Linhas de dados
        dados.forEach(row => {
          csv += headers.map(h => {
            const value = row[h];
            if (value === null || value === undefined) return '';
            if (typeof value === 'number' && (h.includes('valor') || h.includes('preco') || h.includes('total') || h.includes('medio'))) {
              return value.toFixed(2).replace('.', ',');
            }
            return String(value).replace(/;/g, ',').replace(/\n/g, ' ').replace(/"/g, '""');
          }).join(';') + '\n';
        });
        csv += '\n';
      }
      
      // Detalhamento se existir
      if (detalhamento.length > 0) {
        csv += 'DETALHAMENTO POR PERÍODO\n';
        const headersDet = Object.keys(detalhamento[0]);
        csv += headersDet.map(h => h.replace(/_/g, ' ').toUpperCase()).join(';') + '\n';
        
        detalhamento.forEach(row => {
          csv += headersDet.map(h => {
            const value = row[h];
            if (value === null || value === undefined) return '';
            if (typeof value === 'number' && (h.includes('valor') || h.includes('total'))) {
              return value.toFixed(2).replace('.', ',');
            }
            return String(value).replace(/;/g, ',').replace(/\n/g, ' ').replace(/"/g, '""');
          }).join(';') + '\n';
        });
      }

      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename=relatorio_${tipo}_${data_inicio || 'all'}_${data_fim || 'all'}.csv`);
      res.send('\ufeff' + csv); // BOM para Excel reconhecer UTF-8
      
    } else if (formato === 'pdf') {
      // Para PDF, retornar JSON formatado
      // Em produção, instale pdfkit: npm install pdfkit
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename=relatorio_${tipo}_${data_inicio || 'all'}_${data_fim || 'all'}.json`);
      res.json({
        relatorio: tipo,
        periodo: { inicio: data_inicio, fim: data_fim },
        data_geracao: new Date().toISOString(),
        dados: dadosRelatorio,
        nota: 'Para exportação PDF completa com formatação, instale pdfkit: npm install pdfkit'
      });
    }
  } catch (error) {
    console.error('Erro ao exportar relatório:', error);
    res.status(500).json({ error: 'Erro ao exportar relatório', details: error.message });
  }
});

module.exports = router;

