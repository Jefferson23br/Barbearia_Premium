# 💈 Sistema Barbearia Premium

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
![Last Update](https://img.shields.io/badge/Última_Atualização-21_Dezembro_2025-blue?style=flat-square)
![Version](https://img.shields.io/badge/Versão-2.0.0-green?style=flat-square)

</div>

---

## 🎯 Sobre o Projeto

Olá! Este é o **Sistema Barbearia Premium**, uma solução completa de gestão para operação de barbearias com foco em escalabilidade e modelo multi-filial.

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
- **Backend/API/Banco**: VPS 82.25.65.201 (Hostinger) - API, Backend e Banco de dados PostgreSQL
- **Frontend**: VPS 45.132.157.28 (Hostinger - conta diferente com domínio liberado) - Aplicações frontend
- **Banco de Dados**: PostgreSQL 15+ (ambiente em migração de legado para estrutura v2 multi-filial)

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
- ✅ Sistema de permissões granular (RBAC) por usuário
- ✅ Sistema de módulos organizados no menu

### 👥 Gerenciamento de Usuários
- ✅ **Funcionários**: CRUD completo com upload de foto, busca avançada, logs de ações
- ✅ **Clientes**: CRUD completo com funcionário responsável, busca unificada, validações
- ✅ Sistema de permissões por módulo (Master, Proprietário, Funcionário)
- ✅ **Menu organizado por módulos** - Sistema expansível com módulos e subitens

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
- ✅ **Menu Sidebar com Módulos Expansíveis** - Organização por categorias

### ⚙️ Backend
- ✅ API REST completa (~100+ endpoints)
- ✅ Estrutura modular e escalável
- ✅ Middleware automático de logging
- ✅ Upload de arquivos (fotos e anexos)
- ✅ Integração completa com PostgreSQL
- ✅ **Sistema de Módulos** - Organização de itens do menu em módulos

### 💰 Sistema Financeiro Completo
- ✅ **Lançamento de Venda** - Sistema completo com serviços, produtos, descontos e parcelamento
- ✅ **Receitas** - Gerenciamento completo com efetivação de pagamentos
- ✅ **Lançamento de Despesa** - Sistema completo com parcelamento
- ✅ **Despesas** - Gerenciamento completo com quitação e monitoramento
- ✅ **Faturamento** - Visualização unificada, edição e criação de romaneios
- ✅ **Caixas** - Gerenciamento de contas e movimentações financeiras
- ✅ **Emissão de Nota Fiscal** - Integração com Focus NFe
- ✅ **Emissão de Relatórios** - 11 relatórios completos com exportação

### 📦 Gestão de Produtos e Estoque
- ✅ **Produtos** - CRUD completo com histórico de preços de custo
- ✅ **Estoque** - Gerenciamento completo com lançamento de entradas e atualização automática
- ✅ **Abatimento Automático** - Estoque é abatido automaticamente em vendas

### 🎁 Marketing e Fidelização
- ✅ **Cupons e Fidelidades** - Sistema completo de cupons de desconto e programa de fidelidade

### 📋 Sistema de Assinaturas
- ✅ **Assinaturas** - CRUD completo de assinaturas (pacotes de serviços e produtos)
- ✅ **Validade em Dias** - Controle de expiração das assinaturas
- ✅ **Integração com Vendas** - Assinaturas podem ser vendidas como produtos/serviços
- ✅ **Abatimento Automático** - Serviços/produtos de assinaturas são abatidos automaticamente
- ✅ **Controle de Estoque de Uso** - Sistema que controla quantidades restantes por cliente
- ✅ **CRM - Aba Assinaturas** - Visualização de assinaturas ativas do cliente no CRM

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
| **Painel Admin** | https://appbarber.auctusconsultoria.com.br/admin | ✅ Produção |
| **Painel Cliente** | https://appbarber.auctusconsultoria.com.br | ✅ Produção |
| **Site Público** | https://appbarber.auctusconsultoria.com.br | 🔄 Desenvolvimento |
| **API Backend** | https://api6.auctusconsultoria.com.br | ✅ Produção |

**Configuração:**
- **API_BASE_URL**: https://api6.auctusconsultoria.com.br
- **CORS_ORIGINS**: https://appbarber.auctusconsultoria.com.br,http://localhost:3000,http://localhost:3001,http://localhost:3002
- **DB_NAME**: definir conforme ambiente (legado/v2)
- **DB_USER**: definir conforme ambiente
- **Backend/API/Banco**: VPS 82.25.65.201 (Hostinger)
- **Frontend**: VPS 45.132.157.28 (Hostinger - conta diferente)

---

## 📊 Estatísticas do Projeto

- **Endpoints API**: 100+ endpoints implementados
- **Módulos Backend**: 26 módulos modulares
- **Páginas Frontend**: 35+ páginas principais
- **Tabelas no Banco**: 30+ tabelas principais
- **Componentes UI**: 48+ componentes shadcn/ui
- **Módulos Implementados**: 26 módulos completos
- **Integrações**: 9 integrações implementadas (Focus NFe, PLUG NFe, Asaas, Mercado Pago, PagSeguro, Twilio, WhatsApp Business API, SendGrid, DocSales)

---

## 🎯 Módulos do Sistema

### ✅ Implementados e Funcionando

1. **Autenticação** - Login cliente e admin
2. **Gerenciamento de Funcionários** - CRUD completo
3. **Gerenciamento de Clientes** - CRUD completo
4. **Sistema de Permissões** - RBAC granular por usuário
5. **Sistema de Módulos** - Organização do menu em módulos expansíveis
6. **Controle de Acessos** - Logs de login com estatísticas
7. **Controle de Logs** - Sistema de auditoria completo
8. **Help Desk** - Sistema completo de tickets
9. **Serviços** - Gerenciamento de serviços da barbearia
10. **Configurações** - Configurações gerais do sistema (empresa, horários, agendamento)
11. **Integrações de APIs** - Sistema escalável com 9 integrações implementadas (incluindo DocSales para assinatura de contratos)
12. **Serviços de Integração** - Módulo para gerenciar e usar integrações configuradas (16 de Dezembro de 2025)
12. **Agendamentos** - Sistema completo de agendamentos
13. **Fechamentos Especiais** - Configuração de dias de fechamento
14. **Produtos** - Gerenciamento completo de produtos
15. **Estoque** - Gerenciamento completo de estoque
16. **Caixas** - Gerenciamento de contas e movimentações
17. **Lançamento de Venda** - Sistema completo de vendas
18. **Receitas** - Gerenciamento completo de receitas
19. **Lançamento de Despesa** - Sistema completo de despesas
20. **Despesas** - Gerenciamento completo de despesas
21. **Faturamento** - Visualização unificada e romaneios
22. **Emissão de Nota Fiscal** - Integração Focus NFe
23. **Emissão de Relatórios** - 11 relatórios completos
24. **Dashboard Personalizado** - Filtros por tipo de usuário
25. **Cupons e Fidelidades** - Sistema completo
26. **Balanço Demonstrativo** - Estrutura criada
27. **CRM** - Sistema completo de relacionamento com clientes (27 de Janeiro de 2026)
28. **Assinaturas** - Sistema completo de assinaturas com integração a vendas (27 de Janeiro de 2026)

### 🔄 Em Desenvolvimento
- Melhorias no Help Desk
- Melhorias nos Relatórios (gráficos, mais métricas)
- Expansão do sistema de Assinaturas (novas funcionalidades)

---

## 🗄️ Banco de Dados

### Banco em transição (legado + v2)

**Tabelas principais:**
- `usuarios_administrativos` - Administradores/Funcionários
- `usuarios_clientes` - Clientes do sistema
- `permissoes_usuarios` - Permissões granulares por módulo
- `modulos` - Módulos do sistema para organização do menu
- `modulos_itens` - Itens do menu agrupados por módulos
- `controle_acessos` - Logs de acesso/login
- `logs_sistema` - Logs de ações do sistema
- `help_desk_chamados` - Chamados do Help Desk
- `help_desk_respostas` - Respostas dos chamados
- `servicos` - Serviços oferecidos pela barbearia
- `configuracoes` - Configurações gerais do sistema
- `integracoes` - Integrações com APIs externas
- `agendamentos` - Agendamentos de serviços
- `fechamentos_especiais` - Dias de fechamento especiais
- `produtos` - Produtos da barbearia
- `produtos_precos_custo` - Histórico de preços de custo dos produtos
- `estoque_movimentacoes` - Movimentações de entrada de estoque
- `contas` - Contas/Caixas do sistema
- `movimentacoes_caixa` - Movimentações financeiras
- `vendas` - Vendas realizadas
- `vendas_servicos` - Serviços vinculados às vendas
- `vendas_produtos` - Produtos vinculados às vendas
- `vendas_parcelas` - Parcelas das vendas
- `receitas` - Receitas do sistema
- `despesas` - Despesas do sistema
- `despesas_parcelas` - Parcelas das despesas
- `romaneios` - Romaneios de faturamento
- `romaneios_itens` - Itens vinculados aos romaneios
- `notas_fiscais` - Notas fiscais emitidas
- `categorias_custo` - Categorias de custo (hierárquicas)
- `cupons` - Cupons de desconto e fidelidade
- `cupons_usados` - Registro de uso de cupons
- `fidelidades` - Controle de fidelidade por cliente
- `crm_relacionamentos` - Registro de interações e contatos com clientes no CRM
- `assinaturas` - Assinaturas comercializáveis (pacotes de serviços/produtos)
- `assinaturas_servicos` - Serviços incluídos em cada assinatura
- `assinaturas_produtos` - Produtos incluídos em cada assinatura
- `assinaturas_clientes` - Controle de estoque de uso das assinaturas por cliente
- `vendas_assinaturas` - Assinaturas vinculadas a vendas
- `modulos` - Módulos do sistema para organização do menu
- `modulos_itens` - Itens do menu agrupados por módulos

**Scripts SQL importantes:**
- `COMANDOS_CRIAR_TABELA_MODULOS.sql` - Sistema de módulos
- `COMANDOS_ADICIONAR_BALANCO_RELATORIOS.sql` - Adicionar Balanço ao módulo Relatórios
- `COMANDOS_CRIAR_TABELA_CRM_RELACIONAMENTOS.sql` - Tabela de relacionamentos do CRM
- `COMANDOS_ADICIONAR_ASSINATURAS.sql` - Adicionar módulo Assinaturas ao menu
- `COMANDOS_CRIAR_TABELA_ASSINATURAS.sql` - Criar tabelas do sistema de assinaturas
- `COMANDOS_ADICIONAR_ASSINATURAS_VENDAS.sql` - Integrar assinaturas ao sistema de vendas
- `COMANDOS_ADICIONAR_VALIDADE_ASSINATURAS.sql` - Adicionar campo validade_em_dias
- `COMANDOS_ADICIONAR_PERMISSOES_ASSINATURAS.sql` - Adicionar permissões do módulo
- E muitos outros scripts de criação e atualização

---

## 📚 Documentação

### Documentação Principal
- **[Histórico de Implementações](./docs/HISTORICO_IMPLEMENTACOES.md)** - Tudo que foi implementado
- **[Implementações Dezembro 2025](./docs/IMPLEMENTACOES_DEZEMBRO_2025.md)** - Implementações mais recentes
- **[Status do Projeto](./docs/STATUS_PROJETO.md)** - Status atual completo
- **[Roadmap](./docs/ROADMAP.md)** - Próximos passos e planejamento
- **[Próximos Passos](./docs/PROXIMOS_PASSOS.md)** - Planejamento detalhado das próximas implementações
- **[Estrutura do Projeto](./docs/ESTRUTURA_PROJETO.md)** - Arquitetura completa
- **[Sistema de Logs](./docs/SISTEMA_LOGS.md)** - Documentação de logs
- **[Guia de Deploy](./docs/DEPLOY_GUIA_COMPLETO.md)** - Instruções consolidadas de deploy
- **[Documentação de Integrações](./DOCUMENTACAO_INTEGRACOES.md)** - Guia completo de todas as integrações disponíveis
- **[Documentação de Vendas, Pagamentos e Caixas](./DOCUMENTACAO_VENDAS_PAGAMENTOS_CAIXAS.md)** - Documentação completa do sistema financeiro

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
DB_NAME=barbearia_premium
DB_USER=barbearia_user
DB_PASSWORD=senha_segura

API_BASE_URL=https://api6.auctusconsultoria.com.br
CORS_ORIGINS=https://appbarber.auctusconsultoria.com.br,http://localhost:3000,http://localhost:3001,http://localhost:3002
```

---

## 🎨 Design e UX

O sistema foi desenvolvido com foco em:
- **Acessibilidade**: Componentes Radix UI seguindo padrões WCAG
- **Responsividade**: Layout adaptativo para todos os dispositivos
- **Performance**: Otimizações de build e carregamento
- **Experiência do Usuário**: Interface intuitiva e feedback visual
- **Organização**: Menu organizado por módulos expansíveis

---

## 🔐 Segurança

- Senhas hasheadas com bcrypt (10 rounds)
- CORS configurado para origens específicas
- Validação de inputs em todos os formulários
- Sistema de permissões granular (RBAC) por usuário
- Logs de auditoria para todas as ações críticas

---

## 📈 Próximos Passos

Para informações detalhadas sobre o planejamento futuro, consulte o **[Roadmap](./docs/ROADMAP.md)**.

**Foco Atual (Q1 2026):**
- ✅ Sistema de Módulos no Menu (concluído em 16 de Dezembro de 2025)
- ✅ Correção do Sistema de Permissões (concluído em 16 de Dezembro de 2025)
- ✅ Reorganização do Menu Sidebar (concluído em 16 de Dezembro de 2025)
- ✅ Integração DocSales - Sistema de assinatura de contratos (concluído em 16 de Dezembro de 2025)
- ✅ Módulo Serviços de Integração - Página para gerenciar integrações (concluído em 16 de Dezembro de 2025)
- ✅ Master acessa tudo automaticamente sem configuração de permissões (concluído em 16 de Dezembro de 2025)
- ✅ CRM - Sistema completo de relacionamento com clientes (concluído em 27 de Janeiro de 2026)
- ✅ Módulo Assinaturas - Sistema completo com CRUD, integração a vendas, abatimento automático e controle de validade (concluído em 27 de Janeiro de 2026)
- ✅ Correção de Exclusão de Faturamento - Exclusão completa de receitas, movimentações de caixa, CRM e assinaturas (concluído em 27 de Janeiro de 2026)
- ✅ Correção de Vendas/Receitas/Caixa - Geração automática de movimentações de caixa para vendas pagas à vista (concluído em 27 de Janeiro de 2026)
- ✅ Documentação Completa de Vendas, Pagamentos e Caixas - Documentação detalhada criada em 21 de Dezembro de 2025
- 🔄 Melhorias no Help Desk
- 🔄 Melhorias no Estoque (saída, ajustes, relatórios)
- 🔄 Melhorias nos Relatórios (gráficos, mais métricas)
- 🔄 Balanço Demonstrativo

**Planejado:**
- 🔄 Analytics e relatórios avançados
- 🔄 Sistema de notificações
- 🔄 Aplicativo mobile

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

Este é um projeto privado desenvolvido para uso comercial da Barbearia Premium.

---

<div align="center">

**Desenvolvido com ❤️ para Barbearia Premium**

*Sistema em desenvolvimento ativo* 🚀

**Última Atualização**: 21 de Dezembro de 2025  
**Versão**: 2.0.0  
**Desenvolvido para**: Barbearia Premium  
**Status**: ✅ Em Produção e Funcionando

</div>
