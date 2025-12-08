# 📁 Estrutura Modular do Backend

## 🎯 Objetivo

Reorganizar o backend de um arquivo monolítico (`server.js`) para uma estrutura modular organizada por funcionalidades.

## 📂 Estrutura de Pastas

```
backend/
├── server.js                    # Arquivo central que inicializa tudo
├── config/                      # Configurações
│   ├── database.js             # Configuração do PostgreSQL
│   ├── multer.js               # Configuração de upload de arquivos
│   └── cors.js                 # Configuração de CORS
├── middlewares/                 # Middlewares
│   └── apiLogger.js            # Middleware de logging automático
├── utils/                       # Utilitários
│   └── logger.js               # Sistema de logs
├── routes/                      # Rotas organizadas por módulo
│   ├── index.js                # Agrupa todas as rotas
│   ├── clientes.js             # Rotas de clientes ✅
│   ├── funcionarios.js         # Rotas de funcionários (TODO)
│   ├── permissoes.js           # Rotas de permissões (TODO)
│   ├── help-desk.js            # Rotas do Help Desk (TODO)
│   ├── logs.js                 # Rotas de logs (TODO)
│   ├── auth.js                 # Rotas de autenticação (TODO)
│   └── controle-acessos.js     # Rotas de controle de acessos (TODO)
└── uploads/                     # Arquivos enviados
    ├── fotos/                   # Fotos de perfil
    └── help-desk/              # Anexos do Help Desk
```

## ✅ Status da Migração

- [x] Estrutura de pastas criada
- [x] Arquivos de configuração criados
- [x] Módulo de clientes criado
- [x] Módulo de funcionários criado
- [x] Módulo de permissões criado
- [x] Módulo de Help Desk criado
- [x] Módulo de logs criado
- [x] Módulo de autenticação criado
- [x] Módulo de controle de acessos criado
- [x] Server.js central atualizado
- [x] Routes/index.js atualizado
- [x] Guia de migração VPS criado

## ✅ Migração Completa!

Todos os módulos foram criados e estão prontos para uso.

## 📝 Próximos Passos na VPS

1. Seguir o guia `GUIA_MIGRACAO_VPS.md` para migração na VPS
2. Fazer backup do `server.js` atual
3. Copiar todos os arquivos para a VPS
4. Verificar sintaxe dos arquivos
5. Reiniciar PM2
6. Testar todos os endpoints
7. Monitorar logs por algumas horas

## 🔄 Como Migrar

Para cada módulo:
1. Identificar todas as rotas do módulo no `server.js` antigo
2. Criar arquivo `routes/[modulo].js`
3. Mover as rotas para o novo arquivo
4. Importar dependências necessárias (pool, upload, logger, etc.)
5. Exportar o router
6. Registrar no `routes/index.js`
7. Testar

## 📌 Notas

- O `server.js` antigo deve ser mantido como backup até que tudo esteja funcionando
- Todos os módulos devem seguir o mesmo padrão do módulo de clientes
- As configurações (database, multer, cors) são compartilhadas entre todos os módulos

