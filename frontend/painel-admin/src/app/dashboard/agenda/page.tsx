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
  if (typeof window !== 'undefined') {
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return 'http://localhost:3001'
    }
  }
  return 'https://api.protesecapilarcuiaba.com.br'
}

interface Funcionario {
  id: string
  nome_completo: string
  tipo_usuario: string
  is_active: boolean
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
  hora_fim: string
}

interface HorariosFuncionamento {
  dia_ativo: boolean
  dia_semana: string
  hora_abertura: string | null
  hora_fechamento: string | null
  horarios: string[]
}

export default function AgendaPage() {
  const [viewMode, setViewMode] = useState<'dia' | 'semana' | 'mes'>('dia')
  const [dataSelecionada, setDataSelecionada] = useState<Date>(new Date())
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([])
  const [disponibilidades, setDisponibilidades] = useState<Disponibilidade[]>([])
  const [loading, setLoading] = useState(false)
  const [funcionarioFiltro, setFuncionarioFiltro] = useState<string>('all')
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([])
  const [funcionariosCarregando, setFuncionariosCarregando] = useState(false)
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [servicos, setServicos] = useState<Servico[]>([])
  const [horariosFuncionamento, setHorariosFuncionamento] = useState<HorariosFuncionamento | null>(null)
  const [dialogAberto, setDialogAberto] = useState(false)
  const [formData, setFormData] = useState({
    cliente_id: '',
    funcionario_id: '',
    servico_id: '',
    data_agendamento: format(new Date(), 'yyyy-MM-dd'),
    hora_inicio: '',
    observacoes: '',
  })
  const [dataBusca, setDataBusca] = useState<Date | undefined>(undefined)
  const [funcionarioBusca, setFuncionarioBusca] = useState<string>('')
  const [calendarioBuscaAberto, setCalendarioBuscaAberto] = useState(false)
  const [usuarioLogado, setUsuarioLogado] = useState<any>(null)

  const { podeAcessar, podeEditar, permissoesLoading } = usePermissions()

  useEffect(() => {
    const adminData = localStorage.getItem('admin')
    if (adminData) {
      setUsuarioLogado(JSON.parse(adminData))
    }
  }, [])

  const carregarFuncionarios = useCallback(async () => {
    setFuncionariosCarregando(true)
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        setFuncionariosCarregando(false)
        return
      }
      const apiUrl = getApiBaseUrl()
      const response = await fetch(`${apiUrl}/api/v1/funcionarios`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (response.ok) {
        const data = await response.json()
        const funcionariosFiltrados = (data.funcionarios || []).filter(
          (func: Funcionario) => func.tipo_usuario !== 'master' && func.is_active !== false
        )
        setFuncionarios(funcionariosFiltrados)
      }
    } catch (error) {
      console.error('Erro ao carregar funcionários:', error)
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

      const response = await fetch(
        `${apiUrl}/api/v1/agendamentos/horarios-funcionamento?data=${dataFormatada}`,
        { headers }
      )

      if (response.ok) {
        const data = await response.json()
        return data as HorariosFuncionamento
      }
      return null
    } catch (error) {
      console.error('Erro ao carregar horários de funcionamento:', error)
      return null
    }
  }, [])

  const carregarAgendamentos = useCallback(async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        setLoading(false)
        return
      }

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

      let url = `${apiUrl}/api/v1/agendamentos?data_inicio=${dataInicio}&data_fim=${dataFim}`
      if (funcionarioFiltro && funcionarioFiltro !== 'all') {
        url += `&funcionario_id=${funcionarioFiltro}`
      }

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

      const response = await fetch(url, { headers })

      if (response.ok) {
        const data = await response.json()
        setAgendamentos(data.agendamentos || [])
      }
    } catch (error) {
      console.error('Erro ao carregar agendamentos:', error)
    } finally {
      setLoading(false)
    }
  }, [dataSelecionada, funcionarioFiltro, viewMode])

  const buscarDisponibilidades = useCallback(async () => {
    if (!dataBusca || !funcionarioBusca) return

    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        setLoading(false)
        return
      }

      const apiUrl = getApiBaseUrl()
      const dataFormatada = format(dataBusca, 'yyyy-MM-dd')

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

      const response = await fetch(
        `${apiUrl}/api/v1/agendamentos/disponibilidades?data=${dataFormatada}&funcionario_id=${funcionarioBusca}`,
        { headers }
      )

      if (response.ok) {
        const data = await response.json()
        setDisponibilidades(data.disponibilidades || [])
      }
    } catch (error) {
      console.error('Erro ao buscar disponibilidades:', error)
    } finally {
      setLoading(false)
    }
  }, [dataBusca, funcionarioBusca])

  // Carregar dados iniciais
  useEffect(() => {
    if (permissoesLoading || !podeAcessar('agenda')) {
      return
    }

    const token = localStorage.getItem('token')
    if (!token) {
      return
    }

    setFuncionariosCarregando(true)
    carregarFuncionarios()
    carregarClientes()
    carregarServicos()
  }, [permissoesLoading, podeAcessar, carregarFuncionarios, carregarClientes, carregarServicos])

  // Carregar horários e agendamentos quando a data ou filtro mudar
  useEffect(() => {
    if (permissoesLoading || !podeAcessar('agenda')) {
      return
    }

    const token = localStorage.getItem('token')
    if (!token) {
      return
    }

    // Carregar horários de funcionamento
    carregarHorariosFuncionamento(dataSelecionada).then((horarios) => {
      setHorariosFuncionamento(horarios)
    })
    
    // Carregar agendamentos
    carregarAgendamentos()
  }, [dataSelecionada, funcionarioFiltro, viewMode, permissoesLoading, podeAcessar, carregarHorariosFuncionamento, carregarAgendamentos])

  const criarAgendamento = async () => {
    if (!formData.cliente_id || !formData.funcionario_id || !formData.servico_id || !formData.hora_inicio) {
      alert('Preencha todos os campos obrigatórios')
      return
    }

    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        setLoading(false)
        return
      }

      const apiUrl = getApiBaseUrl()
      const adminData = localStorage.getItem('admin')
      const admin = adminData ? JSON.parse(adminData) : null

      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      }
      if (admin?.id) {
        headers['x-user-id'] = admin.id
        headers['x-user-tipo'] = admin.tipo_usuario || 'administrativo'
        headers['x-user-nome'] = admin.nome_completo || 'Sistema'
      }

      const response = await fetch(`${apiUrl}/api/v1/agendamentos`, {
        method: 'POST',
        headers,
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setDialogAberto(false)
        setFormData({
          cliente_id: '',
          funcionario_id: '',
          servico_id: '',
          data_agendamento: format(new Date(), 'yyyy-MM-dd'),
          hora_inicio: '',
          observacoes: '',
        })
        carregarAgendamentos()
        alert('Agendamento criado com sucesso!')
      } else {
        const error = await response.json()
        alert(error.error || 'Erro ao criar agendamento')
      }
    } catch (error) {
      console.error('Erro ao criar agendamento:', error)
      alert('Erro ao criar agendamento')
    } finally {
      setLoading(false)
    }
  }


  const renderizarVistaDia = () => {
    const agendamentosDoDia = agendamentos.filter((a) => isSameDay(new Date(a.data_agendamento), dataSelecionada))
    
    // Se não houver horários de funcionamento ainda, mostrar loading
    if (horariosFuncionamento === null) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-400">Carregando horários de funcionamento...</div>
        </div>
      )
    }
    
    // Se o dia não estiver ativo ou não houver horários, mostrar mensagem
    if (!horariosFuncionamento.dia_ativo || !horariosFuncionamento.horarios || horariosFuncionamento.horarios.length === 0) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-400">Este dia não possui horário de funcionamento configurado</div>
        </div>
      )
    }

    const horarios = horariosFuncionamento.horarios

    return (
      <div className="space-y-1">
        {horarios.map((horario) => {
          const [hora, minuto] = horario.split(':').map(Number)
          const horarioMinutos = hora * 60 + minuto
          
          // Encontrar agendamentos que começam neste horário ou que estão em andamento neste horário
          const agendamentosNesteHorario = agendamentosDoDia.filter((a) => {
            const [horaInicioH, minutoInicioM] = a.hora_inicio.split(':').map(Number)
            const [horaFimH, minutoFimM] = a.hora_fim.split(':').map(Number)
            const inicioMinutos = horaInicioH * 60 + minutoInicioM
            const fimMinutos = horaFimH * 60 + minutoFimM
            
            // Agendamento começa neste horário ou está em andamento neste horário
            return inicioMinutos === horarioMinutos || (inicioMinutos < horarioMinutos && fimMinutos > horarioMinutos)
          })

          return (
            <div key={horario} className="flex gap-4">
              <div className="w-24 text-right text-gray-400 text-sm pt-2">
                {horario}
              </div>
              <div className="flex-1 space-y-2">
                {agendamentosNesteHorario
                  .filter((a) => {
                    const [horaInicioH] = a.hora_inicio.split(':').map(Number)
                    const [minutoInicioM] = a.hora_inicio.split(':').map(Number)
                    const inicioMinutos = horaInicioH * 60 + minutoInicioM
                    return inicioMinutos === horarioMinutos
                  })
                  .map((agendamento) => {
                    const [horaInicioH, minutoInicioM] = agendamento.hora_inicio.split(':').map(Number)
                    const [horaFimH, minutoFimM] = agendamento.hora_fim.split(':').map(Number)
                    const inicioMinutos = horaInicioH * 60 + minutoInicioM
                    const fimMinutos = horaFimH * 60 + minutoFimM
                    const duracaoMinutos = fimMinutos - inicioMinutos
                    // Altura baseada em 15 minutos = 60px
                    const altura = (duracaoMinutos / 15) * 60

                    return (
                      <Card
                        key={agendamento.id}
                        className="bg-zinc-900 border-l-4"
                        style={{
                          borderLeftColor:
                            agendamento.status === 'concluido'
                              ? '#10b981'
                              : agendamento.status === 'cancelado'
                              ? '#ef4444'
                              : agendamento.status === 'em_andamento'
                              ? '#3b82f6'
                              : '#f59e0b',
                          minHeight: `${altura}px`,
                        }}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <Scissors className="h-4 w-4 text-amber-400 mt-1" />
                            <div className="flex-1">
                              <div className="font-semibold text-gray-300">{agendamento.cliente_nome}</div>
                              <div className="text-sm text-gray-400 flex items-center gap-2 mt-1">
                                <User className="h-3 w-3 text-blue-400" />
                                {agendamento.funcionario_nome}
                              </div>
                              <div className="text-sm text-gray-400 flex items-center gap-2 mt-1">
                                <Scissors className="h-3 w-3 text-amber-400" />
                                {agendamento.servico_nome}
                              </div>
                              <div className="text-sm text-gray-400 flex items-center gap-2 mt-1">
                                <Clock className="h-3 w-3 text-purple-400" />
                                {agendamento.hora_inicio} - {agendamento.hora_fim}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
              </div>
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
          <Button onClick={() => setDialogAberto(true)} className="bg-amber-500 hover:bg-amber-600 text-white">
            <Plus className="h-4 w-4 mr-2" />
            Novo Agendamento
          </Button>
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
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <Label className="text-gray-300">Data</Label>
              <Popover open={calendarioBuscaAberto} onOpenChange={setCalendarioBuscaAberto}>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className={`w-full justify-start text-left font-normal bg-zinc-800 border-amber-500/20 text-gray-300 hover:bg-zinc-700 ${
                      !dataBusca && 'text-gray-500'
                    }`}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dataBusca ? (
                      format(dataBusca, "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR })
                    ) : (
                      <span>Selecione uma data</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-zinc-900 border-amber-500/20" align="start">
                  <Calendar
                    mode="single"
                    selected={dataBusca}
                    onSelect={(date) => {
                      setDataBusca(date)
                      setCalendarioBuscaAberto(false)
                    }}
                    initialFocus
                    locale={ptBR}
                    className="bg-zinc-900"
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="flex-1">
              <Label className="text-gray-300">Funcionário</Label>
              <Select value={funcionarioBusca} onValueChange={setFuncionarioBusca}>
                <SelectTrigger className="bg-zinc-800 border-amber-500/20 text-gray-300">
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
            <Button
              onClick={buscarDisponibilidades}
              disabled={loading || !dataBusca || !funcionarioBusca}
              className="bg-amber-500 hover:bg-amber-600 text-white"
            >
              <Search className="h-4 w-4 mr-2" />
              Buscar
            </Button>
          </div>
          {disponibilidades.length > 0 && (
            <div className="mt-4 space-y-2">
              <Label className="text-gray-300">Horários Disponíveis:</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {disponibilidades.map((disp, index) => (
                  <Card key={index} className="bg-zinc-800 border-amber-500/20">
                    <CardContent className="p-3">
                      <div className="text-gray-300 text-sm">
                        Livre das {disp.hora_inicio} às {disp.hora_fim}
                      </div>
                    </CardContent>
                  </Card>
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
              <Select value={funcionarioFiltro} onValueChange={setFuncionarioFiltro}>
                <SelectTrigger className="w-48 bg-zinc-800 border-amber-500/20 text-gray-300">
                  <SelectValue placeholder="Filtrar por funcionário" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-amber-500/20">
                  <SelectItem value="all" className="text-gray-300">Todos os funcionários</SelectItem>
                  {funcionarios.map((func) => (
                    <SelectItem key={func.id} value={func.id} className="text-gray-300">
                      {func.nome_completo}
                    </SelectItem>
                  ))}
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

      <Dialog open={dialogAberto} onOpenChange={setDialogAberto}>
        <DialogContent className="bg-zinc-900 border-amber-500/20 text-gray-300 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-gray-300">Novo Agendamento</DialogTitle>
            <DialogDescription className="text-gray-400">Preencha os dados do agendamento</DialogDescription>
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
            <Button onClick={criarAgendamento} disabled={loading} className="w-full bg-amber-500 hover:bg-amber-600 text-white">
              {loading ? 'Criando...' : 'Criar Agendamento'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

