'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Sidebar } from './Sidebar'
import { Menu, LogOut, UserCircle, Bell } from 'lucide-react'
import { getApiBaseUrl } from '@/lib/api'

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [admin, setAdmin] = useState<any>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Função para carregar admin do localStorage
    const carregarAdmin = () => {
      const adminData = localStorage.getItem('admin')
      if (!adminData) {
        router.push('/')
        return null
      }
      const adminObj = JSON.parse(adminData)
      setAdmin(adminObj)
      return adminObj
    }

    // Carregar admin inicial
    const adminObj = carregarAdmin()
    if (!adminObj) return

    // Listener para atualizar admin quando o perfil for atualizado
    const handleAdminUpdate = (event: CustomEvent) => {
      setAdmin(event.detail)
    }

    window.addEventListener('adminUpdated', handleAdminUpdate as EventListener)

    // Listener para recarregar admin quando a página recebe foco (após reload)
    const handleFocus = () => {
      const adminData = localStorage.getItem('admin')
      if (adminData) {
        const adminObj = JSON.parse(adminData)
        setAdmin(adminObj)
      }
    }

    window.addEventListener('focus', handleFocus)

    // Carregar permissões se não for Master e ainda não tiver carregado
    if (adminObj.tipo_usuario !== 'master') {
      const permissoesSalvas = localStorage.getItem('permissoes')
      if (!permissoesSalvas) {
        // Carregar permissões do backend
        const carregarPermissoes = async () => {
          try {
            const apiUrl = getApiBaseUrl()
            const response = await fetch(`${apiUrl}/api/v1/permissoes/${adminObj.id}`)
            if (response.ok) {
              const data = await response.json()
              localStorage.setItem('permissoes', JSON.stringify(data.permissoes))
            }
          } catch (error) {
            console.error('Erro ao carregar permissões:', error)
          }
        }
        carregarPermissoes()
      }
    }

    return () => {
      window.removeEventListener('adminUpdated', handleAdminUpdate as EventListener)
      window.removeEventListener('focus', handleFocus)
    }
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem('admin')
    localStorage.removeItem('rememberAdmin')
    router.push('/')
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

  return (
    <div className="min-h-screen bg-zinc-950 flex">
      {/* Sidebar */}
      <Sidebar
        tipoUsuario={admin.tipo_usuario || 'funcionario'}
        isMobile={true}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <Sidebar
        tipoUsuario={admin.tipo_usuario || 'funcionario'}
        isMobile={false}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:ml-0">
        {/* Header */}
        <header className="bg-zinc-900 border-b border-amber-500/20 sticky top-0 z-30">
          <div className="flex items-center justify-between px-4 py-3">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 hover:bg-zinc-800 rounded-lg transition-colors"
            >
              <Menu className="h-6 w-6 text-gray-300" />
            </button>

            {/* Title */}
            <h1 className="text-xl font-bold text-white lg:block hidden">
              Painel Administrativo
            </h1>

            {/* Right Side */}
            <div className="flex items-center gap-4 ml-auto">
              {/* Notifications */}
              <button className="relative p-2 hover:bg-zinc-800 rounded-lg transition-colors">
                <Bell className="h-5 w-5 text-gray-300" />
                <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
              </button>

              {/* User Menu */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => router.push('/dashboard/perfil')}
                  className="flex items-center gap-3 hover:bg-zinc-800 rounded-lg px-2 py-1 transition-colors"
                  title="Ver perfil"
                >
                  {admin.foto_url ? (
                    <img
                      src={admin.foto_url}
                      alt={admin.nome_completo}
                      className="w-10 h-10 rounded-full object-cover border-2 border-amber-500/30"
                    />
                  ) : (
                    <UserCircle className="w-10 h-10 text-amber-500" />
                  )}
                  <div className="hidden md:block text-right">
                    <p className="text-sm font-medium text-white">{admin.nome_completo}</p>
                    <p className="text-xs text-gray-400 capitalize">{admin.tipo_usuario}</p>
                  </div>
                </button>
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

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}

