# 🧪 Teste de Cadastro de Cliente

## ✅ Backend Status

Backend rodando na VPS:
- ✅ Status: **online**
- ✅ Porta: **3001**
- ✅ Health check: Funcionando
- ✅ PostgreSQL: Conectado

---

## ⚠️ IMPORTANTE: Executar SQL Primeiro!

Antes de testar, você **DEVE** executar os comandos SQL para adicionar o campo `foto_url`:

### Via DBeaver:
1. Abrir DBeaver
2. Conectar ao banco `protese_capilar`
3. Executar os comandos do arquivo `COMANDOS_ADCIONAR_CAMPO_FOTO_URL.sql`

### Ou via psql na VPS:
```sql
ALTER TABLE protese.usuarios_clientes ADD COLUMN IF NOT EXISTS foto_url VARCHAR(500);
ALTER TABLE protese.usuarios_administrativos ADD COLUMN IF NOT EXISTS foto_url VARCHAR(500);
```

---

## 🧪 Teste 1: Health Check (Já funcionando ✅)

```bash
curl http://localhost:3001/health
```

---

## 🧪 Teste 2: Testar Conexão com Banco

```bash
curl http://localhost:3001/api/test-db
```

---

## 🧪 Teste 3: Testar Endpoint de Cadastro (Via Terminal)

### Teste sem foto:

```bash
curl -X POST http://localhost:3001/api/v1/clientes \
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

### Teste com foto (via curl - requer arquivo):

```bash
curl -X POST http://localhost:3001/api/v1/clientes \
  -F "nome_completo=Maria Teste" \
  -F "email=maria.teste@email.com" \
  -F "cpf=98765432100" \
  -F "rua=Rua Teste" \
  -F "numero=456" \
  -F "bairro=Bairro Novo" \
  -F "cidade=Cuiabá" \
  -F "estado=MT" \
  -F "cep=78000001" \
  -F "senha=senha123" \
  -F "foto=@/caminho/para/sua/foto.jpg"
```

---

## 🧪 Teste 4: Via Frontend Local

### 1. Configurar variável de ambiente no frontend:

No arquivo `frontend/painel-cliente/.env.local` (criar se não existir):

```env
NEXT_PUBLIC_API_URL=https://api.protesecapilarcuiaba.com.br
```

**Para desenvolvimento local, use:**
```env
NEXT_PUBLIC_API_URL=http://82.25.65.201:3001
```

### 2. Iniciar frontend:

```bash
cd frontend/painel-cliente
npm run dev
```

### 3. Acessar no navegador:

```
http://localhost:3000/cadastro-cliente
```

### 4. Preencher formulário e testar:

- Preencher todos os campos
- Selecionar uma foto (opcional)
- Clicar em "Salvar"
- Verificar se aparece mensagem de sucesso

---

## ✅ Resposta Esperada (Sucesso)

```json
{
  "message": "Cliente cadastrado com sucesso!",
  "cliente": {
    "id": "uuid-gerado",
    "nome_completo": "João Silva Teste",
    "email": "joao.teste@email.com",
    "foto_url": "https://api.protesecapilarcuiaba.com.br/uploads/fotos/foto-1234567890.jpg",
    "created_at": "2025-12-06T..."
  }
}
```

---

## ❌ Possíveis Erros

### Erro: "foto_url column does not exist"
**Solução:** Execute os comandos SQL primeiro!

### Erro: "Email já cadastrado" ou "CPF já cadastrado"
**Solução:** Use email/CPF diferente ou delete o registro de teste

### Erro: CORS
**Solução:** Verifique se o domínio está no `CORS_ORIGINS` do `.env`

### Erro: "Cannot connect to database"
**Solução:** Verifique as credenciais no `.env` e se PostgreSQL está rodando

---

## 🔍 Verificar Logs

```bash
pm2 logs api-protese-capilar --lines 50
```

---

## 📋 Checklist de Teste

- [ ] SQL executado (campo foto_url adicionado)
- [ ] Health check funcionando
- [ ] Teste de banco funcionando
- [ ] Variável de ambiente configurada no frontend
- [ ] Frontend iniciado
- [ ] Formulário acessível
- [ ] Cadastro funcionando
- [ ] Foto sendo enviada (se testada)
- [ ] URL da foto sendo gerada
- [ ] Dados salvos no banco

---

**Pronto para testar!** 🚀

