'use client'

import { useState, useEffect, useCallback } from 'react'
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, eachDayOfInterval, addDays, subDays, addWeeks, subWeeks, addMonths, subMonths, isSameDay, isSameMonth, getDay } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Calendar as CalendarIcon, Clock, User, Scissors, ChevronLeft, ChevronRight, Search, Plus, X } from 'lucide-react'
import { usePermissions } from '@/hooks/usePermissions'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'

// Função para obter URL da API
function getApiBaseUrl() {
  // Sempre usar a API de produção, pois o backend está rodando lá
  return 'https://api6.actusconsultoria.com.br'
  
  // Código antigo (comentado para referência):
  // if (typeof window !== 'undefined') {
  //   if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
  //     return 'http://localhost:3001'
  //   }
  // }
  // return 'https://api6.actusconsultoria.com.br'
}

// Tipo Funcionario conforme resposta da API
interface Funcionario {
  id: string
  nome_completo: string
  email: string
  cpf: string
  tipo_usuario: 'master' | 'proprietario' | 'funcionario'
  is_active: boolean
  created_at: string
}

// Tipo da resposta da API de funcionários
interface GetFuncionariosResponse {
  funcionarios: Funcionario[]
}

interface Cliente {
  id: string
  nome_completo: string
}

interface Servico {
  id: string
  nome: string
  duracao_minutos: number
  preco: number
}

interface Agendamento {
  id: string
  cliente_id: string
  funcionario_id: string
  servico_id: string
  data_agendamento: string
  hora_inicio: string
  hora_fim: string
  status: string
  observacoes?: string
  valor_servico: number
  cliente_nome: string
  funcionario_nome: string
  servico_nome: string
  duracao_minutos: number
}

interface Disponibilidade {
  hora_inicio: string
}

interface HorariosFuncionamento {
  dia_ativo: boolean
  dia_semana: string
  hora_abertura: string | null
  hora_fechamento: string | null
  horarios: string[]
  motivo_fechamento?: string // Motivo do fechamento especial (feriado, férias, etc.)
}

export default function AgendaPage() {
  console.log('🚀 AgendaPage renderizado')
  
  const [viewMode, setViewMode] = useState<'dia' | 'semana' | 'mes'>('dia')
  const [dataSelecionada, setDataSelecionada] = useState<Date>(new Date())
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([])
  const [disponibilidades, setDisponibilidades] = useState<Disponibilidade[]>([])
  const [loading, setLoading] = useState(false)
  // Estado do filtro de funcionário no calendário
  // "todos" = Todos os funcionários (não envia funcionario_id na query)
  // "uuid-do-funcionario" = Filtra por funcionário específico
  // NOTA: Não usar "" (vazio) porque Select.Item do Radix UI não aceita value vazio
  const [funcionarioFiltro, setFuncionarioFiltro] = useState<string>('todos')
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([])
  const [funcionariosCarregando, setFuncionariosCarregando] = useState(false)
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [servicos, setServicos] = useState<Servico[]>([])
  const [horariosFuncionamento, setHorariosFuncionamento] = useState<HorariosFuncionamento | null>(null)
  // NOVO STATE: Controle explícito do carregamento da grade
  const [gradeLoading, setGradeLoading] = useState(false) // Inicia como false para não travar
  const [dialogAberto, setDialogAberto] = useState(false)
  const [dialogAlmocoSaidaAberto, setDialogAlmocoSaidaAberto] = useState(false)
  const [tipoAlmocoSaida, setTipoAlmocoSaida] = useState<'almoco' | 'saida'>('almoco')
  const [agendamentoEditando, setAgendamentoEditando] = useState<Agendamento | null>(null)
  const [formData, setFormData] = useState({
    cliente_id: '',
    funcionario_id: '',
    servico_id: '',
    data_agendamento: format(new Date(), 'yyyy-MM-dd'),
    hora_inicio: '',
    observacoes: '',
    status: 'agendado' as string,
  })
  const [formAlmocoSaida, setFormAlmocoSaida] = useState({
    funcionario_id: '',
    data_agendamento: format(new Date(), 'yyyy-MM-dd'),
    hora_inicio: '',
    hora_fim: '',
    descricao: '',
  })
  const [dataBusca, setDataBusca] = useState<Date | undefined>(undefined)
  const [funcionarioBusca, setFuncionarioBusca] = useState<string>('')
  const [usuarioLogado, setUsuarioLogado] = useState<any>(null)

  const { podeAcessar, podeEditar, loading: permissoesLoading } = usePermissions()
  
  // Log para monitorar mudanças no estado dataBusca
  useEffect(() => {
    console.log('🔍 [BUSCA CALENDARIO] Estado dataBusca mudou:', dataBusca)
  }, [dataBusca])
  
  console.log('📊 Estado atual - permissoesLoading:', permissoesLoading, 'gradeLoading:', gradeLoading, 'horariosFuncionamento:', horariosFuncionamento)
  console.log('👥 Estado funcionários - carregando:', funcionariosCarregando, 'total:', funcionarios.length, 'funcionários:', funcionarios.map(f => ({ nome: f.nome_completo, tipo: f.tipo_usuario, ativo: f.is_active })))
  console.log('🔍 Estado filtro - funcionarioFiltro:', funcionarioFiltro, 'agendamentos:', agendamentos.length)

  useEffect(() => {
    const adminData = localStorage.getItem('admin')
    if (adminData) {
      setUsuarioLogado(JSON.parse(adminData))
    }
  }, [])

  /**
   * CORREÇÃO: Carregar funcionários para o filtro do calendário
   * 
   * PROBLEMA ORIGINAL:
   * - Estava usando tipo_usuario do admin logado, o que poderia retornar lista incompleta
   * - Havia código duplicado (carregarFuncionarios e fetchFuncionarios)
   * 
   * SOLUÇÃO:
   * - Sempre usar tipo_usuario=master na chamada para garantir lista completa
   * - Filtrar masters no frontend (não devem aparecer no filtro)
   * - Mostrar apenas funcionários ativos
   */
  const carregarFuncionarios = useCallback(async () => {
    setFuncionariosCarregando(true)
    try {
      const apiUrl = getApiBaseUrl()
      // CORREÇÃO: Sempre usar tipo_usuario=master para garantir lista completa
      // O backend retornará todos os funcionários (incluindo masters)
      // Filtraremos masters no frontend
      const url = `${apiUrl}/api/v1/funcionarios?tipo_usuario=master`
      
      console.log('👥 [FILTRO] Carregando funcionários de:', url)
      
      const response = await fetch(url)
      
      if (!response.ok) {
        throw new Error(`Erro ao carregar funcionários: ${response.status} ${response.statusText}`)
      }
      
      const data: GetFuncionariosResponse = await response.json()
      console.log('✅ [FILTRO] Funcionários recebidos da API:', data.funcionarios?.length || 0)
      
      // CORREÇÃO: Filtrar masters e inativos no frontend
      // Apenas funcionários ativos (exceto masters) devem aparecer no filtro
      const funcionariosFiltrados = (data.funcionarios || []).filter((func: Funcionario) => {
        const tipoLower = (func.tipo_usuario || '').toLowerCase()
        const isNotMaster = tipoLower !== 'master'
        const isActive = func.is_active === true
        return isNotMaster && isActive
      })
      
      console.log('✅ [FILTRO] Funcionários filtrados (sem master, apenas ativos):', funcionariosFiltrados.length)
      console.log('📋 [FILTRO] Lista completa:', funcionariosFiltrados.map(f => ({ 
        id: f.id, 
        nome: f.nome_completo, 
        tipo: f.tipo_usuario,
        ativo: f.is_active
      })))
      
      setFuncionarios(funcionariosFiltrados)
      // LOG TEMPORÁRIO: Confirmar que o estado foi atualizado
      console.log('✅ [FILTRO] Estado funcionarios atualizado com', funcionariosFiltrados.length, 'funcionários')
    } catch (error: any) {
      console.error('❌ [FILTRO] Erro ao carregar funcionários:', error)
      // Em caso de erro, definir array vazio para não travar a UI
      setFuncionarios([])
    } finally {
      setFuncionariosCarregando(false)
    }
  }, [])

  const carregarClientes = useCallback(async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return
      const apiUrl = getApiBaseUrl()
      const response = await fetch(`${apiUrl}/api/v1/clientes`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (response.ok) {
        const data = await response.json()
        setClientes(data.clientes || [])
      }
    } catch (error) {
      console.error('Erro ao carregar clientes:', error)
    }
  }, [])

  const carregarServicos = useCallback(async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return
      const apiUrl = getApiBaseUrl()
      const response = await fetch(`${apiUrl}/api/v1/servicos?is_active=true`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (response.ok) {
        const data = await response.json()
        setServicos(data.servicos || [])
      }
    } catch (error) {
      console.error('Erro ao carregar serviços:', error)
    }
  }, [])

  const carregarHorariosFuncionamento = useCallback(async (data: Date) => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        console.warn('Token não encontrado para carregar horários')
        return null
      }
      const apiUrl = getApiBaseUrl()
      const dataFormatada = format(data, 'yyyy-MM-dd')

      const adminData = localStorage.getItem('admin')
      const admin = adminData ? JSON.parse(adminData) : null

      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      }
      if (admin?.id) {
        headers['x-user-id'] = admin.id
        headers['x-user-tipo'] = admin.tipo_usuario || 'administrativo'
      }

      const url = `${apiUrl}/api/v1/agendamentos/horarios-funcionamento?data=${dataFormatada}`
      console.log('🔍 Chamando endpoint:', url)
      
      const response = await fetch(url, { 
        headers,
        method: 'GET'
      })

      console.log('📡 Resposta recebida:', response.status, response.statusText)

      if (response.ok) {
        const data = await response.json()
        console.log('✅ Horários recebidos com sucesso:', data)
        
        // Validar se a resposta tem a estrutura esperada
        if (data && typeof data === 'object') {
          return data as HorariosFuncionamento
        } else {
          console.error('❌ Resposta inválida:', data)
          return null
        }
      } else {
        const errorText = await response.text()
        console.error('❌ Erro na resposta:', response.status, errorText)
        
        // Retornar objeto vazio se for 404 (configurações não encontradas)
        if (response.status === 404) {
          return {
            dia_ativo: false,
            dia_semana: '',
            hora_abertura: null,
            hora_fechamento: null,
            horarios: []
          } as HorariosFuncionamento
        }
      }
      return null
    } catch (error) {
      console.error('❌ Erro ao carregar horários de funcionamento:', error)
      return null
    }
  }, [])

  const carregarAgendamentos = useCallback(async () => {
    console.log('🚀 [AGENDAMENTOS] carregarAgendamentos chamado com:', {
      funcionarioFiltro,
      viewMode,
      dataSelecionada: format(dataSelecionada, 'yyyy-MM-dd')
    })
    
    setLoading(true)
    try {
      const apiUrl = getApiBaseUrl()
      let dataInicio = ''
      let dataFim = ''

      if (viewMode === 'dia') {
        dataInicio = format(dataSelecionada, 'yyyy-MM-dd')
        dataFim = format(dataSelecionada, 'yyyy-MM-dd')
      } else if (viewMode === 'semana') {
        const inicioSemana = startOfWeek(dataSelecionada, { locale: ptBR })
        const fimSemana = endOfWeek(dataSelecionada, { locale: ptBR })
        dataInicio = format(inicioSemana, 'yyyy-MM-dd')
        dataFim = format(fimSemana, 'yyyy-MM-dd')
      } else {
        const inicioMes = startOfMonth(dataSelecionada)
        const fimMes = endOfMonth(dataSelecionada)
        dataInicio = format(inicioMes, 'yyyy-MM-dd')
        dataFim = format(fimMes, 'yyyy-MM-dd')
      }

      // CORREÇÃO: Montar URL com query parameters corretos usando URLSearchParams
      const params = new URLSearchParams()
      params.append('data_inicio', dataInicio)
      params.append('data_fim', dataFim)
      
      // Se funcionarioFiltro for "todos", não enviar funcionario_id (mostra todos)
      // Se funcionarioFiltro tiver um ID (UUID), enviar funcionario_id para filtrar
      console.log('🔍 [AGENDAMENTOS] Verificando filtro:', { 
        funcionarioFiltro, 
        isTodos: funcionarioFiltro === 'todos',
        isEmpty: !funcionarioFiltro || funcionarioFiltro.trim() === '',
        tipo: typeof funcionarioFiltro
      })
      
      if (funcionarioFiltro && funcionarioFiltro !== 'todos' && funcionarioFiltro.trim() !== '') {
        params.append('funcionario_id', funcionarioFiltro)
        console.log('🔍 [AGENDAMENTOS] Filtrando por funcionário:', funcionarioFiltro)
      } else {
        console.log('📋 [AGENDAMENTOS] Mostrando todos os funcionários (sem filtro)')
      }
      
      const url = `${apiUrl}/api/v1/agendamentos?${params.toString()}`
      console.log('📅 [AGENDAMENTOS] URL final:', url)

      const adminData = localStorage.getItem('admin')
      const admin = adminData ? JSON.parse(adminData) : null

      // Buscar token de múltiplas chaves (opcional)
      let token = localStorage.getItem('token') || 
                  localStorage.getItem('authToken') || 
                  localStorage.getItem('accessToken') ||
                  sessionStorage.getItem('token') ||
                  sessionStorage.getItem('authToken')

      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      }
      
      if (token && token.length > 10) {
        headers['Authorization'] = `Bearer ${token}`
      }
      
      if (admin?.id) {
        headers['x-user-id'] = admin.id
        headers['x-user-tipo'] = admin.tipo_usuario || 'administrativo'
        headers['x-user-nome'] = admin.nome_completo || 'Sistema'
      }

      console.log('📡 [AGENDAMENTOS] Fazendo requisição com headers:', {
        'x-user-id': headers['x-user-id'],
        'x-user-tipo': headers['x-user-tipo'],
        'Authorization': headers['Authorization'] ? 'Bearer ***' : 'não definido'
      })

      const response = await fetch(url, { headers })

      console.log('📥 [AGENDAMENTOS] Resposta recebida:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      })

      if (response.ok) {
        const data = await response.json()
        console.log('✅ [AGENDAMENTOS] Agendamentos recebidos:', data.agendamentos?.length || 0)
        console.log('📋 [AGENDAMENTOS] Lista completa de agendamentos:', JSON.stringify(data.agendamentos || [], null, 2))
        console.log('📋 [AGENDAMENTOS] Resumo de agendamentos:', data.agendamentos?.map((a: Agendamento) => ({
          id: a.id,
          cliente: a.cliente_nome,
          funcionario: a.funcionario_nome,
          funcionario_id: a.funcionario_id,
          data: a.data_agendamento,
          hora_inicio: a.hora_inicio,
          hora_fim: a.hora_fim,
          status: a.status
        })))
        setAgendamentos(data.agendamentos || [])
        // LOG TEMPORÁRIO: Confirmar que o estado foi atualizado
        console.log('✅ [AGENDAMENTOS] Estado agendamentos atualizado com', data.agendamentos?.length || 0, 'agendamentos')
      } else {
        const errorText = await response.text()
        console.error('❌ [AGENDAMENTOS] Erro ao carregar agendamentos:', response.status, errorText)
        setAgendamentos([]) // Em caso de erro, definir array vazio
      }
    } catch (error) {
      console.error('❌ [AGENDAMENTOS] Erro ao carregar agendamentos:', error)
      setAgendamentos([]) // Em caso de erro, definir array vazio
    } finally {
      setLoading(false)
    }
  }, [dataSelecionada, funcionarioFiltro, viewMode])

  const [mensagemDisponibilidade, setMensagemDisponibilidade] = useState<{ tipo: 'sucesso' | 'erro' | 'info' | null; texto: string }>({ tipo: null, texto: '' })

  const buscarDisponibilidades = useCallback(async () => {
    // Validações iniciais
    if (!dataBusca) {
      setMensagemDisponibilidade({ tipo: 'erro', texto: 'Selecione uma data' })
      setTimeout(() => setMensagemDisponibilidade({ tipo: null, texto: '' }), 3000)
      return
    }

    if (!funcionarioBusca) {
      setMensagemDisponibilidade({ tipo: 'erro', texto: 'Selecione um funcionário' })
      setTimeout(() => setMensagemDisponibilidade({ tipo: null, texto: '' }), 3000)
      return
    }

    setLoading(true)
    setMensagemDisponibilidade({ tipo: null, texto: '' })
    setDisponibilidades([])

    try {
      // Buscar token em múltiplas chaves possíveis (mesma lógica usada em outras partes)
      let token = localStorage.getItem('token') || 
                  localStorage.getItem('authToken') || 
                  localStorage.getItem('accessToken') ||
                  sessionStorage.getItem('token') ||
                  sessionStorage.getItem('authToken')
      
      // Se ainda não encontrou, tentar outras chaves comuns
      if (!token) {
        const possibleTokenKeys = ['token', 'authToken', 'accessToken', 'auth_token', 'jwt', 'bearer']
        for (const key of possibleTokenKeys) {
          const value = localStorage.getItem(key) || sessionStorage.getItem(key)
          if (value && value.length > 10) {
            token = value
            break
          }
        }
      }
      
      if (!token) {
        // Não exibir erro crítico na tela, apenas log no console
        console.warn('⚠️ [BUSCA DISPONIBILIDADES] Token não encontrado - tentando continuar sem token')
        // Continuar o fluxo - o backend pode permitir ou retornar erro apropriado
        // Não definir mensagem de erro para não assustar o usuário
      }

      const apiUrl = getApiBaseUrl()
      const dataFormatada = format(dataBusca, 'yyyy-MM-dd')

      const adminData = localStorage.getItem('admin')
      const admin = adminData ? JSON.parse(adminData) : null

      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      }
      
      // Só adiciona Authorization se tiver token válido
      if (token && token.length > 10) {
        headers['Authorization'] = `Bearer ${token}`
      }
      
      if (admin?.id) {
        headers['x-user-id'] = admin.id
        headers['x-user-tipo'] = admin.tipo_usuario || 'administrativo'
      }

      console.log('🔍 [BUSCA DISPONIBILIDADES] Buscando:', { data: dataFormatada, funcionario_id: funcionarioBusca })

      const response = await fetch(
        `${apiUrl}/api/v1/agendamentos/disponibilidades?data=${dataFormatada}&funcionario_id=${funcionarioBusca}`,
        { headers }
      )

      if (response.ok) {
        const data = await response.json()
        console.log('✅ [BUSCA DISPONIBILIDADES] Resposta:', data)

        // Verificar se está fechado
        if (data.fechado || data.motivo_fechamento) {
          setMensagemDisponibilidade({ 
            tipo: 'info', 
            texto: `Fechamento especial: ${data.motivo_fechamento || 'Data não disponível para agendamento'}` 
          })
          setDisponibilidades([])
        } else if (data.motivo) {
          setMensagemDisponibilidade({ 
            tipo: 'info', 
            texto: data.motivo 
          })
          setDisponibilidades([])
        } else if (data.disponibilidades && data.disponibilidades.length > 0) {
          setDisponibilidades(data.disponibilidades || [])
          setMensagemDisponibilidade({ 
            tipo: 'sucesso', 
            texto: `${data.disponibilidades.length} horários disponíveis encontrados` 
          })
          setTimeout(() => setMensagemDisponibilidade({ tipo: null, texto: '' }), 3000)
        } else {
          setMensagemDisponibilidade({ 
            tipo: 'info', 
            texto: 'Nenhum horário disponível para esta data' 
          })
          setDisponibilidades([])
        }
      } else {
        const errorData = await response.json().catch(() => ({}))
        setMensagemDisponibilidade({ 
          tipo: 'erro', 
          texto: errorData.error || 'Erro ao buscar disponibilidades' 
        })
        setDisponibilidades([])
      }
    } catch (error: any) {
      console.error('❌ [BUSCA DISPONIBILIDADES] Erro:', error)
      setMensagemDisponibilidade({ 
        tipo: 'erro', 
        texto: error.message || 'Erro ao buscar disponibilidades' 
      })
      setDisponibilidades([])
    } finally {
      setLoading(false)
    }
  }, [dataBusca, funcionarioBusca])

  // Carregar dados iniciais (funcionários, clientes, serviços) - apenas uma vez
  useEffect(() => {
    if (permissoesLoading) {
      return
    }

    // Verificar permissão (mas não bloquear se der erro)
    let podeAcessarAgenda = true
    try {
      if (podeAcessar) {
        podeAcessarAgenda = podeAcessar('agenda')
      }
    } catch (error) {
      console.error('Erro ao verificar permissão:', error)
      podeAcessarAgenda = true // Em caso de erro, permite acesso
    }
    
    if (!podeAcessarAgenda) {
      console.log('🚫 Sem permissão para acessar agenda')
      return
    }

    // Tentar buscar token de várias formas
    let token = localStorage.getItem('token') || 
                localStorage.getItem('authToken') || 
                localStorage.getItem('accessToken') ||
                sessionStorage.getItem('token') ||
                sessionStorage.getItem('authToken')
    
    // Continuar mesmo sem token (modo desenvolvimento)
    if (!token) {
      console.log('⚠️ Continuando sem token para carregar funcionários')
    }

    // CORREÇÃO: Remover código duplicado - usar apenas carregarFuncionarios
    // A função carregarFuncionarios já está definida acima e faz o trabalho correto

    // Carregar clientes inline
    const fetchClientes = async () => {
      try {
        let tokenClientes = localStorage.getItem('token') || 
                            localStorage.getItem('authToken') || 
                            localStorage.getItem('accessToken') ||
                            sessionStorage.getItem('token') ||
                            sessionStorage.getItem('authToken')
        
        const apiUrl = getApiBaseUrl()
        const headers: HeadersInit = {
          'Content-Type': 'application/json',
        }
        
        if (tokenClientes && tokenClientes.length > 10) {
          headers['Authorization'] = `Bearer ${tokenClientes}`
        }
        
        const adminData = localStorage.getItem('admin')
        const admin = adminData ? JSON.parse(adminData) : null
        if (admin?.id) {
          headers['x-user-id'] = admin.id
          headers['x-user-tipo'] = admin.tipo_usuario || 'administrativo'
        }
        
        const response = await fetch(`${apiUrl}/api/v1/clientes`, { headers })
        if (response.ok) {
          const data = await response.json()
          setClientes(data.clientes || [])
        }
      } catch (error) {
        console.error('Erro ao carregar clientes:', error)
      }
    }

    // Carregar serviços inline
    const fetchServicos = async () => {
      try {
        let tokenServicos = localStorage.getItem('token') || 
                            localStorage.getItem('authToken') || 
                            localStorage.getItem('accessToken') ||
                            sessionStorage.getItem('token') ||
                            sessionStorage.getItem('authToken')
        
        const apiUrl = getApiBaseUrl()
        const headers: HeadersInit = {
          'Content-Type': 'application/json',
        }
        
        if (tokenServicos && tokenServicos.length > 10) {
          headers['Authorization'] = `Bearer ${tokenServicos}`
        }
        
        const adminData = localStorage.getItem('admin')
        const admin = adminData ? JSON.parse(adminData) : null
        if (admin?.id) {
          headers['x-user-id'] = admin.id
          headers['x-user-tipo'] = admin.tipo_usuario || 'administrativo'
        }
        
        const response = await fetch(`${apiUrl}/api/v1/servicos?is_active=true`, { headers })
        if (response.ok) {
          const data = await response.json()
          setServicos(data.servicos || [])
        }
      } catch (error) {
        console.error('Erro ao carregar serviços:', error)
      }
    }

    // CORREÇÃO: Carregar funcionários usando a função useCallback (sem duplicação)
    console.log('🔄 Iniciando carregamento de dados iniciais...')
    carregarFuncionarios()
    fetchClientes()
    fetchServicos()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [permissoesLoading]) // Apenas depende de permissoesLoading para evitar loops

  // Carregar horários e agendamentos quando a data, filtro ou viewMode mudar
  useEffect(() => {
    console.log('🔍 useEffect executado - permissoesLoading:', permissoesLoading, 'dataSelecionada:', format(dataSelecionada, 'yyyy-MM-dd'))
    
    // Aguardar permissões carregarem
    if (permissoesLoading) {
      console.log('⏸️ Aguardando permissões...')
      return
    }

    // Verificar permissão de acesso (mas não bloquear se der erro)
    let podeAcessarAgenda = true // Por padrão, permite acesso
    try {
      if (podeAcessar) {
        podeAcessarAgenda = podeAcessar('agenda')
      }
    } catch (error) {
      console.error('Erro ao verificar permissão:', error)
      // Em caso de erro, permite acesso para não travar
      podeAcessarAgenda = true
    }
    
    console.log('🔐 Pode acessar agenda:', podeAcessarAgenda)
    
    // Não bloquear se não tiver permissão explícita - tentar carregar mesmo assim
    // (o backend vai validar as permissões)

    // Verificar token (tentar diferentes chaves possíveis)
    let token = localStorage.getItem('token') || 
                localStorage.getItem('authToken') || 
                localStorage.getItem('accessToken') ||
                sessionStorage.getItem('token') ||
                sessionStorage.getItem('authToken')
    
    // Verificar todas as chaves do localStorage para debug
    const allLocalStorageKeys = Object.keys(localStorage)
    const allLocalStorageItems: Record<string, string> = {}
    allLocalStorageKeys.forEach(key => {
      allLocalStorageItems[key] = localStorage.getItem(key)?.substring(0, 50) || ''
    })
    
    console.log('🎫 Verificando token:', {
      localStorage_token: !!localStorage.getItem('token'),
      localStorage_authToken: !!localStorage.getItem('authToken'),
      localStorage_accessToken: !!localStorage.getItem('accessToken'),
      sessionStorage_token: !!sessionStorage.getItem('token'),
      token_encontrado: !!token,
      token_length: token?.length || 0,
      todas_chaves: allLocalStorageKeys,
      todos_itens: allLocalStorageItems
    })
    
    if (!token) {
      console.log('❌ Token não encontrado em nenhum local')
      console.log('📋 Todos os itens do localStorage:', allLocalStorageKeys)
      console.log('📋 Valores do localStorage:', allLocalStorageItems)
      
      // Tentar buscar token de outras formas comuns
      const possibleTokenKeys = ['token', 'authToken', 'accessToken', 'auth_token', 'jwt', 'bearer']
      for (const key of possibleTokenKeys) {
        const value = localStorage.getItem(key) || sessionStorage.getItem(key)
        if (value && value.length > 10) {
          console.log(`✅ Token encontrado na chave: ${key}`)
          token = value
          break
        }
      }
      
      // Se ainda não encontrou token, tentar fazer requisição sem token (apenas para desenvolvimento)
      // ou usar uma solução alternativa
      if (!token) {
        console.log('⚠️ Tentando carregar sem token (modo desenvolvimento)')
        // Continuar mesmo sem token - o backend pode permitir ou retornar erro
        token = '' // Token vazio, mas continua o fluxo
      }
    }

    // Função interna para gerenciar o loading da grade
    const fetchDados = async () => {
      console.log('🔄 fetchDados chamado - setando gradeLoading = true')
      setGradeLoading(true) // Começa a carregar
      console.log('🔄 Iniciando carregamento de horários para:', format(dataSelecionada, 'yyyy-MM-dd'))
      try {
        const apiUrl = getApiBaseUrl()
        const dataFormatada = format(dataSelecionada, 'yyyy-MM-dd')
        const adminData = localStorage.getItem('admin')
        const admin = adminData ? JSON.parse(adminData) : null

        const headers: HeadersInit = {
          'Content-Type': 'application/json',
        }
        
        // Só adiciona Authorization se tiver token válido
        if (token && token.length > 10) {
          headers['Authorization'] = `Bearer ${token}`
          console.log('🔑 Usando token para autenticação')
        } else {
          console.log('⚠️ Fazendo requisição sem token (modo desenvolvimento)')
        }
        
        if (admin?.id) {
          headers['x-user-id'] = admin.id
          headers['x-user-tipo'] = admin.tipo_usuario || 'administrativo'
        }

        const url = `${apiUrl}/api/v1/agendamentos/horarios-funcionamento?data=${dataFormatada}`
        console.log('📡 Chamando:', url)
        const response = await fetch(url, { headers, method: 'GET' })

        console.log('📥 Resposta recebida:', response.status, response.statusText)

        if (response.ok) {
          const data = await response.json()
          console.log('✅ Dados recebidos do backend (JSON completo):', JSON.stringify(data, null, 2))
          console.log('📊 Detalhes dos dados recebidos:', {
            dia_ativo: data.dia_ativo,
            dia_semana: data.dia_semana,
            hora_abertura: data.hora_abertura,
            hora_fechamento: data.hora_fechamento,
            horariosLength: data.horarios?.length || 0,
            horarios: data.horarios
          })
          
          if (data && typeof data === 'object') {
            // Garantir que horarios é um array
            const horariosArray = Array.isArray(data.horarios) ? data.horarios : []
            console.log('📊 Horários processados:', horariosArray.length, 'horários')
            
            setHorariosFuncionamento({
              dia_ativo: data.dia_ativo || false,
              dia_semana: data.dia_semana || '',
              hora_abertura: data.hora_abertura || null,
              hora_fechamento: data.hora_fechamento || null,
              horarios: horariosArray,
              motivo_fechamento: data.motivo_fechamento || undefined
            } as HorariosFuncionamento)
          } else {
            console.warn('⚠️ Resposta inválida:', data)
            setHorariosFuncionamento({
              dia_ativo: false,
              dia_semana: '',
              hora_abertura: null,
              hora_fechamento: null,
              horarios: []
            })
          }
        } else {
          const errorText = await response.text()
          console.error('❌ Erro na resposta:', response.status, errorText)
          setHorariosFuncionamento({
            dia_ativo: false,
            dia_semana: '',
            hora_abertura: null,
            hora_fechamento: null,
            horarios: []
          })
        }
      } catch (err) {
        console.error('❌ Erro ao carregar horários do backend:', err)
        
        // SOLUÇÃO ALTERNATIVA: Identificar dia da semana no frontend e gerar horários
        console.log('🔄 Tentando solução alternativa: identificar dia da semana no frontend')
        
        try {
          // Identificar dia da semana da data selecionada
          const dataFormatada = format(dataSelecionada, 'yyyy-MM-dd')
          const [ano, mes, dia] = dataFormatada.split('-').map(Number)
          const dataObj = new Date(ano, mes - 1, dia)
          const diaSemana = dataObj.getDay() // 0-6
          const diasSemana = ['domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado']
          const diaNome = diasSemana[diaSemana]
          
          console.log('📅 Dia da semana identificado no frontend:', diaNome, '(índice:', diaSemana, ')')
          
          // Horários padrão para desenvolvimento (baseado nas configurações que você enviou)
          // Segunda a Sexta: 08:00 - 18:00, Sábado: 08:00 - 12:00
          let horaAbertura = '08:00'
          let horaFechamento = '18:00'
          let diaAtivo = true
          
          if (diaNome === 'sabado') {
            horaFechamento = '12:00'
          } else if (diaNome === 'domingo') {
            diaAtivo = false
          }
          
          if (diaAtivo) {
            // Gerar horários de 15 em 15 minutos
            const [hInicio, mInicio] = horaAbertura.split(':').map(Number)
            const [hFim, mFim] = horaFechamento.split(':').map(Number)
            const inicioMinutos = hInicio * 60 + mInicio
            const fimMinutos = hFim * 60 + mFim
            const horarios: string[] = []
            
            let minutosAtuais = inicioMinutos
            while (minutosAtuais < fimMinutos) {
              const horas = Math.floor(minutosAtuais / 60)
              const minutos = minutosAtuais % 60
              horarios.push(`${String(horas).padStart(2, '0')}:${String(minutos).padStart(2, '0')}`)
              minutosAtuais += 15
            }
            
            console.log('✅ Horários gerados localmente:', horarios.length, 'horários')
            
            setHorariosFuncionamento({
              dia_ativo: true,
              dia_semana: diaNome,
              hora_abertura: horaAbertura,
              hora_fechamento: horaFechamento,
              horarios: horarios
            })
          } else {
            setHorariosFuncionamento({
              dia_ativo: false,
              dia_semana: diaNome,
              hora_abertura: null,
              hora_fechamento: null,
              horarios: []
            })
          }
        } catch (fallbackError) {
          console.error('❌ Erro na solução alternativa:', fallbackError)
          setHorariosFuncionamento({
            dia_ativo: false,
            dia_semana: '',
            hora_abertura: null,
            hora_fechamento: null,
            horarios: []
          })
        }
      } finally {
        console.log('✅ Carregamento finalizado, setando gradeLoading = false')
        setGradeLoading(false) // Termina SEMPRE, com sucesso ou erro
      }
    }

    console.log('🚀 Chamando fetchDados()...')
    fetchDados()
    console.log('✅ fetchDados() chamado')
    
    // CORREÇÃO: Usar carregarAgendamentos (useCallback) em vez de função duplicada
    // A função carregarAgendamentos já está definida acima e faz o trabalho correto
    carregarAgendamentos()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataSelecionada, funcionarioFiltro, viewMode, permissoesLoading, carregarAgendamentos]) // Incluir carregarAgendamentos nas dependências

  const criarAgendamento = async () => {
    console.log('🚀 [CRIAR AGENDAMENTO] Iniciando criação de agendamento')
    console.log('📋 [CRIAR AGENDAMENTO] Dados do formulário:', formData)
    
    // Validação completa de campos obrigatórios
    if (!formData.cliente_id || !formData.funcionario_id || !formData.servico_id || !formData.data_agendamento || !formData.hora_inicio) {
      const camposFaltando = []
      if (!formData.cliente_id) camposFaltando.push('Cliente')
      if (!formData.funcionario_id) camposFaltando.push('Funcionário')
      if (!formData.servico_id) camposFaltando.push('Serviço')
      if (!formData.data_agendamento) camposFaltando.push('Data')
      if (!formData.hora_inicio) camposFaltando.push('Hora de Início')
      
      alert(`Preencha todos os campos obrigatórios:\n${camposFaltando.join(', ')}`)
      return
    }

    setLoading(true)
    try {
      const apiUrl = getApiBaseUrl()
      const adminData = localStorage.getItem('admin')
      
      if (!adminData) {
        console.error('❌ [CRIAR AGENDAMENTO] Admin não encontrado no localStorage')
        alert('Erro de autenticação. Por favor, faça login novamente.')
        setLoading(false)
        return
      }

      const admin = JSON.parse(adminData)

      console.log('👤 [CRIAR AGENDAMENTO] Dados do admin:', {
        id: admin?.id,
        tipo: admin?.tipo_usuario,
        nome: admin?.nome_completo
      })

      if (!admin?.id) {
        console.error('❌ [CRIAR AGENDAMENTO] Admin ID não encontrado')
        alert('Erro de autenticação. Por favor, faça login novamente.')
        setLoading(false)
        return
      }

      // Buscar token de múltiplas chaves (opcional - sistema pode funcionar sem token)
      let token = localStorage.getItem('token') || 
                  localStorage.getItem('authToken') || 
                  localStorage.getItem('accessToken') ||
                  sessionStorage.getItem('token') ||
                  sessionStorage.getItem('authToken')
      
      // Se ainda não encontrou, tentar outras chaves comuns
      if (!token) {
        const possibleTokenKeys = ['token', 'authToken', 'accessToken', 'auth_token', 'jwt', 'bearer']
        for (const key of possibleTokenKeys) {
          const value = localStorage.getItem(key) || sessionStorage.getItem(key)
          if (value && value.length > 10) {
            token = value
            console.log(`✅ [CRIAR AGENDAMENTO] Token encontrado na chave: ${key}`)
            break
          }
        }
      }

      // Montar headers - token é opcional, mas headers de usuário são obrigatórios
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      }
      
      // Adicionar token se encontrado (opcional)
      if (token && token.length > 10) {
        headers['Authorization'] = `Bearer ${token}`
        console.log('✅ [CRIAR AGENDAMENTO] Token adicionado aos headers')
      } else {
        console.log('⚠️ [CRIAR AGENDAMENTO] Token não encontrado, continuando sem token (sistema pode funcionar apenas com headers de usuário)')
      }
      
      // Headers de usuário são obrigatórios
      headers['x-user-id'] = admin.id
      headers['x-user-tipo'] = admin.tipo_usuario || 'administrativo'
      headers['x-user-nome'] = admin.nome_completo || 'Sistema'

      const url = `${apiUrl}/api/v1/agendamentos`
      console.log('📡 [CRIAR AGENDAMENTO] Enviando requisição para:', url)
      console.log('📦 [CRIAR AGENDAMENTO] Payload:', JSON.stringify(formData, null, 2))
      console.log('🔑 [CRIAR AGENDAMENTO] Headers:', {
        'Content-Type': headers['Content-Type'],
        'Authorization': headers['Authorization'] ? 'Bearer ***' : 'não definido',
        'x-user-id': headers['x-user-id'],
        'x-user-tipo': headers['x-user-tipo'],
        'x-user-nome': headers['x-user-nome']
      })

      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(formData),
      })

      console.log('📥 [CRIAR AGENDAMENTO] Resposta recebida:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      })

      if (response.ok) {
        const data = await response.json()
        console.log('✅ [CRIAR AGENDAMENTO] Agendamento criado com sucesso:', data)
        
        setDialogAberto(false)
        setAgendamentoEditando(null)
        setFormData({
          cliente_id: '',
          funcionario_id: '',
          servico_id: '',
          data_agendamento: format(new Date(), 'yyyy-MM-dd'),
          hora_inicio: '',
          observacoes: '',
          status: 'agendado',
        })
        
        // Recarregar agendamentos para atualizar a visualização
        await carregarAgendamentos()
        
        alert('Agendamento criado com sucesso!')
      } else {
        // Tentar ler a resposta de erro
        let errorMessage = 'Erro ao criar agendamento'
        try {
          const errorData = await response.json()
          errorMessage = errorData.error || errorData.message || errorMessage
          console.error('❌ [CRIAR AGENDAMENTO] Erro da API:', errorData)
        } catch (parseError) {
          const errorText = await response.text()
          console.error('❌ [CRIAR AGENDAMENTO] Erro ao parsear resposta:', errorText)
          errorMessage = errorText || errorMessage
        }
        
        alert(`Erro ao criar agendamento:\n${errorMessage}`)
      }
    } catch (error: any) {
      console.error('❌ [CRIAR AGENDAMENTO] Erro na requisição:', error)
      console.error('❌ [CRIAR AGENDAMENTO] Stack:', error.stack)
      
      const errorMessage = error.message || 'Erro ao criar agendamento. Verifique sua conexão e tente novamente.'
      alert(`Erro ao criar agendamento:\n${errorMessage}`)
    } finally {
      setLoading(false)
      console.log('🏁 [CRIAR AGENDAMENTO] Processo finalizado')
    }
  }

  const atualizarAgendamento = async () => {
    if (!agendamentoEditando) return

    console.log('🔄 [ATUALIZAR AGENDAMENTO] Iniciando atualização de agendamento')
    console.log('📋 [ATUALIZAR AGENDAMENTO] Dados do formulário:', formData)
    console.log('🆔 [ATUALIZAR AGENDAMENTO] ID do agendamento:', agendamentoEditando.id)
    
    // Validação completa de campos obrigatórios
    if (!formData.cliente_id || !formData.funcionario_id || !formData.servico_id || !formData.data_agendamento || !formData.hora_inicio) {
      const camposFaltando = []
      if (!formData.cliente_id) camposFaltando.push('Cliente')
      if (!formData.funcionario_id) camposFaltando.push('Funcionário')
      if (!formData.servico_id) camposFaltando.push('Serviço')
      if (!formData.data_agendamento) camposFaltando.push('Data')
      if (!formData.hora_inicio) camposFaltando.push('Hora de Início')
      
      alert(`Preencha todos os campos obrigatórios:\n${camposFaltando.join(', ')}`)
      return
    }

    setLoading(true)
    try {
      const apiUrl = getApiBaseUrl()
      const adminData = localStorage.getItem('admin')
      
      if (!adminData) {
        console.error('❌ [ATUALIZAR AGENDAMENTO] Admin não encontrado no localStorage')
        alert('Erro de autenticação. Por favor, faça login novamente.')
        setLoading(false)
        return
      }

      const admin = JSON.parse(adminData)

      if (!admin?.id) {
        console.error('❌ [ATUALIZAR AGENDAMENTO] Admin ID não encontrado')
        alert('Erro de autenticação. Por favor, faça login novamente.')
        setLoading(false)
        return
      }

      // Buscar token de múltiplas chaves (opcional)
      let token = localStorage.getItem('token') || 
                  localStorage.getItem('authToken') || 
                  localStorage.getItem('accessToken') ||
                  sessionStorage.getItem('token') ||
                  sessionStorage.getItem('authToken')
      
      if (!token) {
        const possibleTokenKeys = ['token', 'authToken', 'accessToken', 'auth_token', 'jwt', 'bearer']
        for (const key of possibleTokenKeys) {
          const value = localStorage.getItem(key) || sessionStorage.getItem(key)
          if (value && value.length > 10) {
            token = value
            break
          }
        }
      }

      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      }
      
      if (token && token.length > 10) {
        headers['Authorization'] = `Bearer ${token}`
      }
      
      headers['x-user-id'] = admin.id
      headers['x-user-tipo'] = admin.tipo_usuario || 'administrativo'
      headers['x-user-nome'] = admin.nome_completo || 'Sistema'

      const url = `${apiUrl}/api/v1/agendamentos/${agendamentoEditando.id}`
      console.log('📡 [ATUALIZAR AGENDAMENTO] Enviando requisição para:', url)

      const response = await fetch(url, {
        method: 'PUT',
        headers,
        body: JSON.stringify(formData),
      })

      console.log('📥 [ATUALIZAR AGENDAMENTO] Resposta recebida:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      })

      if (response.ok) {
        const data = await response.json()
        console.log('✅ [ATUALIZAR AGENDAMENTO] Agendamento atualizado com sucesso:', data)
        
        setDialogAberto(false)
        setAgendamentoEditando(null)
        setFormData({
          cliente_id: '',
          funcionario_id: '',
          servico_id: '',
          data_agendamento: format(new Date(), 'yyyy-MM-dd'),
          hora_inicio: '',
          observacoes: '',
          status: 'agendado',
        })
        
        // Recarregar agendamentos para atualizar a visualização
        await carregarAgendamentos()
        
        alert('Agendamento atualizado com sucesso!')
      } else {
        let errorMessage = 'Erro ao atualizar agendamento'
        try {
          const errorData = await response.json()
          errorMessage = errorData.error || errorData.message || errorMessage
          console.error('❌ [ATUALIZAR AGENDAMENTO] Erro da API:', errorData)
        } catch (parseError) {
          const errorText = await response.text()
          console.error('❌ [ATUALIZAR AGENDAMENTO] Erro ao parsear resposta:', errorText)
          errorMessage = errorText || errorMessage
        }
        
        alert(`Erro ao atualizar agendamento:\n${errorMessage}`)
      }
    } catch (error: any) {
      console.error('❌ [ATUALIZAR AGENDAMENTO] Erro na requisição:', error)
      console.error('❌ [ATUALIZAR AGENDAMENTO] Stack:', error.stack)
      
      const errorMessage = error.message || 'Erro ao atualizar agendamento. Verifique sua conexão e tente novamente.'
      alert(`Erro ao atualizar agendamento:\n${errorMessage}`)
    } finally {
      setLoading(false)
      console.log('🏁 [ATUALIZAR AGENDAMENTO] Processo finalizado')
    }
  }

  const handleSalvarAgendamento = () => {
    if (agendamentoEditando) {
      atualizarAgendamento()
    } else {
      criarAgendamento()
    }
  }

  const criarAgendamentoAlmocoSaida = async () => {
    console.log('🚀 [CRIAR ALMOÇO/SAÍDA] Iniciando criação')
    console.log('📋 [CRIAR ALMOÇO/SAÍDA] Dados:', formAlmocoSaida, 'Tipo:', tipoAlmocoSaida)
    
    // Validações
    if (!formAlmocoSaida.funcionario_id || !formAlmocoSaida.data_agendamento || !formAlmocoSaida.hora_inicio || !formAlmocoSaida.hora_fim) {
      const camposFaltando = []
      if (!formAlmocoSaida.funcionario_id) camposFaltando.push('Funcionário')
      if (!formAlmocoSaida.data_agendamento) camposFaltando.push('Data')
      if (!formAlmocoSaida.hora_inicio) camposFaltando.push('Hora de Início')
      if (!formAlmocoSaida.hora_fim) camposFaltando.push('Hora de Fim')
      
      alert(`Preencha todos os campos obrigatórios:\n${camposFaltando.join(', ')}`)
      return
    }

    // Validar que hora_fim > hora_inicio
    const [hInicio, mInicio] = formAlmocoSaida.hora_inicio.split(':').map(Number)
    const [hFim, mFim] = formAlmocoSaida.hora_fim.split(':').map(Number)
    const inicioMinutos = hInicio * 60 + mInicio
    const fimMinutos = hFim * 60 + mFim
    
    if (fimMinutos <= inicioMinutos) {
      alert('A hora de fim deve ser maior que a hora de início')
      return
    }

    setLoading(true)
    try {
      const apiUrl = getApiBaseUrl()
      const adminData = localStorage.getItem('admin')
      
      if (!adminData) {
        alert('Erro de autenticação. Por favor, faça login novamente.')
        setLoading(false)
        return
      }

      const admin = JSON.parse(adminData)

      // Buscar token (opcional)
      let token = localStorage.getItem('token') || 
                  localStorage.getItem('authToken') || 
                  sessionStorage.getItem('token')

      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      }
      
      if (token && token.length > 10) {
        headers['Authorization'] = `Bearer ${token}`
      }
      
      headers['x-user-id'] = admin.id
      headers['x-user-tipo'] = admin.tipo_usuario || 'administrativo'
      headers['x-user-nome'] = admin.nome_completo || 'Sistema'

      // 1. Buscar ou criar recursos especiais (cliente Sistema e serviços)
      console.log('📡 [CRIAR ALMOÇO/SAÍDA] Buscando recursos especiais...')
      const recursosResponse = await fetch(`${apiUrl}/api/v1/agendamentos/recursos-especiais`, { headers })
      
      if (!recursosResponse.ok) {
        let errorMessage = 'Erro ao buscar recursos especiais'
        try {
          const errorData = await recursosResponse.json()
          console.error('❌ [CRIAR ALMOÇO/SAÍDA] Erro da API:', errorData)
          errorMessage = errorData.message || errorData.error || errorMessage
          if (errorData.detail) {
            errorMessage += ` - ${errorData.detail}`
          }
          if (errorData.code) {
            errorMessage += ` (Código: ${errorData.code})`
          }
        } catch (parseError) {
          const errorText = await recursosResponse.text()
          console.error('❌ [CRIAR ALMOÇO/SAÍDA] Erro ao parsear resposta:', errorText)
          errorMessage = errorText || errorMessage
        }
        throw new Error(errorMessage)
      }

      const recursos = await recursosResponse.json()
      console.log('✅ [CRIAR ALMOÇO/SAÍDA] Recursos encontrados:', recursos)

      // 2. Criar agendamento
      const servicoId = tipoAlmocoSaida === 'almoco' ? recursos.servico_almoco.id : recursos.servico_saida.id
      const servicoNome = tipoAlmocoSaida === 'almoco' ? recursos.servico_almoco.nome : recursos.servico_saida.nome

      const bodyAgendamento = {
        cliente_id: recursos.cliente_sistema.id,
        funcionario_id: formAlmocoSaida.funcionario_id,
        servico_id: servicoId,
        data_agendamento: formAlmocoSaida.data_agendamento,
        hora_inicio: formAlmocoSaida.hora_inicio,
        hora_fim: formAlmocoSaida.hora_fim,
        observacoes: formAlmocoSaida.descricao || servicoNome,
        status: 'agendado',
        valor_servico: 0, // Sempre zero para almoço/saída
      }

      console.log('📦 [CRIAR ALMOÇO/SAÍDA] Criando agendamento:', bodyAgendamento)

      const response = await fetch(`${apiUrl}/api/v1/agendamentos`, {
        method: 'POST',
        headers,
        body: JSON.stringify(bodyAgendamento),
      })

      if (response.ok) {
        const data = await response.json()
        console.log('✅ [CRIAR ALMOÇO/SAÍDA] Agendamento criado com sucesso')
        
        setDialogAlmocoSaidaAberto(false)
        setFormAlmocoSaida({
          funcionario_id: '',
          data_agendamento: format(new Date(), 'yyyy-MM-dd'),
          hora_inicio: '',
          hora_fim: '',
          descricao: '',
        })
        
        await carregarAgendamentos()
        alert(`${tipoAlmocoSaida === 'almoco' ? 'Almoço' : 'Saída'} marcado com sucesso!`)
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao criar agendamento')
      }
    } catch (error: any) {
      console.error('❌ [CRIAR ALMOÇO/SAÍDA] Erro:', error)
      alert(`Erro ao marcar ${tipoAlmocoSaida === 'almoco' ? 'almoço' : 'saída'}:\n${error.message}`)
    } finally {
      setLoading(false)
    }
  }


  const renderizarVistaDia = () => {
    console.log('🎨 Renderizando vista dia - gradeLoading:', gradeLoading, 'horariosFuncionamento:', horariosFuncionamento)
    
    // Se ainda estiver carregando (gradeLoading = true) OU se horariosFuncionamento for null E gradeLoading for false (ainda não iniciou)
    if (gradeLoading || (horariosFuncionamento === null && !gradeLoading)) {
      return (
        <div className="flex items-center justify-center h-64 border border-zinc-800 rounded-lg bg-zinc-950">
          <div className="text-gray-400 animate-pulse">Carregando grade de horários...</div>
        </div>
      )
    }

    // Se não houver horários de funcionamento (null ou objeto vazio)
    if (horariosFuncionamento === null) {
      console.log('⚠️ horariosFuncionamento é null')
      return (
        <div className="flex flex-col items-center justify-center h-64 border border-zinc-800 rounded-lg bg-zinc-950">
          <Clock className="h-10 w-10 text-zinc-600 mb-3" />
          <div className="text-gray-400 font-medium">Erro ao carregar horários</div>
          <p className="text-xs text-zinc-500 mt-1">Tente recarregar a página.</p>
        </div>
      )
    }

    // Se o dia não estiver ativo ou não houver horários (objeto existe mas está vazio)
    console.log('🔍 Verificando horariosFuncionamento:', {
      dia_ativo: horariosFuncionamento.dia_ativo,
      dia_semana: horariosFuncionamento.dia_semana,
      hora_abertura: horariosFuncionamento.hora_abertura,
      hora_fechamento: horariosFuncionamento.hora_fechamento,
      horarios: horariosFuncionamento.horarios,
      horariosLength: horariosFuncionamento.horarios?.length || 0,
      horariosType: typeof horariosFuncionamento.horarios,
      isArray: Array.isArray(horariosFuncionamento.horarios)
    })
    
    if (!horariosFuncionamento.dia_ativo || !horariosFuncionamento.horarios || horariosFuncionamento.horarios.length === 0) {
      console.log('⚠️ Dia não ativo ou sem horários:', {
        dia_ativo: horariosFuncionamento.dia_ativo,
        horarios: horariosFuncionamento.horarios?.length || 0,
        dia_semana: horariosFuncionamento.dia_semana,
        hora_abertura: horariosFuncionamento.hora_abertura,
        hora_fechamento: horariosFuncionamento.hora_fechamento
      })
      // Verificar se é fechamento especial
      const isFechamentoEspecial = horariosFuncionamento.dia_semana === 'fechamento_especial' || horariosFuncionamento.motivo_fechamento
      
      return (
        <div className="flex flex-col items-center justify-center h-64 border border-zinc-800 rounded-lg bg-zinc-950">
          <Clock className="h-10 w-10 text-zinc-600 mb-3" />
          <div className="text-gray-400 font-medium">
            {isFechamentoEspecial ? 'Fechamento Especial' : 'Barbearia fechada neste dia'}
          </div>
          {horariosFuncionamento.motivo_fechamento ? (
            <p className="text-xs text-amber-500 mt-1 font-medium">{horariosFuncionamento.motivo_fechamento}</p>
          ) : (
            <p className="text-xs text-zinc-500 mt-1">Verifique as configurações de horários.</p>
          )}
        </div>
      )
    }

    console.log('✅ Renderizando grade com', horariosFuncionamento.horarios.length, 'horários')
    console.log('📊 [RENDERIZAÇÃO] Agendamentos recebidos:', agendamentos.length)
    console.log('📊 [RENDERIZAÇÃO] Filtro atual:', funcionarioFiltro)
    console.log('📊 [RENDERIZAÇÃO] Funcionários disponíveis:', funcionarios.length)

    const horarios = horariosFuncionamento.horarios
    const ALTURA_SLOT = 60 // 60px de altura para cada 15 min (visual mais espaçado)
    
    // Filtrar agendamentos do dia
    const dataSelecionadaFormatada = format(dataSelecionada, 'yyyy-MM-dd')
    console.log('📅 [RENDERIZAÇÃO] Data selecionada formatada:', dataSelecionadaFormatada)
    
    const agendamentosDoDia = agendamentos.filter((a) => {
      // Verificar se data_agendamento existe
      if (!a.data_agendamento) {
        console.warn('⚠️ [RENDERIZAÇÃO] Agendamento sem data_agendamento:', a.id)
        return false
      }
      
      // Extrair apenas a parte da data (yyyy-MM-dd) da string ISO
      let dataAgendamentoStr = String(a.data_agendamento)
      
      // Se for uma string ISO completa, extrair apenas a data
      if (dataAgendamentoStr.includes('T')) {
        dataAgendamentoStr = dataAgendamentoStr.split('T')[0]
      }
      
      // Se for uma string de data simples, usar diretamente
      // Comparar strings no formato yyyy-MM-dd
      const mesmoDia = dataAgendamentoStr === dataSelecionadaFormatada
      
      console.log('🔍 [RENDERIZAÇÃO] Verificando agendamento:', {
        id: a.id,
        data_agendamento_original: a.data_agendamento,
        data_agendamento_processada: dataAgendamentoStr,
        dataSelecionada: dataSelecionadaFormatada,
        mesmoDia,
        funcionario: a.funcionario_nome
      })
      
      return mesmoDia
    })

    console.log('📊 [RENDERIZAÇÃO] Agendamentos do dia:', agendamentosDoDia.length)
    console.log('📋 [RENDERIZAÇÃO] Detalhes dos agendamentos do dia:', agendamentosDoDia.map(a => ({
      id: a.id,
      cliente: a.cliente_nome,
      funcionario: a.funcionario_nome,
      funcionario_id: a.funcionario_id,
      hora_inicio: a.hora_inicio,
      hora_fim: a.hora_fim
    })))

    // Determinar se deve mostrar múltiplas colunas (quando filtro = "todos")
    const mostrarTodosFuncionarios = funcionarioFiltro === 'todos' || !funcionarioFiltro || funcionarioFiltro.trim() === ''
    
    // Se mostrar todos, agrupar por funcionário
    let funcionariosParaMostrar: Funcionario[] = []
    if (mostrarTodosFuncionarios) {
      // SEMPRE mostrar todos os funcionários disponíveis quando filtro = "todos"
      funcionariosParaMostrar = funcionarios
      console.log('👥 [RENDERIZAÇÃO] Mostrando todos os funcionários:', funcionariosParaMostrar.length)
      console.log('📋 [RENDERIZAÇÃO] Lista de funcionários:', funcionariosParaMostrar.map(f => ({
        id: f.id,
        nome: f.nome_completo
      })))
      console.log('📊 [RENDERIZAÇÃO] Agendamentos por funcionário:', funcionariosParaMostrar.map(f => {
        const agendamentosFunc = agendamentosDoDia.filter(a => a.funcionario_id === f.id)
        return {
          funcionario: f.nome_completo,
          agendamentos: agendamentosFunc.length,
          detalhes: agendamentosFunc.map(a => ({
            cliente: a.cliente_nome,
            hora: a.hora_inicio
          }))
        }
      }))
    } else {
      // Filtrar apenas o funcionário selecionado
      const funcionarioSelecionado = funcionarios.find(f => f.id === funcionarioFiltro)
      if (funcionarioSelecionado) {
        funcionariosParaMostrar = [funcionarioSelecionado]
        console.log('👤 [RENDERIZAÇÃO] Mostrando apenas:', funcionarioSelecionado.nome_completo)
        const agendamentosFunc = agendamentosDoDia.filter(a => a.funcionario_id === funcionarioSelecionado.id)
        console.log('📊 [RENDERIZAÇÃO] Agendamentos deste funcionário:', agendamentosFunc.length)
      }
    }

    // Cores diferentes para cada funcionário
    const coresFuncionarios = [
      '#f59e0b', // Amber
      '#3b82f6', // Blue
      '#10b981', // Emerald
      '#8b5cf6', // Violet
      '#ec4899', // Pink
      '#f97316', // Orange
      '#06b6d4', // Cyan
      '#84cc16', // Lime
    ]

    return (
      <div className="relative border-t border-zinc-800 bg-zinc-950 rounded-b-lg overflow-hidden">
        {/* Cabeçalho com nomes dos funcionários (quando mostrar todos) */}
        {mostrarTodosFuncionarios && funcionariosParaMostrar.length > 0 && (
          <div className="flex border-b border-zinc-800 bg-zinc-900/50">
            <div className="w-16 flex-shrink-0 border-r border-zinc-800"></div>
            {funcionariosParaMostrar.map((func, index) => (
              <div 
                key={func.id}
                className="flex-1 border-r border-zinc-800 last:border-r-0 px-3 py-2"
                style={{ 
                  borderLeftColor: coresFuncionarios[index % coresFuncionarios.length],
                  borderLeftWidth: '4px'
                }}
              >
                <span className="text-sm font-semibold text-gray-200">{func.nome_completo}</span>
              </div>
            ))}
          </div>
        )}

        {horarios.map((horario, index) => {
          const [hora, minuto] = horario.split(':').map(Number)
          const horarioMinutos = hora * 60 + minuto
          const isHoraCheia = minuto === 0

          return (
            <div 
              key={horario} 
              className={`relative flex group border-b border-zinc-800/40 ${isHoraCheia ? 'border-zinc-700' : ''}`}
              style={{ height: `${ALTURA_SLOT}px` }} // Altura FIXA é crucial
            >
              {/* Coluna da Hora */}
              <div className="w-16 flex-shrink-0 flex justify-end pr-4 pt-2 border-r border-zinc-800 bg-zinc-900/50">
                <span className={`text-xs ${isHoraCheia ? 'font-bold text-gray-200' : 'text-zinc-600'}`}>
                  {horario}
                </span>
              </div>

              {/* Área do Conteúdo - Múltiplas colunas se mostrar todos */}
              {mostrarTodosFuncionarios && funcionariosParaMostrar.length > 0 ? (
                // Múltiplas colunas (um funcionário por coluna)
                funcionariosParaMostrar.map((func, funcIndex) => {
                  const agendamentosFuncionario = agendamentosDoDia.filter(a => a.funcionario_id === func.id)
                  const agendamentosInicio = agendamentosFuncionario.filter((a) => {
                    // Normalizar hora_inicio (pode vir como "08:00:00" ou "08:00")
                    const horaInicioNormalizada = a.hora_inicio ? a.hora_inicio.split(':').slice(0, 2).join(':') : ''
                    if (!horaInicioNormalizada) return false
                    const [h, m] = horaInicioNormalizada.split(':').map(Number)
                    return (h * 60 + m) === horarioMinutos
                  })

                  return (
                    <div 
                      key={`${horario}-${func.id}`}
                      className="flex-1 relative border-r border-zinc-800 last:border-r-0"
                      style={{
                        borderLeftColor: coresFuncionarios[funcIndex % coresFuncionarios.length],
                        borderLeftWidth: '2px'
                      }}
                    >
                      {/* Linha guia visual ao passar o mouse */}
                      <div className="absolute inset-0 hover:bg-zinc-800/30 transition-colors" />

                      {/* Renderizar Agendamentos (Absolute) */}
                      {agendamentosInicio.map((agendamento) => {
                        // Normalizar horas (podem vir como "08:00:00" ou "08:00")
                        const horaInicioNormalizada = agendamento.hora_inicio ? agendamento.hora_inicio.split(':').slice(0, 2).join(':') : '00:00'
                        const horaFimNormalizada = agendamento.hora_fim ? agendamento.hora_fim.split(':').slice(0, 2).join(':') : '00:00'
                        const [inicioH, inicioM] = horaInicioNormalizada.split(':').map(Number)
                        const [fimH, fimM] = horaFimNormalizada.split(':').map(Number)
                        
                        const inicioTotal = inicioH * 60 + inicioM
                        const fimTotal = fimH * 60 + fimM
                        const duracao = fimTotal - inicioTotal
                        
                        // Calcular altura baseada na proporção do slot
                        // Se 15 min = ALTURA_SLOT, então X min = (X / 15) * ALTURA_SLOT
                        const alturaCard = (duracao / 15) * ALTURA_SLOT

                        console.log('🎨 [RENDERIZAÇÃO] Renderizando agendamento:', {
                          id: agendamento.id,
                          cliente: agendamento.cliente_nome,
                          funcionario: agendamento.funcionario_nome,
                          hora_inicio: agendamento.hora_inicio,
                          hora_fim: agendamento.hora_fim,
                          duracao,
                          alturaCard
                        })

                        return (
                          <Card
                            key={agendamento.id}
                            className="absolute left-1 right-1 z-10 overflow-hidden shadow-lg hover:brightness-110 hover:scale-[1.01] transition-all cursor-pointer border-l-4"
                            style={{
                              top: '1px', // Pequeno ajuste para não cobrir a linha de cima
                              height: `${alturaCard - 2}px`, // -2px para ver a linha de baixo
                              backgroundColor: '#18181b', // Zinc-950
                              borderLeftColor:
                                agendamento.status === 'concluido' ? '#10b981' : // Emerald
                                agendamento.status === 'cancelado' ? '#ef4444' : // Red
                                agendamento.status === 'em_andamento' ? '#3b82f6' : // Blue
                                coresFuncionarios[funcIndex % coresFuncionarios.length], // Cor do funcionário (Agendado)
                            }}
                            onClick={() => {
                              // Abrir dialog de edição
                              setAgendamentoEditando(agendamento)
                              setFormData({
                                cliente_id: agendamento.cliente_id,
                                funcionario_id: agendamento.funcionario_id,
                                servico_id: agendamento.servico_id,
                                data_agendamento: agendamento.data_agendamento,
                                hora_inicio: agendamento.hora_inicio,
                                observacoes: agendamento.observacoes || '',
                                status: agendamento.status,
                              })
                              setDialogAberto(true)
                            }}
                          >
                            <div className="p-2 h-full flex flex-col justify-center">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-bold text-gray-100 bg-zinc-800 px-1.5 py-0.5 rounded">
                                  {horaInicioNormalizada} - {horaFimNormalizada}
                                </span>
                                <span className="font-semibold text-sm text-gray-200 truncate">
                                  {agendamento.cliente_nome}
                                </span>
                              </div>
                              
                              {/* Mostrar detalhes apenas se o card for alto o suficiente (> 45px) */}
                              {alturaCard > 45 && (
                                <div className="flex flex-col gap-0.5 text-xs text-gray-400 pl-1">
                                  <div className="flex items-center gap-1">
                                    <Scissors className="h-3 w-3 text-amber-500" />
                                    <span className="truncate">{agendamento.servico_nome}</span>
                                  </div>
                                  {(() => {
                                    const valor = parseFloat(String(agendamento.valor_servico || 0))
                                    return valor > 0 && (
                                      <div className="flex items-center gap-1 mt-0.5">
                                        <span className="text-amber-500 font-semibold">
                                          R$ {valor.toFixed(2).replace('.', ',')}
                                        </span>
                                      </div>
                                    )
                                  })()}
                                </div>
                              )}
                              {/* Se o card for pequeno, mostrar apenas serviço e valor em linha */}
                              {alturaCard <= 45 && (
                                <div className="flex items-center gap-1 text-xs text-gray-400">
                                  <Scissors className="h-3 w-3 text-amber-500" />
                                  <span className="truncate">{agendamento.servico_nome}</span>
                                  {(() => {
                                    const valor = parseFloat(String(agendamento.valor_servico || 0))
                                    return valor > 0 && (
                                      <>
                                        <span className="text-zinc-600">•</span>
                                        <span className="text-amber-500 font-semibold">
                                          R$ {valor.toFixed(2).replace('.', ',')}
                                        </span>
                                      </>
                                    )
                                  })()}
                                </div>
                              )}
                            </div>
                          </Card>
                        )
                      })}
                    </div>
                  )
                })
              ) : (
                // Coluna única (quando filtro por funcionário específico)
                <div className="flex-1 relative">
                  {/* Linha guia visual ao passar o mouse */}
                  <div className="absolute inset-0 hover:bg-zinc-800/30 transition-colors" />

                  {/* Verificar se algum agendamento COMEÇA exatamente neste slot e renderizar */}
                  {(() => {
                    const agendamentosInicio = agendamentosDoDia.filter((a) => {
                      // Normalizar hora_inicio (pode vir como "08:00:00" ou "08:00")
                      const horaInicioNormalizada = a.hora_inicio ? a.hora_inicio.split(':').slice(0, 2).join(':') : ''
                      if (!horaInicioNormalizada) return false
                      const [h, m] = horaInicioNormalizada.split(':').map(Number)
                      return (h * 60 + m) === horarioMinutos
                    })

                    return agendamentosInicio.map((agendamento) => {
                      // Normalizar horas (podem vir como "08:00:00" ou "08:00")
                      const horaInicioNormalizada = agendamento.hora_inicio ? agendamento.hora_inicio.split(':').slice(0, 2).join(':') : '00:00'
                      const horaFimNormalizada = agendamento.hora_fim ? agendamento.hora_fim.split(':').slice(0, 2).join(':') : '00:00'
                      const [inicioH, inicioM] = horaInicioNormalizada.split(':').map(Number)
                      const [fimH, fimM] = horaFimNormalizada.split(':').map(Number)
                    
                    const inicioTotal = inicioH * 60 + inicioM
                    const fimTotal = fimH * 60 + fimM
                    const duracao = fimTotal - inicioTotal
                    
                    // Calcular altura baseada na proporção do slot
                    // Se 15 min = ALTURA_SLOT, então X min = (X / 15) * ALTURA_SLOT
                    const alturaCard = (duracao / 15) * ALTURA_SLOT

                    return (
                      <Card
                        key={agendamento.id}
                        className="absolute left-1 right-2 z-10 overflow-hidden shadow-lg hover:brightness-110 hover:scale-[1.01] transition-all cursor-pointer border-l-4"
                        style={{
                          top: '1px', // Pequeno ajuste para não cobrir a linha de cima
                          height: `${alturaCard - 2}px`, // -2px para ver a linha de baixo
                          backgroundColor: '#18181b', // Zinc-950
                          borderLeftColor:
                            agendamento.status === 'concluido' ? '#10b981' : // Emerald
                            agendamento.status === 'cancelado' ? '#ef4444' : // Red
                            agendamento.status === 'em_andamento' ? '#3b82f6' : // Blue
                            '#f59e0b', // Amber (Agendado)
                        }}
                        onClick={() => {
                          // Abrir dialog de edição
                          setAgendamentoEditando(agendamento)
                          setFormData({
                            cliente_id: agendamento.cliente_id,
                            funcionario_id: agendamento.funcionario_id,
                            servico_id: agendamento.servico_id,
                            data_agendamento: agendamento.data_agendamento,
                            hora_inicio: agendamento.hora_inicio,
                            observacoes: agendamento.observacoes || '',
                            status: agendamento.status,
                          })
                          setDialogAberto(true)
                        }}
                      >
                        <div className="p-2 h-full flex flex-col justify-center">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-bold text-gray-100 bg-zinc-800 px-1.5 py-0.5 rounded">
                              {horaInicioNormalizada} - {horaFimNormalizada}
                            </span>
                            <span className="font-semibold text-sm text-gray-200 truncate">
                              {agendamento.cliente_nome}
                            </span>
                          </div>
                          
                          {/* Mostrar detalhes apenas se o card for alto o suficiente (> 45px) */}
                            {alturaCard > 45 && (
                              <div className="flex flex-col gap-0.5 text-xs text-gray-400 pl-1">
                                <div className="flex items-center gap-1">
                                  <Scissors className="h-3 w-3 text-amber-500" />
                                  <span className="truncate">{agendamento.servico_nome}</span>
                                </div>
                                {(() => {
                                  const valor = parseFloat(String(agendamento.valor_servico || 0))
                                  return valor > 0 && (
                                    <div className="flex items-center gap-1 mt-0.5">
                                      <span className="text-amber-500 font-semibold">
                                        R$ {valor.toFixed(2).replace('.', ',')}
                                      </span>
                                    </div>
                                  )
                                })()}
                              </div>
                            )}
                            {/* Se o card for pequeno, mostrar apenas serviço e valor em linha */}
                            {alturaCard <= 45 && (
                              <div className="flex items-center gap-1 text-xs text-gray-400">
                                <Scissors className="h-3 w-3 text-amber-500" />
                                <span className="truncate">{agendamento.servico_nome}</span>
                                {(() => {
                                  const valor = parseFloat(String(agendamento.valor_servico || 0))
                                  return valor > 0 && (
                                    <>
                                      <span className="text-zinc-600">•</span>
                                      <span className="text-amber-500 font-semibold">
                                        R$ {valor.toFixed(2).replace('.', ',')}
                                      </span>
                                    </>
                                  )
                                })()}
                              </div>
                            )}
                        </div>
                      </Card>
                    )
                  })
                  })()}
                </div>
              )}
            </div>
          )
        })}
      </div>
    )
  }

  const renderizarVistaSemana = () => {
    const inicioSemana = startOfWeek(dataSelecionada, { locale: ptBR })
    const diasSemana = eachDayOfInterval({ start: inicioSemana, end: endOfWeek(dataSelecionada, { locale: ptBR }) })
    
    // Para a vista de semana, vamos usar os horários do dia atual como referência
    // ou buscar para cada dia (mais complexo, mas mais preciso)
    // Por enquanto, vamos usar os horários do dia selecionado
    if (!horariosFuncionamento || !horariosFuncionamento.dia_ativo || !horariosFuncionamento.horarios.length) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-400">Carregando horários de funcionamento...</div>
        </div>
      )
    }
    
    const horariosOrdenados = horariosFuncionamento.horarios

    return (
      <div className="overflow-x-auto">
        <div className="min-w-full">
          <div className="grid grid-cols-8 gap-2">
            <div className="font-semibold text-gray-300 p-2"></div>
            {diasSemana.map((dia) => (
              <div key={dia.toISOString()} className="font-semibold text-gray-300 p-2 text-center">
                <div className="text-xs text-gray-400">{format(dia, 'EEE', { locale: ptBR })}</div>
                <div className="text-lg">{format(dia, 'd')}</div>
              </div>
            ))}
          </div>
          {horariosOrdenados.map((horario) => {
            const [hora, minuto] = horario.split(':').map(Number)
            const horarioMinutos = hora * 60 + minuto
            
            return (
              <div key={horario} className="grid grid-cols-8 gap-2">
                <div className="text-right text-gray-400 text-xs p-1">
                  {horario}
                </div>
                {diasSemana.map((dia) => {
                  // Por enquanto, vamos mostrar todos os horários para todos os dias
                  // Idealmente, deveríamos buscar os horários específicos de cada dia
                  // Mas isso requer múltiplas chamadas à API, então vamos simplificar
                  
                  const agendamentosNesteHorario = agendamentos.filter((a) => {
                    const [horaInicioH, minutoInicioM] = a.hora_inicio.split(':').map(Number)
                    const inicioMinutos = horaInicioH * 60 + minutoInicioM
                    return isSameDay(new Date(a.data_agendamento), dia) && inicioMinutos === horarioMinutos
                  })

                  return (
                    <div key={dia.toISOString()} className="space-y-1 min-h-[40px]">
                      {agendamentosNesteHorario.map((agendamento) => (
                        <Card
                          key={agendamento.id}
                          className="bg-zinc-900 border-l-2 p-1 text-xs"
                          style={{
                            borderLeftColor:
                              agendamento.status === 'concluido'
                                ? '#10b981'
                                : agendamento.status === 'cancelado'
                                ? '#ef4444'
                                : agendamento.status === 'em_andamento'
                                ? '#3b82f6'
                                : '#f59e0b',
                          }}
                        >
                          <div className="font-semibold text-gray-300 truncate">{agendamento.cliente_nome}</div>
                          <div className="text-gray-400 truncate text-xs">{agendamento.servico_nome}</div>
                          <div className="text-gray-500 text-xs">{agendamento.hora_inicio}</div>
                        </Card>
                      ))}
                    </div>
                  )
                })}
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  const renderizarVistaMes = () => {
    const inicioMes = startOfMonth(dataSelecionada)
    const fimMes = endOfMonth(dataSelecionada)
    const diasMes = eachDayOfInterval({ start: inicioMes, end: fimMes })
    const inicioSemana = startOfWeek(inicioMes, { locale: ptBR })
    const diasCalendario = eachDayOfInterval({ start: inicioSemana, end: endOfWeek(fimMes, { locale: ptBR }) })

    return (
      <div className="grid grid-cols-7 gap-1">
        {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((dia) => (
          <div key={dia} className="font-semibold text-gray-400 text-center p-2 text-sm">
            {dia}
          </div>
        ))}
        {diasCalendario.map((dia) => {
          const agendamentosDia = agendamentos.filter((a) => isSameDay(new Date(a.data_agendamento), dia))
          const isMesAtual = isSameMonth(dia, dataSelecionada)

          return (
            <div
              key={dia.toISOString()}
              className={`min-h-[100px] p-2 border border-zinc-800 rounded ${
                isMesAtual ? 'bg-zinc-900' : 'bg-zinc-950'
              }`}
            >
              <div className={`text-sm mb-1 ${isMesAtual ? 'text-gray-300' : 'text-gray-600'}`}>
                {format(dia, 'd')}
              </div>
              <div className="space-y-1">
                {agendamentosDia.slice(0, 3).map((agendamento) => (
                  <div
                    key={agendamento.id}
                    className="text-xs p-1 rounded truncate"
                    style={{
                      backgroundColor:
                        agendamento.status === 'concluido'
                          ? '#10b98120'
                          : agendamento.status === 'cancelado'
                          ? '#ef444420'
                          : agendamento.status === 'em_andamento'
                          ? '#3b82f620'
                          : '#f59e0b20',
                      color: isMesAtual ? '#e5e7eb' : '#6b7280',
                    }}
                  >
                    {agendamento.hora_inicio} {agendamento.cliente_nome}
                  </div>
                ))}
                {agendamentosDia.length > 3 && (
                  <div className="text-xs text-gray-500">+{agendamentosDia.length - 3} mais</div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  if (permissoesLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-gray-400">Carregando...</div>
      </div>
    )
  }

  if (!podeAcessar('agenda')) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-red-400">Você não tem permissão para acessar esta página</div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-300">Agenda</h1>
          <p className="text-gray-400 mt-1">Gerencie agendamentos e disponibilidades</p>
        </div>
        {podeEditar('agenda') && (
          <div className="flex gap-2 flex-wrap">
            <Button 
              onClick={() => {
                setAgendamentoEditando(null)
                setFormData({
                  cliente_id: '',
                  funcionario_id: '',
                  servico_id: '',
                  data_agendamento: format(new Date(), 'yyyy-MM-dd'),
                  hora_inicio: '',
                  observacoes: '',
                  status: 'agendado',
                })
                setDialogAberto(true)
              }} 
              className="bg-amber-500 hover:bg-amber-600 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Novo Agendamento
            </Button>
            <Button 
              onClick={() => {
                setTipoAlmocoSaida('almoco')
                setFormAlmocoSaida({
                  funcionario_id: funcionarioFiltro !== 'todos' ? funcionarioFiltro : '',
                  data_agendamento: format(dataSelecionada, 'yyyy-MM-dd'),
                  hora_inicio: '',
                  hora_fim: '',
                  descricao: 'Almoço',
                })
                setDialogAlmocoSaidaAberto(true)
              }} 
              className="bg-blue-500 hover:bg-blue-600 text-white"
            >
              <Clock className="h-4 w-4 mr-2" />
              Marcar Almoço
            </Button>
            <Button 
              onClick={() => {
                setTipoAlmocoSaida('saida')
                setFormAlmocoSaida({
                  funcionario_id: funcionarioFiltro !== 'todos' ? funcionarioFiltro : '',
                  data_agendamento: format(dataSelecionada, 'yyyy-MM-dd'),
                  hora_inicio: '',
                  hora_fim: '',
                  descricao: 'Saída',
                })
                setDialogAlmocoSaidaAberto(true)
              }} 
              className="bg-green-500 hover:bg-green-600 text-white"
            >
              <Clock className="h-4 w-4 mr-2" />
              Marcar Saída
            </Button>
          </div>
        )}
      </div>

      <Card className="bg-zinc-900 border-amber-500/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-gray-300">Buscar Horários Disponíveis</CardTitle>
              <CardDescription className="text-gray-400">Encontre horários livres para agendamento</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Linha 1: Campos de Data, Funcionário e Botão */}
            <div className="flex flex-col sm:flex-row gap-4 flex-1 items-end">
              {/* Campo de Data - Menor */}
              <div className="w-full sm:w-48 min-w-0">
                <Label className="text-gray-300 mb-1.5 block">Data</Label>
                <Input
                  type="date"
                  value={dataBusca ? format(dataBusca, 'yyyy-MM-dd') : ''}
                  onChange={(e) => {
                    const value = e.target.value
                    console.log('📅 [BUSCA] Input date onChange:', value)
                    if (value) {
                      const date = new Date(value + 'T00:00:00')
                      console.log('📅 [BUSCA] Data parseada:', date)
                      setDataBusca(date)
                    } else {
                      setDataBusca(undefined)
                    }
                  }}
                  className="w-full bg-zinc-800 border-amber-500/20 text-gray-300 focus:border-amber-500 focus:ring-amber-500/20 h-9"
                  placeholder="Selecione uma data"
                />
              </div>
              {/* Campo de Funcionário - Maior */}
              <div className="flex-1 w-full sm:flex-1 min-w-0">
                <Label className="text-gray-300 mb-1.5 block">Funcionário</Label>
                <Select value={funcionarioBusca} onValueChange={setFuncionarioBusca}>
                  <SelectTrigger className="bg-zinc-800 border-amber-500/20 text-gray-300 h-9 w-full">
                    <SelectValue placeholder="Selecione o funcionário" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-amber-500/20">
                    {funcionariosCarregando ? (
                      <div className="p-2 text-gray-400 text-sm">Carregando funcionários...</div>
                    ) : funcionarios.length === 0 ? (
                      <div className="p-2 text-gray-400 text-sm">Nenhum funcionário encontrado</div>
                    ) : (
                      funcionarios.map((func) => (
                        <SelectItem key={func.id} value={func.id} className="text-gray-300">
                          {func.nome_completo}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              {/* Botão Buscar */}
              <Button
                onClick={buscarDisponibilidades}
                disabled={loading || !dataBusca || !funcionarioBusca}
                className="bg-amber-500 hover:bg-amber-600 text-white w-full sm:w-auto h-9 whitespace-nowrap"
              >
                <Search className="h-4 w-4 mr-2" />
                Buscar
              </Button>
            </div>
          </div>
          {/* Linha 2: Data formatada (apenas quando houver data selecionada) */}
          {dataBusca && (
            <div className="mt-2 pt-2 border-t border-zinc-800/50">
              <p className="text-xs text-gray-400">
                {format(dataBusca, "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR })}
              </p>
            </div>
          )}
          {/* Mensagem de status - só exibe se houver tipo E texto */}
          {mensagemDisponibilidade.tipo && mensagemDisponibilidade.texto && (
            <div className={`mt-4 p-3 rounded-lg border ${
              mensagemDisponibilidade.tipo === 'sucesso'
                ? 'bg-green-500/10 border-green-500/30 text-green-500'
                : mensagemDisponibilidade.tipo === 'erro'
                ? 'bg-red-500/10 border-red-500/30 text-red-500'
                : 'bg-blue-500/10 border-blue-500/30 text-blue-500'
            }`}>
              <p className="text-sm">{mensagemDisponibilidade.texto}</p>
            </div>
          )}

          {/* Horários Disponíveis como botões clicáveis */}
          {disponibilidades.length > 0 && (
            <div className="mt-4 space-y-2">
              <Label className="text-gray-300">Horários Disponíveis (clique para agendar):</Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                {disponibilidades.map((disp, index) => (
                  <Button
                    key={index}
                    onClick={() => {
                      // Pré-preencher o formulário e abrir o dialog
                      // O backend calculará hora_fim e valor_servico automaticamente
                      setFormData({
                        cliente_id: '', // Usuário precisa selecionar
                        funcionario_id: funcionarioBusca,
                        servico_id: '', // Usuário precisa selecionar
                        data_agendamento: format(dataBusca!, 'yyyy-MM-dd'),
                        hora_inicio: disp.hora_inicio,
                        observacoes: '',
                        status: 'agendado',
                      })
                      setDialogAberto(true)
                    }}
                    className="bg-amber-500 hover:bg-amber-600 text-black font-medium h-10 transition-colors"
                    variant="outline"
                  >
                    {disp.hora_inicio}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-zinc-900 border-amber-500/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-gray-300">Calendário</CardTitle>
              <CardDescription className="text-gray-400">Visualize e gerencie seus agendamentos</CardDescription>
            </div>
            <div className="flex items-center gap-4">
              <Select 
                value={funcionarioFiltro} 
                onValueChange={(value) => {
                  console.log('🔄 [FILTRO SELECT] Mudança detectada:', { 
                    valorAnterior: funcionarioFiltro, 
                    valorNovo: value,
                    funcionariosDisponiveis: funcionarios.length
                  })
                  setFuncionarioFiltro(value)
                  // O useEffect que depende de funcionarioFiltro vai chamar carregarAgendamentos automaticamente
                }}
              >
                <SelectTrigger className="w-48 bg-zinc-800 border-amber-500/20 text-gray-300">
                  <SelectValue placeholder="Filtrar por funcionário" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-amber-500/20">
                  {/* CORREÇÃO: Usar value="todos" (não pode ser vazio - Radix UI não aceita) */}
                  <SelectItem value="todos" className="text-gray-300">Todos os funcionários</SelectItem>
                  {funcionariosCarregando ? (
                    <div className="px-2 py-1.5 text-sm text-gray-500">Carregando funcionários...</div>
                  ) : funcionarios.length === 0 ? (
                    <div className="px-2 py-1.5 text-sm text-gray-500">Nenhum funcionário encontrado</div>
                  ) : (
                    funcionarios.map((func) => (
                      <SelectItem key={func.id} value={func.id} className="text-gray-300">
                        {func.nome_completo}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (viewMode === 'dia') {
                    setDataSelecionada(subDays(dataSelecionada, 1))
                  } else if (viewMode === 'semana') {
                    setDataSelecionada(subWeeks(dataSelecionada, 1))
                  } else {
                    setDataSelecionada(subMonths(dataSelecionada, 1))
                  }
                }}
                className="border-amber-500/20 text-gray-300 hover:bg-amber-500/10 hover:text-amber-500"
              >
                <ChevronLeft className="h-4 w-4" />
                Anterior
              </Button>
              <div className="text-gray-300 font-semibold px-4">
                {viewMode === 'dia'
                  ? format(dataSelecionada, "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR })
                  : viewMode === 'semana'
                  ? `${format(startOfWeek(dataSelecionada, { locale: ptBR }), 'd MMM', { locale: ptBR })} - ${format(
                      endOfWeek(dataSelecionada, { locale: ptBR }),
                      'd MMM yyyy',
                      { locale: ptBR }
                    )}`
                  : format(dataSelecionada, 'MMMM yyyy', { locale: ptBR })}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (viewMode === 'dia') {
                    setDataSelecionada(addDays(dataSelecionada, 1))
                  } else if (viewMode === 'semana') {
                    setDataSelecionada(addWeeks(dataSelecionada, 1))
                  } else {
                    setDataSelecionada(addMonths(dataSelecionada, 1))
                  }
                }}
                className="border-amber-500/20 text-gray-300 hover:bg-amber-500/10 hover:text-amber-500"
              >
                Próximo
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'dia' | 'semana' | 'mes')}>
              <TabsList className="bg-zinc-800 border-amber-500/20">
                <TabsTrigger value="dia" className="text-gray-400 data-[state=active]:bg-amber-500/10 data-[state=active]:text-amber-500 data-[state=active]:text-gray-300">
                  Dia
                </TabsTrigger>
                <TabsTrigger value="semana" className="text-gray-400 data-[state=active]:bg-amber-500/10 data-[state=active]:text-amber-500 data-[state=active]:text-gray-300">
                  Semana
                </TabsTrigger>
                <TabsTrigger value="mes" className="text-gray-400 data-[state=active]:bg-amber-500/10 data-[state=active]:text-amber-500 data-[state=active]:text-gray-300">
                  Mês
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-gray-400">Carregando...</div>
            </div>
          ) : (
            <>
              {viewMode === 'dia' && renderizarVistaDia()}
              {viewMode === 'semana' && renderizarVistaSemana()}
              {viewMode === 'mes' && renderizarVistaMes()}
            </>
          )}
        </CardContent>
      </Card>

      <Dialog 
        open={dialogAberto} 
        onOpenChange={(open) => {
          setDialogAberto(open)
          if (!open) {
            // Limpar dados quando fechar
            setAgendamentoEditando(null)
            setFormData({
              cliente_id: '',
              funcionario_id: '',
              servico_id: '',
              data_agendamento: format(new Date(), 'yyyy-MM-dd'),
              hora_inicio: '',
              observacoes: '',
              status: 'agendado',
            })
          }
        }}
      >
        <DialogContent className="bg-zinc-900 border-amber-500/20 text-gray-300 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-gray-300">
              {agendamentoEditando ? 'Editar Agendamento' : 'Novo Agendamento'}
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              {agendamentoEditando ? 'Edite os dados do agendamento' : 'Preencha os dados do agendamento'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-gray-300">Cliente</Label>
              <Select value={formData.cliente_id} onValueChange={(v) => setFormData({ ...formData, cliente_id: v })}>
                <SelectTrigger className="bg-zinc-800 border-amber-500/20 text-gray-300">
                  <SelectValue placeholder="Selecione o cliente" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-amber-500/20">
                  {clientes.map((cliente) => (
                    <SelectItem key={cliente.id} value={cliente.id} className="text-gray-300">
                      {cliente.nome_completo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-gray-300">Funcionário</Label>
              <Select
                value={formData.funcionario_id}
                onValueChange={(v) => setFormData({ ...formData, funcionario_id: v })}
              >
                <SelectTrigger className="bg-zinc-800 border-amber-500/20 text-gray-300">
                  <SelectValue placeholder="Selecione o funcionário" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-amber-500/20">
                  {funcionarios.map((func) => (
                    <SelectItem key={func.id} value={func.id} className="text-gray-300">
                      {func.nome_completo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-gray-300">Serviço</Label>
              <Select value={formData.servico_id} onValueChange={(v) => setFormData({ ...formData, servico_id: v })}>
                <SelectTrigger className="bg-zinc-800 border-amber-500/20 text-gray-300">
                  <SelectValue placeholder="Selecione o serviço" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-amber-500/20">
                  {servicos.map((servico) => (
                    <SelectItem key={servico.id} value={servico.id} className="text-gray-300">
                      {servico.nome} ({servico.duracao_minutos} min)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-gray-300">Data</Label>
                <Input
                  type="date"
                  value={formData.data_agendamento}
                  onChange={(e) => setFormData({ ...formData, data_agendamento: e.target.value })}
                  className="bg-zinc-800 border-amber-500/20 text-gray-300 placeholder:text-gray-500"
                />
              </div>
              <div>
                <Label className="text-gray-300">Hora de Início</Label>
                <Input
                  type="time"
                  value={formData.hora_inicio}
                  onChange={(e) => setFormData({ ...formData, hora_inicio: e.target.value })}
                  className="bg-zinc-800 border-amber-500/20 text-gray-300 placeholder:text-gray-500"
                />
              </div>
            </div>
            <div>
              <Label className="text-gray-300">Observações</Label>
              <Input
                value={formData.observacoes}
                onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                placeholder="Observações sobre o agendamento"
                className="bg-zinc-800 border-amber-500/20 text-gray-300 placeholder:text-gray-500"
              />
            </div>
            {agendamentoEditando && (
              <div>
                <Label className="text-gray-300">Status</Label>
                <Select 
                  value={formData.status} 
                  onValueChange={(v) => setFormData({ ...formData, status: v })}
                >
                  <SelectTrigger className="bg-zinc-800 border-amber-500/20 text-gray-300">
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-amber-500/20">
                    <SelectItem value="agendado" className="text-gray-300">Agendado</SelectItem>
                    <SelectItem value="em_andamento" className="text-gray-300">Em Andamento</SelectItem>
                    <SelectItem value="concluido" className="text-gray-300">Concluído</SelectItem>
                    <SelectItem value="cancelado" className="text-gray-300">Cancelado</SelectItem>
                    <SelectItem value="nao_compareceu" className="text-gray-300">Não Compareceu</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            <Button 
              onClick={handleSalvarAgendamento} 
              disabled={loading} 
              className="w-full bg-amber-500 hover:bg-amber-600 text-white"
            >
              {loading 
                ? (agendamentoEditando ? 'Atualizando...' : 'Criando...') 
                : (agendamentoEditando ? 'Atualizar Agendamento' : 'Criar Agendamento')
              }
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog de Almoço/Saída */}
      <Dialog 
        open={dialogAlmocoSaidaAberto} 
        onOpenChange={(open) => {
          setDialogAlmocoSaidaAberto(open)
          if (!open) {
            setFormAlmocoSaida({
              funcionario_id: '',
              data_agendamento: format(new Date(), 'yyyy-MM-dd'),
              hora_inicio: '',
              hora_fim: '',
              descricao: '',
            })
          }
        }}
      >
        <DialogContent className="bg-zinc-900 border-amber-500/20 text-gray-300 max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-gray-300">
              {tipoAlmocoSaida === 'almoco' ? 'Marcar Almoço' : 'Marcar Saída'}
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Marque o horário de {tipoAlmocoSaida === 'almoco' ? 'almoço' : 'saída'} do funcionário
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-gray-300">Funcionário *</Label>
              <Select 
                value={formAlmocoSaida.funcionario_id} 
                onValueChange={(v) => setFormAlmocoSaida({ ...formAlmocoSaida, funcionario_id: v })}
              >
                <SelectTrigger className="bg-zinc-800 border-amber-500/20 text-gray-300">
                  <SelectValue placeholder="Selecione o funcionário" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-amber-500/20">
                  {funcionarios.map((func) => (
                    <SelectItem key={func.id} value={func.id} className="text-gray-300">
                      {func.nome_completo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-gray-300">Data *</Label>
              <Input
                type="date"
                value={formAlmocoSaida.data_agendamento}
                onChange={(e) => setFormAlmocoSaida({ ...formAlmocoSaida, data_agendamento: e.target.value })}
                className="bg-zinc-800 border-amber-500/20 text-gray-300 placeholder:text-gray-500"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-gray-300">Hora de Início *</Label>
                <Input
                  type="time"
                  value={formAlmocoSaida.hora_inicio}
                  onChange={(e) => setFormAlmocoSaida({ ...formAlmocoSaida, hora_inicio: e.target.value })}
                  className="bg-zinc-800 border-amber-500/20 text-gray-300 placeholder:text-gray-500"
                  required
                />
              </div>
              <div>
                <Label className="text-gray-300">Hora de Fim *</Label>
                <Input
                  type="time"
                  value={formAlmocoSaida.hora_fim}
                  onChange={(e) => setFormAlmocoSaida({ ...formAlmocoSaida, hora_fim: e.target.value })}
                  className="bg-zinc-800 border-amber-500/20 text-gray-300 placeholder:text-gray-500"
                  required
                />
              </div>
            </div>
            <div>
              <Label className="text-gray-300">Descrição</Label>
              <Input
                value={formAlmocoSaida.descricao}
                onChange={(e) => setFormAlmocoSaida({ ...formAlmocoSaida, descricao: e.target.value })}
                placeholder={tipoAlmocoSaida === 'almoco' ? 'Ex: Almoço, Consulta médica...' : 'Ex: Saída, Fim do expediente...'}
                className="bg-zinc-800 border-amber-500/20 text-gray-300 placeholder:text-gray-500"
              />
            </div>
            <Button 
              onClick={criarAgendamentoAlmocoSaida} 
              disabled={loading} 
              className="w-full bg-amber-500 hover:bg-amber-600 text-white"
            >
              {loading ? 'Salvando...' : `Marcar ${tipoAlmocoSaida === 'almoco' ? 'Almoço' : 'Saída'}`}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

