'use client'

import { UsersRound } from 'lucide-react'
import { usePermissions } from '@/hooks/usePermissions'

export default function CRMPage() {
  const { podeAcessar } = usePermissions()

  if (!podeAcessar('crm')) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-500 mb-2">Acesso Negado</h1>
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
          <UsersRound className="h-8 w-8 text-amber-500" />
          CRM
        </h1>
        <p className="text-gray-400 mt-1">Gerenciamento de relacionamento com clientes</p>
      </div>

      {/* Conteúdo */}
      <div className="bg-zinc-900 border border-amber-500/20 rounded-lg p-6">
        <p className="text-gray-400">Módulo em desenvolvimento...</p>
      </div>
    </div>
  )
}

