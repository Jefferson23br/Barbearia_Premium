const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { registrarLog, getClientIp, getUserAgent } = require('../utils/logger');

/**
 * GET /api/v1/agendamentos
 * Lista todos os agendamentos com filtros opcionais
 */
router.get('/', async (req, res) => {
  try {
    const usuarioId = req.headers['x-user-id'];
    const usuarioTipo = req.headers['x-user-tipo'] || 'administrativo';

    // Verificar permissão de visualização
    if (usuarioTipo !== 'master') {
      const permissoesResult = await pool.query(
        'SELECT agenda_ver FROM protese.permissoes_usuarios WHERE usuario_id = $1',
        [usuarioId]
      );

      if (permissoesResult.rows.length === 0 || !permissoesResult.rows[0].agenda_ver) {
        return res.status(403).json({ error: 'Acesso negado. Permissão insuficiente.' });
      }
    }

    const { data_inicio, data_fim, funcionario_id, cliente_id, status } = req.query;
    let query = `
      SELECT 
        a.*,
        c.nome_completo as cliente_nome,
        f.nome_completo as funcionario_nome,
        s.nome as servico_nome,
        s.duracao_minutos
      FROM protese.agendamentos a
      INNER JOIN protese.usuarios_clientes c ON a.cliente_id = c.id
      INNER JOIN protese.usuarios_administrativos f ON a.funcionario_id = f.id
      INNER JOIN protese.servicos s ON a.servico_id = s.id
      WHERE 1=1
    `;
    const params = [];
    let paramIndex = 1;

    if (data_inicio) {
      query += ` AND a.data_agendamento >= $${paramIndex}`;
      params.push(data_inicio);
      paramIndex++;
    }

    if (data_fim) {
      query += ` AND a.data_agendamento <= $${paramIndex}`;
      params.push(data_fim);
      paramIndex++;
    }

    if (funcionario_id) {
      query += ` AND a.funcionario_id = $${paramIndex}`;
      params.push(funcionario_id);
      paramIndex++;
    }

    if (cliente_id) {
      query += ` AND a.cliente_id = $${paramIndex}`;
      params.push(cliente_id);
      paramIndex++;
    }

    if (status) {
      query += ` AND a.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    query += ' ORDER BY a.data_agendamento ASC, a.hora_inicio ASC';

    console.log('📅 [GET AGENDAMENTOS] Query SQL:', query);
    console.log('📅 [GET AGENDAMENTOS] Parâmetros:', params);

    const result = await pool.query(query, params);

    console.log('✅ [GET AGENDAMENTOS] Agendamentos encontrados:', result.rows.length);
    console.log('📋 [GET AGENDAMENTOS] Detalhes dos agendamentos:', result.rows.map(a => ({
      id: a.id,
      cliente_nome: a.cliente_nome,
      funcionario_nome: a.funcionario_nome,
      funcionario_id: a.funcionario_id,
      data_agendamento: a.data_agendamento,
      hora_inicio: a.hora_inicio,
      hora_fim: a.hora_fim,
      servico_nome: a.servico_nome,
      valor_servico: a.valor_servico,
      status: a.status
    })));

    res.json({
      agendamentos: result.rows,
      total: result.rows.length
    });
  } catch (error) {
    console.error('Erro ao listar agendamentos:', error);
    res.status(500).json({ error: 'Erro ao listar agendamentos' });
  }
});

/**
 * GET /api/v1/agendamentos/disponibilidades
 * Calcula horários disponíveis para uma data e funcionário específicos
 */
router.get('/disponibilidades', async (req, res) => {
  try {
    const { data, funcionario_id } = req.query;

    if (!data || !funcionario_id) {
      return res.status(400).json({ error: 'Data e funcionario_id são obrigatórios' });
    }

    // Verificar se a data está em um fechamento especial
    const fechamentoResult = await pool.query(
      'SELECT * FROM protese.fechamentos_especiais WHERE data_fechamento = $1 AND is_active = true',
      [data]
    );

    if (fechamentoResult.rows.length > 0) {
      const fechamento = fechamentoResult.rows[0];
      console.log('🚫 Data está em fechamento especial:', fechamento.descricao);
      return res.json({
        disponibilidades: [],
        motivo_fechamento: fechamento.descricao,
        fechado: true,
      });
    }

    // Obter configurações (horário de funcionamento e intervalo)
    const configResult = await pool.query('SELECT * FROM protese.configuracoes ORDER BY created_at DESC LIMIT 1');
    if (configResult.rows.length === 0) {
      return res.status(404).json({ error: 'Configurações não encontradas' });
    }

    const config = configResult.rows[0];
    const intervaloAgendamento = Math.max(1, config.intervalo_agendamento || 30); // Intervalo mínimo entre agendamentos
    const intervaloVisual = 15; // Intervalo visual fixo de 15 minutos para exibição

    // Determinar o dia da semana (0 = domingo, 1 = segunda, etc.)
    // A data vem no formato 'yyyy-MM-dd', precisamos parsear corretamente
    const [ano, mes, dia] = data.split('-').map(Number);
    const dataObj = new Date(ano, mes - 1, dia); // mes - 1 porque Date usa 0-11 para meses
    const diaSemana = dataObj.getDay();
    const diasSemana = ['domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado'];
    const diaNome = diasSemana[diaSemana];

    // Obter horário de funcionamento do dia
    const campoAbertura = `${diaNome}_abertura`;
    const campoFechamento = `${diaNome}_fechamento`;
    const campoAtivo = `${diaNome}_ativo`;

    const horaAbertura = config[campoAbertura];
    const horaFechamento = config[campoFechamento];
    const diaAtivoRaw = config[campoAtivo];
    
    // Tratamento booleano seguro
    const diaAtivo = diaAtivoRaw === true || diaAtivoRaw === 't' || diaAtivoRaw === 'true';

    if (!diaAtivo || !horaAbertura || !horaFechamento) {
      return res.json({ 
        disponibilidades: [],
        motivo: 'Dia sem funcionamento configurado'
      });
    }

    // Converter horas para minutos desde meia-noite
    // Tratar formato TIME do PostgreSQL (pode vir como '08:00:00')
    const horaAberturaFormatada = horaAbertura.toString().substring(0, 5); // Pega HH:MM
    const horaFechamentoFormatada = horaFechamento.toString().substring(0, 5); // Pega HH:MM
    
    const [horaAberturaH, minutoAberturaM] = horaAberturaFormatada.split(':').map(Number);
    const [horaFechamentoH, minutoFechamentoM] = horaFechamentoFormatada.split(':').map(Number);
    const inicioMinutos = horaAberturaH * 60 + minutoAberturaM;
    const fimMinutos = horaFechamentoH * 60 + minutoFechamentoM;

    // Buscar agendamentos existentes para o funcionário na data
    const agendamentosResult = await pool.query(
      `SELECT hora_inicio, hora_fim 
       FROM protese.agendamentos 
       WHERE funcionario_id = $1 AND data_agendamento = $2 AND status NOT IN ('cancelado', 'nao_compareceu')
       ORDER BY hora_inicio ASC`,
      [funcionario_id, data]
    );

    const agendamentos = agendamentosResult.rows;

    // Criar array de intervalos ocupados (em minutos)
    const intervalosOcupados = [];
    for (const agendamento of agendamentos) {
      const [horaInicioH, minutoInicioM] = agendamento.hora_inicio.split(':').map(Number);
      const [horaFimH, minutoFimM] = agendamento.hora_fim.split(':').map(Number);
      const inicioAgendamento = horaInicioH * 60 + minutoInicioM;
      const fimAgendamento = horaFimH * 60 + minutoFimM;
      
      intervalosOcupados.push({
        inicio: inicioAgendamento,
        fim: fimAgendamento
      });
    }

    // Gerar todos os slots de 15 minutos do horário de funcionamento
    const disponibilidades = [];
    let minutoAtual = inicioMinutos;

    while (minutoAtual < fimMinutos) {
      // Verificar se este slot de 15 minutos está dentro de algum agendamento
      const estaOcupado = intervalosOcupados.some(ocupado => {
        // Um slot está ocupado se o agendamento começa antes ou no início deste slot
        // e termina depois do início deste slot
        return ocupado.inicio <= minutoAtual && minutoAtual < ocupado.fim;
      });

      // Verificar se há espaço suficiente para um agendamento (pelo menos intervaloAgendamento minutos)
      const temEspacoSuficiente = (fimMinutos - minutoAtual) >= intervaloAgendamento;

      if (!estaOcupado && temEspacoSuficiente) {
        const horas = Math.floor(minutoAtual / 60);
        const minutos = minutoAtual % 60;
        const horaFormatada = `${String(horas).padStart(2, '0')}:${String(minutos).padStart(2, '0')}`;

        disponibilidades.push({
          hora_inicio: horaFormatada,
          // hora_fim será calculada no frontend baseado no serviço selecionado
        });
      }

      minutoAtual += intervaloVisual;
    }

    res.json({ 
      disponibilidades,
      hora_abertura: horaAberturaFormatada,
      hora_fechamento: horaFechamentoFormatada,
      intervalo_agendamento: intervaloAgendamento
    });
  } catch (error) {
    console.error('Erro ao calcular disponibilidades:', error);
    res.status(500).json({ error: 'Erro ao calcular disponibilidades' });
  }
});

/**
 * GET /api/v1/agendamentos/horarios-funcionamento
 * Retorna os horários de funcionamento para uma data específica
 * CORREÇÃO: Tratamento robusto para evitar travas no frontend
 */
router.get('/horarios-funcionamento', async (req, res) => {
  try {
    const { data } = req.query;

    if (!data) {
      return res.status(400).json({ error: 'Data é obrigatória' });
    }

    // 0. Verificar se a data está em um fechamento especial
    const fechamentoResult = await pool.query(
      'SELECT * FROM protese.fechamentos_especiais WHERE data_fechamento = $1 AND is_active = true',
      [data]
    );

    if (fechamentoResult.rows.length > 0) {
      const fechamento = fechamentoResult.rows[0];
      console.log('🚫 Data está em fechamento especial:', fechamento.descricao);
      return res.json({
        dia_ativo: false,
        dia_semana: 'fechamento_especial',
        hora_abertura: null,
        hora_fechamento: null,
        horarios: [],
        motivo_fechamento: fechamento.descricao,
      });
    }

    // 1. Tenta buscar configuração
    console.log('🔍 Buscando configurações no banco...');
    const configResult = await pool.query('SELECT * FROM protese.configuracoes ORDER BY updated_at DESC LIMIT 1');
    
    // Objeto padrão caso não exista config ou dê erro
    let config = {
      intervalo_agendamento: 30
    };
    
    // Se achou config no banco, usa ela
    if (configResult.rows.length > 0) {
      config = configResult.rows[0];
      console.log('✅ Configuração encontrada:', {
        id: config.id,
        segunda_abertura: config.segunda_abertura,
        segunda_fechamento: config.segunda_fechamento,
        segunda_ativo: config.segunda_ativo
      });
    } else {
      console.log('⚠️ Nenhuma configuração encontrada no banco');
      // Se não achou, retorna um dia "inativo" seguro para não travar o front
      return res.json({
        dia_ativo: false,
        dia_semana: 'nao_configurado',
        hora_abertura: null,
        hora_fechamento: null,
        horarios: [],
        aviso: 'Configuração não encontrada'
      });
    }

    // 2. Parse da Data (Seguro)
    console.log('📅 Parseando data recebida:', data);
    const [ano, mes, dia] = data.split('-').map(Number);
    const dataObj = new Date(ano, mes - 1, dia);
    const diaSemana = dataObj.getDay(); // 0-6
    const diasSemana = ['domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado'];
    const diaNome = diasSemana[diaSemana];
    
    console.log('📅 Data parseada:', {
      ano,
      mes,
      dia,
      diaSemana,
      diaNome,
      dataObj: dataObj.toISOString()
    });

    // 3. Pega dados do dia
    const campoAbertura = `${diaNome}_abertura`;
    const campoFechamento = `${diaNome}_fechamento`;
    const campoAtivo = `${diaNome}_ativo`;
    
    console.log('🔍 Campos a buscar:', {
      campoAbertura,
      campoFechamento,
      campoAtivo
    });
    
    const horaAbertura = config[campoAbertura];
    const horaFechamento = config[campoFechamento];
    const diaAtivoRaw = config[campoAtivo];
    
    console.log('📊 Valores encontrados no config:', {
      horaAbertura,
      horaFechamento,
      diaAtivoRaw,
      tipoDiaAtivo: typeof diaAtivoRaw
    });

    console.log('📅 Dados do dia:', {
      diaNome,
      campoAbertura,
      campoFechamento,
      campoAtivo,
      horaAbertura,
      horaFechamento,
      diaAtivoRaw,
      tipoDiaAtivo: typeof diaAtivoRaw
    });

    // Tratamento booleano seguro (Postgres pode retornar true, 't', 'true')
    const diaAtivo = diaAtivoRaw === true || diaAtivoRaw === 't' || diaAtivoRaw === 'true';

    // Se fechado ou horários inválidos
    if (!diaAtivo || !horaAbertura || !horaFechamento) {
      console.log('⚠️ Dia fechado ou horários inválidos:', {
        diaAtivo,
        horaAbertura,
        horaFechamento
      });
      return res.json({
        dia_ativo: false,
        dia_semana: diaNome,
        hora_abertura: null,
        hora_fechamento: null,
        horarios: []
      });
    }

    // 4. Gerar Grade de Horários (15 em 15 min para visualização)
    // Converte Time (HH:MM:SS) para HH:MM
    const horaAberturaFormatada = horaAbertura.toString().substring(0, 5);
    const horaFechamentoFormatada = horaFechamento.toString().substring(0, 5);
    const [hInicio, mInicio] = horaAberturaFormatada.split(':').map(Number);
    const [hFim, mFim] = horaFechamentoFormatada.split(':').map(Number);
    
    const inicioMinutos = hInicio * 60 + mInicio;
    const fimMinutos = hFim * 60 + mFim;
    const horarios = [];

    // Proteção contra loops infinitos (ex: inicio > fim)
    if (inicioMinutos < fimMinutos) {
        let minutosAtuais = inicioMinutos;
        while (minutosAtuais < fimMinutos) { // < Para não incluir a hora exata de fechar se não quiser
            const horas = Math.floor(minutosAtuais / 60);
            const minutos = minutosAtuais % 60;
            horarios.push(`${String(horas).padStart(2, '0')}:${String(minutos).padStart(2, '0')}`);
            minutosAtuais += 15; // Intervalo visual fixo de 15min
        }
    }

    const resposta = {
      dia_ativo: true,
      dia_semana: diaNome,
      hora_abertura: horaAberturaFormatada,
      hora_fechamento: horaFechamentoFormatada,
      horarios: horarios
    };

    console.log('✅ Resposta enviada:', {
      ...resposta,
      totalHorarios: horarios.length,
      primeiroHorario: horarios[0],
      ultimoHorario: horarios[horarios.length - 1]
    });

    res.json(resposta);
  } catch (error) {
    console.error('Erro CRÍTICO em horários-funcionamento:', error);
    // Retorna JSON válido mesmo no erro para destrava o front
    res.status(500).json({ 
        dia_ativo: false, 
        horarios: [], 
        error: 'Erro interno ao calcular horários' 
    });
  }
});

/**
 * GET /api/v1/agendamentos/recursos-especiais
 * Busca ou cria cliente "Sistema" e serviços especiais (Almoço, Saída)
 */
router.get('/recursos-especiais', async (req, res) => {
  try {
    console.log('🔍 [RECURSOS ESPECIAIS] Iniciando busca/criação de recursos...');
    
    // Buscar ou criar cliente "Sistema"
    let clienteSistema = await pool.query(
      "SELECT id, nome_completo FROM protese.usuarios_clientes WHERE nome_completo = 'Sistema' OR email = 'sistema@interno.com' LIMIT 1"
    );

    if (clienteSistema.rows.length === 0) {
      try {
        console.log('📝 [RECURSOS ESPECIAIS] Criando cliente Sistema...');
        // Criar cliente Sistema - tentar com campos mínimos primeiro
        const novoCliente = await pool.query(
          `INSERT INTO protese.usuarios_clientes (nome_completo, email, telefone, is_active)
           VALUES ('Sistema', 'sistema@interno.com', '00000000000', true)
           RETURNING id, nome_completo`
        );
        clienteSistema = novoCliente;
        console.log('✅ [RECURSOS ESPECIAIS] Cliente Sistema criado:', novoCliente.rows[0].id);
      } catch (insertError) {
        console.error('❌ [RECURSOS ESPECIAIS] Erro ao criar cliente Sistema:', insertError.message);
        console.error('❌ [RECURSOS ESPECIAIS] Código do erro:', insertError.code);
        console.error('❌ [RECURSOS ESPECIAIS] Detalhes:', insertError.detail);
        console.error('❌ [RECURSOS ESPECIAIS] Stack:', insertError.stack);
        
        // Se der erro (ex: email duplicado), tentar buscar novamente
        if (insertError.code === '23505') {
          console.log('⚠️ [RECURSOS ESPECIAIS] Cliente Sistema já existe, buscando novamente...');
          clienteSistema = await pool.query(
            "SELECT id, nome_completo FROM protese.usuarios_clientes WHERE nome_completo = 'Sistema' OR email = 'sistema@interno.com' LIMIT 1"
          );
        } else {
          // Se for erro de campo obrigatório, retornar erro detalhado
          throw new Error(`Erro ao criar cliente Sistema: ${insertError.message} (Código: ${insertError.code})`);
        }
      }
    } else {
      console.log('✅ [RECURSOS ESPECIAIS] Cliente Sistema encontrado:', clienteSistema.rows[0].id);
    }

    // Buscar ou criar serviço "Almoço"
    let servicoAlmoco = await pool.query(
      "SELECT id, nome, duracao_minutos, preco FROM protese.servicos WHERE nome = 'Almoço' LIMIT 1"
    );

    if (servicoAlmoco.rows.length === 0) {
      try {
        console.log('📝 [RECURSOS ESPECIAIS] Criando serviço Almoço...');
        const novoServicoAlmoco = await pool.query(
          `INSERT INTO protese.servicos (nome, descricao, duracao_minutos, preco, is_active)
           VALUES ('Almoço', 'Horário de almoço', 60, 0.00, true)
           RETURNING id, nome, duracao_minutos, preco`
        );
        servicoAlmoco = novoServicoAlmoco;
        console.log('✅ [RECURSOS ESPECIAIS] Serviço Almoço criado:', novoServicoAlmoco.rows[0].id);
      } catch (insertError) {
        console.error('❌ [RECURSOS ESPECIAIS] Erro ao criar serviço Almoço:', insertError.message);
        console.error('❌ [RECURSOS ESPECIAIS] Código do erro:', insertError.code);
        console.error('❌ [RECURSOS ESPECIAIS] Detalhes:', insertError.detail);
        console.error('❌ [RECURSOS ESPECIAIS] Stack:', insertError.stack);
        
        // Se der erro, tentar buscar novamente
        if (insertError.code === '23505') {
          console.log('⚠️ [RECURSOS ESPECIAIS] Serviço Almoço já existe, buscando novamente...');
          servicoAlmoco = await pool.query(
            "SELECT id, nome, duracao_minutos, preco FROM protese.servicos WHERE nome = 'Almoço' LIMIT 1"
          );
        } else {
          throw new Error(`Erro ao criar serviço Almoço: ${insertError.message} (Código: ${insertError.code})`);
        }
      }
    } else {
      console.log('✅ [RECURSOS ESPECIAIS] Serviço Almoço encontrado:', servicoAlmoco.rows[0].id);
    }

    // Buscar ou criar serviço "Saída"
    let servicoSaida = await pool.query(
      "SELECT id, nome, duracao_minutos, preco FROM protese.servicos WHERE nome = 'Saída' LIMIT 1"
    );

    if (servicoSaida.rows.length === 0) {
      try {
        console.log('📝 [RECURSOS ESPECIAIS] Criando serviço Saída...');
        const novoServicoSaida = await pool.query(
          `INSERT INTO protese.servicos (nome, descricao, duracao_minutos, preco, is_active)
           VALUES ('Saída', 'Horário de saída', 15, 0.00, true)
           RETURNING id, nome, duracao_minutos, preco`
        );
        servicoSaida = novoServicoSaida;
        console.log('✅ [RECURSOS ESPECIAIS] Serviço Saída criado:', novoServicoSaida.rows[0].id);
      } catch (insertError) {
        console.error('❌ [RECURSOS ESPECIAIS] Erro ao criar serviço Saída:', insertError.message);
        console.error('❌ [RECURSOS ESPECIAIS] Código do erro:', insertError.code);
        console.error('❌ [RECURSOS ESPECIAIS] Detalhes:', insertError.detail);
        console.error('❌ [RECURSOS ESPECIAIS] Stack:', insertError.stack);
        
        // Se der erro, tentar buscar novamente
        if (insertError.code === '23505') {
          console.log('⚠️ [RECURSOS ESPECIAIS] Serviço Saída já existe, buscando novamente...');
          servicoSaida = await pool.query(
            "SELECT id, nome, duracao_minutos, preco FROM protese.servicos WHERE nome = 'Saída' LIMIT 1"
          );
        } else {
          throw new Error(`Erro ao criar serviço Saída: ${insertError.message} (Código: ${insertError.code})`);
        }
      }
    } else {
      console.log('✅ [RECURSOS ESPECIAIS] Serviço Saída encontrado:', servicoSaida.rows[0].id);
    }

    if (!clienteSistema.rows[0] || !servicoAlmoco.rows[0] || !servicoSaida.rows[0]) {
      throw new Error('Não foi possível obter todos os recursos necessários');
    }

    console.log('✅ [RECURSOS ESPECIAIS] Todos os recursos obtidos com sucesso');
    res.json({
      cliente_sistema: clienteSistema.rows[0],
      servico_almoco: servicoAlmoco.rows[0],
      servico_saida: servicoSaida.rows[0],
    });
  } catch (error) {
    console.error('❌ [RECURSOS ESPECIAIS] Erro ao buscar/criar recursos especiais:', error);
    console.error('❌ [RECURSOS ESPECIAIS] Mensagem:', error.message);
    console.error('❌ [RECURSOS ESPECIAIS] Stack:', error.stack);
    res.status(500).json({ 
      error: 'Erro ao buscar/criar recursos especiais', 
      message: error.message,
      code: error.code,
      detail: error.detail
    });
  }
});

/**
 * POST /api/v1/agendamentos
 * Cria um novo agendamento
 */
router.post('/', async (req, res) => {
  try {
    console.log('🚀 [POST AGENDAMENTO] Requisição recebida');
    console.log('📋 [POST AGENDAMENTO] Headers:', {
      'x-user-id': req.headers['x-user-id'],
      'x-user-tipo': req.headers['x-user-tipo'],
      'x-user-nome': req.headers['x-user-nome'],
      'authorization': req.headers['authorization'] ? 'Bearer ***' : 'não definido'
    });
    console.log('📦 [POST AGENDAMENTO] Body:', req.body);

    const usuarioId = req.headers['x-user-id'];
    const usuarioTipo = req.headers['x-user-tipo'] || 'administrativo';

    // Verificar permissão de edição
    if (usuarioTipo !== 'master') {
      if (!usuarioId) {
        console.error('❌ [POST AGENDAMENTO] usuarioId não fornecido');
        return res.status(401).json({ error: 'Usuário não autenticado. Forneça x-user-id no header.' });
      }

      const permissoesResult = await pool.query(
        'SELECT agenda_editar FROM protese.permissoes_usuarios WHERE usuario_id = $1',
        [usuarioId]
      );

      if (permissoesResult.rows.length === 0 || !permissoesResult.rows[0].agenda_editar) {
        console.error('❌ [POST AGENDAMENTO] Permissão negada para usuário:', usuarioId);
        return res.status(403).json({ error: 'Acesso negado. Permissão insuficiente.' });
      }
      console.log('✅ [POST AGENDAMENTO] Permissão verificada');
    } else {
      console.log('✅ [POST AGENDAMENTO] Usuário master, permissão concedida');
    }

    const {
      cliente_id,
      funcionario_id,
      servico_id,
      data_agendamento,
      hora_inicio,
      hora_fim, // Opcional - se não fornecido, será calculado
      observacoes,
      status = 'agendado',
      valor_servico // Opcional - se não fornecido, será buscado do serviço
    } = req.body;

    // Validações detalhadas
    const camposFaltando = [];
    if (!cliente_id) camposFaltando.push('cliente_id');
    if (!funcionario_id) camposFaltando.push('funcionario_id');
    if (!servico_id) camposFaltando.push('servico_id');
    if (!data_agendamento) camposFaltando.push('data_agendamento');
    if (!hora_inicio) camposFaltando.push('hora_inicio');

    if (camposFaltando.length > 0) {
      console.error('❌ [POST AGENDAMENTO] Campos obrigatórios faltando:', camposFaltando);
      return res.status(400).json({
        error: `Campos obrigatórios faltando: ${camposFaltando.join(', ')}`,
        campos_faltando: camposFaltando
      });
    }

    console.log('✅ [POST AGENDAMENTO] Validações básicas passaram');

    // Buscar serviço para obter duração e valor
    console.log('🔍 [POST AGENDAMENTO] Buscando serviço:', servico_id);
    const servicoResult = await pool.query(
      'SELECT duracao_minutos, preco FROM protese.servicos WHERE id = $1',
      [servico_id]
    );

    if (servicoResult.rows.length === 0) {
      console.error('❌ [POST AGENDAMENTO] Serviço não encontrado:', servico_id);
      return res.status(404).json({ error: 'Serviço não encontrado' });
    }

    const servico = servicoResult.rows[0];
    const duracaoMinutos = servico.duracao_minutos || 30;
    
    // Se valor_servico foi fornecido no body, usar ele (permite 0 para almoço/saída)
    // Caso contrário, usar o preço do serviço
    const valorServico = valor_servico !== undefined ? parseFloat(valor_servico) : (servico.preco || 0);
    
    console.log('✅ [POST AGENDAMENTO] Serviço encontrado:', {
      duracao_minutos: duracaoMinutos,
      valor_do_servico: servico.preco,
      valor_usado: valorServico,
      valor_fornecido_no_body: valor_servico !== undefined
    });

    // Se hora_fim foi fornecido no body, usar ele (para almoço/saída com horário customizado)
    // Caso contrário, calcular baseado na duração do serviço
    let hora_fim_final;
    if (hora_fim) {
      hora_fim_final = hora_fim;
      console.log('✅ [POST AGENDAMENTO] hora_fim fornecido no body:', hora_fim_final);
    } else {
      // Calcular hora_fim baseado na duração do serviço
      const [horaH, minutoM] = hora_inicio.split(':').map(Number);
      const inicioMinutos = horaH * 60 + minutoM;
      const fimMinutos = inicioMinutos + duracaoMinutos;
      const horaFimH = Math.floor(fimMinutos / 60);
      const minutoFimM = fimMinutos % 60;
      hora_fim_final = `${String(horaFimH).padStart(2, '0')}:${String(minutoFimM).padStart(2, '0')}`;
      console.log('✅ [POST AGENDAMENTO] hora_fim calculado:', hora_fim_final);
    }

    // Verificar conflitos de horário
    console.log('🔍 [POST AGENDAMENTO] Verificando conflitos de horário...');
    const conflitoResult = await pool.query(
      `SELECT id FROM protese.agendamentos 
       WHERE funcionario_id = $1 
       AND data_agendamento = $2 
       AND hora_inicio = $3
       AND status NOT IN ('cancelado', 'nao_compareceu')`,
      [funcionario_id, data_agendamento, hora_inicio]
    );

    if (conflitoResult.rows.length > 0) {
      console.error('❌ [POST AGENDAMENTO] Conflito encontrado - horário já ocupado');
      return res.status(409).json({ error: 'Já existe um agendamento neste horário para este funcionário' });
    }

    // Verificar sobreposição de horários
    console.log('🔍 [POST AGENDAMENTO] Verificando sobreposição de horários...');
    const sobreposicaoResult = await pool.query(
      `SELECT id FROM protese.agendamentos 
       WHERE funcionario_id = $1 
       AND data_agendamento = $2 
       AND status NOT IN ('cancelado', 'nao_compareceu')
       AND (
         (hora_inicio < $3 AND hora_fim > $3) OR
         (hora_inicio < $4 AND hora_fim > $4) OR
         (hora_inicio >= $3 AND hora_fim <= $4)
       )`,
      [funcionario_id, data_agendamento, hora_inicio, hora_fim_final]
    );

    if (sobreposicaoResult.rows.length > 0) {
      console.error('❌ [POST AGENDAMENTO] Sobreposição encontrada');
      return res.status(409).json({ error: 'Horário conflita com outro agendamento existente' });
    }

    console.log('✅ [POST AGENDAMENTO] Nenhum conflito encontrado');

    // Criar agendamento
    console.log('💾 [POST AGENDAMENTO] Inserindo agendamento no banco...');
    const result = await pool.query(
      `INSERT INTO protese.agendamentos 
       (cliente_id, funcionario_id, servico_id, data_agendamento, hora_inicio, hora_fim, status, observacoes, valor_servico, created_by)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *`,
      [cliente_id, funcionario_id, servico_id, data_agendamento, hora_inicio, hora_fim_final, status, observacoes || null, valorServico, usuarioId]
    );

    console.log('✅ [POST AGENDAMENTO] Agendamento criado com sucesso:', result.rows[0].id);

    // Registrar log
    try {
      await registrarLog({
        usuario_id: usuarioId,
        usuario_tipo: usuarioTipo,
        usuario_nome: req.headers['x-user-nome'] || 'Sistema',
        acao: 'criar',
        modulo: 'agenda',
        entidade_id: result.rows[0].id,
        entidade_tipo: 'agendamento',
        descricao: `Agendamento criado para ${data_agendamento} às ${hora_inicio}`,
        dados_novos: result.rows[0],
        ip_address: getClientIp(req),
        user_agent: getUserAgent(req)
      });
      console.log('✅ [POST AGENDAMENTO] Log registrado');
    } catch (logError) {
      console.error('⚠️ [POST AGENDAMENTO] Erro ao registrar log (não crítico):', logError);
      // Não falha a requisição se o log der erro
    }

    res.status(201).json({ agendamento: result.rows[0] });
  } catch (error) {
    console.error('❌ [POST AGENDAMENTO] Erro ao criar agendamento:', error);
    console.error('❌ [POST AGENDAMENTO] Stack:', error.stack);
    res.status(500).json({ 
      error: 'Erro ao criar agendamento',
      message: error.message || 'Erro interno do servidor'
    });
  }
});

/**
 * PUT /api/v1/agendamentos/:id
 * Atualiza um agendamento existente
 */
router.put('/:id', async (req, res) => {
  try {
    const usuarioId = req.headers['x-user-id'];
    const usuarioTipo = req.headers['x-user-tipo'] || 'administrativo';

    // Verificar permissão de edição
    if (usuarioTipo !== 'master') {
      const permissoesResult = await pool.query(
        'SELECT agenda_editar FROM protese.permissoes_usuarios WHERE usuario_id = $1',
        [usuarioId]
      );

      if (permissoesResult.rows.length === 0 || !permissoesResult.rows[0].agenda_editar) {
        return res.status(403).json({ error: 'Acesso negado. Permissão insuficiente.' });
      }
    }

    const { id } = req.params;
    const {
      cliente_id,
      funcionario_id,
      servico_id,
      data_agendamento,
      hora_inicio,
      observacoes,
      status
    } = req.body;

    // Buscar agendamento atual
    const agendamentoAtualResult = await pool.query(
      'SELECT * FROM protese.agendamentos WHERE id = $1',
      [id]
    );

    if (agendamentoAtualResult.rows.length === 0) {
      return res.status(404).json({ error: 'Agendamento não encontrado' });
    }

    const agendamentoAtual = agendamentoAtualResult.rows[0];

    // Se hora_inicio ou servico_id mudaram, recalcular hora_fim
    let hora_fim = agendamentoAtual.hora_fim;
    if (hora_inicio || servico_id) {
      const servicoId = servico_id || agendamentoAtual.servico_id;
      const servicoResult = await pool.query(
        'SELECT duracao_minutos FROM protese.servicos WHERE id = $1',
        [servicoId]
      );

      if (servicoResult.rows.length === 0) {
        return res.status(404).json({ error: 'Serviço não encontrado' });
      }

      const horaInicio = hora_inicio || agendamentoAtual.hora_inicio;
      const duracaoMinutos = servicoResult.rows[0].duracao_minutos || 30;
      const [horaH, minutoM] = horaInicio.split(':').map(Number);
      const inicioMinutos = horaH * 60 + minutoM;
      const fimMinutos = inicioMinutos + duracaoMinutos;
      const horaFimH = Math.floor(fimMinutos / 60);
      const minutoFimM = fimMinutos % 60;
      hora_fim = `${String(horaFimH).padStart(2, '0')}:${String(minutoFimM).padStart(2, '0')}`;
    }

    // Verificar conflitos se horário mudou
    if (hora_inicio || data_agendamento || funcionario_id) {
      const funcionarioId = funcionario_id || agendamentoAtual.funcionario_id;
      const dataAgendamento = data_agendamento || agendamentoAtual.data_agendamento;
      const horaInicio = hora_inicio || agendamentoAtual.hora_inicio;

      const conflitoResult = await pool.query(
        `SELECT id FROM protese.agendamentos 
         WHERE funcionario_id = $1 
         AND data_agendamento = $2 
         AND hora_inicio = $3
         AND id != $4
         AND status NOT IN ('cancelado', 'nao_compareceu')`,
        [funcionarioId, dataAgendamento, horaInicio, id]
      );

      if (conflitoResult.rows.length > 0) {
        return res.status(409).json({ error: 'Já existe um agendamento neste horário para este funcionário' });
      }
    }

    // Atualizar agendamento
    const result = await pool.query(
      `UPDATE protese.agendamentos 
       SET cliente_id = COALESCE($1, cliente_id),
           funcionario_id = COALESCE($2, funcionario_id),
           servico_id = COALESCE($3, servico_id),
           data_agendamento = COALESCE($4, data_agendamento),
           hora_inicio = COALESCE($5, hora_inicio),
           hora_fim = COALESCE($6, hora_fim),
           status = COALESCE($7, status),
           observacoes = COALESCE($8, observacoes),
           updated_by = $9,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $10
       RETURNING *`,
      [cliente_id, funcionario_id, servico_id, data_agendamento, hora_inicio, hora_fim, status, observacoes, usuarioId, id]
    );

    // Registrar log
    await registrarLog({
      usuario_id: usuarioId,
      usuario_tipo: usuarioTipo,
      usuario_nome: req.headers['x-user-nome'] || 'Sistema',
      acao: 'editar',
      modulo: 'agenda',
      entidade_id: id,
      entidade_tipo: 'agendamento',
      descricao: `Agendamento atualizado`,
      dados_anteriores: agendamentoAtual,
      dados_novos: result.rows[0],
      ip_address: getClientIp(req),
      user_agent: getUserAgent(req)
    });

    res.json({ agendamento: result.rows[0] });
  } catch (error) {
    console.error('Erro ao atualizar agendamento:', error);
    res.status(500).json({ error: 'Erro ao atualizar agendamento' });
  }
});

/**
 * DELETE /api/v1/agendamentos/:id
 * Exclui um agendamento
 */
router.delete('/:id', async (req, res) => {
  try {
    const usuarioId = req.headers['x-user-id'];
    const usuarioTipo = req.headers['x-user-tipo'] || 'administrativo';

    // Verificar permissão de exclusão
    if (usuarioTipo !== 'master') {
      const permissoesResult = await pool.query(
        'SELECT agenda_excluir FROM protese.permissoes_usuarios WHERE usuario_id = $1',
        [usuarioId]
      );

      if (permissoesResult.rows.length === 0 || !permissoesResult.rows[0].agenda_excluir) {
        return res.status(403).json({ error: 'Acesso negado. Permissão insuficiente.' });
      }
    }

    const { id } = req.params;

    // Buscar agendamento antes de excluir
    const agendamentoResult = await pool.query(
      'SELECT * FROM protese.agendamentos WHERE id = $1',
      [id]
    );

    if (agendamentoResult.rows.length === 0) {
      return res.status(404).json({ error: 'Agendamento não encontrado' });
    }

    const agendamento = agendamentoResult.rows[0];

    // Excluir agendamento
    await pool.query('DELETE FROM protese.agendamentos WHERE id = $1', [id]);

    // Registrar log
    await registrarLog({
      usuario_id: usuarioId,
      usuario_tipo: usuarioTipo,
      usuario_nome: req.headers['x-user-nome'] || 'Sistema',
      acao: 'excluir',
      modulo: 'agenda',
      entidade_id: id,
      entidade_tipo: 'agendamento',
      descricao: `Agendamento excluído`,
      dados_anteriores: agendamento,
      ip_address: getClientIp(req),
      user_agent: getUserAgent(req)
    });

    res.json({ message: 'Agendamento excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir agendamento:', error);
    res.status(500).json({ error: 'Erro ao excluir agendamento' });
  }
});

module.exports = router;


