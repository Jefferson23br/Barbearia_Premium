const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { registrarLog, getClientIp, getUserAgent } = require('../utils/logger');

/**
 * GET /api/v1/balanco-demonstrativo/categorias
 * Lista todas as categorias de custo
 */
router.get('/categorias', async (req, res) => {
  try {
    const usuarioId = req.headers['x-user-id'];
    const usuarioTipo = req.headers['x-user-tipo'] || 'administrativo';

    if (usuarioTipo !== 'master') {
      const permissoesResult = await pool.query(
        'SELECT balanco_demonstrativo_ver FROM protese.permissoes_usuarios WHERE usuario_id = $1',
        [usuarioId]
      );

      if (permissoesResult.rows.length === 0 || !permissoesResult.rows[0].balanco_demonstrativo_ver) {
        return res.status(403).json({ error: 'Acesso negado. Permissão insuficiente.' });
      }
    }

    const { tipo, is_active, busca } = req.query;

    // Verificar se a tabela existe, se não existir, retornar array vazio
    let query = `
      SELECT 
        c.*,
        COUNT(d.id) as total_despesas
      FROM protese.categorias_custo c
      LEFT JOIN protese.despesas d ON d.categoria_custo_id = c.id
    `;

    const params = [];
    const conditions = [];

    if (tipo) {
      params.push(tipo);
      conditions.push(`c.tipo = $${params.length}`);
    }

    if (is_active !== undefined) {
      params.push(is_active === 'true');
      conditions.push(`c.is_active = $${params.length}`);
    }

    if (busca) {
      params.push(`%${busca}%`);
      conditions.push(`(c.nome ILIKE $${params.length} OR c.descricao ILIKE $${params.length} OR c.codigo ILIKE $${params.length})`);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' GROUP BY c.id ORDER BY COALESCE(c.codigo_hierarquico, c.codigo, c.nome) ASC';

    const result = await pool.query(query, params);

    // Organizar categorias em hierarquia
    const categoriasMap = {};
    const categoriasRaiz = [];

    result.rows.forEach(cat => {
      categoriasMap[cat.id] = { ...cat, filhos: [] };
    });

    result.rows.forEach(cat => {
      if (cat.categoria_pai_id && categoriasMap[cat.categoria_pai_id]) {
        categoriasMap[cat.categoria_pai_id].filhos.push(categoriasMap[cat.id]);
      } else {
        categoriasRaiz.push(categoriasMap[cat.id]);
      }
    });

    // Ordenar hierarquicamente
    const ordenarHierarquia = (cats) => {
      return cats.sort((a, b) => {
        const codigoA = a.codigo_hierarquico || a.codigo || a.nome;
        const codigoB = b.codigo_hierarquico || b.codigo || b.nome;
        return codigoA.localeCompare(codigoB, undefined, { numeric: true, sensitivity: 'base' });
      }).map(cat => {
        if (cat.filhos.length > 0) {
          cat.filhos = ordenarHierarquia(cat.filhos);
        }
        return cat;
      });
    };

    const categoriasOrdenadas = ordenarHierarquia(categoriasRaiz);

    res.json({ categorias: categoriasOrdenadas, categorias_flat: result.rows });
  } catch (error) {
    console.error('Erro ao listar categorias:', error);
    res.status(500).json({ error: 'Erro ao listar categorias' });
  }
});

/**
 * GET /api/v1/balanco-demonstrativo/categorias/:id
 * Busca uma categoria específica
 */
router.get('/categorias/:id', async (req, res) => {
  try {
    const usuarioId = req.headers['x-user-id'];
    const usuarioTipo = req.headers['x-user-tipo'] || 'administrativo';

    if (usuarioTipo !== 'master') {
      const permissoesResult = await pool.query(
        'SELECT balanco_demonstrativo_ver FROM protese.permissoes_usuarios WHERE usuario_id = $1',
        [usuarioId]
      );

      if (permissoesResult.rows.length === 0 || !permissoesResult.rows[0].balanco_demonstrativo_ver) {
        return res.status(403).json({ error: 'Acesso negado. Permissão insuficiente.' });
      }
    }

    const result = await pool.query(
      'SELECT * FROM protese.categorias_custo WHERE id = $1',
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Categoria não encontrada' });
    }

    res.json({ categoria: result.rows[0] });
  } catch (error) {
    console.error('Erro ao buscar categoria:', error);
    res.status(500).json({ error: 'Erro ao buscar categoria' });
  }
});

/**
 * POST /api/v1/balanco-demonstrativo/categorias
 * Cria uma nova categoria de custo
 */
router.post('/categorias', async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    const usuarioId = req.headers['x-user-id'];
    const usuarioTipo = req.headers['x-user-tipo'] || 'administrativo';
    const usuarioNome = req.headers['x-user-nome'] || null;

    if (usuarioTipo !== 'master') {
      const permissoesResult = await client.query(
        'SELECT balanco_demonstrativo_editar FROM protese.permissoes_usuarios WHERE usuario_id = $1',
        [usuarioId]
      );

      if (permissoesResult.rows.length === 0 || !permissoesResult.rows[0].balanco_demonstrativo_editar) {
        await client.query('ROLLBACK');
        return res.status(403).json({ error: 'Acesso negado. Permissão insuficiente.' });
      }
    }

    const { nome, descricao, codigo, tipo, categoria_pai_id, nivel, codigo_hierarquico } = req.body;
    
    console.log('Dados recebidos para criar categoria:', {
      nome,
      nivel,
      categoria_pai_id,
      codigo_hierarquico,
      tipo
    });
    
    // Normalizar categoria_pai_id (string vazia vira null)
    const categoriaPaiIdNormalizada = categoria_pai_id && String(categoria_pai_id).trim() !== '' ? String(categoria_pai_id).trim() : null;

    if (!nome || !nome.trim()) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Nome é obrigatório' });
    }

    // Validar nível
    const nivelFinal = nivel ? parseInt(nivel) : 1;
    if (![1, 2, 3].includes(nivelFinal)) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Nível deve ser 1, 2 ou 3' });
    }

    // Validar categoria pai
    if (nivelFinal > 1 && !categoriaPaiIdNormalizada) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Categoria pai é obrigatória para níveis 2 e 3' });
    }

    if (nivelFinal === 1 && categoriaPaiIdNormalizada) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Categoria de nível 1 não pode ter categoria pai' });
    }

    // Verificar se categoria pai existe e validar nível
    if (categoriaPaiIdNormalizada) {
      const paiResult = await client.query(
        'SELECT nivel FROM protese.categorias_custo WHERE id = $1',
        [categoriaPaiIdNormalizada]
      );

      if (paiResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(400).json({ error: 'Categoria pai não encontrada' });
      }

      const nivelPai = paiResult.rows[0].nivel;
      if (nivelFinal !== nivelPai + 1) {
        await client.query('ROLLBACK');
        return res.status(400).json({ error: `Nível deve ser ${nivelPai + 1} (pai é nível ${nivelPai})` });
      }
    }

    // Verificar se já existe categoria com mesmo nome no mesmo nível/pai
    const existeQuery = categoriaPaiIdNormalizada
      ? 'SELECT id FROM protese.categorias_custo WHERE nome = $1 AND categoria_pai_id = $2'
      : 'SELECT id FROM protese.categorias_custo WHERE nome = $1 AND categoria_pai_id IS NULL';
    
    const existeParams = categoriaPaiIdNormalizada ? [nome, categoriaPaiIdNormalizada] : [nome];
    const existeResult = await client.query(existeQuery, existeParams);

    if (existeResult.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Já existe uma categoria com este nome no mesmo nível' });
    }

    // Verificar se código hierárquico já existe (se fornecido)
    if (codigo_hierarquico && codigo_hierarquico.trim() !== '') {
      const codigoExisteResult = await client.query(
        'SELECT id FROM protese.categorias_custo WHERE codigo_hierarquico = $1',
        [codigo_hierarquico.trim()]
      );

      if (codigoExisteResult.rows.length > 0) {
        await client.query('ROLLBACK');
        return res.status(400).json({ error: 'Já existe uma categoria com este código hierárquico' });
      }
    }

    // Verificar se a tabela tem as colunas de hierarquia
    try {
      const tableCheck = await client.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_schema = 'protese' 
        AND table_name = 'categorias_custo' 
        AND column_name IN ('categoria_pai_id', 'nivel', 'codigo_hierarquico')
      `);
      
      if (tableCheck.rows.length < 3) {
        await client.query('ROLLBACK');
        console.error('Tabela categorias_custo não tem todas as colunas de hierarquia. Execute o script SQL primeiro.');
        return res.status(500).json({ 
          error: 'Estrutura da tabela incompleta. Execute o script COMANDOS_ADICIONAR_HIERARQUIA_CATEGORIAS.sql primeiro.' 
        });
      }
    } catch (checkError) {
      await client.query('ROLLBACK');
      console.error('Erro ao verificar estrutura da tabela:', checkError);
      return res.status(500).json({ error: 'Erro ao verificar estrutura da tabela', details: checkError.message });
    }

    try {
      console.log('Tentando inserir categoria com dados:', {
        nome: nome.trim(),
        nivel: nivelFinal,
        categoria_pai_id: categoriaPaiIdNormalizada,
        codigo_hierarquico: codigo_hierarquico ? codigo_hierarquico.trim() : null
      });

      const result = await client.query(
        `INSERT INTO protese.categorias_custo 
         (nome, descricao, codigo, tipo, categoria_pai_id, nivel, codigo_hierarquico, created_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING *`,
        [
          nome.trim(), 
          descricao ? descricao.trim() : null, 
          codigo ? codigo.trim() : null, 
          tipo || 'despesa',
          categoriaPaiIdNormalizada,
          nivelFinal,
          codigo_hierarquico ? codigo_hierarquico.trim() : null,
          usuarioId
        ]
      );

      await client.query('COMMIT');
      console.log('Categoria criada com sucesso:', result.rows[0].id);

    await registrarLog({
      usuario_id: usuarioId,
      usuario_tipo: usuarioTipo,
      usuario_nome: usuarioNome,
      acao: 'criar',
      modulo: 'balanco_demonstrativo',
      descricao: `Criou categoria de custo: ${nome}`,
      ip: getClientIp(req),
      user_agent: getUserAgent(req)
    });

    res.status(201).json({ categoria: result.rows[0] });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Erro ao criar categoria:', error);
    res.status(500).json({ error: 'Erro ao criar categoria', details: error.message });
  } finally {
    client.release();
  }
});

/**
 * PUT /api/v1/balanco-demonstrativo/categorias/:id
 * Atualiza uma categoria de custo
 */
router.put('/categorias/:id', async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    const usuarioId = req.headers['x-user-id'];
    const usuarioTipo = req.headers['x-user-tipo'] || 'administrativo';
    const usuarioNome = req.headers['x-user-nome'] || null;

    if (usuarioTipo !== 'master') {
      const permissoesResult = await client.query(
        'SELECT balanco_demonstrativo_editar FROM protese.permissoes_usuarios WHERE usuario_id = $1',
        [usuarioId]
      );

      if (permissoesResult.rows.length === 0 || !permissoesResult.rows[0].balanco_demonstrativo_editar) {
        await client.query('ROLLBACK');
        return res.status(403).json({ error: 'Acesso negado. Permissão insuficiente.' });
      }
    }

    const { nome, descricao, codigo, tipo, is_active } = req.body;

    // Buscar categoria atual
    const categoriaAtual = await client.query(
      'SELECT * FROM protese.categorias_custo WHERE id = $1',
      [req.params.id]
    );

    if (categoriaAtual.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Categoria não encontrada' });
    }

    // Verificar se nome já existe em outra categoria
    if (nome && nome !== categoriaAtual.rows[0].nome) {
      const existeResult = await client.query(
        'SELECT id FROM protese.categorias_custo WHERE nome = $1 AND id != $2',
        [nome, req.params.id]
      );

      if (existeResult.rows.length > 0) {
        await client.query('ROLLBACK');
        return res.status(400).json({ error: 'Já existe uma categoria com este nome' });
      }
    }

    // Verificar se código já existe em outra categoria (se fornecido)
    if (codigo && codigo !== categoriaAtual.rows[0].codigo) {
      const codigoExisteResult = await client.query(
        'SELECT id FROM protese.categorias_custo WHERE codigo = $1 AND id != $2',
        [codigo, req.params.id]
      );

      if (codigoExisteResult.rows.length > 0) {
        await client.query('ROLLBACK');
        return res.status(400).json({ error: 'Já existe uma categoria com este código' });
      }
    }

    const result = await client.query(
      `UPDATE protese.categorias_custo 
       SET nome = COALESCE($1, nome),
           descricao = COALESCE($2, descricao),
           codigo = COALESCE($3, codigo),
           tipo = COALESCE($4, tipo),
           is_active = COALESCE($5, is_active),
           updated_by = $6
       WHERE id = $7
       RETURNING *`,
      [
        nome || null,
        descricao !== undefined ? descricao : null,
        codigo !== undefined ? codigo : null,
        tipo || null,
        is_active !== undefined ? is_active : null,
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
      modulo: 'balanco_demonstrativo',
      descricao: `Editou categoria de custo: ${result.rows[0].nome}`,
      ip: getClientIp(req),
      user_agent: getUserAgent(req)
    });

    res.json({ categoria: result.rows[0] });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Erro ao atualizar categoria:', error);
    res.status(500).json({ error: 'Erro ao atualizar categoria', details: error.message });
  } finally {
    client.release();
  }
});

/**
 * DELETE /api/v1/balanco-demonstrativo/categorias/:id
 * Exclui uma categoria de custo
 */
router.delete('/categorias/:id', async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    const usuarioId = req.headers['x-user-id'];
    const usuarioTipo = req.headers['x-user-tipo'] || 'administrativo';
    const usuarioNome = req.headers['x-user-nome'] || null;

    if (usuarioTipo !== 'master') {
      const permissoesResult = await client.query(
        'SELECT balanco_demonstrativo_excluir FROM protese.permissoes_usuarios WHERE usuario_id = $1',
        [usuarioId]
      );

      if (permissoesResult.rows.length === 0 || !permissoesResult.rows[0].balanco_demonstrativo_excluir) {
        await client.query('ROLLBACK');
        return res.status(403).json({ error: 'Acesso negado. Permissão insuficiente.' });
      }
    }

    // Buscar categoria para log
    const categoriaResult = await client.query(
      'SELECT nome FROM protese.categorias_custo WHERE id = $1',
      [req.params.id]
    );

    if (categoriaResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Categoria não encontrada' });
    }

    // Verificar se há despesas vinculadas
    const despesasResult = await client.query(
      'SELECT COUNT(*) as total FROM protese.despesas WHERE categoria_custo_id = $1',
      [req.params.id]
    );

    if (parseInt(despesasResult.rows[0].total) > 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ 
        error: 'Não é possível excluir esta categoria pois existem despesas vinculadas a ela' 
      });
    }

    await client.query('DELETE FROM protese.categorias_custo WHERE id = $1', [req.params.id]);

    await client.query('COMMIT');

    await registrarLog({
      usuario_id: usuarioId,
      usuario_tipo: usuarioTipo,
      usuario_nome: usuarioNome,
      acao: 'excluir',
      modulo: 'balanco_demonstrativo',
      descricao: `Excluiu categoria de custo: ${categoriaResult.rows[0].nome}`,
      ip: getClientIp(req),
      user_agent: getUserAgent(req)
    });

    res.json({ message: 'Categoria excluída com sucesso' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Erro ao excluir categoria:', error);
    res.status(500).json({ error: 'Erro ao excluir categoria', details: error.message });
  } finally {
    client.release();
  }
});

/**
 * GET /api/v1/balanco-demonstrativo/relatorio
 * Gera relatório do balanço demonstrativo
 */
router.get('/relatorio', async (req, res) => {
  try {
    const usuarioId = req.headers['x-user-id'];
    const usuarioTipo = req.headers['x-user-tipo'] || 'administrativo';

    if (usuarioTipo !== 'master') {
      const permissoesResult = await pool.query(
        'SELECT balanco_demonstrativo_ver FROM protese.permissoes_usuarios WHERE usuario_id = $1',
        [usuarioId]
      );

      if (permissoesResult.rows.length === 0 || !permissoesResult.rows[0].balanco_demonstrativo_ver) {
        return res.status(403).json({ error: 'Acesso negado. Permissão insuficiente.' });
      }
    }

    const { data_inicio, data_fim } = req.query;

    if (!data_inicio || !data_fim) {
      return res.status(400).json({ error: 'Data inicial e data final são obrigatórias' });
    }

    const dataInicio = new Date(data_inicio);
    const dataFim = new Date(data_fim);

    // Verificar se é um único mês ou múltiplos meses
    const meses = [];
    const dataAtual = new Date(dataInicio);
    
    while (dataAtual <= dataFim) {
      const ano = dataAtual.getFullYear();
      const mes = dataAtual.getMonth() + 1;
      const primeiroDia = new Date(ano, mes - 1, 1);
      const ultimoDia = new Date(ano, mes, 0);
      
      meses.push({
        ano,
        mes,
        primeiro_dia: primeiroDia.toISOString().split('T')[0],
        ultimo_dia: ultimoDia.toISOString().split('T')[0],
        label: `${mes.toString().padStart(2, '0')}/${ano}`
      });
      
      dataAtual.setMonth(dataAtual.getMonth() + 1);
    }

    // 1. Buscar TOTAL GERAL de receitas (sem filtro, sem separação)
    const receitasTotalQuery = `
      SELECT 
        DATE_TRUNC('month', v.data_venda)::date as mes,
        COALESCE(SUM(COALESCE(vp.valor_total, 0) + COALESCE(vs.valor, 0)), 0) as valor_total
      FROM protese.vendas v
      LEFT JOIN protese.vendas_produtos vp ON v.id = vp.venda_id
      LEFT JOIN protese.vendas_servicos vs ON v.id = vs.venda_id
      WHERE v.data_venda >= $1 AND v.data_venda <= $2
      GROUP BY DATE_TRUNC('month', v.data_venda)
      ORDER BY mes
    `;

    const receitasTotalResult = await pool.query(receitasTotalQuery, [data_inicio, data_fim]);

    // 2. Buscar receitas separadas por TIPO (Produtos e Serviços)
    const vendasProdutosQuery = `
      SELECT 
        DATE_TRUNC('month', v.data_venda)::date as mes,
        COALESCE(SUM(vp.valor_total), 0) as valor_total
      FROM protese.vendas v
      LEFT JOIN protese.vendas_produtos vp ON v.id = vp.venda_id
      WHERE v.data_venda >= $1 AND v.data_venda <= $2
      GROUP BY DATE_TRUNC('month', v.data_venda)
      ORDER BY mes
    `;

    const vendasProdutosResult = await pool.query(vendasProdutosQuery, [data_inicio, data_fim]);

    const vendasServicosQuery = `
      SELECT 
        DATE_TRUNC('month', v.data_venda)::date as mes,
        COALESCE(SUM(vs.valor), 0) as valor_total
      FROM protese.vendas v
      LEFT JOIN protese.vendas_servicos vs ON v.id = vs.venda_id
      WHERE v.data_venda >= $1 AND v.data_venda <= $2
      GROUP BY DATE_TRUNC('month', v.data_venda)
      ORDER BY mes
    `;

    const vendasServicosResult = await pool.query(vendasServicosQuery, [data_inicio, data_fim]);

    // 3. Buscar receitas agrupadas por FUNCIONÁRIO (total geral, sem separar produtos/serviços)
    const vendasPorFuncionarioQuery = `
      SELECT 
        DATE_TRUNC('month', v.data_venda)::date as mes,
        v.funcionario_id,
        COALESCE(f.nome_completo, 'Sem funcionário') as funcionario_nome,
        COALESCE(SUM(COALESCE(vp.valor_total, 0) + COALESCE(vs.valor, 0)), 0) as valor_total
      FROM protese.vendas v
      LEFT JOIN protese.vendas_produtos vp ON v.id = vp.venda_id
      LEFT JOIN protese.vendas_servicos vs ON v.id = vs.venda_id
      LEFT JOIN protese.usuarios_administrativos f ON v.funcionario_id = f.id
      WHERE v.data_venda >= $1 AND v.data_venda <= $2
        AND (f.tipo_usuario IS NULL OR f.tipo_usuario != 'master')
      GROUP BY DATE_TRUNC('month', v.data_venda), v.funcionario_id, f.nome_completo
      ORDER BY funcionario_nome, mes
    `;

    const vendasPorFuncionarioResult = await pool.query(vendasPorFuncionarioQuery, [data_inicio, data_fim]);

    // Buscar TOTAL GERAL de despesas (sem filtro)
    const despesasTotalQuery = `
      SELECT 
        DATE_TRUNC('month', d.data_emissao)::date as mes,
        SUM(d.valor_liquido) as valor_total
      FROM protese.despesas d
      WHERE d.data_emissao >= $1 AND d.data_emissao <= $2
      GROUP BY DATE_TRUNC('month', d.data_emissao)
      ORDER BY mes
    `;

    const despesasTotalResult = await pool.query(despesasTotalQuery, [data_inicio, data_fim]);

    // Buscar despesas agrupadas por categoria hierárquica e mês
    const despesasPorCategoriaQuery = `
      SELECT 
        d.descricao as despesa_descricao,
        COALESCE(c.nome, 'Sem categoria') as categoria_nome,
        c.id as categoria_id,
        COALESCE(c.codigo_hierarquico, c.codigo, c.nome) as categoria_codigo,
        c.nivel as categoria_nivel,
        c.categoria_pai_id,
        DATE_TRUNC('month', d.data_emissao)::date as mes,
        SUM(d.valor_liquido) as valor_total
      FROM protese.despesas d
      LEFT JOIN protese.categorias_custo c ON d.categoria_custo_id = c.id
      WHERE d.data_emissao >= $1 AND d.data_emissao <= $2
      GROUP BY d.descricao, c.nome, c.id, c.codigo_hierarquico, c.codigo, c.nivel, c.categoria_pai_id, DATE_TRUNC('month', d.data_emissao)
      ORDER BY COALESCE(c.codigo_hierarquico, c.codigo, c.nome) ASC, d.descricao ASC, mes ASC
    `;

    const despesasPorCategoriaResult = await pool.query(despesasPorCategoriaQuery, [data_inicio, data_fim]);

    // 1. Organizar TOTAL GERAL de receitas por mês
    const receitasTotal = {};
    receitasTotalResult.rows.forEach(row => {
      const mesKey = row.mes.toISOString().split('T')[0];
      receitasTotal[mesKey] = parseFloat(row.valor_total);
    });

    // 2. Organizar receitas por TIPO (Produtos e Serviços) por mês
    const receitasProdutos = {};
    vendasProdutosResult.rows.forEach(row => {
      const mesKey = row.mes.toISOString().split('T')[0];
      receitasProdutos[mesKey] = parseFloat(row.valor_total);
    });

    const receitasServicos = {};
    vendasServicosResult.rows.forEach(row => {
      const mesKey = row.mes.toISOString().split('T')[0];
      receitasServicos[mesKey] = parseFloat(row.valor_total);
    });

    // 3. Organizar receitas por FUNCIONÁRIO (total geral) por mês
    const receitasPorFuncionario = {};
    vendasPorFuncionarioResult.rows.forEach(row => {
      const funcionarioId = row.funcionario_id || 'sem_funcionario';
      const funcionarioNome = row.funcionario_nome || 'Sem funcionário';
      const mesKey = row.mes.toISOString().split('T')[0];
      
      if (!receitasPorFuncionario[funcionarioId]) {
        receitasPorFuncionario[funcionarioId] = {
          funcionario_id: funcionarioId,
          funcionario_nome: funcionarioNome,
          totais_por_mes: {}
        };
      }
      
      if (!receitasPorFuncionario[funcionarioId].totais_por_mes[mesKey]) {
        receitasPorFuncionario[funcionarioId].totais_por_mes[mesKey] = 0;
      }
      receitasPorFuncionario[funcionarioId].totais_por_mes[mesKey] += parseFloat(row.valor_total);
    });

    // Converter para array e ordenar por nome do funcionário
    const receitasPorFuncionarioArray = Object.values(receitasPorFuncionario).sort((a, b) => 
      a.funcionario_nome.localeCompare(b.funcionario_nome)
    );

    // Organizar TOTAL GERAL de despesas por mês
    const despesasTotal = {};
    despesasTotalResult.rows.forEach(row => {
      const mesKey = row.mes.toISOString().split('T')[0];
      despesasTotal[mesKey] = parseFloat(row.valor_total);
    });

    // Organizar despesas por categoria hierárquica
    const despesasPorCategoria = {};
    despesasPorCategoriaResult.rows.forEach(row => {
      const categoriaId = row.categoria_id || 'sem_categoria';
      const categoriaNome = row.categoria_nome || 'Sem categoria';
      const categoriaCodigo = row.categoria_codigo || categoriaNome;
      const categoriaNivel = row.categoria_nivel || 1;
      const mesKey = row.mes.toISOString().split('T')[0];
      
      if (!despesasPorCategoria[categoriaId]) {
        despesasPorCategoria[categoriaId] = {
          categoria_id: categoriaId,
          categoria_nome: categoriaNome,
          categoria_codigo: categoriaCodigo,
          categoria_nivel: categoriaNivel,
          categoria_pai_id: row.categoria_pai_id,
          despesas: [],
          totais_por_mes: {}
        };
      }

      // Adicionar despesa individual se ainda não existir
      const despesaExistente = despesasPorCategoria[categoriaId].despesas.find(
        d => d.descricao === row.despesa_descricao
      );
      if (!despesaExistente) {
        despesasPorCategoria[categoriaId].despesas.push({
          descricao: row.despesa_descricao
        });
      }

      // Adicionar valor ao mês
      if (!despesasPorCategoria[categoriaId].totais_por_mes[mesKey]) {
        despesasPorCategoria[categoriaId].totais_por_mes[mesKey] = 0;
      }
      despesasPorCategoria[categoriaId].totais_por_mes[mesKey] += parseFloat(row.valor_total);
    });

    // Converter para array e ordenar por código hierárquico
    const despesasArray = Object.values(despesasPorCategoria).sort((a, b) => {
      const codigoA = a.categoria_codigo || a.categoria_nome;
      const codigoB = b.categoria_codigo || b.categoria_nome;
      return codigoA.localeCompare(codigoB, undefined, { numeric: true, sensitivity: 'base' });
    });

    // Calcular comparativo Receitas x Despesas por mês
    const comparativo = {};
    meses.forEach(mes => {
      const mesKey = mes.primeiro_dia;
      const receita = receitasTotal[mesKey] || 0;
      const despesa = despesasTotal[mesKey] || 0;
      const porcentagem = receita > 0 ? (despesa / receita) * 100 : 0;
      
      comparativo[mesKey] = {
        receita: receita,
        despesa: despesa,
        saldo: receita - despesa,
        porcentagem: porcentagem
      };
    });

    res.json({
      periodo: {
        data_inicio: data_inicio,
        data_fim: data_fim,
        meses: meses
      },
      receitas: {
        total_geral: receitasTotal,
        por_tipo: {
          produtos: receitasProdutos,
          servicos: receitasServicos
        },
        por_funcionario: receitasPorFuncionarioArray
      },
      despesas: {
        total_geral: despesasTotal,
        por_categoria: despesasArray || []
      },
      comparativo: comparativo
    });
  } catch (error) {
    console.error('Erro ao gerar relatório:', error);
    
    // Se a tabela não existir, retornar estrutura vazia
    if (error.message && error.message.includes('does not exist')) {
      return res.json({
        periodo: {
          data_inicio: data_inicio,
          data_fim: data_fim,
          meses: meses
        },
        receitas: {
          total_geral: {},
          por_tipo: {
            produtos: {},
            servicos: {}
          },
          por_funcionario: []
        },
        despesas: []
      });
    }
    
    res.status(500).json({ error: 'Erro ao gerar relatório', details: error.message });
  }
});

module.exports = router;

