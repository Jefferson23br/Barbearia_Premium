# 🎨 Frontend - Sistema Prótese Capilar

Projetos frontend desenvolvidos com Next.js 14 (App Router), TypeScript e Tailwind CSS.

---

## 📁 Estrutura

```
frontend/
├── painel-admin/       # Painel Administrativo (Produção)
├── painel-cliente/     # Painel do Cliente (Produção)
└── site-entrada/       # Site Público (Desenvolvimento)
```

---

## 🚀 Projetos

### 1. Painel Administrativo (`painel-admin/`)

**Status**: ✅ Em Produção  
**URL**: https://admin.protesecapilarcuiaba.com.br

**Funcionalidades:**
- ✅ Sistema de login e autenticação
- ✅ Dashboard administrativo
- ✅ Sistema de permissões granular (RBAC)
- ✅ Gerenciamento de Funcionários
- ✅ Gerenciamento de Clientes/Usuários
- ✅ Controle de Permissões
- ✅ Controle de Acessos (logs de login)
- ✅ Help Desk (estrutura básica)
- ✅ Controle de Logs (estrutura básica)

**Porta de desenvolvimento**: `3000`

---

### 2. Painel Cliente (`painel-cliente/`)

**Status**: ✅ Em Produção  
**URL**: https://app.protesecapilarcuiaba.com.br

**Funcionalidades:**
- ✅ Sistema de login e autenticação
- ✅ Dashboard básico
- ✅ Cadastro de cliente

**Porta de desenvolvimento**: `3001`

---

### 3. Site de Entrada (`site-entrada/`)

**Status**: 🔄 Em Desenvolvimento  
**URL**: https://www.protesecapilarcuiaba.com.br

**Funcionalidades:**
- [ ] Site institucional
- [ ] Catálogo de serviços
- [ ] Sistema de compra

**Porta de desenvolvimento**: `3002`

---

## 🛠️ Tecnologias

- **Framework**: Next.js 14 (App Router)
- **Linguagem**: TypeScript
- **Estilização**: Tailwind CSS
- **Componentes UI**: Radix UI (shadcn/ui)
- **Animações**: Framer Motion
- **Ícones**: Lucide React
- **Formulários**: React Hook Form
- **Validação**: Zod

---

## 📦 Instalação

### Pré-requisitos
- Node.js 20+
- npm ou yarn

### Instalar dependências de um projeto

```bash
cd frontend/painel-admin  # ou painel-cliente ou site-entrada
npm install
```

---

## 🏃 Desenvolvimento

### Executar em desenvolvimento

```bash
# Painel Admin
cd frontend/painel-admin
npm run dev
# Acesse: http://localhost:3000

# Painel Cliente
cd frontend/painel-cliente
npm run dev
# Acesse: http://localhost:3001

# Site Entrada
cd frontend/site-entrada
npm run dev
# Acesse: http://localhost:3002
```

---

## 🏗️ Build para Produção

### Build estático (SSG)

```bash
npm run build
```

Os arquivos serão gerados na pasta `out/`.

### Deploy

```bash
# Usar script de deploy
./deploy.sh

# Ou manualmente
npm run build
scp -r out/* root@servidor:/caminho/destino/
```

---

## 📚 Estrutura de Componentes

### Componentes Compartilhados

Todos os projetos compartilham a mesma estrutura de componentes UI (shadcn/ui):
- `components/ui/` - Componentes base (Button, Input, Card, etc.)
- `components/admin/` - Componentes específicos do admin
- `components/figma/` - Componentes customizados

### Hooks Customizados

- `hooks/usePermissions.ts` - Hook para verificar permissões do usuário

---

## 🔐 Autenticação

### Painel Admin
- Login em: `/`
- Dashboard em: `/dashboard`
- Dados salvos em `localStorage` como `admin`
- Permissões salvas em `localStorage` como `permissoes`

### Painel Cliente
- Login em: `/`
- Dashboard em: `/dashboard`
- Dados salvos em `localStorage` como `cliente`

---

## 🌐 Variáveis de Ambiente

Criar arquivo `.env.local` em cada projeto:

```env
# API Backend
NEXT_PUBLIC_API_URL=https://api.protesecapilarcuiaba.com.br
```

---

## 📝 Convenções

### Nomenclatura
- Componentes: PascalCase (`DashboardLayout.tsx`)
- Hooks: camelCase com prefixo `use` (`usePermissions.ts`)
- Páginas: `page.tsx` (Next.js App Router)
- Estilos: Tailwind CSS classes

### Estrutura de Páginas
```
src/app/
├── page.tsx              # Página inicial (login)
├── layout.tsx            # Layout raiz
└── dashboard/
    ├── layout.tsx        # Layout do dashboard
    ├── page.tsx          # Dashboard principal
    └── [module]/
        └── page.tsx      # Páginas de módulos
```

---

## 🐛 Debugging

### Verificar permissões
```javascript
// No console do navegador
console.log(JSON.parse(localStorage.getItem('permissoes')))
console.log(JSON.parse(localStorage.getItem('admin')))
```

### Verificar chamadas API
- Abrir DevTools (F12)
- Aba Network
- Filtrar por XHR/Fetch

---

## 📚 Documentação Adicional

- [README Painel Admin](./painel-admin/README.md)
- [README Painel Cliente](./painel-cliente/README.md)
- [README Site Entrada](./site-entrada/README.md)
- [Guia de Deploy](../docs/deploy/README.md)

---

**Última atualização**: Dezembro 2024
