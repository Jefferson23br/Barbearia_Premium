const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { registrarLog, getClientIp, getUserAgent } = require('../utils/logger');

/**
 * GET /api/v1/integracoes
 * Lista todas as integrações
 */
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
        i.*,
        COALESCE(
          json_agg(
            json_build_object(
              'id', ih.id,
              'funcionalidade', ih.funcionalidade,
              'habilitado', ih.habilitado
            )
          ) FILTER (WHERE ih.id IS NOT NULL),
          '[]'
        ) as funcionalidades
      FROM integracoes i
      LEFT JOIN integracoes_habilitadas ih ON i.id = ih.integracao_id
      GROUP BY i.id
      ORDER BY i.created_at DESC`
    );

    res.json({
      integracoes: result.rows,
    });
  } catch (error) {
    console.error('Erro ao buscar integrações:', error);
    res.status(500).json({
      error: 'Erro ao buscar integrações',
      message: error.message,
    });
  }
});

/**
 * GET /api/v1/integracoes/:tipo
 * Busca uma integração específica por tipo
 */
router.get('/:tipo', async (req, res) => {
  try {
    const { tipo } = req.params;

    const result = await pool.query(
      `SELECT 
        i.*,
        COALESCE(
          json_agg(
            json_build_object(
              'id', ih.id,
              'funcionalidade', ih.funcionalidade,
              'habilitado', ih.habilitado
            )
          ) FILTER (WHERE ih.id IS NOT NULL),
          '[]'
        ) as funcionalidades
      FROM integracoes i
      LEFT JOIN integracoes_habilitadas ih ON i.id = ih.integracao_id
      WHERE i.tipo_integracao = $1
      GROUP BY i.id`,
      [tipo]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Integração não encontrada',
      });
    }

    const integracao = result.rows[0];
    delete integracao.senha_certificado;

    res.json({
      integracao: integracao,
    });
  } catch (error) {
    console.error('Erro ao buscar integração:', error);
    res.status(500).json({
      error: 'Erro ao buscar integração',
      message: error.message,
    });
  }
});

/**
 * POST /api/v1/integracoes
 * Cria uma nova integração
 */
router.post('/', async (req, res) => {
  try {
    const integracaoBody = req.body;
    const usuarioLogadoId = req.headers['x-user-id'] || null;
    const usuarioLogadoTipo = req.headers['x-user-tipo'] || 'administrativo';

    const valoresIntegracao = {
      tipo_integracao: integracaoBody.tipo_integracao || null,
      nome: integracaoBody.nome || null,
      ativo: integracaoBody.ativo !== undefined ? integracaoBody.ativo : false,
      ambiente: integracaoBody.ambiente || 'homologacao',
      token_producao: integracaoBody.token_producao || null,
      token_homologacao: integracaoBody.token_homologacao || null,
      certificado_digital_path: integracaoBody.certificado_digital_path || null,
      senha_certificado: integracaoBody.senha_certificado || null,
      cnpj: integracaoBody.cnpj || null,
      configuracao_json: integracaoBody.configuracao_json || null,
      updated_by: usuarioLogadoId,
    };

    const result = await pool.query(
      `INSERT INTO integracoes (
        tipo_integracao, nome, ativo, ambiente,
        token_producao, token_homologacao,
        certificado_digital_path, senha_certificado,
        cnpj, configuracao_json, updated_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *`,
      [
        valoresIntegracao.tipo_integracao,
        valoresIntegracao.nome,
        valoresIntegracao.ativo,
        valoresIntegracao.ambiente,
        valoresIntegracao.token_producao,
        valoresIntegracao.token_homologacao,
        valoresIntegracao.certificado_digital_path,
        valoresIntegracao.senha_certificado,
        valoresIntegracao.cnpj,
        valoresIntegracao.configuracao_json ? JSON.stringify(valoresIntegracao.configuracao_json) : null,
        valoresIntegracao.updated_by,
      ]
    );

    const integracao = result.rows[0];
    delete integracao.senha_certificado;

    if (usuarioLogadoId) {
      await registrarLog({
        usuarioId: usuarioLogadoId,
        usuarioTipo: usuarioLogadoTipo,
        acao: 'criar',
        modulo: 'integracao',
        entidadeId: integracao.id,
        entidadeTipo: 'integracao',
        descricao: `Integração ${valoresIntegracao.nome} criada`,
        dadosNovos: valoresIntegracao,
        ipAddress: getClientIp(req),
        userAgent: getUserAgent(req),
      });
    }

    res.status(201).json({
      message: 'Integração criada com sucesso!',
      integracao: integracao,
    });
  } catch (error) {
    console.error('Erro ao criar integração:', error);
    if (error.code === '23505') {
      return res.status(400).json({
        error: 'Já existe uma integração deste tipo',
      });
    }
    res.status(500).json({
      error: 'Erro ao criar integração',
      message: error.message,
    });
  }
});

/**
 * PUT /api/v1/integracoes/:tipo
 * Atualiza uma integração
 */
router.put('/:tipo', async (req, res) => {
  try {
    const { tipo } = req.params;
    const integracaoBody = req.body;
    const usuarioLogadoId = req.headers['x-user-id'] || null;
    const usuarioLogadoTipo = req.headers['x-user-tipo'] || 'administrativo';

    const valoresIntegracao = {
      nome: integracaoBody.nome || null,
      ativo: integracaoBody.ativo !== undefined ? integracaoBody.ativo : false,
      ambiente: integracaoBody.ambiente || 'homologacao',
      token_producao: integracaoBody.token_producao || null,
      token_homologacao: integracaoBody.token_homologacao || null,
      certificado_digital_path: integracaoBody.certificado_digital_path || null,
      senha_certificado: integracaoBody.senha_certificado || null,
      cnpj: integracaoBody.cnpj || null,
      configuracao_json: integracaoBody.configuracao_json || null,
      updated_by: usuarioLogadoId,
    };

    const result = await pool.query(
      `UPDATE integracoes SET
        nome = $1,
        ativo = $2,
        ambiente = $3,
        token_producao = $4,
        token_homologacao = $5,
        certificado_digital_path = $6,
        senha_certificado = COALESCE($7, senha_certificado),
        cnpj = $8,
        configuracao_json = $9,
        updated_by = $10,
        updated_at = NOW()
      WHERE tipo_integracao = $11
      RETURNING *`,
      [
        valoresIntegracao.nome,
        valoresIntegracao.ativo,
        valoresIntegracao.ambiente,
        valoresIntegracao.token_producao,
        valoresIntegracao.token_homologacao,
        valoresIntegracao.certificado_digital_path,
        valoresIntegracao.senha_certificado,
        valoresIntegracao.cnpj,
        valoresIntegracao.configuracao_json ? JSON.stringify(valoresIntegracao.configuracao_json) : null,
        valoresIntegracao.updated_by,
        tipo,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Integração não encontrada',
      });
    }

    const integracao = result.rows[0];
    delete integracao.senha_certificado;

    if (usuarioLogadoId) {
      await registrarLog({
        usuarioId: usuarioLogadoId,
        usuarioTipo: usuarioLogadoTipo,
        acao: 'editar',
        modulo: 'integracao',
        entidadeId: integracao.id,
        entidadeTipo: 'integracao',
        descricao: `Integração ${valoresIntegracao.nome} atualizada`,
        dadosNovos: valoresIntegracao,
        ipAddress: getClientIp(req),
        userAgent: getUserAgent(req),
      });
    }

    res.json({
      message: 'Integração atualizada com sucesso!',
      integracao: integracao,
    });
  } catch (error) {
    console.error('Erro ao atualizar integração:', error);
    res.status(500).json({
      error: 'Erro ao atualizar integração',
      message: error.message,
    });
  }
});

/**
 * PUT /api/v1/integracoes/:tipo/funcionalidade/:funcionalidade
 * Habilita/desabilita uma funcionalidade de uma integração
 */
router.put('/:tipo/funcionalidade/:funcionalidade', async (req, res) => {
  try {
    const { tipo, funcionalidade } = req.params;
    const { habilitado } = req.body;
    const usuarioLogadoId = req.headers['x-user-id'] || null;

    const integracaoResult = await pool.query(
      'SELECT id FROM integracoes WHERE tipo_integracao = $1',
      [tipo]
    );

    if (integracaoResult.rows.length === 0) {
      return res.status(404).json({
        error: 'Integração não encontrada',
      });
    }

    const integracaoId = integracaoResult.rows[0].id;

    const updateResult = await pool.query(
      `UPDATE integracoes_habilitadas
       SET habilitado = $3, updated_at = CURRENT_TIMESTAMP
       WHERE integracao_id = $1 AND funcionalidade = $2`,
      [integracaoId, funcionalidade, habilitado === true]
    );

    if ((updateResult.rowCount || 0) === 0) {
      await pool.query(
        `INSERT INTO integracoes_habilitadas (integracao_id, funcionalidade, habilitado, updated_at)
         VALUES ($1, $2, $3, CURRENT_TIMESTAMP)`,
        [integracaoId, funcionalidade, habilitado === true]
      );
    }

    const result = await pool.query(
      `SELECT * FROM integracoes_habilitadas
       WHERE integracao_id = $1 AND funcionalidade = $2`,
      [integracaoId, funcionalidade]
    );

    res.json({
      message: habilitado ? 'Funcionalidade habilitada!' : 'Funcionalidade desabilitada!',
      funcionalidade: result.rows[0],
    });
  } catch (error) {
    console.error('Erro ao atualizar funcionalidade:', error);
    res.status(500).json({
      error: 'Erro ao atualizar funcionalidade',
      message: error.message,
    });
  }
});

module.exports = router;

