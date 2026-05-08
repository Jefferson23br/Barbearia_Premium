'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Warehouse, Search, Plus, Edit, Trash2, X, Save, Loader2, AlertCircle, CheckCircle2, DollarSign, Package, Building2, Hash, TrendingUp } from 'lucide-react'
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
import { getApiBaseUrl } from '@/lib/api'

interface ProdutoEstoque {
  id: string
  codigo: string
  descricao: string
  fornecedor?: string | null
  preco_venda: number | string
  quantidade_estoque: number
  ultimo_preco_compra?: number | string | null
  ultimo_preco_custo?: number | string | null
  is_active: boolean
}

interface Movimentacao {
  id: string
  produto_id: string
  fornecedor: string
  quantidade: number
  valor_unitario: number
  valor_total: number
  data_movimentacao: string
  observacoes?: string | null
  produto_codigo?: string
  produto_descricao?: string
}

export default function EstoquePage() {
  const [produtos, setProdutos] = useState<ProdutoEstoque[]>([])
  const [produtosFiltrados, setProdutosFiltrados] = useState<ProdutoEstoque[]>([])
  const [produtosParaSelect, setProdutosParaSelect] = useState<ProdutoEstoque[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [mostrarModal, setMostrarModal] = useState(false)
  const [salvando, setSalvando] = useState(false)
  const [mensagem, setMensagem] = useState<{ tipo: 'sucesso' | 'erro' | null; texto: string }>({ tipo: null, texto: '' })
  const { podeAcessar, podeEditar, podeExcluir } = usePermissions()

  // Formulário de entrada
  const [formData, setFormData] = useState({
    produto_id: '',
    fornecedor: '',
    quantidade: '',
    valor_unitario: '',
    data_movimentacao: new Date().toISOString().split('T')[0],
    observacoes: '',
  })

  useEffect(() => {
    carregarProdutos()
    carregarProdutosParaSelect()
  }, [])

  useEffect(() => {
    filtrarProdutos()
  }, [searchTerm, produtos])

  const carregarProdutos = async () => {
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

      const response = await fetch(`${apiUrl}/api/v1/estoque/produtos`, {
        headers,
      })

      if (!response.ok) {
        throw new Error('Erro ao carregar produtos')
      }

      const data = await response.json()
      setProdutos(data.produtos || [])
    } catch (error: any) {
      console.error('Erro ao carregar produtos:', error)
      setMensagem({ tipo: 'erro', texto: error.message || 'Erro ao carregar produtos' })
    } finally {
      setLoading(false)
    }
  }

  const carregarProdutosParaSelect = async () => {
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
      }

      const response = await fetch(`${apiUrl}/api/v1/produtos?is_active=true`, {
        headers,
      })

      if (response.ok) {
        const data = await response.json()
        setProdutosParaSelect(data.produtos || [])
      }
    } catch (error) {
      console.error('Erro ao carregar produtos para select:', error)
    }
  }

  const filtrarProdutos = () => {
    let filtrados = produtos

    if (searchTerm.trim()) {
      const termo = searchTerm.toLowerCase().trim()
      filtrados = filtrados.filter((prod) => {
        const codigo = (prod.codigo || '').toString().toLowerCase()
        const descricao = (prod.descricao || '').toString().toLowerCase()
        const fornecedor = (prod.fornecedor || '').toString().toLowerCase()

        return (
          codigo.includes(termo) ||
          descricao.includes(termo) ||
          fornecedor.includes(termo)
        )
      })
    }

    setProdutosFiltrados(filtrados)
  }

  const formatarPreco = (preco: number | string | null | undefined) => {
    if (!preco) return 'R$ 0,00'
    const valor = typeof preco === 'string' ? parseFloat(preco) : preco
    if (isNaN(valor)) return 'R$ 0,00'
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(valor)
  }

  const abrirModal = () => {
    setFormData({
      produto_id: '',
      fornecedor: '',
      quantidade: '',
      valor_unitario: '',
      data_movimentacao: new Date().toISOString().split('T')[0],
      observacoes: '',
    })
    setMostrarModal(true)
    setMensagem({ tipo: null, texto: '' })
  }

  const fecharModal = () => {
    setMostrarModal(false)
    setMensagem({ tipo: null, texto: '' })
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleSelectChange = (name: string, value: string) => {
    // Se selecionou um produto, buscar último preço de compra e fornecedor ANTES de atualizar
    if (name === 'produto_id' && value) {
      const produto = produtosParaSelect.find(p => p.id === value)
      if (produto) {
        // Converter para número antes de usar toFixed
        const precoCompra = produto.ultimo_preco_compra 
          ? Number(produto.ultimo_preco_compra) 
          : null
        const precoCusto = produto.ultimo_preco_custo 
          ? Number(produto.ultimo_preco_custo) 
          : null
        
        setFormData(prev => ({
          ...prev,
          produto_id: value,
          fornecedor: produto.fornecedor || '',
          valor_unitario: precoCompra && !isNaN(precoCompra)
            ? precoCompra.toFixed(2) 
            : (precoCusto && !isNaN(precoCusto)
              ? precoCusto.toFixed(2) 
              : prev.valor_unitario),
        }))
        return
      }
    }
    
    // Para outros campos, atualizar normalmente
    setFormData({ ...formData, [name]: value })
  }

  const salvarEntrada = async () => {
    if (!formData.produto_id || !formData.fornecedor || !formData.quantidade || !formData.valor_unitario) {
      setMensagem({ tipo: 'erro', texto: 'Preencha todos os campos obrigatórios' })
      return
    }

    const quantidadeNumber = parseInt(formData.quantidade)
    const valorUnitarioNumber = parseFloat(formData.valor_unitario.replace(',', '.'))

    if (isNaN(quantidadeNumber) || quantidadeNumber <= 0) {
      setMensagem({ tipo: 'erro', texto: 'Quantidade inválida' })
      return
    }

    if (isNaN(valorUnitarioNumber) || valorUnitarioNumber < 0) {
      setMensagem({ tipo: 'erro', texto: 'Valor unitário inválido' })
      return
    }

    setSalvando(true)
    setMensagem({ tipo: null, texto: '' })

    try {
      const apiUrl = getApiBaseUrl()

      const adminData = localStorage.getItem('admin')
      const admin = adminData ? JSON.parse(adminData) : null

      const body = {
        produto_id: formData.produto_id,
        fornecedor: formData.fornecedor.trim(),
        quantidade: quantidadeNumber,
        valor_unitario: valorUnitarioNumber,
        data_movimentacao: formData.data_movimentacao,
        observacoes: formData.observacoes.trim() || null,
      }

      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      }
      if (admin?.id) {
        headers['x-user-id'] = admin.id
        headers['x-user-tipo'] = admin.tipo_usuario || 'administrativo'
        headers['x-user-nome'] = admin.nome_completo || null
      }

      const response = await fetch(`${apiUrl}/api/v1/estoque/entrada`, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao lançar entrada de estoque')
      }

      setMensagem({ tipo: 'sucesso', texto: data.message || 'Entrada de estoque lançada com sucesso!' })
      await carregarProdutos()
      setTimeout(() => {
        fecharModal()
      }, 1500)
    } catch (error: any) {
      console.error('Erro ao lançar entrada:', error)
      setMensagem({ tipo: 'erro', texto: error.message || 'Erro ao lançar entrada de estoque' })
    } finally {
      setSalvando(false)
    }
  }

  if (!podeAcessar('estoque')) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-500 mb-2">Acesso Negado</h2>
          <p className="text-gray-400">Você não tem permissão para acessar esta página.</p>
        </div>
      </div>
    )
  }

  const totalProdutos = produtos.length
  const totalEmEstoque = produtos.reduce((sum, p) => sum + (p.quantidade_estoque || 0), 0)
  const produtosComEstoque = produtos.filter(p => (p.quantidade_estoque || 0) > 0).length
  const produtosSemEstoque = produtos.filter(p => (p.quantidade_estoque || 0) === 0).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-2">
            <Warehouse className="h-8 w-8 text-amber-500" />
            Estoque
          </h1>
          <p className="text-gray-400 mt-1">Gerencie o estoque de produtos da barbearia</p>
        </div>
        {podeEditar('estoque') && (
          <button
            onClick={abrirModal}
            className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-black rounded-lg transition-colors font-medium"
          >
            <Plus className="h-5 w-5" />
            Lançar Entrada
          </button>
        )}
      </div>

      {/* Mensagem */}
      {mensagem.tipo && !mostrarModal && (
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
            {mensagem.tipo === 'sucesso' ? <CheckCircle2 className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
            <p className="text-sm">{mensagem.texto}</p>
          </div>
        </motion.div>
      )}

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-zinc-800 p-6 rounded-lg shadow-lg border border-amber-500/20"
        >
          <p className="text-gray-300 text-sm">Total de Produtos</p>
          <h2 className="text-3xl font-bold text-amber-400 mt-1">{totalProdutos}</h2>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-zinc-800 p-6 rounded-lg shadow-lg border border-green-500/20"
        >
          <p className="text-gray-300 text-sm">Total em Estoque</p>
          <h2 className="text-3xl font-bold text-green-400 mt-1">{totalEmEstoque}</h2>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-zinc-800 p-6 rounded-lg shadow-lg border border-blue-500/20"
        >
          <p className="text-gray-300 text-sm">Produtos com Estoque</p>
          <h2 className="text-3xl font-bold text-blue-400 mt-1">{produtosComEstoque}</h2>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-zinc-800 p-6 rounded-lg shadow-lg border border-red-500/20"
        >
          <p className="text-gray-300 text-sm">Produtos sem Estoque</p>
          <h2 className="text-3xl font-bold text-red-400 mt-1">{produtosSemEstoque}</h2>
        </motion.div>
      </div>

      {/* Filtros e Busca */}
      <Card className="bg-zinc-900 border-amber-500/20 p-6">
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Buscar por código, descrição ou fornecedor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-zinc-800 border-amber-500/20 text-gray-300 placeholder:text-gray-500"
            />
          </div>
        </div>
      </Card>

      {/* Lista de Produtos */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
        </div>
      ) : produtosFiltrados.length === 0 ? (
        <Card className="bg-zinc-900 border-amber-500/20 p-12">
          <div className="text-center">
            <Warehouse className="h-16 w-16 text-gray-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-300 mb-2">
              {searchTerm ? 'Nenhum produto encontrado' : 'Nenhum produto cadastrado'}
            </h3>
            <p className="text-gray-400">
              {searchTerm
                ? 'Tente buscar com outros termos'
                : 'Comece cadastrando produtos no módulo de Produtos'}
            </p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          <AnimatePresence>
            {produtosFiltrados.map((produto) => (
              <motion.div
                key={produto.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={`bg-zinc-800 border rounded-lg p-6 hover:border-amber-500/50 transition-colors ${
                  (produto.quantidade_estoque || 0) === 0 
                    ? 'border-red-500/30' 
                    : (produto.quantidade_estoque || 0) <= 10 
                    ? 'border-yellow-500/30' 
                    : 'border-zinc-700'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Package className="h-5 w-5 text-amber-500" />
                      <h3 className="text-xl font-bold text-white">{produto.descricao}</h3>
                      {!produto.is_active && (
                        <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded">
                          Inativo
                        </span>
                      )}
                      {(produto.quantidade_estoque || 0) === 0 && (
                        <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded">
                          Sem Estoque
                        </span>
                      )}
                      {(produto.quantidade_estoque || 0) > 0 && (produto.quantidade_estoque || 0) <= 10 && (
                        <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded">
                          Estoque Baixo
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mt-4">
                      <div className="flex items-center gap-2">
                        <Hash className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-400 text-sm">Código:</span>
                        <span className="text-gray-300 font-medium">{produto.codigo}</span>
                      </div>
                      {produto.fornecedor && (
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-400 text-sm">Fornecedor:</span>
                          <span className="text-gray-300">{produto.fornecedor}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-blue-400" />
                        <span className="text-gray-400 text-sm">Estoque:</span>
                        <span className={`font-bold ${
                          (produto.quantidade_estoque || 0) === 0 
                            ? 'text-red-400' 
                            : (produto.quantidade_estoque || 0) <= 10 
                            ? 'text-yellow-400' 
                            : 'text-green-400'
                        }`}>
                          {produto.quantidade_estoque || 0} unidades
                        </span>
                      </div>
                      {produto.ultimo_preco_compra && (
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-blue-400" />
                          <span className="text-gray-400 text-sm">Último Preço:</span>
                          <span className="text-blue-400 font-medium">{formatarPreco(produto.ultimo_preco_compra)}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-green-400" />
                        <span className="text-gray-400 text-sm">Preço Venda:</span>
                        <span className="text-green-400 font-bold">{formatarPreco(produto.preco_venda)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Modal de Entrada */}
      <Dialog open={mostrarModal} onOpenChange={setMostrarModal}>
        <DialogContent className="bg-zinc-900 border-amber-500/20 text-gray-300 max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-gray-300">Lançar Entrada de Estoque</DialogTitle>
            <DialogDescription className="text-gray-400">
              Preencha os dados da entrada de estoque
            </DialogDescription>
          </DialogHeader>

          {mensagem.tipo && (
            <div
              className={`p-3 rounded-lg ${
                mensagem.tipo === 'sucesso'
                  ? 'bg-green-500/10 border border-green-500/30 text-green-500'
                  : 'bg-red-500/10 border border-red-500/30 text-red-500'
              }`}
            >
              <p className="text-sm">{mensagem.texto}</p>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <Label className="text-gray-300">Produto *</Label>
              <Select
                value={formData.produto_id}
                onValueChange={(value) => handleSelectChange('produto_id', value)}
              >
                <SelectTrigger className="bg-zinc-800 border-amber-500/20 text-gray-300 mt-1">
                  <SelectValue placeholder="Selecione um produto" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-800 border-amber-500/20">
                  {produtosParaSelect.map((produto) => (
                    <SelectItem
                      key={produto.id}
                      value={produto.id}
                      className="text-gray-300 hover:bg-zinc-700"
                    >
                      {produto.codigo} - {produto.descricao}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-gray-300">Fornecedor *</Label>
              <Input
                name="fornecedor"
                value={formData.fornecedor}
                onChange={handleInputChange}
                placeholder="Ex: Fornecedor ABC"
                className="bg-zinc-800 border-amber-500/20 text-gray-300 mt-1"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-gray-300">Quantidade *</Label>
                <Input
                  name="quantidade"
                  type="number"
                  min="1"
                  value={formData.quantidade}
                  onChange={handleInputChange}
                  placeholder="0"
                  className="bg-zinc-800 border-amber-500/20 text-gray-300 mt-1"
                />
              </div>

              <div>
                <Label className="text-gray-300">Valor Unitário (R$) *</Label>
                <Input
                  name="valor_unitario"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.valor_unitario}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  className="bg-zinc-800 border-amber-500/20 text-gray-300 mt-1"
                />
                {formData.produto_id && (() => {
                  const produto = produtosParaSelect.find(p => p.id === formData.produto_id)
                  return produto?.ultimo_preco_compra ? (
                    <p className="text-xs text-gray-400 mt-1">
                      Último preço: {formatarPreco(produto.ultimo_preco_compra)}
                    </p>
                  ) : null
                })()}
              </div>
            </div>

            <div>
              <Label className="text-gray-300">Data da Movimentação</Label>
              <Input
                name="data_movimentacao"
                type="date"
                value={formData.data_movimentacao}
                onChange={handleInputChange}
                className="bg-zinc-800 border-amber-500/20 text-gray-300 mt-1"
              />
            </div>

            <div>
              <Label className="text-gray-300">Observações</Label>
              <textarea
                name="observacoes"
                value={formData.observacoes}
                onChange={handleInputChange}
                placeholder="Observações adicionais (opcional)"
                rows={3}
                className="w-full mt-1 px-3 py-2 bg-zinc-800 border border-amber-500/20 rounded-lg text-gray-300 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            {formData.quantidade && formData.valor_unitario && (
              <div className="p-4 bg-zinc-800 rounded-lg border border-amber-500/30">
                <p className="text-gray-300 text-sm">
                  <strong>Valor Total:</strong>{' '}
                  <span className="text-amber-400 font-bold text-lg">
                    {formatarPreco(
                      parseFloat(formData.quantidade || '0') * parseFloat(formData.valor_unitario.replace(',', '.') || '0')
                    )}
                  </span>
                </p>
              </div>
            )}

            <div className="flex gap-3 justify-end pt-4">
              <Button
                onClick={fecharModal}
                variant="outline"
                className="bg-zinc-800 border-zinc-700 text-gray-300 hover:bg-zinc-700"
              >
                <X className="h-4 w-4 mr-2" />
                Cancelar
              </Button>
              <Button
                onClick={salvarEntrada}
                disabled={salvando}
                className="bg-amber-500 hover:bg-amber-600 text-black"
              >
                {salvando ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Lançar Entrada
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
