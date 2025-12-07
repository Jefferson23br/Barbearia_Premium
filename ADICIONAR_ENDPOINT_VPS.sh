#!/bin/bash
# Script para adicionar endpoint de login administrativo no server.js da VPS

cd /home/cyberpanel/app/backend

# Criar backup
cp server.js server.js.backup

# Adicionar endpoint antes do MIDDLEWARE DE ERRO
cat >> /tmp/endpoint_admin_login.js << 'EOF'
/**
 * POST /api/v1/auth/admin/login
 * Login de usuário administrativo
 */
app.post('/api/v1/auth/admin/login', async (req, res) => {
  try {
    const { email, senha } = req.body;

    // Validações
    if (!email || !senha) {
      return res.status(400).json({ error: 'Email e senha são obrigatórios' });
    }

    // Buscar usuário administrativo por email
    const result = await pool.query(
      `SELECT id, nome_completo, email, senha_hash, foto_url, is_active, tipo_usuario
       FROM protese.usuarios_administrativos
       WHERE email = $1`,
      [email.toLowerCase().trim()]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Email ou senha inválidos' });
    }

    const admin = result.rows[0];

    // Verificar se está ativo
    if (!admin.is_active) {
      return res.status(403).json({ error: 'Conta desativada. Entre em contato com o suporte.' });
    }

    // Verificar senha
    const senhaValida = await bcrypt.compare(senha, admin.senha_hash);

    if (!senhaValida) {
      return res.status(401).json({ error: 'Email ou senha inválidos' });
    }

    // Login bem-sucedido - retornar dados do admin (sem senha)
    res.json({
      message: 'Login realizado com sucesso!',
      admin: {
        id: admin.id,
        nome_completo: admin.nome_completo,
        email: admin.email,
        foto_url: admin.foto_url,
        tipo_usuario: admin.tipo_usuario,
      },
    });
  } catch (error) {
    console.error('Erro ao fazer login administrativo:', error);
    res.status(500).json({
      error: 'Erro ao fazer login',
      message: error.message,
    });
  }
});

EOF

# Encontrar a linha onde inserir (antes de MIDDLEWARE DE ERRO)
LINE_NUM=$(grep -n "MIDDLEWARE DE ERRO" server.js | cut -d: -f1)

if [ -z "$LINE_NUM" ]; then
  echo "Erro: Não encontrei 'MIDDLEWARE DE ERRO' no arquivo"
  exit 1
fi

# Inserir antes dessa linha
sed -i "${LINE_NUM}i\\n// ============================================================\n// ROTAS DE AUTENTICAÇÃO ADMINISTRATIVA\n// ============================================================" server.js
sed -i "$((LINE_NUM+3))r /tmp/endpoint_admin_login.js" server.js

echo "✅ Endpoint adicionado com sucesso!"
echo "Verifique o arquivo e depois reinicie o PM2"

