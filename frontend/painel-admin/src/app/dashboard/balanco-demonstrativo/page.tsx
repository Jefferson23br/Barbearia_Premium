'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { FileBarChart, Plus, Edit, Trash2, Search, Calendar, Download, Loader2, X, Save } from 'lucide-react'
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
import { getApiBaseUrl } from '@/lib/api'

interface Categoria {
  id: string
  nome: string
  descricao?: string | null
  codigo?: string | null
  codigo_hierarquico?: string | null
  tipo: string
  is_active: boolean
  nivel?: number
  categoria_pai_id?: string | null
  categoria_pai_nome?: string | null
  total_despesas?: number
  filhos?: Categoria[]
}

interface RelatorioData {
  periodo: {
    data_inicio: string
    data_fim: string
    meses: Array<{
      ano: number
      mes: number
      primeiro_dia: string
      ultimo_dia: string
      label: string
    }>
  }
  receitas: {
    total_geral: Record<string, number>
    por_tipo: {
      produtos: Record<string, number>
      servicos: Record<string, number>
    }
    por_funcionario: Array<{
      funcionario_id: string | null
      funcionario_nome: string
      totais_por_mes: Record<string, number>
    }>
  }
  despesas: {
    total_geral: Record<string, number>
    por_categoria: Array<{
      categoria_id: string | null
      categoria_nome: string
      categoria_codigo: string
      categoria_nivel: number
      categoria_pai_id: string | null
      is_header?: boolean
      despesas: Array<{ descricao: string }>
      totais_por_mes: Record<string, number>
    }>
  }
  comparativo: Record<string, {
    receita: number
    despesa: number
    saldo: number
    porcentagem: number
  }>
}
function formatarPreco(valor: number | string): string {
  const num = typeof valor === 'string' ? parseFloat(valor) : valor
  if (isNaN(num)) return 'R$ 0,00'
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(num)
}

// Função para renderizar categorias hierárquicas
function renderizarCategoriasHierarquicas(
  categorias: Categoria[],
  nivel: number = 0,
  onEdit: (cat: Categoria) => void,
  onDelete: (cat: Categoria) => void,
  onCreateSub: (cat: Categoria) => void,
  podeEditar: boolean,
  podeExcluir: boolean
): React.ReactNode {
  return categorias.map((categoria) => (
    <React.Fragment key={categoria.id}>
      <Card className={`bg-zinc-800 border-zinc-700 ${nivel > 0 ? 'ml-6' : ''}`}>
        <div className="p-4 flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              {categoria.codigo_hierarquico && (
                <span className="text-sm font-mono text-amber-500 font-bold">
                  {categoria.codigo_hierarquico}
                </span>
              )}
              <h3 className={`font-bold text-white ${nivel === 0 ? 'text-lg' : nivel === 1 ? 'text-base' : 'text-sm'}`}>
                {categoria.nome}
              </h3>
              {categoria.codigo && !categoria.codigo_hierarquico && (
                <span className="text-xs text-gray-400 bg-zinc-700 px-2 py-1 rounded">
                  {categoria.codigo}
                </span>
              )}
              <span className={`text-xs px-2 py-1 rounded ${
                categoria.tipo === 'despesa' 
                  ? 'bg-red-500/10 text-red-500 border border-red-500/30'
                  : categoria.tipo === 'receita'
                  ? 'bg-green-500/10 text-green-500 border border-green-500/30'
                  : 'bg-blue-500/10 text-blue-500 border border-blue-500/30'
              }`}>
                {categoria.tipo}
              </span>
              <span className="text-xs text-gray-500 bg-zinc-700 px-2 py-1 rounded">
                Nível {categoria.nivel || 1}
              </span>
              {!categoria.is_active && (
                <span className="text-xs text-gray-500">Inativa</span>
              )}
            </div>
            {categoria.descricao && (
              <p className="text-sm text-gray-400 mt-1">{categoria.descricao}</p>
            )}
            {categoria.total_despesas !== undefined && (
              <p className="text-xs text-gray-500 mt-1">
                {categoria.total_despesas} despesa(s) vinculada(s)
              </p>
            )}
          </div>
          <div className="flex gap-2">
            {podeEditar && categoria.nivel !== undefined && categoria.nivel < 3 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onCreateSub(categoria)}
                className="border-green-500/20 text-green-500 hover:bg-green-500/10"
                title="Criar subcategoria"
              >
                <Plus className="h-4 w-4" />
              </Button>
            )}
            {podeEditar && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(categoria)}
                className="border-amber-500/20 text-gray-300 hover:bg-amber-500/10"
              >
                <Edit className="h-4 w-4" />
              </Button>
            )}
            {podeExcluir && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDelete(categoria)}
                className="border-red-500/20 text-red-500 hover:bg-red-500/10"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </Card>
      {categoria.filhos && categoria.filhos.length > 0 && (
        <div className="mt-2">
          {renderizarCategoriasHierarquicas(
            categoria.filhos,
            nivel + 1,
            onEdit,
            onDelete,
            onCreateSub,
            podeEditar,
            podeExcluir
          )}
        </div>
      )}
    </React.Fragment>
  ))
}

export default function BalancoDemonstrativoPage() {
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [categoriasFlat, setCategoriasFlat] = useState<Categoria[]>([])
  const [categoriasFiltradas, setCategoriasFiltradas] = useState<Categoria[]>([])
  const [loading, setLoading] = useState(false)
  const [salvando, setSalvando] = useState(false)
  const [mensagem, setMensagem] = useState<{ tipo: 'sucesso' | 'erro' | null; texto: string }>({ tipo: null, texto: '' })
  const [buscaCategoria, setBuscaCategoria] = useState('')
  const [mostrarModalCategoria, setMostrarModalCategoria] = useState(false)
  const [categoriaEditando, setCategoriaEditando] = useState<Categoria | null>(null)
  const [formDataCategoria, setFormDataCategoria] = useState({
    nome: '',
    descricao: '',
    codigo: '',
    codigo_hierarquico: '',
    tipo: 'despesa',
    nivel: 1,
    categoria_pai_id: '',
  })

  // Relatório
  const [dataInicio, setDataInicio] = useState('')
  const [dataFim, setDataFim] = useState('')
  const [relatorioData, setRelatorioData] = useState<RelatorioData | null>(null)
  const [carregandoRelatorio, setCarregandoRelatorio] = useState(false)

  const { podeAcessar, podeEditar, podeExcluir } = usePermissions()

  const podeAcessarBalanco = podeAcessar('balanco_demonstrativo')
  const podeEditarBalanco = podeEditar('balanco_demonstrativo')
  const podeExcluirBalanco = podeExcluir('balanco_demonstrativo')

  // Carregar categorias
  const carregarCategorias = useCallback(async () => {
    if (!podeAcessarBalanco) return

    setLoading(true)
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

      const response = await fetch(`${apiUrl}/api/v1/balanco-demonstrativo/categorias`, {
        method: 'GET',
        headers,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao carregar categorias')
      }

      setCategorias(data.categorias || [])
      setCategoriasFlat(data.categorias_flat || [])
      // Para filtro, usar lista flat (achatada)
      setCategoriasFiltradas(data.categorias_flat || [])
    } catch (error: any) {
      console.error('Erro ao carregar categorias:', error)
      setMensagem({ tipo: 'erro', texto: error.message || 'Erro ao carregar categorias' })
    } finally {
      setLoading(false)
    }
  }, [podeAcessarBalanco])

  useEffect(() => {
    carregarCategorias()
  }, [carregarCategorias])

  // Filtrar categorias
  useEffect(() => {
    if (!buscaCategoria) {
      setCategoriasFiltradas(categorias)
      return
    }

    const filtradas = categorias.filter(cat =>
      cat.nome.toLowerCase().includes(buscaCategoria.toLowerCase()) ||
      cat.descricao?.toLowerCase().includes(buscaCategoria.toLowerCase()) ||
      cat.codigo?.toLowerCase().includes(buscaCategoria.toLowerCase())
    )
    setCategoriasFiltradas(filtradas)
  }, [buscaCategoria, categorias])

  // Abrir modal de categoria
  const abrirModalCategoria = (categoria?: Categoria, nivel?: number, categoriaPaiId?: string) => {
    if (categoria) {
      setCategoriaEditando(categoria)
      setFormDataCategoria({
        nome: categoria.nome,
        descricao: categoria.descricao || '',
        codigo: categoria.codigo || '',
        codigo_hierarquico: categoria.codigo_hierarquico || '',
        tipo: categoria.tipo,
        nivel: categoria.nivel || 1,
        categoria_pai_id: categoria.categoria_pai_id || '',
      })
    } else {
      setCategoriaEditando(null)
      setFormDataCategoria({
        nome: '',
        descricao: '',
        codigo: '',
        codigo_hierarquico: '',
        tipo: 'despesa',
        nivel: nivel || 1,
        categoria_pai_id: categoriaPaiId || '',
      })
    }
    setMostrarModalCategoria(true)
  }

  // Salvar categoria
  const salvarCategoria = async () => {
    if (!formDataCategoria.nome.trim()) {
      setMensagem({ tipo: 'erro', texto: 'Nome é obrigatório' })
      return
    }

    setSalvando(true)
    setMensagem({ tipo: null, texto: '' })

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

      const url = categoriaEditando
        ? `${apiUrl}/api/v1/balanco-demonstrativo/categorias/${categoriaEditando.id}`
        : `${apiUrl}/api/v1/balanco-demonstrativo/categorias`

      // Preparar dados para envio
      const dadosEnvio: any = {
        nome: formDataCategoria.nome.trim(),
        descricao: formDataCategoria.descricao?.trim() || null,
        codigo: formDataCategoria.codigo?.trim() || null,
        codigo_hierarquico: formDataCategoria.codigo_hierarquico?.trim() || null,
        tipo: formDataCategoria.tipo,
        nivel: parseInt(String(formDataCategoria.nivel || 1)),
      }

      // Só incluir categoria_pai_id se não for vazio
      if (formDataCategoria.categoria_pai_id && formDataCategoria.categoria_pai_id.trim() !== '') {
        dadosEnvio.categoria_pai_id = formDataCategoria.categoria_pai_id.trim()
      } else {
        dadosEnvio.categoria_pai_id = null
      }

      const response = await fetch(url, {
        method: categoriaEditando ? 'PUT' : 'POST',
        headers,
        body: JSON.stringify(dadosEnvio),
      })

      const data = await response.json()

      if (!response.ok) {
        const errorMsg = data.error || data.details || 'Erro ao salvar categoria'
        console.error('Erro do servidor:', data)
        throw new Error(errorMsg)
      }

      setMensagem({ tipo: 'sucesso', texto: categoriaEditando ? 'Categoria atualizada com sucesso!' : 'Categoria criada com sucesso!' })
      setMostrarModalCategoria(false)
      await carregarCategorias()

      setTimeout(() => {
        setMensagem({ tipo: null, texto: '' })
      }, 3000)
    } catch (error: any) {
      console.error('Erro ao salvar categoria:', error)
      setMensagem({ tipo: 'erro', texto: error.message || 'Erro ao salvar categoria' })
    } finally {
      setSalvando(false)
    }
  }

  // Excluir categoria
  const excluirCategoria = async (categoria: Categoria) => {
    if (!confirm(`Tem certeza que deseja excluir a categoria "${categoria.nome}"?`)) {
      return
    }

    setSalvando(true)
    setMensagem({ tipo: null, texto: '' })

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

      const response = await fetch(`${apiUrl}/api/v1/balanco-demonstrativo/categorias/${categoria.id}`, {
        method: 'DELETE',
        headers,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao excluir categoria')
      }

      setMensagem({ tipo: 'sucesso', texto: 'Categoria excluída com sucesso!' })
      await carregarCategorias()

      setTimeout(() => {
        setMensagem({ tipo: null, texto: '' })
      }, 3000)
    } catch (error: any) {
      console.error('Erro ao excluir categoria:', error)
      setMensagem({ tipo: 'erro', texto: error.message || 'Erro ao excluir categoria' })
    } finally {
      setSalvando(false)
    }
  }

  // Gerar relatório
  const gerarRelatorio = async () => {
    if (!dataInicio || !dataFim) {
      setMensagem({ tipo: 'erro', texto: 'Selecione a data inicial e final' })
      return
    }

    setCarregandoRelatorio(true)
    setMensagem({ tipo: null, texto: '' })

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

      const response = await fetch(
        `${apiUrl}/api/v1/balanco-demonstrativo/relatorio?data_inicio=${encodeURIComponent(dataInicio)}&data_fim=${encodeURIComponent(dataFim)}`,
        {
          method: 'GET',
          headers,
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao gerar relatório')
      }

      setRelatorioData(data)
    } catch (error: any) {
      console.error('Erro ao gerar relatório:', error)
      setMensagem({ tipo: 'erro', texto: error.message || 'Erro ao gerar relatório' })
    } finally {
      setCarregandoRelatorio(false)
    }
  }

  if (!podeAcessarBalanco) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-500 mb-2">Acesso Negado</h1>
          <p className="text-gray-400">Você não tem permissão para acessar esta página.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-2">
          <FileBarChart className="h-8 w-8 text-amber-500" />
          Balanço Demonstrativo
        </h1>
        <p className="text-gray-400 mt-1">Gerencie categorias de custo e visualize relatórios financeiros</p>
      </div>

      {/* Mensagem */}
      {mensagem.tipo && (
        <div
          className={`p-4 rounded-lg border ${
            mensagem.tipo === 'sucesso'
              ? 'bg-green-500/10 border-green-500/30 text-green-500'
              : 'bg-red-500/10 border-red-500/30 text-red-500'
          }`}
        >
          {mensagem.texto}
        </div>
      )}

      {/* Tabs */}
      <Tabs defaultValue="categorias" className="w-full">
        <TabsList className="bg-zinc-800 border-amber-500/20">
          <TabsTrigger value="categorias" className="text-gray-400 data-[state=active]:bg-amber-500/10 data-[state=active]:text-amber-500">
            Categorias
          </TabsTrigger>
          <TabsTrigger value="relatorio" className="text-gray-400 data-[state=active]:bg-amber-500/10 data-[state=active]:text-amber-500">
            Relatório
          </TabsTrigger>
        </TabsList>

        {/* Aba Categorias */}
        <TabsContent value="categorias" className="space-y-4">
          <Card className="bg-zinc-900 border-amber-500/20">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white">Categorias de Custo</h2>
                {podeEditarBalanco && (
                  <Button
                    onClick={() => abrirModalCategoria()}
                    className="bg-amber-500 hover:bg-amber-600 text-white"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Nova Categoria
                  </Button>
                )}
              </div>

              {/* Busca */}
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Buscar categoria..."
                    value={buscaCategoria}
                    onChange={(e) => setBuscaCategoria(e.target.value)}
                    className="pl-10 bg-zinc-800 border-zinc-700 text-white"
                  />
                </div>
              </div>

              {/* Lista de categorias */}
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
                </div>
              ) : categoriasFiltradas.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  {buscaCategoria ? 'Nenhuma categoria encontrada' : 'Nenhuma categoria cadastrada'}
                </div>
              ) : buscaCategoria ? (
                // Lista flat quando há busca
                <div className="space-y-2">
                  {categoriasFiltradas.map((categoria) => (
                    <Card key={categoria.id} className="bg-zinc-800 border-zinc-700">
                      <div className="p-4 flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            {categoria.codigo_hierarquico && (
                              <span className="text-sm font-mono text-amber-500 font-bold">
                                {categoria.codigo_hierarquico}
                              </span>
                            )}
                            <h3 className="font-bold text-white">{categoria.nome}</h3>
                            {categoria.codigo && !categoria.codigo_hierarquico && (
                              <span className="text-xs text-gray-400 bg-zinc-700 px-2 py-1 rounded">
                                {categoria.codigo}
                              </span>
                            )}
                            <span className={`text-xs px-2 py-1 rounded ${
                              categoria.tipo === 'despesa' 
                                ? 'bg-red-500/10 text-red-500 border border-red-500/30'
                                : categoria.tipo === 'receita'
                                ? 'bg-green-500/10 text-green-500 border border-green-500/30'
                                : 'bg-blue-500/10 text-blue-500 border border-blue-500/30'
                            }`}>
                              {categoria.tipo}
                            </span>
                            <span className="text-xs text-gray-500 bg-zinc-700 px-2 py-1 rounded">
                              Nível {categoria.nivel || 1}
                            </span>
                            {!categoria.is_active && (
                              <span className="text-xs text-gray-500">Inativa</span>
                            )}
                          </div>
                          {categoria.descricao && (
                            <p className="text-sm text-gray-400 mt-1">{categoria.descricao}</p>
                          )}
                          {categoria.total_despesas !== undefined && (
                            <p className="text-xs text-gray-500 mt-1">
                              {categoria.total_despesas} despesa(s) vinculada(s)
                            </p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          {podeEditarBalanco && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => abrirModalCategoria(categoria)}
                              className="border-amber-500/20 text-gray-300 hover:bg-amber-500/10"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          )}
                          {podeExcluirBalanco && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => excluirCategoria(categoria)}
                              className="border-red-500/20 text-red-500 hover:bg-red-500/10"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                // Lista hierárquica quando não há busca
                <div className="space-y-2">
                  {renderizarCategoriasHierarquicas(
                    categorias,
                    0,
                    (cat) => abrirModalCategoria(cat),
                    (cat) => excluirCategoria(cat),
                    (cat) => abrirModalCategoria(undefined, (cat.nivel || 1) + 1, cat.id),
                    podeEditarBalanco,
                    podeExcluirBalanco
                  )}
                </div>
              )}
            </div>
          </Card>
        </TabsContent>

        {/* Aba Relatório */}
        <TabsContent value="relatorio" className="space-y-4">
          <Card className="bg-zinc-900 border-amber-500/20">
            <div className="p-6">
              <h2 className="text-xl font-bold text-white mb-4">Relatório do Balanço Demonstrativo</h2>

              {/* Filtros */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <Label className="text-gray-300">Data Inicial</Label>
                  <Input
                    type="date"
                    value={dataInicio}
                    onChange={(e) => setDataInicio(e.target.value)}
                    className="bg-zinc-800 border-zinc-700 text-white"
                  />
                </div>
                <div>
                  <Label className="text-gray-300">Data Final</Label>
                  <Input
                    type="date"
                    value={dataFim}
                    onChange={(e) => setDataFim(e.target.value)}
                    className="bg-zinc-800 border-zinc-700 text-white"
                  />
                </div>
                <div className="flex items-end">
                  <Button
                    onClick={gerarRelatorio}
                    disabled={carregandoRelatorio || !dataInicio || !dataFim}
                    className="bg-amber-500 hover:bg-amber-600 text-white w-full"
                  >
                    {carregandoRelatorio ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Gerando...
                      </>
                    ) : (
                      <>
                        <Calendar className="h-4 w-4 mr-2" />
                        Gerar Relatório
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Relatório */}
              {relatorioData && (
                <div className="mt-6 space-y-6">
                  {/* Período */}
                  <div className="text-sm text-gray-400">
                    Período: {new Date(relatorioData.periodo.data_inicio).toLocaleDateString('pt-BR')} a{' '}
                    {new Date(relatorioData.periodo.data_fim).toLocaleDateString('pt-BR')}
                  </div>

                  {/* Receitas */}
                  <div>
                    <h3 className="text-lg font-bold text-white mb-3">Receitas</h3>
                    
                    {/* 1. Total Geral */}
                    <div className="mb-4">
                      <h4 className="text-md font-semibold text-gray-300 mb-2">Total Geral</h4>
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                          <thead>
                            <tr className="bg-zinc-800">
                              <th className="border border-zinc-700 p-2 text-left text-gray-300">Mês</th>
                              {relatorioData.periodo.meses.map((mes) => (
                                <th key={mes.label} className="border border-zinc-700 p-2 text-right text-gray-300">
                                  {mes.label}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            <tr className="bg-zinc-900/50">
                              <td className="border border-zinc-700 p-2 text-white font-medium">Valor Total</td>
                              {relatorioData.periodo.meses.map((mes) => {
                                const mesKey = mes.primeiro_dia
                                const valor = relatorioData.receitas.total_geral[mesKey] || 0
                                return (
                                  <td key={mes.label} className="border border-zinc-700 p-2 text-right text-white font-semibold">
                                    {formatarPreco(valor)}
                                  </td>
                                )
                              })}
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* 2. Por Tipo (Produtos e Serviços) */}
                    <div className="mb-4">
                      <h4 className="text-md font-semibold text-gray-300 mb-2">Por Tipo</h4>
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                          <thead>
                            <tr className="bg-zinc-800">
                              <th className="border border-zinc-700 p-2 text-left text-gray-300">Tipo</th>
                              {relatorioData.periodo.meses.map((mes) => (
                                <th key={mes.label} className="border border-zinc-700 p-2 text-right text-gray-300">
                                  {mes.label}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            <tr className="bg-zinc-900/50">
                              <td className="border border-zinc-700 p-2 text-white font-medium">Produtos</td>
                              {relatorioData.periodo.meses.map((mes) => {
                                const mesKey = mes.primeiro_dia
                                const valor = relatorioData.receitas.por_tipo.produtos[mesKey] || 0
                                return (
                                  <td key={mes.label} className="border border-zinc-700 p-2 text-right text-white">
                                    {formatarPreco(valor)}
                                  </td>
                                )
                              })}
                            </tr>
                            <tr className="bg-zinc-900/50">
                              <td className="border border-zinc-700 p-2 text-white font-medium">Serviços</td>
                              {relatorioData.periodo.meses.map((mes) => {
                                const mesKey = mes.primeiro_dia
                                const valor = relatorioData.receitas.por_tipo.servicos[mesKey] || 0
                                return (
                                  <td key={mes.label} className="border border-zinc-700 p-2 text-right text-white">
                                    {formatarPreco(valor)}
                                  </td>
                                )
                              })}
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* 3. Por Funcionário */}
                    <div className="mb-4">
                      <h4 className="text-md font-semibold text-gray-300 mb-2">Por Funcionário</h4>
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                          <thead>
                            <tr className="bg-zinc-800">
                              <th className="border border-zinc-700 p-2 text-left text-gray-300">Funcionário</th>
                              {relatorioData.periodo.meses.map((mes) => (
                                <th key={mes.label} className="border border-zinc-700 p-2 text-right text-gray-300">
                                  {mes.label}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {relatorioData.receitas.por_funcionario.length === 0 ? (
                              <tr>
                                <td colSpan={relatorioData.periodo.meses.length + 1} className="border border-zinc-700 p-4 text-center text-gray-400">
                                  Nenhuma venda encontrada no período
                                </td>
                              </tr>
                            ) : (
                              relatorioData.receitas.por_funcionario.map((funcionario, idx) => (
                                <tr key={idx} className="bg-zinc-900/50 hover:bg-zinc-800/50">
                                  <td className="border border-zinc-700 p-2 text-white font-medium">
                                    {funcionario.funcionario_nome}
                                  </td>
                                  {relatorioData.periodo.meses.map((mes) => {
                                    const mesKey = mes.primeiro_dia
                                    const valor = funcionario.totais_por_mes[mesKey] || 0
                                    return (
                                      <td key={mes.label} className="border border-zinc-700 p-2 text-right text-white">
                                        {valor > 0 ? formatarPreco(valor) : '-'}
                                      </td>
                                    )
                                  })}
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>

                  {/* Despesas */}
                  <div>
                    <h3 className="text-lg font-bold text-white mb-3">Despesas</h3>
                    
                    {/* 1. Total Geral */}
                    <div className="mb-4">
                      <h4 className="text-md font-semibold text-gray-300 mb-2">Total Geral</h4>
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                          <thead>
                            <tr className="bg-zinc-800">
                              <th className="border border-zinc-700 p-2 text-left text-gray-300">Mês</th>
                              {relatorioData.periodo.meses.map((mes) => (
                                <th key={mes.label} className="border border-zinc-700 p-2 text-right text-gray-300">
                                  {mes.label}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            <tr className="bg-zinc-900/50">
                              <td className="border border-zinc-700 p-2 text-white font-medium">Valor Total</td>
                              {relatorioData.periodo.meses.map((mes) => {
                                const mesKey = mes.primeiro_dia
                                const valor = relatorioData.despesas.total_geral[mesKey] || 0
                                return (
                                  <td key={mes.label} className="border border-zinc-700 p-2 text-right text-white font-semibold">
                                    {formatarPreco(valor)}
                                  </td>
                                )
                              })}
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* 2. Por Categoria (Hierárquico) */}
                    <div className="mb-4">
                      <h4 className="text-md font-semibold text-gray-300 mb-2">Por Categoria</h4>
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                          <thead>
                            <tr className="bg-zinc-800">
                              <th className="border border-zinc-700 p-2 text-left text-gray-300">Código / Categoria</th>
                              {relatorioData.periodo.meses.map((mes) => (
                                <th key={mes.label} className="border border-zinc-700 p-2 text-right text-gray-300">
                                  {mes.label}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {relatorioData.despesas.por_categoria.length === 0 ? (
                              <tr>
                                <td colSpan={relatorioData.periodo.meses.length + 1} className="border border-zinc-700 p-4 text-center text-gray-400">
                                  Nenhuma despesa encontrada no período
                                </td>
                              </tr>
                            ) : (
                              relatorioData.despesas.por_categoria.map((categoria, idx) => {
                                const isHeader = categoria.is_header === true
                                const nivel = categoria.categoria_nivel || 1
                                const indentacao = nivel === 1 ? '' : nivel === 2 ? 'pl-6' : 'pl-12'
                                const bgColor = nivel === 1 ? 'bg-zinc-800/50' : nivel === 2 ? 'bg-zinc-800/30' : 'bg-zinc-900/50'
                                
                                return (
                                  <tr key={idx} className={`${bgColor} hover:bg-zinc-800/50 ${isHeader ? 'font-bold' : ''}`}>
                                    <td className={`border border-zinc-700 p-2 text-white font-medium ${indentacao}`}>
                                      <div className="flex items-center gap-2">
                                        <span className="font-mono text-amber-500 font-bold text-sm">
                                          {categoria.categoria_codigo}
                                        </span>
                                        <span className={isHeader ? 'text-lg' : ''}>{categoria.categoria_nome}</span>
                                      </div>
                                    </td>
                                    {relatorioData.periodo.meses.map((mes) => {
                                      const mesKey = mes.primeiro_dia
                                      const valor = categoria.totais_por_mes && categoria.totais_por_mes[mesKey] ? categoria.totais_por_mes[mesKey] : 0
                                      return (
                                        <td key={mes.label} className={`border border-zinc-700 p-2 text-right ${isHeader ? 'text-amber-400 font-bold' : 'text-white'}`}>
                                          {valor > 0 ? formatarPreco(valor) : '-'}
                                        </td>
                                      )
                                    })}
                                  </tr>
                                )
                              })
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>

                  {/* Comparativo Receitas x Despesas */}
                  <div>
                    <h3 className="text-lg font-bold text-white mb-3">Comparativo Receitas x Despesas</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="bg-zinc-800">
                            <th className="border border-zinc-700 p-2 text-left text-gray-300">Mês</th>
                            <th className="border border-zinc-700 p-2 text-right text-gray-300">Receitas</th>
                            <th className="border border-zinc-700 p-2 text-right text-gray-300">Despesas</th>
                            <th className="border border-zinc-700 p-2 text-right text-gray-300">Saldo</th>
                            <th className="border border-zinc-700 p-2 text-right text-gray-300">% Despesa/Receita</th>
                          </tr>
                        </thead>
                        <tbody>
                          {relatorioData.periodo.meses.map((mes) => {
                            const mesKey = mes.primeiro_dia
                            const comp = relatorioData.comparativo[mesKey] || { receita: 0, despesa: 0, saldo: 0, porcentagem: 0 }
                            const saldoPositivo = comp.saldo >= 0
                            return (
                              <tr key={mes.label} className="bg-zinc-900/50 hover:bg-zinc-800/50">
                                <td className="border border-zinc-700 p-2 text-white font-medium">{mes.label}</td>
                                <td className="border border-zinc-700 p-2 text-right text-green-400 font-semibold">
                                  {formatarPreco(comp.receita)}
                                </td>
                                <td className="border border-zinc-700 p-2 text-right text-red-400 font-semibold">
                                  {formatarPreco(comp.despesa)}
                                </td>
                                <td className={`border border-zinc-700 p-2 text-right font-semibold ${
                                  saldoPositivo ? 'text-green-400' : 'text-red-400'
                                }`}>
                                  {formatarPreco(comp.saldo)}
                                </td>
                                <td className="border border-zinc-700 p-2 text-right text-white">
                                  {comp.porcentagem.toFixed(2)}%
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modal Categoria */}
      <Dialog open={mostrarModalCategoria} onOpenChange={setMostrarModalCategoria}>
        <DialogContent className="bg-zinc-900 border-amber-500/20 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-white">
              {categoriaEditando ? 'Editar Categoria' : 'Nova Categoria'}
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              {categoriaEditando ? 'Edite os dados da categoria' : 'Preencha os dados da nova categoria'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div>
              <Label className="text-gray-300">Nome *</Label>
              <Input
                value={formDataCategoria.nome}
                onChange={(e) => setFormDataCategoria({ ...formDataCategoria, nome: e.target.value })}
                className="bg-zinc-800 border-zinc-700 text-white"
                placeholder="Ex: Marketing, Aluguel, Salários"
              />
            </div>

            <div>
              <Label className="text-gray-300">Nível *</Label>
              <Select
                value={(formDataCategoria.nivel || 1).toString()}
                onValueChange={(value) => {
                  const novoNivel = parseInt(value)
                  setFormDataCategoria({ 
                    ...formDataCategoria, 
                    nivel: novoNivel,
                    categoria_pai_id: novoNivel === 1 ? '' : formDataCategoria.categoria_pai_id
                  })
                }}
                disabled={!!categoriaEditando}
              >
                <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="z-[100] bg-zinc-800 border-zinc-700 text-white">
                  <SelectItem value="1" className="focus:bg-zinc-700 focus:text-white">Nível 1 - Categoria</SelectItem>
                  <SelectItem value="2" className="focus:bg-zinc-700 focus:text-white">Nível 2 - Subcategoria</SelectItem>
                  <SelectItem value="3" className="focus:bg-zinc-700 focus:text-white">Nível 3 - Sub-subcategoria</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formDataCategoria.nivel > 1 && (
              <div>
                <Label className="text-gray-300">Categoria Pai *</Label>
                <Select
                  value={formDataCategoria.categoria_pai_id || 'none'}
                  onValueChange={(value) => setFormDataCategoria({ ...formDataCategoria, categoria_pai_id: value === 'none' ? '' : value })}
                >
                  <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                    <SelectValue placeholder="Selecione a categoria pai" />
                  </SelectTrigger>
                  <SelectContent className="z-[100] bg-zinc-800 border-zinc-700 text-white">
                    <SelectItem value="none" className="focus:bg-zinc-700 focus:text-white">Selecione...</SelectItem>
                    {categoriasFlat
                      .filter(cat => (cat.nivel || 1) === formDataCategoria.nivel - 1)
                      .map((cat) => (
                        <SelectItem key={cat.id} value={cat.id} className="focus:bg-zinc-700 focus:text-white">
                          {cat.codigo_hierarquico || cat.codigo || ''} {cat.nome}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div>
              <Label className="text-gray-300">Código Hierárquico *</Label>
              <Input
                value={formDataCategoria.codigo_hierarquico}
                onChange={(e) => setFormDataCategoria({ ...formDataCategoria, codigo_hierarquico: e.target.value })}
                className="bg-zinc-800 border-zinc-700 text-white"
                placeholder={formDataCategoria.nivel === 1 ? "Ex: 2" : formDataCategoria.nivel === 2 ? "Ex: 2.1" : "Ex: 2.1.1"}
              />
              <p className="text-xs text-gray-400 mt-1">
                Formato: {formDataCategoria.nivel === 1 ? "Número (ex: 2)" : formDataCategoria.nivel === 2 ? "Número.Número (ex: 2.1)" : "Número.Número.Número (ex: 2.1.1)"}
              </p>
            </div>

            <div>
              <Label className="text-gray-300">Código (Opcional)</Label>
              <Input
                value={formDataCategoria.codigo}
                onChange={(e) => setFormDataCategoria({ ...formDataCategoria, codigo: e.target.value })}
                className="bg-zinc-800 border-zinc-700 text-white"
                placeholder="Ex: MKT, ALU, SAL"
              />
            </div>

            <div>
              <Label className="text-gray-300">Tipo</Label>
              <Select
                value={formDataCategoria.tipo}
                onValueChange={(value) => setFormDataCategoria({ ...formDataCategoria, tipo: value })}
              >
                <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="z-[100] bg-zinc-800 border-zinc-700 text-white">
                  <SelectItem value="despesa" className="focus:bg-zinc-700 focus:text-white">Despesa</SelectItem>
                  <SelectItem value="receita" className="focus:bg-zinc-700 focus:text-white">Receita</SelectItem>
                  <SelectItem value="ambos" className="focus:bg-zinc-700 focus:text-white">Ambos</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-gray-300">Descrição</Label>
              <Textarea
                value={formDataCategoria.descricao}
                onChange={(e) => setFormDataCategoria({ ...formDataCategoria, descricao: e.target.value })}
                className="bg-zinc-800 border-zinc-700 text-white"
                placeholder="Descrição da categoria..."
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setMostrarModalCategoria(false)}
                className="border-zinc-700 text-gray-300 hover:bg-zinc-800"
              >
                <X className="h-4 w-4 mr-2" />
                Cancelar
              </Button>
              <Button
                onClick={salvarCategoria}
                disabled={salvando}
                className="bg-amber-500 hover:bg-amber-600 text-white"
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
