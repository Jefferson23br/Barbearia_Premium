/**
 * Sistema de Logs - Helper para registrar ações do sistema
 * 
 * Este módulo fornece funções para registrar logs de ações importantes
 * realizadas pelos usuários no sistema.
 */

const { Pool } = require('pg');

// Pool do banco (será injetado)
let pool = null;

/**
 * Inicializa o logger com o pool do banco de dados
 * @param {Pool} dbPool - Pool de conexão do PostgreSQL
 */
function initLogger(dbPool) {
  pool = dbPool;
}

/**
 * Registra uma ação no sistema de logs
 * 
 * @param {Object} options - Opções do log
 * @param {string} options.usuarioId - ID do usuário que realizou a ação
 * @param {string} options.usuarioTipo - Tipo do usuário: 'cliente' ou 'administrativo'
 * @param {string} options.usuarioNome - Nome do usuário (opcional, será buscado se não fornecido)
 * @param {string} options.acao - Tipo de ação: 'criar', 'editar', 'excluir', 'visualizar', 'login', 'logout', 'venda', 'despesa', etc.
 * @param {string} options.modulo - Módulo onde a ação foi realizada: 'funcionario', 'cliente', 'venda', 'despesa', 'agendamento', 'permissao', etc.
 * @param {string} [options.entidadeId] - ID da entidade afetada (opcional)
 * @param {string} [options.entidadeTipo] - Tipo da entidade (opcional)
 * @param {string} [options.descricao] - Descrição detalhada da ação
 * @param {Object} [options.dadosAnteriores] - Dados antes da alteração (para edições)
 * @param {Object} [options.dadosNovos] - Dados após a alteração (para edições/criações)
 * @param {string} [options.ipAddress] - IP do usuário
 * @param {string} [options.userAgent] - User agent do navegador
 * @param {string} [options.status='sucesso'] - Status: 'sucesso', 'erro', 'cancelado'
 * @param {string} [options.mensagemErro] - Mensagem de erro (se status = 'erro')
 * 
 * @returns {Promise<void>}
 */
async function registrarLog({
  usuarioId,
  usuarioTipo,
  usuarioNome = null,
  acao,
  modulo,
  entidadeId = null,
  entidadeTipo = null,
  descricao = null,
  dadosAnteriores = null,
  dadosNovos = null,
  ipAddress = null,
  userAgent = null,
  status = 'sucesso',
  mensagemErro = null,
}) {
  if (!pool) {
    console.error('Logger não inicializado! Chame initLogger() primeiro.');
    return;
  }

  try {
    // Normalizar usuario_tipo: 'master' e 'proprietario' são tipos de usuário administrativo
    // O banco só aceita: 'cliente', 'administrativo', 'sistema' ou NULL
    
    // Normalizar string: trim e lowercase para comparação
    const usuarioTipoStr = usuarioTipo ? String(usuarioTipo).trim().toLowerCase() : null;
    
    let usuarioTipoNormalizado = null;
    
    // Debug: verificar valor original
    console.log('[LOGGER DEBUG] usuarioTipo recebido:', usuarioTipo, '| normalizado:', usuarioTipoStr, '| tipo:', typeof usuarioTipo);
    
    if (!usuarioTipoStr || usuarioTipoStr === 'null' || usuarioTipoStr === 'undefined' || usuarioTipoStr === '') {
      // Se não tiver tipo, usar 'sistema' se não houver usuarioId, ou 'administrativo' se houver
      usuarioTipoNormalizado = usuarioId ? 'administrativo' : 'sistema';
    } else if (usuarioTipoStr === 'master' || usuarioTipoStr === 'proprietario' || usuarioTipoStr === 'funcionario') {
      usuarioTipoNormalizado = 'administrativo';
    } else if (usuarioTipoStr === 'cliente') {
      usuarioTipoNormalizado = 'cliente';
    } else if (usuarioTipoStr === 'administrativo') {
      usuarioTipoNormalizado = 'administrativo';
    } else if (usuarioTipoStr === 'sistema') {
      usuarioTipoNormalizado = 'sistema';
    } else {
      // Se for outro tipo não reconhecido, usar 'administrativo' como padrão
      console.warn('[LOGGER WARN] Tipo de usuário desconhecido:', usuarioTipoStr, '| Convertendo para administrativo');
      usuarioTipoNormalizado = 'administrativo';
    }
    
    // Debug: verificar valor normalizado final
    console.log('[LOGGER DEBUG] usuarioTipo normalizado FINAL:', usuarioTipoNormalizado);
    
    // Garantir que nunca será 'master', 'proprietario', etc
    if (usuarioTipoNormalizado && !['cliente', 'administrativo', 'sistema'].includes(usuarioTipoNormalizado)) {
      console.error('[LOGGER ERROR] Tipo normalizado ainda inválido:', usuarioTipoNormalizado, '| Forçando para administrativo');
      usuarioTipoNormalizado = 'administrativo';
    }
    // Se nome do usuário não foi fornecido, buscar do banco
    if (!usuarioNome && usuarioId) {
      try {
        if (usuarioTipoNormalizado === 'administrativo') {
          const result = await pool.query(
            'SELECT nome_completo FROM protese.usuarios_administrativos WHERE id = $1',
            [usuarioId]
          );
          if (result.rows.length > 0) {
            usuarioNome = result.rows[0].nome_completo;
          }
        } else if (usuarioTipoNormalizado === 'cliente') {
          const result = await pool.query(
            'SELECT nome_completo FROM protese.usuarios_clientes WHERE id = $1',
            [usuarioId]
          );
          if (result.rows.length > 0) {
            usuarioNome = result.rows[0].nome_completo;
          }
        }
      } catch (error) {
        console.error('Erro ao buscar nome do usuário para log:', error);
        // Continua mesmo se não conseguir buscar o nome
      }
    }

    // Garantir valor final antes do INSERT
    const usuarioTipoFinal = usuarioTipoNormalizado || 'sistema';
    
    // Debug antes do INSERT
    console.log('[LOGGER DEBUG] Inserindo log com usuarioTipoFinal:', usuarioTipoFinal);
    
    // Inserir log no banco
    // Se usuarioId for null, ainda assim registramos o log (para ações do sistema)
    await pool.query(
      `INSERT INTO protese.logs_sistema (
        usuario_id,
        usuario_tipo,
        usuario_nome,
        acao,
        modulo,
        entidade_id,
        entidade_tipo,
        descricao,
        dados_anteriores,
        dados_novos,
        ip_address,
        user_agent,
        status,
        mensagem_erro
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
      [
        usuarioId || null,
        usuarioTipoFinal, // SEMPRE usar o normalizado, nunca o original
        usuarioNome || null,
        acao,
        modulo,
        entidadeId || null,
        entidadeTipo || null,
        descricao || null,
        dadosAnteriores ? JSON.stringify(dadosAnteriores) : null,
        dadosNovos ? JSON.stringify(dadosNovos) : null,
        ipAddress || null,
        userAgent || null,
        status || 'sucesso',
        mensagemErro || null,
      ]
    );
    
    // Debug: confirmar inserção
    console.log('[LOGGER DEBUG] ✅ Log inserido com sucesso. usuarioTipo inserido:', usuarioTipoFinal);
  } catch (error) {
    // Não falhar a requisição principal se o log falhar
    console.error('❌ [LOGGER ERROR] Erro ao registrar log:', error.message);
    console.error('[LOGGER DEBUG] Valores que causaram erro:');
    console.error('  - usuarioTipo original:', usuarioTipo);
    console.error('  - usuarioTipo normalizado:', usuarioTipoNormalizado);
    console.error('  - usuarioTipo final:', usuarioTipoFinal || 'N/A');
    console.error('  - Stack:', error.stack);
  }
}

/**
 * Helper para extrair IP do request
 * @param {Object} req - Request do Express
 * @returns {string} IP address
 */
function getClientIp(req) {
  return (
    req.headers['x-forwarded-for']?.split(',')[0] ||
    req.headers['x-real-ip'] ||
    req.connection?.remoteAddress ||
    req.socket?.remoteAddress ||
    req.ip ||
    'unknown'
  );
}

/**
 * Helper para extrair User Agent do request
 * @param {Object} req - Request do Express
 * @returns {string} User Agent
 */
function getUserAgent(req) {
  return req.headers['user-agent'] || 'unknown';
}

module.exports = {
  initLogger,
  registrarLog,
  getClientIp,
  getUserAgent,
};

