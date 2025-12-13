const express = require('express');
const router = express.Router();
const pool = require('../config/database');

/**
 * GET /api/v1/logs
 * Lista logs do sistema com filtros
 */
router.get('/', async (req, res) => {
  try {
    const {
      data_inicio,
      data_fim,
      modulo,
      acao,
      usuario_id,
      usuario_tipo,
      status,
      limit = 100,
      offset = 0,
    } = req.query;

    // Valores padrão: último mês
    const hoje = new Date();
    const umMesAtras = new Date(hoje);
    umMesAtras.setMonth(umMesAtras.getMonth() - 1);

    const dataInicio = data_inicio || umMesAtras.toISOString().split('T')[0];
    const dataFim = data_fim || hoje.toISOString().split('T')[0];

    // Construir query dinâmica
    let query = `
      SELECT 
        ls.id,
        ls.usuario_id,
        ls.usuario_tipo,
        ls.usuario_nome,
        ls.acao,
        ls.modulo,
        ls.entidade_id,
        ls.entidade_tipo,
        ls.descricao,
        ls.dados_anteriores,
        ls.dados_novos,
        ls.ip_address,
        ls.user_agent,
        ls.status,
        ls.mensagem_erro,
        ls.created_at
      FROM protese.logs_sistema ls
      WHERE DATE(ls.created_at) BETWEEN $1 AND $2
    `;

    const params = [dataInicio, dataFim];
    let paramIndex = 3;

    // Filtros opcionais
    if (modulo) {
      query += ` AND ls.modulo = $${paramIndex}`;
      params.push(modulo);
      paramIndex++;
    }

    if (acao) {
      query += ` AND ls.acao = $${paramIndex}`;
      params.push(acao);
      paramIndex++;
    }

    if (usuario_id) {
      query += ` AND ls.usuario_id = $${paramIndex}`;
      params.push(usuario_id);
      paramIndex++;
    }

    if (usuario_tipo) {
      query += ` AND ls.usuario_tipo = $${paramIndex}`;
      params.push(usuario_tipo);
      paramIndex++;
    }

    if (status) {
      query += ` AND ls.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    // Ordenação e paginação
    query += ` ORDER BY ls.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(parseInt(limit), parseInt(offset));

    const result = await pool.query(query, params);

    // Contar total (para paginação)
    let countQuery = `
      SELECT COUNT(*) as total
      FROM protese.logs_sistema ls
      WHERE DATE(ls.created_at) BETWEEN $1 AND $2
    `;
    const countParams = [dataInicio, dataFim];
    let countParamIndex = 3;

    if (modulo) {
      countQuery += ` AND ls.modulo = $${countParamIndex}`;
      countParams.push(modulo);
      countParamIndex++;
    }

    if (acao) {
      countQuery += ` AND ls.acao = $${countParamIndex}`;
      countParams.push(acao);
      countParamIndex++;
    }

    if (usuario_id) {
      countQuery += ` AND ls.usuario_id = $${countParamIndex}`;
      countParams.push(usuario_id);
      countParamIndex++;
    }

    if (usuario_tipo) {
      countQuery += ` AND ls.usuario_tipo = $${countParamIndex}`;
      countParams.push(usuario_tipo);
      countParamIndex++;
    }

    if (status) {
      countQuery += ` AND ls.status = $${countParamIndex}`;
      countParams.push(status);
      countParamIndex++;
    }

    const countResult = await pool.query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].total);

    res.json({
      logs: result.rows,
      paginacao: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        total_paginas: Math.ceil(total / limit),
      },
      periodo: {
        data_inicio: dataInicio,
        data_fim: dataFim,
      },
    });
  } catch (error) {
    console.error('Erro ao buscar logs:', error);
    res.status(500).json({
      error: 'Erro ao buscar logs',
      message: error.message,
    });
  }
});

/**
 * GET /api/v1/logs/estatisticas
 * Retorna estatísticas dos logs no período
 */
router.get('/estatisticas', async (req, res) => {
  try {
    const { data_inicio, data_fim } = req.query;

    // Valores padrão: último mês
    const hoje = new Date();
    const umMesAtras = new Date(hoje);
    umMesAtras.setMonth(umMesAtras.getMonth() - 1);

    const dataInicio = data_inicio || umMesAtras.toISOString().split('T')[0];
    const dataFim = data_fim || hoje.toISOString().split('T')[0];

    // Total de logs
    const totalLogs = await pool.query(
      `SELECT COUNT(*) as total FROM protese.logs_sistema WHERE DATE(created_at) BETWEEN $1 AND $2`,
      [dataInicio, dataFim]
    );

    // Por módulo
    const porModulo = await pool.query(
      `SELECT modulo, COUNT(*) as quantidade
       FROM protese.logs_sistema
       WHERE DATE(created_at) BETWEEN $1 AND $2
       GROUP BY modulo
       ORDER BY quantidade DESC`,
      [dataInicio, dataFim]
    );

    // Por ação
    const porAcao = await pool.query(
      `SELECT acao, COUNT(*) as quantidade
       FROM protese.logs_sistema
       WHERE DATE(created_at) BETWEEN $1 AND $2
       GROUP BY acao
       ORDER BY quantidade DESC`,
      [dataInicio, dataFim]
    );

    // Por status
    const porStatus = await pool.query(
      `SELECT status, COUNT(*) as quantidade
       FROM protese.logs_sistema
       WHERE DATE(created_at) BETWEEN $1 AND $2
       GROUP BY status
       ORDER BY quantidade DESC`,
      [dataInicio, dataFim]
    );

    // Por usuário
    const porUsuario = await pool.query(
      `SELECT usuario_nome, usuario_tipo, COUNT(*) as quantidade
       FROM protese.logs_sistema
       WHERE DATE(created_at) BETWEEN $1 AND $2
         AND usuario_nome IS NOT NULL
       GROUP BY usuario_nome, usuario_tipo
       ORDER BY quantidade DESC
       LIMIT 10`,
      [dataInicio, dataFim]
    );

    // Por dia
    const porDia = await pool.query(
      `SELECT DATE(created_at) as data, COUNT(*) as quantidade
       FROM protese.logs_sistema
       WHERE DATE(created_at) BETWEEN $1 AND $2
       GROUP BY DATE(created_at)
       ORDER BY data DESC`,
      [dataInicio, dataFim]
    );

    res.json({
      periodo: {
        data_inicio: dataInicio,
        data_fim: dataFim,
      },
      total_logs: parseInt(totalLogs.rows[0].total || 0),
      por_modulo: porModulo.rows,
      por_acao: porAcao.rows,
      por_status: porStatus.rows,
      por_usuario: porUsuario.rows,
      por_dia: porDia.rows,
    });
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({
      error: 'Erro ao buscar estatísticas',
      message: error.message,
    });
  }
});

/**
 * GET /api/v1/logs/:id
 * Busca um log específico por ID
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT * FROM protese.logs_sistema WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Log não encontrado' });
    }

    res.json({ log: result.rows[0] });
  } catch (error) {
    console.error('Erro ao buscar log:', error);
    res.status(500).json({
      error: 'Erro ao buscar log',
      message: error.message,
    });
  }
});

module.exports = router;












