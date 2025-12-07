'use client'

import { motion } from 'motion/react'
import { LayoutDashboard, TrendingUp, TrendingDown, Users, Calendar, Receipt } from 'lucide-react'

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <p className="text-gray-400 mt-1">Visão geral do sistema</p>
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
              <p className="text-gray-400 text-sm">Receitas do Mês</p>
              <p className="text-2xl font-bold text-white mt-1">R$ 0,00</p>
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
              <p className="text-gray-400 text-sm">Despesas do Mês</p>
              <p className="text-2xl font-bold text-white mt-1">R$ 0,00</p>
            </div>
            <TrendingDown className="h-8 w-8 text-red-500" />
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
              <p className="text-gray-400 text-sm">Total de Clientes</p>
              <p className="text-2xl font-bold text-white mt-1">0</p>
            </div>
            <Users className="h-8 w-8 text-blue-500" />
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
              <p className="text-gray-400 text-sm">Agendamentos Hoje</p>
              <p className="text-2xl font-bold text-white mt-1">0</p>
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
          <h2 className="text-xl font-bold text-white mb-4">Últimas Vendas</h2>
          <p className="text-gray-400 text-center py-8">Nenhuma venda registrada</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-zinc-900 border border-amber-500/20 rounded-lg p-6"
        >
          <h2 className="text-xl font-bold text-white mb-4">Próximos Agendamentos</h2>
          <p className="text-gray-400 text-center py-8">Nenhum agendamento</p>
        </motion.div>
      </div>
    </div>
  )
}

