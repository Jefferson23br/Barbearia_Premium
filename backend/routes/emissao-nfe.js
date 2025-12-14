const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { registrarLog, getClientIp, getUserAgent } = require('../utils/logger');

/**
 * GET /api/v1/emissao-nfe/romaneios-fechados
 * Lista romaneios fechados com vendas para emissão de nota fiscal
 */
router.get('/romaneios-fechados', async (req, res) => {
  try {
    const usuarioId = req.headers['x-user-id'];
    const usuarioTipo = req.headers['x-user-tipo'] || 'administrativo';

    if (usuarioTipo !== 'master') {
      const permissoesResult = await pool.query(
        'SELECT emissao_nfe_ver FROM protese.permissoes_usuarios WHERE usuario_id = $1',
        [usuarioId]
      );

      if (permissoesResult.rows.length === 0 || !permissoesResult.rows[0].emissao_nfe_ver) {
        return res.status(403).json({ error: 'Acesso negado. Permissão insuficiente.' });
      }
    }

    console.log('[ROMANEIOS] ===== INICIANDO BUSCA DE ROMANEIOS =====');

    // Buscar todos os romaneios fechados do tipo faturamento ou misto
    let romaneiosResult;
    try {
      // Primeiro, verificar quantos romaneios existem no total
      const totalRomaneios = await pool.query(
        `SELECT COUNT(*) as total FROM protese.romaneios`
      );
      console.log(`[DEBUG] Total de romaneios no banco: ${totalRomaneios.rows[0].total}`);

      // Buscar romaneios fechados
      romaneiosResult = await pool.query(
        `SELECT 
          r.id,
          r.numero_romaneio,
          r.tipo_romaneio,
          r.data_romaneio,
          r.descricao,
          r.status
        FROM protese.romaneios r
        WHERE r.status = 'fechado'
          AND r.tipo_romaneio IN ('faturamento', 'misto')
        ORDER BY r.data_romaneio DESC, r.numero_romaneio DESC
        LIMIT 100
        `
      );
      
      console.log(`[ROMANEIOS] Query executada com sucesso. Encontrados: ${romaneiosResult.rows.length} romaneios`);
      
      // Debug detalhado
      if (romaneiosResult.rows.length === 0) {
        console.log('[DEBUG] Nenhum romaneio encontrado. Verificando estatísticas...');
        const debugResult = await pool.query(
          `SELECT status, tipo_romaneio, COUNT(*) as total 
           FROM protese.romaneios 
           GROUP BY status, tipo_romaneio
           ORDER BY status, tipo_romaneio`
        );
        console.log('[DEBUG] Estatísticas de romaneios:', JSON.stringify(debugResult.rows, null, 2));
        
        // Verificar se há romaneios com vendas
        const romaneiosComVendasCheck = await pool.query(
          `SELECT COUNT(DISTINCT r.id) as total
           FROM protese.romaneios r
           INNER JOIN protese.romaneios_itens ri ON r.id = ri.romaneio_id
           WHERE ri.tipo_movimentacao = 'venda'`
        );
        console.log(`[DEBUG] Romaneios com vendas vinculadas: ${romaneiosComVendasCheck.rows[0].total}`);
      } else {
        console.log(`[ROMANEIOS] Primeiros 3 romaneios encontrados:`, 
          romaneiosResult.rows.slice(0, 3).map(r => ({ 
            numero: r.numero_romaneio, 
            tipo: r.tipo_romaneio, 
            status: r.status 
          }))
        );
      }
    } catch (queryError) {
      console.error('[ROMANEIOS] ERRO na query de romaneios:', queryError);
      console.error('[ROMANEIOS] Mensagem:', queryError.message);
      console.error('[ROMANEIOS] Stack:', queryError.stack);
      throw new Error(`Erro na consulta de romaneios: ${queryError.message}`);
    }

    console.log(`[ROMANEIOS] Iniciando busca de vendas para ${romaneiosResult.rows.length} romaneios`);

    // Para cada romaneio, buscar as vendas sem nota fiscal
    const romaneiosComVendas = await Promise.all(
      romaneiosResult.rows.map(async (romaneio) => {
        let vendasResult;
        try {
          console.log(`[VENDAS] ===== Buscando vendas para romaneio ${romaneio.numero_romaneio} (${romaneio.id}) =====`);
          
          // Primeiro, verificar se há itens de romaneio para este romaneio
          const itensCheck = await pool.query(
            `SELECT COUNT(*) as total, tipo_movimentacao 
             FROM protese.romaneios_itens 
             WHERE romaneio_id = $1 
             GROUP BY tipo_movimentacao`,
            [romaneio.id]
          );
          console.log(`[VENDAS] Itens do romaneio ${romaneio.numero_romaneio}:`, JSON.stringify(itensCheck.rows, null, 2));
          
          vendasResult = await pool.query(
            `SELECT 
              v.id,
              v.ticket,
              v.data_venda,
              v.valor_liquido,
              v.cliente_id,
              c.nome_completo as cliente_nome,
              c.cpf as cliente_cpf_cnpj,
              c.email as cliente_email,
              NULL as cliente_telefone,
              c.rua as endereco_rua,
              c.numero as endereco_numero,
              c.complemento as endereco_complemento,
              c.bairro as endereco_bairro,
              c.cidade as endereco_cidade,
              c.estado as endereco_estado,
              c.cep as endereco_cep,
              COALESCE((
              SELECT COALESCE(SUM(vp2.valor_total), 0)::numeric
              FROM protese.vendas_produtos vp2 
              WHERE vp2.venda_id = v.id
            ), 0) + COALESCE((
              SELECT COALESCE(SUM(vs2.valor), 0)::numeric
              FROM protese.vendas_servicos vs2 
              WHERE vs2.venda_id = v.id
            ), 0) as valor_total,
              COALESCE((
                SELECT COUNT(*) 
                FROM protese.vendas_produtos vp2 
                WHERE vp2.venda_id = v.id
              ), 0) as total_produtos,
              COALESCE((
                SELECT COUNT(*) 
                FROM protese.vendas_servicos vs2 
                WHERE vs2.venda_id = v.id
              ), 0) as total_servicos
            FROM protese.vendas v
            INNER JOIN protese.romaneios_itens ri ON v.id = ri.movimentacao_id AND ri.tipo_movimentacao = 'venda'
            LEFT JOIN protese.usuarios_clientes c ON v.cliente_id = c.id
            WHERE ri.romaneio_id = $1
              AND NOT EXISTS (
                SELECT 1 FROM protese.notas_fiscais nf 
                WHERE nf.venda_id = v.id
              )
            ORDER BY v.data_venda DESC, v.ticket DESC
            `,
            [romaneio.id]
          );
          console.log(`[VENDAS] Query executada. Encontradas ${vendasResult.rows.length} vendas sem nota fiscal para romaneio ${romaneio.numero_romaneio}`);
          
          if (vendasResult.rows.length > 0) {
            console.log(`[VENDAS] Primeira venda encontrada:`, {
              ticket: vendasResult.rows[0].ticket,
              cliente: vendasResult.rows[0].cliente_nome,
              valor: vendasResult.rows[0].valor_liquido
            });
          } else {
            // Verificar se há vendas com nota fiscal
            const vendasComNota = await pool.query(
              `SELECT COUNT(*) as total
               FROM protese.vendas v
               INNER JOIN protese.romaneios_itens ri ON v.id = ri.movimentacao_id AND ri.tipo_movimentacao = 'venda'
               INNER JOIN protese.notas_fiscais nf ON nf.venda_id = v.id
               WHERE ri.romaneio_id = $1`,
              [romaneio.id]
            );
            console.log(`[VENDAS] Vendas com nota fiscal neste romaneio: ${vendasComNota.rows[0].total}`);
            
            // Verificar se há vendas sem nota fiscal (sem o filtro de nota)
            const todasVendas = await pool.query(
              `SELECT COUNT(*) as total
               FROM protese.vendas v
               INNER JOIN protese.romaneios_itens ri ON v.id = ri.movimentacao_id AND ri.tipo_movimentacao = 'venda'
               WHERE ri.romaneio_id = $1`,
              [romaneio.id]
            );
            console.log(`[VENDAS] Total de vendas neste romaneio: ${todasVendas.rows[0].total}`);
          }
        } catch (vendaError) {
          console.error(`Erro ao buscar vendas do romaneio ${romaneio.id}:`, vendaError);
          console.error('Stack trace:', vendaError.stack);
          // Retornar romaneio sem vendas em caso de erro
          return {
            ...romaneio,
            total_vendas: 0,
            vendas: []
          };
        }

        const romaneioComVendas = {
          ...romaneio,
          total_vendas: vendasResult.rows.length,
          vendas: vendasResult.rows
        };
        
        return romaneioComVendas;
      })
    );

    // Filtrar apenas romaneios que têm vendas sem nota fiscal
    const romaneiosFiltrados = romaneiosComVendas.filter(romaneio => romaneio.vendas && romaneio.vendas.length > 0);
    console.log(`[RESULTADO] Total de romaneios com vendas pendentes: ${romaneiosFiltrados.length}`);
    console.log(`[RESULTADO] Total de romaneios processados: ${romaneiosComVendas.length}`);
    console.log(`[RESULTADO] Dados que serão enviados:`, JSON.stringify(romaneiosFiltrados.map(r => ({ 
      numero: r.numero_romaneio, 
      total_vendas: r.total_vendas,
      vendas_count: r.vendas?.length || 0 
    })), null, 2));

    try {
      await registrarLog({
        usuario_id: usuarioId,
        usuario_tipo: usuarioTipo,
        usuario_nome: req.headers['x-user-nome'] || null,
        acao: 'listar',
        modulo: 'emissao_nfe',
        descricao: 'Listou romaneios fechados para emissão de NFe',
        ip: getClientIp(req),
        user_agent: getUserAgent(req)
      });
    } catch (logError) {
      console.error('[LOG] Erro ao registrar log (não crítico):', logError.message);
    }

    console.log('[RESPOSTA] Enviando resposta com', romaneiosFiltrados.length, 'romaneios');
    res.json({ romaneios: romaneiosFiltrados });
  } catch (error) {
    console.error('Erro ao buscar romaneios fechados:', error);
    console.error('Stack trace:', error.stack);
    console.error('Erro completo:', JSON.stringify(error, null, 2));
    res.status(500).json({ 
      error: 'Erro ao buscar romaneios fechados', 
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

/**
 * GET /api/v1/emissao-nfe/configuracoes-emitente
 * Busca configurações do emitente para NFe
 */
router.get('/configuracoes-emitente', async (req, res) => {
  console.log('[EMITENTE] ===== INICIANDO BUSCA DE CONFIGURAÇÕES DO EMITENTE =====');
  try {
    const usuarioId = req.headers['x-user-id'];
    const usuarioTipo = req.headers['x-user-tipo'] || 'administrativo';
    console.log(`[EMITENTE] Usuário: ${usuarioId}, Tipo: ${usuarioTipo}`);

    if (usuarioTipo !== 'master') {
      const permissoesResult = await pool.query(
        'SELECT emissao_nfe_ver FROM protese.permissoes_usuarios WHERE usuario_id = $1',
        [usuarioId]
      );

      if (permissoesResult.rows.length === 0 || !permissoesResult.rows[0].emissao_nfe_ver) {
        console.log('[EMITENTE] Acesso negado - sem permissão');
        return res.status(403).json({ error: 'Acesso negado. Permissão insuficiente.' });
      }
      console.log('[EMITENTE] Permissão verificada com sucesso');
    } else {
      console.log('[EMITENTE] Usuário master - pulando verificação de permissão');
    }

    console.log('[EMITENTE] Executando query para buscar configurações...');
    
    // Primeiro, verificar se há configurações no banco
    const countResult = await pool.query('SELECT COUNT(*) as total FROM protese.configuracoes');
    console.log(`[EMITENTE] Total de configurações no banco: ${countResult.rows[0].total}`);
    
    const configResult = await pool.query(
      `SELECT 
        id,
        nome_empresarial,
        nome_fantasia,
        cnpj,
        cnae,
        cnae_secundario,
        inscricao_estadual,
        endereco_rua,
        endereco_numero,
        endereco_complemento,
        endereco_bairro,
        endereco_cidade,
        endereco_estado,
        endereco_cep,
        email_contato,
        telefone_principal,
        telefone_secundario,
        whatsapp,
        ambiente_nfe,
        certificado_digital_path,
        senha_certificado,
        api_habilitada,
        api_token,
        api_url_base,
        created_at,
        updated_at
      FROM protese.configuracoes 
      ORDER BY updated_at DESC, created_at DESC
      LIMIT 1`
    );

    console.log(`[EMITENTE] Query executada. Encontradas ${configResult.rows.length} configurações`);

    if (configResult.rows.length === 0) {
      console.log('[EMITENTE] Nenhuma configuração encontrada no banco');
      
      // Debug: verificar se há configurações no banco
      const debugConfig = await pool.query('SELECT COUNT(*) as total FROM protese.configuracoes');
      console.log(`[EMITENTE] Total de configurações no banco: ${debugConfig.rows[0].total}`);
      
      return res.status(404).json({ error: 'Configurações não encontradas' });
    }

    const emitente = configResult.rows[0];
    console.log(`[EMITENTE] Configuração encontrada:`, {
      id: emitente.id,
      nome_empresarial: emitente.nome_empresarial,
      nome_fantasia: emitente.nome_fantasia,
      cnpj: emitente.cnpj,
      inscricao_estadual: emitente.inscricao_estadual,
      tem_endereco: !!emitente.endereco_rua,
      endereco_completo: emitente.endereco_rua ? `${emitente.endereco_rua}, ${emitente.endereco_numero}` : null
    });

    // Garantir que todos os campos necessários estão presentes
    const emitenteFormatado = {
      nome_empresarial: emitente.nome_empresarial || '',
      nome_fantasia: emitente.nome_fantasia || '',
      cnpj: emitente.cnpj || '',
      cnae: emitente.cnae || '',
      inscricao_estadual: emitente.inscricao_estadual || '',
      endereco_rua: emitente.endereco_rua || '',
      endereco_numero: emitente.endereco_numero || '',
      endereco_complemento: emitente.endereco_complemento || '',
      endereco_bairro: emitente.endereco_bairro || '',
      endereco_cidade: emitente.endereco_cidade || '',
      endereco_estado: emitente.endereco_estado || '',
      endereco_cep: emitente.endereco_cep || '',
      email_contato: emitente.email_contato || '',
      telefone_principal: emitente.telefone_principal || ''
    };

    console.log('[EMITENTE] Dados formatados que serão enviados:', JSON.stringify(emitenteFormatado, null, 2));
    console.log('[EMITENTE] Enviando resposta com dados do emitente');
    res.json({ emitente: emitenteFormatado });
  } catch (error) {
    console.error('[EMITENTE] ERRO ao buscar configurações do emitente:', error);
    console.error('[EMITENTE] Mensagem:', error.message);
    console.error('[EMITENTE] Stack:', error.stack);
    res.status(500).json({ 
      error: 'Erro ao buscar configurações', 
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

/**
 * POST /api/v1/emissao-nfe/emitir
 * Emite uma nota fiscal para uma venda
 */
router.post('/emitir', async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    const usuarioId = req.headers['x-user-id'];
    const usuarioTipo = req.headers['x-user-tipo'] || 'administrativo';
    const usuarioNome = req.headers['x-user-nome'] || null;

    if (usuarioTipo !== 'master') {
      const permissoesResult = await client.query(
        'SELECT emissao_nfe_editar FROM protese.permissoes_usuarios WHERE usuario_id = $1',
        [usuarioId]
      );

      if (permissoesResult.rows.length === 0 || !permissoesResult.rows[0].emissao_nfe_editar) {
        await client.query('ROLLBACK');
        return res.status(403).json({ error: 'Acesso negado. Permissão insuficiente.' });
      }
    }

    const { venda_id, romaneio_id, observacoes } = req.body;

    if (!venda_id) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'ID da venda é obrigatório' });
    }

    // Buscar dados da venda
    const vendaResult = await client.query(
      `SELECT 
        v.*,
        c.nome_completo as cliente_nome,
        c.cpf as cliente_cpf_cnpj,
        c.email as cliente_email,
        NULL as cliente_telefone,
        c.rua as endereco_rua,
        c.numero as endereco_numero,
        c.complemento as endereco_complemento,
        c.bairro as endereco_bairro,
        c.cidade as endereco_cidade,
        c.estado as endereco_estado,
        c.cep as endereco_cep
      FROM protese.vendas v
      LEFT JOIN protese.usuarios_clientes c ON v.cliente_id = c.id
      WHERE v.id = $1`,
      [venda_id]
    );

    if (vendaResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Venda não encontrada' });
    }

    const venda = vendaResult.rows[0];

    // Verificar se já existe nota fiscal para esta venda
    const notaExistente = await client.query(
      'SELECT id FROM protese.notas_fiscais WHERE venda_id = $1',
      [venda_id]
    );

    if (notaExistente.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Já existe uma nota fiscal emitida para esta venda' });
    }

    // Buscar configurações do emitente
    const configResult = await client.query(
      `SELECT * FROM protese.configuracoes ORDER BY updated_at DESC LIMIT 1`
    );

    if (configResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Configurações do emitente não encontradas' });
    }

    const emitente = configResult.rows[0];

    // Buscar integração de NFe
    const integracaoResult = await client.query(
      `SELECT * FROM protese.integracoes WHERE tipo_integracao = 'nfe' AND ativo = true LIMIT 1`
    );

    if (integracaoResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Integração de NFe não configurada ou inativa' });
    }

    const integracao = integracaoResult.rows[0];

    // Preparar dados da nota fiscal
    const dadosNFe = {
      emitente: {
        nome_empresarial: emitente.nome_empresarial,
        nome_fantasia: emitente.nome_fantasia || emitente.nome_empresarial,
        cnpj: emitente.cnpj,
        inscricao_estadual: emitente.inscricao_estadual,
        endereco: {
          rua: emitente.endereco_rua,
          numero: emitente.endereco_numero,
          complemento: emitente.endereco_complemento,
          bairro: emitente.endereco_bairro,
          cidade: emitente.endereco_cidade,
          estado: emitente.endereco_estado,
          cep: emitente.endereco_cep
        },
        telefone: emitente.telefone_principal,
        email: emitente.email_contato
      },
      destinatario: {
        nome: venda.cliente_nome || 'Cliente não cadastrado',
        cpf_cnpj: venda.cliente_cpf_cnpj,
        email: venda.cliente_email,
        telefone: venda.cliente_telefone,
        endereco: {
          rua: venda.endereco_rua,
          numero: venda.endereco_numero,
          complemento: venda.endereco_complemento,
          bairro: venda.endereco_bairro,
          cidade: venda.endereco_cidade,
          estado: venda.endereco_estado,
          cep: venda.endereco_cep
        }
      },
      itens: [],
      valor_total: parseFloat(venda.valor_liquido) || 0,
      descricao_padrao: 'Prestação do Serviços Prestados descritos na CNAE da empresa e CBO',
      observacoes: observacoes || null,
      ambiente: emitente.ambiente_nfe || 'homologacao'
    };

    // Buscar produtos e serviços da venda
    const produtosResult = await client.query(
      `SELECT vp.*, p.descricao as produto_descricao
       FROM protese.vendas_produtos vp
       LEFT JOIN protese.produtos p ON vp.produto_id = p.id
       WHERE vp.venda_id = $1`,
      [venda_id]
    );

    const servicosResult = await client.query(
      `SELECT vs.*, s.descricao as servico_descricao
       FROM protese.vendas_servicos vs
       LEFT JOIN protese.servicos s ON vs.servico_id = s.id
       WHERE vs.venda_id = $1`,
      [venda_id]
    );

    // Adicionar produtos como itens
    produtosResult.rows.forEach(produto => {
      dadosNFe.itens.push({
        tipo: 'produto',
        descricao: produto.produto_descricao || 'Produto',
        quantidade: produto.quantidade || 1,
        valor_unitario: parseFloat(produto.valor_unitario) || 0,
        valor_total: parseFloat(produto.valor_total) || 0
      });
    });

    // Adicionar serviços como itens
    servicosResult.rows.forEach(servico => {
      dadosNFe.itens.push({
        tipo: 'servico',
        descricao: servico.servico_descricao || 'Serviço',
        quantidade: 1, // Serviços não têm quantidade na tabela vendas_servicos
        valor_unitario: parseFloat(servico.valor) || 0,
        valor_total: parseFloat(servico.valor) || 0
      });
    });

    // Se não houver itens específicos, criar um item genérico
    if (dadosNFe.itens.length === 0) {
      dadosNFe.itens.push({
        tipo: 'servico',
        descricao: dadosNFe.descricao_padrao,
        quantidade: 1,
        valor_unitario: dadosNFe.valor_total,
        valor_total: dadosNFe.valor_total
      });
    }

    // Chamar API de NFe (integração externa)
    let respostaNFe;
    try {
      const axios = require('axios');
      
      // Buscar URL e token da configuração JSON ou usar campos diretos
      const configJson = integracao.configuracao_json || {};
      const apiUrl = configJson.api_url_base || configJson.url_base || null;
      const token = integracao.ambiente === 'producao' 
        ? integracao.token_producao 
        : integracao.token_homologacao;
      
      if (!apiUrl) {
        throw new Error('URL da API de NFe não configurada na integração');
      }

      // Preparar requisição para a API de NFe
      const requestData = {
        ...dadosNFe,
        certificado: {
          path: emitente.certificado_digital_path || integracao.certificado_digital_path,
          senha: emitente.senha_certificado || integracao.senha_certificado
        },
        integracao_id: integracao.id
      };

      // Fazer chamada à API de NFe
      const response = await axios.post(`${apiUrl}/emitir`, requestData, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : undefined,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      });

      respostaNFe = response.data;
    } catch (apiError) {
      console.error('Erro ao chamar API de NFe:', apiError);
      // Em caso de erro na API, criar nota fiscal localmente (para desenvolvimento/teste)
      // Em produção, isso deve ser tratado de forma diferente
      const timestamp = Date.now();
      const randomStr = Math.random().toString(36).substring(2, 11);
      respostaNFe = {
        numero: `NF${timestamp}`,
        numero_nota: `NF${timestamp}`,
        serie: '1',
        chave_acesso: `NFe${timestamp}${randomStr}`,
        chave: `NFe${timestamp}${randomStr}`,
        status: 'pendente',
        xml_path: null,
        pdf_path: null,
        mensagem: 'Nota fiscal criada localmente (API não disponível). Configure a integração de NFe para emissão real.'
      };
    }

    // Salvar nota fiscal no banco
    const notaResult = await client.query(
      `INSERT INTO protese.notas_fiscais 
       (venda_id, romaneio_id, numero, serie, chave_acesso, status, xml_path, pdf_path, observacoes, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [
        venda_id,
        romaneio_id || null,
        respostaNFe.numero || respostaNFe.numero_nota,
        respostaNFe.serie || '1',
        respostaNFe.chave_acesso || respostaNFe.chave || null,
        respostaNFe.status || 'emitida',
        respostaNFe.xml_path || null,
        respostaNFe.pdf_path || null,
        observacoes || null,
        usuarioId
      ]
    );

    await client.query('COMMIT');

    await registrarLog({
      usuario_id: usuarioId,
      usuario_tipo: usuarioTipo,
      usuario_nome: usuarioNome,
      acao: 'emitir',
      modulo: 'emissao_nfe',
      descricao: `Emitiu nota fiscal ${notaResult.rows[0].numero} para venda ${venda.ticket}`,
      ip: getClientIp(req),
      user_agent: getUserAgent(req)
    });

    res.status(201).json({
      nota_fiscal: notaResult.rows[0],
      mensagem: respostaNFe.mensagem || 'Nota fiscal emitida com sucesso'
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Erro ao emitir nota fiscal:', error);
    res.status(500).json({ 
      error: 'Erro ao emitir nota fiscal', 
      details: error.message 
    });
  } finally {
    client.release();
  }
});

/**
 * GET /api/v1/emissao-nfe/notas-fiscais
 * Lista todas as notas fiscais emitidas
 */
router.get('/notas-fiscais', async (req, res) => {
  try {
    const usuarioId = req.headers['x-user-id'];
    const usuarioTipo = req.headers['x-user-tipo'] || 'administrativo';

    if (usuarioTipo !== 'master') {
      const permissoesResult = await pool.query(
        'SELECT emissao_nfe_ver FROM protese.permissoes_usuarios WHERE usuario_id = $1',
        [usuarioId]
      );

      if (permissoesResult.rows.length === 0 || !permissoesResult.rows[0].emissao_nfe_ver) {
        return res.status(403).json({ error: 'Acesso negado. Permissão insuficiente.' });
      }
    }

    const { data_inicio, data_fim, status, busca } = req.query;

    let query = `
      SELECT 
        nf.id,
        nf.venda_id,
        nf.romaneio_id,
        nf.numero,
        nf.serie,
        nf.chave_acesso,
        nf.status,
        nf.xml_path,
        nf.pdf_path,
        nf.observacoes,
        nf.created_at,
        nf.updated_at,
        v.ticket as venda_ticket,
        v.data_venda,
        v.valor_liquido as venda_valor,
        v.cliente_id,
        COALESCE(c.nome_completo, 'Cliente não cadastrado') as cliente_nome,
        c.cpf as cliente_cpf_cnpj,
        COALESCE(r.numero_romaneio, '') as numero_romaneio
      FROM protese.notas_fiscais nf
      INNER JOIN protese.vendas v ON nf.venda_id = v.id
      LEFT JOIN protese.usuarios_clientes c ON v.cliente_id = c.id
      LEFT JOIN protese.romaneios r ON nf.romaneio_id = r.id
      WHERE 1=1
    `;

    const params = [];
    let paramCount = 1;

    if (data_inicio) {
      query += ` AND nf.created_at >= $${paramCount}`;
      params.push(data_inicio);
      paramCount++;
    }

    if (data_fim) {
      query += ` AND nf.created_at <= $${paramCount}`;
      params.push(data_fim);
      paramCount++;
    }

    if (status) {
      query += ` AND nf.status = $${paramCount}`;
      params.push(status);
      paramCount++;
    }

    if (busca) {
      query += ` AND (
        nf.numero ILIKE $${paramCount} OR
        nf.chave_acesso ILIKE $${paramCount} OR
        v.ticket ILIKE $${paramCount} OR
        c.nome_completo ILIKE $${paramCount}
      )`;
      params.push(`%${busca}%`);
      paramCount++;
    }

    query += ` ORDER BY nf.created_at DESC LIMIT 100`;

    const result = await pool.query(query, params);

    await registrarLog({
      usuario_id: usuarioId,
      usuario_tipo: usuarioTipo,
      usuario_nome: req.headers['x-user-nome'] || null,
      acao: 'listar',
      modulo: 'emissao_nfe',
      descricao: 'Listou notas fiscais emitidas',
      ip: getClientIp(req),
      user_agent: getUserAgent(req)
    });

    res.json({ notas_fiscais: result.rows });
  } catch (error) {
    console.error('Erro ao buscar notas fiscais:', error);
    console.error('Stack trace:', error.stack);
    res.status(500).json({ 
      error: 'Erro ao buscar notas fiscais', 
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

/**
 * GET /api/v1/emissao-nfe/notas-fiscais/:id
 * Busca uma nota fiscal específica
 */
router.get('/notas-fiscais/:id', async (req, res) => {
  try {
    const usuarioId = req.headers['x-user-id'];
    const usuarioTipo = req.headers['x-user-tipo'] || 'administrativo';

    if (usuarioTipo !== 'master') {
      const permissoesResult = await pool.query(
        'SELECT emissao_nfe_ver FROM protese.permissoes_usuarios WHERE usuario_id = $1',
        [usuarioId]
      );

      if (permissoesResult.rows.length === 0 || !permissoesResult.rows[0].emissao_nfe_ver) {
        return res.status(403).json({ error: 'Acesso negado. Permissão insuficiente.' });
      }
    }

    const result = await pool.query(
      `SELECT 
        nf.*,
        v.ticket as venda_ticket,
        v.data_venda,
        v.valor_liquido as venda_valor,
        v.cliente_id,
        c.nome_completo as cliente_nome,
        c.cpf as cliente_cpf_cnpj,
        c.email as cliente_email,
        NULL as cliente_telefone,
        c.rua as endereco_rua,
        c.numero as endereco_numero,
        c.complemento as endereco_complemento,
        c.bairro as endereco_bairro,
        c.cidade as endereco_cidade,
        c.estado as endereco_estado,
        c.cep as endereco_cep,
        r.numero_romaneio
      FROM protese.notas_fiscais nf
      INNER JOIN protese.vendas v ON nf.venda_id = v.id
      LEFT JOIN protese.usuarios_clientes c ON v.cliente_id = c.id
      LEFT JOIN protese.romaneios r ON nf.romaneio_id = r.id
      WHERE nf.id = $1`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Nota fiscal não encontrada' });
    }

    res.json({ nota_fiscal: result.rows[0] });
  } catch (error) {
    console.error('Erro ao buscar nota fiscal:', error);
    res.status(500).json({ error: 'Erro ao buscar nota fiscal', details: error.message });
  }
});

/**
 * GET /api/v1/emissao-nfe/notas-fiscais/:id/download
 * Baixa o arquivo XML ou PDF da nota fiscal
 */
router.get('/notas-fiscais/:id/download', async (req, res) => {
  try {
    const usuarioId = req.headers['x-user-id'];
    const usuarioTipo = req.headers['x-user-tipo'] || 'administrativo';
    const { tipo } = req.query; // 'xml' ou 'pdf'

    if (usuarioTipo !== 'master') {
      const permissoesResult = await pool.query(
        'SELECT emissao_nfe_ver FROM protese.permissoes_usuarios WHERE usuario_id = $1',
        [usuarioId]
      );

      if (permissoesResult.rows.length === 0 || !permissoesResult.rows[0].emissao_nfe_ver) {
        return res.status(403).json({ error: 'Acesso negado. Permissão insuficiente.' });
      }
    }

    const result = await pool.query(
      'SELECT * FROM protese.notas_fiscais WHERE id = $1',
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Nota fiscal não encontrada' });
    }

    const notaFiscal = result.rows[0];
    const filePath = tipo === 'xml' ? notaFiscal.xml_path : notaFiscal.pdf_path;

    if (!filePath) {
      return res.status(404).json({ error: `Arquivo ${tipo.toUpperCase()} não disponível para esta nota fiscal` });
    }

    // Se o arquivo estiver em um servidor externo (URL), redirecionar
    if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
      return res.redirect(filePath);
    }

    // Se for um caminho local, servir o arquivo
    const fs = require('fs');
    const path = require('path');

    const fullPath = path.resolve(filePath);
    
    if (!fs.existsSync(fullPath)) {
      return res.status(404).json({ error: 'Arquivo não encontrado no servidor' });
    }

    const fileContent = fs.readFileSync(fullPath);
    const contentType = tipo === 'xml' ? 'application/xml' : 'application/pdf';
    const fileName = `NFe_${notaFiscal.numero}_${notaFiscal.serie}.${tipo}`;

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.send(fileContent);
  } catch (error) {
    console.error('Erro ao baixar arquivo da nota fiscal:', error);
    res.status(500).json({ error: 'Erro ao baixar arquivo', details: error.message });
  }
});

module.exports = router;

