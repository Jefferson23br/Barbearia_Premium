# ✅ Checklist de Configuração da VPS

## 📋 Use este checklist para acompanhar o progresso

---

## 🔐 SEGURANÇA BÁSICA

- [ ] Conectado via SSH como root
- [ ] Usuário não-root criado (`desenvolvedor`)
- [ ] Usuário adicionado ao grupo `wheel`
- [ ] Chaves SSH geradas no computador local
- [ ] Chave SSH copiada para o servidor (`ssh-copy-id`)
- [ ] Acesso testado sem senha
- [ ] SSH configurado para usar apenas chaves
- [ ] Root login desabilitado no SSH
- [ ] Senha SSH desabilitada no SSH
- [ ] Teste de reconexão após alterações SSH

---

## 🛡️ FIREWALL

- [ ] Firewalld iniciado e habilitado
- [ ] Porta 22 (SSH) aberta
- [ ] Porta 80 (HTTP) aberta
- [ ] Porta 443 (HTTPS) aberta
- [ ] Porta 3001 (API) aberta
- [ ] Firewall recarregado
- [ ] Regras verificadas (`firewall-cmd --list-all`)

---

## 🔧 INSTALAÇÕES

- [ ] Sistema atualizado
- [ ] Ferramentas básicas instaladas (curl, wget, git, nano)
- [ ] Node.js 20 LTS instalado
- [ ] NPM funcionando
- [ ] PM2 instalado globalmente
- [ ] PM2 configurado para iniciar no boot
- [ ] PostgreSQL 15 instalado
- [ ] PostgreSQL iniciado e habilitado
- [ ] Nginx instalado
- [ ] Nginx iniciado e habilitado
- [ ] Certbot instalado
- [ ] fail2ban instalado e ativo

---

## 🗄️ POSTGRESQL

- [ ] Banco de dados `protese_capilar` criado
- [ ] Usuário `protese_user` criado
- [ ] Senha forte definida para o usuário
- [ ] Permissões concedidas
- [ ] `pg_hba.conf` configurado para localhost
- [ ] PostgreSQL reiniciado
- [ ] Conexão testada

---

## 🌐 DNS (No painel da Hostinger)

- [ ] Registro A: `api.seudominio.com` → IP da VPS
- [ ] Registro A: `app.seudominio.com` → IP da VPS
- [ ] Registro A: `admin.seudominio.com` → IP da VPS
- [ ] Registro A: `www.seudominio.com` → IP da VPS
- [ ] Registro A: `seudominio.com` → IP da VPS
- [ ] Propagação DNS verificada (pode levar alguns minutos)

---

## 🔧 NGINX

- [ ] Configuração da API criada (`/etc/nginx/conf.d/api.conf`)
- [ ] Configuração do Site Público criada
- [ ] Configuração do Painel Cliente criada
- [ ] Configuração do Painel Admin criada (quando necessário)
- [ ] Sintaxe do Nginx testada (`nginx -t`)
- [ ] Nginx recarregado

---

## 🔐 SSL/HTTPS

- [ ] Certificado SSL gerado para `api.seudominio.com`
- [ ] Certificado SSL gerado para `www.seudominio.com`
- [ ] Certificado SSL gerado para `app.seudominio.com`
- [ ] Certificado SSL gerado para `admin.seudominio.com`
- [ ] Renovação automática testada (`certbot renew --dry-run`)
- [ ] HTTPS funcionando em todos os domínios

---

## 📁 ESTRUTURA DE DIRETÓRIOS

- [ ] `/var/www/site-publico` criado
- [ ] `/var/www/painel-cliente` criado
- [ ] `/var/www/painel-admin` criado
- [ ] `/home/desenvolvedor/app/backend` criado
- [ ] `/home/desenvolvedor/app/frontend` criado
- [ ] Permissões configuradas corretamente

---

## ✅ VERIFICAÇÕES FINAIS

- [ ] Todos os serviços rodando
- [ ] Firewall ativo e funcionando
- [ ] fail2ban ativo e funcionando
- [ ] SSL funcionando em todos os domínios
- [ ] Acesso SSH seguro testado
- [ ] Backup das credenciais feito
- [ ] Documentação atualizada

---

## 📝 CREDENCIAIS ARMAZENADAS

- [ ] Senha do PostgreSQL salva
- [ ] Chave SSH privada guardada
- [ ] IP da VPS anotado
- [ ] Domínios registrados anotados
- [ ] Informações de acesso guardadas em local seguro

---

**Data de conclusão:** ___________________

---

*Marque cada item conforme for completando a configuração*



