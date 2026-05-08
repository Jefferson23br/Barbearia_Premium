'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'motion/react'
import { User, Mail, Lock, FileText, MapPin, Save, Loader2, AlertCircle, CheckCircle2, Eye, EyeOff, ArrowLeft } from 'lucide-react'
import { ImageCropModal } from '@/components/admin/ImageCropModal'
import { getApiBaseUrl } from '@/lib/api'

interface Usuario {
  id: string
  nome_completo: string
  email: string
  login?: string
  cpf?: string | null
  rg?: string | null
  telefone?: string | null
  rua?: string | null
  numero?: string | null
  complemento?: string | null
  bairro?: string | null
  cidade?: string | null
  estado?: string | null
  cep?: string | null
  foto_url?: string | null
}

export default function PerfilPage() {
  const router = useRouter()
  const [usuario, setUsuario] = useState<Usuario | null>(null)
  const [loading, setLoading] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [mostrarSenha, setMostrarSenha] = useState(false)
  const [fotoPreview, setFotoPreview] = useState<string | null>(null)
  const [fotoFile, setFotoFile] = useState<File | null>(null)
  const [fotoOriginal, setFotoOriginal] = useState<string | null>(null)
  const [mostrarCrop, setMostrarCrop] = useState(false)
  const [mensagem, setMensagem] = useState<{ tipo: 'sucesso' | 'erro' | null; texto: string }>({ tipo: null, texto: '' })

  const [formData, setFormData] = useState({
    nome_completo: '',
    email: '',
    login: '',
    senha: '',
    cpf: '',
    rg: '',
    telefone: '',
    rua: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    estado: '',
    cep: '',
  })

  useEffect(() => {
    carregarUsuario()
  }, [])

  const carregarUsuario = async () => {
    try {
      const adminData = localStorage.getItem('admin')
      if (!adminData) {
        router.push('/')
        return
      }

      const admin = JSON.parse(adminData)
      const apiUrl = getApiBaseUrl()
      const response = await fetch(`${apiUrl}/api/v1/funcionarios/${admin.id}`, {
        headers: {
          'x-user-id': admin.id,
          'x-user-tipo': admin.tipo_usuario,
        },
      })

      if (response.ok) {
        const data = await response.json()
        console.log('[PERFIL] Dados recebidos do backend:', data)
        const usuarioData = data.funcionario || data
        console.log('[PERFIL] Dados do usuário:', usuarioData)
        setUsuario(usuarioData)
        setFotoPreview(usuarioData.foto_url || null) // Carregar foto do usuário
        setFormData({
          nome_completo: usuarioData.nome_completo || '',
          email: usuarioData.email || '',
          login: usuarioData.email || '',
          senha: '',
          cpf: usuarioData.cpf || '',
          rg: usuarioData.rg || '',
          telefone: '',
          rua: usuarioData.rua || '',
          numero: usuarioData.numero || '',
          complemento: usuarioData.complemento || '',
          bairro: usuarioData.bairro || '',
          cidade: usuarioData.cidade || '',
          estado: usuarioData.estado || '',
          cep: usuarioData.cep || '',
        })
        console.log('[PERFIL] FormData preenchido:', {
          nome_completo: usuarioData.nome_completo || '',
          email: usuarioData.email || '',
          cpf: usuarioData.cpf || '',
          rg: usuarioData.rg || '',
          rua: usuarioData.rua || '',
        })
      } else {
        const errorData = await response.json().catch(() => ({}))
        console.error('[PERFIL] Erro ao carregar:', response.status, errorData)
        setMensagem({ tipo: 'erro', texto: errorData.error || `Erro ao carregar dados do usuário (${response.status})` })
      }
    } catch (error: any) {
      console.error('[PERFIL] Erro ao carregar usuário:', error)
      setMensagem({ tipo: 'erro', texto: error.message || 'Erro ao carregar dados do usuário' })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSalvando(true)
    setMensagem({ tipo: null, texto: '' })

    try {
      const adminData = localStorage.getItem('admin')
      if (!adminData) {
        router.push('/')
        return
      }

      const admin = JSON.parse(adminData)
      const apiUrl = getApiBaseUrl()

      // Preparar FormData para enviar arquivo se houver
      const formDataToSend = new FormData()
      formDataToSend.append('nome_completo', formData.nome_completo)
      formDataToSend.append('email', formData.email)
      if (formData.cpf) formDataToSend.append('cpf', formData.cpf)
      if (formData.rg) formDataToSend.append('rg', formData.rg)
      if (formData.rua) formDataToSend.append('rua', formData.rua)
      if (formData.numero) formDataToSend.append('numero', formData.numero)
      if (formData.complemento) formDataToSend.append('complemento', formData.complemento)
      if (formData.bairro) formDataToSend.append('bairro', formData.bairro)
      if (formData.cidade) formDataToSend.append('cidade', formData.cidade)
      if (formData.estado) formDataToSend.append('estado', formData.estado)
      if (formData.cep) formDataToSend.append('cep', formData.cep)

      // Só incluir senha se foi preenchida
      if (formData.senha && formData.senha.trim() !== '') {
        formDataToSend.append('senha', formData.senha)
      }

      // Adicionar foto se houver
      if (fotoFile) {
        formDataToSend.append('foto', fotoFile)
      }

      const response = await fetch(`${apiUrl}/api/v1/funcionarios/${admin.id}`, {
        method: 'PUT',
        headers: {
          'x-user-id': admin.id,
          'x-user-tipo': admin.tipo_usuario,
        },
        body: formDataToSend,
      })

      if (response.ok) {
        const data = await response.json()
        const usuarioAtualizado = data.funcionario || data
        
        // Atualizar localStorage
        const adminAtualizado = {
          ...admin,
          nome_completo: usuarioAtualizado.nome_completo,
          email: usuarioAtualizado.email,
          cpf: usuarioAtualizado.cpf,
          rg: usuarioAtualizado.rg,
          rua: usuarioAtualizado.rua,
          numero: usuarioAtualizado.numero,
          complemento: usuarioAtualizado.complemento,
          bairro: usuarioAtualizado.bairro,
          cidade: usuarioAtualizado.cidade,
          estado: usuarioAtualizado.estado,
          cep: usuarioAtualizado.cep,
          foto_url: usuarioAtualizado.foto_url,
        }
        localStorage.setItem('admin', JSON.stringify(adminAtualizado))
        
        setUsuario(usuarioAtualizado)
        setFotoPreview(usuarioAtualizado.foto_url || null)
        setFotoFile(null)
        setFormData({ ...formData, senha: '' }) // Limpar campo de senha
        setMensagem({ tipo: 'sucesso', texto: 'Perfil atualizado com sucesso!' })
        
        // Forçar atualização do estado do admin no DashboardLayout
        // Disparar evento customizado para atualizar o header
        window.dispatchEvent(new CustomEvent('adminUpdated', { detail: adminAtualizado }))
        
        // Atualizar a página após 2 segundos
        setTimeout(() => {
          window.location.reload()
        }, 2000)
      } else {
        const errorData = await response.json()
        setMensagem({ tipo: 'erro', texto: errorData.error || 'Erro ao atualizar perfil' })
      }
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error)
      setMensagem({ tipo: 'erro', texto: 'Erro ao atualizar perfil' })
    } finally {
      setSalvando(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
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
        setFotoOriginal(imageUrl)
        setMostrarCrop(true)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleCropComplete = (croppedImage: string) => {
    setFotoPreview(croppedImage)
    
    // Converter a imagem recortada para File
    fetch(croppedImage)
      .then(res => res.blob())
      .then(blob => {
        const file = new File([blob], 'foto.jpg', { type: 'image/jpeg' })
        setFotoFile(file)
      })
    
    setFotoOriginal(null)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto mb-4"></div>
          <p className="text-white">Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Modal de Crop */}
      {fotoOriginal && (
        <ImageCropModal
          image={fotoOriginal}
          isOpen={mostrarCrop}
          onClose={() => {
            setMostrarCrop(false)
            setFotoOriginal(null)
          }}
          onCropComplete={handleCropComplete}
          aspect={1}
          cropShape="round"
          size={{ width: 200, height: 200 }}
        />
      )}

      <div className="min-h-screen bg-zinc-950 p-4 lg:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-400 hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Voltar</span>
          </button>
          <h1 className="text-3xl font-bold text-white mb-2">Meu Perfil</h1>
          <p className="text-gray-400">Gerencie suas informações pessoais</p>
        </div>

        {/* Mensagem */}
        {mensagem.tipo && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
              mensagem.tipo === 'sucesso'
                ? 'bg-green-500/10 border border-green-500/20 text-green-400'
                : 'bg-red-500/10 border border-red-500/20 text-red-400'
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

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Foto do Perfil */}
          <div className="bg-zinc-900 rounded-lg p-6 border border-amber-500/20">
            <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
              <User className="h-5 w-5 text-amber-500" />
              Foto do Perfil
            </h2>
            
            <div className="flex items-center gap-6">
              <div className="relative">
                {fotoPreview ? (
                  <img
                    src={fotoPreview}
                    alt="Foto do perfil"
                    className="w-32 h-32 rounded-full object-cover border-4 border-amber-500/30"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-zinc-800 border-4 border-amber-500/30 flex items-center justify-center">
                    <User className="w-16 h-16 text-gray-500" />
                  </div>
                )}
              </div>
              
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Selecionar Foto
                </label>
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

          <div className="bg-zinc-900 rounded-lg p-6 border border-amber-500/20">
            <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
              <User className="h-5 w-5 text-amber-500" />
              Informações Pessoais
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Nome Completo */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  name="nome_completo"
                  value={formData.nome_completo}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 transition-colors"
                  placeholder="Digite seu nome completo"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <Mail className="h-4 w-4 inline mr-1" />
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 transition-colors"
                  placeholder="seu@email.com"
                />
              </div>

              {/* Login (somente leitura - usa email) */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <User className="h-4 w-4 inline mr-1" />
                  Login
                </label>
                <input
                  type="text"
                  value={formData.email}
                  disabled
                  className="w-full px-4 py-2 bg-zinc-800/50 border border-zinc-700 rounded-lg text-gray-400 cursor-not-allowed"
                  placeholder="O login é o mesmo do email"
                />
                <p className="text-xs text-gray-500 mt-1">O login é o mesmo do email</p>
              </div>

              {/* CPF */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <FileText className="h-4 w-4 inline mr-1" />
                  CPF
                </label>
                <input
                  type="text"
                  name="cpf"
                  value={formData.cpf}
                  onChange={handleChange}
                  maxLength={14}
                  className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 transition-colors"
                  placeholder="000.000.000-00"
                />
              </div>

              {/* RG */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <FileText className="h-4 w-4 inline mr-1" />
                  RG
                </label>
                <input
                  type="text"
                  name="rg"
                  value={formData.rg}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 transition-colors"
                  placeholder="Digite seu RG"
                />
              </div>


              {/* Senha */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <Lock className="h-4 w-4 inline mr-1" />
                  Nova Senha
                </label>
                <div className="relative">
                  <input
                    type={mostrarSenha ? 'text' : 'password'}
                    name="senha"
                    value={formData.senha}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 transition-colors pr-10"
                    placeholder="Deixe em branco para não alterar"
                  />
                  <button
                    type="button"
                    onClick={() => setMostrarSenha(!mostrarSenha)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  >
                    {mostrarSenha ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">Deixe em branco para manter a senha atual</p>
              </div>
            </div>
          </div>

          {/* Endereço */}
          <div className="bg-zinc-900 rounded-lg p-6 border border-amber-500/20">
            <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
              <MapPin className="h-5 w-5 text-amber-500" />
              Endereço
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* CEP */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">CEP</label>
                <input
                  type="text"
                  name="cep"
                  value={formData.cep}
                  onChange={handleChange}
                  maxLength={9}
                  className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 transition-colors"
                  placeholder="00000-000"
                />
              </div>

              {/* Rua */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">Rua</label>
                <input
                  type="text"
                  name="rua"
                  value={formData.rua}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 transition-colors"
                  placeholder="Digite o nome da rua"
                />
              </div>

              {/* Número */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Número</label>
                <input
                  type="text"
                  name="numero"
                  value={formData.numero}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 transition-colors"
                  placeholder="000"
                />
              </div>

              {/* Complemento */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Complemento</label>
                <input
                  type="text"
                  name="complemento"
                  value={formData.complemento}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 transition-colors"
                  placeholder="Apto, Bloco, etc."
                />
              </div>

              {/* Bairro */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Bairro</label>
                <input
                  type="text"
                  name="bairro"
                  value={formData.bairro}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 transition-colors"
                  placeholder="Digite o bairro"
                />
              </div>

              {/* Cidade */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Cidade</label>
                <input
                  type="text"
                  name="cidade"
                  value={formData.cidade}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 transition-colors"
                  placeholder="Digite a cidade"
                />
              </div>

              {/* Estado */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Estado</label>
                <input
                  type="text"
                  name="estado"
                  value={formData.estado}
                  onChange={handleChange}
                  maxLength={2}
                  className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 transition-colors"
                  placeholder="UF"
                />
              </div>
            </div>
          </div>

          {/* Botões */}
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-2 bg-zinc-800 text-white rounded-lg hover:bg-zinc-700 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={salvando}
              className="px-6 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {salvando ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="h-5 w-5" />
                  Salvar Alterações
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
    </>
  )
}

