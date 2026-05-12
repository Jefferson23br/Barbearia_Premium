# 🗺️ Roadmap - Sistema Barbearia Premium

Este documento apresenta o roadmap completo do projeto, incluindo funcionalidades implementadas, em desenvolvimento e planejadas para o futuro.

**Última Atualização**: 21 de Dezembro de 2025  
**Versão**: 2.0.0

---

## ✅ Funcionalidades Implementadas (Produção)

### 🔐 Autenticação e Segurança
- ✅ Login de clientes e administradores
- ✅ Senhas hasheadas com bcrypt
- ✅ Validação de contas ativas/inativas
- ✅ CORS configurado
- ✅ Sistema de permissões granular (RBAC)

### 👥 Gerenciamento de Usuários
- ✅ CRUD completo de Funcionários
- ✅ CRUD completo de Clientes
- ✅ Upload de fotos de perfil
- ✅ Busca avançada
- ✅ Sistema de logs de ações

### 📊 Controle e Monitoramento
- ✅ Controle de Acessos (logs de login com estatísticas)
- ✅ Controle de Logs (sistema de auditoria completo)
- ✅ Help Desk (sistema de tickets)
- ✅ Exportação de dados (CSV)

### 🛍️ Serviços
- ✅ CRUD completo de Serviços
- ✅ Upload de imagens (até 3 por serviço)
- ✅ Imagem de capa
- ✅ Gerenciamento de imagens

### ⚙️ Configurações do Sistema
- ✅ Dados da Empresa (CNPJ, CNAE, Razão Social)
- ✅ Endereço Completo
- ✅ Contato (Email, Telefones, WhatsApp)
- ✅ Horários de Funcionamento (configuração por dia)
- ✅ Configurações de Agendamento (intervalos e tempos)
- ✅ Interface com abas organizadas
- ✅ Formatação automática de campos

### 🔌 Integrações de APIs Externas
- ✅ Estrutura escalável para múltiplas integrações
- ✅ 8 Integrações implementadas:
  - Focus NFe (Emissão de NF-e)
  - PLUG NFe (Emissão de NF-e)
  - Asaas (Pagamentos)
  - Mercado Pago (Pagamentos)
  - PagSeguro/PagBank (Pagamentos)
  - Twilio (Comunicações)
  - WhatsApp Business API (Mensagens)
  - SendGrid (Emails)
- ✅ Sistema de habilitação de funcionalidades
- ✅ Interface de gerenciamento completa
- ✅ Suporte a múltiplos ambientes
- ✅ Documentação completa de cada integração

### 🎨 Interface
- ✅ Design responsivo (mobile, tablet, desktop)
- ✅ Componentes shadcn/ui
- ✅ Animações com Framer Motion
- ✅ Dark mode
- ✅ Feedback visual

---

## ✅ Funcionalidades Implementadas Recentemente

### 📦 Módulo de Produtos
**Prioridade**: Alta  
**Status**: ✅ **100% Completo (Dezembro 2025)**

**Funcionalidades implementadas:**
- ✅ CRUD completo de produtos
- ✅ Código único por produto
- ✅ Gerenciamento de fornecedores
- ✅ Sistema de preços de custo
- ✅ Histórico completo de preços de custo
- ✅ Último preço de custo exibido automaticamente
- ✅ Busca avançada
- ✅ Estatísticas

**Melhorias planejadas:**
- [ ] Interface para lançar preços de custo (atualmente via API)
- [ ] Relatórios de produtos
- [ ] Integração com estoque
- [ ] Alertas de estoque baixo
- [ ] Categorização de produtos

---

### 📅 Sistema de Agendamentos
**Prioridade**: Alta  
**Status**: ✅ **100% Completo (Dezembro 2025)**

**Funcionalidades implementadas:**
- ✅ Calendário de agendamentos (dia, semana, mês)
- ✅ Criação de agendamentos
- ✅ Edição e cancelamento
- ✅ Busca de horários disponíveis
- ✅ Integração com serviços
- ✅ Disponibilidade de funcionários
- ✅ Filtro por funcionário (visualização multi-coluna)
- ✅ Fechamentos especiais
- ✅ **Marcar Almoço/Saída** (Dezembro 2025)
- ✅ Visualização multi-coluna quando filtro = "todos"
- ✅ Edição de agendamentos existentes

**Melhorias planejadas:**
- [ ] Notificações de agendamentos (email/SMS)
- [ ] Lembretes automáticos
- [ ] Histórico de agendamentos
- [ ] Agendamentos recorrentes
- [ ] Integração com calendário externo (Google Calendar)
- [ ] Exportação de agenda (PDF/Excel)

---

## 🔄 Em Desenvolvimento

---

### 💰 Módulo de Caixas
**Prioridade**: Alta  
**Status**: ✅ **100% Completo (Dezembro 2025)**

**Funcionalidades implementadas:**
- ✅ CRUD completo de contas
- ✅ Lançamento de entradas e saídas manuais
- ✅ Transferências entre contas
- ✅ Saldo atualizado automaticamente
- ✅ Integração com módulo de Receitas
- ✅ Base para conciliação bancária

**Melhorias planejadas:**
- [ ] Conciliação bancária automática
- [ ] Relatórios de movimentações
- [ ] Exportação de extratos

---

### 🛒 Lançamento de Venda
**Prioridade**: Alta  
**Status**: ✅ **100% Completo (Dezembro 2025)**

**Funcionalidades implementadas:**
- ✅ Seleção de agendamentos do dia
- ✅ Lançamento de serviços e produtos
- ✅ Aplicação de descontos
- ✅ Múltiplas formas de pagamento
- ✅ Parcelamento automático
- ✅ Geração automática de receitas
- ✅ Integração com Caixas

**Melhorias planejadas:**
- [ ] Relatórios de vendas
- [ ] Histórico de vendas por cliente
- [ ] Exportação de vendas

---

### 💵 Módulo de Receitas
**Prioridade**: Alta  
**Status**: ✅ **100% Completo (Dezembro 2025)**

**Funcionalidades implementadas:**
- ✅ Listagem completa de receitas
- ✅ Filtros avançados
- ✅ Efetivação de pagamento individual e em lote
- ✅ Integração com Caixas
- ✅ Status automático
- ✅ Geração automática a partir de vendas

**Melhorias planejadas:**
- [ ] Relatórios de receitas
- [ ] Previsão de recebimentos
- [ ] Exportação de receitas

---

### 📊 Módulo de Estoque
**Prioridade**: Alta  
**Status**: ✅ **100% Completo (Dezembro 2025)**

**Funcionalidades implementadas:**
- ✅ Controle de entrada de produtos
- ✅ Integração completa com módulo de produtos
- ✅ Alertas visuais de estoque baixo
- ✅ Atualização automática de quantidade, preço e fornecedor
- ✅ Último preço de compra exibido automaticamente
- ✅ Estatísticas em tempo real
- ✅ Busca avançada
- ✅ Preenchimento automático de campos

**Melhorias planejadas:**
- [ ] Controle de saída de produtos
- [ ] Relatórios de movimentação
- [ ] Histórico completo de movimentações
- [ ] Contagem de estoque
- [ ] Ajustes de estoque
- [ ] Alertas de estoque baixo (notificações)

---

### 💸 Módulo de Despesas
**Prioridade**: Alta  
**Status**: ✅ **100% Completo (Dezembro 2025)**

**Funcionalidades implementadas:**
- ✅ Lançamento de despesas completo
- ✅ CRUD completo de despesas
- ✅ Efetivação de pagamento individual e em lote
- ✅ Modificação de pagamentos já efetivados
- ✅ Monitoramento de contas a pagar
- ✅ Integração completa com módulo de Caixas
- ✅ Categoria de custo
- ✅ Parcelamento automático

**Melhorias planejadas:**
- [ ] Relatórios de despesas
- [ ] Categorização avançada
- [ ] Alertas de vencimento
- [ ] Filtros avançados
- [ ] Exportação de dados

**Estimativa**: 2-3 semanas

---

### 🎫 Cupons e Fidelidades
**Prioridade**: Alta  
**Status**: ✅ **100% Completo (14 de Dezembro de 2025)**

**Funcionalidades implementadas:**
- ✅ CRUD completo de cupons
- ✅ Configuração de cupons (tipo de desconto, aplicação, regras de uso)
- ✅ Sistema de fidelidade automático
- ✅ Integração com Lançamento de Venda
- ✅ Validação e aplicação de cupons
- ✅ Controle de progresso de fidelidade por cliente
- ✅ Visualização de fidelidades

**Melhorias planejadas:**
- [ ] Dashboard de métricas de cupons
- [ ] Relatórios de uso de cupons
- [ ] Notificações de cupons liberados
- [ ] Gráficos de progresso de fidelidade
- [ ] Campanhas promocionais

---

### 👥 CRM (Customer Relationship Management)
**Prioridade**: Alta  
**Status**: ✅ **100% Completo (27 de Janeiro de 2026)**

**Funcionalidades implementadas:**
- ✅ Busca de clientes por nome ou email
- ✅ Visualização completa de dados do cliente:
  - Agendamentos (data, serviço, status, profissional, valor)
  - Vendas (data, ticket, valor, profissional)
  - Receitas financeiras (emissão, vencimento, pagamento, ticket, valores)
  - Relacionamentos (histórico de interações)
- ✅ Gerenciamento de relacionamentos:
  - Criar, editar e excluir interações
  - Tipos de interação (Ligação, Email, Visita, Reunião, Mensagem)
  - Data da interação e funcionário responsável
  - Descrição e observações
- ✅ Interface com abas organizadas
- ✅ Sistema de permissões integrado

**Melhorias planejadas:**
- [ ] Exportação de dados do CRM
- [ ] Relatórios de relacionamentos
- [ ] Integração com outros módulos
- [ ] Dashboard de métricas de relacionamento
- [ ] Notificações de interações

---

### 📝 Módulo Assinaturas
**Prioridade**: Média  
**Status**: ✅ **Estrutura Criada (27 de Janeiro de 2026)**

**Estrutura implementada:**
- ✅ Módulo criado no menu Operação
- ✅ Sistema de permissões implementado (`assinaturas_ver`, `assinaturas_editar`, `assinaturas_excluir`)
- ✅ Página básica criada
- ✅ Integração completa com sistema de permissões

**Funcionalidades planejadas:**
- [ ] CRUD completo de assinaturas
- [ ] Gerenciamento de planos de assinatura
- [ ] Controle de renovação
- [ ] Histórico de assinaturas
- [ ] Relatórios de assinaturas
- [ ] Integração com outros módulos

**Estimativa**: 3-4 semanas

---

### 🧾 Faturamento
**Prioridade**: Média  
**Status**: ✅ **100% Completo (Dezembro 2025)**

**Funcionalidades implementadas:**
- ✅ Visualização unificada de todas as movimentações (Vendas, Despesas, Estoque)
- ✅ Filtros avançados por tipo, data, status, busca
- ✅ Edição linha por linha de vendas, despesas e movimentações de estoque
- ✅ Exclusão de movimentações com validações
- ✅ Criação de romaneios (faturamento, estoque, despesa, misto)
- ✅ Visualização detalhada de romaneios com cabeçalho da empresa
- ✅ Impressão/Download de romaneios em formato profissional
- ✅ Estatísticas de movimentações

**Melhorias planejadas:**
- [ ] Templates personalizados de romaneios
- [ ] Envio automático de romaneios por email
- [ ] Assinatura digital
- [ ] Envio de faturas por email
- [ ] Controle de pagamentos
- [ ] Histórico de faturas
- [ ] Relatórios de faturamento
- [ ] Integração com vendas

**Estimativa**: 2-3 semanas

---

## 📋 Planejado para o Futuro

### 🎫 Melhorias no Help Desk
- [ ] Notificações em tempo real
- [ ] Templates de respostas
- [ ] Categorização automática
- [ ] SLA e prazos
- [ ] Dashboard de métricas

### 📱 Aplicativo Mobile
- [ ] App para clientes
- [ ] App para funcionários
- [ ] Notificações push
- [ ] Agendamentos mobile

### 📊 Analytics e Relatórios
- [ ] Dashboard executivo
- [ ] Relatórios personalizados
- [ ] Exportação avançada
- [ ] Gráficos interativos
- [ ] Métricas de performance

### 🔔 Sistema de Notificações
- ✅ Estrutura de integrações implementada (Twilio, WhatsApp Business API, SendGrid)
- [ ] Implementação completa de notificações por email
- [ ] Implementação completa de notificações por SMS/WhatsApp
- [ ] Notificações push
- [ ] Central de notificações

### 💳 Integração de Pagamentos
- ✅ Estrutura de integrações implementada (Asaas, Mercado Pago, PagSeguro)
- [ ] Implementação completa de pagamentos online
- [ ] Controle de transações
- [ ] Relatórios financeiros
- [ ] Webhooks de pagamento

### 📦 Estoque
- [ ] Controle de produtos
- [ ] Entrada e saída
- [ ] Alertas de estoque baixo
- [ ] Relatórios de estoque

---

## 🎯 Prioridades Atuais

### Q4 2025 / Q1 2026
1. ✅ **Sistema de Agendamentos** - ✅ **Concluído em Dezembro 2025**
2. ✅ **Módulo de Caixas** - ✅ **Concluído em Dezembro 2025**
3. ✅ **Lançamento de Venda** - ✅ **Concluído em Dezembro 2025**
4. ✅ **Módulo de Receitas** - ✅ **Concluído em Dezembro 2025**
5. **Módulo de Despesas** - ✅ Concluído (Dezembro 2025)
6. **Módulo de Faturamento** - ✅ Concluído (Dezembro 2025)
7. **Emissão de Nota Fiscal** - ✅ Concluído (Dezembro 2025)
8. **Emissão de Relatórios** - ✅ Concluído (Dezembro 2025)
9. **Dashboard Personalizado** - ✅ Concluído (Dezembro 2025)
10. **Correção de Abatimento de Estoque** - ✅ Concluído (Dezembro 2025)
11. **Melhorias no Help Desk** - Notificações e templates
12. **Melhorias no Sistema de Agendamentos** - Notificações, lembretes, relatórios
13. **Melhorias nos Relatórios** - Gráficos, mais métricas

### Q2 2025
1. **Balanço Demonstrativo** - Estrutura criada, desenvolvimento em andamento
2. **CRM** - Estrutura criada, desenvolvimento em andamento
3. **Analytics** - Dashboard executivo
4. **Sistema de Notificações** - Email e SMS

### Q3 2025
1. **Aplicativo Mobile** - App para clientes
2. **Integração de Pagamentos** - Gateway
3. **Estoque** - Controle de produtos

---

## 📝 Notas de Desenvolvimento

### Tecnologias a Considerar
- **WebSockets**: Para notificações em tempo real
- **Redis**: Para cache e sessões
- **JWT**: Para autenticação mais robusta
- **Swagger**: Para documentação da API
- **Docker**: Para containerização

### Melhorias Técnicas
- [ ] Testes automatizados (Jest/Vitest)
- [ ] CI/CD pipeline
- [ ] Monitoramento de performance
- [ ] Backup automatizado
- [ ] Documentação da API (Swagger)

---

## 🔄 Atualizações do Roadmap

Este roadmap é atualizado regularmente conforme o desenvolvimento avança. Última atualização: **21 de Dezembro de 2025**

---

**Status Geral do Projeto**: ✅ **Em Produção e Funcionando**  
**Últimas Implementações (21 de Dezembro de 2025)**:
- ✅ Documentação Completa de Vendas, Pagamentos e Caixas - Documentação detalhada do sistema financeiro criada
- ✅ CRM - Sistema completo de relacionamento com clientes (100% completo - 27 de Janeiro de 2026)
- ✅ Módulo Assinaturas - Sistema completo com CRUD, integração a vendas e abatimento automático (100% completo - 27 de Janeiro de 2026)
- ✅ Correção de erros SQL no CRM (ambiguidade de colunas - 27 de Janeiro de 2026)

**Implementações Anteriores (16 de Dezembro de 2025)**:
- ✅ Sistema de Módulos no Menu - Menu organizado por módulos expansíveis
- ✅ Correção do Sistema de Permissões — fonte na API/banco (Oracle em produção atual), sem duplicações
- ✅ Reorganização do Menu Sidebar - Ordem correta e organização por categorias
- ✅ Integração DocSales - Sistema de assinatura de contratos (eSign as a Service)
- ✅ Serviços de Integração - Módulo para gerenciar e usar integrações configuradas
- ✅ Master Acessa Tudo - Master não precisa configurar permissões

**Próxima Grande Funcionalidade**: Implementação completa do módulo Assinaturas e Balanço Demonstrativo

**URLs de Produção:**
- Painel Admin: https://appbarber.auctusconsultoria.com.br/admin
- Painel Cliente: https://appbarber.auctusconsultoria.com.br
- Site Público: https://appbarber.auctusconsultoria.com.br
- API Backend: https://api6.auctusconsultoria.com.br

**Infraestrutura:**
- Backend/API/Banco: VPS 82.25.65.201 (Hostinger)
- Frontend: VPS 45.132.157.28 (Hostinger - conta com domínio liberado)
- Banco de dados: Oracle em produção (`ORACLE_*`); PostgreSQL apenas fallback local sem Oracle
