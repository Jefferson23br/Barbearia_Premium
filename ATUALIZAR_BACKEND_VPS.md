# 🚀 Atualizar Backend na VPS - Login Admin

## ⚡ Solução Rápida

O endpoint de login administrativo existe no código local, mas precisa ser atualizado na VPS.

---

## 📤 Passo 1: Enviar Arquivo para VPS

Execute no PowerShell:

```powershell
cd C:\Users\vivo\Barbearia_Premium
scp backend\server.js root@82.25.65.201:/home/cyberpanel/app/backend/
```

Você será solicitado a digitar a senha SSH.

---

## 🔄 Passo 2: Reiniciar o Backend na VPS

Conecte-se na VPS:

```bash
ssh root@82.25.65.201
```

Depois execute:

```bash
cd /home/cyberpanel/app/backend
pm2 restart api-protese-capilar
```

Se não souber o nome do processo, liste todos:

```bash
pm2 list
```

---

## ✅ Passo 3: Verificar se Funcionou

```bash
# Ver logs do PM2
pm2 logs api-protese-capilar --lines 20

# Ou verificar status
pm2 status
```

Você deve ver que o processo foi reiniciado.

---

## 🧪 Passo 4: Testar

Após atualizar, teste o login novamente:

1. Acesse `http://localhost:3000` (painel-admin)
2. Tente fazer login
3. Deve funcionar agora! ✅

---

## 📝 Comandos Completos (Copy & Paste)

### No PowerShell (seu computador):

```powershell
cd C:\Users\vivo\Barbearia_Premium
scp backend\server.js root@82.25.65.201:/home/cyberpanel/app/backend/
```

### No SSH (VPS):

```bash
ssh root@82.25.65.201
cd /home/cyberpanel/app/backend
pm2 restart api-protese-capilar
pm2 logs api-protese-capilar --lines 10
```

---

## ⚠️ Importante

- O código local já tem o endpoint correto ✅
- A VPS precisa ser atualizada ⏳
- Após atualizar, o login deve funcionar! 🚀

---

**Execute os comandos acima e teste novamente!**

