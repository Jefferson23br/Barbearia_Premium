'use client'

import { useState } from 'react'
import { motion } from 'motion/react'
import { HelpCircle, MessageSquare, AlertCircle, CheckCircle2, Clock, Search, Filter, Plus } from 'lucide-react'

type TicketStatus = 'aberto' | 'em_andamento' | 'resolvido' | 'fechado'
type TicketPriority = 'baixa' | 'media' | 'alta' | 'urgente'

interface Ticket {
  id: string
  titulo: string
  descricao: string
  solicitante: string
  status: TicketStatus
  prioridade: TicketPriority
  categoria: string
  dataCriacao: string
  ultimaAtualizacao: string
}

export default function HelpDeskPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<TicketStatus | 'todos'>('todos')
  const [filterPriority, setFilterPriority] = useState<TicketPriority | 'todos'>('todos')

  // Dados mockados para exemplo
  const tickets: Ticket[] = [
    // Exemplo de tickets
  ]

  const getStatusColor = (status: TicketStatus) => {
    switch (status) {
      case 'aberto':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20'
      case 'em_andamento':
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
      case 'resolvido':
        return 'bg-green-500/10 text-green-500 border-green-500/20'
      case 'fechado':
        return 'bg-gray-500/10 text-gray-500 border-gray-500/20'
      default:
        return 'bg-gray-500/10 text-gray-500 border-gray-500/20'
    }
  }

  const getPriorityColor = (priority: TicketPriority) => {
    switch (priority) {
      case 'baixa':
        return 'bg-green-500/10 text-green-500'
      case 'media':
        return 'bg-yellow-500/10 text-yellow-500'
      case 'alta':
        return 'bg-orange-500/10 text-orange-500'
      case 'urgente':
        return 'bg-red-500/10 text-red-500'
      default:
        return 'bg-gray-500/10 text-gray-500'
    }
  }

  const getStatusIcon = (status: TicketStatus) => {
    switch (status) {
      case 'aberto':
        return <AlertCircle className="h-4 w-4" />
      case 'em_andamento':
        return <Clock className="h-4 w-4" />
      case 'resolvido':
        return <CheckCircle2 className="h-4 w-4" />
      case 'fechado':
        return <CheckCircle2 className="h-4 w-4" />
      default:
        return <HelpCircle className="h-4 w-4" />
    }
  }

  const filteredTickets = tickets.filter((ticket) => {
    const matchesSearch = ticket.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.solicitante.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = filterStatus === 'todos' || ticket.status === filterStatus
    const matchesPriority = filterPriority === 'todos' || ticket.prioridade === filterPriority

    return matchesSearch && matchesStatus && matchesPriority
  })

  const stats = {
    total: tickets.length,
    abertos: tickets.filter(t => t.status === 'aberto').length,
    emAndamento: tickets.filter(t => t.status === 'em_andamento').length,
    resolvidos: tickets.filter(t => t.status === 'resolvido').length,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-2">
            <HelpCircle className="h-8 w-8 text-amber-500" />
            Help Desk
          </h1>
          <p className="text-gray-400 mt-1">Painel de Pedidos de Suporte</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-colors">
          <Plus className="h-5 w-5" />
          <span>Novo Ticket</span>
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
              <p className="text-gray-400 text-sm">Total de Tickets</p>
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
            <AlertCircle className="h-8 w-8 text-blue-500" />
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
              <p className="text-gray-400 text-sm">Em Andamento</p>
              <p className="text-2xl font-bold text-white mt-1">{stats.emAndamento}</p>
            </div>
            <Clock className="h-8 w-8 text-yellow-500" />
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

      {/* Filters */}
      <div className="bg-zinc-900 border border-amber-500/20 rounded-lg p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar tickets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as TicketStatus | 'todos')}
            className="px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="todos">Todos os Status</option>
            <option value="aberto">Aberto</option>
            <option value="em_andamento">Em Andamento</option>
            <option value="resolvido">Resolvido</option>
            <option value="fechado">Fechado</option>
          </select>

          {/* Priority Filter */}
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value as TicketPriority | 'todos')}
            className="px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="todos">Todas as Prioridades</option>
            <option value="baixa">Baixa</option>
            <option value="media">Média</option>
            <option value="alta">Alta</option>
            <option value="urgente">Urgente</option>
          </select>
        </div>
      </div>

      {/* Tickets List */}
      <div className="bg-zinc-900 border border-amber-500/20 rounded-lg overflow-hidden">
        {filteredTickets.length === 0 ? (
          <div className="p-12 text-center">
            <MessageSquare className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">Nenhum ticket encontrado</p>
            <p className="text-gray-500 text-sm mt-2">
              {tickets.length === 0
                ? 'Ainda não há tickets cadastrados'
                : 'Tente ajustar os filtros de busca'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-800">
            {filteredTickets.map((ticket, index) => (
              <motion.div
                key={ticket.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="p-6 hover:bg-zinc-800/50 transition-colors cursor-pointer"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-white">{ticket.titulo}</h3>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center gap-1 ${getStatusColor(
                          ticket.status
                        )}`}
                      >
                        {getStatusIcon(ticket.status)}
                        <span className="capitalize">{ticket.status.replace('_', ' ')}</span>
                      </span>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(
                          ticket.prioridade
                        )}`}
                      >
                        {ticket.prioridade.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-gray-400 text-sm mb-3 line-clamp-2">{ticket.descricao}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>Solicitante: {ticket.solicitante}</span>
                      <span>Categoria: {ticket.categoria}</span>
                      <span>Criado em: {new Date(ticket.dataCriacao).toLocaleDateString('pt-BR')}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

