# 🔧 Solução - Erro: value too long for type character varying(2)

## ❌ Problema Identificado

O campo `tipo_contrato` na tabela `protese.usuarios_administrativos` está definido como `VARCHAR(2)`, mas estamos tentando inserir `'CLT'` que tem **3 caracteres**.

---

## ✅ Solução

### Passo 1: Alterar o Campo na Tabela

Execute este comando SQL no DBeaver **ANTES** de inserir os usuários:

```sql
ALTER TABLE protese.usuarios_administrativos 
    ALTER COLUMN tipo_contrato TYPE VARCHAR(3);
```

### Passo 2: Verificar a Alteração

```sql
SELECT 
    column_name,
    data_type,
    character_maximum_length
FROM information_schema.columns
WHERE table_schema = 'protese'
    AND table_name = 'usuarios_administrativos'
    AND column_name = 'tipo_contrato';
```

**Resultado esperado:**
- `data_type`: `character varying`
- `character_maximum_length`: `3`

### Passo 3: Agora Execute o INSERT

Após alterar o campo, execute novamente o INSERT que estava dando erro.

---

## 🔍 Por Que Isso Aconteceu?

A tabela foi criada com `tipo_contrato VARCHAR(2)`, mas os valores válidos são:
- `'CLT'` - 3 caracteres ❌ (não cabe em VARCHAR(2))
- `'PJ'` - 2 caracteres ✅

O campo precisa ser `VARCHAR(3)` para aceitar ambos os valores.

---

## 📝 Comando Completo de Correção

Execute no DBeaver:

```sql
-- 1. Alterar o campo
ALTER TABLE protese.usuarios_administrativos 
    ALTER COLUMN tipo_contrato TYPE VARCHAR(3);

-- 2. Verificar
SELECT 
    column_name,
    data_type,
    character_maximum_length
FROM information_schema.columns
WHERE table_schema = 'protese'
    AND table_name = 'usuarios_administrativos'
    AND column_name = 'tipo_contrato';
```

---

## ✅ Após Corrigir

Depois de alterar o campo, você pode executar todos os INSERTs normalmente:

```sql
-- Master
INSERT INTO protese.usuarios_administrativos (...) VALUES (..., 'PJ', ...);

-- Proprietário  
INSERT INTO protese.usuarios_administrativos (...) VALUES (..., 'PJ', ...);

-- Funcionário
INSERT INTO protese.usuarios_administrativos (...) VALUES (..., 'CLT', ...);
```

Todos vão funcionar! ✅

---

**Arquivo criado:** `CORRIGIR_TIPO_CONTRATO.sql` (comando pronto para executar)

