# Prompt para colar na IA (manutenção / outro PC)

Copie **tudo** abaixo da linha e cole como primeira mensagem.

---

**REGRA UNIVERSAL:** foque **só** neste produto e neste dia. Não abrir handoffs de dias anteriores, nem varrer `docs/` antiga, a menos que eu peça.

Pasta única: `docs/Handoff/2026-10-23/`

1. Comece por: `README.md`
2. Panorama no ar/parado: `CENARIO_ATUAL.md`
3. Se precisar de acesso VPS / Oracle / DBeaver: `INFRA_VPS_ORACLE.md`
4. Se for manutenção/smoke: `CHECKLIST_MANUTENCAO.md`
5. Código (só se a tarefa tocar):
   - `backend/` (API Express · `server.js` · `config/databaseV2.js` · `routes/`)
   - `frontend/painel-admin/`
   - VPS: `/Projetos/Barbearia_Premium/backend`

**Projeto:** Sistema Barbearia Premium v2.0 (multi-filial).

**Ambiente produção (esta VPS):**
- Host `72.60.61.215` · SSH `root`
- API `https://api6.auctusconsultoria.com.br` → PM2 `api-barbearia-premium` porta `3016`
- Admin `https://appbarber.auctusconsultoria.com.br/admin/`
- Oracle Docker `oracle-db` · service `XEPDB1` · user `Barbearia_Premium` · porta `1521`

## Estado 23/10

- Ver `CENARIO_ATUAL.md` (só Barbearia Premium).
- Docs “2 VPS” desatualizados; API+admin+Oracle em `72.60.61.215`.
- Oracle estava parado ~7 dias → **UP**; `/api/test-db` OK.
- Porta 1521 liberada; DBeaver em `INFRA_VPS_ORACLE.md`.
- Risco: RAM ~3,8 GiB no host — Oracle pode cair de novo por swap.

**Modo:** só o que eu pedir. Não inventar features. Handoff = **somente** Barbearia Premium.

Responda em **português**.
