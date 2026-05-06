'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { TrendingUp, Search, Calendar, DollarSign, CheckCircle2, AlertCircle, X, Save, Loader2, Filter, CheckSquare, Square, Wallet } from 'lucide-react'
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

interface Receita {
  id: string
  ticket_venda: string
  parcela_id?: string | null
  venda_id: string
  cliente_id?: string | null
  cliente_nome?: string | null
  forma_pagamento: string
  caixa_id?: string | null
  caixa_nome?: string | null
  data_emissao: string
  data_vencimento: string
  data_pagamento?: string | null
  valor_vencimento: number | string
  valor_pago: number | string
  status: string
  observacoes?: string | null
  venda_ticket?: string
}

interface Conta {
  id: string
  nome: string
  saldo_atual: number | string
}

export default function ReceitasPage() {
  const [receitas, setReceitas] = useState<Receita[]>([])
  const [receitasFiltradas, setReceitasFiltradas] = useState<Receita[]>([])
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
    search: '',
  })

  // Seleção para pagamento em lote
  const [receitasSelecionadas, setReceitasSelecionadas] = useState<Set<string>>(new Set())
  const [mostrarModalPagamento, setMostrarModalPagamento] = useState(false)
  const [mostrarModalPagamentoLote, setMostrarModalPagamentoLote] = useState(false)
  const [receitaPagando, setReceitaPagando] = useState<Receita | null>(null)

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
      console.log('[Receitas Frontend] useEffect inicial executado')
      console.log('[Receitas Frontend] podeAcessar receitas:', podeAcessar('receitas'))
      console.log('[Receitas Frontend] dadosCarregadosRef.current:', dadosCarregadosRef.current)
      console.log('[Receitas Frontend] carregandoRef.current:', carregandoRef.current)
      
      // Verificar permissão, mas tentar carregar mesmo assim (a verificação será feita no backend)
      if (dadosCarregadosRef.current) {
        console.log('[Receitas Frontend] Dados já carregados, abortando')
        return
      }
      if (carregandoRef.current) {
        console.log('[Receitas Frontend] Já está carregando, abortando')
        return
      }

      console.log('[Receitas Frontend] Iniciando carregamento de dados...')
      dadosCarregadosRef.current = true
      await carregarContas()
      await carregarReceitasSemFiltros()
    }

    // Aguardar um pouco para garantir que as permissões estejam carregadas
    const timer = setTimeout(() => {
      carregarDados()
    }, 100)

    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Aplicar filtros locais quando receitas ou busca mudarem
  useEffect(() => {
    let filtradas = [...receitas]
    
    // Filtro de busca (ticket ou cliente)
    if (filtros.search) {
      const termo = filtros.search.toLowerCase()
      filtradas = filtradas.filter(r =>
        (r.ticket_venda && r.ticket_venda.toLowerCase().includes(termo)) ||
        (r.cliente_nome && r.cliente_nome.toLowerCase().includes(termo))
      )
    }
    
    console.log('[Receitas Frontend] Aplicando filtros:', { total: receitas.length, filtradas: filtradas.length, busca: filtros.search })
    setReceitasFiltradas(filtradas)
  }, [receitas, filtros.search])

  // Recarregar quando filtros do backend mudarem
  useEffect(() => {
    if (!podeAcessar('receitas')) return
    if (!dadosCarregadosRef.current) return
    if (carregandoRef.current) return

    const temFiltrosBackend = filtros.status !== 'all' || filtros.data_vencimento_inicio || filtros.data_vencimento_fim || filtros.forma_pagamento !== 'all'
    if (temFiltrosBackend) {
      carregarReceitas()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtros.status, filtros.data_vencimento_inicio, filtros.data_vencimento_fim, filtros.forma_pagamento])

  const carregarReceitasSemFiltros = useCallback(async () => {
    if (carregandoRef.current) {
      console.log('[Receitas Frontend] carregarReceitasSemFiltros: já está carregando, abortando')
      return
    }

    console.log('[Receitas Frontend] carregarReceitasSemFiltros: iniciando...')
    carregandoRef.current = true
    setLoading(true)

    try {
      const adminData = localStorage.getItem('admin')
      const admin = adminData ? JSON.parse(adminData) : null
      console.log('[Receitas Frontend] Admin data:', admin ? 'encontrado' : 'não encontrado')

      const apiUrl = 'https://api6.actusconsultoria.com.br'
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      }
      if (admin?.id) {
        headers['x-user-id'] = admin.id
        headers['x-user-tipo'] = admin.tipo_usuario || 'administrativo'
        headers['x-user-nome'] = admin.nome_completo || null
      }

      console.log('[Receitas Frontend] Fazendo requisição para:', `${apiUrl}/api/v1/receitas`)
      console.log('[Receitas Frontend] Headers:', headers)

      const response = await fetch(`${apiUrl}/api/v1/receitas`, { headers })

      console.log('[Receitas Frontend] Response status:', response.status, response.statusText)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('[Receitas Frontend] Erro na resposta:', errorText)
        throw new Error(`Erro ao carregar receitas: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      console.log('[Receitas Frontend] Data recebida:', data)
      const receitasCarregadas = data.receitas || []
      console.log('[Receitas Frontend] Receitas recebidas (sem filtros):', receitasCarregadas.length)
      if (receitasCarregadas.length > 0) {
        console.log('[Receitas Frontend] Primeira receita:', receitasCarregadas[0])
      } else {
        console.warn('[Receitas Frontend] Nenhuma receita retornada do backend!')
      }
      setReceitas(receitasCarregadas)
    } catch (error: any) {
      console.error('[Receitas Frontend] Erro ao carregar receitas:', error)
      setMensagem({ tipo: 'erro', texto: error.message || 'Erro ao carregar receitas' })
    } finally {
      setLoading(false)
      carregandoRef.current = false
      console.log('[Receitas Frontend] carregarReceitasSemFiltros: finalizado')
    }
  }, [])

  const carregarReceitas = useCallback(async () => {
    if (carregandoRef.current) return

    carregandoRef.current = true
    setLoading(true)

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

      const queryParams = new URLSearchParams()
      if (filtros.status && filtros.status !== 'all') queryParams.append('status', filtros.status)
      if (filtros.data_vencimento_inicio) queryParams.append('data_vencimento_inicio', filtros.data_vencimento_inicio)
      if (filtros.data_vencimento_fim) queryParams.append('data_vencimento_fim', filtros.data_vencimento_fim)
      if (filtros.forma_pagamento && filtros.forma_pagamento !== 'all') queryParams.append('forma_pagamento', filtros.forma_pagamento)

      const response = await fetch(`${apiUrl}/api/v1/receitas?${queryParams.toString()}`, { headers })

      if (!response.ok) {
        throw new Error(`Erro ao carregar receitas: ${response.status}`)
      }

      const data = await response.json()
      const receitasCarregadas = data.receitas || []
      setReceitas(receitasCarregadas)
    } catch (error: any) {
      console.error('Erro ao carregar receitas:', error)
      setMensagem({ tipo: 'erro', texto: error.message || 'Erro ao carregar receitas' })
    } finally {
      setLoading(false)
      carregandoRef.current = false
    }
  }, [filtros.status, filtros.data_vencimento_inicio, filtros.data_vencimento_fim, filtros.forma_pagamento])

  const carregarContas = useCallback(async () => {
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

  const abrirModalPagamento = (receita: Receita) => {
    setReceitaPagando(receita)
    setFormDataPagamento({
      caixa_id: receita.caixa_id || '',
      data_pagamento: new Date().toISOString().split('T')[0],
      valor_pago: receita.valor_vencimento.toString(),
    })
    setMostrarModalPagamento(true)
  }

  const abrirModalPagamentoLote = () => {
    if (receitasSelecionadas.size === 0) {
      setMensagem({ tipo: 'erro', texto: 'Selecione pelo menos uma receita' })
      return
    }
    setFormDataPagamento({
      caixa_id: '',
      data_pagamento: new Date().toISOString().split('T')[0],
      valor_pago: '',
    })
    setMostrarModalPagamentoLote(true)
  }

  const efetivarPagamento = async (receitasParaPagar: { receita_id: string; valor_pago: number }[]) => {
    if (!formDataPagamento.caixa_id) {
      setMensagem({ tipo: 'erro', texto: 'Selecione o caixa' })
      return
    }

    setSalvando(true)
    setMensagem({ tipo: null, texto: '' })

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

      const response = await fetch(`${apiUrl}/api/v1/receitas/efetivar-pagamento`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          receitas: receitasParaPagar,
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
      setReceitaPagando(null)
      setReceitasSelecionadas(new Set())
      carregandoRef.current = false
      await carregarReceitas()
      await carregarContas() // Recarregar contas para atualizar saldos

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

  const pagarReceitaIndividual = async () => {
    if (!receitaPagando) return

    const valorPago = parseFloat(formDataPagamento.valor_pago.replace(',', '.'))
    if (isNaN(valorPago) || valorPago <= 0) {
      setMensagem({ tipo: 'erro', texto: 'Valor inválido' })
      return
    }

    await efetivarPagamento([{
      receita_id: receitaPagando.id,
      valor_pago: valorPago,
    }])
  }

  const pagarReceitasLote = async () => {
    const receitasParaPagar = Array.from(receitasSelecionadas).map(id => {
      const receita = receitas.find(r => r.id === id)
      if (!receita) return null

      // Se não especificou valor, usar o valor de vencimento
      const valorPago = formDataPagamento.valor_pago
        ? parseFloat(formDataPagamento.valor_pago.replace(',', '.'))
        : parseFloat(receita.valor_vencimento.toString())

      return {
        receita_id: id,
        valor_pago: valorPago,
      }
    }).filter(r => r !== null) as { receita_id: string; valor_pago: number }[]

    if (receitasParaPagar.length === 0) {
      setMensagem({ tipo: 'erro', texto: 'Nenhuma receita válida selecionada' })
      return
    }

    await efetivarPagamento(receitasParaPagar)
  }

  const toggleSelecaoReceita = (id: string) => {
    const novaSelecao = new Set(receitasSelecionadas)
    if (novaSelecao.has(id)) {
      novaSelecao.delete(id)
    } else {
      novaSelecao.add(id)
    }
    setReceitasSelecionadas(novaSelecao)
  }

  const selecionarTodas = () => {
    const receitasPendentes = receitasFiltradas.filter(r => r.status === 'pendente' || r.status === 'vencida')
    setReceitasSelecionadas(new Set(receitasPendentes.map(r => r.id)))
  }

  const deselecionarTodas = () => {
    setReceitasSelecionadas(new Set())
  }

  if (!podeAcessar('receitas')) {
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

  const receitasPendentes = receitas.filter(r => r.status === 'pendente' || r.status === 'vencida').length
  const valorTotalPendente = receitas
    .filter(r => r.status === 'pendente' || r.status === 'vencida')
    .reduce((acc, r) => acc + (typeof r.valor_vencimento === 'string' ? parseFloat(r.valor_vencimento) : r.valor_vencimento), 0)
  const valorTotalPago = receitas
    .filter(r => r.status === 'paga')
    .reduce((acc, r) => acc + (typeof r.valor_pago === 'string' ? parseFloat(r.valor_pago) : r.valor_pago), 0)

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2 text-gray-300">
            <TrendingUp className="h-8 w-8 text-amber-500" />
            Receitas
          </h1>
          <p className="text-gray-400 mt-1">Gerenciamento de receitas e efetivação de pagamentos</p>
        </div>
        {podeEditar('receitas') && receitasSelecionadas.size > 0 && (
          <Button
            onClick={abrirModalPagamentoLote}
            className="bg-amber-500 hover:bg-amber-600 text-white"
          >
            <CheckCircle2 className="h-4 w-4 mr-2" />
            Efetivar Pagamento em Lote ({receitasSelecionadas.size})
          </Button>
        )}
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 bg-zinc-900 border-amber-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Total de Receitas</p>
              <p className="text-2xl font-bold text-gray-300">{receitas.length}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-amber-500" />
          </div>
        </Card>
        <Card className="p-4 bg-zinc-900 border-amber-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Pendentes/Vencidas</p>
              <p className="text-2xl font-bold text-gray-300">{receitasPendentes}</p>
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
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <Label className="text-gray-300">Buscar</Label>
            <div className="relative mt-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Ticket ou cliente..."
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
                search: '',
              })
              carregandoRef.current = false
              carregarReceitasSemFiltros()
            }}
            className="border-amber-500/20 text-gray-300 hover:bg-amber-500/10"
          >
            <X className="h-4 w-4 mr-1" />
            Limpar Filtros
          </Button>
          {podeEditar('receitas') && (
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

      {/* Lista de Receitas */}
      {loading ? (
        <div className="flex items-center justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
        </div>
      ) : receitasFiltradas.length === 0 ? (
        <Card className="p-12 text-center bg-zinc-900 border-amber-500/20">
          <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-400">Nenhuma receita encontrada</p>
        </Card>
      ) : (
        <div className="space-y-2">
          {receitasFiltradas.map((receita) => (
            <Card
              key={receita.id}
              className={`p-4 bg-zinc-900 border-amber-500/20 ${
                receitasSelecionadas.has(receita.id) ? 'ring-2 ring-amber-500' : ''
              }`}
            >
              <div className="flex items-start gap-4">
                {podeEditar('receitas') && (receita.status === 'pendente' || receita.status === 'vencida') && (
                  <button
                    onClick={() => toggleSelecaoReceita(receita.id)}
                    className="mt-1"
                  >
                    {receitasSelecionadas.has(receita.id) ? (
                      <CheckSquare className="h-5 w-5 text-amber-500" />
                    ) : (
                      <Square className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                )}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2 py-1 text-xs rounded border ${getStatusColor(receita.status)}`}>
                      {receita.status.toUpperCase()}
                    </span>
                    <span className="font-bold text-gray-300">{receita.ticket_venda}</span>
                    {receita.cliente_nome && (
                      <span className="text-sm text-gray-400">- {receita.cliente_nome}</span>
                    )}
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                    <div>
                      <span className="text-gray-400">Forma:</span>
                      <p className="text-gray-300">{formatarFormaPagamento(receita.forma_pagamento)}</p>
                    </div>
                    <div>
                      <span className="text-gray-400">Vencimento:</span>
                      <p className="text-gray-300">
                        {new Date(receita.data_vencimento).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-400">Valor:</span>
                      <p className="font-bold text-gray-300">{formatarPreco(receita.valor_vencimento)}</p>
                    </div>
                    {receita.data_pagamento && (
                      <div>
                        <span className="text-gray-400">Pago em:</span>
                        <p className="text-gray-300">
                          {new Date(receita.data_pagamento).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    )}
                  </div>
                  {receita.valor_pago > 0 && (
                    <div className="mt-2">
                      <span className="text-sm text-gray-400">Valor Pago: </span>
                      <span className="text-sm font-bold text-green-500">
                        {formatarPreco(receita.valor_pago)}
                      </span>
                    </div>
                  )}
                </div>
                {podeEditar('receitas') && (receita.status === 'pendente' || receita.status === 'vencida') && (
                  <Button
                    onClick={() => abrirModalPagamento(receita)}
                    className="bg-amber-500 hover:bg-amber-600 text-white"
                  >
                    <CheckCircle2 className="h-4 w-4 mr-1" />
                    Efetivar Pagamento
                  </Button>
                )}
              </div>
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
              Receita: {receitaPagando?.ticket_venda}
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
                placeholder={receitaPagando?.valor_vencimento.toString()}
                className="bg-zinc-800 border-amber-500/20 text-gray-300"
              />
              {receitaPagando && (
                <p className="text-xs text-gray-500 mt-1">
                  Valor de vencimento: {formatarPreco(receitaPagando.valor_vencimento)}
                </p>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setMostrarModalPagamento(false)
                  setReceitaPagando(null)
                }}
                disabled={salvando}
                className="border-amber-500/20 text-gray-300 hover:bg-amber-500/10"
              >
                <X className="h-4 w-4 mr-1" />
                Cancelar
              </Button>
              <Button
                onClick={pagarReceitaIndividual}
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
              {receitasSelecionadas.size} receita(s) selecionada(s)
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
                placeholder="Deixe vazio para usar valor de vencimento de cada receita"
                className="bg-zinc-800 border-amber-500/20 text-gray-300"
              />
              <p className="text-xs text-gray-500 mt-1">
                Se preenchido, este valor será aplicado a todas as receitas selecionadas
              </p>
            </div>

            <div className="max-h-60 overflow-y-auto space-y-2 border border-zinc-800 rounded p-2">
              <p className="text-sm font-semibold text-gray-300 mb-2">Receitas Selecionadas:</p>
              {Array.from(receitasSelecionadas).map(id => {
                const receita = receitas.find(r => r.id === id)
                if (!receita) return null
                return (
                  <div key={id} className="flex items-center justify-between p-2 bg-zinc-800 rounded text-sm">
                    <span className="text-gray-300">{receita.ticket_venda}</span>
                    <span className="text-amber-500 font-bold">{formatarPreco(receita.valor_vencimento)}</span>
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
                onClick={pagarReceitasLote}
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
                    Efetivar Pagamentos ({receitasSelecionadas.size})
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

