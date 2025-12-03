# 🎨 Frontend - Sistema Prótese Capilar

## 📁 Estrutura

Esta pasta contém todos os projetos frontend do sistema:

```
frontend/
├── painel-cliente/          # ✅ Painel do Cliente (em desenvolvimento)
├── site-publico/            # 🔄 Site Público / Área Comercial (a criar)
└── painel-admin/            # 🔄 Painel Administrativo (a criar)
```

---

## 🚀 Projetos

### 1. Painel do Cliente (`painel-cliente/`)
- **Status**: ✅ Em desenvolvimento
- **Tecnologia**: Next.js 14 + React + TypeScript
- **Funcionalidades**:
  - Login/Registro ✅
  - Dashboard (em desenvolvimento)
  - Visualização de planos
  - Histórico de atendimentos
  - Agendamentos
  - Perfil do cliente

### 2. Site Público (`site-publico/`)
- **Status**: 🔄 A criar
- **Tecnologia**: Next.js 14 + React + TypeScript
- **Funcionalidades**:
  - Página institucional
  - Apresentação de serviços
  - Catálogo de planos
  - Área de compra/checkout
  - Integração com gateway de pagamento

### 3. Painel Administrativo (`painel-admin/`)
- **Status**: ✅ Em desenvolvimento
- **Tecnologia**: Next.js 14 + React + TypeScript
- **Funcionalidades**:
  - Login administrativo ✅
  - Dashboard administrativo (em desenvolvimento)
  - Gerenciamento de clientes
  - Gerenciamento de planos
  - Agenda administrativa
  - Controle financeiro
  - Sistema de notificações

---

## 🛠️ Tecnologias Comuns

- **Framework**: Next.js 14
- **UI**: React 18
- **Linguagem**: TypeScript
- **Estilização**: Tailwind CSS
- **Componentes**: Radix UI
- **Animações**: Motion (Framer Motion)
- **Ícones**: Lucide React

---

## 📝 Comandos Úteis

### Desenvolvimento
```bash
cd painel-cliente
npm run dev
```

### Build
```bash
npm run build
```

---

## 🔗 Integração

Todos os projetos frontend se conectam ao backend através da API REST:
- **URL Base**: `http://localhost:3001/api` (desenvolvimento)
- **Produção**: Configurar via variáveis de ambiente

---

*Estrutura organizada para fácil manutenção e desenvolvimento*





