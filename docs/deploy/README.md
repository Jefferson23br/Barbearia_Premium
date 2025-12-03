# 📚 Documentação de Deploy - Prótese Capilar Cuiabá

## 🎯 Arquitetura do Sistema

### VPS Backend (82.25.65.201)
- API + PostgreSQL
- Domínio: api.protesecapilarcuiaba.com.br
- CyberPanel + OpenLiteSpeed

### VPS Frontend (45.132.157.28)
- Sites estáticos (Next.js)
- Domínios: www, app, admin

---

## 📖 Documentos Principais

### 🚀 Configuração VPS Backend

1. **[VPS_BACKEND_COM_CYBERPANEL.md](./VPS_BACKEND_COM_CYBERPANEL.md)** ⭐
   - Guia completo para VPS com CyberPanel
   - IP: 82.25.65.201

2. **[INSTALAR_API_TESTE.md](./INSTALAR_API_TESTE.md)**
   - Instalar API de teste
   - Configurar Node.js, PostgreSQL, PM2

### 🎨 Configuração VPS Frontend

3. **[VPS_FRONTEND_45.md](./VPS_FRONTEND_45.md)**
   - Configuração da VPS Frontend
   - IP: 45.132.157.28
   - Deploy dos sites estáticos

### 🌐 DNS e Domínios

4. **[CONFIGURACAO_FINAL_DNS.md](./CONFIGURACAO_FINAL_DNS.md)** ⭐
   - Configuração EXATA do DNS no Cloudflare
   - IPs corretos para cada subdomínio

5. **[ARQUITETURA_DUAS_VPS.md](./ARQUITETURA_DUAS_VPS.md)**
   - Visão geral da arquitetura
   - Fluxo de dados

### 🛡️ Segurança

6. **[SEGURANCA_VPS.md](./SEGURANCA_VPS.md)**
   - Medidas de segurança
   - Boas práticas
   - Monitoramento

7. **[CHECKLIST_CONFIGURACAO_VPS.md](./CHECKLIST_CONFIGURACAO_VPS.md)**
   - Checklist para acompanhar progresso

### 🔧 Utilitários

8. **[COMANDOS_ESSENCIAIS.md](./COMANDOS_ESSENCIAIS.md)**
   - Comandos úteis do dia a dia
   - PostgreSQL, Nginx, PM2

---

## ✅ Status Atual

### VPS Backend (82.25.65.201):
- [x] Node.js 20 instalado
- [x] PM2 instalado
- [x] PostgreSQL 15 instalado e rodando
- [x] Banco `protese_capilar` criado
- [x] Usuário `protese_user` criado
- [x] DBeaver conectado via SSH Tunnel
- [ ] API criada
- [ ] Domínio configurado no CyberPanel
- [ ] SSL configurado

### VPS Frontend (45.132.157.28):
- [ ] A configurar

### Cloudflare:
- [ ] DNS configurado
- [ ] SSL configurado

---

## 🎯 Próximos Passos

1. Configurar DNS no Cloudflare
2. Aguardar propagação (2-4 horas)
3. Criar estrutura do backend
4. Deploy da API de teste
5. Configurar SSL na VPS Backend

---

*Documentação atualizada e organizada!* 📚
