const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { registrarLog, getClientIp, getUserAgent } = require('../utils/logger');

/**
 * Middleware para verificar permissão
 */
async function verificarPermissao(req, res, acao) {
  const usuarioId = req.headers['x-user-id'];
  const usuarioTipo = req.headers['x-user-tipo'] || 'administrativo';

  console.log(`[BACKEND] Verificando permissão - usuarioId: ${usuarioId}, tipo: ${usuarioTipo}, ação: ${acao}`);

  if (usuarioTipo === 'master') {
    console.log('[BACKEND] Usuário master - permissão concedida');
    return true;
  }

  try {
    const permissoesResult = await pool.query(
      `SELECT cupons_fidelidades_${acao} FROM protese.permissoes_usuarios WHERE usuario_id = $1`,
      [usuarioId]
    );

    console.log(`[BACKEND] Resultado verificação permissão:`, permissoesResult.rows);

    if (permissoesResult.rows.length === 0 || !permissoesResult.rows[0][`cupons_fidelidades_${acao}`]) {
      console.log(`[BACKEND] Permissão negada para ação: ${acao}`);
      res.status(403).json({ error: 'Acesso negado. Permissão insuficiente.' });
      return false;
    }

    console.log(`[BACKEND] Permissão concedida para ação: ${acao}`);
    return true;
  } catch (error) {
    console.error(`[BACKEND] Erro ao verificar permissão:`, error);
    res.status(500).json({ error: 'Erro ao verificar permissão', message: error.message });
    return false;
  }
}

/**
 * GET /api/v1/cupons-fidelidades/cupons
 * Lista todos os cupons
 */
router.get('/cupons', async (req, res) => {
  try {
    console.log('[BACKEND] GET /cupons - Iniciando...');
    if (!(await verificarPermissao(req, res, 'ver'))) {
      console.log('[BACKEND] GET /cupons - Permissão negada');
      return;
    }

    const { is_active, regra_uso } = req.query;
    console.log('[BACKEND] GET /cupons - Filtros:', { is_active, regra_uso });
    
    let query = `
      SELECT 
        c.*,
        COALESCE((
          SELECT COUNT(*)::int 
          FROM protese.cupons_usados cu 
          WHERE cu.cupom_id = c.id
        ), 0) as total_usos
      FROM protese.cupons c
      WHERE 1=1
    `;
    const params = [];
    let paramIndex = 1;

    if (is_active !== undefined) {
      query += ` AND c.is_active = $${paramIndex}`;
      params.push(is_active === 'true');
      paramIndex++;
    }

    if (regra_uso) {
      query += ` AND c.regra_uso = $${paramIndex}`;
      params.push(regra_uso);
      paramIndex++;
    }

    query += ` ORDER BY c.created_at DESC`;

    console.log('[BACKEND] GET /cupons - Query:', query);
    console.log('[BACKEND] GET /cupons - Params:', params);

    const result = await pool.query(query, params);

    console.log('[BACKEND] GET /cupons - Resultado:', result.rows.length, 'cupons encontrados');
    if (result.rows.length > 0) {
      console.log('[BACKEND] GET /cupons - Cupons:', result.rows.map(c => ({ id: c.id, codigo: c.codigo, nome: c.nome })));
    } else {
      // Verificar se há cupons na tabela
      const checkCupons = await pool.query('SELECT COUNT(*) as total FROM protese.cupons');
      console.log('[BACKEND] GET /cupons - Total de cupons na tabela:', checkCupons.rows[0].total);
    }

    res.json({ cupons: result.rows });
  } catch (error) {
    console.error('[BACKEND] Erro ao listar cupons:', error);
    res.status(500).json({ error: 'Erro ao listar cupons', message: error.message });
  }
});

/**
 * GET /api/v1/cupons-fidelidades/cupons/:id
 * Busca um cupom específico
 */
router.get('/cupons/:id', async (req, res) => {
  try {
    if (!(await verificarPermissao(req, res, 'ver'))) return;

    const result = await pool.query(
      `SELECT 
        c.*,
        COUNT(cu.id) as total_usos
       FROM protese.cupons c
       LEFT JOIN protese.cupons_usados cu ON c.id = cu.cupom_id
       WHERE c.id = $1
       GROUP BY c.id`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Cupom não encontrado' });
    }

    res.json({ cupom: result.rows[0] });
  } catch (error) {
    console.error('Erro ao buscar cupom:', error);
    res.status(500).json({ error: 'Erro ao buscar cupom', message: error.message });
  }
});

/**
 * POST /api/v1/cupons-fidelidades/cupons
 * Cria um novo cupom
 */
router.post('/cupons', async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    if (!(await verificarPermissao(req, res, 'editar'))) {
      await client.query('ROLLBACK');
      return;
    }

    const usuarioId = req.headers['x-user-id'];
    const {
      codigo,
      nome,
      descricao,
      tipo_desconto,
      valor_desconto,
      aplicar_em,
      regra_uso,
      limite_usos,
      regra_fidelidade,
      quantidade_fidelidade,
      validade_inicio,
      validade_fim,
      is_active
    } = req.body;

    // Validações
    if (!codigo || !nome || !tipo_desconto || !aplicar_em || !regra_uso) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Campos obrigatórios: codigo, nome, tipo_desconto, aplicar_em, regra_uso' });
    }

    if (tipo_desconto === 'percentual' && (valor_desconto < 0 || valor_desconto > 100)) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Desconto percentual deve estar entre 0 e 100' });
    }

    if (tipo_desconto === 'valor_fixo' && valor_desconto <= 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Desconto em valor fixo deve ser maior que zero' });
    }

    if (regra_uso === 'limitado' && (!limite_usos || limite_usos < 1)) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Limite de usos deve ser maior que zero para regra limitado' });
    }

    if (regra_uso === 'fidelidade' && (!regra_fidelidade || !quantidade_fidelidade || quantidade_fidelidade < 1)) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Regra de fidelidade e quantidade são obrigatórias para regra fidelidade' });
    }

    // Verificar se código já existe
    const codigoCheck = await client.query(
      'SELECT id FROM protese.cupons WHERE codigo = $1',
      [codigo.toUpperCase()]
    );

    if (codigoCheck.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Código do cupom já existe' });
    }

    // Inserir cupom
    const result = await client.query(
      `INSERT INTO protese.cupons 
       (codigo, nome, descricao, tipo_desconto, valor_desconto, aplicar_em, regra_uso, 
        limite_usos, regra_fidelidade, quantidade_fidelidade, validade_inicio, validade_fim, 
        is_active, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
       RETURNING *`,
      [
        codigo.toUpperCase(),
        nome,
        descricao || null,
        tipo_desconto,
        valor_desconto || 0,
        aplicar_em,
        regra_uso,
        limite_usos || null,
        regra_fidelidade || null,
        quantidade_fidelidade || null,
        validade_inicio || null,
        validade_fim || null,
        is_active !== undefined ? is_active : true,
        usuarioId
      ]
    );

    await client.query('COMMIT');

    // Registrar log
    await registrarLog({
      usuarioId: usuarioId,
      usuarioTipo: req.headers['x-user-tipo'] || 'administrativo',
      acao: 'criar',
      modulo: 'cupons_fidelidades',
      entidadeId: result.rows[0].id,
      entidadeTipo: 'cupom',
      descricao: `Cupom ${codigo} criado`,
      dadosNovos: result.rows[0],
      ipAddress: getClientIp(req),
      userAgent: getUserAgent(req),
    });

    res.status(201).json({ cupom: result.rows[0] });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Erro ao criar cupom:', error);
    res.status(500).json({ error: 'Erro ao criar cupom', message: error.message });
  } finally {
    client.release();
  }
});

/**
 * PUT /api/v1/cupons-fidelidades/cupons/:id
 * Atualiza um cupom
 */
router.put('/cupons/:id', async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    if (!(await verificarPermissao(req, res, 'editar'))) {
      await client.query('ROLLBACK');
      return;
    }

    const usuarioId = req.headers['x-user-id'];
    const cupomId = req.params.id;

    // Buscar cupom atual
    const cupomAtual = await client.query(
      'SELECT * FROM protese.cupons WHERE id = $1',
      [cupomId]
    );

    if (cupomAtual.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Cupom não encontrado' });
    }

    const {
      codigo,
      nome,
      descricao,
      tipo_desconto,
      valor_desconto,
      aplicar_em,
      regra_uso,
      limite_usos,
      regra_fidelidade,
      quantidade_fidelidade,
      validade_inicio,
      validade_fim,
      is_active
    } = req.body;

    // Validações
    if (tipo_desconto === 'percentual' && (valor_desconto < 0 || valor_desconto > 100)) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Desconto percentual deve estar entre 0 e 100' });
    }

    if (tipo_desconto === 'valor_fixo' && valor_desconto <= 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Desconto em valor fixo deve ser maior que zero' });
    }

    // Verificar se código já existe (exceto o próprio cupom)
    if (codigo && codigo.toUpperCase() !== cupomAtual.rows[0].codigo) {
      const codigoCheck = await client.query(
        'SELECT id FROM protese.cupons WHERE codigo = $1 AND id != $2',
        [codigo.toUpperCase(), cupomId]
      );

      if (codigoCheck.rows.length > 0) {
        await client.query('ROLLBACK');
        return res.status(400).json({ error: 'Código do cupom já existe' });
      }
    }

    // Atualizar cupom
    const result = await client.query(
      `UPDATE protese.cupons SET
        codigo = COALESCE($1, codigo),
        nome = COALESCE($2, nome),
        descricao = COALESCE($3, descricao),
        tipo_desconto = COALESCE($4, tipo_desconto),
        valor_desconto = COALESCE($5, valor_desconto),
        aplicar_em = COALESCE($6, aplicar_em),
        regra_uso = COALESCE($7, regra_uso),
        limite_usos = COALESCE($8, limite_usos),
        regra_fidelidade = COALESCE($9, regra_fidelidade),
        quantidade_fidelidade = COALESCE($10, quantidade_fidelidade),
        validade_inicio = COALESCE($11, validade_inicio),
        validade_fim = COALESCE($12, validade_fim),
        is_active = COALESCE($13, is_active),
        updated_at = CURRENT_TIMESTAMP,
        updated_by = $14
       WHERE id = $15
       RETURNING *`,
      [
        codigo ? codigo.toUpperCase() : null,
        nome || null,
        descricao !== undefined ? descricao : null,
        tipo_desconto || null,
        valor_desconto !== undefined ? valor_desconto : null,
        aplicar_em || null,
        regra_uso || null,
        limite_usos !== undefined ? limite_usos : null,
        regra_fidelidade !== undefined ? regra_fidelidade : null,
        quantidade_fidelidade !== undefined ? quantidade_fidelidade : null,
        validade_inicio || null,
        validade_fim || null,
        is_active !== undefined ? is_active : null,
        usuarioId,
        cupomId
      ]
    );

    await client.query('COMMIT');

    // Registrar log
    await registrarLog({
      usuarioId: usuarioId,
      usuarioTipo: req.headers['x-user-tipo'] || 'administrativo',
      acao: 'editar',
      modulo: 'cupons_fidelidades',
      entidadeId: cupomId,
      entidadeTipo: 'cupom',
      descricao: `Cupom ${result.rows[0].codigo} atualizado`,
      dadosAnteriores: cupomAtual.rows[0],
      dadosNovos: result.rows[0],
      ipAddress: getClientIp(req),
      userAgent: getUserAgent(req),
    });

    res.json({ cupom: result.rows[0] });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Erro ao atualizar cupom:', error);
    res.status(500).json({ error: 'Erro ao atualizar cupom', message: error.message });
  } finally {
    client.release();
  }
});

/**
 * DELETE /api/v1/cupons-fidelidades/cupons/:id
 * Exclui um cupom
 */
router.delete('/cupons/:id', async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    if (!(await verificarPermissao(req, res, 'excluir'))) {
      await client.query('ROLLBACK');
      return;
    }

    const usuarioId = req.headers['x-user-id'];
    const cupomId = req.params.id;

    // Verificar se cupom existe
    const cupomCheck = await client.query(
      'SELECT * FROM protese.cupons WHERE id = $1',
      [cupomId]
    );

    if (cupomCheck.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Cupom não encontrado' });
    }

    // Verificar se há usos do cupom
    const usosCheck = await client.query(
      'SELECT COUNT(*) as total FROM protese.cupons_usados WHERE cupom_id = $1',
      [cupomId]
    );

    if (parseInt(usosCheck.rows[0].total) > 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Não é possível excluir cupom que já foi usado' });
    }

    // Excluir cupom
    await client.query('DELETE FROM protese.cupons WHERE id = $1', [cupomId]);

    await client.query('COMMIT');

    // Registrar log
    await registrarLog({
      usuarioId: usuarioId,
      usuarioTipo: req.headers['x-user-tipo'] || 'administrativo',
      acao: 'excluir',
      modulo: 'cupons_fidelidades',
      entidadeId: cupomId,
      entidadeTipo: 'cupom',
      descricao: `Cupom ${cupomCheck.rows[0].codigo} excluído`,
      dadosAnteriores: cupomCheck.rows[0],
      ipAddress: getClientIp(req),
      userAgent: getUserAgent(req),
    });

    res.json({ message: 'Cupom excluído com sucesso' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Erro ao excluir cupom:', error);
    res.status(500).json({ error: 'Erro ao excluir cupom', message: error.message });
  } finally {
    client.release();
  }
});

/**
 * GET /api/v1/cupons-fidelidades/fidelidades
 * Lista fidelidades de clientes
 */
router.get('/fidelidades', async (req, res) => {
  try {
    if (!(await verificarPermissao(req, res, 'ver'))) return;

    const { cliente_id, cupom_id, cupom_liberado, cupom_usado } = req.query;
    let query = `
      SELECT 
        f.*,
        c.nome_completo as cliente_nome,
        c.email as cliente_email,
        cup.codigo as cupom_codigo,
        cup.nome as cupom_nome
      FROM protese.fidelidades f
      INNER JOIN protese.usuarios_clientes c ON f.cliente_id = c.id
      INNER JOIN protese.cupons cup ON f.cupom_id = cup.id
      WHERE 1=1
    `;
    const params = [];
    let paramIndex = 1;

    if (cliente_id) {
      query += ` AND f.cliente_id = $${paramIndex}`;
      params.push(cliente_id);
      paramIndex++;
    }

    if (cupom_id) {
      query += ` AND f.cupom_id = $${paramIndex}`;
      params.push(cupom_id);
      paramIndex++;
    }

    if (cupom_liberado !== undefined) {
      query += ` AND f.cupom_liberado = $${paramIndex}`;
      params.push(cupom_liberado === 'true');
      paramIndex++;
    }

    if (cupom_usado !== undefined) {
      query += ` AND f.cupom_usado = $${paramIndex}`;
      params.push(cupom_usado === 'true');
      paramIndex++;
    }

    query += ` ORDER BY f.updated_at DESC`;

    const result = await pool.query(query, params);

    res.json({ fidelidades: result.rows });
  } catch (error) {
    console.error('Erro ao listar fidelidades:', error);
    res.status(500).json({ error: 'Erro ao listar fidelidades', message: error.message });
  }
});

/**
 * GET /api/v1/cupons-fidelidades/fidelidades/cliente/:clienteId
 * Busca fidelidades de um cliente específico
 */
router.get('/fidelidades/cliente/:clienteId', async (req, res) => {
  try {
    if (!(await verificarPermissao(req, res, 'ver'))) return;

    const result = await pool.query(
      `SELECT 
        f.*,
        cup.codigo as cupom_codigo,
        cup.nome as cupom_nome,
        cup.tipo_desconto,
        cup.valor_desconto,
        cup.aplicar_em
       FROM protese.fidelidades f
       INNER JOIN protese.cupons cup ON f.cupom_id = cup.id
       WHERE f.cliente_id = $1
       ORDER BY f.updated_at DESC`,
      [req.params.clienteId]
    );

    res.json({ fidelidades: result.rows });
  } catch (error) {
    console.error('Erro ao buscar fidelidades do cliente:', error);
    res.status(500).json({ error: 'Erro ao buscar fidelidades do cliente', message: error.message });
  }
});

/**
 * GET /api/v1/cupons-fidelidades/cupons/validar/:codigo
 * Valida um cupom para uso (verifica se pode ser usado)
 */
router.get('/cupons/validar/:codigo', async (req, res) => {
  try {
    const { cliente_id } = req.query;

    const cupomResult = await pool.query(
      'SELECT * FROM protese.cupons WHERE codigo = $1 AND is_active = true',
      [req.params.codigo.toUpperCase()]
    );

    if (cupomResult.rows.length === 0) {
      return res.status(404).json({ error: 'Cupom não encontrado ou inativo' });
    }

    const cupom = cupomResult.rows[0];

    // Verificar validade
    const hoje = new Date();
    if (cupom.validade_inicio && new Date(cupom.validade_inicio) > hoje) {
      return res.status(400).json({ error: 'Cupom ainda não está válido' });
    }

    if (cupom.validade_fim && new Date(cupom.validade_fim) < hoje) {
      return res.status(400).json({ error: 'Cupom expirado' });
    }

    // Verificar regra de uso
    if (cupom.regra_uso === 'unico') {
      // Verificar se já foi usado
      const usoCheck = await pool.query(
        'SELECT COUNT(*) as total FROM protese.cupons_usados WHERE cupom_id = $1',
        [cupom.id]
      );

      if (parseInt(usoCheck.rows[0].total) > 0) {
        return res.status(400).json({ error: 'Cupom já foi usado (uso único)' });
      }
    }

    if (cupom.regra_uso === 'limitado') {
      // Verificar se atingiu o limite
      const usoCheck = await pool.query(
        'SELECT COUNT(*) as total FROM protese.cupons_usados WHERE cupom_id = $1',
        [cupom.id]
      );

      if (parseInt(usoCheck.rows[0].total) >= cupom.limite_usos) {
        return res.status(400).json({ error: 'Cupom atingiu o limite de usos' });
      }
    }

    if (cupom.regra_uso === 'fidelidade') {
      if (!cliente_id) {
        return res.status(400).json({ error: 'Cliente é obrigatório para cupons de fidelidade' });
      }

      // Verificar se cliente tem fidelidade liberada
      const fidelidadeCheck = await pool.query(
        'SELECT * FROM protese.fidelidades WHERE cliente_id = $1 AND cupom_id = $2',
        [cliente_id, cupom.id]
      );

      if (fidelidadeCheck.rows.length === 0) {
        return res.status(400).json({ error: 'Cliente não possui fidelidade para este cupom' });
      }

      const fidelidade = fidelidadeCheck.rows[0];

      if (!fidelidade.cupom_liberado) {
        return res.status(400).json({ 
          error: 'Cupom ainda não foi liberado',
          progresso: {
            atual: fidelidade.quantidade_atual,
            necessario: fidelidade.quantidade_necessaria,
            percentual: Math.round((fidelidade.quantidade_atual / fidelidade.quantidade_necessaria) * 100)
          }
        });
      }

      if (fidelidade.cupom_usado) {
        return res.status(400).json({ error: 'Cupom de fidelidade já foi usado' });
      }
    }

    res.json({ 
      cupom: cupom,
      valido: true 
    });
  } catch (error) {
    console.error('Erro ao validar cupom:', error);
    res.status(500).json({ error: 'Erro ao validar cupom', message: error.message });
  }
});

/**
 * POST /api/v1/cupons-fidelidades/cupons/usar
 * Registra o uso de um cupom
 */
router.post('/cupons/usar', async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    const { cupom_id, cliente_id, venda_id, valor_desconto_aplicado } = req.body;

    if (!cupom_id || !venda_id) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Cupom ID e Venda ID são obrigatórios' });
    }

    // Verificar se cupom existe
    const cupomCheck = await client.query(
      'SELECT * FROM protese.cupons WHERE id = $1',
      [cupom_id]
    );

    if (cupomCheck.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Cupom não encontrado' });
    }

    const cupom = cupomCheck.rows[0];

    // Registrar uso do cupom
    await client.query(
      `INSERT INTO protese.cupons_usados 
       (cupom_id, cliente_id, venda_id, valor_desconto_aplicado, created_by)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        cupom_id,
        cliente_id || null,
        venda_id,
        valor_desconto_aplicado || 0,
        req.headers['x-user-id'] || null
      ]
    );

    // Se for cupom de fidelidade, marcar como usado e resetar contagem
    if (cupom.regra_uso === 'fidelidade' && cliente_id) {
      await client.query(
        `UPDATE protese.fidelidades 
         SET cupom_usado = true,
             data_uso = CURRENT_DATE,
             quantidade_atual = 0,
             cupom_liberado = false,
             updated_at = CURRENT_TIMESTAMP
         WHERE cliente_id = $1 AND cupom_id = $2`,
        [cliente_id, cupom_id]
      );
    }

    await client.query('COMMIT');

    res.json({ message: 'Uso do cupom registrado com sucesso' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Erro ao registrar uso do cupom:', error);
    res.status(500).json({ error: 'Erro ao registrar uso do cupom', message: error.message });
  } finally {
    client.release();
  }
});

/**
 * POST /api/v1/cupons-fidelidades/fidelidades/atualizar
 * Atualiza contagem de fidelidade após uma venda
 */
router.post('/fidelidades/atualizar', async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    const { cliente_id, venda_id, forma_pagamento } = req.body;

    if (!cliente_id || !venda_id) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Cliente ID e Venda ID são obrigatórios' });
    }

    // Buscar cupons de fidelidade ativos
    const cuponsFidelidade = await client.query(
      `SELECT * FROM protese.cupons 
       WHERE regra_uso = 'fidelidade' 
       AND is_active = true
       AND (validade_inicio IS NULL OR validade_inicio <= CURRENT_DATE)
       AND (validade_fim IS NULL OR validade_fim >= CURRENT_DATE)`
    );

    // Buscar serviços e produtos da venda
    const servicosResult = await client.query(
      'SELECT servico_id FROM protese.vendas_servicos WHERE venda_id = $1',
      [venda_id]
    );

    const produtosResult = await client.query(
      'SELECT produto_id, quantidade FROM protese.vendas_produtos WHERE venda_id = $1',
      [venda_id]
    );

    const temServicos = servicosResult.rows.length > 0;
    const temProdutos = produtosResult.rows.length > 0;
    const isPagamentoOnline = ['pix', 'ted', 'cartao_1x'].includes(forma_pagamento);

    // Processar cada cupom de fidelidade
    for (const cupom of cuponsFidelidade.rows) {
      let deveContar = false;

      // Verificar se deve contar baseado na regra de fidelidade
      switch (cupom.regra_fidelidade) {
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
            [venda_id]
          );
          deveContar = agendamentoCheck.rows.length > 0 && isPagamentoOnline;
          break;
      }

      if (!deveContar) continue;

      // Buscar ou criar registro de fidelidade
      let fidelidadeResult = await client.query(
        'SELECT * FROM protese.fidelidades WHERE cliente_id = $1 AND cupom_id = $2',
        [cliente_id, cupom.id]
      );

      if (fidelidadeResult.rows.length === 0) {
        // Criar novo registro
        await client.query(
          `INSERT INTO protese.fidelidades 
           (cliente_id, cupom_id, tipo_contagem, quantidade_atual, quantidade_necessaria)
           VALUES ($1, $2, $3, 1, $4)`,
          [cliente_id, cupom.id, cupom.regra_fidelidade, cupom.quantidade_fidelidade]
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
            [cliente_id, cupom.id]
          );
        } else {
          // Incrementar contagem
          const novaQuantidade = fidelidade.quantidade_atual + 1;
          const quantidadeNecessaria = cupom.quantidade_fidelidade;

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
            [novaQuantidade, cupomLiberado, cliente_id, cupom.id]
          );
        }
      }
    }

    await client.query('COMMIT');

    res.json({ message: 'Fidelidades atualizadas com sucesso' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Erro ao atualizar fidelidades:', error);
    res.status(500).json({ error: 'Erro ao atualizar fidelidades', message: error.message });
  } finally {
    client.release();
  }
});

module.exports = router;

