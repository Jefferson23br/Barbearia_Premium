# 🔧 Solução Manual - Adicionar Endpoint na VPS

## 🎯 Problema

O arquivo `server.js` na VPS está **incompleto** - falta o endpoint de login administrativo.

---

## ✅ Solução Rápida - Adicionar Manualmente

### Opção 1: Editar Diretamente na VPS (Recomendado)

1. **Conecte na VPS:**
   ```bash
   ssh root@82.25.65.201
   cd /home/cyberpanel/app/backend
   ```

2. **Criar backup:**
   ```bash
   cp server.js server.js.backup
   ```

3. **Editar o arquivo:**
   ```bash
   nano server.js
   ```

4. **Encontre a linha que diz:**
   ```javascript
   // ============================================================
   // MIDDLEWARE DE ERRO
   // ============================================================
   ```

5. **Adicione ANTES dessa linha o seguinte código:**

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

6. **Salvar:** `Ctrl+O`, `Enter`, `Ctrl+X`

7. **Verificar:**
   ```bash
   grep -n "auth/admin/login" server.js
   ```

   Deve mostrar as linhas do endpoint.

8. **Reiniciar PM2:**
   ```bash
   pm2 restart api-protese-capilar
   pm2 logs api-protese-capilar --lines 10
   ```

---

### Opção 2: Enviar Arquivo Completo Novamente

Se preferir, envie o arquivo completo do seu computador:

```powershell
# No seu computador
cd C:\Users\vivo\Barbearia_Premium
scp backend\server.js root@82.25.65.201:/home/cyberpanel/app/backend/server.js
```

Depois na VPS:

```bash
cd /home/cyberpanel/app/backend
grep -n "auth/admin/login" server.js  # Verificar se tem
pm2 restart api-protese-capilar
```

---

## ✅ Verificação Final

Após adicionar, teste:

```bash
# Na VPS
curl -X POST http://localhost:3001/api/v1/auth/admin/login \
  -H "Content-Type: application/json" \
  -d '{"email":"teste@teste.com","senha":"teste"}'
```

**Deve retornar 401 (Email ou senha inválidos) - isso significa que o endpoint funciona!**

Se retornar 404, o endpoint ainda não foi adicionado corretamente.

---

**Siga a Opção 1 para adicionar manualmente o endpoint!**

