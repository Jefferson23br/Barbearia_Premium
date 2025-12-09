# 🎨 Frontend - Sistema Barbearia Premium

Projetos frontend que desenvolvi utilizando Next.js 14 (App Router), TypeScript e Tailwind CSS. Criei três aplicações distintas para atender diferentes necessidades da barbearia.

---

## 📁 Estrutura dos Projetos

```
frontend/
├── painel-admin/       # ✅ Painel Administrativo (Produção)
├── painel-cliente/     # ✅ Painel do Cliente (Produção)
└── site-entrada/       # 🔄 Site Público (Desenvolvimento)
```

---

## 🚀 Projetos que Desenvolvi

### 1. Painel Administrativo (`painel-admin/`)

**Status**: ✅ **Em Produção**  
**URL**: https://admin.protesecapilarcuiaba.com.br  
**Porta de desenvolvimento**: `3000`  
**VPS**: 45.132.157.28 (Hostinger - m.br)

Este é o painel principal que desenvolvi para a gestão completa da barbearia. Aqui os administradores podem gerenciar tudo:

**Funcionalidades implementadas:**
- ✅ Sistema de login e autenticação
- ✅ Dashboard administrativo com estatísticas
- ✅ Sistema de permissões granular (RBAC)
- ✅ Gerenciamento de Funcionários (CRUD completo)
- ✅ Gerenciamento de Clientes/Usuários (CRUD completo)
- ✅ Controle de Permissões (interface completa)
- ✅ Controle de Acessos (logs de login com estatísticas)
- ✅ Help Desk (sistema completo de tickets)
- ✅ Controle de Logs (sistema completo com exportação CSV)
- ✅ Gerenciamento de Serviços (CRUD com imagens)
- ✅ Configurações do Sistema (dados da empresa, horários, agendamento)
- ✅ Integrações de APIs Externas (Focus NFe e estrutura escalável)
- ✅ Habilitar API (controle de funcionalidades das integrações)

**Tecnologias que utilizei:**
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Radix UI (shadcn/ui)
- Framer Motion (animações)
- Lucide React (ícones)

---

### 2. Painel Cliente (`painel-cliente/`)

**Status**: ✅ **Em Produção**  
**URL**: https://app.protesecapilarcuiaba.com.br  
**Porta de desenvolvimento**: `3001`  
**VPS**: 45.132.157.28 (Hostinger - m.br)

Desenvolvi este painel para que os clientes possam acompanhar seus atendimentos e interagir com a barbearia:

**Funcionalidades implementadas:**
- ✅ Sistema de login e autenticação
- ✅ Dashboard básico do cliente
- ✅ Cadastro de cliente
- ✅ Visualização de perfil

**Funcionalidades planejadas:**
- 🔄 Agendamentos
- 🔄 Histórico de atendimentos
- 🔄 Serviços contratados
- 🔄 Comunicação com a barbearia

---

### 3. Site de Entrada (`site-entrada/`)

**Status**: 🔄 **Em Desenvolvimento**  
**URL**: https://www.protesecapilarcuiaba.com.br  
**Porta de desenvolvimento**: `3002`  
**VPS**: 45.132.157.28 (Hostinger - m.br)

Este será o site institucional da barbearia:

**Funcionalidades planejadas:**
- 🔄 Site institucional
- 🔄 Catálogo de serviços
- 🔄 Sistema de compra/agendamento
- 🔄 Formulários de contato

---

## 🛠️ Stack Tecnológica

Desenvolvi todos os projetos frontend utilizando as mesmas tecnologias para manter consistência:

| Tecnologia | Versão | Uso |
|------------|--------|-----|
| **Next.js** | 14.2 | Framework principal (App Router) |
| **TypeScript** | 5.5 | Linguagem de programação |
| **React** | 18.3 | Biblioteca UI |
| **Tailwind CSS** | 3.4 | Framework CSS |
| **Radix UI** | Latest | Componentes acessíveis (shadcn/ui) |
| **Framer Motion** | 11.11 | Animações suaves |
| **Lucide React** | Latest | Ícones modernos |
| **React Hook Form** | 7.55 | Gerenciamento de formulários |

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

Desenvolvi os projetos para gerar builds estáticos (SSG) otimizados:

### Build estático

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

Criei uma estrutura de componentes compartilhados usando shadcn/ui:

- `components/ui/` - Componentes base (Button, Input, Card, Dialog, etc.)
- `components/admin/` - Componentes específicos do admin
- `components/figma/` - Componentes customizados

**Total**: 48 componentes UI prontos para uso

### Hooks Customizados

Desenvolvi hooks personalizados para facilitar o desenvolvimento:

- `hooks/usePermissions.ts` - Hook para verificar permissões do usuário

---

## 🎨 Design System

Criei um design system consistente em todos os projetos:

### Cores
- **Primária**: Âmbar/Dourado (#F59E0B)
- **Secundária**: Azul (#3B82F6)
- **Background**: Escuro (Zinc 900)
- **Texto**: Branco/Cinza claro

### Componentes
- Todos os componentes seguem o padrão shadcn/ui
- Acessibilidade garantida com Radix UI
- Animações suaves com Framer Motion
- Responsividade em todos os componentes

### Layout
- Sidebar colapsável
- Header fixo
- Conteúdo responsivo
- Dark mode nativo

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

Criei arquivos `.env.local` em cada projeto:

```env
# API Backend
NEXT_PUBLIC_API_URL=https://api.barbeariapremium.com.br
```

---

## 📝 Convenções que Segui

### Nomenclatura
- **Componentes**: PascalCase (`DashboardLayout.tsx`)
- **Hooks**: camelCase com prefixo `use` (`usePermissions.ts`)
- **Páginas**: `page.tsx` (Next.js App Router)
- **Estilos**: Tailwind CSS classes

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

## 🎯 Funcionalidades Principais

### Sistema de Permissões
Desenvolvi um sistema completo de permissões que controla:
- Visibilidade de itens no menu
- Acesso a páginas
- Botões de ação (editar/excluir)
- Tipos de usuário: Master, Proprietário, Funcionário

### Controle de Acessos
Criei um dashboard completo com:
- Estatísticas de acessos
- Filtros avançados (data, funcionário)
- Visualização responsiva
- Cards com gradientes modernos

### Help Desk
Sistema completo de tickets com:
- Criação de chamados
- Respostas e anexos
- Filtros e busca
- Status e prioridades

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

**Última atualização**: Dezembro 2025  
**Status**: ✅ Painel Admin e Cliente em Produção  
**Tecnologias**: Next.js 14, TypeScript, Tailwind CSS, Radix UI
