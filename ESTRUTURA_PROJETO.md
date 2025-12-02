# 📋 Estrutura do Projeto - Sistema Prótese Capilar

## 🎯 Visão Geral

Sistema completo de gestão para clínica de prótese capilar, desenvolvido com:

- **Front-end**: Next.js 14 + React + TypeScript
- **Back-end**: Node.js + Express/Fastify
- **Banco de Dados**: PostgreSQL
- **Hospedagem**: VPS Hostinger (KVM 2, AlmaLinux 9)

---

## 📁 Estrutura de Pastas Proposta

```
Barbearia_Premium/
├── frontend/                          # Painel do Cliente (Next.js)
│   └── Painel-de-Cliente-Barberia/   # Já criado
│
├── backend/                           # API Node.js
│   ├── src/
│   │   ├── controllers/              # Controllers
│   │   ├── models/                   # Models do banco
│   │   ├── routes/                   # Rotas da API
│   │   ├── middleware/               # Middlewares
│   │   ├── services/                 # Lógica de negócio
│   │   ├── config/                   # Configurações
│   │   ├── utils/                    # Utilitários
│   │   └── server.ts                 # Arquivo principal
│   ├── tests/                        # Testes
│   └── package.json
│
├── database/                          # Scripts SQL
│   ├── migrations/                   # Migrações
│   ├── seeds/                        # Dados iniciais
│   └── schema.sql                    # Schema inicial
│
└── docs/                              # Documentação
    ├── api/                          # Documentação da API
    ├── database/                     # Documentação do BD
    └── deploy/                       # Guias de deploy
```

---

## 🚀 Próximos Passos

1. Criar estrutura do backend
2. Configurar conexão com PostgreSQL
3. Criar rotas de autenticação
4. Integrar frontend com backend
5. Preparar deploy na VPS

---

## 📝 Aguardando especificações do arquivo docx...

---

*Estrutura a ser atualizada conforme as ideias do documento*





