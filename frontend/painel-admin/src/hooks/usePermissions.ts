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

  // Controle de Permissão (apenas Master)
  controle_permissoes_ver: boolean
  controle_permissoes_editar: boolean
  controle_permissoes_excluir: boolean
}

export function usePermissions() {
  const [permissoes, setPermissoes] = useState<PermissoesUsuario | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    carregarPermissoes()
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
        setPermissoes(criarPermissoesMaster())
        setLoading(false)
        return
      }

      // Primeiro, verificar se já tem permissões no localStorage
      const permissoesSalvas = localStorage.getItem('permissoes')
      if (permissoesSalvas) {
        try {
          const permissoes = JSON.parse(permissoesSalvas)
          setPermissoes(permissoes)
          setLoading(false)
          // Também buscar do backend para atualizar (sem bloquear UI)
          buscarPermissoesBackend(admin.id)
          return
        } catch (error) {
          console.error('Erro ao ler permissões do localStorage:', error)
        }
      }

      // Buscar permissões do backend
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
      const response = await fetch(`${apiUrl}/api/v1/permissoes/${adminId}`)
      
      if (response.ok) {
        const data = await response.json()
        const permissoes = data.permissoes || {}
        setPermissoes(permissoes)
        // Salvar no localStorage para uso futuro
        localStorage.setItem('permissoes', JSON.stringify(permissoes))
      } else {
        // Se não encontrar, usar permissões padrão baseadas no tipo
        const adminData = localStorage.getItem('admin')
        if (adminData) {
          const admin = JSON.parse(adminData)
          const permissoesPadrao = criarPermissoesPorTipo(admin.tipo_usuario)
          setPermissoes(permissoesPadrao)
          localStorage.setItem('permissoes', JSON.stringify(permissoesPadrao))
        }
      }
    } catch (error) {
      console.error('Erro ao buscar permissões do backend:', error)
    }
  }

  const temPermissao = (modulo: string, acao: 'ver' | 'editar' | 'excluir' = 'ver'): boolean => {
    if (!permissoes) return false

    const chave = `${modulo}_${acao}` as keyof PermissoesUsuario
    return permissoes[chave] === true
  }

  const podeAcessar = (modulo: string): boolean => {
    return temPermissao(modulo, 'ver')
  }

  const podeEditar = (modulo: string): boolean => {
    return temPermissao(modulo, 'editar')
  }

  const podeExcluir = (modulo: string): boolean => {
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
    controle_permissoes_ver: true,
    controle_permissoes_editar: true,
    controle_permissoes_excluir: true,
  }
}

// Criar permissões padrão por tipo de usuário
function criarPermissoesPorTipo(tipo: string): PermissoesUsuario {
  const padrao: PermissoesUsuario = {
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
    controle_permissoes_ver: false,
    controle_permissoes_editar: false,
    controle_permissoes_excluir: false,
  }

  // Proprietário tem acesso padrão a mais coisas
  if (tipo === 'proprietario') {
    padrao.dashboard_ver = true
    padrao.agenda_ver = true
    padrao.agenda_editar = true
    padrao.agenda_excluir = true
    padrao.lancamento_venda_ver = true
    padrao.lancamento_venda_editar = true
    padrao.lancamento_venda_excluir = true
    padrao.lancamento_despesa_ver = true
    padrao.lancamento_despesa_editar = true
    padrao.lancamento_despesa_excluir = true
    padrao.receitas_ver = true
    padrao.receitas_editar = true
    padrao.receitas_excluir = true
    padrao.despesas_ver = true
    padrao.despesas_editar = true
    padrao.despesas_excluir = true
    padrao.faturamento_ver = true
    padrao.faturamento_editar = true
    padrao.faturamento_excluir = true
    padrao.usuarios_ver = true
    padrao.usuarios_editar = true
    padrao.usuarios_excluir = true
    padrao.funcionarios_ver = true
    padrao.funcionarios_editar = true
    padrao.funcionarios_excluir = true
    padrao.controle_acessos_ver = true
    padrao.controle_logs_ver = true
    padrao.help_desk_ver = true
    padrao.help_desk_editar = true
    padrao.help_desk_excluir = true
  }

  // Funcionário tem acesso limitado
  if (tipo === 'funcionario') {
    padrao.dashboard_ver = true
    padrao.agenda_ver = true
    padrao.lancamento_venda_ver = true
    padrao.lancamento_despesa_ver = true
    padrao.receitas_ver = true
    padrao.despesas_ver = true
    padrao.faturamento_ver = true
    padrao.help_desk_ver = true
  }

  return padrao
}

