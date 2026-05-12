# 📂 Estrutura de Arquivos do Projeto

Documentação sobre os arquivos do projeto, quais são necessários e quais podem ser removidos.

---

## 📁 Estrutura de Diretórios

```
Barbearia_Premium/
│
├── backend/                        # ⚙️ API Backend (Estrutura Modular)
│   ├── config/                     # ✅ Configurações compartilhadas
│   │   ├── database.js            # ✅ Reexport databaseV2 (Oracle / PostgreSQL)
│   │   ├── cors.js                # ✅ Configuração CORS
│   │   └── multer.js              # ✅ Configuração upload
│   ├── routes/                     # ✅ Rotas modulares
│   │   ├── index.js               # ✅ Agrupa todas as rotas
│   │   ├── clientes.js            # ✅ CRUD de clientes
│   │   ├── funcionarios.js        # ✅ CRUD de funcionários
│   │   ├── auth.js                # ✅ Autenticação
│   │   ├── permissoes.js         # ✅ Permissões
│   │   ├── controle-acessos.js   # ✅ Controle de acessos
│   │   ├── logs.js                # ✅ Sistema de logs
│   │   └── help-desk.js           # ✅ Help Desk
│   ├── middlewares/                # ✅ Middlewares customizados
│   │   └── apiLogger.js           # ✅ Middleware de logs automático
│   ├── utils/                      # ✅ Utilitários
│   │   ├── logger.js              # ✅ Helper de logs
│   │   └── logHelper.js           # ⚠️ Helper opcional (não usado atualmente)
│   ├── server.js                  # ✅ Servidor Express central
│   └── README.md                  # ✅ Documentação do backend
│
├── frontend/                       # 🎨 Projetos Frontend
│   ├── painel-admin/              # ✅ Painel Administrativo
│   ├── painel-cliente/            # ✅ Painel do Cliente
│   ├── site-entrada/              # ✅ Site Público
│   └── README.md                  # ✅ Documentação do frontend
│
├── docs/                           # 📚 Documentação
│   ├── deploy/                    # ✅ Documentação de deploy
│   │   └── COMANDOS_ESSENCIAIS.md # ⚠️ NÃO ALTERAR (usado muito)
│   ├── SISTEMA_LOGS.md            # ✅ Documentação consolidada de logs
│   ├── HISTORICO_IMPLEMENTACOES.md # ✅ Histórico completo
│   ├── ESTRUTURA_PROJETO.md       # ✅ Arquitetura e estrutura do projeto
│   └── ARQUIVOS_PROJETO.md        # ✅ Este arquivo
│
├── scripts/                        # 🔧 Scripts de configuração
│   ├── configurar-postgres.sh     # ✅ Setup PostgreSQL (legado / dev opcional)
│   ├── setup-vps.sh               # ✅ Setup completo VPS
│   └── templates-nginx/           # ✅ Templates Nginx
│
├── .gitignore                     # ✅ Configuração Git
├── README.md                      # ✅ README principal
│
└── [Scripts SQL na raiz]          # ✅ Scripts SQL de criação/correção
```

---

## ✅ Arquivos Necessários (Manter)

### Backend
- `backend/server.js` - ✅ Servidor Express central (modularizado)
- `backend/config/` - ✅ Configurações (database, cors, multer)
- `backend/routes/` - ✅ Rotas modulares por funcionalidade
- `backend/utils/logger.js` - ✅ Sistema de logs
- `backend/middlewares/apiLogger.js` - ✅ Middleware de logs automático
- `backend/README.md` - ✅ Documentação

### Frontend
- Todos os arquivos em `frontend/painel-admin/src/` - ✅ Código fonte
- Todos os arquivos em `frontend/painel-cliente/src/` - ✅ Código fonte
- Todos os arquivos em `frontend/site-entrada/src/` - ✅ Código fonte
- `frontend/*/package.json` - ✅ Dependências
- `frontend/*/next.config.js` - ✅ Configuração Next.js
- `frontend/*/tailwind.config.ts` - ✅ Configuração Tailwind
- `frontend/*/public/images/logo.webp` - ✅ Logo do projeto

### Documentação Essencial
- `README.md` - ✅ Visão geral do projeto
- `docs/deploy/COMANDOS_ESSENCIAIS.md` - ⚠️ **NÃO ALTERAR** (usado muito)
- `docs/deploy/README.md` - ✅ Visão geral deploy
- `docs/SISTEMA_LOGS.md` - ✅ Documentação de logs
- `docs/HISTORICO_IMPLEMENTACOES.md` - ✅ Histórico completo
- `docs/ESTRUTURA_PROJETO.md` - ✅ Arquitetura e estrutura do projeto
- `docs/ARQUIVOS_PROJETO.md` - ✅ Este arquivo

### Scripts SQL Essenciais
- `COMANDOS_CRIAR_TABELA_PERMISSOES_SIMPLES.sql` - ✅ Criar permissões
- `COMANDOS_CRIAR_TABELA_CONTROLE_ACESSOS.sql` - ✅ Criar controle acessos
- `COMANDOS_ADICIONAR_FUNCIONARIO_RESPONSAVEL.sql` - ✅ Adicionar campo
- `COMANDOS_CRIAR_TABELA_LOGS_SISTEMA.sql` - ✅ Criar logs
- `CORRIGIR_TABELA_LOGS_SISTEMA.sql` - ✅ Correções de logs
- `ATUALIZAR_CHECK_CONSTRAINT_LOGS.sql` - ✅ Atualizar constraint
- `COMANDOS_CRIAR_TABELAS_HELP_DESK.sql` - ✅ Criar tabelas Help Desk

### Scripts de Configuração
- `scripts/setup-vps.sh` - ✅ Setup VPS
- `scripts/configurar-postgres.sh` - ✅ Setup PostgreSQL (legado / dev opcional)
- `scripts/templates-nginx/*` - ✅ Templates Nginx

---

## ✅ Arquivos Removidos (Limpeza Realizada - Dezembro 2024/2025)

### Limpeza Inicial (Anterior)
Arquivos de troubleshooting e guias consolidados foram removidos anteriormente.

### Limpeza Atual (12 de Dezembro de 2025)
Arquivos removidos na organização atual:

- ✅ `backend/check-table-structure.js` - Removido (script temporário de verificação)
- ✅ `backend/RESUMO_MIGRACAO.md` - Removido (migração já concluída)
- ✅ `backend/ESTRUTURA_MODULAR.md` - Removido (migração já concluída)
- ✅ `backend/GUIA_MIGRACAO_VPS.md` - Removido (migração já concluída)

## ✅ Arquivos Removidos Anteriormente

### Documentação de Troubleshooting (Removidos)
Estes arquivos foram removidos pois documentavam problemas já resolvidos:

- ✅ `ATUALIZAR_LOGGER_VPS.md` - Removido
- ✅ `COPIAR_LOGGER_PARA_VPS.md` - Removido
- ✅ `CORRIGIR_MASTER_PARA_ADMINISTRATIVO.md` - Removido
- ✅ `CORRIGIR_PORTA_3001_RAPIDO.md` - Removido
- ✅ `CORRIGIR_SERVER_JS_VPS.md` - Removido
- ✅ `DIAGNOSTICAR_LOGS_NAO_SALVANDO.md` - Removido
- ✅ `FORCAR_RECARREGAR_PM2.md` - Removido
- ✅ `RECUPERAR_API_RAPIDO.md` - Removido
- ✅ `TESTAR_API_FUNCIONANDO.md` - Removido
- ✅ `VERIFICAR_ERRO_PM2.md` - Removido
- ✅ `VERIFICAR_LOGGER_VPS_COM_DEBUG.md` - Removido
- ✅ `SOLUCAO_FINAL_LOGGER.md` - Removido
- ✅ `SOLUCAO_RAPIDA_PM2.txt` - Removido

### Guias de Integração (Removidos - Consolidados)
Estes foram removidos pois foram consolidados:

- ✅ `GUIA_INTEGRACAO_LOGS_COMPLETO.md` - Removido (consolidado em `docs/SISTEMA_LOGS.md`)
- ✅ `INTEGRAR_LOGS_ENDPOINTS.md` - Removido (consolidado)
- ✅ `EXEMPLOS_ENDPOINTS_COM_LOGS.md` - Removido (consolidado)

### Resumos (Removidos - Consolidados)
Estes foram removidos pois foram consolidados:

- ✅ `SISTEMA_LOGS_RESUMO.md` - Removido (consolidado em `docs/SISTEMA_LOGS.md`)
- ✅ `README_LOGS_SISTEMA.md` - Removido (consolidado)

### Scripts Temporários (Removidos)
- ✅ `COPIAR_LOGGER_ATUALIZADO_VPS.sh` - Removido
- ✅ `VERIFICAR_LOGGER_VPS.sh` - Removido
- ✅ `recarregar-api.sh` - Removido
- ✅ `ENDPOINTS_LOGS_BACKEND.js` - Removido

**Nota**: Os arquivos de troubleshooting em `docs/deploy/` foram mantidos pois são documentação de deploy e podem ser úteis para referência futura.

---

## 📝 Recomendações

### Estrutura Sugerida (Futuro)

```
docs/
├── deploy/              # ✅ Documentação de deploy
├── sistema-logs/        # 📊 Documentação de logs (novo)
│   ├── README.md
│   ├── middleware.md
│   └── integracao.md
├── troubleshooting/     # 🐛 Troubleshooting (novo)
│   └── [arquivos resolvidos]
├── desenvolvimento/     # 💻 Guias de desenvolvimento (novo)
│   └── [guias de integração]
└── database/            # 🗄️ Scripts SQL (novo)
    └── [scripts SQL]
```

### Arquivos a Manter na Raiz

**Essenciais:**
- `README.md` - Documentação principal do projeto
- `.gitignore` - Configuração do Git

**Arquivos .txt (NÃO APAGAR):**
- `NÃO APAGAR - MENSAGEM.txt` - Informações importantes
- `NÃO APAGAR IMPORTANTE .txt` - Informações importantes
- `NÃO EXCLUIR - CAMPO DE FUTURAS APIS.txt` - Informações importantes

**Scripts SQL:**
- Scripts de criação e correção de tabelas (fácil acesso na raiz)
- Todos os arquivos `COMANDOS_*.sql` e `DDL_*.sql`

---

## ✅ Status da Limpeza (12 de Dezembro de 2025)

**Limpeza Realizada:**
- ✅ Scripts temporários removidos (`backend/check-table-structure.js`)
- ✅ Documentação de migração removida (migração já concluída):
  - `backend/RESUMO_MIGRACAO.md`
  - `backend/ESTRUTURA_MODULAR.md`
  - `backend/GUIA_MIGRACAO_VPS.md`
- ✅ Arquivos desnecessários removidos
- ✅ Documentação atualizada com informações corretas

**Arquivos Mantidos:**
- ✅ Todos os scripts SQL (importantes para referência)
- ✅ Todos os arquivos .txt marcados como "NÃO APAGAR"
- ✅ Documentação completa em `docs/`
- ✅ Scripts de deploy e configuração em `scripts/`

---

**Última atualização**: 16 de Dezembro de 2025

