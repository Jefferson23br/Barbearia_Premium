# 📋 Fluxo Completo: Vendas, Agendamentos, Receitas e Caixas

**Data de Criação**: 13 de Dezembro de 2025  
**Versão**: 1.0

---

## 🎯 Visão Geral do Sistema

O sistema integra quatro módulos principais que trabalham em conjunto para gerenciar o ciclo completo de vendas, desde o agendamento até o recebimento financeiro.

---

## 🔄 Fluxo Completo do Processo

### **1️⃣ MÓDULO DE AGENDAMENTOS**

#### **Funcionamento:**
- Cliente agenda um serviço com um profissional em uma data/hora específica
- Agendamento é criado com status `'agendado'`
- Agendamento contém: cliente, profissional, serviço, data, hora, valor do serviço

#### **Status dos Agendamentos:**
- `'agendado'` - Agendamento criado, aguardando atendimento
- `'em_andamento'` - Serviço sendo realizado
- `'concluido'` - Serviço finalizado
- `'cancelado'` - Agendamento cancelado
- `'nao_compareceu'` - Cliente não compareceu

#### **Integração com Vendas:**
- Quando uma venda é criada vinculada a um agendamento, o status muda automaticamente para `'concluido'`
- Agendamentos com status `'agendado'` aparecem na tela de Lançamento de Venda
- Após finalizar a venda, o agendamento não aparece mais na lista (status = `'concluido'`)

---

### **2️⃣ MÓDULO DE LANÇAMENTO DE VENDA**

#### **Processo de Criação de Venda:**

**Passo 1: Seleção de Dados Básicos**
- Seleciona o **Profissional** (funcionário)
- Seleciona a **Data da Venda**
- Ao selecionar data e profissional, o sistema busca automaticamente todos os agendamentos do dia com status `'agendado'`

**Passo 2: Adição de Serviços**
- **Opção A - Agendamentos:** Clica no agendamento da lista → serviço é adicionado automaticamente com valor do agendamento
- **Opção B - Serviço Manual:** Adiciona serviço manualmente (não vinculado a agendamento)
- Múltiplos serviços podem ser adicionados

**Passo 3: Adição de Produtos**
- Seleciona produto do dropdown
- Define quantidade
- Valor unitário e total são calculados automaticamente
- Múltiplos produtos podem ser adicionados

**Passo 4: Cálculo de Totais**
- Sistema calcula automaticamente:
  - **Valor Total** = Soma de todos os serviços + Soma de todos os produtos
  - **Desconto em %** = Aplicado sobre o valor total
  - **Desconto em R$** = Desconto direto em valor
  - **Valor Líquido** = Valor Total - Desconto % - Desconto R$

**Passo 5: Forma de Pagamento**
- **À Vista:**
  - Dinheiro
  - Pix
  - TED
- **Parcelado:**
  - Cartão 1x a 10x
  - Boleto 1x a 10x

**Passo 6: Seleção de Caixa**
- Seleciona o caixa onde o pagamento será registrado
- Para pagamentos à vista, o caixa recebe o valor imediatamente
- Para pagamentos parcelados, o caixa será preenchido quando a receita for paga

**Passo 7: Geração Automática**

Ao finalizar a venda, o sistema executa automaticamente:

1. **Gera Ticket da Venda:**
   - Venda única: `0001`
   - Parcelada: `0001/01`, `0001/02`, `0001/03`, etc.

2. **Cria Parcelas:**
   - **Cartão:** Primeira parcela = data_venda + 31 dias, depois +30 dias
   - **Boleto:** Primeira parcela = data informada, depois +30 dias
   - **À Vista:** 1 parcela na mesma data

3. **Atualiza Agendamentos:**
   - Agendamentos vinculados mudam status para `'concluido'`

4. **Gera Receitas:**
   - **À Vista (Dinheiro/Pix/TED):**
     - Receita criada com status `'paga'`
     - Data de pagamento = data da venda
     - Valor pago = valor da parcela
     - Caixa preenchido
     - **Cria movimentação no caixa automaticamente**
   - **Parcelado (Cartão/Boleto):**
     - Receita criada com status `'pendente'`
     - Data de pagamento = NULL
     - Valor pago = 0
     - Caixa = NULL (será preenchido quando pagar)

---

### **3️⃣ MÓDULO DE RECEITAS**

#### **Funcionalidades:**

**Listagem de Receitas:**
- Exibe todas as receitas geradas a partir de vendas
- Filtros disponíveis:
  - Status (Pendente, Paga, Vencida, Parcial)
  - Data de vencimento (início e fim)
  - Forma de pagamento
  - Busca por ticket ou cliente

**Estatísticas:**
- Total de receitas
- Receitas pendentes/vencidas (quantidade e valor)
- Total pago

**Efetivação de Pagamento Individual:**
1. Clica em "Efetivar Pagamento" na receita
2. Seleciona o **Caixa** onde será registrado
3. Define **Data de Pagamento**
4. Define **Valor a Pagar** (pode ser diferente do valor de vencimento)
5. Ao confirmar:
   - Receita é atualizada (status → `'paga'`, data_pagamento preenchida)
   - **Movimentação é criada no caixa automaticamente**
   - Saldo do caixa é atualizado pelo trigger

**Efetivação de Pagamento em Lote:**
1. Seleciona múltiplas receitas (checkbox)
2. Clica em "Efetivar Pagamento em Lote"
3. Seleciona o **Caixa** (mesmo para todas)
4. Define **Data de Pagamento** (mesma para todas)
5. Define **Valor Padrão** (opcional - se não preencher, usa valor de vencimento de cada uma)
6. Ao confirmar:
   - Todas as receitas selecionadas são pagas
   - Movimentações são criadas no caixa para cada uma
   - Saldos são atualizados

**Campos da Receita:**
- **Ticket da Venda:** Ex: `0001`, `0001/01`
- **Parcela:** ID da parcela (se houver)
- **Cliente:** Nome do cliente
- **Forma de Pagamento:** Dinheiro, Pix, TED, Cartão Xx, Boleto Xx
- **Caixa:** Caixa onde foi/será pago
- **Data de Emissão:** Data da venda
- **Data de Vencimento:** Data calculada conforme forma de pagamento
- **Data de Pagamento:** NULL até ser paga
- **Valor de Vencimento:** Valor original da parcela
- **Valor Pago:** Valor efetivamente pago (pode ser diferente se houver desconto/juros)
- **Status:** Pendente, Paga, Vencida, Parcial, Cancelada

---

### **4️⃣ MÓDULO DE CAIXAS**

#### **Funcionalidades:**

**Gerenciamento de Contas:**
- Criação de contas (Caixa, Conta Corrente, Poupança, Investimento, Outro)
- Saldo inicial configurável
- Saldo atual atualizado automaticamente por triggers

**Movimentações Automáticas:**
- **Vendas à Vista:** Criadas automaticamente quando venda é finalizada
- **Receitas Pagas:** Criadas automaticamente quando receita é efetivada
- **Movimentações Manuais:** Entrada, Saída, Transferência

**Tipos de Movimentação:**
- `'entrada'` - Aumenta saldo
- `'saida'` - Diminui saldo
- `'transferencia'` - Transfere entre contas
- `'saldo_inicial'` - Saldo inicial da conta

**Integração com Vendas e Receitas:**
- Movimentações são criadas automaticamente com `referencia_id` e `referencia_tipo`
- `referencia_tipo = 'venda'` → Movimentação de venda à vista
- `referencia_tipo = 'receita'` → Movimentação de receita paga
- Permite rastreabilidade completa

---

## 🔗 Integração Entre Módulos

### **Fluxo Completo - Exemplo Prático:**

#### **Cenário 1: Venda à Vista (Dinheiro)**

1. **Agendamento:**
   - Cliente agenda corte de cabelo para hoje às 10h
   - Status: `'agendado'`

2. **Lançamento de Venda:**
   - Profissional seleciona data de hoje e seu nome
   - Agendamento aparece na lista
   - Clica no agendamento → serviço adicionado (R$ 50,00)
   - Adiciona produto (gel, R$ 15,00)
   - Valor total: R$ 65,00
   - Forma de pagamento: Dinheiro
   - Caixa: Caixa Principal
   - Finaliza venda

3. **Sistema Executa Automaticamente:**
   - ✅ Cria venda com ticket `0001`
   - ✅ Cria 1 parcela (ticket `0001`, valor R$ 65,00, vencimento hoje)
   - ✅ Atualiza agendamento: status → `'concluido'`
   - ✅ Cria receita:
     - Ticket: `0001`
     - Status: `'paga'`
     - Data pagamento: hoje
     - Valor pago: R$ 65,00
     - Caixa: Caixa Principal
   - ✅ Cria movimentação no caixa:
     - Tipo: `'entrada'`
     - Valor: R$ 65,00
     - Descrição: "Receita 0001 - Venda 0001 - dinheiro"
     - Referência: receita_id
   - ✅ Saldo do Caixa Principal aumenta R$ 65,00 (trigger automático)

4. **Resultado:**
   - Agendamento não aparece mais na lista (status `'concluido'`)
   - Receita aparece como "Paga" no módulo Receitas
   - Caixa Principal tem saldo atualizado

---

#### **Cenário 2: Venda Parcelada (Cartão 3x)**

1. **Agendamento:**
   - Cliente agenda procedimento para hoje às 14h
   - Status: `'agendado'`

2. **Lançamento de Venda:**
   - Profissional seleciona data de hoje
   - Adiciona agendamento (R$ 300,00)
   - Valor total: R$ 300,00
   - Forma de pagamento: Cartão 3x
   - Caixa: Caixa Principal
   - Finaliza venda

3. **Sistema Executa Automaticamente:**
   - ✅ Cria venda com ticket `0002`
   - ✅ Cria 3 parcelas:
     - `0002/01` - R$ 100,00 - Vencimento: hoje + 31 dias
     - `0002/02` - R$ 100,00 - Vencimento: hoje + 61 dias
     - `0002/03` - R$ 100,00 - Vencimento: hoje + 91 dias
   - ✅ Atualiza agendamento: status → `'concluido'`
   - ✅ Cria 3 receitas (todas pendentes):
     - Receita 1: Ticket `0002/01`, Status `'pendente'`, Data pagamento NULL, Valor pago 0
     - Receita 2: Ticket `0002/02`, Status `'pendente'`, Data pagamento NULL, Valor pago 0
     - Receita 3: Ticket `0002/03`, Status `'pendente'`, Data pagamento NULL, Valor pago 0
   - ❌ **NÃO cria movimentação no caixa** (aguardando pagamento)

4. **Quando Cliente Paga a Primeira Parcela:**
   - No módulo Receitas, seleciona receita `0002/01`
   - Clica "Efetivar Pagamento"
   - Seleciona caixa: Caixa Principal
   - Data: Data do pagamento
   - Valor: R$ 100,00
   - Confirma

5. **Sistema Executa:**
   - ✅ Atualiza receita: status → `'paga'`, data_pagamento preenchida, valor_pago = R$ 100,00
   - ✅ Cria movimentação no caixa:
     - Tipo: `'entrada'`
     - Valor: R$ 100,00
     - Descrição: "Receita 0002/01 - Pagamento"
   - ✅ Saldo do Caixa Principal aumenta R$ 100,00

6. **Resultado:**
   - Receita `0002/01` aparece como "Paga"
   - Receitas `0002/02` e `0002/03` continuam "Pendentes"
   - Caixa Principal tem saldo atualizado

---

#### **Cenário 3: Pagamento em Lote**

1. **Situação:**
   - 5 receitas vencendo hoje
   - Cliente pagou todas de uma vez

2. **Processo:**
   - No módulo Receitas, seleciona as 5 receitas (checkboxes)
   - Clica "Efetivar Pagamento em Lote"
   - Seleciona caixa: Caixa Principal
   - Data: hoje
   - Valor padrão: deixa vazio (usa valor de vencimento de cada uma)
   - Confirma

3. **Sistema Executa:**
   - ✅ Atualiza todas as 5 receitas: status → `'paga'`
   - ✅ Cria 5 movimentações no caixa (uma para cada receita)
   - ✅ Saldo do caixa aumenta com a soma de todas

---

## 📊 Tabelas e Relacionamentos

### **Tabelas Principais:**

1. **`protese.agendamentos`**
   - Status: `'agendado'` → aparece na venda
   - Status: `'concluido'` → não aparece mais

2. **`protese.vendas`**
   - Venda principal
   - Contém: funcionário, cliente, data, valor total, descontos, forma pagamento, caixa

3. **`protese.vendas_parcelas`**
   - Parcelas da venda
   - Cada parcela tem: ticket, valor, data vencimento

4. **`protese.receitas`**
   - Receitas geradas a partir das parcelas
   - Vinculada à parcela e à venda
   - Status controla se já foi paga

5. **`protese.movimentacoes_caixa`**
   - Movimentações financeiras
   - Criadas automaticamente para vendas à vista e receitas pagas
   - Atualiza saldo do caixa via trigger

6. **`protese.contas`**
   - Caixas/contas cadastradas
   - Saldo atualizado automaticamente por triggers

---

## 🔄 Triggers Automáticos

### **1. Atualização de Saldo do Caixa:**
- Quando movimentação é criada → saldo_atual é atualizado
- Quando movimentação é excluída → saldo_atual é revertido

### **2. Atualização de Status da Receita:**
- Baseado em data_pagamento e valor_pago
- Se tem data_pagamento e valor_pago >= valor_vencimento → `'paga'`
- Se tem data_pagamento mas valor_pago < valor_vencimento → `'parcial'`
- Se não tem data_pagamento e já passou vencimento → `'vencida'`
- Se não tem data_pagamento e ainda não venceu → `'pendente'`

---

## ✅ Resumo do Fluxo

1. **Agendamento** → Cliente agenda serviço (status: `'agendado'`)
2. **Venda** → Profissional cria venda, adiciona agendamento/produtos
3. **Parcelas** → Sistema cria parcelas automaticamente
4. **Receitas** → Sistema cria receitas automaticamente:
   - À vista: receita paga + movimentação no caixa
   - Parcelado: receitas pendentes
5. **Agendamento** → Status muda para `'concluido'` (não aparece mais)
6. **Pagamento** → Quando receita é paga:
   - Receita atualizada (status: `'paga'`)
   - Movimentação criada no caixa
   - Saldo do caixa atualizado

---

## 🎯 Benefícios da Integração

✅ **Rastreabilidade Completa:** Cada movimentação tem referência à venda/receita  
✅ **Automação Total:** Não precisa criar receitas ou movimentações manualmente  
✅ **Controle de Agendamentos:** Agendamentos concluídos não aparecem mais  
✅ **Gestão Financeira:** Saldos sempre atualizados automaticamente  
✅ **Flexibilidade:** Pagamento individual ou em lote  
✅ **Histórico Completo:** Todas as operações ficam registradas  

---

**Última atualização**: 16 de Dezembro de 2025  
**Versão do documento**: 1.1

