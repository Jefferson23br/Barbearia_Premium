# REGRA UNIVERSAL — economia de tokens (Handoff)

Vale para o produto em `docs/Handoff/` (Barbearia Premium) e qualquer subpasta futura.

## Padrão de conversa (obrigatório)

Você (usuário) aponta o handoff (`@docs/Handoff`). A IA deve:

| Fazer | Não fazer |
|---|---|
| Focar **só** Barbearia Premium nesta pasta | Abrir outro projeto / outros apps da VPS / outro handoff |
| Usar só o **último dia** (`AAAA-MM-DD/` mais recente) | Reler pastas de dias antigos |
| Ler README (+ temático/PROMPT do **mesmo** dia se precisar) | Varrer o índice de dias |
| Editar código só dos paths desse dia / do pedido | “Se situar” lendo toda a `docs/` antiga |

**Dias anteriores ou outro projeto:** somente se você pedir de forma explícita.

## Objetivo

Impedir que a IA releia a demanda inteira, documentação longa ou handoffs antigos a cada chat.

## O que a IA deve fazer

1. Identificar o produto pela pasta `@` / path do usuário.
2. Abrir **só** `docs/Handoff/<último-dia>/`.
3. No máximo: `README.md` do dia; se precisar, `PROMPT_COPIAR_COLAR.md`, `.md` temático e checklist **do mesmo dia**.
4. Código: paths listados nesse dia ou mencionados pelo usuário.
5. Credenciais / VPS: usar `INFRA_VPS_ORACLE.md` do **mesmo dia** (ou o mais recente, se o usuário pedir acesso).

## O que a IA NÃO deve fazer

- Abrir `2026-…` antigos “por contexto”.
- Misturar Barbearia com Fluig / outros repos na mesma tarefa.
- Reler `docs/STATUS_PROJETO.md`, histórico completo etc. no início do chat.
- Explorar o workspace inteiro sem pedido.

## Modelo de PROMPT_COPIAR_COLAR (obrigatório em handoffs novos)

```markdown
# Prompt para colar na IA

Copie tudo abaixo da linha.

---

**REGRA UNIVERSAL:** foque só neste produto e neste dia. Não abrir handoffs antigos nem outra pasta de docs/, a menos que eu peça.

1. Só esta pasta: `docs/Handoff/AAAA-MM-DD/`
2. Comece por: `README.md` (detalhe do dia só se precisar)
3. Código (somente se a tarefa tocar): (listar 3–8 paths)

**Projeto / Ambiente:** (curto)
**Estado do dia:** (bullet)
**Modo:** só o que eu pedir. Não inventar features.

Responda em português.
```

## README do produto

No README raiz, manter bloco **REGRA UNIVERSAL / padrão de conversa** apontando para este arquivo: **só o último dia; antigos só se o usuário pedir**.
