# 📝 Passo a Passo - Adicionar Endpoint na VPS

## 🎯 Problema

O arquivo na VPS termina no endpoint de login de cliente e **falta** o endpoint de login administrativo.

---

## ✅ Solução - Adicionar Manualmente

### Passo 1: Conectar na VPS

```bash
ssh root@82.25.65.201
cd /home/cyberpanel/app/backend
```

### Passo 2: Criar Backup

```bash
cp server.js server.js.backup
```

### Passo 3: Editar o Arquivo

```bash
nano server.js
```

### Passo 4: Encontrar o Local Correto

Procure pela linha que diz:
```javascript
// ============================================================
// MIDDLEWARE DE ERRO
// ============================================================
```

Você precisa adicionar o código **ANTES** dessa linha.

### Passo 5: Adicionar o Código

Adicione este código **EXATAMENTE ANTES** da linha `// ============================================================` seguida de `// MIDDLEWARE DE ERRO`:

```javascript
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
```

### Passo 6: Salvar

- Pressione `Ctrl+O` (salvar)
- Pressione `Enter` (confirmar)
- Pressione `Ctrl+X` (sair)

### Passo 7: Verificar

```bash
grep -n "auth/admin/login" server.js
```

**Deve mostrar:**
```
337: * POST /api/v1/auth/admin/login
340:app.post('/api/v1/auth/admin/login', async (req, res) => {
```

### Passo 8: Reiniciar PM2

```bash
pm2 restart api-protese-capilar
pm2 logs api-protese-capilar --lines 10
```

### Passo 9: Testar

```bash
curl -X POST http://localhost:3001/api/v1/auth/admin/login \
  -H "Content-Type: application/json" \
  -d '{"email":"teste@teste.com","senha":"teste"}'
```

**Deve retornar 401 (credenciais inválidas) - isso significa que funciona!**

---

## ⚠️ Dica

Se preferir, você pode copiar o arquivo completo do seu computador:

```powershell
# No seu computador
cd C:\Users\vivo\Barbearia_Premium
scp backend\server.js root@82.25.65.201:/home/cyberpanel/app/backend/server.js
```

Depois na VPS, reinicie:
```bash
pm2 restart api-protese-capilar
```

---

**Siga os passos acima para adicionar o endpoint manualmente!**

