# 🖥️ Preparação para VPS Hostinger - AlmaLinux 9

## 📋 Especificações da VPS

- **Tipo**: KVM 2
- **Sistema Operacional**: AlmaLinux 9
- **Uso**: Backend Node.js + PostgreSQL

---

## 🔧 Configuração Inicial (Será executado na VPS)

### 1. Atualizar Sistema

```bash
sudo dnf update -y
```

### 2. Instalar Node.js (via NodeSource)

```bash
# Instalar Node.js 20 LTS
curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
sudo dnf install -y nodejs
```

### 3. Instalar PostgreSQL

```bash
sudo dnf install -y postgresql15-server postgresql15
sudo postgresql-15-setup --initdb
sudo systemctl enable postgresql-15
sudo systemctl start postgresql-15
```

### 4. Instalar Nginx

```bash
sudo dnf install -y nginx
sudo systemctl enable nginx
sudo systemctl start nginx
```

### 5. Instalar PM2 (Process Manager)

```bash
sudo npm install -g pm2
```

### 6. Configurar Firewall

```bash
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --permanent --add-service=ssh
sudo firewall-cmd --reload
```

---

## 📁 Estrutura de Deploy na VPS

```
/home/usuario/
├── app/
│   ├── backend/          # Aplicação Node.js
│   └── frontend/         # Build do Next.js
├── nginx/
│   └── sites-available/  # Configurações Nginx
└── scripts/              # Scripts de deploy
```

---

## 🔐 Configurações de Segurança

- [ ] Configurar usuário não-root
- [ ] Configurar chaves SSH
- [ ] Desabilitar login root
- [ ] Configurar fail2ban
- [ ] Configurar SSL (Let's Encrypt)

---

## 📝 Próximos Passos

1. Aguardar estrutura do backend
2. Criar scripts de deploy
3. Configurar CI/CD (opcional)
4. Documentar processo completo

---

*Documento será atualizado conforme o desenvolvimento avança*


