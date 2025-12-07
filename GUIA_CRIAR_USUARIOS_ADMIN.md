# 📋 Guia Completo - Criar Usuários Administrativos

## 🎯 Objetivo

Criar 3 usuários administrativos no PostgreSQL com diferentes níveis de acesso:

1. **Master** - Desenvolvedor (Jefferson Lima)
2. **Proprietário** - Proprietário (Carlos Silva - teste)
3. **Funcionário** - Funcionário (Maria Santos - teste)

---

## 📝 Passo a Passo

### 1️⃣ Gerar Hashes na VPS

**Conecte-se na VPS Backend via SSH:**

```bash
ssh root@82.25.65.201
```

**Navegue até a pasta do backend:**

```bash
cd /home/cyberpanel/app/backend
```

**Execute o script para gerar os hashes:**

```bash
node scripts/gerar-hashes-usuarios.js
```

**O script irá:**
- ✅ Gerar os hashes de senha usando bcrypt
- ✅ Exibir os hashes no terminal
- ✅ Criar arquivo `COMANDOS_INSERIR_USUARIOS_ADMIN_FINAL.sql` com os INSERTs prontos

**Copie o arquivo SQL gerado:**

O arquivo estará em: `/home/cyberpanel/app/backend/COMANDOS_INSERIR_USUARIOS_ADMIN_FINAL.sql`

---

### 2️⃣ Executar Comandos no DBeaver

**Opção A: Usar o arquivo gerado**

1. Abra o DBeaver
2. Conecte-se ao banco `protese_capilar`
3. Abra o arquivo SQL gerado na VPS
4. Revise os dados (especialmente CPF, RG e endereço do usuário Master)
5. Execute os comandos INSERT

**Opção B: Copiar e colar manualmente**

1. Copie o conteúdo do arquivo SQL gerado
2. Cole no editor SQL do DBeaver
3. Revise e ajuste os dados
4. Execute

---

### 3️⃣ Ajustar Dados do Usuário Master

**⚠️ IMPORTANTE:** Antes de executar, ajuste os seguintes dados do usuário Master (Jefferson Lima):

- `cpf`: Altere `'000.000.000-00'` para o CPF real
- `rg`: Altere `'00.000.000-0'` para o RG real
- `rua`, `numero`, `complemento`, `bairro`, `cidade`, `estado`, `cep`: Ajuste para o endereço real

**Exemplo:**

```sql
INSERT INTO protese.usuarios_administrativos (
    nome_completo,
    email,
    cpf,                    -- ← ALTERAR AQUI
    rg,                     -- ← ALTERAR AQUI
    rua,                    -- ← ALTERAR AQUI
    numero,
    complemento,
    bairro,                 -- ← ALTERAR AQUI
    cidade,
    estado,
    cep,                    -- ← ALTERAR AQUI
    ...
) VALUES (
    'Jefferson Lima',
    'jeffersonlima@jeffersonlima.net.br',
    '123.456.789-00',       -- ← CPF REAL
    '12.345.678-9',         -- ← RG REAL
    'Rua Exemplo',          -- ← ENDEREÇO REAL
    '123',
    'Sala 01',
    'Centro',
    'Cuiabá',
    'MT',
    '78000-000',            -- ← CEP REAL
    ...
);
```

---

### 4️⃣ Verificar Usuários Criados

**Execute o SELECT para verificar:**

```sql
SELECT 
    id,
    nome_completo,
    email,
    tipo_usuario,
    is_active,
    created_at
FROM protese.usuarios_administrativos
ORDER BY 
    CASE tipo_usuario 
        WHEN 'master' THEN 1
        WHEN 'proprietario' THEN 2
        WHEN 'funcionario' THEN 3
    END;
```

**Você deve ver 3 usuários:**

| Nome Completo   | Email                                     | Tipo Usuario | Status |
|-----------------|-------------------------------------------|--------------|--------|
| Jefferson Lima  | jeffersonlima@jeffersonlima.net.br       | master       | ✅ Ativo |
| Carlos Silva    | proprietario@protesecapilarcuiaba.com.br | proprietario | ✅ Ativo |
| Maria Santos    | funcionario@protesecapilarcuiaba.com.br  | funcionario  | ✅ Ativo |

---

## 🔐 Credenciais para Teste

| Nível       | Email                                     | Senha              |
|-------------|-------------------------------------------|--------------------|
| Master      | jeffersonlima@jeffersonlima.net.br       | `010216Dp@`        |
| Proprietário| proprietario@protesecapilarcuiaba.com.br | `Proprietario@2025`|
| Funcionário | funcionario@protesecapilarcuiaba.com.br  | `Funcionario@2025` |

**⚠️ IMPORTANTE:** Guarde essas senhas em local seguro. Após criar os usuários, você pode testar o login no painel administrativo.

---

## 🚀 Próximos Passos

Após criar os usuários:

1. ✅ Testar login no painel-admin com as credenciais
2. ✅ Criar dashboard administrativo
3. ✅ Implementar controle de acesso por nível
4. ✅ Criar menus e funcionalidades por nível

---

## 📁 Arquivos Relacionados

- `backend/scripts/gerar-hashes-usuarios.js` - Script para gerar hashes
- `COMANDOS_INSERIR_USUARIOS_ADMIN.sql` - Template SQL (sem hashes)
- `backend/COMANDOS_INSERIR_USUARIOS_ADMIN_FINAL.sql` - SQL gerado na VPS (com hashes)

---

## ❓ Troubleshooting

### Erro: "Cannot find module 'bcrypt'"
**Solução:** O bcrypt já está instalado na VPS. Se der erro, execute:
```bash
cd /home/cyberpanel/app/backend
npm install
```

### Erro: "relation 'protese.usuarios_administrativos' does not exist"
**Solução:** Execute primeiro os comandos de criação das tabelas:
- `COMANDOS_CRIAR_SCHEMA_E_TABELAS.sql`

### Erro: "duplicate key value violates unique constraint"
**Solução:** O usuário já existe. Delete antes de inserir novamente ou ajuste o email/CPF.

---

**Criado em:** 06/12/2025  
**Status:** ✅ Pronto para executar

