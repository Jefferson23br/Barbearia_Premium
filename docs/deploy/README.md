# 🚀 Deploy - Sistema Barbearia Premium

Documentação completa para deploy do sistema em produção.

---

## 📋 Índice

1. [Guia de atualização (deploy)](./GUIA_ATUALIZACAO_DEPLOY.md) - Passo a passo para atualizar produção após `git pull`
2. [Comandos Essenciais](./COMANDOS_ESSENCIAIS.md) - Comandos úteis do dia a dia
3. [Arquitetura VPS](./ARQUITETURA_DUAS_VPS.md) - Estrutura do servidor
4. [Configuração DNS](./CONFIGURACAO_FINAL_DNS.md) - Setup de domínios
5. [VPS Backend](./VPS_BACKEND_COM_CYBERPANEL.md) - Configuração do backend
6. [VPS Frontend](./VPS_FRONTEND_45.md) - Configuração do frontend
7. [Segurança](./SEGURANCA_VPS.md) - Boas práticas de segurança
8. [Instalar API Teste](./INSTALAR_API_TESTE.md) - Setup inicial

---

## 🏗️ Arquitetura Atual

### VPS Backend (82.25.65.201)
- **IP**: 82.25.65.201
- **Sistema**: AlmaLinux 9
- **Painel**: CyberPanel
- **Serviços**:
  - PostgreSQL (configuração conforme ambiente de produção)
  - API Backend (Node.js + Express)
  - Nginx (proxy reverso)
- **Conta**: Hostinger (conta principal)

### VPS Frontend (45.132.157.28)
- **IP**: 45.132.157.28
- **Sistema**: AlmaLinux 9
- **Painel**: CyberPanel
- **Serviços**:
  - Nginx (servidor web estático)
  - Frontends (Next.js SSG)
- **Conta**: Hostinger (conta com domínio liberado)

---

## 🌐 URLs de Produção

- **Painel Admin**: https://appbarber.auctusconsultoria.com.br/admin
- **Painel Cliente**: https://appbarber.auctusconsultoria.com.br
- **Site Público**: https://appbarber.auctusconsultoria.com.br
- **API Backend**: https://api6.auctusconsultoria.com.br

---

## 📚 Documentação Rápida

### Comandos Mais Usados

**Conectar ao servidor Backend:**
```bash
ssh root@82.25.65.201
# ou
ssh root@srv842883.hostinger.com.br
```

**Conectar ao servidor Frontend:**
```bash
ssh root@45.132.157.28
```

**Backend:**
```bash
pm2 restart api-barbearia-premium
pm2 logs api-barbearia-premium
```

**Frontend:**
```bash
# Build local
cd frontend/painel-admin
npm run build

# Upload para VPS Frontend
scp -r out/* root@45.132.157.28:/home/cyberpanel/app/frontend-admin/
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

**Última Atualização**: 21 de Dezembro de 2025
