'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'motion/react'
import {
  LayoutDashboard,
  Calendar,
  ShoppingCart,
  TrendingDown,
  TrendingUp,
  FileText,
  Receipt,
  Users,
  UserCog,
  Shield,
  FileSearch,
  Settings,
  HelpCircle,
  ChevronLeft,
  Menu,
  X,
  Scissors,
  FileCheck,
  BarChart3,
  Plug,
  Key,
  Cog,
  Package,
  Warehouse,
  Wallet,
  FileBarChart,
  UsersRound,
} from 'lucide-react'
import { usePermissions } from '@/hooks/usePermissions'

interface MenuItem {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  path: string
  levels: string[] // Níveis que podem acessar (fallback se não houver permissão)
  permissionKey: string // Chave de permissão no banco (ex: 'dashboard_ver', 'agenda_ver')
  badge?: string
  children?: MenuItem[]
}

interface SidebarProps {
  tipoUsuario: string
  isMobile?: boolean
  isOpen?: boolean
  onClose?: () => void
}

export function Sidebar({ tipoUsuario, isMobile = false, isOpen = true, onClose }: SidebarProps) {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const { podeAcessar, loading: permissoesLoading } = usePermissions()

  // Definir itens do menu com controle de acesso (na ordem especificada)
  const menuItems: MenuItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      path: '/dashboard',
      levels: ['master', 'proprietario', 'funcionario'],
      permissionKey: 'dashboard',
    },
    {
      id: 'agenda',
      label: 'Agenda',
      icon: Calendar,
      path: '/dashboard/agenda',
      levels: ['master', 'proprietario', 'funcionario'],
      permissionKey: 'agenda',
    },
    {
      id: 'lancamento-venda',
      label: 'Lançamento de Venda',
      icon: ShoppingCart,
      path: '/dashboard/lancamento-venda',
      levels: ['master', 'proprietario', 'funcionario'],
      permissionKey: 'lancamento_venda',
    },
    {
      id: 'lancamento-despesa',
      label: 'Lançamento de Despesas',
      icon: TrendingDown,
      path: '/dashboard/lancamento-despesa',
      levels: ['master', 'proprietario', 'funcionario'],
      permissionKey: 'lancamento_despesa',
    },
    {
      id: 'emissao-nfe',
      label: 'Emissão de Nota Fiscal',
      icon: FileCheck,
      path: '/dashboard/emissao-nfe',
      levels: ['master', 'proprietario', 'funcionario'],
      permissionKey: 'emissao_nfe',
    },
    {
      id: 'servicos',
      label: 'Serviços',
      icon: Scissors,
      path: '/dashboard/servicos',
      levels: ['master', 'proprietario', 'funcionario'],
      permissionKey: 'servicos',
    },
    {
      id: 'produtos',
      label: 'Produtos',
      icon: Package,
      path: '/dashboard/produtos',
      levels: ['master', 'proprietario', 'funcionario'],
      permissionKey: 'produtos',
    },
    {
      id: 'receitas',
      label: 'Receitas',
      icon: TrendingUp,
      path: '/dashboard/receitas',
      levels: ['master', 'proprietario', 'funcionario'],
      permissionKey: 'receitas',
    },
    {
      id: 'despesas',
      label: 'Despesas',
      icon: FileText,
      path: '/dashboard/despesas',
      levels: ['master', 'proprietario', 'funcionario'],
      permissionKey: 'despesas',
    },
    {
      id: 'faturamento',
      label: 'Faturamento',
      icon: Receipt,
      path: '/dashboard/faturamento',
      levels: ['master', 'proprietario', 'funcionario'],
      permissionKey: 'faturamento',
    },
    {
      id: 'emissao-relatorios',
      label: 'Emissão de Relatórios',
      icon: BarChart3,
      path: '/dashboard/emissao-relatorios',
      levels: ['master', 'proprietario', 'funcionario'],
      permissionKey: 'emissao_relatorios',
    },
    {
      id: 'balanco-demonstrativo',
      label: 'Balanço Demonstrativo',
      icon: FileBarChart,
      path: '/dashboard/balanco-demonstrativo',
      levels: ['master', 'proprietario', 'funcionario'],
      permissionKey: 'balanco_demonstrativo',
    },
    {
      id: 'crm',
      label: 'CRM',
      icon: UsersRound,
      path: '/dashboard/crm',
      levels: ['master', 'proprietario', 'funcionario'],
      permissionKey: 'crm',
    },
    {
      id: 'cupons-fidelidades',
      label: 'Cupons e Fidelidades',
      icon: FileCheck,
      path: '/dashboard/cupons-fidelidades',
      levels: ['master', 'proprietario', 'funcionario'],
      permissionKey: 'cupons_fidelidades',
    },
    {
      id: 'usuarios',
      label: 'Gerenciamento de Usuários',
      icon: Users,
      path: '/dashboard/usuarios',
      levels: ['master', 'proprietario'],
      permissionKey: 'usuarios',
    },
    {
      id: 'funcionarios',
      label: 'Gerenciamento de Funcionários',
      icon: UserCog,
      path: '/dashboard/funcionarios',
      levels: ['master', 'proprietario'],
      permissionKey: 'funcionarios',
    },
    {
      id: 'estoque',
      label: 'Estoque',
      icon: Warehouse,
      path: '/dashboard/estoque',
      levels: ['master', 'proprietario', 'funcionario'],
      permissionKey: 'estoque',
    },
    {
      id: 'caixas',
      label: 'Caixas',
      icon: Wallet,
      path: '/dashboard/caixas',
      levels: ['master', 'proprietario', 'funcionario'],
      permissionKey: 'caixas',
    },
    {
      id: 'acessos',
      label: 'Controle de Acessos',
      icon: Shield,
      path: '/dashboard/controle-acessos',
      levels: ['master', 'proprietario'],
      permissionKey: 'controle_acessos',
    },
    {
      id: 'logs',
      label: 'Controle de Logs',
      icon: FileSearch,
      path: '/dashboard/controle-logs',
      levels: ['master', 'proprietario'],
      permissionKey: 'controle_logs',
    },
    {
      id: 'permissoes',
      label: 'Controle de Permissão',
      icon: Settings,
      path: '/dashboard/controle-permissoes',
      levels: ['master'],
      permissionKey: 'controle_permissoes',
    },
    {
      id: 'help-desk',
      label: 'Help Desk',
      icon: HelpCircle,
      path: '/dashboard/help-desk',
      levels: ['master', 'proprietario', 'funcionario'],
      permissionKey: 'help_desk',
    },
    {
      id: 'integracao-apis',
      label: 'Integração de APIs',
      icon: Plug,
      path: '/dashboard/integracoes-apis',
      levels: ['master', 'proprietario'],
      permissionKey: 'integracao_apis',
    },
    {
      id: 'habilitar-api',
      label: 'Habilitar API',
      icon: Key,
      path: '/dashboard/habilitar-api',
      levels: ['master', 'proprietario'],
      permissionKey: 'habilitar_api',
    },
    {
      id: 'configuracoes',
      label: 'Configurações',
      icon: Cog,
      path: '/dashboard/configuracoes',
      levels: ['master', 'proprietario'],
      permissionKey: 'configuracoes',
    },
  ]

  // Filtrar itens do menu baseado nas permissões granulares
  const filteredMenuItems = menuItems.filter((item) => {
    // Master sempre tem acesso a tudo (sem verificar permissões)
    if (tipoUsuario === 'master') {
      return item.levels.includes('master')
    }

    // Para outros usuários, APENAS verificar permissão granular
    // Se ainda estiver carregando, não mostrar nada (evita flash de itens não autorizados)
    if (permissoesLoading) {
      return false
    }

    // Verificar se tem permissão de ver para este módulo
    const temAcesso = podeAcessar(item.permissionKey)
    return temAcesso
  })

  const isActive = (path: string) => {
    if (path === '/dashboard') {
      return pathname === '/dashboard'
    }
    return pathname.startsWith(path)
  }

  // Se mobile, renderizar overlay
  if (isMobile) {
    return (
      <>
        {/* Overlay */}
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          />
        )}

        {/* Sidebar Mobile */}
        <motion.aside
          initial={{ x: -300 }}
          animate={{ x: isOpen ? 0 : -300 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed left-0 top-0 h-full w-64 bg-zinc-900 border-r border-amber-500/20 z-50 lg:hidden overflow-y-auto"
        >
          <div className="p-4">
            <div className="flex items-center justify-between mb-6">
              <img
                src="/images/logo.webp"
                alt="Logo"
                className="h-10 w-auto"
              />
              <button
                onClick={onClose}
                className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-gray-400" />
              </button>
            </div>
            <nav className="space-y-1">
              {filteredMenuItems.map((item) => {
                const Icon = item.icon
                const active = isActive(item.path)
                return (
                  <Link
                    key={item.id}
                    href={item.path}
                    onClick={onClose}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                      active
                        ? 'bg-amber-500/10 text-amber-500 border-l-4 border-amber-500'
                        : 'text-gray-300 hover:bg-zinc-800 hover:text-white'
                    }`}
                  >
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    <span className="font-medium">{item.label}</span>
                    {item.badge && (
                      <span className="ml-auto text-xs px-2 py-1 bg-zinc-700 rounded text-gray-400">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                )
              })}
            </nav>
          </div>
        </motion.aside>
      </>
    )
  }

  // Sidebar Desktop
  return (
    <aside
      className={`hidden lg:flex flex-col bg-zinc-900 border-r border-amber-500/20 transition-all duration-300 ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Header */}
      <div className="p-4 border-b border-amber-500/20">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <img
              src="/images/logo.webp"
              alt="Logo"
              className="h-10 w-auto"
            />
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 hover:bg-zinc-800 rounded-lg transition-colors ml-auto"
          >
            <ChevronLeft
              className={`h-5 w-5 text-gray-400 transition-transform ${
                isCollapsed ? 'rotate-180' : ''
              }`}
            />
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-1">
        {filteredMenuItems.map((item) => {
          const Icon = item.icon
          const active = isActive(item.path)
          return (
            <Link
              key={item.id}
              href={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all group ${
                active
                  ? 'bg-amber-500/10 text-amber-500 border-l-4 border-amber-500'
                  : 'text-gray-300 hover:bg-zinc-800 hover:text-white'
              }`}
              title={isCollapsed ? item.label : undefined}
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              {!isCollapsed && (
                <>
                  <span className="font-medium flex-1">{item.label}</span>
                  {item.badge && (
                    <span className="text-xs px-2 py-1 bg-zinc-700 rounded text-gray-400">
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      {!isCollapsed && (
        <div className="p-4 border-t border-amber-500/20">
          <div className="text-xs text-gray-500 text-center">
            Barbearia Premium
          </div>
        </div>
      )}
    </aside>
  )
}

