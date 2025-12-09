# 📋 Instruções de Deploy - Controle de Acessos

## ✅ Alterações Realizadas

### 1. **Backend - Correção da Lógica de Acessos**
- ✅ Corrigida a função `registrarAcesso()` em `backend/routes/auth.js`
- ✅ Implementado UPSERT para garantir agrupamento correto por data
- ✅ Adicionado total de usuários cadastrados no endpoint de estatísticas

### 2. **Backend - Endpoint de Estatísticas**
- ✅ Adicionado `total_usuarios_cadastrados` no endpoint `/api/v1/controle-acessos/estatisticas`
- ✅ Adicionado `total_clientes_cadastrados` e `total_administrativos_cadastrados`

### 3. **Frontend - Melhorias Visuais e Responsividade**
- ✅ Página totalmente responsiva (mobile, tablet, desktop)
- ✅ Adicionado card "Total de Usuários Cadastrados"
- ✅ Cards com gradientes e design moderno
- ✅ Tabela adaptativa (cards em mobile, tabela em desktop)
- ✅ Corrigido filtro de funcionário responsável

---

## 📤 Arquivos para Enviar ao Backend (VPS)

### Arquivos Modificados:
1. **`backend/routes/auth.js`** - Lógica de registro de acessos corrigida
2. **`backend/routes/controle-acessos.js`** - Endpoint de estatísticas atualizado

### Comandos para Enviar:

```bash
# Opção 1: Usar o script automático
./SCRIPT_COPIAR_ARQUIVOS_VPS.sh

# Opção 2: Enviar manualmente
scp backend/routes/auth.js root@82.25.65.201:/home/cyberpanel/app/backend/routes/
scp backend/routes/controle-acessos.js root@82.25.65.201:/home/cyberpanel/app/backend/routes/
```

### Após Enviar os Arquivos, na VPS:

```bash
# 1. Conectar na VPS
ssh root@82.25.65.201

# 2. Ir para o diretório do backend
cd /home/cyberpanel/app/backend

# 3. Verificar sintaxe dos arquivos
node -c routes/auth.js
node -c routes/controle-acessos.js

# 4. Reiniciar o PM2
pm2 restart api-protese-capilar

# 5. Verificar se está rodando
pm2 status

# 6. Ver logs (opcional)
pm2 logs api-protese-capilar --lines 50
```

---

## 📤 Arquivos para Enviar ao Frontend (VPS)

### Arquivo Modificado:
1. **`frontend/painel-admin/src/app/dashboard/controle-acessos/page.tsx`** - Página completamente reformulada

### Comandos para Enviar:

```bash
# 1. Fazer build do frontend localmente
cd frontend/painel-admin
npm run build

# 2. Enviar a pasta 'out' para a VPS
scp -r out/* root@82.25.65.201:/home/cyberpanel/app/frontend-admin/

# OU usar o script de deploy se existir
./deploy.sh
```

### Após Enviar os Arquivos, na VPS:

```bash
# 1. Conectar na VPS
ssh root@82.25.65.201

# 2. Ir para o diretório do frontend admin
cd /home/cyberpanel/app/frontend-admin

# 3. Reiniciar o PM2 do frontend
pm2 restart painel-admin

# 4. Verificar se está rodando
pm2 status
```

---

## 🔍 Verificação Pós-Deploy

### 1. Testar o Backend:
```bash
# Testar endpoint de estatísticas
curl https://api.protesecapilarcuiaba.com.br/api/v1/controle-acessos/estatisticas

# Deve retornar JSON com:
# - total_usuarios_cadastrados
# - total_clientes_cadastrados
# - total_administrativos_cadastrados
```

### 2. Testar o Frontend:
1. Acessar: `https://admin.protesecapilarcuiaba.com.br/dashboard/controle-acessos`
2. Verificar se:
   - ✅ Card "Total Cadastrados" aparece
   - ✅ Página está responsiva (testar em mobile)
   - ✅ Tabela funciona corretamente
   - ✅ Filtros funcionam

---

## 📝 Resumo Rápido

### Backend:
- ✅ 2 arquivos modificados
- ✅ Reiniciar PM2 após enviar

### Frontend:
- ✅ 1 arquivo modificado
- ✅ Fazer build antes de enviar
- ✅ Reiniciar PM2 após enviar

---

## ⚠️ Importante

1. **Sempre faça backup antes de enviar:**
   ```bash
   # Na VPS, antes de substituir arquivos:
   cp routes/auth.js routes/auth.js.backup
   cp routes/controle-acessos.js routes/controle-acessos.js.backup
   ```

2. **Teste em ambiente de desenvolvimento primeiro** (se tiver)

3. **Monitore os logs após o deploy:**
   ```bash
   pm2 logs api-protese-capilar --lines 100
   ```

---

## 🆘 Em Caso de Problemas

1. **Verificar logs do PM2:**
   ```bash
   pm2 logs api-protese-capilar
   ```

2. **Reverter alterações (se necessário):**
   ```bash
   # Na VPS
   cd /home/cyberpanel/app/backend/routes
   cp auth.js.backup auth.js
   cp controle-acessos.js.backup controle-acessos.js
   pm2 restart api-protese-capilar
   ```

3. **Verificar sintaxe:**
   ```bash
   node -c routes/auth.js
   node -c routes/controle-acessos.js
   ```

---

**Data da Alteração:** $(date)  
**Versão:** 1.0


