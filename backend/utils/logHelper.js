/**
 * Helper Functions para Integração de Logs
 * 
 * Funções auxiliares para facilitar a integração de logs em novos endpoints.
 * Use estas funções para simplificar o código de registro de logs.
 */

const { registrarLog, getClientIp, getUserAgent } = require('./logger');

/**
 * Registra log de criação de uma entidade
 * 
 * @param {Object} req - Request do Express
 * @param {string} modulo - Módulo da ação: 'venda', 'agenda', 'marcacao', 'despesa', etc.
 * @param {string} entidadeId - ID da entidade criada
 * @param {string} entidadeTipo - Tipo da entidade: 'venda', 'agendamento', 'marcacao', etc.
 * @param {string} descricao - Descrição da ação (ex: "Venda de R$ 100 criada")
 * @param {Object} dadosNovos - Dados da entidade criada
 * @returns {Promise<void>}
 */
async function logCriar(req, modulo, entidadeId, entidadeTipo, descricao, dadosNovos = {}) {
  const usuarioId = req.headers['x-user-id'] || null;
  const usuarioTipo = req.headers['x-user-tipo'] || 'administrativo';

  if (usuarioId) {
    await registrarLog({
      usuarioId,
      usuarioTipo,
      acao: 'criar',
      modulo,
      entidadeId,
      entidadeTipo,
      descricao,
      dadosNovos,
      ipAddress: getClientIp(req),
      userAgent: getUserAgent(req),
    });
  }
}

/**
 * Registra log de edição de uma entidade
 * 
 * @param {Object} req - Request do Express
 * @param {string} modulo - Módulo da ação: 'venda', 'agenda', 'marcacao', 'despesa', etc.
 * @param {string} entidadeId - ID da entidade editada
 * @param {string} entidadeTipo - Tipo da entidade: 'venda', 'agendamento', 'marcacao', etc.
 * @param {string} descricao - Descrição da ação (ex: "Venda atualizada")
 * @param {Object} dadosAnteriores - Dados antes da edição
 * @param {Object} dadosNovos - Dados após a edição
 * @returns {Promise<void>}
 */
async function logEditar(req, modulo, entidadeId, entidadeTipo, descricao, dadosAnteriores = {}, dadosNovos = {}) {
  const usuarioId = req.headers['x-user-id'] || null;
  const usuarioTipo = req.headers['x-user-tipo'] || 'administrativo';

  if (usuarioId) {
    await registrarLog({
      usuarioId,
      usuarioTipo,
      acao: 'editar',
      modulo,
      entidadeId,
      entidadeTipo,
      descricao,
      dadosAnteriores,
      dadosNovos,
      ipAddress: getClientIp(req),
      userAgent: getUserAgent(req),
    });
  }
}

/**
 * Registra log de exclusão de uma entidade
 * 
 * @param {Object} req - Request do Express
 * @param {string} modulo - Módulo da ação: 'venda', 'agenda', 'marcacao', 'despesa', etc.
 * @param {string} entidadeId - ID da entidade excluída
 * @param {string} entidadeTipo - Tipo da entidade: 'venda', 'agendamento', 'marcacao', etc.
 * @param {string} descricao - Descrição da ação (ex: "Venda excluída")
 * @param {Object} dadosAnteriores - Dados da entidade excluída
 * @returns {Promise<void>}
 */
async function logExcluir(req, modulo, entidadeId, entidadeTipo, descricao, dadosAnteriores = {}) {
  const usuarioId = req.headers['x-user-id'] || null;
  const usuarioTipo = req.headers['x-user-tipo'] || 'administrativo';

  if (usuarioId) {
    await registrarLog({
      usuarioId,
      usuarioTipo,
      acao: 'excluir',
      modulo,
      entidadeId,
      entidadeTipo,
      descricao,
      dadosAnteriores,
      ipAddress: getClientIp(req),
      userAgent: getUserAgent(req),
    });
  }
}

/**
 * Busca dados anteriores de uma entidade antes de editar/excluir
 * Útil para garantir que temos os dados para o log
 * 
 * @param {Pool} pool - Pool do PostgreSQL
 * @param {string} tabela - Nome da tabela (ex: 'protese.vendas')
 * @param {string} id - ID da entidade
 * @param {Array<string>} campos - Campos a buscar (ex: ['valor', 'cliente_id', 'data'])
 * @returns {Promise<Object>} Dados da entidade
 */
async function buscarDadosAnteriores(pool, tabela, id, campos = ['*']) {
  try {
    const camposStr = campos.join(', ');
    const result = await pool.query(
      `SELECT ${camposStr} FROM ${tabela} WHERE id = $1`,
      [id]
    );
    return result.rows[0] || {};
  } catch (error) {
    console.error(`Erro ao buscar dados anteriores de ${tabela}:`, error);
    return {};
  }
}

module.exports = {
  logCriar,
  logEditar,
  logExcluir,
  buscarDadosAnteriores,
};







