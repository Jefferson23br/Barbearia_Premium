# 🔧 Solução - Erro de Conexão no Login do Painel-Admin

## ❌ Problema

```
Failed to load resource: net::ERR_CONNECTION_REFUSED
:3001/api/v1/auth/admin/login:1
```

O erro mostra que a URL está incompleta (faltando o protocolo/host). Isso significa que a variável de ambiente `NEXT_PUBLIC_API_URL` não está sendo lida.

---

## ✅ Soluções

### Solução 1: Criar Arquivo .env.local (Recomendado)

Crie o arquivo `frontend/painel-admin/.env.local` com:

```env
NEXT_PUBLIC_API_URL=https://api.protesecapilarcuiaba.com.br
```

**⚠️ IMPORTANTE:** Após criar o arquivo, **reinicie o servidor Next.js**:

```bash
# Pare o servidor (Ctrl+C) e inicie novamente
cd frontend/painel-admin
npm run dev
```

---

### Solução 2: Atualizar Código com Fallback Melhor

Vou atualizar o código para ter um fallback mais robusto.

---

### Solução 3: Verificar se o Backend Está Rodando

O erro também pode indicar que o backend não está acessível. Verifique:

1. **Backend local (para desenvolvimento):**
   ```bash
   curl http://localhost:3001/health
   ```

2. **Backend produção:**
   ```bash
   curl https://api.protesecapilarcuiaba.com.br/health
   ```

---

## 🔍 Passos para Resolver

### 1. Criar .env.local

```bash
cd frontend/painel-admin
echo NEXT_PUBLIC_API_URL=https://api.protesecapilarcuiaba.com.br > .env.local
```

### 2. Reiniciar Servidor Next.js

```bash
# Pare o servidor (Ctrl+C)
# Inicie novamente
npm run dev
```

### 3. Testar Novamente

Acesse `http://localhost:3000` e tente fazer login.

---

## 📝 Arquivos que Serão Criados/Atualizados

1. ✅ `frontend/painel-admin/.env.local` - Variável de ambiente
2. ✅ `frontend/painel-admin/src/app/page.tsx` - Código com fallback melhorado

---

**Execute os passos acima e teste novamente!**

