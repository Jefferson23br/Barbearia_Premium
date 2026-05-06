const express = require('express');

const authRoutes = require('./auth');
const filialRoutes = require('./filiais');
const clienteRoutes = require('./clientes');

const router = express.Router();

router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    version: 'v2',
    timestamp: new Date().toISOString(),
  });
});

router.use('/auth', authRoutes);
router.use('/filiais', filialRoutes);
router.use('/clientes', clienteRoutes);

module.exports = router;
