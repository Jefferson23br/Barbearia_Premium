const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { registrarLog, getClientIp, getUserAgent } = require('../utils/logger');

// Importa o serviço de integrações de forma segura
let criarIntegracao;
try {
  const integracoesService = require('../services/integracoes');
  criarIntegracao = integracoesService.criarIntegracao;
} catch (error) {
  console.error('Erro ao carregar serviço de integrações:', error.message);
  // Cria uma função mock para evitar quebrar a API
  criarIntegracao = async () => {
    throw new Error('Serviço de integrações não disponível. Verifique se o diretório services/integracoes.js existe.');
  };
}

/**
 * Função auxiliar para verificar se a integração DocSales está configurada e ativa
 */
async function verificarIntegracaoDocSales() {
  const integracaoCheck = await pool.query(
    'SELECT * FROM integracoes WHERE tipo_integracao = $1',
    ['docsales']
  );

  if (integracaoCheck.rows.length === 0) {
    throw new Error('Integração DocSales não configurada. Configure em Integrações > Integração de APIs.');
  }

  const integracaoConfig = integracaoCheck.rows[0];
  if (!integracaoConfig.ativo) {
    throw new Error('Integração DocSales não está ativa. Ative em Integrações > Habilitar API.');
  }

  return integracaoConfig;
}

/**
 * POST /api/v1/docsales/documentos
 * Envia um documento para assinatura
 */
router.post('/documentos', async (req, res) => {
  try {
    const usuarioLogadoId = req.headers['x-user-id'] || null;
    const usuarioLogadoTipo = req.headers['x-user-tipo'] || 'administrativo';

    const { titulo, conteudo, signatarios, opcoes } = req.body;

    // Validações
    if (!titulo) {
      return res.status(400).json({ error: 'Título do documento é obrigatório' });
    }

    if (!conteudo) {
      return res.status(400).json({ error: 'Conteúdo do documento é obrigatório' });
    }

    if (!signatarios || !Array.isArray(signatarios) || signatarios.length === 0) {
      return res.status(400).json({ error: 'Pelo menos um signatário é obrigatório' });
    }

    // Valida signatários
    for (const signatario of signatarios) {
      if (!signatario.nome || !signatario.email) {
        return res.status(400).json({ 
          error: 'Cada signatário deve ter nome e email' 
        });
      }
    }

    // Cria instância da integração
    const integracao = await criarIntegracao('docsales');

    // Envia documento para assinatura
    const resultado = await integracao.enviarDocumentoParaAssinatura({
      titulo,
      conteudo,
      signatarios,
      opcoes: opcoes || {}
    });

    // Registra log
    if (usuarioLogadoId) {
      await registrarLog({
        usuarioId: usuarioLogadoId,
        usuarioTipo: usuarioLogadoTipo,
        acao: 'criar',
        modulo: 'docsales',
        entidadeId: resultado.documento_id,
        entidadeTipo: 'documento',
        descricao: `Documento "${titulo}" enviado para assinatura via DocSales`,
        dadosNovos: {
          documento_id: resultado.documento_id,
          titulo,
          quantidade_signatarios: signatarios.length
        },
        ipAddress: getClientIp(req),
        userAgent: getUserAgent(req),
      });
    }

    res.status(201).json({
      message: 'Documento enviado para assinatura com sucesso!',
      ...resultado
    });
  } catch (error) {
    console.error('Erro ao enviar documento para assinatura:', error);
    res.status(500).json({
      error: 'Erro ao enviar documento para assinatura',
      message: error.message,
    });
  }
});

/**
 * GET /api/v1/docsales/documentos/:id
 * Consulta o status de um documento
 */
router.get('/documentos/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Cria instância da integração
    const integracao = await criarIntegracao('docsales');

    // Consulta status
    const resultado = await integracao.consultarStatusDocumento(id);

    res.json(resultado);
  } catch (error) {
    console.error('Erro ao consultar status do documento:', error);
    res.status(500).json({
      error: 'Erro ao consultar status do documento',
      message: error.message,
    });
  }
});

/**
 * POST /api/v1/docsales/documentos/:id/cancelar
 * Cancela um documento pendente
 */
router.post('/documentos/:id/cancelar', async (req, res) => {
  try {
    const { id } = req.params;
    const { motivo } = req.body;
    const usuarioLogadoId = req.headers['x-user-id'] || null;
    const usuarioLogadoTipo = req.headers['x-user-tipo'] || 'administrativo';

    // Cria instância da integração
    const integracao = await criarIntegracao('docsales');

    // Cancela documento
    const resultado = await integracao.cancelarDocumento(id, motivo);

    // Registra log
    if (usuarioLogadoId) {
      await registrarLog({
        usuarioId: usuarioLogadoId,
        usuarioTipo: usuarioLogadoTipo,
        acao: 'cancelar',
        modulo: 'docsales',
        entidadeId: id,
        entidadeTipo: 'documento',
        descricao: `Documento ${id} cancelado via DocSales`,
        dadosNovos: { motivo },
        ipAddress: getClientIp(req),
        userAgent: getUserAgent(req),
      });
    }

    res.json({
      message: 'Documento cancelado com sucesso!',
      ...resultado
    });
  } catch (error) {
    console.error('Erro ao cancelar documento:', error);
    res.status(500).json({
      error: 'Erro ao cancelar documento',
      message: error.message,
    });
  }
});

/**
 * GET /api/v1/docsales/documentos
 * Lista documentos
 */
router.get('/documentos', async (req, res) => {
  try {
    const { status, data_inicio, data_fim, pagina, limite } = req.query;

    // Verificar se a integração está configurada e ativa
    await verificarIntegracaoDocSales();

    // Cria instância da integração
    const integracao = await criarIntegracao('docsales');

    // Lista documentos
    const resultado = await integracao.listarDocumentos({
      status,
      data_inicio,
      data_fim,
      pagina: pagina ? parseInt(pagina) : undefined,
      limite: limite ? parseInt(limite) : undefined
    });

    res.json(resultado);
  } catch (error) {
    console.error('Erro ao listar documentos:', error);
    
    // Verificar se é erro de configuração
    if (error.message && (error.message.includes('não configurada') || error.message.includes('não está ativa'))) {
      return res.status(400).json({
        error: 'Integração DocSales não configurada',
        message: error.message
      });
    }

    res.status(500).json({
      error: 'Erro ao listar documentos',
      message: error.message,
    });
  }
});

/**
 * GET /api/v1/docsales/documentos/:id/download
 * Baixa o documento assinado
 */
router.get('/documentos/:id/download', async (req, res) => {
  try {
    const { id } = req.params;

    // Cria instância da integração
    const integracao = await criarIntegracao('docsales');

    // Baixa documento
    const pdfBuffer = await integracao.baixarDocumentoAssinado(id);

    // Define headers para download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="documento_${id}.pdf"`);
    res.setHeader('Content-Length', pdfBuffer.length);

    res.send(pdfBuffer);
  } catch (error) {
    console.error('Erro ao baixar documento:', error);
    res.status(500).json({
      error: 'Erro ao baixar documento',
      message: error.message,
    });
  }
});

/**
 * POST /api/v1/docsales/webhook
 * Endpoint para receber webhooks do DocSales
 */
router.post('/webhook', async (req, res) => {
  try {
    const evento = req.body;

    // Validação básica do webhook
    if (!evento.tipo || !evento.documento_id) {
      return res.status(400).json({ error: 'Dados do webhook inválidos' });
    }

    // Tipos de eventos possíveis:
    // - documento_criado
    // - documento_visualizado
    // - documento_assinado
    // - documento_recusado
    // - documento_cancelado
    // - documento_expirado

    console.log('Webhook recebido do DocSales:', {
      tipo: evento.tipo,
      documento_id: evento.documento_id,
      timestamp: new Date().toISOString()
    });

    // Aqui você pode processar o evento conforme necessário
    // Por exemplo, atualizar status no banco de dados, enviar notificações, etc.

    // Responde ao DocSales que o webhook foi recebido
    res.status(200).json({ 
      sucesso: true,
      mensagem: 'Webhook recebido com sucesso'
    });
  } catch (error) {
    console.error('Erro ao processar webhook do DocSales:', error);
    res.status(500).json({
      error: 'Erro ao processar webhook',
      message: error.message,
    });
  }
});

module.exports = router;

