# Oracle Bootstrap (automatico)

Este fluxo cria as tabelas base da Barbearia Premium no Oracle de forma idempotente.

## Tabelas criadas

- `filiais`
- `usuarios`
- `clientes`
- `servicos`
- `agendamentos`
- `vendas`
- `storage_arquivos`

Tambem cria indices principais e seed da filial `matriz`.

## 1) Configurar `.env` no backend

```env
ORACLE_HOST=72.60.61.215
ORACLE_PORT=1521
ORACLE_SERVICE_NAME=XEPDB1
ORACLE_USER=Barbearia_Premium
ORACLE_PASSWORD=sua_senha
```

## 2) Instalar dependencia Oracle

No backend:

```bash
npm install
```

> O script usa o pacote `oracledb`.

## 3) Rodar criacao automatica

```bash
npm run db:oracle:bootstrap
```

## 4) Validar no Oracle

Exemplos de checagem:

```sql
SELECT table_name FROM user_tables
WHERE table_name IN (
  'FILIAIS','USUARIOS','CLIENTES','SERVICOS','AGENDAMENTOS','VENDAS','STORAGE_ARQUIVOS'
);
```

## Observacao importante

Isso cria a base estrutural inicial. O backend atual ainda possui muitas rotas com SQL de PostgreSQL.
A migracao completa das rotas para Oracle deve ser feita por etapas.
