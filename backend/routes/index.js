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
const agendamentosRoutes = require('./agendamentos');
const fechamentosEspeciaisRoutes = require('./fechamentos-especiais');
const produtosRoutes = require('./produtos');
const estoqueRoutes = require('./estoque');
const caixasRoutes = require('./caixas');
const vendasRoutes = require('./vendas');
const receitasRoutes = require('./receitas');
const despesasRoutes = require('./despesas');
const faturamentoRoutes = require('./faturamento');
const balancoDemonstrativoRoutes = require('./balanco-demonstrativo');
const emissaoNfeRoutes = require('./emissao-nfe');
const relatoriosRoutes = require('./relatorios');
const dashboardRoutes = require('./dashboard');
const cuponsFidelidadesRoutes = require('./cupons-fidelidades');
const modulosRoutes = require('./modulos');

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
router.use('/agendamentos', agendamentosRoutes);
router.use('/fechamentos-especiais', fechamentosEspeciaisRoutes);
router.use('/produtos', produtosRoutes);
router.use('/estoque', estoqueRoutes);
router.use('/caixas', caixasRoutes);
router.use('/vendas', vendasRoutes);
router.use('/receitas', receitasRoutes);
router.use('/despesas', despesasRoutes);
router.use('/faturamento', faturamentoRoutes);
router.use('/balanco-demonstrativo', balancoDemonstrativoRoutes);
router.use('/emissao-nfe', emissaoNfeRoutes);
router.use('/relatorios', relatoriosRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/cupons-fidelidades', cuponsFidelidadesRoutes);
router.use('/modulos', modulosRoutes);

module.exports = router;

