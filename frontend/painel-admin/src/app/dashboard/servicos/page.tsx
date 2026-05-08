'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Scissors, Search, Edit, Trash2, Plus, Eye, X, Save, Loader2, AlertCircle, CheckCircle2, DollarSign, Clock, Tag, Image as ImageIcon, Star } from 'lucide-react'
import { usePermissions } from '@/hooks/usePermissions'
import { getApiBaseUrl } from '@/lib/api'

interface ImagemServico {
  id: string
  url_imagem: string
  is_capa: boolean
}

interface Servico {
  id: string
  nome: string
  descricao?: string | null
  preco: number
  duracao_minutos: number
  categoria?: string | null
  is_active: boolean
  created_at: string
  updated_at?: string | null
  imagens?: ImagemServico[]
}

export default function ServicosPage() {
  const [servicos, setServicos] = useState<Servico[]>([])
  const [servicosFiltrados, setServicosFiltrados] = useState<Servico[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [categoriaFiltro, setCategoriaFiltro] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [mostrarModal, setMostrarModal] = useState(false)
  const [modalTipo, setModalTipo] = useState<'criar' | 'editar' | 'excluir' | 'visualizar'>('criar')
  const [servicoSelecionado, setServicoSelecionado] = useState<Servico | null>(null)
  const [salvando, setSalvando] = useState(false)
  const [mensagem, setMensagem] = useState<{ tipo: 'sucesso' | 'erro' | null; texto: string }>({ tipo: null, texto: '' })
  const { podeAcessar, podeEditar, podeExcluir } = usePermissions()

  // Formulário
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    preco: '',
    duracao_minutos: 30,
    categoria: '',
    is_active: true,
  })

  // Imagens
  const [imagensPreview, setImagensPreview] = useState<string[]>([])
  const [imagensArquivos, setImagensArquivos] = useState<File[]>([])
  const [imagensExistentes, setImagensExistentes] = useState<ImagemServico[]>([])

  useEffect(() => {
    carregarServicos()
  }, [])

  useEffect(() => {
    filtrarServicos()
  }, [searchTerm, categoriaFiltro, servicos])

  const carregarServicos = async () => {
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
      }

      const response = await fetch(`${apiUrl}/api/v1/servicos`, {
        headers,
      })

      if (!response.ok) {
        throw new Error('Erro ao carregar serviços')
      }

      const data = await response.json()
      setServicos(data.servicos || [])
    } catch (error: any) {
      console.error('Erro ao carregar serviços:', error)
      setMensagem({ tipo: 'erro', texto: error.message || 'Erro ao carregar serviços' })
    } finally {
      setLoading(false)
    }
  }

  const filtrarServicos = () => {
    let filtrados = servicos

    // Filtrar por termo de busca
    if (searchTerm.trim()) {
      const termo = searchTerm.toLowerCase().trim()
      filtrados = filtrados.filter((serv) => {
        const nome = (serv.nome || '').toString().toLowerCase()
        const descricao = (serv.descricao || '').toString().toLowerCase()
        const categoria = (serv.categoria || '').toString().toLowerCase()
        const preco = serv.preco.toString()

        return (
          nome.includes(termo) ||
          descricao.includes(termo) ||
          categoria.includes(termo) ||
          preco.includes(termo)
        )
      })
    }

    // Filtrar por categoria
    if (categoriaFiltro) {
      filtrados = filtrados.filter((serv) => serv.categoria === categoriaFiltro)
    }

    setServicosFiltrados(filtrados)
  }

  const formatarPreco = (preco: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(preco)
  }

  const formatarDuracao = (minutos: number) => {
    if (minutos < 60) {
      return `${minutos} min`
    }
    const horas = Math.floor(minutos / 60)
    const mins = minutos % 60
    return mins > 0 ? `${horas}h ${mins}min` : `${horas}h`
  }

  const obterCategoriasUnicas = () => {
    const categorias = servicos
      .map((s) => s.categoria)
      .filter((c): c is string => !!c)
    return Array.from(new Set(categorias))
  }

  const abrirModal = (tipo: 'criar' | 'editar' | 'excluir' | 'visualizar', servico?: Servico) => {
    setModalTipo(tipo)
    setServicoSelecionado(servico || null)

    if (tipo === 'criar') {
      setFormData({
        nome: '',
        descricao: '',
        preco: '',
        duracao_minutos: 30,
        categoria: '',
        is_active: true,
      })
      setImagensPreview([])
      setImagensArquivos([])
      setImagensExistentes([])
    } else if (tipo === 'editar' && servico) {
      setFormData({
        nome: servico.nome || '',
        descricao: servico.descricao || '',
        preco: servico.preco.toString() || '',
        duracao_minutos: servico.duracao_minutos || 30,
        categoria: servico.categoria || '',
        is_active: servico.is_active,
      })
      setImagensPreview([])
      setImagensArquivos([])
      setImagensExistentes(servico.imagens || [])
    } else if (tipo === 'visualizar' && servico) {
      setImagensExistentes(servico.imagens || [])
    }

    setMostrarModal(true)
  }

  const fecharModal = () => {
    setMostrarModal(false)
    setServicoSelecionado(null)
    setMensagem({ tipo: null, texto: '' })
    setImagensPreview([])
    setImagensArquivos([])
    setImagensExistentes([])
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const totalImagens = imagensExistentes.length + imagensPreview.length + files.length

    if (totalImagens > 3) {
      setMensagem({
        tipo: 'erro',
        texto: 'Máximo de 3 imagens por serviço. Remova algumas imagens antes de adicionar novas.',
      })
      return
    }

    files.forEach((file) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onloadend = () => {
          setImagensPreview((prev) => [...prev, reader.result as string])
          setImagensArquivos((prev) => [...prev, file])
        }
        reader.readAsDataURL(file)
      }
    })
  }

  const removerImagemPreview = (index: number) => {
    setImagensPreview((prev) => prev.filter((_, i) => i !== index))
    setImagensArquivos((prev) => prev.filter((_, i) => i !== index))
  }

  const removerImagemExistente = async (campo: string) => {
    if (!servicoSelecionado) return

    try {
      const adminData = localStorage.getItem('admin')
      const admin = adminData ? JSON.parse(adminData) : null

      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      }
      if (admin?.id) {
        headers['x-user-id'] = admin.id
        headers['x-user-tipo'] = admin.tipo_usuario || 'administrativo'
      }

      const apiUrl = getApiBaseUrl()
      const response = await fetch(
        `${apiUrl}/api/v1/servicos/${servicoSelecionado.id}/imagens/${campo}`,
        {
          method: 'DELETE',
          headers,
        }
      )

      if (!response.ok) {
        throw new Error('Erro ao remover imagem')
      }

      setImagensExistentes((prev) => prev.filter((img) => img.id !== campo))
      await carregarServicos()
      setMensagem({ tipo: 'sucesso', texto: 'Imagem removida com sucesso!' })
    } catch (error: any) {
      setMensagem({ tipo: 'erro', texto: error.message || 'Erro ao remover imagem' })
    }
  }

  const definirCapa = async (campo: string) => {
    if (!servicoSelecionado || campo === 'capa') return

    try {
      const adminData = localStorage.getItem('admin')
      const admin = adminData ? JSON.parse(adminData) : null

      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      }
      if (admin?.id) {
        headers['x-user-id'] = admin.id
        headers['x-user-tipo'] = admin.tipo_usuario || 'administrativo'
      }

      const apiUrl = getApiBaseUrl()
      const response = await fetch(
        `${apiUrl}/api/v1/servicos/${servicoSelecionado.id}/imagens/capa`,
        {
          method: 'PUT',
          headers,
          body: JSON.stringify({ campo }),
        }
      )

      if (!response.ok) {
        throw new Error('Erro ao definir capa')
      }

      setImagensExistentes((prev) =>
        prev.map((img) => ({
          ...img,
          is_capa: img.id === campo,
        }))
      )
      await carregarServicos()
      setMensagem({ tipo: 'sucesso', texto: 'Capa atualizada com sucesso!' })
    } catch (error: any) {
      setMensagem({ tipo: 'erro', texto: error.message || 'Erro ao definir capa' })
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    if (type === 'checkbox') {
      setFormData({ ...formData, [name]: (e.target as HTMLInputElement).checked })
    } else if (type === 'number') {
      setFormData({ ...formData, [name]: value })
    } else {
      setFormData({ ...formData, [name]: value })
    }
  }

  const salvarServico = async () => {
    if (!formData.nome || !formData.preco) {
      setMensagem({ tipo: 'erro', texto: 'Preencha todos os campos obrigatórios' })
      return
    }

    const precoNumber = parseFloat(formData.preco)
    if (isNaN(precoNumber) || precoNumber < 0) {
      setMensagem({ tipo: 'erro', texto: 'Preço inválido' })
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
        nome: formData.nome,
        descricao: formData.descricao || null,
        preco: precoNumber,
        duracao_minutos: parseInt(formData.duracao_minutos.toString()) || 30,
        categoria: formData.categoria || null,
        is_active: formData.is_active,
      }

      // Preparar headers
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      }
      if (admin?.id) {
        headers['x-user-id'] = admin.id
        headers['x-user-tipo'] = admin.tipo_usuario || 'administrativo'
      }

      let response
      if (modalTipo === 'criar') {
        response = await fetch(`${apiUrl}/api/v1/servicos`, {
          method: 'POST',
          headers,
          body: JSON.stringify(body),
        })
      } else {
        response = await fetch(`${apiUrl}/api/v1/servicos/${servicoSelecionado?.id}`, {
          method: 'PUT',
          headers,
          body: JSON.stringify(body),
        })
      }

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao salvar serviço')
      }

      setMensagem({ tipo: 'sucesso', texto: data.message || 'Serviço salvo com sucesso!' })
      
      // Fazer upload das imagens se houver
      const servicoId = modalTipo === 'criar' ? data.servico.id : servicoSelecionado?.id
      if (servicoId && imagensArquivos.length > 0) {
        try {
          const formDataImagens = new FormData()
          imagensArquivos.forEach((file) => {
            formDataImagens.append('imagens', file)
          })

          const headersImagens: HeadersInit = {}
          if (admin?.id) {
            headersImagens['x-user-id'] = admin.id
            headersImagens['x-user-tipo'] = admin.tipo_usuario || 'administrativo'
          }

          const responseImagens = await fetch(`${apiUrl}/api/v1/servicos/${servicoId}/imagens`, {
            method: 'POST',
            headers: headersImagens,
            body: formDataImagens,
          })

          if (!responseImagens.ok) {
            const errorData = await responseImagens.json()
            throw new Error(errorData.error || 'Erro ao fazer upload das imagens')
          }
        } catch (error: any) {
          console.error('Erro ao fazer upload das imagens:', error)
          setMensagem({
            tipo: 'erro',
            texto: `Serviço salvo, mas houve erro ao fazer upload das imagens: ${error.message}`,
          })
        }
      }

      await carregarServicos()
      setTimeout(() => {
        fecharModal()
      }, 1500)
    } catch (error: any) {
      console.error('Erro ao salvar serviço:', error)
      setMensagem({ tipo: 'erro', texto: error.message || 'Erro ao salvar serviço' })
    } finally {
      setSalvando(false)
    }
  }

  const excluirServico = async () => {
    if (!servicoSelecionado) return

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
      }

      const response = await fetch(`${apiUrl}/api/v1/servicos/${servicoSelecionado.id}`, {
        method: 'DELETE',
        headers,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao excluir serviço')
      }

      setMensagem({ tipo: 'sucesso', texto: data.message || 'Serviço excluído com sucesso!' })
      await carregarServicos()
      setTimeout(() => {
        fecharModal()
      }, 1500)
    } catch (error: any) {
      console.error('Erro ao excluir serviço:', error)
      setMensagem({ tipo: 'erro', texto: error.message || 'Erro ao excluir serviço' })
    } finally {
      setSalvando(false)
    }
  }

  // Verificar permissões
  if (!podeAcessar('servicos')) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-500 mb-2">Acesso Negado</h2>
          <p className="text-gray-400">Você não tem permissão para acessar esta página.</p>
        </div>
      </div>
    )
  }

  const categorias = obterCategoriasUnicas()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-2">
            <Scissors className="h-8 w-8 text-amber-500" />
            Serviços
          </h1>
          <p className="text-gray-400 mt-1">Gerencie os serviços oferecidos pela barbearia</p>
        </div>
        {podeEditar('servicos') && (
          <button
            onClick={() => abrirModal('criar')}
            className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-black rounded-lg transition-colors font-medium"
          >
            <Plus className="h-5 w-5" />
            Novo Serviço
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
          <p className="text-gray-300 text-sm">Total de Serviços</p>
          <h2 className="text-3xl font-bold text-amber-400 mt-1">{servicos.length}</h2>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-zinc-800 p-6 rounded-lg shadow-lg border border-green-500/20"
        >
          <p className="text-gray-300 text-sm">Serviços Ativos</p>
          <h2 className="text-3xl font-bold text-green-400 mt-1">
            {servicos.filter((s) => s.is_active).length}
          </h2>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-zinc-800 p-6 rounded-lg shadow-lg border border-blue-500/20"
        >
          <p className="text-gray-300 text-sm">Categorias</p>
          <h2 className="text-3xl font-bold text-blue-400 mt-1">{categorias.length}</h2>
        </motion.div>
      </div>

      {/* Filtros */}
      <div className="bg-zinc-900 border border-amber-500/20 rounded-lg p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nome, descrição, categoria ou preço..."
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="relative">
            <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <select
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg pl-10 pr-4 py-3 text-white focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
              value={categoriaFiltro}
              onChange={(e) => setCategoriaFiltro(e.target.value)}
            >
              <option value="">Todas as categorias</option>
              {categorias.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>
        {(searchTerm || categoriaFiltro) && (
          <p className="text-gray-400 text-sm">
            {servicosFiltrados.length} resultado(s) encontrado(s)
          </p>
        )}
      </div>

      {/* Grid de Serviços */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Carregando serviços...</p>
          </div>
        ) : servicosFiltrados.length === 0 ? (
          <div className="col-span-full p-12 text-center">
            <Scissors className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">
              {searchTerm || categoriaFiltro
                ? 'Nenhum serviço encontrado com os filtros aplicados.'
                : 'Nenhum serviço cadastrado.'}
            </p>
          </div>
        ) : (
          servicosFiltrados.map((serv) => (
            <motion.div
              key={serv.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-zinc-900 border border-amber-500/20 rounded-lg overflow-hidden hover:border-amber-500/40 transition-all group"
            >
              {/* Imagem de Capa */}
              {serv.imagens && serv.imagens.length > 0 ? (
                <div className="relative h-48 w-full bg-zinc-800 overflow-hidden">
                  <img
                    src={serv.imagens.find((img) => img.is_capa)?.url_imagem || serv.imagens[0]?.url_imagem}
                    alt={serv.nome}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const imgUrl = serv.imagens?.find((img) => img.is_capa)?.url_imagem || serv.imagens?.[0]?.url_imagem
                      console.error('❌ Erro ao carregar imagem:', imgUrl)
                      console.error('Serviço:', serv.nome)
                      console.error('Todas as imagens:', serv.imagens)
                      // Não alterar para logo, manter tentando carregar
                    }}
                    onLoad={() => {
                      console.log('✅ Imagem carregada:', serv.imagens?.find((img) => img.is_capa)?.url_imagem || serv.imagens?.[0]?.url_imagem)
                    }}
                  />
                  {serv.imagens.find((img) => img.is_capa) && (
                    <div className="absolute top-2 right-2 bg-amber-500/90 text-black text-xs px-2 py-1 rounded-full font-semibold flex items-center gap-1">
                      <Star className="h-3 w-3" />
                      Capa
                    </div>
                  )}
                </div>
              ) : (
                <div className="h-48 w-full bg-zinc-800 flex items-center justify-center">
                  <ImageIcon className="h-16 w-16 text-zinc-700" />
                </div>
              )}

              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-white mb-1">{serv.nome}</h3>
                    {serv.categoria && (
                      <span className="inline-block px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded border border-blue-500/30">
                        {serv.categoria}
                      </span>
                    )}
                  </div>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      serv.is_active
                        ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                        : 'bg-red-500/20 text-red-400 border border-red-500/30'
                    }`}
                  >
                    {serv.is_active ? 'Ativo' : 'Inativo'}
                  </span>
                </div>

                {serv.descricao && (
                  <p className="text-gray-400 text-sm mb-4 line-clamp-2">{serv.descricao}</p>
                )}

                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 text-amber-400">
                    <DollarSign className="h-4 w-4" />
                    <span className="text-lg font-bold">{formatarPreco(serv.preco)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-400">
                    <Clock className="h-4 w-4" />
                    <span className="text-sm">{formatarDuracao(serv.duracao_minutos)}</span>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-4 border-t border-zinc-800">
                  <button
                    onClick={() => abrirModal('visualizar', serv)}
                    className="p-2 hover:bg-zinc-800 rounded-lg transition-colors text-gray-400 hover:text-blue-400"
                    title="Visualizar"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  {podeEditar('servicos') && (
                    <button
                      onClick={() => abrirModal('editar', serv)}
                      className="p-2 hover:bg-zinc-800 rounded-lg transition-colors text-gray-400 hover:text-amber-400"
                      title="Editar"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                  )}
                  {podeExcluir('servicos') && (
                    <button
                      onClick={() => abrirModal('excluir', serv)}
                      className="p-2 hover:bg-zinc-800 rounded-lg transition-colors text-gray-400 hover:text-red-400"
                      title="Excluir"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {mostrarModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={fecharModal}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-zinc-900 border border-amber-500/20 rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto"
            >
              {/* Header do Modal */}
              <div className="flex items-center justify-between p-6 border-b border-zinc-800">
                <h2 className="text-xl font-bold text-white">
                  {modalTipo === 'criar' && 'Novo Serviço'}
                  {modalTipo === 'editar' && 'Editar Serviço'}
                  {modalTipo === 'excluir' && 'Excluir Serviço'}
                  {modalTipo === 'visualizar' && 'Detalhes do Serviço'}
                </h2>
                <button
                  onClick={fecharModal}
                  className="p-2 hover:bg-zinc-800 rounded-lg transition-colors text-gray-400 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Conteúdo do Modal */}
              <div className="p-6">
                {mensagem.tipo && (
                  <div
                    className={`p-4 rounded-lg mb-4 ${
                      mensagem.tipo === 'sucesso'
                        ? 'bg-green-500/10 border border-green-500/30 text-green-500'
                        : 'bg-red-500/10 border border-red-500/30 text-red-500'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {mensagem.tipo === 'sucesso' ? (
                        <CheckCircle2 className="h-5 w-5" />
                      ) : (
                        <AlertCircle className="h-5 w-5" />
                      )}
                      <p className="text-sm">{mensagem.texto}</p>
                    </div>
                  </div>
                )}

                {modalTipo === 'excluir' && (
                  <div className="text-center py-4">
                    <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
                    <p className="text-gray-300 mb-2">
                      Tem certeza que deseja excluir o serviço <strong>{servicoSelecionado?.nome}</strong>?
                    </p>
                    <p className="text-gray-400 text-sm">Esta ação não pode ser desfeita.</p>
                    <div className="flex gap-4 justify-center mt-6">
                      <button
                        onClick={fecharModal}
                        className="px-6 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-colors"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={excluirServico}
                        disabled={salvando}
                        className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
                      >
                        {salvando ? <Loader2 className="animate-spin h-4 w-4" /> : <Trash2 className="h-4 w-4" />}
                        {salvando ? 'Excluindo...' : 'Excluir'}
                      </button>
                    </div>
                  </div>
                )}

                {modalTipo === 'visualizar' && servicoSelecionado && (
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="w-24 h-24 rounded-full bg-amber-500/20 flex items-center justify-center mx-auto mb-4">
                        <Scissors className="h-12 w-12 text-amber-500" />
                      </div>
                      <h3 className="text-xl font-bold text-white">{servicoSelecionado.nome}</h3>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-gray-400 text-sm">Preço</label>
                        <p className="text-white text-lg font-bold">{formatarPreco(servicoSelecionado.preco)}</p>
                      </div>
                      <div>
                        <label className="text-gray-400 text-sm">Duração</label>
                        <p className="text-white">{formatarDuracao(servicoSelecionado.duracao_minutos)}</p>
                      </div>
                      {servicoSelecionado.categoria && (
                        <div>
                          <label className="text-gray-400 text-sm">Categoria</label>
                          <p className="text-white">{servicoSelecionado.categoria}</p>
                        </div>
                      )}
                      <div>
                        <label className="text-gray-400 text-sm">Status</label>
                        <p className="text-white">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              servicoSelecionado.is_active
                                ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                : 'bg-red-500/20 text-red-400 border border-red-500/30'
                            }`}
                          >
                            {servicoSelecionado.is_active ? 'Ativo' : 'Inativo'}
                          </span>
                        </p>
                      </div>
                    </div>

                    {servicoSelecionado.descricao && (
                      <div>
                        <label className="text-gray-400 text-sm">Descrição</label>
                        <p className="text-white">{servicoSelecionado.descricao}</p>
                      </div>
                    )}

                    {/* Imagens */}
                    {imagensExistentes.length > 0 && (
                      <div>
                        <label className="text-gray-400 text-sm mb-2 block">Imagens</label>
                        <div className="grid grid-cols-3 gap-2">
                          {imagensExistentes.map((img, idx) => (
                            <div key={img.id} className="relative">
                              <img
                                src={img.url_imagem}
                                alt={`Imagem ${idx + 1}`}
                                className="w-full h-32 object-cover rounded border-2 border-zinc-700"
                              />
                              {img.is_capa && (
                                <div className="absolute top-2 right-2 bg-amber-500 text-black text-xs px-2 py-1 rounded flex items-center gap-1">
                                  <Star className="h-3 w-3" />
                                  Capa
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {(modalTipo === 'criar' || modalTipo === 'editar') && (
                  <div className="space-y-4">
                    {/* Nome */}
                    <div>
                      <label className="block text-gray-300 mb-2">Nome *</label>
                      <input
                        type="text"
                        name="nome"
                        value={formData.nome}
                        onChange={handleInputChange}
                        className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-amber-500"
                        required
                      />
                    </div>

                    {/* Descrição */}
                    <div>
                      <label className="block text-gray-300 mb-2">Descrição</label>
                      <textarea
                        name="descricao"
                        value={formData.descricao}
                        onChange={handleInputChange}
                        rows={3}
                        className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-amber-500 resize-none"
                      />
                    </div>

                    {/* Preço e Duração */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-gray-300 mb-2">Preço (R$) *</label>
                        <input
                          type="number"
                          name="preco"
                          value={formData.preco}
                          onChange={handleInputChange}
                          step="0.01"
                          min="0"
                          className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-amber-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-gray-300 mb-2">Duração (minutos)</label>
                        <input
                          type="number"
                          name="duracao_minutos"
                          value={formData.duracao_minutos}
                          onChange={handleInputChange}
                          min="1"
                          className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-amber-500"
                        />
                      </div>
                    </div>

                    {/* Categoria */}
                    <div>
                      <label className="block text-gray-300 mb-2">Categoria</label>
                      <input
                        type="text"
                        name="categoria"
                        value={formData.categoria}
                        onChange={handleInputChange}
                        placeholder="Ex: Corte, Barba, Tratamento..."
                        className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    {/* Status */}
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        name="is_active"
                        checked={formData.is_active}
                        onChange={handleInputChange}
                        className="w-4 h-4 rounded border-zinc-700 bg-zinc-900 text-amber-500 focus:ring-2 focus:ring-amber-500"
                      />
                      <label className="text-gray-300">Serviço Ativo</label>
                    </div>

                    {/* Imagens */}
                    <div>
                      <label className="block text-gray-300 mb-2">
                        Imagens (máximo 3) {imagensExistentes.length + imagensPreview.length > 0 && `(${imagensExistentes.length + imagensPreview.length}/3)`}
                      </label>
                      
                      {/* Imagens Existentes */}
                      {imagensExistentes.length > 0 && (
                        <div className="grid grid-cols-3 gap-2 mb-3">
                          {imagensExistentes.map((img) => (
                            <div key={img.id} className="relative group">
                              <img
                                src={img.url_imagem}
                                alt={img.is_capa ? 'Capa' : `Imagem ${img.id}`}
                                className="w-full h-24 object-cover rounded border-2 border-zinc-700"
                              />
                              {img.is_capa && (
                                <div className="absolute top-1 left-1 bg-amber-500 text-black text-xs px-1.5 py-0.5 rounded flex items-center gap-1">
                                  <Star className="h-3 w-3" />
                                  Capa
                                </div>
                              )}
                              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded flex items-center justify-center gap-2">
                                {!img.is_capa && (
                                  <button
                                    onClick={() => definirCapa(img.id)}
                                    className="p-1 bg-amber-500 hover:bg-amber-600 rounded text-white"
                                    title="Definir como capa"
                                  >
                                    <Star className="h-4 w-4" />
                                  </button>
                                )}
                                <button
                                  onClick={() => removerImagemExistente(img.id)}
                                  className="p-1 bg-red-500 hover:bg-red-600 rounded text-white"
                                  title="Remover"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Preview de Novas Imagens */}
                      {imagensPreview.length > 0 && (
                        <div className="grid grid-cols-3 gap-2 mb-3">
                          {imagensPreview.map((preview, idx) => (
                            <div key={idx} className="relative group">
                              <img
                                src={preview}
                                alt={`Preview ${idx + 1}`}
                                className="w-full h-24 object-cover rounded border-2 border-amber-500"
                              />
                              {idx === 0 && imagensExistentes.length === 0 && (
                                <div className="absolute top-1 left-1 bg-amber-500 text-black text-xs px-1.5 py-0.5 rounded flex items-center gap-1">
                                  <Star className="h-3 w-3" />
                                  Capa
                                </div>
                              )}
                              <button
                                onClick={() => removerImagemPreview(idx)}
                                className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded flex items-center justify-center"
                                title="Remover"
                              >
                                <Trash2 className="h-6 w-6 text-red-500" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Input de Upload */}
                      {imagensExistentes.length + imagensPreview.length < 3 && (
                        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-zinc-700 rounded-lg cursor-pointer hover:border-amber-500 transition-colors">
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <ImageIcon className="h-8 w-8 text-gray-400 mb-2" />
                            <p className="text-sm text-gray-400">
                              <span className="font-semibold">Clique para adicionar</span> ou arraste imagens aqui
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              Máximo 3 imagens (PNG, JPG, WEBP)
                            </p>
                          </div>
                          <input
                            type="file"
                            className="hidden"
                            accept="image/*"
                            multiple
                            onChange={handleImageChange}
                          />
                        </label>
                      )}
                    </div>

                    {/* Botões */}
                    <div className="flex gap-4 justify-end pt-4">
                      <button
                        onClick={fecharModal}
                        className="px-6 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-colors"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={salvarServico}
                        disabled={salvando}
                        className="px-6 py-2 bg-amber-500 hover:bg-amber-600 text-black rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
                      >
                        {salvando ? <Loader2 className="animate-spin h-4 w-4" /> : <Save className="h-4 w-4" />}
                        {salvando ? 'Salvando...' : 'Salvar'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

