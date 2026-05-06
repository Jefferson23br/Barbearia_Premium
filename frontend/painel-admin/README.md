# 👨‍💼 Painel Administrativo - Sistema Barbearia Premium

## 🎯 Sobre

Painel administrativo completo para gestão da barbearia. Desenvolvido com Next.js 14, TypeScript e Tailwind CSS.

**Status**: ✅ **Em Produção**  
**URL**: https://appbarber.auctusconsultoria.com.br/admin  
**VPS**: 45.132.157.28 (Hostinger - conta com domínio liberado)  
**Última Atualização**: 21 de Dezembro de 2025

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
- **Permissões**: Sistema granular de permissões (RBAC) por usuário
- **Menu por Módulos**: Menu organizado por módulos expansíveis (16 de Dezembro de 2025)
- **CRM**: Sistema completo de relacionamento com clientes (27 de Janeiro de 2026)
- **Assinaturas**: Sistema completo com CRUD, integração a vendas e abatimento automático (27 de Janeiro de 2026)

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

### ✅ Caixas
- **Gerenciamento Completo**: CRUD completo de contas e movimentações
- **Contas**: Criação, edição, desativação de contas (caixa, corrente, poupança, investimento, etc.)
- **Movimentações**: Lançamento de entradas, saídas e transferências manuais
- **Saldos**: Saldo inicial e saldo atual (atualizado automaticamente)
- **Conciliação**: Base para futura conciliação bancária
- **Estatísticas**: Total de contas, contas ativas, saldo total
- **Busca Avançada**: Busca por nome, banco ou conta
- **Permissões**: Controle de acesso detalhado para ver, editar e excluir

### ✅ Lançamento de Venda
- **Sistema Completo**: Lançamento de vendas com serviços e produtos
- **Agendamentos**: Seleção de agendamentos do dia (apenas status "agendado")
- **Serviços**: Seleção de serviços vinculados a agendamentos
- **Produtos**: Adição de produtos adicionais à venda
- **Descontos**: Aplicação de descontos percentuais ou em valor fixo
- **Formas de Pagamento**: Dinheiro, Pix, TED, Cartão (1x-10x), Boleto (1x-10x)
- **Parcelamento**: Cálculo automático de parcelas e datas de vencimento
- **Tickets**: Geração automática de tickets únicos
- **Integração**: Geração automática de receitas e movimentações de caixa
- **Status**: Atualização automática de status de agendamentos para "concluido"

### ✅ Receitas
- **Gerenciamento Completo**: Listagem e controle de receitas
- **Filtros Avançados**: Status, data de vencimento, forma de pagamento, busca
- **Efetivação**: Efetivação de pagamento individual e em lote
- **Valores**: Campos de Valor Vencimento e Valor Pago
- **Alteração Manual**: Possibilidade de alterar valores manualmente
- **Integração**: Integração automática com módulo de Caixas
- **Status Automático**: Status atualizado automaticamente (pendente, paga, vencida, parcial)
- **Estatísticas**: Total de receitas, pendentes/vencidas, total pago
- **Permissões**: Controle de acesso detalhado

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
- **Abatimento Automático**: Estoque abatido automaticamente em vendas

### ✅ Emissão de Nota Fiscal
- **Emissão de NFes**: Sistema completo com integração Focus NFe
- **Romaneios Fechados**: Listagem de romaneios com vendas pendentes
- **Dados do Emitente**: Carregamento automático dos dados da empresa
- **Dados do Cliente**: Carregamento automático dos dados do cliente
- **Histórico de NFes**: Listagem de todas as notas fiscais emitidas
- **Filtros**: Por data, status, cliente

### ✅ Emissão de Relatórios
- **11 Relatórios Completos**: Vendas, despesas, produtos, clientes
- **Exportação Excel**: Exportação para CSV compatível com Excel
- **Exportação PDF**: Estrutura pronta para PDF
- **Filtros Avançados**: Data, funcionário, categoria, tipo
- **Interface Moderna**: Cards e tabelas formatadas

### ✅ Dashboard Personalizado
- **Filtros por Tipo de Usuário**: Proprietário vê tudo, Funcionário vê apenas seus dados
- **Dados Reais**: Integração completa com API
- **Cards Informativos**: Receitas, despesas, agendamentos, clientes
- **Listas Dinâmicas**: Últimas vendas e próximos agendamentos

---

## 🎨 Interface

- Design moderno e responsivo
- Dark mode nativo
- Animações suaves
- Componentes acessíveis
- Feedback visual em todas as ações
- **Menu Sidebar com Módulos Expansíveis** - Organização por categorias (16 de Dezembro de 2025)

---

## 🌐 Deploy

URL de produção: https://appbarber.auctusconsultoria.com.br/admin

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

**Última Atualização**: 21 de Dezembro de 2025  
**Versão**: 2.0.0
