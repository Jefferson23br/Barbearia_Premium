'use client'

import { useState, useEffect } from 'react'
import { motion } from 'motion/react'
import { LayoutDashboard, TrendingUp, TrendingDown, Users, Calendar, Receipt, Loader2 } from 'lucide-react'

interface DashboardData {
  receitas: {
    receitas_pagas: number
    receitas_pendentes: number
    receitas_total: number
  }
  despesas: {
    despesas_pagas: number
    despesas_pendentes: number
    despesas_total: number
  }
  total_clientes: number
  agendamentos_hoje: number
  ultimas_vendas: Array<{
    id: string
    ticket: string
    data_venda: string
    valor_liquido: number
    cliente_nome: string | null
    funcionario_nome: string | null
  }>
  proximos_agendamentos: Array<{
    id: string
    data_agendamento: string
    hora_inicio: string
    status: string
    cliente_nome: string
    funcionario_nome: string
    servico_nome: string
  }>
  tipo_usuario: string
  is_proprietario: boolean
}

export default function DashboardPage() {
  const [dados, setDados] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const getApiBaseUrl = () => {
    if (typeof window !== 'undefined') {
      return process.env.NEXT_PUBLIC_API_URL || 'https://api6.actusconsultoria.com.br'
    }
    return 'https://api6.actusconsultoria.com.br'
  }

  const formatarPreco = (valor: number | string | null | undefined) => {
    if (valor === null || valor === undefined) return 'R$ 0,00'
    const num = typeof valor === 'string' ? parseFloat(valor) : valor
    if (isNaN(num)) return 'R$ 0,00'
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(num)
  }

  const formatarData = (data: string) => {
    if (!data) return ''
    try {
      return new Date(data).toLocaleDateString('pt-BR')
    } catch {
      return data
    }
  }

  const formatarHora = (hora: string) => {
    if (!hora) return ''
    try {
      const [h, m] = hora.split(':')
      return `${h}:${m}`
    } catch {
      return hora
    }
  }

  useEffect(() => {
    const carregarDashboard = async () => {
      try {
        setLoading(true)
        setError(null)

        const adminData = localStorage.getItem('admin')
        const admin = adminData ? JSON.parse(adminData) : null

        if (!admin?.id) {
          setError('Usuário não autenticado')
          return
        }

        const apiUrl = getApiBaseUrl()
        const headers: HeadersInit = {
          'Content-Type': 'application/json',
        }
        if (admin?.id) {
          headers['x-user-id'] = admin.id
          headers['x-user-tipo'] = admin.tipo_usuario || 'administrativo'
          headers['x-user-nome'] = admin.nome_completo || null
        }

        const response = await fetch(`${apiUrl}/api/v1/dashboard`, { headers })

        if (!response.ok) {
          throw new Error(`Erro ao carregar dashboard: ${response.status}`)
        }

        const data = await response.json()
        setDados(data)
      } catch (err: any) {
        console.error('Erro ao carregar dashboard:', err)
        setError(err.message || 'Erro ao carregar dados do dashboard')
      } finally {
        setLoading(false)
      }
    }

    carregarDashboard()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-amber-500" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="bg-zinc-900 border border-red-500/20 rounded-lg p-6">
          <p className="text-red-500">{error}</p>
        </div>
      </div>
    )
  }

  if (!dados) {
    return null
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <p className="text-gray-400 mt-1">
          {dados.is_proprietario 
            ? 'Visão geral do sistema' 
            : 'Suas informações'}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-zinc-900 border border-amber-500/20 rounded-lg p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">
                {dados.is_proprietario ? 'Receitas do Mês' : 'Minhas Receitas do Mês'}
              </p>
              <p className="text-2xl font-bold text-white mt-1">
                {formatarPreco(dados.receitas.receitas_total)}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Pagas: {formatarPreco(dados.receitas.receitas_pagas)} | 
                Pendentes: {formatarPreco(dados.receitas.receitas_pendentes)}
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-500" />
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
              <p className="text-gray-400 text-sm">
                {dados.is_proprietario ? 'Despesas do Mês' : 'Minhas Despesas do Mês'}
              </p>
              <p className="text-2xl font-bold text-white mt-1">
                {formatarPreco(dados.despesas.despesas_total)}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Pagas: {formatarPreco(dados.despesas.despesas_pagas)} | 
                Pendentes: {formatarPreco(dados.despesas.despesas_pendentes)}
              </p>
            </div>
            <TrendingDown className="h-8 w-8 text-red-500" />
          </div>
        </motion.div>

        {dados.is_proprietario && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-zinc-900 border border-amber-500/20 rounded-lg p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total de Clientes</p>
                <p className="text-2xl font-bold text-white mt-1">{dados.total_clientes}</p>
            </div>
            <Users className="h-8 w-8 text-blue-500" />
          </div>
        </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: dados.is_proprietario ? 0.3 : 0.2 }}
          className="bg-zinc-900 border border-amber-500/20 rounded-lg p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">
                {dados.is_proprietario ? 'Agendamentos Hoje' : 'Meus Agendamentos Hoje'}
              </p>
              <p className="text-2xl font-bold text-white mt-1">{dados.agendamentos_hoje}</p>
            </div>
            <Calendar className="h-8 w-8 text-amber-500" />
          </div>
        </motion.div>
      </div>

      {/* Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-zinc-900 border border-amber-500/20 rounded-lg p-6"
        >
          <h2 className="text-xl font-bold text-white mb-4">
            {dados.is_proprietario ? 'Últimas Vendas' : 'Minhas Últimas Vendas'}
          </h2>
          {dados.ultimas_vendas.length > 0 ? (
            <div className="space-y-3">
              {dados.ultimas_vendas.map((venda) => (
                <div
                  key={venda.id}
                  className="bg-zinc-800 rounded-lg p-4 border border-zinc-700 hover:border-amber-500/40 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-semibold">Ticket: {venda.ticket}</p>
                      <p className="text-gray-400 text-sm">
                        {venda.cliente_nome || 'Cliente não informado'} • {formatarData(venda.data_venda)}
                      </p>
                      {dados.is_proprietario && venda.funcionario_nome && (
                        <p className="text-gray-500 text-xs">Funcionário: {venda.funcionario_nome}</p>
                      )}
                    </div>
                    <p className="text-green-500 font-bold">{formatarPreco(venda.valor_liquido)}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
          <p className="text-gray-400 text-center py-8">Nenhuma venda registrada</p>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-zinc-900 border border-amber-500/20 rounded-lg p-6"
        >
          <h2 className="text-xl font-bold text-white mb-4">
            {dados.is_proprietario ? 'Próximos Agendamentos' : 'Meus Próximos Agendamentos'}
          </h2>
          {dados.proximos_agendamentos.length > 0 ? (
            <div className="space-y-3">
              {dados.proximos_agendamentos.map((agendamento) => (
                <div
                  key={agendamento.id}
                  className="bg-zinc-800 rounded-lg p-4 border border-zinc-700 hover:border-amber-500/40 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-semibold">{agendamento.servico_nome}</p>
                      <p className="text-gray-400 text-sm">
                        {agendamento.cliente_nome} • {formatarData(agendamento.data_agendamento)} às {formatarHora(agendamento.hora_inicio)}
                      </p>
                      {dados.is_proprietario && (
                        <p className="text-gray-500 text-xs">Funcionário: {agendamento.funcionario_nome}</p>
                      )}
                    </div>
                    <span className={`px-2 py-1 rounded text-xs ${
                      agendamento.status === 'confirmado' 
                        ? 'bg-green-500/20 text-green-400' 
                        : 'bg-amber-500/20 text-amber-400'
                    }`}>
                      {agendamento.status === 'confirmado' ? 'Confirmado' : 'Agendado'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
          <p className="text-gray-400 text-center py-8">Nenhum agendamento</p>
          )}
        </motion.div>
      </div>
    </div>
  )
}

