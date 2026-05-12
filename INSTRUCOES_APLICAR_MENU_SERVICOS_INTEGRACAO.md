# Instruções para Aplicar Menu de Serviços de Integração

> **Produção:** aplicar os scripts no **Oracle**. Texto abaixo menciona PostgreSQL como período legado.

## Problema
No menu, apenas o DocSales aparece, mas deveriam aparecer todas as integrações:
- Focus NFe
- PLUG NFe
- Asaas
- Mercado Pago
- PagSeguro
- Twilio
- WhatsApp
- SendGrid
- DocSales
- Clicksign

## Solução

### 1. Executar Script SQL no Banco de Dados

Execute o script `COMANDOS_CRIAR_MODULO_SERVICOS_INTEGRACAO.sql` no **Oracle** (SQLcl/DBeaver), adaptando o DDL se o arquivo for dialeto PostgreSQL legado.

Este script irá:
- Criar o módulo "Serviços de Integração" (se não existir)
- Criar todos os 10 itens de menu para cada integração
- Remover o item "Serviços de Integração" do módulo "Integrações" (se existir)

### 2. Executar Script de Permissões (Opcional)

Execute também o script `COMANDOS_ADICIONAR_PERMISSOES_SERVICOS_INTEGRACAO_INDIVIDUAIS.sql` para adicionar permissões individuais para cada serviço.

### 3. Verificar no Sistema

Após executar os scripts:
1. Recarregue a página do painel administrativo
2. Verifique se o módulo "Serviços de Integração" aparece no menu
3. Expanda o módulo e verifique se todos os 10 itens aparecem

### 4. Configurar Permissões

No módulo "Controle de Permissões", você poderá configurar permissões individuais para cada serviço:
- `servico_focus_nfe_ver`
- `servico_plug_nfe_ver`
- `servico_asaas_ver`
- `servico_mercado_pago_ver`
- `servico_pagseguro_ver`
- `servico_twilio_ver`
- `servico_whatsapp_ver`
- `servico_sendgrid_ver`
- `servico_docsales_ver`
- `servico_clicksign_ver`

## Estrutura Final Esperada

```
📦 Integrações
  ├── 🔌 Integração de APIs
  └── 🔑 Habilitar API

📦 Serviços de Integração
  ├── 📄 Focus NFe
  ├── 🔌 PLUG NFe
  ├── 💳 Asaas
  ├── 🛒 Mercado Pago
  ├── 🏦 PagSeguro
  ├── 📱 Twilio
  ├── 💬 WhatsApp
  ├── 📧 SendGrid
  ├── 📝 DocSales
  └── ✍️ Clicksign
```

## Nota Importante

O código do frontend já está ajustado para:
- Mostrar todos os itens do módulo "Serviços de Integração" se o usuário tiver permissão
- Não filtrar por integração configurada (mostra todos, independente de estarem configurados)
- Verificar permissões individuais para cada serviço

Apenas é necessário executar o script SQL para criar os itens no banco de dados.

