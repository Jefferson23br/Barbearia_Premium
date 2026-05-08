# Histórico de Conversas

Esta pasta armazena registros e decisões das conversas do projeto Barbearia Premium para versionamento no GitHub.

## Arquivos principais
- `HANDOFF.md`: estado atual da operacao (fonte principal para retomada rapida).
- `CHANGELOG.md`: historico de mudancas relevantes por categoria.
- `2026-05-06-refatoracao-inicial.md`: marco inicial da refatoracao e contexto de origem.

## Regra de atualizacao
- Ao encerrar cada sessao importante:
  1. atualizar `HANDOFF.md` com status real, bloqueios e proximos passos;
  2. registrar mudancas tecnicas em `CHANGELOG.md`;
  3. manter este `README.md` curto e focado em navegacao;
  4. quando houver migracao de banco/infra, incluir estado de alinhamento `Frontend <> Backend <> Banco`.

## Estrutura SQL atual
- Oracle (base ativa): `database/sql/oracle`
- SQL legado PostgreSQL (referencia historica): `database/sql/legacy-postgresql`

## Passagem de bastao (resumo rapido)
- Fonte principal de retomada: `HANDOFF.md`.
- Historico tecnico detalhado: `CHANGELOG.md`.
- Marco de origem da refatoracao: `2026-05-06-refatoracao-inicial.md`.

