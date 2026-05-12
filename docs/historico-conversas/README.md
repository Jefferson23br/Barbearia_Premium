# Histórico de conversas

Esta pasta guarda decisões, marcos e estado operacional do **Barbearia Premium** para versionamento no Git.

## Arquivos principais

| Arquivo | Conteúdo |
|---------|----------|
| `HANDOFF.md` | Estado operacional completo — **prioridade para retomar o trabalho** |
| `HANDOFF_EXECUTIVO.md` | Resumo executivo (riscos, próximos passos, links) |
| `CHANGELOG.md` | Mudanças técnicas por data (estilo Keep a Changelog) |
| `2026-05-06-refatoracao-inicial.md` | Marco inicial da refatoração e decisões de origem |

## Documentação relacionada (fora desta pasta)

- Deploy e atualização de produção: `docs/deploy/GUIA_ATUALIZACAO_DEPLOY.md`
- Bootstrap Oracle: `docs/deploy/ORACLE_BOOTSTRAP.md`
- Infra e URLs: `docs/INFRAESTRUTURA.md`

## Regra de atualização

Ao encerrar uma sessão relevante:

1. Atualizar **`HANDOFF.md`** com status real, bloqueios e próximos passos (data no topo).
2. Registrar mudanças técnicas em **`CHANGELOG.md`** (secção `[Unreleased]` ou nova data).
3. Ajustar **`HANDOFF_EXECUTIVO.md`** se mudarem risco, domínios ou passos críticos.
4. Manter este **`README.md`** só como índice (sem duplicar listas longas).
5. Em mudanças de banco ou infra: registrar alinhamento **Frontend ? Backend ? Oracle** e variáveis `ORACLE_*` / smoke tests.

## Estrutura SQL no repositório

- **Oracle (base ativa):** `database/sql/oracle`
- **Legado PostgreSQL (referência):** `database/sql/legacy-postgresql`

## Passagem de bastão (rápido)

1. Ler **`HANDOFF.md`** (checklist e bloqueios).
2. Conferir **`CHANGELOG.md`** pela última data lançada.
3. Para deploy: **`docs/deploy/GUIA_ATUALIZACAO_DEPLOY.md`**.
