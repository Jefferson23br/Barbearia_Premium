const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { registrarLog, getClientIp, getUserAgent } = require('../utils/logger');

/**
 * GET /api/v1/configuracoes
 * Busca as configurações do sistema
 */
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM configuracoes ORDER BY updated_at DESC LIMIT 1`
    );

    if (result.rows.length === 0) {
      // Retornar configurações padrão se não existir
      return res.json({
        configuracoes: {
          id: null,
          nome_empresarial: null,
          nome_fantasia: null,
          cnpj: null,
          cnae: null,
          cnae_secundario: null,
          inscricao_estadual: null,
          endereco_rua: null,
          endereco_numero: null,
          endereco_complemento: null,
          endereco_bairro: null,
          endereco_cidade: null,
          endereco_estado: null,
          endereco_cep: null,
          email_contato: null,
          telefone_principal: null,
          telefone_secundario: null,
          whatsapp: null,
          segunda_abertura: null,
          segunda_fechamento: null,
          segunda_ativo: true,
          terca_abertura: null,
          terca_fechamento: null,
          terca_ativo: true,
          quarta_abertura: null,
          quarta_fechamento: null,
          quarta_ativo: true,
          quinta_abertura: null,
          quinta_fechamento: null,
          quinta_ativo: true,
          sexta_abertura: null,
          sexta_fechamento: null,
          sexta_ativo: true,
          sabado_abertura: null,
          sabado_fechamento: null,
          sabado_ativo: true,
          domingo_abertura: null,
          domingo_fechamento: null,
          domingo_ativo: false,
          intervalo_agendamento: 30,
          tempo_antecedencia_agendamento: 60,
          tempo_cancelamento_agendamento: 120,
        },
      });
    }

    const config = result.rows[0];

    res.json({
      configuracoes: config,
    });
  } catch (error) {
    console.error('Erro ao buscar configurações:', error);
    res.status(500).json({
      error: 'Erro ao buscar configurações',
      message: error.message,
    });
  }
});

/**
 * PUT /api/v1/configuracoes
 * Atualiza as configurações do sistema
 */
router.put('/', async (req, res) => {
  try {
    const configBody = req.body;
    const usuarioLogadoId = req.headers['x-user-id'] || null;
    const usuarioLogadoTipo = req.headers['x-user-tipo'] || 'administrativo';

    // Verificar se já existe configuração
    const existe = await pool.query(
      'SELECT id FROM configuracoes ORDER BY updated_at DESC LIMIT 1'
    );

    const valoresConfig = {
      nome_empresarial: configBody.nome_empresarial || null,
      nome_fantasia: configBody.nome_fantasia || null,
      cnpj: configBody.cnpj || null,
      cnae: configBody.cnae || null,
      cnae_secundario: configBody.cnae_secundario || null,
      inscricao_estadual: configBody.inscricao_estadual || null,
      endereco_rua: configBody.endereco_rua || null,
      endereco_numero: configBody.endereco_numero || null,
      endereco_complemento: configBody.endereco_complemento || null,
      endereco_bairro: configBody.endereco_bairro || null,
      endereco_cidade: configBody.endereco_cidade || null,
      endereco_estado: configBody.endereco_estado || null,
      endereco_cep: configBody.endereco_cep || null,
      email_contato: configBody.email_contato || null,
      telefone_principal: configBody.telefone_principal || null,
      telefone_secundario: configBody.telefone_secundario || null,
      whatsapp: configBody.whatsapp || null,
      segunda_abertura: configBody.segunda_abertura || null,
      segunda_fechamento: configBody.segunda_fechamento || null,
      segunda_ativo: configBody.segunda_ativo !== undefined ? configBody.segunda_ativo : true,
      terca_abertura: configBody.terca_abertura || null,
      terca_fechamento: configBody.terca_fechamento || null,
      terca_ativo: configBody.terca_ativo !== undefined ? configBody.terca_ativo : true,
      quarta_abertura: configBody.quarta_abertura || null,
      quarta_fechamento: configBody.quarta_fechamento || null,
      quarta_ativo: configBody.quarta_ativo !== undefined ? configBody.quarta_ativo : true,
      quinta_abertura: configBody.quinta_abertura || null,
      quinta_fechamento: configBody.quinta_fechamento || null,
      quinta_ativo: configBody.quinta_ativo !== undefined ? configBody.quinta_ativo : true,
      sexta_abertura: configBody.sexta_abertura || null,
      sexta_fechamento: configBody.sexta_fechamento || null,
      sexta_ativo: configBody.sexta_ativo !== undefined ? configBody.sexta_ativo : true,
      sabado_abertura: configBody.sabado_abertura || null,
      sabado_fechamento: configBody.sabado_fechamento || null,
      sabado_ativo: configBody.sabado_ativo !== undefined ? configBody.sabado_ativo : true,
      domingo_abertura: configBody.domingo_abertura || null,
      domingo_fechamento: configBody.domingo_fechamento || null,
      domingo_ativo: configBody.domingo_ativo !== undefined ? configBody.domingo_ativo : false,
      intervalo_agendamento: configBody.intervalo_agendamento || 30,
      tempo_antecedencia_agendamento: configBody.tempo_antecedencia_agendamento || 60,
      tempo_cancelamento_agendamento: configBody.tempo_cancelamento_agendamento || 120,
      updated_by: usuarioLogadoId,
    };

    if (existe.rows.length > 0) {
      // Atualizar configuração existente
      const configId = existe.rows[0].id;
      await pool.query(
        `UPDATE configuracoes SET
          nome_empresarial = $1,
          nome_fantasia = $2,
          cnpj = $3,
          cnae = $4,
          cnae_secundario = $5,
          inscricao_estadual = $6,
          endereco_rua = $7,
          endereco_numero = $8,
          endereco_complemento = $9,
          endereco_bairro = $10,
          endereco_cidade = $11,
          endereco_estado = $12,
          endereco_cep = $13,
          email_contato = $14,
          telefone_principal = $15,
          telefone_secundario = $16,
          whatsapp = $17,
          segunda_abertura = $18,
          segunda_fechamento = $19,
          segunda_ativo = $20,
          terca_abertura = $21,
          terca_fechamento = $22,
          terca_ativo = $23,
          quarta_abertura = $24,
          quarta_fechamento = $25,
          quarta_ativo = $26,
          quinta_abertura = $27,
          quinta_fechamento = $28,
          quinta_ativo = $29,
          sexta_abertura = $30,
          sexta_fechamento = $31,
          sexta_ativo = $32,
          sabado_abertura = $33,
          sabado_fechamento = $34,
          sabado_ativo = $35,
          domingo_abertura = $36,
          domingo_fechamento = $37,
          domingo_ativo = $38,
          intervalo_agendamento = $39,
          tempo_antecedencia_agendamento = $40,
          tempo_cancelamento_agendamento = $41,
          updated_by = $42,
          updated_at = NOW()
        WHERE id = $43`,
        [
          valoresConfig.nome_empresarial,
          valoresConfig.nome_fantasia,
          valoresConfig.cnpj,
          valoresConfig.cnae,
          valoresConfig.cnae_secundario,
          valoresConfig.inscricao_estadual,
          valoresConfig.endereco_rua,
          valoresConfig.endereco_numero,
          valoresConfig.endereco_complemento,
          valoresConfig.endereco_bairro,
          valoresConfig.endereco_cidade,
          valoresConfig.endereco_estado,
          valoresConfig.endereco_cep,
          valoresConfig.email_contato,
          valoresConfig.telefone_principal,
          valoresConfig.telefone_secundario,
          valoresConfig.whatsapp,
          valoresConfig.segunda_abertura,
          valoresConfig.segunda_fechamento,
          valoresConfig.segunda_ativo,
          valoresConfig.terca_abertura,
          valoresConfig.terca_fechamento,
          valoresConfig.terca_ativo,
          valoresConfig.quarta_abertura,
          valoresConfig.quarta_fechamento,
          valoresConfig.quarta_ativo,
          valoresConfig.quinta_abertura,
          valoresConfig.quinta_fechamento,
          valoresConfig.quinta_ativo,
          valoresConfig.sexta_abertura,
          valoresConfig.sexta_fechamento,
          valoresConfig.sexta_ativo,
          valoresConfig.sabado_abertura,
          valoresConfig.sabado_fechamento,
          valoresConfig.sabado_ativo,
          valoresConfig.domingo_abertura,
          valoresConfig.domingo_fechamento,
          valoresConfig.domingo_ativo,
          valoresConfig.intervalo_agendamento,
          valoresConfig.tempo_antecedencia_agendamento,
          valoresConfig.tempo_cancelamento_agendamento,
          valoresConfig.updated_by,
          configId,
        ]
      );
    } else {
      // Criar nova configuração
      await pool.query(
        `INSERT INTO configuracoes (
          nome_empresarial, nome_fantasia, cnpj, cnae, cnae_secundario, inscricao_estadual,
          endereco_rua, endereco_numero, endereco_complemento, endereco_bairro, endereco_cidade, endereco_estado, endereco_cep,
          email_contato, telefone_principal, telefone_secundario, whatsapp,
          segunda_abertura, segunda_fechamento, segunda_ativo,
          terca_abertura, terca_fechamento, terca_ativo,
          quarta_abertura, quarta_fechamento, quarta_ativo,
          quinta_abertura, quinta_fechamento, quinta_ativo,
          sexta_abertura, sexta_fechamento, sexta_ativo,
          sabado_abertura, sabado_fechamento, sabado_ativo,
          domingo_abertura, domingo_fechamento, domingo_ativo,
          intervalo_agendamento, tempo_antecedencia_agendamento, tempo_cancelamento_agendamento,
          ambiente_nfe, certificado_digital_path, senha_certificado,
          api_habilitada, api_token, api_url_base,
          logo_url, cor_primaria, cor_secundaria, timezone, updated_by
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17,
          $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32,
          $33, $34, $35, $36, $37, $38, $39, $40, $41, $42, $43, $44, $45, $46, $47,
          $48, $49, $50, $51, $52
        )`,
        [
          valoresConfig.nome_empresarial,
          valoresConfig.nome_fantasia,
          valoresConfig.cnpj,
          valoresConfig.cnae,
          valoresConfig.cnae_secundario,
          valoresConfig.inscricao_estadual,
          valoresConfig.endereco_rua,
          valoresConfig.endereco_numero,
          valoresConfig.endereco_complemento,
          valoresConfig.endereco_bairro,
          valoresConfig.endereco_cidade,
          valoresConfig.endereco_estado,
          valoresConfig.endereco_cep,
          valoresConfig.email_contato,
          valoresConfig.telefone_principal,
          valoresConfig.telefone_secundario,
          valoresConfig.whatsapp,
          valoresConfig.segunda_abertura,
          valoresConfig.segunda_fechamento,
          valoresConfig.segunda_ativo,
          valoresConfig.terca_abertura,
          valoresConfig.terca_fechamento,
          valoresConfig.terca_ativo,
          valoresConfig.quarta_abertura,
          valoresConfig.quarta_fechamento,
          valoresConfig.quarta_ativo,
          valoresConfig.quinta_abertura,
          valoresConfig.quinta_fechamento,
          valoresConfig.quinta_ativo,
          valoresConfig.sexta_abertura,
          valoresConfig.sexta_fechamento,
          valoresConfig.sexta_ativo,
          valoresConfig.sabado_abertura,
          valoresConfig.sabado_fechamento,
          valoresConfig.sabado_ativo,
          valoresConfig.domingo_abertura,
          valoresConfig.domingo_fechamento,
          valoresConfig.domingo_ativo,
          valoresConfig.intervalo_agendamento,
          valoresConfig.tempo_antecedencia_agendamento,
          valoresConfig.tempo_cancelamento_agendamento,
          valoresConfig.updated_by,
        ]
      );
    }

    // Registrar log
    if (usuarioLogadoId) {
      await registrarLog({
        usuarioId: usuarioLogadoId,
        usuarioTipo: usuarioLogadoTipo,
        acao: existe.rows.length > 0 ? 'editar' : 'criar',
        modulo: 'configuracao',
        entidadeId: existe.rows.length > 0 ? existe.rows[0].id : null,
        entidadeTipo: 'configuracao',
        descricao: 'Configurações do sistema atualizadas',
        dadosNovos: valoresConfig,
        ipAddress: getClientIp(req),
        userAgent: getUserAgent(req),
      });
    }

    // Buscar configuração atualizada
    const configAtualizada = await pool.query(
      `SELECT * FROM configuracoes ORDER BY updated_at DESC LIMIT 1`
    );
    const config = configAtualizada.rows[0];

    res.json({
      message: 'Configurações atualizadas com sucesso!',
      configuracoes: config,
    });
  } catch (error) {
    console.error('Erro ao atualizar configurações:', error);
    res.status(500).json({
      error: 'Erro ao atualizar configurações',
      message: error.message,
    });
  }
});

module.exports = router;

