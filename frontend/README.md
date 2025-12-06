# 🎨 Frontend - Sistema Prótese Capilar

## 📁 Estrutura

Esta pasta contém todos os projetos frontend do sistema:

```
frontend/
├── site-entrada/            # ✅ Página inicial (Em desenvolvimento)
├── painel-cliente/          # ✅ Painel do Cliente (Em desenvolvimento)
├── painel-admin/            # ✅ Painel Admin (Em desenvolvimento)
└── site-publico/            # 🔄 Site Público completo (A criar)
```

---

## 🚀 Projetos

### 1. Painel do Cliente (`painel-cliente/`)
- **Status**: ✅ Em desenvolvimento
- **Tecnologia**: Next.js 14 + React + TypeScript
- **Funcionalidades**:
  - ✅ Login funcional (integração com API)
  - ✅ Cadastro de cliente (com upload de foto)
  - ✅ Dashboard criado (página "Em Desenvolvimento")
  - ✅ Recuperação de senha (tela)
  - ⏳ Visualização de planos
  - ⏳ Histórico de atendimentos
  - ⏳ Agendamentos
  - ⏳ Perfil do cliente completo

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
- **Desenvolvimento**: `http://localhost:3001/api`
- **Produção**: `https://api.protesecapilarcuiaba.com.br/api` ✅ (HTTPS funcionando)

**Configurar variável de ambiente:**
```env
NEXT_PUBLIC_API_URL=https://api.protesecapilarcuiaba.com.br
```

---

*Estrutura organizada para fácil manutenção e desenvolvimento*





