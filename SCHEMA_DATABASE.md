# 🗄️ Schema do Banco de Dados - PostgreSQL

## 📋 Schema: `protese`

O sistema utiliza o schema `protese` no PostgreSQL para organizar todas as tabelas.

---

## 📊 Tabelas Principais

### 1. `usuarios_administrativos` (Administradores/Funcionários)

Armazena os usuários administrativos do sistema (Master, Proprietário, Funcionário).

**Campos principais:**
- `id` (UUID) - Identificador único
- `nome_completo` (VARCHAR) - Nome completo
- `email` (VARCHAR) - Email único
- `cpf` (VARCHAR) - CPF (opcional)
- `senha_hash` (VARCHAR) - Hash da senha (bcrypt)
- `foto_url` (VARCHAR) - URL da foto de perfil
- `tipo_usuario` (VARCHAR) - 'master' | 'proprietario' | 'funcionario'
- `is_active` (BOOLEAN) - Status ativo/inativo
- `created_at`, `updated_at` (TIMESTAMP)

**Relacionamentos:**
- 1:N com `permissoes_usuarios`
- 1:N com `controle_acessos` (quando tipo = 'administrativo')

---

### 2. `usuarios_clientes` (Clientes)

Armazena os clientes cadastrados no sistema.

**Campos principais:**
- `id` (UUID) - Identificador único
- `nome_completo` (VARCHAR) - Nome completo
- `email` (VARCHAR) - Email único
- `cpf` (VARCHAR) - CPF único
- `rg` (VARCHAR) - RG (opcional)
- `senha_hash` (VARCHAR) - Hash da senha (bcrypt)
- `foto_url` (VARCHAR) - URL da foto de perfil
- `rua`, `numero`, `complemento`, `bairro`, `cidade`, `estado`, `cep` - Endereço completo
- `funcionario_responsavel_id` (UUID) - FK para `usuarios_administrativos.id`
- `is_active` (BOOLEAN) - Status ativo/inativo
- `created_at`, `updated_at` (TIMESTAMP)

**Relacionamentos:**
- N:1 com `usuarios_administrativos` (funcionario_responsavel_id)
- 1:N com `controle_acessos` (quando tipo = 'cliente')

---

### 3. `permissoes_usuarios` (Permissões Granulares)

Armazena as permissões granulares de cada usuário administrativo (exceto Master que tem todas).

**Campos principais:**
- `id` (UUID) - Identificador único
- `usuario_id` (UUID) - FK para `usuarios_administrativos.id` (UNIQUE)
- **Módulos com permissões Ver/Editar/Excluir:**
  - `dashboard_ver`
  - `agenda_ver`, `agenda_editar`, `agenda_excluir`
  - `lancamento_venda_ver`, `lancamento_venda_editar`, `lancamento_venda_excluir`
  - `lancamento_despesa_ver`, `lancamento_despesa_editar`, `lancamento_despesa_excluir`
  - `receitas_ver`, `receitas_editar`, `receitas_excluir`
  - `despesas_ver`, `despesas_editar`, `despesas_excluir`
  - `faturamento_ver`, `faturamento_editar`, `faturamento_excluir`
  - `usuarios_ver`, `usuarios_editar`, `usuarios_excluir`
  - `funcionarios_ver`, `funcionarios_editar`, `funcionarios_excluir`
  - `help_desk_ver`, `help_desk_editar`, `help_desk_excluir`
  - `controle_permissoes_ver`, `controle_permissoes_editar`, `controle_permissoes_excluir`
- **Módulos apenas Visualização:**
  - `controle_acessos_ver`
  - `controle_logs_ver`
- `created_at`, `updated_at` (TIMESTAMP)

**Relacionamentos:**
- 1:1 com `usuarios_administrativos` (usuario_id)

**Notas:**
- Se um usuário não tem registro nesta tabela, todas as permissões são `false` por padrão
- Master sempre tem todas as permissões (não precisa de registro aqui)
- Se `_ver` é `false`, `_editar` e `_excluir` são automaticamente `false`

---

### 4. `controle_acessos` (Logs de Login)

Registra cada acesso/login de usuários (clientes e administrativos).

**Campos principais:**
- `id` (UUID) - Identificador único
- `usuario_id` (UUID) - ID do usuário (pode ser cliente ou admin)
- `tipo_usuario` (VARCHAR) - 'cliente' | 'administrativo'
- `data_acesso` (DATE) - Data do acesso (UNIQUE por usuario_id + data_acesso)
- `quantidade_login` (INTEGER) - Quantidade de logins no dia
- `primeiro_acesso` (TIMESTAMP) - Primeiro login do dia
- `ultimo_acesso` (TIMESTAMP) - Último login do dia
- `created_at`, `updated_at` (TIMESTAMP)

**Relacionamentos:**
- N:1 com `usuarios_clientes` (quando tipo_usuario = 'cliente')
- N:1 com `usuarios_administrativos` (quando tipo_usuario = 'administrativo')

**Funcionalidade:**
- Um registro por usuário por dia
- Incrementa `quantidade_login` a cada login no mesmo dia
- Atualiza `ultimo_acesso` a cada login

---

## 🔗 Relacionamentos Visuais

```
usuarios_administrativos
├── 1:1 ──> permissoes_usuarios
├── 1:N ──> controle_acessos (tipo = 'administrativo')
└── 1:N ──> usuarios_clientes (funcionario_responsavel_id)

usuarios_clientes
├── N:1 ──> usuarios_administrativos (funcionario_responsavel_id)
└── 1:N ──> controle_acessos (tipo = 'cliente')
```

---

## 📝 Scripts SQL Importantes

Os scripts para criar as tabelas estão na raiz do projeto:

1. **`COMANDOS_CRIAR_TABELA_PERMISSOES_SIMPLES.sql`**
   - Cria a tabela `permissoes_usuarios`
   - Define todas as colunas de permissões

2. **`COMANDOS_CRIAR_TABELA_CONTROLE_ACESSOS.sql`**
   - Cria a tabela `controle_acessos`
   - Define estrutura de logs de acesso

3. **`COMANDOS_ADICIONAR_FUNCIONARIO_RESPONSAVEL.sql`**
   - Adiciona campo `funcionario_responsavel_id` em `usuarios_clientes`
   - Cria índice para melhor performance

---

## 📊 Índices Recomendados

```sql
-- Usuários Administrativos
CREATE INDEX idx_usuarios_admin_email ON protese.usuarios_administrativos(email);
CREATE INDEX idx_usuarios_admin_tipo ON protese.usuarios_administrativos(tipo_usuario);

-- Usuários Clientes
CREATE INDEX idx_usuarios_clientes_email ON protese.usuarios_clientes(email);
CREATE INDEX idx_usuarios_clientes_cpf ON protese.usuarios_clientes(cpf);
CREATE INDEX idx_usuarios_clientes_funcionario_responsavel ON protese.usuarios_clientes(funcionario_responsavel_id);

-- Permissões
CREATE INDEX idx_permissoes_usuario_id ON protese.permissoes_usuarios(usuario_id);

-- Controle de Acessos
CREATE INDEX idx_controle_acessos_usuario_data ON protese.controle_acessos(usuario_id, data_acesso);
CREATE INDEX idx_controle_acessos_data ON protese.controle_acessos(data_acesso);
```

---

## 🔐 Segurança

- Todas as senhas são armazenadas como hash bcrypt
- Email e CPF têm constraint UNIQUE
- Foreign keys com ON DELETE CASCADE onde apropriado
- Timestamps automáticos (created_at, updated_at)

---

**Última atualização**: Dezembro 2024
