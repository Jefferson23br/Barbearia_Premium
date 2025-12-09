# 📊 Sistema de Controle de Logs

Sistema completo para registrar e monitorar todas as ações importantes do sistema.

---

## ✅ Status

**Status**: ✅ **Implementado e Funcionando**  
**Última atualização**: Dezembro 2025

---

## 🎯 Visão Geral

O sistema de logs foi implementado com duas abordagens complementares:

1. **Middleware Automático de API** (`backend/middlewares/apiLogger.js`)
   - Intercepta automaticamente todas as requisições
   - Registra logs sem necessidade de modificar endpoints
   - Normalização automática de tipos de usuário

2. **Logs Manuais em Endpoints Específicos**
   - Para casos que precisam de dados mais detalhados
   - Helper functions em `backend/utils/logger.js`

---

## 🗄️ Banco de Dados

### Tabela: `protese.logs_sistema`

**Scripts SQL:**
- `COMANDOS_CRIAR_TABELA_LOGS_SISTEMA.sql` - Criação inicial
- `CORRIGIR_TABELA_LOGS_SISTEMA.sql` - Correções (NULL, 'sistema')
- `ATUALIZAR_CHECK_CONSTRAINT_LOGS.sql` - Atualizar constraint

**Estrutura:**
```sql
CREATE TABLE protese.logs_sistema (
    id UUID PRIMARY KEY,
    usuario_id UUID NULL,              -- Permite NULL para ações do sistema
    usuario_tipo VARCHAR(20) NULL,     -- 'cliente', 'administrativo', 'sistema' ou NULL
    usuario_nome VARCHAR(255),
    acao VARCHAR(50) NOT NULL,         -- 'criar', 'editar', 'excluir', 'visualizar', etc.
    modulo VARCHAR(50) NOT NULL,       -- 'cliente', 'funcionario', 'venda', etc.
    entidade_id UUID,
    entidade_tipo VARCHAR(50),
    descricao TEXT,
    dados_anteriores JSONB,
    dados_novos JSONB,
    ip_address VARCHAR(45),
    user_agent TEXT,
    status VARCHAR(20) DEFAULT 'sucesso',
    mensagem_erro TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Constraints:**
- `usuario_tipo` aceita: `'cliente'`, `'administrativo'`, `'sistema'` ou `NULL`
- Tipos administrativos (`'master'`, `'proprietario'`, `'funcionario'`) são normalizados para `'administrativo'`

---

## 🔧 Backend

### Middleware Automático

**Arquivo**: `backend/middlewares/apiLogger.js`

**Funcionalidades:**
- ✅ Intercepta todas as requisições HTTP
- ✅ Mapeia automaticamente rotas → módulos
- ✅ Mapeia métodos HTTP → ações
- ✅ Extrai `usuario_id` e `usuario_tipo` dos headers (`x-user-id`, `x-user-tipo`)
- ✅ Captura dados do body (POST/PUT) com remoção de campos sensíveis
- ✅ Captura status da resposta (sucesso/erro)
- ✅ Ignora rotas desnecessárias (health checks, etc.)

**Rotas Ignoradas:**
- `/health`
- `/api/test-db`
- `/api/v1/test`
- `/api/v1/logs` (para evitar loop)
- `/uploads`

**Mapeamento de Rotas:**

| Rota | Módulo | Ação (POST) | Ação (PUT) | Ação (DELETE) |
|------|--------|-------------|------------|---------------|
| `/api/v1/clientes` | `cliente` | `criar` | `editar` | `excluir` |
| `/api/v1/funcionarios` | `funcionario` | `criar` | `editar` | `excluir` |
| `/api/v1/auth/login` | `autenticacao` | `login` | - | - |
| `/api/v1/permissoes` | `permissao` | `criar` | `editar` | `excluir` |

### Helper Logger

**Arquivo**: `backend/utils/logger.js`

**Funções principais:**
- `initLogger(pool)` - Inicializa o logger com pool do banco
- `registrarLog(options)` - Registra um log no banco
- `getClientIp(req)` - Extrai IP do request
- `getUserAgent(req)` - Extrai User Agent

**Normalização de Tipos:**
- `'master'` → `'administrativo'`
- `'proprietario'` → `'administrativo'`
- `'funcionario'` → `'administrativo'`
- Tipos desconhecidos → `'administrativo'`
- Sem tipo com `usuarioId` → `'administrativo'`
- Sem tipo sem `usuarioId` → `'sistema'`

### Endpoints de Logs

**Arquivo**: `backend/server.js`

- `GET /api/v1/logs` - Listar logs com filtros
- `GET /api/v1/logs/estatisticas` - Estatísticas dos logs
- `GET /api/v1/logs/:id` - Buscar log específico

---

## 🎨 Frontend

### Página de Controle de Logs

**Arquivo**: `frontend/painel-admin/src/app/dashboard/controle-logs/page.tsx`

**Funcionalidades:**
- ✅ Listagem de logs com paginação
- ✅ Filtros por: data, módulo, ação, usuário, status
- ✅ Visualização detalhada de cada log
- ✅ Exibição de dados anteriores e novos (JSON)
- ✅ Estatísticas de logs

**Acesso:**
- Menu: "Controle de Logs"
- Rota: `/dashboard/controle-logs`
- Permissão: `controle_logs_ver` (Master e Proprietário)

---

## 📝 Como Usar

### No Backend

O middleware já está configurado e funciona automaticamente. Para adicionar logs manuais em endpoints específicos:

```javascript
const { registrarLog, getClientIp, getUserAgent } = require('./utils/logger');

// Em um endpoint
await registrarLog({
  usuarioId: req.headers['x-user-id'] || null,
  usuarioTipo: req.headers['x-user-tipo'] || null,
  acao: 'criar',
  modulo: 'cliente',
  entidadeId: novoCliente.id,
  entidadeTipo: 'cliente',
  descricao: `Cliente ${nome} criado`,
  dadosNovos: { nome, email, cpf },
  ipAddress: getClientIp(req),
  userAgent: getUserAgent(req),
});
```

### No Frontend

Para enviar informações do usuário nos headers:

```typescript
const adminData = localStorage.getItem('admin');
const admin = adminData ? JSON.parse(adminData) : null;

const headers: HeadersInit = {};
if (admin?.id) {
  headers['x-user-id'] = admin.id;
  headers['x-user-tipo'] = admin.tipo_usuario || 'administrativo';
}

fetch(`${apiUrl}/api/v1/clientes`, {
  method: 'POST',
  headers,
  body: formData,
});
```

---

## 🔍 Consultas Úteis

### Ver logs recentes
```sql
SELECT 
    usuario_tipo,
    usuario_nome,
    acao,
    modulo,
    descricao,
    status,
    created_at
FROM protese.logs_sistema
ORDER BY created_at DESC
LIMIT 20;
```

### Logs por módulo
```sql
SELECT 
    modulo,
    acao,
    COUNT(*) as total
FROM protese.logs_sistema
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY modulo, acao
ORDER BY total DESC;
```

### Logs de um usuário específico
```sql
SELECT * 
FROM protese.logs_sistema
WHERE usuario_id = 'uuid-do-usuario'
ORDER BY created_at DESC;
```

### Logs com erros
```sql
SELECT *
FROM protese.logs_sistema
WHERE status = 'erro'
ORDER BY created_at DESC;
```

---

## 📚 Documentação Adicional

- [Middleware API Logger](./MIDDLEWARE_API_LOGGER_README.md) - Detalhes do middleware
- [Guia de Integração](./GUIA_INTEGRAR_LOGS_EM_NOVOS_ENDPOINTS.md) - Como integrar em novos endpoints
- [Troubleshooting](./troubleshooting/LOGS_TROUBLESHOOTING.md) - Solução de problemas

---

**Última atualização**: Dezembro 2025





