'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion } from 'motion/react'
import { 
  FileText, 
  Loader2, 
  AlertCircle, 
  Download, 
  Calendar,
  TrendingUp,
  TrendingDown,
  Package,
  Users,
  DollarSign,
  ShoppingCart,
  BarChart3,
  FileSpreadsheet,
  FileDown
} from 'lucide-react'
import { usePermissions } from '@/hooks/usePermissions'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { getApiBaseUrl } from '@/lib/api'

interface RelatorioData {
  [key: string]: any
}

export default function EmissaoRelatoriosPage() {
  const [relatorioSelecionado, setRelatorioSelecionado] = useState<string | null>(null)
  const [dataInicio, setDataInicio] = useState('')
  const [dataFim, setDataFim] = useState('')
  const [funcionarioId, setFuncionarioId] = useState('todos')
  const [tipoItem, setTipoItem] = useState<'servico' | 'produto' | 'todos'>('todos')
  const [categoriaDespesa, setCategoriaDespesa] = useState('todos')
  const [loading, setLoading] = useState(false)
  const [dadosRelatorio, setDadosRelatorio] = useState<RelatorioData | null>(null)
  const [funcionarios, setFuncionarios] = useState<any[]>([])
  const [categoriasDespesa, setCategoriasDespesa] = useState<any[]>([])
  const dadosCarregadosRef = useRef(false)
  const { podeAcessar, loading: loadingPermissoes } = usePermissions()

  // Carregar funcionários e categorias
  useEffect(() => {
    if (loadingPermissoes) return
    
    const carregarDadosAuxiliares = async () => {
      try {
        const adminData = localStorage.getItem('admin')
        const admin = adminData ? JSON.parse(adminData) : null
        const apiUrl = getApiBaseUrl()
        const headers: HeadersInit = {
          'Content-Type': 'application/json',
        }
        if (admin?.id) {
          headers['x-user-id'] = admin.id
          headers['x-user-tipo'] = admin.tipo_usuario || 'administrativo'
          headers['x-user-nome'] = admin.nome_completo || null
        }

        // Carregar funcionários
        const funcResponse = await fetch(`${apiUrl}/api/v1/funcionarios`, { headers })
        if (funcResponse.ok) {
          const funcData = await funcResponse.json()
          setFuncionarios(funcData.funcionarios || [])
        }

        // Carregar categorias de despesa
        const catResponse = await fetch(`${apiUrl}/api/v1/balanco-demonstrativo/categorias?tipo=despesa&is_active=true`, { headers })
        if (catResponse.ok) {
          const catData = await catResponse.json()
          // Usar categorias_flat para ter lista simples
          setCategoriasDespesa(catData.categorias_flat || catData.categorias || [])
        }
      } catch (error) {
        console.error('Erro ao carregar dados auxiliares:', error)
      }
    }

    carregarDadosAuxiliares()
  }, [loadingPermissoes])

  const gerarRelatorio = useCallback(async (tipoRelatorio: string) => {
    if (!dataInicio || !dataFim) {
      alert('Por favor, selecione o período (data início e data fim)')
      return
    }

    setLoading(true)
    setDadosRelatorio(null)

    try {
      const adminData = localStorage.getItem('admin')
      const admin = adminData ? JSON.parse(adminData) : null
      const apiUrl = getApiBaseUrl()
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      }
      if (admin?.id) {
        headers['x-user-id'] = admin.id
        headers['x-user-tipo'] = admin.tipo_usuario || 'administrativo'
        headers['x-user-nome'] = admin.nome_completo || null
      }

      const params = new URLSearchParams({
        data_inicio: dataInicio,
        data_fim: dataFim,
      })

      if (funcionarioId && funcionarioId !== 'todos' && tipoRelatorio.includes('funcionario')) {
        params.append('funcionario_id', funcionarioId)
      }

      if (tipoItem !== 'todos' && tipoRelatorio.includes('tipo')) {
        params.append('tipo', tipoItem)
      }

      if (categoriaDespesa && categoriaDespesa !== 'todos' && tipoRelatorio.includes('despesa')) {
        params.append('categoria_id', categoriaDespesa)
      }

      const response = await fetch(`${apiUrl}/api/v1/relatorios/${tipoRelatorio}?${params.toString()}`, { headers })

      if (!response.ok) {
        throw new Error(`Erro ao gerar relatório: ${response.status}`)
      }

      const data = await response.json()
      setDadosRelatorio(data)
      setRelatorioSelecionado(tipoRelatorio)
    } catch (error: any) {
      console.error('Erro ao gerar relatório:', error)
      alert(error.message || 'Erro ao gerar relatório')
    } finally {
      setLoading(false)
    }
  }, [dataInicio, dataFim, funcionarioId, tipoItem, categoriaDespesa])

  const exportarExcel = useCallback(async () => {
    if (!relatorioSelecionado || !dadosRelatorio) {
      alert('Gere um relatório primeiro')
      return
    }

    try {
      const adminData = localStorage.getItem('admin')
      const admin = adminData ? JSON.parse(adminData) : null
      const apiUrl = getApiBaseUrl()
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      }
      if (admin?.id) {
        headers['x-user-id'] = admin.id
        headers['x-user-tipo'] = admin.tipo_usuario || 'administrativo'
        headers['x-user-nome'] = admin.nome_completo || null
      }

      const params = new URLSearchParams({
        data_inicio: dataInicio,
        data_fim: dataFim,
        formato: 'excel'
      })

      if (funcionarioId && funcionarioId !== 'todos') params.append('funcionario_id', funcionarioId)
      if (tipoItem !== 'todos') params.append('tipo', tipoItem)
      if (categoriaDespesa && categoriaDespesa !== 'todos') params.append('categoria_id', categoriaDespesa)

      const response = await fetch(`${apiUrl}/api/v1/relatorios/${relatorioSelecionado}/exportar?${params.toString()}`, { 
        headers,
        method: 'GET'
      })

      if (!response.ok) {
        throw new Error('Erro ao exportar para Excel')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `relatorio_${relatorioSelecionado}_${dataInicio}_${dataFim}.xlsx`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error: any) {
      console.error('Erro ao exportar Excel:', error)
      alert(error.message || 'Erro ao exportar para Excel')
    }
  }, [relatorioSelecionado, dadosRelatorio, dataInicio, dataFim, funcionarioId, tipoItem, categoriaDespesa])

  const exportarPDF = useCallback(async () => {
    if (!relatorioSelecionado || !dadosRelatorio) {
      alert('Gere um relatório primeiro')
      return
    }

    try {
      const adminData = localStorage.getItem('admin')
      const admin = adminData ? JSON.parse(adminData) : null
      const apiUrl = getApiBaseUrl()
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      }
      if (admin?.id) {
        headers['x-user-id'] = admin.id
        headers['x-user-tipo'] = admin.tipo_usuario || 'administrativo'
        headers['x-user-nome'] = admin.nome_completo || null
      }

      const params = new URLSearchParams({
        data_inicio: dataInicio,
        data_fim: dataFim,
        formato: 'pdf'
      })

      if (funcionarioId && funcionarioId !== 'todos') params.append('funcionario_id', funcionarioId)
      if (tipoItem !== 'todos') params.append('tipo', tipoItem)
      if (categoriaDespesa && categoriaDespesa !== 'todos') params.append('categoria_id', categoriaDespesa)

      const response = await fetch(`${apiUrl}/api/v1/relatorios/${relatorioSelecionado}/exportar?${params.toString()}`, { 
        headers,
        method: 'GET'
      })

      if (!response.ok) {
        throw new Error('Erro ao exportar para PDF')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `relatorio_${relatorioSelecionado}_${dataInicio}_${dataFim}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error: any) {
      console.error('Erro ao exportar PDF:', error)
      alert(error.message || 'Erro ao exportar para PDF')
    }
  }, [relatorioSelecionado, dadosRelatorio, dataInicio, dataFim, funcionarioId, tipoItem, categoriaDespesa])

  const formatarPreco = (valor: number | string | null | undefined) => {
    if (!valor) return 'R$ 0,00'
    const num = typeof valor === 'string' ? parseFloat(valor) : valor
    if (isNaN(num)) return 'R$ 0,00'
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(num)
  }

  const formatarData = (data: string) => {
    if (!data) return ''
    try {
      return new Date(data).toLocaleDateString('pt-BR')
    } catch {
      return data
    }
  }

  // Definir data padrão (últimos 30 dias) - DEVE VIR ANTES DOS RETURNS
  useEffect(() => {
    if (!dataInicio || !dataFim) {
      const hoje = new Date()
      const trintaDiasAtras = new Date()
      trintaDiasAtras.setDate(hoje.getDate() - 30)
      
      setDataFim(hoje.toISOString().split('T')[0])
      setDataInicio(trintaDiasAtras.toISOString().split('T')[0])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Verificar acesso
  const adminData = typeof window !== 'undefined' ? localStorage.getItem('admin') : null
  const admin = adminData ? JSON.parse(adminData) : null
  const isMaster = admin?.tipo_usuario === 'master'
  const temAcesso = isMaster || podeAcessar('emissao_relatorios')

  if (!loadingPermissoes && !temAcesso) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Card className="p-8 bg-zinc-900 border-amber-500/20">
          <div className="flex flex-col items-center gap-4">
            <AlertCircle className="h-12 w-12 text-red-500" />
            <h2 className="text-xl font-bold text-gray-300">Acesso Negado</h2>
            <p className="text-gray-400">Você não tem permissão para acessar este módulo.</p>
          </div>
        </Card>
      </div>
    )
  }

  if (loadingPermissoes) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Card className="p-8 bg-zinc-900 border-amber-500/20">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
            <p className="text-gray-400">Carregando permissões...</p>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2 text-gray-300">
            <FileText className="h-8 w-8 text-amber-500" />
            Emissão de Relatórios
          </h1>
          <p className="text-gray-400 mt-1">Gere e exporte relatórios detalhados do sistema</p>
        </div>
      </div>

      {/* Filtros Gerais */}
      <Card className="p-6 bg-zinc-900 border-amber-500/20">
        <h3 className="text-lg font-semibold text-gray-300 mb-4 flex items-center gap-2">
          <Calendar className="h-5 w-5 text-amber-500" />
          Filtros do Período
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="dataInicio" className="text-gray-300">Data Início</Label>
            <Input
              id="dataInicio"
              type="date"
              value={dataInicio}
              onChange={(e) => setDataInicio(e.target.value)}
              className="bg-zinc-800 border-amber-500/20 text-gray-300 mt-1 hover:bg-zinc-700 focus:bg-zinc-700 focus:border-amber-500/40"
            />
          </div>
          <div>
            <Label htmlFor="dataFim" className="text-gray-300">Data Fim</Label>
            <Input
              id="dataFim"
              type="date"
              value={dataFim}
              onChange={(e) => setDataFim(e.target.value)}
              className="bg-zinc-800 border-amber-500/20 text-gray-300 mt-1 hover:bg-zinc-700 focus:bg-zinc-700 focus:border-amber-500/40"
            />
          </div>
        </div>
      </Card>

      {/* Relatórios de Vendas/Receitas */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-300 flex items-center gap-2">
          <TrendingUp className="h-6 w-6 text-amber-500" />
          Relatórios de Vendas (Receitas)
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* 1. Vendas Totais por Período */}
          <Card className="p-4 bg-zinc-900 border-amber-500/20 hover:border-amber-500/40 transition-colors">
            <div className="flex items-center gap-2 mb-3">
              <DollarSign className="h-5 w-5 text-amber-500" />
              <h3 className="font-semibold text-gray-300">Vendas Totais</h3>
            </div>
            <p className="text-sm text-gray-400 mb-4">Total de vendas no período selecionado</p>
            <Button
              onClick={() => gerarRelatorio('vendas-totais')}
              disabled={loading}
              className="w-full bg-amber-500 hover:bg-amber-600 text-white"
            >
              {loading && relatorioSelecionado === 'vendas-totais' ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <BarChart3 className="h-4 w-4 mr-2" />
              )}
              Gerar Relatório
            </Button>
          </Card>

          {/* 2. Vendas por Serviço */}
          <Card className="p-4 bg-zinc-900 border-amber-500/20 hover:border-amber-500/40 transition-colors">
            <div className="flex items-center gap-2 mb-3">
              <ShoppingCart className="h-5 w-5 text-amber-500" />
              <h3 className="font-semibold text-gray-300">Vendas por Serviço</h3>
            </div>
            <p className="text-sm text-gray-400 mb-4">Vendas agrupadas por serviço</p>
            <Button
              onClick={() => gerarRelatorio('vendas-por-servico')}
              disabled={loading}
              className="w-full bg-amber-500 hover:bg-amber-600 text-white"
            >
              {loading && relatorioSelecionado === 'vendas-por-servico' ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <BarChart3 className="h-4 w-4 mr-2" />
              )}
              Gerar Relatório
            </Button>
          </Card>

          {/* 3. Vendas por Produto */}
          <Card className="p-4 bg-zinc-900 border-amber-500/20 hover:border-amber-500/40 transition-colors">
            <div className="flex items-center gap-2 mb-3">
              <Package className="h-5 w-5 text-amber-500" />
              <h3 className="font-semibold text-gray-300">Vendas por Produto</h3>
            </div>
            <p className="text-sm text-gray-400 mb-4">Vendas agrupadas por produto</p>
            <Button
              onClick={() => gerarRelatorio('vendas-por-produto')}
              disabled={loading}
              className="w-full bg-amber-500 hover:bg-amber-600 text-white"
            >
              {loading && relatorioSelecionado === 'vendas-por-produto' ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <BarChart3 className="h-4 w-4 mr-2" />
              )}
              Gerar Relatório
            </Button>
          </Card>

          {/* 4. Vendas por Funcionário Totais */}
          <Card className="p-4 bg-zinc-900 border-amber-500/20 hover:border-amber-500/40 transition-colors">
            <div className="flex items-center gap-2 mb-3">
              <Users className="h-5 w-5 text-amber-500" />
              <h3 className="font-semibold text-gray-300">Vendas por Funcionário</h3>
            </div>
            <p className="text-sm text-gray-400 mb-4">Total de vendas por funcionário</p>
            <div className="mb-3">
              <Label className="text-gray-300 text-sm">Funcionário (opcional)</Label>
              <Select value={funcionarioId} onValueChange={setFuncionarioId}>
                <SelectTrigger className="bg-zinc-800 border-amber-500/20 text-gray-300 mt-1 hover:bg-zinc-700">
                  <SelectValue placeholder="Todos os funcionários" className="text-gray-300" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-800 border-amber-500/20 text-gray-300">
                  <SelectItem value="todos" className="text-gray-300 hover:bg-zinc-700 hover:text-white focus:bg-zinc-700 focus:text-white cursor-pointer">Todos os funcionários</SelectItem>
                  {funcionarios.map((func) => (
                    <SelectItem key={func.id} value={func.id} className="text-gray-300 hover:bg-zinc-700 hover:text-white focus:bg-zinc-700 focus:text-white cursor-pointer">
                      {func.nome_completo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={() => gerarRelatorio('vendas-por-funcionario-totais')}
              disabled={loading}
              className="w-full bg-amber-500 hover:bg-amber-600 text-white"
            >
              {loading && relatorioSelecionado === 'vendas-por-funcionario-totais' ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <BarChart3 className="h-4 w-4 mr-2" />
              )}
              Gerar Relatório
            </Button>
          </Card>

          {/* 5. Vendas por Funcionário Serviços e Produtos Separados */}
          <Card className="p-4 bg-zinc-900 border-amber-500/20 hover:border-amber-500/40 transition-colors">
            <div className="flex items-center gap-2 mb-3">
              <Users className="h-5 w-5 text-amber-500" />
              <h3 className="font-semibold text-gray-300">Vendas por Funcionário (Separado)</h3>
            </div>
            <p className="text-sm text-gray-400 mb-4">Serviços e produtos separados por funcionário</p>
            <div className="mb-3">
              <Label className="text-gray-300 text-sm">Funcionário (opcional)</Label>
              <Select value={funcionarioId} onValueChange={setFuncionarioId}>
                <SelectTrigger className="bg-zinc-800 border-amber-500/20 text-gray-300 mt-1 hover:bg-zinc-700">
                  <SelectValue placeholder="Todos os funcionários" className="text-gray-300" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-800 border-amber-500/20 text-gray-300">
                  <SelectItem value="todos" className="text-gray-300 hover:bg-zinc-700 hover:text-white focus:bg-zinc-700 focus:text-white cursor-pointer">Todos os funcionários</SelectItem>
                  {funcionarios.map((func) => (
                    <SelectItem key={func.id} value={func.id} className="text-gray-300 hover:bg-zinc-700 hover:text-white focus:bg-zinc-700 focus:text-white cursor-pointer">
                      {func.nome_completo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={() => gerarRelatorio('vendas-por-funcionario-separado')}
              disabled={loading}
              className="w-full bg-amber-500 hover:bg-amber-600 text-white"
            >
              {loading && relatorioSelecionado === 'vendas-por-funcionario-separado' ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <BarChart3 className="h-4 w-4 mr-2" />
              )}
              Gerar Relatório
            </Button>
          </Card>

          {/* 6. Vendas por Funcionário por Tipo */}
          <Card className="p-4 bg-zinc-900 border-amber-500/20 hover:border-amber-500/40 transition-colors">
            <div className="flex items-center gap-2 mb-3">
              <Users className="h-5 w-5 text-amber-500" />
              <h3 className="font-semibold text-gray-300">Vendas por Funcionário/Tipo</h3>
            </div>
            <p className="text-sm text-gray-400 mb-4">Vendas por funcionário e tipo (serviço/produto)</p>
            <div className="mb-3 space-y-2">
              <div>
                <Label className="text-gray-300 text-sm">Funcionário (opcional)</Label>
                <Select value={funcionarioId} onValueChange={setFuncionarioId}>
                  <SelectTrigger className="bg-zinc-800 border-amber-500/20 text-gray-300 mt-1 hover:bg-zinc-700">
                    <SelectValue placeholder="Todos" className="text-gray-300" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-800 border-amber-500/20 text-gray-300">
                    <SelectItem value="todos" className="text-gray-300 hover:bg-zinc-700 hover:text-white focus:bg-zinc-700 focus:text-white cursor-pointer">Todos</SelectItem>
                    {funcionarios.map((func) => (
                      <SelectItem key={func.id} value={func.id}>
                        {func.nome_completo}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-gray-300 text-sm">Tipo</Label>
                <Select value={tipoItem} onValueChange={(v) => setTipoItem(v as any)}>
                  <SelectTrigger className="bg-zinc-800 border-amber-500/20 text-gray-300 mt-1 hover:bg-zinc-700">
                    <SelectValue className="text-gray-300" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-800 border-amber-500/20 text-gray-300">
                    <SelectItem value="todos" className="text-gray-300 hover:bg-zinc-700 hover:text-white focus:bg-zinc-700 focus:text-white cursor-pointer">Todos</SelectItem>
                    <SelectItem value="servico" className="text-gray-300 hover:bg-zinc-700 hover:text-white focus:bg-zinc-700 focus:text-white cursor-pointer">Serviço</SelectItem>
                    <SelectItem value="produto" className="text-gray-300 hover:bg-zinc-700 hover:text-white focus:bg-zinc-700 focus:text-white cursor-pointer">Produto</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button
              onClick={() => gerarRelatorio('vendas-por-funcionario-tipo')}
              disabled={loading}
              className="w-full bg-amber-500 hover:bg-amber-600 text-white"
            >
              {loading && relatorioSelecionado === 'vendas-por-funcionario-tipo' ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <BarChart3 className="h-4 w-4 mr-2" />
              )}
              Gerar Relatório
            </Button>
          </Card>
        </div>
      </div>

      {/* Relatórios de Despesas */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-300 flex items-center gap-2">
          <TrendingDown className="h-6 w-6 text-red-500" />
          Relatórios de Despesas
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 7. Despesas Totais */}
          <Card className="p-4 bg-zinc-900 border-amber-500/20 hover:border-amber-500/40 transition-colors">
            <div className="flex items-center gap-2 mb-3">
              <TrendingDown className="h-5 w-5 text-red-500" />
              <h3 className="font-semibold text-gray-300">Despesas Totais</h3>
            </div>
            <p className="text-sm text-gray-400 mb-4">Total de despesas no período</p>
            <Button
              onClick={() => gerarRelatorio('despesas-totais')}
              disabled={loading}
              className="w-full bg-red-500 hover:bg-red-600 text-white"
            >
              {loading && relatorioSelecionado === 'despesas-totais' ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <BarChart3 className="h-4 w-4 mr-2" />
              )}
              Gerar Relatório
            </Button>
          </Card>

          {/* 8. Despesas por Tipo */}
          <Card className="p-4 bg-zinc-900 border-amber-500/20 hover:border-amber-500/40 transition-colors">
            <div className="flex items-center gap-2 mb-3">
              <TrendingDown className="h-5 w-5 text-red-500" />
              <h3 className="font-semibold text-gray-300">Despesas por Tipo</h3>
            </div>
            <p className="text-sm text-gray-400 mb-4">Despesas agrupadas por categoria</p>
            <div className="mb-3">
              <Label className="text-gray-300 text-sm">Categoria (opcional)</Label>
              <Select value={categoriaDespesa} onValueChange={setCategoriaDespesa}>
                <SelectTrigger className="bg-zinc-800 border-amber-500/20 text-gray-300 mt-1 hover:bg-zinc-700">
                  <SelectValue placeholder="Todas as categorias" className="text-gray-300" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-800 border-amber-500/20 text-gray-300">
                  <SelectItem value="todos" className="text-gray-300 hover:bg-zinc-700 hover:text-white focus:bg-zinc-700 focus:text-white cursor-pointer">Todas as categorias</SelectItem>
                  {categoriasDespesa.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id} className="text-gray-300 hover:bg-zinc-700 hover:text-white focus:bg-zinc-700 focus:text-white cursor-pointer">
                      {cat.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={() => gerarRelatorio('despesas-por-tipo')}
              disabled={loading}
              className="w-full bg-red-500 hover:bg-red-600 text-white"
            >
              {loading && relatorioSelecionado === 'despesas-por-tipo' ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <BarChart3 className="h-4 w-4 mr-2" />
              )}
              Gerar Relatório
            </Button>
          </Card>
        </div>
      </div>

      {/* Relatórios de Produtos */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-300 flex items-center gap-2">
          <Package className="h-6 w-6 text-amber-500" />
          Relatórios de Produtos
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 9. Produtos Totais (Estoque) */}
          <Card className="p-4 bg-zinc-900 border-amber-500/20 hover:border-amber-500/40 transition-colors">
            <div className="flex items-center gap-2 mb-3">
              <Package className="h-5 w-5 text-amber-500" />
              <h3 className="font-semibold text-gray-300">Produtos em Estoque</h3>
            </div>
            <p className="text-sm text-gray-400 mb-4">Contagem total de produtos em estoque</p>
            <Button
              onClick={() => gerarRelatorio('produtos-estoque')}
              disabled={loading}
              className="w-full bg-amber-500 hover:bg-amber-600 text-white"
            >
              {loading && relatorioSelecionado === 'produtos-estoque' ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <BarChart3 className="h-4 w-4 mr-2" />
              )}
              Gerar Relatório
            </Button>
          </Card>

          {/* 10. Produtos Vendidos */}
          <Card className="p-4 bg-zinc-900 border-amber-500/20 hover:border-amber-500/40 transition-colors">
            <div className="flex items-center gap-2 mb-3">
              <ShoppingCart className="h-5 w-5 text-amber-500" />
              <h3 className="font-semibold text-gray-300">Produtos Vendidos</h3>
            </div>
            <p className="text-sm text-gray-400 mb-4">Produtos vendidos no período</p>
            <Button
              onClick={() => gerarRelatorio('produtos-vendidos')}
              disabled={loading}
              className="w-full bg-amber-500 hover:bg-amber-600 text-white"
            >
              {loading && relatorioSelecionado === 'produtos-vendidos' ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <BarChart3 className="h-4 w-4 mr-2" />
              )}
              Gerar Relatório
            </Button>
          </Card>
        </div>
      </div>

      {/* Relatórios de Clientes */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-300 flex items-center gap-2">
          <Users className="h-6 w-6 text-amber-500" />
          Relatórios de Clientes
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 11. Clientes Compras por Período */}
          <Card className="p-4 bg-zinc-900 border-amber-500/20 hover:border-amber-500/40 transition-colors">
            <div className="flex items-center gap-2 mb-3">
              <Users className="h-5 w-5 text-amber-500" />
              <h3 className="font-semibold text-gray-300">Histórico de Clientes</h3>
            </div>
            <p className="text-sm text-gray-400 mb-4">Histórico de serviços prestados por cliente</p>
            <Button
              onClick={() => gerarRelatorio('clientes-compras')}
              disabled={loading}
              className="w-full bg-amber-500 hover:bg-amber-600 text-white"
            >
              {loading && relatorioSelecionado === 'clientes-compras' ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <BarChart3 className="h-4 w-4 mr-2" />
              )}
              Gerar Relatório
            </Button>
          </Card>
        </div>
      </div>

      {/* Área de Visualização do Relatório */}
      {dadosRelatorio && relatorioSelecionado && (
        <Card className="p-6 bg-zinc-900 border-amber-500/20">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-300">Resultado do Relatório</h3>
            <div className="flex gap-2">
              <Button
                onClick={exportarExcel}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                Exportar Excel
              </Button>
              <Button
                onClick={exportarPDF}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                <FileDown className="h-4 w-4 mr-2" />
                Exportar PDF
              </Button>
            </div>
          </div>
          
          {/* Renderizar dados do relatório em formato de tabela */}
          <div className="overflow-x-auto">
            {dadosRelatorio.resumo && (
              <div className="mb-6 p-4 bg-zinc-800 rounded-lg">
                <h4 className="font-semibold text-gray-300 mb-3">Resumo</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.entries(dadosRelatorio.resumo as Record<string, unknown>).map(([key, value]) => (
                    <div key={key}>
                      <p className="text-sm text-gray-400">{key.replace(/_/g, ' ').toUpperCase()}</p>
                      <p className="text-lg font-bold text-amber-500">
                        {typeof value === 'number' && key.includes('valor') 
                          ? formatarPreco(value) 
                          : String(value)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Renderizar produtos para relatório de produtos-estoque */}
            {relatorioSelecionado === 'produtos-estoque' && dadosRelatorio.produtos && dadosRelatorio.produtos.length > 0 && (
              <div className="mb-6">
                <h4 className="font-semibold text-gray-300 mb-3">Lista de Produtos</h4>
                <table className="w-full text-sm text-left text-gray-300">
                  <thead className="text-xs uppercase bg-zinc-800 text-gray-400">
                    <tr>
                      <th className="px-4 py-3">CÓDIGO</th>
                      <th className="px-4 py-3">DESCRIÇÃO</th>
                      <th className="px-4 py-3">FORNECEDOR</th>
                      <th className="px-4 py-3">ESTOQUE</th>
                      <th className="px-4 py-3">PREÇO VENDA</th>
                      <th className="px-4 py-3">VALOR TOTAL ESTOQUE</th>
                      <th className="px-4 py-3">STATUS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dadosRelatorio.produtos.map((produto: any, index: number) => (
                      <tr key={index} className={`border-b border-zinc-700 hover:bg-zinc-800 ${!produto.is_active ? 'opacity-60' : ''}`}>
                        <td className="px-4 py-3">{produto.codigo || '-'}</td>
                        <td className="px-4 py-3">{produto.descricao || '-'}</td>
                        <td className="px-4 py-3">{produto.fornecedor || '-'}</td>
                        <td className="px-4 py-3">{produto.quantidade_estoque || 0}</td>
                        <td className="px-4 py-3">{formatarPreco(produto.preco_venda)}</td>
                        <td className="px-4 py-3">{formatarPreco(produto.valor_total_estoque)}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded text-xs ${produto.is_active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                            {produto.is_active ? 'Ativo' : 'Inativo'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Renderizar dados para outros relatórios */}
            {relatorioSelecionado !== 'produtos-estoque' && dadosRelatorio.dados && dadosRelatorio.dados.length > 0 && (
              <table className="w-full text-sm text-left text-gray-300">
                <thead className="text-xs uppercase bg-zinc-800 text-gray-400">
                  <tr>
                    {Object.keys(dadosRelatorio.dados[0]).map((key) => (
                      <th key={key} className="px-4 py-3">
                        {key.replace(/_/g, ' ').toUpperCase()}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {dadosRelatorio.dados.map((row: any, index: number) => (
                    <tr key={index} className="border-b border-zinc-700 hover:bg-zinc-800">
                      {Object.entries(row).map(([key, value]) => (
                        <td key={key} className="px-4 py-3">
                          {typeof value === 'number' && (key.includes('valor') || key.includes('preco') || key.includes('total'))
                            ? formatarPreco(value)
                            : typeof value === 'string' && value.match(/^\d{4}-\d{2}-\d{2}/)
                            ? formatarData(value)
                            : value?.toString() || '-'}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {dadosRelatorio.detalhamento && dadosRelatorio.detalhamento.length > 0 && (
              <div className="mt-6">
                <h4 className="font-semibold text-gray-300 mb-3">Detalhamento por Período</h4>
                <table className="w-full text-sm text-left text-gray-300">
                  <thead className="text-xs uppercase bg-zinc-800 text-gray-400">
                    <tr>
                      {Object.keys(dadosRelatorio.detalhamento[0]).map((key) => (
                        <th key={key} className="px-4 py-3">
                          {key.replace(/_/g, ' ').toUpperCase()}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {dadosRelatorio.detalhamento.map((row: any, index: number) => (
                      <tr key={index} className="border-b border-zinc-700 hover:bg-zinc-800">
                        {Object.entries(row).map(([key, value]) => (
                          <td key={key} className="px-4 py-3">
                            {typeof value === 'number' && (key.includes('valor') || key.includes('total'))
                              ? formatarPreco(value)
                              : typeof value === 'string' && value.match(/^\d{4}-\d{2}-\d{2}/)
                              ? formatarData(value)
                              : value?.toString() || '-'}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {(!dadosRelatorio.dados || dadosRelatorio.dados.length === 0) && 
             (!dadosRelatorio.produtos || dadosRelatorio.produtos.length === 0) &&
             (!dadosRelatorio.detalhamento || dadosRelatorio.detalhamento.length === 0) && (
              <div className="text-center py-8 text-gray-400">
                <p>Nenhum dado encontrado.</p>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  )
}

