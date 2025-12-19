'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { FileText, Search, Edit, Trash2, Plus, Eye, X, Save, Loader2, AlertCircle, CheckCircle2, DollarSign, Minus, Percent, Package, Scissors } from 'lucide-react'
import { usePermissions } from '@/hooks/usePermissions'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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

interface Servico {
  id: string
  nome: string
  preco: number
}

interface Produto {
  id: string
  codigo: string
  descricao: string
  preco_venda: number
}

interface AssinaturaServico {
  servico_id: string
  servico_nome: string
  quantidade: number
  preco: number
}

interface AssinaturaProduto {
  produto_id: string
  produto_codigo: string
  produto_descricao: string
  quantidade: number
  preco: number
}

interface Assinatura {
  id: string
  nome: string
  descricao?: string | null
  preco_total: number
  valor_comercializado: number
  desconto_percentual: number
  desconto_valor: number
  valor_liquido: number
  validade_em_dias: number
  is_active: boolean
  created_at: string
  updated_at?: string | null
  servicos: AssinaturaServico[]
  produtos: AssinaturaProduto[]
}

export default function AssinaturasPage() {
  const [assinaturas, setAssinaturas] = useState<Assinatura[]>([])
  const [assinaturasFiltradas, setAssinaturasFiltradas] = useState<Assinatura[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [mostrarModal, setMostrarModal] = useState(false)
  const [modalTipo, setModalTipo] = useState<'criar' | 'editar' | 'excluir' | 'visualizar'>('criar')
  const [assinaturaSelecionada, setAssinaturaSelecionada] = useState<Assinatura | null>(null)
  const [salvando, setSalvando] = useState(false)
  const [mensagem, setMensagem] = useState<{ tipo: 'sucesso' | 'erro' | null; texto: string }>({ tipo: null, texto: '' })
  const { podeAcessar, podeEditar, podeExcluir } = usePermissions()

  // Dados para o formulário
  const [servicos, setServicos] = useState<Servico[]>([])
  const [produtos, setProdutos] = useState<Produto[]>([])

  // Formulário
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    valor_comercializado: '',
    desconto_percentual: '',
    desconto_valor: '',
    validade_em_dias: '30',
    is_active: true,
  })

  // Serviços e produtos selecionados
  const [servicosSelecionados, setServicosSelecionados] = useState<AssinaturaServico[]>([])
  const [produtosSelecionados, setProdutosSelecionados] = useState<AssinaturaProduto[]>([])

  // Seleção para adicionar novos itens
  const [servicoSelecao, setServicoSelecao] = useState<{ id: string; quantidade: string }>({ id: '', quantidade: '1' })
  const [produtoSelecao, setProdutoSelecao] = useState<{ id: string; quantidade: string }>({ id: '', quantidade: '1' })

  useEffect(() => {
    carregarAssinaturas()
    carregarServicos()
    carregarProdutos()
  }, [])

  useEffect(() => {
    filtrarAssinaturas()
  }, [searchTerm, assinaturas])

  const carregarAssinaturas = async () => {
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

      const response = await fetch(`${apiUrl}/api/v1/assinaturas`, {
        headers,
      })

      if (!response.ok) {
        throw new Error('Erro ao carregar assinaturas')
      }

      const data = await response.json()
      setAssinaturas(data.assinaturas || [])
    } catch (error: any) {
      console.error('Erro ao carregar assinaturas:', error)
      setMensagem({ tipo: 'erro', texto: error.message || 'Erro ao carregar assinaturas' })
    } finally {
      setLoading(false)
    }
  }

  const carregarServicos = async () => {
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
      }

      const response = await fetch(`${apiUrl}/api/v1/servicos?is_active=true`, { headers })
      if (response.ok) {
        const data = await response.json()
        setServicos(data.servicos || [])
      }
    } catch (error) {
      console.error('Erro ao carregar serviços:', error)
    }
  }

  const carregarProdutos = async () => {
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
      }

      const response = await fetch(`${apiUrl}/api/v1/produtos?is_active=true`, { headers })
      if (response.ok) {
        const data = await response.json()
        setProdutos(data.produtos || [])
      }
    } catch (error) {
      console.error('Erro ao carregar produtos:', error)
    }
  }

  const filtrarAssinaturas = () => {
    let filtradas = assinaturas

    if (searchTerm.trim()) {
      const termo = searchTerm.toLowerCase().trim()
      filtradas = filtradas.filter((ass) => {
        const nome = (ass.nome || '').toString().toLowerCase()
        const descricao = (ass.descricao || '').toString().toLowerCase()
        return nome.includes(termo) || descricao.includes(termo)
      })
    }

    setAssinaturasFiltradas(filtradas)
  }

  const formatarPreco = (preco: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(preco)
  }

  // Calcular preço total (soma de serviços e produtos)
  const calcularPrecoTotal = () => {
    let total = 0
    
    servicosSelecionados.forEach((serv) => {
      total += serv.preco * serv.quantidade
    })
    
    produtosSelecionados.forEach((prod) => {
      total += prod.preco * prod.quantidade
    })
    
    return total
  }

  // Calcular valor líquido (valor comercializado - descontos)
  const calcularValorLiquido = () => {
    const precoTotal = calcularPrecoTotal()
    const valorComercializado = parseFloat(formData.valor_comercializado.replace(',', '.')) || precoTotal
    const descontoPercentual = parseFloat(formData.desconto_percentual.replace(',', '.')) || 0
    const descontoValor = parseFloat(formData.desconto_valor.replace(',', '.')) || 0

    const descontoPorPercentual = valorComercializado * (descontoPercentual / 100)
    const valorLiquido = valorComercializado - descontoPorPercentual - descontoValor

    return Math.max(0, valorLiquido)
  }

  // Calcular desconto percentual se o valor líquido for alterado manualmente
  const calcularDescontoPercentualDoLiquido = (valorLiquido: number) => {
    const precoTotal = calcularPrecoTotal()
    const valorComercializado = parseFloat(formData.valor_comercializado.replace(',', '.')) || precoTotal
    const descontoValor = parseFloat(formData.desconto_valor.replace(',', '.')) || 0

    if (valorComercializado === 0) return 0

    const diferenca = valorComercializado - valorLiquido - descontoValor
    const percentual = (diferenca / valorComercializado) * 100

    return Math.max(0, Math.min(100, percentual))
  }

  const abrirModal = (tipo: 'criar' | 'editar' | 'excluir' | 'visualizar', assinatura?: Assinatura) => {
    setModalTipo(tipo)
    setAssinaturaSelecionada(assinatura || null)

    if (tipo === 'criar') {
      setFormData({
        nome: '',
        descricao: '',
        valor_comercializado: '',
        desconto_percentual: '',
        desconto_valor: '',
        validade_em_dias: '30',
        is_active: true,
      })
      setServicosSelecionados([])
      setProdutosSelecionados([])
      setServicoSelecao({ id: '', quantidade: '1' })
      setProdutoSelecao({ id: '', quantidade: '1' })
    } else if (tipo === 'editar' && assinatura) {
      setFormData({
        nome: assinatura.nome || '',
        descricao: assinatura.descricao || '',
        valor_comercializado: assinatura.valor_comercializado.toString().replace('.', ','),
        desconto_percentual: assinatura.desconto_percentual.toString().replace('.', ','),
        desconto_valor: assinatura.desconto_valor.toString().replace('.', ','),
        validade_em_dias: (assinatura.validade_em_dias || 30).toString(),
        is_active: assinatura.is_active,
      })
      
      // Mapear serviços e produtos para o formato esperado
      setServicosSelecionados(
        assinatura.servicos.map((s: any) => ({
          servico_id: s.servico_id || s.id,
          servico_nome: s.servico_nome || s.nome,
          quantidade: s.quantidade,
          preco: s.servico_preco || s.preco,
        }))
      )
      
      setProdutosSelecionados(
        assinatura.produtos.map((p: any) => ({
          produto_id: p.produto_id || p.id,
          produto_codigo: p.produto_codigo || p.codigo,
          produto_descricao: p.produto_descricao || p.descricao,
          quantidade: p.quantidade,
          preco: p.produto_preco || p.preco_venda,
        }))
      )
      
      setServicoSelecao({ id: '', quantidade: '1' })
      setProdutoSelecao({ id: '', quantidade: '1' })
    }

    setMostrarModal(true)
  }

  const fecharModal = () => {
    setMostrarModal(false)
    setAssinaturaSelecionada(null)
    setMensagem({ tipo: null, texto: '' })
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const adicionarServico = () => {
    if (!servicoSelecao.id || !servicoSelecao.quantidade) {
      setMensagem({ tipo: 'erro', texto: 'Selecione um serviço e informe a quantidade' })
      return
    }

    const servico = servicos.find((s) => s.id === servicoSelecao.id)
    if (!servico) return

    const quantidade = parseInt(servicoSelecao.quantidade)
    if (isNaN(quantidade) || quantidade <= 0) {
      setMensagem({ tipo: 'erro', texto: 'Quantidade deve ser maior que zero' })
      return
    }

    // Verificar se já existe
    const existe = servicosSelecionados.find((s) => s.servico_id === servico.id)
    if (existe) {
      setMensagem({ tipo: 'erro', texto: 'Este serviço já foi adicionado. Remova e adicione novamente para alterar a quantidade.' })
      return
    }

    setServicosSelecionados([
      ...servicosSelecionados,
      {
        servico_id: servico.id,
        servico_nome: servico.nome,
        quantidade,
        preco: servico.preco,
      },
    ])

    setServicoSelecao({ id: '', quantidade: '1' })
    setMensagem({ tipo: null, texto: '' })
  }

  const removerServico = (servicoId: string) => {
    setServicosSelecionados(servicosSelecionados.filter((s) => s.servico_id !== servicoId))
  }

  const adicionarProduto = () => {
    if (!produtoSelecao.id || !produtoSelecao.quantidade) {
      setMensagem({ tipo: 'erro', texto: 'Selecione um produto e informe a quantidade' })
      return
    }

    const produto = produtos.find((p) => p.id === produtoSelecao.id)
    if (!produto) return

    const quantidade = parseInt(produtoSelecao.quantidade)
    if (isNaN(quantidade) || quantidade <= 0) {
      setMensagem({ tipo: 'erro', texto: 'Quantidade deve ser maior que zero' })
      return
    }

    // Verificar se já existe
    const existe = produtosSelecionados.find((p) => p.produto_id === produto.id)
    if (existe) {
      setMensagem({ tipo: 'erro', texto: 'Este produto já foi adicionado. Remova e adicione novamente para alterar a quantidade.' })
      return
    }

    setProdutosSelecionados([
      ...produtosSelecionados,
      {
        produto_id: produto.id,
        produto_codigo: produto.codigo,
        produto_descricao: produto.descricao,
        quantidade,
        preco: produto.preco_venda,
      },
    ])

    setProdutoSelecao({ id: '', quantidade: '1' })
    setMensagem({ tipo: null, texto: '' })
  }

  const removerProduto = (produtoId: string) => {
    setProdutosSelecionados(produtosSelecionados.filter((p) => p.produto_id !== produtoId))
  }

  const salvarAssinatura = async () => {
    if (!formData.nome) {
      setMensagem({ tipo: 'erro', texto: 'Nome é obrigatório' })
      return
    }

    if (servicosSelecionados.length === 0 && produtosSelecionados.length === 0) {
      setMensagem({ tipo: 'erro', texto: 'Adicione pelo menos um serviço ou produto' })
      return
    }

    setSalvando(true)
    setMensagem({ tipo: null, texto: '' })

    try {
      const apiUrl = 'https://api.protesecapilarcuiaba.com.br'

      const adminData = localStorage.getItem('admin')
      const admin = adminData ? JSON.parse(adminData) : null

      const precoTotal = calcularPrecoTotal()
      const valorComercializado = formData.valor_comercializado 
        ? parseFloat(formData.valor_comercializado.replace(',', '.')) 
        : precoTotal
      const descontoPercentual = formData.desconto_percentual ? parseFloat(formData.desconto_percentual.replace(',', '.')) : 0
      const descontoValor = formData.desconto_valor ? parseFloat(formData.desconto_valor.replace(',', '.')) : 0

      const body = {
        nome: formData.nome.trim(),
        descricao: formData.descricao.trim() || null,
        servicos: servicosSelecionados.map((s) => ({
          servico_id: s.servico_id,
          quantidade: s.quantidade,
        })),
        produtos: produtosSelecionados.map((p) => ({
          produto_id: p.produto_id,
          quantidade: p.quantidade,
        })),
        valor_comercializado: valorComercializado,
        desconto_percentual: descontoPercentual,
        desconto_valor: descontoValor,
        validade_em_dias: parseInt(formData.validade_em_dias) || 30,
        is_active: formData.is_active,
      }

      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      }
      if (admin?.id) {
        headers['x-user-id'] = admin.id
        headers['x-user-tipo'] = admin.tipo_usuario || 'administrativo'
        headers['x-user-nome'] = admin.nome_completo || null
      }

      let response
      if (modalTipo === 'criar') {
        response = await fetch(`${apiUrl}/api/v1/assinaturas`, {
          method: 'POST',
          headers,
          body: JSON.stringify(body),
        })
      } else {
        response = await fetch(`${apiUrl}/api/v1/assinaturas/${assinaturaSelecionada?.id}`, {
          method: 'PUT',
          headers,
          body: JSON.stringify(body),
        })
      }

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao salvar assinatura')
      }

      setMensagem({ tipo: 'sucesso', texto: modalTipo === 'criar' ? 'Assinatura criada com sucesso!' : 'Assinatura atualizada com sucesso!' })
      setTimeout(() => {
        fecharModal()
        carregarAssinaturas()
      }, 1500)
    } catch (error: any) {
      console.error('Erro ao salvar assinatura:', error)
      setMensagem({ tipo: 'erro', texto: error.message || 'Erro ao salvar assinatura' })
    } finally {
      setSalvando(false)
    }
  }

  const excluirAssinatura = async () => {
    if (!assinaturaSelecionada) return

    setSalvando(true)
    setMensagem({ tipo: null, texto: '' })

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
        headers['x-user-nome'] = admin.nome_completo || null
      }

      const response = await fetch(`${apiUrl}/api/v1/assinaturas/${assinaturaSelecionada.id}`, {
        method: 'DELETE',
        headers,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao excluir assinatura')
      }

      setMensagem({ tipo: 'sucesso', texto: 'Assinatura excluída com sucesso!' })
      setTimeout(() => {
        fecharModal()
        carregarAssinaturas()
      }, 1500)
    } catch (error: any) {
      console.error('Erro ao excluir assinatura:', error)
      setMensagem({ tipo: 'erro', texto: error.message || 'Erro ao excluir assinatura' })
    } finally {
      setSalvando(false)
    }
  }

  const precoTotal = calcularPrecoTotal()
  const valorLiquido = calcularValorLiquido()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-2">
          <FileText className="h-8 w-8 text-amber-500" />
          Assinaturas
        </h1>
        <p className="text-gray-400 mt-1">Gerenciar assinaturas comercializáveis</p>
      </div>

      {/* Mensagem de feedback */}
      <AnimatePresence>
        {mensagem.tipo && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`p-4 rounded-lg flex items-center gap-2 ${
              mensagem.tipo === 'sucesso' 
                ? 'bg-green-500/10 border border-green-500/30 text-green-500' 
                : 'bg-red-500/10 border border-red-500/30 text-red-500'
            }`}
          >
            {mensagem.tipo === 'sucesso' ? (
              <CheckCircle2 className="h-5 w-5" />
            ) : (
              <AlertCircle className="h-5 w-5" />
            )}
            <span>{mensagem.texto}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Barra de busca e ações */}
      <Card className="p-4 bg-zinc-900 border-amber-500/20">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Buscar assinaturas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-zinc-800 border-amber-500/20 text-white"
            />
          </div>
          {podeEditar('assinaturas') && (
            <Button
              onClick={() => abrirModal('criar')}
              className="bg-amber-500 hover:bg-amber-600 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nova Assinatura
            </Button>
          )}
        </div>
      </Card>

      {/* Lista de assinaturas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence>
          {assinaturasFiltradas.map((assinatura) => (
            <motion.div
              key={assinatura.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <Card className="p-6 bg-zinc-900 border-amber-500/20 hover:border-amber-500/40 transition-colors">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white mb-1">{assinatura.nome}</h3>
                    {assinatura.descricao && (
                      <p className="text-sm text-gray-400 line-clamp-2">{assinatura.descricao}</p>
                    )}
                  </div>
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      assinatura.is_active
                        ? 'bg-green-500/20 text-green-500'
                        : 'bg-red-500/20 text-red-500'
                    }`}
                  >
                    {assinatura.is_active ? 'Ativa' : 'Inativa'}
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Preço Total:</span>
                    <span className="text-white font-medium">{formatarPreco(assinatura.preco_total)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Valor Comercializado:</span>
                    <span className="text-white font-medium">{formatarPreco(assinatura.valor_comercializado)}</span>
                  </div>
                  {(assinatura.desconto_percentual > 0 || assinatura.desconto_valor > 0) && (
                    <div className="flex justify-between text-sm text-amber-500">
                      <span>Desconto:</span>
                      <span>
                        {assinatura.desconto_percentual > 0 && `${assinatura.desconto_percentual}%`}
                        {assinatura.desconto_percentual > 0 && assinatura.desconto_valor > 0 && ' + '}
                        {assinatura.desconto_valor > 0 && formatarPreco(assinatura.desconto_valor)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-base font-bold pt-2 border-t border-amber-500/20">
                    <span className="text-gray-300">Valor Líquido:</span>
                    <span className="text-amber-500">{formatarPreco(assinatura.valor_liquido)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
                  <Scissors className="h-4 w-4" />
                  <span>{assinatura.servicos?.length || 0} serviço(s)</span>
                  <Package className="h-4 w-4 ml-2" />
                  <span>{assinatura.produtos?.length || 0} produto(s)</span>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => abrirModal('visualizar', assinatura)}
                    className="flex-1 border-amber-500/20 text-amber-500 hover:bg-amber-500/10"
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Ver
                  </Button>
                  {podeEditar('assinaturas') && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => abrirModal('editar', assinatura)}
                      className="flex-1 border-amber-500/20 text-amber-500 hover:bg-amber-500/10"
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Editar
                    </Button>
                  )}
                  {podeExcluir('assinaturas') && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => abrirModal('excluir', assinatura)}
                      className="border-red-500/20 text-red-500 hover:bg-red-500/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {assinaturasFiltradas.length === 0 && (
        <Card className="p-12 bg-zinc-900 border-amber-500/20 text-center">
          <FileText className="h-16 w-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">
            {searchTerm ? 'Nenhuma assinatura encontrada' : 'Nenhuma assinatura cadastrada'}
          </p>
        </Card>
      )}

      {/* Modal */}
      <Dialog open={mostrarModal} onOpenChange={setMostrarModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-zinc-900 border-amber-500/20">
          <DialogHeader>
            <DialogTitle className="text-2xl text-white">
              {modalTipo === 'criar' && 'Nova Assinatura'}
              {modalTipo === 'editar' && 'Editar Assinatura'}
              {modalTipo === 'excluir' && 'Excluir Assinatura'}
              {modalTipo === 'visualizar' && 'Detalhes da Assinatura'}
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              {modalTipo === 'criar' && 'Preencha os dados para criar uma nova assinatura'}
              {modalTipo === 'editar' && 'Altere os dados da assinatura'}
              {modalTipo === 'excluir' && 'Tem certeza que deseja excluir esta assinatura?'}
              {modalTipo === 'visualizar' && 'Visualize os detalhes da assinatura'}
            </DialogDescription>
          </DialogHeader>

          {modalTipo === 'excluir' && assinaturaSelecionada && (
            <div className="space-y-4">
              <p className="text-white">
                A assinatura <strong>{assinaturaSelecionada.nome}</strong> será excluída permanentemente.
              </p>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={fecharModal} className="border-gray-600 text-gray-300">
                  Cancelar
                </Button>
                <Button
                  onClick={excluirAssinatura}
                  disabled={salvando}
                  className="bg-red-500 hover:bg-red-600 text-white"
                >
                  {salvando ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Excluindo...
                    </>
                  ) : (
                    'Excluir'
                  )}
                </Button>
              </div>
            </div>
          )}

          {(modalTipo === 'criar' || modalTipo === 'editar') && (
            <div className="space-y-6">
              {/* Informações básicas */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="nome" className="text-white">Nome *</Label>
                  <Input
                    id="nome"
                    name="nome"
                    value={formData.nome}
                    onChange={handleInputChange}
                    className="bg-zinc-800 border-amber-500/20 text-white"
                    placeholder="Nome da assinatura"
                  />
                </div>

                <div>
                  <Label htmlFor="descricao" className="text-white">Descrição</Label>
                  <Textarea
                    id="descricao"
                    name="descricao"
                    value={formData.descricao}
                    onChange={handleInputChange}
                    className="bg-zinc-800 border-amber-500/20 text-white"
                    placeholder="Descrição da assinatura"
                    rows={3}
                  />
                </div>
              </div>

              {/* Adicionar serviços */}
              <div className="space-y-4 border-t border-amber-500/20 pt-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Scissors className="h-5 w-5 text-amber-500" />
                  Serviços
                </h3>
                
                <div className="flex gap-2">
                  <Select value={servicoSelecao.id} onValueChange={(value) => setServicoSelecao({ ...servicoSelecao, id: value })}>
                    <SelectTrigger className="flex-1 bg-zinc-800 border-amber-500/20 text-white">
                      <SelectValue placeholder="Selecione um serviço" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-800 border-amber-500/20">
                      {servicos.map((servico) => (
                        <SelectItem key={servico.id} value={servico.id} className="text-white">
                          {servico.nome} - {formatarPreco(servico.preco)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    type="number"
                    min="1"
                    value={servicoSelecao.quantidade}
                    onChange={(e) => setServicoSelecao({ ...servicoSelecao, quantidade: e.target.value })}
                    className="w-24 bg-zinc-800 border-amber-500/20 text-white"
                    placeholder="Qtd"
                  />
                  <Button onClick={adicionarServico} className="bg-amber-500 hover:bg-amber-600 text-white">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                {/* Lista de serviços selecionados */}
                {servicosSelecionados.length > 0 && (
                  <div className="space-y-2">
                    {servicosSelecionados.map((serv) => (
                      <div key={serv.servico_id} className="flex items-center justify-between p-3 bg-zinc-800 rounded border border-amber-500/20">
                        <div className="flex-1">
                          <p className="text-white font-medium">{serv.servico_nome}</p>
                          <p className="text-sm text-gray-400">
                            {serv.quantidade}x {formatarPreco(serv.preco)} = {formatarPreco(serv.preco * serv.quantidade)}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removerServico(serv.servico_id)}
                          className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Adicionar produtos */}
              <div className="space-y-4 border-t border-amber-500/20 pt-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Package className="h-5 w-5 text-amber-500" />
                  Produtos
                </h3>
                
                <div className="flex gap-2">
                  <Select value={produtoSelecao.id} onValueChange={(value) => setProdutoSelecao({ ...produtoSelecao, id: value })}>
                    <SelectTrigger className="flex-1 bg-zinc-800 border-amber-500/20 text-white">
                      <SelectValue placeholder="Selecione um produto" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-800 border-amber-500/20">
                      {produtos.map((produto) => (
                        <SelectItem key={produto.id} value={produto.id} className="text-white">
                          {produto.codigo} - {produto.descricao} - {formatarPreco(produto.preco_venda)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    type="number"
                    min="1"
                    value={produtoSelecao.quantidade}
                    onChange={(e) => setProdutoSelecao({ ...produtoSelecao, quantidade: e.target.value })}
                    className="w-24 bg-zinc-800 border-amber-500/20 text-white"
                    placeholder="Qtd"
                  />
                  <Button onClick={adicionarProduto} className="bg-amber-500 hover:bg-amber-600 text-white">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                {/* Lista de produtos selecionados */}
                {produtosSelecionados.length > 0 && (
                  <div className="space-y-2">
                    {produtosSelecionados.map((prod) => (
                      <div key={prod.produto_id} className="flex items-center justify-between p-3 bg-zinc-800 rounded border border-amber-500/20">
                        <div className="flex-1">
                          <p className="text-white font-medium">{prod.produto_descricao} ({prod.produto_codigo})</p>
                          <p className="text-sm text-gray-400">
                            {prod.quantidade}x {formatarPreco(prod.preco)} = {formatarPreco(prod.preco * prod.quantidade)}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removerProduto(prod.produto_id)}
                          className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Resumo de valores */}
              <div className="space-y-4 border-t border-amber-500/20 pt-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-amber-500" />
                  Valores
                </h3>

                <div className="space-y-3 p-4 bg-zinc-800 rounded border border-amber-500/20">
                  <div className="flex justify-between text-white">
                    <span>Preço Total (Soma):</span>
                    <span className="font-medium">{formatarPreco(precoTotal)}</span>
                  </div>

                  <div>
                    <Label htmlFor="valor_comercializado" className="text-white">Valor Comercializado *</Label>
                    <Input
                      id="valor_comercializado"
                      name="valor_comercializado"
                      type="text"
                      value={formData.valor_comercializado}
                      onChange={handleInputChange}
                      className="bg-zinc-900 border-amber-500/20 text-white"
                      placeholder={precoTotal.toFixed(2).replace('.', ',')}
                    />
                    <p className="text-xs text-gray-400 mt-1">
                      Deixe em branco para usar o preço total ({formatarPreco(precoTotal)})
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="desconto_percentual" className="text-white flex items-center gap-1">
                        <Percent className="h-4 w-4" />
                        Desconto (%)
                      </Label>
                      <Input
                        id="desconto_percentual"
                        name="desconto_percentual"
                        type="text"
                        value={formData.desconto_percentual}
                        onChange={handleInputChange}
                        className="bg-zinc-900 border-amber-500/20 text-white"
                        placeholder="0"
                      />
                    </div>

                    <div>
                      <Label htmlFor="desconto_valor" className="text-white flex items-center gap-1">
                        <Minus className="h-4 w-4" />
                        Desconto (R$)
                      </Label>
                      <Input
                        id="desconto_valor"
                        name="desconto_valor"
                        type="text"
                        value={formData.desconto_valor}
                        onChange={handleInputChange}
                        className="bg-zinc-900 border-amber-500/20 text-white"
                        placeholder="0,00"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="validade_em_dias" className="text-white">
                      Validade em Dias *
                    </Label>
                    <Input
                      id="validade_em_dias"
                      name="validade_em_dias"
                      type="number"
                      min="1"
                      value={formData.validade_em_dias}
                      onChange={(e) => setFormData({ ...formData, validade_em_dias: e.target.value })}
                      className="bg-zinc-900 border-amber-500/20 text-white"
                      placeholder="30"
                    />
                    <p className="text-xs text-gray-400 mt-1">
                      Quantidade de dias corridos de validade da assinatura (ex: 30 dias)
                    </p>
                  </div>

                  <div className="flex justify-between text-lg font-bold text-amber-500 pt-2 border-t border-amber-500/20">
                    <span>Valor Líquido:</span>
                    <span>{formatarPreco(valorLiquido)}</span>
                  </div>
                </div>
              </div>

              {/* Status */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_active"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-4 h-4 rounded border-amber-500/20 bg-zinc-800 text-amber-500 focus:ring-amber-500"
                />
                <Label htmlFor="is_active" className="text-white cursor-pointer">Assinatura ativa</Label>
              </div>

              {/* Botões de ação */}
              <div className="flex gap-2 justify-end pt-4 border-t border-amber-500/20">
                <Button variant="outline" onClick={fecharModal} className="border-gray-600 text-gray-300">
                  Cancelar
                </Button>
                <Button
                  onClick={salvarAssinatura}
                  disabled={salvando}
                  className="bg-amber-500 hover:bg-amber-600 text-white"
                >
                  {salvando ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
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
            </div>
          )}

          {modalTipo === 'visualizar' && assinaturaSelecionada && (
            <div className="space-y-4">
              <div>
                <Label className="text-gray-400">Nome</Label>
                <p className="text-white font-medium">{assinaturaSelecionada.nome}</p>
              </div>

              {assinaturaSelecionada.descricao && (
                <div>
                  <Label className="text-gray-400">Descrição</Label>
                  <p className="text-white">{assinaturaSelecionada.descricao}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-400">Preço Total</Label>
                  <p className="text-white font-medium">{formatarPreco(assinaturaSelecionada.preco_total)}</p>
                </div>
                <div>
                  <Label className="text-gray-400">Valor Comercializado</Label>
                  <p className="text-white font-medium">{formatarPreco(assinaturaSelecionada.valor_comercializado)}</p>
                </div>
                <div>
                  <Label className="text-gray-400">Desconto</Label>
                  <p className="text-amber-500 font-medium">
                    {assinaturaSelecionada.desconto_percentual > 0 && `${assinaturaSelecionada.desconto_percentual}%`}
                    {assinaturaSelecionada.desconto_percentual > 0 && assinaturaSelecionada.desconto_valor > 0 && ' + '}
                    {assinaturaSelecionada.desconto_valor > 0 && formatarPreco(assinaturaSelecionada.desconto_valor)}
                    {assinaturaSelecionada.desconto_percentual === 0 && assinaturaSelecionada.desconto_valor === 0 && 'Nenhum'}
                  </p>
                </div>
                <div>
                  <Label className="text-gray-400">Valor Líquido</Label>
                  <p className="text-amber-500 font-bold text-lg">{formatarPreco(assinaturaSelecionada.valor_liquido)}</p>
                </div>
              </div>

              {assinaturaSelecionada.servicos && assinaturaSelecionada.servicos.length > 0 && (
                <div>
                  <Label className="text-gray-400">Serviços</Label>
                  <div className="space-y-2 mt-2">
                    {assinaturaSelecionada.servicos.map((serv: any) => (
                      <div key={serv.servico_id || serv.id} className="p-3 bg-zinc-800 rounded">
                        <p className="text-white font-medium">{serv.servico_nome || serv.nome}</p>
                        <p className="text-sm text-gray-400">
                          {serv.quantidade}x {formatarPreco(serv.servico_preco || serv.preco)} = {formatarPreco((serv.servico_preco || serv.preco) * serv.quantidade)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {assinaturaSelecionada.produtos && assinaturaSelecionada.produtos.length > 0 && (
                <div>
                  <Label className="text-gray-400">Produtos</Label>
                  <div className="space-y-2 mt-2">
                    {assinaturaSelecionada.produtos.map((prod: any) => (
                      <div key={prod.produto_id || prod.id} className="p-3 bg-zinc-800 rounded">
                        <p className="text-white font-medium">{prod.produto_descricao || prod.descricao} ({prod.produto_codigo || prod.codigo})</p>
                        <p className="text-sm text-gray-400">
                          {prod.quantidade}x {formatarPreco(prod.produto_preco || prod.preco_venda)} = {formatarPreco((prod.produto_preco || prod.preco_venda) * prod.quantidade)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end pt-4 border-t border-amber-500/20">
                <Button variant="outline" onClick={fecharModal} className="border-gray-600 text-gray-300">
                  Fechar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
