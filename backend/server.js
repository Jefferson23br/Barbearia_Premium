require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcrypt');

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
app.use(cors({
  origin: process.env.CORS_ORIGINS?.split(',') || [
    'http://localhost:3000',
    'https://app.protesecapilarcuiaba.com.br',
    'https://admin.protesecapilarcuiaba.com.br',
  ],
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

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
        bairro, cidade, estado, cep, senha_hash, foto_url
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
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
      ]
    );

    res.status(201).json({
      message: 'Cliente cadastrado com sucesso!',
      cliente: result.rows[0],
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
 * GET /api/v1/clientes/:id
 * Busca um cliente por ID
 */
app.get('/api/v1/clientes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT id, nome_completo, email, cpf, rg, rua, numero, complemento,
              bairro, cidade, estado, cep, foto_url, is_active, created_at, updated_at
       FROM protese.usuarios_clientes
       WHERE id = $1`,
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

// ============================================================
// ROTAS DE AUTENTICAÇÃO
// ============================================================

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

