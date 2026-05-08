'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Wallet, Search, Plus, Edit, Trash2, X, Save, Loader2, AlertCircle, CheckCircle2, DollarSign, Building2, ArrowRightLeft, TrendingUp, TrendingDown, Calendar } from 'lucide-react'
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
import { getApiBaseUrl } from '@/lib/api'

interface Conta {
  id: string
  nome: string
  tipo: string
  banco?: string | null
  agencia?: string | null
  conta?: string | null
  saldo_inicial: number | string
  saldo_atual: number | string
  descricao?: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

interface Movimentacao {
  id: string
  conta_id: string
  tipo_movimentacao: string
  conta_origem_id?: string | null
  conta_destino_id?: string | null
  valor: number | string
  descricao: string
  categoria?: string | null
  data_movimentacao: string
  observacoes?: string | null
  conta_nome?: string
  conta_origem_nome?: string
  conta_destino_nome?: string
}

export default function CaixasPage() {
  const [contas, setContas] = useState<Conta[]>([])
  const [contasFiltradas, setContasFiltradas] = useState<Conta[]>([])
  const [movimentacoes, setMovimentacoes] = useState<Movimentacao[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [mostrarModalConta, setMostrarModalConta] = useState(false)
  const [mostrarModalEntrada, setMostrarModalEntrada] = useState(false)
  const [mostrarModalSaida, setMostrarModalSaida] = useState(false)
  const [mostrarModalTransferencia, setMostrarModalTransferencia] = useState(false)
  const [salvando, setSalvando] = useState(false)
  const [mensagem, setMensagem] = useState<{ tipo: 'sucesso' | 'erro' | null; texto: string }>({ tipo: null, texto: '' })
  const { podeAcessar, podeEditar, podeExcluir } = usePermissions()
  const [contaEditando, setContaEditando] = useState<Conta | null>(null)
  
  // Refs para evitar múltiplas chamadas simultâneas
  const carregandoContasRef = useRef(false)
  const carregandoMovimentacoesRef = useRef(false)
  const podeAcessarCaixas = useRef(false)

  // Formulário de conta
  const [formDataConta, setFormDataConta] = useState({
    nome: '',
    tipo: 'caixa',
    banco: '',
    agencia: '',
    conta: '',
    saldo_inicial: '',
    descricao: '',
    is_active: true,
  })

  // Formulário de entrada
  const [formDataEntrada, setFormDataEntrada] = useState({
    conta_id: '',
    valor: '',
    descricao: '',
    categoria: '',
    data_movimentacao: new Date().toISOString().split('T')[0],
    observacoes: '',
  })

  // Formulário de saída
  const [formDataSaida, setFormDataSaida] = useState({
    conta_id: '',
    valor: '',
    descricao: '',
    categoria: '',
    data_movimentacao: new Date().toISOString().split('T')[0],
    observacoes: '',
  })

  // Formulário de transferência
  const [formDataTransferencia, setFormDataTransferencia] = useState({
    conta_origem_id: '',
    conta_destino_id: '',
    valor: '',
    descricao: '',
    data_movimentacao: new Date().toISOString().split('T')[0],
    observacoes: '',
  })

  const carregarContas = useCallback(async () => {
    // Prevenir múltiplas chamadas simultâneas
    if (carregandoContasRef.current) {
      console.log('[Caixas] Carregamento de contas já em andamento, ignorando...')
      return
    }

    carregandoContasRef.current = true
    setLoading(true)
    
    try {
      console.log('[Caixas] Iniciando fetch de contas...')
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

      const response = await fetch(`${apiUrl}/api/v1/caixas/contas`, {
        headers,
      })

      if (!response.ok) {
        throw new Error(`Erro ao carregar contas: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      console.log('[Caixas] Contas carregadas:', data.contas?.length || 0)
      setContas(data.contas || [])
    } catch (error: any) {
      console.error('[Caixas] Erro ao carregar contas:', error)
      setMensagem({ tipo: 'erro', texto: error.message || 'Erro ao carregar contas' })
    } finally {
      setLoading(false)
      carregandoContasRef.current = false
    }
  }, [])

  const carregarMovimentacoes = useCallback(async () => {
    // Prevenir múltiplas chamadas simultâneas
    if (carregandoMovimentacoesRef.current) {
      console.log('[Caixas] Carregamento de movimentações já em andamento, ignorando...')
      return
    }

    carregandoMovimentacoesRef.current = true
    
    try {
      console.log('[Caixas] Iniciando fetch de movimentações...')
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

      const response = await fetch(`${apiUrl}/api/v1/caixas/movimentacoes`, {
        headers,
      })

      if (!response.ok) {
        throw new Error(`Erro ao carregar movimentações: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      console.log('[Caixas] Movimentações carregadas:', data.movimentacoes?.length || 0)
      setMovimentacoes(data.movimentacoes || [])
    } catch (error: any) {
      console.error('[Caixas] Erro ao carregar movimentações:', error)
    } finally {
      carregandoMovimentacoesRef.current = false
    }
  }, [])

  // Verificar permissão e carregar dados quando componente montar
  useEffect(() => {
    const temPermissao = podeAcessar('caixas')
    podeAcessarCaixas.current = temPermissao
    
    if (temPermissao && !carregandoContasRef.current && !carregandoMovimentacoesRef.current) {
      // Só carregar se ainda não tiver dados ou se for a primeira vez
      if (contas.length === 0) {
        console.log('[Caixas] Iniciando carregamento de dados...')
        carregarContas()
        carregarMovimentacoes()
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [podeAcessar]) // Depende apenas de podeAcessar

  // Filtrar contas quando searchTerm ou contas mudarem
  useEffect(() => {
    if (!searchTerm.trim()) {
      setContasFiltradas(contas)
      return
    }

    const termo = searchTerm.toLowerCase()
    const filtradas = contas.filter(conta =>
      conta.nome.toLowerCase().includes(termo) ||
      (conta.banco && conta.banco.toLowerCase().includes(termo)) ||
      (conta.conta && conta.conta.toLowerCase().includes(termo))
    )
    setContasFiltradas(filtradas)
  }, [searchTerm, contas])

  const formatarPreco = (preco: number | string | null | undefined) => {
    if (!preco) return 'R$ 0,00'
    const valor = typeof preco === 'string' ? parseFloat(preco) : preco
    if (isNaN(valor)) return 'R$ 0,00'
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(valor)
  }

  const formatarTipo = (tipo: string) => {
    const tipos: { [key: string]: string } = {
      caixa: 'Caixa',
      conta_corrente: 'Conta Corrente',
      poupanca: 'Poupança',
      investimento: 'Investimento',
      outro: 'Outro',
    }
    return tipos[tipo] || tipo
  }

  const formatarTipoMovimentacao = (tipo: string) => {
    const tipos: { [key: string]: string } = {
      entrada: 'Entrada',
      saida: 'Saída',
      transferencia: 'Transferência',
      saldo_inicial: 'Saldo Inicial',
    }
    return tipos[tipo] || tipo
  }

  const abrirModalConta = (conta?: Conta) => {
    if (conta) {
      setContaEditando(conta)
      setFormDataConta({
        nome: conta.nome,
        tipo: conta.tipo,
        banco: conta.banco || '',
        agencia: conta.agencia || '',
        conta: conta.conta || '',
        saldo_inicial: conta.saldo_inicial.toString(),
        descricao: conta.descricao || '',
        is_active: conta.is_active,
      })
    } else {
      setContaEditando(null)
      setFormDataConta({
        nome: '',
        tipo: 'caixa',
        banco: '',
        agencia: '',
        conta: '',
        saldo_inicial: '',
        descricao: '',
        is_active: true,
      })
    }
    setMostrarModalConta(true)
  }

  const fecharModalConta = () => {
    setMostrarModalConta(false)
    setContaEditando(null)
    setMensagem({ tipo: null, texto: '' })
  }

  const salvarConta = async () => {
    if (!formDataConta.nome || !formDataConta.tipo) {
      setMensagem({ tipo: 'erro', texto: 'Preencha todos os campos obrigatórios' })
      return
    }

    setSalvando(true)
    setMensagem({ tipo: null, texto: '' })

    try {
      const apiUrl = getApiBaseUrl()

      const adminData = localStorage.getItem('admin')
      const admin = adminData ? JSON.parse(adminData) : null

      const body = {
        nome: formDataConta.nome.trim(),
        tipo: formDataConta.tipo,
        banco: formDataConta.banco.trim() || null,
        agencia: formDataConta.agencia.trim() || null,
        conta: formDataConta.conta.trim() || null,
        saldo_inicial: formDataConta.saldo_inicial ? parseFloat(formDataConta.saldo_inicial.replace(',', '.')) : 0,
        descricao: formDataConta.descricao.trim() || null,
        is_active: formDataConta.is_active,
      }

      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      }
      if (admin?.id) {
        headers['x-user-id'] = admin.id
        headers['x-user-tipo'] = admin.tipo_usuario || 'administrativo'
        headers['x-user-nome'] = admin.nome_completo || null
      }

      const url = contaEditando
        ? `${apiUrl}/api/v1/caixas/contas/${contaEditando.id}`
        : `${apiUrl}/api/v1/caixas/contas`

      const response = await fetch(url, {
        method: contaEditando ? 'PUT' : 'POST',
        headers,
        body: JSON.stringify(body),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao salvar conta')
      }

      setMensagem({ tipo: 'sucesso', texto: contaEditando ? 'Conta atualizada com sucesso!' : 'Conta criada com sucesso!' })
      // Resetar flags antes de recarregar
      carregandoContasRef.current = false
      carregandoMovimentacoesRef.current = false
      await carregarContas()
      await carregarMovimentacoes()
      setTimeout(() => {
        fecharModalConta()
      }, 1500)
    } catch (error: any) {
      console.error('Erro ao salvar conta:', error)
      setMensagem({ tipo: 'erro', texto: error.message || 'Erro ao salvar conta' })
    } finally {
      setSalvando(false)
    }
  }

  const excluirConta = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta conta? Esta ação não pode ser desfeita.')) {
      return
    }

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

      const response = await fetch(`${apiUrl}/api/v1/caixas/contas/${id}`, {
        method: 'DELETE',
        headers,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao excluir conta')
      }

      setMensagem({ tipo: 'sucesso', texto: 'Conta excluída com sucesso!' })
      // Resetar flags antes de recarregar
      carregandoContasRef.current = false
      carregandoMovimentacoesRef.current = false
      await carregarContas()
      await carregarMovimentacoes()
    } catch (error: any) {
      console.error('Erro ao excluir conta:', error)
      setMensagem({ tipo: 'erro', texto: error.message || 'Erro ao excluir conta' })
    }
  }

  const salvarEntrada = async () => {
    if (!formDataEntrada.conta_id || !formDataEntrada.valor || !formDataEntrada.descricao) {
      setMensagem({ tipo: 'erro', texto: 'Preencha todos os campos obrigatórios' })
      return
    }

    const valorNumber = parseFloat(formDataEntrada.valor.replace(',', '.'))

    if (isNaN(valorNumber) || valorNumber <= 0) {
      setMensagem({ tipo: 'erro', texto: 'Valor inválido' })
      return
    }

    setSalvando(true)
    setMensagem({ tipo: null, texto: '' })

    try {
      const apiUrl = getApiBaseUrl()

      const adminData = localStorage.getItem('admin')
      const admin = adminData ? JSON.parse(adminData) : null

      const body = {
        conta_id: formDataEntrada.conta_id,
        valor: valorNumber,
        descricao: formDataEntrada.descricao.trim(),
        categoria: formDataEntrada.categoria.trim() || null,
        data_movimentacao: formDataEntrada.data_movimentacao,
        observacoes: formDataEntrada.observacoes.trim() || null,
      }

      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      }
      if (admin?.id) {
        headers['x-user-id'] = admin.id
        headers['x-user-tipo'] = admin.tipo_usuario || 'administrativo'
        headers['x-user-nome'] = admin.nome_completo || null
      }

      const response = await fetch(`${apiUrl}/api/v1/caixas/movimentacoes/entrada`, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao criar entrada')
      }

      setMensagem({ tipo: 'sucesso', texto: 'Entrada criada com sucesso!' })
      // Resetar flags antes de recarregar
      carregandoContasRef.current = false
      carregandoMovimentacoesRef.current = false
      await carregarContas()
      await carregarMovimentacoes()
      setFormDataEntrada({
        conta_id: '',
        valor: '',
        descricao: '',
        categoria: '',
        data_movimentacao: new Date().toISOString().split('T')[0],
        observacoes: '',
      })
      setTimeout(() => {
        setMostrarModalEntrada(false)
      }, 1500)
    } catch (error: any) {
      console.error('Erro ao criar entrada:', error)
      setMensagem({ tipo: 'erro', texto: error.message || 'Erro ao criar entrada' })
    } finally {
      setSalvando(false)
    }
  }

  const salvarSaida = async () => {
    if (!formDataSaida.conta_id || !formDataSaida.valor || !formDataSaida.descricao) {
      setMensagem({ tipo: 'erro', texto: 'Preencha todos os campos obrigatórios' })
      return
    }

    const valorNumber = parseFloat(formDataSaida.valor.replace(',', '.'))

    if (isNaN(valorNumber) || valorNumber <= 0) {
      setMensagem({ tipo: 'erro', texto: 'Valor inválido' })
      return
    }

    setSalvando(true)
    setMensagem({ tipo: null, texto: '' })

    try {
      const apiUrl = getApiBaseUrl()

      const adminData = localStorage.getItem('admin')
      const admin = adminData ? JSON.parse(adminData) : null

      const body = {
        conta_id: formDataSaida.conta_id,
        valor: valorNumber,
        descricao: formDataSaida.descricao.trim(),
        categoria: formDataSaida.categoria.trim() || null,
        data_movimentacao: formDataSaida.data_movimentacao,
        observacoes: formDataSaida.observacoes.trim() || null,
      }

      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      }
      if (admin?.id) {
        headers['x-user-id'] = admin.id
        headers['x-user-tipo'] = admin.tipo_usuario || 'administrativo'
        headers['x-user-nome'] = admin.nome_completo || null
      }

      const response = await fetch(`${apiUrl}/api/v1/caixas/movimentacoes/saida`, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao criar saída')
      }

      setMensagem({ tipo: 'sucesso', texto: 'Saída criada com sucesso!' })
      // Resetar flags antes de recarregar
      carregandoContasRef.current = false
      carregandoMovimentacoesRef.current = false
      await carregarContas()
      await carregarMovimentacoes()
      setFormDataSaida({
        conta_id: '',
        valor: '',
        descricao: '',
        categoria: '',
        data_movimentacao: new Date().toISOString().split('T')[0],
        observacoes: '',
      })
      setTimeout(() => {
        setMostrarModalSaida(false)
      }, 1500)
    } catch (error: any) {
      console.error('Erro ao criar saída:', error)
      setMensagem({ tipo: 'erro', texto: error.message || 'Erro ao criar saída' })
    } finally {
      setSalvando(false)
    }
  }

  const salvarTransferencia = async () => {
    if (!formDataTransferencia.conta_origem_id || !formDataTransferencia.conta_destino_id || !formDataTransferencia.valor || !formDataTransferencia.descricao) {
      setMensagem({ tipo: 'erro', texto: 'Preencha todos os campos obrigatórios' })
      return
    }

    if (formDataTransferencia.conta_origem_id === formDataTransferencia.conta_destino_id) {
      setMensagem({ tipo: 'erro', texto: 'Conta de origem e destino não podem ser a mesma' })
      return
    }

    const valorNumber = parseFloat(formDataTransferencia.valor.replace(',', '.'))

    if (isNaN(valorNumber) || valorNumber <= 0) {
      setMensagem({ tipo: 'erro', texto: 'Valor inválido' })
      return
    }

    setSalvando(true)
    setMensagem({ tipo: null, texto: '' })

    try {
      const apiUrl = getApiBaseUrl()

      const adminData = localStorage.getItem('admin')
      const admin = adminData ? JSON.parse(adminData) : null

      const body = {
        conta_origem_id: formDataTransferencia.conta_origem_id,
        conta_destino_id: formDataTransferencia.conta_destino_id,
        valor: valorNumber,
        descricao: formDataTransferencia.descricao.trim(),
        data_movimentacao: formDataTransferencia.data_movimentacao,
        observacoes: formDataTransferencia.observacoes.trim() || null,
      }

      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      }
      if (admin?.id) {
        headers['x-user-id'] = admin.id
        headers['x-user-tipo'] = admin.tipo_usuario || 'administrativo'
        headers['x-user-nome'] = admin.nome_completo || null
      }

      const response = await fetch(`${apiUrl}/api/v1/caixas/movimentacoes/transferencia`, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao criar transferência')
      }

      setMensagem({ tipo: 'sucesso', texto: 'Transferência criada com sucesso!' })
      // Resetar flags antes de recarregar
      carregandoContasRef.current = false
      carregandoMovimentacoesRef.current = false
      await carregarContas()
      await carregarMovimentacoes()
      setFormDataTransferencia({
        conta_origem_id: '',
        conta_destino_id: '',
        valor: '',
        descricao: '',
        data_movimentacao: new Date().toISOString().split('T')[0],
        observacoes: '',
      })
      setTimeout(() => {
        setMostrarModalTransferencia(false)
      }, 1500)
    } catch (error: any) {
      console.error('Erro ao criar transferência:', error)
      setMensagem({ tipo: 'erro', texto: error.message || 'Erro ao criar transferência' })
    } finally {
      setSalvando(false)
    }
  }

  const excluirMovimentacao = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta movimentação? Esta ação não pode ser desfeita.')) {
      return
    }

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

      const response = await fetch(`${apiUrl}/api/v1/caixas/movimentacoes/${id}`, {
        method: 'DELETE',
        headers,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao excluir movimentação')
      }

      setMensagem({ tipo: 'sucesso', texto: 'Movimentação excluída com sucesso!' })
      // Resetar flags antes de recarregar
      carregandoContasRef.current = false
      carregandoMovimentacoesRef.current = false
      await carregarContas()
      await carregarMovimentacoes()
    } catch (error: any) {
      console.error('Erro ao excluir movimentação:', error)
      setMensagem({ tipo: 'erro', texto: error.message || 'Erro ao excluir movimentação' })
    }
  }

  if (!podeAcessar('caixas')) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Card className="p-8">
          <div className="flex flex-col items-center gap-4">
            <AlertCircle className="h-12 w-12 text-red-500" />
            <h2 className="text-xl font-bold">Acesso Negado</h2>
            <p className="text-gray-500">Você não tem permissão para acessar este módulo.</p>
          </div>
        </Card>
      </div>
    )
  }

  const contasAtivas = contas.filter(c => c.is_active).length
  const saldoTotal = contas.reduce((acc, conta) => {
    const saldo = typeof conta.saldo_atual === 'string' ? parseFloat(conta.saldo_atual) : conta.saldo_atual
    return acc + (isNaN(saldo) ? 0 : saldo)
  }, 0)

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2 text-gray-300">
            <Wallet className="h-8 w-8 text-amber-500" />
            Caixas
          </h1>
          <p className="text-gray-400 mt-1">Gerenciamento de contas e movimentações financeiras</p>
        </div>
        {podeEditar('caixas') && (
          <Button onClick={() => abrirModalConta()} className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white">
            <Plus className="h-4 w-4" />
            Nova Conta
          </Button>
        )}
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 bg-zinc-900 border-amber-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Total de Contas</p>
              <p className="text-2xl font-bold text-gray-300">{contas.length}</p>
            </div>
            <Building2 className="h-8 w-8 text-amber-500" />
          </div>
        </Card>
        <Card className="p-4 bg-zinc-900 border-amber-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Contas Ativas</p>
              <p className="text-2xl font-bold text-gray-300">{contasAtivas}</p>
            </div>
            <CheckCircle2 className="h-8 w-8 text-green-500" />
          </div>
        </Card>
        <Card className="p-4 bg-zinc-900 border-amber-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Saldo Total</p>
              <p className="text-2xl font-bold text-gray-300">{formatarPreco(saldoTotal)}</p>
            </div>
            <DollarSign className="h-8 w-8 text-green-500" />
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

      {/* Tabs para Contas e Movimentações */}
      <Tabs defaultValue="contas" className="space-y-4">
        <TabsList className="bg-zinc-800 border-amber-500/20">
          <TabsTrigger value="contas" className="text-gray-400 data-[state=active]:bg-amber-500/10 data-[state=active]:text-amber-500 data-[state=active]:text-gray-300">
            Contas
          </TabsTrigger>
          <TabsTrigger value="movimentacoes" className="text-gray-400 data-[state=active]:bg-amber-500/10 data-[state=active]:text-amber-500 data-[state=active]:text-gray-300">
            Movimentações
          </TabsTrigger>
        </TabsList>

        <TabsContent value="contas" className="space-y-4">
          {/* Busca */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar contas por nome, banco ou conta..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-zinc-800 border-amber-500/20 text-gray-300 placeholder:text-gray-500 focus:border-amber-500 focus:ring-amber-500/20"
              />
            </div>
            {podeEditar('caixas') && (
              <div className="flex gap-2">
                <Button onClick={() => setMostrarModalEntrada(true)} variant="outline" className="flex items-center gap-2 border-amber-500/20 text-gray-300 hover:bg-amber-500/10 hover:text-amber-500">
                  <TrendingUp className="h-4 w-4" />
                  Entrada
                </Button>
                <Button onClick={() => setMostrarModalSaida(true)} variant="outline" className="flex items-center gap-2 border-amber-500/20 text-gray-300 hover:bg-amber-500/10 hover:text-amber-500">
                  <TrendingDown className="h-4 w-4" />
                  Saída
                </Button>
                <Button onClick={() => setMostrarModalTransferencia(true)} variant="outline" className="flex items-center gap-2 border-amber-500/20 text-gray-300 hover:bg-amber-500/10 hover:text-amber-500">
                  <ArrowRightLeft className="h-4 w-4" />
                  Transferência
                </Button>
              </div>
            )}
          </div>

          {/* Lista de Contas */}
          {loading ? (
            <div className="flex items-center justify-center p-12">
              <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
            </div>
          ) : contasFiltradas.length === 0 ? (
            <Card className="p-12 text-center bg-zinc-900 border-amber-500/20">
              <Wallet className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-400">Nenhuma conta encontrada</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {contasFiltradas.map((conta) => (
                <Card key={conta.id} className="p-4 bg-zinc-900 border-amber-500/20 hover:border-amber-500/40 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-gray-300">{conta.nome}</h3>
                      <p className="text-sm text-gray-400">{formatarTipo(conta.tipo)}</p>
                    </div>
                    {!conta.is_active && (
                      <span className="px-2 py-1 text-xs bg-zinc-800 text-gray-400 rounded border border-zinc-700">Inativa</span>
                    )}
                  </div>
                  
                  {conta.banco && (
                    <div className="mt-2 text-sm text-gray-400">
                      <Building2 className="h-4 w-4 inline mr-1" />
                      {conta.banco}
                      {conta.agencia && conta.conta && ` - Ag: ${conta.agencia} / CC: ${conta.conta}`}
                    </div>
                  )}

                  <div className="mt-4 pt-4 border-t border-zinc-800">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">Saldo Atual:</span>
                      <span className={`font-bold text-lg ${
                        (typeof conta.saldo_atual === 'string' ? parseFloat(conta.saldo_atual) : conta.saldo_atual) >= 0
                          ? 'text-green-500'
                          : 'text-red-500'
                      }`}>
                        {formatarPreco(conta.saldo_atual)}
                      </span>
                    </div>
                  </div>

                  {podeEditar('caixas') && (
                    <div className="mt-4 flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => abrirModalConta(conta)}
                        className="flex-1 border-amber-500/20 text-gray-300 hover:bg-amber-500/10 hover:text-amber-500"
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Editar
                      </Button>
                      {podeExcluir('caixas') && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => excluirConta(conta.id)}
                          className="border-red-500/20 text-red-500 hover:bg-red-500/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="movimentacoes" className="space-y-4">
          {/* Lista de Movimentações */}
          {loading ? (
            <div className="flex items-center justify-center p-12">
              <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
            </div>
          ) : movimentacoes.length === 0 ? (
            <Card className="p-12 text-center bg-zinc-900 border-amber-500/20">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-400">Nenhuma movimentação encontrada</p>
            </Card>
          ) : (
            <div className="space-y-2">
              {movimentacoes.map((mov) => (
                <Card key={mov.id} className="p-4 bg-zinc-900 border-amber-500/20">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2 py-1 text-xs rounded ${
                          mov.tipo_movimentacao === 'entrada' || mov.tipo_movimentacao === 'saldo_inicial'
                            ? 'bg-green-500/10 text-green-500 border border-green-500/30'
                            : mov.tipo_movimentacao === 'saida'
                            ? 'bg-red-500/10 text-red-500 border border-red-500/30'
                            : 'bg-blue-500/10 text-blue-500 border border-blue-500/30'
                        }`}>
                          {formatarTipoMovimentacao(mov.tipo_movimentacao)}
                        </span>
                        <span className="text-sm text-gray-400">
                          {new Date(mov.data_movimentacao).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                      <h4 className="font-semibold text-gray-300">{mov.descricao}</h4>
                      {mov.tipo_movimentacao === 'transferencia' ? (
                        <p className="text-sm text-gray-400 mt-1">
                          {mov.conta_origem_nome} → {mov.conta_destino_nome}
                        </p>
                      ) : (
                        <p className="text-sm text-gray-400 mt-1">{mov.conta_nome}</p>
                      )}
                      {mov.categoria && (
                        <p className="text-xs text-gray-500 mt-1">Categoria: {mov.categoria}</p>
                      )}
                      {mov.observacoes && (
                        <p className="text-sm text-gray-500 mt-1 italic">{mov.observacoes}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className={`font-bold text-lg ${
                        mov.tipo_movimentacao === 'entrada' || mov.tipo_movimentacao === 'saldo_inicial'
                          ? 'text-green-500'
                          : mov.tipo_movimentacao === 'saida'
                          ? 'text-red-500'
                          : 'text-blue-500'
                      }`}>
                        {mov.tipo_movimentacao === 'saida' ? '-' : '+'}
                        {formatarPreco(mov.valor)}
                      </p>
                      {podeExcluir('caixas') && mov.tipo_movimentacao !== 'saldo_inicial' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => excluirMovimentacao(mov.id)}
                          className="mt-2 text-red-500 hover:text-red-400 hover:bg-red-500/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Modal de Conta */}
      <Dialog open={mostrarModalConta} onOpenChange={setMostrarModalConta}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-zinc-900 border-amber-500/20 text-gray-300">
          <DialogHeader>
            <DialogTitle className="text-gray-300">{contaEditando ? 'Editar Conta' : 'Nova Conta'}</DialogTitle>
            <DialogDescription className="text-gray-400">
              {contaEditando ? 'Edite as informações da conta' : 'Preencha os dados para criar uma nova conta'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="nome" className="text-gray-300">Nome da Conta *</Label>
                <Input
                  id="nome"
                  value={formDataConta.nome}
                  onChange={(e) => setFormDataConta({ ...formDataConta, nome: e.target.value })}
                  placeholder="Ex: Caixa Principal"
                  className="bg-zinc-800 border-amber-500/20 text-gray-300 placeholder:text-gray-500 focus:border-amber-500 focus:ring-amber-500/20"
                />
              </div>
              <div>
                <Label htmlFor="tipo" className="text-gray-300">Tipo *</Label>
                <Select
                  value={formDataConta.tipo}
                  onValueChange={(value) => setFormDataConta({ ...formDataConta, tipo: value })}
                >
                  <SelectTrigger className="bg-zinc-800 border-amber-500/20 text-gray-300">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-amber-500/20">
                    <SelectItem value="caixa" className="text-gray-300">Caixa</SelectItem>
                    <SelectItem value="conta_corrente" className="text-gray-300">Conta Corrente</SelectItem>
                    <SelectItem value="poupanca" className="text-gray-300">Poupança</SelectItem>
                    <SelectItem value="investimento" className="text-gray-300">Investimento</SelectItem>
                    <SelectItem value="outro" className="text-gray-300">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="banco" className="text-gray-300">Banco</Label>
                <Input
                  id="banco"
                  value={formDataConta.banco}
                  onChange={(e) => setFormDataConta({ ...formDataConta, banco: e.target.value })}
                  placeholder="Nome do banco"
                  className="bg-zinc-800 border-amber-500/20 text-gray-300 placeholder:text-gray-500 focus:border-amber-500 focus:ring-amber-500/20"
                />
              </div>
              <div>
                <Label htmlFor="agencia" className="text-gray-300">Agência</Label>
                <Input
                  id="agencia"
                  value={formDataConta.agencia}
                  onChange={(e) => setFormDataConta({ ...formDataConta, agencia: e.target.value })}
                  placeholder="Número da agência"
                  className="bg-zinc-800 border-amber-500/20 text-gray-300 placeholder:text-gray-500 focus:border-amber-500 focus:ring-amber-500/20"
                />
              </div>
              <div>
                <Label htmlFor="conta" className="text-gray-300">Conta</Label>
                <Input
                  id="conta"
                  value={formDataConta.conta}
                  onChange={(e) => setFormDataConta({ ...formDataConta, conta: e.target.value })}
                  placeholder="Número da conta"
                  className="bg-zinc-800 border-amber-500/20 text-gray-300 placeholder:text-gray-500 focus:border-amber-500 focus:ring-amber-500/20"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="saldo_inicial" className="text-gray-300">Saldo Inicial</Label>
              <Input
                id="saldo_inicial"
                type="number"
                step="0.01"
                value={formDataConta.saldo_inicial}
                onChange={(e) => setFormDataConta({ ...formDataConta, saldo_inicial: e.target.value })}
                placeholder="0.00"
                disabled={!!contaEditando}
                className="bg-zinc-800 border-amber-500/20 text-gray-300 placeholder:text-gray-500 focus:border-amber-500 focus:ring-amber-500/20 disabled:opacity-50"
              />
              {contaEditando && (
                <p className="text-xs text-gray-500 mt-1">O saldo inicial não pode ser alterado após a criação</p>
              )}
            </div>

            <div>
              <Label htmlFor="descricao" className="text-gray-300">Descrição</Label>
              <Input
                id="descricao"
                value={formDataConta.descricao}
                onChange={(e) => setFormDataConta({ ...formDataConta, descricao: e.target.value })}
                placeholder="Descrição adicional (opcional)"
                className="bg-zinc-800 border-amber-500/20 text-gray-300 placeholder:text-gray-500 focus:border-amber-500 focus:ring-amber-500/20"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_active"
                checked={formDataConta.is_active}
                onChange={(e) => setFormDataConta({ ...formDataConta, is_active: e.target.checked })}
                className="rounded accent-amber-500"
              />
              <Label htmlFor="is_active" className="cursor-pointer text-gray-300">Conta ativa</Label>
            </div>

            <AnimatePresence>
              {mensagem.tipo && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className={`p-3 rounded-lg border flex items-center gap-2 ${
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

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={fecharModalConta} disabled={salvando} className="border-amber-500/20 text-gray-300 hover:bg-amber-500/10 hover:text-amber-500">
                <X className="h-4 w-4 mr-1" />
                Cancelar
              </Button>
              <Button onClick={salvarConta} disabled={salvando} className="bg-amber-500 hover:bg-amber-600 text-white">
                {salvando ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-1" />
                    Salvar
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Entrada */}
      <Dialog open={mostrarModalEntrada} onOpenChange={setMostrarModalEntrada}>
        <DialogContent className="bg-zinc-900 border-amber-500/20 text-gray-300">
          <DialogHeader>
            <DialogTitle className="text-gray-300">Nova Entrada</DialogTitle>
            <DialogDescription className="text-gray-400">Registre uma entrada manual na conta</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div>
                <Label htmlFor="entrada_conta_id" className="text-gray-300">Conta *</Label>
                <Select
                  value={formDataEntrada.conta_id}
                  onValueChange={(value) => setFormDataEntrada({ ...formDataEntrada, conta_id: value })}
                >
                  <SelectTrigger className="bg-zinc-800 border-amber-500/20 text-gray-300">
                    <SelectValue placeholder="Selecione a conta" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-amber-500/20">
                    {contas.filter(c => c.is_active).map((conta) => (
                      <SelectItem key={conta.id} value={conta.id} className="text-gray-300">
                        {conta.nome} - {formatarPreco(conta.saldo_atual)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="entrada_valor" className="text-gray-300">Valor *</Label>
                <Input
                  id="entrada_valor"
                  type="number"
                  step="0.01"
                  value={formDataEntrada.valor}
                  onChange={(e) => setFormDataEntrada({ ...formDataEntrada, valor: e.target.value })}
                  placeholder="0.00"
                  className="bg-zinc-800 border-amber-500/20 text-gray-300 placeholder:text-gray-500 focus:border-amber-500 focus:ring-amber-500/20"
                />
              </div>

              <div>
                <Label htmlFor="entrada_descricao" className="text-gray-300">Descrição *</Label>
                <Input
                  id="entrada_descricao"
                  value={formDataEntrada.descricao}
                  onChange={(e) => setFormDataEntrada({ ...formDataEntrada, descricao: e.target.value })}
                  placeholder="Descrição da entrada"
                  className="bg-zinc-800 border-amber-500/20 text-gray-300 placeholder:text-gray-500 focus:border-amber-500 focus:ring-amber-500/20"
                />
              </div>

              <div>
                <Label htmlFor="entrada_categoria" className="text-gray-300">Categoria</Label>
                <Input
                  id="entrada_categoria"
                  value={formDataEntrada.categoria}
                  onChange={(e) => setFormDataEntrada({ ...formDataEntrada, categoria: e.target.value })}
                  placeholder="Categoria (opcional)"
                  className="bg-zinc-800 border-amber-500/20 text-gray-300 placeholder:text-gray-500 focus:border-amber-500 focus:ring-amber-500/20"
                />
              </div>

              <div>
                <Label htmlFor="entrada_data" className="text-gray-300">Data *</Label>
                <Input
                  id="entrada_data"
                  type="date"
                  value={formDataEntrada.data_movimentacao}
                  onChange={(e) => setFormDataEntrada({ ...formDataEntrada, data_movimentacao: e.target.value })}
                  className="bg-zinc-800 border-amber-500/20 text-gray-300 focus:border-amber-500 focus:ring-amber-500/20"
                />
              </div>

              <div>
                <Label htmlFor="entrada_observacoes" className="text-gray-300">Observações</Label>
                <Input
                  id="entrada_observacoes"
                  value={formDataEntrada.observacoes}
                  onChange={(e) => setFormDataEntrada({ ...formDataEntrada, observacoes: e.target.value })}
                  placeholder="Observações adicionais (opcional)"
                  className="bg-zinc-800 border-amber-500/20 text-gray-300 placeholder:text-gray-500 focus:border-amber-500 focus:ring-amber-500/20"
                />
              </div>

            <AnimatePresence>
              {mensagem.tipo && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className={`p-3 rounded-lg border flex items-center gap-2 ${
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

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setMostrarModalEntrada(false)} disabled={salvando} className="border-amber-500/20 text-gray-300 hover:bg-amber-500/10 hover:text-amber-500">
                <X className="h-4 w-4 mr-1" />
                Cancelar
              </Button>
              <Button onClick={salvarEntrada} disabled={salvando} className="bg-amber-500 hover:bg-amber-600 text-white">
                {salvando ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-1" />
                    Salvar
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Saída */}
      <Dialog open={mostrarModalSaida} onOpenChange={setMostrarModalSaida}>
        <DialogContent className="bg-zinc-900 border-amber-500/20 text-gray-300">
          <DialogHeader>
            <DialogTitle className="text-gray-300">Nova Saída</DialogTitle>
            <DialogDescription className="text-gray-400">Registre uma saída manual na conta</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div>
                <Label htmlFor="saida_conta_id" className="text-gray-300">Conta *</Label>
                <Select
                  value={formDataSaida.conta_id}
                  onValueChange={(value) => setFormDataSaida({ ...formDataSaida, conta_id: value })}
                >
                  <SelectTrigger className="bg-zinc-800 border-amber-500/20 text-gray-300">
                    <SelectValue placeholder="Selecione a conta" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-amber-500/20">
                    {contas.filter(c => c.is_active).map((conta) => (
                      <SelectItem key={conta.id} value={conta.id} className="text-gray-300">
                        {conta.nome} - {formatarPreco(conta.saldo_atual)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="saida_valor" className="text-gray-300">Valor *</Label>
                <Input
                  id="saida_valor"
                  type="number"
                  step="0.01"
                  value={formDataSaida.valor}
                  onChange={(e) => setFormDataSaida({ ...formDataSaida, valor: e.target.value })}
                  placeholder="0.00"
                  className="bg-zinc-800 border-amber-500/20 text-gray-300 placeholder:text-gray-500 focus:border-amber-500 focus:ring-amber-500/20"
                />
              </div>

              <div>
                <Label htmlFor="saida_descricao" className="text-gray-300">Descrição *</Label>
                <Input
                  id="saida_descricao"
                  value={formDataSaida.descricao}
                  onChange={(e) => setFormDataSaida({ ...formDataSaida, descricao: e.target.value })}
                  placeholder="Descrição da saída"
                  className="bg-zinc-800 border-amber-500/20 text-gray-300 placeholder:text-gray-500 focus:border-amber-500 focus:ring-amber-500/20"
                />
              </div>

              <div>
                <Label htmlFor="saida_categoria" className="text-gray-300">Categoria</Label>
                <Input
                  id="saida_categoria"
                  value={formDataSaida.categoria}
                  onChange={(e) => setFormDataSaida({ ...formDataSaida, categoria: e.target.value })}
                  placeholder="Categoria (opcional)"
                  className="bg-zinc-800 border-amber-500/20 text-gray-300 placeholder:text-gray-500 focus:border-amber-500 focus:ring-amber-500/20"
                />
              </div>

              <div>
                <Label htmlFor="saida_data" className="text-gray-300">Data *</Label>
                <Input
                  id="saida_data"
                  type="date"
                  value={formDataSaida.data_movimentacao}
                  onChange={(e) => setFormDataSaida({ ...formDataSaida, data_movimentacao: e.target.value })}
                  className="bg-zinc-800 border-amber-500/20 text-gray-300 focus:border-amber-500 focus:ring-amber-500/20"
                />
              </div>

              <div>
                <Label htmlFor="saida_observacoes" className="text-gray-300">Observações</Label>
                <Input
                  id="saida_observacoes"
                  value={formDataSaida.observacoes}
                  onChange={(e) => setFormDataSaida({ ...formDataSaida, observacoes: e.target.value })}
                  placeholder="Observações adicionais (opcional)"
                  className="bg-zinc-800 border-amber-500/20 text-gray-300 placeholder:text-gray-500 focus:border-amber-500 focus:ring-amber-500/20"
                />
              </div>

            <AnimatePresence>
              {mensagem.tipo && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className={`p-3 rounded-lg border flex items-center gap-2 ${
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

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setMostrarModalSaida(false)} disabled={salvando} className="border-amber-500/20 text-gray-300 hover:bg-amber-500/10 hover:text-amber-500">
                <X className="h-4 w-4 mr-1" />
                Cancelar
              </Button>
              <Button onClick={salvarSaida} disabled={salvando} className="bg-amber-500 hover:bg-amber-600 text-white">
                {salvando ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-1" />
                    Salvar
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Transferência */}
      <Dialog open={mostrarModalTransferencia} onOpenChange={setMostrarModalTransferencia}>
        <DialogContent className="bg-zinc-900 border-amber-500/20 text-gray-300">
          <DialogHeader>
            <DialogTitle className="text-gray-300">Nova Transferência</DialogTitle>
            <DialogDescription className="text-gray-400">Transfira valores entre contas</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div>
              <Label htmlFor="transferencia_conta_origem" className="text-gray-300">Conta de Origem *</Label>
              <Select
                value={formDataTransferencia.conta_origem_id}
                onValueChange={(value) => setFormDataTransferencia({ ...formDataTransferencia, conta_origem_id: value })}
              >
                <SelectTrigger className="bg-zinc-800 border-amber-500/20 text-gray-300">
                  <SelectValue placeholder="Selecione a conta de origem" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-amber-500/20">
                  {contas.filter(c => c.is_active).map((conta) => (
                    <SelectItem key={conta.id} value={conta.id} className="text-gray-300">
                      {conta.nome} - {formatarPreco(conta.saldo_atual)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="transferencia_conta_destino" className="text-gray-300">Conta de Destino *</Label>
              <Select
                value={formDataTransferencia.conta_destino_id}
                onValueChange={(value) => setFormDataTransferencia({ ...formDataTransferencia, conta_destino_id: value })}
              >
                <SelectTrigger className="bg-zinc-800 border-amber-500/20 text-gray-300">
                  <SelectValue placeholder="Selecione a conta de destino" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-amber-500/20">
                  {contas.filter(c => c.is_active && c.id !== formDataTransferencia.conta_origem_id).map((conta) => (
                    <SelectItem key={conta.id} value={conta.id} className="text-gray-300">
                      {conta.nome} - {formatarPreco(conta.saldo_atual)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="transferencia_valor" className="text-gray-300">Valor *</Label>
              <Input
                id="transferencia_valor"
                type="number"
                step="0.01"
                value={formDataTransferencia.valor}
                onChange={(e) => setFormDataTransferencia({ ...formDataTransferencia, valor: e.target.value })}
                placeholder="0.00"
                className="bg-zinc-800 border-amber-500/20 text-gray-300 placeholder:text-gray-500 focus:border-amber-500 focus:ring-amber-500/20"
              />
            </div>

            <div>
              <Label htmlFor="transferencia_descricao" className="text-gray-300">Descrição *</Label>
              <Input
                id="transferencia_descricao"
                value={formDataTransferencia.descricao}
                onChange={(e) => setFormDataTransferencia({ ...formDataTransferencia, descricao: e.target.value })}
                placeholder="Descrição da transferência"
                className="bg-zinc-800 border-amber-500/20 text-gray-300 placeholder:text-gray-500 focus:border-amber-500 focus:ring-amber-500/20"
              />
            </div>

            <div>
              <Label htmlFor="transferencia_data" className="text-gray-300">Data *</Label>
              <Input
                id="transferencia_data"
                type="date"
                value={formDataTransferencia.data_movimentacao}
                onChange={(e) => setFormDataTransferencia({ ...formDataTransferencia, data_movimentacao: e.target.value })}
                className="bg-zinc-800 border-amber-500/20 text-gray-300 focus:border-amber-500 focus:ring-amber-500/20"
              />
            </div>

            <div>
              <Label htmlFor="transferencia_observacoes" className="text-gray-300">Observações</Label>
              <Input
                id="transferencia_observacoes"
                value={formDataTransferencia.observacoes}
                onChange={(e) => setFormDataTransferencia({ ...formDataTransferencia, observacoes: e.target.value })}
                placeholder="Observações adicionais (opcional)"
                className="bg-zinc-800 border-amber-500/20 text-gray-300 placeholder:text-gray-500 focus:border-amber-500 focus:ring-amber-500/20"
              />
            </div>

            <AnimatePresence>
              {mensagem.tipo && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className={`p-3 rounded-lg border flex items-center gap-2 ${
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

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setMostrarModalTransferencia(false)} disabled={salvando} className="border-amber-500/20 text-gray-300 hover:bg-amber-500/10 hover:text-amber-500">
                <X className="h-4 w-4 mr-1" />
                Cancelar
              </Button>
              <Button onClick={salvarTransferencia} disabled={salvando} className="bg-amber-500 hover:bg-amber-600 text-white">
                {salvando ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-1" />
                    Salvar
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

