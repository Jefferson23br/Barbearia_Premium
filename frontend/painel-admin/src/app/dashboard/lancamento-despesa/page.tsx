'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { TrendingDown, Calendar, DollarSign, Percent, Save, Loader2, AlertCircle, CheckCircle2, X } from 'lucide-react'
import { usePermissions } from '@/hooks/usePermissions'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface Conta {
  id: string
  nome: string
  saldo_atual: number | string
}

interface CategoriaCusto {
  id: string
  nome: string
  codigo_hierarquico?: string | null
  nivel: number
}

export default function LancamentoDespesaPage() {
  const [contas, setContas] = useState<Conta[]>([])
  const [categorias, setCategorias] = useState<CategoriaCusto[]>([])
  const [loading, setLoading] = useState(false)
  const [salvando, setSalvando] = useState(false)
  const [mensagem, setMensagem] = useState<{ tipo: 'sucesso' | 'erro' | null; texto: string }>({ tipo: null, texto: '' })
  const { podeAcessar, podeEditar } = usePermissions()

  // Formulário principal
  const [formData, setFormData] = useState({
    data_emissao: new Date().toISOString().split('T')[0],
    data_vencimento: new Date().toISOString().split('T')[0],
    data_pagamento: '', // Opcional, se marcar como pago
    marcar_como_pago: false, // Checkbox para marcar como pago
    fornecedor: '',
    descricao: '',
    categoria_custo_id: '', // Opcional, será usado no Balanço
    valor_bruto: '',
    valor_liquido: '',
    forma_pagamento: '',
    caixa_id: '',
    primeiro_vencimento_boleto: '',
    observacoes: '',
  })

  // Carregar dados iniciais
  useEffect(() => {
    if (podeAcessar('lancamento_despesa')) {
      carregarContas()
      carregarCategorias()
    }
  }, [podeAcessar])

  const carregarContas = useCallback(async () => {
    try {
      const adminData = localStorage.getItem('admin')
      const admin = adminData ? JSON.parse(adminData) : null

      const apiUrl = 'https://api6.actusconsultoria.com.br'
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      }
      if (admin?.id) {
        headers['x-user-id'] = admin.id
        headers['x-user-tipo'] = admin.tipo_usuario || 'administrativo'
        headers['x-user-nome'] = admin.nome_completo || null
      }

      const response = await fetch(`${apiUrl}/api/v1/caixas/contas?is_active=true`, { headers })
      if (response.ok) {
        const data = await response.json()
        setContas(data.contas || [])
      }
    } catch (error) {
      console.error('Erro ao carregar contas:', error)
    }
  }, [])

  const carregarCategorias = useCallback(async () => {
    try {
      const adminData = localStorage.getItem('admin')
      const admin = adminData ? JSON.parse(adminData) : null

      const apiUrl = 'https://api6.actusconsultoria.com.br'
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      }
      if (admin?.id) {
        headers['x-user-id'] = admin.id
        headers['x-user-tipo'] = admin.tipo_usuario || 'administrativo'
        headers['x-user-nome'] = admin.nome_completo || null
      }

      const response = await fetch(`${apiUrl}/api/v1/balanco-demonstrativo/categorias`, { headers })
      if (response.ok) {
        const data = await response.json()
        // Usar categorias_flat que já vem ordenadas por código hierárquico
        const categoriasOrdenadas = (data.categorias_flat || []).sort((a: CategoriaCusto, b: CategoriaCusto) => {
          const codigoA = a.codigo_hierarquico || a.nome
          const codigoB = b.codigo_hierarquico || b.nome
          return codigoA.localeCompare(codigoB, undefined, { numeric: true, sensitivity: 'base' })
        })
        setCategorias(categoriasOrdenadas)
      }
    } catch (error) {
      console.error('Erro ao carregar categorias:', error)
    }
  }, [])

  // Calcular valor líquido quando valor bruto mudar
  useEffect(() => {
    if (formData.valor_bruto) {
      const valorBruto = parseFloat(formData.valor_bruto) || 0
      setFormData(prev => ({ ...prev, valor_liquido: valorBruto.toFixed(2) }))
    }
  }, [formData.valor_bruto])

  // Atualizar data_pagamento quando marcar_como_pago mudar
  useEffect(() => {
    if (formData.marcar_como_pago) {
      setFormData(prev => ({ ...prev, data_pagamento: prev.data_emissao }))
    } else {
      setFormData(prev => ({ ...prev, data_pagamento: '' }))
    }
  }, [formData.marcar_como_pago, formData.data_emissao])

  // Formatação
  const formatarPreco = (valor: number | string | null | undefined) => {
    if (!valor) return 'R$ 0,00'
    const num = typeof valor === 'string' ? parseFloat(valor) : valor
    if (isNaN(num)) return 'R$ 0,00'
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(num)
  }

  // Salvar despesa
  const salvarDespesa = async () => {
    if (!formData.data_emissao || !formData.data_vencimento || !formData.fornecedor || 
        !formData.descricao || !formData.valor_bruto || !formData.valor_liquido || 
        !formData.forma_pagamento || !formData.caixa_id) {
      setMensagem({ tipo: 'erro', texto: 'Preencha todos os campos obrigatórios' })
      return
    }

    if (parseFloat(formData.valor_liquido) <= 0) {
      setMensagem({ tipo: 'erro', texto: 'Valor líquido deve ser maior que zero' })
      return
    }

    // Validação para boleto
    if (formData.forma_pagamento.startsWith('boleto_') && !formData.primeiro_vencimento_boleto) {
      setMensagem({ tipo: 'erro', texto: 'Informe a data do primeiro vencimento para boleto' })
      return
    }

    setSalvando(true)
    setMensagem({ tipo: null, texto: '' })

    try {
      const adminData = localStorage.getItem('admin')
      const admin = adminData ? JSON.parse(adminData) : null

      const apiUrl = 'https://api6.actusconsultoria.com.br'
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      }
      if (admin?.id) {
        headers['x-user-id'] = admin.id
        headers['x-user-tipo'] = admin.tipo_usuario || 'administrativo'
        headers['x-user-nome'] = admin.nome_completo || null
      }

      const body = {
        data_emissao: formData.data_emissao,
        data_vencimento: formData.data_vencimento,
        data_pagamento: formData.marcar_como_pago ? formData.data_pagamento : null,
        fornecedor: formData.fornecedor,
        descricao: formData.descricao,
        categoria_custo_id: formData.categoria_custo_id || null,
        valor_bruto: parseFloat(formData.valor_bruto),
        valor_liquido: parseFloat(formData.valor_liquido),
        forma_pagamento: formData.forma_pagamento,
        caixa_id: formData.caixa_id,
        primeiro_vencimento_boleto: formData.forma_pagamento.startsWith('boleto_') 
          ? formData.primeiro_vencimento_boleto 
          : null,
        observacoes: formData.observacoes || null
      }

      const response = await fetch(`${apiUrl}/api/v1/despesas`, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao criar despesa')
      }

      setMensagem({ tipo: 'sucesso', texto: `Despesa ${data.despesa.ticket} criada com sucesso!` })
      
      // Limpar formulário
      setFormData({
        data_emissao: new Date().toISOString().split('T')[0],
        data_vencimento: new Date().toISOString().split('T')[0],
        data_pagamento: '',
        marcar_como_pago: false,
        fornecedor: '',
        descricao: '',
        categoria_custo_id: '',
        valor_bruto: '',
        valor_liquido: '',
        forma_pagamento: '',
        caixa_id: '',
        primeiro_vencimento_boleto: '',
        observacoes: '',
      })

      setTimeout(() => {
        setMensagem({ tipo: null, texto: '' })
      }, 5000)
    } catch (error: any) {
      console.error('Erro ao criar despesa:', error)
      setMensagem({ tipo: 'erro', texto: error.message || 'Erro ao criar despesa' })
    } finally {
      setSalvando(false)
    }
  }

  if (!podeAcessar('lancamento_despesa')) {
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

  // Opções de forma de pagamento (mesmas de vendas)
  const formasPagamento = [
    { value: 'dinheiro', label: 'Dinheiro' },
    { value: 'pix', label: 'Pix' },
    { value: 'ted', label: 'TED' },
    { value: 'cartao_1x', label: 'Cartão 1x' },
    { value: 'cartao_2x', label: 'Cartão 2x' },
    { value: 'cartao_3x', label: 'Cartão 3x' },
    { value: 'cartao_4x', label: 'Cartão 4x' },
    { value: 'cartao_5x', label: 'Cartão 5x' },
    { value: 'cartao_6x', label: 'Cartão 6x' },
    { value: 'cartao_7x', label: 'Cartão 7x' },
    { value: 'cartao_8x', label: 'Cartão 8x' },
    { value: 'cartao_9x', label: 'Cartão 9x' },
    { value: 'cartao_10x', label: 'Cartão 10x' },
    { value: 'boleto_1x', label: 'Boleto 1x' },
    { value: 'boleto_2x', label: 'Boleto 2x' },
    { value: 'boleto_3x', label: 'Boleto 3x' },
    { value: 'boleto_4x', label: 'Boleto 4x' },
    { value: 'boleto_5x', label: 'Boleto 5x' },
    { value: 'boleto_6x', label: 'Boleto 6x' },
    { value: 'boleto_7x', label: 'Boleto 7x' },
    { value: 'boleto_8x', label: 'Boleto 8x' },
    { value: 'boleto_9x', label: 'Boleto 9x' },
    { value: 'boleto_10x', label: 'Boleto 10x' },
  ]

  // Verificar se forma de pagamento requer primeiro vencimento
  const requerPrimeiroVencimento = formData.forma_pagamento.startsWith('boleto_')

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2 text-gray-300">
            <TrendingDown className="h-8 w-8 text-amber-500" />
            Lançamento de Despesa
          </h1>
          <p className="text-gray-400 mt-1">Registre despesas e controle pagamentos</p>
        </div>
      </div>

      {/* Mensagens */}
      <AnimatePresence>
        {mensagem.tipo && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`p-4 rounded-lg border flex items-center gap-2 ${
              mensagem.tipo === 'sucesso' 
                ? 'bg-green-500/10 border-green-500/30 text-green-500' 
                : 'bg-red-500/10 border-red-500/30 text-red-500'
            }`}
          >
            {mensagem.tipo === 'sucesso' ? (
              <CheckCircle2 className="h-5 w-5" />
            ) : (
              <AlertCircle className="h-5 w-5" />
            )}
            <p className="text-sm">{mensagem.texto}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Coluna Esquerda - Formulário Principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Dados Básicos */}
          <Card className="p-6 bg-zinc-900 border-amber-500/20">
            <h2 className="text-xl font-bold text-gray-300 mb-4">Dados da Despesa</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="data_emissao" className="text-gray-300">Data de Emissão *</Label>
                <Input
                  id="data_emissao"
                  type="date"
                  value={formData.data_emissao}
                  onChange={(e) => {
                    const newDate = e.target.value
                    setFormData({ 
                      ...formData, 
                      data_emissao: newDate,
                      data_pagamento: formData.marcar_como_pago ? newDate : formData.data_pagamento
                    })
                  }}
                  className="bg-zinc-800 border-amber-500/20 text-gray-300 focus:border-amber-500 focus:ring-amber-500/20"
                />
              </div>

              <div>
                <Label htmlFor="data_vencimento" className="text-gray-300">Data de Vencimento *</Label>
                <Input
                  id="data_vencimento"
                  type="date"
                  value={formData.data_vencimento}
                  onChange={(e) => setFormData({ ...formData, data_vencimento: e.target.value })}
                  className="bg-zinc-800 border-amber-500/20 text-gray-300 focus:border-amber-500 focus:ring-amber-500/20"
                />
              </div>

              <div className="md:col-span-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="marcar_como_pago"
                    checked={formData.marcar_como_pago}
                    onCheckedChange={(checked) => 
                      setFormData({ 
                        ...formData, 
                        marcar_como_pago: checked as boolean,
                        data_pagamento: checked ? formData.data_emissao : ''
                      })
                    }
                    className="border-amber-500/20 data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500"
                  />
                  <Label htmlFor="marcar_como_pago" className="text-gray-300 cursor-pointer">
                    Marcar como pago no ato do lançamento
                  </Label>
                </div>
                {formData.marcar_como_pago && (
                  <div className="mt-2">
                    <Label htmlFor="data_pagamento" className="text-gray-300">Data de Pagamento</Label>
                    <Input
                      id="data_pagamento"
                      type="date"
                      value={formData.data_pagamento}
                      onChange={(e) => setFormData({ ...formData, data_pagamento: e.target.value })}
                      className="bg-zinc-800 border-amber-500/20 text-gray-300 focus:border-amber-500 focus:ring-amber-500/20 mt-1"
                    />
                  </div>
                )}
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="fornecedor" className="text-gray-300">Fornecedor *</Label>
                <Input
                  id="fornecedor"
                  type="text"
                  value={formData.fornecedor}
                  onChange={(e) => setFormData({ ...formData, fornecedor: e.target.value })}
                  placeholder="Nome do fornecedor"
                  className="bg-zinc-800 border-amber-500/20 text-gray-300 focus:border-amber-500 focus:ring-amber-500/20"
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="descricao" className="text-gray-300">Descrição *</Label>
                <Input
                  id="descricao"
                  type="text"
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  placeholder="Ex: Aluguel, Conta de luz, Salários, etc."
                  className="bg-zinc-800 border-amber-500/20 text-gray-300 focus:border-amber-500 focus:ring-amber-500/20"
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="categoria_custo_id" className="text-gray-300">Categoria de Custo (Centro de Custo)</Label>
                <Select
                  value={formData.categoria_custo_id || 'none'}
                  onValueChange={(value) => setFormData({ ...formData, categoria_custo_id: value === 'none' ? '' : value })}
                >
                  <SelectTrigger className="bg-zinc-800 border-amber-500/20 text-gray-300">
                    <SelectValue placeholder="Selecione a categoria (opcional)" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-amber-500/20">
                    <SelectItem value="none" className="text-gray-300">
                      Sem categoria
                    </SelectItem>
                    {categorias.map((categoria) => {
                      const codigo = categoria.codigo_hierarquico || categoria.nome
                      const indentacao = '  '.repeat((categoria.nivel || 1) - 1)
                      return (
                        <SelectItem key={categoria.id} value={categoria.id} className="text-gray-300">
                          {indentacao}{codigo} - {categoria.nome}
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500 mt-1">
                  As categorias de custo são criadas no módulo de Balanço Demonstrativo
                </p>
              </div>

              <div>
                <Label htmlFor="valor_bruto" className="text-gray-300">Valor Bruto *</Label>
                <Input
                  id="valor_bruto"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.valor_bruto}
                  onChange={(e) => setFormData({ ...formData, valor_bruto: e.target.value })}
                  placeholder="0.00"
                  className="bg-zinc-800 border-amber-500/20 text-gray-300 focus:border-amber-500 focus:ring-amber-500/20"
                />
              </div>

              <div>
                <Label htmlFor="valor_liquido" className="text-gray-300">Valor Líquido *</Label>
                <Input
                  id="valor_liquido"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.valor_liquido}
                  onChange={(e) => setFormData({ ...formData, valor_liquido: e.target.value })}
                  placeholder="0.00"
                  className="bg-zinc-800 border-amber-500/20 text-gray-300 focus:border-amber-500 focus:ring-amber-500/20"
                />
              </div>
            </div>
          </Card>

          {/* Forma de Pagamento */}
          <Card className="p-6 bg-zinc-900 border-amber-500/20">
            <h2 className="text-xl font-bold text-gray-300 mb-4">Forma de Pagamento</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="forma_pagamento" className="text-gray-300">Forma de Pagamento *</Label>
                <Select
                  value={formData.forma_pagamento}
                  onValueChange={(value) => setFormData({ ...formData, forma_pagamento: value })}
                >
                  <SelectTrigger className="bg-zinc-800 border-amber-500/20 text-gray-300">
                    <SelectValue placeholder="Selecione a forma de pagamento" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-amber-500/20">
                    {formasPagamento.map((forma) => (
                      <SelectItem key={forma.value} value={forma.value} className="text-gray-300">
                        {forma.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="caixa_id" className="text-gray-300">Caixa *</Label>
                <Select
                  value={formData.caixa_id}
                  onValueChange={(value) => setFormData({ ...formData, caixa_id: value })}
                >
                  <SelectTrigger className="bg-zinc-800 border-amber-500/20 text-gray-300">
                    <SelectValue placeholder="Selecione o caixa" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-amber-500/20">
                    {contas.map((conta) => (
                      <SelectItem key={conta.id} value={conta.id} className="text-gray-300">
                        {conta.nome} - {formatarPreco(conta.saldo_atual)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {requerPrimeiroVencimento && (
                <div className="md:col-span-2">
                  <Label htmlFor="primeiro_vencimento_boleto" className="text-gray-300">Primeiro Vencimento (Boleto) *</Label>
                  <Input
                    id="primeiro_vencimento_boleto"
                    type="date"
                    value={formData.primeiro_vencimento_boleto}
                    onChange={(e) => setFormData({ ...formData, primeiro_vencimento_boleto: e.target.value })}
                    className="bg-zinc-800 border-amber-500/20 text-gray-300 focus:border-amber-500 focus:ring-amber-500/20"
                  />
                </div>
              )}
            </div>
          </Card>

          {/* Observações */}
          <Card className="p-6 bg-zinc-900 border-amber-500/20">
            <h2 className="text-xl font-bold text-gray-300 mb-4">Observações</h2>
            <div>
              <Label htmlFor="observacoes" className="text-gray-300">Observações</Label>
              <Input
                id="observacoes"
                type="text"
                value={formData.observacoes}
                onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                placeholder="Observações adicionais (opcional)"
                className="bg-zinc-800 border-amber-500/20 text-gray-300 focus:border-amber-500 focus:ring-amber-500/20"
              />
            </div>
          </Card>
        </div>

        {/* Coluna Direita - Resumo */}
        <div className="space-y-6">
          <Card className="p-6 bg-zinc-900 border-amber-500/20 sticky top-6">
            <h2 className="text-xl font-bold text-gray-300 mb-4">Resumo</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Valor Bruto:</span>
                <span className="text-lg font-bold text-gray-300">
                  {formatarPreco(formData.valor_bruto)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Valor Líquido:</span>
                <span className="text-lg font-bold text-amber-500">
                  {formatarPreco(formData.valor_liquido)}
                </span>
              </div>
              <div className="pt-4 border-t border-amber-500/20">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-400">Forma de Pagamento:</span>
                  <span className="text-sm text-gray-300">
                    {formasPagamento.find(f => f.value === formData.forma_pagamento)?.label || '-'}
                  </span>
                </div>
                {formData.marcar_como_pago && (
                  <div className="flex items-center gap-2 mt-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-green-500">Marcado como pago</span>
                  </div>
                )}
              </div>
              <Button
                onClick={salvarDespesa}
                disabled={salvando || !podeEditar('lancamento_despesa')}
                className="w-full bg-amber-500 hover:bg-amber-600 text-white"
              >
                {salvando ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Salvar Despesa
                  </>
                )}
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

