const express = require('express');
const bcrypt = require('bcrypt');
const { randomUUID } = require('crypto');
const pool = require('../../config/databaseV2');
const authV2 = require('../../middlewares/authV2');
const requireFilialScope = require('../../middlewares/filialScope');

const router = express.Router();

router.post('/publico/cadastro/:slugFilial', async (req, res) => {
  try {
    const { slugFilial } = req.params;
    const { nome, email, senha, telefone } = req.body;

    if (!nome || !email || !senha) {
      return res.status(400).json({ error: 'Nome, email e senha são obrigatórios' });
    }

    const filialResult = await pool.query(
      `SELECT id FROM filiais WHERE slug = $1 AND ativo = TRUE LIMIT 1`,
      [slugFilial]
    );
    if (!filialResult.rows.length) {
      return res.status(404).json({ error: 'Filial inválida para cadastro' });
    }

    const filialId = filialResult.rows[0].id;
    const senhaHash = await bcrypt.hash(senha, 10);

    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const usuarioId = randomUUID();

      await client.query(
        `INSERT INTO usuarios (id, filial_id, nome, email, senha_hash, papel)
         VALUES ($1, $2, $3, $4, $5, 'cliente')`,
        [usuarioId, filialId, nome.trim(), email.trim().toLowerCase(), senhaHash]
      );

      const usuarioResult = await client.query(
        `SELECT id, filial_id, nome, email, papel
         FROM usuarios
         WHERE id = $1
         LIMIT 1`,
        [usuarioId]
      );
      const usuario = usuarioResult.rows[0];

      await client.query(
        `INSERT INTO clientes (filial_id, usuario_id, telefone)
         VALUES ($1, $2, $3)`,
        [filialId, usuario.id, telefone || null]
      );

      await client.query('COMMIT');
      return res.status(201).json({
        message: 'Cadastro realizado com sucesso na filial',
        cliente: usuario,
      });
    } catch (error) {
      await client.query('ROLLBACK');
      if (error.code === '23505' || error.errorNum === 1) {
        return res.status(409).json({ error: 'Email já cadastrado nesta filial' });
      }
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao cadastrar cliente', message: error.message });
  }
});

router.get('/', authV2, requireFilialScope, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT u.id, u.nome, u.email, c.telefone, u.created_at
       FROM usuarios u
       INNER JOIN clientes c ON c.usuario_id = u.id
       WHERE u.filial_id = $1
       ORDER BY u.created_at DESC`,
      [req.filialId]
    );
    return res.json(result.rows);
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao listar clientes', message: error.message });
  }
});

module.exports = router;
