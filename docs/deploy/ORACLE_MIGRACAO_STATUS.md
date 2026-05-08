# Oracle - Status de Migracao

## O que ja foi ajustado

- Estrutura de VPS padronizada em `/Projetos/Barbearia_Premium`.
- Guia de go-live atualizado para Oracle remoto.
- Variaveis Oracle adicionadas em `backend/.env.example`.

## Bloqueador tecnico atual

O backend ainda depende de PostgreSQL:
- Driver `pg` em `backend/config/database.js` e `backend/config/databaseV2.js`.
- Queries SQL em estilo PostgreSQL espalhadas nas rotas.

Sem migrar camada de dados, a API nao conecta nem executa no Oracle.

## Proximo passo obrigatorio

1. Adicionar driver Oracle (`oracledb`) no backend.
2. Criar novo client de conexao Oracle em `backend/config/databaseOracle.js`.
3. Adaptar queries (placeholders, tipos e funcoes SQL).
4. Criar scripts SQL Oracle equivalentes aos `backend/sql/*.sql`.
5. Executar testes de `/health` e `/api/test-db` com Oracle.
