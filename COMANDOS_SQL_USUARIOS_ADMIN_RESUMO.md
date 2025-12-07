# 🚀 Comandos SQL - Usuários Administrativos (Resumo Rápido)

## ⚡ Execução Rápida

### Passo 1: Gerar Hashes na VPS

```bash
ssh root@82.25.65.201
cd /home/cyberpanel/app/backend
node scripts/gerar-hashes-usuarios.js
```

**Copie o arquivo gerado:** `/home/cyberpanel/app/backend/COMANDOS_INSERIR_USUARIOS_ADMIN_FINAL.sql`

---

### Passo 2: Executar no DBeaver

1. Abra o arquivo SQL gerado
2. **⚠️ IMPORTANTE:** Ajuste os dados do Master (CPF, RG, endereço)
3. Execute os comandos INSERT
4. Execute o SELECT de verificação

---

## 📊 Estrutura dos 3 Níveis

| Nível       | Tipo      | Descrição                           |
|-------------|-----------|-------------------------------------|
| **master**  | Desenvolvedor | Ve tudo, faz tudo            |
| **proprietario** | Proprietário | Ve quase tudo, faz quase tudo |
| **funcionario** | Funcionário | Limitado                    |

---

## 🔐 Usuários que Serão Criados

### 1. Master (Jefferson Lima)
- **Email:** `jeffersonlima@jeffersonlima.net.br`
- **Senha:** `010216Dp@`
- **Tipo:** `master`

### 2. Proprietário (Carlos Silva - Teste)
- **Email:** `proprietario@protesecapilarcuiaba.com.br`
- **Senha:** `Proprietario@2025`
- **Tipo:** `proprietario`

### 3. Funcionário (Maria Santos - Teste)
- **Email:** `funcionario@protesecapilarcuiaba.com.br`
- **Senha:** `Funcionario@2025`
- **Tipo:** `funcionario`

---

## ✅ Verificação

Após executar, rode este SELECT:

```sql
SELECT 
    nome_completo,
    email,
    tipo_usuario,
    is_active
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

## 📖 Documentação Completa

Para instruções detalhadas, veja: `GUIA_CRIAR_USUARIOS_ADMIN.md`

---

**Última atualização:** 06/12/2025

