const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const pool = require('../config/database');
const { registrarLog, getClientIp, getUserAgent } = require('../utils/logger');

/**
 * Função auxiliar para registrar acesso/login
 */
async function registrarAcesso(usuarioId, usuarioTipo) {
  try {
    const dataAcesso = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const agora = new Date();

    // Verificar se já existe registro para hoje
    const existe = await pool.query(
      `SELECT id, quantidade_login FROM protese.controle_acessos
       WHERE usuario_id = $1 AND usuario_tipo = $2 AND data_acesso = $3`,
      [usuarioId, usuarioTipo, dataAcesso]
    );

    if (existe.rows.length > 0) {
      // Atualizar quantidade de login
      await pool.query(
        `UPDATE protese.controle_acessos
         SET quantidade_login = quantidade_login + 1,
             ultimo_acesso = $1,
             updated_at = $1
         WHERE id = $2`,
        [agora, existe.rows[0].id]
      );
    } else {
      // Criar novo registro
      await pool.query(
        `INSERT INTO protese.controle_acessos (usuario_id, usuario_tipo, data_acesso, quantidade_login, primeiro_acesso, ultimo_acesso)
         VALUES ($1, $2, $3, 1, $4, $4)`,
        [usuarioId, usuarioTipo, dataAcesso, agora]
      );
    }
  } catch (error) {
    console.error('Erro ao registrar acesso:', error);
    // Não falhar o login se der erro ao registrar acesso
  }
}

/**
 * POST /api/v1/auth/login
 * Login de cliente
 */
router.post('/login', async (req, res) => {
  try {
    const { email, senha } = req.body;

    // Validações
    if (!email || !senha) {
      return res.status(400).json({ error: 'Email e senha são obrigatórios' });
    }

    // Buscar cliente por email
    const result = await pool.query(
      `SELECT id, nome_completo, email, senha_hash, foto_url, is_active
       FROM protese.usuarios_clientes
       WHERE email = $1`,
      [email.toLowerCase().trim()]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Email ou senha inválidos' });
    }

    const cliente = result.rows[0];

    if (!cliente.is_active) {
      return res.status(403).json({ error: 'Conta desativada' });
    }

    // Verificar senha
    const senhaValida = await bcrypt.compare(senha, cliente.senha_hash);
    if (!senhaValida) {
      return res.status(401).json({ error: 'Email ou senha inválidos' });
    }

    // Registrar acesso
    await registrarAcesso(cliente.id, 'cliente');

    // Não retornar senha_hash
    const { senha_hash, ...clienteSemSenha } = cliente;

    res.json({
      message: 'Login realizado com sucesso!',
      cliente: clienteSemSenha,
    });
  } catch (error) {
    console.error('Erro ao fazer login:', error);
    res.status(500).json({
      error: 'Erro ao fazer login',
      message: error.message,
    });
  }
});

/**
 * POST /api/v1/auth/admin/login
 * Login de administrador (Master, Proprietário, Funcionário)
 */
router.post('/admin/login', async (req, res) => {
  try {
    const { email, senha } = req.body;

    // Validações
    if (!email || !senha) {
      return res.status(400).json({ error: 'Email e senha são obrigatórios' });
    }

    // Buscar admin por email
    const result = await pool.query(
      `SELECT id, nome_completo, email, senha_hash, foto_url, tipo_usuario, is_active
       FROM protese.usuarios_administrativos
       WHERE email = $1`,
      [email.toLowerCase().trim()]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Email ou senha inválidos' });
    }

    const admin = result.rows[0];

    if (!admin.is_active) {
      return res.status(403).json({ error: 'Conta desativada' });
    }

    // Verificar senha
    const senhaValida = await bcrypt.compare(senha, admin.senha_hash);
    if (!senhaValida) {
      return res.status(401).json({ error: 'Email ou senha inválidos' });
    }

    // Registrar acesso
    await registrarAcesso(admin.id, 'administrativo');

    // Não retornar senha_hash
    const { senha_hash, ...adminSemSenha } = admin;

    res.json({
      message: 'Login realizado com sucesso!',
      admin: adminSemSenha,
    });
  } catch (error) {
    console.error('Erro ao fazer login:', error);
    res.status(500).json({
      error: 'Erro ao fazer login',
      message: error.message,
    });
  }
});

module.exports = router;

