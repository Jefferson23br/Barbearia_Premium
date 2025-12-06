# 🧪 Teste de Cadastro em Produção

## ✅ API em Produção

Backend rodando e acessível em:
- **URL:** `https://api.protesecapilarcuiaba.com.br`
- **Status:** ✅ Online

---

## 🧪 Teste 1: Health Check (Produção)

Execute na VPS ou no seu PowerShell:

```bash
curl https://api.protesecapilarcuiaba.com.br/health
```

**Ou acesse no navegador:**
```
https://api.protesecapilarcuiaba.com.br/health
```

---

## 🧪 Teste 2: Testar Endpoint de Cadastro (Produção)

### Via Terminal (na VPS):

```bash
curl -X POST https://api.protesecapilarcuiaba.com.br/api/v1/clientes \
  -H "Content-Type: application/json" \
  -d '{
    "nome_completo": "João Silva Teste",
    "email": "joao.teste@email.com",
    "cpf": "12345678901",
    "rua": "Rua das Flores",
    "numero": "123",
    "bairro": "Centro",
    "cidade": "Cuiabá",
    "estado": "MT",
    "cep": "78000000",
    "senha": "senha123"
  }'
```

---

## 🌐 Teste 3: Via Frontend em Produção

### Opção A: Se o frontend já está deployado

1. **Acessar:**
   ```
   https://app.protesecapilarcuiaba.com.br/cadastro-cliente
   ```

2. **O frontend já deve estar configurado para usar a API de produção**

3. **Preencher formulário e testar!**

### Opção B: Testar localmente apontando para produção

1. **Criar arquivo `.env.local` no frontend:**

   `frontend/painel-cliente/.env.local`:
   ```env
   NEXT_PUBLIC_API_URL=https://api.protesecapilarcuiaba.com.br
   ```

2. **Iniciar frontend:**
   ```bash
   cd frontend/painel-cliente
   npm run dev
   ```

3. **Acessar:**
   ```
   http://localhost:3000/cadastro-cliente
   ```

4. **O frontend vai chamar a API de produção!**

---

## ✅ Verificar se o Frontend Está Configurado

Verifique se o frontend já está apontando para produção. O código já tem:

```typescript
const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
```

Se não tiver variável de ambiente, vai usar `localhost:3001` (errado para produção).

**Para produção, configure:**
- **Variável de ambiente:** `NEXT_PUBLIC_API_URL=https://api.protesecapilarcuiaba.com.br`
- **Ou ajuste o código** para usar produção por padrão quando `NODE_ENV === 'production'`

---

## 🔍 Teste Rápido via Navegador

### 1. Testar Health Check:
```
https://api.protesecapilarcuiaba.com.br/health
```

### 2. Testar Conexão Banco:
```
https://api.protesecapilarcuiaba.com.br/api/test-db
```

---

## 📋 Checklist

- [ ] SQL executado (campo `foto_url` adicionado)
- [ ] Health check funcionando em produção
- [ ] Frontend acessível (se deployado)
- [ ] Frontend configurado para usar API de produção
- [ ] Teste de cadastro funcionando

---

## 🚨 Importante: SQL Primeiro!

**Antes de testar cadastro, execute no DBeaver:**

```sql
ALTER TABLE protese.usuarios_clientes ADD COLUMN IF NOT EXISTS foto_url VARCHAR(500);
ALTER TABLE protese.usuarios_administrativos ADD COLUMN IF NOT EXISTS foto_url VARCHAR(500);
```

Sem isso, o cadastro vai dar erro ao tentar salvar a URL da foto!

---

**Vamos testar em produção agora!** 🚀

