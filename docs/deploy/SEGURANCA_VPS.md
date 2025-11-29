# 🛡️ Guia Completo de Segurança da VPS

## 🔒 Medidas de Segurança Implementadas

### 1. Autenticação SSH Segura

✅ **Configurado:**
- Autenticação por chave SSH (sem senha)
- Login root desabilitado
- Porta SSH padrão (22) ou customizada
- fail2ban para proteção contra força bruta

### 2. Firewall (firewalld)

✅ **Portas Abertas:**
- 22 (SSH) - somente IPs autorizados (recomendado)
- 80 (HTTP) - redireciona para HTTPS
- 443 (HTTPS) - tráfego seguro
- 3001 (API Backend) - via proxy reverso Nginx

✅ **Portas Fechadas:**
- 5432 (PostgreSQL) - somente localhost
- Todas as outras portas não essenciais

### 3. SSL/HTTPS (Let's Encrypt)

✅ **Certificados:**
- Certificados SSL gratuitos
- Renovação automática
- HTTPS obrigatório (redirecionamento HTTP → HTTPS)

### 4. fail2ban

✅ **Proteção:**
- Bloqueia IPs após tentativas de login falhadas
- Proteção para SSH e outros serviços
- Logs de tentativas de acesso

### 5. PostgreSQL Seguro

✅ **Configuração:**
- Acesso somente via localhost
- Usuário específico para aplicação
- Senhas fortes
- Sem acesso externo direto

---

## 🔐 Boas Práticas Implementadas

### 1. Usuário Não-Root

```bash
# Sempre usar usuário não-root
ssh desenvolvedor@IP_DA_VPS

# Para comandos administrativos, usar sudo
sudo comando
```

### 2. Senhas Fortes

- Mínimo 16 caracteres
- Mistura de letras, números e símbolos
- Únicas para cada serviço
- Armazenadas em gerenciador de senhas

### 3. Atualizações Automáticas

```bash
# Configurar atualizações automáticas de segurança
sudo dnf install -y dnf-automatic
sudo systemctl enable --now dnf-automatic.timer
```

### 4. Monitoramento de Logs

```bash
# Ver logs de autenticação
sudo journalctl -u sshd -f

# Ver logs do fail2ban
sudo fail2ban-client status sshd

# Ver logs do Nginx
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### 5. Backups Automáticos

```bash
# Instalar ferramenta de backup
sudo dnf install -y rsync

# Configurar backup do banco de dados (ver script de backup)
```

---

## 🚨 Proteções Adicionais Recomendadas

### 1. Limitar Acesso SSH por IP (Opcional mas Recomendado)

```bash
# No firewall, permitir SSH apenas de IPs específicos
sudo firewall-cmd --permanent --add-rich-rule='rule family="ipv4" source address="SEU_IP_AQUI" port protocol="tcp" port="22" accept'
sudo firewall-cmd --reload
```

### 2. Mudar Porta SSH (Opcional)

```bash
# Editar /etc/ssh/sshd_config
Port 2222  # Mudar para porta diferente

# No firewall
sudo firewall-cmd --permanent --add-port=2222/tcp
sudo firewall-cmd --permanent --remove-service=ssh
sudo firewall-cmd --reload
sudo systemctl restart sshd
```

### 3. Configurar Rate Limiting no Nginx

Já configurado nos arquivos de configuração do Nginx para a API.

### 4. Instalar e Configurar ModSecurity (Opcional)

Para proteção adicional contra ataques web:

```bash
sudo dnf install -y mod_security mod_security_crs
```

---

## 📊 Monitoramento e Alertas

### 1. Verificar Status dos Serviços

```bash
# Status geral
sudo systemctl status firewalld
sudo systemctl status fail2ban
sudo systemctl status nginx
sudo systemctl status postgresql-15

# Ver processos PM2
pm2 status
pm2 logs
```

### 2. Verificar Tentativas de Ataque

```bash
# Ver IPs bloqueados pelo fail2ban
sudo fail2ban-client status sshd

# Ver últimas tentativas de login SSH
sudo grep "Failed password" /var/log/secure | tail -20

# Ver acessos ao servidor
sudo tail -f /var/log/nginx/access.log | grep -v "200"
```

---

## 🔄 Rotina de Manutenção

### Semanal
- [ ] Verificar logs de segurança
- [ ] Verificar espaço em disco
- [ ] Verificar backups

### Mensal
- [ ] Atualizar sistema
- [ ] Revisar configurações de segurança
- [ ] Testar restore de backups

---

## 📝 Checklist de Segurança

- [x] Usuário não-root criado
- [x] Chaves SSH configuradas
- [x] Root login desabilitado
- [x] Firewall configurado e ativo
- [x] fail2ban instalado e ativo
- [x] SSL/HTTPS configurado
- [x] PostgreSQL acessível apenas localhost
- [x] Senhas fortes configuradas
- [ ] Backups automáticos configurados
- [ ] Monitoramento configurado
- [ ] Documentação de credenciais

---

**Segurança é um processo contínuo!** 🔐


