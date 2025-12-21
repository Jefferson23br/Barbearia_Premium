const express = require('express');
const router = express.Router();
const pool = require('../config/database');

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
    console.error('Erro ao buscar módulos:', error);
    res.status(500).json({
      error: 'Erro ao buscar módulos',
      message: error.message,
    });
  }
});

module.exports = router;

