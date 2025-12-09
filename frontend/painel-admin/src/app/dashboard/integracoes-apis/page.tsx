'use client'

import { useState, useEffect } from 'react'
import { motion } from 'motion/react'
import { Plug, Save, FileText, CheckCircle, XCircle, AlertCircle, Loader2 } from 'lucide-react'
import { usePermissions } from '@/hooks/usePermissions'

interface Integracao {
  id?: string
  tipo_integracao: string
  nome: string
  ativo: boolean
  ambiente: string
  token_producao?: string
  token_homologacao?: string
  certificado_digital_path?: string
  cnpj?: string
  configuracao_json?: any
  funcionalidades?: Array<{
    id: string
    funcionalidade: string
    habilitado: boolean
  }>
}

export default function IntegracoesApisPage() {
  const [integracoes, setIntegracoes] = useState<Integracao[]>([])
  const [integracaoAtiva, setIntegracaoAtiva] = useState<Integracao | null>(null)
  const [loading, setLoading] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [mensagem, setMensagem] = useState<{ tipo: 'sucesso' | 'erro' | null; texto: string }>({ tipo: null, texto: '' })
  const { podeEditar } = usePermissions()

  useEffect(() => {
    carregarIntegracoes()
  }, [])

  const carregarIntegracoes = async () => {
    setLoading(true)
    try {
      const apiUrl = 'https://api.protesecapilarcuiaba.com.br'
      const response = await fetch(`${apiUrl}/api/v1/integracoes`)

      if (!response.ok) {
        throw new Error('Erro ao carregar integrações')
      }

      const data = await response.json()
      setIntegracoes(data.integracoes || [])

      const focusNFe = data.integracoes?.find((i: Integracao) => i.tipo_integracao === 'focus_nfe')
      if (focusNFe) {
        setIntegracaoAtiva(focusNFe)
      }
    } catch (error: any) {
      console.error('Erro ao carregar integrações:', error)
      setMensagem({ tipo: 'erro', texto: error.message || 'Erro ao carregar integrações' })
    } finally {
      setLoading(false)
    }
  }

  const atualizarCampo = (campo: keyof Integracao, valor: any) => {
    if (integracaoAtiva) {
      setIntegracaoAtiva({ ...integracaoAtiva, [campo]: valor })
    }
  }

  const salvarIntegracao = async () => {
    if (!podeEditar('integracao_apis')) {
      setMensagem({ tipo: 'erro', texto: 'Você não tem permissão para editar integrações' })
      return
    }

    if (!integracaoAtiva) return

    setSalvando(true)
    try {
      const apiUrl = 'https://api.protesecapilarcuiaba.com.br'
      
      const adminData = localStorage.getItem('admin')
      const admin = adminData ? JSON.parse(adminData) : null
      
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      }
      if (admin?.id) {
        headers['x-user-id'] = admin.id
        headers['x-user-tipo'] = admin.tipo_usuario || 'administrativo'
      }

      const existe = integracaoAtiva.id
      const url = existe 
        ? `${apiUrl}/api/v1/integracoes/${integracaoAtiva.tipo_integracao}`
        : `${apiUrl}/api/v1/integracoes`
      const method = existe ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers,
        body: JSON.stringify(integracaoAtiva),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Erro ao salvar integração')
      }

      const data = await response.json()
      setMensagem({ tipo: 'sucesso', texto: 'Integração salva com sucesso!' })
      setTimeout(() => setMensagem({ tipo: null, texto: '' }), 3000)
      
      await carregarIntegracoes()
    } catch (error: any) {
      console.error('Erro ao salvar integração:', error)
      setMensagem({ tipo: 'erro', texto: error.message || 'Erro ao salvar integração' })
    } finally {
      setSalvando(false)
    }
  }

  const criarIntegracaoFocusNFe = () => {
    const novaIntegracao: Integracao = {
      tipo_integracao: 'focus_nfe',
      nome: 'Focus NFe',
      ativo: false,
      ambiente: 'homologacao',
      token_producao: '',
      token_homologacao: '',
      certificado_digital_path: '',
      cnpj: '',
    }
    setIntegracaoAtiva(novaIntegracao)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-amber-500 mx-auto mb-4" />
          <p className="text-gray-400">Carregando integrações...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-4 md:p-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-2">
          <Plug className="h-6 w-6 md:h-8 md:w-8 text-amber-500" />
          Integrações de APIs Externas
        </h1>
        <p className="text-gray-400 mt-1 text-sm md:text-base">Configure e gerencie integrações com serviços externos</p>
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

      {!integracaoAtiva ? (
        <div className="bg-zinc-900 border border-amber-500/20 rounded-lg p-6">
          <div className="text-center">
            <FileText className="h-16 w-16 text-amber-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">Nota Fiscal Focus NFe</h2>
            <p className="text-gray-400 mb-6">Configure a integração com Focus NFe para emitir notas fiscais</p>
            <button
              onClick={criarIntegracaoFocusNFe}
              className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-black rounded-lg transition-colors font-medium"
            >
              Configurar Focus NFe
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-zinc-900 border border-amber-500/20 rounded-lg p-4 md:p-6">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
              <FileText className="h-5 w-5 text-amber-500" />
              Nota Fiscal Focus NFe
            </h2>
            <p className="text-gray-400 text-sm">Configure os dados necessários para integração com Focus NFe</p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <input
                type="checkbox"
                checked={integracaoAtiva.ativo || false}
                onChange={(e) => atualizarCampo('ativo', e.target.checked)}
                className="w-4 h-4 rounded border-zinc-700 bg-zinc-900 text-amber-500 focus:ring-2 focus:ring-amber-500 cursor-pointer"
              />
              <label className="text-white font-medium">Ativar Integração</label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-300 text-sm mb-1">Ambiente</label>
                <select
                  value={integracaoAtiva.ambiente || 'homologacao'}
                  onChange={(e) => atualizarCampo('ambiente', e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="homologacao">Homologação</option>
                  <option value="producao">Produção</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-300 text-sm mb-1">CNPJ</label>
                <input
                  type="text"
                  value={integracaoAtiva.cnpj || ''}
                  onChange={(e) => {
                    const apenasNumeros = e.target.value.replace(/\D/g, '')
                    const formatado = apenasNumeros.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
                    atualizarCampo('cnpj', formatado)
                  }}
                  maxLength={18}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-amber-500"
                  placeholder="00.000.000/0000-00"
                />
              </div>

              <div>
                <label className="block text-gray-300 text-sm mb-1">Token de Homologação</label>
                <input
                  type="password"
                  value={integracaoAtiva.token_homologacao || ''}
                  onChange={(e) => atualizarCampo('token_homologacao', e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-amber-500"
                  placeholder="Token de homologação"
                />
                <p className="text-gray-500 text-xs mt-1">Token fornecido pela Focus NFe para ambiente de homologação</p>
              </div>

              <div>
                <label className="block text-gray-300 text-sm mb-1">Token de Produção</label>
                <input
                  type="password"
                  value={integracaoAtiva.token_producao || ''}
                  onChange={(e) => atualizarCampo('token_producao', e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-amber-500"
                  placeholder="Token de produção"
                />
                <p className="text-gray-500 text-xs mt-1">Token fornecido pela Focus NFe para ambiente de produção</p>
              </div>

              <div className="md:col-span-2">
                <label className="block text-gray-300 text-sm mb-1">Caminho do Certificado Digital</label>
                <input
                  type="text"
                  value={integracaoAtiva.certificado_digital_path || ''}
                  onChange={(e) => atualizarCampo('certificado_digital_path', e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-amber-500"
                  placeholder="/caminho/do/certificado.pfx"
                />
                <p className="text-gray-500 text-xs mt-1">Caminho completo do arquivo do certificado digital A1 (.pfx)</p>
              </div>
            </div>

            <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 mt-6">
              <p className="text-amber-400 text-sm">
                <AlertCircle className="h-4 w-4 inline mr-2" />
                Após configurar, você precisará habilitar a emissão de nota fiscal na página "Habilitar API"
              </p>
            </div>
          </div>

          <div className="flex justify-end mt-6">
            <button
              onClick={salvarIntegracao}
              disabled={salvando || !podeEditar('integracao_apis')}
              className="flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-600 text-black rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              <Save className="h-5 w-5" />
              {salvando ? 'Salvando...' : 'Salvar Configuração'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

