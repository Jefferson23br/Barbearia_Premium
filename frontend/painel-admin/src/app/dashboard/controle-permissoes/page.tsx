'use client'

import { useState, useEffect } from 'react'
import { motion } from 'motion/react'
import * as Icons from 'lucide-react'
import { Settings, User, Eye, Edit, Trash2, Save, X, Check, AlertCircle } from 'lucide-react'

interface Funcionario {
  id: string
  nome_completo: string
  email: string
  tipo_usuario: string
}

interface Permissoes {
  // Dashboard (apenas ver)
  dashboard_ver: boolean

  // Agenda
  agenda_ver: boolean
  agenda_editar: boolean
  agenda_excluir: boolean

  // Lançamento de Venda
  lancamento_venda_ver: boolean
  lancamento_venda_editar: boolean
  lancamento_venda_excluir: boolean

  // Lançamento de Despesa
  lancamento_despesa_ver: boolean
  lancamento_despesa_editar: boolean
  lancamento_despesa_excluir: boolean

  // Receitas
  receitas_ver: boolean
  receitas_editar: boolean
  receitas_excluir: boolean

  // Despesas
  despesas_ver: boolean
  despesas_editar: boolean
  despesas_excluir: boolean

  // Faturamento
  faturamento_ver: boolean
  faturamento_editar: boolean
  faturamento_excluir: boolean

  // Gerenciamento de Usuários
  usuarios_ver: boolean
  usuarios_editar: boolean
  usuarios_excluir: boolean

  // Gerenciamento de Funcionários
  funcionarios_ver: boolean
  funcionarios_editar: boolean
  funcionarios_excluir: boolean

  // Controle de Acessos (apenas ver)
  controle_acessos_ver: boolean

  // Controle de Logs (apenas ver)
  controle_logs_ver: boolean

  // Help Desk
  help_desk_ver: boolean
  help_desk_editar: boolean
  help_desk_excluir: boolean

  // Serviços
  servicos_ver: boolean
  servicos_editar: boolean
  servicos_excluir: boolean

  // Controle de Permissão (apenas Master)
  controle_permissoes_ver: boolean
  controle_permissoes_editar: boolean
  controle_permissoes_excluir: boolean

  // Emissão de NFe
  emissao_nfe_ver: boolean
  emissao_nfe_editar: boolean
  emissao_nfe_excluir: boolean

  // Emissão de Relatórios
  emissao_relatorios_ver: boolean
  emissao_relatorios_editar: boolean
  emissao_relatorios_excluir: boolean

  // Integração de APIs Externas
  integracao_apis_ver: boolean
  integracao_apis_editar: boolean
  integracao_apis_excluir: boolean

  // Habilitar API
  habilitar_api_ver: boolean
  habilitar_api_editar: boolean
  habilitar_api_excluir: boolean

  // Configurações
  configuracoes_ver: boolean
  configuracoes_editar: boolean
  configuracoes_excluir: boolean

  // Produtos
  produtos_ver: boolean
  produtos_editar: boolean
  produtos_excluir: boolean

  // Estoque
  estoque_ver: boolean
  estoque_editar: boolean
  estoque_excluir: boolean

  // Caixas
  caixas_ver: boolean
  caixas_editar: boolean
  caixas_excluir: boolean

  // Vendas
  vendas_ver: boolean
  vendas_editar: boolean
  vendas_excluir: boolean

  // Balanço Demonstrativo
  balanco_demonstrativo_ver: boolean
  balanco_demonstrativo_editar: boolean
  balanco_demonstrativo_excluir: boolean

  // CRM
  crm_ver: boolean
  crm_editar: boolean
  crm_excluir: boolean

  // Cupons e Fidelidades
  cupons_fidelidades_ver: boolean
  cupons_fidelidades_editar: boolean
  cupons_fidelidades_excluir: boolean

  // Serviços de Integração
  servicos_integracao_ver: boolean
  servicos_integracao_editar: boolean
  servicos_integracao_excluir: boolean

  // Assinaturas
  assinaturas_ver: boolean
  assinaturas_editar: boolean
  assinaturas_excluir: boolean
}

const permissoesPadrao: Permissoes = {
  dashboard_ver: false,
  agenda_ver: false,
  agenda_editar: false,
  agenda_excluir: false,
  lancamento_venda_ver: false,
  lancamento_venda_editar: false,
  lancamento_venda_excluir: false,
  lancamento_despesa_ver: false,
  lancamento_despesa_editar: false,
  lancamento_despesa_excluir: false,
  receitas_ver: false,
  receitas_editar: false,
  receitas_excluir: false,
  despesas_ver: false,
  despesas_editar: false,
  despesas_excluir: false,
  faturamento_ver: false,
  faturamento_editar: false,
  faturamento_excluir: false,
  usuarios_ver: false,
  usuarios_editar: false,
  usuarios_excluir: false,
  funcionarios_ver: false,
  funcionarios_editar: false,
  funcionarios_excluir: false,
  controle_acessos_ver: false,
  controle_logs_ver: false,
  help_desk_ver: false,
  help_desk_editar: false,
  help_desk_excluir: false,
    servicos_ver: false,
    servicos_editar: false,
    servicos_excluir: false,
    controle_permissoes_ver: false,
    controle_permissoes_editar: false,
    controle_permissoes_excluir: false,
    emissao_nfe_ver: false,
    emissao_nfe_editar: false,
    emissao_nfe_excluir: false,
    emissao_relatorios_ver: false,
    emissao_relatorios_editar: false,
    emissao_relatorios_excluir: false,
    integracao_apis_ver: false,
    integracao_apis_editar: false,
    integracao_apis_excluir: false,
    habilitar_api_ver: false,
    habilitar_api_editar: false,
    habilitar_api_excluir: false,
    configuracoes_ver: false,
    configuracoes_editar: false,
    configuracoes_excluir: false,
    produtos_ver: false,
    produtos_editar: false,
    produtos_excluir: false,
    estoque_ver: false,
    estoque_editar: false,
    estoque_excluir: false,
    caixas_ver: false,
    caixas_editar: false,
    caixas_excluir: false,
    vendas_ver: false,
    vendas_editar: false,
    vendas_excluir: false,
    balanco_demonstrativo_ver: false,
    balanco_demonstrativo_editar: false,
    balanco_demonstrativo_excluir: false,
    crm_ver: false,
    crm_editar: false,
    crm_excluir: false,
    cupons_fidelidades_ver: false,
    cupons_fidelidades_editar: false,
    cupons_fidelidades_excluir: false,
    servicos_integracao_ver: false,
    servicos_integracao_editar: false,
    servicos_integracao_excluir: false,
    assinaturas_ver: false,
    assinaturas_editar: false,
    assinaturas_excluir: false,
  }

interface ModuloPermissao {
  id: string
  nome: string
  apenasVer: boolean
  permissoes: {
    ver?: boolean
    editar?: boolean
    excluir?: boolean
  }
}

interface ModuloBackend {
  id: string
  nome: string
  icone: string
  ordem: number
  itens: Array<{
    id: string
    label: string
    path: string
    icon: string
    ordem: number
  }>
}

interface ModuloPermissaoAgrupado {
  id: string
  nome: string
  icone: string
  ordem: number
  itens: ModuloPermissao[]
}

export default function ControlePermissoesPage() {
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([])
  const [funcionarioSelecionado, setFuncionarioSelecionado] = useState<string>('')
  const [permissoes, setPermissoes] = useState<Permissoes>(permissoesPadrao)
  const [permissoesOriginais, setPermissoesOriginais] = useState<Permissoes>(permissoesPadrao)
  const [modulosBackend, setModulosBackend] = useState<ModuloBackend[]>([])
  const [loading, setLoading] = useState(false)
  const [salvando, setSalvando] = useState(false)
  const [mensagem, setMensagem] = useState<{ tipo: 'sucesso' | 'erro' | null; texto: string }>({ tipo: null, texto: '' })

  // Carregar lista de funcionários e módulos
  useEffect(() => {
    carregarFuncionarios()
    carregarModulos()
  }, [])
  
  const carregarModulos = async () => {
    try {
      const apiUrl = 'https://api.protesecapilarcuiaba.com.br'
      const response = await fetch(`${apiUrl}/api/v1/modulos`)
      if (response.ok) {
        const data = await response.json()
        setModulosBackend(data.modulos || [])
      }
    } catch (error) {
      console.error('Erro ao carregar módulos:', error)
    }
  }

  // Carregar permissões quando selecionar funcionário
  useEffect(() => {
    if (funcionarioSelecionado) {
      carregarPermissoes(funcionarioSelecionado)
    } else {
      setPermissoes(permissoesPadrao)
      setPermissoesOriginais(permissoesPadrao)
    }
  }, [funcionarioSelecionado])

  const carregarFuncionarios = async () => {
    setLoading(true)
    try {
      const apiUrl = 'https://api.protesecapilarcuiaba.com.br'
      
      // Buscar tipo do usuário logado para filtrar corretamente
      const adminData = localStorage.getItem('admin')
      const admin = adminData ? JSON.parse(adminData) : null
      const tipoUsuario = admin?.tipo_usuario || 'master'
      
      // Adicionar tipo_usuario na query para o backend filtrar corretamente
      const response = await fetch(`${apiUrl}/api/v1/funcionarios?tipo_usuario=${tipoUsuario}`)
      
      if (!response.ok) {
        throw new Error('Erro ao carregar funcionários')
      }

      const data = await response.json()
      setFuncionarios(data.funcionarios || [])
    } catch (error: any) {
      console.error('Erro ao carregar funcionários:', error)
      setMensagem({ tipo: 'erro', texto: error.message || 'Erro ao carregar funcionários' })
    } finally {
      setLoading(false)
    }
  }

  const carregarPermissoes = async (usuarioId: string) => {
    setLoading(true)
    try {
      const apiUrl = 'https://api.protesecapilarcuiaba.com.br'
      const response = await fetch(`${apiUrl}/api/v1/permissoes/${usuarioId}`)
      
      if (!response.ok) {
        throw new Error('Erro ao carregar permissões')
      }

      const data = await response.json()
      const permissoesCarregadas = data.permissoes || permissoesPadrao
      setPermissoes(permissoesCarregadas)
      setPermissoesOriginais(permissoesCarregadas)
    } catch (error: any) {
      console.error('Erro ao carregar permissões:', error)
      setMensagem({ tipo: 'erro', texto: error.message || 'Erro ao carregar permissões' })
      setPermissoes(permissoesPadrao)
      setPermissoesOriginais(permissoesPadrao)
    } finally {
      setLoading(false)
    }
  }

  const atualizarPermissao = (chave: keyof Permissoes, valor: boolean) => {
    setPermissoes((prev) => ({ ...prev, [chave]: valor }))
  }

  const salvarPermissoes = async () => {
    if (!funcionarioSelecionado) {
      setMensagem({ tipo: 'erro', texto: 'Selecione um funcionário primeiro' })
      return
    }

    setSalvando(true)
    try {
      const apiUrl = 'https://api.protesecapilarcuiaba.com.br'
      
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
      
      const response = await fetch(`${apiUrl}/api/v1/permissoes/${funcionarioSelecionado}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(permissoes),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Erro ao salvar permissões')
      }

      setPermissoesOriginais(permissoes)
      setMensagem({ tipo: 'sucesso', texto: 'Permissões salvas com sucesso!' })
      setTimeout(() => setMensagem({ tipo: null, texto: '' }), 3000)
      
      // Recarregar permissões do backend para garantir sincronização
      await carregarPermissoes(funcionarioSelecionado)
      
      // Disparar evento para recarregar permissões em outros componentes
      // (admin já foi declarado acima, então podemos reutilizar)
      if (admin) {
        window.dispatchEvent(new CustomEvent('permissoes-atualizadas'))
      }
    } catch (error: any) {
      console.error('Erro ao salvar permissões:', error)
      setMensagem({ tipo: 'erro', texto: error.message || 'Erro ao salvar permissões' })
    } finally {
      setSalvando(false)
    }
  }

  const temAlteracoes = JSON.stringify(permissoes) !== JSON.stringify(permissoesOriginais)

  // Função para obter permissão de um item
  const obterPermissao = (itemId: string): { ver?: boolean; editar?: boolean; excluir?: boolean } => {
    const chaveVer = `${itemId}_ver` as keyof Permissoes
    const chaveEditar = `${itemId}_editar` as keyof Permissoes
    const chaveExcluir = `${itemId}_excluir` as keyof Permissoes
    
    // Itens que só têm permissão de ver
    const apenasVer = ['dashboard', 'controle_acessos', 'controle_logs']
    
    if (apenasVer.includes(itemId)) {
      return {
        ver: permissoes[chaveVer] as boolean,
      }
    }
    
    return {
      ver: permissoes[chaveVer] as boolean,
      editar: permissoes[chaveEditar] as boolean,
      excluir: permissoes[chaveExcluir] as boolean,
    }
  }

  // Agrupar permissões por módulos do backend
  const modulosPermissoesAgrupados: ModuloPermissaoAgrupado[] = modulosBackend.map((modulo) => {
    const itens: ModuloPermissao[] = modulo.itens.map((item) => {
      const permissoesItem = obterPermissao(item.id)
      const apenasVer = Object.keys(permissoesItem).length === 1 && permissoesItem.ver !== undefined
      
      return {
        id: item.id,
        nome: item.label,
        apenasVer,
        permissoes: permissoesItem,
      }
    })

    return {
      id: modulo.id,
      nome: modulo.nome,
      icone: modulo.icone,
      ordem: modulo.ordem,
      itens,
    }
  }).filter(modulo => modulo.itens.length > 0) // Filtrar módulos vazios

  // Ordenar módulos por ordem
  modulosPermissoesAgrupados.sort((a, b) => a.ordem - b.ordem)

  // Coletar todos os IDs de itens que estão nos módulos
  const itensNosModulos = new Set<string>()
  modulosPermissoesAgrupados.forEach((modulo) => {
    modulo.itens.forEach((item) => {
      itensNosModulos.add(item.id)
    })
  })

  // Itens que realmente não estão em módulos (apenas os que aparecem individualmente no sidebar)
  const itensIndividuaisPermissoes: ModuloPermissao[] = [
    {
      id: 'dashboard',
      nome: 'Dashboard',
      apenasVer: true,
      permissoes: {
        ver: permissoes.dashboard_ver,
      },
    },
    {
      id: 'agenda',
      nome: 'Agenda',
      apenasVer: false,
      permissoes: {
        ver: permissoes.agenda_ver,
        editar: permissoes.agenda_editar,
        excluir: permissoes.agenda_excluir,
      },
    },
    {
      id: 'lancamento_venda',
      nome: 'Lançamento de Venda',
      apenasVer: false,
      permissoes: {
        ver: permissoes.lancamento_venda_ver,
        editar: permissoes.lancamento_venda_editar,
        excluir: permissoes.lancamento_venda_excluir,
      },
    },
    {
      id: 'crm',
      nome: 'CRM',
      apenasVer: false,
      permissoes: {
        ver: permissoes.crm_ver,
        editar: permissoes.crm_editar,
        excluir: permissoes.crm_excluir,
      },
    },
    {
      id: 'help_desk',
      nome: 'Help Desk',
      apenasVer: false,
      permissoes: {
        ver: permissoes.help_desk_ver,
        editar: permissoes.help_desk_editar,
        excluir: permissoes.help_desk_excluir,
      },
    },
    {
      id: 'configuracoes',
      nome: 'Configurações',
      apenasVer: false,
      permissoes: {
        ver: permissoes.configuracoes_ver,
        editar: permissoes.configuracoes_editar,
        excluir: permissoes.configuracoes_excluir,
      },
    },
  ].filter((item) => !itensNosModulos.has(item.id)) // Filtrar itens que já estão nos módulos

  const funcionario = funcionarios.find((f) => f.id === funcionarioSelecionado)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-2">
          <Settings className="h-8 w-8 text-amber-500" />
          Controle de Permissão
        </h1>
        <p className="text-gray-400 mt-1">Configure as permissões de cada funcionário</p>
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

      {/* Seleção de Funcionário */}
      <div className="bg-zinc-900 border border-amber-500/20 rounded-lg p-6">
        <label className="block text-gray-300 mb-3 font-medium">Selecione o Funcionário</label>
        <select
          value={funcionarioSelecionado}
          onChange={(e) => setFuncionarioSelecionado(e.target.value)}
          disabled={loading}
          className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <option value="">-- Selecione um funcionário --</option>
          {funcionarios.map((func) => (
            <option key={func.id} value={func.id}>
              {func.nome_completo} - {func.email} ({func.tipo_usuario})
            </option>
          ))}
        </select>
        {funcionario && (
          <div className="mt-4 p-4 bg-zinc-800 rounded-lg">
            <div className="flex items-center gap-3">
              <User className="h-5 w-5 text-amber-500" />
              <div>
                <p className="text-white font-medium">{funcionario.nome_completo}</p>
                <p className="text-gray-400 text-sm">{funcionario.email}</p>
                <p className="text-gray-500 text-xs capitalize mt-1">Nível: {funcionario.tipo_usuario}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Permissões */}
      {funcionarioSelecionado && (
        <div className="bg-zinc-900 border border-amber-500/20 rounded-lg p-6">
          <h2 className="text-xl font-bold text-white mb-6">Permissões do Funcionário</h2>

          {/* Itens Individuais */}
          {itensIndividuaisPermissoes.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-white mb-4">Itens Individuais</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {itensIndividuaisPermissoes.map((modulo) => (
                  <motion.div
                    key={modulo.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-zinc-800 border border-zinc-700 rounded-lg p-4"
                  >
                    <h3 className="text-white font-semibold mb-4">{modulo.nome}</h3>
                    <div className="space-y-3">
                      {modulo.apenasVer ? (
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={modulo.permissoes.ver || false}
                            onChange={(e) => {
                              const chave = `${modulo.id}_ver` as keyof Permissoes
                              atualizarPermissao(chave, e.target.checked)
                            }}
                            className="w-4 h-4 rounded border-zinc-700 bg-zinc-900 text-amber-500 focus:ring-2 focus:ring-amber-500 cursor-pointer"
                          />
                          <div className="flex items-center gap-2 text-gray-300">
                            <Eye className="h-4 w-4" />
                            <span>Visualizar</span>
                          </div>
                        </label>
                      ) : (
                        <>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={modulo.permissoes.ver || false}
                              onChange={(e) => {
                                const chave = `${modulo.id}_ver` as keyof Permissoes
                                atualizarPermissao(chave, e.target.checked)
                                if (!e.target.checked) {
                                  atualizarPermissao(`${modulo.id}_editar` as keyof Permissoes, false)
                                  atualizarPermissao(`${modulo.id}_excluir` as keyof Permissoes, false)
                                }
                              }}
                              className="w-4 h-4 rounded border-zinc-700 bg-zinc-900 text-amber-500 focus:ring-2 focus:ring-amber-500 cursor-pointer"
                            />
                            <div className="flex items-center gap-2 text-gray-300">
                              <Eye className="h-4 w-4" />
                              <span>Visualizar</span>
                            </div>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={modulo.permissoes.editar || false}
                              disabled={!modulo.permissoes.ver}
                              onChange={(e) => {
                                const chave = `${modulo.id}_editar` as keyof Permissoes
                                atualizarPermissao(chave, e.target.checked)
                              }}
                              className="w-4 h-4 rounded border-zinc-700 bg-zinc-900 text-amber-500 focus:ring-2 focus:ring-amber-500 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                            />
                            <div className="flex items-center gap-2 text-gray-300">
                              <Edit className="h-4 w-4" />
                              <span>Editar</span>
                            </div>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={modulo.permissoes.excluir || false}
                              disabled={!modulo.permissoes.ver}
                              onChange={(e) => {
                                const chave = `${modulo.id}_excluir` as keyof Permissoes
                                atualizarPermissao(chave, e.target.checked)
                              }}
                              className="w-4 h-4 rounded border-zinc-700 bg-zinc-900 text-amber-500 focus:ring-2 focus:ring-amber-500 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                            />
                            <div className="flex items-center gap-2 text-gray-300">
                              <Trash2 className="h-4 w-4" />
                              <span>Excluir</span>
                            </div>
                          </label>
                        </>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Módulos Agrupados */}
          {modulosPermissoesAgrupados.map((moduloGrupo) => {
            const ModuloIcon = (Icons as any)[moduloGrupo.icone] || Settings
            return (
              <div key={moduloGrupo.id} className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <ModuloIcon className="h-5 w-5 text-amber-500" />
                  <h3 className="text-lg font-semibold text-white">{moduloGrupo.nome}</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {moduloGrupo.itens.map((modulo) => (
              <motion.div
                key={modulo.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-zinc-800 border border-zinc-700 rounded-lg p-4"
              >
                <h3 className="text-white font-semibold mb-4">{modulo.nome}</h3>
                <div className="space-y-3">
                  {modulo.apenasVer ? (
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={modulo.permissoes.ver || false}
                        onChange={(e) => {
                          const chave = `${modulo.id}_ver` as keyof Permissoes
                          atualizarPermissao(chave, e.target.checked)
                        }}
                        className="w-4 h-4 rounded border-zinc-700 bg-zinc-900 text-amber-500 focus:ring-2 focus:ring-amber-500 cursor-pointer"
                      />
                      <div className="flex items-center gap-2 text-gray-300">
                        <Eye className="h-4 w-4" />
                        <span>Visualizar</span>
                      </div>
                    </label>
                  ) : (
                    <>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={modulo.permissoes.ver || false}
                          onChange={(e) => {
                            const chave = `${modulo.id}_ver` as keyof Permissoes
                            atualizarPermissao(chave, e.target.checked)
                            // Se desmarcar "ver", desmarca editar e excluir
                            if (!e.target.checked) {
                              atualizarPermissao(`${modulo.id}_editar` as keyof Permissoes, false)
                              atualizarPermissao(`${modulo.id}_excluir` as keyof Permissoes, false)
                            }
                          }}
                          className="w-4 h-4 rounded border-zinc-700 bg-zinc-900 text-amber-500 focus:ring-2 focus:ring-amber-500 cursor-pointer"
                        />
                        <div className="flex items-center gap-2 text-gray-300">
                          <Eye className="h-4 w-4" />
                          <span>Visualizar</span>
                        </div>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={modulo.permissoes.editar || false}
                          disabled={!modulo.permissoes.ver}
                          onChange={(e) => {
                            const chave = `${modulo.id}_editar` as keyof Permissoes
                            atualizarPermissao(chave, e.target.checked)
                          }}
                          className="w-4 h-4 rounded border-zinc-700 bg-zinc-900 text-amber-500 focus:ring-2 focus:ring-amber-500 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                        <div className="flex items-center gap-2 text-gray-300">
                          <Edit className="h-4 w-4" />
                          <span>Editar</span>
                        </div>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={modulo.permissoes.excluir || false}
                          disabled={!modulo.permissoes.ver}
                          onChange={(e) => {
                            const chave = `${modulo.id}_excluir` as keyof Permissoes
                            atualizarPermissao(chave, e.target.checked)
                          }}
                          className="w-4 h-4 rounded border-zinc-700 bg-zinc-900 text-amber-500 focus:ring-2 focus:ring-amber-500 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                        <div className="flex items-center gap-2 text-gray-300">
                          <Trash2 className="h-4 w-4" />
                          <span>Excluir</span>
                        </div>
                      </label>
                    </>
                  )}
                </div>
              </motion.div>
                  ))}
                </div>
              </div>
            )
          })}

          {/* Botões de Ação */}
          <div className="mt-6 flex items-center gap-4">
            <button
              onClick={salvarPermissoes}
              disabled={salvando || !temAlteracoes}
              className="flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-600 text-black rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              <Save className="h-5 w-5" />
              {salvando ? 'Salvando...' : 'Salvar Permissões'}
            </button>
            {temAlteracoes && (
              <button
                onClick={() => {
                  setPermissoes(permissoesOriginais)
                  setMensagem({ tipo: null, texto: '' })
                }}
                disabled={salvando}
                className="flex items-center gap-2 px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <X className="h-5 w-5" />
                Cancelar
              </button>
            )}
            {!temAlteracoes && (
              <p className="text-gray-400 text-sm">Nenhuma alteração pendente</p>
            )}
          </div>
        </div>
      )}

      {/* Aviso quando não há funcionário selecionado */}
      {!funcionarioSelecionado && (
        <div className="bg-zinc-900 border border-amber-500/20 rounded-lg p-12 text-center">
          <User className="h-16 w-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 text-lg">Selecione um funcionário para configurar as permissões</p>
        </div>
      )}
    </div>
  )
}

