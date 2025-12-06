# ⚡ Teste Rápido em Produção

## 🧪 Teste 1: Health Check (Navegador)

Acesse no navegador:
```
https://api.protesecapilarcuiaba.com.br/health
```

Deve retornar:
```json
{"status":"ok","timestamp":"...","uptime":...}
```

---

## 🧪 Teste 2: Testar Endpoint de Cadastro (Terminal VPS)

Execute na VPS:

```bash
curl -X POST https://api.protesecapilarcuiaba.com.br/api/v1/clientes \
  -H "Content-Type: application/json" \
  -d '{
    "nome_completo": "Teste Produção",
    "email": "teste.producao@email.com",
    "cpf": "11122233344",
    "rua": "Rua Teste",
    "numero": "999",
    "bairro": "Centro",
    "cidade": "Cuiabá",
    "estado": "MT",
    "cep": "78000000",
    "senha": "teste123"
  }'
```

**Resposta esperada (sucesso):**
```json
{
  "message": "Cliente cadastrado com sucesso!",
  "cliente": {
    "id": "uuid...",
    "nome_completo": "Teste Produção",
    "email": "teste.producao@email.com",
    "foto_url": null,
    "created_at": "..."
  }
}
```

---

## 🌐 Teste 3: Via Frontend

### Opção A: Se já está deployado

Acesse:
```
https://app.protesecapilarcuiaba.com.br/cadastro-cliente
```

### Opção B: Testar localmente apontando para produção

1. **O código já foi atualizado para detectar produção automaticamente!**

2. **Acesse localmente:**
   ```
   http://localhost:3000/cadastro-cliente
   ```

3. **Mas melhor ainda: criar `.env.local` para garantir:**

   Crie: `frontend/painel-cliente/.env.local`
   ```env
   NEXT_PUBLIC_API_URL=https://api.protesecapilarcuiaba.com.br
   ```

4. **Iniciar frontend:**
   ```bash
   cd frontend/painel-cliente
   npm run dev
   ```

5. **Testar o cadastro!**

---

## ⚠️ Lembrete: SQL Primeiro!

**Execute no DBeaver ANTES de testar cadastro:**

```sql
ALTER TABLE protese.usuarios_clientes ADD COLUMN IF NOT EXISTS foto_url VARCHAR(500);
ALTER TABLE protese.usuarios_administrativos ADD COLUMN IF NOT EXISTS foto_url VARCHAR(500);
```

---

## 📊 Ver Logs se Der Erro

Na VPS:
```bash
pm2 logs api-protese-capilar --lines 50
```

---

**Pronto para testar!** 🚀

