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

        return {
          id: modulo.id,
          nome: modulo.nome,
          icone: modulo.icone,
          ordem: modulo.ordem,
          itens: itensResult.rows.map(item => ({
            id: item.item_id,
            label: item.item_label,
            path: item.item_path,
            icon: item.item_icon,
            ordem: item.ordem,
          })),
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

