# 🔧 Resolver Erro PM2 "Script already launched"

## ❌ Erro Encontrado

```
[PM2][ERROR] Script already launched, add -f option to force re-execution
```

## ✅ Soluções

### Opção 1: Parar e Deletar Processo Antigo (Recomendado)

```bash
# Ver processos rodando
pm2 list

# Parar o processo
pm2 stop api-protese-capilar

# Deletar o processo
pm2 delete api-protese-capilar

# Iniciar novo processo
cd /home/cyberpanel/app/backend
pm2 start server.js --name api-protese-capilar
pm2 save
```

### Opção 2: Forçar Reinício

```bash
pm2 restart api-protese-capilar
```

### Opção 3: Usar Flag -f (Forçar)

```bash
pm2 start server.js --name api-protese-capilar -f
```

### Opção 4: Parar Todos e Reiniciar

```bash
# Parar todos os processos
pm2 stop all

# Deletar todos
pm2 delete all

# Iniciar novamente
cd /home/cyberpanel/app/backend
pm2 start server.js --name api-protese-capilar
pm2 save
pm2 startup
```

---

## 📋 Verificar Status

```bash
# Ver todos os processos
pm2 list

# Ver logs
pm2 logs api-protese-capilar

# Ver logs em tempo real
pm2 logs api-protese-capilar --lines 50
```

---

## 🚨 Se o Processo Antigo Estiver com Código Desatualizado

1. **Parar processo antigo:**
   ```bash
   pm2 stop api-protese-capilar
   pm2 delete api-protese-capilar
   ```

2. **Fazer upload dos novos arquivos** (server.js, package.json, etc.)

3. **Instalar/atualizar dependências:**
   ```bash
   cd /home/cyberpanel/app/backend
   npm install
   ```

4. **Iniciar novamente:**
   ```bash
   pm2 start server.js --name api-protese-capilar
   pm2 save
   ```

---

## ✅ Verificar se Está Funcionando

```bash
# Testar health check
curl http://localhost:3001/health

# Ver logs para erros
pm2 logs api-protese-capilar --lines 50
```

