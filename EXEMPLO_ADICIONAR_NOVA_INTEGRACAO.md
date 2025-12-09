# 📚 Como Adicionar Novas Integrações

## ✅ Estrutura Escalável

A estrutura criada permite adicionar **quantas integrações você quiser** sem precisar modificar o banco de dados ou criar novas tabelas!

---

## 🔄 Como Funciona

### 1. **Tabela `integracoes`**
Armazena **qualquer tipo de integração**:
- Focus NFe (Nota Fiscal)
- PagSeguro (Pagamentos)
- Mercado Pago (Pagamentos)
- Twilio (SMS)
- Zenvia (WhatsApp)
- SendGrid (Email)
- Google Calendar (Agendamento)
- E qualquer outra que você precisar!

### 2. **Tabela `integracoes_habilitadas`**
Controla as **funcionalidades** de cada integração:
- Cada integração pode ter múltiplas funcionalidades
- Exemplo: Focus NFe pode ter "emissao_nfe", "emissao_nfce", "emissao_cte"

---

## 📝 Exemplo: Adicionar Integração de Pagamento (PagSeguro)

### Passo 1: Criar a Integração via API

```javascript
POST /api/v1/integracoes
{
  "tipo_integracao": "pagseguro",
  "nome": "PagSeguro",
  "ativo": false,
  "ambiente": "homologacao",
  "token_producao": "seu_token_producao",
  "token_homologacao": "seu_token_homologacao",
  "cnpj": "00.000.000/0000-00",
  "configuracao_json": {
    "email": "seu_email@pagseguro.com",
    "public_key": "sua_chave_publica"
  }
}
```

### Passo 2: Adicionar Funcionalidades

```javascript
PUT /api/v1/integracoes/pagseguro/funcionalidade/pagamento_cartao
{
  "habilitado": true
}

PUT /api/v1/integracoes/pagseguro/funcionalidade/pagamento_boleto
{
  "habilitado": true
}

PUT /api/v1/integracoes/pagseguro/funcionalidade/pagamento_pix
{
  "habilitado": true
}
```

### Passo 3: Atualizar Frontend (Opcional)

Você pode adicionar uma nova seção na página `integracoes-apis/page.tsx`:

```typescript
// Adicionar no estado
const [pagseguro, setPagseguro] = useState<Integracao | null>(null)

// Carregar junto com Focus NFe
const pagseguroData = integracoes.find((i) => i.tipo_integracao === 'pagseguro')
if (pagseguroData) {
  setPagseguro(pagseguroData)
}
```

---

## 🎯 Exemplo: Adicionar Integração de SMS (Twilio)

```javascript
POST /api/v1/integracoes
{
  "tipo_integracao": "twilio",
  "nome": "Twilio SMS",
  "ativo": false,
  "ambiente": "producao",
  "token_producao": "seu_account_sid",
  "token_homologacao": "seu_auth_token",
  "configuracao_json": {
    "phone_number": "+5511999999999",
    "service_sid": "seu_service_sid"
  }
}
```

Depois habilite a funcionalidade:

```javascript
PUT /api/v1/integracoes/twilio/funcionalidade/envio_sms
{
  "habilitado": true
}
```

---

## 🔧 Estrutura de Dados

### Campo `tipo_integracao`
Identificador único da integração:
- `focus_nfe` - Focus NFe
- `pagseguro` - PagSeguro
- `mercado_pago` - Mercado Pago
- `twilio` - Twilio
- `zenvia` - Zenvia
- `sendgrid` - SendGrid
- `google_calendar` - Google Calendar
- E qualquer outro que você criar!

### Campo `configuracao_json`
Armazena configurações específicas de cada integração em formato JSON:

```json
{
  "email": "exemplo@email.com",
  "api_key": "chave_api",
  "webhook_url": "https://seu-site.com/webhook",
  "configuracoes_especificas": "valor"
}
```

### Campo `funcionalidades`
Cada integração pode ter múltiplas funcionalidades:

**Focus NFe:**
- `emissao_nfe` - Emissão de NFe
- `emissao_nfce` - Emissão de NFCe
- `emissao_cte` - Emissão de CTe

**PagSeguro:**
- `pagamento_cartao` - Pagamento com cartão
- `pagamento_boleto` - Pagamento com boleto
- `pagamento_pix` - Pagamento com PIX

**Twilio:**
- `envio_sms` - Envio de SMS
- `envio_whatsapp` - Envio via WhatsApp

---

## 🚀 Vantagens da Estrutura

1. **Escalável**: Adicione quantas integrações quiser
2. **Flexível**: Cada integração tem suas próprias configurações
3. **Organizado**: Funcionalidades separadas por integração
4. **Fácil Manutenção**: Tudo em uma estrutura unificada
5. **Sem Modificar Banco**: Não precisa criar novas tabelas

---

## 📋 Checklist para Nova Integração

- [ ] Definir `tipo_integracao` único (ex: `nome_servico`)
- [ ] Criar registro na tabela `integracoes` via API
- [ ] Definir funcionalidades (ex: `funcionalidade_1`, `funcionalidade_2`)
- [ ] Habilitar funcionalidades via API
- [ ] (Opcional) Adicionar seção no frontend
- [ ] (Opcional) Criar rotas específicas no backend se necessário

---

## 💡 Dica

Você pode criar um script de inicialização que cria todas as integrações padrão:

```sql
-- Exemplo: Criar integração Focus NFe automaticamente
INSERT INTO protese.integracoes (
  tipo_integracao, nome, ativo, ambiente
) VALUES (
  'focus_nfe', 'Focus NFe', false, 'homologacao'
) ON CONFLICT (tipo_integracao) DO NOTHING;
```

---

**Resumo**: Sim, é só criar novos registros na mesma estrutura! 🎉

