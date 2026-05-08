// API de Teste Simples - Barbearia Premium
// Arquivo: server.js
// Porta: 3001

const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3001;

// Configurar CORS para aceitar frontends
const allowedOrigins = [
  'https://appbarber.auctusconsultoria.com.br',
  'http://localhost:3000',
  'http://localhost:3002',
];

app.use(cors({
  origin: function(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'API Barbearia Premium funcionando!',
    timestamp: new Date(),
    uptime: process.uptime()
  });
});

// Rota de teste
app.get('/api/test', (req, res) => {
  res.json({ 
    success: true, 
    message: 'API Barbearia Premium',
    version: '1.0.0',
    timestamp: new Date()
  });
});

// Rota 404
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Rota não encontrada',
    path: req.path
  });
});

// Iniciar servidor
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✓ API rodando na porta ${PORT}`);
  console.log(`✓ Health check: http://localhost:${PORT}/health`);
  console.log(`✓ Teste: http://localhost:${PORT}/api/test`);
});

