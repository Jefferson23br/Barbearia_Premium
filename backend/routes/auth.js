const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const pool = require('../config/database');
const { registrarLog, getClientIp, getUserAgent } = require('../utils/logger');

/**
 * Função auxiliar para registrar acesso/login
 * Agrupa por usuário, tipo e data (um registro por dia por usuário)
 */
async function registrarAcesso(usuarioId, usuarioTipo) {
  if (process.env.ORACLE_HOST) {
    return;
  }
  try {
    // Usar data local do servidor (timezone do banco)
    const agora = new Date();
    // Extrair apenas a data (YYYY-MM-DD) sem considerar timezone
    const dataAcesso = agora.toISOString().split('T')[0];

    // Usar UPSERT para garantir que só existe um registro por usuário/tipo/data
    // Se já existe registro para hoje, incrementa quantidade_login
    // Se não existe, cria novo registro com quantidade_login = 1
    // A constraint UNIQUE (usuario_id, usuario_tipo, data_acesso) garante que só existe um registro por dia
    await pool.query(
      `INSERT INTO protese.controle_acessos (usuario_id, usuario_tipo, data_acesso, quantidade_login, primeiro_acesso, ultimo_acesso, created_at, updated_at)
       VALUES ($1, $2, $3, 1, $4, $4, $4, $4)
       ON CONFLICT (usuario_id, usuario_tipo, data_acesso)
       DO UPDATE SET
         quantidade_login = protese.controle_acessos.quantidade_login + 1,
         ultimo_acesso = $4,
         updated_at = $4`,
      [usuarioId, usuarioTipo, dataAcesso, agora]
    );
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

    let result;
    const normalizedEmail = email.toLowerCase().trim();

    // Modo Oracle (novo): usa tabela v2 "usuarios"
    if (process.env.ORACLE_HOST) {
      result = await pool.query(
        `SELECT id, filial_id, nome, email, senha_hash, papel, ativo
         FROM usuarios
         WHERE lower(email) = lower($1)
         LIMIT 1`,
        [normalizedEmail]
      );

      if (result.rows.length === 0) {
        return res.status(401).json({ error: 'Email ou senha inválidos' });
      }

      const user = result.rows[0];
      const senhaValida = await bcrypt.compare(senha, user.senha_hash);
      if (!senhaValida) {
        return res.status(401).json({ error: 'Email ou senha inválidos' });
      }

      if (!user.ativo) {
        return res.status(403).json({ error: 'Conta desativada' });
      }

      // Compatibilidade com frontend legado v1 (espera tipo_usuario)
      const mapTipoUsuario = {
        proprietario: 'proprietario',
        gestor: 'master',
        cliente: 'cliente',
      };

      return res.json({
        message: 'Login realizado com sucesso!',
        admin: {
          id: user.id,
          nome_completo: user.nome,
          email: user.email,
          foto_url: null,
          tipo_usuario: mapTipoUsuario[user.papel] || 'funcionario',
          is_active: !!user.ativo,
          filial_id: user.filial_id,
        },
      });
    }

    // Modo legado (PostgreSQL)
    result = await pool.query(
      `SELECT id, nome_completo, email, senha_hash, foto_url, tipo_usuario, is_active
       FROM protese.usuarios_administrativos
       WHERE email = $1`,
      [normalizedEmail]
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


