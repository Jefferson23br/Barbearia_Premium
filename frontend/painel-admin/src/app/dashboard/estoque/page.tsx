'use client'

import { useState } from 'react'
import { Warehouse, Search, Plus } from 'lucide-react'
import { usePermissions } from '@/hooks/usePermissions'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function EstoquePage() {
  const [searchTerm, setSearchTerm] = useState('')
  const { podeAcessar } = usePermissions()

  if (!podeAcessar('estoque')) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Card className="p-8 bg-zinc-900 border-amber-500/20">
          <p className="text-gray-300 text-center">Você não tem permissão para acessar esta página.</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-300">Estoque</h1>
          <p className="text-gray-400 mt-1">Gerencie o estoque da barbearia</p>
        </div>
        <Button className="bg-amber-500 hover:bg-amber-600 text-white">
          <Plus className="h-4 w-4 mr-2" />
          Nova Entrada
        </Button>
      </div>

      <Card className="bg-zinc-900 border-amber-500/20 p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Buscar no estoque..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-zinc-800 border-amber-500/20 text-gray-300 placeholder:text-gray-500"
            />
          </div>
        </div>

        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Warehouse className="h-16 w-16 text-gray-500 mb-4" />
          <h3 className="text-xl font-semibold text-gray-300 mb-2">Módulo em Desenvolvimento</h3>
          <p className="text-gray-400">A funcionalidade de estoque será implementada em breve.</p>
        </div>
      </Card>
    </div>
  )
}

