require('dotenv').config();

const express = require('express');
const path = require('path');
const pool = require('./config/database');
const corsOptions = require('./config/cors');
const multerConfig = require('./config/multer');
const { initLogger } = require('./utils/logger');
const apiLoggerMiddleware = require('./middlewares/apiLogger');
const routes = require('./routes');

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(corsOptions);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Middleware de logging automático de requisições API
// IMPORTANTE: Deve vir depois dos middlewares de parsing (json/urlencoded) mas antes das rotas
app.use(apiLoggerMiddleware);

// Middleware para servir arquivos estáticos (fotos e anexos)
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
// ROTAS DA API
// ============================================================

app.use('/api/v1', routes);

// ============================================================
// MIDDLEWARE DE ERRO
// ============================================================

const multer = require('multer');
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
  console.log(`✓ Uploads em: ${multerConfig.uploadsDir}`);
  console.log(`✓ Base URL: ${process.env.API_BASE_URL || 'http://localhost:3001'}`);
});
