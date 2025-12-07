# 📝 Resumo - Backend e Endpoints de Cadastro

**Data:** 05/12/2025

---

## ✅ O Que Foi Criado

### 1. **Comandos SQL para Adicionar Campo `foto_url`**

**Arquivo:** `COMANDOS_ADCIONAR_CAMPO_FOTO_URL.sql`

- ✅ Campo `foto_url VARCHAR(500)` adicionado em `usuarios_clientes`
- ✅ Campo `foto_url VARCHAR(500)` adicionado em `usuarios_administrativos`
- ✅ Índices criados para otimizar buscas
- ✅ Comentários de documentação adicionados

**Execute no PostgreSQL via DBeaver ou psql!**

---

### 2. **Backend Completo (server.js)**

**Arquivo:** `backend/server.js`

#### Funcionalidades Implementadas:

##### ✅ Upload de Imagens
- **Multer** configurado para upload de arquivos
- Validação de tipo (apenas imagens)
- Limite de tamanho: 5MB
- Nome único para cada arquivo (timestamp + random)
- Armazenamento em: `/backend/uploads/fotos/`

##### ✅ Endpoint POST `/api/v1/clientes`
- Recebe dados do formulário via `FormData`
- Processa upload de foto
- Valida todos os campos
- Verifica duplicatas (email e CPF)
- Hash de senha com bcrypt
- Salva URL da foto no banco
- Retorna dados do cliente criado

##### ✅ Endpoint GET `/api/v1/clientes/:id`
- Busca cliente por ID
- Retorna dados (sem senha)
- Inclui `foto_url` se existir

##### ✅ Middleware de Arquivos Estáticos
- Servir imagens via `/uploads/fotos/nome-arquivo.jpg`
- URLs geradas: `https://api.protesecapilarcuiaba.com.br/uploads/fotos/...`

---

### 3. **Frontend Atualizado**

**Arquivo:** `frontend/painel-cliente/src/app/cadastro-cliente/page.tsx`

#### Mudanças:
- ✅ Envio via `FormData` (não mais Base64)
- ✅ Integração com endpoint `/api/v1/clientes`
- ✅ Tratamento de erros
- ✅ Feedback ao usuário
- ✅ Limpeza do formulário após sucesso
- ✅ Redirecionamento para login após cadastro

---

## 🔧 Configuração Necessária

### Variáveis de Ambiente (`.env`)

```env
PORT=3001
NODE_ENV=production

DB_HOST=localhost
DB_PORT=5432
DB_NAME=protese_capilar
DB_USER=protese_user
DB_PASSWORD=AppProtese@2025!

API_BASE_URL=https://api.protesecapilarcuiaba.com.br

CORS_ORIGINS=https://www.protesecapilarcuiaba.com.br,https://app.protesecapilarcuiaba.com.br,https://admin.protesecapilarcuiaba.com.br
```

---

## 📦 Dependências Necessárias

```json
{
  "bcrypt": "^5.1.1",
  "cors": "^2.8.5",
  "dotenv": "^16.4.5",
  "express": "^4.21.1",
  "multer": "^1.4.5-lts.1",
  "pg": "^8.13.1"
}
```

**Instalar com:**
```bash
cd backend
npm install
```

---

## 🗄️ Estrutura de Dados

### Tabela `usuarios_clientes`

```sql
foto_url VARCHAR(500)  -- URL da foto: https://api.../uploads/fotos/foto-1234567890.jpg
```

### Formato da URL

**Desenvolvimento:**
```
http://localhost:3001/uploads/fotos/foto-1234567890.jpg
```

**Produção:**
```
https://api.protesecapilarcuiaba.com.br/uploads/fotos/foto-1234567890.jpg
```

---

## 🔄 Fluxo de Upload

1. **Frontend** envia `FormData` com campos + arquivo `foto`
2. **Backend** recebe via `multer.single('foto')`
3. **Multer** salva arquivo em `/backend/uploads/fotos/nome-único.jpg`
4. **Backend** gera URL: `${API_BASE_URL}/uploads/fotos/nome-único.jpg`
5. **Backend** salva URL no PostgreSQL (`foto_url`)
6. **Frontend** pode buscar a URL do banco e exibir: `<img src={cliente.foto_url} />`

---

## 📡 Endpoints Disponíveis

### POST `/api/v1/clientes`

**Request (FormData):**
```
nome_completo: string (obrigatório)
email: string (obrigatório, único)
cpf: string (obrigatório, único, sem formatação)
rg: string (opcional)
rua: string (obrigatório)
numero: string (obrigatório)
complemento: string (opcional)
bairro: string (obrigatório)
cidade: string (obrigatório)
estado: string (obrigatório, 2 letras)
cep: string (obrigatório, sem formatação)
senha: string (obrigatório, mínimo 6 caracteres)
foto: File (opcional, imagem, máximo 5MB)
```

**Response (201):**
```json
{
  "message": "Cliente cadastrado com sucesso!",
  "cliente": {
    "id": "uuid",
    "nome_completo": "João Silva",
    "email": "joao@email.com",
    "foto_url": "https://api.../uploads/fotos/foto-123.jpg",
    "created_at": "2025-12-05T..."
  }
}
```

**Erros (400/409/500):**
```json
{
  "error": "Mensagem de erro"
}
```

### GET `/api/v1/clientes/:id`

**Response (200):**
```json
{
  "cliente": {
    "id": "uuid",
    "nome_completo": "João Silva",
    "email": "joao@email.com",
    "cpf": "12345678901",
    "foto_url": "https://api.../uploads/fotos/foto-123.jpg",
    ...
  }
}
```

---

## 🚀 Próximos Passos

1. **Executar SQL:** Adicionar campo `foto_url` no banco
2. **Instalar dependências:** `npm install` no diretório backend
3. **Configurar .env:** Criar arquivo com variáveis de ambiente
4. **Criar diretório:** `mkdir -p backend/uploads/fotos`
5. **Iniciar backend:** `pm2 start server.js --name api-protese-capilar`
6. **Testar:** Fazer cadastro pelo frontend

---

## ✅ Validações Implementadas

- ✅ Campos obrigatórios
- ✅ Formato de email
- ✅ CPF único (sem duplicatas)
- ✅ Email único (sem duplicatas)
- ✅ Tipo de arquivo (apenas imagens)
- ✅ Tamanho máximo (5MB)
- ✅ Senha mínima (6 caracteres)
- ✅ Hash de senha (bcrypt)

---

## 🔐 Segurança

- ✅ Senhas nunca retornadas na resposta
- ✅ Hash com bcrypt (10 rounds)
- ✅ Validação de tipos de arquivo
- ✅ Limite de tamanho de arquivo
- ✅ CORS configurado
- ✅ Validação de dados no backend

---

**Backend completo e pronto para uso!** 🎉



