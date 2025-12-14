'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Receipt, Search, Calendar, DollarSign, Edit, Trash2, Loader2, Filter, X, Save, FileText, Package, TrendingDown, ShoppingCart, Plus, FileCheck, Printer } from 'lucide-react'
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

interface Movimentacao {
  id: string
  ticket: string
  data: string
  valor: number | string
  status: string
  forma_pagamento: string
  numero_parcelas: number
  observacoes?: string | null
  cliente_nome?: string | null
  funcionario_nome?: string | null
  caixa_nome?: string | null
  tipo_movimentacao: 'venda' | 'despesa' | 'estoque'
  created_at: string
  updated_at: string
}

interface Romaneio {
  id: string
  numero_romaneio: string
  tipo_romaneio: string
  data_romaneio: string
  descricao?: string | null
  observacoes?: string | null
  status: string
  total_itens: number
}

interface Cliente {
  id: string
  nome_completo: string
}

interface Funcionario {
  id: string
  nome_completo: string
}

interface Conta {
  id: string
  nome: string
}

interface Produto {
  id: string
  codigo: string
  descricao: string
}

export default function FaturamentoPage() {
  const [movimentacoes, setMovimentacoes] = useState<Movimentacao[]>([])
  const [movimentacoesFiltradas, setMovimentacoesFiltradas] = useState<Movimentacao[]>([])
  const [romaneios, setRomaneios] = useState<Romaneio[]>([])
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([])
  const [contas, setContas] = useState<Conta[]>([])
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [configuracoes, setConfiguracoes] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [salvando, setSalvando] = useState(false)
  const [mensagem, setMensagem] = useState<{ tipo: 'sucesso' | 'erro' | null; texto: string }>({ tipo: null, texto: '' })
  const { podeAcessar, podeEditar, podeExcluir } = usePermissions()

  // Filtros
  const [filtros, setFiltros] = useState({
    tipo: 'all',
    data_inicio: '',
    data_fim: '',
    status: 'all',
    search: '',
  })

  // Modais
  const [mostrarModalEditar, setMostrarModalEditar] = useState(false)
  const [mostrarModalExcluir, setMostrarModalExcluir] = useState(false)
  const [mostrarModalRomaneio, setMostrarModalRomaneio] = useState(false)
  const [mostrarModalVisualizarRomaneio, setMostrarModalVisualizarRomaneio] = useState(false)
  const [romaneioVisualizando, setRomaneioVisualizando] = useState<Romaneio | null>(null)
  const [romaneioDetalhes, setRomaneioDetalhes] = useState<any>(null)
  const [movimentacaoEditando, setMovimentacaoEditando] = useState<Movimentacao | null>(null)
  const [movimentacaoExcluindo, setMovimentacaoExcluindo] = useState<Movimentacao | null>(null)
  const [movimentacoesSelecionadas, setMovimentacoesSelecionadas] = useState<Set<string>>(new Set())

  // Formulário de edição
  const [formDataEdicao, setFormDataEdicao] = useState<any>({})

  // Formulário de romaneio
  const [formDataRomaneio, setFormDataRomaneio] = useState({
    tipo_romaneio: 'faturamento',
    data_romaneio: new Date().toISOString().split('T')[0],
    descricao: '',
    observacoes: '',
  })

  // Refs
  const carregandoRef = useRef(false)
  const dadosCarregadosRef = useRef(false)

  // Carregar dados iniciais
  useEffect(() => {
    const carregarDados = async () => {
      if (dadosCarregadosRef.current) return
      if (carregandoRef.current) return

      dadosCarregadosRef.current = true
      await carregarMovimentacoes()
      await carregarRomaneios()
      await carregarClientes()
      await carregarFuncionarios()
      await carregarContas()
      await carregarProdutos()
      await carregarConfiguracoes()
    }

    const timer = setTimeout(() => {
      carregarDados()
    }, 100)

    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Aplicar filtros locais
  useEffect(() => {
    let filtradas = [...movimentacoes]
    
    if (filtros.search) {
      const termo = filtros.search.toLowerCase()
      filtradas = filtradas.filter(m =>
        (m.ticket && m.ticket.toLowerCase().includes(termo)) ||
        (m.cliente_nome && m.cliente_nome.toLowerCase().includes(termo)) ||
        (m.funcionario_nome && m.funcionario_nome.toLowerCase().includes(termo))
      )
    }
    
    setMovimentacoesFiltradas(filtradas)
  }, [movimentacoes, filtros.search])

  // Recarregar quando filtros do backend mudarem
  useEffect(() => {
    if (!podeAcessar('faturamento')) return
    if (!dadosCarregadosRef.current) return
    if (carregandoRef.current) return

    const temFiltrosBackend = filtros.tipo !== 'all' || filtros.data_inicio || filtros.data_fim || filtros.status !== 'all'
    if (temFiltrosBackend) {
      carregarMovimentacoes()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtros.tipo, filtros.data_inicio, filtros.data_fim, filtros.status])

  const carregarMovimentacoes = useCallback(async () => {
    if (carregandoRef.current) return

    carregandoRef.current = true
    setLoading(true)

    try {
      const adminData = localStorage.getItem('admin')
      const admin = adminData ? JSON.parse(adminData) : null

      const apiUrl = 'https://api.protesecapilarcuiaba.com.br'
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      }
      if (admin?.id) {
        headers['x-user-id'] = admin.id
        headers['x-user-tipo'] = admin.tipo_usuario || 'administrativo'
        headers['x-user-nome'] = admin.nome_completo || null
      }

      const queryParams = new URLSearchParams()
      if (filtros.tipo && filtros.tipo !== 'all') queryParams.append('tipo', filtros.tipo)
      if (filtros.data_inicio) queryParams.append('data_inicio', filtros.data_inicio)
      if (filtros.data_fim) queryParams.append('data_fim', filtros.data_fim)
      if (filtros.status && filtros.status !== 'all') queryParams.append('status', filtros.status)
      if (filtros.search) queryParams.append('search', filtros.search)

      const response = await fetch(`${apiUrl}/api/v1/faturamento/movimentacoes?${queryParams.toString()}`, { headers })

      if (!response.ok) {
        throw new Error(`Erro ao carregar movimentações: ${response.status}`)
      }

      const data = await response.json()
      setMovimentacoes(data.movimentacoes || [])
    } catch (error: any) {
      console.error('Erro ao carregar movimentações:', error)
      setMensagem({ tipo: 'erro', texto: error.message || 'Erro ao carregar movimentações' })
    } finally {
      setLoading(false)
      carregandoRef.current = false
    }
  }, [filtros.tipo, filtros.data_inicio, filtros.data_fim, filtros.status, filtros.search])

  const carregarRomaneios = useCallback(async () => {
    try {
      const adminData = localStorage.getItem('admin')
      const admin = adminData ? JSON.parse(adminData) : null

      const apiUrl = 'https://api.protesecapilarcuiaba.com.br'
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      }
      if (admin?.id) {
        headers['x-user-id'] = admin.id
        headers['x-user-tipo'] = admin.tipo_usuario || 'administrativo'
        headers['x-user-nome'] = admin.nome_completo || null
      }

      const response = await fetch(`${apiUrl}/api/v1/faturamento/romaneios`, { headers })
      if (response.ok) {
        const data = await response.json()
        setRomaneios(data.romaneios || [])
      }
    } catch (error) {
      console.error('Erro ao carregar romaneios:', error)
    }
  }, [])

  const carregarClientes = useCallback(async () => {
    try {
      const adminData = localStorage.getItem('admin')
      const admin = adminData ? JSON.parse(adminData) : null

      const apiUrl = 'https://api.protesecapilarcuiaba.com.br'
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      }
      if (admin?.id) {
        headers['x-user-id'] = admin.id
        headers['x-user-tipo'] = admin.tipo_usuario || 'administrativo'
        headers['x-user-nome'] = admin.nome_completo || null
      }

      const response = await fetch(`${apiUrl}/api/v1/clientes?is_active=true`, { headers })
      if (response.ok) {
        const data = await response.json()
        setClientes(data.clientes || [])
      }
    } catch (error) {
      console.error('Erro ao carregar clientes:', error)
    }
  }, [])

  const carregarFuncionarios = useCallback(async () => {
    try {
      const adminData = localStorage.getItem('admin')
      const admin = adminData ? JSON.parse(adminData) : null

      const apiUrl = 'https://api.protesecapilarcuiaba.com.br'
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
        setFuncionarios(data.funcionarios || [])
      }
    } catch (error) {
      console.error('Erro ao carregar funcionários:', error)
    }
  }, [])

  const carregarContas = useCallback(async () => {
    try {
      const adminData = localStorage.getItem('admin')
      const admin = adminData ? JSON.parse(adminData) : null

      const apiUrl = 'https://api.protesecapilarcuiaba.com.br'
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

  const carregarProdutos = useCallback(async () => {
    try {
      const adminData = localStorage.getItem('admin')
      const admin = adminData ? JSON.parse(adminData) : null

      const apiUrl = 'https://api.protesecapilarcuiaba.com.br'
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

  const carregarConfiguracoes = useCallback(async () => {
    try {
      const adminData = localStorage.getItem('admin')
      const admin = adminData ? JSON.parse(adminData) : null

      const apiUrl = 'https://api.protesecapilarcuiaba.com.br'
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      }
      if (admin?.id) {
        headers['x-user-id'] = admin.id
        headers['x-user-tipo'] = admin.tipo_usuario || 'administrativo'
        headers['x-user-nome'] = admin.nome_completo || null
      }

      const response = await fetch(`${apiUrl}/api/v1/configuracoes`, { headers })
      if (response.ok) {
        const data = await response.json()
        setConfiguracoes(data.configuracoes || null)
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error)
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
      boleto_1x: 'Boleto 1x',
      boleto_2x: 'Boleto 2x',
      estoque: 'Entrada Estoque',
    }
    return formas[forma] || forma
  }

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'venda':
        return ShoppingCart
      case 'despesa':
        return TrendingDown
      case 'estoque':
        return Package
      default:
        return FileText
    }
  }

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case 'venda':
        return 'text-green-500'
      case 'despesa':
        return 'text-red-500'
      case 'estoque':
        return 'text-blue-500'
      default:
        return 'text-gray-500'
    }
  }

  const getTipoLabel = (tipo: string) => {
    switch (tipo) {
      case 'venda':
        return 'Venda'
      case 'despesa':
        return 'Despesa'
      case 'estoque':
        return 'Estoque'
      default:
        return tipo
    }
  }

  const abrirModalEditar = async (movimentacao: Movimentacao) => {
    setMovimentacaoEditando(movimentacao)
    
    // Buscar dados completos da movimentação
    try {
      const adminData = localStorage.getItem('admin')
      const admin = adminData ? JSON.parse(adminData) : null

      const apiUrl = 'https://api.protesecapilarcuiaba.com.br'
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      }
      if (admin?.id) {
        headers['x-user-id'] = admin.id
        headers['x-user-tipo'] = admin.tipo_usuario || 'administrativo'
        headers['x-user-nome'] = admin.nome_completo || null
      }

      let response
      if (movimentacao.tipo_movimentacao === 'venda') {
        response = await fetch(`${apiUrl}/api/v1/faturamento/venda/${movimentacao.id}`, { headers })
        const data = await response.json()
        setFormDataEdicao(data.venda)
      } else if (movimentacao.tipo_movimentacao === 'despesa') {
        response = await fetch(`${apiUrl}/api/v1/faturamento/despesa/${movimentacao.id}`, { headers })
        const data = await response.json()
        setFormDataEdicao(data.despesa)
      } else if (movimentacao.tipo_movimentacao === 'estoque') {
        response = await fetch(`${apiUrl}/api/v1/faturamento/estoque/${movimentacao.id}`, { headers })
        const data = await response.json()
        setFormDataEdicao(data.movimentacao)
      }

      setMostrarModalEditar(true)
    } catch (error: any) {
      console.error('Erro ao carregar dados para edição:', error)
      setMensagem({ tipo: 'erro', texto: 'Erro ao carregar dados para edição' })
    }
  }

  const abrirModalExcluir = (movimentacao: Movimentacao) => {
    setMovimentacaoExcluindo(movimentacao)
    setMostrarModalExcluir(true)
  }

  const salvarEdicao = async () => {
    if (!movimentacaoEditando) return

    setSalvando(true)
    setMensagem({ tipo: null, texto: '' })

    try {
      const adminData = localStorage.getItem('admin')
      const admin = adminData ? JSON.parse(adminData) : null

      const apiUrl = 'https://api.protesecapilarcuiaba.com.br'
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      }
      if (admin?.id) {
        headers['x-user-id'] = admin.id
        headers['x-user-tipo'] = admin.tipo_usuario || 'administrativo'
        headers['x-user-nome'] = admin.nome_completo || null
      }

      let url = ''
      if (movimentacaoEditando.tipo_movimentacao === 'venda') {
        url = `${apiUrl}/api/v1/faturamento/venda/${movimentacaoEditando.id}`
      } else if (movimentacaoEditando.tipo_movimentacao === 'despesa') {
        url = `${apiUrl}/api/v1/faturamento/despesa/${movimentacaoEditando.id}`
      } else if (movimentacaoEditando.tipo_movimentacao === 'estoque') {
        url = `${apiUrl}/api/v1/faturamento/estoque/${movimentacaoEditando.id}`
      }

      const response = await fetch(url, {
        method: 'PUT',
        headers,
        body: JSON.stringify(formDataEdicao),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao salvar alterações')
      }

      setMensagem({ tipo: 'sucesso', texto: data.message || 'Alterações salvas com sucesso!' })
      setMostrarModalEditar(false)
      setMovimentacaoEditando(null)
      carregandoRef.current = false
      await carregarMovimentacoes()

      setTimeout(() => {
        setMensagem({ tipo: null, texto: '' })
      }, 3000)
    } catch (error: any) {
      console.error('Erro ao salvar edição:', error)
      setMensagem({ tipo: 'erro', texto: error.message || 'Erro ao salvar alterações' })
    } finally {
      setSalvando(false)
    }
  }

  const excluirMovimentacao = async () => {
    if (!movimentacaoExcluindo) return

    setSalvando(true)
    setMensagem({ tipo: null, texto: '' })

    try {
      const adminData = localStorage.getItem('admin')
      const admin = adminData ? JSON.parse(adminData) : null

      const apiUrl = 'https://api.protesecapilarcuiaba.com.br'
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      }
      if (admin?.id) {
        headers['x-user-id'] = admin.id
        headers['x-user-tipo'] = admin.tipo_usuario || 'administrativo'
        headers['x-user-nome'] = admin.nome_completo || null
      }

      let url = ''
      if (movimentacaoExcluindo.tipo_movimentacao === 'venda') {
        url = `${apiUrl}/api/v1/faturamento/venda/${movimentacaoExcluindo.id}`
      } else if (movimentacaoExcluindo.tipo_movimentacao === 'despesa') {
        url = `${apiUrl}/api/v1/faturamento/despesa/${movimentacaoExcluindo.id}`
      } else if (movimentacaoExcluindo.tipo_movimentacao === 'estoque') {
        url = `${apiUrl}/api/v1/faturamento/estoque/${movimentacaoExcluindo.id}`
      }

      const response = await fetch(url, {
        method: 'DELETE',
        headers,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao excluir')
      }

      setMensagem({ tipo: 'sucesso', texto: data.message || 'Excluído com sucesso!' })
      setMostrarModalExcluir(false)
      setMovimentacaoExcluindo(null)
      carregandoRef.current = false
      await carregarMovimentacoes()

      setTimeout(() => {
        setMensagem({ tipo: null, texto: '' })
      }, 3000)
    } catch (error: any) {
      console.error('Erro ao excluir:', error)
      setMensagem({ tipo: 'erro', texto: error.message || 'Erro ao excluir' })
    } finally {
      setSalvando(false)
    }
  }

  const criarRomaneio = async () => {
    if (movimentacoesSelecionadas.size === 0) {
      setMensagem({ tipo: 'erro', texto: 'Selecione pelo menos uma movimentação' })
      return
    }

    setSalvando(true)
    setMensagem({ tipo: null, texto: '' })

    try {
      const adminData = localStorage.getItem('admin')
      const admin = adminData ? JSON.parse(adminData) : null

      const apiUrl = 'https://api.protesecapilarcuiaba.com.br'
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      }
      if (admin?.id) {
        headers['x-user-id'] = admin.id
        headers['x-user-tipo'] = admin.tipo_usuario || 'administrativo'
        headers['x-user-nome'] = admin.nome_completo || null
      }

      const itens = Array.from(movimentacoesSelecionadas).map(id => {
        const mov = movimentacoes.find(m => m.id === id)
        return {
          id: mov?.id,
          tipo: mov?.tipo_movimentacao,
        }
      }).filter(item => item.id && item.tipo)

      const response = await fetch(`${apiUrl}/api/v1/faturamento/romaneios`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          ...formDataRomaneio,
          itens,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao criar romaneio')
      }

      setMensagem({ tipo: 'sucesso', texto: 'Romaneio criado com sucesso!' })
      setMostrarModalRomaneio(false)
      setMovimentacoesSelecionadas(new Set())
      setFormDataRomaneio({
        tipo_romaneio: 'faturamento',
        data_romaneio: new Date().toISOString().split('T')[0],
        descricao: '',
        observacoes: '',
      })
      await carregarRomaneios()

      setTimeout(() => {
        setMensagem({ tipo: null, texto: '' })
      }, 3000)
    } catch (error: any) {
      console.error('Erro ao criar romaneio:', error)
      setMensagem({ tipo: 'erro', texto: error.message || 'Erro ao criar romaneio' })
    } finally {
      setSalvando(false)
    }
  }

  const toggleSelecao = (id: string) => {
    const novaSelecao = new Set(movimentacoesSelecionadas)
    if (novaSelecao.has(id)) {
      novaSelecao.delete(id)
    } else {
      novaSelecao.add(id)
    }
    setMovimentacoesSelecionadas(novaSelecao)
  }

  const visualizarRomaneio = async (romaneio: Romaneio) => {
    setRomaneioVisualizando(romaneio)
    setMostrarModalVisualizarRomaneio(true)

    try {
      const adminData = localStorage.getItem('admin')
      const admin = adminData ? JSON.parse(adminData) : null

      const apiUrl = 'https://api.protesecapilarcuiaba.com.br'
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      }
      if (admin?.id) {
        headers['x-user-id'] = admin.id
        headers['x-user-tipo'] = admin.tipo_usuario || 'administrativo'
        headers['x-user-nome'] = admin.nome_completo || null
      }

      const response = await fetch(`${apiUrl}/api/v1/faturamento/romaneios/${romaneio.id}`, { headers })
      if (response.ok) {
        const data = await response.json()
        setRomaneioDetalhes(data.romaneio)
        
        // Buscar detalhes de cada movimentação
        const itensComDetalhes = await Promise.all(
          data.romaneio.itens.map(async (item: any) => {
            try {
              let url = ''
              if (item.tipo_movimentacao === 'venda') {
                url = `${apiUrl}/api/v1/faturamento/venda/${item.movimentacao_id}`
              } else if (item.tipo_movimentacao === 'despesa') {
                url = `${apiUrl}/api/v1/faturamento/despesa/${item.movimentacao_id}`
              } else if (item.tipo_movimentacao === 'estoque') {
                url = `${apiUrl}/api/v1/faturamento/estoque/${item.movimentacao_id}`
              }
              
              if (url) {
                const movResponse = await fetch(url, { headers })
                if (movResponse.ok) {
                  const movData = await movResponse.json()
                  return {
                    ...item,
                    detalhes: movData.venda || movData.despesa || movData.movimentacao
                  }
                }
              }
            } catch (error) {
              console.error(`Erro ao buscar detalhes de ${item.tipo_movimentacao}:`, error)
            }
            return item
          })
        )
        
        setRomaneioDetalhes({
          ...data.romaneio,
          itens: itensComDetalhes
        })
      }
    } catch (error) {
      console.error('Erro ao carregar detalhes do romaneio:', error)
      setMensagem({ tipo: 'erro', texto: 'Erro ao carregar detalhes do romaneio' })
    }
  }

  const imprimirRomaneio = () => {
    if (!romaneioDetalhes) return

    const conteudoImpressao = document.getElementById('conteudo-romaneio-impressao')
    if (!conteudoImpressao) return

    const janelaImpressao = window.open('', '_blank')
    if (!janelaImpressao) return

    janelaImpressao.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Romaneio ${romaneioDetalhes.numero_romaneio}</title>
          <style>
            @media print {
              @page { margin: 1cm; }
            }
            body {
              font-family: Arial, sans-serif;
              padding: 20px;
              color: #000;
            }
            .header-empresa {
              text-align: center;
              border-bottom: 2px solid #000;
              padding-bottom: 20px;
              margin-bottom: 20px;
            }
            .header-empresa h1 {
              font-size: 24px;
              font-weight: bold;
              margin-bottom: 10px;
            }
            .header-empresa p {
              margin: 3px 0;
              font-size: 12px;
            }
            .header-romaneio {
              text-align: center;
              margin: 20px 0;
            }
            .header-romaneio h2 {
              font-size: 20px;
              font-weight: bold;
              margin-bottom: 10px;
            }
            .info {
              margin-bottom: 20px;
            }
            .info-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 10px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 20px;
            }
            th, td {
              border: 1px solid #000;
              padding: 8px;
              text-align: left;
            }
            th {
              background-color: #f0f0f0;
              font-weight: bold;
            }
            .total {
              margin-top: 20px;
              text-align: right;
              font-weight: bold;
              font-size: 1.2em;
            }
            .detalhes-item {
              margin-top: 10px;
              padding: 10px;
              background-color: #f9f9f9;
              border-left: 3px solid #000;
            }
            .detalhes-item pre {
              margin: 0;
              white-space: pre-wrap;
              font-family: Arial, sans-serif;
              font-size: 11px;
            }
          </style>
        </head>
        <body>
          ${conteudoImpressao.innerHTML}
        </body>
      </html>
    `)

    janelaImpressao.document.close()
    setTimeout(() => {
      janelaImpressao.print()
    }, 250)
  }

  if (!podeAcessar('faturamento')) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Card className="p-8 bg-zinc-900 border-amber-500/20">
          <div className="flex flex-col items-center gap-4">
            <X className="h-12 w-12 text-red-500" />
            <h2 className="text-xl font-bold text-gray-300">Acesso Negado</h2>
            <p className="text-gray-400">Você não tem permissão para acessar este módulo.</p>
          </div>
        </Card>
      </div>
    )
  }

  const valorTotalVendas = movimentacoes
    .filter(m => m.tipo_movimentacao === 'venda')
    .reduce((acc, m) => acc + (typeof m.valor === 'string' ? parseFloat(m.valor) : m.valor), 0)
  
  const valorTotalDespesas = movimentacoes
    .filter(m => m.tipo_movimentacao === 'despesa')
    .reduce((acc, m) => acc + (typeof m.valor === 'string' ? parseFloat(m.valor) : m.valor), 0)
  
  const valorTotalEstoque = movimentacoes
    .filter(m => m.tipo_movimentacao === 'estoque')
    .reduce((acc, m) => acc + (typeof m.valor === 'string' ? parseFloat(m.valor) : m.valor), 0)

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2 text-gray-300">
            <Receipt className="h-8 w-8 text-amber-500" />
            Faturamento
          </h1>
          <p className="text-gray-400 mt-1">Gestão completa de todas as movimentações financeiras</p>
        </div>
        {podeEditar('faturamento') && movimentacoesSelecionadas.size > 0 && (
          <Button
            onClick={() => setMostrarModalRomaneio(true)}
            className="bg-amber-500 hover:bg-amber-600 text-white"
          >
            <FileCheck className="h-4 w-4 mr-2" />
            Criar Romaneio ({movimentacoesSelecionadas.size})
          </Button>
        )}
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-zinc-900 border-amber-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Total Movimentações</p>
              <p className="text-2xl font-bold text-gray-300">{movimentacoes.length}</p>
            </div>
            <Receipt className="h-8 w-8 text-amber-500" />
          </div>
        </Card>
        <Card className="p-4 bg-zinc-900 border-amber-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Total Vendas</p>
              <p className="text-2xl font-bold text-green-500">{formatarPreco(valorTotalVendas)}</p>
            </div>
            <ShoppingCart className="h-8 w-8 text-green-500" />
          </div>
        </Card>
        <Card className="p-4 bg-zinc-900 border-amber-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Total Despesas</p>
              <p className="text-2xl font-bold text-red-500">{formatarPreco(valorTotalDespesas)}</p>
            </div>
            <TrendingDown className="h-8 w-8 text-red-500" />
          </div>
        </Card>
        <Card className="p-4 bg-zinc-900 border-amber-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Total Estoque</p>
              <p className="text-2xl font-bold text-blue-500">{formatarPreco(valorTotalEstoque)}</p>
            </div>
            <Package className="h-8 w-8 text-blue-500" />
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
              <Save className="h-5 w-5" />
            ) : (
              <X className="h-5 w-5" />
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
                placeholder="Ticket, cliente, fornecedor..."
                value={filtros.search}
                onChange={(e) => setFiltros({ ...filtros, search: e.target.value })}
                className="pl-10 bg-zinc-800 border-amber-500/20 text-gray-300 placeholder:text-gray-500"
              />
            </div>
          </div>
          <div>
            <Label className="text-gray-300">Tipo</Label>
            <Select
              value={filtros.tipo || 'all'}
              onValueChange={(value) => setFiltros({ ...filtros, tipo: value })}
            >
              <SelectTrigger className="bg-zinc-800 border-amber-500/20 text-gray-300 mt-1">
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-amber-500/20">
                <SelectItem value="all" className="text-gray-300">Todos</SelectItem>
                <SelectItem value="venda" className="text-gray-300">Vendas</SelectItem>
                <SelectItem value="despesa" className="text-gray-300">Despesas</SelectItem>
                <SelectItem value="estoque" className="text-gray-300">Estoque</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-gray-300">Data Início</Label>
            <Input
              type="date"
              value={filtros.data_inicio}
              onChange={(e) => setFiltros({ ...filtros, data_inicio: e.target.value })}
              className="bg-zinc-800 border-amber-500/20 text-gray-300 mt-1"
            />
          </div>
          <div>
            <Label className="text-gray-300">Data Fim</Label>
            <Input
              type="date"
              value={filtros.data_fim}
              onChange={(e) => setFiltros({ ...filtros, data_fim: e.target.value })}
              className="bg-zinc-800 border-amber-500/20 text-gray-300 mt-1"
            />
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
                <SelectItem value="entrada" className="text-gray-300">Entrada</SelectItem>
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
                tipo: 'all',
                data_inicio: '',
                data_fim: '',
                status: 'all',
                search: '',
              })
              carregandoRef.current = false
              carregarMovimentacoes()
            }}
            className="border-amber-500/20 text-gray-300 hover:bg-amber-500/10"
          >
            <X className="h-4 w-4 mr-1" />
            Limpar Filtros
          </Button>
        </div>
      </Card>

      {/* Lista de Movimentações */}
      {loading ? (
        <div className="flex items-center justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
        </div>
      ) : movimentacoesFiltradas.length === 0 ? (
        <Card className="p-12 text-center bg-zinc-900 border-amber-500/20">
          <Receipt className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-400">Nenhuma movimentação encontrada</p>
        </Card>
      ) : (
        <div className="space-y-2">
          {movimentacoesFiltradas.map((movimentacao) => {
            const TipoIcon = getTipoIcon(movimentacao.tipo_movimentacao)
            const tipoColor = getTipoColor(movimentacao.tipo_movimentacao)
            
            return (
              <Card
                key={`${movimentacao.tipo_movimentacao}-${movimentacao.id}`}
                className={`p-4 bg-zinc-900 border-amber-500/20 ${
                  movimentacoesSelecionadas.has(movimentacao.id) ? 'ring-2 ring-amber-500' : ''
                }`}
              >
                <div className="flex items-start gap-4">
                  {podeEditar('faturamento') && (
                    <button
                      onClick={() => toggleSelecao(movimentacao.id)}
                      className="mt-1"
                    >
                      {movimentacoesSelecionadas.has(movimentacao.id) ? (
                        <FileCheck className="h-5 w-5 text-amber-500" />
                      ) : (
                        <FileText className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                  )}
                  <div className={`flex-shrink-0 ${tipoColor}`}>
                    <TipoIcon className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2 py-1 text-xs rounded border ${tipoColor} border-current/30 bg-current/10`}>
                        {getTipoLabel(movimentacao.tipo_movimentacao).toUpperCase()}
                      </span>
                      <span className="font-bold text-gray-300">{movimentacao.ticket}</span>
                      {movimentacao.cliente_nome && (
                        <span className="text-sm text-gray-400">- {movimentacao.cliente_nome}</span>
                      )}
                      {movimentacao.funcionario_nome && (
                        <span className="text-sm text-gray-400">- {movimentacao.funcionario_nome}</span>
                      )}
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                      <div>
                        <span className="text-gray-400">Data:</span>
                        <p className="text-gray-300">
                          {new Date(movimentacao.data).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-400">Valor:</span>
                        <p className={`font-bold ${movimentacao.tipo_movimentacao === 'despesa' ? 'text-red-500' : 'text-green-500'}`}>
                          {formatarPreco(movimentacao.valor)}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-400">Forma:</span>
                        <p className="text-gray-300">{formatarFormaPagamento(movimentacao.forma_pagamento)}</p>
                      </div>
                      {movimentacao.numero_parcelas > 1 && (
                        <div>
                          <span className="text-gray-400">Parcelas:</span>
                          <p className="text-gray-300">{movimentacao.numero_parcelas}x</p>
                        </div>
                      )}
                    </div>
                    {movimentacao.observacoes && (
                      <p className="text-sm text-gray-400 mt-2">{movimentacao.observacoes}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {podeEditar('faturamento') && (
                      <Button
                        onClick={() => abrirModalEditar(movimentacao)}
                        variant="outline"
                        className="border-amber-500/20 text-gray-300 hover:bg-amber-500/10"
                        size="sm"
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Editar
                      </Button>
                    )}
                    {podeExcluir('faturamento') && (
                      <Button
                        onClick={() => abrirModalExcluir(movimentacao)}
                        variant="outline"
                        className="border-red-500/20 text-red-500 hover:bg-red-500/10"
                        size="sm"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Excluir
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {/* Modal Editar - Será implementado com formulários específicos para cada tipo */}
      <Dialog open={mostrarModalEditar} onOpenChange={setMostrarModalEditar}>
        <DialogContent className="bg-zinc-900 border-amber-500/20 text-gray-300 max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-gray-300">
              Editar {movimentacaoEditando && getTipoLabel(movimentacaoEditando.tipo_movimentacao)}
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              {movimentacaoEditando?.ticket}
            </DialogDescription>
          </DialogHeader>

          {movimentacaoEditando && formDataEdicao && (
            <div className="space-y-4 mt-4">
              {movimentacaoEditando.tipo_movimentacao === 'venda' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-gray-300">Data da Venda *</Label>
                      <Input
                        type="date"
                        value={formDataEdicao.data_venda || ''}
                        onChange={(e) => setFormDataEdicao({ ...formDataEdicao, data_venda: e.target.value })}
                        className="bg-zinc-800 border-amber-500/20 text-gray-300"
                      />
                    </div>
                    <div>
                      <Label className="text-gray-300">Cliente</Label>
                      <Select
                        value={formDataEdicao.cliente_id || 'none'}
                        onValueChange={(value) => setFormDataEdicao({ ...formDataEdicao, cliente_id: value === 'none' ? null : value })}
                      >
                        <SelectTrigger className="bg-zinc-800 border-amber-500/20 text-gray-300">
                          <SelectValue placeholder="Selecione o cliente" />
                        </SelectTrigger>
                        <SelectContent className="bg-zinc-900 border-amber-500/20">
                          <SelectItem value="none" className="text-gray-300">Sem cliente</SelectItem>
                          {clientes.map((cliente) => (
                            <SelectItem key={cliente.id} value={cliente.id} className="text-gray-300">
                              {cliente.nome_completo}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-gray-300">Funcionário *</Label>
                      <Select
                        value={formDataEdicao.funcionario_id || ''}
                        onValueChange={(value) => setFormDataEdicao({ ...formDataEdicao, funcionario_id: value })}
                      >
                        <SelectTrigger className="bg-zinc-800 border-amber-500/20 text-gray-300">
                          <SelectValue placeholder="Selecione o funcionário" />
                        </SelectTrigger>
                        <SelectContent className="bg-zinc-900 border-amber-500/20">
                          {funcionarios.map((funcionario) => (
                            <SelectItem key={funcionario.id} value={funcionario.id} className="text-gray-300">
                              {funcionario.nome_completo}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-gray-300">Caixa *</Label>
                      <Select
                        value={formDataEdicao.caixa_id || ''}
                        onValueChange={(value) => setFormDataEdicao({ ...formDataEdicao, caixa_id: value })}
                      >
                        <SelectTrigger className="bg-zinc-800 border-amber-500/20 text-gray-300">
                          <SelectValue placeholder="Selecione o caixa" />
                        </SelectTrigger>
                        <SelectContent className="bg-zinc-900 border-amber-500/20">
                          {contas.map((conta) => (
                            <SelectItem key={conta.id} value={conta.id} className="text-gray-300">
                              {conta.nome}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label className="text-gray-300">Valor Total</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={formDataEdicao.valor_total || ''}
                        onChange={(e) => setFormDataEdicao({ ...formDataEdicao, valor_total: e.target.value })}
                        className="bg-zinc-800 border-amber-500/20 text-gray-300"
                      />
                    </div>
                    <div>
                      <Label className="text-gray-300">Desconto %</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={formDataEdicao.desconto_percentual || ''}
                        onChange={(e) => setFormDataEdicao({ ...formDataEdicao, desconto_percentual: e.target.value })}
                        className="bg-zinc-800 border-amber-500/20 text-gray-300"
                      />
                    </div>
                    <div>
                      <Label className="text-gray-300">Valor Líquido *</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={formDataEdicao.valor_liquido || ''}
                        onChange={(e) => setFormDataEdicao({ ...formDataEdicao, valor_liquido: e.target.value })}
                        className="bg-zinc-800 border-amber-500/20 text-gray-300"
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="text-gray-300">Forma de Pagamento *</Label>
                    <Select
                      value={formDataEdicao.forma_pagamento || ''}
                      onValueChange={(value) => setFormDataEdicao({ ...formDataEdicao, forma_pagamento: value })}
                    >
                      <SelectTrigger className="bg-zinc-800 border-amber-500/20 text-gray-300">
                        <SelectValue placeholder="Selecione a forma de pagamento" />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-900 border-amber-500/20">
                        <SelectItem value="dinheiro" className="text-gray-300">Dinheiro</SelectItem>
                        <SelectItem value="pix" className="text-gray-300">Pix</SelectItem>
                        <SelectItem value="ted" className="text-gray-300">TED</SelectItem>
                        <SelectItem value="cartao_1x" className="text-gray-300">Cartão 1x</SelectItem>
                        <SelectItem value="cartao_2x" className="text-gray-300">Cartão 2x</SelectItem>
                        <SelectItem value="cartao_3x" className="text-gray-300">Cartão 3x</SelectItem>
                        <SelectItem value="boleto_1x" className="text-gray-300">Boleto 1x</SelectItem>
                        <SelectItem value="boleto_2x" className="text-gray-300">Boleto 2x</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-gray-300">Observações</Label>
                    <Input
                      type="text"
                      value={formDataEdicao.observacoes || ''}
                      onChange={(e) => setFormDataEdicao({ ...formDataEdicao, observacoes: e.target.value })}
                      className="bg-zinc-800 border-amber-500/20 text-gray-300"
                    />
                  </div>
                </>
              )}

              {movimentacaoEditando.tipo_movimentacao === 'despesa' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-gray-300">Data de Emissão *</Label>
                      <Input
                        type="date"
                        value={formDataEdicao.data_emissao || ''}
                        onChange={(e) => setFormDataEdicao({ ...formDataEdicao, data_emissao: e.target.value })}
                        className="bg-zinc-800 border-amber-500/20 text-gray-300"
                      />
                    </div>
                    <div>
                      <Label className="text-gray-300">Data de Vencimento *</Label>
                      <Input
                        type="date"
                        value={formDataEdicao.data_vencimento || ''}
                        onChange={(e) => setFormDataEdicao({ ...formDataEdicao, data_vencimento: e.target.value })}
                        className="bg-zinc-800 border-amber-500/20 text-gray-300"
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="text-gray-300">Fornecedor *</Label>
                    <Input
                      type="text"
                      value={formDataEdicao.fornecedor || ''}
                      onChange={(e) => setFormDataEdicao({ ...formDataEdicao, fornecedor: e.target.value })}
                      className="bg-zinc-800 border-amber-500/20 text-gray-300"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-300">Descrição *</Label>
                    <Input
                      type="text"
                      value={formDataEdicao.descricao || ''}
                      onChange={(e) => setFormDataEdicao({ ...formDataEdicao, descricao: e.target.value })}
                      className="bg-zinc-800 border-amber-500/20 text-gray-300"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-gray-300">Valor Bruto *</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={formDataEdicao.valor_bruto || ''}
                        onChange={(e) => setFormDataEdicao({ ...formDataEdicao, valor_bruto: e.target.value })}
                        className="bg-zinc-800 border-amber-500/20 text-gray-300"
                      />
                    </div>
                    <div>
                      <Label className="text-gray-300">Valor Líquido *</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={formDataEdicao.valor_liquido || ''}
                        onChange={(e) => setFormDataEdicao({ ...formDataEdicao, valor_liquido: e.target.value })}
                        className="bg-zinc-800 border-amber-500/20 text-gray-300"
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="text-gray-300">Forma de Pagamento *</Label>
                    <Select
                      value={formDataEdicao.forma_pagamento || ''}
                      onValueChange={(value) => setFormDataEdicao({ ...formDataEdicao, forma_pagamento: value })}
                    >
                      <SelectTrigger className="bg-zinc-800 border-amber-500/20 text-gray-300">
                        <SelectValue placeholder="Selecione a forma de pagamento" />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-900 border-amber-500/20">
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
                    <Label className="text-gray-300">Caixa</Label>
                    <Select
                      value={formDataEdicao.caixa_id || 'none'}
                      onValueChange={(value) => setFormDataEdicao({ ...formDataEdicao, caixa_id: value === 'none' ? null : value })}
                    >
                      <SelectTrigger className="bg-zinc-800 border-amber-500/20 text-gray-300">
                        <SelectValue placeholder="Selecione o caixa" />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-900 border-amber-500/20">
                        <SelectItem value="none" className="text-gray-300">Sem caixa</SelectItem>
                        {contas.map((conta) => (
                          <SelectItem key={conta.id} value={conta.id} className="text-gray-300">
                            {conta.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-gray-300">Observações</Label>
                    <Input
                      type="text"
                      value={formDataEdicao.observacoes || ''}
                      onChange={(e) => setFormDataEdicao({ ...formDataEdicao, observacoes: e.target.value })}
                      className="bg-zinc-800 border-amber-500/20 text-gray-300"
                    />
                  </div>
                </>
              )}

              {movimentacaoEditando.tipo_movimentacao === 'estoque' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-gray-300">Data da Movimentação *</Label>
                      <Input
                        type="date"
                        value={formDataEdicao.data_movimentacao || ''}
                        onChange={(e) => setFormDataEdicao({ ...formDataEdicao, data_movimentacao: e.target.value })}
                        className="bg-zinc-800 border-amber-500/20 text-gray-300"
                      />
                    </div>
                    <div>
                      <Label className="text-gray-300">Produto *</Label>
                      <Select
                        value={formDataEdicao.produto_id || ''}
                        onValueChange={(value) => setFormDataEdicao({ ...formDataEdicao, produto_id: value })}
                      >
                        <SelectTrigger className="bg-zinc-800 border-amber-500/20 text-gray-300">
                          <SelectValue placeholder="Selecione o produto" />
                        </SelectTrigger>
                        <SelectContent className="bg-zinc-900 border-amber-500/20">
                          {produtos.map((produto) => (
                            <SelectItem key={produto.id} value={produto.id} className="text-gray-300">
                              {produto.codigo} - {produto.descricao}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-gray-300">Quantidade *</Label>
                      <Input
                        type="number"
                        value={formDataEdicao.quantidade || ''}
                        onChange={(e) => setFormDataEdicao({ ...formDataEdicao, quantidade: e.target.value })}
                        className="bg-zinc-800 border-amber-500/20 text-gray-300"
                      />
                    </div>
                    <div>
                      <Label className="text-gray-300">Valor Unitário *</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={formDataEdicao.valor_unitario || ''}
                        onChange={(e) => setFormDataEdicao({ ...formDataEdicao, valor_unitario: e.target.value })}
                        className="bg-zinc-800 border-amber-500/20 text-gray-300"
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="text-gray-300">Fornecedor *</Label>
                    <Input
                      type="text"
                      value={formDataEdicao.fornecedor || ''}
                      onChange={(e) => setFormDataEdicao({ ...formDataEdicao, fornecedor: e.target.value })}
                      className="bg-zinc-800 border-amber-500/20 text-gray-300"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-300">Observações</Label>
                    <Input
                      type="text"
                      value={formDataEdicao.observacoes || ''}
                      onChange={(e) => setFormDataEdicao({ ...formDataEdicao, observacoes: e.target.value })}
                      className="bg-zinc-800 border-amber-500/20 text-gray-300"
                    />
                  </div>
                </>
              )}

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setMostrarModalEditar(false)
                    setMovimentacaoEditando(null)
                  }}
                  disabled={salvando}
                  className="border-amber-500/20 text-gray-300 hover:bg-amber-500/10"
                >
                  <X className="h-4 w-4 mr-1" />
                  Cancelar
                </Button>
                <Button
                  onClick={salvarEdicao}
                  disabled={salvando}
                  className="bg-amber-500 hover:bg-amber-600 text-white"
                >
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
          )}
        </DialogContent>
      </Dialog>

      {/* Modal Excluir */}
      <Dialog open={mostrarModalExcluir} onOpenChange={setMostrarModalExcluir}>
        <DialogContent className="bg-zinc-900 border-amber-500/20 text-gray-300">
          <DialogHeader>
            <DialogTitle className="text-gray-300">Confirmar Exclusão</DialogTitle>
            <DialogDescription className="text-gray-400">
              Tem certeza que deseja excluir {movimentacaoExcluindo?.ticket}?
            </DialogDescription>
          </DialogHeader>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setMostrarModalExcluir(false)
                setMovimentacaoExcluindo(null)
              }}
              disabled={salvando}
              className="border-amber-500/20 text-gray-300 hover:bg-amber-500/10"
            >
              <X className="h-4 w-4 mr-1" />
              Cancelar
            </Button>
            <Button
              onClick={excluirMovimentacao}
              disabled={salvando}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              {salvando ? (
                <>
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  Excluindo...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-1" />
                  Excluir
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal Criar Romaneio */}
      <Dialog open={mostrarModalRomaneio} onOpenChange={setMostrarModalRomaneio}>
        <DialogContent className="bg-zinc-900 border-amber-500/20 text-gray-300 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-gray-300">Criar Romaneio</DialogTitle>
            <DialogDescription className="text-gray-400">
              {movimentacoesSelecionadas.size} movimentação(ões) selecionada(s)
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div>
              <Label className="text-gray-300">Tipo de Romaneio *</Label>
              <Select
                value={formDataRomaneio.tipo_romaneio}
                onValueChange={(value) => setFormDataRomaneio({ ...formDataRomaneio, tipo_romaneio: value })}
              >
                <SelectTrigger className="bg-zinc-800 border-amber-500/20 text-gray-300">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-amber-500/20">
                  <SelectItem value="faturamento" className="text-gray-300">Faturamento</SelectItem>
                  <SelectItem value="estoque" className="text-gray-300">Estoque</SelectItem>
                  <SelectItem value="despesa" className="text-gray-300">Despesa</SelectItem>
                  <SelectItem value="misto" className="text-gray-300">Misto</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-gray-300">Data do Romaneio *</Label>
              <Input
                type="date"
                value={formDataRomaneio.data_romaneio}
                onChange={(e) => setFormDataRomaneio({ ...formDataRomaneio, data_romaneio: e.target.value })}
                className="bg-zinc-800 border-amber-500/20 text-gray-300"
              />
            </div>

            <div>
              <Label className="text-gray-300">Descrição</Label>
              <Input
                type="text"
                value={formDataRomaneio.descricao}
                onChange={(e) => setFormDataRomaneio({ ...formDataRomaneio, descricao: e.target.value })}
                placeholder="Descrição do romaneio..."
                className="bg-zinc-800 border-amber-500/20 text-gray-300"
              />
            </div>

            <div>
              <Label className="text-gray-300">Observações</Label>
              <Input
                type="text"
                value={formDataRomaneio.observacoes}
                onChange={(e) => setFormDataRomaneio({ ...formDataRomaneio, observacoes: e.target.value })}
                placeholder="Observações adicionais..."
                className="bg-zinc-800 border-amber-500/20 text-gray-300"
              />
            </div>

            <div className="max-h-60 overflow-y-auto space-y-2 border border-zinc-800 rounded p-2">
              <p className="text-sm font-semibold text-gray-300 mb-2">Movimentações Selecionadas:</p>
              {Array.from(movimentacoesSelecionadas).map(id => {
                const mov = movimentacoes.find(m => m.id === id)
                if (!mov) return null
                return (
                  <div key={id} className="flex items-center justify-between p-2 bg-zinc-800 rounded text-sm">
                    <span className="text-gray-300">{mov.ticket} - {getTipoLabel(mov.tipo_movimentacao)}</span>
                    <span className="text-amber-500 font-bold">{formatarPreco(mov.valor)}</span>
                  </div>
                )
              })}
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setMostrarModalRomaneio(false)
                }}
                disabled={salvando}
                className="border-amber-500/20 text-gray-300 hover:bg-amber-500/10"
              >
                <X className="h-4 w-4 mr-1" />
                Cancelar
              </Button>
              <Button
                onClick={criarRomaneio}
                disabled={salvando}
                className="bg-amber-500 hover:bg-amber-600 text-white"
              >
                {salvando ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                    Criando...
                  </>
                ) : (
                  <>
                    <FileCheck className="h-4 w-4 mr-1" />
                    Criar Romaneio
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Seção de Romaneios */}
      <Card className="p-4 bg-zinc-900 border-amber-500/20 mt-6">
        <h2 className="text-xl font-bold text-gray-300 mb-4 flex items-center gap-2">
          <FileCheck className="h-6 w-6 text-amber-500" />
          Romaneios Criados
        </h2>
        {romaneios.length === 0 ? (
          <p className="text-gray-400 text-center py-8">Nenhum romaneio criado ainda</p>
        ) : (
          <div className="space-y-2">
            {romaneios.map((romaneio) => (
              <Card key={romaneio.id} className="p-3 bg-zinc-800 border-amber-500/10">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-bold text-gray-300">{romaneio.numero_romaneio}</p>
                    <p className="text-sm text-gray-400">
                      {new Date(romaneio.data_romaneio).toLocaleDateString('pt-BR')} - 
                      {romaneio.tipo_romaneio} - {romaneio.total_itens} item(ns)
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 text-xs rounded border ${
                      romaneio.status === 'fechado' 
                        ? 'bg-green-500/10 text-green-500 border-green-500/30'
                        : romaneio.status === 'cancelado'
                        ? 'bg-red-500/10 text-red-500 border-red-500/30'
                        : 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30'
                    }`}>
                      {romaneio.status.toUpperCase()}
                    </span>
                    <Button
                      onClick={() => visualizarRomaneio(romaneio)}
                      variant="outline"
                      size="sm"
                      className="border-amber-500/20 text-gray-300 hover:bg-amber-500/10"
                    >
                      <FileText className="h-4 w-4 mr-1" />
                      Visualizar
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </Card>

      {/* Modal Visualizar Romaneio */}
      <Dialog open={mostrarModalVisualizarRomaneio} onOpenChange={setMostrarModalVisualizarRomaneio}>
        <DialogContent className="bg-zinc-900 border-amber-500/20 text-gray-300 max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-gray-300">
              Romaneio {romaneioVisualizando?.numero_romaneio}
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              {romaneioVisualizando && new Date(romaneioVisualizando.data_romaneio).toLocaleDateString('pt-BR')}
            </DialogDescription>
          </DialogHeader>

          {romaneioDetalhes ? (
            <div className="mt-4">
              {/* Conteúdo para impressão (oculto na tela) */}
              <div id="conteudo-romaneio-impressao" className="hidden">
                {/* Cabeçalho da Empresa */}
                {configuracoes && (
                  <div className="header-empresa">
                    <h1>{configuracoes.nome_fantasia || configuracoes.nome_empresarial || 'EMPRESA'}</h1>
                    {configuracoes.nome_empresarial && configuracoes.nome_empresarial !== configuracoes.nome_fantasia && (
                      <p><strong>Razão Social:</strong> {configuracoes.nome_empresarial}</p>
                    )}
                    {configuracoes.cnpj && <p><strong>CNPJ:</strong> {configuracoes.cnpj}</p>}
                    {configuracoes.inscricao_estadual && <p><strong>IE:</strong> {configuracoes.inscricao_estadual}</p>}
                    {configuracoes.endereco_rua && (
                      <p>
                        {configuracoes.endereco_rua}
                        {configuracoes.endereco_numero && `, ${configuracoes.endereco_numero}`}
                        {configuracoes.endereco_complemento && ` - ${configuracoes.endereco_complemento}`}
                        {configuracoes.endereco_bairro && ` - ${configuracoes.endereco_bairro}`}
                        {configuracoes.endereco_cidade && ` - ${configuracoes.endereco_cidade}`}
                        {configuracoes.endereco_estado && `/${configuracoes.endereco_estado}`}
                        {configuracoes.endereco_cep && ` - CEP: ${configuracoes.endereco_cep}`}
                      </p>
                    )}
                    {configuracoes.telefone_principal && <p><strong>Telefone:</strong> {configuracoes.telefone_principal}</p>}
                    {configuracoes.email_contato && <p><strong>E-mail:</strong> {configuracoes.email_contato}</p>}
                  </div>
                )}
                
                {/* Cabeçalho do Romaneio */}
                <div className="header-romaneio">
                  <h2>ROMANEIO DE {romaneioDetalhes.tipo_romaneio.toUpperCase()}</h2>
                  <p style={{ fontSize: '18px', fontWeight: 'bold' }}>{romaneioDetalhes.numero_romaneio}</p>
                </div>
                <div className="info">
                  <div className="info-row">
                    <span><strong>Data:</strong> {new Date(romaneioDetalhes.data_romaneio).toLocaleDateString('pt-BR')}</span>
                    <span><strong>Tipo:</strong> {romaneioDetalhes.tipo_romaneio.toUpperCase()}</span>
                    <span><strong>Status:</strong> {romaneioDetalhes.status.toUpperCase()}</span>
                  </div>
                  {romaneioDetalhes.descricao && (
                    <p><strong>Descrição:</strong> {romaneioDetalhes.descricao}</p>
                  )}
                  {romaneioDetalhes.observacoes && (
                    <p><strong>Observações:</strong> {romaneioDetalhes.observacoes}</p>
                  )}
                </div>
                <table>
                  <thead>
                    <tr>
                      <th>Tipo</th>
                      <th>Ticket/Código</th>
                      <th>Descrição Detalhada</th>
                      <th>Data</th>
                      <th>Valor</th>
                    </tr>
                  </thead>
                  <tbody>
                    {romaneioDetalhes.itens?.map((item: any, index: number) => {
                      const detalhes = item.detalhes
                      let ticket = item.movimentacao_id
                      let descricao = ''
                      let data = ''
                      let valor = 0
                      let detalhesCompletos = ''

                      if (detalhes) {
                        if (item.tipo_movimentacao === 'venda') {
                          ticket = detalhes.ticket
                          descricao = `Venda - Cliente: ${detalhes.cliente_nome || 'N/A'}`
                          data = new Date(detalhes.data_venda).toLocaleDateString('pt-BR')
                          valor = parseFloat(detalhes.valor_liquido || 0)
                          
                          // Detalhes completos da venda
                          detalhesCompletos = `Cliente: ${detalhes.cliente_nome || 'N/A'} | Funcionário: ${detalhes.funcionario_nome || 'N/A'} | Forma de Pagamento: ${formatarFormaPagamento(detalhes.forma_pagamento)}`
                          if (detalhes.numero_parcelas > 1) {
                            detalhesCompletos += ` | ${detalhes.numero_parcelas}x parcelas`
                          }
                          
                          // Serviços
                          if (detalhes.servicos && detalhes.servicos.length > 0) {
                            detalhesCompletos += `\n\nSERVIÇOS REALIZADOS:\n`
                            detalhes.servicos.forEach((serv: any, idx: number) => {
                              detalhesCompletos += `${idx + 1}. ${serv.servico_nome || 'N/A'} - ${formatarPreco(serv.valor)}\n`
                            })
                          }
                          
                          // Produtos
                          if (detalhes.produtos && detalhes.produtos.length > 0) {
                            detalhesCompletos += `\nPRODUTOS ADQUIRIDOS:\n`
                            detalhes.produtos.forEach((prod: any, idx: number) => {
                              detalhesCompletos += `${idx + 1}. ${prod.produto_descricao || 'N/A'} (${prod.produto_codigo || 'N/A'}) - Qtd: ${prod.quantidade} x ${formatarPreco(prod.valor_unitario)} = ${formatarPreco(prod.valor_total)}\n`
                            })
                          }
                          
                          if (detalhes.observacoes) {
                            detalhesCompletos += `\nObservações: ${detalhes.observacoes}`
                          }
                        } else if (item.tipo_movimentacao === 'despesa') {
                          ticket = detalhes.ticket
                          descricao = `Despesa - ${detalhes.fornecedor}`
                          data = new Date(detalhes.data_emissao).toLocaleDateString('pt-BR')
                          valor = parseFloat(detalhes.valor_liquido || 0)
                          
                          detalhesCompletos = `Fornecedor: ${detalhes.fornecedor}\nDescrição: ${detalhes.descricao}\nForma de Pagamento: ${formatarFormaPagamento(detalhes.forma_pagamento)}`
                          if (detalhes.numero_parcelas > 1) {
                            detalhesCompletos += ` | ${detalhes.numero_parcelas}x parcelas`
                          }
                          detalhesCompletos += `\nVencimento: ${new Date(detalhes.data_vencimento).toLocaleDateString('pt-BR')}`
                          if (detalhes.data_pagamento) {
                            detalhesCompletos += ` | Pago em: ${new Date(detalhes.data_pagamento).toLocaleDateString('pt-BR')}`
                          }
                          if (detalhes.observacoes) {
                            detalhesCompletos += `\nObservações: ${detalhes.observacoes}`
                          }
                        } else if (item.tipo_movimentacao === 'estoque') {
                          ticket = detalhes.codigo || 'N/A'
                          descricao = `Estoque - ${detalhes.produto_descricao || 'N/A'}`
                          data = new Date(detalhes.data_movimentacao).toLocaleDateString('pt-BR')
                          valor = parseFloat(detalhes.valor_total || 0)
                          
                          detalhesCompletos = `Produto: ${detalhes.produto_descricao || 'N/A'} (Código: ${detalhes.codigo || 'N/A'})\nFornecedor: ${detalhes.fornecedor || 'N/A'}\nQuantidade: ${detalhes.quantidade || 0} unidades\nValor Unitário: ${formatarPreco(detalhes.valor_unitario || 0)}\nValor Total: ${formatarPreco(detalhes.valor_total || 0)}`
                          if (detalhes.observacoes) {
                            detalhesCompletos += `\nObservações: ${detalhes.observacoes}`
                          }
                        }
                      }

                      return (
                        <tr key={index}>
                          <td>{getTipoLabel(item.tipo_movimentacao)}</td>
                          <td>{ticket}</td>
                          <td>
                            <div>
                              <strong>{descricao}</strong>
                              {detalhesCompletos && (
                                <div className="detalhes-item">
                                  <pre style={{ margin: 0, whiteSpace: 'pre-wrap', fontFamily: 'Arial, sans-serif', fontSize: '11px' }}>{detalhesCompletos}</pre>
                                </div>
                              )}
                            </div>
                          </td>
                          <td>{data}</td>
                          <td>{formatarPreco(valor).replace('R$', '').trim()}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
                <div className="total">
                  <p>Total de Itens: {romaneioDetalhes.itens?.length || 0}</p>
                  <p>Valor Total: {formatarPreco(romaneioDetalhes.itens?.reduce((acc: number, item: any) => {
                    const detalhes = item.detalhes
                    if (!detalhes) return acc
                    if (item.tipo_movimentacao === 'venda') {
                      return acc + parseFloat(detalhes.valor_liquido || 0)
                    } else if (item.tipo_movimentacao === 'despesa') {
                      return acc + parseFloat(detalhes.valor_liquido || 0)
                    } else if (item.tipo_movimentacao === 'estoque') {
                      return acc + parseFloat(detalhes.valor_total || 0)
                    }
                    return acc
                  }, 0))}</p>
                </div>
              </div>

              {/* Conteúdo visual na tela */}
              <div className="space-y-4">
                {/* Cabeçalho da Empresa */}
                {configuracoes && (
                  <Card className="p-4 bg-zinc-800 border-amber-500/20">
                    <div className="text-center space-y-2">
                      <h2 className="text-xl font-bold text-gray-300">
                        {configuracoes.nome_fantasia || configuracoes.nome_empresarial || 'EMPRESA'}
                      </h2>
                      {configuracoes.nome_empresarial && configuracoes.nome_empresarial !== configuracoes.nome_fantasia && (
                        <p className="text-sm text-gray-400">Razão Social: {configuracoes.nome_empresarial}</p>
                      )}
                      <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-400">
                        {configuracoes.cnpj && <span>CNPJ: {configuracoes.cnpj}</span>}
                        {configuracoes.inscricao_estadual && <span>IE: {configuracoes.inscricao_estadual}</span>}
                      </div>
                      {configuracoes.endereco_rua && (
                        <p className="text-sm text-gray-400">
                          {configuracoes.endereco_rua}
                          {configuracoes.endereco_numero && `, ${configuracoes.endereco_numero}`}
                          {configuracoes.endereco_complemento && ` - ${configuracoes.endereco_complemento}`}
                          {configuracoes.endereco_bairro && ` - ${configuracoes.endereco_bairro}`}
                          {configuracoes.endereco_cidade && ` - ${configuracoes.endereco_cidade}`}
                          {configuracoes.endereco_estado && `/${configuracoes.endereco_estado}`}
                          {configuracoes.endereco_cep && ` - CEP: ${configuracoes.endereco_cep}`}
                        </p>
                      )}
                      <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-400">
                        {configuracoes.telefone_principal && <span>Tel: {configuracoes.telefone_principal}</span>}
                        {configuracoes.email_contato && <span>E-mail: {configuracoes.email_contato}</span>}
                      </div>
                    </div>
                  </Card>
                )}

                {/* Informações do Romaneio */}
                <div className="grid grid-cols-3 gap-4 p-4 bg-zinc-800 rounded">
                  <div>
                    <p className="text-sm text-gray-400">Data</p>
                    <p className="font-bold text-gray-300">
                      {new Date(romaneioDetalhes.data_romaneio).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Tipo</p>
                    <p className="font-bold text-gray-300">{romaneioDetalhes.tipo_romaneio.toUpperCase()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Status</p>
                    <span className={`px-2 py-1 text-xs rounded border ${
                      romaneioDetalhes.status === 'fechado' 
                        ? 'bg-green-500/10 text-green-500 border-green-500/30'
                        : romaneioDetalhes.status === 'cancelado'
                        ? 'bg-red-500/10 text-red-500 border-red-500/30'
                        : 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30'
                    }`}>
                      {romaneioDetalhes.status.toUpperCase()}
                    </span>
                  </div>
                </div>

                {romaneioDetalhes.descricao && (
                  <div>
                    <p className="text-sm text-gray-400">Descrição</p>
                    <p className="text-gray-300">{romaneioDetalhes.descricao}</p>
                  </div>
                )}

                {romaneioDetalhes.observacoes && (
                  <div>
                    <p className="text-sm text-gray-400">Observações</p>
                    <p className="text-gray-300">{romaneioDetalhes.observacoes}</p>
                  </div>
                )}

                <div>
                  <h3 className="text-lg font-bold text-gray-300 mb-3">Itens do Romaneio</h3>
                  {romaneioDetalhes.itens && romaneioDetalhes.itens.length > 0 ? (
                    <div className="space-y-2">
                      {romaneioDetalhes.itens.map((item: any, index: number) => {
                        const detalhes = item.detalhes
                        const TipoIcon = getTipoIcon(item.tipo_movimentacao)
                        const tipoColor = getTipoColor(item.tipo_movimentacao)
                        
                        let ticket = item.movimentacao_id
                        let descricao = 'Carregando...'
                        let data = ''
                        let valor = 0

                        if (detalhes) {
                          if (item.tipo_movimentacao === 'venda') {
                            ticket = detalhes.ticket
                            descricao = `Venda - Cliente: ${detalhes.cliente_nome || 'N/A'}`
                            data = new Date(detalhes.data_venda).toLocaleDateString('pt-BR')
                            valor = parseFloat(detalhes.valor_liquido || 0)
                          } else if (item.tipo_movimentacao === 'despesa') {
                            ticket = detalhes.ticket
                            descricao = `Despesa - ${detalhes.fornecedor} - ${detalhes.descricao}`
                            data = new Date(detalhes.data_emissao).toLocaleDateString('pt-BR')
                            valor = parseFloat(detalhes.valor_liquido || 0)
                          } else if (item.tipo_movimentacao === 'estoque') {
                            ticket = detalhes.codigo || 'N/A'
                            descricao = `Estoque - ${detalhes.produto_descricao || 'N/A'}`
                            data = new Date(detalhes.data_movimentacao).toLocaleDateString('pt-BR')
                            valor = parseFloat(detalhes.valor_total || 0)
                          }
                        }

                        return (
                          <Card key={index} className="p-4 bg-zinc-800 border-amber-500/10">
                            <div className="flex items-start gap-3">
                              <div className={tipoColor}>
                                <TipoIcon className="h-5 w-5 mt-1" />
                              </div>
                              <div className="flex-1 space-y-2">
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-gray-300">{ticket}</span>
                                  <span className={`px-2 py-1 text-xs rounded border ${tipoColor} border-current/30 bg-current/10`}>
                                    {getTipoLabel(item.tipo_movimentacao)}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-300 font-semibold">{descricao}</p>
                                
                                {/* Detalhes específicos por tipo */}
                                {detalhes && item.tipo_movimentacao === 'venda' && (
                                  <div className="mt-3 space-y-2 p-3 bg-zinc-900 rounded border border-zinc-700">
                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                      <div>
                                        <span className="text-gray-400">Cliente:</span>
                                        <p className="text-gray-300">{detalhes.cliente_nome || 'N/A'}</p>
                                      </div>
                                      <div>
                                        <span className="text-gray-400">Funcionário:</span>
                                        <p className="text-gray-300">{detalhes.funcionario_nome || 'N/A'}</p>
                                      </div>
                                      <div>
                                        <span className="text-gray-400">Forma de Pagamento:</span>
                                        <p className="text-gray-300">{formatarFormaPagamento(detalhes.forma_pagamento)}</p>
                                      </div>
                                      {detalhes.numero_parcelas > 1 && (
                                        <div>
                                          <span className="text-gray-400">Parcelas:</span>
                                          <p className="text-gray-300">{detalhes.numero_parcelas}x</p>
                                        </div>
                                      )}
                                    </div>
                                    
                                    {detalhes.servicos && detalhes.servicos.length > 0 && (
                                      <div className="mt-3">
                                        <p className="text-sm font-semibold text-amber-500 mb-2">SERVIÇOS REALIZADOS:</p>
                                        <div className="space-y-1">
                                          {detalhes.servicos.map((serv: any, idx: number) => (
                                            <div key={idx} className="text-sm text-gray-300 pl-2 border-l-2 border-amber-500/30">
                                              {idx + 1}. {serv.servico_nome || 'N/A'} - {formatarPreco(serv.valor)}
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                    
                                    {detalhes.produtos && detalhes.produtos.length > 0 && (
                                      <div className="mt-3">
                                        <p className="text-sm font-semibold text-amber-500 mb-2">PRODUTOS ADQUIRIDOS:</p>
                                        <div className="space-y-1">
                                          {detalhes.produtos.map((prod: any, idx: number) => (
                                            <div key={idx} className="text-sm text-gray-300 pl-2 border-l-2 border-blue-500/30">
                                              {idx + 1}. {prod.produto_descricao || 'N/A'} ({prod.produto_codigo || 'N/A'}) - 
                                              Qtd: {prod.quantidade} x {formatarPreco(prod.valor_unitario)} = {formatarPreco(prod.valor_total)}
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                    
                                    {detalhes.observacoes && (
                                      <div className="mt-2 text-sm">
                                        <span className="text-gray-400">Observações: </span>
                                        <span className="text-gray-300">{detalhes.observacoes}</span>
                                      </div>
                                    )}
                                  </div>
                                )}
                                
                                {detalhes && item.tipo_movimentacao === 'despesa' && (
                                  <div className="mt-3 space-y-1 p-3 bg-zinc-900 rounded border border-zinc-700 text-sm">
                                    <div>
                                      <span className="text-gray-400">Fornecedor: </span>
                                      <span className="text-gray-300">{detalhes.fornecedor}</span>
                                    </div>
                                    <div>
                                      <span className="text-gray-400">Descrição: </span>
                                      <span className="text-gray-300">{detalhes.descricao}</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 mt-2">
                                      <div>
                                        <span className="text-gray-400">Forma de Pagamento: </span>
                                        <span className="text-gray-300">{formatarFormaPagamento(detalhes.forma_pagamento)}</span>
                                      </div>
                                      {detalhes.numero_parcelas > 1 && (
                                        <div>
                                          <span className="text-gray-400">Parcelas: </span>
                                          <span className="text-gray-300">{detalhes.numero_parcelas}x</span>
                                        </div>
                                      )}
                                      <div>
                                        <span className="text-gray-400">Vencimento: </span>
                                        <span className="text-gray-300">{new Date(detalhes.data_vencimento).toLocaleDateString('pt-BR')}</span>
                                      </div>
                                      {detalhes.data_pagamento && (
                                        <div>
                                          <span className="text-gray-400">Pago em: </span>
                                          <span className="text-gray-300">{new Date(detalhes.data_pagamento).toLocaleDateString('pt-BR')}</span>
                                        </div>
                                      )}
                                    </div>
                                    {detalhes.observacoes && (
                                      <div className="mt-2">
                                        <span className="text-gray-400">Observações: </span>
                                        <span className="text-gray-300">{detalhes.observacoes}</span>
                                      </div>
                                    )}
                                  </div>
                                )}
                                
                                {detalhes && item.tipo_movimentacao === 'estoque' && (
                                  <div className="mt-3 space-y-1 p-3 bg-zinc-900 rounded border border-zinc-700 text-sm">
                                    <div>
                                      <span className="text-gray-400">Produto: </span>
                                      <span className="text-gray-300">{detalhes.produto_descricao || 'N/A'}</span>
                                    </div>
                                    <div>
                                      <span className="text-gray-400">Código: </span>
                                      <span className="text-gray-300">{detalhes.codigo || 'N/A'}</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 mt-2">
                                      <div>
                                        <span className="text-gray-400">Fornecedor: </span>
                                        <span className="text-gray-300">{detalhes.fornecedor || 'N/A'}</span>
                                      </div>
                                      <div>
                                        <span className="text-gray-400">Quantidade: </span>
                                        <span className="text-gray-300">{detalhes.quantidade || 0} unidades</span>
                                      </div>
                                      <div>
                                        <span className="text-gray-400">Valor Unitário: </span>
                                        <span className="text-gray-300">{formatarPreco(detalhes.valor_unitario || 0)}</span>
                                      </div>
                                      <div>
                                        <span className="text-gray-400">Valor Total: </span>
                                        <span className="text-gray-300 font-bold">{formatarPreco(detalhes.valor_total || 0)}</span>
                                      </div>
                                    </div>
                                    {detalhes.observacoes && (
                                      <div className="mt-2">
                                        <span className="text-gray-400">Observações: </span>
                                        <span className="text-gray-300">{detalhes.observacoes}</span>
                                      </div>
                                    )}
                                  </div>
                                )}
                                
                                <div className="flex gap-4 mt-2 text-sm pt-2 border-t border-zinc-700">
                                  <span className="text-gray-400">Data: <span className="text-gray-300">{data || 'N/A'}</span></span>
                                  <span className="text-gray-400">Valor Total: <span className={`font-bold ${item.tipo_movimentacao === 'despesa' ? 'text-red-500' : 'text-green-500'}`}>{formatarPreco(valor)}</span></span>
                                </div>
                              </div>
                            </div>
                          </Card>
                        )
                      })}
                    </div>
                  ) : (
                    <p className="text-gray-400 text-center py-4">Nenhum item encontrado</p>
                  )}
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t border-zinc-800">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setMostrarModalVisualizarRomaneio(false)
                      setRomaneioVisualizando(null)
                      setRomaneioDetalhes(null)
                    }}
                    className="border-amber-500/20 text-gray-300 hover:bg-amber-500/10"
                  >
                    <X className="h-4 w-4 mr-1" />
                    Fechar
                  </Button>
                  <Button
                    onClick={imprimirRomaneio}
                    className="bg-amber-500 hover:bg-amber-600 text-white"
                  >
                    <Printer className="h-4 w-4 mr-1" />
                    Imprimir/Download
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

