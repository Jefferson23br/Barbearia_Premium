'use client'

import { useState, useEffect } from 'react'
import { motion } from 'motion/react'
import { HelpCircle, MessageSquare, AlertCircle, CheckCircle2, Clock, Search, Filter, Plus, X, Edit, Download, FileText, Image as ImageIcon, Send, User, Mail, Phone, Calendar, Tag } from 'lucide-react'
import { usePermissions } from '@/hooks/usePermissions'

interface Chamado {
  id: string
  data_emissao: string
  tipo_chamado: string
  descricao: string
  email_contato: string | null
  telefone_whatsapp: string | null
  temperatura: 'verde' | 'amarelo' | 'vermelho'
  status: 'INICIADO' | 'ABERTO' | 'EM DESENVOLVIMENTO' | 'RESOLVIDO'
  funcionario_abriu_id: string
  funcionario_abriu_nome: string
  responsavel_id: string
  responsavel_nome: string
  total_respostas: number
  anexos?: Anexo[]
  respostas?: Resposta[]
}

interface Anexo {
  id: string
  nome_arquivo: string
  url_arquivo: string
  tipo_arquivo: 'imagem' | 'pdf'
  tamanho_bytes: number
}

interface Resposta {
  id: string
  chamado_id: string
  funcionario_id: string
  funcionario_nome: string
  mensagem: string
  created_at: string
  anexos: Anexo[]
}

interface Funcionario {
  id: string
  nome_completo: string
  email: string
  tipo_usuario: string
}

const TIPOS_CHAMADO = [
  'Erro de Sistema',
  'Erro de Lançamento',
  'Averiguação de Modificação',
  'Criação de Cadastro',
  'Atualização',
  'Aperfeiçoamento',
  'Dúvida',
  'Solicitação de Funcionalidade',
  'Outro'
]

export default function HelpDeskPage() {
  const { podeAcessar, loading: permissoesLoading } = usePermissions()
  const [chamados, setChamados] = useState<Chamado[]>([])
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([])
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState<string | null>(null)
  const [showModalCriar, setShowModalCriar] = useState(false)
  const [showModalVisualizar, setShowModalVisualizar] = useState(false)
  const [chamadoSelecionado, setChamadoSelecionado] = useState<Chamado | null>(null)
  const [editando, setEditando] = useState(false)

  // Filtros
  const [filtroStatus, setFiltroStatus] = useState<string>('')
  const [filtroTemperatura, setFiltroTemperatura] = useState<string>('')
  const [filtroTipo, setFiltroTipo] = useState<string>('')

  // Form criar chamado
  const [formCriar, setFormCriar] = useState({
    tipo_chamado: '',
    descricao: '',
    email_contato: '',
    telefone_whatsapp: '',
    temperatura: 'amarelo' as 'verde' | 'amarelo' | 'vermelho',
    responsavel_id: '',
    anexos: [] as File[]
  })

  // Form resposta
  const [formResposta, setFormResposta] = useState({
    mensagem: '',
    anexos: [] as File[]
  })

  // Form editar
  const [formEditar, setFormEditar] = useState({
    status: '',
    responsavel_id: ''
  })

  useEffect(() => {
    if (!permissoesLoading && podeAcessar('help_desk')) {
      carregarChamados()
      carregarFuncionarios()
    }
  }, [permissoesLoading, filtroStatus, filtroTemperatura, filtroTipo])

  const carregarChamados = async () => {
    try {
      setLoading(true)
      setErro(null)
      const apiUrl = 'https://api.protesecapilarcuiaba.com.br'
      
      // Buscar dados do admin do localStorage
      const adminData = localStorage.getItem('admin')
      if (!adminData) {
        setErro('Usuário não autenticado. Faça login novamente.')
        setLoading(false)
        return
      }

      const admin = JSON.parse(adminData)
      const usuarioId = admin.id
      const usuarioTipo = admin.tipo_usuario || 'funcionario'

      if (!usuarioId) {
        setErro('Usuário não autenticado. Faça login novamente.')
        setLoading(false)
        return
      }

      const params = new URLSearchParams()
      if (filtroStatus) params.append('status', filtroStatus)
      if (filtroTemperatura) params.append('temperatura', filtroTemperatura)
      if (filtroTipo) params.append('tipo_chamado', filtroTipo)

      const response = await fetch(`${apiUrl}/api/v1/help-desk/chamados?${params.toString()}`, {
        headers: {
          'x-user-id': usuarioId,
          'x-user-tipo': usuarioTipo
        },
        cache: 'no-store'
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Erro desconhecido' }))
        console.error('Erro ao carregar chamados:', errorData)
        
        if (response.status === 404) {
          setErro('Endpoint não encontrado. Verifique se o backend foi atualizado.')
        } else if (response.status === 401) {
          setErro('Não autorizado. Faça login novamente.')
        } else {
          setErro(errorData.error || `Erro ${response.status}: ${response.statusText}`)
        }
        
        setChamados([])
        setLoading(false)
        return
      }

      const data = await response.json()
      setChamados(data.chamados || [])
      setErro(null)
    } catch (error) {
      console.error('Erro ao carregar chamados:', error)
      setErro('Erro de conexão. Verifique se o servidor está online.')
      setChamados([])
    } finally {
      setLoading(false)
    }
  }

  const carregarFuncionarios = async () => {
    try {
      const apiUrl = 'https://api.protesecapilarcuiaba.com.br'
      const response = await fetch(`${apiUrl}/api/v1/help-desk/funcionarios`, { 
        cache: 'no-store' 
      })
      
      if (!response.ok) {
        console.error('Erro ao carregar funcionários:', response.status)
        return
      }

      const data = await response.json()
      setFuncionarios(data.funcionarios || [])
      
      // Definir Master como responsável padrão
      const master = data.funcionarios.find((f: Funcionario) => f.tipo_usuario === 'master')
      if (master) {
        setFormCriar(prev => ({ ...prev, responsavel_id: master.id }))
      }
    } catch (error) {
      console.error('Erro ao carregar funcionários:', error)
    }
  }

  const carregarChamadoCompleto = async (id: string) => {
    try {
      const apiUrl = 'https://api.protesecapilarcuiaba.com.br'
      
      const adminData = localStorage.getItem('admin')
      if (!adminData) return
      
      const admin = JSON.parse(adminData)
      const usuarioId = admin.id
      const usuarioTipo = admin.tipo_usuario || 'funcionario'

      const response = await fetch(`${apiUrl}/api/v1/help-desk/chamados/${id}`, {
        headers: {
          'x-user-id': usuarioId || '',
          'x-user-tipo': usuarioTipo
        },
        cache: 'no-store'
      })

      const data = await response.json()
      if (response.ok) {
        setChamadoSelecionado(data.chamado)
        setFormEditar({
          status: data.chamado.status,
          responsavel_id: data.chamado.responsavel_id
        })
      }
    } catch (error) {
      console.error('Erro ao carregar chamado:', error)
    }
  }

  const criarChamado = async () => {
    try {
      const apiUrl = 'https://api.protesecapilarcuiaba.com.br'
      
      const adminData = localStorage.getItem('admin')
      if (!adminData) {
        alert('Usuário não autenticado. Faça login novamente.')
        return
      }
      
      const admin = JSON.parse(adminData)
      const usuarioId = admin.id
      const usuarioTipo = admin.tipo_usuario || 'funcionario'

      const formData = new FormData()
      formData.append('tipo_chamado', formCriar.tipo_chamado)
      formData.append('descricao', formCriar.descricao)
      formData.append('temperatura', formCriar.temperatura)
      if (formCriar.email_contato) formData.append('email_contato', formCriar.email_contato)
      if (formCriar.telefone_whatsapp) formData.append('telefone_whatsapp', formCriar.telefone_whatsapp)
      if (formCriar.responsavel_id) formData.append('responsavel_id', formCriar.responsavel_id)

      formCriar.anexos.forEach((file) => {
        formData.append('anexos', file)
      })

      const response = await fetch(`${apiUrl}/api/v1/help-desk/chamados`, {
        method: 'POST',
        headers: {
          'x-user-id': usuarioId || '',
          'x-user-tipo': usuarioTipo
        },
        body: formData
      })

      const data = await response.json()
      if (response.ok) {
        alert('Chamado criado com sucesso!')
        setShowModalCriar(false)
        setFormCriar({
          tipo_chamado: '',
          descricao: '',
          email_contato: '',
          telefone_whatsapp: '',
          temperatura: 'amarelo',
          responsavel_id: funcionarios.find(f => f.tipo_usuario === 'master')?.id || '',
          anexos: []
        })
        carregarChamados()
      } else {
        alert(`Erro: ${data.error || 'Erro ao criar chamado'}`)
      }
    } catch (error) {
      console.error('Erro ao criar chamado:', error)
      alert('Erro ao criar chamado')
    }
  }

  const adicionarResposta = async () => {
    if (!chamadoSelecionado || !formResposta.mensagem.trim()) {
      alert('Digite uma mensagem')
      return
    }

    try {
      const apiUrl = 'https://api.protesecapilarcuiaba.com.br'
      
      const adminData = localStorage.getItem('admin')
      if (!adminData) {
        alert('Usuário não autenticado. Faça login novamente.')
        return
      }
      
      const admin = JSON.parse(adminData)
      const usuarioId = admin.id
      const usuarioTipo = admin.tipo_usuario || 'funcionario'

      const formData = new FormData()
      formData.append('mensagem', formResposta.mensagem)

      formResposta.anexos.forEach((file) => {
        formData.append('anexos', file)
      })

      const response = await fetch(`${apiUrl}/api/v1/help-desk/chamados/${chamadoSelecionado.id}/respostas`, {
        method: 'POST',
        headers: {
          'x-user-id': usuarioId || '',
          'x-user-tipo': usuarioTipo
        },
        body: formData
      })

      const data = await response.json()
      if (response.ok) {
        setFormResposta({ mensagem: '', anexos: [] })
        carregarChamadoCompleto(chamadoSelecionado.id)
        carregarChamados()
      } else {
        alert(`Erro: ${data.error || 'Erro ao adicionar resposta'}`)
      }
    } catch (error) {
      console.error('Erro ao adicionar resposta:', error)
      alert('Erro ao adicionar resposta')
    }
  }

  const atualizarChamado = async () => {
    if (!chamadoSelecionado) return

    try {
      const apiUrl = 'https://api.protesecapilarcuiaba.com.br'
      
      const adminData = localStorage.getItem('admin')
      if (!adminData) {
        alert('Usuário não autenticado. Faça login novamente.')
        return
      }
      
      const admin = JSON.parse(adminData)
      const usuarioId = admin.id
      const usuarioTipo = admin.tipo_usuario || 'funcionario'

      if (!usuarioId) {
        alert('Erro: ID do usuário não encontrado. Faça login novamente.')
        return
      }

      const body: any = {}
      if (formEditar.status) body.status = formEditar.status
      if (formEditar.responsavel_id) body.responsavel_id = formEditar.responsavel_id

      const response = await fetch(`${apiUrl}/api/v1/help-desk/chamados/${chamadoSelecionado.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': String(usuarioId),
          'x-user-tipo': String(usuarioTipo)
        },
        body: JSON.stringify(body)
      })

      const data = await response.json()
      if (response.ok) {
        alert('Chamado atualizado com sucesso!')
        setEditando(false)
        carregarChamadoCompleto(chamadoSelecionado.id)
        carregarChamados()
      } else {
        alert(`Erro: ${data.error || 'Erro ao atualizar chamado'}`)
      }
    } catch (error) {
      console.error('Erro ao atualizar chamado:', error)
      alert('Erro ao atualizar chamado')
    }
  }

  const getTemperaturaColor = (temperatura: string) => {
    switch (temperatura) {
      case 'verde':
        return 'bg-green-500/10 text-green-500 border-green-500/20'
      case 'amarelo':
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
      case 'vermelho':
        return 'bg-red-500/10 text-red-500 border-red-500/20'
      default:
        return 'bg-gray-500/10 text-gray-500 border-gray-500/20'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'INICIADO':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20'
      case 'ABERTO':
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
      case 'EM DESENVOLVIMENTO':
        return 'bg-orange-500/10 text-orange-500 border-orange-500/20'
      case 'RESOLVIDO':
        return 'bg-green-500/10 text-green-500 border-green-500/20'
      default:
        return 'bg-gray-500/10 text-gray-500 border-gray-500/20'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'INICIADO':
        return <Clock className="h-4 w-4" />
      case 'ABERTO':
        return <AlertCircle className="h-4 w-4" />
      case 'EM DESENVOLVIMENTO':
        return <Clock className="h-4 w-4" />
      case 'RESOLVIDO':
        return <CheckCircle2 className="h-4 w-4" />
      default:
        return <HelpCircle className="h-4 w-4" />
    }
  }

  const formatarTamanho = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  if (permissoesLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
      </div>
    )
  }

  if (!podeAcessar('help_desk')) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-white text-lg">Acesso Negado</p>
          <p className="text-gray-400">Você não tem permissão para acessar esta página.</p>
        </div>
      </div>
    )
  }

  const stats = {
    total: chamados.length,
    abertos: chamados.filter(c => c.status === 'ABERTO').length,
    emDesenvolvimento: chamados.filter(c => c.status === 'EM DESENVOLVIMENTO').length,
    resolvidos: chamados.filter(c => c.status === 'RESOLVIDO').length,
  }

  return (
    <div className="space-y-6 overflow-x-hidden">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-2">
            <HelpCircle className="h-8 w-8 text-amber-500" />
            Help Desk
          </h1>
          <p className="text-gray-400 mt-1">Sistema de Chamados de Manutenção</p>
        </div>
        <button
          onClick={() => setShowModalCriar(true)}
          className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-colors"
        >
          <Plus className="h-5 w-5" />
          <span>Novo Chamado</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-zinc-900 border border-amber-500/20 rounded-lg p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total de Chamados</p>
              <p className="text-2xl font-bold text-white mt-1">{stats.total}</p>
            </div>
            <MessageSquare className="h-8 w-8 text-blue-500" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-zinc-900 border border-amber-500/20 rounded-lg p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Abertos</p>
              <p className="text-2xl font-bold text-white mt-1">{stats.abertos}</p>
            </div>
            <AlertCircle className="h-8 w-8 text-yellow-500" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-zinc-900 border border-amber-500/20 rounded-lg p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Em Desenvolvimento</p>
              <p className="text-2xl font-bold text-white mt-1">{stats.emDesenvolvimento}</p>
            </div>
            <Clock className="h-8 w-8 text-orange-500" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-zinc-900 border border-amber-500/20 rounded-lg p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Resolvidos</p>
              <p className="text-2xl font-bold text-white mt-1">{stats.resolvidos}</p>
            </div>
            <CheckCircle2 className="h-8 w-8 text-green-500" />
          </div>
        </motion.div>
      </div>

      {/* Filtros */}
      <div className="bg-zinc-900 border border-amber-500/20 rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-gray-300 text-sm mb-2">Status</label>
            <select
              value={filtroStatus}
              onChange={(e) => setFiltroStatus(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="">Todos</option>
              <option value="INICIADO">Iniciado</option>
              <option value="ABERTO">Aberto</option>
              <option value="EM DESENVOLVIMENTO">Em Desenvolvimento</option>
              <option value="RESOLVIDO">Resolvido</option>
            </select>
          </div>

          <div>
            <label className="block text-gray-300 text-sm mb-2">Temperatura</label>
            <select
              value={filtroTemperatura}
              onChange={(e) => setFiltroTemperatura(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="">Todas</option>
              <option value="verde">Verde</option>
              <option value="amarelo">Amarelo</option>
              <option value="vermelho">Vermelho</option>
            </select>
          </div>

          <div>
            <label className="block text-gray-300 text-sm mb-2">Tipo</label>
            <select
              value={filtroTipo}
              onChange={(e) => setFiltroTipo(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="">Todos</option>
              {TIPOS_CHAMADO.map(tipo => (
                <option key={tipo} value={tipo}>{tipo}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Lista de Chamados */}
      <div className="bg-zinc-900 border border-amber-500/20 rounded-lg overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Carregando chamados...</p>
          </div>
        ) : erro ? (
          <div className="p-12 text-center">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <p className="text-red-400 text-lg font-semibold">Erro ao carregar chamados</p>
            <p className="text-gray-400 text-sm mt-2">{erro}</p>
            <button
              onClick={carregarChamados}
              className="mt-4 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-colors"
            >
              Tentar Novamente
            </button>
          </div>
        ) : chamados.length === 0 ? (
          <div className="p-12 text-center">
            <MessageSquare className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">Nenhum chamado encontrado</p>
            <p className="text-gray-500 text-sm mt-2">Tente ajustar os filtros de busca ou criar um novo chamado</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px]">
              <thead className="bg-zinc-800 border-b border-amber-500/20">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Data</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Tipo</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Descrição</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Aberto Por</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Responsável</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Temperatura</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {chamados.map((chamado, index) => (
                  <motion.tr
                    key={chamado.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.02 }}
                    className="hover:bg-zinc-800/50 transition-colors"
                  >
                    <td className="px-4 py-3 text-sm text-gray-300 whitespace-nowrap">
                      {new Date(chamado.data_emissao).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-300">{chamado.tipo_chamado}</td>
                    <td className="px-4 py-3 text-sm text-gray-400 max-w-xs truncate">{chamado.descricao}</td>
                    <td className="px-4 py-3 text-sm text-gray-300">{chamado.funcionario_abriu_nome}</td>
                    <td className="px-4 py-3 text-sm text-gray-300">{chamado.responsavel_nome}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`px-2 py-1 rounded text-xs border ${getTemperaturaColor(chamado.temperatura)}`}>
                        {chamado.temperatura.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`px-2 py-1 rounded text-xs border flex items-center gap-1 w-fit ${getStatusColor(chamado.status)}`}>
                        {getStatusIcon(chamado.status)}
                        <span>{chamado.status}</span>
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <button
                        onClick={() => {
                          setChamadoSelecionado(chamado)
                          carregarChamadoCompleto(chamado.id)
                          setShowModalVisualizar(true)
                          setEditando(false)
                        }}
                        className="text-amber-500 hover:text-amber-400 transition-colors text-xs"
                      >
                        Abrir
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Criar Chamado */}
      {showModalCriar && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-zinc-900 border border-amber-500/20 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Novo Chamado</h2>
              <button
                onClick={() => setShowModalCriar(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-gray-300 text-sm mb-2">Tipo de Chamado *</label>
                <select
                  value={formCriar.tipo_chamado}
                  onChange={(e) => setFormCriar({ ...formCriar, tipo_chamado: e.target.value })}
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="">Selecione...</option>
                  {TIPOS_CHAMADO.map(tipo => (
                    <option key={tipo} value={tipo}>{tipo}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-300 text-sm mb-2">Descrição *</label>
                <textarea
                  value={formCriar.descricao}
                  onChange={(e) => setFormCriar({ ...formCriar, descricao: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="Descreva o problema ou solicitação..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 text-sm mb-2">Email de Contato</label>
                  <input
                    type="email"
                    value={formCriar.email_contato}
                    onChange={(e) => setFormCriar({ ...formCriar, email_contato: e.target.value })}
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder="email@exemplo.com"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 text-sm mb-2">Telefone WhatsApp</label>
                  <input
                    type="text"
                    value={formCriar.telefone_whatsapp}
                    onChange={(e) => setFormCriar({ ...formCriar, telefone_whatsapp: e.target.value })}
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder="(65) 99999-9999"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 text-sm mb-2">Temperatura *</label>
                  <select
                    value={formCriar.temperatura}
                    onChange={(e) => setFormCriar({ ...formCriar, temperatura: e.target.value as 'verde' | 'amarelo' | 'vermelho' })}
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="verde">Verde (Baixa)</option>
                    <option value="amarelo">Amarelo (Média)</option>
                    <option value="vermelho">Vermelho (Alta)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-300 text-sm mb-2">Responsável</label>
                  <select
                    value={formCriar.responsavel_id}
                    onChange={(e) => setFormCriar({ ...formCriar, responsavel_id: e.target.value })}
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                    disabled
                  >
                    {funcionarios.map(func => (
                      <option key={func.id} value={func.id}>{func.nome_completo} ({func.tipo_usuario})</option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">Padrão: Master (não editável)</p>
                </div>
              </div>

              <div>
                <label className="block text-gray-300 text-sm mb-2">Anexos (Imagens e PDFs)</label>
                <input
                  type="file"
                  multiple
                  accept="image/*,.pdf"
                  onChange={(e) => {
                    const files = Array.from(e.target.files || [])
                    setFormCriar({ ...formCriar, anexos: [...formCriar.anexos, ...files] })
                  }}
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                {formCriar.anexos.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {formCriar.anexos.map((file, idx) => (
                      <div key={idx} className="text-xs text-gray-400 flex items-center justify-between">
                        <span>{file.name}</span>
                        <button
                          onClick={() => {
                            const novosAnexos = formCriar.anexos.filter((_, i) => i !== idx)
                            setFormCriar({ ...formCriar, anexos: novosAnexos })
                          }}
                          className="text-red-400 hover:text-red-300"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  onClick={criarChamado}
                  disabled={!formCriar.tipo_chamado || !formCriar.descricao}
                  className="flex-1 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Criar Chamado
                </button>
                <button
                  onClick={() => setShowModalCriar(false)}
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Modal Visualizar Chamado */}
      {showModalVisualizar && chamadoSelecionado && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-zinc-900 border border-amber-500/20 rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Chamado #{chamadoSelecionado.id.substring(0, 8)}</h2>
              <div className="flex items-center gap-2">
                {!editando && (
                  <button
                    onClick={() => setEditando(true)}
                    className="px-3 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-sm transition-colors flex items-center gap-2"
                  >
                    <Edit className="h-4 w-4" />
                    Editar
                  </button>
                )}
                <button
                  onClick={() => {
                    setShowModalVisualizar(false)
                    setChamadoSelecionado(null)
                    setEditando(false)
                  }}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            {editando ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-300 text-sm mb-2">Status</label>
                    <select
                      value={formEditar.status}
                      onChange={(e) => setFormEditar({ ...formEditar, status: e.target.value })}
                      className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                    >
                      <option value="INICIADO">Iniciado</option>
                      <option value="ABERTO">Aberto</option>
                      <option value="EM DESENVOLVIMENTO">Em Desenvolvimento</option>
                      <option value="RESOLVIDO">Resolvido</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-gray-300 text-sm mb-2">Responsável</label>
                    <select
                      value={formEditar.responsavel_id}
                      onChange={(e) => setFormEditar({ ...formEditar, responsavel_id: e.target.value })}
                      className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                    >
                      {funcionarios.map(func => (
                        <option key={func.id} value={func.id}>{func.nome_completo} ({func.tipo_usuario})</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    onClick={atualizarChamado}
                    className="flex-1 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-colors"
                  >
                    Salvar Alterações
                  </button>
                  <button
                    onClick={() => {
                      setEditando(false)
                      setFormEditar({
                        status: chamadoSelecionado.status,
                        responsavel_id: chamadoSelecionado.responsavel_id
                      })
                    }}
                    className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Informações do Chamado */}
                <div className="space-y-4 mb-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-gray-400 text-sm mb-1">Data de Emissão</p>
                      <p className="text-white">{new Date(chamadoSelecionado.data_emissao).toLocaleString('pt-BR')}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm mb-1">Tipo</p>
                      <p className="text-white">{chamadoSelecionado.tipo_chamado}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm mb-1">Aberto Por</p>
                      <p className="text-white">{chamadoSelecionado.funcionario_abriu_nome}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm mb-1">Responsável</p>
                      <p className="text-white">{chamadoSelecionado.responsavel_nome}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm mb-1">Temperatura</p>
                      <span className={`px-2 py-1 rounded text-xs border inline-block ${getTemperaturaColor(chamadoSelecionado.temperatura)}`}>
                        {chamadoSelecionado.temperatura.toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm mb-1">Status</p>
                      <span className={`px-2 py-1 rounded text-xs border flex items-center gap-1 w-fit ${getStatusColor(chamadoSelecionado.status)}`}>
                        {getStatusIcon(chamadoSelecionado.status)}
                        <span>{chamadoSelecionado.status}</span>
                      </span>
                    </div>
                  </div>

                  <div>
                    <p className="text-gray-400 text-sm mb-1">Descrição</p>
                    <p className="text-white bg-zinc-800 p-3 rounded-lg">{chamadoSelecionado.descricao}</p>
                  </div>

                  {(chamadoSelecionado.email_contato || chamadoSelecionado.telefone_whatsapp) && (
                    <div className="grid grid-cols-2 gap-4">
                      {chamadoSelecionado.email_contato && (
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-400 text-sm">{chamadoSelecionado.email_contato}</span>
                        </div>
                      )}
                      {chamadoSelecionado.telefone_whatsapp && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-400 text-sm">{chamadoSelecionado.telefone_whatsapp}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Anexos do Chamado */}
                  {chamadoSelecionado.anexos && chamadoSelecionado.anexos.length > 0 && (
                    <div>
                      <p className="text-gray-400 text-sm mb-2">Anexos do Chamado</p>
                      <div className="grid grid-cols-2 gap-2">
                        {chamadoSelecionado.anexos.map((anexo) => (
                          <div key={anexo.id} className="bg-zinc-800 p-3 rounded-lg flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {anexo.tipo_arquivo === 'imagem' ? (
                                <ImageIcon className="h-4 w-4 text-gray-400" />
                              ) : (
                                <FileText className="h-4 w-4 text-gray-400" />
                              )}
                              <span className="text-white text-sm truncate">{anexo.nome_arquivo}</span>
                              <span className="text-gray-500 text-xs">({formatarTamanho(anexo.tamanho_bytes)})</span>
                            </div>
                            <a
                              href={anexo.url_arquivo}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-amber-500 hover:text-amber-400"
                            >
                              <Download className="h-4 w-4" />
                            </a>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Histórico de Respostas */}
                <div className="border-t border-zinc-800 pt-6">
                  <h3 className="text-lg font-bold text-white mb-4">Histórico de Respostas</h3>
                  <div className="space-y-4 mb-6">
                    {chamadoSelecionado.respostas && chamadoSelecionado.respostas.length > 0 ? (
                      chamadoSelecionado.respostas.map((resposta) => (
                        <div key={resposta.id} className="bg-zinc-800 p-4 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-gray-400" />
                              <span className="text-white font-medium">{resposta.funcionario_nome}</span>
                            </div>
                            <span className="text-gray-500 text-xs">
                              {new Date(resposta.created_at).toLocaleString('pt-BR')}
                            </span>
                          </div>
                          <p className="text-gray-300 text-sm mb-3">{resposta.mensagem}</p>
                          {resposta.anexos && resposta.anexos.length > 0 && (
                            <div className="grid grid-cols-2 gap-2 mt-3">
                              {resposta.anexos.map((anexo) => (
                                <div key={anexo.id} className="bg-zinc-900 p-2 rounded flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    {anexo.tipo_arquivo === 'imagem' ? (
                                      <ImageIcon className="h-3 w-3 text-gray-400" />
                                    ) : (
                                      <FileText className="h-3 w-3 text-gray-400" />
                                    )}
                                    <span className="text-white text-xs truncate">{anexo.nome_arquivo}</span>
                                  </div>
                                  <a
                                    href={anexo.url_arquivo}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-amber-500 hover:text-amber-400"
                                  >
                                    <Download className="h-3 w-3" />
                                  </a>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 text-sm">Nenhuma resposta ainda</p>
                    )}
                  </div>

                  {/* Formulário de Resposta */}
                  <div className="border-t border-zinc-800 pt-4">
                    <h4 className="text-white font-medium mb-3">Adicionar Resposta</h4>
                    <div className="space-y-3">
                      <textarea
                        value={formResposta.mensagem}
                        onChange={(e) => setFormResposta({ ...formResposta, mensagem: e.target.value })}
                        rows={3}
                        className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                        placeholder="Digite sua resposta..."
                      />
                      <div>
                        <label className="block text-gray-300 text-sm mb-2">Anexos (Opcional)</label>
                        <input
                          type="file"
                          multiple
                          accept="image/*,.pdf"
                          onChange={(e) => {
                            const files = Array.from(e.target.files || [])
                            setFormResposta({ ...formResposta, anexos: [...formResposta.anexos, ...files] })
                          }}
                          className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                        />
                        {formResposta.anexos.length > 0 && (
                          <div className="mt-2 space-y-1">
                            {formResposta.anexos.map((file, idx) => (
                              <div key={idx} className="text-xs text-gray-400 flex items-center justify-between">
                                <span>{file.name}</span>
                                <button
                                  onClick={() => {
                                    const novosAnexos = formResposta.anexos.filter((_, i) => i !== idx)
                                    setFormResposta({ ...formResposta, anexos: novosAnexos })
                                  }}
                                  className="text-red-400 hover:text-red-300"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      <button
                        onClick={adicionarResposta}
                        disabled={!formResposta.mensagem.trim()}
                        className="w-full px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        <Send className="h-4 w-4" />
                        Enviar Resposta
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        </div>
      )}
    </div>
  )
}
