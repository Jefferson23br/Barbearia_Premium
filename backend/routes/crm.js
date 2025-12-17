const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { registrarLog, getClientIp, getUserAgent } = require('../utils/logger');

console.log('[CRM] ✅ Módulo de rotas CRM carregado com sucesso');

/**
 * GET /api/v1/crm/test
 * Endpoint de teste para verificar se a rota está funcionando
 */
router.get('/test', (req, res) => {
  console.log('[CRM] 🧪 Endpoint de teste chamado');
  res.json({ 
    message: 'Rota CRM funcionando!', 
    timestamp: new Date().toISOString(),
    module: 'crm'
  });
});

/**
 * GET /api/v1/crm/buscar-clientes
 * Busca clientes por nome ou email
 */
router.get('/buscar-clientes', async (req, res) => {
  try {
    console.log(`[CRM] 🔍 Busca de clientes iniciada`);
    const usuarioId = req.headers['x-user-id'];
    const usuarioTipo = req.headers['x-user-tipo'] || 'administrativo';

    // Verificar permissão
    if (usuarioTipo !== 'master') {
      const permissoesResult = await pool.query(
        'SELECT crm_ver FROM protese.permissoes_usuarios WHERE usuario_id = $1',
        [usuarioId]
      );

      if (permissoesResult.rows.length === 0 || !permissoesResult.rows[0].crm_ver) {
        console.log(`[CRM] ❌ Permissão negada para busca de clientes`);
        return res.status(403).json({ error: 'Acesso negado. Permissão insuficiente.' });
      }
    }

    const { search } = req.query;
    console.log(`[CRM] 🔎 Termo de busca: "${search}"`);

    if (!search || search.trim().length < 2) {
      console.log(`[CRM] ⚠️ Termo de busca muito curto, retornando vazio`);
      return res.json({ clientes: [] });
    }

    const searchTerm = `%${search.trim()}%`;

    const result = await pool.query(
      `SELECT 
        id,
        nome_completo,
        email,
        cpf,
        foto_url,
        is_active
       FROM protese.usuarios_clientes
       WHERE (nome_completo ILIKE $1 OR email ILIKE $1)
       AND is_active = true
       ORDER BY nome_completo ASC
       LIMIT 20`,
      [searchTerm]
    );

    console.log(`[CRM] ✅ Clientes encontrados: ${result.rows.length}`);
    res.json({ clientes: result.rows });
  } catch (error) {
    console.error(`[CRM] ❌ Erro ao buscar clientes:`, error);
    console.error(`[CRM] ❌ Mensagem:`, error.message);
    console.error(`[CRM] ❌ Stack:`, error.stack);
    res.status(500).json({ error: 'Erro ao buscar clientes', details: error.message });
  }
});

/**
 * GET /api/v1/crm/cliente/:id/dados
 * Busca todos os dados do CRM de um cliente (agendamentos, vendas, receitas)
 */
router.get('/cliente/:id/dados', async (req, res) => {
  const clienteId = req.params.id;
  console.log(`[CRM] ==========================================`);
  console.log(`[CRM] 🔍 INICIANDO busca de dados do cliente: ${clienteId}`);
  console.log(`[CRM] 📍 Rota: /api/v1/crm/cliente/:id/dados`);
  console.log(`[CRM] ==========================================`);
  
  try {
    const usuarioId = req.headers['x-user-id'];
    const usuarioTipo = req.headers['x-user-tipo'] || 'administrativo';

    console.log(`[CRM] 👤 Usuário: ${usuarioId}, Tipo: ${usuarioTipo}`);

    // Verificar permissão
    if (usuarioTipo !== 'master') {
      console.log(`[CRM] 🔐 Verificando permissões para usuário: ${usuarioId}`);
      const permissoesResult = await pool.query(
        'SELECT crm_ver FROM protese.permissoes_usuarios WHERE usuario_id = $1',
        [usuarioId]
      );

      if (permissoesResult.rows.length === 0 || !permissoesResult.rows[0].crm_ver) {
        console.log(`[CRM] ❌ Permissão negada para usuário: ${usuarioId}`);
        return res.status(403).json({ error: 'Acesso negado. Permissão insuficiente.' });
      }
      console.log(`[CRM] ✅ Permissão concedida`);
    } else {
      console.log(`[CRM] ✅ Usuário master, permissão concedida`);
    }

    // Buscar dados do cliente
    console.log(`[CRM] 📋 Buscando dados do cliente...`);
    const clienteResult = await pool.query(
      `SELECT 
        id,
        nome_completo,
        email,
        cpf,
        foto_url,
        funcionario_responsavel_id,
        ua.nome_completo as funcionario_responsavel_nome
       FROM protese.usuarios_clientes uc
       LEFT JOIN protese.usuarios_administrativos ua ON uc.funcionario_responsavel_id = ua.id
       WHERE uc.id = $1`,
      [clienteId]
    );

    if (clienteResult.rows.length === 0) {
      console.log(`[CRM] ❌ Cliente não encontrado: ${clienteId}`);
      return res.status(404).json({ error: 'Cliente não encontrado' });
    }

    const cliente = clienteResult.rows[0];
    console.log(`[CRM] ✅ Cliente encontrado: ${cliente.nome_completo}`);

    // Buscar agendamentos
    console.log(`[CRM] 📅 Buscando agendamentos...`);
    let agendamentosResult;
    try {
      agendamentosResult = await pool.query(
        `SELECT 
          a.*,
          s.nome as servico_nome,
          f.nome_completo as funcionario_nome
         FROM protese.agendamentos a
         INNER JOIN protese.servicos s ON a.servico_id = s.id
         INNER JOIN protese.usuarios_administrativos f ON a.funcionario_id = f.id
         WHERE a.cliente_id = $1
         ORDER BY a.data_agendamento DESC, a.hora_inicio DESC`,
        [clienteId]
      );
      console.log(`[CRM] ✅ Agendamentos encontrados: ${agendamentosResult.rows.length}`);
    } catch (error) {
      console.error(`[CRM] ❌ Erro ao buscar agendamentos:`, error);
      console.error(`[CRM] ❌ Stack:`, error.stack);
      agendamentosResult = { rows: [] };
    }

    // Buscar vendas
    console.log(`[CRM] 🛒 Buscando vendas...`);
    let vendasResult;
    try {
      vendasResult = await pool.query(
        `SELECT 
          v.*,
          f.nome_completo as funcionario_nome
         FROM protese.vendas v
         LEFT JOIN protese.usuarios_administrativos f ON v.funcionario_id = f.id
         WHERE v.cliente_id = $1
         ORDER BY v.data_venda DESC, v.created_at DESC`,
        [clienteId]
      );
      console.log(`[CRM] ✅ Vendas encontradas: ${vendasResult.rows.length}`);
    } catch (error) {
      console.error(`[CRM] ❌ Erro ao buscar vendas:`, error);
      console.error(`[CRM] ❌ Stack:`, error.stack);
      vendasResult = { rows: [] };
    }

    // Buscar receitas (financeiro)
    console.log(`[CRM] 💰 Buscando receitas...`);
    let receitasResult;
    try {
      receitasResult = await pool.query(
        `SELECT 
          r.*,
          ca.nome as caixa_nome,
          v.ticket as venda_ticket
         FROM protese.receitas r
         LEFT JOIN protese.contas ca ON r.caixa_id = ca.id
         LEFT JOIN protese.vendas v ON r.venda_id = v.id
         WHERE r.cliente_id = $1
         ORDER BY r.data_emissao DESC, r.data_vencimento DESC`,
        [clienteId]
      );
      console.log(`[CRM] ✅ Receitas encontradas: ${receitasResult.rows.length}`);
    } catch (error) {
      console.error(`[CRM] ❌ Erro ao buscar receitas:`, error);
      console.error(`[CRM] ❌ Stack:`, error.stack);
      receitasResult = { rows: [] };
    }

    // Buscar relacionamentos
    console.log(`[CRM] 💬 Buscando relacionamentos...`);
    let relacionamentosResult = { rows: [] };
    try {
      relacionamentosResult = await pool.query(
        `SELECT 
          r.*,
          ua.nome_completo as funcionario_nome
         FROM protese.crm_relacionamentos r
         LEFT JOIN protese.usuarios_administrativos ua ON r.funcionario_id = ua.id
         WHERE r.cliente_id = $1
         ORDER BY r.data_interacao DESC, r.created_at DESC`,
        [clienteId]
      );
      console.log(`[CRM] ✅ Relacionamentos encontrados: ${relacionamentosResult.rows.length}`);
    } catch (error) {
      console.error(`[CRM] ❌ Erro ao buscar relacionamentos:`, error);
      console.error(`[CRM] ❌ Mensagem:`, error.message);
      console.error(`[CRM] ❌ Código:`, error.code);
      console.error(`[CRM] ❌ Detalhes:`, error.detail);
      console.error(`[CRM] ❌ Stack:`, error.stack);
      
      // Se a tabela não existir, retornar array vazio (não propagar erro)
      if (error.code === '42P01' || error.message.includes('does not exist') || error.message.includes('não existe') || error.message.includes('relation') || error.message.includes('tabela')) {
        console.log(`[CRM] ⚠️ Tabela crm_relacionamentos não existe. Retornando array vazio.`);
        relacionamentosResult = { rows: [] };
      } else {
        // Para outros erros, também retornar array vazio para não quebrar a requisição
        console.log(`[CRM] ⚠️ Erro ao buscar relacionamentos, mas continuando com array vazio para não quebrar a requisição`);
        relacionamentosResult = { rows: [] };
      }
    }

    console.log(`[CRM] ✅ Dados carregados com sucesso para cliente: ${clienteId}`);
    res.json({
      cliente,
      agendamentos: agendamentosResult.rows,
      vendas: vendasResult.rows,
      receitas: receitasResult.rows,
      relacionamentos: relacionamentosResult.rows
    });
  } catch (error) {
    console.error(`[CRM] ❌❌❌ ERRO CRÍTICO ao buscar dados do CRM:`, error);
    console.error(`[CRM] ❌ Mensagem:`, error.message);
    console.error(`[CRM] ❌ Código:`, error.code);
    console.error(`[CRM] ❌ Detalhes:`, error.detail);
    console.error(`[CRM] ❌ Stack completo:`, error.stack);
    res.status(500).json({ 
      error: 'Erro ao buscar dados do CRM', 
      details: error.message,
      code: error.code,
      hint: error.hint || null
    });
  }
});

/**
 * GET /api/v1/crm/cliente/:id/relacionamentos
 * Lista relacionamentos de um cliente
 */
router.get('/cliente/:id/relacionamentos', async (req, res) => {
  try {
    console.log(`[CRM] 💬 Buscando relacionamentos para cliente: ${req.params.id}`);
    const usuarioId = req.headers['x-user-id'];
    const usuarioTipo = req.headers['x-user-tipo'] || 'administrativo';

    // Verificar permissão
    if (usuarioTipo !== 'master') {
      const permissoesResult = await pool.query(
        'SELECT crm_ver FROM protese.permissoes_usuarios WHERE usuario_id = $1',
        [usuarioId]
      );

      if (permissoesResult.rows.length === 0 || !permissoesResult.rows[0].crm_ver) {
        console.log(`[CRM] ❌ Permissão negada`);
        return res.status(403).json({ error: 'Acesso negado. Permissão insuficiente.' });
      }
    }

    const { id } = req.params;

    const result = await pool.query(
      `SELECT 
        r.*,
        ua.nome_completo as funcionario_nome
       FROM protese.crm_relacionamentos r
       LEFT JOIN protese.usuarios_administrativos ua ON r.funcionario_id = ua.id
       WHERE r.cliente_id = $1
       ORDER BY r.data_interacao DESC, r.created_at DESC`,
      [id]
    );

    console.log(`[CRM] ✅ Relacionamentos encontrados: ${result.rows.length}`);
    res.json({ relacionamentos: result.rows });
  } catch (error) {
    console.error(`[CRM] ❌ Erro ao buscar relacionamentos:`, error);
    console.error(`[CRM] ❌ Mensagem:`, error.message);
    console.error(`[CRM] ❌ Código:`, error.code);
    console.error(`[CRM] ❌ Stack:`, error.stack);
    
    // Se a tabela não existir, retornar array vazio
    if (error.code === '42P01' || error.message.includes('does not exist') || error.message.includes('não existe')) {
      console.log(`[CRM] ⚠️ Tabela crm_relacionamentos não existe. Retornando array vazio.`);
      return res.json({ relacionamentos: [] });
    }
    
    res.status(500).json({ error: 'Erro ao buscar relacionamentos', details: error.message });
  }
});

/**
 * POST /api/v1/crm/cliente/:id/relacionamentos
 * Cria um novo relacionamento/interação
 */
router.post('/cliente/:id/relacionamentos', async (req, res) => {
  try {
    console.log(`[CRM] ➕ Criando relacionamento para cliente: ${req.params.id}`);
    const usuarioId = req.headers['x-user-id'];
    const usuarioTipo = req.headers['x-user-tipo'] || 'administrativo';

    // Verificar permissão
    if (usuarioTipo !== 'master') {
      const permissoesResult = await pool.query(
        'SELECT crm_editar FROM protese.permissoes_usuarios WHERE usuario_id = $1',
        [usuarioId]
      );

      if (permissoesResult.rows.length === 0 || !permissoesResult.rows[0].crm_editar) {
        console.log(`[CRM] ❌ Permissão negada para criar relacionamento`);
        return res.status(403).json({ error: 'Acesso negado. Permissão insuficiente.' });
      }
    }

    const { id } = req.params;
    const { data_interacao, tipo_interacao, descricao, observacoes } = req.body;

    console.log(`[CRM] 📝 Dados recebidos:`, { data_interacao, tipo_interacao, descricao: descricao?.substring(0, 50) });

    if (!data_interacao || !tipo_interacao || !descricao) {
      console.log(`[CRM] ❌ Campos obrigatórios faltando`);
      return res.status(400).json({ error: 'Data, tipo e descrição são obrigatórios' });
    }

    // Verificar se cliente existe
    const clienteCheck = await pool.query(
      'SELECT id FROM protese.usuarios_clientes WHERE id = $1',
      [id]
    );

    if (clienteCheck.rows.length === 0) {
      console.log(`[CRM] ❌ Cliente não encontrado: ${id}`);
      return res.status(404).json({ error: 'Cliente não encontrado' });
    }

    console.log(`[CRM] 💾 Inserindo relacionamento no banco...`);
    const result = await pool.query(
      `INSERT INTO protese.crm_relacionamentos 
       (cliente_id, funcionario_id, data_interacao, tipo_interacao, descricao, observacoes, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [id, usuarioId, data_interacao, tipo_interacao, descricao, observacoes || null, usuarioId]
    );

    console.log(`[CRM] ✅ Relacionamento criado: ${result.rows[0].id}`);

    // Buscar relacionamento completo
    const relacionamentoCompleto = await pool.query(
      `SELECT 
        r.*,
        ua.nome_completo as funcionario_nome
       FROM protese.crm_relacionamentos r
       LEFT JOIN protese.usuarios_administrativos ua ON r.funcionario_id = ua.id
       WHERE r.id = $1`,
      [result.rows[0].id]
    );

    await registrarLog({
      usuario_id: usuarioId,
      usuario_tipo: usuarioTipo,
      usuario_nome: req.headers['x-user-nome'] || null,
      acao: 'criar',
      modulo: 'crm',
      entidade_id: result.rows[0].id,
      entidade_tipo: 'relacionamento',
      descricao: `Criou interação no CRM para cliente ${id}`,
      dados_novos: result.rows[0],
      ip_address: getClientIp(req),
      user_agent: getUserAgent(req)
    });

    res.status(201).json({ relacionamento: relacionamentoCompleto.rows[0] });
  } catch (error) {
    console.error(`[CRM] ❌ Erro ao criar relacionamento:`, error);
    console.error(`[CRM] ❌ Mensagem:`, error.message);
    console.error(`[CRM] ❌ Código:`, error.code);
    console.error(`[CRM] ❌ Detalhes:`, error.detail);
    console.error(`[CRM] ❌ Stack:`, error.stack);
    res.status(500).json({ error: 'Erro ao criar relacionamento', details: error.message, code: error.code });
  }
});

/**
 * PUT /api/v1/crm/cliente/:id/relacionamentos/:relacionamento_id
 * Atualiza um relacionamento
 */
router.put('/cliente/:id/relacionamentos/:relacionamento_id', async (req, res) => {
  try {
    const usuarioId = req.headers['x-user-id'];
    const usuarioTipo = req.headers['x-user-tipo'] || 'administrativo';

    // Verificar permissão
    if (usuarioTipo !== 'master') {
      const permissoesResult = await pool.query(
        'SELECT crm_editar FROM protese.permissoes_usuarios WHERE usuario_id = $1',
        [usuarioId]
      );

      if (permissoesResult.rows.length === 0 || !permissoesResult.rows[0].crm_editar) {
        return res.status(403).json({ error: 'Acesso negado. Permissão insuficiente.' });
      }
    }

    const { relacionamento_id } = req.params;
    const { data_interacao, tipo_interacao, descricao, observacoes } = req.body;

    // Buscar relacionamento atual
    const relacionamentoAtual = await pool.query(
      'SELECT * FROM protese.crm_relacionamentos WHERE id = $1',
      [relacionamento_id]
    );

    if (relacionamentoAtual.rows.length === 0) {
      return res.status(404).json({ error: 'Relacionamento não encontrado' });
    }

    const result = await pool.query(
      `UPDATE protese.crm_relacionamentos 
       SET data_interacao = COALESCE($1, data_interacao),
           tipo_interacao = COALESCE($2, tipo_interacao),
           descricao = COALESCE($3, descricao),
           observacoes = COALESCE($4, observacoes),
           updated_by = $5,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $6
       RETURNING *`,
      [data_interacao, tipo_interacao, descricao, observacoes, usuarioId, relacionamento_id]
    );

    // Buscar relacionamento completo
    const relacionamentoCompleto = await pool.query(
      `SELECT 
        r.*,
        ua.nome_completo as funcionario_nome
       FROM protese.crm_relacionamentos r
       LEFT JOIN protese.usuarios_administrativos ua ON r.funcionario_id = ua.id
       WHERE r.id = $1`,
      [relacionamento_id]
    );

    await registrarLog({
      usuario_id: usuarioId,
      usuario_tipo: usuarioTipo,
      usuario_nome: req.headers['x-user-nome'] || null,
      acao: 'editar',
      modulo: 'crm',
      entidade_id: relacionamento_id,
      entidade_tipo: 'relacionamento',
      descricao: `Atualizou interação no CRM`,
      dados_anteriores: relacionamentoAtual.rows[0],
      dados_novos: result.rows[0],
      ip_address: getClientIp(req),
      user_agent: getUserAgent(req)
    });

    res.json({ relacionamento: relacionamentoCompleto.rows[0] });
  } catch (error) {
    console.error('Erro ao atualizar relacionamento:', error);
    res.status(500).json({ error: 'Erro ao atualizar relacionamento' });
  }
});

/**
 * DELETE /api/v1/crm/cliente/:id/relacionamentos/:relacionamento_id
 * Exclui um relacionamento
 */
router.delete('/cliente/:id/relacionamentos/:relacionamento_id', async (req, res) => {
  try {
    const usuarioId = req.headers['x-user-id'];
    const usuarioTipo = req.headers['x-user-tipo'] || 'administrativo';

    // Verificar permissão
    if (usuarioTipo !== 'master') {
      const permissoesResult = await pool.query(
        'SELECT crm_excluir FROM protese.permissoes_usuarios WHERE usuario_id = $1',
        [usuarioId]
      );

      if (permissoesResult.rows.length === 0 || !permissoesResult.rows[0].crm_excluir) {
        return res.status(403).json({ error: 'Acesso negado. Permissão insuficiente.' });
      }
    }

    const { relacionamento_id } = req.params;

    // Buscar relacionamento antes de excluir
    const relacionamento = await pool.query(
      'SELECT * FROM protese.crm_relacionamentos WHERE id = $1',
      [relacionamento_id]
    );

    if (relacionamento.rows.length === 0) {
      return res.status(404).json({ error: 'Relacionamento não encontrado' });
    }

    await pool.query('DELETE FROM protese.crm_relacionamentos WHERE id = $1', [relacionamento_id]);

    await registrarLog({
      usuario_id: usuarioId,
      usuario_tipo: usuarioTipo,
      usuario_nome: req.headers['x-user-nome'] || null,
      acao: 'excluir',
      modulo: 'crm',
      entidade_id: relacionamento_id,
      entidade_tipo: 'relacionamento',
      descricao: `Excluiu interação no CRM`,
      dados_anteriores: relacionamento.rows[0],
      ip_address: getClientIp(req),
      user_agent: getUserAgent(req)
    });

    res.json({ message: 'Relacionamento excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir relacionamento:', error);
    res.status(500).json({ error: 'Erro ao excluir relacionamento' });
  }
});

module.exports = router;

