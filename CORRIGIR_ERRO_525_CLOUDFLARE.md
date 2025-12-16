# 🔧 Como Corrigir Erro 525 - SSL Handshake Failed

**Problema**: Erro 525 do Cloudflare ao acessar `app.protesecapilarcuiaba.com.br` e `admin.protesecapilarcuiaba.com.br`

**Causa**: O Cloudflare está tentando fazer conexão SSL com o servidor de origem (Hostinger), mas o servidor não está respondendo corretamente na porta 443.

---

## ✅ Solução Rápida: Configurar SSL/TLS como "Flexible"

### Passo 1: Acessar Configurações SSL/TLS no Cloudflare

1. Faça login no painel do Cloudflare
2. Selecione o domínio `protesecapilarcuiaba.com.br`
3. No menu lateral, clique em **SSL/TLS**
4. Clique em **Overview** (Visão Geral)

### Passo 2: Alterar Modo de Encriptação

Você verá uma seção chamada **"Encryption mode"** (Modo de Encriptação) com as seguintes opções:

- **Off** - Desligado (não recomendado)
- **Flexible** - Flexível ⭐ **RECOMENDADO PARA SEU CASO**
- **Full** - Completo (requer SSL no servidor)
- **Full (strict)** - Completo estrito (requer SSL válido no servidor)

**Ação**: Selecione **"Flexible"** e salve.

### O que isso faz?

- ✅ Cliente → Cloudflare: **HTTPS** (criptografado)
- ✅ Cloudflare → Servidor: **HTTP** (não criptografado, mas aceito pelo servidor)

Isso resolve o erro 525 porque o Cloudflare não tentará mais fazer handshake SSL com o servidor de origem.

---

## 🔄 Alternativa: Desativar Proxy do Cloudflare

Se a solução acima não funcionar, você pode desativar o Proxy do Cloudflare:

### Passo 1: Acessar DNS no Cloudflare

1. No painel do Cloudflare, clique em **DNS**
2. Encontre os registros:
   - `admin` (A record → 45.132.157.28)
   - `app` (A record → 45.132.157.28)

### Passo 2: Desativar Proxy

1. Clique no ícone da **nuvem laranja** (Proxied) ao lado de cada registro
2. A nuvem ficará **cinza** (DNS only)
3. Salve as alterações

**⚠️ Atenção**: Isso remove a proteção DDoS e CDN do Cloudflare para esses subdomínios.

---

## 🔐 Solução Definitiva: Configurar SSL no Servidor Hostinger

Para uma solução mais segura e definitiva, configure SSL no servidor de origem:

### Opção A: Via Painel Hostinger (CyberPanel)

1. Acesse o CyberPanel no servidor Hostinger
2. Vá em **SSL** → **Issue SSL**
3. Selecione o domínio e emita um certificado Let's Encrypt
4. Configure o Nginx/Apache para usar HTTPS na porta 443

### Opção B: Via Let's Encrypt Manual

```bash
# Conecte-se ao servidor via SSH
ssh usuario@45.132.157.28

# Instale certbot (se não tiver)
sudo apt update
sudo apt install certbot python3-certbot-nginx

# Emita certificado para os subdomínios
sudo certbot --nginx -d admin.protesecapilarcuiaba.com.br
sudo certbot --nginx -d app.protesecapilarcuiaba.com.br
```

Depois, no Cloudflare, configure SSL/TLS como **"Full"** ou **"Full (strict)"**.

---

## 📋 Checklist de Verificação

Após aplicar a solução, verifique:

- [ ] Acesse `https://app.protesecapilarcuiaba.com.br` - deve carregar sem erro 525
- [ ] Acesse `https://admin.protesecapilarcuiaba.com.br` - deve carregar sem erro 525
- [ ] Verifique se o site está funcionando corretamente
- [ ] Verifique se as imagens e assets estão carregando
- [ ] Verifique se a API está sendo chamada corretamente (console do navegador)

---

## 🐛 Troubleshooting

### Ainda aparece erro 525 após configurar "Flexible"?

1. **Aguarde alguns minutos** - Mudanças no Cloudflare podem levar até 5 minutos para propagar
2. **Limpe o cache do Cloudflare**: SSL/TLS → Edge Certificates → Clear Cache
3. **Limpe o cache do navegador**: Ctrl+Shift+R (Windows) ou Cmd+Shift+R (Mac)
4. **Verifique se o servidor está respondendo**: Acesse `http://45.132.157.28` diretamente (sem HTTPS)

### O site carrega mas aparece "Não seguro"?

Isso é normal com SSL "Flexible". Para resolver, configure SSL no servidor e mude para "Full" no Cloudflare.

---

## 📞 Informações Importantes

**Servidor Frontend**: 45.132.157.28 (Hostinger)  
**Servidor Backend/API**: 82.25.65.201 (Hostinger)

**URLs:**
- Site Principal: https://www.protesecapilarcuiaba.com.br
- Painel Cliente: https://app.protesecapilarcuiaba.com.br
- Painel Admin: https://admin.protesecapilarcuiaba.com.br
- API Backend: https://api.protesecapilarcuiaba.com.br

---

**Última atualização**: 14 de Dezembro de 2025


