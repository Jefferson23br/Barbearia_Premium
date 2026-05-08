const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { registrarLog, getClientIp, getUserAgent } = require('../utils/logger');
const isOracle = Boolean(process.env.ORACLE_HOST);
const schemaPrefix = isOracle ? '' : '';

const CAMPOS_PERMISSOES = [
  'dashboard_ver', 'agenda_ver', 'agenda_editar', 'agenda_excluir',
  'lancamento_venda_ver', 'lancamento_venda_editar', 'lancamento_venda_excluir',
  'lancamento_despesa_ver', 'lancamento_despesa_editar', 'lancamento_despesa_excluir',
  'receitas_ver', 'receitas_editar', 'receitas_excluir',
  'despesas_ver', 'despesas_editar', 'despesas_excluir',
  'faturamento_ver', 'faturamento_editar', 'faturamento_excluir',
  'usuarios_ver', 'usuarios_editar', 'usuarios_excluir',
  'funcionarios_ver', 'funcionarios_editar', 'funcionarios_excluir',
  'controle_acessos_ver', 'controle_logs_ver',
  'help_desk_ver', 'help_desk_editar', 'help_desk_excluir',
  'servicos_ver', 'servicos_editar', 'servicos_excluir',
  'controle_permissoes_ver', 'controle_permissoes_editar', 'controle_permissoes_excluir',
  'emissao_nfe_ver', 'emissao_nfe_editar', 'emissao_nfe_excluir',
  'emissao_relatorios_ver', 'emissao_relatorios_editar', 'emissao_relatorios_excluir',
  'integracao_apis_ver', 'integracao_apis_editar', 'integracao_apis_excluir',
  'habilitar_api_ver', 'habilitar_api_editar', 'habilitar_api_excluir',
  'configuracoes_ver', 'configuracoes_editar', 'configuracoes_excluir',
  'produtos_ver', 'produtos_editar', 'produtos_excluir',
  'estoque_ver', 'estoque_editar', 'estoque_excluir',
  'caixas_ver', 'caixas_editar', 'caixas_excluir',
  'vendas_ver', 'vendas_editar', 'vendas_excluir',
  'balanco_demonstrativo_ver', 'balanco_demonstrativo_editar', 'balanco_demonstrativo_excluir',
  'crm_ver', 'crm_editar', 'crm_excluir',
  'cupons_fidelidades_ver', 'cupons_fidelidades_editar', 'cupons_fidelidades_excluir',
  'servicos_integracao_ver', 'servicos_integracao_editar', 'servicos_integracao_excluir',
  'assinaturas_ver', 'assinaturas_editar', 'assinaturas_excluir',
];

function buildPermissoesPadrao(valor = false) {
  return CAMPOS_PERMISSOES.reduce((acc, campo) => {
    acc[campo] = valor;
    return acc;
  }, {});
}

function normalizePermissoes(permissoes) {
  return CAMPOS_PERMISSOES.reduce((acc, campo) => {
    acc[campo] = permissoes?.[campo] === true || permissoes?.[campo] === 1 || permissoes?.[campo] === '1';
    return acc;
  }, {});
}

/**
 * GET /api/v1/permissoes/:usuarioId
 * Busca as permissões de um usuário
 */
router.get('/:usuarioId', async (req, res) => {
  try {
    const { usuarioId } = req.params;

    // Buscar permissões do usuário
    const result = await pool.query(
      `SELECT * FROM ${schemaPrefix}permissoes_usuarios
       WHERE usuario_id = $1`,
      [usuarioId]
    );

    if (result.rows.length === 0) {
      if (isOracle) {
        const usuarioResult = await pool.query(
          `SELECT papel
           FROM usuarios
           WHERE id = $1
           FETCH FIRST 1 ROWS ONLY`,
          [usuarioId]
        );

        if (usuarioResult.rows.length > 0) {
          const papel = String(usuarioResult.rows[0].papel || '').toLowerCase();
          if (papel === 'gestor' || papel === 'proprietario') {
            return res.json({ permissoes: buildPermissoesPadrao(true) });
          }
        }
      }

      // Se não existir, retornar permissões padrão (todas false)
      return res.json({
        permissoes: buildPermissoesPadrao(false),
      });
    }

    res.json({
      permissoes: normalizePermissoes(result.rows[0]),
    });
  } catch (error) {
    console.error('Erro ao buscar permissões:', error);
    res.status(500).json({
      error: 'Erro ao buscar permissões',
      message: error.message,
    });
  }
});

/**
 * PUT /api/v1/permissoes/:usuarioId
 * Atualiza as permissões de um usuário
 */
router.put('/:usuarioId', async (req, res) => {
  try {
    const { usuarioId } = req.params;
    const permissoesBody = req.body;

    // Verificar se o usuário existe
    const usuarioCheck = isOracle
      ? await pool.query(
          'SELECT id, nome AS nome_completo, papel AS tipo_usuario FROM usuarios WHERE id = $1 FETCH FIRST 1 ROWS ONLY',
          [usuarioId]
        )
      : await pool.query(
          `SELECT id, nome_completo, tipo_usuario FROM ${schemaPrefix}usuarios_administrativos WHERE id = $1`,
          [usuarioId]
        );

    if (usuarioCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    const usuario = usuarioCheck.rows[0];

    // Master não precisa de permissões
    if (usuario.tipo_usuario === 'master' || usuario.tipo_usuario === 'gestor' || usuario.tipo_usuario === 'proprietario') {
      return res.status(400).json({ error: 'Master não precisa de permissões configuradas' });
    }

    // Preparar valores de permissões
    const valoresPermissoes = {
      dashboard_ver: permissoesBody.dashboard_ver || false,
      agenda_ver: permissoesBody.agenda_ver || false,
      agenda_editar: permissoesBody.agenda_editar || false,
      agenda_excluir: permissoesBody.agenda_excluir || false,
      lancamento_venda_ver: permissoesBody.lancamento_venda_ver || false,
      lancamento_venda_editar: permissoesBody.lancamento_venda_editar || false,
      lancamento_venda_excluir: permissoesBody.lancamento_venda_excluir || false,
      lancamento_despesa_ver: permissoesBody.lancamento_despesa_ver || false,
      lancamento_despesa_editar: permissoesBody.lancamento_despesa_editar || false,
      lancamento_despesa_excluir: permissoesBody.lancamento_despesa_excluir || false,
      receitas_ver: permissoesBody.receitas_ver || false,
      receitas_editar: permissoesBody.receitas_editar || false,
      receitas_excluir: permissoesBody.receitas_excluir || false,
      despesas_ver: permissoesBody.despesas_ver || false,
      despesas_editar: permissoesBody.despesas_editar || false,
      despesas_excluir: permissoesBody.despesas_excluir || false,
      faturamento_ver: permissoesBody.faturamento_ver || false,
      faturamento_editar: permissoesBody.faturamento_editar || false,
      faturamento_excluir: permissoesBody.faturamento_excluir || false,
      usuarios_ver: permissoesBody.usuarios_ver || false,
      usuarios_editar: permissoesBody.usuarios_editar || false,
      usuarios_excluir: permissoesBody.usuarios_excluir || false,
      funcionarios_ver: permissoesBody.funcionarios_ver || false,
      funcionarios_editar: permissoesBody.funcionarios_editar || false,
      funcionarios_excluir: permissoesBody.funcionarios_excluir || false,
      controle_acessos_ver: permissoesBody.controle_acessos_ver || false,
      controle_logs_ver: permissoesBody.controle_logs_ver || false,
      help_desk_ver: permissoesBody.help_desk_ver || false,
      help_desk_editar: permissoesBody.help_desk_editar || false,
      help_desk_excluir: permissoesBody.help_desk_excluir || false,
      servicos_ver: permissoesBody.servicos_ver || false,
      servicos_editar: permissoesBody.servicos_editar || false,
      servicos_excluir: permissoesBody.servicos_excluir || false,
      controle_permissoes_ver: permissoesBody.controle_permissoes_ver || false,
      controle_permissoes_editar: permissoesBody.controle_permissoes_editar || false,
      controle_permissoes_excluir: permissoesBody.controle_permissoes_excluir || false,
      emissao_nfe_ver: permissoesBody.emissao_nfe_ver || false,
      emissao_nfe_editar: permissoesBody.emissao_nfe_editar || false,
      emissao_nfe_excluir: permissoesBody.emissao_nfe_excluir || false,
      emissao_relatorios_ver: permissoesBody.emissao_relatorios_ver || false,
      emissao_relatorios_editar: permissoesBody.emissao_relatorios_editar || false,
      emissao_relatorios_excluir: permissoesBody.emissao_relatorios_excluir || false,
      integracao_apis_ver: permissoesBody.integracao_apis_ver || false,
      integracao_apis_editar: permissoesBody.integracao_apis_editar || false,
      integracao_apis_excluir: permissoesBody.integracao_apis_excluir || false,
      habilitar_api_ver: permissoesBody.habilitar_api_ver || false,
      habilitar_api_editar: permissoesBody.habilitar_api_editar || false,
      habilitar_api_excluir: permissoesBody.habilitar_api_excluir || false,
          configuracoes_ver: permissoesBody.configuracoes_ver || false,
          configuracoes_editar: permissoesBody.configuracoes_editar || false,
          configuracoes_excluir: permissoesBody.configuracoes_excluir || false,
          produtos_ver: permissoesBody.produtos_ver || false,
          produtos_editar: permissoesBody.produtos_editar || false,
          produtos_excluir: permissoesBody.produtos_excluir || false,
          estoque_ver: permissoesBody.estoque_ver || false,
          estoque_editar: permissoesBody.estoque_editar || false,
          estoque_excluir: permissoesBody.estoque_excluir || false,
          cupons_fidelidades_ver: permissoesBody.cupons_fidelidades_ver || false,
          cupons_fidelidades_editar: permissoesBody.cupons_fidelidades_editar || false,
          cupons_fidelidades_excluir: permissoesBody.cupons_fidelidades_excluir || false,
          caixas_ver: permissoesBody.caixas_ver || false,
          caixas_editar: permissoesBody.caixas_editar || false,
          caixas_excluir: permissoesBody.caixas_excluir || false,
          vendas_ver: permissoesBody.vendas_ver || false,
          vendas_editar: permissoesBody.vendas_editar || false,
          vendas_excluir: permissoesBody.vendas_excluir || false,
          balanco_demonstrativo_ver: permissoesBody.balanco_demonstrativo_ver || false,
          balanco_demonstrativo_editar: permissoesBody.balanco_demonstrativo_editar || false,
          balanco_demonstrativo_excluir: permissoesBody.balanco_demonstrativo_excluir || false,
          crm_ver: permissoesBody.crm_ver || false,
          crm_editar: permissoesBody.crm_editar || false,
          crm_excluir: permissoesBody.crm_excluir || false,
          servicos_integracao_ver: permissoesBody.servicos_integracao_ver || false,
          servicos_integracao_editar: permissoesBody.servicos_integracao_editar || false,
          servicos_integracao_excluir: permissoesBody.servicos_integracao_excluir || false,
          assinaturas_ver: permissoesBody.assinaturas_ver || false,
          assinaturas_editar: permissoesBody.assinaturas_editar || false,
          assinaturas_excluir: permissoesBody.assinaturas_excluir || false,
    };

    // Verificar se já existe registro de permissões
    const existe = await pool.query(
      `SELECT id FROM ${schemaPrefix}permissoes_usuarios WHERE usuario_id = $1`,
      [usuarioId]
    );

    if (existe.rows.length > 0) {
      // Atualizar permissões existentes
      await pool.query(
        `UPDATE ${schemaPrefix}permissoes_usuarios SET
          dashboard_ver = $2,
          agenda_ver = $3, agenda_editar = $4, agenda_excluir = $5,
          lancamento_venda_ver = $6, lancamento_venda_editar = $7, lancamento_venda_excluir = $8,
          lancamento_despesa_ver = $9, lancamento_despesa_editar = $10, lancamento_despesa_excluir = $11,
          receitas_ver = $12, receitas_editar = $13, receitas_excluir = $14,
          despesas_ver = $15, despesas_editar = $16, despesas_excluir = $17,
          faturamento_ver = $18, faturamento_editar = $19, faturamento_excluir = $20,
          usuarios_ver = $21, usuarios_editar = $22, usuarios_excluir = $23,
          funcionarios_ver = $24, funcionarios_editar = $25, funcionarios_excluir = $26,
          controle_acessos_ver = $27,
          controle_logs_ver = $28,
          help_desk_ver = $29,
          help_desk_editar = $30,
          help_desk_excluir = $31,
          servicos_ver = $32,
          servicos_editar = $33,
          servicos_excluir = $34,
          controle_permissoes_ver = $35, controle_permissoes_editar = $36, controle_permissoes_excluir = $37,
          emissao_nfe_ver = $38, emissao_nfe_editar = $39, emissao_nfe_excluir = $40,
          emissao_relatorios_ver = $41, emissao_relatorios_editar = $42, emissao_relatorios_excluir = $43,
          integracao_apis_ver = $44, integracao_apis_editar = $45, integracao_apis_excluir = $46,
          habilitar_api_ver = $47, habilitar_api_editar = $48, habilitar_api_excluir = $49,
          configuracoes_ver = $50, configuracoes_editar = $51, configuracoes_excluir = $52,
          produtos_ver = $53, produtos_editar = $54, produtos_excluir = $55,
          estoque_ver = $56, estoque_editar = $57, estoque_excluir = $58,
          caixas_ver = $59, caixas_editar = $60, caixas_excluir = $61,
          vendas_ver = $62, vendas_editar = $63, vendas_excluir = $64,
          balanco_demonstrativo_ver = $65, balanco_demonstrativo_editar = $66, balanco_demonstrativo_excluir = $67,
          crm_ver = $68, crm_editar = $69, crm_excluir = $70,
          cupons_fidelidades_ver = $71, cupons_fidelidades_editar = $72, cupons_fidelidades_excluir = $73,
          servicos_integracao_ver = $74, servicos_integracao_editar = $75, servicos_integracao_excluir = $76,
          assinaturas_ver = $77, assinaturas_editar = $78, assinaturas_excluir = $79,
          updated_at = CURRENT_TIMESTAMP
        WHERE usuario_id = $1`,
        [
          usuarioId,
          valoresPermissoes.dashboard_ver,
          valoresPermissoes.agenda_ver,
          valoresPermissoes.agenda_editar,
          valoresPermissoes.agenda_excluir,
          valoresPermissoes.lancamento_venda_ver,
          valoresPermissoes.lancamento_venda_editar,
          valoresPermissoes.lancamento_venda_excluir,
          valoresPermissoes.lancamento_despesa_ver,
          valoresPermissoes.lancamento_despesa_editar,
          valoresPermissoes.lancamento_despesa_excluir,
          valoresPermissoes.receitas_ver,
          valoresPermissoes.receitas_editar,
          valoresPermissoes.receitas_excluir,
          valoresPermissoes.despesas_ver,
          valoresPermissoes.despesas_editar,
          valoresPermissoes.despesas_excluir,
          valoresPermissoes.faturamento_ver,
          valoresPermissoes.faturamento_editar,
          valoresPermissoes.faturamento_excluir,
          valoresPermissoes.usuarios_ver,
          valoresPermissoes.usuarios_editar,
          valoresPermissoes.usuarios_excluir,
          valoresPermissoes.funcionarios_ver,
          valoresPermissoes.funcionarios_editar,
          valoresPermissoes.funcionarios_excluir,
          valoresPermissoes.controle_acessos_ver,
          valoresPermissoes.controle_logs_ver,
          valoresPermissoes.help_desk_ver,
          valoresPermissoes.help_desk_editar,
          valoresPermissoes.help_desk_excluir,
          valoresPermissoes.servicos_ver,
          valoresPermissoes.servicos_editar,
          valoresPermissoes.servicos_excluir,
          valoresPermissoes.controle_permissoes_ver,
          valoresPermissoes.controle_permissoes_editar,
          valoresPermissoes.controle_permissoes_excluir,
          valoresPermissoes.emissao_nfe_ver,
          valoresPermissoes.emissao_nfe_editar,
          valoresPermissoes.emissao_nfe_excluir,
          valoresPermissoes.emissao_relatorios_ver,
          valoresPermissoes.emissao_relatorios_editar,
          valoresPermissoes.emissao_relatorios_excluir,
          valoresPermissoes.integracao_apis_ver,
          valoresPermissoes.integracao_apis_editar,
          valoresPermissoes.integracao_apis_excluir,
          valoresPermissoes.habilitar_api_ver,
          valoresPermissoes.habilitar_api_editar,
          valoresPermissoes.habilitar_api_excluir,
          valoresPermissoes.configuracoes_ver,
          valoresPermissoes.configuracoes_editar,
          valoresPermissoes.configuracoes_excluir,
          valoresPermissoes.produtos_ver,
          valoresPermissoes.produtos_editar,
          valoresPermissoes.produtos_excluir,
          valoresPermissoes.estoque_ver,
          valoresPermissoes.estoque_editar,
          valoresPermissoes.estoque_excluir,
          valoresPermissoes.caixas_ver,
          valoresPermissoes.caixas_editar,
          valoresPermissoes.caixas_excluir,
          valoresPermissoes.vendas_ver,
          valoresPermissoes.vendas_editar,
          valoresPermissoes.vendas_excluir,
          valoresPermissoes.balanco_demonstrativo_ver,
          valoresPermissoes.balanco_demonstrativo_editar,
          valoresPermissoes.balanco_demonstrativo_excluir,
          valoresPermissoes.crm_ver,
          valoresPermissoes.crm_editar,
          valoresPermissoes.crm_excluir,
          valoresPermissoes.cupons_fidelidades_ver,
          valoresPermissoes.cupons_fidelidades_editar,
          valoresPermissoes.cupons_fidelidades_excluir,
          valoresPermissoes.servicos_integracao_ver,
          valoresPermissoes.servicos_integracao_editar,
          valoresPermissoes.servicos_integracao_excluir,
          valoresPermissoes.assinaturas_ver,
          valoresPermissoes.assinaturas_editar,
          valoresPermissoes.assinaturas_excluir,
        ]
      );
    } else {
      // Criar novo registro de permissões
      await pool.query(
        `INSERT INTO ${schemaPrefix}permissoes_usuarios (
          usuario_id,
          dashboard_ver,
          agenda_ver, agenda_editar, agenda_excluir,
          lancamento_venda_ver, lancamento_venda_editar, lancamento_venda_excluir,
          lancamento_despesa_ver, lancamento_despesa_editar, lancamento_despesa_excluir,
          receitas_ver, receitas_editar, receitas_excluir,
          despesas_ver, despesas_editar, despesas_excluir,
          faturamento_ver, faturamento_editar, faturamento_excluir,
          usuarios_ver, usuarios_editar, usuarios_excluir,
          funcionarios_ver, funcionarios_editar, funcionarios_excluir,
          controle_acessos_ver,
          controle_logs_ver,
          help_desk_ver, help_desk_editar, help_desk_excluir,
          servicos_ver, servicos_editar, servicos_excluir,
          controle_permissoes_ver, controle_permissoes_editar, controle_permissoes_excluir,
          emissao_nfe_ver, emissao_nfe_editar, emissao_nfe_excluir,
          emissao_relatorios_ver, emissao_relatorios_editar, emissao_relatorios_excluir,
          integracao_apis_ver, integracao_apis_editar, integracao_apis_excluir,
          habilitar_api_ver, habilitar_api_editar, habilitar_api_excluir,
          configuracoes_ver, configuracoes_editar, configuracoes_excluir,
          produtos_ver, produtos_editar, produtos_excluir,
          estoque_ver, estoque_editar, estoque_excluir,
          caixas_ver, caixas_editar, caixas_excluir,
          vendas_ver, vendas_editar, vendas_excluir,
          balanco_demonstrativo_ver, balanco_demonstrativo_editar, balanco_demonstrativo_excluir,
          crm_ver, crm_editar, crm_excluir,
          cupons_fidelidades_ver, cupons_fidelidades_editar, cupons_fidelidades_excluir,
          servicos_integracao_ver, servicos_integracao_editar, servicos_integracao_excluir,
          assinaturas_ver, assinaturas_editar, assinaturas_excluir
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32, $33, $34, $35, $36, $37, $38, $39, $40, $41, $42, $43, $44, $45, $46, $47, $48, $49, $50, $51, $52, $53, $54, $55, $56, $57, $58, $59, $60, $61, $62, $63, $64, $65, $66, $67, $68, $69, $70, $71, $72, $73, $74, $75, $76, $77, $78, $79
        )`,
        [
          usuarioId,
          valoresPermissoes.dashboard_ver,
          valoresPermissoes.agenda_ver,
          valoresPermissoes.agenda_editar,
          valoresPermissoes.agenda_excluir,
          valoresPermissoes.lancamento_venda_ver,
          valoresPermissoes.lancamento_venda_editar,
          valoresPermissoes.lancamento_venda_excluir,
          valoresPermissoes.lancamento_despesa_ver,
          valoresPermissoes.lancamento_despesa_editar,
          valoresPermissoes.lancamento_despesa_excluir,
          valoresPermissoes.receitas_ver,
          valoresPermissoes.receitas_editar,
          valoresPermissoes.receitas_excluir,
          valoresPermissoes.despesas_ver,
          valoresPermissoes.despesas_editar,
          valoresPermissoes.despesas_excluir,
          valoresPermissoes.faturamento_ver,
          valoresPermissoes.faturamento_editar,
          valoresPermissoes.faturamento_excluir,
          valoresPermissoes.usuarios_ver,
          valoresPermissoes.usuarios_editar,
          valoresPermissoes.usuarios_excluir,
          valoresPermissoes.funcionarios_ver,
          valoresPermissoes.funcionarios_editar,
          valoresPermissoes.funcionarios_excluir,
          valoresPermissoes.controle_acessos_ver,
          valoresPermissoes.controle_logs_ver,
          valoresPermissoes.help_desk_ver,
          valoresPermissoes.help_desk_editar,
          valoresPermissoes.help_desk_excluir,
          valoresPermissoes.servicos_ver,
          valoresPermissoes.servicos_editar,
          valoresPermissoes.servicos_excluir,
          valoresPermissoes.controle_permissoes_ver,
          valoresPermissoes.controle_permissoes_editar,
          valoresPermissoes.controle_permissoes_excluir,
          valoresPermissoes.emissao_nfe_ver,
          valoresPermissoes.emissao_nfe_editar,
          valoresPermissoes.emissao_nfe_excluir,
          valoresPermissoes.emissao_relatorios_ver,
          valoresPermissoes.emissao_relatorios_editar,
          valoresPermissoes.emissao_relatorios_excluir,
          valoresPermissoes.integracao_apis_ver,
          valoresPermissoes.integracao_apis_editar,
          valoresPermissoes.integracao_apis_excluir,
          valoresPermissoes.habilitar_api_ver,
          valoresPermissoes.habilitar_api_editar,
          valoresPermissoes.habilitar_api_excluir,
          valoresPermissoes.configuracoes_ver,
          valoresPermissoes.configuracoes_editar,
          valoresPermissoes.configuracoes_excluir,
          valoresPermissoes.produtos_ver,
          valoresPermissoes.produtos_editar,
          valoresPermissoes.produtos_excluir,
          valoresPermissoes.estoque_ver,
          valoresPermissoes.estoque_editar,
          valoresPermissoes.estoque_excluir,
          valoresPermissoes.caixas_ver,
          valoresPermissoes.caixas_editar,
          valoresPermissoes.caixas_excluir,
          valoresPermissoes.vendas_ver,
          valoresPermissoes.vendas_editar,
          valoresPermissoes.vendas_excluir,
          valoresPermissoes.balanco_demonstrativo_ver,
          valoresPermissoes.balanco_demonstrativo_editar,
          valoresPermissoes.balanco_demonstrativo_excluir,
          valoresPermissoes.crm_ver,
          valoresPermissoes.crm_editar,
          valoresPermissoes.crm_excluir,
          valoresPermissoes.cupons_fidelidades_ver,
          valoresPermissoes.cupons_fidelidades_editar,
          valoresPermissoes.cupons_fidelidades_excluir,
          valoresPermissoes.servicos_integracao_ver,
          valoresPermissoes.servicos_integracao_editar,
          valoresPermissoes.servicos_integracao_excluir,
          valoresPermissoes.assinaturas_ver,
          valoresPermissoes.assinaturas_editar,
          valoresPermissoes.assinaturas_excluir,
        ]
      );
    }

    // Registrar log
    const usuarioLogadoId = req.headers['x-user-id'] || null;
    const usuarioLogadoTipo = req.headers['x-user-tipo'] || 'administrativo';
    if (usuarioLogadoId) {
      await registrarLog({
        usuarioId: usuarioLogadoId,
        usuarioTipo: usuarioLogadoTipo,
        acao: 'editar',
        modulo: 'permissao',
        entidadeId: usuarioId,
        entidadeTipo: 'permissao',
        descricao: `Permissões do usuário ${usuario.nome_completo} atualizadas`,
        dadosNovos: valoresPermissoes,
        ipAddress: getClientIp(req),
        userAgent: getUserAgent(req),
      });
    }

    res.json({
      message: 'Permissões atualizadas com sucesso!',
      permissoes: valoresPermissoes,
    });
  } catch (error) {
    console.error('Erro ao atualizar permissões:', error);
    res.status(500).json({
      error: 'Erro ao atualizar permissões',
      message: error.message,
    });
  }
});

module.exports = router;


