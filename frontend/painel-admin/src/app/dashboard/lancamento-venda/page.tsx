'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { ShoppingCart, User, Calendar, Scissors, Package, DollarSign, Percent, Minus, Plus, X, Save, Loader2, AlertCircle, CheckCircle2, Trash2, Ticket, FileText, Search } from 'lucide-react'
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

interface Funcionario {
  id: string
  nome_completo: string
}

interface Cliente {
  id: string
  nome_completo: string
}

interface Agendamento {
  id: string
  cliente_id: string
  cliente_nome: string
  servico_id: string
  servico_nome: string
  servico_preco: number | string
  hora_inicio: string
  hora_fim: string
  valor_servico: number | string
}

interface Servico {
  id: string
  nome: string
  preco: number | string
  duracao_minutos: number
}

interface Produto {
  id: string
  codigo: string
  descricao: string
  preco_venda: number | string
}

interface Conta {
  id: string
  nome: string
  saldo_atual: number | string
}

interface ServicoVenda {
  servico_id: string
  servico_nome: string
  agendamento_id?: string
  valor: number | string
  podeAbaterAssinatura?: boolean // Indica se pode ser abatido de assinatura
}

interface ProdutoVenda {
  produto_id: string
  produto_codigo: string
  produto_descricao: string
  quantidade: number
  valor_unitario: number | string
  valor_total: number | string
  podeAbaterAssinatura?: boolean // Indica se pode ser abatido de assinatura
  quantidadeAbatida?: number // Quantidade que será abatida da assinatura
}

interface Assinatura {
  id: string
  nome: string
  valor_liquido: number
}

interface AssinaturaVenda {
  assinatura_id: string
  assinatura_nome: string
  valor: number | string
}

export default function LancamentoVendaPage() {
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([])
  const [servicos, setServicos] = useState<Servico[]>([])
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [assinaturas, setAssinaturas] = useState<Assinatura[]>([])
  const [contas, setContas] = useState<Conta[]>([])
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([])
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [buscandoClientes, setBuscandoClientes] = useState(false)
  const [clienteSelecionado, setClienteSelecionado] = useState<Cliente | null>(null)
  const [searchTermCliente, setSearchTermCliente] = useState('')
  const [servicosDisponiveis, setServicosDisponiveis] = useState<{ servico_id: string; servico_nome: string; quantidade_disponivel: number }[]>([])
  const [produtosDisponiveis, setProdutosDisponiveis] = useState<{ produto_id: string; produto_descricao: string; quantidade_disponivel: number }[]>([])
  const [loading, setLoading] = useState(false)
  const [salvando, setSalvando] = useState(false)
  const [mensagem, setMensagem] = useState<{ tipo: 'sucesso' | 'erro' | null; texto: string }>({ tipo: null, texto: '' })
  const { podeAcessar, podeEditar } = usePermissions()

  // Formulário principal
  const [formData, setFormData] = useState({
    funcionario_id: '',
    data_venda: new Date().toISOString().split('T')[0],
    cliente_id: '',
    desconto_percentual: '',
    desconto_valor: '',
    cupom_codigo: '',
    forma_pagamento: '',
    caixa_id: '',
    primeiro_vencimento_boleto: '',
    observacoes: '',
  })

  // Estado do cupom validado
  const [cupomValidado, setCupomValidado] = useState<{
    codigo: string
    nome: string
    tipo_desconto: string
    valor_desconto: number
    aplicar_em: string
  } | null>(null)
  const [validandoCupom, setValidandoCupom] = useState(false)

  // Serviços, produtos e assinaturas da venda
  const [servicosVenda, setServicosVenda] = useState<ServicoVenda[]>([])
  const [produtosVenda, setProdutosVenda] = useState<ProdutoVenda[]>([])
  const [assinaturasVenda, setAssinaturasVenda] = useState<AssinaturaVenda[]>([])

  // Refs
  const carregandoRef = useRef(false)

  // Carregar dados iniciais
  useEffect(() => {
    if (podeAcessar('lancamento_venda')) {
      carregarFuncionarios()
      carregarServicos()
      carregarProdutos()
      carregarAssinaturas()
      carregarContas()
    }
  }, [podeAcessar])

  // Carregar agendamentos quando data e funcionário mudarem
  useEffect(() => {
    if (formData.funcionario_id && formData.data_venda) {
      carregarAgendamentos()
    } else {
      setAgendamentos([])
    }
  }, [formData.funcionario_id, formData.data_venda])

  const carregarFuncionarios = useCallback(async () => {
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

      const response = await fetch(`${apiUrl}/api/v1/funcionarios?is_active=true`, { headers })
      if (response.ok) {
        const data = await response.json()
        // Filtrar apenas funcionários ativos (não masters)
        const funcionariosFiltrados = (data.funcionarios || []).filter((f: any) => 
          f.tipo_usuario !== 'master' && f.is_active === true
        )
        setFuncionarios(funcionariosFiltrados)
      }
    } catch (error) {
      console.error('Erro ao carregar funcionários:', error)
    }
  }, [])

  const carregarServicos = useCallback(async () => {
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

      const response = await fetch(`${apiUrl}/api/v1/servicos?is_active=true`, { headers })
      if (response.ok) {
        const data = await response.json()
        setServicos(data.servicos || [])
      }
    } catch (error) {
      console.error('Erro ao carregar serviços:', error)
    }
  }, [])

  const carregarProdutos = useCallback(async () => {
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

      const response = await fetch(`${apiUrl}/api/v1/produtos?is_active=true`, { headers })
      if (response.ok) {
        const data = await response.json()
        setProdutos(data.produtos || [])
      }
    } catch (error) {
      console.error('Erro ao carregar produtos:', error)
    }
  }, [])

  const carregarAssinaturas = useCallback(async () => {
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

      const response = await fetch(`${apiUrl}/api/v1/assinaturas?is_active=true`, { headers })
      if (response.ok) {
        const data = await response.json()
        setAssinaturas(data.assinaturas || [])
      }
    } catch (error) {
      console.error('Erro ao carregar assinaturas:', error)
    }
  }, [])

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

  const carregarAgendamentos = useCallback(async () => {
    if (!formData.funcionario_id || !formData.data_venda || carregandoRef.current) {
      return
    }

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

      const response = await fetch(
        `${apiUrl}/api/v1/vendas/agendamentos?data=${formData.data_venda}&funcionario_id=${formData.funcionario_id}`,
        { headers }
      )

      if (response.ok) {
        const data = await response.json()
        setAgendamentos(data.agendamentos || [])
      }
    } catch (error) {
      console.error('Erro ao carregar agendamentos:', error)
    } finally {
      setLoading(false)
      carregandoRef.current = false
    }
  }, [formData.funcionario_id, formData.data_venda])

  // Adicionar agendamento à venda
  const adicionarAgendamento = (agendamento: Agendamento) => {
    // Verificar se já foi adicionado
    if (servicosVenda.some(s => s.agendamento_id === agendamento.id)) {
      setMensagem({ tipo: 'erro', texto: 'Este agendamento já foi adicionado' })
      return
    }

    // Se já não há cliente selecionado, preencher com o cliente do agendamento
    if (!formData.cliente_id) {
      setFormData({ ...formData, cliente_id: agendamento.cliente_id })
      // Criar objeto cliente com os dados do agendamento
      setClienteSelecionado({
        id: agendamento.cliente_id,
        nome_completo: agendamento.cliente_nome
      })
      // Carregar serviços/produtos disponíveis do cliente (será verificado depois)
      carregarServicosProdutosDisponiveis(agendamento.cliente_id)
    }

    // Verificar se o serviço está disponível em assinatura (usando os já carregados)
    const servicoDisponivel = servicosDisponiveis.find(s => s.servico_id === agendamento.servico_id)
    const podeAbater = servicoDisponivel && servicoDisponivel.quantidade_disponivel > 0

    const novoServico: ServicoVenda = {
      servico_id: agendamento.servico_id,
      servico_nome: agendamento.servico_nome,
      agendamento_id: agendamento.id,
      valor: podeAbater ? 0 : parseFloat(agendamento.valor_servico.toString()), // Se pode abater, valor = 0
      podeAbaterAssinatura: podeAbater,
    }

    setServicosVenda([...servicosVenda, novoServico])
  }

  // Buscar clientes
  const buscarClientes = useCallback(async (termo: string) => {
    if (!termo || termo.trim().length < 2) {
      setClientes([])
      return
    }

    setBuscandoClientes(true)
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

      const response = await fetch(`${apiUrl}/api/v1/crm/buscar-clientes?search=${encodeURIComponent(termo)}`, { headers })
      if (response.ok) {
        const data = await response.json()
        setClientes(data.clientes || [])
      }
    } catch (error) {
      console.error('Erro ao buscar clientes:', error)
      setClientes([])
    } finally {
      setBuscandoClientes(false)
    }
  }, [])

  // Selecionar cliente manualmente
  const selecionarCliente = (cliente: Cliente) => {
    setClienteSelecionado(cliente)
    setFormData({ ...formData, cliente_id: cliente.id })
    setSearchTermCliente('')
    setClientes([])
    // Carregar serviços/produtos disponíveis do cliente
    carregarServicosProdutosDisponiveis(cliente.id)
  }

  // Limpar seleção de cliente
  const limparCliente = () => {
    setClienteSelecionado(null)
    setFormData({ ...formData, cliente_id: '' })
    setSearchTermCliente('')
    setClientes([])
    setServicosDisponiveis([])
    setProdutosDisponiveis([])
  }

  // Carregar serviços/produtos disponíveis do cliente
  const carregarServicosProdutosDisponiveis = useCallback(async (clienteId: string) => {
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

      const response = await fetch(`${apiUrl}/api/v1/vendas/cliente/${clienteId}/servicos-produtos-disponiveis`, { headers })
      if (response.ok) {
        const data = await response.json()
        setServicosDisponiveis(data.servicos_disponiveis || [])
        setProdutosDisponiveis(data.produtos_disponiveis || [])
      } else {
        setServicosDisponiveis([])
        setProdutosDisponiveis([])
      }
    } catch (error) {
      console.error('Erro ao carregar serviços/produtos disponíveis:', error)
      setServicosDisponiveis([])
      setProdutosDisponiveis([])
    }
  }, [])

  // Efeito para buscar clientes quando o termo de busca mudar
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTermCliente.trim().length >= 2) {
        buscarClientes(searchTermCliente)
      } else {
        setClientes([])
      }
    }, 300) // Debounce de 300ms

    return () => clearTimeout(timeoutId)
  }, [searchTermCliente, buscarClientes])

  // Remover serviço
  const removerServico = (index: number) => {
    setServicosVenda(servicosVenda.filter((_, i) => i !== index))
  }

  // Estado para modal de adicionar serviço
  const [mostrarModalServico, setMostrarModalServico] = useState(false)
  const [servicoSelecionado, setServicoSelecionado] = useState('')
  const [valorServicoManual, setValorServicoManual] = useState('')

  // Adicionar serviço manual
  const adicionarServicoManual = () => {
    if (!servicoSelecionado) {
      setMensagem({ tipo: 'erro', texto: 'Selecione um serviço' })
      return
    }

    const servico = servicos.find(s => s.id === servicoSelecionado)
    if (!servico) {
      setMensagem({ tipo: 'erro', texto: 'Serviço não encontrado' })
      return
    }

    // Verificar se o serviço está disponível em assinatura
    const servicoDisponivel = servicosDisponiveis.find(s => s.servico_id === servico.id)
    const podeAbater = servicoDisponivel && servicoDisponivel.quantidade_disponivel > 0

    // Se pode abater, valor = 0. Caso contrário, usar valor informado ou preço do serviço
    let valor = 0
    if (!podeAbater) {
      valor = valorServicoManual ? parseFloat(valorServicoManual) : parseFloat(servico.preco.toString())
      if (isNaN(valor) || valor <= 0) {
        setMensagem({ tipo: 'erro', texto: 'Valor inválido' })
        return
      }
    }

    const novoServico: ServicoVenda = {
      servico_id: servico.id,
      servico_nome: servico.nome,
      valor: valor, // Se pode abater, será 0
      podeAbaterAssinatura: podeAbater,
    }

    setServicosVenda([...servicosVenda, novoServico])
    setMostrarModalServico(false)
    setServicoSelecionado('')
    setValorServicoManual('')
  }

  // Adicionar produto
  const adicionarProduto = (produto: Produto) => {
    // Verificar se o produto está disponível em assinatura
    const produtoDisponivel = produtosDisponiveis.find(p => p.produto_id === produto.id)
    const quantidadeDisponivel = produtoDisponivel ? produtoDisponivel.quantidade_disponivel : 0
    const podeAbater = quantidadeDisponivel > 0

    const produtoExistente = produtosVenda.find(p => p.produto_id === produto.id)
    if (produtoExistente) {
      // Aumentar quantidade
      const novaQuantidade = produtoExistente.quantidade + 1
      // Calcular quanto será abatido e quanto será pago
      const quantidadeAbatida = podeAbater ? Math.min(novaQuantidade, quantidadeDisponivel) : 0
      const quantidadePaga = novaQuantidade - quantidadeAbatida
      const valorUnitario = parseFloat(produtoExistente.valor_unitario.toString())
      
      setProdutosVenda(produtosVenda.map(p =>
        p.produto_id === produto.id
          ? {
              ...p,
              quantidade: novaQuantidade,
              quantidadeAbatida: quantidadeAbatida,
              valor_total: quantidadePaga * valorUnitario,
              podeAbaterAssinatura: podeAbater
            }
          : p
      ))
    } else {
      // Novo produto
      const quantidadeAbatida = podeAbater ? Math.min(1, quantidadeDisponivel) : 0
      const quantidadePaga = 1 - quantidadeAbatida
      const valorUnitario = parseFloat(produto.preco_venda.toString())
      
      const novoProduto: ProdutoVenda = {
        produto_id: produto.id,
        produto_codigo: produto.codigo,
        produto_descricao: produto.descricao,
        quantidade: 1,
        valor_unitario: valorUnitario,
        valor_total: quantidadePaga * valorUnitario,
        podeAbaterAssinatura: podeAbater,
        quantidadeAbatida: quantidadeAbatida
      }
      setProdutosVenda([...produtosVenda, novoProduto])
    }
  }

  // Remover produto
  const removerProduto = (index: number) => {
    setProdutosVenda(produtosVenda.filter((_, i) => i !== index))
  }

  // Atualizar quantidade de produto
  const atualizarQuantidadeProduto = (index: number, quantidade: number) => {
    if (quantidade <= 0) {
      removerProduto(index)
      return
    }

    const produto = produtosVenda[index]
    // Verificar disponibilidade na assinatura
    const produtoDisponivel = produtosDisponiveis.find(p => p.produto_id === produto.produto_id)
    const quantidadeDisponivel = produtoDisponivel ? produtoDisponivel.quantidade_disponivel : 0
    const podeAbater = quantidadeDisponivel > 0
    
    // Calcular quanto será abatido e quanto será pago
    const quantidadeAbatida = podeAbater ? Math.min(quantidade, quantidadeDisponivel) : 0
    const quantidadePaga = quantidade - quantidadeAbatida
    const valorUnitario = parseFloat(produto.valor_unitario.toString())

    setProdutosVenda(produtosVenda.map((p, i) =>
      i === index
        ? {
            ...p,
            quantidade,
            quantidadeAbatida: quantidadeAbatida,
            valor_total: quantidadePaga * valorUnitario,
            podeAbaterAssinatura: podeAbater
          }
        : p
    ))
  }

  // Adicionar assinatura
  const adicionarAssinatura = (assinatura: Assinatura) => {
    const assinaturaExistente = assinaturasVenda.find(a => a.assinatura_id === assinatura.id)
    if (assinaturaExistente) {
      setMensagem({ tipo: 'erro', texto: 'Esta assinatura já foi adicionada' })
      return
    }

    const novaAssinatura: AssinaturaVenda = {
      assinatura_id: assinatura.id,
      assinatura_nome: assinatura.nome,
      valor: assinatura.valor_liquido,
    }
    setAssinaturasVenda([...assinaturasVenda, novaAssinatura])
  }

  // Remover assinatura
  const removerAssinatura = (index: number) => {
    setAssinaturasVenda(assinaturasVenda.filter((_, i) => i !== index))
  }

  // Calcular totais
  const calcularTotais = () => {
    let valorTotal = 0

    // Soma serviços
    servicosVenda.forEach(s => {
      valorTotal += parseFloat(s.valor.toString())
    })

    // Soma produtos
    produtosVenda.forEach(p => {
      valorTotal += parseFloat(p.valor_total.toString())
    })

    // Soma assinaturas
    assinaturasVenda.forEach(a => {
      valorTotal += parseFloat(a.valor.toString())
    })

    // Aplicar descontos
    const descontoPercentual = parseFloat(formData.desconto_percentual) || 0
    const descontoValor = parseFloat(formData.desconto_valor) || 0

    const descontoPorPercentual = valorTotal * (descontoPercentual / 100)
    const valorLiquido = valorTotal - descontoPorPercentual - descontoValor

    return {
      valorTotal,
      descontoPorPercentual,
      descontoValor,
      valorLiquido: Math.max(0.01, valorLiquido) // Mínimo de 1 centavo para permitir vendas totalmente cobertas por assinatura
    }
  }

  // Validar cupom
  const validarCupom = async (codigo: string) => {
    if (!codigo.trim()) {
      setCupomValidado(null)
      return
    }

    setValidandoCupom(true)
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

      const clienteId = formData.cliente_id ? `?cliente_id=${formData.cliente_id}` : ''
      const response = await fetch(`${apiUrl}/api/v1/cupons-fidelidades/cupons/validar/${encodeURIComponent(codigo.trim().toUpperCase())}${clienteId}`, {
        headers,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Cupom não encontrado' }))
        setMensagem({ tipo: 'erro', texto: errorData.error || 'Cupom inválido ou não encontrado' })
        setCupomValidado(null)
        return
      }

      const data = await response.json()
      if (data.cupom && data.valido) {
        setCupomValidado(data.cupom)
        setMensagem({ tipo: 'sucesso', texto: `Cupom "${data.cupom.nome}" aplicado com sucesso!` })
        setTimeout(() => setMensagem({ tipo: null, texto: '' }), 3000)
      } else {
        setMensagem({ tipo: 'erro', texto: 'Cupom inválido' })
        setCupomValidado(null)
      }
    } catch (error: any) {
      console.error('Erro ao validar cupom:', error)
      setMensagem({ tipo: 'erro', texto: 'Erro ao validar cupom. Verifique sua conexão.' })
      setCupomValidado(null)
    } finally {
      setValidandoCupom(false)
    }
  }

  // Calcular desconto do cupom
  const calcularDescontoCupom = () => {
    if (!cupomValidado) return 0

    const { valorTotal } = calcularTotais()
    let valorBaseDesconto = 0

    if (cupomValidado.aplicar_em === 'total') {
      valorBaseDesconto = valorTotal
    } else if (cupomValidado.aplicar_em === 'apenas_servicos') {
      valorBaseDesconto = servicosVenda.reduce((sum, s) => sum + parseFloat(s.valor.toString()), 0)
    } else if (cupomValidado.aplicar_em === 'apenas_produtos') {
      const valorProdutos = produtosVenda.reduce((sum, p) => sum + parseFloat(p.valor_total.toString()), 0)
      const valorAssinaturas = assinaturasVenda.reduce((sum, a) => sum + parseFloat(a.valor.toString()), 0)
      valorBaseDesconto = valorProdutos + valorAssinaturas
    }

    if (cupomValidado.tipo_desconto === 'percentual') {
      return valorBaseDesconto * (cupomValidado.valor_desconto / 100)
    } else {
      return Math.min(cupomValidado.valor_desconto, valorBaseDesconto)
    }
  }

  const totais = calcularTotais()
  const descontoCupom = calcularDescontoCupom()
  // Se o valor líquido for zero ou negativo (tudo coberto por assinatura), ajustar para 1 centavo
  const valorLiquidoComCupom = Math.max(0.01, totais.valorLiquido - descontoCupom)

  // Formatação
  const formatarPreco = (valor: number | string | null | undefined) => {
    if (!valor) return 'R$ 0,00'
    const num = typeof valor === 'string' ? parseFloat(valor) : valor
    if (isNaN(num)) return 'R$ 0,00'
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(num)
  }

  // Salvar venda
  const salvarVenda = async () => {
    if (!formData.funcionario_id || !formData.data_venda || !formData.forma_pagamento || !formData.caixa_id) {
      setMensagem({ tipo: 'erro', texto: 'Preencha todos os campos obrigatórios' })
      return
    }

    if (servicosVenda.length === 0 && produtosVenda.length === 0 && assinaturasVenda.length === 0) {
      setMensagem({ tipo: 'erro', texto: 'Adicione pelo menos um serviço, produto ou assinatura' })
      return
    }

    // O valorLiquidoComCupom já está garantido como mínimo 0.01, então usar diretamente
    const valorFinalParaEnvio = valorLiquidoComCupom

    // Validação para boleto
    if (formData.forma_pagamento.startsWith('boleto_') && !formData.primeiro_vencimento_boleto) {
      setMensagem({ tipo: 'erro', texto: 'Informe a data do primeiro vencimento para boleto' })
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

      const body = {
        funcionario_id: formData.funcionario_id,
        cliente_id: formData.cliente_id || null,
        data_venda: formData.data_venda,
        servicos: servicosVenda.map(s => ({
          servico_id: s.servico_id,
          agendamento_id: s.agendamento_id || null,
          valor: parseFloat(s.valor.toString())
        })),
        produtos: produtosVenda.map(p => ({
          produto_id: p.produto_id,
          quantidade: p.quantidade,
          valor_unitario: parseFloat(p.valor_unitario.toString())
        })),
        assinaturas: assinaturasVenda.map(a => ({
          assinatura_id: a.assinatura_id,
          valor: parseFloat(a.valor.toString())
        })),
        desconto_percentual: parseFloat(formData.desconto_percentual) || 0,
        desconto_valor: parseFloat(formData.desconto_valor) || 0,
        cupom_codigo: cupomValidado?.codigo || null,
        forma_pagamento: formData.forma_pagamento,
        caixa_id: formData.caixa_id,
        observacoes: formData.observacoes || null,
        primeiro_vencimento_boleto: formData.forma_pagamento.startsWith('boleto_') 
          ? formData.primeiro_vencimento_boleto 
          : null
      }

      const response = await fetch(`${apiUrl}/api/v1/vendas`, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      })

      const data = await response.json()

      if (!response.ok) {
        const errorMessage = data.details || data.error || 'Erro ao criar venda'
        console.error('Erro detalhado do servidor:', data)
        throw new Error(errorMessage)
      }

      setMensagem({ tipo: 'sucesso', texto: `Venda ${data.venda.ticket} criada com sucesso!` })
      
      // Limpar formulário
      setFormData({
        funcionario_id: '',
        data_venda: new Date().toISOString().split('T')[0],
        cliente_id: '',
        desconto_percentual: '',
        desconto_valor: '',
        cupom_codigo: '',
        forma_pagamento: '',
        caixa_id: '',
        primeiro_vencimento_boleto: '',
        observacoes: '',
      })
      setServicosVenda([])
      setProdutosVenda([])
      setAssinaturasVenda([])
      setAgendamentos([])

      setTimeout(() => {
        setMensagem({ tipo: null, texto: '' })
      }, 5000)
    } catch (error: any) {
      console.error('Erro ao criar venda:', error)
      setMensagem({ tipo: 'erro', texto: error.message || 'Erro ao criar venda' })
    } finally {
      setSalvando(false)
    }
  }

  if (!podeAcessar('lancamento_venda')) {
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

  // Opções de forma de pagamento
  const formasPagamento = [
    { value: 'dinheiro', label: 'Dinheiro' },
    { value: 'pix', label: 'Pix' },
    { value: 'ted', label: 'TED' },
    { value: 'cartao_1x', label: 'Cartão 1x' },
    { value: 'cartao_2x', label: 'Cartão 2x' },
    { value: 'cartao_3x', label: 'Cartão 3x' },
    { value: 'cartao_4x', label: 'Cartão 4x' },
    { value: 'cartao_5x', label: 'Cartão 5x' },
    { value: 'cartao_6x', label: 'Cartão 6x' },
    { value: 'cartao_7x', label: 'Cartão 7x' },
    { value: 'cartao_8x', label: 'Cartão 8x' },
    { value: 'cartao_9x', label: 'Cartão 9x' },
    { value: 'cartao_10x', label: 'Cartão 10x' },
    { value: 'boleto_1x', label: 'Boleto 1x' },
    { value: 'boleto_2x', label: 'Boleto 2x' },
    { value: 'boleto_3x', label: 'Boleto 3x' },
    { value: 'boleto_4x', label: 'Boleto 4x' },
    { value: 'boleto_5x', label: 'Boleto 5x' },
    { value: 'boleto_6x', label: 'Boleto 6x' },
    { value: 'boleto_7x', label: 'Boleto 7x' },
    { value: 'boleto_8x', label: 'Boleto 8x' },
    { value: 'boleto_9x', label: 'Boleto 9x' },
    { value: 'boleto_10x', label: 'Boleto 10x' },
  ]

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2 text-gray-300">
            <ShoppingCart className="h-8 w-8 text-amber-500" />
            Lançamento de Venda
          </h1>
          <p className="text-gray-400 mt-1">Registre vendas de serviços e produtos</p>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Coluna Esquerda - Formulário Principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Dados Básicos */}
          <Card className="p-6 bg-zinc-900 border-amber-500/20">
            <h2 className="text-xl font-bold text-gray-300 mb-4">Dados Básicos</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="funcionario" className="text-gray-300">Profissional *</Label>
                <Select
                  value={formData.funcionario_id}
                  onValueChange={(value) => setFormData({ ...formData, funcionario_id: value })}
                >
                  <SelectTrigger className="bg-zinc-800 border-amber-500/20 text-gray-300">
                    <SelectValue placeholder="Selecione o profissional" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-amber-500/20">
                    {funcionarios.map((func) => (
                      <SelectItem key={func.id} value={func.id} className="text-gray-300">
                        {func.nome_completo}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="data_venda" className="text-gray-300">Data da Venda *</Label>
                <Input
                  id="data_venda"
                  type="date"
                  value={formData.data_venda}
                  onChange={(e) => setFormData({ ...formData, data_venda: e.target.value })}
                  className="bg-zinc-800 border-amber-500/20 text-gray-300 focus:border-amber-500 focus:ring-amber-500/20"
                />
              </div>
            </div>
          </Card>

          {/* Seleção de Cliente */}
          <Card className="p-6 bg-zinc-900 border-amber-500/20">
            <h2 className="text-xl font-bold text-gray-300 mb-4">Cliente</h2>
            {clienteSelecionado ? (
              <div className="flex items-center justify-between p-4 bg-zinc-800 rounded-lg border border-zinc-700">
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-amber-500" />
                  <div>
                    <p className="font-semibold text-white">{clienteSelecionado.nome_completo}</p>
                    <p className="text-sm text-gray-400">{clienteSelecionado.email || 'Sem email'}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={limparCliente}
                  className="text-red-500 hover:text-red-400 hover:bg-red-500/10"
                >
                  <X className="h-4 w-4 mr-1" />
                  Limpar
                </Button>
              </div>
            ) : (
              <div className="relative">
                <div className="flex items-center gap-2">
                  <Search className="h-5 w-5 text-gray-400 absolute left-3 z-10" />
                  <Input
                    type="text"
                    placeholder="Buscar cliente por nome ou email..."
                    value={searchTermCliente}
                    onChange={(e) => setSearchTermCliente(e.target.value)}
                    className="bg-zinc-800 border-amber-500/20 text-gray-300 pl-10 focus:border-amber-500 focus:ring-amber-500/20"
                  />
                </div>
                {buscandoClientes && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <Loader2 className="h-4 w-4 animate-spin text-amber-500" />
                  </div>
                )}
                {clientes.length > 0 && (
                  <div className="absolute z-20 w-full mt-2 bg-zinc-800 border border-zinc-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {clientes.map((cliente) => (
                      <div
                        key={cliente.id}
                        onClick={() => selecionarCliente(cliente)}
                        className="p-3 hover:bg-zinc-700 cursor-pointer border-b border-zinc-700 last:border-b-0"
                      >
                        <p className="font-medium text-white">{cliente.nome_completo}</p>
                        <p className="text-sm text-gray-400">{cliente.email || 'Sem email'}</p>
                      </div>
                    ))}
                  </div>
                )}
                <p className="text-xs text-gray-500 mt-2">
                  Digite pelo menos 2 caracteres para buscar. Ou selecione um agendamento para preencher automaticamente.
                </p>
              </div>
            )}
          </Card>

          {/* Agendamentos */}
          {formData.funcionario_id && formData.data_venda && (
            <Card className="p-6 bg-zinc-900 border-amber-500/20">
              <h2 className="text-xl font-bold text-gray-300 mb-4">Agendamentos do Dia</h2>
              {loading ? (
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
                </div>
              ) : agendamentos.length === 0 ? (
                <p className="text-gray-400 text-center py-4">Nenhum agendamento encontrado para esta data</p>
              ) : (
                <div className="space-y-2">
                  {agendamentos.map((agendamento) => (
                    <div
                      key={agendamento.id}
                      className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                        servicosVenda.some(s => s.agendamento_id === agendamento.id)
                          ? 'bg-amber-500/10 border-amber-500/50'
                          : 'bg-zinc-800 border-zinc-700 hover:border-amber-500/50'
                      }`}
                      onClick={() => adicionarAgendamento(agendamento)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-gray-300">{agendamento.cliente_nome}</p>
                          <p className="text-sm text-gray-400">{agendamento.servico_nome}</p>
                          <p className="text-xs text-gray-500">
                            {agendamento.hora_inicio} - {agendamento.hora_fim}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-amber-500">{formatarPreco(agendamento.valor_servico)}</p>
                          {servicosVenda.some(s => s.agendamento_id === agendamento.id) && (
                            <p className="text-xs text-green-500 mt-1">✓ Adicionado</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          )}

          {/* Serviços */}
          <Card className="p-6 bg-zinc-900 border-amber-500/20">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-300">Serviços</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setMostrarModalServico(true)}
                className="border-amber-500/20 text-gray-300 hover:bg-amber-500/10 hover:text-amber-500"
              >
                <Plus className="h-4 w-4 mr-1" />
                Adicionar Serviço
              </Button>
            </div>
            {servicosVenda.length === 0 ? (
              <p className="text-gray-400 text-center py-4">Nenhum serviço adicionado</p>
            ) : (
              <div className="space-y-2">
                {servicosVenda.map((servico, index) => (
                  <div
                    key={index}
                    className="p-3 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-between"
                  >
                    <div>
                      <p className="font-semibold text-gray-300">{servico.servico_nome}</p>
                      {servico.agendamento_id && (
                        <p className="text-xs text-gray-500">Vinculado a agendamento</p>
                      )}
                      {servico.podeAbaterAssinatura && (
                        <p className="text-xs text-green-500 flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3" />
                          Disponível na assinatura (será abatido automaticamente)
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-4">
                      <p className={`font-bold ${servico.podeAbaterAssinatura ? 'text-green-500' : 'text-amber-500'}`}>
                        {servico.podeAbaterAssinatura ? 'R$ 0,00 (Coberto pela assinatura)' : formatarPreco(servico.valor)}
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removerServico(index)}
                        className="text-red-500 hover:text-red-400 hover:bg-red-500/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Produtos */}
          <Card className="p-6 bg-zinc-900 border-amber-500/20">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-300">Produtos</h2>
              <Select
                onValueChange={(value) => {
                  const produto = produtos.find(p => p.id === value)
                  if (produto) {
                    adicionarProduto(produto)
                  }
                }}
              >
                <SelectTrigger className="w-64 bg-zinc-800 border-amber-500/20 text-gray-300">
                  <SelectValue placeholder="Selecione um produto" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-amber-500/20">
                  {produtos.map((produto) => (
                    <SelectItem key={produto.id} value={produto.id} className="text-gray-300">
                      {produto.codigo} - {produto.descricao} - {formatarPreco(produto.preco_venda)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {produtosVenda.length === 0 ? (
              <p className="text-gray-400 text-center py-4">Nenhum produto adicionado</p>
            ) : (
              <div className="space-y-2">
                {produtosVenda.map((produto, index) => (
                  <div
                    key={index}
                    className="p-3 rounded-lg bg-zinc-800 border border-zinc-700"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-semibold text-gray-300">{produto.produto_descricao}</p>
                        <p className="text-xs text-gray-500">Código: {produto.produto_codigo}</p>
                        <p className="text-sm text-gray-400">Unitário: {formatarPreco(produto.valor_unitario)}</p>
                        {produto.podeAbaterAssinatura && produto.quantidadeAbatida !== undefined && produto.quantidadeAbatida > 0 && (
                          <p className="text-xs text-green-500 flex items-center gap-1 mt-1">
                            <CheckCircle2 className="h-3 w-3" />
                            {produto.quantidadeAbatida} unidade(s) será(ão) abatida(s) da assinatura
                            {produto.quantidade > produto.quantidadeAbatida && (
                              <span className="text-amber-500">
                                • {produto.quantidade - produto.quantidadeAbatida} unidade(s) será(ão) cobrada(s)
                              </span>
                            )}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => atualizarQuantidadeProduto(index, produto.quantidade - 1)}
                            className="border-amber-500/20 text-gray-300 hover:bg-amber-500/10"
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <Input
                            type="number"
                            value={produto.quantidade}
                            onChange={(e) => atualizarQuantidadeProduto(index, parseInt(e.target.value) || 0)}
                            className="w-20 bg-zinc-900 border-amber-500/20 text-gray-300 text-center"
                            min="1"
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => atualizarQuantidadeProduto(index, produto.quantidade + 1)}
                            className="border-amber-500/20 text-gray-300 hover:bg-amber-500/10"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        <p className={`font-bold w-32 text-right ${produto.podeAbaterAssinatura && produto.quantidadeAbatida !== undefined && produto.quantidadeAbatida > 0 && produto.quantidade === produto.quantidadeAbatida ? 'text-green-500' : 'text-amber-500'}`}>
                          {produto.podeAbaterAssinatura && produto.quantidadeAbatida !== undefined && produto.quantidadeAbatida > 0 && produto.quantidade === produto.quantidadeAbatida 
                            ? 'R$ 0,00 (Coberto)' 
                            : formatarPreco(produto.valor_total)}
                        </p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removerProduto(index)}
                          className="text-red-500 hover:text-red-400 hover:bg-red-500/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Assinaturas */}
          <Card className="p-6 bg-zinc-900 border-amber-500/20">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-300">Assinaturas</h2>
              <Select
                onValueChange={(value) => {
                  const assinatura = assinaturas.find(a => a.id === value)
                  if (assinatura) {
                    adicionarAssinatura(assinatura)
                  }
                }}
              >
                <SelectTrigger className="w-64 bg-zinc-800 border-amber-500/20 text-gray-300">
                  <SelectValue placeholder="Selecione uma assinatura" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-amber-500/20">
                  {assinaturas.map((assinatura) => (
                    <SelectItem key={assinatura.id} value={assinatura.id} className="text-gray-300">
                      {assinatura.nome} - {formatarPreco(assinatura.valor_liquido)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {assinaturasVenda.length === 0 ? (
              <p className="text-gray-400 text-center py-4">Nenhuma assinatura adicionada</p>
            ) : (
              <div className="space-y-2">
                {assinaturasVenda.map((assinatura, index) => (
                  <div
                    key={index}
                    className="p-3 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-between"
                  >
                    <div className="flex-1">
                      <p className="font-semibold text-gray-300">{assinatura.assinatura_nome}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <p className="font-bold text-amber-500">{formatarPreco(assinatura.valor)}</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removerAssinatura(index)}
                        className="text-red-500 hover:text-red-400 hover:bg-red-500/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Coluna Direita - Resumo e Pagamento */}
        <div className="space-y-6">
          {/* Resumo Financeiro */}
          <Card className="p-6 bg-zinc-900 border-amber-500/20">
            <h2 className="text-xl font-bold text-gray-300 mb-4">Resumo Financeiro</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Valor Total:</span>
                <span className="font-bold text-gray-300">{formatarPreco(totais.valorTotal)}</span>
              </div>
              
              <div className="pt-3 border-t border-zinc-800">
                <Label htmlFor="desconto_percentual" className="text-gray-300">Desconto (%)</Label>
                <Input
                  id="desconto_percentual"
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={formData.desconto_percentual}
                  onChange={(e) => setFormData({ ...formData, desconto_percentual: e.target.value })}
                  className="bg-zinc-800 border-amber-500/20 text-gray-300 mt-1"
                  placeholder="0.00"
                />
                {formData.desconto_percentual && (
                  <p className="text-xs text-gray-500 mt-1">
                    Desconto: {formatarPreco(totais.descontoPorPercentual)}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="desconto_valor" className="text-gray-300">Desconto (R$)</Label>
                <Input
                  id="desconto_valor"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.desconto_valor}
                  onChange={(e) => setFormData({ ...formData, desconto_valor: e.target.value })}
                  className="bg-zinc-800 border-amber-500/20 text-gray-300 mt-1"
                  placeholder="0.00"
                />
              </div>

              <div>
                <Label htmlFor="cupom_codigo" className="text-gray-300">Cupom</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    id="cupom_codigo"
                    type="text"
                    value={formData.cupom_codigo}
                    onChange={(e) => {
                      const codigo = e.target.value.toUpperCase()
                      setFormData({ ...formData, cupom_codigo: codigo })
                      // Limpar cupom validado se o código mudar
                      if (cupomValidado && cupomValidado.codigo !== codigo) {
                        setCupomValidado(null)
                      }
                    }}
                    onKeyDown={(e) => {
                      // Validar ao pressionar Enter
                      if (e.key === 'Enter' && formData.cupom_codigo.trim()) {
                        e.preventDefault()
                        validarCupom(formData.cupom_codigo)
                      }
                    }}
                    className="bg-zinc-800 border-amber-500/20 text-gray-300 flex-1"
                    placeholder="Digite o código do cupom e pressione Enter ou clique em Aplicar"
                    disabled={validandoCupom}
                  />
                  {!cupomValidado && formData.cupom_codigo.trim() && (
                    <Button
                      type="button"
                      onClick={() => validarCupom(formData.cupom_codigo)}
                      disabled={validandoCupom || !formData.cupom_codigo.trim()}
                      className="bg-amber-500 hover:bg-amber-600 text-white"
                    >
                      {validandoCupom ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <Ticket className="h-4 w-4 mr-1" />
                          Aplicar
                        </>
                      )}
                    </Button>
                  )}
                  {cupomValidado && (
                    <Button
                      type="button"
                      onClick={() => {
                        setFormData({ ...formData, cupom_codigo: '' })
                        setCupomValidado(null)
                      }}
                      variant="outline"
                      size="sm"
                      className="border-red-500/20 text-red-500 hover:bg-red-500/10"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                {cupomValidado && (
                  <div className="mt-2 p-2 bg-green-500/10 border border-green-500/20 rounded text-sm">
                    <p className="text-green-500 font-semibold">{cupomValidado.nome}</p>
                    <p className="text-gray-400 text-xs">
                      Desconto: {cupomValidado.tipo_desconto === 'percentual' 
                        ? `${cupomValidado.valor_desconto}%` 
                        : formatarPreco(cupomValidado.valor_desconto)}
                    </p>
                    <p className="text-gray-400 text-xs">
                      Aplicar em: {cupomValidado.aplicar_em === 'total' ? 'Total' : 
                        cupomValidado.aplicar_em === 'apenas_servicos' ? 'Apenas Serviços' : 'Apenas Produtos'}
                    </p>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-zinc-800">
                <div className="flex justify-between items-center">
                  {descontoCupom > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Desconto Cupom:</span>
                      <span className="text-green-500 font-semibold">- {formatarPreco(descontoCupom)}</span>
                    </div>
                  )}
                  <span className="text-lg font-semibold text-gray-300">Valor Líquido:</span>
                  <span className="text-2xl font-bold text-amber-500">{formatarPreco(valorLiquidoComCupom)}</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Forma de Pagamento */}
          <Card className="p-6 bg-zinc-900 border-amber-500/20">
            <h2 className="text-xl font-bold text-gray-300 mb-4">Forma de Pagamento</h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="forma_pagamento" className="text-gray-300">Forma *</Label>
                <Select
                  value={formData.forma_pagamento}
                  onValueChange={(value) => {
                    setFormData({
                      ...formData,
                      forma_pagamento: value,
                      primeiro_vencimento_boleto: value.startsWith('boleto_') ? '' : ''
                    })
                  }}
                >
                  <SelectTrigger className="bg-zinc-800 border-amber-500/20 text-gray-300">
                    <SelectValue placeholder="Selecione a forma de pagamento" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-amber-500/20 max-h-96">
                    {formasPagamento.map((forma) => (
                      <SelectItem key={forma.value} value={forma.value} className="text-gray-300">
                        {forma.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {formData.forma_pagamento.startsWith('boleto_') && (
                <div>
                  <Label htmlFor="primeiro_vencimento_boleto" className="text-gray-300">
                    Primeiro Vencimento *
                  </Label>
                  <Input
                    id="primeiro_vencimento_boleto"
                    type="date"
                    value={formData.primeiro_vencimento_boleto}
                    onChange={(e) => setFormData({ ...formData, primeiro_vencimento_boleto: e.target.value })}
                    className="bg-zinc-800 border-amber-500/20 text-gray-300 mt-1"
                    min={formData.data_venda}
                  />
                </div>
              )}

              <div>
                <Label htmlFor="caixa_id" className="text-gray-300">Caixa *</Label>
                <Select
                  value={formData.caixa_id}
                  onValueChange={(value) => setFormData({ ...formData, caixa_id: value })}
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
                <Label htmlFor="observacoes" className="text-gray-300">Observações</Label>
                <Input
                  id="observacoes"
                  value={formData.observacoes}
                  onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                  className="bg-zinc-800 border-amber-500/20 text-gray-300 mt-1"
                  placeholder="Observações adicionais (opcional)"
                />
              </div>
            </div>
          </Card>

          {/* Botão Salvar */}
          <Button
            onClick={salvarVenda}
            disabled={salvando || !podeEditar('lancamento_venda')}
            className="w-full bg-amber-500 hover:bg-amber-600 text-white h-12 text-lg"
          >
            {salvando ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="h-5 w-5 mr-2" />
                Salvar Venda
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Modal Adicionar Serviço Manual */}
      <Dialog open={mostrarModalServico} onOpenChange={setMostrarModalServico}>
        <DialogContent className="bg-zinc-900 border-amber-500/20 text-gray-300">
          <DialogHeader>
            <DialogTitle className="text-gray-300">Adicionar Serviço Manual</DialogTitle>
            <DialogDescription className="text-gray-400">
              Adicione um serviço que não está vinculado a um agendamento
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div>
              <Label htmlFor="servico_manual" className="text-gray-300">Serviço *</Label>
              <Select
                value={servicoSelecionado}
                onValueChange={(value) => {
                  setServicoSelecionado(value)
                  const servico = servicos.find(s => s.id === value)
                  if (servico) {
                    setValorServicoManual(servico.preco.toString())
                  }
                }}
              >
                <SelectTrigger className="bg-zinc-800 border-amber-500/20 text-gray-300">
                  <SelectValue placeholder="Selecione o serviço" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-amber-500/20">
                  {servicos.map((servico) => (
                    <SelectItem key={servico.id} value={servico.id} className="text-gray-300">
                      {servico.nome} - {formatarPreco(servico.preco)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="valor_servico_manual" className="text-gray-300">Valor *</Label>
              <Input
                id="valor_servico_manual"
                type="number"
                step="0.01"
                min="0"
                value={valorServicoManual}
                onChange={(e) => setValorServicoManual(e.target.value)}
                className="bg-zinc-800 border-amber-500/20 text-gray-300"
                placeholder="0.00"
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setMostrarModalServico(false)
                  setServicoSelecionado('')
                  setValorServicoManual('')
                }}
                className="border-amber-500/20 text-gray-300 hover:bg-amber-500/10 hover:text-amber-500"
              >
                <X className="h-4 w-4 mr-1" />
                Cancelar
              </Button>
              <Button
                onClick={adicionarServicoManual}
                className="bg-amber-500 hover:bg-amber-600 text-white"
              >
                <Plus className="h-4 w-4 mr-1" />
                Adicionar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

