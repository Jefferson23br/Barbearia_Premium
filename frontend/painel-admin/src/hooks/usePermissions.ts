'use client'

import { useState, useEffect } from 'react'

export interface PermissoesUsuario {
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

  // Vendas (usado pelo backend, mapeado de lancamento_venda no frontend)
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
}

export function usePermissions() {
  const [permissoes, setPermissoes] = useState<PermissoesUsuario | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    carregarPermissoes()
    
    // Listener para recarregar permissões quando forem atualizadas
    const handlePermissoesAtualizadas = () => {
      carregarPermissoes()
    }
    
    window.addEventListener('permissoes-atualizadas', handlePermissoesAtualizadas)
    
    return () => {
      window.removeEventListener('permissoes-atualizadas', handlePermissoesAtualizadas)
    }
  }, [])

  const carregarPermissoes = async () => {
    try {
      const adminData = localStorage.getItem('admin')
      if (!adminData) {
        setLoading(false)
        return
      }

      const admin = JSON.parse(adminData)
      
      // Se for Master, tem todas as permissões
      if (admin.tipo_usuario === 'master') {
        // Master sempre tem todas as permissões, mas ainda busca do backend
        const permissoesMaster = criarPermissoesMaster()
        setPermissoes(permissoesMaster)
        setLoading(false)
        // Buscar do backend em background para manter sincronizado
        buscarPermissoesBackend(admin.id)
        return
      }

      // SEMPRE buscar do backend primeiro (não usar localStorage como fonte primária)
      await buscarPermissoesBackend(admin.id)
    } catch (error) {
      console.error('Erro ao carregar permissões:', error)
      setPermissoes(null)
    } finally {
      setLoading(false)
    }
  }

  const buscarPermissoesBackend = async (adminId: string) => {
    try {
      const apiUrl = 'https://api.protesecapilarcuiaba.com.br'
      const response = await fetch(`${apiUrl}/api/v1/permissoes/${adminId}`, {
        cache: 'no-store', // Sempre buscar do servidor, não usar cache
      })
      
      if (response.ok) {
        const data = await response.json()
        const permissoes = data.permissoes || {}
        
        // Garantir que todas as permissões existam (preencher com false se não existirem)
        const permissoesCompletas = criarPermissoesVazias()
        Object.keys(permissoesCompletas).forEach((key) => {
          if (permissoes[key] !== undefined) {
            permissoesCompletas[key as keyof PermissoesUsuario] = permissoes[key]
          }
        })
        
        setPermissoes(permissoesCompletas)
        // Salvar no localStorage apenas como cache (não como fonte primária)
        localStorage.setItem('permissoes', JSON.stringify(permissoesCompletas))
      } else {
        // Se não encontrar no backend, criar permissões vazias (todas false)
        const permissoesVazias = criarPermissoesVazias()
        setPermissoes(permissoesVazias)
        localStorage.setItem('permissoes', JSON.stringify(permissoesVazias))
      }
    } catch (error) {
      console.error('Erro ao buscar permissões do backend:', error)
      // Em caso de erro, criar permissões vazias
      const permissoesVazias = criarPermissoesVazias()
      setPermissoes(permissoesVazias)
    }
  }

  const temPermissao = (modulo: string, acao: 'ver' | 'editar' | 'excluir' = 'ver'): boolean => {
    if (!permissoes) return false

    const chave = `${modulo}_${acao}` as keyof PermissoesUsuario
    return permissoes[chave] === true
  }

  const podeAcessar = (modulo: string): boolean => {
    // Mapear lancamento_venda para vendas no backend
    if (modulo === 'lancamento_venda') {
      return temPermissao('vendas', 'ver') || temPermissao('lancamento_venda', 'ver')
    }
    return temPermissao(modulo, 'ver')
  }

  const podeEditar = (modulo: string): boolean => {
    // Mapear lancamento_venda para vendas no backend
    if (modulo === 'lancamento_venda') {
      return temPermissao('vendas', 'editar') || temPermissao('lancamento_venda', 'editar')
    }
    return temPermissao(modulo, 'editar')
  }

  const podeExcluir = (modulo: string): boolean => {
    // Mapear lancamento_venda para vendas no backend
    if (modulo === 'lancamento_venda') {
      return temPermissao('vendas', 'excluir') || temPermissao('lancamento_venda', 'excluir')
    }
    return temPermissao(modulo, 'excluir')
  }

  return {
    permissoes,
    loading,
    temPermissao,
    podeAcessar,
    podeEditar,
    podeExcluir,
    recarregar: carregarPermissoes,
  }
}

// Criar permissões completas para Master
function criarPermissoesMaster(): PermissoesUsuario {
  return {
    dashboard_ver: true,
    agenda_ver: true,
    agenda_editar: true,
    agenda_excluir: true,
    lancamento_venda_ver: true,
    lancamento_venda_editar: true,
    lancamento_venda_excluir: true,
    lancamento_despesa_ver: true,
    lancamento_despesa_editar: true,
    lancamento_despesa_excluir: true,
    receitas_ver: true,
    receitas_editar: true,
    receitas_excluir: true,
    despesas_ver: true,
    despesas_editar: true,
    despesas_excluir: true,
    faturamento_ver: true,
    faturamento_editar: true,
    faturamento_excluir: true,
    usuarios_ver: true,
    usuarios_editar: true,
    usuarios_excluir: true,
    funcionarios_ver: true,
    funcionarios_editar: true,
    funcionarios_excluir: true,
    controle_acessos_ver: true,
    controle_logs_ver: true,
    help_desk_ver: true,
    help_desk_editar: true,
    help_desk_excluir: true,
    servicos_ver: true,
    servicos_editar: true,
    servicos_excluir: true,
    controle_permissoes_ver: true,
    controle_permissoes_editar: true,
    controle_permissoes_excluir: true,
    emissao_nfe_ver: true,
    emissao_nfe_editar: true,
    emissao_nfe_excluir: true,
    emissao_relatorios_ver: true,
    emissao_relatorios_editar: true,
    emissao_relatorios_excluir: true,
    integracao_apis_ver: true,
    integracao_apis_editar: true,
    integracao_apis_excluir: true,
    habilitar_api_ver: true,
    habilitar_api_editar: true,
    habilitar_api_excluir: true,
    configuracoes_ver: true,
    configuracoes_editar: true,
    configuracoes_excluir: true,
    produtos_ver: true,
    produtos_editar: true,
    produtos_excluir: true,
    estoque_ver: true,
    estoque_editar: true,
    estoque_excluir: true,
    caixas_ver: true,
    caixas_editar: true,
    caixas_excluir: true,
    vendas_ver: true,
    vendas_editar: true,
    vendas_excluir: true,
    balanco_demonstrativo_ver: true,
    balanco_demonstrativo_editar: true,
    balanco_demonstrativo_excluir: true,
    crm_ver: true,
    crm_editar: true,
    crm_excluir: true,
    cupons_fidelidades_ver: true,
    cupons_fidelidades_editar: true,
    cupons_fidelidades_excluir: true,
  }
}

// Criar permissões vazias (todas false) - usado quando não há permissões no banco
function criarPermissoesVazias(): PermissoesUsuario {
  return {
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
  }
}

