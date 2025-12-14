# 💈 Sistema Barbearia Premium - Prótese Capilar Cuiabá

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue?style=for-the-badge&logo=typescript&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-20_LTS-green?style=for-the-badge&logo=node.js&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-blue?style=for-the-badge&logo=postgresql&logoColor=white)
![Express](https://img.shields.io/badge/Express.js-4.x-gray?style=for-the-badge&logo=express&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38bdf8?style=for-the-badge&logo=tailwind-css&logoColor=white)
![React](https://img.shields.io/badge/React-18.3-61dafb?style=for-the-badge&logo=react&logoColor=white)

</div>

<div align="center">

![Status](https://img.shields.io/badge/Status-Produção-success?style=flat-square)
![License](https://img.shields.io/badge/License-Private-red?style=flat-square)
![Last Update](https://img.shields.io/badge/Última_Atualização-13_Dezembro_2025-blue?style=flat-square)

</div>

---

## 🎯 Sobre o Projeto

Olá! Este é o **Sistema Barbearia Premium**, uma solução completa de gestão desenvolvida especificamente para a Prótese Capilar Cuiabá. Desenvolvi este sistema do zero pensando em facilitar o gerenciamento de clientes, funcionários, serviços, agendamentos e todo o fluxo operacional da barbearia.

O sistema foi construído com tecnologias modernas e está **100% em produção**, atendendo diariamente as necessidades da barbearia. Atualmente, temos três aplicações principais rodando:

- **Painel Administrativo** - Para gestão completa da barbearia
- **Painel do Cliente** - Para que os clientes acompanhem seus atendimentos
- **Site Público** - Site institucional (em desenvolvimento)

---

## 🛠️ Stack Tecnológica

### Frontend

<div align="left">

| Tecnologia | Versão | Uso |
|------------|--------|-----|
| ![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js) | 14.2 | Framework principal (App Router) |
| ![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue?logo=typescript) | 5.5 | Linguagem de programação |
| ![React](https://img.shields.io/badge/React-18.3-61dafb?logo=react) | 18.3 | Biblioteca UI |
| ![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8?logo=tailwind-css) | 3.4 | Framework CSS |
| ![Radix UI](https://img.shields.io/badge/Radix_UI-Latest-black?logo=radix-ui) | Latest | Componentes acessíveis |
| ![Framer Motion](https://img.shields.io/badge/Framer_Motion-11.11-black?logo=framer) | 11.11 | Animações |
| ![Lucide React](https://img.shields.io/badge/Lucide-Latest-gray?logo=lucide) | Latest | Ícones |
| ![React Hook Form](https://img.shields.io/badge/React_Hook_Form-7.55-pink?logo=react-hook-form) | 7.55 | Formulários |

</div>

### Backend

<div align="left">

| Tecnologia | Versão | Uso |
|------------|--------|-----|
| ![Node.js](https://img.shields.io/badge/Node.js-20_LTS-green?logo=node.js) | 20 LTS | Runtime |
| ![Express.js](https://img.shields.io/badge/Express-4.x-gray?logo=express) | 4.x | Framework web |
| ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-blue?logo=postgresql) | 15+ | Banco de dados |
| ![bcrypt](https://img.shields.io/badge/bcrypt-Latest-green?logo=bcrypt) | Latest | Hash de senhas |
| ![Multer](https://img.shields.io/badge/Multer-Latest-orange?logo=multer) | Latest | Upload de arquivos |

</div>

### Infraestrutura

<div align="left">

| Tecnologia | Uso |
|------------|-----|
| ![VPS Hostinger](https://img.shields.io/badge/VPS-Hostinger-orange) | Hospedagem (2 VPS) |
| ![AlmaLinux](https://img.shields.io/badge/OS-AlmaLinux_9-red) | Sistema operacional |
| ![CyberPanel](https://img.shields.io/badge/Painel-CyberPanel-blue) | Painel de controle |
| ![Nginx](https://img.shields.io/badge/Nginx-Latest-green?logo=nginx) | Servidor web |
| ![PM2](https://img.shields.io/badge/PM2-Latest-yellow?logo=pm2) | Gerenciador de processos |
| ![Cloudflare](https://img.shields.io/badge/DNS-Cloudflare-orange?logo=cloudflare) | DNS e CDN |
| ![Let's Encrypt](https://img.shields.io/badge/SSL-Let's_Encrypt-green?logo=lets-encrypt) | Certificados SSL |

**Infraestrutura:**
- **Backend/API/Banco**: VPS 82.25.65.201 (Hostinger)
- **Frontend**: VPS 45.132.157.28 (Hostinger - conta com domínio liberado)

</div>

---

## 📁 Estrutura do Projeto

```
Barbearia_Premium/
│
├── 📱 frontend/                    # Aplicações Frontend
│   ├── painel-admin/              # ✅ Painel Administrativo (Produção)
│   ├── painel-cliente/            # ✅ Painel do Cliente (Produção)
│   └── site-entrada/              # 🔄 Site Público (Desenvolvimento)
│
├── ⚙️ backend/                     # API Backend (Estrutura Modular)
│   ├── server.js                  # Servidor Express central
│   ├── config/                    # Configurações (database, cors, multer)
│   ├── routes/                    # Rotas modulares por funcionalidade
│   ├── middlewares/               # Middlewares customizados
│   └── utils/                     # Utilitários (logger, etc)
│
├── 📚 docs/                        # Documentação Completa
│   ├── deploy/                    # Guias de deploy
│   ├── HISTORICO_IMPLEMENTACOES.md # Histórico completo
│   └── ESTRUTURA_PROJETO.md       # Arquitetura detalhada
│
├── 🔧 scripts/                     # Scripts de configuração VPS
│   └── templates-nginx/           # Templates de configuração
│
└── 📄 [Scripts SQL]               # Scripts SQL de criação/correção
```

---

## ✨ Funcionalidades Implementadas

### 🔐 Autenticação e Segurança
- ✅ Sistema de login para clientes e administradores
- ✅ Senhas hasheadas com bcrypt (10 rounds)
- ✅ Validação de contas ativas/inativas
- ✅ CORS configurado para múltiplas origens
- ✅ Sistema de permissões granular (RBAC)

### 👥 Gerenciamento de Usuários
- ✅ **Funcionários**: CRUD completo com upload de foto, busca avançada, logs de ações
- ✅ **Clientes**: CRUD completo com funcionário responsável, busca unificada, validações
- ✅ Sistema de permissões por módulo (Master, Proprietário, Funcionário)

### 📊 Controle e Monitoramento
- ✅ **Controle de Acessos**: Dashboard com estatísticas, logs de login, filtros avançados
- ✅ **Controle de Logs**: Sistema completo de auditoria com filtros e exportação CSV
- ✅ **Help Desk**: Sistema de tickets completo com anexos e respostas

### 📅 Sistema de Agendamentos
- ✅ **Agenda Completa**: Visualização em dia, semana e mês
- ✅ **Busca de Horários Disponíveis**: Sistema inteligente que calcula horários livres
- ✅ **Filtro por Funcionário**: Visualização individual ou todos os funcionários (multi-coluna)
- ✅ **Fechamentos Especiais**: Configuração de dias de fechamento (feriados, férias)
- ✅ **Integração com Configurações**: Usa horários de funcionamento configurados
- ✅ **Cálculo Automático**: Calcula duração e valor baseado no serviço selecionado
- ✅ **Validação de Conflitos**: Previne sobreposição de agendamentos
- ✅ **Marcar Almoço/Saída**: Sistema para marcar horários de almoço e saída dos funcionários
- ✅ **Visualização Multi-Coluna**: Quando filtro = "todos", mostra todos os funcionários lado a lado
- ✅ **Edição de Agendamentos**: Clique em agendamento existente para editar

### 🎨 Interface e UX
- ✅ Design moderno e responsivo (mobile, tablet, desktop)
- ✅ Componentes shadcn/ui (Radix UI) para acessibilidade
- ✅ Animações suaves com Framer Motion
- ✅ Dark mode nativo
- ✅ Feedback visual em todas as ações

### ⚙️ Backend
- ✅ API REST completa (~40+ endpoints)
- ✅ Estrutura modular e escalável
- ✅ Middleware automático de logging
- ✅ Upload de arquivos (fotos e anexos)
- ✅ Integração completa com PostgreSQL

---

## 🚀 Como Começar

### Pré-requisitos
- Node.js 20+ instalado
- PostgreSQL 15+ instalado e configurado
- Git instalado

### Instalação

#### Backend
```bash
cd backend
npm install
cp .env.example .env  # Configurar variáveis de ambiente
npm run dev
```

#### Frontend - Painel Admin
```bash
cd frontend/painel-admin
npm install
npm run dev
# Acesse: http://localhost:3000
```

#### Frontend - Painel Cliente
```bash
cd frontend/painel-cliente
npm install
npm run dev
# Acesse: http://localhost:3001
```

---

## 🌐 URLs de Produção

| Aplicação | URL | Status |
|-----------|-----|--------|
| **Painel Admin** | https://admin.protesecapilarcuiaba.com.br | ✅ Produção |
| **Painel Cliente** | https://app.protesecapilarcuiaba.com.br | ✅ Produção |
| **Site Público** | https://www.protesecapilarcuiaba.com.br | 🔄 Desenvolvimento |
| **API Backend** | https://api.protesecapilarcuiaba.com.br | ✅ Produção |

---

## 📊 Estatísticas do Projeto

- **Endpoints API**: 70+ endpoints implementados
- **Módulos Backend**: 19 módulos modulares
- **Páginas Frontend**: 28+ páginas principais
- **Tabelas no Banco**: 25+ tabelas principais
- **Componentes UI**: 48+ componentes shadcn/ui
- **Módulos Implementados**: 17 módulos completos
- **Integrações**: 1 implementada (Focus NFe), estrutura para múltiplas

---

## 🎯 Módulos do Sistema

### ✅ Implementados e Funcionando
1. **Autenticação** - Login cliente e admin
2. **Gerenciamento de Funcionários** - CRUD completo
3. **Gerenciamento de Clientes** - CRUD completo
4. **Sistema de Permissões** - RBAC granular
5. **Controle de Acessos** - Logs de login com estatísticas
6. **Controle de Logs** - Sistema de auditoria completo
7. **Help Desk** - Sistema completo de tickets
8. **Serviços** - Gerenciamento de serviços da barbearia
9. **Configurações** - Configurações gerais do sistema (empresa, horários, agendamento)
10. **Integrações de APIs** - Sistema escalável de integrações (Focus NFe implementado)
11. **Agendamentos** - Sistema completo de agendamentos com busca de disponibilidade, marcação de almoço/saída
12. **Fechamentos Especiais** - Configuração de dias de fechamento
13. **Produtos** - Gerenciamento completo de produtos com histórico de preços de custo
14. **Estoque** - Gerenciamento completo de estoque com lançamento de entradas e atualização automática
15. **Caixas** - Gerenciamento completo de contas e movimentações financeiras (entradas, saídas, transferências)
16. **Lançamento de Venda** - Sistema completo de lançamento de vendas com serviços, produtos, descontos e parcelamento
17. **Receitas** - Gerenciamento completo de receitas com efetivação de pagamentos individuais e em lote
18. **Lançamento de Despesa** - Sistema completo de lançamento de despesas com parcelamento e integração com caixas
19. **Despesas** - Gerenciamento completo de despesas com quitação individual e em lote, monitoramento de contas a pagar
20. **Faturamento** - Visualização unificada de movimentações, edição linha por linha e criação de romaneios

### 🔄 Em Desenvolvimento
- Melhorias no Help Desk
- Relatórios financeiros
- Balanço Demonstrativo
- CRM

---

## 🗄️ Banco de Dados

### Schema: `protese` (em uso)

**Tabelas principais:**
- `usuarios_administrativos` - Administradores/Funcionários
- `usuarios_clientes` - Clientes do sistema
- `permissoes_usuarios` - Permissões granulares por módulo
- `controle_acessos` - Logs de acesso/login
- `logs_sistema` - Logs de ações do sistema
- `help_desk_chamados` - Chamados do Help Desk
- `help_desk_respostas` - Respostas dos chamados
- `help_desk_anexos` - Anexos dos chamados
- `servicos` - Serviços oferecidos pela barbearia
- `configuracoes` - Configurações gerais do sistema
- `integracoes` - Integrações com APIs externas
- `integracoes_habilitadas` - Funcionalidades habilitadas por integração
- `agendamentos` - Agendamentos de serviços
- `fechamentos_especiais` - Dias de fechamento especiais
- `produtos` - Produtos da barbearia
- `produtos_precos_custo` - Histórico de preços de custo dos produtos
- `estoque_movimentacoes` - Movimentações de entrada de estoque
- `contas` - Contas/Caixas do sistema
- `movimentacoes_caixa` - Movimentações financeiras (entradas, saídas, transferências)
- `vendas` - Vendas realizadas
- `vendas_servicos` - Serviços vinculados às vendas
- `vendas_produtos` - Produtos vinculados às vendas
- `vendas_parcelas` - Parcelas das vendas
- `receitas` - Receitas do sistema (vinculadas ou não a vendas)
- `despesas` - Despesas do sistema
- `despesas_parcelas` - Parcelas das despesas
- `romaneios` - Romaneios de faturamento
- `romaneios_itens` - Itens vinculados aos romaneios

**Scripts SQL importantes:**
- `COMANDOS_CRIAR_TABELA_PERMISSOES_SIMPLES.sql`
- `COMANDOS_CRIAR_TABELA_CONTROLE_ACESSOS.sql`
- `COMANDOS_ADICIONAR_FUNCIONARIO_RESPONSAVEL.sql`
- `COMANDOS_CRIAR_TABELA_LOGS_SISTEMA.sql`
- `COMANDOS_CRIAR_TABELA_CONFIGURACOES.sql`
- `COMANDOS_CRIAR_TABELA_INTEGRACOES.sql`
- `COMANDOS_CRIAR_TABELA_AGENDAMENTOS.sql`
- `DDL_FECHAMENTOS_ESPECIAIS.sql`
- `COMANDOS_CRIAR_TABELA_PRODUTOS.sql`
- `COMANDOS_ADICIONAR_PERMISSOES_PRODUTOS_ESTOQUE.sql`
- `COMANDOS_CRIAR_TABELA_ESTOQUE.sql`
- `COMANDOS_ATUALIZAR_TRIGGER_ESTOQUE_FORNECEDOR.sql`
- `COMANDOS_CRIAR_TABELA_CAIXAS.sql`
- `COMANDOS_ADICIONAR_PERMISSOES_CAIXAS.sql`
- `COMANDOS_CRIAR_TABELA_VENDAS.sql`
- `COMANDOS_ADICIONAR_PERMISSOES_VENDAS.sql`
- `COMANDOS_CRIAR_TABELA_RECEITAS.sql`
- `COMANDOS_ADICIONAR_PERMISSOES_RECEITAS.sql`
- `COMANDOS_CRIAR_TABELA_DESPESAS.sql`
- `COMANDOS_ADICIONAR_PERMISSOES_DESPESAS.sql`
- `COMANDOS_ADICIONAR_MOVIMENTACAO_CAIXA_ID_DESPESAS.sql`
- `COMANDOS_CRIAR_TABELA_ROMANEIOS.sql`
- `COMANDOS_CORRIGIR_FUNCAO_ROMANEIOS.sql`
- `COMANDOS_ATUALIZAR_STATUS_ROMANEIOS.sql`

---

## 📚 Documentação

### Documentação Principal
- **[Histórico de Implementações](./docs/HISTORICO_IMPLEMENTACOES.md)** - Tudo que foi implementado
- **[Implementações Dezembro 2025](./docs/IMPLEMENTACOES_DEZEMBRO_2025.md)** - Implementações mais recentes
- **[Implementações Janeiro 2025](./docs/IMPLEMENTACOES_JANEIRO_2025.md)** - Implementações de janeiro
- **[Status do Projeto](./docs/STATUS_PROJETO.md)** - Status atual completo
- **[Roadmap](./docs/ROADMAP.md)** - Próximos passos e planejamento
- **[Estrutura do Projeto](./docs/ESTRUTURA_PROJETO.md)** - Arquitetura completa
- **[Sistema de Logs](./docs/SISTEMA_LOGS.md)** - Documentação de logs
- **[Guia de Deploy](./docs/DEPLOY_GUIA_COMPLETO.md)** - Instruções consolidadas de deploy

### Documentação de Deploy
- **[Comandos Essenciais](./docs/deploy/COMANDOS_ESSENCIAIS.md)** - Comandos úteis
- **[Arquitetura VPS](./docs/deploy/ARQUITETURA_DUAS_VPS.md)** - Estrutura do servidor
- **[Segurança VPS](./docs/deploy/SEGURANCA_VPS.md)** - Boas práticas

---

## 🔧 Variáveis de Ambiente

### Backend (`.env`)
```env
PORT=3001
NODE_ENV=production

DB_HOST=localhost
DB_PORT=5432
DB_NAME=protese_capilar
DB_USER=protese_user
DB_PASSWORD=senha_segura

API_BASE_URL=https://api.protesecapilarcuiaba.com.br
CORS_ORIGINS=https://www.protesecapilarcuiaba.com.br,https://app.protesecapilarcuiaba.com.br,https://admin.protesecapilarcuiaba.com.br,http://localhost:3000,http://localhost:3001,http://localhost:3002
```

---

## 🎨 Design e UX

O sistema foi desenvolvido com foco em:
- **Acessibilidade**: Componentes Radix UI seguindo padrões WCAG
- **Responsividade**: Layout adaptativo para todos os dispositivos
- **Performance**: Otimizações de build e carregamento
- **Experiência do Usuário**: Interface intuitiva e feedback visual

---

## 🔐 Segurança

- Senhas hasheadas com bcrypt (10 rounds)
- CORS configurado para origens específicas
- Validação de inputs em todos os formulários
- Sistema de permissões granular (RBAC)
- Logs de auditoria para todas as ações críticas

---

## 📈 Próximos Passos

Para informações detalhadas sobre o planejamento futuro, consulte o **[Roadmap](./docs/ROADMAP.md)**.

**Foco Atual (Q4 2025 / Q1 2026):**
- ✅ Sistema de Agendamentos completo (concluído em Dezembro 2025)
- ✅ Marcar Almoço/Saída (concluído em Dezembro 2025)
- ✅ Módulo de Produtos completo (concluído em Dezembro 2025)
- ✅ Reorganização do Menu (concluído em Dezembro 2025)
- ✅ Módulo de Estoque completo (concluído em Dezembro 2025)
- ✅ Módulo de Caixas completo (concluído em Dezembro 2025)
- ✅ Lançamento de Venda completo (concluído em Dezembro 2025)
- ✅ Módulo de Receitas completo (concluído em Dezembro 2025)
- ✅ Lançamento de Despesa completo (concluído em Dezembro 2025)
- ✅ Módulo de Despesas completo (concluído em Dezembro 2025)
- ✅ Módulo de Faturamento completo (concluído em Dezembro 2025)
- ✅ Sistema de Romaneios completo (concluído em Dezembro 2025)
- 🔄 Emissão de Nota Fiscal (integração Focus NFe - estrutura pronta)
- 🔄 Melhorias no Help Desk
- 🔄 Melhorias no Estoque (saída, ajustes, relatórios)
- 🔄 Relatórios financeiros

**Planejado:**
- 🔄 Balanço Demonstrativo
- 🔄 CRM
- 🔄 Analytics e relatórios
- 🔄 Sistema de notificações

---

## 💡 Sobre o Desenvolvimento

Este projeto foi desenvolvido pensando em escalabilidade, manutenibilidade e performance. A estrutura modular do backend facilita a adição de novos módulos, e o uso de tecnologias modernas garante que o sistema esteja sempre atualizado.

Todas as decisões técnicas foram tomadas considerando:
- Facilidade de manutenção
- Performance
- Segurança
- Experiência do usuário
- Escalabilidade

---

## 📄 Licença

Este é um projeto privado desenvolvido para uso comercial da Prótese Capilar Cuiabá.

---

<div align="center">

**Desenvolvido com ❤️ para Prótese Capilar Cuiabá**

*Sistema em desenvolvimento ativo* 🚀

**Última Atualização**: 13 de Dezembro de 2025  
**Versão**: 1.6.0

</div>
