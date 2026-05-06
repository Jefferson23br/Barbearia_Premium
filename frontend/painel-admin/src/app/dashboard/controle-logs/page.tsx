'use client'

import { useState, useEffect } from 'react'
import { motion } from 'motion/react'
import { FileSearch, Filter, Download, Calendar, User, Activity, AlertCircle, CheckCircle2, XCircle, Search } from 'lucide-react'
import { usePermissions } from '@/hooks/usePermissions'

interface Log {
  id: string
  usuario_id: string
  usuario_tipo: string
  usuario_nome: string
  acao: string
  modulo: string
  entidade_id: string | null
  entidade_tipo: string | null
  descricao: string | null
  dados_anteriores: any
  dados_novos: any
  ip_address: string | null
  user_agent: string | null
  status: string
  mensagem_erro: string | null
  created_at: string
}

interface Estatisticas {
  periodo: {
    data_inicio: string
    data_fim: string
  }
  total_logs: number
  por_modulo: Array<{ modulo: string; quantidade: number }>
  por_acao: Array<{ acao: string; quantidade: number }>
  por_status: Array<{ status: string; quantidade: number }>
  por_usuario: Array<{ usuario_nome: string; usuario_tipo: string; quantidade: number }>
  por_dia: Array<{ data: string; quantidade: number }>
}

export default function ControleLogsPage() {
  const { podeAcessar, loading: permissoesLoading } = usePermissions()
  const [logs, setLogs] = useState<Log[]>([])
  const [estatisticas, setEstatisticas] = useState<Estatisticas | null>(null)
  const [loading, setLoading] = useState(true)
  const [expandedLog, setExpandedLog] = useState<string | null>(null)

  // Filtros
  const [dataInicio, setDataInicio] = useState<string>('')
  const [dataFim, setDataFim] = useState<string>('')
  const [filtroModulo, setFiltroModulo] = useState<string>('')
  const [filtroAcao, setFiltroAcao] = useState<string>('')
  const [filtroStatus, setFiltroStatus] = useState<string>('')
  const [filtroUsuario, setFiltroUsuario] = useState<string>('')

  // Verificar permissão
  useEffect(() => {
    if (!permissoesLoading && !podeAcessar('controle_logs')) {
      // Redirecionar ou mostrar mensagem de acesso negado
    }
  }, [permissoesLoading, podeAcessar])

  // Carregar logs e estatísticas
  useEffect(() => {
    carregarLogs()
    carregarEstatisticas()
  }, [dataInicio, dataFim, filtroModulo, filtroAcao, filtroStatus, filtroUsuario])

  const carregarLogs = async () => {
    try {
      setLoading(true)
      const apiUrl = 'https://api6.actusconsultoria.com.br'
      
      const params = new URLSearchParams()
      if (dataInicio) params.append('data_inicio', dataInicio)
      if (dataFim) params.append('data_fim', dataFim)
      if (filtroModulo) params.append('modulo', filtroModulo)
      if (filtroAcao) params.append('acao', filtroAcao)
      if (filtroStatus) params.append('status', filtroStatus)
      if (filtroUsuario) params.append('usuario_id', filtroUsuario)
      params.append('limit', '100')

      const response = await fetch(`${apiUrl}/api/v1/logs?${params.toString()}`)
      const data = await response.json()

      if (response.ok) {
        setLogs(data.logs || [])
      }
    } catch (error) {
      console.error('Erro ao carregar logs:', error)
    } finally {
      setLoading(false)
    }
  }

  const carregarEstatisticas = async () => {
    try {
      const apiUrl = 'https://api6.actusconsultoria.com.br'
      
      const params = new URLSearchParams()
      if (dataInicio) params.append('data_inicio', dataInicio)
      if (dataFim) params.append('data_fim', dataFim)

      const response = await fetch(`${apiUrl}/api/v1/logs/estatisticas?${params.toString()}`)
      const data = await response.json()

      if (response.ok) {
        setEstatisticas(data)
      }
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error)
    }
  }

  // Definir período padrão (último mês)
  useEffect(() => {
    const hoje = new Date()
    const umMesAtras = new Date(hoje)
    umMesAtras.setMonth(umMesAtras.getMonth() - 1)

    if (!dataInicio) {
      setDataInicio(umMesAtras.toISOString().split('T')[0])
    }
    if (!dataFim) {
      setDataFim(hoje.toISOString().split('T')[0])
    }
  }, [])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sucesso':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />
      case 'erro':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'cancelado':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />
      default:
        return <Activity className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sucesso':
        return 'bg-green-500/10 text-green-500 border-green-500/20'
      case 'erro':
        return 'bg-red-500/10 text-red-500 border-red-500/20'
      case 'cancelado':
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
      default:
        return 'bg-gray-500/10 text-gray-500 border-gray-500/20'
    }
  }

  const getAcaoLabel = (acao: string) => {
    const acoes: Record<string, string> = {
      criar: 'Criar',
      editar: 'Editar',
      excluir: 'Excluir',
      visualizar: 'Visualizar',
      login: 'Login',
      logout: 'Logout',
    }
    return acoes[acao] || acao
  }

  const getModuloLabel = (modulo: string) => {
    const modulos: Record<string, string> = {
      cliente: 'Cliente',
      funcionario: 'Funcionário',
      permissao: 'Permissão',
      venda: 'Venda',
      despesa: 'Despesa',
      agendamento: 'Agendamento',
    }
    return modulos[modulo] || modulo
  }

  const exportarParaCSV = async () => {
    try {
      setLoading(true)
      const apiUrl = 'https://api6.actusconsultoria.com.br'
      
      // Construir parâmetros base
      const baseParams = new URLSearchParams()
      if (dataInicio) baseParams.append('data_inicio', dataInicio)
      if (dataFim) baseParams.append('data_fim', dataFim)
      if (filtroModulo) baseParams.append('modulo', filtroModulo)
      if (filtroAcao) baseParams.append('acao', filtroAcao)
      if (filtroStatus) baseParams.append('status', filtroStatus)
      if (filtroUsuario) baseParams.append('usuario_id', filtroUsuario)

      // Buscar todos os logs com paginação
      const logsParaExportar: Log[] = []
      const limit = 1000 // Limite por requisição
      let offset = 0
      let hasMore = true

      while (hasMore) {
        const params = new URLSearchParams(baseParams.toString())
        params.append('limit', limit.toString())
        params.append('offset', offset.toString())

        const response = await fetch(`${apiUrl}/api/v1/logs?${params.toString()}`)
        const data = await response.json()

        if (!response.ok) {
          throw new Error('Erro ao buscar logs para exportação')
        }

        const logs = data.logs || []
        logsParaExportar.push(...logs)

        // Verificar se há mais logs
        const total = data.paginacao?.total || 0
        hasMore = offset + logs.length < total
        offset += logs.length

        // Limite de segurança (máximo 100.000 logs)
        if (logsParaExportar.length >= 100000) {
          console.warn('Limite de 100.000 logs atingido. Exportando os primeiros 100.000.')
          break
        }
      }

      // Converter para CSV
      const headers = [
        'Data/Hora',
        'ID do Log',
        'Usuário ID',
        'Usuário Nome',
        'Tipo de Usuário',
        'Ação',
        'Módulo',
        'Entidade ID',
        'Tipo de Entidade',
        'Descrição',
        'Status',
        'IP Address',
        'User Agent',
        'Mensagem de Erro',
        'Dados Anteriores',
        'Dados Novos'
      ]

      // Função para escapar valores CSV
      const escapeCSV = (value: any): string => {
        if (value === null || value === undefined) return ''
        const str = typeof value === 'object' ? JSON.stringify(value) : String(value)
        // Se contém vírgula, aspas ou quebra de linha, envolver em aspas e escapar aspas
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
          return `"${str.replace(/"/g, '""')}"`
        }
        return str
      }

      // Criar linhas CSV
      const csvRows = [
        headers.join(',')
      ]

      logsParaExportar.forEach((log: Log) => {
        const row = [
          new Date(log.created_at).toLocaleString('pt-BR'),
          log.id,
          log.usuario_id || '',
          log.usuario_nome || '',
          log.usuario_tipo || '',
          log.acao,
          log.modulo,
          log.entidade_id || '',
          log.entidade_tipo || '',
          log.descricao || '',
          log.status,
          log.ip_address || '',
          log.user_agent || '',
          log.mensagem_erro || '',
          log.dados_anteriores ? JSON.stringify(log.dados_anteriores) : '',
          log.dados_novos ? JSON.stringify(log.dados_novos) : ''
        ]
        csvRows.push(row.map(escapeCSV).join(','))
      })

      // Criar blob e fazer download
      const csvContent = csvRows.join('\n')
      const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' }) // BOM para Excel
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      
      // Nome do arquivo com data e filtros
      const dataAtual = new Date().toISOString().split('T')[0]
      const periodo = dataInicio && dataFim ? `${dataInicio}_${dataFim}` : 'todos'
      const filtros = []
      if (filtroModulo) filtros.push(`modulo-${filtroModulo}`)
      if (filtroAcao) filtros.push(`acao-${filtroAcao}`)
      if (filtroStatus) filtros.push(`status-${filtroStatus}`)
      const sufixoFiltros = filtros.length > 0 ? `_${filtros.join('-')}` : ''
      const nomeArquivo = `logs_${dataAtual}_${periodo}${sufixoFiltros}.csv`
      link.download = nomeArquivo
      
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      // Notificar sucesso
      const mensagem = logsParaExportar.length > 0 
        ? `✅ Exportação concluída!\n\n${logsParaExportar.length} log(s) exportado(s) com sucesso.\n\nArquivo: ${nomeArquivo}`
        : '⚠️ Nenhum log encontrado para exportar com os filtros aplicados.'
      alert(mensagem)
    } catch (error) {
      console.error('Erro ao exportar logs:', error)
      alert(`❌ Erro ao exportar logs.\n\n${error instanceof Error ? error.message : 'Tente novamente.'}`)
    } finally {
      setLoading(false)
    }
  }

  if (permissoesLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
      </div>
    )
  }

  if (!podeAcessar('controle_logs')) {
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

  return (
    <div className="space-y-6 overflow-x-hidden">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-2">
            <FileSearch className="h-8 w-8 text-amber-500" />
            Controle de Logs
          </h1>
          <p className="text-gray-400 mt-1">Registro de todas as ações do sistema</p>
        </div>
        <button 
          onClick={exportarParaCSV}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Download className="h-5 w-5" />
          <span>Exportar CSV</span>
        </button>
      </div>

      {/* Estatísticas */}
      {estatisticas && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-zinc-900 border border-amber-500/20 rounded-lg p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total de Logs</p>
                <p className="text-2xl font-bold text-white mt-1">{estatisticas.total_logs}</p>
              </div>
              <FileSearch className="h-8 w-8 text-blue-500" />
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
                <p className="text-gray-400 text-sm">Módulos Únicos</p>
                <p className="text-2xl font-bold text-white mt-1">{estatisticas.por_modulo.length}</p>
              </div>
              <Activity className="h-8 w-8 text-green-500" />
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
                <p className="text-gray-400 text-sm">Ações Únicas</p>
                <p className="text-2xl font-bold text-white mt-1">{estatisticas.por_acao.length}</p>
              </div>
              <User className="h-8 w-8 text-amber-500" />
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
                <p className="text-gray-400 text-sm">Com Erros</p>
                <p className="text-2xl font-bold text-white mt-1">
                  {estatisticas.por_status.find(s => s.status === 'erro')?.quantidade || 0}
                </p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
          </motion.div>
        </div>
      )}

      {/* Filtros */}
      <div className="bg-zinc-900 border border-amber-500/20 rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {/* Data Início */}
          <div>
            <label className="block text-gray-300 text-sm mb-2">Data Início</label>
            <input
              type="date"
              value={dataInicio}
              onChange={(e) => setDataInicio(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Data Fim */}
          <div>
            <label className="block text-gray-300 text-sm mb-2">Data Fim</label>
            <input
              type="date"
              value={dataFim}
              onChange={(e) => setDataFim(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Módulo */}
          <div>
            <label className="block text-gray-300 text-sm mb-2">Módulo</label>
            <select
              value={filtroModulo}
              onChange={(e) => setFiltroModulo(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="">Todos</option>
              <option value="cliente">Cliente</option>
              <option value="funcionario">Funcionário</option>
              <option value="permissao">Permissão</option>
              <option value="venda">Venda</option>
              <option value="despesa">Despesa</option>
              <option value="agendamento">Agendamento</option>
            </select>
          </div>

          {/* Ação */}
          <div>
            <label className="block text-gray-300 text-sm mb-2">Ação</label>
            <select
              value={filtroAcao}
              onChange={(e) => setFiltroAcao(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="">Todas</option>
              <option value="criar">Criar</option>
              <option value="editar">Editar</option>
              <option value="excluir">Excluir</option>
              <option value="visualizar">Visualizar</option>
              <option value="login">Login</option>
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="block text-gray-300 text-sm mb-2">Status</label>
            <select
              value={filtroStatus}
              onChange={(e) => setFiltroStatus(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="">Todos</option>
              <option value="sucesso">Sucesso</option>
              <option value="erro">Erro</option>
              <option value="cancelado">Cancelado</option>
            </select>
          </div>

          {/* Limpar Filtros */}
          <div className="flex items-end">
            <button
              onClick={() => {
                setFiltroModulo('')
                setFiltroAcao('')
                setFiltroStatus('')
                setFiltroUsuario('')
                const hoje = new Date()
                const umMesAtras = new Date(hoje)
                umMesAtras.setMonth(umMesAtras.getMonth() - 1)
                setDataInicio(umMesAtras.toISOString().split('T')[0])
                setDataFim(hoje.toISOString().split('T')[0])
              }}
              className="w-full px-4 py-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg text-white text-sm transition-colors"
            >
              Limpar
            </button>
          </div>
        </div>
      </div>

      {/* Tabela de Logs */}
      <div className="bg-zinc-900 border border-amber-500/20 rounded-lg overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Carregando logs...</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="p-12 text-center">
            <FileSearch className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">Nenhum log encontrado</p>
            <p className="text-gray-500 text-sm mt-2">Tente ajustar os filtros de busca</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px]">
              <thead className="bg-zinc-800 border-b border-amber-500/20">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Data/Hora</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Usuário</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Ação</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Módulo</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Descrição</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Detalhes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {logs.map((log, index) => (
                  <motion.tr
                    key={log.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.02 }}
                    className="hover:bg-zinc-800/50 transition-colors"
                  >
                    <td className="px-4 py-3 text-sm text-gray-300 whitespace-nowrap">
                      {new Date(log.created_at).toLocaleString('pt-BR')}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-300">
                      <div>
                        <p className="font-medium text-white">{log.usuario_nome || 'N/A'}</p>
                        <p className="text-xs text-gray-500">{log.usuario_tipo}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span className="px-2 py-1 bg-blue-500/10 text-blue-400 rounded text-xs">
                        {getAcaoLabel(log.acao)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-300">
                      {getModuloLabel(log.modulo)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-400 max-w-xs truncate">
                      {log.descricao || '-'}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`px-2 py-1 rounded text-xs border flex items-center gap-1 w-fit ${getStatusColor(log.status)}`}>
                        {getStatusIcon(log.status)}
                        <span className="capitalize">{log.status}</span>
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <button
                        onClick={() => setExpandedLog(expandedLog === log.id ? null : log.id)}
                        className="text-amber-500 hover:text-amber-400 transition-colors text-xs"
                      >
                        {expandedLog === log.id ? 'Ocultar' : 'Ver'}
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detalhes Expandidos */}
      {expandedLog && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-zinc-900 border border-amber-500/20 rounded-lg p-6"
        >
          {(() => {
            const log = logs.find(l => l.id === expandedLog)
            if (!log) return null

            return (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-white">Detalhes do Log</h3>
                  <button
                    onClick={() => setExpandedLog(null)}
                    className="text-gray-400 hover:text-white"
                  >
                    <XCircle className="h-5 w-5" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-400 text-sm mb-1">ID do Log</p>
                    <p className="text-white text-sm font-mono">{log.id}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Entidade ID</p>
                    <p className="text-white text-sm font-mono">{log.entidade_id || '-'}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm mb-1">IP Address</p>
                    <p className="text-white text-sm">{log.ip_address || '-'}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm mb-1">User Agent</p>
                    <p className="text-white text-sm text-xs truncate">{log.user_agent || '-'}</p>
                  </div>
                </div>

                {log.dados_anteriores && (
                  <div>
                    <p className="text-gray-400 text-sm mb-2">Dados Anteriores</p>
                    <pre className="bg-zinc-800 p-4 rounded-lg text-xs text-gray-300 overflow-x-auto">
                      {JSON.stringify(log.dados_anteriores, null, 2)}
                    </pre>
                  </div>
                )}

                {log.dados_novos && (
                  <div>
                    <p className="text-gray-400 text-sm mb-2">Dados Novos</p>
                    <pre className="bg-zinc-800 p-4 rounded-lg text-xs text-gray-300 overflow-x-auto">
                      {JSON.stringify(log.dados_novos, null, 2)}
                    </pre>
                  </div>
                )}

                {log.mensagem_erro && (
                  <div>
                    <p className="text-gray-400 text-sm mb-2">Mensagem de Erro</p>
                    <p className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-400 text-sm">
                      {log.mensagem_erro}
                    </p>
                  </div>
                )}
              </div>
            )
          })()}
        </motion.div>
      )}
    </div>
  )
}


