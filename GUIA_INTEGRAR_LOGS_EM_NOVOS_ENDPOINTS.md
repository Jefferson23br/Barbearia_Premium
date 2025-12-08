# 📋 Guia Completo: Integrar Logs em Novos Endpoints

Este guia mostra como integrar o sistema de logs em **TODOS** os endpoints que criam, editam ou excluem dados (vendas, agendas, marcações, etc.).

---

## 🎯 Regra de Ouro

**SEMPRE adicione logs em:**
- ✅ `POST` (criar)
- ✅ `PUT` / `PATCH` (editar)
- ✅ `DELETE` (excluir)

**NÃO precisa adicionar logs em:**
- ❌ `GET` (apenas leitura)

---

## 📝 Passo a Passo

### 1. Importar o Logger (já está no server.js)

```javascript
const { registrarLog, getClientIp, getUserAgent } = require('./utils/logger');
```

### 2. Padrão para POST (Criar)

```javascript
app.post('/api/v1/vendas', async (req, res) => {
  try {
    // ... validações e lógica de criação ...
    
    const result = await pool.query(
      `INSERT INTO protese.vendas (...) VALUES (...) RETURNING id, ...`,
      [...]
    );
    
    const novaVenda = result.rows[0];

    // ✅ ADICIONAR LOG AQUI
    const usuarioId = req.headers['x-user-id'] || null;
    const usuarioTipo = req.headers['x-user-tipo'] || 'administrativo';
    if (usuarioId) {
      await registrarLog({
        usuarioId,
        usuarioTipo,
        acao: 'criar',
        modulo: 'venda', // ou 'agenda', 'marcacao', etc.
        entidadeId: novaVenda.id,
        entidadeTipo: 'venda',
        descricao: `Venda de R$ ${novaVenda.valor} criada para cliente ${novaVenda.cliente_nome}`,
        dadosNovos: {
          valor: novaVenda.valor,
          cliente_id: novaVenda.cliente_id,
          data: novaVenda.data,
        },
        ipAddress: getClientIp(req),
        userAgent: getUserAgent(req),
      });
    }

    res.status(201).json({
      message: 'Venda criada com sucesso!',
      venda: novaVenda,
    });
  } catch (error) {
    // ... tratamento de erro ...
  }
});
```

### 3. Padrão para PUT (Editar)

```javascript
app.put('/api/v1/vendas/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // ✅ BUSCAR DADOS ANTERIORES (para log)
    const vendaAnterior = await pool.query(
      'SELECT valor, cliente_id, data FROM protese.vendas WHERE id = $1',
      [id]
    );
    const dadosAnteriores = vendaAnterior.rows[0] || {};

    // ... validações e lógica de atualização ...
    
    const result = await pool.query(
      `UPDATE protese.vendas SET ... WHERE id = $1 RETURNING id, ...`,
      [...]
    );
    
    const vendaAtualizada = result.rows[0];

    // ✅ ADICIONAR LOG AQUI
    const usuarioId = req.headers['x-user-id'] || null;
    const usuarioTipo = req.headers['x-user-tipo'] || 'administrativo';
    if (usuarioId) {
      await registrarLog({
        usuarioId,
        usuarioTipo,
        acao: 'editar',
        modulo: 'venda',
        entidadeId: id,
        entidadeTipo: 'venda',
        descricao: `Venda ${id} atualizada`,
        dadosAnteriores: {
          valor: dadosAnteriores.valor,
          cliente_id: dadosAnteriores.cliente_id,
        },
        dadosNovos: {
          valor: vendaAtualizada.valor,
          cliente_id: vendaAtualizada.cliente_id,
        },
        ipAddress: getClientIp(req),
        userAgent: getUserAgent(req),
      });
    }

    res.json({
      message: 'Venda atualizada com sucesso!',
      venda: vendaAtualizada,
    });
  } catch (error) {
    // ... tratamento de erro ...
  }
});
```

### 4. Padrão para DELETE (Excluir)

```javascript
app.delete('/api/v1/vendas/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // ✅ BUSCAR DADOS ANTES DE DELETAR (para log)
    const vendaCompleta = await pool.query(
      'SELECT id, valor, cliente_id, data FROM protese.vendas WHERE id = $1',
      [id]
    );
    
    if (vendaCompleta.rows.length === 0) {
      return res.status(404).json({ error: 'Venda não encontrada' });
    }
    
    const dadosVenda = vendaCompleta.rows[0];

    // Deletar do banco
    await pool.query('DELETE FROM protese.vendas WHERE id = $1', [id]);

    // ✅ ADICIONAR LOG AQUI
    const usuarioId = req.headers['x-user-id'] || null;
    const usuarioTipo = req.headers['x-user-tipo'] || 'administrativo';
    if (usuarioId) {
      await registrarLog({
        usuarioId,
        usuarioTipo,
        acao: 'excluir',
        modulo: 'venda',
        entidadeId: id,
        entidadeTipo: 'venda',
        descricao: `Venda de R$ ${dadosVenda.valor} excluída`,
        dadosAnteriores: {
          valor: dadosVenda.valor,
          cliente_id: dadosVenda.cliente_id,
          data: dadosVenda.data,
        },
        ipAddress: getClientIp(req),
        userAgent: getUserAgent(req),
      });
    }

    res.json({
      message: 'Venda excluída com sucesso!',
    });
  } catch (error) {
    // ... tratamento de erro ...
  }
});
```

---

## 🎨 Exemplos por Módulo

### Vendas (`modulo: 'venda'`)

```javascript
// POST /api/v1/vendas
await registrarLog({
  usuarioId,
  usuarioTipo,
  acao: 'criar',
  modulo: 'venda',
  entidadeId: novaVenda.id,
  entidadeTipo: 'venda',
  descricao: `Venda de R$ ${novaVenda.valor} criada`,
  dadosNovos: { valor: novaVenda.valor, cliente_id: novaVenda.cliente_id },
  ipAddress: getClientIp(req),
  userAgent: getUserAgent(req),
});
```

### Agendas (`modulo: 'agenda'`)

```javascript
// POST /api/v1/agendas
await registrarLog({
  usuarioId,
  usuarioTipo,
  acao: 'criar',
  modulo: 'agenda',
  entidadeId: novoAgendamento.id,
  entidadeTipo: 'agendamento',
  descricao: `Agendamento para ${novoAgendamento.data_hora} criado`,
  dadosNovos: { 
    data_hora: novoAgendamento.data_hora,
    cliente_id: novoAgendamento.cliente_id,
    servico: novoAgendamento.servico,
  },
  ipAddress: getClientIp(req),
  userAgent: getUserAgent(req),
});
```

### Marcações (`modulo: 'marcacao'`)

```javascript
// POST /api/v1/marcacoes
await registrarLog({
  usuarioId,
  usuarioTipo,
  acao: 'criar',
  modulo: 'marcacao',
  entidadeId: novaMarcacao.id,
  entidadeTipo: 'marcacao',
  descricao: `Marcação para ${novaMarcacao.data} criada`,
  dadosNovos: { 
    data: novaMarcacao.data,
    cliente_id: novaMarcacao.cliente_id,
  },
  ipAddress: getClientIp(req),
  userAgent: getUserAgent(req),
});
```

### Despesas (`modulo: 'despesa'`)

```javascript
// POST /api/v1/despesas
await registrarLog({
  usuarioId,
  usuarioTipo,
  acao: 'criar',
  modulo: 'despesa',
  entidadeId: novaDespesa.id,
  entidadeTipo: 'despesa',
  descricao: `Despesa de R$ ${novaDespesa.valor} criada`,
  dadosNovos: { 
    valor: novaDespesa.valor,
    categoria: novaDespesa.categoria,
  },
  ipAddress: getClientIp(req),
  userAgent: getUserAgent(req),
});
```

---

## 🔧 Helper Function (Opcional)

Se quiser simplificar ainda mais, você pode criar uma função helper:

```javascript
// No server.js, após as importações
async function registrarLogAcao(req, acao, modulo, entidadeId, entidadeTipo, descricao, dadosAnteriores = null, dadosNovos = null) {
  const usuarioId = req.headers['x-user-id'] || null;
  const usuarioTipo = req.headers['x-user-tipo'] || 'administrativo';
  
  if (usuarioId) {
    await registrarLog({
      usuarioId,
      usuarioTipo,
      acao,
      modulo,
      entidadeId,
      entidadeTipo,
      descricao,
      dadosAnteriores,
      dadosNovos,
      ipAddress: getClientIp(req),
      userAgent: getUserAgent(req),
    });
  }
}

// Uso simplificado:
await registrarLogAcao(
  req,
  'criar',
  'venda',
  novaVenda.id,
  'venda',
  `Venda de R$ ${novaVenda.valor} criada`,
  null,
  { valor: novaVenda.valor, cliente_id: novaVenda.cliente_id }
);
```

---

## ✅ Checklist de Integração

Ao criar um novo endpoint que modifica dados:

- [ ] Importei `registrarLog`, `getClientIp`, `getUserAgent`?
- [ ] Adicionei log após operação bem-sucedida?
- [ ] Para PUT: busquei dados anteriores antes de atualizar?
- [ ] Para DELETE: busquei dados completos antes de deletar?
- [ ] Usei `req.headers['x-user-id']` e `req.headers['x-user-tipo']`?
- [ ] Defini `modulo` e `entidadeTipo` corretamente?
- [ ] Adicionei `descricao` descritiva?
- [ ] Incluí dados relevantes em `dadosNovos` (e `dadosAnteriores` para edições)?

---

## 📌 Notas Importantes

1. **Headers do Frontend**: Certifique-se de que o frontend está enviando `x-user-id` e `x-user-tipo` em todas as requisições que modificam dados.

2. **Não bloquear operação**: O log nunca deve bloquear a operação principal. Se o log falhar, a operação deve continuar normalmente.

3. **Dados sensíveis**: Evite registrar senhas, tokens ou dados muito sensíveis nos logs.

4. **Performance**: O log é assíncrono e não deve impactar significativamente a performance.

---

## 🚀 Próximos Passos

Quando implementar novos módulos (vendas, agendas, marcações):

1. Siga este guia para cada endpoint POST/PUT/DELETE
2. Use os exemplos acima como referência
3. Teste criando/editando/excluindo registros
4. Verifique os logs na página "Controle de Logs" do painel admin

---

**Última atualização**: Dezembro 2024

