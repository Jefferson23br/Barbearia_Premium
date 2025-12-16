# Documentação de Integrações - Sistema de Gestão

**Última atualização:** 16 de dezembro de 2025

Este documento contém informações detalhadas sobre como configurar e obter as credenciais necessárias para cada integração disponível no sistema.

---

## Índice

1. [Focus NFe](#1-focus-nfe)
2. [PLUG NFe](#2-plug-nfe)
3. [Asaas](#3-asaas)
4. [Mercado Pago](#4-mercado-pago)
5. [PagSeguro/PagBank](#5-pagseguropagbank)
6. [Twilio](#6-twilio)
7. [WhatsApp Business API](#7-whatsapp-business-api)
8. [SendGrid](#8-sendgrid)
9. [DocSales](#9-docsales)

---

## 1. Focus NFe

### Descrição
Integração para emissão de Notas Fiscais Eletrônicas (NF-e) através da plataforma Focus NFe.

### O que é necessário
- Conta ativa no Focus NFe
- CNPJ da empresa cadastrado
- Certificado digital A1 (.pfx) válido
- Tokens de acesso (homologação e produção)

### Como obter as credenciais

#### Passo 1: Criar conta no Focus NFe
1. Acesse: https://www.focusnfe.com.br/
2. Clique em "Criar conta" ou "Cadastre-se"
3. Preencha os dados da empresa (CNPJ, razão social, etc)
4. Complete o cadastro e verifique seu email

#### Passo 2: Obter tokens de acesso
1. Faça login no painel do Focus NFe
2. Acesse: **Configurações** > **Tokens de Acesso**
3. Gere um token para **Homologação** (ambiente de testes)
4. Gere um token para **Produção** (ambiente real)
5. Copie e guarde os tokens em local seguro

#### Passo 3: Preparar certificado digital
1. Tenha um certificado digital A1 (.pfx) válido
2. O certificado deve estar no formato .pfx ou .p12
3. Anote o caminho completo onde o certificado será armazenado no servidor
4. Anote a senha do certificado (se houver)

#### Passo 4: Configurar no sistema
1. Acesse: **Integrações de APIs** no menu
2. Selecione **Focus NFe**
3. Preencha os campos:
   - **CNPJ**: CNPJ da empresa (formato: 00.000.000/0000-00)
   - **Token de Homologação**: Token gerado para testes
   - **Token de Produção**: Token gerado para produção
   - **Caminho do Certificado Digital**: Caminho completo do arquivo .pfx
4. Selecione o ambiente (Homologação ou Produção)
5. Ative a integração e salve

### Documentação oficial
- Site: https://www.focusnfe.com.br/
- Documentação: https://doc.focusnfe.com.br/

### Observações importantes
- O ambiente de homologação é obrigatório para testes antes de ir para produção
- O certificado digital deve ser renovado antes do vencimento
- Mantenha os tokens em local seguro e não compartilhe

---

## 2. PLUG NFe

### Descrição
Integração para emissão de Notas Fiscais Eletrônicas (NF-e) através da plataforma PLUG NFe.

### O que é necessário
- Conta ativa no PLUG NFe
- CNPJ da empresa cadastrado
- Certificado digital A1 (.pfx) válido (opcional, dependendo do plano)
- API Key de acesso

### Como obter as credenciais

#### Passo 1: Criar conta no PLUG NFe
1. Acesse: https://www.plugnfe.com.br/
2. Clique em "Criar conta" ou "Cadastre-se"
3. Preencha os dados da empresa
4. Complete o cadastro e verifique seu email

#### Passo 2: Obter API Key
1. Faça login no painel do PLUG NFe
2. Acesse: **Configurações** > **API** ou **Integrações**
3. Gere uma **API Key**
4. Copie e guarde a API Key em local seguro
5. A mesma API Key pode ser usada para homologação e produção (dependendo da configuração)

#### Passo 3: Preparar certificado digital (se necessário)
1. Verifique se seu plano exige certificado digital
2. Se necessário, tenha um certificado digital A1 (.pfx) válido
3. Anote o caminho completo onde o certificado será armazenado
4. Anote a senha do certificado (se houver)

#### Passo 4: Configurar no sistema
1. Acesse: **Integrações de APIs** no menu
2. Selecione **PLUG NFe**
3. Preencha os campos:
   - **CNPJ**: CNPJ da empresa (formato: 00.000.000/0000-00)
   - **API Key (Token)**: API Key gerada no painel
   - **Caminho do Certificado Digital**: Caminho completo do arquivo .pfx (se necessário)
   - **Senha do Certificado**: Senha do certificado (se necessário)
4. Selecione o ambiente (Homologação ou Produção)
5. Ative a integração e salve

### Documentação oficial
- Site: https://www.plugnfe.com.br/
- Documentação: https://docs.plugnotas.com.br/

### Observações importantes
- A API Key do PLUG NFe pode ser única para ambos os ambientes
- Verifique as limitações do seu plano antes de usar em produção
- Mantenha a API Key em local seguro

---

## 3. Asaas

### Descrição
Integração para processamento de pagamentos (PIX, boleto bancário, cartão de crédito) através da plataforma Asaas.

### O que é necessário
- Conta ativa no Asaas
- Documentos da empresa (CNPJ, comprovante de endereço)
- Chave de API (API Key)

### Como obter as credenciais

#### Passo 1: Criar conta no Asaas
1. Acesse: https://www.asaas.com/
2. Clique em "Criar conta" ou "Cadastre-se"
3. Preencha os dados da empresa
4. Envie os documentos necessários para verificação
5. Aguarde a aprovação da conta

#### Passo 2: Obter API Key
1. Faça login no painel do Asaas
2. Acesse: **Minha Conta** > **Integração**
3. Clique em **Gerar nova Chave de API**
4. Copie a chave gerada (ela só será exibida uma vez)
5. Guarde a chave em local seguro

#### Passo 3: Obter API Key de Sandbox (para testes)
1. Acesse: https://sandbox.asaas.com/
2. Crie uma conta de teste
3. Siga os mesmos passos do item anterior para gerar a API Key de sandbox

#### Passo 4: Configurar no sistema
1. Acesse: **Integrações de APIs** no menu
2. Selecione **Asaas**
3. Preencha os campos:
   - **API Key de Produção**: Chave gerada na conta de produção
   - **API Key de Sandbox**: Chave gerada na conta de sandbox
   - **URL de Webhook**: URL para receber notificações (opcional)
4. Selecione o ambiente (Homologação ou Produção)
5. Ative a integração e salve

### Documentação oficial
- Site: https://www.asaas.com/
- Documentação: https://docs.asaas.com/docs/visao-geral

### Observações importantes
- Use sempre o ambiente de sandbox para testes antes de ir para produção
- Configure webhooks para receber notificações de pagamentos em tempo real
- Mantenha as API Keys em local seguro

---

## 4. Mercado Pago

### Descrição
Integração para processamento de pagamentos (PIX, boleto, cartão de crédito) através da plataforma Mercado Pago.

### O que é necessário
- Conta ativa no Mercado Pago
- Documentos da empresa verificados
- Access Token
- Public Key (para integrações frontend)

### Como obter as credenciais

#### Passo 1: Criar conta no Mercado Pago
1. Acesse: https://www.mercadopago.com.br/
2. Clique em "Criar conta" ou "Cadastre-se"
3. Preencha os dados da empresa
4. Complete a verificação de documentos
5. Aguarde a aprovação da conta

#### Passo 2: Obter Access Token
1. Faça login no painel do Mercado Pago
2. Acesse: **Desenvolvedores** > **Suas integrações**
3. Clique em **Criar aplicação**
4. Preencha os dados da aplicação
5. Após criar, acesse **Credenciais**
6. Copie o **Access Token de Produção**
7. Copie o **Access Token de Testes** (para sandbox)

#### Passo 3: Obter Public Key
1. Na mesma página de **Credenciais**
2. Copie a **Chave Pública (Public Key)**
3. Esta chave é usada para integrações no frontend (Checkout Transparente)

#### Passo 4: Configurar no sistema
1. Acesse: **Integrações de APIs** no menu
2. Selecione **Mercado Pago**
3. Preencha os campos:
   - **Access Token de Produção**: Token de produção copiado
   - **Access Token de Testes**: Token de testes copiado
   - **Public Key**: Chave pública (opcional, para frontend)
   - **URL de Webhook**: URL para receber notificações (opcional)
4. Selecione o ambiente (Homologação ou Produção)
5. Ative a integração e salve

### Documentação oficial
- Site: https://www.mercadopago.com.br/
- Documentação: https://www.mercadopago.com.br/developers/pt/reference

### Observações importantes
- Use cartões de teste no ambiente de sandbox
- Configure webhooks para receber notificações de pagamentos
- A Public Key é necessária apenas para integrações frontend
- Mantenha os tokens em local seguro

---

## 5. PagSeguro/PagBank

### Descrição
Integração para processamento de pagamentos (PIX, boleto, cartão de crédito) através da plataforma PagSeguro/PagBank.

### O que é necessário
- Conta ativa no PagSeguro/PagBank
- Documentos da empresa verificados
- Token de acesso
- Email da conta (para algumas integrações legadas)

### Como obter as credenciais

#### Passo 1: Criar conta no PagSeguro/PagBank
1. Acesse: https://pagseguro.uol.com.br/ ou https://www.pagbank.com.br/
2. Clique em "Criar conta" ou "Cadastre-se"
3. Preencha os dados da empresa
4. Complete a verificação de documentos
5. Aguarde a aprovação da conta

#### Passo 2: Obter Token de Acesso
1. Faça login no painel do PagSeguro/PagBank
2. Acesse: **Minha Conta** > **Integrações** > **Tokens**
3. Clique em **Gerar novo Token**
4. Copie o token gerado (ele só será exibido uma vez)
5. Guarde o token em local seguro

#### Passo 3: Obter Token de Sandbox (para testes)
1. Acesse o ambiente de sandbox do PagSeguro
2. Siga os mesmos passos do item anterior para gerar o token de sandbox

#### Passo 4: Configurar no sistema
1. Acesse: **Integrações de APIs** no menu
2. Selecione **PagSeguro (PagBank)**
3. Preencha os campos:
   - **Token de Produção**: Token gerado na conta de produção
   - **Token de Sandbox**: Token gerado na conta de sandbox
   - **Email**: Email da conta PagSeguro (opcional, para integrações legadas)
   - **URL de Webhook**: URL para receber notificações (opcional)
4. Selecione o ambiente (Homologação ou Produção)
5. Ative a integração e salve

### Documentação oficial
- Site: https://developer.pagbank.com.br/
- Documentação: https://developer.pagbank.com.br/

### Observações importantes
- Use sempre o ambiente de sandbox para testes
- Configure webhooks para receber notificações de pagamentos
- O email pode ser necessário para algumas integrações legadas
- Mantenha os tokens em local seguro

---

## 6. Twilio

### Descrição
Integração para envio de comunicações (SMS, WhatsApp, voz, email, chat) através da plataforma Twilio.

### O que é necessário
- Conta ativa no Twilio
- Account SID
- Auth Token
- Número de telefone Twilio (opcional)

### Como obter as credenciais

#### Passo 1: Criar conta no Twilio
1. Acesse: https://www.twilio.com/pt-br
2. Clique em "Teste gratuitamente" ou "Criar conta"
3. Preencha os dados solicitados
4. Verifique seu número de telefone
5. Complete o cadastro

#### Passo 2: Obter Account SID e Auth Token
1. Faça login no Console do Twilio
2. No painel principal, você verá:
   - **Account SID**: Identificador da sua conta
   - **Auth Token**: Token de autenticação (clique em "view" para visualizar)
3. Copie ambos os valores
4. Guarde em local seguro

#### Passo 3: Obter número de telefone Twilio (opcional)
1. No Console do Twilio, acesse: **Phone Numbers** > **Manage** > **Buy a number**
2. Escolha um número disponível
3. Complete a compra (pode haver custos)
4. Anote o número no formato: +5511999999999

#### Passo 4: Configurar no sistema
1. Acesse: **Integrações de APIs** no menu
2. Selecione **Twilio**
3. Preencha os campos:
   - **Account SID**: SID copiado do Console
   - **Auth Token de Produção**: Auth Token copiado
   - **Auth Token de Testes**: Pode ser o mesmo ou criar um separado
   - **Número de Telefone Twilio**: Número comprado (opcional)
   - **URL de Webhook**: URL para receber notificações (opcional)
4. Selecione o ambiente (Homologação ou Produção)
5. Ative a integração e salve

### Documentação oficial
- Site: https://www.twilio.com/pt-br
- Documentação: https://www.twilio.com/docs

### Observações importantes
- A conta gratuita do Twilio tem limitações
- O número de telefone é necessário para envio de SMS
- Configure webhooks para receber status de mensagens
- Mantenha Account SID e Auth Token em local seguro

---

## 7. WhatsApp Business API

### Descrição
Integração para envio de mensagens, notificações e atendimento através do WhatsApp Business API.

### O que é necessário
- Conta no Facebook Business Manager
- WhatsApp Business Account (WABA) criada
- Provedor de Solução de Negócios (BSP) aprovado (ex: Twilio, Sinch)
- Phone Number ID
- Access Token
- Verify Token (para webhooks)
- App Secret (opcional)

### Como obter as credenciais

#### Passo 1: Criar conta no Facebook Business Manager
1. Acesse: https://business.facebook.com/
2. Crie uma conta Business Manager
3. Verifique sua empresa fornecendo documentos necessários
4. Aguarde a aprovação

#### Passo 2: Criar WhatsApp Business Account (WABA)
1. No Business Manager, acesse: **Configurações** > **Contas** > **WhatsApp Business Accounts**
2. Clique em **Adicionar** > **Criar nova conta**
3. Preencha os dados da empresa
4. Complete a verificação

#### Passo 3: Escolher Provedor de Solução de Negócios (BSP)
1. Você precisa de um BSP aprovado pela Meta
2. Opções populares:
   - **Twilio**: https://www.twilio.com/whatsapp
   - **Sinch**: https://sinch.com/pt/apis/messaging/whatsapp/
   - **API Brasil**: https://www.apibrasil.com.br/api-whatsapp
3. Crie uma conta no BSP escolhido
4. Conecte sua WABA ao BSP

#### Passo 4: Obter Phone Number ID
1. No Business Manager, acesse: **Configurações** > **Configurações da API**
2. Localize o **Phone Number ID**
3. Copie o ID

#### Passo 5: Obter Access Token
1. No Business Manager, acesse: **Configurações** > **Tokens de acesso**
2. Gere um token de acesso de longa duração
3. Copie o token (ele só será exibido uma vez)
4. Guarde em local seguro

#### Passo 6: Configurar Verify Token e App Secret
1. Crie um Verify Token personalizado (pode ser qualquer string segura)
2. Anote o App Secret (se disponível no BSP)
3. Esses valores serão usados para validar webhooks

#### Passo 7: Configurar no sistema
1. Acesse: **Integrações de APIs** no menu
2. Selecione **WhatsApp Business API**
3. Preencha os campos:
   - **Phone Number ID**: ID copiado do Business Manager
   - **Access Token de Produção**: Token gerado
   - **Access Token de Testes**: Token de sandbox (se disponível)
   - **Verify Token**: Token criado para webhooks
   - **App Secret**: Secret do app (se disponível)
   - **URL de Webhook**: URL para receber notificações
4. Selecione o ambiente (Homologação ou Produção)
5. Ative a integração e salve

### Documentação oficial
- Site: https://business.whatsapp.com/
- Documentação: https://developers.facebook.com/docs/whatsapp

### Observações importantes
- É obrigatório usar um BSP aprovado pela Meta
- Obtenha consentimento explícito dos clientes antes de enviar mensagens
- Configure webhooks corretamente para receber notificações
- Mantenha todos os tokens em local seguro
- Verifique a conformidade com as políticas do WhatsApp

---

## 8. SendGrid

### Descrição
Integração para envio de emails transacionais e de marketing através da plataforma SendGrid.

### O que é necessário
- Conta ativa no SendGrid
- API Key
- Email remetente verificado
- Domínio autenticado (recomendado)

### Como obter as credenciais

#### Passo 1: Criar conta no SendGrid
1. Acesse: https://sendgrid.com/
2. Clique em "Start for free" ou "Criar conta"
3. Preencha os dados solicitados
4. Verifique seu email
5. Complete o cadastro

#### Passo 2: Obter API Key
1. Faça login no painel do SendGrid
2. Acesse: **Settings** > **API Keys**
3. Clique em **Create API Key**
4. Dê um nome para a chave (ex: "Produção" ou "Testes")
5. Selecione as permissões (Full Access ou Restricted Access)
6. Clique em **Create & View**
7. Copie a API Key (ela só será exibida uma vez)
8. Guarde em local seguro

#### Passo 3: Verificar email remetente
1. No painel do SendGrid, acesse: **Settings** > **Sender Authentication**
2. Clique em **Verify a Single Sender**
3. Preencha os dados do remetente
4. Verifique o email enviado pelo SendGrid
5. Anote o email verificado

#### Passo 4: Autenticar domínio (recomendado)
1. No painel do SendGrid, acesse: **Settings** > **Sender Authentication**
2. Clique em **Authenticate Your Domain**
3. Siga as instruções para configurar os registros DNS (SPF, DKIM, DMARC)
4. Aguarde a verificação (pode levar até 48 horas)

#### Passo 5: Configurar no sistema
1. Acesse: **Integrações de APIs** no menu
2. Selecione **SendGrid**
3. Preencha os campos:
   - **API Key de Produção**: Chave gerada para produção
   - **API Key de Testes**: Chave gerada para testes (opcional)
   - **Email Remetente Padrão**: Email verificado no SendGrid
   - **Nome do Remetente**: Nome que aparecerá como remetente
   - **URL de Webhook**: URL para receber notificações (opcional)
4. Selecione o ambiente (Homologação ou Produção)
5. Ative a integração e salve

### Documentação oficial
- Site: https://sendgrid.com/
- Documentação: https://docs.sendgrid.com/

### Observações importantes
- A autenticação de domínio melhora significativamente a entregabilidade
- Use sempre emails verificados como remetente
- Configure webhooks para monitorar entregas, aberturas e cliques
- Mantenha as API Keys em local seguro
- O plano gratuito tem limitações de envio

---

## Dicas Gerais de Segurança

### Boas Práticas
1. **Nunca compartilhe credenciais**: Mantenha todas as chaves, tokens e senhas em local seguro
2. **Use variáveis de ambiente**: Armazene credenciais em variáveis de ambiente, nunca no código
3. **Rotacione credenciais**: Troque periodicamente as chaves e tokens
4. **Use HTTPS**: Sempre use conexões seguras para transmissão de dados
5. **Monitore acessos**: Acompanhe logs de acesso às APIs
6. **Teste em sandbox**: Sempre teste em ambiente de homologação antes de produção

### Em caso de comprometimento
1. Revogue imediatamente as credenciais comprometidas
2. Gere novas credenciais
3. Atualize as configurações no sistema
4. Monitore atividades suspeitas
5. Notifique o provedor da integração, se necessário

---

## Suporte

Para dúvidas sobre integrações específicas, consulte:
- A documentação oficial de cada serviço (links fornecidos acima)
- O suporte técnico do provedor da integração
- A equipe de desenvolvimento do sistema

---

---

## 9. DocSales

### Descrição
Integração para gestão de assinaturas de contratos eletrônicos através da plataforma DocSales.

### O que é necessário
- Conta ativa no DocSales
- Token de acesso (gerado no painel)
- Email remetente (opcional)

### Como obter as credenciais

#### Passo 1: Criar conta no DocSales
1. Acesse: https://www.docsales.com.br/
2. Clique em "Criar conta" ou "Cadastre-se"
3. Preencha os dados da empresa
4. Complete o cadastro e verifique seu email

#### Passo 2: Obter Token de Acesso
1. Faça login no painel do DocSales
2. Acesse: **Configurações** > **Integrações**
3. Clique em **Gerar Token de Acesso**
4. Copie o token gerado (ele só será exibido uma vez)
5. Guarde o token em local seguro

#### Passo 3: Obter Token de Homologação (para testes)
1. No painel do DocSales, acesse o ambiente de sandbox/homologação
2. Siga os mesmos passos do item anterior para gerar o token de homologação
3. Guarde o token em local seguro

#### Passo 4: Configurar Webhook (Opcional)
1. No painel do DocSales, acesse: **Configurações** > **Webhooks**
2. Configure a URL do webhook: `https://seu-dominio.com.br/api/v1/docsales/webhook`
3. Selecione os eventos que deseja receber:
   - Documento criado
   - Documento visualizado
   - Documento assinado
   - Documento recusado
   - Documento cancelado
   - Documento expirado
4. Salve as configurações

#### Passo 5: Configurar no sistema
1. Acesse: **Integrações de APIs** no menu
2. Selecione **DocSales**
3. Preencha os campos:
   - **Token de Acesso (Produção)**: Token gerado na conta de produção
   - **Token de Acesso (Homologação)**: Token gerado na conta de homologação
   - **URL de Webhook**: URL para receber notificações (opcional)
   - **Email Padrão do Remetente**: Email que será usado como remetente (opcional)
4. Selecione o ambiente (Homologação ou Produção)
5. Ative a integração e salve

### Funcionalidades disponíveis

#### Enviar documento para assinatura
```javascript
POST /api/v1/docsales/documentos
{
  "titulo": "Contrato de Prestação de Serviços",
  "conteudo": "Base64 do PDF ou texto do documento",
  "signatarios": [
    {
      "nome": "João Silva",
      "email": "joao@exemplo.com",
      "cpf": "123.456.789-00",
      "ordem": 1,
      "tipo": "signatario"
    }
  ],
  "opcoes": {
    "prazo_dias": 30,
    "enviar_email": true,
    "permitir_recusar": true
  }
}
```

#### Consultar status de documento
```javascript
GET /api/v1/docsales/documentos/:id
```

#### Listar documentos
```javascript
GET /api/v1/docsales/documentos?status=assinado&pagina=1&limite=10
```

#### Cancelar documento
```javascript
POST /api/v1/docsales/documentos/:id/cancelar
{
  "motivo": "Documento não é mais necessário"
}
```

#### Baixar documento assinado
```javascript
GET /api/v1/docsales/documentos/:id/download
```

### Documentação oficial
- Site: https://www.docsales.com.br/
- Documentação da API: https://www.docsales.com.br/esign-as-a-service/
- Suporte: [email protected]

### Observações importantes
- O DocSales possui um limite de 200 requisições por mês para criação de documentos (plano básico)
- Para aumentar o limite, entre em contato com o suporte do DocSales
- Use sempre o ambiente de homologação para testes antes de ir para produção
- Configure webhooks para receber notificações em tempo real sobre o status dos documentos
- Mantenha os tokens em local seguro
- O sistema oferece suporte técnico por e-mail, WhatsApp e telefone

### Status dos documentos
- **pendente**: Documento aguardando assinatura
- **assinado**: Documento assinado por todos os signatários
- **cancelado**: Documento cancelado
- **expirado**: Documento expirado (prazo ultrapassado)
- **recusado**: Documento recusado por um dos signatários

---

**Nota:** Esta documentação é atualizada periodicamente. Sempre consulte a documentação oficial de cada serviço para informações mais recentes.

