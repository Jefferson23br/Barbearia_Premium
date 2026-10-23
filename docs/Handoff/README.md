# Handoff — Barbearia Premium

Pasta de continuidade do **Sistema Barbearia Premium** (API + painéis + Oracle).

Padrão: **uma pasta por dia** (`AAAA-MM-DD`). Não editar handoff de dias anteriores (exceto correção factual pontual). O estado atual e os próximos passos ficam no **dia mais recente**.

Workspace: `C:\Users\jefferson.lima\Documents\Barbearia_Premium`  
Repo: `https://github.com/Jefferson23br/Barbearia_Premium`  
Stack: Next.js 14 · Express · Oracle (prod) · PM2 · Nginx  

### REGRA UNIVERSAL — padrão de conversa

Continuidade **só** desta pasta de produto. A IA deve:

1. Usar **apenas** o **último dia** (`2026-10-23/` no momento).
2. **Não** abrir dias anteriores nem outra pasta longa em `docs/`, a menos que você peça.
3. **Não** reler histórico completo / STATUS antigo por rotina.

Detalhe e modelo de prompt: [`./REGRA-UNIVERSAL-ECONOMIA-TOKENS.md`](./REGRA-UNIVERSAL-ECONOMIA-TOKENS.md).

**Modo:** só o que o usuário pedir. Não inventar features.

**23/10:** Análise + VPS `72.60.61.215` · Oracle UP · DBeaver · **`CENARIO_ATUAL.md`** (só Barbearia).

---

## Como usar

1. Apontar `@docs/Handoff` (ou a pasta do dia).
2. A IA abre **só** o **último dia** — não o índice, não dias antigos.
3. Outra IA / outro PC: colar `PROMPT_COPIAR_COLAR.md` do último dia.
4. Infra / Oracle / DBeaver: `INFRA_VPS_ORACLE.md` do mesmo dia.
5. Manutenção / smoke: `CHECKLIST_MANUTENCAO.md` do último dia.
6. Mesmo dia: atualizar arquivos dessa pasta.
7. Novo dia: criar `AAAA-MM-DD/` — modelo em [`./REGRA-UNIVERSAL-ECONOMIA-TOKENS.md`](./REGRA-UNIVERSAL-ECONOMIA-TOKENS.md).

O índice abaixo é só navegação humana. A IA **não** deve percorrê-lo.

---

## Índice de dias

| Pasta | Data | Resumo |
|---|---|---|
| [`2026-10-23`](./2026-10-23/README.md) | 23/10/2026 | **Atual:** cenário completo + Oracle UP + DBeaver + handoff. |

**Último handoff (leia primeiro):** [`2026-10-23/README.md`](./2026-10-23/README.md)

---

## Convenção de nomes

```
docs/Handoff/
├── README.md
├── REGRA-UNIVERSAL-ECONOMIA-TOKENS.md
└── 2026-10-23/          ← atual
    ├── README.md
    ├── CENARIO_ATUAL.md      ← status só deste projeto
    ├── PROMPT_COPIAR_COLAR.md
    ├── CHECKLIST_MANUTENCAO.md
    └── INFRA_VPS_ORACLE.md
```
