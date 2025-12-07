# 🔧 Solução - Erro 404 no Login Admin

## 🔴 Problema

```
Cannot POST /api/v1/auth/admin/login
```

O endpoint existe no código local, mas **não está no servidor da VPS em produção**.

---

## ✅ Solução

O backend na VPS precisa ser atualizado com o novo endpoint de login administrativo.

### Opção 1: Atualizar Backend na VPS (Recomendado)

Você precisa enviar o arquivo `backend/server.js` atualizado para a VPS.

#### Passo 1: Enviar arquivo atualizado para VPS

```powershell
cd C:\Users\vivo\Barbearia_Premium
scp backend\server.js root@82.25.65.201:/home/cyberpanel/app/backend/
```

#### Passo 2: Reiniciar o backend na VPS

Conecte-se na VPS:

```bash
ssh root@82.25.65.201
cd /home/cyberpanel/app/backend
pm2 restart api-protese-capilar
```

Ou se o processo tiver outro nome:

```bash
pm2 list
pm2 restart <nome-do-processo>
```

#### Passo 3: Verificar se está funcionando

```bash
# Na VPS, verificar logs
pm2 logs api-protese-capilar --lines 20
```

---

### Opção 2: Usar Git (Melhor para futuro)

Se você estiver usando Git:

```bash
# No seu computador
git add backend/server.js
git commit -m "Adicionar endpoint de login administrativo"
git push

# Na VPS
ssh root@82.25.65.201
cd /home/cyberpanel/app/backend
git pull
pm2 restart api-protese-capilar
```

---

## 📋 Verificação

Após atualizar, teste se o endpoint existe:

```bash
# Na VPS
curl -X POST https://api.protesecapilarcuiaba.com.br/api/v1/auth/admin/login \
  -H "Content-Type: application/json" \
  -d '{"email":"teste@teste.com","senha":"teste"}'
```

Se retornar erro de credenciais (401), o endpoint está funcionando!  
Se retornar 404, o arquivo não foi atualizado corretamente.

---

## 🚀 Passo a Passo Rápido

1. **Enviar arquivo:**
   ```powershell
   scp backend\server.js root@82.25.65.201:/home/cyberpanel/app/backend/
   ```

2. **Conectar na VPS e reiniciar:**
   ```bash
   ssh root@82.25.65.201
   cd /home/cyberpanel/app/backend
   pm2 restart api-protese-capilar
   ```

3. **Verificar:**
   ```bash
   pm2 logs api-protese-capilar --lines 10
   ```

4. **Testar no navegador:**
   - Acesse o painel-admin
   - Tente fazer login novamente

---

## ⚠️ Importante

- O código local já tem o endpoint correto (linha 340 do `backend/server.js`)
- O problema é que a VPS não tem essa atualização
- Após atualizar, o login deve funcionar!

---

**Atualize o backend na VPS e teste novamente! 🚀**

