# 🚀 Deploy - Sistema Prótese Capilar

Documentação completa para deploy do sistema em produção.

---

## 📋 Índice

1. [Comandos Essenciais](./COMANDOS_ESSENCIAIS.md) - Comandos úteis do dia a dia
2. [Arquitetura VPS](./ARQUITETURA_DUAS_VPS.md) - Estrutura do servidor
3. [Configuração DNS](./CONFIGURACAO_FINAL_DNS.md) - Setup de domínios
4. [VPS Backend](./VPS_BACKEND_COM_CYBERPANEL.md) - Configuração do backend
5. [VPS Frontend](./VPS_FRONTEND_45.md) - Configuração do frontend
6. [Segurança](./SEGURANCA_VPS.md) - Boas práticas de segurança
7. [Instalar API Teste](./INSTALAR_API_TESTE.md) - Setup inicial

---

## 🏗️ Arquitetura Atual

### VPS Backend (srv842883)
- **IP**: Ver documentação de DNS
- **Sistema**: AlmaLinux 9
- **Painel**: CyberPanel
- **Serviços**:
  - PostgreSQL
  - API Backend (Node.js + Express)
  - Nginx (proxy reverso)

### VPS Frontend (45.132.x.x)
- **IP**: Ver documentação de DNS
- **Sistema**: AlmaLinux 9
- **Painel**: CyberPanel
- **Serviços**:
  - Nginx (servidor web estático)
  - Frontends (Next.js SSG)

---

## 🌐 URLs de Produção

- **Painel Admin**: https://admin.protesecapilarcuiaba.com.br
- **Painel Cliente**: https://app.protesecapilarcuiaba.com.br
- **Site Público**: https://www.protesecapilarcuiaba.com.br
- **API Backend**: https://api.protesecapilarcuiaba.com.br

---

## 📚 Documentação Rápida

### Comandos Mais Usados

**Conectar ao servidor:**
```bash
ssh root@srv842883.hostinger.com.br
```

**Backend:**
```bash
pm2 restart api-protese-capilar
pm2 logs api-protese-capilar
```

**Frontend:**
```bash
# Build local
cd frontend/painel-admin
npm run build

# Upload para VPS
scp -r out/* root@45.132.x.x:/home/protesecapilarcuiaba.com/public_html/
```

---

## 🔐 Credenciais

**⚠️ IMPORTANTE**: Credenciais devem estar seguras e não versionadas!

- Credenciais de banco: Ver `.env` no servidor
- Credenciais SSH: Manter em local seguro
- Credenciais CyberPanel: Documentar separadamente

---

## 📝 Checklist de Deploy

### Antes de Fazer Deploy
- [ ] Testar localmente
- [ ] Verificar variáveis de ambiente
- [ ] Build sem erros
- [ ] Backup do banco de dados

### Após Deploy
- [ ] Verificar logs (PM2)
- [ ] Testar endpoints principais
- [ ] Verificar SSL/HTTPS
- [ ] Testar em produção

---

## 🆘 Suporte

Em caso de problemas:
1. Verificar logs do PM2
2. Verificar logs do Nginx
3. Verificar conexão com banco
4. Verificar variáveis de ambiente

---

*Documentação mantida atualizada para facilitar deploy e manutenção* 🚀
