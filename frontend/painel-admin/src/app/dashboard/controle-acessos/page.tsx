'use client'

import { useState, useEffect } from 'react'
import { motion } from 'motion/react'
import { Shield, Calendar, Users, TrendingUp, Filter, Download } from 'lucide-react'
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
        urlAcessos += `&funcionario_id=${funcionarioFiltro}`
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
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-2">
          <Shield className="h-8 w-8 text-amber-500" />
          Controle de Acessos
        </h1>
        <p className="text-gray-400 mt-1">Monitore os acessos e logins dos usuários do sistema</p>
      </div>

      {/* Filtros */}
      <div className="bg-zinc-900 border border-amber-500/20 rounded-lg p-4">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-amber-500" />
            <span className="text-gray-300 font-medium">Filtros:</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-gray-300 text-sm mb-1">Data Início</label>
              <input
                type="date"
                value={dataInicio}
                onChange={(e) => setDataInicio(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-gray-300 text-sm mb-1">Data Fim</label>
              <input
                type="date"
                value={dataFim}
                onChange={(e) => setDataFim(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-gray-300 text-sm mb-1">Funcionário Responsável</label>
              <select
                value={funcionarioFiltro}
                onChange={(e) => setFuncionarioFiltro(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-amber-500"
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-zinc-800 p-6 rounded-lg shadow-lg border border-amber-500/20"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm">Total de Usuários</p>
                <h2 className="text-3xl font-bold text-amber-400 mt-1">{estatisticas.total_usuarios_unicos}</h2>
              </div>
              <Users className="h-8 w-8 text-amber-500" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-zinc-800 p-6 rounded-lg shadow-lg border border-green-500/20"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm">Total de Logins</p>
                <h2 className="text-3xl font-bold text-green-400 mt-1">{estatisticas.total_logins}</h2>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </motion.div>

          {estatisticas.por_tipo.map((tipo, index) => (
            <motion.div
              key={tipo.usuario_tipo}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 + index * 0.1 }}
              className="bg-zinc-800 p-6 rounded-lg shadow-lg border border-blue-500/20"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-300 text-sm capitalize">{tipo.usuario_tipo}</p>
                  <h2 className="text-3xl font-bold text-blue-400 mt-1">{tipo.usuarios_unicos}</h2>
                  <p className="text-gray-400 text-xs mt-1">{tipo.total_logins} logins</p>
                </div>
                <Users className="h-8 w-8 text-blue-500" />
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Gráfico de Acessos por Dia */}
      {estatisticas && estatisticas.por_dia.length > 0 && (
        <div className="bg-zinc-900 border border-amber-500/20 rounded-lg p-6">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-amber-500" />
            Acessos por Dia
          </h2>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {estatisticas.por_dia.map((dia) => (
              <div key={dia.data_acesso} className="bg-zinc-800 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-medium">{formatarData(dia.data_acesso)}</span>
                  <div className="flex items-center gap-4">
                    <span className="text-gray-300 text-sm">{dia.usuarios_unicos} usuários</span>
                    <span className="text-amber-400 font-semibold">{dia.total_logins} logins</span>
                  </div>
                </div>
                <div className="w-full bg-zinc-700 rounded-full h-2">
                  <div
                    className="bg-amber-500 h-2 rounded-full transition-all"
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
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Carregando acessos...</p>
          </div>
        ) : acessos.length === 0 ? (
          <div className="p-12 text-center">
            <Shield className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">Nenhum acesso encontrado no período selecionado.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead className="bg-zinc-800 border-b border-zinc-700">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Usuário
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Funcionário Responsável
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Data
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Quantidade de Logins
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Primeiro Acesso
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
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
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-white font-medium">{acesso.nome_usuario || 'N/A'}</div>
                        <div className="text-gray-400 text-sm">{acesso.email_usuario || 'N/A'}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
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
                    <td className="px-6 py-4 whitespace-nowrap">
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
                    <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                      {formatarData(acesso.data_acesso)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-amber-400 font-semibold">{acesso.quantidade_login}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-400 text-sm">
                      {formatarDataHora(acesso.primeiro_acesso)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-400 text-sm">
                      {formatarDataHora(acesso.ultimo_acesso)}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

