# 🎨 Frontend - Prótese Capilar Cuiabá

## 📁 Projetos Frontend

```
frontend/
├── site-entrada/      ✅ Página inicial "Em Desenvolvimento"
├── painel-cliente/    ✅ Painel do Cliente
├── painel-admin/      ✅ Painel Administrativo
└── site-publico/      🔄 Site comercial completo (futuro)
```

---

## 🌐 URLs de Produção

| Projeto | URL | Porta Dev |
|---------|-----|-----------|
| Site de Entrada | https://www.protesecapilarcuiaba.com.br | 3002 |
| Painel Cliente | https://app.protesecapilarcuiaba.com.br | 3000 |
| Painel Admin | https://admin.protesecapilarcuiaba.com.br | 3000 |

---

## 🚀 Execução Local

### Site de Entrada
```bash
cd site-entrada
npm install
npm run dev
# Acesse: http://localhost:3002
```

### Painel do Cliente
```bash
cd painel-cliente
npm install
npm run dev
# Acesse: http://localhost:3000
```

### Painel Administrativo
```bash
cd painel-admin
npm install
npm run dev
# Acesse: http://localhost:3000
```

---

## 🛠️ Stack Tecnológica

- **Framework**: Next.js 14
- **UI**: React 18
- **Linguagem**: TypeScript
- **Estilização**: Tailwind CSS
- **Componentes**: Radix UI
- **Animações**: Motion (Framer Motion)
- **Ícones**: Lucide React

---

## 📦 Build para Produção

```bash
# Em qualquer projeto
npm run build

# Gera pasta out/ com arquivos estáticos
# Copiar conteúdo de out/ para VPS Frontend (45.132.157.28)
```

---

## 🔗 Conexão com API

Todos os frontends se conectam à API:

```
URL da API: https://api.protesecapilarcuiaba.com.br
```

Configurar em `.env.local`:

```env
NEXT_PUBLIC_API_URL=https://api.protesecapilarcuiaba.com.br
```

---

## 📋 Funcionalidades

### Site de Entrada ✅
- Animação de "Em Desenvolvimento"
- Links para Área de Cliente e Admin
- Design moderno e responsivo

### Painel Cliente ✅
- Login com email e senha
- Registro de novos clientes
- Recuperação de senha
- Checkbox "Manter conectado"
- Inputs com fundo branco (visível)

### Painel Admin ✅
- Login administrativo
- Mesmas funcionalidades do painel cliente
- Interface diferenciada para admin

---

## 🌐 Deploy (VPS Frontend)

1. Fazer build: `npm run build`
2. Copiar pasta `out/` para VPS (45.132.157.28):
   ```
   site-entrada → /var/www/site-entrada/
   painel-cliente → /var/www/painel-cliente/
   painel-admin → /var/www/painel-admin/
   ```

---

*Todos os projetos frontend prontos para desenvolvimento!* 🎨
