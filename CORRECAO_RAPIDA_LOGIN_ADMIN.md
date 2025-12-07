# ⚡ Correção Rápida - Erro de Conexão no Login

## 🔴 Problema

```
Failed to load resource: net::ERR_CONNECTION_REFUSED
:3001/api/v1/auth/admin/login:1
```

A URL da API está incompleta (faltando o protocolo/host).

---

## ✅ Solução Rápida

### Opção 1: Criar Arquivo .env.local (Melhor)

1. **Criar arquivo:**
   ```bash
   cd frontend/painel-admin
   echo NEXT_PUBLIC_API_URL=https://api.protesecapilarcuiaba.com.br > .env.local
   ```

2. **Reiniciar o servidor Next.js:**
   - Pare o servidor (Ctrl+C)
   - Inicie novamente: `npm run dev`

3. **Testar o login novamente**

---

### Opção 2: Usar API Local (Desenvolvimento)

Se quiser testar com a API local, use:

```bash
cd frontend/painel-admin
echo NEXT_PUBLIC_API_URL=http://localhost:3001 > .env.local
```

**Mas lembre-se:** A API precisa estar rodando na porta 3001 localmente.

---

## 📝 Verificar se Funcionou

1. Abra o console do navegador (F12)
2. Deve aparecer: `🔗 Tentando conectar em: https://api.protesecapilarcuiaba.com.br`
3. O login deve funcionar

---

## ⚠️ IMPORTANTE

- O arquivo `.env.local` só funciona após **reiniciar** o servidor Next.js
- Se não reiniciar, as variáveis não serão carregadas
- O arquivo já foi criado automaticamente, mas você precisa reiniciar o servidor!

---

**Agora é só reiniciar o servidor e testar! 🚀**

