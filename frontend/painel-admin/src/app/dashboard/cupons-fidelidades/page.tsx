'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Ticket, Gift, Search, Plus, Edit, Trash2, X, Save, Loader2, AlertCircle, CheckCircle2, Percent, DollarSign, Calendar, Users, Hash } from 'lucide-react'
import { usePermissions } from '@/hooks/usePermissions'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface Cupom {
  id: string
  codigo: string
  nome: string
  descricao?: string | null
  tipo_desconto: 'percentual' | 'valor_fixo'
  valor_desconto: number | string
  aplicar_em: 'total' | 'apenas_servicos' | 'apenas_produtos'
  regra_uso: 'unico' | 'limitado' | 'fidelidade'
  limite_usos?: number | null
  regra_fidelidade?: string | null
  quantidade_fidelidade?: number | null
  validade_inicio?: string | null
  validade_fim?: string | null
  is_active: boolean
  total_usos?: number
  created_at: string
  updated_at?: string | null
}

interface Fidelidade {
  id: string
  cliente_id: string
  cliente_nome: string
  cliente_email?: string
  cupom_id: string
  cupom_codigo: string
  cupom_nome: string
  tipo_contagem: string
  quantidade_atual: number
  quantidade_necessaria: number
  cupom_liberado: boolean
  cupom_usado: boolean
  data_liberacao?: string | null
  data_uso?: string | null
  created_at: string
  updated_at?: string | null
}

export default function CuponsFidelidadesPage() {
  const [cupons, setCupons] = useState<Cupom[]>([])
  const [fidelidades, setFidelidades] = useState<Fidelidade[]>([])
  const [cuponsFiltrados, setCuponsFiltrados] = useState<Cupom[]>([])
  const [fidelidadesFiltradas, setFidelidadesFiltradas] = useState<Fidelidade[]>([])
  const [searchTermCupons, setSearchTermCupons] = useState('')
  const [searchTermFidelidades, setSearchTermFidelidades] = useState('')
  const [loading, setLoading] = useState(true)
  const [mostrarModalCupom, setMostrarModalCupom] = useState(false)
  const [modalTipo, setModalTipo] = useState<'criar' | 'editar' | 'excluir' | 'visualizar'>('criar')
  const [cupomSelecionado, setCupomSelecionado] = useState<Cupom | null>(null)
  const [salvando, setSalvando] = useState(false)
  const [mensagem, setMensagem] = useState<{ tipo: 'sucesso' | 'erro' | null; texto: string }>({ tipo: null, texto: '' })
  const { podeAcessar, podeEditar, podeExcluir } = usePermissions()
  const carregandoRef = useRef(false)

  // Formulário de cupom
  const [formData, setFormData] = useState({
    codigo: '',
    nome: '',
    descricao: '',
    tipo_desconto: 'percentual' as 'percentual' | 'valor_fixo',
    valor_desconto: '',
    aplicar_em: 'total' as 'total' | 'apenas_servicos' | 'apenas_produtos',
    regra_uso: 'unico' as 'unico' | 'limitado' | 'fidelidade',
    limite_usos: '',
    regra_fidelidade: '',
    quantidade_fidelidade: '',
    validade_inicio: '',
    validade_fim: '',
    is_active: true,
  })

  const carregarCupons = useCallback(async () => {
    console.log('[Cupons] carregarCupons chamado, carregandoRef.current:', carregandoRef.current)
    if (carregandoRef.current) {
      console.log('[Cupons] Carregamento já em andamento, ignorando...')
      return
    }
    carregandoRef.current = true
    setLoading(true)
    console.log('[Cupons] Iniciando carregamento de cupons...')
    try {
      const adminData = localStorage.getItem('admin')
      const admin = adminData ? JSON.parse(adminData) : null

      const apiUrl = 'https://api6.actusconsultoria.com.br'
      
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      }
      if (admin?.id) {
        headers['x-user-id'] = admin.id
        headers['x-user-tipo'] = admin.tipo_usuario || 'administrativo'
        headers['x-user-nome'] = admin.nome_completo || null
      }

      console.log('[Cupons] Fazendo requisição para:', `${apiUrl}/api/v1/cupons-fidelidades/cupons`)
      const response = await fetch(`${apiUrl}/api/v1/cupons-fidelidades/cupons`, {
        headers,
      })

      console.log('[Cupons] Resposta recebida:', response.status, response.statusText)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('[Cupons] Erro na resposta:', errorText)
        throw new Error('Erro ao carregar cupons')
      }

      const data = await response.json()
      console.log('[Cupons] Dados recebidos do backend:', data)
      const cuponsCarregados = (data.cupons || []).map((cupom: any) => ({
        ...cupom,
        total_usos: cupom.total_usos ? parseInt(String(cupom.total_usos)) : 0
      }))
      console.log('[Cupons] Total de cupons carregados:', cuponsCarregados.length)
      console.log('[Cupons] Cupons:', cuponsCarregados)
      
      setCupons(cuponsCarregados)
      // Atualizar filtro imediatamente após carregar
      setCuponsFiltrados(cuponsCarregados)
      console.log('[Cupons] Estado atualizado - cupons:', cuponsCarregados.length, 'filtrados:', cuponsCarregados.length)
    } catch (error: any) {
      console.error('[Cupons] Erro ao carregar cupons:', error)
      setMensagem({ tipo: 'erro', texto: error.message || 'Erro ao carregar cupons' })
    } finally {
      setLoading(false)
      carregandoRef.current = false
      console.log('[Cupons] Carregamento finalizado')
    }
  }, [])

  const carregarFidelidades = useCallback(async () => {
    try {
      const adminData = localStorage.getItem('admin')
      const admin = adminData ? JSON.parse(adminData) : null

      const apiUrl = 'https://api6.actusconsultoria.com.br'
      
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      }
      if (admin?.id) {
        headers['x-user-id'] = admin.id
        headers['x-user-tipo'] = admin.tipo_usuario || 'administrativo'
        headers['x-user-nome'] = admin.nome_completo || null
      }

      const response = await fetch(`${apiUrl}/api/v1/cupons-fidelidades/fidelidades`, {
        headers,
      })

      if (!response.ok) {
        throw new Error('Erro ao carregar fidelidades')
      }

      const data = await response.json()
      setFidelidades(data.fidelidades || [])
    } catch (error: any) {
      console.error('Erro ao carregar fidelidades:', error)
      setMensagem({ tipo: 'erro', texto: error.message || 'Erro ao carregar fidelidades' })
    }
  }, [])

  const filtrarCupons = useCallback(() => {
    console.log('[Cupons] Filtrando cupons...', 'Total:', cupons.length, 'Termo de busca:', searchTermCupons)
    let filtrados = cupons

    if (searchTermCupons.trim()) {
      const termo = searchTermCupons.toLowerCase()
      filtrados = filtrados.filter(
        (cupom) =>
          cupom.codigo.toLowerCase().includes(termo) ||
          cupom.nome.toLowerCase().includes(termo) ||
          (cupom.descricao && cupom.descricao.toLowerCase().includes(termo))
      )
      console.log('[Cupons] Após filtro:', filtrados.length, 'cupons encontrados')
    }

    console.log('[Cupons] Definindo cupons filtrados:', filtrados.length)
    setCuponsFiltrados(filtrados)
  }, [cupons, searchTermCupons])

  const filtrarFidelidades = useCallback(() => {
    let filtrados = fidelidades

    if (searchTermFidelidades.trim()) {
      const termo = searchTermFidelidades.toLowerCase()
      filtrados = filtrados.filter(
        (fidelidade) =>
          fidelidade.cliente_nome.toLowerCase().includes(termo) ||
          fidelidade.cupom_codigo.toLowerCase().includes(termo) ||
          fidelidade.cupom_nome.toLowerCase().includes(termo)
      )
    }

    setFidelidadesFiltradas(filtrados)
  }, [fidelidades, searchTermFidelidades])

  useEffect(() => {
    console.log('[Cupons] useEffect inicial executado')
    
    // Verificar se é master direto do localStorage
    const adminData = localStorage.getItem('admin')
    const admin = adminData ? JSON.parse(adminData) : null
    const isMaster = admin?.tipo_usuario === 'master'
    
    console.log('[Cupons] Admin data:', { id: admin?.id, tipo: admin?.tipo_usuario, isMaster })
    console.log('[Cupons] podeAcessar:', podeAcessar('cupons_fidelidades'))
    
    const podeAcessarModulo = isMaster || podeAcessar('cupons_fidelidades')
    
    if (podeAcessarModulo) {
      console.log('[Cupons] Carregando cupons e fidelidades...')
      carregarCupons().catch(err => console.error('[Cupons] Erro ao carregar cupons no useEffect:', err))
      carregarFidelidades().catch(err => console.error('[Cupons] Erro ao carregar fidelidades no useEffect:', err))
    } else {
      console.warn('[Cupons] Sem permissão para acessar módulo')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    filtrarCupons()
  }, [filtrarCupons])

  useEffect(() => {
    filtrarFidelidades()
  }, [filtrarFidelidades])

  const abrirModalCupom = (tipo: 'criar' | 'editar' | 'excluir' | 'visualizar', cupom?: Cupom) => {
    setModalTipo(tipo)
    setCupomSelecionado(cupom || null)
    
    if (tipo === 'criar') {
      setFormData({
        codigo: '',
        nome: '',
        descricao: '',
        tipo_desconto: 'percentual',
        valor_desconto: '',
        aplicar_em: 'total',
        regra_uso: 'unico',
        limite_usos: '',
        regra_fidelidade: '',
        quantidade_fidelidade: '',
        validade_inicio: '',
        validade_fim: '',
        is_active: true,
      })
    } else if (cupom) {
      setFormData({
        codigo: cupom.codigo,
        nome: cupom.nome,
        descricao: cupom.descricao || '',
        tipo_desconto: cupom.tipo_desconto,
        valor_desconto: String(cupom.valor_desconto),
        aplicar_em: cupom.aplicar_em,
        regra_uso: cupom.regra_uso,
        limite_usos: cupom.limite_usos ? String(cupom.limite_usos) : '',
        regra_fidelidade: cupom.regra_fidelidade || '',
        quantidade_fidelidade: cupom.quantidade_fidelidade ? String(cupom.quantidade_fidelidade) : '',
        validade_inicio: cupom.validade_inicio || '',
        validade_fim: cupom.validade_fim || '',
        is_active: cupom.is_active,
      })
    }
    
    setMostrarModalCupom(true)
  }

  const fecharModalCupom = () => {
    setMostrarModalCupom(false)
    setCupomSelecionado(null)
  }

  const salvarCupom = async () => {
    setSalvando(true)
    try {
      const adminData = localStorage.getItem('admin')
      const admin = adminData ? JSON.parse(adminData) : null

      const apiUrl = 'https://api6.actusconsultoria.com.br'
      
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      }
      if (admin?.id) {
        headers['x-user-id'] = admin.id
        headers['x-user-tipo'] = admin.tipo_usuario || 'administrativo'
        headers['x-user-nome'] = admin.nome_completo || null
      }

      const body: any = {
        codigo: formData.codigo.toUpperCase(),
        nome: formData.nome,
        descricao: formData.descricao || null,
        tipo_desconto: formData.tipo_desconto,
        valor_desconto: parseFloat(formData.valor_desconto) || 0,
        aplicar_em: formData.aplicar_em,
        regra_uso: formData.regra_uso,
        limite_usos: formData.regra_uso === 'limitado' ? parseInt(formData.limite_usos) || null : null,
        regra_fidelidade: formData.regra_uso === 'fidelidade' ? formData.regra_fidelidade || null : null,
        quantidade_fidelidade: formData.regra_uso === 'fidelidade' ? parseInt(formData.quantidade_fidelidade) || null : null,
        validade_inicio: formData.validade_inicio || null,
        validade_fim: formData.validade_fim || null,
        is_active: formData.is_active,
      }

      let response
      if (modalTipo === 'criar') {
        response = await fetch(`${apiUrl}/api/v1/cupons-fidelidades/cupons`, {
          method: 'POST',
          headers,
          body: JSON.stringify(body),
        })
      } else {
        response = await fetch(`${apiUrl}/api/v1/cupons-fidelidades/cupons/${cupomSelecionado?.id}`, {
          method: 'PUT',
          headers,
          body: JSON.stringify(body),
        })
      }

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao salvar cupom')
      }

      setMensagem({ tipo: 'sucesso', texto: `Cupom ${modalTipo === 'criar' ? 'criado' : 'atualizado'} com sucesso!` })
      fecharModalCupom()
      
      // Resetar ref para permitir recarregamento
      console.log('[Cupons] Recarregando cupons após salvar...')
      carregandoRef.current = false
      await carregarCupons()
      console.log('[Cupons] Recarregamento concluído')
      
      setTimeout(() => {
        setMensagem({ tipo: null, texto: '' })
      }, 3000)
    } catch (error: any) {
      console.error('Erro ao salvar cupom:', error)
      setMensagem({ tipo: 'erro', texto: error.message || 'Erro ao salvar cupom' })
    } finally {
      setSalvando(false)
    }
  }

  const excluirCupom = async () => {
    if (!cupomSelecionado) return

    setSalvando(true)
    try {
      const adminData = localStorage.getItem('admin')
      const admin = adminData ? JSON.parse(adminData) : null

      const apiUrl = 'https://api6.actusconsultoria.com.br'
      
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      }
      if (admin?.id) {
        headers['x-user-id'] = admin.id
        headers['x-user-tipo'] = admin.tipo_usuario || 'administrativo'
        headers['x-user-nome'] = admin.nome_completo || null
      }

      const response = await fetch(`${apiUrl}/api/v1/cupons-fidelidades/cupons/${cupomSelecionado.id}`, {
        method: 'DELETE',
        headers,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao excluir cupom')
      }

      setMensagem({ tipo: 'sucesso', texto: 'Cupom excluído com sucesso!' })
      fecharModalCupom()
      
      // Resetar ref para permitir recarregamento
      carregandoRef.current = false
      await carregarCupons()
      
      setTimeout(() => {
        setMensagem({ tipo: null, texto: '' })
      }, 3000)
    } catch (error: any) {
      console.error('Erro ao excluir cupom:', error)
      setMensagem({ tipo: 'erro', texto: error.message || 'Erro ao excluir cupom' })
    } finally {
      setSalvando(false)
    }
  }

  const formatarPreco = (valor: number | string) => {
    const num = typeof valor === 'string' ? parseFloat(valor) : valor
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(num)
  }

  const formatarData = (data: string | null | undefined) => {
    if (!data) return '-'
    return new Date(data).toLocaleDateString('pt-BR')
  }

  const formatarPercentual = (valor: number | string) => {
    const num = typeof valor === 'string' ? parseFloat(valor) : valor
    return `${num}%`
  }

  // Verificar se é master direto do localStorage
  const adminData = typeof window !== 'undefined' ? localStorage.getItem('admin') : null
  const admin = adminData ? JSON.parse(adminData) : null
  const isMaster = admin?.tipo_usuario === 'master'
  const temAcesso = isMaster || podeAcessar('cupons_fidelidades')

  if (!temAcesso) {
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
          <Ticket className="h-8 w-8 text-amber-500" />
          Cupons e Fidelidades
        </h1>
        <p className="text-gray-400 mt-1">Gerenciamento de cupons de desconto e programa de fidelidade</p>
      </div>

      {/* Mensagens */}
      <AnimatePresence>
        {mensagem.tipo && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`p-4 rounded-lg flex items-center gap-2 ${
              mensagem.tipo === 'sucesso' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'
            }`}
          >
            {mensagem.tipo === 'sucesso' ? <CheckCircle2 className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
            <span>{mensagem.texto}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tabs */}
      <Tabs defaultValue="cupons" className="space-y-6">
        <TabsList className="bg-zinc-800 border border-amber-500/20">
          <TabsTrigger value="cupons" className="data-[state=active]:bg-amber-500/10 data-[state=active]:text-amber-500">
            <Ticket className="h-4 w-4 mr-2" />
            Cupons
          </TabsTrigger>
          <TabsTrigger value="fidelidades" className="data-[state=active]:bg-amber-500/10 data-[state=active]:text-amber-500">
            <Gift className="h-4 w-4 mr-2" />
            Fidelidades
          </TabsTrigger>
        </TabsList>

        {/* Aba Cupons */}
        <TabsContent value="cupons" className="space-y-6">
          <Card className="bg-zinc-900 border-amber-500/20">
            <div className="p-6">
              {/* Barra de busca e botão criar */}
              <div className="flex items-center justify-between mb-6">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Buscar cupons..."
                    value={searchTermCupons}
                    onChange={(e) => setSearchTermCupons(e.target.value)}
                    className="pl-10 bg-zinc-800 border-amber-500/20 text-gray-300 focus:border-amber-500"
                  />
                </div>
                {podeEditar('cupons_fidelidades') && (
                  <Button
                    onClick={() => abrirModalCupom('criar')}
                    className="bg-amber-500 hover:bg-amber-600 text-white"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Novo Cupom
                  </Button>
                )}
              </div>

              {/* Lista de cupons */}
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
                </div>
              ) : cuponsFiltrados.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <Ticket className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhum cupom encontrado</p>
                  <p className="text-xs mt-2 text-gray-500">
                    Total de cupons no estado: {cupons.length} | Filtrados: {cuponsFiltrados.length} | Busca: "{searchTermCupons}"
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {cuponsFiltrados.map((cupom) => (
                    <motion.div
                      key={cupom.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-zinc-800 border border-amber-500/20 rounded-lg p-4 hover:border-amber-500/40 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Hash className="h-4 w-4 text-amber-500" />
                            <span className="font-bold text-white">{cupom.codigo}</span>
                            {!cupom.is_active && (
                              <span className="text-xs px-2 py-1 bg-red-500/20 text-red-500 rounded">Inativo</span>
                            )}
                          </div>
                          <h3 className="text-lg font-semibold text-white mb-1">{cupom.nome}</h3>
                          {cupom.descricao && (
                            <p className="text-sm text-gray-400 mb-2">{cupom.descricao}</p>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 text-sm">
                          {cupom.tipo_desconto === 'percentual' ? (
                            <>
                              <Percent className="h-4 w-4 text-amber-500" />
                              <span className="text-gray-300">Desconto: {formatarPercentual(cupom.valor_desconto)}</span>
                            </>
                          ) : (
                            <>
                              <DollarSign className="h-4 w-4 text-amber-500" />
                              <span className="text-gray-300">Desconto: {formatarPreco(cupom.valor_desconto)}</span>
                            </>
                          )}
                        </div>
                        <div className="text-sm text-gray-400">
                          Aplicar em: {cupom.aplicar_em === 'total' ? 'Total' : cupom.aplicar_em === 'apenas_servicos' ? 'Apenas Serviços' : 'Apenas Produtos'}
                        </div>
                        <div className="text-sm text-gray-400">
                          Regra: {cupom.regra_uso === 'unico' ? 'Uso Único' : cupom.regra_uso === 'limitado' ? `Limitado (${cupom.limite_usos}x)` : 'Fidelidade'}
                        </div>
                        {cupom.total_usos !== undefined && (
                          <div className="text-sm text-gray-400">
                            Usos: {cupom.total_usos}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {podeEditar('cupons_fidelidades') && (
                          <Button
                            onClick={() => abrirModalCupom('editar', cupom)}
                            variant="outline"
                            size="sm"
                            className="flex-1 border-amber-500/20 text-amber-500 hover:bg-amber-500/10"
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Editar
                          </Button>
                        )}
                        {podeExcluir('cupons_fidelidades') && (
                          <Button
                            onClick={() => abrirModalCupom('excluir', cupom)}
                            variant="outline"
                            size="sm"
                            className="flex-1 border-red-500/20 text-red-500 hover:bg-red-500/10"
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Excluir
                          </Button>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        </TabsContent>

        {/* Aba Fidelidades */}
        <TabsContent value="fidelidades" className="space-y-6">
          <Card className="bg-zinc-900 border-amber-500/20">
            <div className="p-6">
              {/* Barra de busca */}
              <div className="relative max-w-md mb-6">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Buscar fidelidades..."
                  value={searchTermFidelidades}
                  onChange={(e) => setSearchTermFidelidades(e.target.value)}
                  className="pl-10 bg-zinc-800 border-amber-500/20 text-gray-300 focus:border-amber-500"
                />
              </div>

              {/* Lista de fidelidades */}
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
                </div>
              ) : fidelidadesFiltradas.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <Gift className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhuma fidelidade encontrada</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {fidelidadesFiltradas.map((fidelidade) => {
                    const percentual = fidelidade.quantidade_necessaria > 0 
                      ? Math.round((fidelidade.quantidade_atual / fidelidade.quantidade_necessaria) * 100)
                      : 0

                    return (
                      <motion.div
                        key={fidelidade.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-zinc-800 border border-amber-500/20 rounded-lg p-4"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Users className="h-5 w-5 text-amber-500" />
                              <h3 className="text-lg font-semibold text-white">{fidelidade.cliente_nome}</h3>
                            </div>
                            <div className="text-sm text-gray-400 mb-1">
                              Cupom: <span className="text-amber-500 font-semibold">{fidelidade.cupom_codigo}</span> - {fidelidade.cupom_nome}
                            </div>
                            {fidelidade.cliente_email && (
                              <div className="text-sm text-gray-400">{fidelidade.cliente_email}</div>
                            )}
                          </div>
                          <div className="text-right">
                            {fidelidade.cupom_liberado && !fidelidade.cupom_usado && (
                              <span className="text-xs px-2 py-1 bg-green-500/20 text-green-500 rounded">Liberado</span>
                            )}
                            {fidelidade.cupom_usado && (
                              <span className="text-xs px-2 py-1 bg-gray-500/20 text-gray-400 rounded">Usado</span>
                            )}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-400">Progresso:</span>
                            <span className="text-white font-semibold">
                              {fidelidade.quantidade_atual} / {fidelidade.quantidade_necessaria}
                            </span>
                          </div>
                          <div className="w-full bg-zinc-700 rounded-full h-2">
                            <div
                              className="bg-amber-500 h-2 rounded-full transition-all"
                              style={{ width: `${Math.min(percentual, 100)}%` }}
                            />
                          </div>
                          <div className="text-xs text-gray-400">
                            {percentual}% completo
                          </div>
                          {fidelidade.data_liberacao && (
                            <div className="text-sm text-gray-400">
                              Liberado em: {formatarData(fidelidade.data_liberacao)}
                            </div>
                          )}
                          {fidelidade.data_uso && (
                            <div className="text-sm text-gray-400">
                              Usado em: {formatarData(fidelidade.data_uso)}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              )}
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modal de Cupom */}
      <Dialog open={mostrarModalCupom} onOpenChange={setMostrarModalCupom}>
        <DialogContent className="bg-zinc-900 border-amber-500/20 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">
              {modalTipo === 'criar' && 'Novo Cupom'}
              {modalTipo === 'editar' && 'Editar Cupom'}
              {modalTipo === 'excluir' && 'Excluir Cupom'}
              {modalTipo === 'visualizar' && 'Visualizar Cupom'}
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              {modalTipo === 'criar' && 'Preencha os dados para criar um novo cupom'}
              {modalTipo === 'editar' && 'Altere os dados do cupom'}
              {modalTipo === 'excluir' && 'Tem certeza que deseja excluir este cupom?'}
              {modalTipo === 'visualizar' && 'Detalhes do cupom'}
            </DialogDescription>
          </DialogHeader>

          {modalTipo === 'excluir' ? (
            <div className="space-y-4">
              <p className="text-gray-300">
                O cupom <strong>{cupomSelecionado?.codigo}</strong> será excluído permanentemente.
                {cupomSelecionado?.total_usos && cupomSelecionado.total_usos > 0 && (
                  <span className="block mt-2 text-red-500">
                    Atenção: Este cupom já foi usado {cupomSelecionado.total_usos} vez(es) e não pode ser excluído.
                  </span>
                )}
              </p>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={fecharModalCupom} className="border-gray-600 text-gray-300">
                  Cancelar
                </Button>
                <Button
                  onClick={excluirCupom}
                  disabled={salvando || (cupomSelecionado?.total_usos && cupomSelecionado.total_usos > 0)}
                  className="bg-red-500 hover:bg-red-600 text-white"
                >
                  {salvando ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Trash2 className="h-4 w-4 mr-2" />}
                  Excluir
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="codigo" className="text-gray-300">Código *</Label>
                  <Input
                    id="codigo"
                    value={formData.codigo}
                    onChange={(e) => setFormData({ ...formData, codigo: e.target.value.toUpperCase() })}
                    placeholder="Ex: DESCONTO10"
                    className="bg-zinc-800 border-amber-500/20 text-gray-300"
                    disabled={modalTipo === 'visualizar'}
                  />
                </div>
                <div>
                  <Label htmlFor="nome" className="text-gray-300">Nome *</Label>
                  <Input
                    id="nome"
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    placeholder="Ex: Desconto de 10%"
                    className="bg-zinc-800 border-amber-500/20 text-gray-300"
                    disabled={modalTipo === 'visualizar'}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="descricao" className="text-gray-300">Descrição</Label>
                <Input
                  id="descricao"
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  placeholder="Descrição do cupom"
                  className="bg-zinc-800 border-amber-500/20 text-gray-300"
                  disabled={modalTipo === 'visualizar'}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="tipo_desconto" className="text-gray-300">Tipo de Desconto *</Label>
                  <Select
                    value={formData.tipo_desconto}
                    onValueChange={(value: 'percentual' | 'valor_fixo') => setFormData({ ...formData, tipo_desconto: value })}
                    disabled={modalTipo === 'visualizar'}
                  >
                    <SelectTrigger className="bg-zinc-800 border-amber-500/20 text-gray-300">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-800 border-amber-500/20">
                      <SelectItem value="percentual" className="text-gray-300 hover:bg-zinc-700">Percentual (%)</SelectItem>
                      <SelectItem value="valor_fixo" className="text-gray-300 hover:bg-zinc-700">Valor Fixo (R$)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="valor_desconto" className="text-gray-300">Valor do Desconto *</Label>
                  <Input
                    id="valor_desconto"
                    type="number"
                    step="0.01"
                    min="0"
                    max={formData.tipo_desconto === 'percentual' ? '100' : undefined}
                    value={formData.valor_desconto}
                    onChange={(e) => setFormData({ ...formData, valor_desconto: e.target.value })}
                    placeholder={formData.tipo_desconto === 'percentual' ? 'Ex: 10' : 'Ex: 50.00'}
                    className="bg-zinc-800 border-amber-500/20 text-gray-300"
                    disabled={modalTipo === 'visualizar'}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="aplicar_em" className="text-gray-300">Aplicar em *</Label>
                <Select
                  value={formData.aplicar_em}
                  onValueChange={(value: 'total' | 'apenas_servicos' | 'apenas_produtos') => setFormData({ ...formData, aplicar_em: value })}
                  disabled={modalTipo === 'visualizar'}
                >
                  <SelectTrigger className="bg-zinc-800 border-amber-500/20 text-gray-300">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-800 border-amber-500/20">
                    <SelectItem value="total" className="text-gray-300 hover:bg-zinc-700">Total (Serviços + Produtos)</SelectItem>
                    <SelectItem value="apenas_servicos" className="text-gray-300 hover:bg-zinc-700">Apenas Serviços</SelectItem>
                    <SelectItem value="apenas_produtos" className="text-gray-300 hover:bg-zinc-700">Apenas Produtos</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="regra_uso" className="text-gray-300">Regra de Uso *</Label>
                <Select
                  value={formData.regra_uso}
                  onValueChange={(value: 'unico' | 'limitado' | 'fidelidade') => setFormData({ ...formData, regra_uso: value })}
                  disabled={modalTipo === 'visualizar'}
                >
                  <SelectTrigger className="bg-zinc-800 border-amber-500/20 text-gray-300">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-800 border-amber-500/20">
                    <SelectItem value="unico" className="text-gray-300 hover:bg-zinc-700">Uso Único (1x)</SelectItem>
                    <SelectItem value="limitado" className="text-gray-300 hover:bg-zinc-700">Limitado (N vezes)</SelectItem>
                    <SelectItem value="fidelidade" className="text-gray-300 hover:bg-zinc-700">Fidelidade</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.regra_uso === 'limitado' && (
                <div>
                  <Label htmlFor="limite_usos" className="text-gray-300">Limite de Usos *</Label>
                  <Input
                    id="limite_usos"
                    type="number"
                    min="1"
                    value={formData.limite_usos}
                    onChange={(e) => setFormData({ ...formData, limite_usos: e.target.value })}
                    placeholder="Ex: 10"
                    className="bg-zinc-800 border-amber-500/20 text-gray-300"
                    disabled={modalTipo === 'visualizar'}
                  />
                </div>
              )}

              {formData.regra_uso === 'fidelidade' && (
                <>
                  <div>
                    <Label htmlFor="regra_fidelidade" className="text-gray-300">Regra de Fidelidade *</Label>
                    <Select
                      value={formData.regra_fidelidade}
                      onValueChange={(value) => setFormData({ ...formData, regra_fidelidade: value })}
                      disabled={modalTipo === 'visualizar'}
                    >
                      <SelectTrigger className="bg-zinc-800 border-amber-500/20 text-gray-300">
                        <SelectValue placeholder="Selecione a regra" />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-800 border-amber-500/20">
                        <SelectItem value="compras_servicos" className="text-gray-300 hover:bg-zinc-700">Compras de Serviços</SelectItem>
                        <SelectItem value="compras_produtos" className="text-gray-300 hover:bg-zinc-700">Compras de Produtos</SelectItem>
                        <SelectItem value="compras_total" className="text-gray-300 hover:bg-zinc-700">Compras Totais</SelectItem>
                        <SelectItem value="pagamento_online" className="text-gray-300 hover:bg-zinc-700">Pagamento Online</SelectItem>
                        <SelectItem value="agendamento_pago" className="text-gray-300 hover:bg-zinc-700">Agendamento Pago</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="quantidade_fidelidade" className="text-gray-300">Quantidade Necessária *</Label>
                    <Input
                      id="quantidade_fidelidade"
                      type="number"
                      min="1"
                      value={formData.quantidade_fidelidade}
                      onChange={(e) => setFormData({ ...formData, quantidade_fidelidade: e.target.value })}
                      placeholder="Ex: 10"
                      className="bg-zinc-800 border-amber-500/20 text-gray-300"
                      disabled={modalTipo === 'visualizar'}
                    />
                  </div>
                </>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="validade_inicio" className="text-gray-300">Data de Início</Label>
                  <Input
                    id="validade_inicio"
                    type="date"
                    value={formData.validade_inicio}
                    onChange={(e) => setFormData({ ...formData, validade_inicio: e.target.value })}
                    className="bg-zinc-800 border-amber-500/20 text-gray-300"
                    disabled={modalTipo === 'visualizar'}
                  />
                </div>
                <div>
                  <Label htmlFor="validade_fim" className="text-gray-300">Data de Fim</Label>
                  <Input
                    id="validade_fim"
                    type="date"
                    value={formData.validade_fim}
                    onChange={(e) => setFormData({ ...formData, validade_fim: e.target.value })}
                    className="bg-zinc-800 border-amber-500/20 text-gray-300"
                    disabled={modalTipo === 'visualizar'}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-4 h-4 text-amber-500 bg-zinc-800 border-amber-500/20 rounded focus:ring-amber-500"
                  disabled={modalTipo === 'visualizar'}
                />
                <Label htmlFor="is_active" className="text-gray-300 cursor-pointer">Cupom ativo</Label>
              </div>

              {modalTipo !== 'visualizar' && (
                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={fecharModalCupom} className="border-gray-600 text-gray-300">
                    Cancelar
                  </Button>
                  <Button
                    onClick={salvarCupom}
                    disabled={salvando}
                    className="bg-amber-500 hover:bg-amber-600 text-white"
                  >
                    {salvando ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Salvando...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Salvar
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

