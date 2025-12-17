'use client'

import { useState, useEffect, useCallback } from 'react'
import { UsersRound, Search, Calendar, ShoppingCart, FileText, DollarSign, MessageSquare, Plus, Edit, Trash2, Loader2, AlertCircle, CheckCircle2, X, Save, User } from 'lucide-react'
import { usePermissions } from '@/hooks/usePermissions'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
import { Textarea } from '@/components/ui/textarea'

interface Cliente {
  id: string
  nome_completo: string
  email: string
  cpf: string
  foto_url?: string
  is_active: boolean
}

interface Agendamento {
  id: string
  data_agendamento: string
  hora_inicio: string
  hora_fim: string
  status: string
  valor_servico: number | string
  servico_nome: string
  funcionario_nome: string
  observacoes?: string
}

interface Venda {
  id: string
  ticket: string
  data_venda: string
  valor_total: number | string
  valor_liquido: number | string
  funcionario_nome: string
  status: string
}

interface Receita {
  id: string
  ticket_venda: string
  data_emissao: string
  data_vencimento: string
  data_pagamento?: string
  valor_vencimento: number | string
  valor_pago: number | string
  status: string
  caixa_nome?: string
  venda_ticket?: string
}

interface Relacionamento {
  id: string
  data_interacao: string
  tipo_interacao: string
  descricao: string
  observacoes?: string
  funcionario_nome: string
  created_at: string
}

export default function CRMPage() {
  const { podeAcessar, podeEditar, podeExcluir } = usePermissions()
  const [searchTerm, setSearchTerm] = useState('')
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [clienteSelecionado, setClienteSelecionado] = useState<Cliente | null>(null)
  const [loading, setLoading] = useState(false)
  const [loadingDados, setLoadingDados] = useState(false)
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([])
  const [vendas, setVendas] = useState<Venda[]>([])
  const [receitas, setReceitas] = useState<Receita[]>([])
  const [relacionamentos, setRelacionamentos] = useState<Relacionamento[]>([])
  const [mostrarModalRelacionamento, setMostrarModalRelacionamento] = useState(false)
  const [relacionamentoEditando, setRelacionamentoEditando] = useState<Relacionamento | null>(null)
  const [salvando, setSalvando] = useState(false)
  const [mensagem, setMensagem] = useState<{ tipo: 'sucesso' | 'erro' | null; texto: string }>({ tipo: null, texto: '' })

  const [formDataRelacionamento, setFormDataRelacionamento] = useState({
    data_interacao: new Date().toISOString().split('T')[0],
    tipo_interacao: 'contato_telefonico',
    descricao: '',
    observacoes: '',
  })

  if (!podeAcessar('crm')) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-500 mb-2">Acesso Negado</h1>
          <p className="text-gray-400">Você não tem permissão para acessar esta página.</p>
        </div>
      </div>
    )
  }

  const buscarClientes = useCallback(async (termo: string) => {
    if (!termo || termo.trim().length < 2) {
      setClientes([])
      return
    }

    console.log(`[CRM Frontend] 🔍 Buscando clientes com termo: "${termo}"`)
    setLoading(true)
    try {
      const adminData = localStorage.getItem('admin')
      const admin = adminData ? JSON.parse(adminData) : null

      const apiUrl = 'https://api.protesecapilarcuiaba.com.br'
      
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      }
      if (admin?.id) {
        headers['x-user-id'] = admin.id
        headers['x-user-tipo'] = admin.tipo_usuario || 'administrativo'
        headers['x-user-nome'] = admin.nome_completo || null
      }

      const url = `${apiUrl}/api/v1/crm/buscar-clientes?search=${encodeURIComponent(termo)}`
      console.log(`[CRM Frontend] 📡 Fazendo requisição para: ${url}`)

      const response = await fetch(url, {
        headers,
      })

      console.log(`[CRM Frontend] 📥 Response status:`, response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error(`[CRM Frontend] ❌ Erro na resposta:`, {
          status: response.status,
          statusText: response.statusText,
          body: errorText
        })
        throw new Error('Erro ao buscar clientes')
      }

      const data = await response.json()
      console.log(`[CRM Frontend] ✅ Clientes encontrados: ${data.clientes?.length || 0}`)
      setClientes(data.clientes || [])
    } catch (error) {
      console.error(`[CRM Frontend] ❌ Erro ao buscar clientes:`, error)
      setClientes([])
    } finally {
      setLoading(false)
    }
  }, [])

  const carregarDadosCliente = useCallback(async (clienteId: string) => {
    console.log(`[CRM Frontend] 🔍 Iniciando carregamento de dados do cliente: ${clienteId}`)
    setLoadingDados(true)
    try {
      const adminData = localStorage.getItem('admin')
      const admin = adminData ? JSON.parse(adminData) : null

      console.log(`[CRM Frontend] 👤 Admin data:`, { id: admin?.id, tipo: admin?.tipo_usuario })

      const apiUrl = 'https://api.protesecapilarcuiaba.com.br'
      
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      }
      if (admin?.id) {
        headers['x-user-id'] = admin.id
        headers['x-user-tipo'] = admin.tipo_usuario || 'administrativo'
        headers['x-user-nome'] = admin.nome_completo || null
      }

      console.log(`[CRM Frontend] 📡 Fazendo requisição para: ${apiUrl}/api/v1/crm/cliente/${clienteId}/dados`)
      console.log(`[CRM Frontend] 📋 Headers:`, headers)

      const response = await fetch(`${apiUrl}/api/v1/crm/cliente/${clienteId}/dados`, {
        headers,
      })

      console.log(`[CRM Frontend] 📥 Response status:`, response.status, response.statusText)

      if (!response.ok) {
        const errorText = await response.text()
        console.error(`[CRM Frontend] ❌ Erro na resposta:`, {
          status: response.status,
          statusText: response.statusText,
          body: errorText
        })
        
        let errorData
        try {
          errorData = JSON.parse(errorText)
          console.error(`[CRM Frontend] ❌ Dados do erro parseados:`, errorData)
        } catch {
          errorData = { error: errorText }
          console.error(`[CRM Frontend] ❌ Não foi possível parsear o erro como JSON`)
        }
        
        const errorMessage = errorData.details || errorData.error || errorData.message || 'Erro ao carregar dados do cliente'
        console.error(`[CRM Frontend] ❌ Mensagem de erro final:`, errorMessage)
        console.error(`[CRM Frontend] ❌ Código do erro:`, errorData.code)
        console.error(`[CRM Frontend] ❌ Hint do erro:`, errorData.hint)
        
        throw new Error(errorMessage)
      }

      const data = await response.json()
      console.log(`[CRM Frontend] ✅ Dados recebidos:`, {
        agendamentos: data.agendamentos?.length || 0,
        vendas: data.vendas?.length || 0,
        receitas: data.receitas?.length || 0,
        relacionamentos: data.relacionamentos?.length || 0
      })

      setAgendamentos(data.agendamentos || [])
      setVendas(data.vendas || [])
      setReceitas(data.receitas || [])
      setRelacionamentos(data.relacionamentos || [])
      
      console.log(`[CRM Frontend] ✅ Dados carregados com sucesso`)
    } catch (error: any) {
      console.error(`[CRM Frontend] ❌❌❌ ERRO ao carregar dados do cliente:`, error)
      console.error(`[CRM Frontend] ❌ Mensagem:`, error.message)
      console.error(`[CRM Frontend] ❌ Stack:`, error.stack)
      setMensagem({ tipo: 'erro', texto: error.message || 'Erro ao carregar dados do cliente' })
    } finally {
      setLoadingDados(false)
    }
  }, [])

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      buscarClientes(searchTerm)
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [searchTerm, buscarClientes])

  const selecionarCliente = (cliente: Cliente) => {
    setClienteSelecionado(cliente)
    setSearchTerm('')
    setClientes([])
    carregarDadosCliente(cliente.id)
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

  const formatarData = (data: string) => {
    if (!data) return '-'
    const date = new Date(data)
    return date.toLocaleDateString('pt-BR')
  }

  const formatarStatusAgendamento = (status: string) => {
    const statusMap: { [key: string]: { label: string; cor: string } } = {
      agendado: { label: 'Agendado', cor: 'text-blue-400' },
      confirmado: { label: 'Confirmado', cor: 'text-green-400' },
      em_andamento: { label: 'Em Andamento', cor: 'text-yellow-400' },
      concluido: { label: 'Concluído', cor: 'text-green-500' },
      cancelado: { label: 'Cancelado', cor: 'text-red-400' },
      nao_compareceu: { label: 'Não Compareceu', cor: 'text-red-500' },
    }
    return statusMap[status] || { label: status, cor: 'text-gray-400' }
  }

  const formatarStatusVenda = (status: string) => {
    const statusMap: { [key: string]: { label: string; cor: string } } = {
      pendente: { label: 'Pendente', cor: 'text-yellow-400' },
      paga: { label: 'Paga', cor: 'text-green-400' },
      cancelada: { label: 'Cancelada', cor: 'text-red-400' },
      parcial: { label: 'Parcial', cor: 'text-orange-400' },
    }
    return statusMap[status] || { label: status, cor: 'text-gray-400' }
  }

  const formatarStatusReceita = (status: string) => {
    const statusMap: { [key: string]: { label: string; cor: string } } = {
      pendente: { label: 'Pendente', cor: 'text-yellow-400' },
      paga: { label: 'Paga', cor: 'text-green-400' },
      vencida: { label: 'Vencida', cor: 'text-red-400' },
      cancelada: { label: 'Cancelada', cor: 'text-red-500' },
      parcial: { label: 'Parcial', cor: 'text-orange-400' },
    }
    return statusMap[status] || { label: status, cor: 'text-gray-400' }
  }

  const formatarTipoInteracao = (tipo: string) => {
    const tipos: { [key: string]: string } = {
      contato_telefonico: 'Contato Telefônico',
      email: 'E-mail',
      visita: 'Visita',
      reuniao: 'Reunião',
      observacao: 'Observação',
      atendimento: 'Atendimento',
      follow_up: 'Follow-up',
    }
    return tipos[tipo] || tipo
  }

  const abrirModalRelacionamento = (relacionamento?: Relacionamento) => {
    if (relacionamento) {
      setRelacionamentoEditando(relacionamento)
      setFormDataRelacionamento({
        data_interacao: relacionamento.data_interacao,
        tipo_interacao: relacionamento.tipo_interacao,
        descricao: relacionamento.descricao,
        observacoes: relacionamento.observacoes || '',
      })
    } else {
      setRelacionamentoEditando(null)
      setFormDataRelacionamento({
        data_interacao: new Date().toISOString().split('T')[0],
        tipo_interacao: 'contato_telefonico',
        descricao: '',
        observacoes: '',
      })
    }
    setMostrarModalRelacionamento(true)
  }

  const salvarRelacionamento = async () => {
    if (!clienteSelecionado) return

    if (!formDataRelacionamento.data_interacao || !formDataRelacionamento.descricao.trim()) {
      setMensagem({ tipo: 'erro', texto: 'Preencha todos os campos obrigatórios' })
      return
    }

    setSalvando(true)
    try {
      const adminData = localStorage.getItem('admin')
      const admin = adminData ? JSON.parse(adminData) : null

      const apiUrl = 'https://api.protesecapilarcuiaba.com.br'
      
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      }
      if (admin?.id) {
        headers['x-user-id'] = admin.id
        headers['x-user-tipo'] = admin.tipo_usuario || 'administrativo'
        headers['x-user-nome'] = admin.nome_completo || null
      }

      const url = relacionamentoEditando
        ? `${apiUrl}/api/v1/crm/cliente/${clienteSelecionado.id}/relacionamentos/${relacionamentoEditando.id}`
        : `${apiUrl}/api/v1/crm/cliente/${clienteSelecionado.id}/relacionamentos`

      const method = relacionamentoEditando ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers,
        body: JSON.stringify(formDataRelacionamento),
      })

      if (!response.ok) {
        throw new Error('Erro ao salvar relacionamento')
      }

      setMensagem({ tipo: 'sucesso', texto: relacionamentoEditando ? 'Relacionamento atualizado com sucesso!' : 'Relacionamento criado com sucesso!' })
      setMostrarModalRelacionamento(false)
      carregarDadosCliente(clienteSelecionado.id)
      
      setTimeout(() => setMensagem({ tipo: null, texto: '' }), 3000)
    } catch (error) {
      console.error('Erro ao salvar relacionamento:', error)
      setMensagem({ tipo: 'erro', texto: 'Erro ao salvar relacionamento' })
    } finally {
      setSalvando(false)
    }
  }

  const excluirRelacionamento = async (relacionamentoId: string) => {
    if (!clienteSelecionado) return
    if (!confirm('Tem certeza que deseja excluir este relacionamento?')) return

    try {
      const adminData = localStorage.getItem('admin')
      const admin = adminData ? JSON.parse(adminData) : null

      const apiUrl = 'https://api.protesecapilarcuiaba.com.br'
      
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      }
      if (admin?.id) {
        headers['x-user-id'] = admin.id
        headers['x-user-tipo'] = admin.tipo_usuario || 'administrativo'
        headers['x-user-nome'] = admin.nome_completo || null
      }

      const response = await fetch(`${apiUrl}/api/v1/crm/cliente/${clienteSelecionado.id}/relacionamentos/${relacionamentoId}`, {
        method: 'DELETE',
        headers,
      })

      if (!response.ok) {
        throw new Error('Erro ao excluir relacionamento')
      }

      setMensagem({ tipo: 'sucesso', texto: 'Relacionamento excluído com sucesso!' })
      carregarDadosCliente(clienteSelecionado.id)
      setTimeout(() => setMensagem({ tipo: null, texto: '' }), 3000)
    } catch (error) {
      console.error('Erro ao excluir relacionamento:', error)
      setMensagem({ tipo: 'erro', texto: 'Erro ao excluir relacionamento' })
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-2">
          <UsersRound className="h-8 w-8 text-amber-500" />
          CRM
        </h1>
        <p className="text-gray-400 mt-1">Gerenciamento de relacionamento com clientes</p>
      </div>

      {/* Mensagens */}
      {mensagem.tipo && (
        <div className={`p-4 rounded-lg flex items-center gap-2 ${
          mensagem.tipo === 'sucesso' ? 'bg-green-500/10 border border-green-500/20 text-green-400' : 'bg-red-500/10 border border-red-500/20 text-red-400'
        }`}>
          {mensagem.tipo === 'sucesso' ? <CheckCircle2 className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
          {mensagem.texto}
        </div>
      )}

      {/* Busca de Cliente */}
      <Card className="bg-zinc-900 border-amber-500/20 p-6">
        <div className="space-y-4">
          <Label className="text-white">Buscar Cliente</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Digite o nome ou e-mail do cliente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-zinc-800 border-zinc-700 text-white"
            />
            
            {/* Lista de resultados da busca */}
            {searchTerm && clientes.length > 0 && (
              <div className="absolute z-50 w-full mt-2 bg-zinc-800 border border-amber-500/20 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {clientes.map((cliente) => (
                <button
                  key={cliente.id}
                  onClick={() => selecionarCliente(cliente)}
                  className="w-full p-3 text-left hover:bg-zinc-700 flex items-center gap-3 border-b border-zinc-700 last:border-b-0"
                >
                  {cliente.foto_url ? (
                    <img src={cliente.foto_url} alt={cliente.nome_completo} className="w-10 h-10 rounded-full object-cover" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
                      <User className="h-5 w-5 text-amber-500" />
                    </div>
                  )}
                  <div>
                    <p className="text-white font-medium">{cliente.nome_completo}</p>
                    <p className="text-gray-400 text-sm">{cliente.email}</p>
                  </div>
                </button>
              ))}
              </div>
            )}
          </div>

          {loading && (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-5 w-5 text-amber-500 animate-spin" />
            </div>
          )}

          {/* Cliente Selecionado */}
          {clienteSelecionado && (
            <div className="mt-4 p-4 bg-zinc-800 rounded-lg border border-amber-500/20 flex items-center gap-4">
              {clienteSelecionado.foto_url ? (
                <img src={clienteSelecionado.foto_url} alt={clienteSelecionado.nome_completo} className="w-16 h-16 rounded-full object-cover" />
              ) : (
                <div className="w-16 h-16 rounded-full bg-amber-500/20 flex items-center justify-center">
                  <User className="h-8 w-8 text-amber-500" />
                </div>
              )}
              <div>
                <h3 className="text-white font-bold text-lg">{clienteSelecionado.nome_completo}</h3>
                <p className="text-gray-400">{clienteSelecionado.email}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setClienteSelecionado(null)
                  setAgendamentos([])
                  setVendas([])
                  setReceitas([])
                  setRelacionamentos([])
                }}
                className="ml-auto"
              >
                <X className="h-4 w-4 mr-2" />
                Limpar Seleção
              </Button>
            </div>
          )}
        </div>
      </Card>

      {/* Abas */}
      {clienteSelecionado && (
        <Tabs defaultValue="agendamentos" className="space-y-4">
          <TabsList className="bg-zinc-800 border-amber-500/20">
            <TabsTrigger value="agendamentos" className="text-gray-400 data-[state=active]:bg-amber-500/10 data-[state=active]:text-amber-500">
              <Calendar className="h-4 w-4 mr-2" />
              Agendamentos
            </TabsTrigger>
            <TabsTrigger value="vendas" className="text-gray-400 data-[state=active]:bg-amber-500/10 data-[state=active]:text-amber-500">
              <ShoppingCart className="h-4 w-4 mr-2" />
              Vendas
            </TabsTrigger>
            <TabsTrigger value="assinaturas" className="text-gray-400 data-[state=active]:bg-amber-500/10 data-[state=active]:text-amber-500">
              <FileText className="h-4 w-4 mr-2" />
              Assinaturas
            </TabsTrigger>
            <TabsTrigger value="financeiro" className="text-gray-400 data-[state=active]:bg-amber-500/10 data-[state=active]:text-amber-500">
              <DollarSign className="h-4 w-4 mr-2" />
              Financeiro
            </TabsTrigger>
            <TabsTrigger value="relacionamentos" className="text-gray-400 data-[state=active]:bg-amber-500/10 data-[state=active]:text-amber-500">
              <MessageSquare className="h-4 w-4 mr-2" />
              Relacionamentos
            </TabsTrigger>
          </TabsList>

          {/* Aba Agendamentos */}
          <TabsContent value="agendamentos" className="space-y-4">
            <Card className="bg-zinc-900 border-amber-500/20 p-6">
              {loadingDados ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 text-amber-500 animate-spin" />
                </div>
              ) : agendamentos.length === 0 ? (
                <p className="text-gray-400 text-center py-8">Nenhum agendamento encontrado.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-zinc-700">
                        <th className="text-left p-3 text-gray-400">Data</th>
                        <th className="text-left p-3 text-gray-400">Horário</th>
                        <th className="text-left p-3 text-gray-400">Serviço</th>
                        <th className="text-left p-3 text-gray-400">Profissional</th>
                        <th className="text-left p-3 text-gray-400">Status</th>
                        <th className="text-left p-3 text-gray-400">Valor</th>
                      </tr>
                    </thead>
                    <tbody>
                      {agendamentos.map((agendamento) => {
                        const status = formatarStatusAgendamento(agendamento.status)
                        return (
                          <tr key={agendamento.id} className="border-b border-zinc-800 hover:bg-zinc-800/50">
                            <td className="p-3 text-white">{formatarData(agendamento.data_agendamento)}</td>
                            <td className="p-3 text-gray-300">{agendamento.hora_inicio} - {agendamento.hora_fim}</td>
                            <td className="p-3 text-gray-300">{agendamento.servico_nome}</td>
                            <td className="p-3 text-gray-300">{agendamento.funcionario_nome}</td>
                            <td className="p-3">
                              <span className={status.cor}>{status.label}</span>
                            </td>
                            <td className="p-3 text-white font-medium">{formatarPreco(agendamento.valor_servico)}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          </TabsContent>

          {/* Aba Vendas */}
          <TabsContent value="vendas" className="space-y-4">
            <Card className="bg-zinc-900 border-amber-500/20 p-6">
              {loadingDados ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 text-amber-500 animate-spin" />
                </div>
              ) : vendas.length === 0 ? (
                <p className="text-gray-400 text-center py-8">Nenhuma venda encontrada.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-zinc-700">
                        <th className="text-left p-3 text-gray-400">Data</th>
                        <th className="text-left p-3 text-gray-400">Ticket</th>
                        <th className="text-left p-3 text-gray-400">Profissional</th>
                        <th className="text-left p-3 text-gray-400">Valor</th>
                        <th className="text-left p-3 text-gray-400">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {vendas.map((venda) => {
                        const status = formatarStatusVenda(venda.status)
                        return (
                          <tr key={venda.id} className="border-b border-zinc-800 hover:bg-zinc-800/50">
                            <td className="p-3 text-white">{formatarData(venda.data_venda)}</td>
                            <td className="p-3 text-gray-300 font-mono">{venda.ticket}</td>
                            <td className="p-3 text-gray-300">{venda.funcionario_nome}</td>
                            <td className="p-3 text-white font-medium">{formatarPreco(venda.valor_liquido)}</td>
                            <td className="p-3">
                              <span className={status.cor}>{status.label}</span>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          </TabsContent>

          {/* Aba Assinaturas */}
          <TabsContent value="assinaturas" className="space-y-4">
            <Card className="bg-zinc-900 border-amber-500/20 p-6">
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                <p className="text-gray-400">Módulo em desenvolvimento</p>
              </div>
            </Card>
          </TabsContent>

          {/* Aba Financeiro */}
          <TabsContent value="financeiro" className="space-y-4">
            <Card className="bg-zinc-900 border-amber-500/20 p-6">
              {loadingDados ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 text-amber-500 animate-spin" />
                </div>
              ) : receitas.length === 0 ? (
                <p className="text-gray-400 text-center py-8">Nenhuma receita encontrada.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-zinc-700">
                        <th className="text-left p-3 text-gray-400">Data Emissão</th>
                        <th className="text-left p-3 text-gray-400">Data Vencimento</th>
                        <th className="text-left p-3 text-gray-400">Data Pagamento</th>
                        <th className="text-left p-3 text-gray-400">Ticket</th>
                        <th className="text-left p-3 text-gray-400">Valor Original</th>
                        <th className="text-left p-3 text-gray-400">Valor Pago</th>
                        <th className="text-left p-3 text-gray-400">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {receitas.map((receita) => {
                        const status = formatarStatusReceita(receita.status)
                        return (
                          <tr key={receita.id} className="border-b border-zinc-800 hover:bg-zinc-800/50">
                            <td className="p-3 text-white">{formatarData(receita.data_emissao)}</td>
                            <td className="p-3 text-gray-300">{formatarData(receita.data_vencimento)}</td>
                            <td className="p-3 text-gray-300">{receita.data_pagamento ? formatarData(receita.data_pagamento) : '-'}</td>
                            <td className="p-3 text-gray-300 font-mono">{receita.ticket_venda}</td>
                            <td className="p-3 text-white font-medium">{formatarPreco(receita.valor_vencimento)}</td>
                            <td className="p-3 text-white font-medium">{formatarPreco(receita.valor_pago)}</td>
                            <td className="p-3">
                              <span className={status.cor}>{status.label}</span>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          </TabsContent>

          {/* Aba Relacionamentos */}
          <TabsContent value="relacionamentos" className="space-y-4">
            <Card className="bg-zinc-900 border-amber-500/20 p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-white font-bold">Interações e Relacionamentos</h3>
                {podeEditar('crm') && (
                  <Button onClick={() => abrirModalRelacionamento()} className="bg-amber-500 hover:bg-amber-600">
                    <Plus className="h-4 w-4 mr-2" />
                    Nova Interação
                  </Button>
                )}
              </div>

              {loadingDados ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 text-amber-500 animate-spin" />
                </div>
              ) : relacionamentos.length === 0 ? (
                <p className="text-gray-400 text-center py-8">Nenhuma interação registrada.</p>
              ) : (
                <div className="space-y-4">
                  {relacionamentos.map((relacionamento) => (
                    <div key={relacionamento.id} className="p-4 bg-zinc-800 rounded-lg border border-zinc-700">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-amber-500 font-medium">{formatarTipoInteracao(relacionamento.tipo_interacao)}</span>
                            <span className="text-gray-500">•</span>
                            <span className="text-gray-400 text-sm">{formatarData(relacionamento.data_interacao)}</span>
                          </div>
                          <p className="text-white">{relacionamento.descricao}</p>
                          {relacionamento.observacoes && (
                            <p className="text-gray-400 text-sm mt-2">{relacionamento.observacoes}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-500 text-xs">{relacionamento.funcionario_nome}</span>
                          {podeEditar('crm') && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => abrirModalRelacionamento(relacionamento)}
                                className="h-8 w-8 p-0"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              {podeExcluir('crm') && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => excluirRelacionamento(relacionamento.id)}
                                  className="h-8 w-8 p-0 text-red-400 hover:text-red-500"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {/* Modal de Relacionamento */}
      <Dialog open={mostrarModalRelacionamento} onOpenChange={setMostrarModalRelacionamento}>
        <DialogContent className="bg-zinc-900 border-amber-500/20 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-white">
              {relacionamentoEditando ? 'Editar Interação' : 'Nova Interação'}
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Registre uma nova interação ou relacionamento com o cliente
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div>
              <Label className="text-white">Data da Interação *</Label>
              <Input
                type="date"
                value={formDataRelacionamento.data_interacao}
                onChange={(e) => setFormDataRelacionamento({ ...formDataRelacionamento, data_interacao: e.target.value })}
                className="bg-zinc-800 border-zinc-700 text-white mt-1"
              />
            </div>

            <div>
              <Label className="text-white">Tipo de Interação *</Label>
              <Select
                value={formDataRelacionamento.tipo_interacao}
                onValueChange={(value) => setFormDataRelacionamento({ ...formDataRelacionamento, tipo_interacao: value })}
              >
                <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-800 border-zinc-700">
                  <SelectItem value="contato_telefonico">Contato Telefônico</SelectItem>
                  <SelectItem value="email">E-mail</SelectItem>
                  <SelectItem value="visita">Visita</SelectItem>
                  <SelectItem value="reuniao">Reunião</SelectItem>
                  <SelectItem value="observacao">Observação</SelectItem>
                  <SelectItem value="atendimento">Atendimento</SelectItem>
                  <SelectItem value="follow_up">Follow-up</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-white">Descrição *</Label>
              <Textarea
                value={formDataRelacionamento.descricao}
                onChange={(e) => setFormDataRelacionamento({ ...formDataRelacionamento, descricao: e.target.value })}
                className="bg-zinc-800 border-zinc-700 text-white mt-1"
                rows={4}
                placeholder="Descreva a interação ou relacionamento..."
              />
            </div>

            <div>
              <Label className="text-white">Observações</Label>
              <Textarea
                value={formDataRelacionamento.observacoes}
                onChange={(e) => setFormDataRelacionamento({ ...formDataRelacionamento, observacoes: e.target.value })}
                className="bg-zinc-800 border-zinc-700 text-white mt-1"
                rows={3}
                placeholder="Observações adicionais (opcional)..."
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setMostrarModalRelacionamento(false)}
                disabled={salvando}
              >
                Cancelar
              </Button>
              <Button
                onClick={salvarRelacionamento}
                disabled={salvando}
                className="bg-amber-500 hover:bg-amber-600"
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
        </DialogContent>
      </Dialog>
    </div>
  )
}
