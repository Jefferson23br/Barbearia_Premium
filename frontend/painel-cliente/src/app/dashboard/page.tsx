'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'motion/react'
import { LayoutDashboard, User, Calendar, Settings, LogOut } from 'lucide-react'

export default function DashboardPage() {
  const router = useRouter()
  const [cliente, setCliente] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const clienteData = localStorage.getItem('cliente')
    if (!clienteData) {
      router.push('/')
      return
    }

    const parsedCliente = JSON.parse(clienteData)
    setCliente(parsedCliente)
    setLoading(false)
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem('cliente')
    localStorage.removeItem('rememberCliente')
    router.push('/')
  }

  if (loading || !cliente) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto mb-4"></div>
          <p className="text-white">Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Header */}
      <header className="bg-zinc-900 border-b border-amber-500/20 sticky top-0 z-30">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-500/20 rounded-lg flex items-center justify-center">
                <img
                  src="/images/logo.webp"
                  alt="Logo"
                  className="w-8 h-8 object-contain"
                />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Barbearia Premium</h1>
                <p className="text-xs text-gray-400">Painel do Cliente</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {cliente.foto_url ? (
                <img
                  src={cliente.foto_url}
                  alt={cliente.nome_completo}
                  className="w-10 h-10 rounded-full object-cover border-2 border-amber-500/30"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
                  <User className="h-6 w-6 text-amber-500" />
                </div>
              )}
              <div className="hidden md:block text-right">
                <p className="text-sm font-medium text-white">{cliente.nome_completo}</p>
                <p className="text-xs text-gray-400">{cliente.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 hover:bg-zinc-800 rounded-lg transition-colors text-gray-300 hover:text-red-500"
                title="Sair"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Welcome Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-amber-500/20 to-amber-600/20 border border-amber-500/30 rounded-lg p-6"
          >
            <h2 className="text-2xl font-bold text-white mb-2">
              Bem-vindo, {cliente.nome_completo}!
            </h2>
            <p className="text-gray-300">
              Este é o seu painel pessoal. Aqui você poderá acompanhar seus agendamentos, tratamentos e muito mais.
            </p>
          </motion.div>

          {/* Cards de Funcionalidades */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-zinc-900 border border-amber-500/20 rounded-lg p-6 hover:border-amber-500/40 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-amber-500/20 rounded-lg flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-amber-500" />
                </div>
                <div>
                  <h3 className="text-white font-semibold">Meus Agendamentos</h3>
                  <p className="text-gray-400 text-sm">Visualize e gerencie seus agendamentos</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="bg-zinc-900 border border-amber-500/20 rounded-lg p-6 hover:border-amber-500/40 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <User className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <h3 className="text-white font-semibold">Meu Perfil</h3>
                  <p className="text-gray-400 text-sm">Atualize suas informações pessoais</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-zinc-900 border border-amber-500/20 rounded-lg p-6 hover:border-amber-500/40 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <Settings className="h-6 w-6 text-green-500" />
                </div>
                <div>
                  <h3 className="text-white font-semibold">Configurações</h3>
                  <p className="text-gray-400 text-sm">Ajuste suas preferências</p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Área de Conteúdo - Em Desenvolvimento */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-zinc-900 border border-amber-500/20 rounded-lg p-12 text-center"
          >
            <LayoutDashboard className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Dashboard em Desenvolvimento</h3>
            <p className="text-gray-400">
              Estamos trabalhando para trazer todas as funcionalidades para você em breve!
            </p>
          </motion.div>
        </div>
      </main>
    </div>
  )
}

