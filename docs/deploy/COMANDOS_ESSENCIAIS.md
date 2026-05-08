# ⚡ Comandos Essenciais - VPS via PowerShell

## 🔐 SSH

```powershell
# Conectar na VPS
ssh root@82.25.65.201

# Conectar na VPS pasta
cd /home/cyberpanel/app/backend

# Copiar arquivo para VPS
scp server.js root@82.25.65.201:/home/cyberpanel/app/backend

# Copiar pasta para VPS
scp -r C:\Users\vivo\Barbearia_Premium\backend\ root@82.25.65.201:/home/cyberpanel/app/

# Download de arquivo da VPS
scp root@82.25.65.201:/caminho/arquivo.txt .\local\
```

---

## 🗄️ PostgreSQL

```bash
# Conectar no banco
psql -h localhost -U barbearia_user -d barbearia_premium

# Conectar como postgres
sudo -u postgres psql

# Comandos SQL úteis
\l                    # Listar bancos
\c barbearia_premium    # Conectar em banco
\dt                   # Listar tabelas
\d nome_tabela        # Descrever tabela
\q                    # Sair
```

---

## 🌐 Nginx

```bash
# Testar configuração
sudo nginx -t

# Recarregar configuração
sudo systemctl reload nginx

# Reiniciar Nginx
sudo systemctl restart nginx

# Ver status
sudo systemctl status nginx

# Ver logs em tempo real
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/api.access.log
```

---

## 🔄 PM2

```bash
# Ver status
pm2 status

# Ver logs
pm2 logs

# Ver logs de app específico
pm2 logs api-barbearia-premium

# Reiniciar app
pm2 restart api-barbearia-premium

# Parar app
pm2 stop api-barbearia-premium

# Iniciar app
pm2 start api-barbearia-premium

# Deletar app
pm2 delete api-barbearia-premium

# Salvar configuração
pm2 save
```

---

## 🔥 Firewall

```bash
# Ver regras ativas
sudo firewall-cmd --list-all

# Adicionar porta
sudo firewall-cmd --permanent --add-port=3002/tcp
sudo firewall-cmd --reload

# Remover porta
sudo firewall-cmd --permanent --remove-port=3002/tcp
sudo firewall-cmd --reload

# Ver IPs bloqueados pelo fail2ban
sudo fail2ban-client status sshd
```

---

## 📊 Monitoramento

```bash
# Ver uso de recursos
htop

# Ver espaço em disco
df -h

# Ver uso de memória
free -h

# Ver processos rodando
ps aux | grep node

# Ver portas abertas
sudo netstat -tlnp
```

---

## 🔐 SSL/HTTPS

```bash
# Ver certificados instalados
sudo certbot certificates

# Renovar certificados manualmente
sudo certbot renew

# Testar renovação
sudo certbot renew --dry-run

# Ver status do timer de renovação
sudo systemctl status certbot.timer
```

---

## 🗂️ Arquivos e Pastas

```bash
# Navegar para backend
cd /home/desenvolvedor/app/backend

# Navegar para www
cd /var/www/painel-cliente

# Permissões
sudo chown -R desenvolvedor:desenvolvedor /home/desenvolvedor/app
sudo chmod -R 755 /var/www
```

---

## 🔄 Serviços

```bash
# Reiniciar todos os serviços principais
sudo systemctl restart nginx
sudo systemctl restart postgresql-15
sudo systemctl restart firewalld

# Ver status de todos
sudo systemctl status nginx postgresql-15 firewalld fail2ban
```

---

## 📝 Backup Rápido

```bash
# Backup do banco de dados
pg_dump -h localhost -U barbearia_user barbearia_premium > backup_$(date +%Y%m%d).sql

# Restaurar banco
psql -h localhost -U barbearia_user barbearia_premium < backup_20250101.sql
```

---

*Comandos prontos para copiar e colar!* ⚡


## 🔒 Segurança

Nunca versionar senhas, hashes de credenciais, tokens e chaves privadas em arquivos `.md` ou no repositório.
