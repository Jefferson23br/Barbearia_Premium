# 🚀 Guia Completo de Deploy - Sistema Barbearia Premium

Guia consolidado com todas as instruções de deploy e atualizações do sistema.

---

## 📋 Índice

1. [Deploy de Novas Funcionalidades](#deploy-de-novas-funcionalidades)
2. [Deploy de Permissões](#deploy-de-permissões)
3. [Deploy de Configurações](#deploy-de-configurações)
4. [Deploy de Integrações](#deploy-de-integrações)
5. [Comandos Essenciais](#comandos-essenciais)

---

## 🆕 Deploy de Novas Funcionalidades

### Controle de Acessos

**Arquivos Modificados:**
- `backend/routes/auth.js` - Lógica de registro de acessos
- `backend/routes/controle-acessos.js` - Endpoint de estatísticas
- `frontend/painel-admin/src/app/dashboard/controle-acessos/page.tsx` - Interface

**Comandos PostgreSQL:**
```sql
-- Verificar se a tabela existe
SELECT * FROM protese.controle_acessos LIMIT 1;
```

**Deploy:**
```bash
# Backend (VPS 82.25.65.201)
scp backend/routes/auth.js root@82.25.65.201:/home/cyberpanel/app/backend/routes/
scp backend/routes/controle-acessos.js root@82.25.65.201:/home/cyberpanel/app/backend/routes/

# Frontend (VPS 45.132.157.28)
cd frontend/painel-admin
npm run build
scp -r out/* root@45.132.157.28:/home/cyberpanel/app/frontend-admin/

# Reiniciar
pm2 restart api-protese-capilar
pm2 restart painel-admin
```

---

## 🔐 Deploy de Permissões

### Adicionar Novas Permissões

**Script SQL:**
```sql
\i COMANDOS_ADICIONAR_NOVAS_PERMISSOES.sql
```

**Arquivos Backend:**
- `backend/routes/permissoes.js`

**Arquivos Frontend:**
- `frontend/painel-admin/src/hooks/usePermissions.ts`
- `frontend/painel-admin/src/app/dashboard/controle-permissoes/page.tsx`
- `frontend/painel-admin/src/components/admin/Sidebar.tsx`

**Deploy:**
```bash
# 1. Executar script SQL
psql -U protese_user -d protese_capilar -f COMANDOS_ADICIONAR_NOVAS_PERMISSOES.sql

# 2. Enviar backend (VPS 82.25.65.201)
scp backend/routes/permissoes.js root@82.25.65.201:/home/cyberpanel/app/backend/routes/

# 3. Build e enviar frontend
cd frontend/painel-admin
npm run build
scp -r out/* root@45.132.157.28:/home/cyberpanel/app/frontend-admin/

# 4. Reiniciar
pm2 restart api-protese-capilar
pm2 restart painel-admin
```

---

## ⚙️ Deploy de Configurações

### Criar Tabela de Configurações

**Script SQL:**
```sql
\i COMANDOS_CRIAR_TABELA_CONFIGURACOES.sql
```

**Arquivos Backend:**
- `backend/routes/configuracoes.js`
- `backend/routes/index.js`

**Arquivos Frontend:**
- `frontend/painel-admin/src/app/dashboard/configuracoes/page.tsx`

**Deploy:**
```bash
# 1. Executar script SQL
psql -U protese_user -d protese_capilar -f COMANDOS_CRIAR_TABELA_CONFIGURACOES.sql

# 2. Enviar backend
scp backend/routes/configuracoes.js root@82.25.65.201:/home/cyberpanel/app/backend/routes/
scp backend/routes/index.js root@82.25.65.201:/home/cyberpanel/app/backend/routes/

# 3. Build e enviar frontend
cd frontend/painel-admin
npm run build
scp -r out/* root@45.132.157.28:/home/cyberpanel/app/frontend-admin/

# 4. Reiniciar
pm2 restart api-protese-capilar
pm2 restart painel-admin
```

---

## 🔌 Deploy de Integrações

### Criar Tabelas de Integrações

**Script SQL:**
```sql
\i COMANDOS_CRIAR_TABELA_INTEGRACOES.sql
```

**Arquivos Backend:**
- `backend/routes/integracoes.js`
- `backend/routes/index.js`

**Arquivos Frontend:**
- `frontend/painel-admin/src/app/dashboard/integracoes-apis/page.tsx`
- `frontend/painel-admin/src/app/dashboard/habilitar-api/page.tsx`
- `frontend/painel-admin/src/components/admin/Sidebar.tsx`

**Deploy:**
```bash
# 1. Executar script SQL
psql -U protese_user -d protese_capilar -f COMANDOS_CRIAR_TABELA_INTEGRACOES.sql

# 2. Enviar backend (VPS 82.25.65.201)
scp backend/routes/integracoes.js root@82.25.65.201:/home/cyberpanel/app/backend/routes/
scp backend/routes/index.js root@82.25.65.201:/home/cyberpanel/app/backend/routes/

# 3. Build e enviar frontend
cd frontend/painel-admin
npm run build
scp -r out/* root@45.132.157.28:/home/cyberpanel/app/frontend-admin/

# 4. Reiniciar
pm2 restart api-protese-capilar
pm2 restart painel-admin
```

---

## 🔧 Comandos Essenciais

### Verificar Status dos Serviços
```bash
pm2 status
pm2 logs api-protese-capilar --lines 20
pm2 logs painel-admin --lines 20
```

### Verificar Sintaxe
```bash
# Backend
node -c routes/configuracoes.js
node -c routes/integracoes.js

# Frontend
cd frontend/painel-admin
npm run build
```

### Backup do Banco
```bash
pg_dump -U protese_user -d protese_capilar > backup_$(date +%Y%m%d).sql
```

### Verificar Tabelas
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'protese' 
ORDER BY table_name;
```

---

## ⚠️ Checklist de Deploy

Antes de fazer deploy, verifique:

- [ ] Scripts SQL executados no banco
- [ ] Backup do banco realizado
- [ ] Sintaxe dos arquivos verificada
- [ ] Variáveis de ambiente configuradas
- [ ] Permissões de arquivos corretas
- [ ] Logs verificados após deploy

---

**Última Atualização**: 16 de Dezembro de 2025  
**Versão**: 1.1

