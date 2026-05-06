# 🎨 Frontend - Sistema Barbearia Premium

Projetos frontend desenvolvidos utilizando Next.js 14 (App Router), TypeScript e Tailwind CSS. Três aplicações distintas para atender diferentes necessidades da barbearia.

---

## 📁 Estrutura dos Projetos

```
frontend/
├── painel-admin/       # ✅ Painel Administrativo (Produção)
├── painel-cliente/     # ✅ Painel do Cliente (Produção)
└── site-entrada/       # 🔄 Site Público (Desenvolvimento)
```

---

## 🚀 Projetos Desenvolvidos

### 1. Painel Administrativo (`painel-admin/`)

**Status**: ✅ **Em Produção**  
**URL**: https://appbarber.auctusconsultoria.com.br/admin  
**Porta de desenvolvimento**: `3000`  
**VPS**: 45.132.157.28 (Hostinger - conta com domínio liberado)

Este é o painel principal para a gestão completa da barbearia. Aqui os administradores podem gerenciar tudo:

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
- ✅ Integrações de APIs Externas (9 integrações: Focus NFe, PLUG NFe, Asaas, Mercado Pago, PagSeguro, Twilio, WhatsApp Business API, SendGrid, DocSales)
- ✅ Habilitar API (controle de funcionalidades das integrações)
- ✅ Serviços de Integração (módulo para gerenciar e usar integrações configuradas)
- ✅ **Sistema de Agendamentos** (visualização em dia/semana/mês, busca de disponibilidade)
- ✅ **Fechamentos Especiais** (gerenciamento de dias de fechamento)
- ✅ **Módulo de Produtos** (CRUD completo com histórico de preços de custo)
- ✅ **Módulo de Estoque** (CRUD completo com lançamento de entradas e atualização automática)
- ✅ **Módulo de Caixas** (gerenciamento de contas e movimentações financeiras)
- ✅ **Lançamento de Venda** (sistema completo de lançamento de vendas com serviços, produtos, descontos e parcelamento)
- ✅ **Módulo de Receitas** (gerenciamento completo de receitas com efetivação de pagamentos)
- ✅ **Lançamento de Despesa** (sistema completo de lançamento de despesas com parcelamento)
- ✅ **Módulo de Despesas** (gerenciamento completo de despesas com quitação e monitoramento)
- ✅ **Módulo de Faturamento** (visualização unificada, edição e criação de romaneios)
- ✅ **Emissão de Nota Fiscal** (sistema completo com integração Focus NFe)
- ✅ **Emissão de Relatórios** (11 relatórios completos com exportação)
- ✅ **Dashboard Personalizado** (filtros por tipo de usuário)
- ✅ **Cupons e Fidelidades** (sistema completo de cupons e programa de fidelidade)
- ✅ **Integrações de APIs** (9 integrações: Focus NFe, PLUG NFe, Asaas, Mercado Pago, PagSeguro, Twilio, WhatsApp Business API, SendGrid, DocSales)
- ✅ **Sistema de Módulos no Menu** - Menu organizado por módulos expansíveis (16 de Dezembro de 2025)
- ✅ **Correção do Sistema de Permissões** - Permissões sempre do PostgreSQL, sem duplicações (16 de Dezembro de 2025)
- ✅ **Integração DocSales** - Sistema de assinatura de contratos (16 de Dezembro de 2025)
- ✅ **Serviços de Integração** - Módulo para gerenciar integrações (16 de Dezembro de 2025)
- ✅ **Master Acessa Tudo** - Master não precisa configurar permissões (16 de Dezembro de 2025)
- ✅ **CRM** - Sistema completo de relacionamento com clientes (27 de Janeiro de 2026)
- ✅ **Módulo Assinaturas** - Sistema completo de assinaturas com CRUD, integração a vendas, abatimento automático e controle de validade (27 de Janeiro de 2026)

**Tecnologias utilizadas:**
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Radix UI (shadcn/ui)
- Framer Motion (animações)
- Lucide React (ícones)

---

### 2. Painel Cliente (`painel-cliente/`)

**Status**: ✅ **Em Produção**  
**URL**: https://appbarber.auctusconsultoria.com.br  
**Porta de desenvolvimento**: `3001`  
**VPS**: 45.132.157.28 (Hostinger - conta com domínio liberado)

Painel para que os clientes possam acompanhar seus atendimentos e interagir com a barbearia:

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
**URL**: https://appbarber.auctusconsultoria.com.br  
**Porta de desenvolvimento**: `3002`  
**VPS**: 45.132.157.28 (Hostinger - conta com domínio liberado)

Site institucional da barbearia:

**Funcionalidades planejadas:**
- 🔄 Site institucional
- 🔄 Catálogo de serviços
- 🔄 Sistema de compra/agendamento
- 🔄 Formulários de contato

---

## 🛠️ Stack Tecnológica

Todos os projetos frontend utilizam as mesmas tecnologias para manter consistência:

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

Os projetos são configurados para gerar builds estáticos (SSG) otimizados:

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

Estrutura de componentes compartilhados usando shadcn/ui:

- `components/ui/` - Componentes base (Button, Input, Card, Dialog, etc.)
- `components/admin/` - Componentes específicos do admin
- `components/figma/` - Componentes customizados

**Total**: 48 componentes UI prontos para uso

### Hooks Customizados

Hooks personalizados para facilitar o desenvolvimento:

- `hooks/usePermissions.ts` - Hook para verificar permissões do usuário

---

## 🎨 Design System

Design system consistente em todos os projetos:

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

Arquivos `.env.local` em cada projeto:

```env
# API Backend
NEXT_PUBLIC_API_URL=https://api6.actusconsultoria.com.br
```

---

## 📝 Convenções

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
Sistema completo de permissões que controla:
- Visibilidade de itens no menu
- Acesso a páginas
- Botões de ação (editar/excluir)
- Tipos de usuário: Master, Proprietário, Funcionário

### Controle de Acessos
Dashboard completo com:
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

### Sistema de Agendamentos
Sistema completo de agendamentos com:
- Visualização em dia, semana e mês
- Busca de horários disponíveis
- Filtro por funcionário
- Integração com configurações
- Fechamentos especiais

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

**Última atualização**: 21 de Dezembro de 2025  
**Status**: ✅ Painel Admin e Cliente em Produção  
**Tecnologias**: Next.js 14, TypeScript, Tailwind CSS, Radix UI  
**Versão**: 2.0.0  
**VPS**: 45.132.157.28 (Hostinger - conta diferente com domínio liberado)  
**URLs**: 
- Admin: https://appbarber.auctusconsultoria.com.br/admin
- Cliente: https://appbarber.auctusconsultoria.com.br
- Site: https://appbarber.auctusconsultoria.com.br
