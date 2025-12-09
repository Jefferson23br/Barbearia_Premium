const express = require('express');
const router = express.Router();

// Importar todas as rotas
const clientesRoutes = require('./clientes');
const funcionariosRoutes = require('./funcionarios');
const permissoesRoutes = require('./permissoes');
const helpDeskRoutes = require('./help-desk');
const logsRoutes = require('./logs');
const authRoutes = require('./auth');
const controleAcessosRoutes = require('./controle-acessos');
const servicosRoutes = require('./servicos');
const configuracoesRoutes = require('./configuracoes');
const integracoesRoutes = require('./integracoes');

// Registrar rotas
router.use('/clientes', clientesRoutes);
router.use('/funcionarios', funcionariosRoutes);
router.use('/permissoes', permissoesRoutes);
router.use('/help-desk', helpDeskRoutes);
router.use('/logs', logsRoutes);
router.use('/auth', authRoutes);
router.use('/controle-acessos', controleAcessosRoutes);
router.use('/servicos', servicosRoutes);
router.use('/configuracoes', configuracoesRoutes);
router.use('/integracoes', integracoesRoutes);

module.exports = router;

