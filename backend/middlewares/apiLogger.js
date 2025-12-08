/**
 * Middleware de Logging Automático de Requisições API
 * 
 * Intercepta todas as requisições e registra automaticamente no sistema de logs.
 * Não precisa modificar cada endpoint individualmente.
 */

const { registrarLog, getClientIp, getUserAgent } = require('../utils/logger');

/**
 * Mapeia rotas e métodos HTTP para ações e módulos do sistema
 */
function mapearRotaParaAcao(method, path) {
  // Rotas que não devem ser logadas
  const rotasIgnoradas = [
    '/health',
    '/api/test-db',
    '/api/v1/test',
    '/api/v1/logs', // Para evitar loop infinito
    '/api/v1/logs/estatisticas',
    '/uploads',
  ];

  // Verificar se a rota deve ser ignorada
  if (rotasIgnoradas.some(rota => path.startsWith(rota))) {
    return null;
  }

  // Extrair informações da rota
  const partesRota = path.split('/').filter(p => p);
  
  // Mapear módulo baseado na rota
  let modulo = 'sistema';
  let acao = 'visualizar';
  let entidadeTipo = null;

  // Identificar módulo e entidade
  if (partesRota.includes('clientes')) {
    modulo = 'cliente';
    entidadeTipo = 'cliente';
  } else if (partesRota.includes('funcionarios')) {
    modulo = 'funcionario';
    entidadeTipo = 'funcionario';
  } else if (partesRota.includes('permissoes')) {
    modulo = 'permissao';
    entidadeTipo = 'permissao';
  } else if (partesRota.includes('controle-acessos')) {
    modulo = 'controle_acesso';
    entidadeTipo = 'acesso';
  } else if (partesRota.includes('auth')) {
    modulo = 'autenticacao';
    if (path.includes('login')) {
      acao = 'login';
      return { modulo, acao, entidadeTipo: null, deveLogar: true };
    } else if (path.includes('logout')) {
      acao = 'logout';
      return { modulo, acao, entidadeTipo: null, deveLogar: true };
    }
  } else if (partesRota.includes('vendas')) {
    modulo = 'venda';
    entidadeTipo = 'venda';
  } else if (partesRota.includes('despesas')) {
    modulo = 'despesa';
    entidadeTipo = 'despesa';
  } else if (partesRota.includes('agendamentos')) {
    modulo = 'agendamento';
    entidadeTipo = 'agendamento';
  }

  // Mapear método HTTP para ação
  if (method === 'POST') {
    acao = 'criar';
  } else if (method === 'PUT' || method === 'PATCH') {
    acao = 'editar';
  } else if (method === 'DELETE') {
    acao = 'excluir';
  } else if (method === 'GET') {
    // GET geralmente é visualizar, mas podemos ser mais específicos
    if (path.includes('/:id') || /\/[a-f0-9-]{36}$/.test(path)) {
      acao = 'visualizar_detalhes';
    } else {
      acao = 'visualizar_lista';
    }
  }

  return {
    modulo,
    acao,
    entidadeTipo,
    deveLogar: true,
  };
}

/**
 * Middleware principal de logging
 */
function apiLoggerMiddleware(req, res, next) {
  // Não fazer logging de requisições OPTIONS (preflight CORS)
  if (req.method === 'OPTIONS') {
    return next();
  }

  // Mapear rota para ação
  const mapeamento = mapearRotaParaAcao(req.method, req.path);
  
  // Se a rota não deve ser logada, continuar sem logar
  if (!mapeamento || !mapeamento.deveLogar) {
    return next();
  }

  // Capturar informações do usuário dos headers
  const usuarioId = req.headers['x-user-id'] || req.headers['X-User-Id'] || null;
  const usuarioTipo = req.headers['x-user-tipo'] || req.headers['X-User-Tipo'] || null;

  // Capturar informações da requisição
  const ipAddress = getClientIp(req);
  const userAgent = getUserAgent(req);
  const metodo = req.method;
  const rota = req.path;
  const params = req.params;
  const query = req.query;
  
  // Tentar extrair entidade_id da URL ou params
  let entidadeId = null;
  if (params && params.id) {
    entidadeId = params.id;
  } else {
    // Tentar extrair UUID da rota
    const uuidMatch = rota.match(/([a-f0-9-]{36})/i);
    if (uuidMatch) {
      entidadeId = uuidMatch[1];
    }
  }

  // Preparar descrição baseada na rota e método
  let descricao = `${metodo} ${rota}`;
  if (entidadeId) {
    descricao += ` (ID: ${entidadeId.substring(0, 8)}...)`;
  }

  // Para operações de criação, edição e exclusão, capturar dados do body
  let dadosNovos = null;
  let dadosAnteriores = null;

  if (['POST', 'PUT', 'PATCH'].includes(metodo)) {
    // Capturar dados do body (evitar senhas e dados sensíveis)
    const bodyCopy = { ...req.body };
    
    // Remover campos sensíveis
    if (bodyCopy.senha || bodyCopy.senha_hash || bodyCopy.password || bodyCopy.password_hash) {
      bodyCopy.senha = '[REDACTED]';
      bodyCopy.senha_hash = '[REDACTED]';
      bodyCopy.password = '[REDACTED]';
      bodyCopy.password_hash = '[REDACTED]';
    }

    dadosNovos = Object.keys(bodyCopy).length > 0 ? bodyCopy : null;
  }

  // Variáveis para capturar status da resposta
  let statusFinal = 'sucesso';
  let mensagemErro = null;
  let dadosResposta = null;

  // Interceptar resposta para capturar status
  const originalSend = res.send.bind(res);
  const originalJson = res.json.bind(res);

  res.json = function(data) {
    dadosResposta = data;
    if (res.statusCode >= 400) {
      statusFinal = 'erro';
      mensagemErro = data?.error || data?.message || `Erro ${res.statusCode}`;
    }
    return originalJson(data);
  };

  res.send = function(data) {
    if (res.statusCode >= 400) {
      statusFinal = 'erro';
      try {
        const parsed = typeof data === 'string' ? JSON.parse(data) : data;
        mensagemErro = parsed?.error || parsed?.message || `Erro ${res.statusCode}`;
      } catch {
        mensagemErro = `Erro ${res.statusCode}`;
      }
    }
    return originalSend(data);
  };

  // Registrar log após a resposta ser enviada
  res.on('finish', async () => {
    try {
      // Preparar descrição final com status
      let descricaoFinal = descricao;
      if (statusFinal === 'erro') {
        descricaoFinal += ` - ERRO: ${mensagemErro || res.statusCode}`;
      } else {
        descricaoFinal += ` - ${res.statusCode}`;
      }

      // Normalizar usuario_tipo antes de enviar para o logger
      // O logger já faz a normalização, mas vamos garantir aqui também
      let usuarioTipoNormalizado = usuarioTipo;
      if (!usuarioTipo && usuarioId) {
        usuarioTipoNormalizado = 'administrativo';
      } else if (!usuarioTipo && !usuarioId) {
        usuarioTipoNormalizado = 'sistema';
      }

      await registrarLog({
        usuarioId: usuarioId || null,
        usuarioTipo: usuarioTipoNormalizado,
        acao: mapeamento.acao,
        modulo: mapeamento.modulo,
        entidadeId: entidadeId || null,
        entidadeTipo: mapeamento.entidadeTipo,
        descricao: descricaoFinal,
        dadosAnteriores: dadosAnteriores,
        dadosNovos: dadosNovos,
        ipAddress: ipAddress,
        userAgent: userAgent,
        status: statusFinal,
        mensagemErro: mensagemErro,
      });

      // Log apenas para debug (pode remover em produção)
      if (process.env.NODE_ENV !== 'production') {
        console.log(`[API Logger] ${metodo} ${rota} - ${statusFinal} - Usuario: ${usuarioId || 'sistema'}`);
      }
    } catch (error) {
      // Não interromper o fluxo se o log falhar
      console.error('[API Logger] Erro ao registrar log:', error.message);
    }
  });

  // Continuar para o próximo middleware
  next();
}

module.exports = apiLoggerMiddleware;

