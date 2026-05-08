'use client'

import { useState, useEffect } from 'react'
import { motion } from 'motion/react'
import { Plug, FileText, CheckCircle, XCircle, AlertCircle, Loader2, ExternalLink, Settings } from 'lucide-react'
import { usePermissions } from '@/hooks/usePermissions'
import Link from 'next/link'
import { getApiBaseUrl } from '@/lib/api'

interface ServicoIntegracao {
  id: string
  nome: string
  descricao: string
  icone: string
  path: string
  status: 'disponivel' | 'em_desenvolvimento' | 'em_manutencao'
  configurado: boolean
}

const servicosIntegracao: ServicoIntegracao[] = [
  {
    id: 'docsales',
    nome: 'DocSales',
    descricao: 'Sistema de gestão de assinaturas de contratos eletrônicos. Envie documentos para assinatura, acompanhe status e gerencie contratos.',
    icone: '📝',
    path: '/dashboard/servicos-integracao/docsales',
    status: 'disponivel',
    configurado: false
  },
  // Adicione mais serviços aqui conforme forem implementados
  // {
  //   id: 'outro_servico',
  //   nome: 'Outro Serviço',
  //   descricao: 'Descrição do outro serviço',
  //   icone: '🔧',
  //   path: '/dashboard/servicos-integracao/outro-servico',
  //   status: 'em_desenvolvimento',
  //   configurado: false
  // }
]

export default function ServicosIntegracaoPage() {
  const [servicos, setServicos] = useState<ServicoIntegracao[]>(servicosIntegracao)
  const [loading, setLoading] = useState(true)
  const { podeAcessar, podeEditar } = usePermissions()

  useEffect(() => {
    verificarConfiguracoes()
  }, [])

  const verificarConfiguracoes = async () => {
    setLoading(true)
    try {
      const apiUrl = getApiBaseUrl()
      const response = await fetch(`${apiUrl}/api/v1/integracoes`)

      if (response.ok) {
        const data = await response.json()
        const integracoes = data.integracoes || []

        // Atualizar status de configuração dos serviços
        setServicos(servicosIntegracao.map(servico => {
          const integracao = integracoes.find((i: any) => i.tipo_integracao === servico.id)
          return {
            ...servico,
            configurado: integracao?.ativo || false
          }
        }))
      }
    } catch (error) {
      console.error('Erro ao verificar configurações:', error)
    } finally {
      setLoading(false)
    }
  }

  // Verificar se é master - master sempre pode acessar
  const adminData = typeof window !== 'undefined' ? localStorage.getItem('admin') : null
  const admin = adminData ? JSON.parse(adminData) : null
  const isMaster = admin?.tipo_usuario === 'master'

  if (!isMaster && !podeAcessar('servicos_integracao')) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Acesso Negado</h2>
          <p className="text-gray-400">Você não tem permissão para acessar esta página.</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-amber-500 mx-auto mb-4" />
          <p className="text-gray-400">Carregando serviços de integração...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-4 md:p-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-2">
          <Plug className="h-6 w-6 md:h-8 md:w-8 text-amber-500" />
          Serviços de Integração
        </h1>
        <p className="text-gray-400 mt-1 text-sm md:text-base">
          Gerencie e utilize os serviços de integração disponíveis no sistema
        </p>
      </div>

      <div className="bg-zinc-900 border border-amber-500/20 rounded-lg p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Serviços Disponíveis</h2>
          <Link
            href="/dashboard/integracoes-apis"
            className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-colors text-sm"
          >
            <Settings className="h-4 w-4" />
            Configurar Integrações
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {servicos.map((servico) => (
            <motion.div
              key={servico.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-zinc-800 border border-amber-500/20 rounded-lg p-6 hover:border-amber-500/40 transition-colors"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{servico.icone}</span>
                  <div>
                    <h3 className="text-lg font-bold text-white">{servico.nome}</h3>
                    {servico.configurado && (
                      <span className="text-xs px-2 py-1 rounded bg-green-500/20 text-green-500 mt-1 inline-block">
                        Configurado
                      </span>
                    )}
                  </div>
                </div>
                {servico.status === 'em_desenvolvimento' && (
                  <span className="text-xs px-2 py-1 rounded bg-yellow-500/20 text-yellow-500">
                    Em Desenvolvimento
                  </span>
                )}
                {servico.status === 'em_manutencao' && (
                  <span className="text-xs px-2 py-1 rounded bg-red-500/20 text-red-500">
                    Em Manutenção
                  </span>
                )}
              </div>

              <p className="text-gray-400 text-sm mb-4">{servico.descricao}</p>

              <div className="flex gap-2">
                {servico.status === 'disponivel' ? (
                  <Link
                    href={servico.path}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-black rounded-lg transition-colors font-medium"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Acessar
                  </Link>
                ) : (
                  <button
                    disabled
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-zinc-700 text-gray-500 rounded-lg cursor-not-allowed font-medium"
                  >
                    Indisponível
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {servicos.length === 0 && (
          <div className="text-center py-12">
            <Plug className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">Nenhum serviço de integração disponível no momento</p>
          </div>
        )}
      </div>

      <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-amber-400 mt-0.5" />
          <div>
            <p className="text-amber-400 font-medium mb-1">Sobre os Serviços de Integração</p>
            <p className="text-amber-300/80 text-sm">
              Cada serviço de integração oferece funcionalidades específicas. Configure as credenciais de cada integração na página{' '}
              <Link href="/dashboard/integracoes-apis" className="underline hover:text-amber-200">
                Configurações de Integrações
              </Link>
              {' '}antes de utilizar os serviços.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

