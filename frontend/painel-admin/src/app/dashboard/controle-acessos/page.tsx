'use client'

import { useState, useEffect } from 'react'
import { motion } from 'motion/react'
import { Shield, Calendar, Users, TrendingUp, Filter, UserCheck, Activity } from 'lucide-react'
import { usePermissions } from '@/hooks/usePermissions'

interface Acesso {
  id: string
  usuario_id: string
  usuario_tipo: string
  data_acesso: string
  quantidade_login: number
  primeiro_acesso: string
  ultimo_acesso: string
  nome_usuario: string
  email_usuario: string
  funcionario_responsavel_nome?: string | null
  funcionario_responsavel_id?: string | null
}

interface Funcionario {
  id: string
  nome_completo: string
}

interface Estatisticas {
  periodo: {
    data_inicio: string
    data_fim: string
  }
  total_usuarios_unicos: number
  total_logins: number
  total_usuarios_cadastrados?: number
  total_clientes_cadastrados?: number
  total_administrativos_cadastrados?: number
  por_tipo: Array<{
    usuario_tipo: string
    usuarios_unicos: number
    total_logins: number
  }>
  por_dia: Array<{
    data_acesso: string
    usuarios_unicos: number
    total_logins: number
  }>
}

export default function ControleAcessosPage() {
  const [acessos, setAcessos] = useState<Acesso[]>([])
  const [estatisticas, setEstatisticas] = useState<Estatisticas | null>(null)
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([])
  const [loading, setLoading] = useState(true)
  const [dataInicio, setDataInicio] = useState('')
  const [dataFim, setDataFim] = useState('')
  const [funcionarioFiltro, setFuncionarioFiltro] = useState('')
  const { podeAcessar } = usePermissions()

  useEffect(() => {
    // Definir período padrão: último mês
    const hoje = new Date()
    const umMesAtras = new Date(hoje)
    umMesAtras.setMonth(umMesAtras.getMonth() - 1)

    const formatDate = (date: Date) => {
      return date.toISOString().split('T')[0]
    }

    setDataInicio(formatDate(umMesAtras))
    setDataFim(formatDate(hoje))
  }, [])

  useEffect(() => {
    carregarFuncionarios()
  }, [])

  useEffect(() => {
    if (dataInicio && dataFim) {
      carregarDados()
    }
  }, [dataInicio, dataFim, funcionarioFiltro])

  const carregarFuncionarios = async () => {
    try {
      const adminData = localStorage.getItem('admin')
      const admin = adminData ? JSON.parse(adminData) : null
      const tipoUsuario = admin?.tipo_usuario || 'master'

      const apiUrl = 'https://api.protesecapilarcuiaba.com.br'
      const response = await fetch(`${apiUrl}/api/v1/funcionarios?tipo_usuario=${tipoUsuario}`)

      if (response.ok) {
        const data = await response.json()
        setFuncionarios(data.funcionarios || [])
      }
    } catch (error: any) {
      console.error('Erro ao carregar funcionários:', error)
    }
  }

  const carregarDados = async () => {
    if (!dataInicio || !dataFim) return

    setLoading(true)
    try {
      const apiUrl = 'https://api.protesecapilarcuiaba.com.br'
      
      let urlAcessos = `${apiUrl}/api/v1/controle-acessos?data_inicio=${dataInicio}&data_fim=${dataFim}`
      if (funcionarioFiltro) {
        urlAcessos += `&funcionario_responsavel_id=${funcionarioFiltro}`
      }
      
      const [acessosRes, estatisticasRes] = await Promise.all([
        fetch(urlAcessos),
        fetch(`${apiUrl}/api/v1/controle-acessos/estatisticas?data_inicio=${dataInicio}&data_fim=${dataFim}`)
      ])

      if (!acessosRes.ok || !estatisticasRes.ok) {
        throw new Error('Erro ao carregar dados')
      }

      const acessosData = await acessosRes.json()
      const estatisticasData = await estatisticasRes.json()

      setAcessos(acessosData.acessos || [])
      setEstatisticas(estatisticasData)
    } catch (error: any) {
      console.error('Erro ao carregar dados:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatarData = (data: string) => {
    return new Date(data).toLocaleDateString('pt-BR')
  }

  const formatarDataHora = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('pt-BR')
  }

  // Verificar permissões
  if (!podeAcessar('controle_acessos')) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-500 mb-2">Acesso Negado</h2>
          <p className="text-gray-400">Você não tem permissão para acessar esta página.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 md:space-y-6 p-4 md:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-2">
          <Shield className="h-6 w-6 md:h-8 md:w-8 text-amber-500" />
          Controle de Acessos
        </h1>
        <p className="text-gray-400 mt-1 text-sm md:text-base">Monitore os acessos e logins dos usuários do sistema</p>
      </div>

      {/* Filtros */}
      <div className="bg-zinc-900 border border-amber-500/20 rounded-lg p-4">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 md:h-5 md:w-5 text-amber-500" />
            <span className="text-gray-300 font-medium text-sm md:text-base">Filtros:</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-gray-300 text-xs md:text-sm mb-1">Data Início</label>
              <input
                type="date"
                value={dataInicio}
                onChange={(e) => setDataInicio(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm md:text-base text-white focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-gray-300 text-xs md:text-sm mb-1">Data Fim</label>
              <input
                type="date"
                value={dataFim}
                onChange={(e) => setDataFim(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm md:text-base text-white focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-gray-300 text-xs md:text-sm mb-1">Funcionário Responsável</label>
              <select
                value={funcionarioFiltro}
                onChange={(e) => setFuncionarioFiltro(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm md:text-base text-white focus:outline-none focus:border-amber-500"
              >
                <option value="">Todos</option>
                {funcionarios.map((func) => (
                  <option key={func.id} value={func.id}>
                    {func.nome_completo}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Estatísticas */}
      {estatisticas && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {/* Total de Usuários Cadastrados */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-br from-blue-600/20 to-blue-800/20 p-4 md:p-6 rounded-lg shadow-lg border border-blue-500/30 backdrop-blur-sm"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-gray-300 text-xs md:text-sm font-medium">Total Cadastrados</p>
                <h2 className="text-2xl md:text-3xl font-bold text-blue-400 mt-1">
                  {estatisticas.total_usuarios_cadastrados || 0}
                </h2>
                <div className="flex gap-2 mt-2 text-xs text-gray-400">
                  <span>{estatisticas.total_clientes_cadastrados || 0} clientes</span>
                  <span>•</span>
                  <span>{estatisticas.total_administrativos_cadastrados || 0} admin</span>
                </div>
              </div>
              <UserCheck className="h-6 w-6 md:h-8 md:w-8 text-blue-400 flex-shrink-0" />
            </div>
          </motion.div>

          {/* Total de Usuários que Acessaram */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.05 }}
            className="bg-gradient-to-br from-amber-600/20 to-amber-800/20 p-4 md:p-6 rounded-lg shadow-lg border border-amber-500/30 backdrop-blur-sm"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-gray-300 text-xs md:text-sm font-medium">Usuários Ativos</p>
                <h2 className="text-2xl md:text-3xl font-bold text-amber-400 mt-1">
                  {estatisticas.total_usuarios_unicos || 0}
                </h2>
                <p className="text-gray-400 text-xs mt-1">no período</p>
              </div>
              <Activity className="h-6 w-6 md:h-8 md:w-8 text-amber-400 flex-shrink-0" />
            </div>
          </motion.div>

          {/* Total de Logins */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-green-600/20 to-green-800/20 p-4 md:p-6 rounded-lg shadow-lg border border-green-500/30 backdrop-blur-sm"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-gray-300 text-xs md:text-sm font-medium">Total de Logins</p>
                <h2 className="text-2xl md:text-3xl font-bold text-green-400 mt-1">
                  {estatisticas.total_logins || 0}
                </h2>
                <p className="text-gray-400 text-xs mt-1">no período</p>
              </div>
              <TrendingUp className="h-6 w-6 md:h-8 md:w-8 text-green-400 flex-shrink-0" />
            </div>
          </motion.div>

          {/* Por Tipo */}
          {estatisticas.por_tipo.map((tipo, index) => (
            <motion.div
              key={tipo.usuario_tipo}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.15 + index * 0.05 }}
              className={`bg-gradient-to-br ${
                tipo.usuario_tipo === 'cliente'
                  ? 'from-purple-600/20 to-purple-800/20 border-purple-500/30'
                  : 'from-indigo-600/20 to-indigo-800/20 border-indigo-500/30'
              } p-4 md:p-6 rounded-lg shadow-lg border backdrop-blur-sm`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-gray-300 text-xs md:text-sm font-medium capitalize">
                    {tipo.usuario_tipo === 'cliente' ? 'Clientes' : 'Administrativos'}
                  </p>
                  <h2 className={`text-2xl md:text-3xl font-bold mt-1 ${
                    tipo.usuario_tipo === 'cliente' ? 'text-purple-400' : 'text-indigo-400'
                  }`}>
                    {tipo.usuarios_unicos || 0}
                  </h2>
                  <p className="text-gray-400 text-xs mt-1">{tipo.total_logins || 0} logins</p>
                </div>
                <Users className={`h-6 w-6 md:h-8 md:w-8 flex-shrink-0 ${
                  tipo.usuario_tipo === 'cliente' ? 'text-purple-400' : 'text-indigo-400'
                }`} />
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Gráfico de Acessos por Dia */}
      {estatisticas && estatisticas.por_dia.length > 0 && (
        <div className="bg-zinc-900 border border-amber-500/20 rounded-lg p-4 md:p-6">
          <h2 className="text-lg md:text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Calendar className="h-4 w-4 md:h-5 md:w-5 text-amber-500" />
            Acessos por Dia
          </h2>
          <div className="space-y-2 max-h-64 md:max-h-96 overflow-y-auto">
            {estatisticas.por_dia.map((dia) => (
              <div key={dia.data_acesso} className="bg-zinc-800 rounded-lg p-3 md:p-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                  <span className="text-white font-medium text-sm md:text-base">{formatarData(dia.data_acesso)}</span>
                  <div className="flex items-center gap-3 md:gap-4 text-xs md:text-sm">
                    <span className="text-gray-300">{dia.usuarios_unicos} usuários</span>
                    <span className="text-amber-400 font-semibold">{dia.total_logins} logins</span>
                  </div>
                </div>
                <div className="w-full bg-zinc-700 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-amber-500 to-amber-600 h-2 rounded-full transition-all"
                    style={{
                      width: `${Math.min((dia.total_logins / (estatisticas.total_logins || 1)) * 100, 100)}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tabela de Acessos */}
      <div className="bg-zinc-900 border border-amber-500/20 rounded-lg overflow-hidden">
        {loading ? (
          <div className="p-8 md:p-12 text-center">
            <div className="animate-spin rounded-full h-10 w-10 md:h-12 md:w-12 border-b-2 border-amber-500 mx-auto mb-4"></div>
            <p className="text-gray-400 text-sm md:text-base">Carregando acessos...</p>
          </div>
        ) : acessos.length === 0 ? (
          <div className="p-8 md:p-12 text-center">
            <Shield className="h-12 w-12 md:h-16 md:w-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-sm md:text-base">Nenhum acesso encontrado no período selecionado.</p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-zinc-800 border-b border-zinc-700">
                  <tr>
                    <th className="px-4 md:px-6 py-3 md:py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Usuário
                    </th>
                    <th className="px-4 md:px-6 py-3 md:py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Tipo
                    </th>
                    <th className="px-4 md:px-6 py-3 md:py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Funcionário Responsável
                    </th>
                    <th className="px-4 md:px-6 py-3 md:py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Data
                    </th>
                    <th className="px-4 md:px-6 py-3 md:py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Logins
                    </th>
                    <th className="px-4 md:px-6 py-3 md:py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Primeiro Acesso
                    </th>
                    <th className="px-4 md:px-6 py-3 md:py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Último Acesso
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {acessos.map((acesso) => (
                    <motion.tr
                      key={acesso.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="hover:bg-zinc-800/50 transition-colors"
                    >
                      <td className="px-4 md:px-6 py-3 md:py-4">
                        <div>
                          <div className="text-white font-medium text-sm md:text-base">{acesso.nome_usuario || 'N/A'}</div>
                          <div className="text-gray-400 text-xs md:text-sm">{acesso.email_usuario || 'N/A'}</div>
                        </div>
                      </td>
                      <td className="px-4 md:px-6 py-3 md:py-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold capitalize ${
                            acesso.usuario_tipo === 'cliente'
                              ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                              : 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                          }`}
                        >
                          {acesso.usuario_tipo}
                        </span>
                      </td>
                      <td className="px-4 md:px-6 py-3 md:py-4">
                        <span className="text-gray-300 text-sm">
                          {acesso.funcionario_responsavel_nome ? (
                            acesso.funcionario_responsavel_nome
                          ) : (
                            <span className="text-gray-500 italic">
                              {acesso.usuario_tipo === 'cliente' ? 'Nenhum' : '-'}
                            </span>
                          )}
                        </span>
                      </td>
                      <td className="px-4 md:px-6 py-3 md:py-4 text-gray-300 text-sm">
                        {formatarData(acesso.data_acesso)}
                      </td>
                      <td className="px-4 md:px-6 py-3 md:py-4">
                        <span className="text-amber-400 font-semibold">{acesso.quantidade_login}</span>
                      </td>
                      <td className="px-4 md:px-6 py-3 md:py-4 text-gray-400 text-xs md:text-sm">
                        {formatarDataHora(acesso.primeiro_acesso)}
                      </td>
                      <td className="px-4 md:px-6 py-3 md:py-4 text-gray-400 text-xs md:text-sm">
                        {formatarDataHora(acesso.ultimo_acesso)}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="lg:hidden p-4 space-y-4">
              {acessos.map((acesso) => (
                <motion.div
                  key={acesso.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-zinc-800 rounded-lg p-4 border border-zinc-700"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="text-white font-medium text-base mb-1">{acesso.nome_usuario || 'N/A'}</div>
                      <div className="text-gray-400 text-xs mb-2">{acesso.email_usuario || 'N/A'}</div>
                      <span
                        className={`inline-block px-2 py-1 rounded-full text-xs font-semibold capitalize ${
                          acesso.usuario_tipo === 'cliente'
                            ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                            : 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                        }`}
                      >
                        {acesso.usuario_tipo}
                      </span>
                    </div>
                    <span className="text-amber-400 font-bold text-lg">{acesso.quantidade_login}</span>
                  </div>
                  <div className="space-y-2 text-xs text-gray-400 border-t border-zinc-700 pt-3">
                    <div className="flex justify-between">
                      <span>Data:</span>
                      <span className="text-gray-300">{formatarData(acesso.data_acesso)}</span>
                    </div>
                    {acesso.funcionario_responsavel_nome && (
                      <div className="flex justify-between">
                        <span>Responsável:</span>
                        <span className="text-gray-300">{acesso.funcionario_responsavel_nome}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>Primeiro:</span>
                      <span className="text-gray-300">{formatarDataHora(acesso.primeiro_acesso)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Último:</span>
                      <span className="text-gray-300">{formatarDataHora(acesso.ultimo_acesso)}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
