'use client'

import { useState, useEffect } from 'react'
import { motion } from 'motion/react'
import { FileText, Send, Search, CheckCircle, XCircle, AlertCircle, Loader2, Download, Eye, X, Plus, Calendar, Clock } from 'lucide-react'
import { usePermissions } from '@/hooks/usePermissions'
import Link from 'next/link'
import { getApiBaseUrl } from '@/lib/api'

interface Documento {
  documento_id: string
  titulo: string
  status: 'pendente' | 'assinado' | 'cancelado' | 'expirado' | 'recusado'
  data_criacao: string
  data_assinatura?: string
  signatarios: Array<{
    nome: string
    email: string
    status: string
  }>
  link_assinatura?: string
  link_documento?: string
}

export default function DocSalesPage() {
  const [documentos, setDocumentos] = useState<Documento[]>([])
  const [loading, setLoading] = useState(true)
  const [filtroStatus, setFiltroStatus] = useState<string>('')
  const [busca, setBusca] = useState('')
  const [mostrarModalEnvio, setMostrarModalEnvio] = useState(false)
  const { podeAcessar, podeEditar } = usePermissions()

  useEffect(() => {
    if (podeAcessar('servicos_integracao')) {
      carregarDocumentos()
    }
  }, [filtroStatus])

  const carregarDocumentos = async () => {
    setLoading(true)
    try {
      const apiUrl = getApiBaseUrl()
      const params = new URLSearchParams()
      if (filtroStatus) params.append('status', filtroStatus)

      const response = await fetch(`${apiUrl}/api/v1/docsales/documentos?${params.toString()}`)

      if (response.ok) {
        const data = await response.json()
        setDocumentos(data.documentos || [])
      } else {
        console.error('Erro ao carregar documentos')
      }
    } catch (error) {
      console.error('Erro ao carregar documentos:', error)
    } finally {
      setLoading(false)
    }
  }

  const consultarStatus = async (documentoId: string) => {
    try {
      const apiUrl = getApiBaseUrl()
      const response = await fetch(`${apiUrl}/api/v1/docsales/documentos/${documentoId}`)

      if (response.ok) {
        const data = await response.json()
        // Atualizar o documento na lista
        setDocumentos(prev => prev.map(doc => 
          doc.documento_id === documentoId ? { ...doc, ...data } : doc
        ))
      }
    } catch (error) {
      console.error('Erro ao consultar status:', error)
    }
  }

  const baixarDocumento = async (documentoId: string) => {
    try {
      const apiUrl = getApiBaseUrl()
      const response = await fetch(`${apiUrl}/api/v1/docsales/documentos/${documentoId}/download`)

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `documento_${documentoId}.pdf`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }
    } catch (error) {
      console.error('Erro ao baixar documento:', error)
    }
  }

  const cancelarDocumento = async (documentoId: string) => {
    if (!confirm('Tem certeza que deseja cancelar este documento?')) return

    try {
      const apiUrl = getApiBaseUrl()
      const adminData = localStorage.getItem('admin')
      const admin = adminData ? JSON.parse(adminData) : null

      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      }
      if (admin?.id) {
        headers['x-user-id'] = admin.id
        headers['x-user-tipo'] = admin.tipo_usuario || 'administrativo'
      }

      const response = await fetch(`${apiUrl}/api/v1/docsales/documentos/${documentoId}/cancelar`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ motivo: 'Cancelado pelo usuário' })
      })

      if (response.ok) {
        await carregarDocumentos()
      }
    } catch (error) {
      console.error('Erro ao cancelar documento:', error)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { cor: string; icone: any; texto: string }> = {
      pendente: { cor: 'bg-yellow-500/20 text-yellow-500', icone: Clock, texto: 'Pendente' },
      assinado: { cor: 'bg-green-500/20 text-green-500', icone: CheckCircle, texto: 'Assinado' },
      cancelado: { cor: 'bg-red-500/20 text-red-500', icone: XCircle, texto: 'Cancelado' },
      expirado: { cor: 'bg-gray-500/20 text-gray-500', icone: AlertCircle, texto: 'Expirado' },
      recusado: { cor: 'bg-orange-500/20 text-orange-500', icone: XCircle, texto: 'Recusado' },
    }

    const config = statusConfig[status] || statusConfig.pendente
    const Icon = config.icone

    return (
      <span className={`px-2 py-1 rounded text-xs flex items-center gap-1 ${config.cor}`}>
        <Icon className="h-3 w-3" />
        {config.texto}
      </span>
    )
  }

  const documentosFiltrados = documentos.filter(doc => {
    if (busca) {
      return doc.titulo.toLowerCase().includes(busca.toLowerCase())
    }
    return true
  })

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

  return (
    <div className="space-y-6 p-4 md:p-6 max-w-7xl mx-auto">
      <div>
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Link
                href="/dashboard/servicos-integracao"
                className="text-amber-500 hover:text-amber-400 transition-colors"
              >
                Serviços de Integração
              </Link>
              <span className="text-gray-500">/</span>
              <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-2">
                <FileText className="h-6 w-6 md:h-8 md:w-8 text-amber-500" />
                DocSales
              </h1>
            </div>
            <p className="text-gray-400 text-sm md:text-base">
              Gerencie documentos enviados para assinatura eletrônica
            </p>
          </div>
          {podeEditar('servicos_integracao') && (
            <button
              onClick={() => setMostrarModalEnvio(true)}
              className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-black rounded-lg transition-colors font-medium"
            >
              <Plus className="h-4 w-4" />
              Enviar Documento
            </button>
          )}
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-zinc-900 border border-amber-500/20 rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-300 text-sm mb-1">Buscar</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Buscar por título..."
                className="w-full pl-10 pr-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-gray-300 text-sm mb-1">Filtrar por Status</label>
            <select
              value={filtroStatus}
              onChange={(e) => setFiltroStatus(e.target.value)}
              className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-amber-500"
            >
              <option value="">Todos</option>
              <option value="pendente">Pendente</option>
              <option value="assinado">Assinado</option>
              <option value="cancelado">Cancelado</option>
              <option value="expirado">Expirado</option>
              <option value="recusado">Recusado</option>
            </select>
          </div>
        </div>
      </div>

      {/* Lista de Documentos */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-12 w-12 animate-spin text-amber-500" />
        </div>
      ) : documentosFiltrados.length === 0 ? (
        <div className="bg-zinc-900 border border-amber-500/20 rounded-lg p-12 text-center">
          <FileText className="h-16 w-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 text-lg">Nenhum documento encontrado</p>
        </div>
      ) : (
        <div className="space-y-4">
          {documentosFiltrados.map((documento) => (
            <motion.div
              key={documento.documento_id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-zinc-900 border border-amber-500/20 rounded-lg p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-bold text-white">{documento.titulo}</h3>
                    {getStatusBadge(documento.status)}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      Criado em: {new Date(documento.data_criacao).toLocaleDateString('pt-BR')}
                    </span>
                    {documento.data_assinatura && (
                      <span className="flex items-center gap-1">
                        <CheckCircle className="h-4 w-4" />
                        Assinado em: {new Date(documento.data_assinatura).toLocaleDateString('pt-BR')}
                      </span>
                    )}
                  </div>
                  {documento.signatarios && documento.signatarios.length > 0 && (
                    <div className="mt-3">
                      <p className="text-sm text-gray-400 mb-1">Signatários:</p>
                      <div className="flex flex-wrap gap-2">
                        {documento.signatarios.map((signatario, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-zinc-800 rounded text-xs text-gray-300"
                          >
                            {signatario.nome} ({signatario.email})
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => consultarStatus(documento.documento_id)}
                    className="p-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors"
                    title="Atualizar Status"
                  >
                    <Eye className="h-4 w-4 text-white" />
                  </button>
                  {documento.status === 'assinado' && (
                    <button
                      onClick={() => baixarDocumento(documento.documento_id)}
                      className="p-2 bg-amber-500/20 hover:bg-amber-500/30 rounded-lg transition-colors"
                      title="Baixar Documento"
                    >
                      <Download className="h-4 w-4 text-amber-500" />
                    </button>
                  )}
                  {documento.status === 'pendente' && podeEditar('servicos_integracao') && (
                    <button
                      onClick={() => cancelarDocumento(documento.documento_id)}
                      className="p-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg transition-colors"
                      title="Cancelar Documento"
                    >
                      <X className="h-4 w-4 text-red-500" />
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Modal de Envio (placeholder - será implementado depois) */}
      {mostrarModalEnvio && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-zinc-900 border border-amber-500/20 rounded-lg p-6 max-w-2xl w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">Enviar Documento para Assinatura</h2>
              <button
                onClick={() => setMostrarModalEnvio(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="text-gray-400 mb-4">
              Esta funcionalidade será implementada em breve. Por enquanto, você pode enviar documentos
              diretamente através da API do DocSales.
            </p>
            <button
              onClick={() => setMostrarModalEnvio(false)}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-black rounded-lg transition-colors"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

