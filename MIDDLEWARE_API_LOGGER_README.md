# Middleware de Logging Automático de API

## 📋 Visão Geral

Este middleware intercepta **automaticamente todas as requisições** à API e registra logs no banco de dados PostgreSQL, sem necessidade de modificar cada endpoint individualmente.

## 🎯 Vantagens

✅ **Automático**: Registra todas as requisições automaticamente  
✅ **Sem modificação de endpoints**: Não precisa alterar código existente  
✅ **Completo**: Captura método HTTP, rota, usuário, dados, status, etc.  
✅ **Inteligente**: Ignora rotas desnecessárias (health checks, etc.)  
✅ **Seguro**: Remove campos sensíveis (senhas) antes de salvar  

## 🔧 Como Funciona

### 1. Mapeamento Automático

O middleware mapeia automaticamente:
- **Método HTTP** → Ação (`criar`, `editar`, `excluir`, `visualizar`, etc.)
- **Rota** → Módulo (`cliente`, `funcionario`, `venda`, etc.)
- **Parâmetros** → Entidade ID (extrai UUIDs da URL)

### 2. Captura de Informações

Para cada requisição, registra:
- ✅ Usuário (dos headers `x-user-id` e `x-user-tipo`)
- ✅ Método HTTP (GET, POST, PUT, DELETE)
- ✅ Rota completa
- ✅ Parâmetros da URL
- ✅ Dados do body (POST/PUT) - **senhas são removidas**
- ✅ Status da resposta (sucesso/erro)
- ✅ IP do cliente
- ✅ User Agent
- ✅ Timestamp

### 3. Rotas Ignoradas

As seguintes rotas **não são logadas** (para evitar ruído):
- `/health`
- `/api/test-db`
- `/api/v1/test`
- `/api/v1/logs` (para evitar loop infinito)
- `/api/v1/logs/estatisticas`
- `/uploads`

### 4. Mapeamento de Rotas

| Rota | Módulo | Ação (POST) | Ação (PUT) | Ação (DELETE) |
|------|--------|-------------|------------|---------------|
| `/api/v1/clientes` | `cliente` | `criar` | `editar` | `excluir` |
| `/api/v1/funcionarios` | `funcionario` | `criar` | `editar` | `excluir` |
| `/api/v1/auth/login` | `autenticacao` | `login` | - | - |
| `/api/v1/permissoes` | `permissao` | `criar` | `editar` | `excluir` |

## 📁 Estrutura de Arquivos

```
backend/
├── middlewares/
│   └── apiLogger.js       # Middleware principal
├── utils/
│   └── logger.js          # Funções auxiliares de log
└── server.js              # Integração do middleware
```

## 🚀 Instalação

### 1. Atualizar Tabela no PostgreSQL

Execute o script para corrigir o CHECK constraint:

```bash
psql -U protese_user -d protese_capilar -f ATUALIZAR_CHECK_CONSTRAINT_LOGS.sql
```

### 2. Copiar Arquivos para VPS

```bash
# Copiar middleware
scp backend/middlewares/apiLogger.js root@srv842883:/home/cyberpanel/app/backend/middlewares/

# Criar diretório se não existir
ssh root@srv842883 "mkdir -p /home/cyberpanel/app/backend/middlewares"
```

### 3. Atualizar server.js

O `server.js` já foi atualizado localmente com:
- Import do middleware
- Aplicação do middleware após parsing de JSON/URLencoded

### 4. Reiniciar API

```bash
pm2 restart api-protese-capilar --update-env
pm2 logs api-protese-capilar --lines 50
```

## 🧪 Teste

### 1. Testar Criação de Cliente

```bash
curl -X POST https://api.protesecapilarcuiaba.com.br/api/v1/clientes \
  -H "Content-Type: application/json" \
  -H "x-user-id: SEU_USER_ID" \
  -H "x-user-tipo: administrativo" \
  -d '{"nome_completo": "Teste", "email": "teste@teste.com", ...}'
```

### 2. Verificar Log no Banco

```sql
SELECT 
    id,
    usuario_id,
    usuario_tipo,
    usuario_nome,
    acao,
    modulo,
    descricao,
    status,
    created_at
FROM protese.logs_sistema
ORDER BY created_at DESC
LIMIT 10;
```

## 🔍 Exemplos de Logs

### Log de Criação
```json
{
  "acao": "criar",
  "modulo": "cliente",
  "descricao": "POST /api/v1/clientes - 201",
  "dados_novos": {
    "nome_completo": "João Silva",
    "email": "joao@example.com",
    "senha": "[REDACTED]"
  },
  "status": "sucesso"
}
```

### Log de Edição
```json
{
  "acao": "editar",
  "modulo": "cliente",
  "descricao": "PUT /api/v1/clientes/123e4567-... - 200",
  "entidade_id": "123e4567-e89b-12d3-a456-426614174000",
  "dados_novos": {
    "nome_completo": "João Silva Atualizado",
    "email": "joao.novo@example.com"
  },
  "status": "sucesso"
}
```

### Log de Erro
```json
{
  "acao": "criar",
  "modulo": "cliente",
  "descricao": "POST /api/v1/clientes - ERRO: Email já cadastrado",
  "status": "erro",
  "mensagem_erro": "Email já cadastrado"
}
```

## ⚙️ Configuração

### Adicionar Nova Rota ao Mapeamento

Edite `backend/middlewares/apiLogger.js` na função `mapearRotaParaAcao`:

```javascript
if (partesRota.includes('novo-modulo')) {
  modulo = 'novo_modulo';
  entidadeTipo = 'novo_modulo';
}
```

### Ignorar Nova Rota

Adicione à lista `rotasIgnoradas`:

```javascript
const rotasIgnoradas = [
  '/health',
  '/minha-nova-rota', // Adicionar aqui
];
```

## 🔒 Segurança

- ✅ Senhas são automaticamente removidas dos logs (`[REDACTED]`)
- ✅ Campos sensíveis não são salvos
- ✅ IP e User Agent são capturados para auditoria
- ✅ Logs não interrompem o fluxo principal (erros são silenciosos)

## 📊 Performance

- ⚡ **Não bloqueia**: Logs são registrados após a resposta (`res.on('finish')`)
- ⚡ **Assíncrono**: Não espera o log para responder ao cliente
- ⚡ **Leve**: Apenas intercepta e registra, sem processamento pesado

## 🐛 Troubleshooting

### Logs não estão sendo salvos

1. Verificar se a tabela foi corrigida:
```sql
SELECT conname, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conrelid = 'protese.logs_sistema'::regclass 
  AND conname = 'logs_sistema_usuario_tipo_check';
```

2. Verificar logs do PM2:
```bash
pm2 logs api-protese-capilar --err --lines 50
```

3. Verificar se o middleware está sendo carregado:
```bash
# Procurar por "API Logger" nos logs
pm2 logs api-protese-capilar | grep "API Logger"
```

### Loop infinito de logs

Se você adicionar uma rota de logs que não está na lista de ignoradas, pode causar loop. Adicione à lista `rotasIgnoradas`.

## 📝 Notas

- O middleware é aplicado **após** os middlewares de parsing (json/urlencoded)
- Logs são registrados **após** a resposta ser enviada (não bloqueia)
- Em ambiente de desenvolvimento, logs também aparecem no console

