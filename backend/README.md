# ⚙️ Backend - Sistema Barbearia Premium

API REST desenvolvida com Node.js, Express.js e PostgreSQL. Esta é a parte do backend que gerencia toda a lógica de negócio e comunicação com o banco de dados.

---

## 🚀 Status

**Status**: ✅ **Em Produção**  
**URL**: https://api.protesecapilarcuiaba.com.br  
**Porta**: 3001  
**VPS**: 82.25.65.201 (Hostinger)  
**Última Atualização**: 27 de Janeiro de 2026  
**Banco de Dados**: PostgreSQL 15+ (protese_capilar, protese_user)

---

## 🛠️ Tecnologias Utilizadas

- **Node.js 20 LTS** - Runtime JavaScript
- **Express.js 4.x** - Framework web minimalista e flexível
- **PostgreSQL 15+** - Banco de dados relacional robusto
- **bcrypt** - Hash de senhas com 10 rounds
- **Multer** - Upload de arquivos (fotos e anexos)
- **dotenv** - Gerenciamento de variáveis de ambiente

---

## 📁 Estrutura Modular

Organizei o backend em uma estrutura modular para facilitar a manutenção e escalabilidade:

```
backend/
├── server.js           # Servidor Express central (ponto de entrada)
├── config/             # Configurações compartilhadas
│   ├── database.js    # Configuração PostgreSQL
│   ├── cors.js        # Configuração CORS
│   └── multer.js      # Configuração upload
├── routes/             # Rotas modulares por funcionalidade
│   ├── index.js       # Agrupa todas as rotas
│   ├── clientes.js    # CRUD de clientes
│   ├── funcionarios.js # CRUD de funcionários
│   ├── auth.js        # Autenticação (login)
│   ├── permissoes.js  # Sistema de permissões
│   ├── controle-acessos.js # Controle de acessos/login
│   ├── logs.js        # Sistema de logs/auditoria
│   ├── help-desk.js   # Help Desk (tickets)
│   ├── servicos.js    # Gerenciamento de serviços
│   ├── produtos.js    # Gerenciamento de produtos
│   ├── estoque.js     # Gerenciamento de estoque
│   ├── configuracoes.js # Configurações do sistema
│   ├── integracoes.js # Integrações de APIs externas
│   ├── docsales.js # Integração DocSales (assinatura de contratos)
│   ├── agendamentos.js # Sistema de agendamentos
│   ├── fechamentos-especiais.js # Fechamentos especiais
│   ├── produtos.js # Gerenciamento de produtos
│   ├── estoque.js # Gerenciamento de estoque
│   ├── caixas.js # Gerenciamento de contas e movimentações
│   ├── vendas.js # Lançamento de vendas
│   ├── receitas.js # Gerenciamento de receitas
│   ├── despesas.js # Gerenciamento de despesas
│   ├── faturamento.js # Faturamento e romaneios
│   ├── emissao-nfe.js # Emissão de notas fiscais
│   ├── relatorios.js # Geração de relatórios
│   ├── dashboard.js # Dashboard personalizado
│   ├── cupons-fidelidades.js # Cupons e fidelidades
    │   ├── crm.js # Sistema CRM de relacionamento com clientes
    │   ├── assinaturas.js # Sistema de assinaturas (pacotes de serviços/produtos)
    │   └── modulos.js # Sistema de módulos do menu
├── middlewares/         # Middlewares customizados
│   └── apiLogger.js   # Middleware de logs automático
├── services/           # Serviços de integração
│   └── integracoes.js  # Serviço unificado de integrações (DocSales, etc)
└── utils/              # Utilitários
    ├── logger.js      # Sistema de logs
    └── logHelper.js   # Helpers de logs
```

**Por que escolhi essa estrutura?**
- ✅ **Manutenibilidade**: Cada módulo é independente e fácil de entender
- ✅ **Escalabilidade**: Posso adicionar novos módulos sem afetar os existentes
- ✅ **Organização**: Código organizado por funcionalidade, não por tipo
- ✅ **Colaboração**: Múltiplos desenvolvedores podem trabalhar em paralelo

---

## 🔧 Configuração

### Pré-requisitos
- Node.js 20+ instalado
- PostgreSQL 15+ instalado e configurado
- npm ou yarn

### Instalação

```bash
cd backend
npm install
```

### Variáveis de Ambiente

Crie um arquivo `.env` na raiz do backend com as seguintes variáveis:

```env
PORT=3001
NODE_ENV=production

DB_HOST=localhost
DB_PORT=5432
DB_NAME=protese_capilar
DB_USER=protese_user
DB_PASSWORD=sua_senha_segura

API_BASE_URL=https://api.protesecapilarcuiaba.com.br
CORS_ORIGINS=https://www.protesecapilarcuiaba.com.br,https://app.protesecapilarcuiaba.com.br,https://admin.protesecapilarcuiaba.com.br,http://localhost:3000,http://localhost:3001,http://localhost:3002
```

---

## 🏃 Como Executar

### Desenvolvimento

```bash
npm run dev
# ou
node server.js
```

### Produção (PM2)

```bash
pm2 start server.js --name api-protese-capilar
pm2 save
```

---

## 📡 Endpoints Implementados

Desenvolvi uma API REST completa com os seguintes endpoints:

### 🔐 Autenticação
- `POST /api/v1/auth/login` - Login de cliente
- `POST /api/v1/auth/admin/login` - Login de administrador

### 👥 Funcionários
- `GET /api/v1/funcionarios` - Listar funcionários (com filtro de Master)
- `POST /api/v1/funcionarios` - Criar funcionário
- `GET /api/v1/funcionarios/:id` - Buscar funcionário específico
- `PUT /api/v1/funcionarios/:id` - Atualizar funcionário
- `DELETE /api/v1/funcionarios/:id` - Excluir funcionário (proteção Master)

### 👤 Clientes
- `GET /api/v1/clientes` - Listar clientes (com funcionário responsável)
- `POST /api/v1/clientes` - Criar cliente
- `GET /api/v1/clientes/:id` - Buscar cliente específico
- `PUT /api/v1/clientes/:id` - Atualizar cliente
- `DELETE /api/v1/clientes/:id` - Excluir cliente

### 🔐 Permissões
- `GET /api/v1/permissoes/:usuarioId` - Buscar permissões do usuário
- `PUT /api/v1/permissoes/:usuarioId` - Atualizar permissões

### 📊 Controle de Acessos
- `GET /api/v1/controle-acessos` - Listar acessos (com filtros avançados)
- `GET /api/v1/controle-acessos/estatisticas` - Estatísticas de acesso

### 📋 Logs do Sistema
- `GET /api/v1/logs` - Listar logs (com filtros avançados)
- `GET /api/v1/logs/estatisticas` - Estatísticas de logs
- `GET /api/v1/logs/:id` - Buscar log específico

### 🛍️ Serviços
- `GET /api/v1/servicos` - Listar serviços (com filtros)
- `POST /api/v1/servicos` - Criar serviço
- `GET /api/v1/servicos/:id` - Buscar serviço específico
- `PUT /api/v1/servicos/:id` - Atualizar serviço
- `DELETE /api/v1/servicos/:id` - Excluir serviço

### 📦 Produtos
- `GET /api/v1/produtos` - Listar produtos (com busca e filtros)
- `POST /api/v1/produtos` - Criar produto
- `GET /api/v1/produtos/:id` - Buscar produto específico
- `PUT /api/v1/produtos/:id` - Atualizar produto
- `DELETE /api/v1/produtos/:id` - Excluir produto
- `POST /api/v1/produtos/:id/preco-custo` - Lançar preço de custo
- `GET /api/v1/produtos/:id/precos-custo` - Histórico de preços de custo

### 📊 Estoque
- `GET /api/v1/estoque/produtos` - Listar produtos com estoque atual
- `GET /api/v1/estoque/movimentacoes` - Listar movimentações de estoque
- `GET /api/v1/estoque/movimentacoes/:id` - Buscar movimentação específica
- `POST /api/v1/estoque/entrada` - Lançar entrada de estoque
- `DELETE /api/v1/estoque/movimentacoes/:id` - Excluir movimentação

### 💰 Caixas
- `GET /api/v1/caixas/contas` - Listar todas as contas
- `GET /api/v1/caixas/contas/:id` - Buscar conta específica
- `POST /api/v1/caixas/contas` - Criar nova conta
- `PUT /api/v1/caixas/contas/:id` - Atualizar conta
- `DELETE /api/v1/caixas/contas/:id` - Excluir conta
- `GET /api/v1/caixas/movimentacoes` - Listar movimentações
- `POST /api/v1/caixas/movimentacoes/entrada` - Criar entrada manual
- `POST /api/v1/caixas/movimentacoes/saida` - Criar saída manual
- `POST /api/v1/caixas/movimentacoes/transferencia` - Criar transferência entre contas
- `DELETE /api/v1/caixas/movimentacoes/:id` - Excluir movimentação

### 🛒 Vendas
- `GET /api/v1/vendas/agendamentos` - Buscar agendamentos do dia (apenas status "agendado")
- `GET /api/v1/vendas` - Listar todas as vendas
- `GET /api/v1/vendas/:id` - Buscar venda específica
- `POST /api/v1/vendas` - Criar nova venda (gera receitas e movimentações automaticamente)
- `DELETE /api/v1/vendas/:id` - Excluir venda (reverte receitas e movimentações)

### 💵 Receitas
- `GET /api/v1/receitas` - Listar receitas (com filtros avançados)
- `GET /api/v1/receitas/:id` - Buscar receita específica
- `POST /api/v1/receitas/efetivar-pagamento` - Efetivar pagamento (individual ou em lote)
- `PUT /api/v1/receitas/:id` - Atualizar receita
- `DELETE /api/v1/receitas/:id` - Excluir receita (apenas se não paga)

### 💸 Despesas
- `GET /api/v1/despesas` - Listar despesas (com filtros avançados)
- `GET /api/v1/despesas/:id` - Buscar despesa específica
- `POST /api/v1/despesas` - Criar nova despesa
- `PUT /api/v1/despesas/:id` - Atualizar despesa
- `DELETE /api/v1/despesas/:id` - Excluir despesa
- `POST /api/v1/despesas/efetivar-pagamento` - Efetivar pagamento (individual ou em lote)
- `PUT /api/v1/despesas/modificar-pagamento/:parcela_id` - Modificar pagamento já efetivado

### 📊 Faturamento
- `GET /api/v1/faturamento/movimentacoes` - Listar todas as movimentações (vendas, despesas, estoque)
- `GET /api/v1/faturamento/venda/:id` - Buscar venda específica para edição
- `PUT /api/v1/faturamento/venda/:id` - Editar venda
- `DELETE /api/v1/faturamento/venda/:id` - Excluir venda
- `GET /api/v1/faturamento/despesa/:id` - Buscar despesa específica para edição
- `PUT /api/v1/faturamento/despesa/:id` - Editar despesa
- `DELETE /api/v1/faturamento/despesa/:id` - Excluir despesa
- `GET /api/v1/faturamento/estoque/:id` - Buscar movimentação de estoque específica para edição
- `PUT /api/v1/faturamento/estoque/:id` - Editar movimentação de estoque
- `DELETE /api/v1/faturamento/estoque/:id` - Excluir movimentação de estoque
- `POST /api/v1/faturamento/romaneios` - Criar novo romaneio
- `GET /api/v1/faturamento/romaneios` - Listar todos os romaneios
- `GET /api/v1/faturamento/romaneios/:id` - Buscar romaneio específico com detalhes

### ⚙️ Configurações
- `GET /api/v1/configuracoes` - Buscar configurações do sistema
- `PUT /api/v1/configuracoes` - Atualizar configurações

### 🔌 Integrações
- `GET /api/v1/integracoes` - Listar todas as integrações
- `GET /api/v1/integracoes/:tipo` - Buscar integração específica
- `POST /api/v1/integracoes` - Criar nova integração
- `PUT /api/v1/integracoes/:tipo` - Atualizar integração
- `PUT /api/v1/integracoes/:tipo/funcionalidade/:funcionalidade` - Habilitar/desabilitar funcionalidade

### 📝 DocSales (Assinatura de Contratos)
- `POST /api/v1/docsales/documentos` - Enviar documento para assinatura
- `GET /api/v1/docsales/documentos/:id` - Consultar status do documento
- `POST /api/v1/docsales/documentos/:id/cancelar` - Cancelar documento
- `GET /api/v1/docsales/documentos` - Listar documentos
- `GET /api/v1/docsales/documentos/:id/download` - Baixar documento assinado
- `POST /api/v1/docsales/webhook` - Receber notificações de webhook

### 🎫 Help Desk
- `GET /api/v1/help-desk/chamados` - Listar chamados
- `POST /api/v1/help-desk/chamados` - Criar chamado
- `GET /api/v1/help-desk/chamados/:id` - Buscar chamado
- `PUT /api/v1/help-desk/chamados/:id` - Atualizar chamado
- `POST /api/v1/help-desk/chamados/:id/respostas` - Adicionar resposta
- `GET /api/v1/help-desk/funcionarios` - Listar funcionários para responsável

### 📅 Agendamentos
- `GET /api/v1/agendamentos` - Listar agendamentos (com filtros)
- `POST /api/v1/agendamentos` - Criar agendamento
- `GET /api/v1/agendamentos/:id` - Buscar agendamento específico
- `PUT /api/v1/agendamentos/:id` - Atualizar agendamento
- `DELETE /api/v1/agendamentos/:id` - Excluir agendamento
- `GET /api/v1/agendamentos/disponibilidades` - Buscar horários disponíveis
- `GET /api/v1/agendamentos/horarios-funcionamento` - Buscar horários de funcionamento
- `GET /api/v1/agendamentos/recursos-especiais` - Buscar/criar cliente Sistema e serviços especiais

### 🗓️ Fechamentos Especiais
- `GET /api/v1/fechamentos-especiais` - Listar fechamentos especiais
- `POST /api/v1/fechamentos-especiais` - Criar fechamento especial
- `GET /api/v1/fechamentos-especiais/verificar/:data` - Verificar se data é fechamento
- `PUT /api/v1/fechamentos-especiais/:id` - Atualizar fechamento especial
- `DELETE /api/v1/fechamentos-especiais/:id` - Excluir fechamento especial

### 🎫 Cupons e Fidelidades
- `GET /api/v1/cupons-fidelidades/cupons` - Listar cupons
- `POST /api/v1/cupons-fidelidades/cupons` - Criar cupom
- `GET /api/v1/cupons-fidelidades/cupons/:id` - Buscar cupom específico
- `PUT /api/v1/cupons-fidelidades/cupons/:id` - Atualizar cupom
- `DELETE /api/v1/cupons-fidelidades/cupons/:id` - Excluir cupom
- `GET /api/v1/cupons-fidelidades/cupons/validar/:codigo` - Validar cupom
- `POST /api/v1/cupons-fidelidades/cupons/usar` - Registrar uso de cupom
- `GET /api/v1/cupons-fidelidades/fidelidades` - Listar fidelidades
- `GET /api/v1/cupons-fidelidades/fidelidades/cliente/:clienteId` - Fidelidades de um cliente
- `POST /api/v1/cupons-fidelidades/fidelidades/atualizar` - Atualizar fidelidade

### 👥 CRM (Customer Relationship Management)
- `GET /api/v1/crm/buscar-clientes` - Buscar clientes por nome ou email
- `GET /api/v1/crm/cliente/:id/dados` - Buscar dados completos do cliente (agendamentos, vendas, receitas, relacionamentos)
- `GET /api/v1/crm/cliente/:id/relacionamentos` - Listar relacionamentos do cliente
- `POST /api/v1/crm/cliente/:id/relacionamentos` - Criar relacionamento
- `PUT /api/v1/crm/cliente/:id/relacionamentos/:relacionamento_id` - Atualizar relacionamento
- `DELETE /api/v1/crm/cliente/:id/relacionamentos/:relacionamento_id` - Excluir relacionamento
- `GET /api/v1/crm/cliente/:id/assinaturas` - Buscar assinaturas ativas do cliente

### 📋 Assinaturas
- `GET /api/v1/assinaturas` - Listar assinaturas (com serviços e produtos)
- `GET /api/v1/assinaturas/:id` - Buscar assinatura específica
- `POST /api/v1/assinaturas` - Criar assinatura
- `PUT /api/v1/assinaturas/:id` - Atualizar assinatura
- `DELETE /api/v1/assinaturas/:id` - Excluir assinatura

### 📂 Módulos do Menu
- `GET /api/v1/modulos` - Listar módulos com seus itens ordenados

### 🏥 Health Check
- `GET /health` - Status da API
- `GET /api/test-db` - Teste de conexão com banco

---

## 🗄️ Banco de Dados

### Schema: `protese`

Implementei as seguintes tabelas principais:

- `usuarios_administrativos` - Administradores/Funcionários
- `usuarios_clientes` - Clientes do sistema
- `permissoes_usuarios` - Permissões granulares por módulo
- `controle_acessos` - Logs de acesso/login (agrupado por dia)
- `logs_sistema` - Logs de ações do sistema
- `help_desk_chamados` - Chamados do Help Desk
- `help_desk_respostas` - Respostas dos chamados
- `help_desk_anexos` - Anexos dos chamados/respostas
- `servicos` - Serviços oferecidos pela barbearia
- `servicos_imagens` - Imagens dos serviços
- `produtos` - Produtos da barbearia
- `produtos_precos_custo` - Histórico de preços de custo dos produtos
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

### Scripts SQL

Criei scripts SQL na raiz do projeto para facilitar a configuração:
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
- `COMANDOS_CRIAR_TABELA_CUPONS_FIDELIDADES.sql`
- `COMANDOS_ADICIONAR_PERMISSOES_CUPONS_FIDELIDADES.sql`
- `COMANDOS_CRIAR_TABELA_MODULOS.sql`
- `COMANDOS_ADICIONAR_BALANCO_RELATORIOS.sql`
- `COMANDOS_CRIAR_TABELA_CRM_RELACIONAMENTOS.sql`
- `COMANDOS_ADICIONAR_ASSINATURAS.sql`
- `COMANDOS_CRIAR_TABELA_ASSINATURAS.sql`
- `COMANDOS_ADICIONAR_ASSINATURAS_VENDAS.sql`
- `COMANDOS_ADICIONAR_VALIDADE_ASSINATURAS.sql`
- `COMANDOS_ADICIONAR_PERMISSOES_ASSINATURAS.sql`

---

## 📁 Uploads

### Fotos de Perfil
- **Diretório**: `backend/uploads/fotos/`
- **Endpoint**: `/uploads/fotos/{filename}`
- **Limite**: 5MB por arquivo
- **Formatos**: Imagens (image/*)

### Anexos Help Desk
- **Diretório**: `backend/uploads/help-desk/`
- **Endpoint**: `/uploads/help-desk/{filename}`
- **Limite**: 10MB por arquivo
- **Formatos**: Imagens (image/*) e PDFs (application/pdf)

### Imagens de Serviços
- **Diretório**: `backend/uploads/servicos/`
- **Endpoint**: `/uploads/servicos/{filename}`
- **Limite**: 5MB por arquivo
- **Formatos**: Imagens (image/*)

---

## 🔐 Segurança

Implementei as seguintes medidas de segurança:

- ✅ Senhas hasheadas com bcrypt (10 rounds)
- ✅ CORS configurado para origens específicas
- ✅ Validação de inputs em todos os endpoints
- ✅ Sanitização de dados
- ✅ Sistema de permissões granular (RBAC)
- ✅ Logs de auditoria para ações críticas

**Melhorias futuras que pretendo implementar:**
- [ ] JWT tokens para autenticação
- [ ] Rate limiting
- [ ] Validação mais robusta com biblioteca (Joi/Zod)
- [ ] Middleware de autenticação nas rotas protegidas

---

## 📊 Sistema de Logs

Criei um sistema completo de logs que registra automaticamente todas as ações importantes:

### Middleware Automático
O middleware `apiLogger.js` registra automaticamente:
- Todas as requisições HTTP
- Ações de CRUD (criar, editar, excluir)
- Dados anteriores e novos (JSON)
- IP do cliente e User-Agent

### Logs Manuais
Em endpoints específicos, adiciono logs manuais com mais detalhes:
- Contexto específico da ação
- Dados relacionados
- Status da operação

---

## 🐛 Debugging

### Testar conexão com banco
```bash
curl http://localhost:3001/api/test-db
```

### Verificar saúde da API
```bash
curl http://localhost:3001/health
```

### Verificar logs
```bash
# Logs do PM2
pm2 logs api-protese-capilar --lines 50

# Logs do servidor
tail -f /var/log/nodejs/api-protese-capilar.log
```

---

## 🔄 Deploy

### VPS Hostinger

**Localização do código:**
```
/home/cyberpanel/app/backend
```

**Comandos úteis que uso:**
```bash
# Reiniciar API
pm2 restart api-protese-capilar

# Ver status
pm2 status

# Ver logs
pm2 logs api-protese-capilar

# Parar API
pm2 stop api-protese-capilar

# Iniciar API
pm2 start api-protese-capilar
```

### Atualizar código no servidor

```bash
# No servidor
cd /home/cyberpanel/app/backend
git pull  # se usando git
# ou fazer upload via SCP

# Reiniciar
pm2 restart api-protese-capilar
```

---

## 📝 Próximas Melhorias

Melhorias que pretendo implementar no futuro:

- [ ] Implementar JWT tokens
- [ ] Rate limiting
- [ ] Validação com biblioteca (Joi/Zod)
- [ ] Testes automatizados
- [ ] Documentação Swagger/OpenAPI
- [ ] Cache de queries frequentes
- [ ] Paginação em endpoints de listagem
- [ ] WebSockets para notificações em tempo real

---

## 📚 Documentação Adicional

Para documentação completa do projeto, consulte a pasta `docs/` na raiz do projeto:
- [Histórico de Implementações](../docs/HISTORICO_IMPLEMENTACOES.md)
- [Implementações Dezembro 2025](../docs/IMPLEMENTACOES_DEZEMBRO_2025.md)
- [Status do Projeto](../docs/STATUS_PROJETO.md)

---

**Última atualização**: 19 de Dezembro de 2025  
**Estrutura**: ✅ Modular (implementada em Dezembro 2024, atualizada em Janeiro 2025)  
**Status**: ✅ Em Produção  
**Versão**: 2.0.0  
**VPS**: 82.25.65.201 (Hostinger)  
**Banco de Dados**: PostgreSQL 15+ (protese_capilar, protese_user)
