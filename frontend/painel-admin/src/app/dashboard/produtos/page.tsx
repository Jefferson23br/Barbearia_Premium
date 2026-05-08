'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Package, Search, Edit, Trash2, Plus, Eye, X, Save, Loader2, AlertCircle, CheckCircle2, DollarSign, Building2, Hash } from 'lucide-react'
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
import { getApiBaseUrl } from '@/lib/api'

interface Produto {
  id: string
  codigo: string
  descricao: string
  fornecedor?: string | null
  preco_venda: number
  ultimo_preco_custo?: number | null
  is_active: boolean
  created_at: string
  updated_at?: string | null
}

export default function ProdutosPage() {
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [produtosFiltrados, setProdutosFiltrados] = useState<Produto[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [mostrarModal, setMostrarModal] = useState(false)
  const [modalTipo, setModalTipo] = useState<'criar' | 'editar' | 'excluir' | 'visualizar'>('criar')
  const [produtoSelecionado, setProdutoSelecionado] = useState<Produto | null>(null)
  const [salvando, setSalvando] = useState(false)
  const [mensagem, setMensagem] = useState<{ tipo: 'sucesso' | 'erro' | null; texto: string }>({ tipo: null, texto: '' })
  const { podeAcessar, podeEditar, podeExcluir } = usePermissions()

  // Formulário
  const [formData, setFormData] = useState({
    codigo: '',
    descricao: '',
    fornecedor: '',
    preco_venda: '',
    is_active: true,
  })

  useEffect(() => {
    carregarProdutos()
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
      
      // Preparar headers
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      }
      if (admin?.id) {
        headers['x-user-id'] = admin.id
        headers['x-user-tipo'] = admin.tipo_usuario || 'administrativo'
        headers['x-user-nome'] = admin.nome_completo || null
      }

      const response = await fetch(`${apiUrl}/api/v1/produtos`, {
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

  const filtrarProdutos = () => {
    let filtrados = produtos

    // Filtrar por termo de busca
    if (searchTerm.trim()) {
      const termo = searchTerm.toLowerCase().trim()
      filtrados = filtrados.filter((prod) => {
        const codigo = (prod.codigo || '').toString().toLowerCase()
        const descricao = (prod.descricao || '').toString().toLowerCase()
        const fornecedor = (prod.fornecedor || '').toString().toLowerCase()
        const preco = prod.preco_venda.toString()

        return (
          codigo.includes(termo) ||
          descricao.includes(termo) ||
          fornecedor.includes(termo) ||
          preco.includes(termo)
        )
      })
    }

    setProdutosFiltrados(filtrados)
  }

  const formatarPreco = (preco: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(preco)
  }

  const abrirModal = (tipo: 'criar' | 'editar' | 'excluir' | 'visualizar', produto?: Produto) => {
    setModalTipo(tipo)
    setProdutoSelecionado(produto || null)

    if (tipo === 'criar') {
      setFormData({
        codigo: '',
        descricao: '',
        fornecedor: '',
        preco_venda: '',
        is_active: true,
      })
    } else if (tipo === 'editar' && produto) {
      setFormData({
        codigo: produto.codigo || '',
        descricao: produto.descricao || '',
        fornecedor: produto.fornecedor || '',
        preco_venda: produto.preco_venda.toString() || '',
        is_active: produto.is_active,
      })
    }

    setMostrarModal(true)
  }

  const fecharModal = () => {
    setMostrarModal(false)
    setProdutoSelecionado(null)
    setMensagem({ tipo: null, texto: '' })
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    if (type === 'checkbox') {
      setFormData({ ...formData, [name]: (e.target as HTMLInputElement).checked })
    } else {
      setFormData({ ...formData, [name]: value })
    }
  }

  const salvarProduto = async () => {
    if (!formData.codigo || !formData.descricao || !formData.preco_venda) {
      setMensagem({ tipo: 'erro', texto: 'Preencha todos os campos obrigatórios (Código, Descrição, Preço de Venda)' })
      return
    }

    const precoVendaNumber = parseFloat(formData.preco_venda.replace(',', '.'))
    if (isNaN(precoVendaNumber) || precoVendaNumber < 0) {
      setMensagem({ tipo: 'erro', texto: 'Preço de venda inválido' })
      return
    }

    setSalvando(true)
    setMensagem({ tipo: null, texto: '' })

    try {
      const apiUrl = getApiBaseUrl()

      // Obter dados do admin logado para enviar nos headers
      const adminData = localStorage.getItem('admin')
      const admin = adminData ? JSON.parse(adminData) : null

      const body = {
        codigo: formData.codigo.trim(),
        descricao: formData.descricao.trim(),
        fornecedor: formData.fornecedor.trim() || null,
        preco_venda: precoVendaNumber,
        is_active: formData.is_active,
      }

      // Preparar headers
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
        response = await fetch(`${apiUrl}/api/v1/produtos`, {
          method: 'POST',
          headers,
          body: JSON.stringify(body),
        })
      } else {
        response = await fetch(`${apiUrl}/api/v1/produtos/${produtoSelecionado?.id}`, {
          method: 'PUT',
          headers,
          body: JSON.stringify(body),
        })
      }

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao salvar produto')
      }

      setMensagem({ tipo: 'sucesso', texto: data.message || 'Produto salvo com sucesso!' })
      await carregarProdutos()
      setTimeout(() => {
        fecharModal()
      }, 1500)
    } catch (error: any) {
      console.error('Erro ao salvar produto:', error)
      setMensagem({ tipo: 'erro', texto: error.message || 'Erro ao salvar produto' })
    } finally {
      setSalvando(false)
    }
  }

  const excluirProduto = async () => {
    if (!produtoSelecionado) return

    setSalvando(true)
    setMensagem({ tipo: null, texto: '' })

    try {
      const apiUrl = getApiBaseUrl()

      // Obter dados do admin logado para enviar nos headers
      const adminData = localStorage.getItem('admin')
      const admin = adminData ? JSON.parse(adminData) : null

      // Preparar headers
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      }
      if (admin?.id) {
        headers['x-user-id'] = admin.id
        headers['x-user-tipo'] = admin.tipo_usuario || 'administrativo'
        headers['x-user-nome'] = admin.nome_completo || null
      }

      const response = await fetch(`${apiUrl}/api/v1/produtos/${produtoSelecionado.id}`, {
        method: 'DELETE',
        headers,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao excluir produto')
      }

      setMensagem({ tipo: 'sucesso', texto: data.message || 'Produto excluído com sucesso!' })
      await carregarProdutos()
      setTimeout(() => {
        fecharModal()
      }, 1500)
    } catch (error: any) {
      console.error('Erro ao excluir produto:', error)
      setMensagem({ tipo: 'erro', texto: error.message || 'Erro ao excluir produto' })
    } finally {
      setSalvando(false)
    }
  }

  // Verificar permissões
  if (!podeAcessar('produtos')) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-500 mb-2">Acesso Negado</h2>
          <p className="text-gray-400">Você não tem permissão para acessar esta página.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-2">
            <Package className="h-8 w-8 text-amber-500" />
            Produtos
          </h1>
          <p className="text-gray-400 mt-1">Gerencie os produtos da barbearia</p>
        </div>
        {podeEditar('produtos') && (
          <button
            onClick={() => abrirModal('criar')}
            className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-black rounded-lg transition-colors font-medium"
          >
            <Plus className="h-5 w-5" />
            Novo Produto
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-zinc-800 p-6 rounded-lg shadow-lg border border-amber-500/20"
        >
          <p className="text-gray-300 text-sm">Total de Produtos</p>
          <h2 className="text-3xl font-bold text-amber-400 mt-1">{produtos.length}</h2>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-zinc-800 p-6 rounded-lg shadow-lg border border-green-500/20"
        >
          <p className="text-gray-300 text-sm">Produtos Ativos</p>
          <h2 className="text-3xl font-bold text-green-400 mt-1">
            {produtos.filter((p) => p.is_active).length}
          </h2>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-zinc-800 p-6 rounded-lg shadow-lg border border-blue-500/20"
        >
          <p className="text-gray-300 text-sm">Fornecedores</p>
          <h2 className="text-3xl font-bold text-blue-400 mt-1">
            {new Set(produtos.filter((p) => p.fornecedor).map((p) => p.fornecedor)).size}
          </h2>
        </motion.div>
      </div>

      {/* Filtros e Busca */}
      <Card className="bg-zinc-900 border-amber-500/20 p-6">
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Buscar por código, descrição, fornecedor ou preço..."
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
            <Package className="h-16 w-16 text-gray-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-300 mb-2">
              {searchTerm ? 'Nenhum produto encontrado' : 'Nenhum produto cadastrado'}
            </h3>
            <p className="text-gray-400">
              {searchTerm
                ? 'Tente buscar com outros termos'
                : 'Comece adicionando seu primeiro produto'}
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
                className="bg-zinc-800 border border-zinc-700 rounded-lg p-6 hover:border-amber-500/50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Hash className="h-5 w-5 text-amber-500" />
                      <h3 className="text-xl font-bold text-white">{produto.descricao}</h3>
                      {!produto.is_active && (
                        <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded">
                          Inativo
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
                      <div className="flex items-center gap-2">
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
                        <DollarSign className="h-4 w-4 text-green-400" />
                        <span className="text-gray-400 text-sm">Preço Venda:</span>
                        <span className="text-green-400 font-bold">{formatarPreco(produto.preco_venda)}</span>
                      </div>
                      {produto.ultimo_preco_custo && (
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-blue-400" />
                          <span className="text-gray-400 text-sm">Último Custo:</span>
                          <span className="text-blue-400 font-medium">{formatarPreco(produto.ultimo_preco_custo)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    {podeEditar('produtos') && (
                      <button
                        onClick={() => abrirModal('editar', produto)}
                        className="p-2 hover:bg-zinc-700 rounded-lg transition-colors"
                        title="Editar"
                      >
                        <Edit className="h-5 w-5 text-amber-500" />
                      </button>
                    )}
                    {podeExcluir('produtos') && (
                      <button
                        onClick={() => abrirModal('excluir', produto)}
                        className="p-2 hover:bg-zinc-700 rounded-lg transition-colors"
                        title="Excluir"
                      >
                        <Trash2 className="h-5 w-5 text-red-500" />
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Modal */}
      <Dialog open={mostrarModal} onOpenChange={setMostrarModal}>
        <DialogContent className="bg-zinc-900 border-amber-500/20 text-gray-300 max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-gray-300">
              {modalTipo === 'criar' && 'Novo Produto'}
              {modalTipo === 'editar' && 'Editar Produto'}
              {modalTipo === 'excluir' && 'Excluir Produto'}
              {modalTipo === 'visualizar' && 'Detalhes do Produto'}
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              {modalTipo === 'criar' && 'Preencha os dados do novo produto'}
              {modalTipo === 'editar' && 'Altere os dados do produto'}
              {modalTipo === 'excluir' && 'Tem certeza que deseja excluir este produto?'}
              {modalTipo === 'visualizar' && 'Visualize os detalhes do produto'}
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

          {modalTipo === 'excluir' ? (
            <div className="space-y-4">
              {produtoSelecionado && (
                <div className="p-4 bg-zinc-800 rounded-lg">
                  <p className="text-gray-300">
                    <strong>Código:</strong> {produtoSelecionado.codigo}
                  </p>
                  <p className="text-gray-300 mt-2">
                    <strong>Descrição:</strong> {produtoSelecionado.descricao}
                  </p>
                  {produtoSelecionado.fornecedor && (
                    <p className="text-gray-300 mt-2">
                      <strong>Fornecedor:</strong> {produtoSelecionado.fornecedor}
                    </p>
                  )}
                  <p className="text-gray-300 mt-2">
                    <strong>Preço de Venda:</strong> {formatarPreco(produtoSelecionado.preco_venda)}
                  </p>
                </div>
              )}
              <div className="flex gap-3 justify-end">
                <Button
                  onClick={fecharModal}
                  variant="outline"
                  className="bg-zinc-800 border-zinc-700 text-gray-300 hover:bg-zinc-700"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={excluirProduto}
                  disabled={salvando}
                  className="bg-red-500 hover:bg-red-600 text-white"
                >
                  {salvando ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Excluindo...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Excluir
                    </>
                  )}
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <Label className="text-gray-300">Código *</Label>
                <Input
                  name="codigo"
                  value={formData.codigo}
                  onChange={handleInputChange}
                  placeholder="Ex: PROD001"
                  className="bg-zinc-800 border-amber-500/20 text-gray-300 mt-1"
                  disabled={modalTipo === 'editar'} // Código não pode ser alterado na edição
                />
              </div>

              <div>
                <Label className="text-gray-300">Descrição *</Label>
                <Input
                  name="descricao"
                  value={formData.descricao}
                  onChange={handleInputChange}
                  placeholder="Ex: Shampoo Premium 500ml"
                  className="bg-zinc-800 border-amber-500/20 text-gray-300 mt-1"
                />
              </div>

              <div>
                <Label className="text-gray-300">Fornecedor</Label>
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
                  <Label className="text-gray-300">Preço de Venda (R$) *</Label>
                  <Input
                    name="preco_venda"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.preco_venda}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    className="bg-zinc-800 border-amber-500/20 text-gray-300 mt-1"
                  />
                </div>
                {modalTipo === 'editar' && produtoSelecionado?.ultimo_preco_custo && (
                  <div>
                    <Label className="text-gray-300">Último Preço de Custo</Label>
                    <div className="bg-zinc-800 border border-blue-500/30 rounded-lg p-3 mt-1">
                      <p className="text-blue-400 font-bold text-lg">
                        {formatarPreco(produtoSelecionado.ultimo_preco_custo)}
                      </p>
                      <p className="text-gray-400 text-xs mt-1">
                        Use este valor como referência para definir o preço de venda
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={handleInputChange}
                  className="w-4 h-4 rounded border-zinc-700 bg-zinc-900 text-amber-500 focus:ring-2 focus:ring-amber-500 cursor-pointer"
                />
                <Label className="text-gray-300 cursor-pointer">Produto ativo</Label>
              </div>

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
                  onClick={salvarProduto}
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
                      Salvar
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
