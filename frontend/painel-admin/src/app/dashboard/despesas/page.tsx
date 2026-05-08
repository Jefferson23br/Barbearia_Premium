'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { TrendingDown, Search, Calendar, DollarSign, CheckCircle2, AlertCircle, X, Save, Loader2, Filter, CheckSquare, Square, Wallet, Edit, Building2 } from 'lucide-react'
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

interface DespesaParcela {
  id: string
  despesa_id: string
  numero_parcela: number
  ticket_parcela: string
  valor: number | string
  data_vencimento: string
  data_pagamento?: string | null
  valor_pago: number | string
  forma_pagamento: string
  caixa_id?: string | null
  status: string
}

interface Despesa {
  id: string
  ticket: string
  data_emissao: string
  data_vencimento: string
  data_pagamento?: string | null
  fornecedor: string
  descricao: string
  categoria_custo_id?: string | null
  categoria_custo_nome?: string | null
  valor_bruto: number | string
  valor_liquido: number | string
  forma_pagamento: string
  numero_parcelas: number
  caixa_id?: string | null
  caixa_nome?: string | null
  status: string
  observacoes?: string | null
  parcelas?: DespesaParcela[]
}

interface Conta {
  id: string
  nome: string
  saldo_atual: number | string
}

export default function DespesasPage() {
  const [despesas, setDespesas] = useState<Despesa[]>([])
  const [despesasFiltradas, setDespesasFiltradas] = useState<Despesa[]>([])
  const [contas, setContas] = useState<Conta[]>([])
  const [loading, setLoading] = useState(false)
  const [salvando, setSalvando] = useState(false)
  const [mensagem, setMensagem] = useState<{ tipo: 'sucesso' | 'erro' | null; texto: string }>({ tipo: null, texto: '' })
  const { podeAcessar, podeEditar } = usePermissions()

  // Filtros
  const [filtros, setFiltros] = useState({
    status: 'all',
    data_vencimento_inicio: '',
    data_vencimento_fim: '',
    forma_pagamento: 'all',
    fornecedor: '',
    categoria_custo_id: 'all',
    search: '',
  })

  // Seleção para pagamento em lote
  const [parcelasSelecionadas, setParcelasSelecionadas] = useState<Set<string>>(new Set())
  const [mostrarModalPagamento, setMostrarModalPagamento] = useState(false)
  const [mostrarModalPagamentoLote, setMostrarModalPagamentoLote] = useState(false)
  const [mostrarModalEditarPagamento, setMostrarModalEditarPagamento] = useState(false)
  const [parcelaPagando, setParcelaPagando] = useState<{ parcela: DespesaParcela; despesa: Despesa } | null>(null)

  // Formulário de pagamento
  const [formDataPagamento, setFormDataPagamento] = useState({
    caixa_id: '',
    data_pagamento: new Date().toISOString().split('T')[0],
    valor_pago: '',
  })

  // Refs
  const carregandoRef = useRef(false)
  const dadosCarregadosRef = useRef(false)

  // Carregar dados iniciais apenas uma vez
  useEffect(() => {
    const carregarDados = async () => {
      if (dadosCarregadosRef.current) return
      if (carregandoRef.current) return

      dadosCarregadosRef.current = true
      await carregarContas()
      await carregarDespesasSemFiltros()
    }

    const timer = setTimeout(() => {
      carregarDados()
    }, 100)

    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Aplicar filtros locais quando despesas ou busca mudarem
  useEffect(() => {
    let filtradas = [...despesas]
    
    // Filtro de busca (ticket, fornecedor ou descrição)
    if (filtros.search) {
      const termo = filtros.search.toLowerCase()
      filtradas = filtradas.filter(d =>
        (d.ticket && d.ticket.toLowerCase().includes(termo)) ||
        (d.fornecedor && d.fornecedor.toLowerCase().includes(termo)) ||
        (d.descricao && d.descricao.toLowerCase().includes(termo))
      )
    }
    
    setDespesasFiltradas(filtradas)
  }, [despesas, filtros.search])

  // Recarregar quando filtros do backend mudarem
  useEffect(() => {
    if (!podeAcessar('despesas')) return
    if (!dadosCarregadosRef.current) return
    if (carregandoRef.current) return

    const temFiltrosBackend = filtros.status !== 'all' || filtros.data_vencimento_inicio || filtros.data_vencimento_fim || filtros.forma_pagamento !== 'all' || filtros.fornecedor || filtros.categoria_custo_id !== 'all'
    if (temFiltrosBackend) {
      carregarDespesas()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtros.status, filtros.data_vencimento_inicio, filtros.data_vencimento_fim, filtros.forma_pagamento, filtros.fornecedor, filtros.categoria_custo_id])

  const carregarDespesasSemFiltros = useCallback(async () => {
    if (carregandoRef.current) return

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

      const response = await fetch(`${apiUrl}/api/v1/despesas`, { headers })

      if (!response.ok) {
        throw new Error(`Erro ao carregar despesas: ${response.status}`)
      }

      const data = await response.json()
      const despesasCarregadas = data.despesas || []
      setDespesas(despesasCarregadas)
    } catch (error: any) {
      console.error('Erro ao carregar despesas:', error)
      setMensagem({ tipo: 'erro', texto: error.message || 'Erro ao carregar despesas' })
    } finally {
      setLoading(false)
      carregandoRef.current = false
    }
  }, [])

  const carregarDespesas = useCallback(async () => {
    if (carregandoRef.current) return

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

      const queryParams = new URLSearchParams()
      if (filtros.status && filtros.status !== 'all') queryParams.append('status', filtros.status)
      if (filtros.data_vencimento_inicio) queryParams.append('data_vencimento_inicio', filtros.data_vencimento_inicio)
      if (filtros.data_vencimento_fim) queryParams.append('data_vencimento_fim', filtros.data_vencimento_fim)
      if (filtros.forma_pagamento && filtros.forma_pagamento !== 'all') queryParams.append('forma_pagamento', filtros.forma_pagamento)
      if (filtros.fornecedor) queryParams.append('fornecedor', filtros.fornecedor)
      if (filtros.categoria_custo_id && filtros.categoria_custo_id !== 'all') queryParams.append('categoria_custo_id', filtros.categoria_custo_id)

      const response = await fetch(`${apiUrl}/api/v1/despesas?${queryParams.toString()}`, { headers })

      if (!response.ok) {
        throw new Error(`Erro ao carregar despesas: ${response.status}`)
      }

      const data = await response.json()
      const despesasCarregadas = data.despesas || []
      setDespesas(despesasCarregadas)
    } catch (error: any) {
      console.error('Erro ao carregar despesas:', error)
      setMensagem({ tipo: 'erro', texto: error.message || 'Erro ao carregar despesas' })
    } finally {
      setLoading(false)
      carregandoRef.current = false
    }
  }, [filtros.status, filtros.data_vencimento_inicio, filtros.data_vencimento_fim, filtros.forma_pagamento, filtros.fornecedor, filtros.categoria_custo_id])

  const carregarContas = useCallback(async () => {
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

      const response = await fetch(`${apiUrl}/api/v1/caixas/contas?is_active=true`, { headers })
      if (response.ok) {
        const data = await response.json()
        setContas(data.contas || [])
      }
    } catch (error) {
      console.error('Erro ao carregar contas:', error)
    }
  }, [])

  const formatarPreco = (valor: number | string | null | undefined) => {
    if (!valor) return 'R$ 0,00'
    const num = typeof valor === 'string' ? parseFloat(valor) : valor
    if (isNaN(num)) return 'R$ 0,00'
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(num)
  }

  const formatarFormaPagamento = (forma: string) => {
    const formas: { [key: string]: string } = {
      dinheiro: 'Dinheiro',
      pix: 'Pix',
      ted: 'TED',
      cartao_1x: 'Cartão 1x',
      cartao_2x: 'Cartão 2x',
      cartao_3x: 'Cartão 3x',
      cartao_4x: 'Cartão 4x',
      cartao_5x: 'Cartão 5x',
      cartao_6x: 'Cartão 6x',
      cartao_7x: 'Cartão 7x',
      cartao_8x: 'Cartão 8x',
      cartao_9x: 'Cartão 9x',
      cartao_10x: 'Cartão 10x',
      boleto_1x: 'Boleto 1x',
      boleto_2x: 'Boleto 2x',
      boleto_3x: 'Boleto 3x',
      boleto_4x: 'Boleto 4x',
      boleto_5x: 'Boleto 5x',
      boleto_6x: 'Boleto 6x',
      boleto_7x: 'Boleto 7x',
      boleto_8x: 'Boleto 8x',
      boleto_9x: 'Boleto 9x',
      boleto_10x: 'Boleto 10x',
    }
    return formas[forma] || forma
  }

  const getStatusColor = (status: string) => {
    const cores: { [key: string]: string } = {
      pendente: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30',
      paga: 'bg-green-500/10 text-green-500 border-green-500/30',
      vencida: 'bg-red-500/10 text-red-500 border-red-500/30',
      parcial: 'bg-blue-500/10 text-blue-500 border-blue-500/30',
      cancelada: 'bg-gray-500/10 text-gray-500 border-gray-500/30',
    }
    return cores[status] || 'bg-gray-500/10 text-gray-500 border-gray-500/30'
  }

  // Obter todas as parcelas pendentes/vencidas de todas as despesas
  const obterParcelasPendentes = () => {
    const parcelas: { parcela: DespesaParcela; despesa: Despesa }[] = []
    despesasFiltradas.forEach(despesa => {
      despesa.parcelas?.forEach(parcela => {
        if (parcela.status === 'pendente' || parcela.status === 'vencida') {
          parcelas.push({ parcela, despesa })
        }
      })
    })
    return parcelas
  }

  const abrirModalPagamento = (parcela: DespesaParcela, despesa: Despesa) => {
    setParcelaPagando({ parcela, despesa })
    setFormDataPagamento({
      caixa_id: parcela.caixa_id || '',
      data_pagamento: parcela.data_pagamento || new Date().toISOString().split('T')[0],
      valor_pago: parcela.valor.toString(),
    })
    setMostrarModalPagamento(true)
  }

  const abrirModalEditarPagamento = (parcela: DespesaParcela, despesa: Despesa) => {
    setParcelaPagando({ parcela, despesa })
    setFormDataPagamento({
      caixa_id: parcela.caixa_id || '',
      data_pagamento: parcela.data_pagamento || new Date().toISOString().split('T')[0],
      valor_pago: parcela.valor_pago.toString(),
    })
    setMostrarModalEditarPagamento(true)
  }

  const abrirModalPagamentoLote = () => {
    if (parcelasSelecionadas.size === 0) {
      setMensagem({ tipo: 'erro', texto: 'Selecione pelo menos uma parcela' })
      return
    }
    setFormDataPagamento({
      caixa_id: '',
      data_pagamento: new Date().toISOString().split('T')[0],
      valor_pago: '',
    })
    setMostrarModalPagamentoLote(true)
  }

  const efetivarPagamento = async (parcelasParaPagar: { parcela_id: string; valor_pago: number }[]) => {
    if (!formDataPagamento.caixa_id) {
      setMensagem({ tipo: 'erro', texto: 'Selecione o caixa' })
      return
    }

    setSalvando(true)
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

      const response = await fetch(`${apiUrl}/api/v1/despesas/efetivar-pagamento`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          parcelas: parcelasParaPagar,
          caixa_id: formDataPagamento.caixa_id,
          data_pagamento: formDataPagamento.data_pagamento,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao efetivar pagamento')
      }

      setMensagem({ tipo: 'sucesso', texto: data.message || 'Pagamento efetivado com sucesso!' })
      setMostrarModalPagamento(false)
      setMostrarModalPagamentoLote(false)
      setParcelaPagando(null)
      setParcelasSelecionadas(new Set())
      carregandoRef.current = false
      await carregarDespesas()
      await carregarContas()

      setTimeout(() => {
        setMensagem({ tipo: null, texto: '' })
      }, 3000)
    } catch (error: any) {
      console.error('Erro ao efetivar pagamento:', error)
      setMensagem({ tipo: 'erro', texto: error.message || 'Erro ao efetivar pagamento' })
    } finally {
      setSalvando(false)
    }
  }

  const pagarParcelaIndividual = async () => {
    if (!parcelaPagando) return

    const valorPago = parseFloat(formDataPagamento.valor_pago.replace(',', '.'))
    if (isNaN(valorPago) || valorPago <= 0) {
      setMensagem({ tipo: 'erro', texto: 'Valor inválido' })
      return
    }

    await efetivarPagamento([{
      parcela_id: parcelaPagando.parcela.id,
      valor_pago: valorPago,
    }])
  }

  const pagarParcelasLote = async () => {
    const todasParcelas: DespesaParcela[] = despesas.flatMap((despesa) => despesa.parcelas ?? [])
    const valorPadraoStr = formDataPagamento.valor_pago.trim()

    const parcelasParaPagar = Array.from(parcelasSelecionadas)
      .map((id): { parcela_id: string; valor_pago: number } | null => {
        const parcelaEncontrada = todasParcelas.find((p) => p.id === id)
        if (!parcelaEncontrada) return null

        const valorPago = valorPadraoStr
          ? parseFloat(valorPadraoStr.replace(',', '.'))
          : parseFloat(String(parcelaEncontrada.valor))

        return {
          parcela_id: id,
          valor_pago: valorPago,
        }
      })
      .filter((p): p is { parcela_id: string; valor_pago: number } => p !== null)

    if (parcelasParaPagar.length === 0) {
      setMensagem({ tipo: 'erro', texto: 'Nenhuma parcela válida selecionada' })
      return
    }

    await efetivarPagamento(parcelasParaPagar)
  }

  const modificarPagamento = async () => {
    if (!parcelaPagando) return

    const valorPago = parseFloat(formDataPagamento.valor_pago.replace(',', '.'))
    if (isNaN(valorPago) || valorPago <= 0) {
      setMensagem({ tipo: 'erro', texto: 'Valor inválido' })
      return
    }

    setSalvando(true)
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

      const response = await fetch(`${apiUrl}/api/v1/despesas/modificar-pagamento/${parcelaPagando.parcela.id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          caixa_id: formDataPagamento.caixa_id,
          data_pagamento: formDataPagamento.data_pagamento,
          valor_pago: valorPago,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao modificar pagamento')
      }

      setMensagem({ tipo: 'sucesso', texto: data.message || 'Pagamento modificado com sucesso!' })
      setMostrarModalEditarPagamento(false)
      setParcelaPagando(null)
      carregandoRef.current = false
      await carregarDespesas()
      await carregarContas()

      setTimeout(() => {
        setMensagem({ tipo: null, texto: '' })
      }, 3000)
    } catch (error: any) {
      console.error('Erro ao modificar pagamento:', error)
      setMensagem({ tipo: 'erro', texto: error.message || 'Erro ao modificar pagamento' })
    } finally {
      setSalvando(false)
    }
  }

  const toggleSelecaoParcela = (id: string) => {
    const novaSelecao = new Set(parcelasSelecionadas)
    if (novaSelecao.has(id)) {
      novaSelecao.delete(id)
    } else {
      novaSelecao.add(id)
    }
    setParcelasSelecionadas(novaSelecao)
  }

  const selecionarTodas = () => {
    const parcelasPendentes = obterParcelasPendentes()
    setParcelasSelecionadas(new Set(parcelasPendentes.map(p => p.parcela.id)))
  }

  const deselecionarTodas = () => {
    setParcelasSelecionadas(new Set())
  }

  if (!podeAcessar('despesas')) {
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

  const parcelasPendentes = obterParcelasPendentes()
  const valorTotalPendente = parcelasPendentes.reduce((acc, p) => acc + (typeof p.parcela.valor === 'string' ? parseFloat(p.parcela.valor) : p.parcela.valor), 0)
  const valorTotalPago = despesas.reduce((acc, d) => {
    const valorPagoDespesa = d.parcelas?.reduce((sum, p) => sum + (typeof p.valor_pago === 'string' ? parseFloat(p.valor_pago) : p.valor_pago), 0) || 0
    return acc + valorPagoDespesa
  }, 0)

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2 text-gray-300">
            <TrendingDown className="h-8 w-8 text-amber-500" />
            Despesas
          </h1>
          <p className="text-gray-400 mt-1">Gerenciamento de despesas e contas a pagar</p>
        </div>
        {podeEditar('despesas') && parcelasSelecionadas.size > 0 && (
          <Button
            onClick={abrirModalPagamentoLote}
            className="bg-amber-500 hover:bg-amber-600 text-white"
          >
            <CheckCircle2 className="h-4 w-4 mr-2" />
            Efetivar Pagamento em Lote ({parcelasSelecionadas.size})
          </Button>
        )}
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 bg-zinc-900 border-amber-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Total de Despesas</p>
              <p className="text-2xl font-bold text-gray-300">{despesas.length}</p>
            </div>
            <TrendingDown className="h-8 w-8 text-amber-500" />
          </div>
        </Card>
        <Card className="p-4 bg-zinc-900 border-amber-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Pendentes/Vencidas</p>
              <p className="text-2xl font-bold text-gray-300">{parcelasPendentes.length}</p>
              <p className="text-sm text-amber-500">{formatarPreco(valorTotalPendente)}</p>
            </div>
            <AlertCircle className="h-8 w-8 text-yellow-500" />
          </div>
        </Card>
        <Card className="p-4 bg-zinc-900 border-amber-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Total Pago</p>
              <p className="text-2xl font-bold text-gray-300">{formatarPreco(valorTotalPago)}</p>
            </div>
            <CheckCircle2 className="h-8 w-8 text-green-500" />
          </div>
        </Card>
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

      {/* Filtros */}
      <Card className="p-4 bg-zinc-900 border-amber-500/20">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <div>
            <Label className="text-gray-300">Buscar</Label>
            <div className="relative mt-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Ticket, fornecedor ou descrição..."
                value={filtros.search}
                onChange={(e) => setFiltros({ ...filtros, search: e.target.value })}
                className="pl-10 bg-zinc-800 border-amber-500/20 text-gray-300 placeholder:text-gray-500"
              />
            </div>
          </div>
          <div>
            <Label className="text-gray-300">Status</Label>
            <Select
              value={filtros.status || 'all'}
              onValueChange={(value) => setFiltros({ ...filtros, status: value })}
            >
              <SelectTrigger className="bg-zinc-800 border-amber-500/20 text-gray-300 mt-1">
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-amber-500/20">
                <SelectItem value="all" className="text-gray-300">Todos</SelectItem>
                <SelectItem value="pendente" className="text-gray-300">Pendente</SelectItem>
                <SelectItem value="paga" className="text-gray-300">Paga</SelectItem>
                <SelectItem value="vencida" className="text-gray-300">Vencida</SelectItem>
                <SelectItem value="parcial" className="text-gray-300">Parcial</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-gray-300">Vencimento Início</Label>
            <Input
              type="date"
              value={filtros.data_vencimento_inicio}
              onChange={(e) => setFiltros({ ...filtros, data_vencimento_inicio: e.target.value })}
              className="bg-zinc-800 border-amber-500/20 text-gray-300 mt-1"
            />
          </div>
          <div>
            <Label className="text-gray-300">Vencimento Fim</Label>
            <Input
              type="date"
              value={filtros.data_vencimento_fim}
              onChange={(e) => setFiltros({ ...filtros, data_vencimento_fim: e.target.value })}
              className="bg-zinc-800 border-amber-500/20 text-gray-300 mt-1"
            />
          </div>
          <div>
            <Label className="text-gray-300">Forma Pagamento</Label>
            <Select
              value={filtros.forma_pagamento || 'all'}
              onValueChange={(value) => setFiltros({ ...filtros, forma_pagamento: value })}
            >
              <SelectTrigger className="bg-zinc-800 border-amber-500/20 text-gray-300 mt-1">
                <SelectValue placeholder="Todas" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-amber-500/20">
                <SelectItem value="all" className="text-gray-300">Todas</SelectItem>
                <SelectItem value="dinheiro" className="text-gray-300">Dinheiro</SelectItem>
                <SelectItem value="pix" className="text-gray-300">Pix</SelectItem>
                <SelectItem value="ted" className="text-gray-300">TED</SelectItem>
                <SelectItem value="cartao_1x" className="text-gray-300">Cartão 1x</SelectItem>
                <SelectItem value="cartao_2x" className="text-gray-300">Cartão 2x</SelectItem>
                <SelectItem value="boleto_1x" className="text-gray-300">Boleto 1x</SelectItem>
                <SelectItem value="boleto_2x" className="text-gray-300">Boleto 2x</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-gray-300">Fornecedor</Label>
            <Input
              placeholder="Nome do fornecedor..."
              value={filtros.fornecedor}
              onChange={(e) => setFiltros({ ...filtros, fornecedor: e.target.value })}
              className="bg-zinc-800 border-amber-500/20 text-gray-300 placeholder:text-gray-500 mt-1"
            />
          </div>
        </div>
        <div className="flex items-center gap-2 mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setFiltros({
                status: 'all',
                data_vencimento_inicio: '',
                data_vencimento_fim: '',
                forma_pagamento: 'all',
                fornecedor: '',
                categoria_custo_id: 'all',
                search: '',
              })
              carregandoRef.current = false
              carregarDespesasSemFiltros()
            }}
            className="border-amber-500/20 text-gray-300 hover:bg-amber-500/10"
          >
            <X className="h-4 w-4 mr-1" />
            Limpar Filtros
          </Button>
          {podeEditar('despesas') && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={selecionarTodas}
                className="border-amber-500/20 text-gray-300 hover:bg-amber-500/10"
              >
                <CheckSquare className="h-4 w-4 mr-1" />
                Selecionar Todas Pendentes
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={deselecionarTodas}
                className="border-amber-500/20 text-gray-300 hover:bg-amber-500/10"
              >
                <Square className="h-4 w-4 mr-1" />
                Deselecionar Todas
              </Button>
            </>
          )}
        </div>
      </Card>

      {/* Lista de Despesas */}
      {loading ? (
        <div className="flex items-center justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
        </div>
      ) : despesasFiltradas.length === 0 ? (
        <Card className="p-12 text-center bg-zinc-900 border-amber-500/20">
          <TrendingDown className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-400">Nenhuma despesa encontrada</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {despesasFiltradas.map((despesa) => (
            <Card
              key={despesa.id}
              className="p-4 bg-zinc-900 border-amber-500/20"
            >
              {/* Cabeçalho da Despesa */}
              <div className="flex items-start justify-between mb-4 pb-4 border-b border-zinc-800">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2 py-1 text-xs rounded border ${getStatusColor(despesa.status)}`}>
                      {despesa.status.toUpperCase()}
                    </span>
                    <span className="font-bold text-gray-300">{despesa.ticket}</span>
                    <span className="text-sm text-gray-400">- {despesa.fornecedor}</span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                    <div>
                      <span className="text-gray-400">Emissão:</span>
                      <p className="text-gray-300">
                        {new Date(despesa.data_emissao).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-400">Vencimento:</span>
                      <p className="text-gray-300">
                        {new Date(despesa.data_vencimento).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-400">Forma:</span>
                      <p className="text-gray-300">{formatarFormaPagamento(despesa.forma_pagamento)}</p>
                    </div>
                    <div>
                      <span className="text-gray-400">Centro de Custo:</span>
                      <p className="text-gray-300">{despesa.categoria_custo_nome || 'Sem categoria'}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm mt-2">
                    <div>
                      <span className="text-gray-400">Valor Bruto:</span>
                      <p className="text-gray-300 font-bold">{formatarPreco(despesa.valor_bruto)}</p>
                    </div>
                    <div>
                      <span className="text-gray-400">Valor Líquido:</span>
                      <p className="text-gray-300 font-bold">{formatarPreco(despesa.valor_liquido)}</p>
                    </div>
                    {despesa.data_pagamento && (
                      <div>
                        <span className="text-gray-400">Pagamento:</span>
                        <p className="text-gray-300">
                          {new Date(despesa.data_pagamento).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    )}
                  </div>
                  {despesa.descricao && (
                    <p className="text-sm text-gray-400 mt-2">{despesa.descricao}</p>
                  )}
                </div>
              </div>

              {/* Parcelas */}
              {despesa.parcelas && despesa.parcelas.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-gray-300 mb-2">Parcelas:</h4>
                  {despesa.parcelas.map((parcela) => (
                    <Card
                      key={parcela.id}
                      className={`p-3 bg-zinc-800 border-amber-500/10 ${
                        parcelasSelecionadas.has(parcela.id) ? 'ring-2 ring-amber-500' : ''
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        {podeEditar('despesas') && (parcela.status === 'pendente' || parcela.status === 'vencida') && (
                          <button
                            onClick={() => toggleSelecaoParcela(parcela.id)}
                            className="mt-1"
                          >
                            {parcelasSelecionadas.has(parcela.id) ? (
                              <CheckSquare className="h-5 w-5 text-amber-500" />
                            ) : (
                              <Square className="h-5 w-5 text-gray-400" />
                            )}
                          </button>
                        )}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`px-2 py-1 text-xs rounded border ${getStatusColor(parcela.status)}`}>
                              {parcela.status.toUpperCase()}
                            </span>
                            <span className="font-bold text-gray-300">{parcela.ticket_parcela}</span>
                            <span className="text-sm text-gray-400">Parcela {parcela.numero_parcela}/{despesa.numero_parcelas}</span>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                            <div>
                              <span className="text-gray-400">Vencimento:</span>
                              <p className="text-gray-300">
                                {new Date(parcela.data_vencimento).toLocaleDateString('pt-BR')}
                              </p>
                            </div>
                            <div>
                              <span className="text-gray-400">Valor:</span>
                              <p className="font-bold text-gray-300">{formatarPreco(parcela.valor)}</p>
                            </div>
                            {parcela.data_pagamento && (
                              <div>
                                <span className="text-gray-400">Pagamento:</span>
                                <p className="text-gray-300">
                                  {new Date(parcela.data_pagamento).toLocaleDateString('pt-BR')}
                                </p>
                              </div>
                            )}
                            {Number(parcela.valor_pago) > 0 && (
                              <div>
                                <span className="text-gray-400">Valor Pago:</span>
                                <p className="text-sm font-bold text-green-500">
                                  {formatarPreco(parcela.valor_pago)}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {podeEditar('despesas') && (parcela.status === 'pendente' || parcela.status === 'vencida') && (
                            <Button
                              onClick={() => abrirModalPagamento(parcela, despesa)}
                              className="bg-amber-500 hover:bg-amber-600 text-white"
                              size="sm"
                            >
                              <CheckCircle2 className="h-4 w-4 mr-1" />
                              Quitar
                            </Button>
                          )}
                          {podeEditar('despesas') && parcela.status === 'paga' && (
                            <Button
                              onClick={() => abrirModalEditarPagamento(parcela, despesa)}
                              variant="outline"
                              className="border-amber-500/20 text-gray-300 hover:bg-amber-500/10"
                              size="sm"
                            >
                              <Edit className="h-4 w-4 mr-1" />
                              Editar
                            </Button>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Modal Pagamento Individual */}
      <Dialog open={mostrarModalPagamento} onOpenChange={setMostrarModalPagamento}>
        <DialogContent className="bg-zinc-900 border-amber-500/20 text-gray-300">
          <DialogHeader>
            <DialogTitle className="text-gray-300">Efetivar Pagamento</DialogTitle>
            <DialogDescription className="text-gray-400">
              Parcela: {parcelaPagando?.parcela.ticket_parcela} - {parcelaPagando?.despesa.fornecedor}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div>
              <Label className="text-gray-300">Caixa *</Label>
              <Select
                value={formDataPagamento.caixa_id}
                onValueChange={(value) => setFormDataPagamento({ ...formDataPagamento, caixa_id: value })}
              >
                <SelectTrigger className="bg-zinc-800 border-amber-500/20 text-gray-300">
                  <SelectValue placeholder="Selecione o caixa" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-amber-500/20">
                  {contas.map((conta) => (
                    <SelectItem key={conta.id} value={conta.id} className="text-gray-300">
                      {conta.nome} - {formatarPreco(conta.saldo_atual)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-gray-300">Data de Pagamento *</Label>
              <Input
                type="date"
                value={formDataPagamento.data_pagamento}
                onChange={(e) => setFormDataPagamento({ ...formDataPagamento, data_pagamento: e.target.value })}
                className="bg-zinc-800 border-amber-500/20 text-gray-300"
              />
            </div>

            <div>
              <Label className="text-gray-300">Valor a Pagar *</Label>
              <Input
                type="number"
                step="0.01"
                value={formDataPagamento.valor_pago}
                onChange={(e) => setFormDataPagamento({ ...formDataPagamento, valor_pago: e.target.value })}
                placeholder={parcelaPagando?.parcela.valor.toString()}
                className="bg-zinc-800 border-amber-500/20 text-gray-300"
              />
              {parcelaPagando && (
                <p className="text-xs text-gray-500 mt-1">
                  Valor da parcela: {formatarPreco(parcelaPagando.parcela.valor)}
                </p>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setMostrarModalPagamento(false)
                  setParcelaPagando(null)
                }}
                disabled={salvando}
                className="border-amber-500/20 text-gray-300 hover:bg-amber-500/10"
              >
                <X className="h-4 w-4 mr-1" />
                Cancelar
              </Button>
              <Button
                onClick={pagarParcelaIndividual}
                disabled={salvando}
                className="bg-amber-500 hover:bg-amber-600 text-white"
              >
                {salvando ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                    Processando...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-1" />
                    Efetivar Pagamento
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal Pagamento em Lote */}
      <Dialog open={mostrarModalPagamentoLote} onOpenChange={setMostrarModalPagamentoLote}>
        <DialogContent className="bg-zinc-900 border-amber-500/20 text-gray-300 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-gray-300">Efetivar Pagamento em Lote</DialogTitle>
            <DialogDescription className="text-gray-400">
              {parcelasSelecionadas.size} parcela(s) selecionada(s)
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div>
              <Label className="text-gray-300">Caixa *</Label>
              <Select
                value={formDataPagamento.caixa_id}
                onValueChange={(value) => setFormDataPagamento({ ...formDataPagamento, caixa_id: value })}
              >
                <SelectTrigger className="bg-zinc-800 border-amber-500/20 text-gray-300">
                  <SelectValue placeholder="Selecione o caixa" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-amber-500/20">
                  {contas.map((conta) => (
                    <SelectItem key={conta.id} value={conta.id} className="text-gray-300">
                      {conta.nome} - {formatarPreco(conta.saldo_atual)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-gray-300">Data de Pagamento *</Label>
              <Input
                type="date"
                value={formDataPagamento.data_pagamento}
                onChange={(e) => setFormDataPagamento({ ...formDataPagamento, data_pagamento: e.target.value })}
                className="bg-zinc-800 border-amber-500/20 text-gray-300"
              />
            </div>

            <div>
              <Label className="text-gray-300">Valor Padrão (opcional)</Label>
              <Input
                type="number"
                step="0.01"
                value={formDataPagamento.valor_pago}
                onChange={(e) => setFormDataPagamento({ ...formDataPagamento, valor_pago: e.target.value })}
                placeholder="Deixe vazio para usar valor de cada parcela"
                className="bg-zinc-800 border-amber-500/20 text-gray-300"
              />
              <p className="text-xs text-gray-500 mt-1">
                Se preenchido, este valor será aplicado a todas as parcelas selecionadas
              </p>
            </div>

            <div className="max-h-60 overflow-y-auto space-y-2 border border-zinc-800 rounded p-2">
              <p className="text-sm font-semibold text-gray-300 mb-2">Parcelas Selecionadas:</p>
              {Array.from(parcelasSelecionadas).map(id => {
                let encontrado: { parcela: DespesaParcela; despesa: Despesa } | null = null
                for (const despesa of despesas) {
                  const parcela = despesa.parcelas?.find((p) => p.id === id)
                  if (parcela) {
                    encontrado = { parcela, despesa }
                    break
                  }
                }
                if (!encontrado) return null
                return (
                  <div key={id} className="flex items-center justify-between p-2 bg-zinc-800 rounded text-sm">
                    <span className="text-gray-300">{encontrado.parcela.ticket_parcela} - {encontrado.despesa.fornecedor}</span>
                    <span className="text-amber-500 font-bold">{formatarPreco(encontrado.parcela.valor)}</span>
                  </div>
                )
              })}
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setMostrarModalPagamentoLote(false)
                }}
                disabled={salvando}
                className="border-amber-500/20 text-gray-300 hover:bg-amber-500/10"
              >
                <X className="h-4 w-4 mr-1" />
                Cancelar
              </Button>
              <Button
                onClick={pagarParcelasLote}
                disabled={salvando}
                className="bg-amber-500 hover:bg-amber-600 text-white"
              >
                {salvando ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                    Processando...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-1" />
                    Efetivar Pagamentos ({parcelasSelecionadas.size})
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal Editar Pagamento */}
      <Dialog open={mostrarModalEditarPagamento} onOpenChange={setMostrarModalEditarPagamento}>
        <DialogContent className="bg-zinc-900 border-amber-500/20 text-gray-300">
          <DialogHeader>
            <DialogTitle className="text-gray-300">Modificar Pagamento</DialogTitle>
            <DialogDescription className="text-gray-400">
              Parcela: {parcelaPagando?.parcela.ticket_parcela} - {parcelaPagando?.despesa.fornecedor}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div>
              <Label className="text-gray-300">Caixa *</Label>
              <Select
                value={formDataPagamento.caixa_id}
                onValueChange={(value) => setFormDataPagamento({ ...formDataPagamento, caixa_id: value })}
              >
                <SelectTrigger className="bg-zinc-800 border-amber-500/20 text-gray-300">
                  <SelectValue placeholder="Selecione o caixa" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-amber-500/20">
                  {contas.map((conta) => (
                    <SelectItem key={conta.id} value={conta.id} className="text-gray-300">
                      {conta.nome} - {formatarPreco(conta.saldo_atual)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-gray-300">Data de Pagamento *</Label>
              <Input
                type="date"
                value={formDataPagamento.data_pagamento}
                onChange={(e) => setFormDataPagamento({ ...formDataPagamento, data_pagamento: e.target.value })}
                className="bg-zinc-800 border-amber-500/20 text-gray-300"
              />
            </div>

            <div>
              <Label className="text-gray-300">Valor Pago *</Label>
              <Input
                type="number"
                step="0.01"
                value={formDataPagamento.valor_pago}
                onChange={(e) => setFormDataPagamento({ ...formDataPagamento, valor_pago: e.target.value })}
                className="bg-zinc-800 border-amber-500/20 text-gray-300"
              />
              {parcelaPagando && (
                <p className="text-xs text-gray-500 mt-1">
                  Valor da parcela: {formatarPreco(parcelaPagando.parcela.valor)}
                </p>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setMostrarModalEditarPagamento(false)
                  setParcelaPagando(null)
                }}
                disabled={salvando}
                className="border-amber-500/20 text-gray-300 hover:bg-amber-500/10"
              >
                <X className="h-4 w-4 mr-1" />
                Cancelar
              </Button>
              <Button
                onClick={modificarPagamento}
                disabled={salvando}
                className="bg-amber-500 hover:bg-amber-600 text-white"
              >
                {salvando ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                    Processando...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-1" />
                    Salvar Alterações
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

