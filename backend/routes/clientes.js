const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const fs = require('fs');
const path = require('path');
const pool = require('../config/database');
const { upload } = require('../config/multer');
const { registrarLog, getClientIp, getUserAgent } = require('../utils/logger');

/**
 * POST /api/v1/clientes
 * Cria um novo cliente
 */
router.post('/', upload.single('foto'), async (req, res) => {
  let fotoUrl = null;
  const uploadsDir = path.join(__dirname, '..', 'uploads', 'fotos');

  try {
    // Processar foto se enviada
    if (req.file) {
      const baseUrl = process.env.API_BASE_URL || 'http://localhost:3001';
      fotoUrl = `${baseUrl}/uploads/fotos/${req.file.filename}`;
    }

    // Extrair dados do body
    const {
      nome_completo,
      email,
      cpf,
      rg,
      rua,
      numero,
      complemento,
      bairro,
      cidade,
      estado,
      cep,
      senha,
      funcionario_responsavel_id,
    } = req.body;

    // Validações básicas
    if (!nome_completo || !email || !cpf || !rua || !numero || !bairro || !cidade || !estado || !cep || !senha) {
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({
        error: 'Campos obrigatórios não preenchidos',
        required: ['nome_completo', 'email', 'cpf', 'rua', 'numero', 'bairro', 'cidade', 'estado', 'cep', 'senha'],
      });
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(400).json({ error: 'Email inválido' });
    }

    // Validar CPF (remover formatação)
    const cpfLimpo = cpf.replace(/\D/g, '');
    if (cpfLimpo.length !== 11) {
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(400).json({ error: 'CPF inválido' });
    }

    // Verificar se email já existe
    const emailCheck = await pool.query(
      'SELECT id FROM protese.usuarios_clientes WHERE email = $1',
      [email]
    );
    if (emailCheck.rows.length > 0) {
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(409).json({ error: 'Email já cadastrado' });
    }

    // Verificar se CPF já existe
    const cpfCheck = await pool.query(
      'SELECT id FROM protese.usuarios_clientes WHERE cpf = $1',
      [cpfLimpo]
    );
    if (cpfCheck.rows.length > 0) {
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(409).json({ error: 'CPF já cadastrado' });
    }

    // Hash da senha
    const senhaHash = await bcrypt.hash(senha, 10);

    // Limpar CEP (remover formatação)
    const cepLimpo = cep.replace(/\D/g, '');

    // Inserir no banco de dados
    const result = await pool.query(
      `INSERT INTO protese.usuarios_clientes (
        nome_completo, email, cpf, rg, rua, numero, complemento,
        bairro, cidade, estado, cep, senha_hash, foto_url, funcionario_responsavel_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING id, nome_completo, email, foto_url, created_at`,
      [
        nome_completo,
        email,
        cpfLimpo,
        rg || null,
        rua,
        numero,
        complemento || null,
        bairro,
        cidade,
        estado.toUpperCase(),
        cepLimpo,
        senhaHash,
        fotoUrl,
        funcionario_responsavel_id || null,
      ]
    );

    const novoCliente = result.rows[0];

    // Registrar log
    const usuarioId = req.headers['x-user-id'] || null;
    const usuarioTipo = req.headers['x-user-tipo'] || 'administrativo';
    
    try {
      await registrarLog({
        usuarioId: usuarioId || null,
        usuarioTipo: usuarioId ? usuarioTipo : 'sistema',
        acao: 'criar',
        modulo: 'cliente',
        entidadeId: novoCliente.id,
        entidadeTipo: 'cliente',
        descricao: `Cliente ${nome_completo} (${email}) criado`,
        dadosNovos: {
          nome_completo,
          email,
          cpf: cpfLimpo,
        },
        ipAddress: getClientIp(req),
        userAgent: getUserAgent(req),
      });
    } catch (logError) {
      console.error('[LOG DEBUG] Erro ao registrar log:', logError.message);
    }

    res.status(201).json({
      message: 'Cliente cadastrado com sucesso!',
      cliente: novoCliente,
    });
  } catch (error) {
    if (req.file) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (unlinkError) {
        console.error('Erro ao deletar foto após falha:', unlinkError);
      }
    }

    console.error('Erro ao cadastrar cliente:', error);
    res.status(500).json({
      error: 'Erro ao cadastrar cliente',
      message: error.message,
    });
  }
});

/**
 * GET /api/v1/clientes
 * Lista todos os clientes
 */
router.get('/', async (req, res) => {
  try {
    // Adicionar headers para evitar cache
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');

    const result = await pool.query(
      `SELECT 
        uc.id, 
        uc.nome_completo, 
        uc.email, 
        uc.cpf,
        uc.rg,
        uc.rua,
        uc.numero,
        uc.complemento,
        uc.bairro,
        uc.cidade,
        uc.estado,
        uc.cep,
        uc.foto_url, 
        uc.is_active, 
        uc.funcionario_responsavel_id,
        uc.created_at, 
        uc.updated_at,
        ua.nome_completo as funcionario_responsavel_nome
       FROM protese.usuarios_clientes uc
       LEFT JOIN protese.usuarios_administrativos ua ON uc.funcionario_responsavel_id = ua.id
       ORDER BY uc.updated_at DESC, uc.nome_completo ASC`
    );

    res.json({
      clientes: result.rows,
    });
  } catch (error) {
    console.error('Erro ao buscar clientes:', error);
    res.status(500).json({
      error: 'Erro ao buscar clientes',
      message: error.message,
    });
  }
});

/**
 * GET /api/v1/clientes/:id
 * Busca um cliente por ID
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT 
        uc.id, 
        uc.nome_completo, 
        uc.email, 
        uc.cpf, 
        uc.rg, 
        uc.rua, 
        uc.numero, 
        uc.complemento,
        uc.bairro, 
        uc.cidade, 
        uc.estado, 
        uc.cep, 
        uc.foto_url, 
        uc.is_active,
        uc.funcionario_responsavel_id,
        uc.created_at, 
        uc.updated_at,
        ua.nome_completo as funcionario_responsavel_nome
       FROM protese.usuarios_clientes uc
       LEFT JOIN protese.usuarios_administrativos ua ON uc.funcionario_responsavel_id = ua.id
       WHERE uc.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Cliente não encontrado' });
    }

    res.json({ cliente: result.rows[0] });
  } catch (error) {
    console.error('Erro ao buscar cliente:', error);
    res.status(500).json({
      error: 'Erro ao buscar cliente',
      message: error.message,
    });
  }
});

/**
 * PUT /api/v1/clientes/:id
 * Atualiza um cliente
 */
router.put('/:id', upload.single('foto'), async (req, res) => {
  let fotoUrl = null;
  const uploadsDir = path.join(__dirname, '..', 'uploads', 'fotos');

  try {
    const { id } = req.params;

    // Verificar se cliente existe e buscar dados completos (para log)
    const clienteCheck = await pool.query(
      'SELECT id, nome_completo, email, cpf, rg, rua, numero, complemento, bairro, cidade, estado, cep, foto_url, is_active, funcionario_responsavel_id FROM protese.usuarios_clientes WHERE id = $1',
      [id]
    );

    if (clienteCheck.rows.length === 0) {
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(404).json({ error: 'Cliente não encontrado' });
    }

    const clienteAtual = clienteCheck.rows[0];

    // Processar foto se enviada
    if (req.file) {
      // Deletar foto antiga se existir
      if (clienteAtual.foto_url) {
        const fotoAntigaPath = path.join(uploadsDir, path.basename(clienteAtual.foto_url));
        if (fs.existsSync(fotoAntigaPath)) {
          try {
            fs.unlinkSync(fotoAntigaPath);
          } catch (err) {
            console.error('Erro ao deletar foto antiga:', err);
          }
        }
      }

      const baseUrl = process.env.API_BASE_URL || 'https://api.protesecapilarcuiaba.com.br';
      fotoUrl = `${baseUrl}/uploads/fotos/${req.file.filename}`;
    }

    // Extrair dados do body
    const {
      nome_completo,
      email,
      cpf,
      rg,
      rua,
      numero,
      complemento,
      bairro,
      cidade,
      estado,
      cep,
      senha,
      is_active,
      funcionario_responsavel_id,
    } = req.body;

    // Validações básicas
    if (!nome_completo || !email || !cpf || !rua || !numero || !bairro || !cidade || !estado || !cep) {
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(400).json({
        error: 'Campos obrigatórios não preenchidos',
        required: ['nome_completo', 'email', 'cpf', 'rua', 'numero', 'bairro', 'cidade', 'estado', 'cep'],
      });
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(400).json({ error: 'Email inválido' });
    }

    // Validar CPF
    const cpfLimpo = cpf.replace(/\D/g, '');
    if (cpfLimpo.length !== 11) {
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(400).json({ error: 'CPF inválido' });
    }

    // Verificar se email já existe em outro cliente
    const emailCheck = await pool.query(
      'SELECT id FROM protese.usuarios_clientes WHERE email = $1 AND id != $2',
      [email, id]
    );
    if (emailCheck.rows.length > 0) {
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(409).json({ error: 'Email já cadastrado para outro cliente' });
    }

    // Verificar se CPF já existe em outro cliente
    const cpfCheck = await pool.query(
      'SELECT id FROM protese.usuarios_clientes WHERE cpf = $1 AND id != $2',
      [cpfLimpo, id]
    );
    if (cpfCheck.rows.length > 0) {
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(409).json({ error: 'CPF já cadastrado para outro cliente' });
    }

    // Preparar valores para atualização
    const cepLimpo = cep.replace(/\D/g, '');
    let senhaHash = null;

    // Se senha foi fornecida, fazer hash
    if (senha && senha.trim() !== '') {
      senhaHash = await bcrypt.hash(senha, 10);
    }

    // Construir query de atualização
    let query;
    let params;

    if (senhaHash) {
      query = `UPDATE protese.usuarios_clientes SET
        nome_completo = $1,
        email = $2,
        cpf = $3,
        rg = $4,
        rua = $5,
        numero = $6,
        complemento = $7,
        bairro = $8,
        cidade = $9,
        estado = $10,
        cep = $11,
        senha_hash = $12,
        foto_url = COALESCE($13, foto_url),
        funcionario_responsavel_id = $14,
        is_active = $15,
        updated_at = NOW()
      WHERE id = $16
      RETURNING id, nome_completo, email, cpf, foto_url, is_active, created_at, updated_at`;

      params = [
        nome_completo,
        email,
        cpfLimpo,
        rg || null,
        rua,
        numero,
        complemento || null,
        bairro,
        cidade,
        estado.toUpperCase(),
        cepLimpo,
        senhaHash,
        fotoUrl,
        funcionario_responsavel_id || null,
        is_active !== undefined ? is_active : true,
        id,
      ];
    } else {
      query = `UPDATE protese.usuarios_clientes SET
        nome_completo = $1,
        email = $2,
        cpf = $3,
        rg = $4,
        rua = $5,
        numero = $6,
        complemento = $7,
        bairro = $8,
        cidade = $9,
        estado = $10,
        cep = $11,
        foto_url = COALESCE($12, foto_url),
        funcionario_responsavel_id = $13,
        is_active = $14,
        updated_at = NOW()
      WHERE id = $15
      RETURNING id, nome_completo, email, cpf, foto_url, is_active, created_at, updated_at`;

      params = [
        nome_completo,
        email,
        cpfLimpo,
        rg || null,
        rua,
        numero,
        complemento || null,
        bairro,
        cidade,
        estado.toUpperCase(),
        cepLimpo,
        fotoUrl,
        funcionario_responsavel_id || null,
        is_active !== undefined ? is_active : true,
        id,
      ];
    }

    const result = await pool.query(query, params);
    const clienteAtualizado = result.rows[0];

    // Registrar log
    const usuarioId = req.headers['x-user-id'] || req.headers['X-User-Id'] || null;
    const usuarioTipo = req.headers['x-user-tipo'] || req.headers['X-User-Tipo'] || null;
    
    try {
      await registrarLog({
        usuarioId: usuarioId || null,
        usuarioTipo: usuarioTipo || (usuarioId ? 'administrativo' : 'sistema'),
        acao: 'editar',
        modulo: 'cliente',
        entidadeId: id,
        entidadeTipo: 'cliente',
        descricao: `Cliente ${nome_completo} (${email}) atualizado`,
        dadosAnteriores: {
          nome_completo: clienteAtual.nome_completo,
          email: clienteAtual.email,
          cpf: clienteAtual.cpf,
          rg: clienteAtual.rg,
          rua: clienteAtual.rua,
          numero: clienteAtual.numero,
          complemento: clienteAtual.complemento,
          bairro: clienteAtual.bairro,
          cidade: clienteAtual.cidade,
          estado: clienteAtual.estado,
          cep: clienteAtual.cep,
          funcionario_responsavel_id: clienteAtual.funcionario_responsavel_id,
          is_active: clienteAtual.is_active,
        },
        dadosNovos: {
          nome_completo,
          email,
          cpf: cpfLimpo,
          rg: rg || null,
          rua,
          numero,
          complemento: complemento || null,
          bairro,
          cidade,
          estado: estado.toUpperCase(),
          cep: cepLimpo,
          funcionario_responsavel_id: funcionario_responsavel_id || null,
          is_active: is_active !== undefined ? is_active : true,
        },
        ipAddress: getClientIp(req),
        userAgent: getUserAgent(req),
      });
    } catch (logError) {
      console.error('[LOG DEBUG] Erro ao registrar log:', logError.message);
    }

    res.json({
      message: 'Cliente atualizado com sucesso!',
      cliente: clienteAtualizado,
    });
  } catch (error) {
    if (req.file) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (unlinkError) {
        console.error('Erro ao deletar foto após falha:', unlinkError);
      }
    }

    console.error('Erro ao atualizar cliente:', error);
    res.status(500).json({
      error: 'Erro ao atualizar cliente',
      message: error.message,
    });
  }
});

/**
 * DELETE /api/v1/clientes/:id
 * Exclui um cliente
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const uploadsDir = path.join(__dirname, '..', 'uploads', 'fotos');

    // Verificar se cliente existe e obter foto
    const clienteCheck = await pool.query(
      'SELECT id, foto_url FROM protese.usuarios_clientes WHERE id = $1',
      [id]
    );

    if (clienteCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Cliente não encontrado' });
    }

    const cliente = clienteCheck.rows[0];

    // Buscar dados completos do cliente antes de deletar (para log)
    const clienteCompleto = await pool.query(
      'SELECT nome_completo, email, cpf FROM protese.usuarios_clientes WHERE id = $1',
      [id]
    );
    const dadosCliente = clienteCompleto.rows[0] || {};

    // Deletar foto se existir
    if (cliente.foto_url) {
      const fotoPath = path.join(uploadsDir, path.basename(cliente.foto_url));
      if (fs.existsSync(fotoPath)) {
        try {
          fs.unlinkSync(fotoPath);
        } catch (err) {
          console.error('Erro ao deletar foto:', err);
        }
      }
    }

    // Deletar cliente do banco
    await pool.query('DELETE FROM protese.usuarios_clientes WHERE id = $1', [id]);

    // Registrar log
    const usuarioId = req.headers['x-user-id'] || null;
    const usuarioTipo = req.headers['x-user-tipo'] || 'administrativo';
    if (usuarioId) {
      await registrarLog({
        usuarioId,
        usuarioTipo,
        acao: 'excluir',
        modulo: 'cliente',
        entidadeId: id,
        entidadeTipo: 'cliente',
        descricao: `Cliente ${dadosCliente.nome_completo || 'N/A'} (${dadosCliente.email || 'N/A'}) excluído`,
        dadosAnteriores: {
          nome_completo: dadosCliente.nome_completo,
          email: dadosCliente.email,
          cpf: dadosCliente.cpf,
        },
        ipAddress: getClientIp(req),
        userAgent: getUserAgent(req),
      });
    }

    res.json({
      message: 'Cliente excluído com sucesso!',
    });
  } catch (error) {
    console.error('Erro ao excluir cliente:', error);
    res.status(500).json({
      error: 'Erro ao excluir cliente',
      message: error.message,
    });
  }
});

module.exports = router;


