/**
 * Serviço Unificado de Integrações
 * 
 * Este arquivo centraliza todas as integrações com APIs externas.
 * Cada integração possui seu código específico, mas compartilha
 * a mesma estrutura base para facilitar manutenção e escalabilidade.
 */

const pool = require('../config/database');
const axios = require('axios');

/**
 * Classe base para integrações
 */
class IntegracaoBase {
  constructor(config) {
    this.config = config;
    this.tipo = config.tipo_integracao;
    this.ambiente = config.ambiente || 'homologacao';
    this.token = this.ambiente === 'producao' 
      ? config.token_producao 
      : config.token_homologacao;
    this.configuracao = config.configuracao_json || {};
  }

  /**
   * Valida se a integração está configurada corretamente
   */
  validarConfiguracao() {
    if (!this.token) {
      throw new Error(`Token de ${this.ambiente} não configurado`);
    }
    return true;
  }

  /**
   * Obtém a URL base da API baseada no ambiente
   */
  getBaseUrl() {
    throw new Error('Método getBaseUrl deve ser implementado pela classe filha');
  }

  /**
   * Obtém os headers padrão para requisições
   */
  getHeaders() {
    throw new Error('Método getHeaders deve ser implementado pela classe filha');
  }
}

/**
 * Integração com DocSales
 * Sistema de gestão de assinaturas de contratos eletrônicos
 */
class DocSalesIntegracao extends IntegracaoBase {
  constructor(config) {
    super(config);
    this.baseUrlProducao = 'https://api.docsales.com.br';
    this.baseUrlHomologacao = 'https://api-sandbox.docsales.com.br';
  }

  getBaseUrl() {
    return this.ambiente === 'producao' 
      ? this.baseUrlProducao 
      : this.baseUrlHomologacao;
  }

  getHeaders() {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.token}`,
      'Accept': 'application/json'
    };
  }

  /**
   * Envia um documento para assinatura
   * @param {Object} documento - Dados do documento
   * @param {string} documento.titulo - Título do documento
   * @param {string} documento.conteudo - Conteúdo do documento (base64 ou texto)
   * @param {Array} documento.signatarios - Lista de signatários
   * @param {Object} documento.opcoes - Opções adicionais (prazo, notificações, etc)
   * @returns {Promise<Object>} Resposta da API com dados do documento criado
   */
  async enviarDocumentoParaAssinatura(documento) {
    this.validarConfiguracao();

    const url = `${this.getBaseUrl()}/api/v1/documentos`;
    
    const payload = {
      titulo: documento.titulo,
      conteudo: documento.conteudo,
      signatarios: documento.signatarios.map(s => ({
        nome: s.nome,
        email: s.email,
        cpf: s.cpf,
        ordem: s.ordem || 1,
        tipo: s.tipo || 'signatario' // 'signatario' ou 'testemunha'
      })),
      opcoes: {
        prazo_dias: documento.opcoes?.prazo_dias || 30,
        enviar_email: documento.opcoes?.enviar_email !== false,
        permitir_recusar: documento.opcoes?.permitir_recusar !== false,
        ...documento.opcoes
      }
    };

    // Adiciona email remetente se configurado
    if (this.configuracao.email_remetente) {
      payload.email_remetente = this.configuracao.email_remetente;
    }

    try {
      const response = await axios.post(url, payload, {
        headers: this.getHeaders()
      });

      const data = response.data;
      return {
        sucesso: true,
        documento_id: data.id || data.documento_id,
        link_assinatura: data.link_assinatura,
        dados: data
      };
    } catch (error) {
      console.error('Erro ao enviar documento para assinatura no DocSales:', error);
      if (error.response) {
        throw new Error(error.response.data?.message || `Erro ao enviar documento: ${error.response.statusText}`);
      }
      throw error;
    }
  }

  /**
   * Consulta o status de um documento
   * @param {string} documentoId - ID do documento
   * @returns {Promise<Object>} Status do documento
   */
  async consultarStatusDocumento(documentoId) {
    this.validarConfiguracao();

    const url = `${this.getBaseUrl()}/api/v1/documentos/${documentoId}`;

    try {
      const response = await axios.get(url, {
        headers: this.getHeaders()
      });

      const data = response.data;
      return {
        sucesso: true,
        status: data.status, // 'pendente', 'assinado', 'cancelado', 'expirado'
        documento_id: data.id || documentoId,
        signatarios: data.signatarios || [],
        data_assinatura: data.data_assinatura,
        link_documento: data.link_documento,
        dados: data
      };
    } catch (error) {
      console.error('Erro ao consultar status do documento no DocSales:', error);
      if (error.response) {
        throw new Error(error.response.data?.message || `Erro ao consultar documento: ${error.response.statusText}`);
      }
      throw error;
    }
  }

  /**
   * Cancela um documento pendente
   * @param {string} documentoId - ID do documento
   * @param {string} motivo - Motivo do cancelamento
   * @returns {Promise<Object>} Resultado do cancelamento
   */
  async cancelarDocumento(documentoId, motivo = 'Cancelado pelo usuário') {
    this.validarConfiguracao();

    const url = `${this.getBaseUrl()}/api/v1/documentos/${documentoId}/cancelar`;

    try {
      const response = await axios.post(url, { motivo }, {
        headers: this.getHeaders()
      });

      const data = response.data;
      return {
        sucesso: true,
        documento_id: documentoId,
        status: 'cancelado',
        dados: data
      };
    } catch (error) {
      console.error('Erro ao cancelar documento no DocSales:', error);
      if (error.response) {
        throw new Error(error.response.data?.message || `Erro ao cancelar documento: ${error.response.statusText}`);
      }
      throw error;
    }
  }

  /**
   * Lista documentos
   * @param {Object} filtros - Filtros para busca
   * @returns {Promise<Object>} Lista de documentos
   */
  async listarDocumentos(filtros = {}) {
    this.validarConfiguracao();

    const params = new URLSearchParams();
    if (filtros.status) params.append('status', filtros.status);
    if (filtros.data_inicio) params.append('data_inicio', filtros.data_inicio);
    if (filtros.data_fim) params.append('data_fim', filtros.data_fim);
    if (filtros.pagina) params.append('pagina', filtros.pagina);
    if (filtros.limite) params.append('limite', filtros.limite);

    const url = `${this.getBaseUrl()}/api/v1/documentos?${params.toString()}`;

    try {
      const response = await axios.get(url, {
        headers: this.getHeaders()
      });

      const data = response.data;
      return {
        sucesso: true,
        documentos: data.documentos || data.data || [],
        total: data.total || 0,
        pagina: data.pagina || 1,
        dados: data
      };
    } catch (error) {
      console.error('Erro ao listar documentos no DocSales:', error);
      if (error.response) {
        throw new Error(error.response.data?.message || `Erro ao listar documentos: ${error.response.statusText}`);
      }
      throw error;
    }
  }

  /**
   * Baixa o documento assinado
   * @param {string} documentoId - ID do documento
   * @returns {Promise<Buffer>} Arquivo PDF do documento assinado
   */
  async baixarDocumentoAssinado(documentoId) {
    this.validarConfiguracao();

    const url = `${this.getBaseUrl()}/api/v1/documentos/${documentoId}/download`;

    try {
      const response = await axios.get(url, {
        headers: {
          ...this.getHeaders(),
          'Accept': 'application/pdf'
        },
        responseType: 'arraybuffer'
      });

      return Buffer.from(response.data);
    } catch (error) {
      console.error('Erro ao baixar documento assinado no DocSales:', error);
      if (error.response) {
        throw new Error(`Erro ao baixar documento: ${error.response.statusText}`);
      }
      throw error;
    }
  }
}

/**
 * Integração com Clicksign
 * Sistema de assinatura eletrônica de documentos com validade jurídica
 */
class ClicksignIntegracao extends IntegracaoBase {
  constructor(config) {
    super(config);
    this.baseUrlProducao = 'https://api.clicksign.com';
    this.baseUrlHomologacao = 'https://sandbox.clicksign.com';
  }

  getBaseUrl() {
    return this.ambiente === 'producao' 
      ? this.baseUrlProducao 
      : this.baseUrlHomologacao;
  }

  getHeaders() {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.token}`,
      'Accept': 'application/json'
    };
  }

  /**
   * Envia um documento para assinatura
   * @param {Object} documento - Dados do documento
   * @param {string} documento.titulo - Título do documento
   * @param {string} documento.conteudo - Conteúdo do documento (base64 ou texto)
   * @param {Array} documento.signatarios - Lista de signatários
   * @param {Object} documento.opcoes - Opções adicionais (prazo, notificações, etc)
   * @returns {Promise<Object>} Resposta da API com dados do documento criado
   */
  async enviarDocumentoParaAssinatura(documento) {
    this.validarConfiguracao();

    const url = `${this.getBaseUrl()}/api/v1/documents`;
    
    const payload = {
      document: {
        path: documento.titulo || 'documento.pdf',
        content_base64: documento.conteudo,
        deadline_at: documento.opcoes?.prazo_dias 
          ? new Date(Date.now() + documento.opcoes.prazo_dias * 24 * 60 * 60 * 1000).toISOString()
          : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        auto_close: documento.opcoes?.auto_close !== false,
        locale: 'pt-BR'
      },
      signers: documento.signatarios.map(s => ({
        email: s.email,
        action: 'sign',
        name: s.nome,
        documentation: s.cpf?.replace(/\D/g, '') || '',
        birthday: s.data_nascimento || null,
        delivery: s.enviar_email !== false ? 'email' : 'none'
      }))
    };

    // Adiciona email remetente se configurado
    if (this.configuracao.email_remetente) {
      payload.document.from_email = this.configuracao.email_remetente;
    }

    try {
      const response = await axios.post(url, payload, {
        headers: this.getHeaders()
      });

      const data = response.data;
      return {
        sucesso: true,
        documento_id: data.document?.key || data.key,
        link_assinatura: data.document?.short_url || data.short_url,
        dados: data
      };
    } catch (error) {
      console.error('Erro ao enviar documento para assinatura no Clicksign:', error);
      if (error.response) {
        throw new Error(error.response.data?.message || error.response.data?.errors?.[0] || `Erro ao enviar documento: ${error.response.statusText}`);
      }
      throw error;
    }
  }

  /**
   * Consulta o status de um documento
   * @param {string} documentoId - ID do documento (key)
   * @returns {Promise<Object>} Status do documento
   */
  async consultarStatusDocumento(documentoId) {
    this.validarConfiguracao();

    const url = `${this.getBaseUrl()}/api/v1/documents/${documentoId}`;

    try {
      const response = await axios.get(url, {
        headers: this.getHeaders()
      });

      const data = response.data;
      return {
        sucesso: true,
        status: data.document?.status || data.status, // 'pending', 'closed', 'canceled', 'expired'
        documento_id: data.document?.key || documentoId,
        signatarios: data.document?.signers || data.signers || [],
        data_assinatura: data.document?.finished_at || data.finished_at,
        link_documento: data.document?.short_url || data.short_url,
        dados: data
      };
    } catch (error) {
      console.error('Erro ao consultar status do documento no Clicksign:', error);
      if (error.response) {
        throw new Error(error.response.data?.message || error.response.data?.errors?.[0] || `Erro ao consultar documento: ${error.response.statusText}`);
      }
      throw error;
    }
  }

  /**
   * Cancela um documento pendente
   * @param {string} documentoId - ID do documento (key)
   * @param {string} motivo - Motivo do cancelamento
   * @returns {Promise<Object>} Resultado do cancelamento
   */
  async cancelarDocumento(documentoId, motivo = 'Cancelado pelo usuário') {
    this.validarConfiguracao();

    const url = `${this.getBaseUrl()}/api/v1/documents/${documentoId}/cancel`;

    try {
      const response = await axios.post(url, { message: motivo }, {
        headers: this.getHeaders()
      });

      const data = response.data;
      return {
        sucesso: true,
        documento_id: documentoId,
        status: 'canceled',
        dados: data
      };
    } catch (error) {
      console.error('Erro ao cancelar documento no Clicksign:', error);
      if (error.response) {
        throw new Error(error.response.data?.message || error.response.data?.errors?.[0] || `Erro ao cancelar documento: ${error.response.statusText}`);
      }
      throw error;
    }
  }

  /**
   * Lista documentos
   * @param {Object} filtros - Filtros para busca
   * @returns {Promise<Object>} Lista de documentos
   */
  async listarDocumentos(filtros = {}) {
    this.validarConfiguracao();

    const params = new URLSearchParams();
    if (filtros.status) params.append('status', filtros.status);
    if (filtros.page) params.append('page', filtros.page);
    if (filtros.per_page) params.append('per_page', filtros.per_page || 20);

    const url = `${this.getBaseUrl()}/api/v1/documents?${params.toString()}`;

    try {
      const response = await axios.get(url, {
        headers: this.getHeaders()
      });

      const data = response.data;
      return {
        sucesso: true,
        documentos: data.documents || data.data || [],
        total: data.total || 0,
        pagina: data.page || 1,
        dados: data
      };
    } catch (error) {
      console.error('Erro ao listar documentos no Clicksign:', error);
      if (error.response) {
        throw new Error(error.response.data?.message || error.response.data?.errors?.[0] || `Erro ao listar documentos: ${error.response.statusText}`);
      }
      throw error;
    }
  }

  /**
   * Baixa o documento assinado
   * @param {string} documentoId - ID do documento (key)
   * @returns {Promise<Buffer>} Arquivo PDF do documento assinado
   */
  async baixarDocumentoAssinado(documentoId) {
    this.validarConfiguracao();

    const url = `${this.getBaseUrl()}/api/v1/documents/${documentoId}/download`;

    try {
      const response = await axios.get(url, {
        headers: {
          ...this.getHeaders(),
          'Accept': 'application/pdf'
        },
        responseType: 'arraybuffer'
      });

      return Buffer.from(response.data);
    } catch (error) {
      console.error('Erro ao baixar documento assinado no Clicksign:', error);
      if (error.response) {
        throw new Error(`Erro ao baixar documento: ${error.response.statusText}`);
      }
      throw error;
    }
  }
}

/**
 * Factory para criar instâncias de integrações
 * @param {string} tipo - Tipo da integração
 * @param {Object} config - Configuração da integração
 * @returns {IntegracaoBase} Instância da integração
 */
async function criarIntegracao(tipo, config = null) {
  // Se não foi passada a config, busca do banco de dados
  if (!config) {
    const result = await pool.query(
      'SELECT * FROM integracoes WHERE tipo_integracao = $1',
      [tipo]
    );

    if (result.rows.length === 0) {
      throw new Error(`Integração ${tipo} não encontrada`);
    }

    config = result.rows[0];
  }

  // Verifica se a integração está ativa
  if (!config.ativo) {
    throw new Error(`Integração ${tipo} não está ativa`);
  }

  // Cria a instância apropriada
  switch (tipo) {
    case 'docsales':
      return new DocSalesIntegracao(config);
    
    case 'clicksign':
      return new ClicksignIntegracao(config);
    
    // Adicione outras integrações aqui conforme necessário
    // case 'focus_nfe':
    //   return new FocusNFeIntegracao(config);
    // case 'asaas':
    //   return new AsaasIntegracao(config);
    
    default:
      throw new Error(`Tipo de integração ${tipo} não suportado`);
  }
}

/**
 * Obtém a configuração de uma integração do banco de dados
 * @param {string} tipo - Tipo da integração
 * @returns {Promise<Object>} Configuração da integração
 */
async function obterConfiguracaoIntegracao(tipo) {
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
    return null;
  }

  return result.rows[0];
}

module.exports = {
  criarIntegracao,
  obterConfiguracaoIntegracao,
  IntegracaoBase,
  DocSalesIntegracao,
  ClicksignIntegracao
};

