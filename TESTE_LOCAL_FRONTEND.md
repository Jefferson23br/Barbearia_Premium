# 🧪 Como Testar Frontend Localmente

## 📋 Opções de Teste Local

Você pode testar o frontend localmente de duas formas:
1. **Apontando para API de produção** (mais fácil)
2. **Com API local** (se tiver backend rodando localmente)

---

## 🌐 Opção 1: Testar com API de Produção (Recomendado)

### Passo 1: Criar arquivo de variáveis de ambiente

Crie o arquivo: `frontend/painel-cliente/.env.local`

**Conteúdo:**
```env
NEXT_PUBLIC_API_URL=https://api.protesecapilarcuiaba.com.br
```

### Passo 2: Instalar dependências (se ainda não instalou)

```bash
cd frontend/painel-cliente
npm install
```

### Passo 3: Iniciar servidor de desenvolvimento

```bash
npm run dev
```

### Passo 4: Acessar no navegador

```
http://localhost:3000/cadastro-cliente
```

Ou vá direto para:
```
http://localhost:3000
```

E depois clique em "Cadastre-se" na página de login.

### Passo 5: Testar o cadastro

1. Preencher o formulário
2. Selecionar uma foto (opcional)
3. Clicar em "Salvar"
4. Verificar se aparece mensagem de sucesso

---

## 💻 Opção 2: Testar com API Local

Se você tiver o backend rodando localmente na porta 3001:

### Passo 1: Criar arquivo `.env.local`

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### Passo 2: Certificar que o backend local está rodando

```bash
# Em outro terminal, iniciar o backend
cd backend
npm install
npm run dev
# ou
node server.js
```

### Passo 3: Iniciar frontend

```bash
cd frontend/painel-cliente
npm run dev
```

### Passo 4: Acessar e testar

```
http://localhost:3000/cadastro-cliente
```

---

## 🔧 Solução de Problemas

### Erro: "Cannot find module"

```bash
cd frontend/painel-cliente
rm -rf node_modules package-lock.json
npm install
```

### Erro: "Port 3000 already in use"

```bash
# Windows PowerShell
netstat -ano | findstr :3000
# Encontrar o PID e matar o processo
taskkill /PID <PID> /F

# Ou usar outra porta
npm run dev -- -p 3002
```

### Erro de CORS

Se der erro de CORS, verifique:
1. A URL da API está correta no `.env.local`
2. O backend permite a origem `http://localhost:3000` no CORS

### Frontend não atualiza após mudanças

- Parar o servidor (Ctrl+C)
- Limpar cache: `rm -rf .next`
- Iniciar novamente: `npm run dev`

---

## 📁 Estrutura de Arquivos

```
frontend/painel-cliente/
├── .env.local          ← Criar este arquivo
├── package.json
├── src/
│   └── app/
│       └── cadastro-cliente/
│           └── page.tsx
└── ...
```

---

## ✅ Checklist

- [ ] Arquivo `.env.local` criado
- [ ] Dependências instaladas (`npm install`)
- [ ] Servidor iniciado (`npm run dev`)
- [ ] Página acessível (`http://localhost:3000/cadastro-cliente`)
- [ ] Formulário aparece
- [ ] Campos funcionando
- [ ] Upload de foto funcionando
- [ ] Cadastro enviando para API

---

## 🎯 Comandos Rápidos (PowerShell)

```powershell
# Navegar para o diretório
cd frontend\painel-cliente

# Criar arquivo .env.local
echo "NEXT_PUBLIC_API_URL=https://api.protesecapilarcuiaba.com.br" > .env.local

# Instalar dependências (se necessário)
npm install

# Iniciar servidor
npm run dev
```

---

## 🧪 Teste Rápido

1. Abrir navegador: `http://localhost:3000/cadastro-cliente`
2. Preencher formulário com dados de teste
3. Clicar em "Salvar"
4. Verificar console do navegador (F12) para ver a requisição
5. Verificar resposta da API

---

**Pronto para testar!** 🚀

