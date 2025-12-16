'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'motion/react'
import * as Icons from 'lucide-react'
import { usePermissions } from '@/hooks/usePermissions'

interface MenuItem {
  id: string
  label: string
  icon: string
  path: string
  permissionKey: string
}

interface Modulo {
  id: string
  nome: string
  icone: string
  ordem: number
  itens: MenuItem[]
}

interface SidebarProps {
  tipoUsuario: string
  isMobile?: boolean
  isOpen?: boolean
  onClose?: () => void
}

// Itens que aparecem ANTES dos módulos
const itensIndividuaisAntes: MenuItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: 'LayoutDashboard',
    path: '/dashboard',
    permissionKey: 'dashboard',
  },
  {
    id: 'agenda',
    label: 'Agenda',
    icon: 'Calendar',
    path: '/dashboard/agenda',
    permissionKey: 'agenda',
  },
  {
    id: 'lancamento-venda',
    label: 'Lançamento de Venda',
    icon: 'ShoppingCart',
    path: '/dashboard/lancamento-venda',
    permissionKey: 'lancamento_venda',
  },
]

// Itens que aparecem DEPOIS dos módulos
const itensIndividuaisDepois: MenuItem[] = [
  {
    id: 'crm',
    label: 'CRM',
    icon: 'UsersRound',
    path: '/dashboard/crm',
    permissionKey: 'crm',
  },
  {
    id: 'help-desk',
    label: 'Help Desk',
    icon: 'HelpCircle',
    path: '/dashboard/help-desk',
    permissionKey: 'help_desk',
  },
  {
    id: 'configuracoes',
    label: 'Configurações',
    icon: 'Cog',
    path: '/dashboard/configuracoes',
    permissionKey: 'configuracoes',
  },
]

export function Sidebar({ tipoUsuario, isMobile = false, isOpen = true, onClose }: SidebarProps) {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [modulos, setModulos] = useState<Modulo[]>([])
  const [expandedModulos, setExpandedModulos] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const { podeAcessar, loading: permissoesLoading } = usePermissions()

  // Carregar módulos do backend
  useEffect(() => {
    const carregarModulos = async () => {
      try {
        const apiUrl = 'https://api.protesecapilarcuiaba.com.br'
        const response = await fetch(`${apiUrl}/api/v1/modulos`, {
          cache: 'no-store', // Sempre buscar do servidor
        })
        if (response.ok) {
          const data = await response.json()
          setModulos(data.modulos || [])
          
          // Expandir módulos que contêm a rota atual
          const modulosComRotaAtual = data.modulos
            .filter((modulo: Modulo) =>
              modulo.itens.some((item) => pathname.startsWith(item.path))
            )
            .map((modulo: Modulo) => modulo.id)
          
          if (modulosComRotaAtual.length > 0) {
            setExpandedModulos(new Set(modulosComRotaAtual))
          }
        }
      } catch (error) {
        console.error('Erro ao carregar módulos:', error)
      } finally {
        setLoading(false)
      }
    }

    carregarModulos()
    
    // Listener para recarregar módulos quando permissões forem atualizadas
    const handlePermissoesAtualizadas = () => {
      carregarModulos()
    }
    
    window.addEventListener('permissoes-atualizadas', handlePermissoesAtualizadas)
    
    return () => {
      window.removeEventListener('permissoes-atualizadas', handlePermissoesAtualizadas)
    }
  }, [pathname])

  // Função para obter ícone dinamicamente
  const getIcon = (iconName: string) => {
    const IconComponent = (Icons as any)[iconName] || Icons.Circle
    return IconComponent
  }

  // Função para obter permissionKey de um item_id
  const obterPermissionKey = (itemId: string): string => {
    // Mapear item_id para permissionKey (normalmente são iguais, mas pode haver exceções)
    // Exemplo: 'lancamento_venda' -> 'lancamento_venda' ou 'vendas'
    if (itemId === 'lancamento_venda') {
      // Verificar se existe vendas_ver, senão usar lancamento_venda
      return 'lancamento_venda'
    }
    return itemId
  }

  // Filtrar itens baseado em permissões
  const filtrarItens = (itens: MenuItem[]) => {
    if (tipoUsuario === 'master') {
      return itens
    }

    if (permissoesLoading) {
      return []
    }

    return itens.filter((item) => {
      const permissionKey = item.permissionKey || obterPermissionKey(item.id)
      return podeAcessar(permissionKey)
    })
  }

  // Verificar se um módulo tem itens visíveis
  const moduloTemItensVisiveis = (modulo: Modulo) => {
    // Converter itens do módulo para MenuItem com permissionKey
    const itensComPermissao: MenuItem[] = modulo.itens.map((item) => ({
      ...item,
      permissionKey: obterPermissionKey(item.id),
    }))
    return filtrarItens(itensComPermissao).length > 0
  }

  const isActive = (path: string) => {
    if (path === '/dashboard') {
      return pathname === '/dashboard'
    }
    return pathname.startsWith(path)
  }

  const toggleModulo = (moduloId: string) => {
    setExpandedModulos((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(moduloId)) {
        newSet.delete(moduloId)
      } else {
        newSet.add(moduloId)
      }
      return newSet
    })
  }

  const renderMenuItem = (item: MenuItem, isChild = false) => {
    const Icon = getIcon(item.icon)
    const active = isActive(item.path)
    
    return (
      <Link
        key={item.id}
        href={item.path}
        onClick={isMobile ? onClose : undefined}
        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
          isChild ? 'pl-8' : ''
        } ${
          active
            ? 'bg-amber-500/10 text-amber-500 border-l-4 border-amber-500'
            : 'text-gray-300 hover:bg-zinc-800 hover:text-white'
        }`}
        title={isCollapsed && !isMobile ? item.label : undefined}
      >
        <Icon className="h-5 w-5 flex-shrink-0" />
        {(!isCollapsed || isMobile) && (
          <span className="font-medium flex-1">{item.label}</span>
        )}
      </Link>
    )
  }

  const renderModulo = (modulo: Modulo) => {
    // Converter itens do módulo para MenuItem com permissionKey
    const itensComPermissao: MenuItem[] = modulo.itens.map((item) => ({
      ...item,
      permissionKey: obterPermissionKey(item.id),
    }))
    
    const itensVisiveis = filtrarItens(itensComPermissao)
    
    if (itensVisiveis.length === 0) {
      return null
    }

    const isExpanded = expandedModulos.has(modulo.id)
    const ModuloIcon = getIcon(modulo.icone || 'Folder')
    const temItemAtivo = itensVisiveis.some((item) => isActive(item.path))

    return (
      <div key={modulo.id} className="space-y-1">
        <button
          onClick={() => toggleModulo(modulo.id)}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
            temItemAtivo
              ? 'bg-amber-500/10 text-amber-500'
              : 'text-gray-300 hover:bg-zinc-800 hover:text-white'
          }`}
          title={isCollapsed && !isMobile ? modulo.nome : undefined}
        >
          <ModuloIcon className="h-5 w-5 flex-shrink-0" />
          {(!isCollapsed || isMobile) && (
            <>
              <span className="font-medium flex-1 text-left">{modulo.nome}</span>
              <Icons.ChevronDown
                className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
              />
            </>
          )}
        </button>
        <AnimatePresence>
          {isExpanded && (!isCollapsed || isMobile) && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="space-y-1 pl-2">
                {itensVisiveis.map((item) => renderMenuItem(item, true))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    )
  }

  const itensAntesFiltrados = filtrarItens(itensIndividuaisAntes)
  const itensDepoisFiltrados = filtrarItens(itensIndividuaisDepois)
  const modulosFiltrados = modulos.filter(moduloTemItensVisiveis)

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
                <Icons.X className="h-5 w-5 text-gray-400" />
              </button>
            </div>
            <nav className="space-y-1">
              {loading ? (
                <div className="text-gray-400 text-center py-4">Carregando...</div>
              ) : (
                <>
                  {/* Itens individuais antes dos módulos */}
                  {itensAntesFiltrados.map((item) => renderMenuItem(item))}
                  
                  {/* Módulos */}
                  {modulosFiltrados.map((modulo) => renderModulo(modulo))}
                  
                  {/* Itens individuais depois dos módulos */}
                  {itensDepoisFiltrados.map((item) => renderMenuItem(item))}
                </>
              )}
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
            <Icons.ChevronLeft
              className={`h-5 w-5 text-gray-400 transition-transform ${
                isCollapsed ? 'rotate-180' : ''
              }`}
            />
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-1">
        {loading ? (
          <div className="text-gray-400 text-center py-4">Carregando...</div>
        ) : (
          <>
            {/* Itens individuais antes dos módulos */}
            {itensAntesFiltrados.map((item) => renderMenuItem(item))}
            
            {/* Módulos */}
            {modulosFiltrados.map((modulo) => renderModulo(modulo))}
            
            {/* Itens individuais depois dos módulos */}
            {itensDepoisFiltrados.map((item) => renderMenuItem(item))}
          </>
        )}
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
