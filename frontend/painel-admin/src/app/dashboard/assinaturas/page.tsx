'use client'

import { useState, useEffect } from 'react'
import { motion } from 'motion/react'
import { FileText, AlertCircle, Loader2 } from 'lucide-react'
import { usePermissions } from '@/hooks/usePermissions'

export default function AssinaturasPage() {
  const [loading, setLoading] = useState(true)
  const { podeAcessar } = usePermissions()

  useEffect(() => {
    // Verificar permissões
    if (!podeAcessar('assinaturas')) {
      window.location.href = '/dashboard'
      return
    }
    setLoading(false)
  }, [podeAcessar])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-2">
          <FileText className="h-8 w-8 text-amber-500" />
          Assinaturas
        </h1>
        <p className="text-gray-400 mt-1">Gerenciamento de assinaturas de clientes</p>
      </div>

      {/* Mensagem de Desenvolvimento */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-6"
      >
        <div className="flex items-start gap-4">
          <AlertCircle className="h-6 w-6 text-amber-500 flex-shrink-0 mt-1" />
          <div>
            <h3 className="text-lg font-semibold text-amber-500 mb-2">
              Módulo em Desenvolvimento
            </h3>
            <p className="text-gray-300">
              O módulo de Assinaturas está em desenvolvimento e será disponibilizado em breve.
              Aqui você poderá gerenciar as assinaturas de seus clientes.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Placeholder para conteúdo futuro */}
      <div className="bg-zinc-900 border border-amber-500/20 rounded-lg p-8 text-center">
        <FileText className="h-16 w-16 text-gray-600 mx-auto mb-4" />
        <p className="text-gray-400">
          Conteúdo será adicionado em breve
        </p>
      </div>
    </div>
  )
}

