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

    const result = await pool.query(query, params);

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

    // Obter configurações (horário de funcionamento e intervalo)
    const configResult = await pool.query('SELECT * FROM protese.configuracoes ORDER BY created_at DESC LIMIT 1');
    if (configResult.rows.length === 0) {
      return res.status(404).json({ error: 'Configurações não encontradas' });
    }

    const config = configResult.rows[0];
    const intervalo = Math.max(1, config.intervalo_agendamento || 30); // Mínimo 1 minuto

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
    const diaAtivo = config[campoAtivo];

    if (!diaAtivo || !horaAbertura || !horaFechamento) {
      return res.json({ disponibilidades: [] });
    }

    // Converter horas para minutos desde meia-noite
    const [horaAberturaH, minutoAberturaM] = horaAbertura.split(':').map(Number);
    const [horaFechamentoH, minutoFechamentoM] = horaFechamento.split(':').map(Number);
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

    // Se não houver agendamentos, retornar todo o horário de funcionamento dividido pelo intervalo
    if (agendamentos.length === 0) {
      const disponibilidades = [];
      let horaAtual = inicioMinutos;

      while (horaAtual + intervalo <= fimMinutos) {
        const horaInicio = Math.floor(horaAtual / 60);
        const minutoInicio = horaAtual % 60;
        const horaFim = Math.floor((horaAtual + intervalo) / 60);
        const minutoFim = (horaAtual + intervalo) % 60;

        disponibilidades.push({
          hora_inicio: `${String(horaInicio).padStart(2, '0')}:${String(minutoInicio).padStart(2, '0')}`,
          hora_fim: `${String(horaFim).padStart(2, '0')}:${String(minutoFim).padStart(2, '0')}`
        });

        horaAtual += intervalo;
      }

      return res.json({ disponibilidades });
    }

    // Calcular horários livres
    const disponibilidades = [];
    let horaAtual = inicioMinutos;

    for (const agendamento of agendamentos) {
      const [horaInicioH, minutoInicioM] = agendamento.hora_inicio.split(':').map(Number);
      const [horaFimH, minutoFimM] = agendamento.hora_fim.split(':').map(Number);
      const inicioAgendamento = horaInicioH * 60 + minutoInicioM;
      const fimAgendamento = horaFimH * 60 + minutoFimM;

      // Se houver espaço antes do agendamento
      if (horaAtual < inicioAgendamento) {
        let horaDisponivel = horaAtual;
        while (horaDisponivel + intervalo <= inicioAgendamento) {
          const horaInicio = Math.floor(horaDisponivel / 60);
          const minutoInicio = horaDisponivel % 60;
          const horaFim = Math.floor((horaDisponivel + intervalo) / 60);
          const minutoFim = (horaDisponivel + intervalo) % 60;

          disponibilidades.push({
            hora_inicio: `${String(horaInicio).padStart(2, '0')}:${String(minutoInicio).padStart(2, '0')}`,
            hora_fim: `${String(horaFim).padStart(2, '0')}:${String(minutoFim).padStart(2, '0')}`
          });

          horaDisponivel += intervalo;
        }
      }

      horaAtual = Math.max(horaAtual, fimAgendamento);
    }

    // Adicionar horários disponíveis após o último agendamento
    while (horaAtual + intervalo <= fimMinutos) {
      const horaInicio = Math.floor(horaAtual / 60);
      const minutoInicio = horaAtual % 60;
      const horaFim = Math.floor((horaAtual + intervalo) / 60);
      const minutoFim = (horaAtual + intervalo) % 60;

      disponibilidades.push({
        hora_inicio: `${String(horaInicio).padStart(2, '0')}:${String(minutoInicio).padStart(2, '0')}`,
        hora_fim: `${String(horaFim).padStart(2, '0')}:${String(minutoFim).padStart(2, '0')}`
      });

      horaAtual += intervalo;
    }

    res.json({ disponibilidades });
  } catch (error) {
    console.error('Erro ao calcular disponibilidades:', error);
    res.status(500).json({ error: 'Erro ao calcular disponibilidades' });
  }
});

/**
 * GET /api/v1/agendamentos/horarios-funcionamento
 * Retorna os horários de funcionamento para uma data específica
 */
router.get('/horarios-funcionamento', async (req, res) => {
  try {
    const { data } = req.query;

    if (!data) {
      return res.status(400).json({ error: 'Data é obrigatória' });
    }

    // Obter configurações
    const configResult = await pool.query('SELECT * FROM protese.configuracoes ORDER BY created_at DESC LIMIT 1');
    if (configResult.rows.length === 0) {
      return res.status(404).json({ error: 'Configurações não encontradas' });
    }

    const config = configResult.rows[0];

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
    const diaAtivo = config[campoAtivo];

    // Verificar se os valores existem e são válidos
    // PostgreSQL pode retornar boolean como true/false ou 't'/'f'
    const diaAtivoBool = diaAtivo === true || diaAtivo === 't' || diaAtivo === 'true';
    
    if (!diaAtivoBool || !horaAbertura || !horaFechamento) {
      return res.json({
        dia_ativo: false,
        hora_abertura: null,
        hora_fechamento: null,
        horarios: []
      });
    }

    // Gerar horários de 15 em 15 minutos
    // O PostgreSQL retorna TIME como 'HH:MM:SS', precisamos pegar apenas HH:MM
    const horaAberturaStr = horaAbertura.toString();
    const horaFechamentoStr = horaFechamento.toString();
    const horaAberturaFormatada = horaAberturaStr.length > 5 ? horaAberturaStr.substring(0, 5) : horaAberturaStr;
    const horaFechamentoFormatada = horaFechamentoStr.length > 5 ? horaFechamentoStr.substring(0, 5) : horaFechamentoStr;
    
    const [horaAberturaH, minutoAberturaM] = horaAberturaFormatada.split(':').map(Number);
    const [horaFechamentoH, minutoFechamentoM] = horaFechamentoFormatada.split(':').map(Number);
    const inicioMinutos = horaAberturaH * 60 + minutoAberturaM;
    const fimMinutos = horaFechamentoH * 60 + minutoFechamentoM;

    const horarios = [];
    let minutosAtuais = inicioMinutos;

    while (minutosAtuais <= fimMinutos) {
      const horas = Math.floor(minutosAtuais / 60);
      const minutos = minutosAtuais % 60;
      horarios.push(`${String(horas).padStart(2, '0')}:${String(minutos).padStart(2, '0')}`);
      minutosAtuais += 15;
    }

    res.json({
      dia_ativo: true,
      dia_semana: diaNome,
      hora_abertura: horaAberturaFormatada,
      hora_fechamento: horaFechamentoFormatada,
      horarios: horarios
    });
  } catch (error) {
    console.error('Erro ao buscar horários de funcionamento:', error);
    res.status(500).json({ error: 'Erro ao buscar horários de funcionamento' });
  }
});

/**
 * POST /api/v1/agendamentos
 * Cria um novo agendamento
 */
router.post('/', async (req, res) => {
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

    const {
      cliente_id,
      funcionario_id,
      servico_id,
      data_agendamento,
      hora_inicio,
      observacoes,
      status = 'agendado'
    } = req.body;

    // Validações
    if (!cliente_id || !funcionario_id || !servico_id || !data_agendamento || !hora_inicio) {
      return res.status(400).json({
        error: 'Campos obrigatórios: cliente_id, funcionario_id, servico_id, data_agendamento, hora_inicio'
      });
    }

    // Buscar serviço para obter duração e valor
    const servicoResult = await pool.query(
      'SELECT duracao_minutos, preco FROM protese.servicos WHERE id = $1',
      [servico_id]
    );

    if (servicoResult.rows.length === 0) {
      return res.status(404).json({ error: 'Serviço não encontrado' });
    }

    const servico = servicoResult.rows[0];
    const duracaoMinutos = servico.duracao_minutos || 30;
    const valorServico = servico.preco || 0;

    // Calcular hora_fim
    const [horaH, minutoM] = hora_inicio.split(':').map(Number);
    const inicioMinutos = horaH * 60 + minutoM;
    const fimMinutos = inicioMinutos + duracaoMinutos;
    const horaFimH = Math.floor(fimMinutos / 60);
    const minutoFimM = fimMinutos % 60;
    const hora_fim = `${String(horaFimH).padStart(2, '0')}:${String(minutoFimM).padStart(2, '0')}`;

    // Verificar conflitos de horário
    const conflitoResult = await pool.query(
      `SELECT id FROM protese.agendamentos 
       WHERE funcionario_id = $1 
       AND data_agendamento = $2 
       AND hora_inicio = $3
       AND status NOT IN ('cancelado', 'nao_compareceu')`,
      [funcionario_id, data_agendamento, hora_inicio]
    );

    if (conflitoResult.rows.length > 0) {
      return res.status(409).json({ error: 'Já existe um agendamento neste horário para este funcionário' });
    }

    // Verificar sobreposição de horários
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
      [funcionario_id, data_agendamento, hora_inicio, hora_fim]
    );

    if (sobreposicaoResult.rows.length > 0) {
      return res.status(409).json({ error: 'Horário conflita com outro agendamento existente' });
    }

    // Criar agendamento
    const result = await pool.query(
      `INSERT INTO protese.agendamentos 
       (cliente_id, funcionario_id, servico_id, data_agendamento, hora_inicio, hora_fim, status, observacoes, valor_servico, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [cliente_id, funcionario_id, servico_id, data_agendamento, hora_inicio, hora_fim, status, observacoes || null, valorServico, usuarioId]
    );

    // Registrar log
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

    res.status(201).json({ agendamento: result.rows[0] });
  } catch (error) {
    console.error('Erro ao criar agendamento:', error);
    res.status(500).json({ error: 'Erro ao criar agendamento' });
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

