# 🚨 RECUPERAR API RÁPIDO - Comandos Essenciais

Quando a API `api.protesecapilarcuiaba.com.br` cair, execute estes comandos na VPS:

---

## 🔐 1. Conectar na VPS

```bash
ssh root@82.25.65.201
```

---

## 🔍 2. Verificar Status do PM2

```bash
pm2 status
pm2 logs api-protese-capilar --lines 20
```

---

## 🔄 3. Reiniciar API

```bash
# Opção 1: Reiniciar (se existe)
pm2 restart api-protese-capilar

# Opção 2: Se não existir, iniciar manualmente
cd /home/cyberpanel/app/backend
pm2 start server.js --name api-protese-capilar
pm2 save
```

---

## 🧪 4. Testar

```bash
# Testar localmente
curl http://localhost:3001/health

# Se funcionar, testar externamente (do seu PC)
curl https://api.protesecapilarcuiaba.com.br/health
```

---

## 🗄️ 5. Se não funcionar, verificar serviços

```bash
# PostgreSQL
sudo systemctl status postgresql-15
sudo systemctl start postgresql-15

# OpenLiteSpeed
sudo systemctl status lsws
sudo systemctl start lsws

# Reiniciar API novamente
pm2 restart api-protese-capilar
```

---

## 📋 Script Automatizado

Execute o script de diagnóstico:

```bash
# Na VPS
cd /caminho/do/projeto/scripts
bash diagnostico-api-rapido.sh
```

---

## 📚 Documentação Completa

Ver guia detalhado: `docs/deploy/DIAGNOSTICO_API_CAIU.md`

---

**Comandos prontos para copiar e colar!** ⚡

