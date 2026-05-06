const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../../config/databaseV2');

const router = express.Router();

router.post('/login', async (req, res) => {
  try {
    const { email, senha } = req.body;
    if (!email || !senha) {
      return res.status(400).json({ error: 'Email e senha são obrigatórios' });
    }

    const query = `
      SELECT id, filial_id, nome, email, senha_hash, papel, ativo
      FROM usuarios
      WHERE lower(email) = lower($1)
      LIMIT 1
    `;
    const result = await pool.query(query, [email.trim()]);

    if (!result.rows.length) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const user = result.rows[0];
    if (!user.ativo) {
      return res.status(403).json({ error: 'Usuário desativado' });
    }

    const senhaValida = await bcrypt.compare(senha, user.senha_hash);
    if (!senhaValida) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const token = jwt.sign(
      {
        sub: user.id,
        filial_id: user.filial_id,
        papel: user.papel,
        email: user.email,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '12h' }
    );

    return res.json({
      token,
      user: {
        id: user.id,
        filial_id: user.filial_id,
        nome: user.nome,
        email: user.email,
        papel: user.papel,
      },
    });
  } catch (error) {
    return res.status(500).json({ error: 'Erro no login', message: error.message });
  }
});

module.exports = router;
