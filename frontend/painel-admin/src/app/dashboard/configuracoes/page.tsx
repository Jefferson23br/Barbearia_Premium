'use client'

import { useState, useEffect } from 'react'
import { motion } from 'motion/react'
import { Cog, Save, Building2, MapPin, Clock, Mail, Phone, AlertCircle, Check, Calendar, Plus, Trash2, Edit2, X } from 'lucide-react'
import { usePermissions } from '@/hooks/usePermissions'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface Configuracoes {
  id?: string
  // Dados da Empresa
  nome_empresarial?: string
  nome_fantasia?: string
  cnpj?: string
  cnae?: string
  cnae_secundario?: string
  inscricao_estadual?: string
  
  // Endereço
  endereco_rua?: string
  endereco_numero?: string
  endereco_complemento?: string
  endereco_bairro?: string
  endereco_cidade?: string
  endereco_estado?: string
  endereco_cep?: string
  
  // Contato
  email_contato?: string
  telefone_principal?: string
  telefone_secundario?: string
  whatsapp?: string
  
  // Horários (Segunda a Domingo)
  segunda_abertura?: string
  segunda_fechamento?: string
  segunda_ativo?: boolean
  terca_abertura?: string
  terca_fechamento?: string
  terca_ativo?: boolean
  quarta_abertura?: string
  quarta_fechamento?: string
  quarta_ativo?: boolean
  quinta_abertura?: string
  quinta_fechamento?: string
  quinta_ativo?: boolean
  sexta_abertura?: string
  sexta_fechamento?: string
  sexta_ativo?: boolean
  sabado_abertura?: string
  sabado_fechamento?: string
  sabado_ativo?: boolean
  domingo_abertura?: string
  domingo_fechamento?: string
  domingo_ativo?: boolean
  
  // Configurações de Agendamento
  intervalo_agendamento?: number
  tempo_antecedencia_agendamento?: number
  tempo_cancelamento_agendamento?: number
}

const diasSemana = [
  { key: 'segunda', label: 'Segunda-feira', abertura: 'segunda_abertura', fechamento: 'segunda_fechamento', ativo: 'segunda_ativo' },
  { key: 'terca', label: 'Terça-feira', abertura: 'terca_abertura', fechamento: 'terca_fechamento', ativo: 'terca_ativo' },
  { key: 'quarta', label: 'Quarta-feira', abertura: 'quarta_abertura', fechamento: 'quarta_fechamento', ativo: 'quarta_ativo' },
  { key: 'quinta', label: 'Quinta-feira', abertura: 'quinta_abertura', fechamento: 'quinta_fechamento', ativo: 'quinta_ativo' },
  { key: 'sexta', label: 'Sexta-feira', abertura: 'sexta_abertura', fechamento: 'sexta_fechamento', ativo: 'sexta_ativo' },
  { key: 'sabado', label: 'Sábado', abertura: 'sabado_abertura', fechamento: 'sabado_fechamento', ativo: 'sabado_ativo' },
  { key: 'domingo', label: 'Domingo', abertura: 'domingo_abertura', fechamento: 'domingo_fechamento', ativo: 'domingo_ativo' },
]

export default function ConfiguracoesPage() {
  const [configuracoes, setConfiguracoes] = useState<Configuracoes>({})
  const [loading, setLoading] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [mensagem, setMensagem] = useState<{ tipo: 'sucesso' | 'erro' | null; texto: string }>({ tipo: null, texto: '' })
  const [abaAtiva, setAbaAtiva] = useState('empresa')
  const { podeEditar } = usePermissions()
  
  // Estados para fechamentos especiais
  const [fechamentos, setFechamentos] = useState<any[]>([])
  const [carregandoFechamentos, setCarregandoFechamentos] = useState(false)
  const [dialogFechamentoAberto, setDialogFechamentoAberto] = useState(false)
  const [fechamentoEditando, setFechamentoEditando] = useState<any>(null)
  const [formFechamento, setFormFechamento] = useState({
    data_fechamento: '',
    descricao: '',
    is_active: true,
  })

  useEffect(() => {
    carregarConfiguracoes()
    if (abaAtiva === 'fechamentos') {
      carregarFechamentos()
    }
  }, [abaAtiva])

  const carregarConfiguracoes = async () => {
    setLoading(true)
    try {
      const apiUrl = 'https://api6.actusconsultoria.com.br'
      const response = await fetch(`${apiUrl}/api/v1/configuracoes`)

      if (!response.ok) {
        throw new Error('Erro ao carregar configurações')
      }

      const data = await response.json()
      setConfiguracoes(data.configuracoes || {})
    } catch (error: any) {
      console.error('Erro ao carregar configurações:', error)
      setMensagem({ tipo: 'erro', texto: error.message || 'Erro ao carregar configurações' })
    } finally {
      setLoading(false)
    }
  }

  const atualizarCampo = (campo: keyof Configuracoes, valor: any) => {
    setConfiguracoes((prev) => ({ ...prev, [campo]: valor }))
  }

  const salvarConfiguracoes = async () => {
    if (!podeEditar('configuracoes')) {
      setMensagem({ tipo: 'erro', texto: 'Você não tem permissão para editar configurações' })
      return
    }

    setSalvando(true)
    try {
      const apiUrl = 'https://api6.actusconsultoria.com.br'
      
      const adminData = localStorage.getItem('admin')
      const admin = adminData ? JSON.parse(adminData) : null
      
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      }
      if (admin?.id) {
        headers['x-user-id'] = admin.id
        headers['x-user-tipo'] = admin.tipo_usuario || 'administrativo'
      }

      const response = await fetch(`${apiUrl}/api/v1/configuracoes`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(configuracoes),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Erro ao salvar configurações')
      }

      const data = await response.json()
      setConfiguracoes(data.configuracoes || {})
      setMensagem({ tipo: 'sucesso', texto: 'Configurações salvas com sucesso!' })
      setTimeout(() => setMensagem({ tipo: null, texto: '' }), 3000)
    } catch (error: any) {
      console.error('Erro ao salvar configurações:', error)
      setMensagem({ tipo: 'erro', texto: error.message || 'Erro ao salvar configurações' })
    } finally {
      setSalvando(false)
    }
  }

  const formatarTelefone = (valor: string) => {
    const apenasNumeros = valor.replace(/\D/g, '')
    if (apenasNumeros.length <= 10) {
      return apenasNumeros.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3')
    }
    return apenasNumeros.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
  }

  const formatarCNPJ = (valor: string) => {
    const apenasNumeros = valor.replace(/\D/g, '')
    return apenasNumeros.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
  }

  const formatarCEP = (valor: string) => {
    const apenasNumeros = valor.replace(/\D/g, '')
    return apenasNumeros.replace(/(\d{5})(\d{3})/, '$1-$2')
  }

  // Funções para gerenciar fechamentos especiais
  const carregarFechamentos = async () => {
    setCarregandoFechamentos(true)
    try {
      const apiUrl = 'https://api6.actusconsultoria.com.br'
      const response = await fetch(`${apiUrl}/api/v1/fechamentos-especiais`)

      if (!response.ok) {
        throw new Error('Erro ao carregar fechamentos')
      }

      const data = await response.json()
      setFechamentos(data.fechamentos || [])
    } catch (error: any) {
      console.error('Erro ao carregar fechamentos:', error)
      setMensagem({ tipo: 'erro', texto: error.message || 'Erro ao carregar fechamentos' })
    } finally {
      setCarregandoFechamentos(false)
    }
  }

  const abrirDialogFechamento = (fechamento?: any) => {
    if (fechamento) {
      setFechamentoEditando(fechamento)
      setFormFechamento({
        data_fechamento: fechamento.data_fechamento,
        descricao: fechamento.descricao,
        is_active: fechamento.is_active,
      })
    } else {
      setFechamentoEditando(null)
      setFormFechamento({
        data_fechamento: '',
        descricao: '',
        is_active: true,
      })
    }
    setDialogFechamentoAberto(true)
  }

  const fecharDialogFechamento = () => {
    setDialogFechamentoAberto(false)
    setFechamentoEditando(null)
    setFormFechamento({
      data_fechamento: '',
      descricao: '',
      is_active: true,
    })
  }

  const salvarFechamento = async () => {
    if (!formFechamento.data_fechamento || !formFechamento.descricao.trim()) {
      setMensagem({ tipo: 'erro', texto: 'Preencha todos os campos obrigatórios' })
      return
    }

    try {
      const apiUrl = 'https://api6.actusconsultoria.com.br'
      const adminData = localStorage.getItem('admin')
      const admin = adminData ? JSON.parse(adminData) : null

      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      }
      if (admin?.id) {
        headers['x-user-id'] = admin.id
        headers['x-user-tipo'] = admin.tipo_usuario || 'administrativo'
      }

      let response
      if (fechamentoEditando) {
        // Atualizar
        response = await fetch(`${apiUrl}/api/v1/fechamentos-especiais/${fechamentoEditando.id}`, {
          method: 'PUT',
          headers,
          body: JSON.stringify(formFechamento),
        })
      } else {
        // Criar
        response = await fetch(`${apiUrl}/api/v1/fechamentos-especiais`, {
          method: 'POST',
          headers,
          body: JSON.stringify(formFechamento),
        })
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Erro ao salvar fechamento')
      }

      setMensagem({ tipo: 'sucesso', texto: fechamentoEditando ? 'Fechamento atualizado com sucesso!' : 'Fechamento criado com sucesso!' })
      setTimeout(() => setMensagem({ tipo: null, texto: '' }), 3000)
      fecharDialogFechamento()
      carregarFechamentos()
    } catch (error: any) {
      console.error('Erro ao salvar fechamento:', error)
      setMensagem({ tipo: 'erro', texto: error.message || 'Erro ao salvar fechamento' })
    }
  }

  const excluirFechamento = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este fechamento?')) {
      return
    }

    try {
      const apiUrl = 'https://api6.actusconsultoria.com.br'
      const adminData = localStorage.getItem('admin')
      const admin = adminData ? JSON.parse(adminData) : null

      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      }
      if (admin?.id) {
        headers['x-user-id'] = admin.id
        headers['x-user-tipo'] = admin.tipo_usuario || 'administrativo'
      }

      const response = await fetch(`${apiUrl}/api/v1/fechamentos-especiais/${id}`, {
        method: 'DELETE',
        headers,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Erro ao excluir fechamento')
      }

      setMensagem({ tipo: 'sucesso', texto: 'Fechamento excluído com sucesso!' })
      setTimeout(() => setMensagem({ tipo: null, texto: '' }), 3000)
      carregarFechamentos()
    } catch (error: any) {
      console.error('Erro ao excluir fechamento:', error)
      setMensagem({ tipo: 'erro', texto: error.message || 'Erro ao excluir fechamento' })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Carregando configurações...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-4 md:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-2">
          <Cog className="h-6 w-6 md:h-8 md:w-8 text-amber-500" />
          Configurações do Sistema
        </h1>
        <p className="text-gray-400 mt-1 text-sm md:text-base">Gerencie todas as configurações do sistema</p>
      </div>

      {/* Mensagem */}
      {mensagem.tipo && (
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
            {mensagem.tipo === 'sucesso' ? (
              <Check className="h-5 w-5" />
            ) : (
              <AlertCircle className="h-5 w-5" />
            )}
            <span>{mensagem.texto}</span>
          </div>
        </motion.div>
      )}

      {/* Abas */}
      <div className="bg-zinc-900 border border-amber-500/20 rounded-lg overflow-hidden">
        <div className="flex flex-wrap border-b border-zinc-700">
          {[
            { id: 'empresa', label: 'Dados da Empresa', icon: Building2 },
            { id: 'endereco', label: 'Endereço', icon: MapPin },
            { id: 'contato', label: 'Contato', icon: Phone },
            { id: 'horarios', label: 'Horários de Funcionamento', icon: Clock },
            { id: 'agendamento', label: 'Agendamento', icon: Clock },
            { id: 'fechamentos', label: 'Fechamentos Especiais', icon: Calendar },
          ].map((aba) => {
            const Icon = aba.icon
            return (
              <button
                key={aba.id}
                onClick={() => setAbaAtiva(aba.id)}
                className={`flex items-center gap-2 px-4 md:px-6 py-3 text-sm md:text-base font-medium transition-colors ${
                  abaAtiva === aba.id
                    ? 'bg-amber-500/10 text-amber-500 border-b-2 border-amber-500'
                    : 'text-gray-400 hover:text-white hover:bg-zinc-800'
                }`}
              >
                <Icon className="h-4 w-4 md:h-5 md:w-5" />
                <span className="hidden sm:inline">{aba.label}</span>
              </button>
            )
          })}
        </div>

        <div className="p-4 md:p-6">
          {/* Aba: Dados da Empresa */}
          {abaAtiva === 'empresa' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 text-sm mb-1">Nome Empresarial (Razão Social)</label>
                  <input
                    type="text"
                    value={configuracoes.nome_empresarial || ''}
                    onChange={(e) => atualizarCampo('nome_empresarial', e.target.value)}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-amber-500"
                    placeholder="Nome Empresarial"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 text-sm mb-1">Nome Fantasia</label>
                  <input
                    type="text"
                    value={configuracoes.nome_fantasia || ''}
                    onChange={(e) => atualizarCampo('nome_fantasia', e.target.value)}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-amber-500"
                    placeholder="Nome Fantasia"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 text-sm mb-1">CNPJ</label>
                  <input
                    type="text"
                    value={configuracoes.cnpj || ''}
                    onChange={(e) => {
                      const formatado = formatarCNPJ(e.target.value)
                      atualizarCampo('cnpj', formatado)
                    }}
                    maxLength={18}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-amber-500"
                    placeholder="00.000.000/0000-00"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 text-sm mb-1">CNAE Principal</label>
                  <input
                    type="text"
                    value={configuracoes.cnae || ''}
                    onChange={(e) => atualizarCampo('cnae', e.target.value)}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-amber-500"
                    placeholder="0000-0/00"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 text-sm mb-1">CNAEs Secundários</label>
                  <input
                    type="text"
                    value={configuracoes.cnae_secundario || ''}
                    onChange={(e) => atualizarCampo('cnae_secundario', e.target.value)}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-amber-500"
                    placeholder="Separados por vírgula"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 text-sm mb-1">Inscrição Estadual</label>
                  <input
                    type="text"
                    value={configuracoes.inscricao_estadual || ''}
                    onChange={(e) => atualizarCampo('inscricao_estadual', e.target.value)}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-amber-500"
                    placeholder="Inscrição Estadual"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Aba: Endereço */}
          {abaAtiva === 'endereco' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-gray-300 text-sm mb-1">Rua</label>
                  <input
                    type="text"
                    value={configuracoes.endereco_rua || ''}
                    onChange={(e) => atualizarCampo('endereco_rua', e.target.value)}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-amber-500"
                    placeholder="Nome da rua"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 text-sm mb-1">Número</label>
                  <input
                    type="text"
                    value={configuracoes.endereco_numero || ''}
                    onChange={(e) => atualizarCampo('endereco_numero', e.target.value)}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-amber-500"
                    placeholder="Número"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 text-sm mb-1">CEP</label>
                  <input
                    type="text"
                    value={configuracoes.endereco_cep || ''}
                    onChange={(e) => {
                      const formatado = formatarCEP(e.target.value)
                      atualizarCampo('endereco_cep', formatado)
                    }}
                    maxLength={9}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-amber-500"
                    placeholder="00000-000"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 text-sm mb-1">Complemento</label>
                  <input
                    type="text"
                    value={configuracoes.endereco_complemento || ''}
                    onChange={(e) => atualizarCampo('endereco_complemento', e.target.value)}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-amber-500"
                    placeholder="Complemento"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 text-sm mb-1">Bairro</label>
                  <input
                    type="text"
                    value={configuracoes.endereco_bairro || ''}
                    onChange={(e) => atualizarCampo('endereco_bairro', e.target.value)}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-amber-500"
                    placeholder="Bairro"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 text-sm mb-1">Cidade</label>
                  <input
                    type="text"
                    value={configuracoes.endereco_cidade || ''}
                    onChange={(e) => atualizarCampo('endereco_cidade', e.target.value)}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-amber-500"
                    placeholder="Cidade"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 text-sm mb-1">Estado (UF)</label>
                  <input
                    type="text"
                    value={configuracoes.endereco_estado || ''}
                    onChange={(e) => atualizarCampo('endereco_estado', e.target.value.toUpperCase())}
                    maxLength={2}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-amber-500"
                    placeholder="MT"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Aba: Contato */}
          {abaAtiva === 'contato' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 text-sm mb-1">Email de Contato</label>
                  <input
                    type="email"
                    value={configuracoes.email_contato || ''}
                    onChange={(e) => atualizarCampo('email_contato', e.target.value)}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-amber-500"
                    placeholder="contato@empresa.com.br"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 text-sm mb-1">Telefone Principal</label>
                  <input
                    type="text"
                    value={configuracoes.telefone_principal || ''}
                    onChange={(e) => {
                      const formatado = formatarTelefone(e.target.value)
                      atualizarCampo('telefone_principal', formatado)
                    }}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-amber-500"
                    placeholder="(00) 00000-0000"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 text-sm mb-1">Telefone Secundário</label>
                  <input
                    type="text"
                    value={configuracoes.telefone_secundario || ''}
                    onChange={(e) => {
                      const formatado = formatarTelefone(e.target.value)
                      atualizarCampo('telefone_secundario', formatado)
                    }}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-amber-500"
                    placeholder="(00) 00000-0000"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 text-sm mb-1">WhatsApp</label>
                  <input
                    type="text"
                    value={configuracoes.whatsapp || ''}
                    onChange={(e) => {
                      const formatado = formatarTelefone(e.target.value)
                      atualizarCampo('whatsapp', formatado)
                    }}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-amber-500"
                    placeholder="(00) 00000-0000"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Aba: Horários de Funcionamento */}
          {abaAtiva === 'horarios' && (
            <div className="space-y-4">
              <p className="text-gray-400 text-sm mb-4">Configure os horários de funcionamento para cada dia da semana</p>
              <div className="space-y-3">
                {diasSemana.map((dia) => (
                  <div key={dia.key} className="bg-zinc-800 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <label className="flex items-center gap-2 text-white font-medium">
                        <input
                          type="checkbox"
                          checked={configuracoes[dia.ativo as keyof Configuracoes] as boolean || false}
                          onChange={(e) => atualizarCampo(dia.ativo as keyof Configuracoes, e.target.checked)}
                          className="w-4 h-4 rounded border-zinc-700 bg-zinc-900 text-amber-500 focus:ring-2 focus:ring-amber-500 cursor-pointer"
                        />
                        <span>{dia.label}</span>
                      </label>
                    </div>
                    {configuracoes[dia.ativo as keyof Configuracoes] && (
                      <div className="grid grid-cols-2 gap-4 mt-3">
                        <div>
                          <label className="block text-gray-300 text-sm mb-1">Abertura</label>
                          <input
                            type="time"
                            value={configuracoes[dia.abertura as keyof Configuracoes] as string || ''}
                            onChange={(e) => atualizarCampo(dia.abertura as keyof Configuracoes, e.target.value)}
                            className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-amber-500"
                          />
                        </div>
                        <div>
                          <label className="block text-gray-300 text-sm mb-1">Fechamento</label>
                          <input
                            type="time"
                            value={configuracoes[dia.fechamento as keyof Configuracoes] as string || ''}
                            onChange={(e) => atualizarCampo(dia.fechamento as keyof Configuracoes, e.target.value)}
                            className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-amber-500"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Aba: Agendamento */}
          {abaAtiva === 'agendamento' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-gray-300 text-sm mb-1">Intervalo entre Agendamentos (minutos)</label>
                  <input
                    type="number"
                    value={configuracoes.intervalo_agendamento || 30}
                    onChange={(e) => atualizarCampo('intervalo_agendamento', parseInt(e.target.value) || 30)}
                    min={15}
                    step={15}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                  <p className="text-gray-500 text-xs mt-1">Ex: 30 minutos entre cada agendamento</p>
                </div>
                <div>
                  <label className="block text-gray-300 text-sm mb-1">Tempo Mínimo para Agendar (minutos)</label>
                  <input
                    type="number"
                    value={configuracoes.tempo_antecedencia_agendamento || 60}
                    onChange={(e) => atualizarCampo('tempo_antecedencia_agendamento', parseInt(e.target.value) || 60)}
                    min={0}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                  <p className="text-gray-500 text-xs mt-1">Tempo mínimo antes do horário para agendar</p>
                </div>
                <div>
                  <label className="block text-gray-300 text-sm mb-1">Tempo Mínimo para Cancelar (minutos)</label>
                  <input
                    type="number"
                    value={configuracoes.tempo_cancelamento_agendamento || 120}
                    onChange={(e) => atualizarCampo('tempo_cancelamento_agendamento', parseInt(e.target.value) || 120)}
                    min={0}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                  <p className="text-gray-500 text-xs mt-1">Tempo mínimo antes do horário para cancelar</p>
                </div>
              </div>
            </div>
          )}

          {/* Aba: Fechamentos Especiais */}
          {abaAtiva === 'fechamentos' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-white">Dias de Fechamento Especiais</h3>
                  <p className="text-gray-400 text-sm mt-1">Gerencie feriados, férias e outros dias de fechamento</p>
                </div>
                {podeEditar('configuracoes') && (
                  <button
                    onClick={() => abrirDialogFechamento()}
                    className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-black rounded-lg transition-colors font-medium"
                  >
                    <Plus className="h-4 w-4" />
                    Novo Fechamento
                  </button>
                )}
              </div>

              {carregandoFechamentos ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
                </div>
              ) : fechamentos.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Nenhum fechamento especial cadastrado</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {fechamentos.map((fechamento) => (
                    <div
                      key={fechamento.id}
                      className={`bg-zinc-800 rounded-lg p-4 border ${
                        fechamento.is_active
                          ? 'border-amber-500/30'
                          : 'border-zinc-700 opacity-60'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <Calendar className="h-5 w-5 text-amber-500" />
                            <div>
                              <p className="text-white font-medium">
                                {fechamento.data_fechamento ? (
                                  (() => {
                                    try {
                                      // A data pode vir como string ISO ou como date do PostgreSQL
                                      let dataString = fechamento.data_fechamento
                                      
                                      // Se vier como objeto Date ou ISO string completa, extrair apenas a parte da data
                                      if (dataString.includes('T')) {
                                        dataString = dataString.split('T')[0] // Pega apenas YYYY-MM-DD
                                      }
                                      
                                      // Parse seguro: YYYY-MM-DD
                                      const [ano, mes, dia] = dataString.split('-').map(Number)
                                      const data = new Date(ano, mes - 1, dia)
                                      
                                      if (isNaN(data.getTime())) {
                                        return dataString // Retorna a string original se inválida
                                      }
                                      
                                      // Formato brasileiro: 10/12/2025
                                      return format(data, "dd/MM/yyyy", { locale: ptBR })
                                    } catch (error) {
                                      console.error('Erro ao formatar data:', error, fechamento.data_fechamento)
                                      // Tentar exibir pelo menos a parte da data se for ISO
                                      if (fechamento.data_fechamento.includes('T')) {
                                        const partes = fechamento.data_fechamento.split('T')[0].split('-')
                                        if (partes.length === 3) {
                                          return `${partes[2]}/${partes[1]}/${partes[0]}`
                                        }
                                      }
                                      return fechamento.data_fechamento
                                    }
                                  })()
                                ) : (
                                  'Data inválida'
                                )}
                              </p>
                              <p className="text-gray-400 text-sm">{fechamento.descricao}</p>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {!fechamento.is_active && (
                            <span className="px-2 py-1 bg-zinc-700 text-gray-400 text-xs rounded">Inativo</span>
                          )}
                          {podeEditar('configuracoes') && (
                            <>
                              <button
                                onClick={() => abrirDialogFechamento(fechamento)}
                                className="p-2 text-amber-500 hover:bg-amber-500/10 rounded transition-colors"
                                title="Editar"
                              >
                                <Edit2 className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => excluirFechamento(fechamento.id)}
                                className="p-2 text-red-500 hover:bg-red-500/10 rounded transition-colors"
                                title="Excluir"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      </div>

      {/* Botão Salvar */}
      {abaAtiva !== 'fechamentos' && (
        <div className="flex justify-end">
          <button
            onClick={salvarConfiguracoes}
            disabled={salvando || !podeEditar('configuracoes')}
            className="flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-600 text-black rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            <Save className="h-5 w-5" />
            {salvando ? 'Salvando...' : 'Salvar Configurações'}
          </button>
        </div>
      )}

      {/* Dialog para criar/editar fechamento */}
      {dialogFechamentoAberto && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-zinc-900 border border-amber-500/20 rounded-lg p-6 w-full max-w-md"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">
                {fechamentoEditando ? 'Editar Fechamento' : 'Novo Fechamento'}
              </h3>
              <button
                onClick={fecharDialogFechamento}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-gray-300 text-sm mb-1">Data do Fechamento *</label>
                <input
                  type="date"
                  value={formFechamento.data_fechamento}
                  onChange={(e) => setFormFechamento({ ...formFechamento, data_fechamento: e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-300 text-sm mb-1">Descrição *</label>
                <input
                  type="text"
                  value={formFechamento.descricao}
                  onChange={(e) => setFormFechamento({ ...formFechamento, descricao: e.target.value })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-amber-500"
                  placeholder="Ex: Feriado - Natal, Férias coletivas, etc."
                  required
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formFechamento.is_active}
                  onChange={(e) => setFormFechamento({ ...formFechamento, is_active: e.target.checked })}
                  className="w-4 h-4 rounded border-zinc-700 bg-zinc-900 text-amber-500 focus:ring-2 focus:ring-amber-500 cursor-pointer"
                />
                <label htmlFor="is_active" className="text-gray-300 text-sm cursor-pointer">
                  Fechamento ativo
                </label>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={fecharDialogFechamento}
                className="flex-1 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={salvarFechamento}
                disabled={!podeEditar('configuracoes')}
                className="flex-1 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-black rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {fechamentoEditando ? 'Atualizar' : 'Criar'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}

