'use client'

import { useState, useEffect } from 'react'
import { motion } from 'motion/react'
import { HardHat, LogOut, UserCircle, Shield, Briefcase, UserCog } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function Dashboard() {
  const [admin, setAdmin] = useState<any>(null)
  const [isWaving, setIsWaving] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Verificar se está logado
    const adminData = localStorage.getItem('admin')
    if (!adminData) {
      router.push('/')
      return
    }

    setAdmin(JSON.parse(adminData))

    // Acena a cada 5 segundos
    const interval = setInterval(() => {
      setIsWaving(true)
      setTimeout(() => setIsWaving(false), 600)
    }, 5000)

    return () => clearInterval(interval)
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem('admin')
    localStorage.removeItem('rememberAdmin')
    router.push('/')
  }

  // Função para obter informações do nível de acesso
  const getNivelInfo = (tipo: string) => {
    switch (tipo) {
      case 'master':
        return {
          nome: 'Master',
          descricao: 'Desenvolvedor - Acesso Total',
          icon: Shield,
          color: 'text-red-500',
          bgColor: 'bg-red-500/10',
          borderColor: 'border-red-500/30',
        }
      case 'proprietario':
        return {
          nome: 'Proprietário',
          descricao: 'Acesso Completo',
          icon: Briefcase,
          color: 'text-amber-500',
          bgColor: 'bg-amber-500/10',
          borderColor: 'border-amber-500/30',
        }
      case 'funcionario':
        return {
          nome: 'Funcionário',
          descricao: 'Acesso Limitado',
          icon: UserCog,
          color: 'text-blue-500',
          bgColor: 'bg-blue-500/10',
          borderColor: 'border-blue-500/30',
        }
      default:
        return {
          nome: 'Usuário',
          descricao: 'Sem nível definido',
          icon: UserCircle,
          color: 'text-gray-500',
          bgColor: 'bg-gray-500/10',
          borderColor: 'border-gray-500/30',
        }
    }
  }

  if (!admin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto mb-4"></div>
          <p>Carregando...</p>
        </div>
      </div>
    )
  }

  const nivelInfo = getNivelInfo(admin.tipo_usuario || 'funcionario')
  const NivelIcon = nivelInfo.icon

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-zinc-950 to-zinc-800">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: 'repeating-linear-gradient(45deg, #f59e0b 0px, #f59e0b 10px, transparent 10px, transparent 20px)',
        }}></div>
      </div>

      {/* Header */}
      <header className="relative z-10 px-6 py-4 flex items-center justify-between border-b border-amber-500/20">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <img
            src="/images/logo.webp"
            alt="Prótese Capilar Logo"
            className="w-16 h-16 object-contain"
          />
          <div>
            <h2 className="text-amber-500 font-bold text-lg">Prótese Capilar</h2>
            <p className="text-gray-400 text-xs">Painel Administrativo</p>
          </div>
        </div>

        {/* User Info and Logout */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-gray-300">
            {admin.foto_url ? (
              <img
                src={admin.foto_url}
                alt={admin.nome_completo}
                className="w-10 h-10 rounded-full object-cover border-2 border-amber-500/30"
              />
            ) : (
              <UserCircle className="w-10 h-10 text-amber-500" />
            )}
            <div className="text-right">
              <p className="text-sm font-medium">{admin.nome_completo}</p>
              <p className="text-xs text-gray-400">{admin.email}</p>
            </div>
          </div>
          
          {/* Badge de Nível */}
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${nivelInfo.bgColor} ${nivelInfo.borderColor} border`}>
            <NivelIcon className={`w-4 h-4 ${nivelInfo.color}`} />
            <span className={`text-xs font-medium ${nivelInfo.color}`}>
              {nivelInfo.nome}
            </span>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded-lg transition-all text-red-500"
          >
            <LogOut className="w-5 h-5" />
            <span>Sair</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-100px)] px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl md:text-7xl font-bold mb-4 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 bg-clip-text text-transparent">
            Dashboard Administrativo
          </h1>
          <p className="text-gray-400 text-xl md:text-2xl mb-2">
            Em Desenvolvimento
          </p>
          <div className="flex items-center justify-center gap-2 mt-4">
            <span className="text-gray-500">Aguarde</span>
            <div className="flex gap-1">
              <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
              <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
            </div>
          </div>
        </motion.div>

        {/* Worker Animation */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="relative"
        >
          {/* Trabalhador com carrinho */}
          <div className="relative w-64 h-64 flex items-center justify-center">
            {/* Carrinho */}
            <motion.div
              animate={{ x: [0, 20, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute left-0"
            >
              <div className="w-32 h-20 bg-amber-700/50 rounded-lg border-2 border-amber-600/50 flex items-center justify-center">
                <HardHat className="w-12 h-12 text-amber-400" />
              </div>
            </motion.div>

            {/* Pessoa */}
            <motion.div
              animate={{
                rotate: isWaving ? [0, 20, -10, 10, 0] : 0,
                x: [0, 10, 0],
              }}
              transition={{
                rotate: { duration: 0.6 },
                x: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
              }}
              className="relative z-10"
            >
              <div className="w-24 h-24 bg-gradient-to-br from-amber-500 to-amber-700 rounded-full flex items-center justify-center border-4 border-amber-400/50 shadow-lg">
                <Shield className="w-16 h-16 text-white" />
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Info Card do Nível */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className={`mt-12 px-6 py-4 rounded-lg ${nivelInfo.bgColor} ${nivelInfo.borderColor} border max-w-md text-center`}
        >
          <div className="flex items-center justify-center gap-3 mb-2">
            <NivelIcon className={`w-6 h-6 ${nivelInfo.color}`} />
            <h3 className={`text-lg font-bold ${nivelInfo.color}`}>
              {nivelInfo.nome}
            </h3>
          </div>
          <p className="text-gray-300 text-sm">
            {nivelInfo.descricao}
          </p>
        </motion.div>
      </div>

      {/* Footer */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-center text-gray-500 mt-6 absolute bottom-4 w-full"
      >
        © 2025 Prótese Capilar. Todos os direitos reservados.
      </motion.p>
    </div>
  )
}

