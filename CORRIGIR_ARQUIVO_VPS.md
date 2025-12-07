# 🔧 CORREÇÃO URGENTE - Arquivo na VPS Está Incompleto

## 🔴 Problema Identificado

O arquivo `server.js` na VPS **está incompleto**!

**Na VPS, o arquivo termina assim:**
```javascript
// ... endpoint de login de cliente ...
app.post('/api/v1/auth/login', ...);

// ============================================================
// MIDDLEWARE DE ERRO
// ============================================================
```

**Falta o endpoint completo de login administrativo que deveria estar aqui:**
```javascript
/**
 * POST /api/v1/auth/admin/login
 * Login de usuário administrativo
 */
app.post('/api/v1/auth/admin/login', async (req, res) => {
  // ... código completo ...
});
```

---

## ✅ Solução - Enviar Arquivo Completo

### Passo 1: Verificar Arquivo Local

No seu computador, verifique se o arquivo local tem o endpoint:

```powershell
cd C:\Users\vivo\Barbearia_Premium
findstr /n "auth/admin/login" backend\server.js
```

**Deve mostrar:**
```
337: * POST /api/v1/auth/admin/login
340:app.post('/api/v1/auth/admin/login', async (req, res) => {
```

Se aparecer, o arquivo local está correto! ✅

---

### Passo 2: Enviar Arquivo Completo para VPS

```powershell
cd C:\Users\vivo\Barbearia_Premium
scp backend\server.js root@82.25.65.201:/home/cyberpanel/app/backend/server.js
```

**⚠️ IMPORTANTE:** Confirme se quer sobrescrever quando perguntar.

---

### Passo 3: Verificar se o Arquivo Foi Atualizado

Conecte na VPS e verifique:

```bash
ssh root@82.25.65.201
cd /home/cyberpanel/app/backend

# Verificar se o endpoint existe
grep -n "auth/admin/login" server.js
```

**Deve mostrar:**
```
337: * POST /api/v1/auth/admin/login
340:app.post('/api/v1/auth/admin/login', async (req, res) => {
```

**Se não aparecer, o arquivo não foi atualizado!**

---

### Passo 4: Verificar Tamanho do Arquivo

Compare os tamanhos:

```bash
# Na VPS
wc -l server.js

# No seu computador (PowerShell)
(Get-Content backend\server.js).Count
```

O arquivo completo deve ter **aproximadamente 423 linhas**.

---

### Passo 5: Se o Arquivo Ainda Estiver Incompleto

Você pode adicionar o endpoint manualmente na VPS. Copie este código:

```bash
# Na VPS, adicione antes do "MIDDLEWARE DE ERRO"
nano server.js
```

Adicione este código **ANTES** da linha que diz `// ============================================================` seguida de `// MIDDLEWARE DE ERRO`:

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
        tipo_usuario: admin.tipo_usuario, // master, proprietario, funcionario
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

Salve com `Ctrl+O`, `Enter`, `Ctrl+X`.

---

### Passo 6: Reiniciar PM2

Após adicionar o código:

```bash
# Parar e deletar
pm2 stop api-protese-capilar
pm2 delete api-protese-capilar

# Iniciar novamente
pm2 start server.js --name api-protese-capilar
pm2 save

# Ver logs
pm2 logs api-protese-capilar --lines 10
```

---

### Passo 7: Testar

```bash
# Testar endpoint
curl -X POST http://localhost:3001/api/v1/auth/admin/login \
  -H "Content-Type: application/json" \
  -d '{"email":"teste@teste.com","senha":"teste"}'
```

**Deve retornar 401 (Email ou senha inválidos) - isso significa que o endpoint funciona!**

---

## 📝 Resumo

1. ✅ Arquivo local está correto (tem o endpoint)
2. ❌ Arquivo na VPS está incompleto (falta o endpoint)
3. ⏳ **AÇÃO:** Enviar arquivo completo ou adicionar endpoint manualmente

---

**Envie o arquivo completo novamente ou adicione o endpoint manualmente na VPS!**

