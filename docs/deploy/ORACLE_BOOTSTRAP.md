# Oracle Bootstrap (guia operacional)

Guia para subir a base Oracle da Barbearia Premium com segurança.

## Pré-requisitos

- Banco Oracle acessível.
- Usuário Oracle com permissão de `CREATE TABLE`, `CREATE INDEX` e `MERGE`.
- `.env` do backend preenchido:

```env
ORACLE_HOST=seu_host
ORACLE_PORT=1521
ORACLE_SERVICE_NAME=seu_service_name
ORACLE_USER=seu_usuario
ORACLE_PASSWORD=sua_senha
```

## Opção A (recomendada): bootstrap automático

No diretório `backend`:

```bash
npm install
npm run db:oracle:bootstrap
```

Esse fluxo usa `backend/scripts/bootstrap-oracle.js` e cria:

- `filiais`
- `usuarios`
- `clientes`
- `servicos`
- `agendamentos`
- `vendas`
- `storage_arquivos`
- índices principais
- seed da filial `matriz`

## Opção B: execução manual por scripts SQL

Executar na ordem:

1. `database/sql/oracle/001_init_multifilial.sql`
2. `database/sql/oracle/002_base_operacao_storage.sql`

## Validação pós-bootstrap

```sql
SELECT table_name
FROM user_tables
WHERE table_name IN (
  'FILIAIS','USUARIOS','CLIENTES','SERVICOS','AGENDAMENTOS','VENDAS','STORAGE_ARQUIVOS'
)
ORDER BY table_name;
```

```sql
SELECT index_name, table_name
FROM user_indexes
WHERE table_name IN (
  'USUARIOS','CLIENTES','SERVICOS','AGENDAMENTOS','VENDAS','STORAGE_ARQUIVOS'
)
ORDER BY table_name, index_name;
```

```sql
SELECT id, nome, slug, ativo
FROM filiais
WHERE slug = 'matriz';
```

## Smoke test da API

Com backend em execução:

```bash
curl http://localhost:3001/health
curl http://localhost:3001/api/test-db
```

Esperado:

- `/health` retorna `status: ok`
- `/api/test-db` retorna `database: connected`
