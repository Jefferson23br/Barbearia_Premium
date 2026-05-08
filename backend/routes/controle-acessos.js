const express = require('express');
const router = express.Router();
const pool = require('../config/database');

/**
 * GET /api/v1/controle-acessos
 * Lista acessos com filtros
 */
router.get('/', async (req, res) => {
  try {
    const {
      data_inicio,
      data_fim,
      usuario_id,
      usuario_tipo,
      funcionario_responsavel_id,
    } = req.query;

    // Valores padrão: último mês
    const hoje = new Date();
    const umMesAtras = new Date(hoje);
    umMesAtras.setMonth(umMesAtras.getMonth() - 1);

    const dataInicio = data_inicio || umMesAtras.toISOString().split('T')[0];
    const dataFim = data_fim || hoje.toISOString().split('T')[0];

    // Construir query base
    // Usar subqueries para garantir que os dados sejam encontrados corretamente
    let query = `
      SELECT 
        ca.id,
        ca.usuario_id,
        ca.usuario_tipo,
        ca.data_acesso,
        ca.quantidade_login,
        ca.primeiro_acesso,
        ca.ultimo_acesso,
        ca.created_at,
        ca.updated_at,
        COALESCE(uc.nome_completo, ua.nome_completo, 'Usuário não encontrado') as nome_usuario,
        COALESCE(uc.email, ua.email, NULL) as email_usuario,
        ua_responsavel.nome_completo as funcionario_responsavel_nome,
        uc.funcionario_responsavel_id
      FROM controle_acessos ca
      LEFT JOIN usuarios_clientes uc 
        ON ca.usuario_tipo = 'cliente' 
        AND ca.usuario_id = uc.id
      LEFT JOIN usuarios_administrativos ua 
        ON ca.usuario_tipo = 'administrativo' 
        AND ca.usuario_id = ua.id
      LEFT JOIN usuarios_administrativos ua_responsavel 
        ON uc.funcionario_responsavel_id = ua_responsavel.id
      WHERE ca.data_acesso BETWEEN $1 AND $2
    `;

    const params = [dataInicio, dataFim];
    let paramIndex = 3;

    // Filtros opcionais
    if (usuario_id) {
      query += ` AND ca.usuario_id = $${paramIndex}`;
      params.push(usuario_id);
      paramIndex++;
    }

    if (usuario_tipo) {
      query += ` AND ca.usuario_tipo = $${paramIndex}`;
      params.push(usuario_tipo);
      paramIndex++;
    }

    if (funcionario_responsavel_id) {
      query += ` AND uc.funcionario_responsavel_id = $${paramIndex}`;
      params.push(funcionario_responsavel_id);
      paramIndex++;
    }

    query += ` ORDER BY ca.data_acesso DESC, ca.ultimo_acesso DESC`;

    const result = await pool.query(query, params);

    res.json({
      acessos: result.rows,
      periodo: {
        data_inicio: dataInicio,
        data_fim: dataFim,
      },
    });
  } catch (error) {
    console.error('Erro ao buscar acessos:', error);
    res.status(500).json({
      error: 'Erro ao buscar acessos',
      message: error.message,
    });
  }
});

/**
 * GET /api/v1/controle-acessos/estatisticas
 * Retorna estatísticas de acessos
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

    // Total de acessos
    const totalAcessos = await pool.query(
      `SELECT COUNT(*) as total FROM controle_acessos WHERE data_acesso BETWEEN $1 AND $2`,
      [dataInicio, dataFim]
    );

    // Total de logins
    const totalLogins = await pool.query(
      `SELECT SUM(quantidade_login) as total FROM controle_acessos WHERE data_acesso BETWEEN $1 AND $2`,
      [dataInicio, dataFim]
    );

    // Por tipo de usuário
    const porTipo = await pool.query(
      `SELECT usuario_tipo, COUNT(*) as quantidade, SUM(quantidade_login) as total_logins
       FROM controle_acessos
       WHERE data_acesso BETWEEN $1 AND $2
       GROUP BY usuario_tipo`,
      [dataInicio, dataFim]
    );

    // Por dia
    const porDia = await pool.query(
      `SELECT data_acesso, COUNT(*) as quantidade_acessos, SUM(quantidade_login) as total_logins
       FROM controle_acessos
       WHERE data_acesso BETWEEN $1 AND $2
       GROUP BY data_acesso
       ORDER BY data_acesso DESC`,
      [dataInicio, dataFim]
    );

    // Top 10 usuários com mais logins
    const topUsuarios = await pool.query(
      `SELECT usuario_id, usuario_tipo, SUM(quantidade_login) as total_logins
       FROM controle_acessos
       WHERE data_acesso BETWEEN $1 AND $2
       GROUP BY usuario_id, usuario_tipo
       ORDER BY total_logins DESC
       LIMIT 10`,
      [dataInicio, dataFim]
    );

    // Total de usuários cadastrados no sistema (ativos)
    const totalClientes = await pool.query(
      `SELECT COUNT(*) as total FROM usuarios_clientes WHERE is_active = true`
    );
    const totalAdministrativos = await pool.query(
      `SELECT COUNT(*) as total FROM usuarios_administrativos WHERE is_active = true`
    );
    const totalUsuariosCadastrados = 
      parseInt(totalClientes.rows[0].total || 0) + 
      parseInt(totalAdministrativos.rows[0].total || 0);

    res.json({
      periodo: {
        data_inicio: dataInicio,
        data_fim: dataFim,
      },
      total_acessos: parseInt(totalAcessos.rows[0].total || 0),
      total_logins: parseInt(totalLogins.rows[0].total || 0),
      total_usuarios_cadastrados: totalUsuariosCadastrados,
      total_clientes_cadastrados: parseInt(totalClientes.rows[0].total || 0),
      total_administrativos_cadastrados: parseInt(totalAdministrativos.rows[0].total || 0),
      por_tipo: porTipo.rows,
      por_dia: porDia.rows,
      top_usuarios: topUsuarios.rows,
    });
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({
      error: 'Erro ao buscar estatísticas',
      message: error.message,
    });
  }
});

module.exports = router;


