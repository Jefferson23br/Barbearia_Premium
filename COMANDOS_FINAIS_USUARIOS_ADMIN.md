# 🚀 COMANDOS FINAIS - Criar Usuários Administrativos

## ⚡ AÇÃO IMEDIATA

### Passo 1: Conectar na VPS e Gerar Hashes

```bash
ssh root@82.25.65.201
cd /home/cyberpanel/app/backend
node scripts/gerar-hashes-usuarios.js
```

**Isso irá:**
- Gerar os 3 hashes de senha
- Criar arquivo `COMANDOS_INSERIR_USUARIOS_ADMIN_FINAL.sql`
- Exibir os hashes no terminal

---

### Passo 2: Copiar o Arquivo SQL Gerado

O arquivo estará em:
```
/home/cyberpanel/app/backend/COMANDOS_INSERIR_USUARIOS_ADMIN_FINAL.sql
```

**Copie este arquivo para seu computador via:**
- SCP: `scp root@82.25.65.201:/home/cyberpanel/app/backend/COMANDOS_INSERIR_USUARIOS_ADMIN_FINAL.sql .`
- Ou copie o conteúdo diretamente do terminal

---

### Passo 3: Ajustar Dados do Master (IMPORTANTE!)

Antes de executar no DBeaver, ajuste no arquivo SQL:

**Dados do Jefferson Lima que DEVEM ser alterados:**
- `cpf`: De `'000.000.000-00'` para seu CPF real
- `rg`: De `'00.000.000-0'` para seu RG real  
- `rua`, `numero`, `complemento`, `bairro`: Para seu endereço real
- `cep`: Para seu CEP real

---

### Passo 4: Executar no DBeaver

1. Abra o DBeaver
2. Conecte-se ao banco `protese_capilar`
3. Cole o conteúdo do arquivo SQL (após ajustar os dados)
4. Execute os 3 comandos INSERT
5. Execute o SELECT de verificação

---

## 📊 Os 3 Usuários que Serão Criados

### 1. MASTER - Jefferson Lima (Você)
- **Email:** `jeffersonlima@jeffersonlima.net.br`
- **Senha:** `010216Dp@`
- **Nível:** `master` (ve tudo, faz tudo)

### 2. PROPRIETÁRIO - Carlos Silva (Teste)
- **Email:** `proprietario@protesecapilarcuiaba.com.br`
- **Senha:** `Proprietario@2025`
- **Nível:** `proprietario` (ve quase tudo, faz quase tudo)

### 3. FUNCIONÁRIO - Maria Santos (Teste)
- **Email:** `funcionario@protesecapilarcuiaba.com.br`
- **Senha:** `Funcionario@2025`
- **Nível:** `funcionario` (limitado)

---

## ✅ Verificação

Após executar os INSERTs, rode:

```sql
SELECT 
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

**Deve retornar 3 usuários ativos!**

---

## 🧪 Testar Login

Após criar os usuários, teste o login:

1. Inicie o painel-admin localmente:
   ```bash
   cd frontend/painel-admin
   npm run dev
   ```

2. Acesse: `http://localhost:3000`

3. Faça login com:
   - **Email:** `jeffersonlima@jeffersonlima.net.br`
   - **Senha:** `010216Dp@`

4. Deve redirecionar para `/dashboard` (página a criar)

---

## 📁 Arquivos de Referência

- `GUIA_CRIAR_USUARIOS_ADMIN.md` - Guia detalhado completo
- `COMANDOS_SQL_USUARIOS_ADMIN_RESUMO.md` - Resumo rápido
- `RESUMO_LOGIN_ADMIN.md` - Resumo do que foi implementado

---

## ⚠️ IMPORTANTE

1. **Ajuste os dados pessoais** antes de executar (CPF, RG, endereço)
2. **Guarde as senhas** em local seguro
3. **Teste o login** após criar os usuários
4. **Os usuários de teste** podem ser deletados depois se necessário

---

**Pronto para executar!** 🚀

**Data:** 06/12/2025

