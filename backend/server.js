require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcrypt');
const { initLogger, registrarLog, getClientIp, getUserAgent } = require('./utils/logger');
const apiLoggerMiddleware = require('./middlewares/apiLogger');
// const { logCriar, logEditar, logExcluir, buscarDadosAnteriores } = require('./utils/logHelper');
// Nota: logHelper.js é opcional - descomente quando copiar o arquivo para a VPS

const app = express();
const PORT = process.env.PORT || 3001;

// Configuração do PostgreSQL
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'protese_capilar',
  user: process.env.DB_USER || 'protese_user',
  password: process.env.DB_PASSWORD,
  schema: 'protese',
});

// Middlewares
// Configuração de CORS - permite múltiplas origens
const allowedOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(',').map(origin => origin.trim())
  : [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:3002',
      'http://127.0.0.1:3000',
      'https://app.protesecapilarcuiaba.com.br',
      'https://admin.protesecapilarcuiaba.com.br',
      'https://www.protesecapilarcuiaba.com.br',
    ];

app.use(cors({
  origin: (origin, callback) => {
    // Permitir requisições sem origin (ex: mobile apps, Postman)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`CORS bloqueado para origem: ${origin}`);
      callback(new Error('Não permitido pela política CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-user-id', 'x-user-tipo'],
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Middleware de logging automático de requisições API
// IMPORTANTE: Deve vir depois dos middlewares de parsing (json/urlencoded) mas antes das rotas
app.use(apiLoggerMiddleware);

// Criar diretório de uploads se não existir
const uploadsDir = path.join(__dirname, 'uploads', 'fotos');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configuração do Multer para upload de imagens
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Gerar nome único: timestamp + random + extensão original
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `foto-${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  // Aceitar apenas imagens
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Apenas arquivos de imagem são permitidos!'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});

// Middleware para servir arquivos estáticos (fotos)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Inicializar sistema de logs ANTES do middleware de API logger
initLogger(pool);

// ============================================================
// ROTAS DE HEALTH CHECK
// ============================================================

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

app.get('/api/test-db', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({
      status: 'ok',
      database: 'connected',
      timestamp: result.rows[0].now,
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
});

app.get('/api/v1/test', (req, res) => {
  res.json({
    message: 'API v1 funcionando!',
    timestamp: new Date().toISOString(),
  });
});

// ============================================================
// ROTAS DE CLIENTES
// ============================================================

/**
 * POST /api/v1/clientes
 * Cria um novo cliente
 */
app.post('/api/v1/clientes', upload.single('foto'), async (req, res) => {
  let fotoUrl = null;

  try {
    // Processar foto se enviada
    if (req.file) {
      // Gerar URL da foto
      // Em produção, use o domínio real: https://api.protesecapilarcuiaba.com.br
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
      // Se foto foi enviada mas validação falhou, deletar a foto
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

    // Registrar log (sempre, mesmo sem usuário - será 'sistema' se não houver)
    const usuarioId = req.headers['x-user-id'] || null;
    const usuarioTipo = req.headers['x-user-tipo'] || 'administrativo';
    
    // Debug temporário
    console.log('[LOG DEBUG] Criar Cliente:', {
      usuarioId,
      usuarioTipo,
      temUsuarioId: !!usuarioId,
      headers: {
        'x-user-id': req.headers['x-user-id'],
        'x-user-tipo': req.headers['x-user-tipo'],
      },
      allHeaders: Object.keys(req.headers).filter(h => h.toLowerCase().includes('user')),
    });
    
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
      console.log('[LOG DEBUG] Log registrado com sucesso');
    } catch (logError) {
      console.error('[LOG DEBUG] Erro ao registrar log:', logError.message, logError.stack);
    }

    res.status(201).json({
      message: 'Cliente cadastrado com sucesso!',
      cliente: novoCliente,
    });
  } catch (error) {
    // Se houve erro e foto foi enviada, deletar a foto
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
app.get('/api/v1/clientes', async (req, res) => {
  try {
    // Verificar se o usuário logado tem permissão
    // TODO: Implementar verificação de autenticação/token

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

    console.log(`[GET /api/v1/clientes] Retornando ${result.rows.length} clientes`);

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
app.get('/api/v1/clientes/:id', async (req, res) => {
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

    // Não retornar dados sensíveis (senha_hash nunca é retornado)
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
app.put('/api/v1/clientes/:id', upload.single('foto'), async (req, res) => {
  let fotoUrl = null;

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

    // Registrar log (sempre, mesmo sem usuário - será 'sistema' se não houver)
    // Headers podem estar em minúsculas ou com hífen, verificar ambos
    const usuarioId = req.headers['x-user-id'] || req.headers['X-User-Id'] || null;
    const usuarioTipo = req.headers['x-user-tipo'] || req.headers['X-User-Tipo'] || null;
    
    // Debug temporário
    console.log('[LOG DEBUG] Editar Cliente:', {
      usuarioId,
      usuarioTipo,
      temUsuarioId: !!usuarioId,
      headers: {
        'x-user-id': req.headers['x-user-id'],
        'x-user-tipo': req.headers['x-user-tipo'],
        'X-User-Id': req.headers['X-User-Id'],
        'X-User-Tipo': req.headers['X-User-Tipo'],
      },
      allHeaders: Object.keys(req.headers).filter(h => h.toLowerCase().includes('user')),
    });
    
    // Sempre registrar log, mesmo sem usuário (será 'sistema')
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
      console.log('[LOG DEBUG] Log registrado com sucesso');
    } catch (logError) {
      console.error('[LOG DEBUG] Erro ao registrar log:', logError.message, logError.stack);
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
app.delete('/api/v1/clientes/:id', async (req, res) => {
  try {
    const { id } = req.params;

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

    // Registrar log (se houver usuário autenticado)
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

// ============================================================
// ROTAS DE AUTENTICAÇÃO
// ============================================================

/**
 * Função auxiliar para registrar acesso/login
 */
async function registrarAcesso(usuarioId, usuarioTipo) {
  try {
    const dataAcesso = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const agora = new Date();

    // Verificar se já existe registro para hoje
    const existe = await pool.query(
      `SELECT id, quantidade_login FROM protese.controle_acessos
       WHERE usuario_id = $1 AND usuario_tipo = $2 AND data_acesso = $3`,
      [usuarioId, usuarioTipo, dataAcesso]
    );

    if (existe.rows.length > 0) {
      // Atualizar quantidade de login
      await pool.query(
        `UPDATE protese.controle_acessos
         SET quantidade_login = quantidade_login + 1,
             ultimo_acesso = $1,
             updated_at = $1
         WHERE id = $2`,
        [agora, existe.rows[0].id]
      );
    } else {
      // Criar novo registro
      await pool.query(
        `INSERT INTO protese.controle_acessos (usuario_id, usuario_tipo, data_acesso, quantidade_login, primeiro_acesso, ultimo_acesso)
         VALUES ($1, $2, $3, 1, $4, $4)`,
        [usuarioId, usuarioTipo, dataAcesso, agora]
      );
    }
  } catch (error) {
    console.error('Erro ao registrar acesso:', error);
    // Não falhar o login se der erro ao registrar acesso
  }
}

/**
 * POST /api/v1/auth/login
 * Login de cliente
 */
app.post('/api/v1/auth/login', async (req, res) => {
  try {
    const { email, senha } = req.body;

    // Validações
    if (!email || !senha) {
      return res.status(400).json({ error: 'Email e senha são obrigatórios' });
    }

    // Buscar cliente por email
    const result = await pool.query(
      `SELECT id, nome_completo, email, senha_hash, foto_url, is_active
       FROM protese.usuarios_clientes
       WHERE email = $1`,
      [email.toLowerCase().trim()]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Email ou senha inválidos' });
    }

    const cliente = result.rows[0];

    // Verificar se está ativo
    if (!cliente.is_active) {
      return res.status(403).json({ error: 'Conta desativada. Entre em contato com o suporte.' });
    }

    // Verificar senha
    const senhaValida = await bcrypt.compare(senha, cliente.senha_hash);

    if (!senhaValida) {
      return res.status(401).json({ error: 'Email ou senha inválidos' });
    }

    // Registrar acesso (não bloquear se falhar)
    await registrarAcesso(cliente.id, 'cliente');

    // Login bem-sucedido - retornar dados do cliente (sem senha)
    res.json({
      message: 'Login realizado com sucesso!',
      cliente: {
        id: cliente.id,
        nome_completo: cliente.nome_completo,
        email: cliente.email,
        foto_url: cliente.foto_url,
      },
    });
  } catch (error) {
    console.error('Erro ao fazer login:', error);
    res.status(500).json({
      error: 'Erro ao fazer login',
      message: error.message,
    });
  }
});

/**
 * POST /api/v1/auth/admin/login
 * Login de usuário administrativo
 */
app.post('/api/v1/auth/admin/login', async (req, res) => {
  try {
    const { email, senha } = req.body;

    // Validações
    if (!email || !senha) {
      return res.status(400).json({ error: 'Email e senha são obrigatórios' });
    }

    // Buscar usuário administrativo por email
    const result = await pool.query(
      `SELECT id, nome_completo, email, senha_hash, foto_url, is_active, tipo_usuario
       FROM protese.usuarios_administrativos
       WHERE email = $1`,
      [email.toLowerCase().trim()]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Email ou senha inválidos' });
    }

    const admin = result.rows[0];

    // Verificar se está ativo
    if (!admin.is_active) {
      return res.status(403).json({ error: 'Conta desativada. Entre em contato com o suporte.' });
    }

    // Verificar senha
    const senhaValida = await bcrypt.compare(senha, admin.senha_hash);

    if (!senhaValida) {
      return res.status(401).json({ error: 'Email ou senha inválidos' });
    }

    // Registrar acesso (não bloquear se falhar)
    await registrarAcesso(admin.id, 'administrativo');

    // Login bem-sucedido - retornar dados do admin (sem senha)
    res.json({
      message: 'Login realizado com sucesso!',
      admin: {
        id: admin.id,
        nome_completo: admin.nome_completo,
        email: admin.email,
        foto_url: admin.foto_url,
        tipo_usuario: admin.tipo_usuario, // master, proprietario, funcionario
      },
      // TODO: Adicionar JWT token aqui
    });
  } catch (error) {
    console.error('Erro ao fazer login administrativo:', error);
    res.status(500).json({
      error: 'Erro ao fazer login',
      message: error.message,
    });
  }
});

// ============================================================
// ROTAS DE CONTROLE DE ACESSOS
// ============================================================

/**
 * Função auxiliar para registrar acesso/login
 */
async function registrarAcesso(usuarioId, usuarioTipo) {
  try {
    const dataAcesso = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const agora = new Date();

    // Verificar se já existe registro para hoje
    const existe = await pool.query(
      `SELECT id, quantidade_login FROM protese.controle_acessos
       WHERE usuario_id = $1 AND usuario_tipo = $2 AND data_acesso = $3`,
      [usuarioId, usuarioTipo, dataAcesso]
    );

    if (existe.rows.length > 0) {
      // Atualizar quantidade de login
      await pool.query(
        `UPDATE protese.controle_acessos
         SET quantidade_login = quantidade_login + 1,
             ultimo_acesso = $1,
             updated_at = $1
         WHERE id = $2`,
        [agora, existe.rows[0].id]
      );
    } else {
      // Criar novo registro
      await pool.query(
        `INSERT INTO protese.controle_acessos (usuario_id, usuario_tipo, data_acesso, quantidade_login, primeiro_acesso, ultimo_acesso)
         VALUES ($1, $2, $3, 1, $4, $4)`,
        [usuarioId, usuarioTipo, dataAcesso, agora]
      );
    }
  } catch (error) {
    console.error('Erro ao registrar acesso:', error);
    // Não falhar o login se der erro ao registrar acesso
  }
}

/**
 * GET /api/v1/controle-acessos
 * Lista acessos com filtros de data
 */
app.get('/api/v1/controle-acessos', async (req, res) => {
  try {
    const { data_inicio, data_fim, usuario_tipo } = req.query;

    // Valores padrão: último mês
    const hoje = new Date();
    const umMesAtras = new Date(hoje);
    umMesAtras.setMonth(umMesAtras.getMonth() - 1);

    const dataInicio = data_inicio || umMesAtras.toISOString().split('T')[0];
    const dataFim = data_fim || hoje.toISOString().split('T')[0];

    let query = `
      SELECT 
        ca.id,
        ca.usuario_id,
        ca.usuario_tipo,
        ca.data_acesso,
        ca.quantidade_login,
        ca.primeiro_acesso,
        ca.ultimo_acesso,
        CASE 
          WHEN ca.usuario_tipo = 'cliente' THEN uc.nome_completo
          WHEN ca.usuario_tipo = 'administrativo' THEN ua.nome_completo
        END as nome_usuario,
        CASE 
          WHEN ca.usuario_tipo = 'cliente' THEN uc.email
          WHEN ca.usuario_tipo = 'administrativo' THEN ua.email
        END as email_usuario,
        CASE 
          WHEN ca.usuario_tipo = 'cliente' AND uc.funcionario_responsavel_id IS NOT NULL THEN ua_responsavel.nome_completo
          ELSE NULL
        END as funcionario_responsavel_nome,
        CASE 
          WHEN ca.usuario_tipo = 'cliente' THEN uc.funcionario_responsavel_id
          ELSE NULL
        END as funcionario_responsavel_id
      FROM protese.controle_acessos ca
      LEFT JOIN protese.usuarios_clientes uc ON ca.usuario_tipo = 'cliente' AND ca.usuario_id = uc.id
      LEFT JOIN protese.usuarios_administrativos ua ON ca.usuario_tipo = 'administrativo' AND ca.usuario_id = ua.id
      LEFT JOIN protese.usuarios_administrativos ua_responsavel ON uc.funcionario_responsavel_id IS NOT NULL AND uc.funcionario_responsavel_id = ua_responsavel.id
      WHERE ca.data_acesso BETWEEN $1 AND $2
    `;

    const params = [dataInicio, dataFim];
    let paramIndex = 3;

    if (usuario_tipo) {
      query += ` AND ca.usuario_tipo = $${paramIndex}`;
      params.push(usuario_tipo);
      paramIndex++;
    }

    // Filtro por funcionário responsável
    if (req.query.funcionario_id) {
      query += ` AND uc.funcionario_responsavel_id = $${paramIndex}`;
      params.push(req.query.funcionario_id);
      paramIndex++;
    }

    query += ` ORDER BY ca.data_acesso DESC, ca.quantidade_login DESC`;

    const result = await pool.query(query, params);

    res.json({
      acessos: result.rows,
      periodo: {
        data_inicio: dataInicio,
        data_fim: dataFim,
      },
    });
  } catch (error) {
    console.error('Erro ao buscar controle de acessos:', error);
    res.status(500).json({
      error: 'Erro ao buscar controle de acessos',
      message: error.message,
    });
  }
});

/**
 * GET /api/v1/controle-acessos/estatisticas
 * Retorna estatísticas de acessos no período
 */
app.get('/api/v1/controle-acessos/estatisticas', async (req, res) => {
  try {
    const { data_inicio, data_fim } = req.query;

    // Valores padrão: último mês
    const hoje = new Date();
    const umMesAtras = new Date(hoje);
    umMesAtras.setMonth(umMesAtras.getMonth() - 1);

    const dataInicio = data_inicio || umMesAtras.toISOString().split('T')[0];
    const dataFim = data_fim || hoje.toISOString().split('T')[0];

    // Total de usuários únicos que logaram no período
    const usuariosUnicos = await pool.query(
      `SELECT COUNT(DISTINCT usuario_id) as total
       FROM protese.controle_acessos
       WHERE data_acesso BETWEEN $1 AND $2`,
      [dataInicio, dataFim]
    );

    // Total de logins no período
    const totalLogins = await pool.query(
      `SELECT SUM(quantidade_login) as total
       FROM protese.controle_acessos
       WHERE data_acesso BETWEEN $1 AND $2`,
      [dataInicio, dataFim]
    );

    // Total de acessos por tipo de usuário
    const acessosPorTipo = await pool.query(
      `SELECT 
        usuario_tipo,
        COUNT(DISTINCT usuario_id) as usuarios_unicos,
        SUM(quantidade_login) as total_logins
       FROM protese.controle_acessos
       WHERE data_acesso BETWEEN $1 AND $2
       GROUP BY usuario_tipo`,
      [dataInicio, dataFim]
    );

    // Acessos por dia no período
    const acessosPorDia = await pool.query(
      `SELECT 
        data_acesso,
        COUNT(DISTINCT usuario_id) as usuarios_unicos,
        SUM(quantidade_login) as total_logins
       FROM protese.controle_acessos
       WHERE data_acesso BETWEEN $1 AND $2
       GROUP BY data_acesso
       ORDER BY data_acesso ASC`,
      [dataInicio, dataFim]
    );

    res.json({
      periodo: {
        data_inicio: dataInicio,
        data_fim: dataFim,
      },
      total_usuarios_unicos: parseInt(usuariosUnicos.rows[0].total || 0),
      total_logins: parseInt(totalLogins.rows[0].total || 0),
      por_tipo: acessosPorTipo.rows,
      por_dia: acessosPorDia.rows,
    });
  } catch (error) {
    console.error('Erro ao buscar estatísticas de acessos:', error);
    res.status(500).json({
      error: 'Erro ao buscar estatísticas de acessos',
      message: error.message,
    });
  }
});

// ============================================================
// ROTAS DE FUNCIONÁRIOS
// ============================================================

/**
 * POST /api/v1/funcionarios
 * Cria um novo funcionário (usuário administrativo)
 */
app.post('/api/v1/funcionarios', async (req, res) => {
  try {
    const {
      nome_completo,
      email,
      cpf,
      tipo_usuario,
      senha,
    } = req.body;

    // Validações básicas
    if (!nome_completo || !email || !tipo_usuario || !senha) {
      return res.status(400).json({
        error: 'Campos obrigatórios não preenchidos',
        required: ['nome_completo', 'email', 'tipo_usuario', 'senha'],
      });
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Email inválido' });
    }

    // Validar tipo de usuário
    const tiposValidos = ['master', 'proprietario', 'funcionario'];
    if (!tiposValidos.includes(tipo_usuario)) {
      return res.status(400).json({ error: 'Tipo de usuário inválido' });
    }

    // Validar CPF se fornecido
    let cpfLimpo = null;
    if (cpf) {
      cpfLimpo = cpf.replace(/\D/g, '');
      if (cpfLimpo.length !== 11) {
        return res.status(400).json({ error: 'CPF inválido' });
      }

      // Verificar se CPF já existe
      const cpfCheck = await pool.query(
        'SELECT id FROM protese.usuarios_administrativos WHERE cpf = $1',
        [cpfLimpo]
      );
      if (cpfCheck.rows.length > 0) {
        return res.status(409).json({ error: 'CPF já cadastrado' });
      }
    }

    // Verificar se email já existe
    const emailCheck = await pool.query(
      'SELECT id FROM protese.usuarios_administrativos WHERE email = $1',
      [email]
    );
    if (emailCheck.rows.length > 0) {
      return res.status(409).json({ error: 'Email já cadastrado' });
    }

    // Hash da senha
    const senhaHash = await bcrypt.hash(senha, 10);

    // Inserir no banco de dados
    const result = await pool.query(
      `INSERT INTO protese.usuarios_administrativos (
        nome_completo, email, cpf, tipo_usuario, senha_hash, is_active
      ) VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, nome_completo, email, cpf, tipo_usuario, is_active, created_at`,
      [
        nome_completo,
        email,
        cpfLimpo,
        tipo_usuario,
        senhaHash,
        true, // is_active padrão
      ]
    );

    const novoFuncionario = result.rows[0];

    // Registrar log (se houver usuário autenticado)
    const usuarioId = req.headers['x-user-id'] || null;
    const usuarioTipo = req.headers['x-user-tipo'] || 'administrativo';
    if (usuarioId) {
      await registrarLog({
        usuarioId,
        usuarioTipo,
        acao: 'criar',
        modulo: 'funcionario',
        entidadeId: novoFuncionario.id,
        entidadeTipo: 'funcionario',
        descricao: `Funcionário ${nome_completo} (${email}) - ${tipo_usuario} criado`,
        dadosNovos: {
          nome_completo,
          email,
          cpf: cpfLimpo,
          tipo_usuario,
        },
        ipAddress: getClientIp(req),
        userAgent: getUserAgent(req),
      });
    }

    res.status(201).json({
      message: 'Funcionário cadastrado com sucesso!',
      funcionario: novoFuncionario,
    });
  } catch (error) {
    console.error('Erro ao cadastrar funcionário:', error);
    res.status(500).json({
      error: 'Erro ao cadastrar funcionário',
      message: error.message,
    });
  }
});

/**
 * GET /api/v1/funcionarios
 * Lista todos os funcionários (usuários administrativos)
 * Master vê todos, Proprietário não vê Masters
 */
app.get('/api/v1/funcionarios', async (req, res) => {
  try {
    // Verificar se o usuário logado é Master ou Proprietário
    // TODO: Implementar verificação de autenticação/token via header/token
    
    // Por enquanto, aceitar tipo_usuario via query string (temporário até implementar autenticação)
    const tipoUsuarioRequisicao = req.query.tipo_usuario || req.query.requestingUserType || req.headers['x-user-type'] || 'master';

    let query;
    let params = [];

    if (tipoUsuarioRequisicao === 'master') {
      // Master vê TODOS os funcionários (incluindo outros Masters)
      query = `SELECT id, nome_completo, email, cpf, tipo_usuario, is_active, created_at
               FROM protese.usuarios_administrativos
               ORDER BY nome_completo ASC`;
    } else {
      // Proprietário e Funcionário NÃO veem Masters
      query = `SELECT id, nome_completo, email, cpf, tipo_usuario, is_active, created_at
               FROM protese.usuarios_administrativos
               WHERE tipo_usuario != 'master'
               ORDER BY nome_completo ASC`;
    }

    const result = await pool.query(query, params);

    res.json({
      funcionarios: result.rows,
    });
  } catch (error) {
    console.error('Erro ao buscar funcionários:', error);
    res.status(500).json({
      error: 'Erro ao buscar funcionários',
      message: error.message,
    });
  }
});

/**
 * GET /api/v1/funcionarios/:id
 * Busca um funcionário por ID
 */
app.get('/api/v1/funcionarios/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT id, nome_completo, email, cpf, tipo_usuario, is_active, created_at, updated_at
       FROM protese.usuarios_administrativos
       WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Funcionário não encontrado' });
    }

    res.json({ funcionario: result.rows[0] });
  } catch (error) {
    console.error('Erro ao buscar funcionário:', error);
    res.status(500).json({
      error: 'Erro ao buscar funcionário',
      message: error.message,
    });
  }
});

/**
 * PUT /api/v1/funcionarios/:id
 * Atualiza um funcionário
 */
app.put('/api/v1/funcionarios/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar se funcionário existe
    const funcionarioCheck = await pool.query(
      'SELECT id FROM protese.usuarios_administrativos WHERE id = $1',
      [id]
    );

    if (funcionarioCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Funcionário não encontrado' });
    }

    const {
      nome_completo,
      email,
      cpf,
      tipo_usuario,
      senha,
      is_active,
    } = req.body;

    // Validações básicas
    if (!nome_completo || !email) {
      return res.status(400).json({
        error: 'Nome completo e email são obrigatórios',
      });
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Email inválido' });
    }

    // Verificar se email já existe em outro funcionário
    const emailCheck = await pool.query(
      'SELECT id FROM protese.usuarios_administrativos WHERE email = $1 AND id != $2',
      [email, id]
    );
    if (emailCheck.rows.length > 0) {
      return res.status(409).json({ error: 'Email já cadastrado para outro funcionário' });
    }

    // Se CPF fornecido, validar e verificar duplicidade
    let cpfLimpo = null;
    if (cpf) {
      cpfLimpo = cpf.replace(/\D/g, '');
      if (cpfLimpo.length !== 11) {
        return res.status(400).json({ error: 'CPF inválido' });
      }

      const cpfCheck = await pool.query(
        'SELECT id FROM protese.usuarios_administrativos WHERE cpf = $1 AND id != $2',
        [cpfLimpo, id]
      );
      if (cpfCheck.rows.length > 0) {
        return res.status(409).json({ error: 'CPF já cadastrado para outro funcionário' });
      }
    }

    // Hash da senha se fornecida
    let senhaHash = null;
    if (senha && senha.trim() !== '') {
      senhaHash = await bcrypt.hash(senha, 10);
    }

    // Construir query de atualização
    let query;
    let params;

    if (senhaHash) {
      query = `UPDATE protese.usuarios_administrativos SET
        nome_completo = $1,
        email = $2,
        ${cpfLimpo ? 'cpf = $3,' : ''}
        ${tipo_usuario ? 'tipo_usuario = $' + (cpfLimpo ? '4' : '3') + ',' : ''}
        senha_hash = $${cpfLimpo && tipo_usuario ? '5' : cpfLimpo || tipo_usuario ? '4' : '3'},
        is_active = $${cpfLimpo && tipo_usuario ? '6' : cpfLimpo || tipo_usuario ? '5' : '4'},
        updated_at = NOW()
      WHERE id = $${cpfLimpo && tipo_usuario ? '7' : cpfLimpo || tipo_usuario ? '6' : '5'}
      RETURNING id, nome_completo, email, cpf, tipo_usuario, is_active, created_at, updated_at`;

      const paramArray = [nome_completo, email];
      if (cpfLimpo) paramArray.push(cpfLimpo);
      if (tipo_usuario) paramArray.push(tipo_usuario);
      paramArray.push(senhaHash);
      paramArray.push(is_active !== undefined ? is_active : true);
      paramArray.push(id);
      params = paramArray;
    } else {
      query = `UPDATE protese.usuarios_administrativos SET
        nome_completo = $1,
        email = $2,
        ${cpfLimpo ? 'cpf = $3,' : ''}
        ${tipo_usuario ? 'tipo_usuario = $' + (cpfLimpo ? '4' : '3') + ',' : ''}
        is_active = $${cpfLimpo && tipo_usuario ? '5' : cpfLimpo || tipo_usuario ? '4' : '3'},
        updated_at = NOW()
      WHERE id = $${cpfLimpo && tipo_usuario ? '6' : cpfLimpo || tipo_usuario ? '5' : '4'}
      RETURNING id, nome_completo, email, cpf, tipo_usuario, is_active, created_at, updated_at`;

      const paramArray = [nome_completo, email];
      if (cpfLimpo) paramArray.push(cpfLimpo);
      if (tipo_usuario) paramArray.push(tipo_usuario);
      paramArray.push(is_active !== undefined ? is_active : true);
      paramArray.push(id);
      params = paramArray;
    }

    // Buscar dados anteriores do funcionário (para log)
    const funcionarioAnterior = await pool.query(
      'SELECT nome_completo, email, cpf, tipo_usuario FROM protese.usuarios_administrativos WHERE id = $1',
      [id]
    );
    const dadosAnteriores = funcionarioAnterior.rows[0] || {};

    const result = await pool.query(query, params);
    const funcionarioAtualizado = result.rows[0];

    // Registrar log (se houver usuário autenticado)
    const usuarioId = req.headers['x-user-id'] || null;
    const usuarioTipo = req.headers['x-user-tipo'] || 'administrativo';
    if (usuarioId) {
      await registrarLog({
        usuarioId,
        usuarioTipo,
        acao: 'editar',
        modulo: 'funcionario',
        entidadeId: id,
        entidadeTipo: 'funcionario',
        descricao: `Funcionário ${nome_completo} (${email}) atualizado`,
        dadosAnteriores: {
          nome_completo: dadosAnteriores.nome_completo,
          email: dadosAnteriores.email,
          tipo_usuario: dadosAnteriores.tipo_usuario,
        },
        dadosNovos: {
          nome_completo,
          email,
          cpf: cpfLimpo,
          tipo_usuario: tipo_usuario || dadosAnteriores.tipo_usuario,
        },
        ipAddress: getClientIp(req),
        userAgent: getUserAgent(req),
      });
    }

    res.json({
      message: 'Funcionário atualizado com sucesso!',
      funcionario: funcionarioAtualizado,
    });
  } catch (error) {
    console.error('Erro ao atualizar funcionário:', error);
    res.status(500).json({
      error: 'Erro ao atualizar funcionário',
      message: error.message,
    });
  }
});

/**
 * DELETE /api/v1/funcionarios/:id
 * Exclui um funcionário (não permite excluir Masters)
 */
app.delete('/api/v1/funcionarios/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar se funcionário existe e tipo
    const funcionarioCheck = await pool.query(
      'SELECT id, tipo_usuario FROM protese.usuarios_administrativos WHERE id = $1',
      [id]
    );

    if (funcionarioCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Funcionário não encontrado' });
    }

    // Não permitir excluir Masters
    if (funcionarioCheck.rows[0].tipo_usuario === 'master') {
      return res.status(403).json({ error: 'Não é permitido excluir usuários Master' });
    }

    // Buscar dados completos do funcionário antes de deletar (para log)
    const funcionarioCompleto = await pool.query(
      'SELECT nome_completo, email, cpf, tipo_usuario FROM protese.usuarios_administrativos WHERE id = $1',
      [id]
    );
    const dadosFuncionario = funcionarioCompleto.rows[0] || {};

    // Deletar funcionário do banco
    await pool.query('DELETE FROM protese.usuarios_administrativos WHERE id = $1', [id]);

    // Registrar log (se houver usuário autenticado)
    const usuarioId = req.headers['x-user-id'] || null;
    const usuarioTipo = req.headers['x-user-tipo'] || 'administrativo';
    if (usuarioId) {
      await registrarLog({
        usuarioId,
        usuarioTipo,
        acao: 'excluir',
        modulo: 'funcionario',
        entidadeId: id,
        entidadeTipo: 'funcionario',
        descricao: `Funcionário ${dadosFuncionario.nome_completo || 'N/A'} (${dadosFuncionario.email || 'N/A'}) - ${dadosFuncionario.tipo_usuario || 'N/A'} excluído`,
        dadosAnteriores: {
          nome_completo: dadosFuncionario.nome_completo,
          email: dadosFuncionario.email,
          cpf: dadosFuncionario.cpf,
          tipo_usuario: dadosFuncionario.tipo_usuario,
        },
        ipAddress: getClientIp(req),
        userAgent: getUserAgent(req),
      });
    }

    res.json({
      message: 'Funcionário excluído com sucesso!',
    });
  } catch (error) {
    console.error('Erro ao excluir funcionário:', error);
    res.status(500).json({
      error: 'Erro ao excluir funcionário',
      message: error.message,
    });
  }
});

// ============================================================
// ROTAS DE PERMISSÕES
// ============================================================

/**
 * GET /api/v1/permissoes/:usuarioId
 * Busca as permissões de um usuário
 */
app.get('/api/v1/permissoes/:usuarioId', async (req, res) => {
  try {
    const { usuarioId } = req.params;

    // Verificar se o usuário logado é Master
    // TODO: Implementar verificação de autenticação/token

    // Buscar permissões do usuário
    const result = await pool.query(
      `SELECT * FROM protese.permissoes_usuarios
       WHERE usuario_id = $1`,
      [usuarioId]
    );

    if (result.rows.length === 0) {
      // Se não existir, retornar permissões padrão (todas false)
      return res.json({
        permissoes: {
          dashboard_ver: false,
          agenda_ver: false,
          agenda_editar: false,
          agenda_excluir: false,
          lancamento_venda_ver: false,
          lancamento_venda_editar: false,
          lancamento_venda_excluir: false,
          lancamento_despesa_ver: false,
          lancamento_despesa_editar: false,
          lancamento_despesa_excluir: false,
          receitas_ver: false,
          receitas_editar: false,
          receitas_excluir: false,
          despesas_ver: false,
          despesas_editar: false,
          despesas_excluir: false,
          faturamento_ver: false,
          faturamento_editar: false,
          faturamento_excluir: false,
          usuarios_ver: false,
          usuarios_editar: false,
          usuarios_excluir: false,
          funcionarios_ver: false,
          funcionarios_editar: false,
          funcionarios_excluir: false,
          controle_acessos_ver: false,
          controle_logs_ver: false,
          help_desk_ver: false,
          help_desk_editar: false,
          help_desk_excluir: false,
          controle_permissoes_ver: false,
          controle_permissoes_editar: false,
          controle_permissoes_excluir: false,
        },
      });
    }

    // Remover campos não relacionados a permissões
    const { id, usuario_id, created_at, updated_at, ...permissoes } = result.rows[0];

    res.json({
      permissoes,
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
app.put('/api/v1/permissoes/:usuarioId', async (req, res) => {
  try {
    const { usuarioId } = req.params;
    const permissoesBody = req.body;

    // Verificar se o usuário logado é Master
    // TODO: Implementar verificação de autenticação/token

    // Verificar se o usuário existe
    const usuarioCheck = await pool.query(
      'SELECT id FROM protese.usuarios_administrativos WHERE id = $1',
      [usuarioId]
    );

    if (usuarioCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    // Preparar valores das permissões
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
      controle_permissoes_ver: permissoesBody.controle_permissoes_ver || false,
      controle_permissoes_editar: permissoesBody.controle_permissoes_editar || false,
      controle_permissoes_excluir: permissoesBody.controle_permissoes_excluir || false,
    };

    // Verificar se já existe registro de permissões
    const existePermissoes = await pool.query(
      'SELECT id FROM protese.permissoes_usuarios WHERE usuario_id = $1',
      [usuarioId]
    );

    if (existePermissoes.rows.length > 0) {
      // Atualizar permissões existentes
      await pool.query(
        `UPDATE protese.permissoes_usuarios SET
          dashboard_ver = $1,
          agenda_ver = $2,
          agenda_editar = $3,
          agenda_excluir = $4,
          lancamento_venda_ver = $5,
          lancamento_venda_editar = $6,
          lancamento_venda_excluir = $7,
          lancamento_despesa_ver = $8,
          lancamento_despesa_editar = $9,
          lancamento_despesa_excluir = $10,
          receitas_ver = $11,
          receitas_editar = $12,
          receitas_excluir = $13,
          despesas_ver = $14,
          despesas_editar = $15,
          despesas_excluir = $16,
          faturamento_ver = $17,
          faturamento_editar = $18,
          faturamento_excluir = $19,
          usuarios_ver = $20,
          usuarios_editar = $21,
          usuarios_excluir = $22,
          funcionarios_ver = $23,
          funcionarios_editar = $24,
          funcionarios_excluir = $25,
          controle_acessos_ver = $26,
          controle_logs_ver = $27,
          help_desk_ver = $28,
          help_desk_editar = $29,
          help_desk_excluir = $30,
          controle_permissoes_ver = $31,
          controle_permissoes_editar = $32,
          controle_permissoes_excluir = $33,
          updated_at = NOW()
        WHERE usuario_id = $34`,
        [
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
          valoresPermissoes.controle_permissoes_ver,
          valoresPermissoes.controle_permissoes_editar,
          valoresPermissoes.controle_permissoes_excluir,
          usuarioId,
        ]
      );
    } else {
      // Criar novo registro de permissões
      await pool.query(
        `INSERT INTO protese.permissoes_usuarios (
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
          controle_permissoes_ver, controle_permissoes_editar, controle_permissoes_excluir
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32, $33, $34
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
          valoresPermissoes.controle_permissoes_ver,
          valoresPermissoes.controle_permissoes_editar,
          valoresPermissoes.controle_permissoes_excluir,
        ]
      );
    }

    // Registrar log (se houver usuário autenticado)
    const usuarioLogadoId = req.headers['x-user-id'] || null;
    const usuarioLogadoTipo = req.headers['x-user-tipo'] || 'administrativo';
    if (usuarioLogadoId) {
      // Buscar nome do usuário que teve as permissões alteradas
      const usuarioAlvo = await pool.query(
        'SELECT nome_completo FROM protese.usuarios_administrativos WHERE id = $1',
        [usuarioId]
      );
      const nomeUsuarioAlvo = usuarioAlvo.rows[0]?.nome_completo || 'N/A';

      await registrarLog({
        usuarioId: usuarioLogadoId, // ID do usuário que fez a alteração
        usuarioTipo: usuarioLogadoTipo,
        acao: 'editar',
        modulo: 'permissao',
        entidadeId: usuarioId, // ID do usuário que teve as permissões alteradas
        entidadeTipo: 'permissao',
        descricao: `Permissões do usuário ${nomeUsuarioAlvo} atualizadas`,
        dadosNovos: valoresPermissoes,
        ipAddress: getClientIp(req),
        userAgent: getUserAgent(req),
      });
    }

    res.json({
      message: 'Permissões atualizadas com sucesso!',
    });
  } catch (error) {
    console.error('Erro ao atualizar permissões:', error);
    res.status(500).json({
      error: 'Erro ao atualizar permissões',
      message: error.message,
    });
  }
});

// ============================================================
// ROTAS DE LOGS DO SISTEMA
// ============================================================

/**
 * GET /api/v1/logs
 * Lista logs do sistema com filtros
 * 
 * Query params:
 * - data_inicio (YYYY-MM-DD)
 * - data_fim (YYYY-MM-DD)
 * - modulo (funcionario, cliente, venda, etc.)
 * - acao (criar, editar, excluir, etc.)
 * - usuario_id (UUID)
 * - usuario_tipo (cliente, administrativo)
 * - status (sucesso, erro, cancelado)
 * - limit (número, padrão: 100)
 * - offset (número, padrão: 0)
 */
app.get('/api/v1/logs', async (req, res) => {
  try {
    const {
      data_inicio,
      data_fim,
      modulo,
      acao,
      usuario_id,
      usuario_tipo,
      status,
      limit = 100,
      offset = 0,
    } = req.query;

    // Valores padrão: último mês
    const hoje = new Date();
    const umMesAtras = new Date(hoje);
    umMesAtras.setMonth(umMesAtras.getMonth() - 1);

    const dataInicio = data_inicio || umMesAtras.toISOString().split('T')[0];
    const dataFim = data_fim || hoje.toISOString().split('T')[0];

    // Construir query dinâmica
    let query = `
      SELECT 
        ls.id,
        ls.usuario_id,
        ls.usuario_tipo,
        ls.usuario_nome,
        ls.acao,
        ls.modulo,
        ls.entidade_id,
        ls.entidade_tipo,
        ls.descricao,
        ls.dados_anteriores,
        ls.dados_novos,
        ls.ip_address,
        ls.user_agent,
        ls.status,
        ls.mensagem_erro,
        ls.created_at
      FROM protese.logs_sistema ls
      WHERE DATE(ls.created_at) BETWEEN $1 AND $2
    `;

    const params = [dataInicio, dataFim];
    let paramIndex = 3;

    // Filtros opcionais
    if (modulo) {
      query += ` AND ls.modulo = $${paramIndex}`;
      params.push(modulo);
      paramIndex++;
    }

    if (acao) {
      query += ` AND ls.acao = $${paramIndex}`;
      params.push(acao);
      paramIndex++;
    }

    if (usuario_id) {
      query += ` AND ls.usuario_id = $${paramIndex}`;
      params.push(usuario_id);
      paramIndex++;
    }

    if (usuario_tipo) {
      query += ` AND ls.usuario_tipo = $${paramIndex}`;
      params.push(usuario_tipo);
      paramIndex++;
    }

    if (status) {
      query += ` AND ls.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    // Ordenação e paginação
    query += ` ORDER BY ls.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(parseInt(limit), parseInt(offset));

    const result = await pool.query(query, params);

    // Contar total (para paginação)
    let countQuery = `
      SELECT COUNT(*) as total
      FROM protese.logs_sistema ls
      WHERE DATE(ls.created_at) BETWEEN $1 AND $2
    `;
    const countParams = [dataInicio, dataFim];
    let countParamIndex = 3;

    if (modulo) {
      countQuery += ` AND ls.modulo = $${countParamIndex}`;
      countParams.push(modulo);
      countParamIndex++;
    }

    if (acao) {
      countQuery += ` AND ls.acao = $${countParamIndex}`;
      countParams.push(acao);
      countParamIndex++;
    }

    if (usuario_id) {
      countQuery += ` AND ls.usuario_id = $${countParamIndex}`;
      countParams.push(usuario_id);
      countParamIndex++;
    }

    if (usuario_tipo) {
      countQuery += ` AND ls.usuario_tipo = $${countParamIndex}`;
      countParams.push(usuario_tipo);
      countParamIndex++;
    }

    if (status) {
      countQuery += ` AND ls.status = $${countParamIndex}`;
      countParams.push(status);
      countParamIndex++;
    }

    const countResult = await pool.query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].total);

    res.json({
      logs: result.rows,
      paginacao: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        total_paginas: Math.ceil(total / limit),
      },
      periodo: {
        data_inicio: dataInicio,
        data_fim: dataFim,
      },
    });
  } catch (error) {
    console.error('Erro ao buscar logs:', error);
    res.status(500).json({
      error: 'Erro ao buscar logs',
      message: error.message,
    });
  }
});

/**
 * GET /api/v1/logs/estatisticas
 * Retorna estatísticas dos logs no período
 */
app.get('/api/v1/logs/estatisticas', async (req, res) => {
  try {
    const { data_inicio, data_fim } = req.query;

    // Valores padrão: último mês
    const hoje = new Date();
    const umMesAtras = new Date(hoje);
    umMesAtras.setMonth(umMesAtras.getMonth() - 1);

    const dataInicio = data_inicio || umMesAtras.toISOString().split('T')[0];
    const dataFim = data_fim || hoje.toISOString().split('T')[0];

    // Total de logs
    const totalLogs = await pool.query(
      `SELECT COUNT(*) as total
       FROM protese.logs_sistema
       WHERE DATE(created_at) BETWEEN $1 AND $2`,
      [dataInicio, dataFim]
    );

    // Por módulo
    const porModulo = await pool.query(
      `SELECT modulo, COUNT(*) as quantidade
       FROM protese.logs_sistema
       WHERE DATE(created_at) BETWEEN $1 AND $2
       GROUP BY modulo
       ORDER BY quantidade DESC`,
      [dataInicio, dataFim]
    );

    // Por ação
    const porAcao = await pool.query(
      `SELECT acao, COUNT(*) as quantidade
       FROM protese.logs_sistema
       WHERE DATE(created_at) BETWEEN $1 AND $2
       GROUP BY acao
       ORDER BY quantidade DESC`,
      [dataInicio, dataFim]
    );

    // Por status
    const porStatus = await pool.query(
      `SELECT status, COUNT(*) as quantidade
       FROM protese.logs_sistema
       WHERE DATE(created_at) BETWEEN $1 AND $2
       GROUP BY status
       ORDER BY quantidade DESC`,
      [dataInicio, dataFim]
    );

    // Por usuário (top 10)
    const porUsuario = await pool.query(
      `SELECT usuario_nome, usuario_tipo, COUNT(*) as quantidade
       FROM protese.logs_sistema
       WHERE DATE(created_at) BETWEEN $1 AND $2
       GROUP BY usuario_nome, usuario_tipo
       ORDER BY quantidade DESC
       LIMIT 10`,
      [dataInicio, dataFim]
    );

    // Por dia
    const porDia = await pool.query(
      `SELECT DATE(created_at) as data, COUNT(*) as quantidade
       FROM protese.logs_sistema
       WHERE DATE(created_at) BETWEEN $1 AND $2
       GROUP BY DATE(created_at)
       ORDER BY data DESC`,
      [dataInicio, dataFim]
    );

    res.json({
      periodo: {
        data_inicio: dataInicio,
        data_fim: dataFim,
      },
      total_logs: parseInt(totalLogs.rows[0].total),
      por_modulo: porModulo.rows,
      por_acao: porAcao.rows,
      por_status: porStatus.rows,
      por_usuario: porUsuario.rows,
      por_dia: porDia.rows,
    });
  } catch (error) {
    console.error('Erro ao buscar estatísticas de logs:', error);
    res.status(500).json({
      error: 'Erro ao buscar estatísticas de logs',
      message: error.message,
    });
  }
});

/**
 * GET /api/v1/logs/:id
 * Busca um log específico por ID
 */
app.get('/api/v1/logs/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT * FROM protese.logs_sistema WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Log não encontrado' });
    }

    res.json({ log: result.rows[0] });
  } catch (error) {
    console.error('Erro ao buscar log:', error);
    res.status(500).json({
      error: 'Erro ao buscar log',
      message: error.message,
    });
  }
});

// ============================================================
// MIDDLEWARE DE ERRO
// ============================================================

app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'Arquivo muito grande. Máximo 5MB' });
    }
  }
  res.status(500).json({
    error: 'Erro interno do servidor',
    message: error.message,
  });
});

// ============================================================
// INICIAR SERVIDOR
// ============================================================

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✓ Servidor rodando na porta ${PORT}`);
  console.log(`✓ Ambiente: ${process.env.NODE_ENV || 'development'}`);
  console.log(`✓ Uploads em: ${uploadsDir}`);
  console.log(`✓ Base URL: ${process.env.API_BASE_URL || 'http://localhost:3001'}`);
});

