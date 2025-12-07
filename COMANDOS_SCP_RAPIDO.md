# ⚡ Comandos SCP - Enviar Arquivos para VPS (Rápido)

## 🎯 Comando Básico

```powershell
scp caminho/do/arquivo root@82.25.65.201:/caminho/destino/
```

---

## 📤 Comandos Prontos para Usar

### 1. Enviar Script de Gerar Hashes

```powershell
cd C:\Users\vivo\Barbearia_Premium
scp backend\scripts\gerar-hashes-usuarios.js root@82.25.65.201:/home/cyberpanel/app/backend/scripts/
```

### 2. Enviar Arquivo SQL

```powershell
cd C:\Users\vivo\Barbearia_Premium
scp COMANDOS_INSERIR_USUARIOS_ADMIN.sql root@82.25.65.201:/home/cyberpanel/app/backend/
```

### 3. Enviar Todo o Backend (Cuidado - Arquivo Grande!)

```powershell
cd C:\Users\vivo\Barbearia_Premium
scp -r backend\* root@82.25.65.201:/home/cyberpanel/app/backend/
```

### 4. Enviar Arquivo Único (server.js)

```powershell
cd C:\Users\vivo\Barbearia_Premium
scp backend\server.js root@82.25.65.201:/home/cyberpanel/app/backend/
```

---

## 📥 Baixar Arquivos da VPS

```powershell
# Baixar arquivo SQL gerado
scp root@82.25.65.201:/home/cyberpanel/app/backend/COMANDOS_INSERIR_USUARIOS_ADMIN_FINAL.sql ./
```

---

## ⚠️ Dicas

1. **Primeira vez:** Digite `yes` quando perguntar sobre confiar no servidor
2. **Senha:** Será solicitada a senha SSH
3. **Verificar:** Após enviar, conecte na VPS e verifique se o arquivo chegou:
   ```bash
   ssh root@82.25.65.201
   ls -la /home/cyberpanel/app/backend/scripts/
   ```

---

## 🚀 Comando Completo: Enviar Script + Criar Pasta

```powershell
# Criar pasta se não existir
ssh root@82.25.65.201 "mkdir -p /home/cyberpanel/app/backend/scripts"

# Enviar arquivo
scp backend\scripts\gerar-hashes-usuarios.js root@82.25.65.201:/home/cyberpanel/app/backend/scripts/
```

---

**Documentação completa:** Veja `GUIA_ENVIAR_ARQUIVOS_VPS.md`

