# 📚 Guias de Deploy - Prótese Capilar Cuiabá

## ✅ Status Atual

**VPS Backend (82.25.65.201):**
- ✅ Configurada e funcionando
- ✅ API rodando na porta 8080
- ✅ PostgreSQL funcionando
- ⏳ SSL pendente

**VPS Frontend (45.132.157.28):**
- ⏳ A configurar

---

## 📖 Documentação Disponível

### 🔧 VPS Backend

1. **[VPS_BACKEND_COM_CYBERPANEL.md](./VPS_BACKEND_COM_CYBERPANEL.md)** ⭐
   - Guia completo para VPS com CyberPanel
   - IP: 82.25.65.201
   - OpenLiteSpeed + PostgreSQL

2. **[INSTALAR_API_TESTE.md](./INSTALAR_API_TESTE.md)** ✅
   - API de teste instalada e funcionando
   - Express + PostgreSQL + PM2

### 🎨 VPS Frontend

3. **[VPS_FRONTEND_45.md](./VPS_FRONTEND_45.md)**
   - Configuração da VPS Frontend
   - IP: 45.132.157.28
   - Deploy dos sites estáticos

### 🌐 DNS e Domínios

4. **[CONFIGURACAO_FINAL_DNS.md](./CONFIGURACAO_FINAL_DNS.md)** ⭐
   - DNS no Cloudflare (com IPs corretos)
   - Registros A para todos os domínios

5. **[ARQUITETURA_DUAS_VPS.md](./ARQUITETURA_DUAS_VPS.md)**
   - Visão geral da arquitetura
   - Fluxo de dados entre VPS

### 🛡️ Segurança

6. **[SEGURANCA_VPS.md](./SEGURANCA_VPS.md)**
   - Medidas de segurança
   - Boas práticas
   - Monitoramento

### 🔧 Utilitários

7. **[COMANDOS_ESSENCIAIS.md](./COMANDOS_ESSENCIAIS.md)**
   - Comandos úteis do dia a dia
   - PostgreSQL, Nginx, PM2, Firewall

---

## 🎯 O Que Está Funcionando

✅ **API de Teste**
- URL: http://api.protesecapilarcuiaba.com.br:8080
- Endpoints:
  - `GET /health`
  - `GET /api/test-db`
  - `GET /api/v1/test`

✅ **PostgreSQL**
- Versão 15.15
- Banco: protese_capilar
- DBeaver conectado via SSH Tunnel

✅ **PM2**
- API rodando 24/7
- Auto-restart configurado

---

## ⏳ Pendente

### Próxima Sessão
- [ ] Configurar SSL (HTTPS)
- [ ] Mover para porta 443 padrão
- [ ] Configurar DNS no Cloudflare
- [ ] Aguardar propagação DNS

### Esta Semana
- [ ] Criar backend completo (NestJS)
- [ ] Módulo de autenticação
- [ ] Migrations do banco

### Próximas Semanas
- [ ] Configurar VPS Frontend
- [ ] Deploy dos frontends
- [ ] Integração completa

---

## 📝 Links Rápidos

- [Status Projeto](../../STATUS_PROJETO.md)
- [O Que Fizemos Hoje](../../O_QUE_FIZEMOS_HOJE.md)
- [Próximos Passos](../../PROXIMOS_PASSOS.md)
- [Cronograma](../../Cronograma.txt)

---

*Documentação de deploy atualizada!* 📚
