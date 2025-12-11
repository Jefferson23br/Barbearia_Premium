const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { registrarLog, getClientIp, getUserAgent } = require('../utils/logger');

/**
 * GET /api/v1/fechamentos-especiais
 * Busca todos os fechamentos especiais (ativos e inativos)
 * Query params: ?ativo=true para filtrar apenas ativos
 */
router.get('/', async (req, res) => {
  try {
    const { ativo } = req.query;
    let query = 'SELECT * FROM protese.fechamentos_especiais';
    const params = [];

    if (ativo === 'true') {
      query += ' WHERE is_active = true';
    }

    query += ' ORDER BY data_fechamento ASC';

    const result = await pool.query(query, params);

    res.json({
      fechamentos: result.rows,
    });
  } catch (error) {
    console.error('Erro ao buscar fechamentos especiais:', error);
    res.status(500).json({
      error: 'Erro ao buscar fechamentos especiais',
      message: error.message,
    });
  }
});

/**
 * GET /api/v1/fechamentos-especiais/verificar/:data
 * Verifica se uma data específica está fechada
 * Formato da data: YYYY-MM-DD
 */
router.get('/verificar/:data', async (req, res) => {
  try {
    const { data } = req.params;

    // Validar formato da data
    if (!/^\d{4}-\d{2}-\d{2}$/.test(data)) {
      return res.status(400).json({
        error: 'Formato de data inválido. Use YYYY-MM-DD',
      });
    }

    const result = await pool.query(
      'SELECT * FROM protese.fechamentos_especiais WHERE data_fechamento = $1 AND is_active = true',
      [data]
    );

    if (result.rows.length > 0) {
      res.json({
        fechado: true,
        fechamento: result.rows[0],
      });
    } else {
      res.json({
        fechado: false,
        fechamento: null,
      });
    }
  } catch (error) {
    console.error('Erro ao verificar fechamento:', error);
    res.status(500).json({
      error: 'Erro ao verificar fechamento',
      message: error.message,
    });
  }
});

/**
 * POST /api/v1/fechamentos-especiais
 * Cria um novo fechamento especial
 */
router.post('/', async (req, res) => {
  try {
    const { data_fechamento, descricao, is_active } = req.body;
    const usuarioLogadoId = req.headers['x-user-id'] || null;
    const usuarioLogadoTipo = req.headers['x-user-tipo'] || 'administrativo';

    // Validações
    if (!data_fechamento) {
      return res.status(400).json({
        error: 'Data de fechamento é obrigatória',
      });
    }

    if (!descricao || descricao.trim() === '') {
      return res.status(400).json({
        error: 'Descrição é obrigatória',
      });
    }

    // Validar formato da data
    if (!/^\d{4}-\d{2}-\d{2}$/.test(data_fechamento)) {
      return res.status(400).json({
        error: 'Formato de data inválido. Use YYYY-MM-DD',
      });
    }

    // Verificar se já existe fechamento para esta data
    const existe = await pool.query(
      'SELECT id FROM protese.fechamentos_especiais WHERE data_fechamento = $1',
      [data_fechamento]
    );

    if (existe.rows.length > 0) {
      return res.status(409).json({
        error: 'Já existe um fechamento para esta data',
      });
    }

    // Inserir fechamento
    const result = await pool.query(
      `INSERT INTO protese.fechamentos_especiais 
       (data_fechamento, descricao, is_active, created_by) 
       VALUES ($1, $2, $3, $4) 
       RETURNING *`,
      [
        data_fechamento,
        descricao.trim(),
        is_active !== undefined ? is_active : true,
        usuarioLogadoId,
      ]
    );

    const fechamento = result.rows[0];

    // Registrar log
    if (usuarioLogadoId) {
      await registrarLog({
        usuarioId: usuarioLogadoId,
        usuarioTipo: usuarioLogadoTipo,
        acao: 'criar',
        modulo: 'fechamento_especial',
        entidadeId: fechamento.id,
        entidadeTipo: 'fechamento_especial',
        descricao: `Fechamento especial criado: ${descricao} - ${data_fechamento}`,
        dadosNovos: fechamento,
        ipAddress: getClientIp(req),
        userAgent: getUserAgent(req),
      });
    }

    res.status(201).json({
      message: 'Fechamento especial criado com sucesso!',
      fechamento,
    });
  } catch (error) {
    console.error('Erro ao criar fechamento especial:', error);
    res.status(500).json({
      error: 'Erro ao criar fechamento especial',
      message: error.message,
    });
  }
});

/**
 * PUT /api/v1/fechamentos-especiais/:id
 * Atualiza um fechamento especial existente
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { data_fechamento, descricao, is_active } = req.body;
    const usuarioLogadoId = req.headers['x-user-id'] || null;
    const usuarioLogadoTipo = req.headers['x-user-tipo'] || 'administrativo';

    // Verificar se o fechamento existe
    const existe = await pool.query(
      'SELECT * FROM protese.fechamentos_especiais WHERE id = $1',
      [id]
    );

    if (existe.rows.length === 0) {
      return res.status(404).json({
        error: 'Fechamento especial não encontrado',
      });
    }

    // Validações
    if (data_fechamento && !/^\d{4}-\d{2}-\d{2}$/.test(data_fechamento)) {
      return res.status(400).json({
        error: 'Formato de data inválido. Use YYYY-MM-DD',
      });
    }

    if (descricao !== undefined && descricao.trim() === '') {
      return res.status(400).json({
        error: 'Descrição não pode ser vazia',
      });
    }

    // Se a data mudou, verificar se não existe outro fechamento com a nova data
    if (data_fechamento && data_fechamento !== existe.rows[0].data_fechamento) {
      const dataExiste = await pool.query(
        'SELECT id FROM protese.fechamentos_especiais WHERE data_fechamento = $1 AND id != $2',
        [data_fechamento, id]
      );

      if (dataExiste.rows.length > 0) {
        return res.status(409).json({
          error: 'Já existe um fechamento para esta data',
        });
      }
    }

    // Atualizar fechamento
    const dadosAntigos = existe.rows[0];
    const result = await pool.query(
      `UPDATE protese.fechamentos_especiais 
       SET data_fechamento = COALESCE($1, data_fechamento),
           descricao = COALESCE($2, descricao),
           is_active = COALESCE($3, is_active),
           updated_by = $4,
           updated_at = NOW()
       WHERE id = $5
       RETURNING *`,
      [
        data_fechamento || null,
        descricao ? descricao.trim() : null,
        is_active !== undefined ? is_active : null,
        usuarioLogadoId,
        id,
      ]
    );

    const fechamento = result.rows[0];

    // Registrar log
    if (usuarioLogadoId) {
      await registrarLog({
        usuarioId: usuarioLogadoId,
        usuarioTipo: usuarioLogadoTipo,
        acao: 'editar',
        modulo: 'fechamento_especial',
        entidadeId: fechamento.id,
        entidadeTipo: 'fechamento_especial',
        descricao: `Fechamento especial atualizado: ${fechamento.descricao} - ${fechamento.data_fechamento}`,
        dadosAntigos,
        dadosNovos: fechamento,
        ipAddress: getClientIp(req),
        userAgent: getUserAgent(req),
      });
    }

    res.json({
      message: 'Fechamento especial atualizado com sucesso!',
      fechamento,
    });
  } catch (error) {
    console.error('Erro ao atualizar fechamento especial:', error);
    res.status(500).json({
      error: 'Erro ao atualizar fechamento especial',
      message: error.message,
    });
  }
});

/**
 * DELETE /api/v1/fechamentos-especiais/:id
 * Remove um fechamento especial
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const usuarioLogadoId = req.headers['x-user-id'] || null;
    const usuarioLogadoTipo = req.headers['x-user-tipo'] || 'administrativo';

    // Verificar se o fechamento existe
    const existe = await pool.query(
      'SELECT * FROM protese.fechamentos_especiais WHERE id = $1',
      [id]
    );

    if (existe.rows.length === 0) {
      return res.status(404).json({
        error: 'Fechamento especial não encontrado',
      });
    }

    const fechamento = existe.rows[0];

    // Deletar fechamento
    await pool.query('DELETE FROM protese.fechamentos_especiais WHERE id = $1', [id]);

    // Registrar log
    if (usuarioLogadoId) {
      await registrarLog({
        usuarioId: usuarioLogadoId,
        usuarioTipo: usuarioLogadoTipo,
        acao: 'excluir',
        modulo: 'fechamento_especial',
        entidadeId: id,
        entidadeTipo: 'fechamento_especial',
        descricao: `Fechamento especial excluído: ${fechamento.descricao} - ${fechamento.data_fechamento}`,
        dadosAntigos: fechamento,
        ipAddress: getClientIp(req),
        userAgent: getUserAgent(req),
      });
    }

    res.json({
      message: 'Fechamento especial excluído com sucesso!',
    });
  } catch (error) {
    console.error('Erro ao excluir fechamento especial:', error);
    res.status(500).json({
      error: 'Erro ao excluir fechamento especial',
      message: error.message,
    });
  }
});

module.exports = router;

