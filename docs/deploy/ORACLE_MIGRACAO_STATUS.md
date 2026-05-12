# Oracle — status da migração

## Estado atual (2026)

- **`backend/config/database.js`** reexporta **`databaseV2.js`**.
- Com **`ORACLE_HOST`**, **`ORACLE_USER`** e **`ORACLE_PASSWORD`** definidos, o backend usa o driver **`oracledb`** e adaptações de SQL em `databaseV2.js`.
- Sem `ORACLE_*`, o mesmo arquivo usa **`pg`** (PostgreSQL) para desenvolvimento local — não é o alvo de produção documentado para a Barbearia Premium em produção.

## Scripts e bootstrap

- Scripts Oracle oficiais: `database/sql/oracle/`
- Bootstrap: `npm run db:oracle:bootstrap` no diretório `backend/` — ver [ORACLE_BOOTSTRAP.md](./ORACLE_BOOTSTRAP.md).

## Referências

- Handoff operacional: [../historico-conversas/HANDOFF.md](../historico-conversas/HANDOFF.md)
- Guia de atualização: [GUIA_ATUALIZACAO_DEPLOY.md](./GUIA_ATUALIZACAO_DEPLOY.md)

---

*Documento anterior listava bloqueadores da migração; esses itens foram endereçados na base de código atual — este ficheiro foi alinhado ao comportamento real do repositório.*
