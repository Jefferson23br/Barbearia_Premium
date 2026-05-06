# Handoff - Barbearia Premium

## Como usar este arquivo
- Atualizar este documento ao final de cada sessao de trabalho.
- Manter apenas o estado atual (evitar historico longo aqui; historico detalhado fica no changelog).
- Se houver bloqueio, registrar causa, impacto e acao de contorno.

## Status Atual
- Fase: Reinicializacao tecnica (base v2 multi-filial em construcao).
- Ambiente alvo:
  - App: `https://appbarber.auctusconsultoria.com.br`
  - API: `https://api6.actusconsultoria.com.br`
- Ultima atualizacao: `2026-05-06`
- Responsavel da ultima atualizacao: `Cursor Agent`

## Escopo da Arquitetura
- Rebranding oficial: **Barbearia Premium**.
- Backend e frontend hospedados na mesma VPS (PM2 + Nginx).
- Multi-filial obrigatorio para usuarios e dados de negocio.
- Cadastro publico por link da filial (slug fixando a filial no cadastro).

## Entregas Concluidas
- Pasta de historico criada em `docs/historico-conversas`.
- Base v2 criada no backend:
  - `backend/sql/001_init_multifilial.sql`
  - `backend/config/databaseV2.js`
  - `backend/middlewares/authV2.js`
  - `backend/middlewares/filialScope.js`
  - `backend/routes/v2/index.js`
  - `backend/routes/v2/auth.js`
  - `backend/routes/v2/filiais.js`
  - `backend/routes/v2/clientes.js`
- `backend/server.js` atualizado para expor `/api/v2`.
- Frontend com branding e dominios antigos substituidos.

## Em Andamento
- Planejamento da expansao de `filial_id` para entidades legadas.

## Proxima Acao (Next)
1. Expandir modelo multi-filial para entidades principais (servicos, agenda, vendas, estoque e financeiro).
2. Aplicar escopo por `filial_id` em queries e regras de permissao.
3. Integrar frontend ao `/api/v2` com contexto de filial.

## Bloqueios
- Logo oficial ainda nao versionada (referencias existem para `/images/logo.webp`, arquivo fisico nao encontrado).

## Riscos e Atencoes
- Mistura de legado v1 e estrutura v2 durante migracao pode gerar comportamento inconsistente.
- Recomenda-se banco limpo para evitar conflitos de schema.

## Checklist de Transferencia
- [ ] Ambiente local sobe com backend v2
- [ ] Script SQL base executado em banco limpo
- [ ] Cadastro publico por slug testado
- [ ] Login v2 retorna token com `filial_id`
- [ ] Escopo por filial validado em listagem de clientes

