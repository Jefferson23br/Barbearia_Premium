# 🏗️ Arquitetura Final do Sistema

## 🎯 Estrutura Recomendada (Sua Ideia está CORRETA!)

```
┌─────────────────────────────────────────────────────────────────────┐
│                          USUÁRIOS                                   │
│                             ↓                                       │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│                      CLOUDFLARE (DNS)                               │
│                                                                     │
│  DNS direciona cada subdomínio para o lugar certo:                 │
│                                                                     │
│  www.* app.* admin.*  →  Vercel (CNAME)                            │
│  api.*                →  VPS (IP direto)                            │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
                    ┌─────────┴─────────┐
                    ↓                   ↓
┌──────────────────────────┐  ┌──────────────────────────┐
│   VERCEL (GRÁTIS!)       │  │   VPS HOSTINGER (PAGO)   │
│   CDN Global             │  │   AlmaLinux 9            │
│                          │  │                          │
│  www.* → Site Entrada    │  │  api.* → Backend         │
│  app.* → Painel Cliente  │  │    ↓                     │
│  admin.* → Painel Admin  │  │  Node.js (porta 3001)    │
│                          │  │    ↓                     │
│  [Arquivos Estáticos]    │  │  PostgreSQL (localhost)  │
│  [HTML + CSS + JS]       │  │  [Banco de Dados]        │
└──────────────────────────┘  └──────────────────────────┘
```

---

## 📝 Explicação Simples

### Frontend (3 sites):

**Onde ficam os arquivos?**
- ❌ Não ficam na VPS
- ✅ Ficam na Vercel (GitHub → Vercel)

**Como funcionam os subdomínios?**
1. No Cloudflare você cria um registro CNAME:
   ```
   app → cname.vercel-dns.com
   ```
2. Vercel recebe a requisição
3. Vercel serve os arquivos do seu GitHub

**É tipo HTML?**
- Não! É melhor:
  - HTML = arquivo solto
  - Vercel = CDN global + SSL + Deploy automático

### Backend (API):

**Onde fica?**
- ✅ VPS Hostinger

**Como funciona o subdomínio?**
1. No Cloudflare você cria um registro A:
   ```
   api → IP_DA_VPS
   ```
2. VPS recebe a requisição
3. Nginx direciona para Node.js (porta 3001)
4. API responde

---

## 🔧 Configuração Prática

### GitHub (Repositório Privado):

```
protese-capilar-cuiaba/
├── frontend/
│   ├── site-entrada/
│   ├── painel-cliente/
│   └── painel-admin/
└── backend/
```

### Cloudflare (DNS):

```
A      api     → IP_DA_VPS              (direto para VPS)
CNAME  www     → cname.vercel-dns.com   (para Vercel)
CNAME  app     → cname.vercel-dns.com   (para Vercel)
CNAME  admin   → cname.vercel-dns.com   (para Vercel)
```

### Vercel (Frontend):

- 3 projetos separados
- Cada um com seu domínio
- Deploy automático ao fazer `git push`

### VPS (Backend):

- Apenas API e PostgreSQL
- Configuração única (não muda sempre)
- Deploy manual quando necessário

---

## ✅ Vantagens desta Arquitetura

### 1. Economia
- VPS só para backend (usa menos recursos)
- Frontend grátis na Vercel

### 2. Performance
- Frontend em CDN global (rápido)
- API dedicada na VPS

### 3. Segurança
- PostgreSQL isolado (só API acessa)
- Frontend separado do banco

### 4. Manutenção
- Deploy frontend: `git push` (automático)
- Deploy backend: Manual (quando necessário)

---

## 🚀 Resposta Direta à Sua Pergunta

**Pergunta:** "Os subdomínios vão direto igual HTML?"

**Resposta:** NÃO. Você precisa:

1. **Cadastrar no DNS** (Cloudflare):
   ```
   app → cname.vercel-dns.com (se usar Vercel)
   OU
   app → IP_DA_VPS (se colocar tudo na VPS)
   ```

2. **Aguardar propagação** (2-4 horas)

3. **Configurar o destino**:
   - Vercel: Adicionar domínio customizado
   - VPS: Configurar Nginx

**Não é automático como criar arquivo.html**, mas é MUITO melhor:
- URLs profissionais
- SSL gratuito
- Controle total
- Escalável

---

## 📋 Checklist de Deploy

### GitHub:
- [ ] Repositório criado (pode ser privado)
- [ ] Código enviado

### Cloudflare:
- [ ] Registros DNS configurados
- [ ] SSL mode: Full (strict)

### Vercel:
- [ ] Projeto do site-entrada criado e domínio www.* configurado
- [ ] Projeto do painel-cliente criado e domínio app.* configurado
- [ ] Projeto do painel-admin criado e domínio admin.* configurado

### VPS:
- [ ] API rodando (porta 3001)
- [ ] PostgreSQL configurado
- [ ] Nginx configurado para API
- [ ] SSL configurado para API

---

**Resumo:** API na VPS, Frontend na Vercel (melhor custo-benefício!)** 🎯

