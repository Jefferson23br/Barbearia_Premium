'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { UserCog, Search, Edit, Trash2, Plus, Eye, Mail, X, Save, Loader2, AlertCircle, CheckCircle2, EyeOff } from 'lucide-react'
import { usePermissions } from '@/hooks/usePermissions'
import { ImageCropModal } from '@/components/admin/ImageCropModal'
import { getApiBaseUrl } from '@/lib/api'

interface Funcionario {
  id: string
  nome_completo: string
  email: string
  cpf?: string | null
  tipo_usuario: string
  is_active: boolean
  created_at: string
}

export default function FuncionariosPage() {
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([])
  const [funcionariosFiltrados, setFuncionariosFiltrados] = useState<Funcionario[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [mostrarModal, setMostrarModal] = useState(false)
  const [modalTipo, setModalTipo] = useState<'criar' | 'editar' | 'excluir' | 'visualizar'>('criar')
  const [funcionarioSelecionado, setFuncionarioSelecionado] = useState<Funcionario | null>(null)
  const [salvando, setSalvando] = useState(false)
  const [mensagem, setMensagem] = useState<{ tipo: 'sucesso' | 'erro' | null; texto: string }>({ tipo: null, texto: '' })
  const [mostrarSenha, setMostrarSenha] = useState(false)
  const [fotoPreview, setFotoPreview] = useState<string | null>(null)
  const [fotoFile, setFotoFile] = useState<File | null>(null)
  const [fotoOriginal, setFotoOriginal] = useState<string | null>(null)
  const [mostrarCrop, setMostrarCrop] = useState(false)
  const { podeAcessar, podeEditar, podeExcluir } = usePermissions()

  // Formulário
  const [formData, setFormData] = useState({
    nome_completo: '',
    email: '',
    cpf: '',
    rg: '',
    tipo_usuario: 'funcionario',
    senha: '',
    is_active: true,
    // Campos de endereço
    rua: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    estado: '',
    cep: '',
    // Campos de trabalho
    data_admissao: '',
    tipo_contrato: 'CLT',
    salario: '',
    nis: '',
    foto_url: '',
  })

  useEffect(() => {
    carregarFuncionarios()
  }, [])

  useEffect(() => {
    filtrarFuncionarios()
  }, [searchTerm, funcionarios])

  const carregarFuncionarios = async () => {
    setLoading(true)
    try {
      const adminData = localStorage.getItem('admin')
      const admin = adminData ? JSON.parse(adminData) : null
      const tipoUsuario = admin?.tipo_usuario || 'master'

      const apiUrl = getApiBaseUrl()
      const response = await fetch(`${apiUrl}/api/v1/funcionarios?tipo_usuario=${tipoUsuario}`)

      if (!response.ok) {
        throw new Error('Erro ao carregar funcionários')
      }

      const data = await response.json()
      setFuncionarios(data.funcionarios || [])
    } catch (error: any) {
      console.error('Erro ao carregar funcionários:', error)
    } finally {
      setLoading(false)
    }
  }

  const filtrarFuncionarios = () => {
    if (!searchTerm.trim()) {
      setFuncionariosFiltrados(funcionarios)
      return
    }

    const termo = searchTerm.toLowerCase().trim()
    const termoCpf = termo.replace(/\D/g, '')
    
    const filtrados = funcionarios.filter((func) => {
      const nome = (func.nome_completo || '').toString().toLowerCase()
      const email = (func.email || '').toString().toLowerCase()
      const cpf = func.cpf ? func.cpf.toString().replace(/\D/g, '') : ''

      const matchNome = nome.includes(termo)
      const matchEmail = email.includes(termo)
      const matchCpf = termoCpf && cpf && cpf.includes(termoCpf)

      return matchNome || matchEmail || matchCpf
    })

    setFuncionariosFiltrados(filtrados)
  }

  const formatarCPF = (cpf: string | null | undefined) => {
    if (!cpf) return '-'
    const cpfLimpo = cpf.replace(/\D/g, '')
    if (cpfLimpo.length === 11) {
      return cpfLimpo.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
    }
    return cpf
  }

  const getTipoUsuarioBadge = (tipo: string) => {
    const cores = {
      master: 'bg-red-500/20 text-red-400 border-red-500/30',
      proprietario: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      funcionario: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    }
    return cores[tipo as keyof typeof cores] || 'bg-gray-500/20 text-gray-400 border-gray-500/30'
  }

  const abrirModal = async (tipo: 'criar' | 'editar' | 'excluir' | 'visualizar', funcionario?: Funcionario) => {
    setModalTipo(tipo)
    setFuncionarioSelecionado(funcionario || null)
    setMostrarSenha(false) // Resetar visualização de senha ao abrir modal
    setSearchTerm('') // Limpar campo de pesquisa ao abrir modal
    
    if (tipo === 'criar') {
      setFormData({
        nome_completo: '',
        email: '',
        cpf: '',
        rg: '',
        tipo_usuario: 'funcionario',
        senha: '',
        is_active: true,
        // Campos de endereço
        rua: '',
        numero: '',
        complemento: '',
        bairro: '',
        cidade: '',
        estado: '',
        cep: '',
        // Campos de trabalho
        data_admissao: new Date().toISOString().split('T')[0], // Data de hoje como padrão
        tipo_contrato: 'CLT',
        salario: '',
        nis: '',
        foto_url: '',
      })
      setFotoPreview(null)
      setFotoFile(null)
      setMostrarModal(true)
    } else if (tipo === 'editar' && funcionario) {
      // Buscar dados completos do funcionário do backend
      try {
        setLoading(true)
        const adminData = localStorage.getItem('admin')
        const admin = adminData ? JSON.parse(adminData) : null
        const apiUrl = getApiBaseUrl()
        
        const response = await fetch(`${apiUrl}/api/v1/funcionarios/${funcionario.id}`, {
          headers: {
            'x-user-id': admin?.id || '',
            'x-user-tipo': admin?.tipo_usuario || 'administrativo',
          },
        })

        if (response.ok) {
          const data = await response.json()
          const funcionarioCompleto = data.funcionario || data
          
          // Carregar foto do funcionário se existir
          setFotoPreview(funcionarioCompleto.foto_url || null)
          setFotoFile(null) // Limpar arquivo selecionado
          
          setFormData({
            nome_completo: funcionarioCompleto.nome_completo || '',
            email: funcionarioCompleto.email || '',
            cpf: formatarCPF(funcionarioCompleto.cpf) || '',
            rg: funcionarioCompleto.rg || '',
            tipo_usuario: funcionarioCompleto.tipo_usuario || 'funcionario',
            senha: '',
            is_active: funcionarioCompleto.is_active !== false,
            // Campos de endereço
            rua: funcionarioCompleto.rua || '',
            numero: funcionarioCompleto.numero || '',
            complemento: funcionarioCompleto.complemento || '',
            bairro: funcionarioCompleto.bairro || '',
            cidade: funcionarioCompleto.cidade || '',
            estado: funcionarioCompleto.estado || '',
            cep: funcionarioCompleto.cep || '',
            // Campos de trabalho
            data_admissao: funcionarioCompleto.data_admissao ? funcionarioCompleto.data_admissao.split('T')[0] : '',
            tipo_contrato: funcionarioCompleto.tipo_contrato || 'CLT',
            salario: funcionarioCompleto.salario ? String(funcionarioCompleto.salario) : '',
            nis: funcionarioCompleto.nis || '',
            foto_url: funcionarioCompleto.foto_url || '',
          })
        } else {
          console.error('Erro ao carregar dados do funcionário:', response.status)
          setMensagem({ tipo: 'erro', texto: 'Erro ao carregar dados do funcionário' })
        }
      } catch (error: any) {
        console.error('Erro ao carregar funcionário:', error)
        setMensagem({ tipo: 'erro', texto: error.message || 'Erro ao carregar dados do funcionário' })
      } finally {
        setLoading(false)
      }
      setMostrarModal(true)
    } else if (tipo === 'visualizar' || tipo === 'excluir') {
      setMostrarModal(true)
    }
  }

  const fecharModal = () => {
    setMostrarModal(false)
    setFuncionarioSelecionado(null)
    setMensagem({ tipo: null, texto: '' })
    setFotoPreview(null)
    setFotoFile(null)
    setSearchTerm('') // Limpar campo de pesquisa ao fechar modal
  }

  const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validar tipo de arquivo
      if (!file.type.startsWith('image/')) {
        setMensagem({ tipo: 'erro', texto: 'Por favor, selecione apenas arquivos de imagem' })
        return
      }
      
      // Validar tamanho (5MB)
      if (file.size > 5 * 1024 * 1024) {
        setMensagem({ tipo: 'erro', texto: 'A imagem deve ter no máximo 5MB' })
        return
      }

      // Criar preview e abrir modal de crop
      const reader = new FileReader()
      reader.onloadend = () => {
        const imageUrl = reader.result as string
        console.log('[FUNCIONARIOS] Imagem carregada, abrindo crop:', imageUrl.substring(0, 50))
        setFotoOriginal(imageUrl)
        setMostrarCrop(true)
      }
      reader.onerror = (error) => {
        console.error('[FUNCIONARIOS] Erro ao ler arquivo:', error)
        setMensagem({ tipo: 'erro', texto: 'Erro ao carregar imagem' })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleCropComplete = (croppedImage: string) => {
    console.log('[FUNCIONARIOS] Crop completo, imagem recortada recebida')
    setFotoPreview(croppedImage)
    
    // Converter a imagem recortada para File
    fetch(croppedImage)
      .then(res => res.blob())
      .then(blob => {
        const file = new File([blob], 'foto.jpg', { type: 'image/jpeg' })
        console.log('[FUNCIONARIOS] Arquivo criado:', file.name, file.size, 'bytes')
        setFotoFile(file)
      })
      .catch(error => {
        console.error('[FUNCIONARIOS] Erro ao converter imagem:', error)
      })
    
    setFotoOriginal(null)
    setMostrarCrop(false)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    if (type === 'checkbox') {
      setFormData({ ...formData, [name]: (e.target as HTMLInputElement).checked })
    } else {
      setFormData({ ...formData, [name]: value })
    }
  }

  const salvarFuncionario = async () => {
    console.log('🚀 [FRONTEND] salvarFuncionario chamado')
    console.log('📋 [FRONTEND] formData:', formData)
    console.log('📋 [FRONTEND] modalTipo:', modalTipo)
    
    if (!formData.nome_completo || !formData.email || !formData.tipo_usuario) {
      console.error('❌ [FRONTEND] Campos obrigatórios faltando')
      setMensagem({ tipo: 'erro', texto: 'Preencha todos os campos obrigatórios' })
      return
    }

    if (modalTipo === 'criar' && !formData.senha) {
      console.error('❌ [FRONTEND] Senha obrigatória para criação')
      setMensagem({ tipo: 'erro', texto: 'A senha é obrigatória para criar um funcionário' })
      return
    }

    setSalvando(true)
    setMensagem({ tipo: null, texto: '' })

    try {
      const apiUrl = getApiBaseUrl()
      
      // Obter dados do admin logado para enviar nos headers
      const adminData = localStorage.getItem('admin')
      const admin = adminData ? JSON.parse(adminData) : null
      
      console.log('👤 [FRONTEND] Admin logado:', admin ? { id: admin.id, nome: admin.nome_completo, tipo: admin.tipo_usuario } : 'não encontrado')
      
      // Preparar headers
      const headers: any = {}
      if (admin?.id) {
        headers['x-user-id'] = admin.id
        headers['x-user-tipo'] = admin.tipo_usuario || 'administrativo'
        headers['x-user-nome'] = admin.nome_completo || 'Sistema'
      }

      let response
      const url = modalTipo === 'criar' 
        ? `${apiUrl}/api/v1/funcionarios`
        : `${apiUrl}/api/v1/funcionarios/${funcionarioSelecionado?.id}`

      // Se houver foto, usar FormData, senão usar JSON
      console.log('[FUNCIONARIOS] Verificando fotoFile:', fotoFile ? `Arquivo: ${fotoFile.name}, Tamanho: ${fotoFile.size}` : 'Nenhum arquivo')
      if (fotoFile) {
        console.log('[FUNCIONARIOS] Enviando com FormData (com foto)')
        const formDataToSend = new FormData()
        formDataToSend.append('nome_completo', formData.nome_completo)
        formDataToSend.append('email', formData.email)
        if (formData.cpf) formDataToSend.append('cpf', formData.cpf)
        if (formData.rg) formDataToSend.append('rg', formData.rg)
        formDataToSend.append('tipo_usuario', formData.tipo_usuario)
        if (modalTipo === 'criar' || (modalTipo === 'editar' && formData.senha)) {
          formDataToSend.append('senha', formData.senha)
        }
        // Campos de endereço
        if (formData.rua) formDataToSend.append('rua', formData.rua)
        if (formData.numero) formDataToSend.append('numero', formData.numero)
        if (formData.complemento) formDataToSend.append('complemento', formData.complemento)
        if (formData.bairro) formDataToSend.append('bairro', formData.bairro)
        if (formData.cidade) formDataToSend.append('cidade', formData.cidade)
        if (formData.estado) formDataToSend.append('estado', formData.estado)
        if (formData.cep) formDataToSend.append('cep', formData.cep)
        // Campos de trabalho
        if (formData.data_admissao) formDataToSend.append('data_admissao', formData.data_admissao)
        if (formData.tipo_contrato) formDataToSend.append('tipo_contrato', formData.tipo_contrato)
        if (formData.salario) formDataToSend.append('salario', String(parseFloat(formData.salario.replace(',', '.'))))
        if (formData.nis) formDataToSend.append('nis', formData.nis)
        formDataToSend.append('foto', fotoFile)
        console.log('[FUNCIONARIOS] Foto adicionada ao FormData:', fotoFile.name)

        if (modalTipo === 'criar') {
          response = await fetch(url, {
            method: 'POST',
            headers,
            body: formDataToSend,
          })
        } else {
          response = await fetch(url, {
            method: 'PUT',
            headers,
            body: formDataToSend,
          })
        }
      } else {
        // Sem foto, usar JSON
        const body = {
          nome_completo: formData.nome_completo,
          email: formData.email,
          cpf: formData.cpf || null,
          rg: formData.rg || null,
          tipo_usuario: formData.tipo_usuario,
          senha: modalTipo === 'criar' ? formData.senha : (formData.senha || undefined),
          // Campos de endereço
          rua: formData.rua || '',
          numero: formData.numero || '',
          complemento: formData.complemento || '',
          bairro: formData.bairro || '',
          cidade: formData.cidade || '',
          estado: formData.estado || '',
          cep: formData.cep || '',
          // Campos de trabalho
          data_admissao: formData.data_admissao || new Date().toISOString().split('T')[0],
          tipo_contrato: formData.tipo_contrato || 'CLT',
          salario: formData.salario ? parseFloat(formData.salario.replace(',', '.')) : null,
          nis: formData.nis || null,
          foto_url: formData.foto_url || null,
        }

        // Remover senha vazia na edição
        if (modalTipo === 'editar' && !formData.senha) {
          delete body.senha
        }

        headers['Content-Type'] = 'application/json'

        if (modalTipo === 'criar') {
          response = await fetch(url, {
            method: 'POST',
            headers,
            body: JSON.stringify(body),
          })
        } else {
          response = await fetch(url, {
            method: 'PUT',
            headers,
            body: JSON.stringify(body),
          })
        }
      }

      console.log('📥 [FRONTEND] Resposta recebida:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      })

      const data = await response.json()
      console.log('📋 [FRONTEND] Dados da resposta:', data)

      if (!response.ok) {
        console.error('❌ [FRONTEND] Erro na resposta:', data)
        throw new Error(data.error || data.message || 'Erro ao salvar funcionário')
      }

      // Se for o próprio usuário logado, atualizar localStorage
      if (admin) {
        const funcionarioAtualizado = data.funcionario || data
        if (funcionarioSelecionado?.id === admin.id || (modalTipo === 'criar' && funcionarioAtualizado.id === admin.id)) {
          const adminAtualizado = {
            ...admin,
            nome_completo: funcionarioAtualizado.nome_completo,
            email: funcionarioAtualizado.email,
            foto_url: funcionarioAtualizado.foto_url,
          }
          localStorage.setItem('admin', JSON.stringify(adminAtualizado))
          // Disparar evento para atualizar o header
          window.dispatchEvent(new CustomEvent('adminUpdated', { detail: adminAtualizado }))
        }
      }

      setMensagem({ tipo: 'sucesso', texto: data.message || 'Funcionário salvo com sucesso!' })
      setFotoPreview(null)
      setFotoFile(null)
      setSearchTerm('') // Limpar campo de pesquisa após salvar com sucesso
      await carregarFuncionarios()
      setTimeout(() => {
        fecharModal()
      }, 1500)
    } catch (error: any) {
      console.error('Erro ao salvar funcionário:', error)
      setMensagem({ tipo: 'erro', texto: error.message || 'Erro ao salvar funcionário' })
    } finally {
      setSalvando(false)
    }
  }

  const excluirFuncionario = async () => {
    if (!funcionarioSelecionado) return

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
        headers['x-user-nome'] = admin.nome_completo || 'Sistema'
      }
      
      const response = await fetch(`${apiUrl}/api/v1/funcionarios/${funcionarioSelecionado.id}`, {
        method: 'DELETE',
        headers,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao excluir funcionário')
      }

      setMensagem({ tipo: 'sucesso', texto: data.message || 'Funcionário excluído com sucesso!' })
      await carregarFuncionarios()
      setTimeout(() => {
        fecharModal()
      }, 1500)
    } catch (error: any) {
      console.error('Erro ao excluir funcionário:', error)
      setMensagem({ tipo: 'erro', texto: error.message || 'Erro ao excluir funcionário' })
    } finally {
      setSalvando(false)
    }
  }

  // Verificar permissões
  if (!podeAcessar('funcionarios')) {
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
    <>
      {/* Modal de Crop */}
      {fotoOriginal && mostrarCrop && (
        <ImageCropModal
          image={fotoOriginal}
          isOpen={mostrarCrop}
          onClose={() => {
            console.log('[FUNCIONARIOS] Fechando modal de crop')
            setMostrarCrop(false)
            setFotoOriginal(null)
          }}
          onCropComplete={handleCropComplete}
          aspect={1}
          cropShape="round"
          size={{ width: 200, height: 200 }}
        />
      )}

      <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-2">
            <UserCog className="h-8 w-8 text-amber-500" />
            Gerenciamento de Funcionários
          </h1>
          <p className="text-gray-400 mt-1">Gerencie todos os funcionários do sistema</p>
        </div>
        {podeEditar('funcionarios') && (
          <button
            onClick={() => abrirModal('criar')}
            className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-black rounded-lg transition-colors font-medium"
          >
            <Plus className="h-5 w-5" />
            Novo Funcionário
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
          <p className="text-gray-300 text-sm">Total de Funcionários</p>
          <h2 className="text-3xl font-bold text-amber-400 mt-1">{funcionarios.length}</h2>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-zinc-800 p-6 rounded-lg shadow-lg border border-green-500/20"
        >
          <p className="text-gray-300 text-sm">Funcionários Ativos</p>
          <h2 className="text-3xl font-bold text-green-400 mt-1">
            {funcionarios.filter((f) => f.is_active).length}
          </h2>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-zinc-800 p-6 rounded-lg shadow-lg border border-blue-500/20"
        >
          <p className="text-gray-300 text-sm">Masters</p>
          <h2 className="text-3xl font-bold text-blue-400 mt-1">
            {funcionarios.filter((f) => f.tipo_usuario === 'master').length}
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
            {funcionariosFiltrados.length} resultado(s) encontrado(s)
          </p>
        )}
      </div>

      {/* Tabela de Funcionários */}
      <div className="bg-zinc-900 border border-amber-500/20 rounded-lg overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Carregando funcionários...</p>
          </div>
        ) : funcionariosFiltrados.length === 0 ? (
          <div className="p-12 text-center">
            <UserCog className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">
              {searchTerm ? 'Nenhum funcionário encontrado com os filtros aplicados.' : 'Nenhum funcionário cadastrado.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto w-full">
            <table className="w-full min-w-[800px]">
              <thead className="bg-zinc-800 border-b border-zinc-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider min-w-[150px]">
                    Funcionário
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider min-w-[120px]">
                    CPF
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider min-w-[180px]">
                    Email
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider min-w-[100px]">
                    Tipo
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
                {funcionariosFiltrados.map((func) => (
                  <motion.tr
                    key={func.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="hover:bg-zinc-800/50 transition-colors group"
                  >
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                          <UserCog className="h-4 w-4 text-amber-500" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-white font-medium text-sm truncate max-w-[130px]">{func.nome_completo}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="text-gray-300 text-sm">{formatarCPF(func.cpf)}</span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-2 min-w-0">
                        <Mail className="h-3 w-3 text-gray-500 flex-shrink-0" />
                        <span className="text-gray-300 text-sm truncate max-w-[160px]">{func.email}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold border capitalize ${getTipoUsuarioBadge(
                          func.tipo_usuario
                        )}`}
                      >
                        {func.tipo_usuario}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          func.is_active
                            ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                            : 'bg-red-500/20 text-red-400 border border-red-500/30'
                        }`}
                      >
                        {func.is_active ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-gray-400 text-xs">
                      {new Date(func.created_at).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right sticky right-0 bg-zinc-900 group-hover:bg-zinc-800/50 z-10">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => abrirModal('visualizar', func)}
                          className="p-2 hover:bg-zinc-800 rounded-lg transition-colors text-gray-400 hover:text-blue-400"
                          title="Visualizar"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        {podeEditar('funcionarios') && (
                          <button
                            onClick={() => abrirModal('editar', func)}
                            className="p-2 hover:bg-zinc-800 rounded-lg transition-colors text-gray-400 hover:text-amber-400"
                            title="Editar"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                        )}
                        {podeExcluir('funcionarios') && func.tipo_usuario !== 'master' && (
                          <button
                            onClick={() => abrirModal('excluir', func)}
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
              className="bg-zinc-900 border border-amber-500/20 rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto"
            >
              {/* Header do Modal */}
              <div className="flex items-center justify-between p-6 border-b border-zinc-800">
                <h2 className="text-xl font-bold text-white">
                  {modalTipo === 'criar' && 'Novo Funcionário'}
                  {modalTipo === 'editar' && 'Editar Funcionário'}
                  {modalTipo === 'excluir' && 'Excluir Funcionário'}
                  {modalTipo === 'visualizar' && 'Detalhes do Funcionário'}
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
                      Tem certeza que deseja excluir o funcionário <strong>{funcionarioSelecionado?.nome_completo}</strong>?
                    </p>
                    <p className="text-gray-400 text-sm">Esta ação não pode ser desfeita.</p>
                    {funcionarioSelecionado?.tipo_usuario === 'master' && (
                      <p className="text-red-400 text-sm mt-2">Não é permitido excluir usuários Master.</p>
                    )}
                    <div className="flex gap-4 justify-center mt-6">
                      <button
                        onClick={fecharModal}
                        className="px-6 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-colors"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={excluirFuncionario}
                        disabled={salvando || funcionarioSelecionado?.tipo_usuario === 'master'}
                        className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
                      >
                        {salvando ? <Loader2 className="animate-spin h-4 w-4" /> : <Trash2 className="h-4 w-4" />}
                        {salvando ? 'Excluindo...' : 'Excluir'}
                      </button>
                    </div>
                  </div>
                )}

                {modalTipo === 'visualizar' && funcionarioSelecionado && (
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="w-24 h-24 rounded-full bg-amber-500/20 flex items-center justify-center mx-auto mb-4">
                        <UserCog className="h-12 w-12 text-amber-500" />
                      </div>
                      <h3 className="text-xl font-bold text-white">{funcionarioSelecionado.nome_completo}</h3>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-gray-400 text-sm">Email</label>
                        <p className="text-white">{funcionarioSelecionado.email}</p>
                      </div>
                      <div>
                        <label className="text-gray-400 text-sm">CPF</label>
                        <p className="text-white">{formatarCPF(funcionarioSelecionado.cpf)}</p>
                      </div>
                      <div>
                        <label className="text-gray-400 text-sm">Tipo</label>
                        <p className="text-white">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-semibold border capitalize ${getTipoUsuarioBadge(
                              funcionarioSelecionado.tipo_usuario
                            )}`}
                          >
                            {funcionarioSelecionado.tipo_usuario}
                          </span>
                        </p>
                      </div>
                      <div>
                        <label className="text-gray-400 text-sm">Status</label>
                        <p className="text-white">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              funcionarioSelecionado.is_active
                                ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                : 'bg-red-500/20 text-red-400 border border-red-500/30'
                            }`}
                          >
                            {funcionarioSelecionado.is_active ? 'Ativo' : 'Inativo'}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {(modalTipo === 'criar' || modalTipo === 'editar') && (
                  <div className="space-y-4">
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
                        <label className="block text-gray-300 mb-2">CPF</label>
                        <input
                          type="text"
                          name="cpf"
                          value={formData.cpf}
                          onChange={handleInputChange}
                          placeholder="000.000.000-00"
                          className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-amber-500"
                        />
                      </div>
                    </div>

                    {/* Tipo de Usuário */}
                    <div>
                      <label className="block text-gray-300 mb-2">Tipo de Usuário *</label>
                      <select
                        name="tipo_usuario"
                        value={formData.tipo_usuario}
                        onChange={handleInputChange}
                        className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-amber-500"
                        required
                      >
                        <option value="funcionario">Funcionário</option>
                        <option value="proprietario">Proprietário</option>
                        <option value="master">Master</option>
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

                    {/* Endereço */}
                    <div className="border-t border-zinc-800 pt-4 mt-4">
                      <h3 className="text-gray-300 font-semibold mb-4">Endereço</h3>
                      
                      {/* Rua */}
                      <div className="mb-4">
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

                      {/* Número e CEP */}
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-gray-300 mb-2">Número</label>
                          <input
                            type="text"
                            name="numero"
                            value={formData.numero}
                            onChange={handleInputChange}
                            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-amber-500"
                          />
                        </div>
                        <div>
                          <label className="block text-gray-300 mb-2">CEP</label>
                          <input
                            type="text"
                            name="cep"
                            value={formData.cep}
                            onChange={handleInputChange}
                            placeholder="00000-000"
                            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-amber-500"
                          />
                        </div>
                      </div>

                      {/* Complemento */}
                      <div className="mb-4">
                        <label className="block text-gray-300 mb-2">Complemento</label>
                        <input
                          type="text"
                          name="complemento"
                          value={formData.complemento}
                          onChange={handleInputChange}
                          className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-amber-500"
                        />
                      </div>

                      {/* Bairro */}
                      <div className="mb-4">
                        <label className="block text-gray-300 mb-2">Bairro</label>
                        <input
                          type="text"
                          name="bairro"
                          value={formData.bairro}
                          onChange={handleInputChange}
                          className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-amber-500"
                        />
                      </div>

                      {/* Cidade e Estado */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-gray-300 mb-2">Cidade</label>
                          <input
                            type="text"
                            name="cidade"
                            value={formData.cidade}
                            onChange={handleInputChange}
                            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-amber-500"
                          />
                        </div>
                        <div>
                          <label className="block text-gray-300 mb-2">Estado</label>
                          <input
                            type="text"
                            name="estado"
                            value={formData.estado}
                            onChange={handleInputChange}
                            placeholder="MT"
                            maxLength={2}
                            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-amber-500"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Dados de Trabalho */}
                    <div className="border-t border-zinc-800 pt-4 mt-4">
                      <h3 className="text-gray-300 font-semibold mb-4">Dados de Trabalho</h3>
                      
                      {/* RG */}
                      <div className="mb-4">
                        <label className="block text-gray-300 mb-2">RG</label>
                        <input
                          type="text"
                          name="rg"
                          value={formData.rg}
                          onChange={handleInputChange}
                          className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-amber-500"
                        />
                      </div>

                      {/* Data de Admissão e Tipo de Contrato */}
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-gray-300 mb-2">Data de Admissão *</label>
                          <input
                            type="date"
                            name="data_admissao"
                            value={formData.data_admissao}
                            onChange={handleInputChange}
                            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-amber-500"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-gray-300 mb-2">Tipo de Contrato *</label>
                          <select
                            name="tipo_contrato"
                            value={formData.tipo_contrato}
                            onChange={handleInputChange}
                            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-amber-500"
                            required
                          >
                            <option value="CLT">CLT</option>
                            <option value="PJ">PJ</option>
                          </select>
                        </div>
                      </div>

                      {/* Salário e NIS */}
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-gray-300 mb-2">Salário</label>
                          <input
                            type="text"
                            name="salario"
                            value={formData.salario}
                            onChange={handleInputChange}
                            placeholder="0,00"
                            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-amber-500"
                          />
                        </div>
                        <div>
                          <label className="block text-gray-300 mb-2">NIS</label>
                          <input
                            type="text"
                            name="nis"
                            value={formData.nis}
                            onChange={handleInputChange}
                            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-amber-500"
                          />
                        </div>
                      </div>

                      {/* Foto do Funcionário */}
                      <div className="mb-4">
                        <label className="block text-gray-300 mb-2">Foto do Funcionário</label>
                        <div className="flex items-center gap-6">
                          <div className="relative">
                            {fotoPreview ? (
                              <img
                                src={fotoPreview}
                                alt="Foto do funcionário"
                                className="w-24 h-24 rounded-full object-cover border-4 border-amber-500/30"
                              />
                            ) : (
                              <div className="w-24 h-24 rounded-full bg-zinc-800 border-4 border-amber-500/30 flex items-center justify-center">
                                <UserCog className="w-12 h-12 text-gray-500" />
                              </div>
                            )}
                          </div>
                          
                          <div className="flex-1">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleFotoChange}
                              className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-amber-500 file:text-white hover:file:bg-amber-600 file:cursor-pointer cursor-pointer"
                            />
                            <p className="text-xs text-gray-500 mt-2">
                              Formatos aceitos: JPG, PNG, GIF. Tamanho máximo: 5MB
                            </p>
                          </div>
                        </div>
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
                      <label className="text-gray-300">Funcionário Ativo</label>
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
                        onClick={salvarFuncionario}
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
    </>
  )
}

