const express = require('express');
const pool = require('../../config/databaseV2');

const router = express.Router();

router.get('/publicas', async (_req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, nome, slug, dominio_landing
       FROM filiais
       WHERE ativo = TRUE
       ORDER BY nome`
    );
    return res.json(result.rows);
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao listar filiais', message: error.message });
  }
});

router.get('/slug/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const result = await pool.query(
      `SELECT id, nome, slug, dominio_landing
       FROM filiais
       WHERE slug = $1 AND ativo = TRUE
       LIMIT 1`,
      [slug]
    );

    if (!result.rows.length) {
      return res.status(404).json({ error: 'Filial não encontrada' });
    }

    return res.json(result.rows[0]);
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao buscar filial', message: error.message });
  }
});

module.exports = router;
