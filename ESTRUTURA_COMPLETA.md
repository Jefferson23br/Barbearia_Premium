# 📋 Estrutura Completa do Sistema - Prótese Capilar

## 🎯 Visão Geral do Sistema

Sistema completo de gestão para clínica/barbearia com 3 áreas principais:

1. **Site Público / Área Comercial** - Marketing e vendas
2. **Painel do Cliente** - Área autenticada do cliente
3. **Painel Administrativo** - Gestão completa da barbearia

---

## 📁 Estrutura de Pastas Completa

```
Barbearia_Premium/
│
├── frontend/
│   ├── site-publico/                    # Site Público / Área Comercial
│   │   ├── src/
│   │   │   ├── app/
│   │   │   │   ├── (public)/           # Rotas públicas
│   │   │   │   │   ├── page.tsx        # Home / Institucional
│   │   │   │   │   ├── sobre/page.tsx
│   │   │   │   │   ├── servicos/page.tsx
│   │   │   │   │   ├── planos/page.tsx
│   │   │   │   │   └── contato/page.tsx
│   │   │   │   └── layout.tsx
│   │   │   └── components/
│   │   │       ├── Header.tsx
│   │   │       ├── Footer.tsx
│   │   │       ├── Hero.tsx
│   │   │       ├── Servicos.tsx
│   │   │       ├── Planos.tsx
│   │   │       └── Checkout/
│   │   └── package.json
│   │
│   ├── painel-cliente/                  # Painel do Cliente (JÁ CRIADO)
│   │   └── Painel-de-Cliente-Barberia/
│   │
│   └── painel-admin/                    # Painel Administrativo
│       ├── src/
│       │   ├── app/
│       │   │   ├── (auth)/
│       │   │   │   └── login/page.tsx
│       │   │   ├── (dashboard)/
│       │   │   │   ├── layout.tsx
│       │   │   │   ├── page.tsx        # Dashboard
│       │   │   │   ├── clientes/
│       │   │   │   ├── planos/
│       │   │   │   ├── agenda/
│       │   │   │   ├── financeiro/
│       │   │   │   └── notificacoes/
│       │   │   └── layout.tsx
│       │   └── components/
│       │       ├── Sidebar.tsx
│       │       ├── Header.tsx
│       │       ├── Dashboard/
│       │       ├── Clientes/
│       │       ├── Planos/
│       │       └── Agenda/
│       └── package.json
│
├── backend/                              # API Node.js
│   ├── src/
│   │   ├── modules/
│   │   │   ├── auth/                    # Autenticação
│   │   │   │   ├── auth.controller.ts
│   │   │   │   ├── auth.service.ts
│   │   │   │   ├── auth.module.ts
│   │   │   │   └── strategies/
│   │   │   │       └── jwt.strategy.ts
│   │   │   │
│   │   │   ├── users/                   # Usuários/Clientes
│   │   │   │   ├── users.controller.ts
│   │   │   │   ├── users.service.ts
│   │   │   │   ├── users.module.ts
│   │   │   │   └── dto/
│   │   │   │
│   │   │   ├── plans/                   # Planos e Pacotes
│   │   │   │   ├── plans.controller.ts
│   │   │   │   ├── plans.service.ts
│   │   │   │   └── plans.module.ts
│   │   │   │
│   │   │   ├── services/                # Serviços
│   │   │   │   ├── services.controller.ts
│   │   │   │   ├── services.service.ts
│   │   │   │   └── services.module.ts
│   │   │   │
│   │   │   ├── appointments/            # Agendamentos
│   │   │   │   ├── appointments.controller.ts
│   │   │   │   ├── appointments.service.ts
│   │   │   │   └── appointments.module.ts
│   │   │   │
│   │   │   ├── transactions/            # Transações/Pagamentos
│   │   │   │   ├── transactions.controller.ts
│   │   │   │   ├── transactions.service.ts
│   │   │   │   └── transactions.module.ts
│   │   │   │
│   │   │   ├── usage/                   # Uso de Saldo
│   │   │   │   ├── usage.controller.ts
│   │   │   │   ├── usage.service.ts
│   │   │   │   └── usage.module.ts
│   │   │   │
│   │   │   ├── notifications/           # Notificações
│   │   │   │   ├── notifications.controller.ts
│   │   │   │   ├── notifications.service.ts
│   │   │   │   └── notifications.module.ts
│   │   │   │
│   │   │   ├── nfe/                     # Integração NFe
│   │   │   │   ├── nfe.controller.ts
│   │   │   │   ├── nfe.service.ts
│   │   │   │   └── nfe.module.ts
│   │   │   │
│   │   │   └── dashboard/               # Dashboard/Relatórios
│   │   │       ├── dashboard.controller.ts
│   │   │       ├── dashboard.service.ts
│   │   │       └── dashboard.module.ts
│   │   │
│   │   ├── common/                      # Compartilhado
│   │   │   ├── guards/                  # Guards (Auth, Roles)
│   │   │   ├── interceptors/            # Interceptors
│   │   │   ├── filters/                 # Exception Filters
│   │   │   ├── decorators/              # Decorators customizados
│   │   │   └── pipes/                   # Validation Pipes
│   │   │
│   │   ├── database/                    # Database
│   │   │   ├── entities/                # Entities (TypeORM)
│   │   │   ├── migrations/              # Migrations
│   │   │   └── database.module.ts
│   │   │
│   │   ├── config/                      # Configurações
│   │   │   ├── database.config.ts
│   │   │   ├── app.config.ts
│   │   │   └── env.validation.ts
│   │   │
│   │   └── main.ts                      # Entry point
│   │
│   ├── test/                            # Testes
│   ├── package.json
│   └── tsconfig.json
│
├── database/                             # Scripts SQL
│   ├── migrations/
│   ├── seeds/
│   └── schema.sql
│
├── docs/                                 # Documentação
│   ├── api/                             # API Documentation
│   ├── database/                        # DB Schema
│   ├── deploy/                          # Guias de Deploy
│   └── user-guide/                      # Manual do usuário
│
└── scripts/                              # Scripts auxiliares
    ├── deploy.sh
    └── setup-vps.sh
```

---

## 🗄️ Estrutura do Banco de Dados (PostgreSQL)

### Tabelas Principais

1. **users** - Usuários (clientes e admin)
2. **plans** - Planos/Pacotes disponíveis
3. **user_plans** - Planos adquiridos pelos clientes
4. **services** - Serviços oferecidos
5. **appointments** - Agendamentos
6. **transactions** - Transações/Pagamentos
7. **usage_history** - Histórico de uso
8. **notifications** - Notificações
9. **invoices** - Faturas/Notas Fiscais
10. **nfe_logs** - Logs de integração NFe

---

## 🔌 Endpoints da API

### Autenticação
- `POST /auth/register` - Registro
- `POST /auth/login` - Login
- `POST /auth/refresh` - Refresh token
- `POST /auth/logout` - Logout

### Clientes
- `GET /users` - Listar clientes
- `GET /users/:id` - Detalhes do cliente
- `PUT /users/:id` - Atualizar cliente
- `GET /users/:id/plans` - Planos do cliente
- `GET /users/:id/history` - Histórico

### Planos
- `GET /plans` - Listar planos
- `GET /plans/:id` - Detalhes do plano
- `POST /plans` - Criar plano (admin)
- `PUT /plans/:id` - Atualizar plano (admin)
- `DELETE /plans/:id` - Deletar plano (admin)

### Agendamentos
- `GET /appointments` - Listar agendamentos
- `POST /appointments` - Criar agendamento
- `PUT /appointments/:id` - Atualizar agendamento
- `DELETE /appointments/:id` - Cancelar agendamento

### Pagamentos
- `POST /payments` - Processar pagamento
- `GET /payments/:id` - Status do pagamento
- `POST /payments/webhook` - Webhook do gateway

### Dashboard
- `GET /dashboard/stats` - Estatísticas gerais
- `GET /dashboard/revenue` - Receita
- `GET /dashboard/clients` - Estatísticas de clientes

---

## 🚀 Próximos Passos de Desenvolvimento

1. ✅ Painel de Cliente - Login/Registro (CONCLUÍDO)
2. 🔄 Criar estrutura do backend
3. 🔄 Configurar banco de dados
4. 🔄 Implementar autenticação
5. 🔄 Desenvolver Site Público
6. 🔄 Desenvolver Painel Admin
7. 🔄 Integrações (Pagamento, NFe, Notificações)

---

*Estrutura baseada nas especificações do documento sistema_barbearia.txt*







