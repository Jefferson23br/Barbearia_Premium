# 2026-05-06 - Refatoração Inicial

## Decisões iniciais
- Rebranding para Barbearia Premium.
- Nova API: https://api6.actusconsultoria.com.br.
- Novo app: https://appbarber.auctusconsultoria.com.br.
- Frontend e backend hospedados juntos na VPS (PM2 + Nginx).
- Sistema multi-filial como base do produto.

## Ações executadas
- Criada pasta docs/historico-conversas.
- Iniciada substituição de branding e domínios no frontend.


## Etapa 1 concluída (base técnica)
- Criado backend/package.json com dependências da API.
- Criado backend/.env.example.
- Criado script SQL inicial multi-filial: backend/sql/001_init_multifilial.sql.
- Criadas rotas novas em /api/v2 (auth, filiais, clientes).
- Implementado cadastro de cliente por link da filial (slug).
- Implementado escopo por filial via JWT (filial_id).

