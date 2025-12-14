# 📋 Instruções - Módulo Balanço Demonstrativo

## ⚠️ Erro 404 - Rota não encontrada

O erro `404` indica que o servidor backend não foi reiniciado após adicionar a nova rota.

## 🔧 Solução

### 1. Execute o Script SQL

Primeiro, execute o script SQL no PostgreSQL para criar a tabela de categorias:

```sql
-- Execute este arquivo no PostgreSQL
COMANDOS_CRIAR_TABELA_CATEGORIAS_CUSTO.sql
```

### 2. Reinicie o Servidor Backend

**Na VPS (82.25.65.201):**

```bash
# Conecte-se na VPS via SSH
ssh root@82.25.65.201

# Navegue até o diretório do backend
cd /home/cyberpanel/app/backend

# Reinicie o servidor com PM2
pm2 restart api-protese-capilar

# Ou se o nome for diferente, verifique com:
pm2 list

# Depois reinicie:
pm2 restart [nome-do-processo]
```

**Verificar se está rodando:**

```bash
pm2 status
pm2 logs api-protese-capilar --lines 50
```

### 3. Verificar se a Rota está Funcionando

Após reiniciar, teste a rota:

```bash
curl -X GET https://api.protesecapilarcuiaba.com.br/api/v1/balanco-demonstrativo/categorias \
  -H "x-user-id: [seu-user-id]" \
  -H "x-user-tipo: master"
```

## 📝 Arquivos Criados

1. **Backend:**
   - `backend/routes/balanco-demonstrativo.js` - Rotas do módulo
   - Atualizado `backend/routes/index.js` - Registro da rota

2. **Frontend:**
   - `frontend/painel-admin/src/app/dashboard/balanco-demonstrativo/page.tsx` - Página completa

3. **SQL:**
   - `COMANDOS_CRIAR_TABELA_CATEGORIAS_CUSTO.sql` - DDL da tabela

## ✅ Após Reiniciar

Após reiniciar o servidor backend, o módulo deve funcionar normalmente:

1. Acesse "Balanço Demonstrativo" no menu
2. Aba "Categorias" - Crie categorias de custo
3. Aba "Relatório" - Gere relatórios financeiros

## 🐛 Se o Erro Persistir

1. Verifique os logs do PM2:
   ```bash
   pm2 logs api-protese-capilar --lines 100
   ```

2. Verifique se o arquivo foi enviado corretamente para a VPS:
   ```bash
   ls -la /home/cyberpanel/app/backend/routes/balanco-demonstrativo.js
   ```

3. Verifique se a rota está registrada:
   ```bash
   grep -r "balanco-demonstrativo" /home/cyberpanel/app/backend/routes/index.js
   ```

---

**Data**: 13 de Dezembro de 2025  
**Status**: ✅ Implementação Completa - Aguardando Reinicialização do Servidor

