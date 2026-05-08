const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { registrarLog, getClientIp, getUserAgent } = require('../utils/logger');
const { uploadServicos, servicosUploadsDir } = require('../config/multer');
const path = require('path');
const fs = require('fs');

/**
 * GET /api/v1/servicos
 * Lista todos os serviços
 */
router.get('/', async (req, res) => {
  try {
    const usuarioId = req.headers['x-user-id'];
    const usuarioTipo = req.headers['x-user-tipo'] || 'administrativo';

    // Verificar permissão de visualização
    if (usuarioTipo !== 'master') {
      const permissoesResult = await pool.query(
        'SELECT servicos_ver FROM permissoes_usuarios WHERE usuario_id = $1',
        [usuarioId]
      );

      if (permissoesResult.rows.length === 0 || !permissoesResult.rows[0].servicos_ver) {
        return res.status(403).json({ error: 'Acesso negado. Permissão insuficiente.' });
      }
    }

    const { categoria, is_active } = req.query;
    let query = 'SELECT * FROM servicos WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    if (categoria) {
      query += ` AND categoria = $${paramIndex}`;
      params.push(categoria);
      paramIndex++;
    }

    if (is_active !== undefined) {
      query += ` AND is_active = $${paramIndex}`;
      params.push(is_active === 'true');
      paramIndex++;
    }

    query += ' ORDER BY nome ASC';

    const result = await pool.query(query, params);

    // Processar imagens dos serviços
    const baseUrl = process.env.API_BASE_URL || 'https://api6.auctusconsultoria.com.br';
    const servicosComImagens = result.rows.map((servico) => {
      const imagens = [];
      
      // Processar capa
      if (servico.imagem_capa_url) {
        let urlImagem = servico.imagem_capa_url;
        // Se não começar com http, construir URL completa
        if (!urlImagem.startsWith('http')) {
          urlImagem = `${baseUrl}/uploads/servicos/${path.basename(urlImagem)}`;
        }
        imagens.push({
          id: 'capa',
          url_imagem: urlImagem,
          is_capa: true,
        });
      }
      
      // Processar segunda imagem
      if (servico.imagem_2_url) {
        let urlImagem = servico.imagem_2_url;
        if (!urlImagem.startsWith('http')) {
          urlImagem = `${baseUrl}/uploads/servicos/${path.basename(urlImagem)}`;
        }
        imagens.push({
          id: 'img2',
          url_imagem: urlImagem,
          is_capa: false,
        });
      }
      
      // Processar terceira imagem
      if (servico.imagem_3_url) {
        let urlImagem = servico.imagem_3_url;
        if (!urlImagem.startsWith('http')) {
          urlImagem = `${baseUrl}/uploads/servicos/${path.basename(urlImagem)}`;
        }
        imagens.push({
          id: 'img3',
          url_imagem: urlImagem,
          is_capa: false,
        });
      }

      return {
        ...servico,
        imagens,
      };
    });

    res.json({
      servicos: servicosComImagens,
    });
  } catch (error) {
    console.error('Erro ao buscar serviços:', error);
    res.status(500).json({
      error: 'Erro ao buscar serviços',
      message: error.message,
    });
  }
});

/**
 * GET /api/v1/servicos/:id
 * Busca um serviço por ID
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const usuarioId = req.headers['x-user-id'];
    const usuarioTipo = req.headers['x-user-tipo'] || 'administrativo';

    // Verificar permissão de visualização
    if (usuarioTipo !== 'master') {
      const permissoesResult = await pool.query(
        'SELECT servicos_ver FROM permissoes_usuarios WHERE usuario_id = $1',
        [usuarioId]
      );

      if (permissoesResult.rows.length === 0 || !permissoesResult.rows[0].servicos_ver) {
        return res.status(403).json({ error: 'Acesso negado. Permissão insuficiente.' });
      }
    }

    const result = await pool.query(
      'SELECT * FROM servicos WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Serviço não encontrado' });
    }

    const servico = result.rows[0];
    const baseUrl = process.env.API_BASE_URL || 'https://api6.auctusconsultoria.com.br';
    const imagens = [];

    // Processar capa
    if (servico.imagem_capa_url) {
      let urlImagem = servico.imagem_capa_url;
      if (!urlImagem.startsWith('http')) {
        urlImagem = `${baseUrl}/uploads/servicos/${path.basename(urlImagem)}`;
      }
      imagens.push({
        id: 'capa',
        url_imagem: urlImagem,
        is_capa: true,
      });
    }

    // Processar segunda imagem
    if (servico.imagem_2_url) {
      let urlImagem = servico.imagem_2_url;
      if (!urlImagem.startsWith('http')) {
        urlImagem = `${baseUrl}/uploads/servicos/${path.basename(urlImagem)}`;
      }
      imagens.push({
        id: 'img2',
        url_imagem: urlImagem,
        is_capa: false,
      });
    }

    // Processar terceira imagem
    if (servico.imagem_3_url) {
      let urlImagem = servico.imagem_3_url;
      if (!urlImagem.startsWith('http')) {
        urlImagem = `${baseUrl}/uploads/servicos/${path.basename(urlImagem)}`;
      }
      imagens.push({
        id: 'img3',
        url_imagem: urlImagem,
        is_capa: false,
      });
    }

    res.json({
      servico: {
        ...servico,
        imagens,
      },
    });
  } catch (error) {
    console.error('Erro ao buscar serviço:', error);
    res.status(500).json({
      error: 'Erro ao buscar serviço',
      message: error.message,
    });
  }
});

/**
 * POST /api/v1/servicos
 * Cria um novo serviço (sem imagens - imagens são adicionadas via endpoint separado)
 */
router.post('/', async (req, res) => {
  try {
    const usuarioId = req.headers['x-user-id'];
    const usuarioTipo = req.headers['x-user-tipo'] || 'administrativo';

    // Verificar permissão de edição
    if (usuarioTipo !== 'master') {
      const permissoesResult = await pool.query(
        'SELECT servicos_editar FROM permissoes_usuarios WHERE usuario_id = $1',
        [usuarioId]
      );

      if (permissoesResult.rows.length === 0 || !permissoesResult.rows[0].servicos_editar) {
        return res.status(403).json({ error: 'Acesso negado. Permissão insuficiente.' });
      }
    }

    const {
      nome,
      descricao,
      preco,
      duracao_minutos,
      categoria,
      is_active,
    } = req.body;

    // Validações
    if (!nome || !preco) {
      return res.status(400).json({
        error: 'Campos obrigatórios: nome, preco',
      });
    }

    const precoNumber = parseFloat(preco);
    if (isNaN(precoNumber) || precoNumber < 0) {
      return res.status(400).json({ error: 'Preço inválido' });
    }

    // Inserir no banco de dados
    const result = await pool.query(
      `INSERT INTO servicos (
        nome, descricao, preco, duracao_minutos, categoria, is_active
      ) VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *`,
      [
        nome,
        descricao || null,
        precoNumber,
        duracao_minutos || 30,
        categoria || null,
        is_active !== undefined ? is_active : true,
      ]
    );

    const novoServico = result.rows[0];

    // Registrar log
    if (usuarioId) {
      await registrarLog({
        usuarioId,
        usuarioTipo,
        acao: 'criar',
        modulo: 'servico',
        entidadeId: novoServico.id,
        entidadeTipo: 'servico',
        descricao: `Serviço ${nome} criado - R$ ${precoNumber.toFixed(2)}`,
        dadosNovos: novoServico,
        ipAddress: getClientIp(req),
        userAgent: getUserAgent(req),
      });
    }

    res.status(201).json({
      message: 'Serviço cadastrado com sucesso!',
      servico: novoServico,
    });
  } catch (error) {
    console.error('Erro ao cadastrar serviço:', error);
    res.status(500).json({
      error: 'Erro ao cadastrar serviço',
      message: error.message,
    });
  }
});

/**
 * PUT /api/v1/servicos/:id
 * Atualiza um serviço
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const usuarioId = req.headers['x-user-id'];
    const usuarioTipo = req.headers['x-user-tipo'] || 'administrativo';

    // Verificar permissão de edição
    if (usuarioTipo !== 'master') {
      const permissoesResult = await pool.query(
        'SELECT servicos_editar FROM permissoes_usuarios WHERE usuario_id = $1',
        [usuarioId]
      );

      if (permissoesResult.rows.length === 0 || !permissoesResult.rows[0].servicos_editar) {
        return res.status(403).json({ error: 'Acesso negado. Permissão insuficiente.' });
      }
    }

    const {
      nome,
      descricao,
      preco,
      duracao_minutos,
      categoria,
      is_active,
    } = req.body;

    // Buscar serviço atual
    const servicoAtual = await pool.query(
      'SELECT * FROM servicos WHERE id = $1',
      [id]
    );

    if (servicoAtual.rows.length === 0) {
      return res.status(404).json({ error: 'Serviço não encontrado' });
    }

    // Validar preço se fornecido
    if (preco !== undefined) {
      const precoNumber = parseFloat(preco);
      if (isNaN(precoNumber) || precoNumber < 0) {
        return res.status(400).json({ error: 'Preço inválido' });
      }
    }

    // Construir query de atualização
    const updates = [];
    const params = [];
    let paramIndex = 1;

    if (nome !== undefined) {
      updates.push(`nome = $${paramIndex}`);
      params.push(nome);
      paramIndex++;
    }

    if (descricao !== undefined) {
      updates.push(`descricao = $${paramIndex}`);
      params.push(descricao);
      paramIndex++;
    }

    if (preco !== undefined) {
      updates.push(`preco = $${paramIndex}`);
      params.push(parseFloat(preco));
      paramIndex++;
    }

    if (duracao_minutos !== undefined) {
      updates.push(`duracao_minutos = $${paramIndex}`);
      params.push(duracao_minutos);
      paramIndex++;
    }

    if (categoria !== undefined) {
      updates.push(`categoria = $${paramIndex}`);
      params.push(categoria);
      paramIndex++;
    }

    if (is_active !== undefined) {
      updates.push(`is_active = $${paramIndex}`);
      params.push(is_active);
      paramIndex++;
    }

    updates.push(`updated_at = NOW()`);
    params.push(id);

    const query = `UPDATE servicos SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`;
    const result = await pool.query(query, params);

    // Registrar log
    if (usuarioId) {
      await registrarLog({
        usuarioId,
        usuarioTipo,
        acao: 'editar',
        modulo: 'servico',
        entidadeId: id,
        entidadeTipo: 'servico',
        descricao: `Serviço ${nome || servicoAtual.rows[0].nome} atualizado`,
        dadosAnteriores: servicoAtual.rows[0],
        dadosNovos: result.rows[0],
        ipAddress: getClientIp(req),
        userAgent: getUserAgent(req),
      });
    }

    res.json({
      message: 'Serviço atualizado com sucesso!',
      servico: result.rows[0],
    });
  } catch (error) {
    console.error('Erro ao atualizar serviço:', error);
    res.status(500).json({
      error: 'Erro ao atualizar serviço',
      message: error.message,
    });
  }
});

/**
 * DELETE /api/v1/servicos/:id
 * Exclui um serviço
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const usuarioId = req.headers['x-user-id'];
    const usuarioTipo = req.headers['x-user-tipo'] || 'administrativo';

    // Verificar permissão de exclusão
    if (usuarioTipo !== 'master') {
      const permissoesResult = await pool.query(
        'SELECT servicos_excluir FROM permissoes_usuarios WHERE usuario_id = $1',
        [usuarioId]
      );

      if (permissoesResult.rows.length === 0 || !permissoesResult.rows[0].servicos_excluir) {
        return res.status(403).json({ error: 'Acesso negado. Permissão insuficiente.' });
      }
    }

    // Verificar se serviço existe
    const servicoCheck = await pool.query(
      'SELECT id, nome FROM servicos WHERE id = $1',
      [id]
    );

    if (servicoCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Serviço não encontrado' });
    }

    const servico = servicoCheck.rows[0];

    // Deletar serviço do banco
    await pool.query('DELETE FROM servicos WHERE id = $1', [id]);

    // Registrar log
    if (usuarioId) {
      await registrarLog({
        usuarioId,
        usuarioTipo,
        acao: 'excluir',
        modulo: 'servico',
        entidadeId: id,
        entidadeTipo: 'servico',
        descricao: `Serviço ${servico.nome} excluído`,
        dadosAnteriores: servico,
        ipAddress: getClientIp(req),
        userAgent: getUserAgent(req),
      });
    }

    res.json({
      message: 'Serviço excluído com sucesso!',
    });
  } catch (error) {
    console.error('Erro ao excluir serviço:', error);
    res.status(500).json({
      error: 'Erro ao excluir serviço',
      message: error.message,
    });
  }
});

/**
 * POST /api/v1/servicos/:id/imagens
 * Faz upload de imagens para um serviço (máximo 3)
 */
router.post('/:id/imagens', uploadServicos.array('imagens', 3), async (req, res) => {
  try {
    const { id } = req.params;
    const usuarioId = req.headers['x-user-id'];
    const usuarioTipo = req.headers['x-user-tipo'] || 'administrativo';

    // Verificar permissão de edição
    if (usuarioTipo !== 'master') {
      const permissoesResult = await pool.query(
        'SELECT servicos_editar FROM permissoes_usuarios WHERE usuario_id = $1',
        [usuarioId]
      );

      if (permissoesResult.rows.length === 0 || !permissoesResult.rows[0].servicos_editar) {
        return res.status(403).json({ error: 'Acesso negado. Permissão insuficiente.' });
      }
    }

    // Verificar se serviço existe e buscar imagens atuais
    const servicoCheck = await pool.query(
      'SELECT imagem_capa_url, imagem_2_url, imagem_3_url FROM servicos WHERE id = $1',
      [id]
    );

    if (servicoCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Serviço não encontrado' });
    }

    const servico = servicoCheck.rows[0];
    const imagensExistentes = [
      servico.imagem_capa_url,
      servico.imagem_2_url,
      servico.imagem_3_url,
    ].filter(Boolean).length;

    const arquivosRecebidos = req.files || [];

    if (imagensExistentes + arquivosRecebidos.length > 3) {
      // Deletar arquivos já salvos
      arquivosRecebidos.forEach((file) => {
        const filePath = path.join(servicosUploadsDir, file.filename);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      });
      return res.status(400).json({
        error: `Limite de 3 imagens por serviço. Você já tem ${imagensExistentes} imagem(ns) e está tentando adicionar ${arquivosRecebidos.length}.`,
      });
    }

    const baseUrl = process.env.API_BASE_URL || 'https://api6.auctusconsultoria.com.br';
    const updates = {};
    let arquivoIndex = 0;

    // Preencher campos vazios na ordem: capa, img2, img3
    // Primeira imagem sempre vai para capa (se vazio)
    if (!servico.imagem_capa_url && arquivoIndex < arquivosRecebidos.length) {
      updates.imagem_capa_url = `${baseUrl}/uploads/servicos/${arquivosRecebidos[arquivoIndex].filename}`;
      arquivoIndex++;
    }

    // Segunda imagem vai para img2 (se vazio)
    if (!servico.imagem_2_url && arquivoIndex < arquivosRecebidos.length) {
      updates.imagem_2_url = `${baseUrl}/uploads/servicos/${arquivosRecebidos[arquivoIndex].filename}`;
      arquivoIndex++;
    }

    // Terceira imagem vai para img3 (se vazio)
    if (!servico.imagem_3_url && arquivoIndex < arquivosRecebidos.length) {
      updates.imagem_3_url = `${baseUrl}/uploads/servicos/${arquivosRecebidos[arquivoIndex].filename}`;
      arquivoIndex++;
    }

    // Se houver mais arquivos do que campos disponíveis, deletar os extras
    for (let i = arquivoIndex; i < arquivosRecebidos.length; i++) {
      const filePath = path.join(servicosUploadsDir, arquivosRecebidos[i].filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    // Log para debug
    console.log('📸 Upload de imagens:', {
      totalArquivos: arquivosRecebidos.length,
      arquivosSalvos: arquivoIndex,
      updates,
      servicoId: id,
    });

    // Atualizar campos
    const updateFields = [];
    const params = [];
    let paramIndex = 1;

    if (updates.imagem_capa_url) {
      updateFields.push(`imagem_capa_url = $${paramIndex}`);
      params.push(updates.imagem_capa_url);
      paramIndex++;
    }
    if (updates.imagem_2_url) {
      updateFields.push(`imagem_2_url = $${paramIndex}`);
      params.push(updates.imagem_2_url);
      paramIndex++;
    }
    if (updates.imagem_3_url) {
      updateFields.push(`imagem_3_url = $${paramIndex}`);
      params.push(updates.imagem_3_url);
      paramIndex++;
    }

    if (updateFields.length > 0) {
      params.push(id);
      await pool.query(
        `UPDATE servicos SET ${updateFields.join(', ')} WHERE id = $${paramIndex}`,
        params
      );
    }

    res.status(201).json({
      message: 'Imagens adicionadas com sucesso!',
    });
  } catch (error) {
    console.error('Erro ao fazer upload de imagens:', error);
    
    // Deletar arquivos em caso de erro
    if (req.files && req.files.length > 0) {
      req.files.forEach((file) => {
        const filePath = path.join(servicosUploadsDir, file.filename);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      });
    }

    res.status(500).json({
      error: 'Erro ao fazer upload de imagens',
      message: error.message,
    });
  }
});

/**
 * DELETE /api/v1/servicos/:id/imagens/:campo
 * Remove uma imagem de um serviço (campo: capa, img2, img3)
 */
router.delete('/:id/imagens/:campo', async (req, res) => {
  try {
    const { id, campo } = req.params;
    const usuarioId = req.headers['x-user-id'];
    const usuarioTipo = req.headers['x-user-tipo'] || 'administrativo';

    // Verificar permissão de edição
    if (usuarioTipo !== 'master') {
      const permissoesResult = await pool.query(
        'SELECT servicos_editar FROM permissoes_usuarios WHERE usuario_id = $1',
        [usuarioId]
      );

      if (permissoesResult.rows.length === 0 || !permissoesResult.rows[0].servicos_editar) {
        return res.status(403).json({ error: 'Acesso negado. Permissão insuficiente.' });
      }
    }

    // Validar campo
    const camposValidos = ['capa', 'img2', 'img3'];
    if (!camposValidos.includes(campo)) {
      return res.status(400).json({ error: 'Campo inválido. Use: capa, img2 ou img3' });
    }

    // Buscar serviço
    const servicoResult = await pool.query(
      'SELECT imagem_capa_url, imagem_2_url, imagem_3_url FROM servicos WHERE id = $1',
      [id]
    );

    if (servicoResult.rows.length === 0) {
      return res.status(404).json({ error: 'Serviço não encontrado' });
    }

    const servico = servicoResult.rows[0];
    let urlImagem = null;
    let campoUpdate = '';

    if (campo === 'capa') {
      urlImagem = servico.imagem_capa_url;
      campoUpdate = 'imagem_capa_url';
    } else if (campo === 'img2') {
      urlImagem = servico.imagem_2_url;
      campoUpdate = 'imagem_2_url';
    } else if (campo === 'img3') {
      urlImagem = servico.imagem_3_url;
      campoUpdate = 'imagem_3_url';
    }

    if (!urlImagem) {
      return res.status(404).json({ error: 'Imagem não encontrada neste campo' });
    }

    // Deletar arquivo físico
    const nomeArquivo = path.basename(urlImagem);
    const filePath = path.join(servicosUploadsDir, nomeArquivo);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Se for capa, mover img2 para capa e img3 para img2
    if (campo === 'capa') {
      await pool.query(
        `UPDATE servicos SET 
          imagem_capa_url = imagem_2_url,
          imagem_2_url = imagem_3_url,
          imagem_3_url = NULL
        WHERE id = $1`,
        [id]
      );
    } else {
      // Atualizar campo específico para NULL
      await pool.query(
        `UPDATE servicos SET ${campoUpdate} = NULL WHERE id = $1`,
        [id]
      );
    }

    res.json({
      message: 'Imagem removida com sucesso!',
    });
  } catch (error) {
    console.error('Erro ao remover imagem:', error);
    res.status(500).json({
      error: 'Erro ao remover imagem',
      message: error.message,
    });
  }
});

/**
 * PUT /api/v1/servicos/:id/imagens/capa
 * Define qual imagem será a capa (troca entre capa, img2 e img3)
 */
router.put('/:id/imagens/capa', async (req, res) => {
  try {
    const { id } = req.params;
    const { campo } = req.body; // 'capa', 'img2' ou 'img3'
    const usuarioId = req.headers['x-user-id'];
    const usuarioTipo = req.headers['x-user-tipo'] || 'administrativo';

    // Verificar permissão de edição
    if (usuarioTipo !== 'master') {
      const permissoesResult = await pool.query(
        'SELECT servicos_editar FROM permissoes_usuarios WHERE usuario_id = $1',
        [usuarioId]
      );

      if (permissoesResult.rows.length === 0 || !permissoesResult.rows[0].servicos_editar) {
        return res.status(403).json({ error: 'Acesso negado. Permissão insuficiente.' });
      }
    }

    if (!campo || !['capa', 'img2', 'img3'].includes(campo)) {
      return res.status(400).json({ error: 'Campo inválido. Use: capa, img2 ou img3' });
    }

    // Buscar serviço
    const servicoResult = await pool.query(
      'SELECT imagem_capa_url, imagem_2_url, imagem_3_url FROM servicos WHERE id = $1',
      [id]
    );

    if (servicoResult.rows.length === 0) {
      return res.status(404).json({ error: 'Serviço não encontrado' });
    }

    const servico = servicoResult.rows[0];

    // Trocar capa com o campo selecionado
    if (campo === 'img2' && servico.imagem_2_url) {
      await pool.query(
        'UPDATE servicos SET imagem_capa_url = imagem_2_url, imagem_2_url = imagem_capa_url WHERE id = $1',
        [id]
      );
    } else if (campo === 'img3' && servico.imagem_3_url) {
      await pool.query(
        'UPDATE servicos SET imagem_capa_url = imagem_3_url, imagem_3_url = imagem_capa_url WHERE id = $1',
        [id]
      );
    }

    res.json({
      message: 'Capa atualizada com sucesso!',
    });
  } catch (error) {
    console.error('Erro ao definir capa:', error);
    res.status(500).json({
      error: 'Erro ao definir capa',
      message: error.message,
    });
  }
});

module.exports = router;

