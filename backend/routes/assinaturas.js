const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { registrarLog, getClientIp, getUserAgent } = require('../utils/logger');

/**
 * GET /api/v1/assinaturas
 * Lista todas as assinaturas
 */
router.get('/', async (req, res) => {
  try {
    const usuarioId = req.headers['x-user-id'];
    const usuarioTipo = req.headers['x-user-tipo'] || 'administrativo';

    // Verificar permissão de visualização
    if (usuarioTipo !== 'master') {
      const permissoesResult = await pool.query(
        'SELECT assinaturas_ver FROM permissoes_usuarios WHERE usuario_id = $1',
        [usuarioId]
      );

      if (permissoesResult.rows.length === 0 || !permissoesResult.rows[0].assinaturas_ver) {
        return res.status(403).json({ error: 'Acesso negado. Permissão insuficiente.' });
      }
    }

    const { is_active, search } = req.query;
    let query = 'SELECT * FROM assinaturas WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    if (is_active !== undefined) {
      query += ` AND is_active = $${paramIndex}`;
      params.push(is_active === 'true');
      paramIndex++;
    }

    if (search) {
      query += ` AND (nome LIKE $${paramIndex} OR descricao LIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    query += ' ORDER BY nome ASC';

    const result = await pool.query(query, params);

    // Buscar serviços e produtos de cada assinatura
    const assinaturasComDetalhes = await Promise.all(result.rows.map(async (assinatura) => {
      const servicosResult = await pool.query(
        `SELECT 
          aserv.*,
          s.nome as servico_nome,
          s.preco as servico_preco
         FROM assinaturas_servicos aserv
         INNER JOIN servicos s ON aserv.servico_id = s.id
         WHERE aserv.assinatura_id = $1`,
        [assinatura.id]
      );

      const produtosResult = await pool.query(
        `SELECT 
          aprod.*,
          p.descricao as produto_descricao,
          p.codigo as produto_codigo,
          p.preco_venda as produto_preco
         FROM assinaturas_produtos aprod
         INNER JOIN produtos p ON aprod.produto_id = p.id
         WHERE aprod.assinatura_id = $1`,
        [assinatura.id]
      );

      return {
        ...assinatura,
        servicos: servicosResult.rows,
        produtos: produtosResult.rows
      };
    }));

    res.json({
      assinaturas: assinaturasComDetalhes,
    });
  } catch (error) {
    console.error('Erro ao buscar assinaturas:', error);
    res.status(500).json({
      error: 'Erro ao buscar assinaturas',
      message: error.message,
    });
  }
});

/**
 * GET /api/v1/assinaturas/:id
 * Busca uma assinatura por ID
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const usuarioId = req.headers['x-user-id'];
    const usuarioTipo = req.headers['x-user-tipo'] || 'administrativo';

    // Verificar permissão de visualização
    if (usuarioTipo !== 'master') {
      const permissoesResult = await pool.query(
        'SELECT assinaturas_ver FROM permissoes_usuarios WHERE usuario_id = $1',
        [usuarioId]
      );

      if (permissoesResult.rows.length === 0 || !permissoesResult.rows[0].assinaturas_ver) {
        return res.status(403).json({ error: 'Acesso negado. Permissão insuficiente.' });
      }
    }

    const result = await pool.query(
      'SELECT * FROM assinaturas WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Assinatura não encontrada' });
    }

    const assinatura = result.rows[0];

    // Buscar serviços e produtos
    const servicosResult = await pool.query(
      `SELECT 
        aserv.*,
        s.nome as servico_nome,
        s.preco as servico_preco
       FROM assinaturas_servicos aserv
       INNER JOIN servicos s ON aserv.servico_id = s.id
       WHERE aserv.assinatura_id = $1`,
      [assinatura.id]
    );

    const produtosResult = await pool.query(
      `SELECT 
        aprod.*,
        p.descricao as produto_descricao,
        p.codigo as produto_codigo,
        p.preco_venda as produto_preco
       FROM assinaturas_produtos aprod
       INNER JOIN produtos p ON aprod.produto_id = p.id
       WHERE aprod.assinatura_id = $1`,
      [assinatura.id]
    );

    res.json({
      assinatura: {
        ...assinatura,
        servicos: servicosResult.rows,
        produtos: produtosResult.rows
      },
    });
  } catch (error) {
    console.error('Erro ao buscar assinatura:', error);
    res.status(500).json({
      error: 'Erro ao buscar assinatura',
      message: error.message,
    });
  }
});

/**
 * POST /api/v1/assinaturas
 * Cria uma nova assinatura
 */
router.post('/', async (req, res) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const usuarioId = req.headers['x-user-id'];
    const usuarioTipo = req.headers['x-user-tipo'] || 'administrativo';
    const usuarioNome = req.headers['x-user-nome'] || null;

    // Verificar permissão de edição
    if (usuarioTipo !== 'master') {
      const permissoesResult = await client.query(
        'SELECT assinaturas_editar FROM permissoes_usuarios WHERE usuario_id = $1',
        [usuarioId]
      );

      if (permissoesResult.rows.length === 0 || !permissoesResult.rows[0].assinaturas_editar) {
        await client.query('ROLLBACK');
        return res.status(403).json({ error: 'Acesso negado. Permissão insuficiente.' });
      }
    }

    const {
      nome,
      descricao,
      servicos,
      produtos,
      valor_comercializado,
      desconto_percentual,
      desconto_valor,
      validade_em_dias,
      is_active = true,
    } = req.body;

    // Validações
    if (!nome) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        error: 'Campo obrigatório: nome',
      });
    }

    if ((!servicos || servicos.length === 0) && (!produtos || produtos.length === 0)) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        error: 'É necessário pelo menos um serviço ou produto',
      });
    }

    // Calcular preço total (soma dos serviços e produtos)
    let precoTotal = 0;

    if (servicos && servicos.length > 0) {
      for (const servico of servicos) {
        if (!servico.servico_id || !servico.quantidade) {
          await client.query('ROLLBACK');
          return res.status(400).json({ error: 'Serviços devem ter ID e quantidade' });
        }

        // Buscar preço do serviço
        const servicoCheck = await client.query(
          'SELECT preco FROM servicos WHERE id = $1',
          [servico.servico_id]
        );

        if (servicoCheck.rows.length === 0) {
          await client.query('ROLLBACK');
          return res.status(400).json({ error: `Serviço não encontrado` });
        }

        const precoServico = parseFloat(servicoCheck.rows[0].preco);
        const quantidade = parseInt(servico.quantidade);
        precoTotal += precoServico * quantidade;
      }
    }

    if (produtos && produtos.length > 0) {
      for (const produto of produtos) {
        if (!produto.produto_id || !produto.quantidade) {
          await client.query('ROLLBACK');
          return res.status(400).json({ error: 'Produtos devem ter ID e quantidade' });
        }

        // Buscar preço do produto
        const produtoCheck = await client.query(
          'SELECT preco_venda FROM produtos WHERE id = $1',
          [produto.produto_id]
        );

        if (produtoCheck.rows.length === 0) {
          await client.query('ROLLBACK');
          return res.status(400).json({ error: `Produto não encontrado` });
        }

        const precoProduto = parseFloat(produtoCheck.rows[0].preco_venda);
        const quantidade = parseInt(produto.quantidade);
        precoTotal += precoProduto * quantidade;
      }
    }

    // Valor comercializado (padrão: preço total se não informado)
    const valorComercializadoNumber = valor_comercializado !== undefined 
      ? parseFloat(valor_comercializado) 
      : precoTotal;

    // Calcular descontos
    const descontoPercentualValue = parseFloat(desconto_percentual) || 0;
    const descontoValorValue = parseFloat(desconto_valor) || 0;

    const descontoPorPercentual = valorComercializadoNumber * (descontoPercentualValue / 100);
    const valorLiquido = valorComercializadoNumber - descontoPorPercentual - descontoValorValue;

    if (valorLiquido < 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Valor líquido não pode ser negativo' });
    }

    // Validar validade_em_dias
    const validadeEmDiasNumber = validade_em_dias ? parseInt(validade_em_dias) : 30;
    if (isNaN(validadeEmDiasNumber) || validadeEmDiasNumber <= 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Validade em dias deve ser um número positivo' });
    }

    // Inserir assinatura
    const result = await client.query(
      `INSERT INTO assinaturas (
        nome, descricao, preco_total, valor_comercializado, desconto_percentual, 
        desconto_valor, valor_liquido, validade_em_dias, is_active, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *`,
      [
        nome,
        descricao || null,
        precoTotal,
        valorComercializadoNumber,
        descontoPercentualValue,
        descontoValorValue,
        valorLiquido,
        validadeEmDiasNumber,
        is_active,
        usuarioId
      ]
    );

    const novaAssinatura = result.rows[0];

    // Inserir serviços
    if (servicos && servicos.length > 0) {
      for (const servico of servicos) {
        const quantidadeServico = parseInt(servico.quantidade);
        const updateServicoResult = await client.query(
          `UPDATE assinaturas_servicos
           SET quantidade = $3
           WHERE assinatura_id = $1 AND servico_id = $2`,
          [novaAssinatura.id, servico.servico_id, quantidadeServico]
        );

        if ((updateServicoResult.rowCount || 0) === 0) {
          await client.query(
            `INSERT INTO assinaturas_servicos (assinatura_id, servico_id, quantidade)
             VALUES ($1, $2, $3)`,
            [novaAssinatura.id, servico.servico_id, quantidadeServico]
          );
        }
      }
    }

    // Inserir produtos
    if (produtos && produtos.length > 0) {
      for (const produto of produtos) {
        const quantidadeProduto = parseInt(produto.quantidade);
        const updateProdutoResult = await client.query(
          `UPDATE assinaturas_produtos
           SET quantidade = $3
           WHERE assinatura_id = $1 AND produto_id = $2`,
          [novaAssinatura.id, produto.produto_id, quantidadeProduto]
        );

        if ((updateProdutoResult.rowCount || 0) === 0) {
          await client.query(
            `INSERT INTO assinaturas_produtos (assinatura_id, produto_id, quantidade)
             VALUES ($1, $2, $3)`,
            [novaAssinatura.id, produto.produto_id, quantidadeProduto]
          );
        }
      }
    }

    await client.query('COMMIT');

    // Buscar assinatura completa para retornar
    const assinaturaCompletaResult = await pool.query(
      'SELECT * FROM assinaturas WHERE id = $1',
      [novaAssinatura.id]
    );

    const servicosResult = await pool.query(
      `SELECT 
        aserv.*,
        s.nome as servico_nome,
        s.preco as servico_preco
       FROM assinaturas_servicos aserv
       INNER JOIN servicos s ON aserv.servico_id = s.id
       WHERE aserv.assinatura_id = $1`,
      [novaAssinatura.id]
    );

    const produtosResult = await pool.query(
      `SELECT 
        aprod.*,
        p.descricao as produto_descricao,
        p.codigo as produto_codigo,
        p.preco_venda as produto_preco
       FROM assinaturas_produtos aprod
       INNER JOIN produtos p ON aprod.produto_id = p.id
       WHERE aprod.assinatura_id = $1`,
      [novaAssinatura.id]
    );

    // Registrar log
    if (usuarioId) {
      try {
        await registrarLog({
          usuarioId,
          usuarioTipo,
          usuarioNome,
          acao: 'criar',
          modulo: 'assinatura',
          entidadeId: novaAssinatura.id,
          entidadeTipo: 'assinatura',
          descricao: `Assinatura ${nome} criada - R$ ${valorLiquido.toFixed(2)}`,
          dadosNovos: {
            nome,
            descricao,
            preco_total: precoTotal,
            valor_comercializado: valorComercializadoNumber,
            valor_liquido: valorLiquido
          },
          ipAddress: getClientIp(req),
          userAgent: getUserAgent(req),
        });
      } catch (logError) {
        console.error('Erro ao registrar log:', logError);
      }
    }

    res.status(201).json({
      message: 'Assinatura criada com sucesso!',
      assinatura: {
        ...assinaturaCompletaResult.rows[0],
        servicos: servicosResult.rows,
        produtos: produtosResult.rows
      },
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Erro ao criar assinatura:', error);
    res.status(500).json({
      error: 'Erro ao criar assinatura',
      message: error.message,
    });
  } finally {
    client.release();
  }
});

/**
 * PUT /api/v1/assinaturas/:id
 * Atualiza uma assinatura
 */
router.put('/:id', async (req, res) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const { id } = req.params;
    const usuarioId = req.headers['x-user-id'];
    const usuarioTipo = req.headers['x-user-tipo'] || 'administrativo';
    const usuarioNome = req.headers['x-user-nome'] || null;

    // Verificar permissão de edição
    if (usuarioTipo !== 'master') {
      const permissoesResult = await client.query(
        'SELECT assinaturas_editar FROM permissoes_usuarios WHERE usuario_id = $1',
        [usuarioId]
      );

      if (permissoesResult.rows.length === 0 || !permissoesResult.rows[0].assinaturas_editar) {
        await client.query('ROLLBACK');
        return res.status(403).json({ error: 'Acesso negado. Permissão insuficiente.' });
      }
    }

    // Buscar assinatura atual
    const assinaturaAtual = await client.query(
      'SELECT * FROM assinaturas WHERE id = $1',
      [id]
    );

    if (assinaturaAtual.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Assinatura não encontrada' });
    }

    const {
      nome,
      descricao,
      servicos,
      produtos,
      valor_comercializado,
      desconto_percentual,
      desconto_valor,
      is_active,
    } = req.body;

    // Calcular preço total se serviços ou produtos foram fornecidos
    let precoTotal = assinaturaAtual.rows[0].preco_total;

    if (servicos || produtos) {
      precoTotal = 0;

      // Recalcular baseado nos serviços fornecidos ou existentes
      const servicosParaCalcular = servicos || [];
      if (servicosParaCalcular.length === 0 && !produtos) {
        // Se não foram fornecidos novos serviços nem produtos, usar os existentes
        const servicosExistentes = await client.query(
          'SELECT servico_id, quantidade FROM assinaturas_servicos WHERE assinatura_id = $1',
          [id]
        );
        
        for (const servico of servicosExistentes.rows) {
          const servicoCheck = await client.query(
            'SELECT preco FROM servicos WHERE id = $1',
            [servico.servico_id]
          );
          if (servicoCheck.rows.length > 0) {
            precoTotal += parseFloat(servicoCheck.rows[0].preco) * parseInt(servico.quantidade);
          }
        }
      } else {
        for (const servico of servicosParaCalcular) {
          if (!servico.servico_id || !servico.quantidade) {
            await client.query('ROLLBACK');
            return res.status(400).json({ error: 'Serviços devem ter ID e quantidade' });
          }

          const servicoCheck = await client.query(
            'SELECT preco FROM servicos WHERE id = $1',
            [servico.servico_id]
          );

          if (servicoCheck.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(400).json({ error: `Serviço não encontrado` });
          }

          const precoServico = parseFloat(servicoCheck.rows[0].preco);
          const quantidade = parseInt(servico.quantidade);
          precoTotal += precoServico * quantidade;
        }
      }

      // Recalcular baseado nos produtos fornecidos ou existentes
      const produtosParaCalcular = produtos || [];
      if (produtosParaCalcular.length === 0 && !servicos) {
        // Se não foram fornecidos novos produtos nem serviços, usar os existentes
        const produtosExistentes = await client.query(
          'SELECT produto_id, quantidade FROM assinaturas_produtos WHERE assinatura_id = $1',
          [id]
        );
        
        for (const produto of produtosExistentes.rows) {
          const produtoCheck = await client.query(
            'SELECT preco_venda FROM produtos WHERE id = $1',
            [produto.produto_id]
          );
          if (produtoCheck.rows.length > 0) {
            precoTotal += parseFloat(produtoCheck.rows[0].preco_venda) * parseInt(produto.quantidade);
          }
        }
      } else {
        for (const produto of produtosParaCalcular) {
          if (!produto.produto_id || !produto.quantidade) {
            await client.query('ROLLBACK');
            return res.status(400).json({ error: 'Produtos devem ter ID e quantidade' });
          }

          const produtoCheck = await client.query(
            'SELECT preco_venda FROM produtos WHERE id = $1',
            [produto.produto_id]
          );

          if (produtoCheck.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(400).json({ error: `Produto não encontrado` });
          }

          const precoProduto = parseFloat(produtoCheck.rows[0].preco_venda);
          const quantidade = parseInt(produto.quantidade);
          precoTotal += precoProduto * quantidade;
        }
      }
    }

    // Valor comercializado
    const valorComercializadoNumber = valor_comercializado !== undefined 
      ? parseFloat(valor_comercializado) 
      : assinaturaAtual.rows[0].valor_comercializado;

    // Calcular descontos
    const descontoPercentualValue = desconto_percentual !== undefined 
      ? parseFloat(desconto_percentual) 
      : assinaturaAtual.rows[0].desconto_percentual;
    const descontoValorValue = desconto_valor !== undefined 
      ? parseFloat(desconto_valor) 
      : assinaturaAtual.rows[0].desconto_valor;

    const descontoPorPercentual = valorComercializadoNumber * (descontoPercentualValue / 100);
    const valorLiquido = valorComercializadoNumber - descontoPorPercentual - descontoValorValue;

    if (valorLiquido < 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Valor líquido não pode ser negativo' });
    }

    // Atualizar assinatura
    const updateFields = [];
    const params = [];
    let paramIndex = 1;

    if (nome !== undefined) {
      updateFields.push(`nome = $${paramIndex}`);
      params.push(nome);
      paramIndex++;
    }

    if (descricao !== undefined) {
      updateFields.push(`descricao = $${paramIndex}`);
      params.push(descricao);
      paramIndex++;
    }

    if (servicos || produtos) {
      updateFields.push(`preco_total = $${paramIndex}`);
      params.push(precoTotal);
      paramIndex++;
    }

    if (valor_comercializado !== undefined) {
      updateFields.push(`valor_comercializado = $${paramIndex}`);
      params.push(valorComercializadoNumber);
      paramIndex++;
    }

    if (desconto_percentual !== undefined) {
      updateFields.push(`desconto_percentual = $${paramIndex}`);
      params.push(descontoPercentualValue);
      paramIndex++;
    }

    if (desconto_valor !== undefined) {
      updateFields.push(`desconto_valor = $${paramIndex}`);
      params.push(descontoValorValue);
      paramIndex++;
    }

    // Sempre atualizar valor_liquido
    updateFields.push(`valor_liquido = $${paramIndex}`);
    params.push(valorLiquido);
    paramIndex++;

    if (validade_em_dias !== undefined) {
      const validadeEmDiasNumber = parseInt(validade_em_dias);
      if (isNaN(validadeEmDiasNumber) || validadeEmDiasNumber <= 0) {
        await client.query('ROLLBACK');
        return res.status(400).json({ error: 'Validade em dias deve ser um número positivo' });
      }
      updateFields.push(`validade_em_dias = $${paramIndex}`);
      params.push(validadeEmDiasNumber);
      paramIndex++;
    }

    if (is_active !== undefined) {
      updateFields.push(`is_active = $${paramIndex}`);
      params.push(is_active);
      paramIndex++;
    }

    updateFields.push(`updated_by = $${paramIndex}`);
    params.push(usuarioId);
    paramIndex++;

    params.push(id);

    const query = `UPDATE assinaturas SET ${updateFields.join(', ')} WHERE id = $${paramIndex} RETURNING *`;
    const result = await client.query(query, params);

    const assinaturaAtualizada = result.rows[0];

    // Atualizar serviços se fornecidos
    if (servicos) {
      // Deletar serviços existentes
      await client.query('DELETE FROM assinaturas_servicos WHERE assinatura_id = $1', [id]);

      // Inserir novos serviços
      for (const servico of servicos) {
        await client.query(
          `INSERT INTO assinaturas_servicos (assinatura_id, servico_id, quantidade)
           VALUES ($1, $2, $3)`,
          [id, servico.servico_id, parseInt(servico.quantidade)]
        );
      }
    }

    // Atualizar produtos se fornecidos
    if (produtos) {
      // Deletar produtos existentes
      await client.query('DELETE FROM assinaturas_produtos WHERE assinatura_id = $1', [id]);

      // Inserir novos produtos
      for (const produto of produtos) {
        await client.query(
          `INSERT INTO assinaturas_produtos (assinatura_id, produto_id, quantidade)
           VALUES ($1, $2, $3)`,
          [id, produto.produto_id, parseInt(produto.quantidade)]
        );
      }
    }

    await client.query('COMMIT');

    // Buscar assinatura completa para retornar
    const assinaturaCompletaResult = await pool.query(
      'SELECT * FROM assinaturas WHERE id = $1',
      [id]
    );

    const servicosResult = await pool.query(
      `SELECT 
        aserv.*,
        s.nome as servico_nome,
        s.preco as servico_preco
       FROM assinaturas_servicos aserv
       INNER JOIN servicos s ON aserv.servico_id = s.id
       WHERE aserv.assinatura_id = $1`,
      [id]
    );

    const produtosResult = await pool.query(
      `SELECT 
        aprod.*,
        p.descricao as produto_descricao,
        p.codigo as produto_codigo,
        p.preco_venda as produto_preco
       FROM assinaturas_produtos aprod
       INNER JOIN produtos p ON aprod.produto_id = p.id
       WHERE aprod.assinatura_id = $1`,
      [id]
    );

    // Registrar log
    if (usuarioId) {
      try {
        await registrarLog({
          usuarioId,
          usuarioTipo,
          usuarioNome,
          acao: 'editar',
          modulo: 'assinatura',
          entidadeId: id,
          entidadeTipo: 'assinatura',
          descricao: `Assinatura ${nome || assinaturaAtualizada.nome} atualizada`,
          dadosAnteriores: assinaturaAtual.rows[0],
          dadosNovos: assinaturaAtualizada,
          ipAddress: getClientIp(req),
          userAgent: getUserAgent(req),
        });
      } catch (logError) {
        console.error('Erro ao registrar log:', logError);
      }
    }

    res.json({
      message: 'Assinatura atualizada com sucesso!',
      assinatura: {
        ...assinaturaCompletaResult.rows[0],
        servicos: servicosResult.rows,
        produtos: produtosResult.rows
      },
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Erro ao atualizar assinatura:', error);
    res.status(500).json({
      error: 'Erro ao atualizar assinatura',
      message: error.message,
    });
  } finally {
    client.release();
  }
});

/**
 * DELETE /api/v1/assinaturas/:id
 * Exclui uma assinatura
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const usuarioId = req.headers['x-user-id'];
    const usuarioTipo = req.headers['x-user-tipo'] || 'administrativo';
    const usuarioNome = req.headers['x-user-nome'] || null;

    // Verificar permissão de exclusão
    if (usuarioTipo !== 'master') {
      const permissoesResult = await pool.query(
        'SELECT assinaturas_excluir FROM permissoes_usuarios WHERE usuario_id = $1',
        [usuarioId]
      );

      if (permissoesResult.rows.length === 0 || !permissoesResult.rows[0].assinaturas_excluir) {
        return res.status(403).json({ error: 'Acesso negado. Permissão insuficiente.' });
      }
    }

    // Buscar assinatura para log
    const assinatura = await pool.query(
      'SELECT * FROM assinaturas WHERE id = $1',
      [id]
    );

    if (assinatura.rows.length === 0) {
      return res.status(404).json({ error: 'Assinatura não encontrada' });
    }

    // Excluir assinatura (cascade vai excluir serviços e produtos)
    await pool.query('DELETE FROM assinaturas WHERE id = $1', [id]);

    // Registrar log
    if (usuarioId) {
      try {
        await registrarLog({
          usuarioId,
          usuarioTipo,
          usuarioNome,
          acao: 'excluir',
          modulo: 'assinatura',
          entidadeId: id,
          entidadeTipo: 'assinatura',
          descricao: `Assinatura ${assinatura.rows[0].nome} excluída`,
          dadosAnteriores: assinatura.rows[0],
          ipAddress: getClientIp(req),
          userAgent: getUserAgent(req),
        });
      } catch (logError) {
        console.error('Erro ao registrar log:', logError);
      }
    }

    res.json({
      message: 'Assinatura excluída com sucesso!',
    });
  } catch (error) {
    console.error('Erro ao excluir assinatura:', error);
    res.status(500).json({
      error: 'Erro ao excluir assinatura',
      message: error.message,
    });
  }
});

module.exports = router;

