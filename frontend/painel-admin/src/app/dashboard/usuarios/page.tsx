'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Users, Search, Edit, Trash2, Plus, Eye, Mail, User, X, Save, Loader2, AlertCircle, CheckCircle2, EyeOff } from 'lucide-react'
import { usePermissions } from '@/hooks/usePermissions'
import { getApiBaseUrl } from '@/lib/api'

interface Cliente {
  id: string
  nome_completo: string
  email: string
  cpf?: string | null
  rg?: string | null
  rua?: string | null
  numero?: string | null
  complemento?: string | null
  bairro?: string | null
  cidade?: string | null
  estado?: string | null
  cep?: string | null
  foto_url?: string | null
  funcionario_responsavel_id?: string | null
  funcionario_responsavel_nome?: string | null
  is_active: boolean
  created_at: string
}

interface Funcionario {
  id: string
  nome_completo: string
  tipo_usuario: string
}

export default function UsuariosPage() {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [clientesFiltrados, setClientesFiltrados] = useState<Cliente[]>([])
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [mostrarModal, setMostrarModal] = useState(false)
  const [modalTipo, setModalTipo] = useState<'criar' | 'editar' | 'excluir' | 'visualizar'>('criar')
  const [clienteSelecionado, setClienteSelecionado] = useState<Cliente | null>(null)
  const [salvando, setSalvando] = useState(false)
  const [mensagem, setMensagem] = useState<{ tipo: 'sucesso' | 'erro' | null; texto: string }>({ tipo: null, texto: '' })
  
  const { podeAcessar, podeEditar, podeExcluir } = usePermissions()

  // Formulário
  const [formData, setFormData] = useState({
    nome_completo: '',
    email: '',
    cpf: '',
    rg: '',
    rua: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    estado: '',
    cep: '',
    senha: '',
    funcionario_responsavel_id: '',
    is_active: true,
  })
  const [fotoPreview, setFotoPreview] = useState<string | null>(null)
  const [fotoFile, setFotoFile] = useState<File | null>(null)
  const [mostrarSenha, setMostrarSenha] = useState(false)

  useEffect(() => {
    carregarClientes()
    carregarFuncionarios()
  }, [])

  useEffect(() => {
    filtrarClientes()
  }, [searchTerm, clientes])

  const carregarClientes = async () => {
    setLoading(true)
    try {
      const apiUrl = getApiBaseUrl()
      // Usar cache: 'no-store' para sempre buscar dados atualizados
      const response = await fetch(`${apiUrl}/api/v1/clientes`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store', // Evitar cache do navegador
      })

      if (!response.ok) {
        throw new Error('Erro ao carregar clientes')
      }

      const data = await response.json()
      console.log('[DEBUG] Clientes carregados:', data.clientes?.length || 0)
      setClientes(data.clientes || [])
    } catch (error: any) {
      console.error('Erro ao carregar clientes:', error)
      setMensagem({ tipo: 'erro', texto: 'Erro ao carregar clientes' })
    } finally {
      setLoading(false)
    }
  }

  const carregarFuncionarios = async () => {
    try {
      const adminData = localStorage.getItem('admin')
      const admin = adminData ? JSON.parse(adminData) : null
      const tipoUsuario = admin?.tipo_usuario || 'master'

      const apiUrl = getApiBaseUrl()
      const response = await fetch(`${apiUrl}/api/v1/funcionarios?tipo_usuario=${tipoUsuario}`)

      if (response.ok) {
        const data = await response.json()
        setFuncionarios(data.funcionarios || [])
      }
    } catch (error: any) {
      console.error('Erro ao carregar funcionários:', error)
    }
  }

  const filtrarClientes = () => {
    if (!searchTerm.trim()) {
      setClientesFiltrados(clientes)
      return
    }

    const termo = searchTerm.toLowerCase().trim()
    const termoCpf = termo.replace(/\D/g, '')
    
    const filtrados = clientes.filter((cliente) => {
      const nome = (cliente.nome_completo || '').toString().toLowerCase()
      const email = (cliente.email || '').toString().toLowerCase()
      const cpf = cliente.cpf ? cliente.cpf.toString().replace(/\D/g, '') : ''

      const matchNome = nome.includes(termo)
      const matchEmail = email.includes(termo)
      const matchCpf = termoCpf && cpf && cpf.includes(termoCpf)

      return matchNome || matchEmail || matchCpf
    })

    setClientesFiltrados(filtrados)
  }

  const formatarCPF = (cpf: string | null | undefined) => {
    if (!cpf) return '-'
    const cpfLimpo = cpf.replace(/\D/g, '')
    if (cpfLimpo.length === 11) {
      return cpfLimpo.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
    }
    return cpf
  }

  const formatarCEP = (cep: string | null | undefined) => {
    if (!cep) return '-'
    const cepLimpo = cep.replace(/\D/g, '')
    if (cepLimpo.length === 8) {
      return cepLimpo.replace(/(\d{5})(\d{3})/, '$1-$2')
    }
    return cep
  }

  const abrirModal = (tipo: 'criar' | 'editar' | 'excluir' | 'visualizar', cliente?: Cliente) => {
    setModalTipo(tipo)
    setClienteSelecionado(cliente || null)
    setMostrarSenha(false) // Resetar visualização de senha ao abrir modal
    setSearchTerm('') // Limpar campo de pesquisa ao abrir modal (corrige bug do email aparecendo)
    
    if (tipo === 'criar') {
      setFormData({
        nome_completo: '',
        email: '',
        cpf: '',
        rg: '',
        rua: '',
        numero: '',
        complemento: '',
        bairro: '',
        cidade: '',
        estado: '',
        cep: '',
        senha: '',
        funcionario_responsavel_id: '',
        is_active: true,
      })
      setFotoPreview(null)
      setFotoFile(null)
    } else if (tipo === 'editar' && cliente) {
      setFormData({
        nome_completo: cliente.nome_completo || '',
        email: cliente.email || '',
        cpf: formatarCPF(cliente.cpf) || '',
        rg: cliente.rg || '',
        rua: cliente.rua || '',
        numero: cliente.numero || '',
        complemento: cliente.complemento || '',
        bairro: cliente.bairro || '',
        cidade: cliente.cidade || '',
        estado: cliente.estado || '',
        cep: formatarCEP(cliente.cep) || '',
        senha: '',
        funcionario_responsavel_id: cliente.funcionario_responsavel_id || '',
        is_active: cliente.is_active,
      })
      setFotoPreview(cliente.foto_url || null)
      setFotoFile(null)
    }
    
    setMostrarModal(true)
  }

  const fecharModal = () => {
    setMostrarModal(false)
    setClienteSelecionado(null)
    setMensagem({ tipo: null, texto: '' })
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    if (type === 'checkbox') {
      setFormData({ ...formData, [name]: (e.target as HTMLInputElement).checked })
    } else {
      setFormData({ ...formData, [name]: value })
    }
  }

  const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setMensagem({ tipo: 'erro', texto: 'A foto deve ter no máximo 5MB' })
        return
      }
      setFotoFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setFotoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const salvarCliente = async () => {
    if (!formData.nome_completo || !formData.email || !formData.cpf) {
      setMensagem({ tipo: 'erro', texto: 'Preencha todos os campos obrigatórios' })
      return
    }

    setSalvando(true)
    setMensagem({ tipo: null, texto: '' })

    try {
      const apiUrl = getApiBaseUrl()
      
      // Obter dados do admin logado para enviar nos headers
      const adminData = localStorage.getItem('admin')
      const admin = adminData ? JSON.parse(adminData) : null
      
      const formDataToSend = new FormData()

      // Adicionar campos ao FormData
      Object.keys(formData).forEach((key) => {
        if (key !== 'senha' || formData.senha) {
          formDataToSend.append(key, (formData as any)[key])
        }
      })

      if (fotoFile) {
        formDataToSend.append('foto', fotoFile)
      }

      // Preparar headers (não incluir Content-Type para FormData - o navegador define automaticamente)
      const headers: HeadersInit = {}
      if (admin?.id) {
        headers['x-user-id'] = admin.id
        headers['x-user-tipo'] = admin.tipo_usuario || 'administrativo'
      }

      let response
      if (modalTipo === 'criar') {
        if (!formData.senha) {
          setMensagem({ tipo: 'erro', texto: 'A senha é obrigatória para criar um cliente' })
          setSalvando(false)
          return
        }
        response = await fetch(`${apiUrl}/api/v1/clientes`, {
          method: 'POST',
          headers,
          body: formDataToSend,
        })
      } else {
        response = await fetch(`${apiUrl}/api/v1/clientes/${clienteSelecionado?.id}`, {
          method: 'PUT',
          headers,
          body: formDataToSend,
        })
      }

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao salvar cliente')
      }

      setMensagem({ tipo: 'sucesso', texto: data.message || 'Cliente salvo com sucesso!' })
      
      // Recarregar os dados imediatamente após salvar
      await carregarClientes()
      setTimeout(() => {
        fecharModal()
      }, 1000)
    } catch (error: any) {
      console.error('Erro ao salvar cliente:', error)
      setMensagem({ tipo: 'erro', texto: error.message || 'Erro ao salvar cliente' })
    } finally {
      setSalvando(false)
    }
  }

  const excluirCliente = async () => {
    if (!clienteSelecionado) return

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
      
      const response = await fetch(`${apiUrl}/api/v1/clientes/${clienteSelecionado.id}`, {
        method: 'DELETE',
        headers,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao excluir cliente')
      }

      setMensagem({ tipo: 'sucesso', texto: data.message || 'Cliente excluído com sucesso!' })
      
      // Recarregar os dados imediatamente após excluir
      await carregarClientes()
      setTimeout(() => {
        fecharModal()
      }, 1000)
    } catch (error: any) {
      console.error('Erro ao excluir cliente:', error)
      setMensagem({ tipo: 'erro', texto: error.message || 'Erro ao excluir cliente' })
    } finally {
      setSalvando(false)
    }
  }

  // Verificar permissões
  if (!podeAcessar('usuarios')) {
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
    <div className="space-y-6 pb-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-2">
            <Users className="h-8 w-8 text-amber-500" />
            Gerenciamento de Usuários
          </h1>
          <p className="text-gray-400 mt-1">Gerencie todos os clientes cadastrados no sistema</p>
        </div>
        {podeEditar('usuarios') && (
          <button
            onClick={() => abrirModal('criar')}
            className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-black rounded-lg transition-colors font-medium"
          >
            <Plus className="h-5 w-5" />
            Novo Cliente
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
          <p className="text-gray-300 text-sm">Total de Clientes</p>
          <h2 className="text-3xl font-bold text-amber-400 mt-1">{clientes.length}</h2>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-zinc-800 p-6 rounded-lg shadow-lg border border-green-500/20"
        >
          <p className="text-gray-300 text-sm">Clientes Ativos</p>
          <h2 className="text-3xl font-bold text-green-400 mt-1">
            {clientes.filter((c) => c.is_active).length}
          </h2>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-zinc-800 p-6 rounded-lg shadow-lg border border-blue-500/20"
        >
          <p className="text-gray-300 text-sm">Clientes Inativos</p>
          <h2 className="text-3xl font-bold text-red-400 mt-1">
            {clientes.filter((c) => !c.is_active).length}
          </h2>
        </motion.div>
      </div>

      {/* Filtro de Busca */}
      <div className="bg-zinc-900 border border-amber-500/20 rounded-lg p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nome, email ou CPF..."
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        {searchTerm && (
          <p className="text-gray-400 text-sm mt-2">
            {clientesFiltrados.length} resultado(s) encontrado(s)
          </p>
        )}
      </div>

      {/* Tabela de Clientes */}
      <div className="bg-zinc-900 border border-amber-500/20 rounded-lg overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Carregando clientes...</p>
          </div>
        ) : clientesFiltrados.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">
              {searchTerm ? 'Nenhum cliente encontrado com os filtros aplicados.' : 'Nenhum cliente cadastrado.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead className="bg-zinc-800 border-b border-zinc-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider min-w-[150px]">
                    Cliente
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider min-w-[120px]">
                    CPF
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider min-w-[180px]">
                    Email
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider min-w-[150px]">
                    Funcionário Responsável
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider min-w-[80px]">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider min-w-[120px]">
                    Cadastrado em
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider min-w-[100px] sticky right-0 bg-zinc-800 z-10">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {clientesFiltrados.map((cliente) => (
                  <motion.tr
                    key={cliente.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="hover:bg-zinc-800/50 transition-colors group"
                  >
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {cliente.foto_url ? (
                          <img
                            src={cliente.foto_url}
                            alt={cliente.nome_completo}
                            className="w-8 h-8 rounded-full object-cover border-2 border-amber-500/30 flex-shrink-0"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                            <User className="h-4 w-4 text-amber-500" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <div className="text-white font-medium text-sm truncate max-w-[130px]">{cliente.nome_completo}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="text-gray-300 text-sm">{formatarCPF(cliente.cpf)}</span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-2 min-w-0">
                        <Mail className="h-3 w-3 text-gray-500 flex-shrink-0" />
                        <span className="text-gray-300 text-sm truncate max-w-[160px]">{cliente.email}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="text-gray-300 text-sm truncate max-w-[140px] block">
                        {cliente.funcionario_responsavel_nome || (
                          <span className="text-gray-500 italic">Nenhum</span>
                        )}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          cliente.is_active
                            ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                            : 'bg-red-500/20 text-red-400 border border-red-500/30'
                        }`}
                      >
                        {cliente.is_active ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-gray-400 text-sm">
                      {new Date(cliente.created_at).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right sticky right-0 bg-zinc-900 group-hover:bg-zinc-800/50 transition-colors z-10">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => abrirModal('visualizar', cliente)}
                          className="p-2 hover:bg-zinc-800 rounded-lg transition-colors text-gray-400 hover:text-blue-400"
                          title="Visualizar"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        {podeEditar('usuarios') && (
                          <button
                            onClick={() => abrirModal('editar', cliente)}
                            className="p-2 hover:bg-zinc-800 rounded-lg transition-colors text-gray-400 hover:text-amber-400"
                            title="Editar"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                        )}
                        {podeExcluir('usuarios') && (
                          <button
                            onClick={() => abrirModal('excluir', cliente)}
                            className="p-2 hover:bg-zinc-800 rounded-lg transition-colors text-gray-400 hover:text-red-400"
                            title="Excluir"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
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
              className="bg-zinc-900 border border-amber-500/20 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              {/* Header do Modal */}
              <div className="flex items-center justify-between p-6 border-b border-zinc-800">
                <h2 className="text-xl font-bold text-white">
                  {modalTipo === 'criar' && 'Novo Cliente'}
                  {modalTipo === 'editar' && 'Editar Cliente'}
                  {modalTipo === 'excluir' && 'Excluir Cliente'}
                  {modalTipo === 'visualizar' && 'Detalhes do Cliente'}
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
                      Tem certeza que deseja excluir o cliente <strong>{clienteSelecionado?.nome_completo}</strong>?
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
                        onClick={excluirCliente}
                        disabled={salvando}
                        className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
                      >
                        {salvando ? <Loader2 className="animate-spin h-4 w-4" /> : <Trash2 className="h-4 w-4" />}
                        {salvando ? 'Excluindo...' : 'Excluir'}
                      </button>
                    </div>
                  </div>
                )}

                {modalTipo === 'visualizar' && clienteSelecionado && (
                  <div className="space-y-4">
                    <div className="text-center">
                      {clienteSelecionado.foto_url ? (
                        <img
                          src={clienteSelecionado.foto_url}
                          alt={clienteSelecionado.nome_completo}
                          className="w-24 h-24 rounded-full object-cover border-4 border-amber-500/30 mx-auto mb-4"
                        />
                      ) : (
                        <div className="w-24 h-24 rounded-full bg-amber-500/20 flex items-center justify-center mx-auto mb-4">
                          <User className="h-12 w-12 text-amber-500" />
                        </div>
                      )}
                      <h3 className="text-xl font-bold text-white">{clienteSelecionado.nome_completo}</h3>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-gray-400 text-sm">Email</label>
                        <p className="text-white">{clienteSelecionado.email}</p>
                      </div>
                      <div>
                        <label className="text-gray-400 text-sm">CPF</label>
                        <p className="text-white">{formatarCPF(clienteSelecionado.cpf)}</p>
                      </div>
                      {clienteSelecionado.rg && (
                        <div>
                          <label className="text-gray-400 text-sm">RG</label>
                          <p className="text-white">{clienteSelecionado.rg}</p>
                        </div>
                      )}
                      <div>
                        <label className="text-gray-400 text-sm">Status</label>
                        <p className="text-white">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              clienteSelecionado.is_active
                                ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                : 'bg-red-500/20 text-red-400 border border-red-500/30'
                            }`}
                          >
                            {clienteSelecionado.is_active ? 'Ativo' : 'Inativo'}
                          </span>
                        </p>
                      </div>
                      {clienteSelecionado.rua && (
                        <>
                          <div className="col-span-2">
                            <label className="text-gray-400 text-sm">Endereço</label>
                            <p className="text-white">
                              {clienteSelecionado.rua}, {clienteSelecionado.numero}
                              {clienteSelecionado.complemento && ` - ${clienteSelecionado.complemento}`}
                            </p>
                            <p className="text-white">
                              {clienteSelecionado.bairro}, {clienteSelecionado.cidade} - {clienteSelecionado.estado}
                            </p>
                            {clienteSelecionado.cep && (
                              <p className="text-white">CEP: {formatarCEP(clienteSelecionado.cep)}</p>
                            )}
                          </div>
                        </>
                      )}
                      {clienteSelecionado.funcionario_responsavel_nome && (
                        <div className="col-span-2">
                          <label className="text-gray-400 text-sm">Profissional Responsável</label>
                          <p className="text-white">{clienteSelecionado.funcionario_responsavel_nome}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {(modalTipo === 'criar' || modalTipo === 'editar') && (
                  <div className="space-y-4">
                    {/* Foto */}
                    <div>
                      <label className="block text-gray-300 mb-2">Foto</label>
                      <div className="flex items-center gap-4">
                        {fotoPreview && (
                          <img
                            src={fotoPreview}
                            alt="Preview"
                            className="w-20 h-20 rounded-full object-cover border-2 border-amber-500/30"
                          />
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFotoChange}
                          className="block text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-amber-500 file:text-black hover:file:bg-amber-600"
                        />
                      </div>
                    </div>

                    {/* Nome Completo */}
                    <div>
                      <label className="block text-gray-300 mb-2">Nome Completo *</label>
                      <input
                        type="text"
                        name="nome_completo"
                        value={formData.nome_completo}
                        onChange={handleInputChange}
                        className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-amber-500"
                        required
                      />
                    </div>

                    {/* Email e CPF */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-gray-300 mb-2">Email *</label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-amber-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-gray-300 mb-2">CPF *</label>
                        <input
                          type="text"
                          name="cpf"
                          value={formData.cpf}
                          onChange={handleInputChange}
                          placeholder="000.000.000-00"
                          className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-amber-500"
                          required
                        />
                      </div>
                    </div>

                    {/* RG */}
                    <div>
                      <label className="block text-gray-300 mb-2">RG</label>
                      <input
                        type="text"
                        name="rg"
                        value={formData.rg}
                        onChange={handleInputChange}
                        className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    {/* Endereço */}
                    <div className="grid grid-cols-3 gap-4">
                      <div className="col-span-2">
                        <label className="block text-gray-300 mb-2">Rua *</label>
                        <input
                          type="text"
                          name="rua"
                          value={formData.rua}
                          onChange={handleInputChange}
                          className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-amber-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-gray-300 mb-2">Número *</label>
                        <input
                          type="text"
                          name="numero"
                          value={formData.numero}
                          onChange={handleInputChange}
                          className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-amber-500"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-gray-300 mb-2">Complemento</label>
                      <input
                        type="text"
                        name="complemento"
                        value={formData.complemento}
                        onChange={handleInputChange}
                        className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-gray-300 mb-2">Bairro *</label>
                        <input
                          type="text"
                          name="bairro"
                          value={formData.bairro}
                          onChange={handleInputChange}
                          className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-amber-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-gray-300 mb-2">Cidade *</label>
                        <input
                          type="text"
                          name="cidade"
                          value={formData.cidade}
                          onChange={handleInputChange}
                          className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-amber-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-gray-300 mb-2">Estado *</label>
                        <input
                          type="text"
                          name="estado"
                          value={formData.estado}
                          onChange={handleInputChange}
                          placeholder="MT"
                          maxLength={2}
                          className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-amber-500 uppercase"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-gray-300 mb-2">CEP *</label>
                      <input
                        type="text"
                        name="cep"
                        value={formData.cep}
                        onChange={handleInputChange}
                        placeholder="00000-000"
                        className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-amber-500"
                        required
                      />
                    </div>

                    {/* Funcionário Responsável */}
                    <div>
                      <label className="block text-gray-300 mb-2">Funcionário Responsável</label>
                      <select
                        name="funcionario_responsavel_id"
                        value={formData.funcionario_responsavel_id}
                        onChange={handleInputChange}
                        className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-amber-500"
                      >
                        <option value="">Nenhum</option>
                        {funcionarios.map((func) => (
                          <option key={func.id} value={func.id}>
                            {func.nome_completo} ({func.tipo_usuario.charAt(0).toUpperCase() + func.tipo_usuario.slice(1)})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Senha */}
                    <div>
                      <label className="block text-gray-300 mb-2">
                        Senha {modalTipo === 'criar' ? '*' : '(deixe em branco para não alterar)'}
                      </label>
                      <div className="relative">
                        <input
                          type={mostrarSenha ? 'text' : 'password'}
                          name="senha"
                          value={formData.senha}
                          onChange={handleInputChange}
                          className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 pr-10 text-white focus:outline-none focus:border-amber-500"
                          required={modalTipo === 'criar'}
                        />
                        <button
                          type="button"
                          onClick={() => setMostrarSenha(!mostrarSenha)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-amber-500 transition-colors"
                          tabIndex={-1}
                        >
                          {mostrarSenha ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
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
                      <label className="text-gray-300">Cliente Ativo</label>
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
                        onClick={salvarCliente}
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
