# 📤 Guia - Enviar Arquivos para VPS

## 🎯 Objetivo

Enviar arquivos do seu computador (Windows) para a VPS Backend (82.25.65.201).

---

## 🚀 Métodos Disponíveis

### 1️⃣ SCP (Secure Copy) - Recomendado ⭐

#### Usando PowerShell (Windows 10/11)

**Enviar um arquivo único:**
```powershell
scp caminho/do/arquivo local.txt root@82.25.65.201:/home/cyberpanel/app/backend/
```

**Enviar uma pasta completa:**
```powershell
scp -r caminho/da/pasta root@82.25.65.201:/home/cyberpanel/app/backend/
```

**Exemplos práticos:**

```powershell
# Enviar script de gerar hashes
scp backend\scripts\gerar-hashes-usuarios.js root@82.25.65.201:/home/cyberpanel/app/backend/scripts/

# Enviar arquivo SQL
scp COMANDOS_INSERIR_USUARIOS_ADMIN.sql root@82.25.65.201:/home/cyberpanel/app/backend/

# Enviar todo o backend (cuidado - arquivo grande)
scp -r backend\* root@82.25.65.201:/home/cyberpanel/app/backend/
```

**⚠️ NOTA:** No PowerShell, use barras invertidas `\` para caminhos locais e barras normais `/` para caminhos remotos.

---

### 2️⃣ Usando Git (Recomendado para Código) ⭐⭐⭐

**A melhor opção para código é usar Git!**

```bash
# 1. No seu computador, commitar e fazer push
git add .
git commit -m "Adicionar script de gerar hashes"
git push

# 2. Na VPS, fazer pull
ssh root@82.25.65.201
cd /home/cyberpanel/app/backend
git pull
```

**Vantagens:**
- ✅ Versionamento
- ✅ Fácil de manter sincronizado
- ✅ Não precisa enviar arquivos manualmente

---

### 3️⃣ FileZilla (Interface Gráfica) 🖥️

**Ótimo para quem prefere interface visual!**

1. **Baixar FileZilla:**
   - Site: https://filezilla-project.org/
   - Ou: `winget install FileZilla.FileZilla`

2. **Configurar conexão:**
   - **Host:** `sftp://82.25.65.201` ou `82.25.65.201`
   - **Protocolo:** SFTP - SSH File Transfer Protocol
   - **Porta:** 22
   - **Usuário:** `root`
   - **Senha:** Sua senha SSH

3. **Arrastar e soltar arquivos!**

---

### 4️⃣ WinSCP (Outra Interface Gráfica) 🖥️

**Alternativa ao FileZilla**

1. **Baixar WinSCP:**
   - Site: https://winscp.net/
   - Ou: `winget install WinSCP.WinSCP`

2. **Configurar:**
   - **Protocolo:** SFTP
   - **Host:** `82.25.65.201`
   - **Porta:** 22
   - **Usuário:** `root`
   - **Senha:** Sua senha SSH

3. **Arrastar arquivos da esquerda (local) para direita (VPS)**

---

### 5️⃣ WSL + rsync (Avançado)

Se você tiver WSL instalado:

```bash
# No WSL
rsync -avz --progress arquivo.txt root@82.25.65.201:/home/cyberpanel/app/backend/
```

---

## 📋 Comandos Prontos para Usar

### Caso Específico: Enviar Script de Gerar Hashes

```powershell
# Navegue até a pasta do projeto
cd C:\Users\vivo\Barbearia_Premium

# Enviar o script
scp backend\scripts\gerar-hashes-usuarios.js root@82.25.65.201:/home/cyberpanel/app/backend/scripts/
```

**Se a pasta scripts não existir na VPS, crie primeiro:**
```bash
ssh root@82.25.65.201
mkdir -p /home/cyberpanel/app/backend/scripts
exit
```

---

## 🔧 Casos de Uso Comuns

### Enviar Arquivo Único

```powershell
scp arquivo.txt root@82.25.65.201:/caminho/destino/
```

### Enviar Múltiplos Arquivos

```powershell
scp arquivo1.txt arquivo2.txt arquivo3.txt root@82.25.65.201:/caminho/destino/
```

### Enviar Pasta Completa

```powershell
scp -r pasta/ root@82.25.65.201:/caminho/destino/
```

### Baixar Arquivo da VPS

```powershell
scp root@82.25.65.201:/caminho/arquivo.txt ./
```

---

## ⚠️ Dicas Importantes

### 1. Permissões

Após enviar arquivos, você pode precisar ajustar permissões:

```bash
ssh root@82.25.65.201
chmod +x /home/cyberpanel/app/backend/scripts/gerar-hashes-usuarios.js
```

### 2. Verificar se o arquivo chegou

```bash
ssh root@82.25.65.201
ls -la /home/cyberpanel/app/backend/scripts/
```

### 3. Caminhos Absolutos vs Relativos

- **Local (Windows):** `backend\scripts\arquivo.js` ou `C:\Users\vivo\Barbearia_Premium\backend\scripts\arquivo.js`
- **VPS (Linux):** `/home/cyberpanel/app/backend/scripts/arquivo.js`

---

## 🎯 Recomendações por Tipo de Arquivo

| Tipo de Arquivo | Método Recomendado |
|----------------|-------------------|
| **Código fonte** | Git (melhor opção) |
| **Scripts pequenos** | SCP |
| **Arquivos SQL** | SCP ou FileZilla |
| **Vários arquivos** | FileZilla/WinSCP |
| **Backup** | SCP ou rsync |
| **Upload inicial** | Git ou SCP -r (pasta) |

---

## 📝 Exemplo Completo: Enviar Script de Gerar Hashes

```powershell
# 1. Abrir PowerShell no projeto
cd C:\Users\vivo\Barbearia_Premium

# 2. Verificar se o arquivo existe
ls backend\scripts\gerar-hashes-usuarios.js

# 3. Criar pasta scripts na VPS (se não existir)
ssh root@82.25.65.201 "mkdir -p /home/cyberpanel/app/backend/scripts"

# 4. Enviar o arquivo
scp backend\scripts\gerar-hashes-usuarios.js root@82.25.65.201:/home/cyberpanel/app/backend/scripts/

# 5. Verificar se chegou
ssh root@82.25.65.201 "ls -la /home/cyberpanel/app/backend/scripts/"

# 6. Dar permissão de execução (se necessário)
ssh root@82.25.65.201 "chmod +x /home/cyberpanel/app/backend/scripts/gerar-hashes-usuarios.js"
```

---

## 🔐 Autenticação

**Primeira vez:**
- Será perguntado se deseja confiar no servidor (digite `yes`)
- Será solicitada a senha SSH

**Para evitar digitar senha toda vez:**
- Configure chaves SSH (mais avançado)

---

## 📚 Referências

- **SCP Manual:** `man scp` (no Linux/Mac)
- **FileZilla:** https://filezilla-project.org/
- **WinSCP:** https://winscp.net/

---

**Última atualização:** 06/12/2025

