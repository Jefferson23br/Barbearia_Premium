# 🚀 Próximos Passos - Projeto Prótese Capilar

## ⏭️ Imediato (Próxima Sessão)

### 1. Finalizar Configuração da API

#### SSL/HTTPS
```bash
# Na VPS Backend (82.25.65.201)
ssh root@82.25.65.201

# Instalar Certbot
sudo dnf install -y certbot python3-certbot-nginx

# Configurar SSL
sudo certbot --nginx -d api.protesecapilarcuiaba.com.br
```

#### Mover para Portas Padrão
- Atualizar Nginx para escutar nas portas 80/443
- Configurar redirecionamento HTTP → HTTPS
- Resolver conflito com OpenLiteSpeed

#### Testar
```
https://api.protesecapilarcuiaba.com.br/health
```

### 2. Configurar DNS no Cloudflare

**Registros a adicionar:**

```
Type: A | Name: api   | Content: 82.25.65.201  | Proxy: DNS only
Type: A | Name: www   | Content: 45.132.157.28 | Proxy: Proxied
Type: A | Name: app   | Content: 45.132.157.28 | Proxy: Proxied
Type: A | Name: admin | Content: 45.132.157.28 | Proxy: Proxied
```

**Aguardar propagação:** 2-4 horas

---

## 📅 Esta Semana (Dias 6-10)

### Backend - Estrutura Completa

1. **Criar projeto NestJS**
   ```bash
   npm i -g @nestjs/cli
   nest new backend-protese-capilar
   ```

2. **Configurar TypeORM + PostgreSQL**
   - Conexão com banco
   - Entities básicas
   - Migrations

3. **Módulo de Autenticação**
   - JWT
   - Login
   - Registro
   - Refresh tokens

4. **Módulo de Usuários**
   - CRUD básico
   - Validações
   - DTOs

---

## 📅 Próxima Semana (Dias 11-15)

### Backend - Módulos Principais

1. **Módulo de Planos**
   - CRUD completo
   - Validações de negócio

2. **Módulo de Serviços**
   - CRUD completo
   - Relacionamento com planos

3. **Módulo de Agendamentos**
   - CRUD
   - Validação de horários
   - Conflitos

---

## 🌐 VPS Frontend (45.132.157.28)

### A Configurar

1. **Preparar VPS**
   - Instalar Nginx
   - Configurar firewall
   - Criar estrutura de pastas

2. **Deploy dos Frontends**
   - Build local dos 3 projetos
   - Upload para VPS
   - Configurar Nginx para cada domínio
   - Configurar SSL

3. **Testar**
   - https://www.protesecapilarcuiaba.com.br
   - https://app.protesecapilarcuiaba.com.br
   - https://admin.protesecapilarcuiaba.com.br

---

## 🔗 Integração Frontend + Backend

### Configurar Variáveis de Ambiente

Nos 3 frontends, criar `.env.local`:

```env
NEXT_PUBLIC_API_URL=https://api.protesecapilarcuiaba.com.br
```

### Testar Integração
- Login real via API
- Registro real via API
- Autenticação JWT

---

## 📋 Checklist Geral

### Infraestrutura
- [x] VPS Backend configurada
- [x] PostgreSQL funcionando
- [x] API rodando 24/7
- [ ] SSL configurado
- [ ] DNS no Cloudflare
- [ ] VPS Frontend configurada

### Backend
- [x] API de teste
- [ ] Estrutura NestJS
- [ ] Autenticação JWT
- [ ] Módulos principais
- [ ] Migrations

### Frontend
- [x] Painel Cliente
- [x] Painel Admin
- [x] Site Entrada
- [ ] Integração com API
- [ ] Deploy em produção

### Deploy
- [x] API acessível (porta 8080)
- [ ] API com SSL (HTTPS)
- [ ] Frontends em produção
- [ ] Tudo integrado

---

## 🎯 Ordem de Prioridade

1. **SSL na API** (urgente - para HTTPS)
2. **DNS Cloudflare** (para domínios funcionarem)
3. **Backend NestJS** (desenvolvimento)
4. **Deploy Frontend** (VPS 45.132.157.28)
5. **Integração** (conectar tudo)

---

## 📞 Suporte

**Documentação:**
- `STATUS_PROJETO.md` - Status atual
- `docs/deploy/` - Guias de configuração
- `SCHEMA_DATABASE.md` - Estrutura do banco

**Comandos Rápidos:**
- Ver `GUIA_RAPIDO.md`

---

*Roadmap atualizado - Pronto para continuar!* 🚀




