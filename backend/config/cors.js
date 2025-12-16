const cors = require('cors');

// Configuração de CORS - permite múltiplas origens
const allowedOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(',').map(origin => origin.trim())
  : [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:3002',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:3001',
      'http://127.0.0.1:3002',
      'https://app.protesecapilarcuiaba.com.br',
      'https://admin.protesecapilarcuiaba.com.br',
      'https://www.protesecapilarcuiaba.com.br',
    ];

const corsOptions = {
  origin: (origin, callback) => {
    // Permitir requisições sem origin (ex: mobile apps, Postman, curl)
    if (!origin) {
      console.log('[CORS] Requisição sem origin, permitindo');
      return callback(null, true);
    }
    
    // Em desenvolvimento, permitir localhost de qualquer porta
    const isLocalhost = origin.startsWith('http://localhost:') || 
                       origin.startsWith('http://127.0.0.1:') ||
                       origin.startsWith('http://0.0.0.0:');
    
    if (isLocalhost || allowedOrigins.includes(origin)) {
      console.log(`[CORS] Origem permitida: ${origin}`);
      callback(null, true);
    } else {
      console.warn(`[CORS] Origem bloqueada: ${origin}`);
      console.warn(`[CORS] Origens permitidas:`, allowedOrigins);
      callback(new Error('Não permitido pela política CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'x-user-id', 
    'X-User-Id',
    'x-user-tipo', 
    'X-User-Tipo',
    'x-user-nome',
    'X-User-Nome',
    'Accept',
    'Origin',
    'X-Requested-With'
  ],
  exposedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400, // 24 horas
};

module.exports = cors(corsOptions);








