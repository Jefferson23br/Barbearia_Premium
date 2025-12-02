# 🌐 Estrutura de Domínios - Sistema Prótese Capilar

## 🎯 Proposta de Organização

### Estrutura Recomendada (Subdomínios)

```
┌─────────────────────────────────────────────────────────┐
│                   seudominio.com                        │
│                                                         │
│  ┌─────────────┐  ┌─────────────┐  ┌──────────────┐  │
│  │     www     │  │     app     │  │     admin    │  │
│  │ Site Público│  │ Painel Cli. │  │ Painel Admin │  │
│  └─────────────┘  └─────────────┘  └──────────────┘  │
│                                                         │
│  ┌─────────────┐                                       │
│  │     api     │                                       │
│  │  Backend    │                                       │
│  │  Node.js    │                                       │
│  └─────────────┘                                       │
└─────────────────────────────────────────────────────────┘
```

### Domínios Específicos

| Subdomínio | Função | Tecnologia | Porta Interna |
|------------|--------|------------|---------------|
| `www.seudominio.com` ou `seudominio.com` | Site Público / Comercial | Next.js (Static) | - |
| `app.seudominio.com` | Painel do Cliente | Next.js (Static) | - |
| `admin.seudominio.com` | Painel Administrativo | Next.js (Static) | - |
| `api.seudominio.com` | API Backend | Node.js/NestJS | 3001 |

---

## ✅ Por Que Usar API com Domínio Próprio?

### 1. **Profissionalismo**
- ✅ URLs claras e profissionais
- ✅ Facilita identificação do serviço
- ✅ Melhor experiência para desenvolvedores que consomem a API

### 2. **Segurança**
- ✅ SSL/HTTPS dedicado para a API
- ✅ Controle total sobre certificados
- ✅ Headers de segurança específicos
- ✅ Rate limiting mais fácil de configurar

### 3. **Organização**
- ✅ Separação clara de responsabilidades
- ✅ Fácil gerenciamento e manutenção
- ✅ Escalabilidade futura (pode mover API para outro servidor)

### 4. **CORS e Políticas**
- ✅ Controle preciso sobre CORS
- ✅ Políticas de segurança específicas
- ✅ Facilita integração com outros sistemas

### 5. **Monitoramento**
- ✅ Logs separados por domínio
- ✅ Métricas específicas da API
- ✅ Facilita debug e troubleshooting

---

## 🔒 Segurança com Domínios Separados

### Vantagens de Segurança:

1. **Isolamento**: Cada domínio pode ter políticas de segurança diferentes
2. **Rate Limiting**: Configuração específica por tipo de serviço
3. **SSL Individual**: Certificados dedicados
4. **Firewall Granular**: Regras específicas por domínio
5. **Monitoramento**: Logs separados facilitam identificação de problemas

---

## 📋 Configuração de DNS (Hostinger)

No painel da Hostinger, adicionar:

```
Tipo    Nome        Valor                TTL
A       @           IP_DA_VPS            3600
A       www         IP_DA_VPS            3600
A       api         IP_DA_VPS            3600
A       app         IP_DA_VPS            3600
A       admin       IP_DA_VPS            3600
```

---

## 🔧 Arquitetura Final

```
Internet
    ↓
[Cloudflare/CDN] (opcional)
    ↓
[Nginx] → Load Balancer + SSL Termination
    ↓
    ├─→ api.seudominio.com → Node.js (Porta 3001)
    ├─→ www.seudominio.com → Next.js Static (/var/www/site-publico)
    ├─→ app.seudominio.com → Next.js Static (/var/www/painel-cliente)
    └─→ admin.seudominio.com → Next.js Static (/var/www/painel-admin)
            ↓
    [PostgreSQL] (localhost:5432)
```

---

## 🎯 Exemplo de URLs Finais

### Desenvolvimento
```
API:     http://localhost:3001
Frontend: http://localhost:3000
```

### Produção
```
API:     https://api.seudominio.com
Site:    https://www.seudominio.com
App:     https://app.seudominio.com
Admin:   https://admin.seudominio.com
```

---

## 📝 Configuração no Frontend

### Variáveis de Ambiente

```env
# Desenvolvimento
NEXT_PUBLIC_API_URL=http://localhost:3001

# Produção
NEXT_PUBLIC_API_URL=https://api.seudominio.com
```

---

## ✅ Checklist de Configuração

- [ ] DNS configurado na Hostinger
- [ ] Propagação DNS verificada
- [ ] Nginx configurado para cada domínio
- [ ] SSL configurado para cada domínio
- [ ] API rodando na porta 3001
- [ ] Frontends configurados para apontar para API
- [ ] Testes de conectividade realizados

---

**Estrutura profissional e escalável!** 🚀



