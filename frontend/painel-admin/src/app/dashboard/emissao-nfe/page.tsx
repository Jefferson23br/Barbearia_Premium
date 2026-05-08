'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { FileCheck, Search, Calendar, Loader2, AlertCircle, CheckCircle2, X, FileText, Receipt, User, Building2, DollarSign, Package, Scissors, Download, Eye, Filter } from 'lucide-react'
import { usePermissions } from '@/hooks/usePermissions'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { getApiBaseUrl } from '@/lib/api'

interface Romaneio {
  id: string
  numero_romaneio: string
  tipo_romaneio: string
  data_romaneio: string
  descricao?: string | null
  status: string
  total_vendas: number
  vendas: Venda[]
}

interface Venda {
  id: string
  ticket: string
  data_venda: string
  valor_liquido: number | string
  cliente_id?: string | null
  cliente_nome?: string | null
  cliente_cpf_cnpj?: string | null
  cliente_email?: string | null
  cliente_telefone?: string | null
  endereco_rua?: string | null
  endereco_numero?: string | null
  endereco_complemento?: string | null
  endereco_bairro?: string | null
  endereco_cidade?: string | null
  endereco_estado?: string | null
  endereco_cep?: string | null
  valor_total: number | string
  total_produtos: number
  total_servicos: number
}

interface Emitente {
  nome_empresarial: string
  nome_fantasia: string
  cnpj: string
  cnae?: string
  inscricao_estadual: string
  endereco_rua: string
  endereco_numero: string
  endereco_complemento?: string
  endereco_bairro: string
  endereco_cidade: string
  endereco_estado: string
  endereco_cep: string
  email_contato?: string
  telefone_principal?: string
}

interface NotaFiscal {
  id: string
  venda_id: string
  romaneio_id?: string | null
  numero: string
  serie: string
  chave_acesso?: string | null
  status: string
  xml_path?: string | null
  pdf_path?: string | null
  observacoes?: string | null
  created_at: string
  venda_ticket: string
  data_venda: string
  venda_valor: number | string
  cliente_nome?: string | null
  cliente_cpf_cnpj?: string | null
  numero_romaneio?: string | null
}

export default function EmissaoNfePage() {
  const [abaAtiva, setAbaAtiva] = useState<'emissao' | 'notas'>('emissao')
  const [romaneios, setRomaneios] = useState<Romaneio[]>([])
  const [romaneiosFiltrados, setRomaneiosFiltrados] = useState<Romaneio[]>([])
  const [notasFiscais, setNotasFiscais] = useState<NotaFiscal[]>([])
  const [notasFiltradas, setNotasFiltradas] = useState<NotaFiscal[]>([])
  const [loading, setLoading] = useState(false)
  const [carregandoNotas, setCarregandoNotas] = useState(false)
  const [emitindo, setEmitindo] = useState(false)
  const carregandoRef = useRef(false)
  const carregandoEmitenteRef = useRef(false)
  const dadosCarregadosRef = useRef(false) // Controlar se os dados já foram carregados
  const [mensagem, setMensagem] = useState<{ tipo: 'sucesso' | 'erro' | null; texto: string }>({ tipo: null, texto: '' })
  const [busca, setBusca] = useState('')
  const [buscaNotas, setBuscaNotas] = useState('')
  const [filtroStatus, setFiltroStatus] = useState('all')
  const [filtroDataInicio, setFiltroDataInicio] = useState('')
  const [filtroDataFim, setFiltroDataFim] = useState('')
  const [emitente, setEmitente] = useState<Emitente | null>(null)
  const [vendaSelecionada, setVendaSelecionada] = useState<Venda | null>(null)
  const [mostrarModalEmitir, setMostrarModalEmitir] = useState(false)
  const [observacoes, setObservacoes] = useState('')
  const { podeAcessar, podeEditar, loading: loadingPermissoes } = usePermissions()

  const formatarPreco = (valor: number | string | null | undefined) => {
    if (!valor) return 'R$ 0,00'
    const num = typeof valor === 'string' ? parseFloat(valor) : valor
    if (isNaN(num)) return 'R$ 0,00'
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(num)
  }

  const formatarData = (data: string) => {
    if (!data) return ''
    try {
      return new Date(data).toLocaleDateString('pt-BR')
    } catch {
      return data
    }
  }

  const formatarCPFCNPJ = (cpfCnpj: string | null | undefined) => {
    if (!cpfCnpj) return '-'
    const limpo = cpfCnpj.replace(/\D/g, '')
    if (limpo.length === 11) {
      return limpo.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
    } else if (limpo.length === 14) {
      return limpo.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
    }
    return cpfCnpj
  }

  const carregarRomaneios = useCallback(async () => {
    // Verificar se é master ou tem permissão
    const adminData = localStorage.getItem('admin')
    const admin = adminData ? JSON.parse(adminData) : null
    const isMaster = admin?.tipo_usuario === 'master'
    
    if (!isMaster && !podeAcessar('emissao_nfe')) {
      console.log('[FRONTEND] Sem permissão para carregar romaneios')
      return
    }
    
    if (carregandoRef.current) return // Evitar múltiplas chamadas simultâneas

    carregandoRef.current = true
    setLoading(true)
    try {
      const adminData = localStorage.getItem('admin')
      const admin = adminData ? JSON.parse(adminData) : null

      const apiUrl = getApiBaseUrl()
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      }
      if (admin?.id) {
        headers['x-user-id'] = admin.id
        headers['x-user-tipo'] = admin.tipo_usuario || 'administrativo'
        headers['x-user-nome'] = admin.nome_completo || null
      }

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 segundos
      
      let response
      try {
        response = await fetch(`${apiUrl}/api/v1/emissao-nfe/romaneios-fechados`, { 
          headers,
          signal: controller.signal
        })
      } finally {
        clearTimeout(timeoutId)
      }

      if (!response.ok) {
        let errorMessage = `Erro ao carregar romaneios: ${response.status}`
        try {
          const errorData = await response.json()
          errorMessage = errorData.error || errorData.details || errorMessage
        } catch {
          // Se não conseguir ler o JSON de erro, usar a mensagem padrão
        }
        throw new Error(errorMessage)
      }

      const data = await response.json()
      console.log('[FRONTEND] Dados recebidos de romaneios:', data)
      console.log('[FRONTEND] Quantidade de romaneios:', data.romaneios?.length || 0)
      console.log('[FRONTEND] Detalhes dos romaneios:', data.romaneios?.map((r: any) => ({
        numero: r.numero_romaneio,
        total_vendas: r.total_vendas,
        vendas_count: r.vendas?.length || 0
      })))
      setRomaneios(data.romaneios || [])
      setRomaneiosFiltrados(data.romaneios || [])
    } catch (error: any) {
      console.error('Erro ao carregar romaneios:', error)
      if (error.name === 'AbortError') {
        setMensagem({ tipo: 'erro', texto: 'Timeout ao carregar romaneios. Tente novamente.' })
      } else {
        setMensagem({ tipo: 'erro', texto: error.message || 'Erro ao carregar romaneios' })
      }
    } finally {
      setLoading(false)
      carregandoRef.current = false
    }
  }, [podeAcessar])

  const carregarEmitente = useCallback(async () => {
    // Verificar se é master ou tem permissão
    const adminData = localStorage.getItem('admin')
    const admin = adminData ? JSON.parse(adminData) : null
    const isMaster = admin?.tipo_usuario === 'master'
    
    if (!isMaster && !podeAcessar('emissao_nfe')) {
      console.log('[FRONTEND] Sem permissão para carregar emitente')
      return
    }
    
    if (carregandoEmitenteRef.current) return // Evitar múltiplas chamadas simultâneas

    carregandoEmitenteRef.current = true
    try {
      const adminData = localStorage.getItem('admin')
      const admin = adminData ? JSON.parse(adminData) : null

      const apiUrl = getApiBaseUrl()
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      }
      if (admin?.id) {
        headers['x-user-id'] = admin.id
        headers['x-user-tipo'] = admin.tipo_usuario || 'administrativo'
        headers['x-user-nome'] = admin.nome_completo || null
      }

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 segundos
      
      let response
      try {
        response = await fetch(`${apiUrl}/api/v1/emissao-nfe/configuracoes-emitente`, { 
          headers,
          signal: controller.signal
        })
      } finally {
        clearTimeout(timeoutId)
      }

      if (response.ok) {
        const data = await response.json()
        console.log('[FRONTEND] Dados do emitente recebidos:', data)
        console.log('[FRONTEND] Emitente:', data.emitente)
        
        if (data.emitente) {
          console.log('[FRONTEND] Definindo emitente no estado')
          setEmitente(data.emitente)
        } else {
          console.warn('[FRONTEND] Resposta OK mas sem dados de emitente')
        }
      } else {
        console.error('[FRONTEND] Erro ao carregar emitente. Status:', response.status)
        const errorData = await response.json().catch(() => ({}))
        console.error('[FRONTEND] Erro detalhado:', errorData)
        setMensagem({ 
          tipo: 'erro', 
          texto: errorData.error || 'Erro ao carregar dados da empresa emitente' 
        })
      }
    } catch (error: any) {
      console.error('Erro ao carregar emitente:', error)
      if (error.name !== 'AbortError') {
        // Não mostrar erro se foi apenas um timeout/abort
        console.warn('Falha ao carregar configurações do emitente')
      }
    } finally {
      carregandoEmitenteRef.current = false
    }
  }, [podeAcessar])

  const carregarNotasFiscais = useCallback(async () => {
    if (!podeAcessar('emissao_nfe')) return

    setCarregandoNotas(true)
    try {
      const adminData = localStorage.getItem('admin')
      const admin = adminData ? JSON.parse(adminData) : null

      const apiUrl = getApiBaseUrl()
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      }
      if (admin?.id) {
        headers['x-user-id'] = admin.id
        headers['x-user-tipo'] = admin.tipo_usuario || 'administrativo'
        headers['x-user-nome'] = admin.nome_completo || null
      }

      const queryParams = new URLSearchParams()
      if (filtroStatus && filtroStatus !== 'all') queryParams.append('status', filtroStatus)
      if (filtroDataInicio) queryParams.append('data_inicio', filtroDataInicio)
      if (filtroDataFim) queryParams.append('data_fim', filtroDataFim)
      if (buscaNotas) queryParams.append('busca', buscaNotas)

      const response = await fetch(`${apiUrl}/api/v1/emissao-nfe/notas-fiscais?${queryParams.toString()}`, { headers })

      if (!response.ok) {
        throw new Error(`Erro ao carregar notas fiscais: ${response.status}`)
      }

      const data = await response.json()
      setNotasFiscais(data.notas_fiscais || [])
      setNotasFiltradas(data.notas_fiscais || [])
    } catch (error: any) {
      console.error('Erro ao carregar notas fiscais:', error)
      setMensagem({ tipo: 'erro', texto: error.message || 'Erro ao carregar notas fiscais' })
    } finally {
      setCarregandoNotas(false)
    }
  }, [podeAcessar, filtroStatus, filtroDataInicio, filtroDataFim, buscaNotas])

  useEffect(() => {
    // Evitar múltiplas execuções
    if (dadosCarregadosRef.current) {
      console.log('[FRONTEND] Dados já foram carregados, pulando...')
      return
    }

    // Aguardar permissões carregarem antes de verificar acesso
    if (loadingPermissoes) {
      console.log('[FRONTEND] Aguardando permissões carregarem...')
      return
    }

    // Verificar se é master diretamente
    const adminData = localStorage.getItem('admin')
    const admin = adminData ? JSON.parse(adminData) : null
    const isMaster = admin?.tipo_usuario === 'master'
    
    console.log('[FRONTEND] useEffect executado. loadingPermissoes:', loadingPermissoes)
    console.log('[FRONTEND] isMaster:', isMaster)
    console.log('[FRONTEND] podeAcessar:', podeAcessar('emissao_nfe'))
    
    // Se for master ou tiver permissão, carregar dados
    if (isMaster || podeAcessar('emissao_nfe')) {
      console.log('[FRONTEND] Carregando romaneios e emitente...')
      dadosCarregadosRef.current = true // Marcar como carregado
      carregarRomaneios()
      carregarEmitente()
    } else {
      console.warn('[FRONTEND] Sem permissão para acessar emissao_nfe')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadingPermissoes]) // Executar apenas quando loadingPermissoes mudar

  useEffect(() => {
    if (abaAtiva === 'notas') {
      carregarNotasFiscais()
    }
  }, [abaAtiva, carregarNotasFiscais])

  // Filtrar romaneios
  useEffect(() => {
    if (!busca) {
      setRomaneiosFiltrados(romaneios)
      return
    }

    const termo = busca.toLowerCase()
    const filtrados = romaneios.filter(romaneio =>
      romaneio.numero_romaneio.toLowerCase().includes(termo) ||
      romaneio.descricao?.toLowerCase().includes(termo) ||
      romaneio.vendas.some(v => 
        v.ticket.toLowerCase().includes(termo) ||
        v.cliente_nome?.toLowerCase().includes(termo)
      )
    )
    setRomaneiosFiltrados(filtrados)
  }, [busca, romaneios])

  // Filtrar notas fiscais localmente (se não usar busca no backend)
  useEffect(() => {
    if (!buscaNotas && filtroStatus === 'all' && !filtroDataInicio && !filtroDataFim) {
      setNotasFiltradas(notasFiscais)
      return
    }

    let filtradas = [...notasFiscais]

    if (buscaNotas) {
      const termo = buscaNotas.toLowerCase()
      filtradas = filtradas.filter(nota =>
        nota.numero.toLowerCase().includes(termo) ||
        nota.chave_acesso?.toLowerCase().includes(termo) ||
        nota.venda_ticket.toLowerCase().includes(termo) ||
        nota.cliente_nome?.toLowerCase().includes(termo)
      )
    }

    if (filtroStatus !== 'all') {
      filtradas = filtradas.filter(nota => nota.status === filtroStatus)
    }

    setNotasFiltradas(filtradas)
  }, [buscaNotas, filtroStatus, filtroDataInicio, filtroDataFim, notasFiscais])

  const abrirModalEmitir = (venda: Venda) => {
    setVendaSelecionada(venda)
    setObservacoes('')
    setMostrarModalEmitir(true)
  }

  const emitirNotaFiscal = async () => {
    if (!vendaSelecionada) return

    setEmitindo(true)
    setMensagem({ tipo: null, texto: '' })

    try {
      const adminData = localStorage.getItem('admin')
      const admin = adminData ? JSON.parse(adminData) : null

      const apiUrl = getApiBaseUrl()
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      }
      if (admin?.id) {
        headers['x-user-id'] = admin.id
        headers['x-user-tipo'] = admin.tipo_usuario || 'administrativo'
        headers['x-user-nome'] = admin.nome_completo || null
      }

      const romaneio = romaneios.find(r => r.vendas.some(v => v.id === vendaSelecionada.id))

      const response = await fetch(`${apiUrl}/api/v1/emissao-nfe/emitir`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          venda_id: vendaSelecionada.id,
          romaneio_id: romaneio?.id || null,
          observacoes: observacoes || null
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao emitir nota fiscal')
      }

      setMensagem({ tipo: 'sucesso', texto: data.mensagem || 'Nota fiscal emitida com sucesso!' })
      setMostrarModalEmitir(false)
      setVendaSelecionada(null)
      await carregarRomaneios()
      if (abaAtiva === 'notas') {
        await carregarNotasFiscais()
      }

      setTimeout(() => {
        setMensagem({ tipo: null, texto: '' })
      }, 5000)
    } catch (error: any) {
      console.error('Erro ao emitir nota fiscal:', error)
      setMensagem({ tipo: 'erro', texto: error.message || 'Erro ao emitir nota fiscal' })
    } finally {
      setEmitindo(false)
    }
  }

  // Verificar se é master ou tem permissão
  const adminData = typeof window !== 'undefined' ? localStorage.getItem('admin') : null
  const admin = adminData ? JSON.parse(adminData) : null
  const isMaster = admin?.tipo_usuario === 'master'
  const temAcesso = isMaster || podeAcessar('emissao_nfe')
  
  console.log('[FRONTEND] Verificação de acesso:', {
    isMaster,
    podeAcessar: podeAcessar('emissao_nfe'),
    temAcesso,
    loadingPermissoes,
    tipo_usuario: admin?.tipo_usuario
  })

  if (!loadingPermissoes && !temAcesso) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Card className="p-8 bg-zinc-900 border-amber-500/20">
          <div className="flex flex-col items-center gap-4">
            <AlertCircle className="h-12 w-12 text-red-500" />
            <h2 className="text-xl font-bold text-gray-300">Acesso Negado</h2>
            <p className="text-gray-400">Você não tem permissão para acessar este módulo.</p>
          </div>
        </Card>
      </div>
    )
  }

  // Mostrar loading enquanto carrega permissões
  if (loadingPermissoes) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Card className="p-8 bg-zinc-900 border-amber-500/20">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
            <p className="text-gray-400">Carregando permissões...</p>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2 text-gray-300">
            <FileCheck className="h-8 w-8 text-amber-500" />
            Emissão de Nota Fiscal
          </h1>
          <p className="text-gray-400 mt-1">Emita notas fiscais para vendas de romaneios fechados</p>
        </div>
      </div>

      {/* Mensagens */}
      <AnimatePresence>
        {mensagem.tipo && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`p-4 rounded-lg border flex items-center gap-2 ${
              mensagem.tipo === 'sucesso' 
                ? 'bg-green-500/10 border-green-500/30 text-green-500' 
                : 'bg-red-500/10 border-red-500/30 text-red-500'
            }`}
          >
            {mensagem.tipo === 'sucesso' ? (
              <CheckCircle2 className="h-5 w-5" />
            ) : (
              <AlertCircle className="h-5 w-5" />
            )}
            <p className="text-sm">{mensagem.texto}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Abas */}
      <div className="flex gap-2 border-b border-zinc-700">
        <button
          onClick={() => setAbaAtiva('emissao')}
          className={`px-6 py-3 font-medium transition-colors ${
            abaAtiva === 'emissao'
              ? 'text-amber-500 border-b-2 border-amber-500'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          <FileCheck className="h-4 w-4 inline mr-2" />
          Emissão
        </button>
        <button
          onClick={() => setAbaAtiva('notas')}
          className={`px-6 py-3 font-medium transition-colors ${
            abaAtiva === 'notas'
              ? 'text-amber-500 border-b-2 border-amber-500'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          <FileText className="h-4 w-4 inline mr-2" />
          Notas Fiscais
        </button>
      </div>

      {/* Conteúdo da Aba de Emissão */}
      {abaAtiva === 'emissao' && (
        <>
          {/* Informações do Emitente */}
          {emitente && (
            <Card className="p-4 bg-zinc-900 border-amber-500/20">
              <div className="flex items-center gap-2 mb-3">
                <Building2 className="h-5 w-5 text-amber-500" />
                <h3 className="text-lg font-semibold text-gray-300">Emitente</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-400">Razão Social:</span>
                  <p className="text-white font-medium">{emitente.nome_empresarial}</p>
                </div>
                <div>
                  <span className="text-gray-400">Nome Fantasia:</span>
                  <p className="text-white font-medium">{emitente.nome_fantasia || '-'}</p>
                </div>
                <div>
                  <span className="text-gray-400">CNPJ:</span>
                  <p className="text-white font-medium">{formatarCPFCNPJ(emitente.cnpj)}</p>
                </div>
                <div>
                  <span className="text-gray-400">Inscrição Estadual:</span>
                  <p className="text-white font-medium">{emitente.inscricao_estadual || '-'}</p>
                </div>
                <div className="md:col-span-2">
                  <span className="text-gray-400">Endereço:</span>
                  <p className="text-white font-medium">
                    {emitente.endereco_rua}, {emitente.endereco_numero}
                    {emitente.endereco_complemento ? ` - ${emitente.endereco_complemento}` : ''}
                    {emitente.endereco_bairro ? ` - ${emitente.endereco_bairro}` : ''}
                    {emitente.endereco_cidade ? ` - ${emitente.endereco_cidade}/${emitente.endereco_estado}` : ''}
                    {emitente.endereco_cep ? ` - CEP: ${emitente.endereco_cep}` : ''}
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* Filtros */}
          <Card className="p-4 bg-zinc-900 border-amber-500/20">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Label htmlFor="busca" className="text-gray-300">Buscar</Label>
                <div className="relative mt-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="busca"
                    type="text"
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                    placeholder="Buscar por romaneio, ticket ou cliente..."
                    className="bg-zinc-800 border-amber-500/20 text-gray-300 pl-10 focus:border-amber-500 focus:ring-amber-500/20"
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Lista de Romaneios e Vendas */}
          {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
        </div>
      ) : romaneiosFiltrados.length === 0 ? (
        <Card className="p-8 bg-zinc-900 border-amber-500/20">
          <div className="text-center text-gray-400">
            <FileCheck className="h-12 w-12 mx-auto mb-4 text-gray-500" />
            <p>Nenhum romaneio fechado encontrado com vendas pendentes de nota fiscal</p>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {romaneiosFiltrados.map((romaneio) => (
            <Card key={romaneio.id} className="p-6 bg-zinc-900 border-amber-500/20">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Receipt className="h-5 w-5 text-amber-500" />
                    Romaneio {romaneio.numero_romaneio}
                  </h3>
                  <p className="text-sm text-gray-400 mt-1">
                    {formatarData(romaneio.data_romaneio)} • {romaneio.total_vendas} venda(s)
                  </p>
                </div>
              </div>

              {romaneio.vendas.length === 0 ? (
                <p className="text-gray-400 text-sm">Nenhuma venda disponível</p>
              ) : (
                <div className="space-y-3">
                  {romaneio.vendas.map((venda) => (
                    <div
                      key={venda.id}
                      className="p-4 bg-zinc-800/50 rounded-lg border border-zinc-700/50 hover:border-amber-500/30 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="font-mono text-amber-500 font-bold">
                              {venda.ticket}
                            </span>
                            <span className="text-sm text-gray-400">
                              {formatarData(venda.data_venda)}
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                            <div>
                              <span className="text-gray-400 flex items-center gap-1">
                                <User className="h-3 w-3" />
                                Cliente:
                              </span>
                              <p className="text-white font-medium">
                                {venda.cliente_nome || 'Cliente não cadastrado'}
                              </p>
                              {venda.cliente_cpf_cnpj && (
                                <p className="text-gray-400 text-xs">
                                  {formatarCPFCNPJ(venda.cliente_cpf_cnpj)}
                                </p>
                              )}
                            </div>
                            
                            <div>
                              <span className="text-gray-400 flex items-center gap-1">
                                <DollarSign className="h-3 w-3" />
                                Valor:
                              </span>
                              <p className="text-white font-bold text-lg">
                                {formatarPreco(venda.valor_liquido)}
                              </p>
                            </div>

                            {venda.endereco_rua && (
                              <div className="md:col-span-2">
                                <span className="text-gray-400">Endereço:</span>
                                <p className="text-white text-xs">
                                  {venda.endereco_rua}, {venda.endereco_numero}
                                  {venda.endereco_complemento ? ` - ${venda.endereco_complemento}` : ''}
                                  {venda.endereco_bairro ? ` - ${venda.endereco_bairro}` : ''}
                                  {venda.endereco_cidade ? ` - ${venda.endereco_cidade}/${venda.endereco_estado}` : ''}
                                  {venda.endereco_cep ? ` - CEP: ${venda.endereco_cep}` : ''}
                                </p>
                              </div>
                            )}

                            <div className="flex items-center gap-4 text-xs text-gray-400">
                              {venda.total_produtos > 0 && (
                                <span className="flex items-center gap-1">
                                  <Package className="h-3 w-3" />
                                  {venda.total_produtos} produto(s)
                                </span>
                              )}
                              {venda.total_servicos > 0 && (
                                <span className="flex items-center gap-1">
                                  <Scissors className="h-3 w-3" />
                                  {venda.total_servicos} serviço(s)
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="ml-4">
                          <Button
                            onClick={() => abrirModalEmitir(venda)}
                            disabled={!podeEditar('emissao_nfe')}
                            className="bg-amber-500 hover:bg-amber-600 text-white"
                          >
                            <FileCheck className="h-4 w-4 mr-2" />
                            Emitir NFe
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          ))}
          </div>
        )}
        </>
      )}

      {/* Conteúdo da Aba de Notas Fiscais */}
      {abaAtiva === 'notas' && (
        <>
          {/* Filtros */}
          <Card className="p-4 bg-zinc-900 border-amber-500/20">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <Label htmlFor="buscaNotas" className="text-gray-300">Buscar</Label>
                <div className="relative mt-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="buscaNotas"
                    type="text"
                    value={buscaNotas}
                    onChange={(e) => setBuscaNotas(e.target.value)}
                    placeholder="Buscar por número, chave, ticket ou cliente..."
                    className="bg-zinc-800 border-amber-500/20 text-gray-300 pl-10 focus:border-amber-500 focus:ring-amber-500/20"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="filtroStatus" className="text-gray-300">Status</Label>
                <Select value={filtroStatus} onValueChange={setFiltroStatus}>
                  <SelectTrigger className="bg-zinc-800 border-amber-500/20 text-gray-300 mt-1">
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-amber-500/20">
                    <SelectItem value="all" className="text-gray-300">Todos</SelectItem>
                    <SelectItem value="pendente" className="text-gray-300">Pendente</SelectItem>
                    <SelectItem value="emitida" className="text-gray-300">Emitida</SelectItem>
                    <SelectItem value="cancelada" className="text-gray-300">Cancelada</SelectItem>
                    <SelectItem value="rejeitada" className="text-gray-300">Rejeitada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="filtroDataInicio" className="text-gray-300">Data Início</Label>
                <Input
                  id="filtroDataInicio"
                  type="date"
                  value={filtroDataInicio}
                  onChange={(e) => setFiltroDataInicio(e.target.value)}
                  className="bg-zinc-800 border-amber-500/20 text-gray-300 mt-1 focus:border-amber-500 focus:ring-amber-500/20"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
              <div>
                <Label htmlFor="filtroDataFim" className="text-gray-300">Data Fim</Label>
                <Input
                  id="filtroDataFim"
                  type="date"
                  value={filtroDataFim}
                  onChange={(e) => setFiltroDataFim(e.target.value)}
                  className="bg-zinc-800 border-amber-500/20 text-gray-300 mt-1 focus:border-amber-500 focus:ring-amber-500/20"
                />
              </div>
              <div className="md:col-span-3 flex items-end">
                <Button
                  onClick={carregarNotasFiscais}
                  disabled={carregandoNotas}
                  className="bg-amber-500 hover:bg-amber-600 text-white"
                >
                  {carregandoNotas ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Carregando...
                    </>
                  ) : (
                    <>
                      <Filter className="h-4 w-4 mr-2" />
                      Filtrar
                    </>
                  )}
                </Button>
              </div>
            </div>
          </Card>

          {/* Lista de Notas Fiscais */}
          {carregandoNotas ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
            </div>
          ) : notasFiltradas.length === 0 ? (
            <Card className="p-8 bg-zinc-900 border-amber-500/20">
              <div className="text-center text-gray-400">
                <FileText className="h-12 w-12 mx-auto mb-4 text-gray-500" />
                <p>Nenhuma nota fiscal encontrada</p>
              </div>
            </Card>
          ) : (
            <div className="space-y-4">
              {notasFiltradas.map((nota) => {
                const statusColor = {
                  pendente: 'text-yellow-500',
                  emitida: 'text-green-500',
                  cancelada: 'text-red-500',
                  rejeitada: 'text-red-500'
                }[nota.status] || 'text-gray-400'

                return (
                  <Card key={nota.id} className="p-6 bg-zinc-900 border-amber-500/20">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="font-mono text-amber-500 font-bold text-lg">
                            NFe {nota.numero}/{nota.serie}
                          </span>
                          <span className={`text-sm font-medium ${statusColor}`}>
                            {nota.status.toUpperCase()}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm mb-3">
                          <div>
                            <span className="text-gray-400">Venda:</span>
                            <p className="text-white font-medium">{nota.venda_ticket}</p>
                          </div>
                          <div>
                            <span className="text-gray-400">Data de Emissão:</span>
                            <p className="text-white font-medium">{formatarData(nota.created_at)}</p>
                          </div>
                          <div>
                            <span className="text-gray-400">Cliente:</span>
                            <p className="text-white font-medium">{nota.cliente_nome || 'Cliente não cadastrado'}</p>
                          </div>
                          <div>
                            <span className="text-gray-400">Valor:</span>
                            <p className="text-white font-bold">{formatarPreco(nota.venda_valor)}</p>
                          </div>
                          {nota.chave_acesso && (
                            <div className="md:col-span-2">
                              <span className="text-gray-400">Chave de Acesso:</span>
                              <p className="text-white font-mono text-xs break-all">{nota.chave_acesso}</p>
                            </div>
                          )}
                          {nota.numero_romaneio && (
                            <div>
                              <span className="text-gray-400">Romaneio:</span>
                              <p className="text-white font-medium">{nota.numero_romaneio}</p>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="ml-4 flex flex-col gap-2">
                        {nota.xml_path && (
                          <Button
                            onClick={() => {
                              const apiUrl = getApiBaseUrl()
                              const adminData = localStorage.getItem('admin')
                              const admin = adminData ? JSON.parse(adminData) : null
                              const headers: HeadersInit = {}
                              if (admin?.id) {
                                headers['x-user-id'] = admin.id
                                headers['x-user-tipo'] = admin.tipo_usuario || 'administrativo'
                                headers['x-user-nome'] = admin.nome_completo || null
                              }
                              window.open(`${apiUrl}/api/v1/emissao-nfe/notas-fiscais/${nota.id}/download?tipo=xml`, '_blank')
                            }}
                            variant="outline"
                            className="border-amber-500/20 text-gray-300 hover:bg-amber-500/10"
                          >
                            <Download className="h-4 w-4 mr-2" />
                            XML
                          </Button>
                        )}
                        {nota.pdf_path && (
                          <Button
                            onClick={() => {
                              const apiUrl = getApiBaseUrl()
                              const adminData = localStorage.getItem('admin')
                              const admin = adminData ? JSON.parse(adminData) : null
                              const headers: HeadersInit = {}
                              if (admin?.id) {
                                headers['x-user-id'] = admin.id
                                headers['x-user-tipo'] = admin.tipo_usuario || 'administrativo'
                                headers['x-user-nome'] = admin.nome_completo || null
                              }
                              window.open(`${apiUrl}/api/v1/emissao-nfe/notas-fiscais/${nota.id}/download?tipo=pdf`, '_blank')
                            }}
                            variant="outline"
                            className="border-amber-500/20 text-gray-300 hover:bg-amber-500/10"
                          >
                            <Download className="h-4 w-4 mr-2" />
                            PDF
                          </Button>
                        )}
                        {!nota.xml_path && !nota.pdf_path && (
                          <span className="text-xs text-gray-500">Arquivos não disponíveis</span>
                        )}
                      </div>
                    </div>
                  </Card>
                )
              })}
            </div>
          )}
        </>
      )}

      {/* Modal Emitir Nota Fiscal */}
      <Dialog open={mostrarModalEmitir} onOpenChange={setMostrarModalEmitir}>
        <DialogContent className="bg-zinc-900 border-amber-500/20 text-gray-300 max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-gray-300">Emitir Nota Fiscal</DialogTitle>
            <DialogDescription className="text-gray-400">
              Venda {vendaSelecionada?.ticket}
            </DialogDescription>
          </DialogHeader>

          {vendaSelecionada && (
            <div className="space-y-4 mt-4">
              {/* Dados da Venda */}
              <div className="p-4 bg-zinc-800/50 rounded-lg">
                <h4 className="font-semibold text-white mb-3">Dados da Venda</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-400">Ticket:</span>
                    <p className="text-white font-medium">{vendaSelecionada.ticket}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Data:</span>
                    <p className="text-white font-medium">{formatarData(vendaSelecionada.data_venda)}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Cliente:</span>
                    <p className="text-white font-medium">{vendaSelecionada.cliente_nome || 'Cliente não cadastrado'}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Valor Total:</span>
                    <p className="text-white font-bold">{formatarPreco(vendaSelecionada.valor_liquido)}</p>
                  </div>
                </div>
              </div>

              {/* Dados do Emitente */}
              {emitente && (
                <div className="p-4 bg-zinc-800/50 rounded-lg">
                  <h4 className="font-semibold text-white mb-3">Emitente</h4>
                  <div className="text-sm">
                    <p className="text-white font-medium">{emitente.nome_empresarial}</p>
                    <p className="text-gray-400">CNPJ: {formatarCPFCNPJ(emitente.cnpj)}</p>
                  </div>
                </div>
              )}

              {/* Dados do Destinatário */}
              <div className="p-4 bg-zinc-800/50 rounded-lg">
                <h4 className="font-semibold text-white mb-3">Destinatário</h4>
                <div className="text-sm space-y-1">
                  <p className="text-white font-medium">
                    {vendaSelecionada.cliente_nome || 'Cliente não cadastrado'}
                  </p>
                  {vendaSelecionada.cliente_cpf_cnpj && (
                    <p className="text-gray-400">
                      {vendaSelecionada.cliente_cpf_cnpj.length === 11 ? 'CPF' : 'CNPJ'}: {formatarCPFCNPJ(vendaSelecionada.cliente_cpf_cnpj)}
                    </p>
                  )}
                  {vendaSelecionada.endereco_rua && (
                    <p className="text-gray-400 text-xs">
                      {vendaSelecionada.endereco_rua}, {vendaSelecionada.endereco_numero}
                      {vendaSelecionada.endereco_complemento ? ` - ${vendaSelecionada.endereco_complemento}` : ''}
                      {vendaSelecionada.endereco_bairro ? ` - ${vendaSelecionada.endereco_bairro}` : ''}
                      {vendaSelecionada.endereco_cidade ? ` - ${vendaSelecionada.endereco_cidade}/${vendaSelecionada.endereco_estado}` : ''}
                      {vendaSelecionada.endereco_cep ? ` - CEP: ${vendaSelecionada.endereco_cep}` : ''}
                    </p>
                  )}
                </div>
              </div>

              {/* Descrição Padrão */}
              <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                <h4 className="font-semibold text-amber-400 mb-2">Descrição do Serviço</h4>
                <p className="text-sm text-gray-300">
                  Prestação de serviços congeneres ao relacionados a CNAE do emissor
                </p>
              </div>

              {/* Observações */}
              <div>
                <Label htmlFor="observacoes" className="text-gray-300">Observações (Opcional)</Label>
                <Input
                  id="observacoes"
                  type="text"
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                  placeholder="Observações adicionais para a nota fiscal"
                  className="bg-zinc-800 border-amber-500/20 text-gray-300 mt-1 focus:border-amber-500 focus:ring-amber-500/20"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setMostrarModalEmitir(false)
                    setVendaSelecionada(null)
                    setObservacoes('')
                  }}
                  disabled={emitindo}
                  className="border-amber-500/20 text-gray-300 hover:bg-amber-500/10"
                >
                  <X className="h-4 w-4 mr-1" />
                  Cancelar
                </Button>
                <Button
                  onClick={emitirNotaFiscal}
                  disabled={emitindo}
                  className="bg-amber-500 hover:bg-amber-600 text-white"
                >
                  {emitindo ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                      Emitindo...
                    </>
                  ) : (
                    <>
                      <FileCheck className="h-4 w-4 mr-1" />
                      Emitir Nota Fiscal
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

