# 👨‍💼 Painel Administrativo - Sistema Barbearia Premium

## 🎯 Sobre

Painel administrativo completo para gestão da barbearia. Desenvolvido com Next.js 14, TypeScript e Tailwind CSS.

**Status**: ✅ **Em Produção**  
**URL**: https://admin.protesecapilarcuiaba.com.br  
**VPS**: 45.132.157.28 (Hostinger - conta com domínio liberado)

---

## 🚀 Tecnologias

- **Framework**: Next.js 14 (App Router)
- **UI**: React 18.3
- **Linguagem**: TypeScript 5.5
- **Estilização**: Tailwind CSS 3.4
- **Componentes**: Radix UI (shadcn/ui)
- **Animações**: Framer Motion 11.11
- **Ícones**: Lucide React
- **Formulários**: React Hook Form

---

## 📦 Instalação

```bash
npm install
```

---

## 🔧 Desenvolvimento

```bash
npm run dev
```

Acesse: http://localhost:3000

---

## 🏗️ Build

```bash
npm run build
```

---

## 📋 Funcionalidades Implementadas

### ✅ Autenticação
- Login administrativo
- Validação de contas
- Redirecionamento automático

### ✅ Dashboard
- Visão geral do sistema
- Estatísticas principais
- Cards informativos

### ✅ Gerenciamento
- **Funcionários**: CRUD completo com upload de foto
- **Clientes**: CRUD completo com funcionário responsável
- **Serviços**: CRUD completo com múltiplas imagens
- **Produtos**: CRUD completo com histórico de preços de custo
- **Permissões**: Sistema granular de permissões (RBAC)

### ✅ Controle e Monitoramento
- **Controle de Acessos**: Logs de login com estatísticas
- **Controle de Logs**: Sistema completo de auditoria
- **Help Desk**: Sistema de tickets com anexos

### ✅ Configurações
- **Configurações do Sistema**: Dados da empresa, horários, agendamento
- **Integrações de APIs**: Sistema escalável de integrações
- **Habilitar API**: Controle de funcionalidades
- **Fechamentos Especiais**: Gerenciamento de dias de fechamento

### ✅ Agendamentos
- **Agenda Completa**: Visualização em dia, semana e mês
- **Busca de Horários Disponíveis**: Sistema inteligente que calcula horários livres
- **Filtro por Funcionário**: Visualização individual ou todos os funcionários (multi-coluna)
- **Integração com Configurações**: Usa horários de funcionamento configurados
- **Cálculo Automático**: Calcula duração e valor baseado no serviço
- **Marcar Almoço/Saída**: Sistema para marcar horários de almoço e saída dos funcionários
- **Edição de Agendamentos**: Clique em agendamento existente para editar

### ✅ Produtos
- **Gerenciamento Completo**: CRUD completo de produtos
- **Código Único**: Sistema de código único por produto
- **Fornecedores**: Gerenciamento de fornecedores
- **Preços de Custo**: Sistema de histórico de preços de custo
- **Último Preço de Custo**: Exibição automática do último preço lançado
- **Busca Avançada**: Busca por código, descrição, fornecedor ou preço
- **Estatísticas**: Total de produtos, ativos e fornecedores

### ✅ Estoque
- **Gerenciamento Completo**: CRUD completo de movimentações de estoque
- **Lançamento de Entrada**: Sistema completo para lançar entradas de estoque
- **Integração com Produtos**: Integração completa com módulo de Produtos
- **Atualização Automática**: Quantidade, preço e fornecedor atualizados automaticamente
- **Último Preço de Compra**: Exibição automática do último preço de compra (da última aquisição)
- **Indicadores Visuais**: Alertas de estoque baixo e sem estoque
- **Preenchimento Automático**: Fornecedor e preço preenchidos automaticamente ao selecionar produto
- **Estatísticas**: Total de produtos, total em estoque, produtos com/sem estoque
- **Busca Avançada**: Busca por código, descrição ou fornecedor

---

## 🎨 Interface

- Design moderno e responsivo
- Dark mode nativo
- Animações suaves
- Componentes acessíveis
- Feedback visual em todas as ações

---

## 🌐 Deploy

URL de produção: https://admin.protesecapilarcuiaba.com.br

### Processo de Deploy

```bash
# Build
npm run build

# Enviar para VPS
scp -r out/* root@45.132.157.28:/home/cyberpanel/app/frontend-admin/

# Reiniciar PM2
pm2 restart painel-admin
```

---

## 📁 Estrutura

```
src/
├── app/                    # App Router
│   ├── dashboard/         # Páginas do dashboard
│   ├── layout.tsx         # Layout principal
│   └── page.tsx           # Página de login
├── components/            
│   ├── admin/             # Componentes administrativos
│   └── ui/                # Componentes shadcn/ui
├── hooks/                 # Custom hooks
└── styles/                # Estilos globais
```

---

**Última Atualização**: 12 de Dezembro de 2025  
**Versão**: 1.4.0
