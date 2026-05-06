'use client'

import { useState, useEffect } from 'react'
import { motion } from 'motion/react'
import { Key, ToggleLeft, ToggleRight, CheckCircle, XCircle, AlertCircle, Loader2, FileText } from 'lucide-react'
import { usePermissions } from '@/hooks/usePermissions'

interface Funcionalidade {
  id?: string
  funcionalidade: string
  habilitado: boolean
}

interface Integracao {
  id: string
  tipo_integracao: string
  nome: string
  ativo: boolean
  funcionalidades?: Funcionalidade[]
}

export default function HabilitarApiPage() {
  const [integracoes, setIntegracoes] = useState<Integracao[]>([])
  const [loading, setLoading] = useState(true)
  const [salvando, setSalvando] = useState<{ [key: string]: boolean }>({})
  const [mensagem, setMensagem] = useState<{ tipo: 'sucesso' | 'erro' | null; texto: string }>({ tipo: null, texto: '' })
  const { podeEditar } = usePermissions()

  useEffect(() => {
    carregarIntegracoes()
  }, [])

  const carregarIntegracoes = async () => {
    setLoading(true)
    try {
      const apiUrl = 'https://api6.actusconsultoria.com.br'
      const response = await fetch(`${apiUrl}/api/v1/integracoes`)

      if (!response.ok) {
        throw new Error('Erro ao carregar integrações')
      }

      const data = await response.json()
      setIntegracoes(data.integracoes || [])
    } catch (error: any) {
      console.error('Erro ao carregar integrações:', error)
      setMensagem({ tipo: 'erro', texto: error.message || 'Erro ao carregar integrações' })
    } finally {
      setLoading(false)
    }
  }

  const toggleFuncionalidade = async (tipoIntegracao: string, funcionalidade: string, habilitado: boolean) => {
    if (!podeEditar('habilitar_api')) {
      setMensagem({ tipo: 'erro', texto: 'Você não tem permissão para habilitar/desabilitar funcionalidades' })
      return
    }

    setSalvando({ ...salvando, [`${tipoIntegracao}_${funcionalidade}`]: true })
    try {
      const apiUrl = 'https://api6.actusconsultoria.com.br'
      
      const adminData = localStorage.getItem('admin')
      const admin = adminData ? JSON.parse(adminData) : null
      
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      }
      if (admin?.id) {
        headers['x-user-id'] = admin.id
        headers['x-user-tipo'] = admin.tipo_usuario || 'administrativo'
      }

      const response = await fetch(
        `${apiUrl}/api/v1/integracoes/${tipoIntegracao}/funcionalidade/${funcionalidade}`,
        {
          method: 'PUT',
          headers,
          body: JSON.stringify({ habilitado: !habilitado }),
        }
      )

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Erro ao atualizar funcionalidade')
      }

      setMensagem({
        tipo: 'sucesso',
        texto: !habilitado ? 'Funcionalidade habilitada!' : 'Funcionalidade desabilitada!',
      })
      setTimeout(() => setMensagem({ tipo: null, texto: '' }), 3000)

      await carregarIntegracoes()
    } catch (error: any) {
      console.error('Erro ao atualizar funcionalidade:', error)
      setMensagem({ tipo: 'erro', texto: error.message || 'Erro ao atualizar funcionalidade' })
    } finally {
      setSalvando({ ...salvando, [`${tipoIntegracao}_${funcionalidade}`]: false })
    }
  }

  const focusNFe = integracoes.find((i) => i.tipo_integracao === 'focus_nfe')
  const emissaoNFe = focusNFe?.funcionalidades?.find((f) => f.funcionalidade === 'emissao_nfe')

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-amber-500 mx-auto mb-4" />
          <p className="text-gray-400">Carregando funcionalidades...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-4 md:p-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-2">
          <Key className="h-6 w-6 md:h-8 md:w-8 text-amber-500" />
          Habilitar API
        </h1>
        <p className="text-gray-400 mt-1 text-sm md:text-base">Ative ou desative funcionalidades das integrações</p>
      </div>

      {mensagem.tipo && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-lg border ${
            mensagem.tipo === 'sucesso'
              ? 'bg-green-500/10 border-green-500/30 text-green-500'
              : 'bg-red-500/10 border-red-500/30 text-red-500'
          }`}
        >
          <div className="flex items-center gap-2">
            {mensagem.tipo === 'sucesso' ? (
              <CheckCircle className="h-5 w-5" />
            ) : (
              <AlertCircle className="h-5 w-5" />
            )}
            <span>{mensagem.texto}</span>
          </div>
        </motion.div>
      )}

      {!focusNFe ? (
        <div className="bg-zinc-900 border border-amber-500/20 rounded-lg p-6">
          <div className="text-center">
            <FileText className="h-16 w-16 text-amber-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">Nenhuma Integração Configurada</h2>
            <p className="text-gray-400 mb-6">
              Configure uma integração na página "Integrações de APIs Externas" primeiro
            </p>
            <a
              href="/dashboard/integracoes-apis"
              className="inline-block px-6 py-3 bg-amber-500 hover:bg-amber-600 text-black rounded-lg transition-colors font-medium"
            >
              Ir para Integrações
            </a>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-zinc-900 border border-amber-500/20 rounded-lg p-4 md:p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <FileText className="h-5 w-5 text-amber-500" />
                  Nota Fiscal Focus NFe
                </h2>
                <p className="text-gray-400 text-sm mt-1">
                  {focusNFe.ativo ? (
                    <span className="text-green-500">Integração ativa</span>
                  ) : (
                    <span className="text-red-500">Integração inativa - Configure na página de Integrações</span>
                  )}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-zinc-800 rounded-lg">
                <div className="flex-1">
                  <h3 className="text-white font-medium mb-1">Emissão de Nota Fiscal</h3>
                  <p className="text-gray-400 text-sm">
                    {emissaoNFe?.habilitado
                      ? 'A emissão de nota fiscal está habilitada e funcionando'
                      : 'A emissão de nota fiscal está desabilitada. Habilite para começar a emitir notas'}
                  </p>
                </div>
                <button
                  onClick={() =>
                    toggleFuncionalidade(
                      'focus_nfe',
                      'emissao_nfe',
                      emissaoNFe?.habilitado || false
                    )
                  }
                  disabled={
                    !focusNFe.ativo ||
                    salvando['focus_nfe_emissao_nfe'] ||
                    !podeEditar('habilitar_api')
                  }
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 ${
                    emissaoNFe?.habilitado ? 'bg-amber-500' : 'bg-zinc-700'
                  } ${!focusNFe.ativo || !podeEditar('habilitar_api') ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      emissaoNFe?.habilitado ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {!focusNFe.ativo && (
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
                  <p className="text-amber-400 text-sm">
                    <AlertCircle className="h-4 w-4 inline mr-2" />
                    A integração precisa estar ativa para habilitar funcionalidades. Configure na página de Integrações.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

