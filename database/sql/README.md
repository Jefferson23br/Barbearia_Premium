# Organizacao de Scripts SQL

Esta pasta centraliza os scripts SQL do projeto e separa claramente o que e base atual do que e legado.

## Estrutura

- `oracle/`: scripts da base atual em Oracle (migração e suporte operacional).
- `legacy-postgresql/`: scripts historicos do projeto antigo em PostgreSQL, mantidos para referencia, auditoria e migracao gradual.

## Regras

- Novos scripts da base Oracle devem entrar em `oracle/`.
- Scripts antigos da fase PostgreSQL nao devem ser removidos sem registro no changelog.
- Quando um script legado for convertido para Oracle, registrar no `docs/historico-conversas/CHANGELOG.md`.
