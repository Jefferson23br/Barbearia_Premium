# 📚 Documentação de Deploy - protesecapilarcuiaba.com.br

## 🎯 Informações do Projeto

- **Domínio**: protesecapilarcuiaba.com.br
- **API**: api.protesecapilarcuiaba.com.br
- **VPS**: Hostinger KVM 2 (AlmaLinux 9)
- **CDN**: Cloudflare
- **Acesso**: PowerShell via SSH

---

## 🚀 INÍCIO RÁPIDO

### Para Configuração via PowerShell:

👉 **[GUIA_VIA_POWERSHELL.md](./GUIA_VIA_POWERSHELL.md)** ⭐⭐⭐

**Este é o guia principal para configurar tudo via PowerShell!**

---

## 📖 Índice de Documentos

### 🔥 Guias Principais (COMECE AQUI)

1. **[GUIA_VIA_POWERSHELL.md](./GUIA_VIA_POWERSHELL.md)** ⭐⭐⭐
   - **PRINCIPAL:** Configuração completa via PowerShell
   - Cloudflare + VPS em um único documento
   - Passo a passo detalhado

2. **[PASSO_A_PASSO_COMPLETO.md](./PASSO_A_PASSO_COMPLETO.md)** ⭐⭐
   - Alternativa ao guia principal
   - Separado em seções

3. **[CHECKLIST_CONFIGURACAO_VPS.md](./CHECKLIST_CONFIGURACAO_VPS.md)** ⭐
   - Checklist para marcar progresso
   - Use enquanto configura

---

### ☁️ Cloudflare

4. **[CONFIGURACAO_CLOUDFLARE.md](./CONFIGURACAO_CLOUDFLARE.md)**
   - Configuração detalhada do Cloudflare
   - DNS, SSL, Performance, Segurança
   - Específico para protesecapilarcuiaba.com.br

---

### 🌐 Nginx e Domínios

5. **[ESTRUTURA_DOMINIOS.md](./ESTRUTURA_DOMINIOS.md)**
   - Explicação da estrutura de domínios
   - Por que API com domínio próprio
   - Arquitetura do sistema

6. **[TEMPLATES_NGINX.md](./TEMPLATES_NGINX.md)**
   - Templates genéricos de Nginx

📁 **Templates prontos (com domínio real):**
- `../../scripts/templates-nginx/api.conf`
- `../../scripts/templates-nginx/www.conf`
- `../../scripts/templates-nginx/app.conf`
- `../../scripts/templates-nginx/admin.conf`

---

### 🛡️ Segurança

7. **[SEGURANCA_VPS.md](./SEGURANCA_VPS.md)**
   - Guia completo de segurança
   - Boas práticas
   - Monitoramento

8. **[SETUP_VPS_POWERSHELL.md](./SETUP_VPS_POWERSHELL.md)**
   - Configuração via PowerShell
   - Específico para Windows

---

### 📚 Referência

9. **[GUIA_COMPLETO_VPS.md](./GUIA_COMPLETO_VPS.md)**
   - Guia genérico (sem domínio específico)

10. **[CONFIGURACAO_VPS.md](./CONFIGURACAO_VPS.md)**
    - Detalhes técnicos adicionais

11. **[RESUMO_CONFIGURACAO.md](./RESUMO_CONFIGURACAO.md)**
    - Comandos resumidos

---

## 🎯 Fluxo Recomendado

### 1️⃣ CLOUDFLARE (Interface Web)

1. Adicionar domínio ao Cloudflare
2. Configurar DNS (registros A)
3. Alterar nameservers no Registro.br
4. Aguardar propagação (2-4 horas)
5. Configurar SSL, Performance e Segurança

**Guia:** [CONFIGURACAO_CLOUDFLARE.md](./CONFIGURACAO_CLOUDFLARE.md)

### 2️⃣ VPS (PowerShell)

1. Conectar via SSH
2. Criar usuário seguro
3. Configurar chaves SSH
4. Instalar dependências
5. Configurar PostgreSQL
6. Configurar Nginx
7. Configurar SSL

**Guia:** [GUIA_VIA_POWERSHELL.md](./GUIA_VIA_POWERSHELL.md)

### 3️⃣ VERIFICAÇÃO

1. Marcar checklist
2. Testar todos os domínios
3. Verificar segurança

**Checklist:** [CHECKLIST_CONFIGURACAO_VPS.md](./CHECKLIST_CONFIGURACAO_VPS.md)

---

## 📋 Templates Prontos

Na pasta `scripts/templates-nginx/`:
- ✅ `api.conf` - API Backend
- ✅ `www.conf` - Site Público
- ✅ `app.conf` - Painel Cliente
- ✅ `admin.conf` - Painel Admin

**Todos com domínio real configurado!**

---

## ✅ Estrutura de Domínios

```
api.protesecapilarcuiaba.com.br     → Backend (Node.js :3001) [DNS Only]
app.protesecapilarcuiaba.com.br     → Painel Cliente [Proxied]
admin.protesecapilarcuiaba.com.br   → Painel Admin [Proxied]
www.protesecapilarcuiaba.com.br     → Site Público [Proxied]
```

---

*Documentação completa e pronta para uso!* 🚀



