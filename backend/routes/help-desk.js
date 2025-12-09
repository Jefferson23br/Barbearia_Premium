const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { uploadHelpDesk } = require('../config/multer');
const { registrarLog, getClientIp, getUserAgent } = require('../utils/logger');

/**
 * GET /api/v1/help-desk/chamados
 * Lista chamados com filtros de permissão
 */
router.get('/chamados', async (req, res) => {
  try {
    const usuarioId = req.headers['x-user-id'] || req.headers['X-User-Id'];
    const usuarioTipo = req.headers['x-user-tipo'] || req.headers['X-User-Tipo'] || 'funcionario';
    const { status, temperatura, tipo_chamado, responsavel_id } = req.query;

    if (!usuarioId || usuarioId.trim() === '') {
      return res.status(401).json({ error: 'Usuário não autenticado' });
    }

    // Verificar usuário e permissões
    const usuarioCheck = await pool.query(
      'SELECT tipo_usuario FROM protese.usuarios_administrativos WHERE id = $1',
      [usuarioId]
    );

    if (usuarioCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    const tipoUsuario = usuarioCheck.rows[0].tipo_usuario;
    const isMaster = tipoUsuario === 'master';

    // Verificar permissão help_desk_ver (se não for Master)
    let temPermissaoHelpDesk = isMaster;
    if (!isMaster) {
      const permissoesCheck = await pool.query(
        'SELECT help_desk_ver FROM protese.permissoes_usuarios WHERE usuario_id = $1',
        [usuarioId]
      );
      if (permissoesCheck.rows.length > 0) {
        temPermissaoHelpDesk = permissoesCheck.rows[0].help_desk_ver === true;
      }
    }

    if (!temPermissaoHelpDesk) {
      return res.status(403).json({ error: 'Você não tem permissão para acessar o Help Desk' });
    }

    // Construir query base
    let query = `
      SELECT 
        hdc.id,
        hdc.data_emissao,
        hdc.tipo_chamado,
        hdc.descricao,
        hdc.email_contato,
        hdc.telefone_whatsapp,
        hdc.temperatura,
        hdc.status,
        hdc.created_at,
        hdc.updated_at,
        hdc.funcionario_abriu_id,
        ua_abriu.nome_completo as funcionario_abriu_nome,
        hdc.responsavel_id,
        ua_resp.nome_completo as responsavel_nome,
        (SELECT COUNT(*) FROM protese.help_desk_respostas WHERE chamado_id = hdc.id) as total_respostas
      FROM protese.help_desk_chamados hdc
      INNER JOIN protese.usuarios_administrativos ua_abriu ON hdc.funcionario_abriu_id = ua_abriu.id
      INNER JOIN protese.usuarios_administrativos ua_resp ON hdc.responsavel_id = ua_resp.id
      WHERE 1=1
    `;

    const params = [];
    let paramIndex = 1;

    // Filtros de permissão
    if (!isMaster) {
      // Funcionário/Proprietário vê apenas seus chamados ou chamados onde é responsável
      query += ` AND (hdc.funcionario_abriu_id = $${paramIndex} OR hdc.responsavel_id = $${paramIndex})`;
      params.push(usuarioId);
      paramIndex++;
    }

    // Filtros opcionais
    if (status) {
      query += ` AND hdc.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    if (temperatura) {
      query += ` AND hdc.temperatura = $${paramIndex}`;
      params.push(temperatura);
      paramIndex++;
    }

    if (tipo_chamado) {
      query += ` AND hdc.tipo_chamado = $${paramIndex}`;
      params.push(tipo_chamado);
      paramIndex++;
    }

    if (responsavel_id) {
      query += ` AND hdc.responsavel_id = $${paramIndex}`;
      params.push(responsavel_id);
      paramIndex++;
    }

    query += ` ORDER BY hdc.data_emissao DESC`;

    const result = await pool.query(query, params);

    res.json({ chamados: result.rows });
  } catch (error) {
    console.error('Erro ao buscar chamados:', error);
    res.status(500).json({
      error: 'Erro ao buscar chamados',
      message: error.message,
    });
  }
});

/**
 * POST /api/v1/help-desk/chamados
 * Cria um novo chamado
 */
router.post('/chamados', uploadHelpDesk.array('anexos', 10), async (req, res) => {
  try {
    const usuarioId = req.headers['x-user-id'] || req.headers['X-User-Id'];
    const usuarioTipo = req.headers['x-user-tipo'] || req.headers['X-User-Tipo'] || 'funcionario';

    if (!usuarioId) {
      return res.status(401).json({ error: 'Usuário não autenticado' });
    }

    const {
      tipo_chamado,
      descricao,
      email_contato,
      telefone_whatsapp,
      temperatura,
      responsavel_id,
    } = req.body;

    // Validações
    if (!tipo_chamado || !descricao || !temperatura) {
      return res.status(400).json({ error: 'Campos obrigatórios: tipo_chamado, descricao, temperatura' });
    }

    if (!['verde', 'amarelo', 'vermelho'].includes(temperatura)) {
      return res.status(400).json({ error: 'Temperatura deve ser: verde, amarelo ou vermelho' });
    }

    // Buscar Master como responsável padrão se não informado
    let responsavelId = responsavel_id;
    if (!responsavelId) {
      const masterResult = await pool.query(
        "SELECT id FROM protese.usuarios_administrativos WHERE tipo_usuario = 'master' LIMIT 1"
      );
      if (masterResult.rows.length > 0) {
        responsavelId = masterResult.rows[0].id;
      } else {
        return res.status(500).json({ error: 'Nenhum Master encontrado no sistema' });
      }
    }

    // Verificar se o responsável existe
    const responsavelCheck = await pool.query(
      'SELECT id FROM protese.usuarios_administrativos WHERE id = $1',
      [responsavelId]
    );
    if (responsavelCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Responsável não encontrado' });
    }

    // Criar chamado
    const chamadoResult = await pool.query(
      `INSERT INTO protese.help_desk_chamados (
        tipo_chamado, funcionario_abriu_id, responsavel_id, descricao,
        email_contato, telefone_whatsapp, temperatura, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *`,
      [
        tipo_chamado,
        usuarioId,
        responsavelId,
        descricao,
        email_contato || null,
        telefone_whatsapp || null,
        temperatura,
        'ABERTO',
      ]
    );

    const chamado = chamadoResult.rows[0];

    // Processar anexos se houver
    const baseUrl = process.env.API_BASE_URL || 'http://localhost:3001';
    const anexos = [];

    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const urlArquivo = `${baseUrl}/uploads/help-desk/${file.filename}`;
        const tipoArquivo = file.mimetype.startsWith('image/') ? 'imagem' : 'pdf';

        const anexoResult = await pool.query(
          `INSERT INTO protese.help_desk_anexos (
            chamado_id, nome_arquivo, url_arquivo, tipo_arquivo, tamanho_bytes
          ) VALUES ($1, $2, $3, $4, $5)
          RETURNING *`,
          [chamado.id, file.originalname, urlArquivo, tipoArquivo, file.size]
        );

        anexos.push(anexoResult.rows[0]);
      }
    }

    // Registrar log
    await registrarLog({
      usuarioId,
      usuarioTipo,
      acao: 'criar',
      modulo: 'help_desk',
      entidadeId: chamado.id,
      entidadeTipo: 'chamado',
      descricao: `Chamado ${tipo_chamado} criado - ${temperatura}`,
      dadosNovos: {
        tipo_chamado,
        temperatura,
        status: 'ABERTO',
      },
      ipAddress: getClientIp(req),
      userAgent: getUserAgent(req),
    });

    res.status(201).json({
      message: 'Chamado criado com sucesso!',
      chamado: { ...chamado, anexos },
    });
  } catch (error) {
    console.error('Erro ao criar chamado:', error);
    res.status(500).json({
      error: 'Erro ao criar chamado',
      message: error.message,
    });
  }
});

/**
 * GET /api/v1/help-desk/chamados/:id
 * Busca um chamado específico com todas as informações
 */
router.get('/chamados/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const usuarioId = req.headers['x-user-id'] || req.headers['X-User-Id'];
    const usuarioTipo = req.headers['x-user-tipo'] || req.headers['X-User-Tipo'] || 'funcionario';

    if (!usuarioId) {
      return res.status(401).json({ error: 'Usuário não autenticado' });
    }

    // Buscar chamado
    const chamadoResult = await pool.query(
      `SELECT 
        hdc.*,
        ua_abriu.nome_completo as funcionario_abriu_nome,
        ua_resp.nome_completo as responsavel_nome
      FROM protese.help_desk_chamados hdc
      INNER JOIN protese.usuarios_administrativos ua_abriu ON hdc.funcionario_abriu_id = ua_abriu.id
      INNER JOIN protese.usuarios_administrativos ua_resp ON hdc.responsavel_id = ua_resp.id
      WHERE hdc.id = $1`,
      [id]
    );

    if (chamadoResult.rows.length === 0) {
      return res.status(404).json({ error: 'Chamado não encontrado' });
    }

    const chamado = chamadoResult.rows[0];

    // Verificar permissão
    const usuarioCheck = await pool.query(
      'SELECT tipo_usuario FROM protese.usuarios_administrativos WHERE id = $1',
      [usuarioId]
    );

    if (usuarioCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    const isMaster = usuarioCheck.rows[0].tipo_usuario === 'master';

    // Verificar permissão help_desk_ver (se não for Master)
    let temPermissaoHelpDesk = isMaster;
    if (!isMaster) {
      const permissoesCheck = await pool.query(
        'SELECT help_desk_ver FROM protese.permissoes_usuarios WHERE usuario_id = $1',
        [usuarioId]
      );
      if (permissoesCheck.rows.length > 0) {
        temPermissaoHelpDesk = permissoesCheck.rows[0].help_desk_ver === true;
      }
    }

    if (!temPermissaoHelpDesk) {
      return res.status(403).json({ error: 'Você não tem permissão para acessar o Help Desk' });
    }

    // Verificar se pode ver este chamado específico
    const podeVer = isMaster || chamado.funcionario_abriu_id === usuarioId || chamado.responsavel_id === usuarioId;

    if (!podeVer) {
      return res.status(403).json({ error: 'Acesso negado a este chamado' });
    }

    // Buscar anexos do chamado
    const anexosChamado = await pool.query(
      'SELECT * FROM protese.help_desk_anexos WHERE chamado_id = $1 AND resposta_id IS NULL',
      [id]
    );

    // Buscar respostas
    const respostasResult = await pool.query(
      `SELECT 
        hdr.*,
        ua.nome_completo as funcionario_nome
      FROM protese.help_desk_respostas hdr
      INNER JOIN protese.usuarios_administrativos ua ON hdr.funcionario_id = ua.id
      WHERE hdr.chamado_id = $1
      ORDER BY hdr.created_at ASC`,
      [id]
    );

    // Buscar anexos das respostas
    const respostasComAnexos = await Promise.all(
      respostasResult.rows.map(async (resposta) => {
        const anexosResposta = await pool.query(
          'SELECT * FROM protese.help_desk_anexos WHERE resposta_id = $1',
          [resposta.id]
        );
        return { ...resposta, anexos: anexosResposta.rows };
      })
    );

    res.json({
      chamado: {
        ...chamado,
        anexos: anexosChamado.rows,
        respostas: respostasComAnexos,
      },
    });
  } catch (error) {
    console.error('Erro ao buscar chamado:', error);
    res.status(500).json({
      error: 'Erro ao buscar chamado',
      message: error.message,
    });
  }
});

/**
 * PUT /api/v1/help-desk/chamados/:id
 * Atualiza um chamado (status, responsável)
 */
router.put('/chamados/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const usuarioId = req.headers['x-user-id'] || req.headers['X-User-Id'];
    const usuarioTipo = req.headers['x-user-tipo'] || req.headers['X-User-Tipo'] || 'funcionario';

    if (!usuarioId || usuarioId.trim() === '') {
      return res.status(401).json({ error: 'Usuário não autenticado' });
    }

    const { status, responsavel_id } = req.body;

    // Buscar chamado atual
    const chamadoAtual = await pool.query(
      'SELECT * FROM protese.help_desk_chamados WHERE id = $1',
      [id]
    );

    if (chamadoAtual.rows.length === 0) {
      return res.status(404).json({ error: 'Chamado não encontrado' });
    }

    const chamado = chamadoAtual.rows[0];

    // Verificar permissão (apenas Master ou responsável pode atualizar)
    const usuarioCheck = await pool.query(
      'SELECT tipo_usuario FROM protese.usuarios_administrativos WHERE id = $1',
      [usuarioId]
    );

    if (usuarioCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    const tipoUsuario = usuarioCheck.rows[0].tipo_usuario;
    const isMaster = tipoUsuario === 'master';

    // Master pode atualizar qualquer chamado - verificação prioritária
    if (isMaster) {
      // Master tem permissão total, pode continuar
    } else {
      // Para não-Master, verificar se é responsável ou criador com permissão
      const chamadoResponsavelId = chamado.responsavel_id ? String(chamado.responsavel_id).toLowerCase() : null;
      const chamadoCriadorId = chamado.funcionario_abriu_id ? String(chamado.funcionario_abriu_id).toLowerCase() : null;
      const usuarioIdStr = usuarioId ? String(usuarioId).toLowerCase() : null;
      
      const isResponsavel = chamadoResponsavelId && usuarioIdStr && chamadoResponsavelId === usuarioIdStr;
      const isCriador = chamadoCriadorId && usuarioIdStr && chamadoCriadorId === usuarioIdStr;
      
      // Se não é responsável, verificar se é criador com permissão help_desk_editar
      if (!isResponsavel) {
        if (isCriador) {
          const permissoesCheck = await pool.query(
            'SELECT help_desk_editar FROM protese.permissoes_usuarios WHERE usuario_id = $1',
            [usuarioId]
          );
          const temPermissaoEditar = permissoesCheck.rows.length > 0 && permissoesCheck.rows[0].help_desk_editar === true;
          
          if (!temPermissaoEditar) {
            return res.status(403).json({ error: 'Apenas Master ou responsável pode atualizar o chamado' });
          }
        } else {
          return res.status(403).json({ error: 'Apenas Master ou responsável pode atualizar o chamado' });
        }
      }
    }

    // Validar status
    if (status && !['INICIADO', 'ABERTO', 'EM DESENVOLVIMENTO', 'RESOLVIDO'].includes(status)) {
      return res.status(400).json({ error: 'Status inválido' });
    }

    // Validar responsável se informado
    if (responsavel_id) {
      const responsavelCheck = await pool.query(
        'SELECT id FROM protese.usuarios_administrativos WHERE id = $1',
        [responsavel_id]
      );
      if (responsavelCheck.rows.length === 0) {
        return res.status(404).json({ error: 'Responsável não encontrado' });
      }
    }

    // Construir query de atualização
    const updates = [];
    const params = [];
    let paramIndex = 1;

    if (status) {
      updates.push(`status = $${paramIndex}`);
      params.push(status);
      paramIndex++;
    }

    if (responsavel_id) {
      updates.push(`responsavel_id = $${paramIndex}`);
      params.push(responsavel_id);
      paramIndex++;
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'Nenhum campo para atualizar' });
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    params.push(id);

    const query = `UPDATE protese.help_desk_chamados SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`;
    const result = await pool.query(query, params);

    // Registrar log
    await registrarLog({
      usuarioId,
      usuarioTipo,
      acao: 'editar',
      modulo: 'help_desk',
      entidadeId: id,
      entidadeTipo: 'chamado',
      descricao: `Chamado atualizado: ${status ? `status=${status}` : ''} ${responsavel_id ? `responsável alterado` : ''}`,
      dadosAnteriores: chamado,
      dadosNovos: result.rows[0],
      ipAddress: getClientIp(req),
      userAgent: getUserAgent(req),
    });

    res.json({
      message: 'Chamado atualizado com sucesso!',
      chamado: result.rows[0],
    });
  } catch (error) {
    console.error('Erro ao atualizar chamado:', error);
    res.status(500).json({
      error: 'Erro ao atualizar chamado',
      message: error.message,
    });
  }
});

/**
 * POST /api/v1/help-desk/chamados/:id/respostas
 * Adiciona uma resposta ao chamado
 */
router.post('/chamados/:id/respostas', uploadHelpDesk.array('anexos', 10), async (req, res) => {
  try {
    const { id } = req.params;
    const usuarioId = req.headers['x-user-id'] || req.headers['X-User-Id'];
    const usuarioTipo = req.headers['x-user-tipo'] || req.headers['X-User-Tipo'] || 'funcionario';

    if (!usuarioId) {
      return res.status(401).json({ error: 'Usuário não autenticado' });
    }

    const { mensagem } = req.body;

    if (!mensagem || mensagem.trim() === '') {
      return res.status(400).json({ error: 'Mensagem é obrigatória' });
    }

    // Verificar se o chamado existe
    const chamadoCheck = await pool.query(
      'SELECT * FROM protese.help_desk_chamados WHERE id = $1',
      [id]
    );

    if (chamadoCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Chamado não encontrado' });
    }

    const chamado = chamadoCheck.rows[0];

    // Verificar permissão (Master, responsável ou quem abriu pode responder)
    const usuarioCheck = await pool.query(
      'SELECT tipo_usuario FROM protese.usuarios_administrativos WHERE id = $1',
      [usuarioId]
    );

    if (usuarioCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    const isMaster = usuarioCheck.rows[0].tipo_usuario === 'master';
    const podeResponder = isMaster || chamado.responsavel_id === usuarioId || chamado.funcionario_abriu_id === usuarioId;

    if (!podeResponder) {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    // Criar resposta
    const respostaResult = await pool.query(
      `INSERT INTO protese.help_desk_respostas (chamado_id, funcionario_id, mensagem)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [id, usuarioId, mensagem]
    );

    const resposta = respostaResult.rows[0];

    // Processar anexos se houver
    const baseUrl = process.env.API_BASE_URL || 'http://localhost:3001';
    const anexos = [];

    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const urlArquivo = `${baseUrl}/uploads/help-desk/${file.filename}`;
        const tipoArquivo = file.mimetype.startsWith('image/') ? 'imagem' : 'pdf';

        const anexoResult = await pool.query(
          `INSERT INTO protese.help_desk_anexos (
            resposta_id, nome_arquivo, url_arquivo, tipo_arquivo, tamanho_bytes
          ) VALUES ($1, $2, $3, $4, $5)
          RETURNING *`,
          [resposta.id, file.originalname, urlArquivo, tipoArquivo, file.size]
        );

        anexos.push(anexoResult.rows[0]);
      }
    }

    // Registrar log
    await registrarLog({
      usuarioId,
      usuarioTipo,
      acao: 'criar',
      modulo: 'help_desk',
      entidadeId: id,
      entidadeTipo: 'resposta',
      descricao: `Resposta adicionada ao chamado ${id}`,
      dadosNovos: { resposta_id: resposta.id },
      ipAddress: getClientIp(req),
      userAgent: getUserAgent(req),
    });

    res.status(201).json({
      message: 'Resposta adicionada com sucesso!',
      resposta: { ...resposta, anexos },
    });
  } catch (error) {
    console.error('Erro ao adicionar resposta:', error);
    res.status(500).json({
      error: 'Erro ao adicionar resposta',
      message: error.message,
    });
  }
});

/**
 * GET /api/v1/help-desk/funcionarios
 * Lista funcionários para seleção de responsável
 */
router.get('/funcionarios', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, nome_completo, email, tipo_usuario
       FROM protese.usuarios_administrativos
       WHERE is_active = true
       ORDER BY nome_completo ASC`
    );

    res.json({ funcionarios: result.rows });
  } catch (error) {
    console.error('Erro ao buscar funcionários:', error);
    res.status(500).json({
      error: 'Erro ao buscar funcionários',
      message: error.message,
    });
  }
});

module.exports = router;




