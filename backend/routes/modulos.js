const express = require('express');
const router = express.Router();
const pool = require('../config/database');

function getModulosFallback() {
  return [
    {
      id: 'mod-financeiro',
      nome: 'Financeiro',
      icone: 'Wallet',
      ordem: 1,
      itens: [
        { id: 'receitas', label: 'Receitas', path: '/dashboard/receitas', icon: 'DollarSign', ordem: 1 },
        { id: 'despesas', label: 'Despesas', path: '/dashboard/despesas', icon: 'TrendingDown', ordem: 2 },
        { id: 'faturamento', label: 'Faturamento', path: '/dashboard/faturamento', icon: 'BarChart3', ordem: 3 },
        { id: 'caixas', label: 'Caixas', path: '/dashboard/caixas', icon: 'Wallet', ordem: 4 },
      ],
    },
    {
      id: 'mod-cadastros',
      nome: 'Cadastros',
      icone: 'Users',
      ordem: 2,
      itens: [
        { id: 'usuarios', label: 'Usuarios', path: '/dashboard/usuarios', icon: 'Users', ordem: 1 },
        { id: 'funcionarios', label: 'Funcionarios', path: '/dashboard/funcionarios', icon: 'UserCog', ordem: 2 },
        { id: 'servicos', label: 'Servicos', path: '/dashboard/servicos', icon: 'Scissors', ordem: 3 },
        { id: 'produtos', label: 'Produtos', path: '/dashboard/produtos', icon: 'Package', ordem: 4 },
        { id: 'estoque', label: 'Estoque', path: '/dashboard/estoque', icon: 'Boxes', ordem: 5 },
      ],
    },
    {
      id: 'mod-controle',
      nome: 'Controle',
      icone: 'ShieldCheck',
      ordem: 3,
      itens: [
        { id: 'controle-permissoes', label: 'Controle de Permissoes', path: '/dashboard/controle-permissoes', icon: 'ShieldCheck', ordem: 1 },
        { id: 'controle-acessos', label: 'Controle de Acessos', path: '/dashboard/controle-acessos', icon: 'LogIn', ordem: 2 },
        { id: 'controle-logs', label: 'Controle de Logs', path: '/dashboard/controle-logs', icon: 'FileText', ordem: 3 },
      ],
    },
    {
      id: 'mod-fiscal',
      nome: 'Fiscal e Relatorios',
      icone: 'FileBarChart',
      ordem: 4,
      itens: [
        { id: 'emissao-nfe', label: 'Emissao NFe', path: '/dashboard/emissao-nfe', icon: 'Receipt', ordem: 1 },
        { id: 'emissao-relatorios', label: 'Emissao Relatorios', path: '/dashboard/emissao-relatorios', icon: 'FileBarChart', ordem: 2 },
        { id: 'balanco-demonstrativo', label: 'Balanco Demonstrativo', path: '/dashboard/balanco-demonstrativo', icon: 'Scale', ordem: 3 },
      ],
    },
    {
      id: 'mod-integracoes',
      nome: 'Integracoes',
      icone: 'Plug',
      ordem: 5,
      itens: [
        { id: 'integracoes-apis', label: 'Integracoes APIs', path: '/dashboard/integracoes-apis', icon: 'Plug', ordem: 1 },
        { id: 'habilitar-api', label: 'Habilitar API', path: '/dashboard/habilitar-api', icon: 'ToggleLeft', ordem: 2 },
        { id: 'servicos-integracao', label: 'Servicos Integracao', path: '/dashboard/servicos-integracao', icon: 'Wrench', ordem: 3 },
      ],
    },
    {
      id: 'mod-comercial',
      nome: 'Comercial',
      icone: 'Tags',
      ordem: 6,
      itens: [
        { id: 'assinaturas', label: 'Assinaturas', path: '/dashboard/assinaturas', icon: 'FileSignature', ordem: 1 },
        { id: 'cupons-fidelidades', label: 'Cupons e Fidelidades', path: '/dashboard/cupons-fidelidades', icon: 'Tags', ordem: 2 },
      ],
    },
  ];
}

/**
 * GET /api/v1/modulos
 * Busca todos os módulos com seus itens ordenados
 */
router.get('/', async (req, res) => {
  try {
    // Buscar módulos ativos ordenados
    const modulosResult = await pool.query(
      `SELECT id, nome, icone, ordem 
       FROM protese.modulos 
       WHERE ativo = true 
       ORDER BY ordem ASC`
    );

    // Para cada módulo, buscar seus itens
    const modulos = await Promise.all(
      modulosResult.rows.map(async (modulo) => {
        const itensResult = await pool.query(
          `SELECT item_id, item_label, item_path, item_icon, ordem
           FROM protese.modulos_itens
           WHERE modulo_id = $1 AND ativo = true
           ORDER BY ordem ASC`,
          [modulo.id]
        );

        // Garantir que não há duplicatas por item_id E por path
        // Isso garante que não haja duplicatas mesmo se houver IDs diferentes para o mesmo path
        const itensUnicosPorId = new Map();
        const itensUnicosPorPath = new Map();
        
        itensResult.rows.forEach(item => {
          // Primeiro, verificar por ID
          if (!itensUnicosPorId.has(item.item_id)) {
            itensUnicosPorId.set(item.item_id, item);
          }
          // Depois, verificar por path (caso haja IDs diferentes mas mesmo path)
          if (!itensUnicosPorPath.has(item.item_path)) {
            itensUnicosPorPath.set(item.item_path, item);
          }
        });

        return {
          id: modulo.id,
          nome: modulo.nome,
          icone: modulo.icone,
          ordem: modulo.ordem,
          // Usar o Map de paths para garantir que não há duplicatas por path
          itens: Array.from(itensUnicosPorPath.values()).map(item => ({
            id: item.item_id,
            label: item.item_label,
            path: item.item_path,
            icon: item.item_icon,
            ordem: item.ordem,
          })).sort((a, b) => a.ordem - b.ordem),
        };
      })
    );

    res.json({
      modulos,
    });
  } catch (error) {
    if (process.env.ORACLE_HOST) {
      // Se as tabelas ainda nao existirem no Oracle, manter sistema operante com fallback.
      return res.json({ modulos: getModulosFallback() });
    }
    console.error('Erro ao buscar módulos:', error);
    res.status(500).json({
      error: 'Erro ao buscar módulos',
      message: error.message,
    });
  }
});

module.exports = router;

