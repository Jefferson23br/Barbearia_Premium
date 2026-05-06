'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Mail, Lock, ArrowLeft, Eye, EyeOff } from 'lucide-react'
import { ImageWithFallback } from '../components/figma/ImageWithFallback'
import { useRouter } from 'next/navigation'

type ViewType = 'login' | 'forgot'

export default function Home() {
  const [currentView, setCurrentView] = useState<ViewType>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [mostrarSenha, setMostrarSenha] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoggingIn(true)
    setError(null)

    try {
      // URL da API de produção
      const apiUrl = 'https://api6.actusconsultoria.com.br'

      console.log('🔗 Tentando conectar em:', apiUrl)

      const response = await fetch(`${apiUrl}/api/v1/auth/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, senha: password }),
      })

      // Verificar se a resposta é JSON válido
      let data
      const contentType = response.headers.get('content-type')
      if (contentType && contentType.includes('application/json')) {
        data = await response.json()
      } else {
        const text = await response.text()
        throw new Error(`Erro na resposta do servidor: ${text}`)
      }

      if (!response.ok) {
        throw new Error(data.error || data.message || 'Erro no login')
      }

      // Salvar dados do admin no localStorage
      localStorage.setItem('admin', JSON.stringify(data.admin))
      if (rememberMe) {
        localStorage.setItem('rememberAdmin', 'true')
      }

      // Carregar permissões após login (apenas se não for Master)
      if (data.admin.tipo_usuario !== 'master') {
        try {
          const permissoesResponse = await fetch(`${apiUrl}/api/v1/permissoes/${data.admin.id}`)
          if (permissoesResponse.ok) {
            const permissoesData = await permissoesResponse.json()
            localStorage.setItem('permissoes', JSON.stringify(permissoesData.permissoes))
          }
        } catch (error) {
          console.error('Erro ao carregar permissões:', error)
          // Continua mesmo se não conseguir carregar permissões
        }
      }

      // Redirecionar para dashboard
      router.push('/dashboard')
    } catch (error: any) {
      setError(error.message || 'Erro ao fazer login. Tente novamente.')
      console.error('Erro de login:', error)
    } finally {
      setIsLoggingIn(false)
    }
  }

  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Forgot password:', { email })
    // Aqui você implementará a lógica de recuperação de senha
  }

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 300 : -300,
      opacity: 0,
    }),
  }

  const [direction, setDirection] = useState(0)

  const changeTo = (view: ViewType) => {
    const views: ViewType[] = ['login', 'forgot']
    const currentIndex = views.indexOf(currentView)
    const newIndex = views.indexOf(view)
    setDirection(newIndex > currentIndex ? 1 : -1)
    setCurrentView(view)
  }

  return (
    <div className="min-h-screen w-full relative flex items-center justify-center overflow-hidden bg-black">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <ImageWithFallback
          src="https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=1920&q=80"
          alt="Barbershop"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-black/90 via-black/80 to-amber-950/60"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-md mx-4 sm:mx-auto">
        {/* Logo/Brand */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center mb-4">
            <div className="w-24 h-24 flex items-center justify-center">
              <img
                src="/images/logo.webp"
                alt="Barbearia Premium Logo"
                className="w-full h-full object-contain"
              />
            </div>
          </div>
          <h1 className="text-amber-500 mb-2">Barbearia Premium</h1>
          <p className="text-gray-400">Painel Administrativo</p>
        </motion.div>

        {/* Card Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-zinc-900/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-amber-500/20 overflow-hidden"
        >
          <div className="p-8">
            <AnimatePresence mode="wait" custom={direction}>
              {currentView === 'login' && (
                <motion.div
                  key="login"
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.3 }}
                >
                  <div className="mb-8 text-center">
                    <div className="inline-block">
                      <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 bg-clip-text text-transparent">
                        Login
                      </h2>
                      <div className="h-1 w-full bg-gradient-to-r from-amber-500/0 via-amber-500 to-amber-500/0 rounded-full"></div>
                    </div>
                    <p className="text-gray-400 text-sm mt-3">Acesse seu Painel Administrativo</p>
                  </div>

                  {/* Mensagem de Erro */}
                  {error && (
                    <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-500 text-sm">
                      {error}
                    </div>
                  )}

                  <form onSubmit={handleLogin} className="space-y-5">
                    <div>
                      <label className="block text-gray-300 mb-2">Email</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          disabled={isLoggingIn}
                          className="w-full bg-white border border-zinc-700 rounded-lg pl-12 pr-4 py-3 text-black placeholder-gray-500 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                          placeholder="seu@email.com"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-gray-300 mb-2">Senha</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type={mostrarSenha ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          disabled={isLoggingIn}
                          className="w-full bg-white border border-zinc-700 rounded-lg pl-12 pr-12 py-3 text-black placeholder-gray-500 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                          placeholder="••••••••"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setMostrarSenha(!mostrarSenha)}
                          disabled={isLoggingIn}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-amber-500 transition-colors disabled:opacity-50"
                          tabIndex={-1}
                        >
                          {mostrarSenha ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={rememberMe}
                          onChange={(e) => setRememberMe(e.target.checked)}
                          disabled={isLoggingIn}
                          className="w-4 h-4 rounded border-zinc-700 bg-zinc-800/50 text-amber-500 focus:ring-2 focus:ring-amber-500/20 focus:ring-offset-0 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                        <span className="ml-2 text-sm text-gray-400">Manter conectado</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => changeTo('forgot')}
                        disabled={isLoggingIn}
                        className="text-amber-500 hover:text-amber-400 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Esqueceu a senha?
                      </button>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoggingIn}
                      className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black py-3 rounded-lg transition-all shadow-lg shadow-amber-500/30 hover:shadow-amber-500/50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                      {isLoggingIn ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black mr-2"></div>
                          Entrando...
                        </>
                      ) : (
                        'Entrar'
                      )}
                    </button>
                  </form>

                  <div className="mt-6 text-center">
                    <p className="text-gray-400 text-sm">
                      Usuários administrativos são criados apenas pelos administradores Master
                    </p>
                  </div>
                </motion.div>
              )}

              {currentView === 'forgot' && (
                <motion.div
                  key="forgot"
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex items-center mb-6">
                    <button
                      onClick={() => changeTo('login')}
                      className="text-gray-400 hover:text-white transition-colors mr-3"
                    >
                      <ArrowLeft className="w-5 h-5" />
                    </button>
                    <h2 className="text-white">Recuperar Senha</h2>
                  </div>

                  <p className="text-gray-400 mb-6">
                    Digite seu email para receber as instruções de recuperação de senha.
                  </p>

                  <form onSubmit={handleForgotPassword} className="space-y-5">
                    <div>
                      <label className="block text-gray-300 mb-2">Email</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full bg-white border border-zinc-700 rounded-lg pl-12 pr-4 py-3 text-black placeholder-gray-500 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
                          placeholder="seu@email.com"
                          required
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black py-3 rounded-lg transition-all shadow-lg shadow-amber-500/30 hover:shadow-amber-500/50"
                    >
                      Enviar Instruções
                    </button>
                  </form>

                  <div className="mt-6 text-center">
                    <p className="text-gray-400">
                      Lembrou a senha?{' '}
                      <button
                        onClick={() => changeTo('login')}
                        className="text-amber-500 hover:text-amber-400 transition-colors"
                      >
                        Voltar ao login
                      </button>
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center text-gray-500 mt-6"
        >
          © 2025 Barbearia Premium. Todos os direitos reservados.
        </motion.p>
      </div>
    </div>
  )
}
