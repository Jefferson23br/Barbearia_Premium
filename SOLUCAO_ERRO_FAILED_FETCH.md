# 🔧 Solução: Erro "Failed to fetch" no Teste Local

## ❌ Problema

Erro "Failed to fetch" ao tentar cadastrar cliente localmente.

## 🔍 Possíveis Causas

1. **CORS não permitindo `localhost:3000`**
2. **Variável de ambiente não sendo lida**
3. **Next.js não reiniciado após criar `.env.local`**
4. **API não está rodando ou inacessível**

---

## ✅ Soluções

### Solução 1: Reiniciar o Next.js (MAIS PROVÁVEL)

O Next.js precisa ser **reiniciado** após criar/modificar `.env.local`:

1. **Parar o servidor** (Ctrl+C no terminal)
2. **Reiniciar:**
   ```powershell
   cd frontend\painel-cliente
   npm run dev
   ```

### Solução 2: Verificar se `.env.local` existe

```powershell
cd frontend\painel-cliente
Get-Content .env.local
```

Deve mostrar:
```
NEXT_PUBLIC_API_URL=https://api.protesecapilarcuiaba.com.br
```

### Solução 3: Atualizar CORS no Backend (na VPS)

O backend já permite `localhost:3000`, mas vamos garantir que está configurado.

**Na VPS, editar `.env`:**
```bash
nano /home/cyberpanel/app/backend/.env
```

**Verificar/adicionar:**
```env
CORS_ORIGINS=https://www.protesecapilarcuiaba.com.br,https://app.protesecapilarcuiaba.com.br,https://admin.protesecapilarcuiaba.com.br,http://localhost:3000
```

**Reiniciar backend:**
```bash
pm2 restart api-protese-capilar
```

### Solução 4: Verificar Console do Navegador

1. Abrir DevTools (F12)
2. Ir na aba **Console**
3. Tentar cadastrar novamente
4. Ver a mensagem de erro completa
5. Ir na aba **Network** e verificar a requisição

### Solução 5: Testar URL da API Diretamente

No navegador, acesse:
```
https://api.protesecapilarcuiaba.com.br/health
```

Deve retornar JSON com status "ok".

---

## 🧪 Teste Passo a Passo

### 1. Verificar Variável de Ambiente

No código, adicionei um `console.log` que vai mostrar para onde está enviando.

**Abra o Console do navegador (F12)** e veja a mensagem:
```
🌐 Enviando para: https://api.protesecapilarcuiaba.com.br/api/v1/clientes
```

### 2. Verificar Requisição na Aba Network

1. Abrir DevTools (F12)
2. Aba **Network**
3. Tentar cadastrar
4. Verificar a requisição que falhou
5. Clicar nela e ver:
   - **Status Code** (deve ser 200 ou erro específico)
   - **Headers** (verificar se está indo para a URL correta)
   - **Response** (ver mensagem de erro do servidor)

### 3. Testar Diretamente via curl

No PowerShell:
```powershell
curl -X POST https://api.protesecapilarcuiaba.com.br/api/v1/clientes `
  -H "Content-Type: application/json" `
  -d '{\"nome_completo\":\"Teste\",\"email\":\"teste2@email.com\",\"cpf\":\"12345678902\",\"rua\":\"Rua Teste\",\"numero\":\"123\",\"bairro\":\"Centro\",\"cidade\":\"Cuiabá\",\"estado\":\"MT\",\"cep\":\"78000000\",\"senha\":\"senha123\"}'
```

---

## 🔍 Diagnóstico Rápido

### Checklist:

- [ ] Next.js foi reiniciado após criar `.env.local`?
- [ ] `.env.local` existe e tem o conteúdo correto?
- [ ] Console do navegador mostra a URL correta?
- [ ] Health check da API funciona no navegador?
- [ ] CORS no backend inclui `http://localhost:3000`?

---

## 💡 Solução Mais Rápida

**Execute na ordem:**

1. **Parar Next.js** (Ctrl+C)
2. **Reiniciar:**
   ```powershell
   cd frontend\painel-cliente
   npm run dev
   ```
3. **Abrir navegador** em modo anônimo (Ctrl+Shift+N)
4. **Acessar:** `http://localhost:3000/cadastro-cliente`
5. **Abrir DevTools (F12)** e ver Console
6. **Tentar cadastrar** e verificar mensagens

---

**Execute os passos e me diga o que aparece no Console!** 🔍

