# Documentação Completa: Vendas, Formas de Pagamento, Sistema de Pagamentos e Somatórias com Caixas

## Índice
1. [Sistema de Vendas](#sistema-de-vendas)
2. [Formas de Pagamento](#formas-de-pagamento)
3. [Sistema de Pagamentos](#sistema-de-pagamentos)
4. [Sistema de Caixas](#sistema-de-caixas)
5. [Somatórias e Relatórios](#somatórias-e-relatórios)
6. [Fluxo Completo de uma Venda](#fluxo-completo-de-uma-venda)

---

## Sistema de Vendas

### Estrutura de Dados

#### Tabela Principal: `protese.vendas`

A tabela de vendas armazena todas as informações principais de uma venda:

```sql
- id: UUID (chave primária)
- ticket: VARCHAR(50) - Número único da venda (ex: 0001, 0001/01, 0001/02)
- funcionario_id: UUID - Funcionário responsável pela venda
- cliente_id: UUID - Cliente (pode ser NULL se venda não vinculada)
- data_venda: DATE - Data da venda
- valor_total: DECIMAL(15,2) - Valor total antes dos descontos
- desconto_percentual: DECIMAL(5,2) - Desconto em porcentagem
- desconto_valor: DECIMAL(15,2) - Desconto em valor direto
- valor_liquido: DECIMAL(15,2) - Valor final após descontos (valor_total - descontos)
- forma_pagamento: VARCHAR(50) - Forma de pagamento (ver seção abaixo)
- numero_parcelas: INTEGER - Número de parcelas (1 para dinheiro, pix, ted)
- caixa_id: UUID - Caixa selecionado para a venda
- cupom_id: UUID - Cupom de desconto aplicado (se houver)
- observacoes: TEXT - Observações da venda
- status: VARCHAR(50) - Status: 'pendente', 'paga', 'cancelada', 'parcial'
- created_at, updated_at: TIMESTAMP
- created_by, updated_by: UUID
```

#### Tabelas Relacionadas

**`protese.vendas_servicos`**
- Armazena os serviços incluídos na venda
- Campos: `venda_id`, `servico_id`, `agendamento_id`, `valor`

**`protese.vendas_produtos`**
- Armazena os produtos incluídos na venda
- Campos: `venda_id`, `produto_id`, `quantidade`, `valor_unitario`, `valor_total`

**`protese.vendas_assinaturas`**
- Armazena as assinaturas vendidas
- Campos: `venda_id`, `assinatura_id`, `valor`

**`protese.vendas_parcelas`**
- Armazena as parcelas de pagamento (para vendas parceladas)
- Campos: `venda_id`, `numero_parcela`, `ticket_parcela`, `valor`, `data_vencimento`, `data_pagamento`, `status`, `forma_pagamento`, `caixa_id`

### Funcionalidades Principais

#### 1. Criação de Venda (`POST /api/v1/vendas`)

**Processo de Criação:**

1. **Validação de Permissões**
   - Verifica se o usuário tem permissão `vendas_editar`
   - Usuários `master` têm acesso total

2. **Validação de Dados**
   - Funcionário, data, forma de pagamento e caixa são obrigatórios
   - Deve ter pelo menos um serviço, produto ou assinatura

3. **Cálculo de Valores**
   - Soma valores de serviços, produtos e assinaturas
   - Verifica e abate serviços/produtos de assinaturas válidas do cliente
   - Aplica cupom de desconto (se fornecido)
   - Aplica descontos percentual e em valor
   - Calcula valor líquido final

4. **Abatimento de Assinaturas**
   - Verifica assinaturas ativas do cliente
   - Abate serviços/produtos das assinaturas antes de cobrar
   - Atualiza quantidades restantes nas assinaturas

5. **Validação de Estoque**
   - Verifica estoque disponível para produtos
   - Abate estoque automaticamente ao finalizar venda

6. **Geração de Ticket**
   - Usa função `protese.gerar_proximo_ticket_venda()`
   - Formato: 0001, 0002, etc. (4 dígitos com zeros à esquerda)
   - Para parcelas: 0001/01, 0001/02, etc.

7. **Criação de Receitas**
   - Para pagamento à vista: cria 1 receita
   - Para pagamento parcelado: cria N receitas (uma por parcela)
   - Receitas são criadas automaticamente vinculadas à venda

8. **Movimentações de Caixa**
   - Para pagamento à vista: cria movimentação de entrada automaticamente
   - Para primeira parcela de cartão/boleto 1x: cria movimentação imediatamente
   - Para parcelas futuras: movimentação será criada quando a receita for paga

9. **Atualização de Agendamentos**
   - Se serviço está vinculado a agendamento, atualiza status para 'concluido'

10. **Registro de Logs**
    - Registra todas as ações no sistema de logs

#### 2. Listagem de Vendas (`GET /api/v1/vendas`)

**Filtros Disponíveis:**
- `data_inicio` - Data inicial
- `data_fim` - Data final
- `cliente_id` - Filtrar por cliente
- `funcionario_id` - Filtrar por funcionário
- `status` - Filtrar por status

**Retorno:**
- Lista de vendas com detalhes completos
- Inclui serviços, produtos e assinaturas de cada venda
- Inclui informações do cliente, funcionário e caixa

#### 3. Busca de Venda Específica (`GET /api/v1/vendas/:id`)

Retorna venda completa com todos os detalhes relacionados.

#### 4. Exclusão de Venda (`DELETE /api/v1/vendas/:id`)

**Processo de Exclusão:**
1. Reverte estoque dos produtos vendidos
2. Exclui movimentações de caixa vinculadas
3. Exclui assinaturas_clientes vinculadas
4. Exclui cupons usados
5. Exclui relacionamentos do CRM
6. Exclui notas fiscais
7. Exclui receitas vinculadas
8. Exclui a venda (CASCADE exclui serviços/produtos/assinaturas)

---

## Formas de Pagamento

### Tipos de Forma de Pagamento

O sistema suporta as seguintes formas de pagamento:

#### 1. **Pagamento à Vista**
- `dinheiro` - Pagamento em dinheiro
- `pix` - Pagamento via PIX
- `ted` - Transferência bancária (TED)

**Características:**
- Cria 1 receita única
- Status: 'paga' imediatamente
- Cria movimentação de caixa automaticamente
- Data de pagamento = data de venda

#### 2. **Cartão de Crédito**
- `cartao_1x` - Cartão à vista (1 parcela)
- `cartao_2x` - Cartão em 2 parcelas
- `cartao_3x` - Cartão em 3 parcelas
- `cartao_4x` - Cartão em 4 parcelas
- `cartao_5x` - Cartão em 5 parcelas
- `cartao_6x` - Cartão em 6 parcelas
- ... (até N parcelas)

**Características:**
- `cartao_1x`: Cria 1 receita paga imediatamente
- `cartao_Nx` (N > 1): Cria N receitas parceladas
  - Primeira parcela: status 'paga' (cria movimentação)
  - Demais parcelas: status 'pendente' (movimentação criada quando paga)
  - Intervalo entre parcelas: 30 dias

#### 3. **Boleto**
- `boleto_1x` - Boleto à vista (1 parcela)
- `boleto_2x` - Boleto em 2 parcelas
- `boleto_3x` - Boleto em 3 parcelas
- ... (até N parcelas)

**Características:**
- Similar ao cartão
- `boleto_1x`: Cria 1 receita paga imediatamente
- `boleto_Nx` (N > 1): Cria N receitas parceladas
  - Primeira parcela: status 'paga' (cria movimentação)
  - Demais parcelas: status 'pendente'
  - Intervalo entre parcelas: 30 dias
  - Permite definir `primeiro_vencimento_boleto` na criação da venda

### Extração de Número de Parcelas

O sistema extrai automaticamente o número de parcelas da forma de pagamento:

```javascript
if (forma_pagamento.startsWith('cartao_') || forma_pagamento.startsWith('boleto_')) {
  const match = forma_pagamento.match(/(\d+)x/);
  if (match) {
    numeroParcelas = parseInt(match[1]);
  }
}
```

### Armazenamento

A forma de pagamento é armazenada em:
- `protese.vendas.forma_pagamento` - Forma de pagamento da venda
- `protese.receitas.forma_pagamento` - Forma de pagamento de cada receita
- `protese.vendas_parcelas.forma_pagamento` - Forma de pagamento de cada parcela

---

## Sistema de Pagamentos

### Tabela de Receitas: `protese.receitas`

As receitas são geradas automaticamente a partir das vendas e representam os valores a receber.

#### Estrutura da Tabela

```sql
- id: UUID (chave primária)
- ticket_venda: VARCHAR(50) - Ticket da venda/parcela (ex: 0001, 0001/01)
- parcela_id: UUID - ID da parcela (se houver)
- venda_id: UUID - ID da venda
- cliente_id: UUID - Cliente
- forma_pagamento: VARCHAR(50) - Forma de pagamento
- caixa_id: UUID - Caixa onde será pago (pode ser NULL até efetivar)
- data_emissao: DATE - Data da venda
- data_vencimento: DATE - Data de vencimento
- data_pagamento: DATE - NULL até ser paga
- valor_vencimento: DECIMAL(15,2) - Valor original da parcela
- valor_pago: DECIMAL(15,2) - Valor efetivamente pago
- status: VARCHAR(50) - 'pendente', 'paga', 'vencida', 'cancelada', 'parcial'
- observacoes: TEXT
- movimentacao_caixa_id: UUID - ID da movimentação criada quando paga
- created_at, updated_at: TIMESTAMP
- created_by, updated_by: UUID
```

### Status das Receitas

O status é atualizado automaticamente por trigger:

- **`pendente`**: Não tem data de pagamento e ainda não venceu
- **`paga`**: Tem data de pagamento e valor_pago >= valor_vencimento
- **`parcial`**: Tem data de pagamento mas valor_pago < valor_vencimento
- **`vencida`**: Não tem data de pagamento e já passou do vencimento
- **`cancelada`**: Receita cancelada

### Criação de Receitas

#### Venda à Vista (dinheiro, pix, ted, cartao_1x, boleto_1x)

```javascript
// Cria 1 receita única
INSERT INTO protese.receitas (
  venda_id, cliente_id, ticket_venda, valor_vencimento, valor_pago,
  data_emissao, data_vencimento, data_pagamento,
  forma_pagamento, caixa_id, status
) VALUES (
  venda_id, cliente_id, ticket, valorLiquido, valorLiquido,
  data_venda, data_venda, data_venda,
  forma_pagamento, caixa_id, 'paga'
);

// Cria movimentação de caixa automaticamente
INSERT INTO protese.movimentacoes_caixa (
  conta_id, tipo_movimentacao, valor, descricao,
  data_movimentacao, referencia_id, referencia_tipo
) VALUES (
  caixa_id, 'entrada', valorLiquido, 'Receita {ticket} - Venda à vista',
  data_venda, receita_id, 'receita'
);
```

#### Venda Parcelada (cartao_Nx, boleto_Nx, N > 1)

```javascript
// Cria N receitas (uma por parcela)
const valorParcela = valorLiquido / numeroParcelas;
let dataVencimento = primeiro_vencimento_boleto || data_venda;

for (let i = 1; i <= numeroParcelas; i++) {
  const ticketParcela = numeroParcelas > 1 
    ? `${ticketBase}/${i.toString().padStart(2, '0')}` 
    : ticketBase;
  
  const statusParcela = i === 1 ? 'paga' : 'pendente';
  
  // Cria receita
  INSERT INTO protese.receitas (
    venda_id, cliente_id, ticket_venda, valor_vencimento, valor_pago,
    data_emissao, data_vencimento, data_pagamento,
    forma_pagamento, caixa_id, status
  ) VALUES (
    venda_id, cliente_id, ticketParcela, valorParcela,
    statusParcela === 'paga' ? valorParcela : 0,
    data_venda, dataVencimento,
    statusParcela === 'paga' ? dataVencimento : null,
    forma_pagamento, caixa_id, statusParcela
  );
  
  // Se primeira parcela, cria movimentação
  if (statusParcela === 'paga') {
    INSERT INTO protese.movimentacoes_caixa (
      conta_id, tipo_movimentacao, valor, descricao,
      data_movimentacao, referencia_id, referencia_tipo
    ) VALUES (
      caixa_id, 'entrada', valorParcela,
      `Receita ${ticketParcela} - Parcela ${i}/${numeroParcelas}`,
      dataVencimento, receita_id, 'receita'
    );
  }
  
  // Incrementa data para próxima parcela (30 dias)
  dataVencimento.setMonth(dataVencimento.getMonth() + 1);
}
```

### Efetivação de Pagamento (`POST /api/v1/receitas/efetivar-pagamento`)

Permite efetivar pagamento de uma ou múltiplas receitas pendentes.

**Processo:**

1. **Validação**
   - Verifica permissões do usuário
   - Valida lista de receitas
   - Valida caixa selecionado

2. **Atualização de Receitas**
   ```javascript
   UPDATE protese.receitas 
   SET data_pagamento = data_pagamento,
       valor_pago = valor_pago,
       status = (valor_pago >= valor_vencimento ? 'paga' : 'parcial'),
       caixa_id = caixa_id,
       updated_by = usuario_id
   WHERE id = receita_id;
   ```

3. **Criação de Movimentação de Caixa**
   ```javascript
   INSERT INTO protese.movimentacoes_caixa (
     conta_id, tipo_movimentacao, valor, descricao,
     data_movimentacao, referencia_id, referencia_tipo, created_by
   ) VALUES (
     caixa_id, 'entrada', valor_pago,
     `Receita ${ticket_venda} - Pagamento`,
     data_pagamento, receita_id, 'receita', usuario_id
   );
   
   // Atualiza receita com ID da movimentação
   UPDATE protese.receitas 
   SET movimentacao_caixa_id = movimentacao_id 
   WHERE id = receita_id;
   ```

4. **Atualização Automática do Saldo do Caixa**
   - Trigger `protese.atualizar_saldo_conta()` atualiza automaticamente o saldo

### Listagem de Receitas (`GET /api/v1/receitas`)

**Filtros Disponíveis:**
- `data_inicio` / `data_fim` - Filtro por data de emissão
- `data_vencimento_inicio` / `data_vencimento_fim` - Filtro por data de vencimento
- `cliente_id` - Filtrar por cliente
- `status` - Filtrar por status
- `forma_pagamento` - Filtrar por forma de pagamento
- `caixa_id` - Filtrar por caixa
- `search` - Busca por ticket ou nome do cliente

---

## Sistema de Caixas

### Estrutura de Dados

#### Tabela de Contas: `protese.contas`

Representa os caixas e contas bancárias do sistema.

```sql
- id: UUID (chave primária)
- nome: VARCHAR(255) - Nome da conta/caixa (único)
- tipo: VARCHAR(50) - 'caixa', 'conta_corrente', 'poupanca', 'investimento', 'outro'
- banco: VARCHAR(255) - Nome do banco (se aplicável)
- agencia: VARCHAR(20) - Agência (se aplicável)
- conta: VARCHAR(50) - Número da conta (se aplicável)
- saldo_inicial: DECIMAL(15,2) - Saldo inicial da conta
- saldo_atual: DECIMAL(15,2) - Saldo atual (atualizado automaticamente)
- descricao: TEXT
- is_active: BOOLEAN - Se a conta está ativa
- created_at, updated_at: TIMESTAMP
- created_by, updated_by: UUID
```

#### Tabela de Movimentações: `protese.movimentacoes_caixa`

Armazena todas as movimentações financeiras das contas.

```sql
- id: UUID (chave primária)
- conta_id: UUID - Conta onde ocorreu a movimentação
- tipo_movimentacao: VARCHAR(50) - 'entrada', 'saida', 'transferencia', 'saldo_inicial'
- conta_origem_id: UUID - Conta de origem (para transferências)
- conta_destino_id: UUID - Conta de destino (para transferências)
- valor: DECIMAL(15,2) - Valor da movimentação
- descricao: TEXT - Descrição da movimentação
- categoria: VARCHAR(255) - Categoria (opcional)
- data_movimentacao: DATE - Data da movimentação
- observacoes: TEXT
- referencia_id: UUID - ID de referência (receita, despesa, etc.)
- referencia_tipo: VARCHAR(50) - Tipo de referência ('receita', 'despesa', etc.)
- created_at: TIMESTAMP
- created_by: UUID
```

### Tipos de Movimentação

#### 1. **Entrada** (`tipo_movimentacao = 'entrada'`)
- Aumenta o saldo da conta
- Exemplos:
  - Receitas pagas
  - Entradas manuais
  - Depósitos

#### 2. **Saída** (`tipo_movimentacao = 'saida'`)
- Diminui o saldo da conta
- Exemplos:
  - Despesas pagas
  - Saques manuais
  - Pagamentos diversos

#### 3. **Transferência** (`tipo_movimentacao = 'transferencia'`)
- Transfere valor entre contas
- Debita da conta origem
- Credita na conta destino
- Requer: `conta_origem_id` e `conta_destino_id`

#### 4. **Saldo Inicial** (`tipo_movimentacao = 'saldo_inicial'`)
- Usado ao criar conta com saldo inicial
- Aumenta o saldo da conta
- Não pode ser excluído

### Atualização Automática de Saldo

O sistema usa **triggers** para atualizar automaticamente o saldo das contas:

#### Trigger: `protese.atualizar_saldo_conta()`

```sql
-- Executado após INSERT em movimentacoes_caixa
CREATE TRIGGER trigger_atualizar_saldo_conta
    AFTER INSERT ON protese.movimentacoes_caixa
    FOR EACH ROW
    EXECUTE FUNCTION protese.atualizar_saldo_conta();

-- Lógica:
IF tipo_movimentacao = 'transferencia' THEN
    -- Debitar da conta origem
    UPDATE contas SET saldo_atual = saldo_atual - valor WHERE id = conta_origem_id;
    -- Creditar na conta destino
    UPDATE contas SET saldo_atual = saldo_atual + valor WHERE id = conta_id;
ELSIF tipo_movimentacao = 'entrada' OR tipo_movimentacao = 'saldo_inicial' THEN
    -- Adicionar ao saldo
    UPDATE contas SET saldo_atual = saldo_atual + valor WHERE id = conta_id;
ELSIF tipo_movimentacao = 'saida' THEN
    -- Subtrair do saldo
    UPDATE contas SET saldo_atual = saldo_atual - valor WHERE id = conta_id;
END IF;
```

#### Trigger: `protese.reverter_saldo_conta()`

```sql
-- Executado após DELETE em movimentacoes_caixa
CREATE TRIGGER trigger_reverter_saldo_conta
    AFTER DELETE ON protese.movimentacoes_caixa
    FOR EACH ROW
    EXECUTE FUNCTION protese.reverter_saldo_conta();

-- Reverte a movimentação excluída
```

### Funcionalidades de Caixas

#### 1. Listagem de Contas (`GET /api/v1/caixas/contas`)

**Filtros:**
- `tipo` - Filtrar por tipo de conta
- `is_active` - Filtrar por status ativo/inativo
- `search` - Busca por nome, banco ou conta

#### 2. Criação de Conta (`POST /api/v1/caixas/contas`)

**Processo:**
1. Cria a conta com `saldo_atual = 0`
2. Se houver `saldo_inicial > 0`, cria movimentação de `saldo_inicial`
3. Trigger atualiza automaticamente o `saldo_atual`

#### 3. Movimentações Manuais

**Entrada Manual** (`POST /api/v1/caixas/movimentacoes/entrada`)
- Cria entrada manual no caixa
- Atualiza saldo automaticamente

**Saída Manual** (`POST /api/v1/caixas/movimentacoes/saida`)
- Cria saída manual no caixa
- Atualiza saldo automaticamente

**Transferência** (`POST /api/v1/caixas/movimentacoes/transferencia`)
- Transfere valor entre contas
- Valida saldo suficiente na conta origem
- Atualiza saldo de ambas as contas

#### 4. Listagem de Movimentações (`GET /api/v1/caixas/movimentacoes`)

**Filtros:**
- `conta_id` - Filtrar por conta (inclui origem e destino)
- `tipo_movimentacao` - Filtrar por tipo
- `data_inicio` / `data_fim` - Filtrar por data

---

## Somatórias e Relatórios

### Faturamento (`GET /api/v1/faturamento/movimentacoes`)

O módulo de faturamento consolida todas as movimentações financeiras do sistema.

#### Tipos de Movimentação

1. **Vendas** (`tipo_movimentacao = 'venda'`)
   - Busca de `protese.vendas`
   - Campos: `id`, `ticket`, `data_venda`, `valor_liquido`, `status`, `forma_pagamento`, `numero_parcelas`, `cliente_nome`, `funcionario_nome`, `caixa_nome`

2. **Despesas** (`tipo_movimentacao = 'despesa'`)
   - Busca de `protese.despesas`
   - Campos similares às vendas

3. **Estoque** (`tipo_movimentacao = 'estoque'`)
   - Busca de `protese.estoque_movimentacoes`
   - Representa compras de produtos

#### Filtros Disponíveis

- `data_inicio` / `data_fim` - Período
- `tipo` - 'venda', 'despesa', 'estoque', 'all'
- `status` - Status da movimentação
- `search` - Busca por ticket, nome do cliente, funcionário, etc.

#### Somatórias por Caixa

Para calcular somatórias por caixa, o sistema utiliza:

**1. Somatória de Entradas por Caixa**
```sql
SELECT 
  ca.id as caixa_id,
  ca.nome as caixa_nome,
  SUM(m.valor) as total_entradas
FROM protese.movimentacoes_caixa m
INNER JOIN protese.contas ca ON m.conta_id = ca.id
WHERE m.tipo_movimentacao = 'entrada'
  AND m.data_movimentacao >= :data_inicio
  AND m.data_movimentacao <= :data_fim
GROUP BY ca.id, ca.nome;
```

**2. Somatória de Saídas por Caixa**
```sql
SELECT 
  ca.id as caixa_id,
  ca.nome as caixa_nome,
  SUM(m.valor) as total_saidas
FROM protese.movimentacoes_caixa m
INNER JOIN protese.contas ca ON m.conta_id = ca.id
WHERE m.tipo_movimentacao = 'saida'
  AND m.data_movimentacao >= :data_inicio
  AND m.data_movimentacao <= :data_fim
GROUP BY ca.id, ca.nome;
```

**3. Saldo Atual por Caixa**
```sql
SELECT 
  id as caixa_id,
  nome as caixa_nome,
  saldo_atual,
  saldo_inicial,
  (saldo_atual - saldo_inicial) as movimentacao_liquida
FROM protese.contas
WHERE is_active = true
ORDER BY nome;
```

**4. Somatória de Vendas por Caixa**
```sql
SELECT 
  ca.id as caixa_id,
  ca.nome as caixa_nome,
  COUNT(v.id) as total_vendas,
  SUM(v.valor_liquido) as total_valor,
  SUM(CASE WHEN v.forma_pagamento IN ('dinheiro', 'pix', 'ted', 'cartao_1x', 'boleto_1x') 
           THEN v.valor_liquido ELSE 0 END) as total_vista,
  SUM(CASE WHEN v.forma_pagamento LIKE 'cartao_%' OR v.forma_pagamento LIKE 'boleto_%'
           THEN v.valor_liquido ELSE 0 END) as total_parcelado
FROM protese.vendas v
INNER JOIN protese.contas ca ON v.caixa_id = ca.id
WHERE v.data_venda >= :data_inicio
  AND v.data_venda <= :data_fim
  AND v.status = 'paga'
GROUP BY ca.id, ca.nome;
```

**5. Somatória de Receitas por Caixa**
```sql
SELECT 
  ca.id as caixa_id,
  ca.nome as caixa_nome,
  COUNT(r.id) as total_receitas,
  SUM(r.valor_vencimento) as total_vencimento,
  SUM(r.valor_pago) as total_pago,
  SUM(CASE WHEN r.status = 'paga' THEN r.valor_pago ELSE 0 END) as total_pagas,
  SUM(CASE WHEN r.status = 'pendente' THEN r.valor_vencimento ELSE 0 END) as total_pendentes,
  SUM(CASE WHEN r.status = 'vencida' THEN r.valor_vencimento ELSE 0 END) as total_vencidas
FROM protese.receitas r
LEFT JOIN protese.contas ca ON r.caixa_id = ca.id
WHERE r.data_emissao >= :data_inicio
  AND r.data_emissao <= :data_fim
GROUP BY ca.id, ca.nome;
```

**6. Somatória por Forma de Pagamento**
```sql
SELECT 
  v.forma_pagamento,
  COUNT(v.id) as total_vendas,
  SUM(v.valor_liquido) as total_valor
FROM protese.vendas v
WHERE v.data_venda >= :data_inicio
  AND v.data_venda <= :data_fim
  AND v.status = 'paga'
GROUP BY v.forma_pagamento
ORDER BY total_valor DESC;
```

**7. Somatória de Receitas por Forma de Pagamento**
```sql
SELECT 
  r.forma_pagamento,
  COUNT(r.id) as total_receitas,
  SUM(r.valor_vencimento) as total_vencimento,
  SUM(r.valor_pago) as total_pago
FROM protese.receitas r
WHERE r.data_emissao >= :data_inicio
  AND r.data_emissao <= :data_fim
GROUP BY r.forma_pagamento
ORDER BY total_pago DESC;
```

### Relatório Consolidado por Caixa

Exemplo de query para relatório completo:

```sql
SELECT 
  ca.id as caixa_id,
  ca.nome as caixa_nome,
  ca.saldo_atual,
  
  -- Vendas
  COUNT(DISTINCT v.id) as total_vendas,
  COALESCE(SUM(v.valor_liquido), 0) as total_vendas_valor,
  
  -- Receitas
  COUNT(DISTINCT r.id) as total_receitas,
  COALESCE(SUM(r.valor_vencimento), 0) as total_receitas_vencimento,
  COALESCE(SUM(r.valor_pago), 0) as total_receitas_pagas,
  
  -- Movimentações
  COUNT(DISTINCT CASE WHEN m.tipo_movimentacao = 'entrada' THEN m.id END) as total_entradas,
  COALESCE(SUM(CASE WHEN m.tipo_movimentacao = 'entrada' THEN m.valor ELSE 0 END), 0) as total_entradas_valor,
  COUNT(DISTINCT CASE WHEN m.tipo_movimentacao = 'saida' THEN m.id END) as total_saidas,
  COALESCE(SUM(CASE WHEN m.tipo_movimentacao = 'saida' THEN m.valor ELSE 0 END), 0) as total_saidas_valor

FROM protese.contas ca
LEFT JOIN protese.vendas v ON v.caixa_id = ca.id 
  AND v.data_venda >= :data_inicio 
  AND v.data_venda <= :data_fim
LEFT JOIN protese.receitas r ON r.caixa_id = ca.id 
  AND r.data_emissao >= :data_inicio 
  AND r.data_emissao <= :data_fim
LEFT JOIN protese.movimentacoes_caixa m ON m.conta_id = ca.id 
  AND m.data_movimentacao >= :data_inicio 
  AND m.data_movimentacao <= :data_fim
WHERE ca.is_active = true
GROUP BY ca.id, ca.nome, ca.saldo_atual
ORDER BY ca.nome;
```

---

## Fluxo Completo de uma Venda

### 1. Criação da Venda

```
Cliente → Funcionário → Sistema
  ↓
Validação de Permissões
  ↓
Validação de Dados (funcionário, data, forma_pagamento, caixa)
  ↓
Cálculo de Valores Iniciais
  ↓
Verificação de Assinaturas Válidas do Cliente
  ↓
Abatimento de Serviços/Produtos das Assinaturas
  ↓
Validação de Estoque (para produtos)
  ↓
Aplicação de Cupom (se fornecido)
  ↓
Aplicação de Descontos (percentual e valor)
  ↓
Cálculo do Valor Líquido Final
  ↓
Geração de Ticket
  ↓
Inserção da Venda no Banco
  ↓
Inserção de Serviços/Produtos/Assinaturas
  ↓
Abatimento de Estoque
  ↓
Atualização de Agendamentos (se aplicável)
```

### 2. Criação de Receitas

```
Após Inserção da Venda
  ↓
Verificação da Forma de Pagamento
  ↓
┌─────────────────────────────────────┐
│ Se à Vista (dinheiro, pix, ted,     │
│ cartao_1x, boleto_1x):              │
│  → Cria 1 receita com status 'paga'│
│  → Cria movimentação de caixa      │
└─────────────────────────────────────┘
  ↓
┌─────────────────────────────────────┐
│ Se Parcelado (cartao_Nx, boleto_Nx,│
│ N > 1):                             │
│  → Cria N receitas                  │
│  → Primeira: status 'paga'          │
│  → Demais: status 'pendente'        │
│  → Cria movimentação apenas para   │
│    primeira parcela                 │
└─────────────────────────────────────┘
  ↓
Atualização Automática do Saldo do Caixa
```

### 3. Efetivação de Pagamento de Receita Pendente

```
Usuário → Sistema (efetivar pagamento)
  ↓
Validação de Permissões
  ↓
Busca da Receita
  ↓
Atualização da Receita:
  - data_pagamento = data fornecida
  - valor_pago = valor fornecido
  - status = 'paga' ou 'parcial'
  - caixa_id = caixa selecionado
  ↓
Criação de Movimentação de Caixa:
  - tipo_movimentacao = 'entrada'
  - valor = valor_pago
  - referencia_id = receita_id
  - referencia_tipo = 'receita'
  ↓
Atualização da Receita com movimentacao_caixa_id
  ↓
Atualização Automática do Saldo do Caixa (via trigger)
```

### 4. Exclusão de Venda

```
Usuário → Sistema (excluir venda)
  ↓
Validação de Permissões
  ↓
Busca da Venda e Produtos
  ↓
Reversão de Estoque (produtos voltam ao estoque)
  ↓
Busca de Receitas Vinculadas
  ↓
Exclusão de Movimentações de Caixa Vinculadas
  ↓
Exclusão de Assinaturas Clientes Vinculadas
  ↓
Exclusão de Cupons Usados
  ↓
Exclusão de Relacionamentos CRM
  ↓
Exclusão de Notas Fiscais
  ↓
Exclusão de Receitas
  ↓
Exclusão da Venda (CASCADE exclui serviços/produtos/assinaturas)
```

---

## Observações Importantes

### 1. Integridade Referencial

- Vendas estão vinculadas a caixas (`caixa_id`)
- Receitas estão vinculadas a vendas (`venda_id`) e caixas (`caixa_id`)
- Movimentações estão vinculadas a contas (`conta_id`) e receitas (`referencia_id`)
- Exclusão de venda em CASCADE exclui receitas e movimentações relacionadas

### 2. Atualização Automática de Saldos

- Saldos são atualizados automaticamente via triggers
- Não é necessário atualizar manualmente
- Exclusão de movimentação reverte o saldo automaticamente

### 3. Formas de Pagamento

- Formato: `{tipo}_{parcelas}x` (ex: `cartao_3x`, `boleto_2x`)
- À vista: `dinheiro`, `pix`, `ted`, `cartao_1x`, `boleto_1x`
- Parcelado: `cartao_Nx`, `boleto_Nx` (N > 1)

### 4. Status de Vendas e Receitas

- **Vendas**: `pendente`, `paga`, `cancelada`, `parcial`
- **Receitas**: `pendente`, `paga`, `vencida`, `cancelada`, `parcial`
- Status são atualizados automaticamente por triggers

### 5. Tickets

- Formato: `0001`, `0002`, etc. (4 dígitos)
- Parcelas: `0001/01`, `0001/02`, etc.
- Gerados automaticamente pela função `protese.gerar_proximo_ticket_venda()`

### 6. Assinaturas

- Serviços/produtos de assinaturas válidas são abatidos automaticamente
- Não geram receitas (já foram pagos na compra da assinatura)
- Quantidades restantes são atualizadas automaticamente

---

## Arquivos Relacionados

### Backend
- `backend/routes/vendas.js` - Rotas de vendas
- `backend/routes/receitas.js` - Rotas de receitas
- `backend/routes/caixas.js` - Rotas de caixas
- `backend/routes/faturamento.js` - Rotas de faturamento

### SQL
- `COMANDOS_CRIAR_TABELA_VENDAS.sql` - Estrutura da tabela de vendas
- `COMANDOS_CRIAR_TABELA_RECEITAS.sql` - Estrutura da tabela de receitas
- `COMANDOS_CRIAR_TABELA_CAIXAS.sql` - Estrutura das tabelas de caixas

---

**Última atualização:** 2024
**Versão do Sistema:** Barbearia Premium

