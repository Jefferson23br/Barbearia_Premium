const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { registrarLog, getClientIp, getUserAgent } = require('../utils/logger');

/**
 * GET /api/v1/dashboard
 * Retorna dados do dashboard filtrados por tipo de usuário
 * - Proprietário: vê tudo (receitas totais, despesas totais, todos agendamentos, total clientes)
 * - Funcionário: vê apenas suas informações
 */
router.get('/', async (req, res) => {
  try {
    const usuarioId = req.headers['x-user-id'];
    const usuarioTipo = req.headers['x-user-tipo'] || 'administrativo';

    if (!usuarioId) {
      return res.status(401).json({ error: 'Usuário não autenticado' });
    }

    // Buscar tipo de usuário do banco
    const usuarioResult = await pool.query(
      'SELECT id, tipo_usuario, nome_completo FROM protese.usuarios_administrativos WHERE id = $1',
      [usuarioId]
    );

    if (usuarioResult.rows.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    const tipoUsuario = usuarioResult.rows[0].tipo_usuario;
    const isProprietario = tipoUsuario === 'proprietario' || tipoUsuario === 'master';

    // Data atual e início do mês
    const hoje = new Date();
    const primeiroDiaMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    const dataInicioMes = primeiroDiaMes.toISOString().split('T')[0];
    const dataHoje = hoje.toISOString().split('T')[0];

    // 1. Receitas do Mês
    let queryReceitas = `
      SELECT 
        COALESCE(SUM(CASE WHEN r.status = 'paga' THEN r.valor_pago ELSE 0 END), 0)::numeric as receitas_pagas,
        COALESCE(SUM(CASE WHEN r.status = 'pendente' THEN r.valor_vencimento ELSE 0 END), 0)::numeric as receitas_pendentes,
        COALESCE(SUM(r.valor_vencimento), 0)::numeric as receitas_total
      FROM protese.receitas r
      WHERE r.data_emissao >= $1
        AND r.data_emissao <= $2
        AND r.status != 'cancelada'
    `;
    
    let paramsReceitas = [dataInicioMes, dataHoje];
    
    if (!isProprietario) {
      // Para funcionários, filtrar receitas das vendas que eles fizeram
      queryReceitas += `
        AND r.venda_id IS NOT NULL
        AND EXISTS (
          SELECT 1 FROM protese.vendas v 
          WHERE v.id = r.venda_id 
          AND v.funcionario_id = $3
        )
      `;
      paramsReceitas.push(usuarioId);
    }

    const receitasResult = await pool.query(queryReceitas, paramsReceitas);

    // 2. Despesas do Mês
    let queryDespesas = `
      SELECT 
        COALESCE(SUM(CASE WHEN d.status = 'paga' THEN d.valor_liquido ELSE 0 END), 0)::numeric as despesas_pagas,
        COALESCE(SUM(CASE WHEN d.status = 'pendente' THEN d.valor_liquido ELSE 0 END), 0)::numeric as despesas_pendentes,
        COALESCE(SUM(d.valor_liquido), 0)::numeric as despesas_total
      FROM protese.despesas d
      WHERE d.data_emissao >= $1
        AND d.data_emissao <= $2
        AND d.status != 'cancelada'
    `;

    let paramsDespesas = [dataInicioMes, dataHoje];

    if (!isProprietario) {
      // Para funcionários, filtrar despesas que eles criaram
      queryDespesas += ` AND d.created_by = $3`;
      paramsDespesas.push(usuarioId);
    }

    const despesasResult = await pool.query(queryDespesas, paramsDespesas);

    // 3. Total de Clientes (apenas para proprietário)
    let totalClientes = 0;
    if (isProprietario) {
      const clientesResult = await pool.query(
        'SELECT COUNT(*) as total FROM protese.usuarios_clientes WHERE is_active = true'
      );
      totalClientes = parseInt(clientesResult.rows[0].total) || 0;
    }

    // 4. Agendamentos Hoje
    let queryAgendamentos = `
      SELECT COUNT(*) as total
      FROM protese.agendamentos a
      WHERE a.data_agendamento = $1
        AND a.status IN ('agendado', 'confirmado')
    `;

    let paramsAgendamentos = [dataHoje];

    if (!isProprietario) {
      queryAgendamentos += ` AND a.funcionario_id = $2`;
      paramsAgendamentos.push(usuarioId);
    }

    const agendamentosResult = await pool.query(queryAgendamentos, paramsAgendamentos);

    // 5. Últimas Vendas (limitado a 5)
    let queryVendas = `
      SELECT 
        v.id,
        v.ticket,
        v.data_venda,
        v.valor_liquido,
        c.nome_completo as cliente_nome,
        f.nome_completo as funcionario_nome
      FROM protese.vendas v
      LEFT JOIN protese.usuarios_clientes c ON v.cliente_id = c.id
      LEFT JOIN protese.usuarios_administrativos f ON v.funcionario_id = f.id
      WHERE v.status != 'cancelada'
    `;

    let paramsVendas = [];

    if (!isProprietario) {
      queryVendas += ` AND v.funcionario_id = $1`;
      paramsVendas.push(usuarioId);
    }

    queryVendas += ` ORDER BY v.data_venda DESC, v.created_at DESC LIMIT 5`;

    const vendasResult = await pool.query(queryVendas, paramsVendas);

    // 6. Próximos Agendamentos (limitado a 5)
    let queryProximosAgendamentos = `
      SELECT 
        a.id,
        a.data_agendamento,
        a.hora_inicio,
        a.status,
        c.nome_completo as cliente_nome,
        f.nome_completo as funcionario_nome,
        s.nome as servico_nome
      FROM protese.agendamentos a
      INNER JOIN protese.usuarios_clientes c ON a.cliente_id = c.id
      INNER JOIN protese.usuarios_administrativos f ON a.funcionario_id = f.id
      INNER JOIN protese.servicos s ON a.servico_id = s.id
      WHERE a.data_agendamento >= $1
        AND a.status IN ('agendado', 'confirmado')
    `;

    let paramsProximosAgendamentos = [dataHoje];

    if (!isProprietario) {
      queryProximosAgendamentos += ` AND a.funcionario_id = $2`;
      paramsProximosAgendamentos.push(usuarioId);
    }

    queryProximosAgendamentos += ` ORDER BY a.data_agendamento ASC, a.hora_inicio ASC LIMIT 5`;

    const proximosAgendamentosResult = await pool.query(queryProximosAgendamentos, paramsProximosAgendamentos);

    res.json({
      receitas: receitasResult.rows[0] || { receitas_pagas: 0, receitas_pendentes: 0, receitas_total: 0 },
      despesas: despesasResult.rows[0] || { despesas_pagas: 0, despesas_pendentes: 0, despesas_total: 0 },
      total_clientes: totalClientes,
      agendamentos_hoje: parseInt(agendamentosResult.rows[0]?.total || 0),
      ultimas_vendas: vendasResult.rows || [],
      proximos_agendamentos: proximosAgendamentosResult.rows || [],
      tipo_usuario: tipoUsuario,
      is_proprietario: isProprietario
    });
  } catch (error) {
    console.error('Erro ao buscar dados do dashboard:', error);
    console.error('Stack trace:', error.stack);
    res.status(500).json({ 
      error: 'Erro ao buscar dados do dashboard', 
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

module.exports = router;

