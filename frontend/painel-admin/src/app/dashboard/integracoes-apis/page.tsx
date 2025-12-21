'use client'

import { useState, useEffect } from 'react'
import { motion } from 'motion/react'
import { Plug, Save, FileText, CheckCircle, XCircle, AlertCircle, Loader2, Plus } from 'lucide-react'
import { usePermissions } from '@/hooks/usePermissions'

interface Integracao {
  id?: string
  tipo_integracao: string
  nome: string
  ativo: boolean
  ambiente: string
  token_producao?: string
  token_homologacao?: string
  certificado_digital_path?: string
  senha_certificado?: string
  cnpj?: string
  configuracao_json?: any
  funcionalidades?: Array<{
    id: string
    funcionalidade: string
    habilitado: boolean
  }>
}

interface TipoIntegracao {
  tipo: string
  nome: string
  descricao: string
  icone: string
  campos: Array<{
    nome: string
    chave: string
    tipo: 'text' | 'password' | 'select'
    placeholder?: string
    opcoes?: Array<{ valor: string; label: string }>
    descricao?: string
  }>
}

const tiposIntegracao: TipoIntegracao[] = [
  {
    tipo: 'focus_nfe',
    nome: 'Focus NFe',
    descricao: 'Configure a integração com Focus NFe para emitir notas fiscais',
    icone: '📄',
    campos: [
      {
        nome: 'CNPJ',
        chave: 'cnpj',
        tipo: 'text',
        placeholder: '00.000.000/0000-00',
        descricao: 'CNPJ da empresa'
      },
      {
        nome: 'Token de Homologação',
        chave: 'token_homologacao',
        tipo: 'password',
        placeholder: 'Token de homologação',
        descricao: 'Token fornecido pela Focus NFe para ambiente de homologação'
      },
      {
        nome: 'Token de Produção',
        chave: 'token_producao',
        tipo: 'password',
        placeholder: 'Token de produção',
        descricao: 'Token fornecido pela Focus NFe para ambiente de produção'
      },
      {
        nome: 'Caminho do Certificado Digital',
        chave: 'certificado_digital_path',
        tipo: 'text',
        placeholder: '/caminho/do/certificado.pfx',
        descricao: 'Caminho completo do arquivo do certificado digital A1 (.pfx)'
      }
    ]
  },
  {
    tipo: 'plug_nfe',
    nome: 'PLUG NFe',
    descricao: 'Configure a integração com PLUG NFe para emitir notas fiscais',
    icone: '🔌',
    campos: [
      {
        nome: 'CNPJ',
        chave: 'cnpj',
        tipo: 'text',
        placeholder: '00.000.000/0000-00',
        descricao: 'CNPJ da empresa'
      },
      {
        nome: 'API Key (Token)',
        chave: 'token_producao',
        tipo: 'password',
        placeholder: 'Sua API Key do PLUG NFe',
        descricao: 'API Key fornecida pelo PLUG NFe. Usada tanto para homologação quanto produção'
      },
      {
        nome: 'Caminho do Certificado Digital',
        chave: 'certificado_digital_path',
        tipo: 'text',
        placeholder: '/caminho/do/certificado.pfx',
        descricao: 'Caminho completo do arquivo do certificado digital A1 (.pfx)'
      },
      {
        nome: 'Senha do Certificado',
        chave: 'senha_certificado',
        tipo: 'password',
        placeholder: 'Senha do certificado',
        descricao: 'Senha do certificado digital (se aplicável)'
      }
    ]
  },
  {
    tipo: 'asaas',
    nome: 'Asaas',
    descricao: 'Configure a integração com Asaas para processar pagamentos (PIX, boleto, cartão de crédito)',
    icone: '💳',
    campos: [
      {
        nome: 'API Key de Produção',
        chave: 'token_producao',
        tipo: 'password',
        placeholder: 'Sua API Key do Asaas (Produção)',
        descricao: 'Chave de API fornecida pelo Asaas para ambiente de produção. Acesse: Minha Conta > Integração > Gerar nova Chave de API'
      },
      {
        nome: 'API Key de Sandbox (Homologação)',
        chave: 'token_homologacao',
        tipo: 'password',
        placeholder: 'Sua API Key do Asaas (Sandbox)',
        descricao: 'Chave de API fornecida pelo Asaas para ambiente de sandbox/testes'
      },
      {
        nome: 'URL de Webhook (Opcional)',
        chave: 'webhook_url',
        tipo: 'text',
        placeholder: 'https://seu-dominio.com.br/api/webhooks/asaas',
        descricao: 'URL para receber notificações de eventos do Asaas (pagamentos, cobranças, etc). Configure também no painel do Asaas'
      }
    ]
  },
  {
    tipo: 'mercado_pago',
    nome: 'Mercado Pago',
    descricao: 'Configure a integração com Mercado Pago para processar pagamentos (PIX, boleto, cartão de crédito)',
    icone: '🛒',
    campos: [
      {
        nome: 'Access Token de Produção',
        chave: 'token_producao',
        tipo: 'password',
        placeholder: 'Seu Access Token do Mercado Pago (Produção)',
        descricao: 'Access Token fornecido pelo Mercado Pago para ambiente de produção. Acesse: Credenciais > Token de Produção'
      },
      {
        nome: 'Access Token de Testes (Homologação)',
        chave: 'token_homologacao',
        tipo: 'password',
        placeholder: 'Seu Access Token do Mercado Pago (Testes)',
        descricao: 'Access Token fornecido pelo Mercado Pago para ambiente de testes/sandbox. Acesse: Credenciais > Token de Testes'
      },
      {
        nome: 'Public Key (Opcional)',
        chave: 'public_key',
        tipo: 'password',
        placeholder: 'Sua Public Key do Mercado Pago',
        descricao: 'Public Key fornecida pelo Mercado Pago. Usada para integrações no frontend (Checkout Transparente). Acesse: Credenciais > Chave Pública'
      },
      {
        nome: 'URL de Webhook (Opcional)',
        chave: 'webhook_url',
        tipo: 'text',
        placeholder: 'https://seu-dominio.com.br/api/webhooks/mercadopago',
        descricao: 'URL para receber notificações de eventos do Mercado Pago (pagamentos, reembolsos, etc). Configure também no painel do Mercado Pago'
      }
    ]
  },
  {
    tipo: 'pagseguro',
    nome: 'PagSeguro (PagBank)',
    descricao: 'Configure a integração com PagSeguro/PagBank para processar pagamentos (PIX, boleto, cartão de crédito)',
    icone: '🏦',
    campos: [
      {
        nome: 'Token de Produção',
        chave: 'token_producao',
        tipo: 'password',
        placeholder: 'Seu Token do PagSeguro (Produção)',
        descricao: 'Token fornecido pelo PagSeguro para ambiente de produção. Acesse: Minha Conta > Integrações > Tokens'
      },
      {
        nome: 'Token de Sandbox (Homologação)',
        chave: 'token_homologacao',
        tipo: 'password',
        placeholder: 'Seu Token do PagSeguro (Sandbox)',
        descricao: 'Token fornecido pelo PagSeguro para ambiente de sandbox/testes'
      },
      {
        nome: 'Email (Opcional)',
        chave: 'email',
        tipo: 'text',
        placeholder: 'seu-email@exemplo.com.br',
        descricao: 'Email da conta PagSeguro (usado em algumas integrações legadas)'
      },
      {
        nome: 'URL de Webhook (Opcional)',
        chave: 'webhook_url',
        tipo: 'text',
        placeholder: 'https://seu-dominio.com.br/api/webhooks/pagseguro',
        descricao: 'URL para receber notificações de eventos do PagSeguro (pagamentos, status, etc). Configure também no painel do PagSeguro'
      }
    ]
  },
  {
    tipo: 'twilio',
    nome: 'Twilio',
    descricao: 'Configure a integração com Twilio para envio de SMS, WhatsApp, voz e outras comunicações',
    icone: '📱',
    campos: [
      {
        nome: 'Account SID',
        chave: 'account_sid',
        tipo: 'text',
        placeholder: 'Seu Account SID da Twilio',
        descricao: 'Account SID fornecido pela Twilio. Encontre em: Console > Account Info > Account SID'
      },
      {
        nome: 'Auth Token de Produção',
        chave: 'token_producao',
        tipo: 'password',
        placeholder: 'Seu Auth Token da Twilio (Produção)',
        descricao: 'Auth Token fornecido pela Twilio para ambiente de produção. Encontre em: Console > Account Info > Auth Token'
      },
      {
        nome: 'Auth Token de Testes (Homologação)',
        chave: 'token_homologacao',
        tipo: 'password',
        placeholder: 'Seu Auth Token da Twilio (Testes)',
        descricao: 'Auth Token fornecido pela Twilio para ambiente de testes/sandbox'
      },
      {
        nome: 'Número de Telefone Twilio (Opcional)',
        chave: 'numero_telefone',
        tipo: 'text',
        placeholder: '+5511999999999',
        descricao: 'Número de telefone Twilio configurado na sua conta (formato: +5511999999999)'
      },
      {
        nome: 'URL de Webhook (Opcional)',
        chave: 'webhook_url',
        tipo: 'text',
        placeholder: 'https://seu-dominio.com.br/api/webhooks/twilio',
        descricao: 'URL para receber notificações de eventos da Twilio (status de mensagens, chamadas, etc). Configure também no painel da Twilio'
      }
    ]
  },
  {
    tipo: 'whatsapp_business',
    nome: 'WhatsApp Business API',
    descricao: 'Configure a integração com WhatsApp Business API para envio de mensagens, notificações e atendimento',
    icone: '💬',
    campos: [
      {
        nome: 'Phone Number ID',
        chave: 'phone_number_id',
        tipo: 'text',
        placeholder: 'Seu Phone Number ID do WhatsApp Business',
        descricao: 'Phone Number ID fornecido pelo WhatsApp Business. Encontre em: Configurações > Configurações da API > Phone Number ID'
      },
      {
        nome: 'Access Token de Produção',
        chave: 'token_producao',
        tipo: 'password',
        placeholder: 'Seu Access Token do WhatsApp Business (Produção)',
        descricao: 'Access Token fornecido pelo WhatsApp Business para ambiente de produção. Encontre em: Configurações > Tokens de acesso'
      },
      {
        nome: 'Access Token de Testes (Homologação)',
        chave: 'token_homologacao',
        tipo: 'password',
        placeholder: 'Seu Access Token do WhatsApp Business (Testes)',
        descricao: 'Access Token fornecido pelo WhatsApp Business para ambiente de testes/sandbox'
      },
      {
        nome: 'Verify Token (Opcional)',
        chave: 'verify_token',
        tipo: 'password',
        placeholder: 'Seu Verify Token do WhatsApp Business',
        descricao: 'Token de verificação para webhooks. Configure o mesmo valor no painel do WhatsApp Business'
      },
      {
        nome: 'App Secret (Opcional)',
        chave: 'app_secret',
        tipo: 'password',
        placeholder: 'Seu App Secret do WhatsApp Business',
        descricao: 'App Secret fornecido pelo WhatsApp Business para validação de webhooks'
      },
      {
        nome: 'URL de Webhook (Opcional)',
        chave: 'webhook_url',
        tipo: 'text',
        placeholder: 'https://seu-dominio.com.br/api/webhooks/whatsapp',
        descricao: 'URL para receber notificações de eventos do WhatsApp Business (mensagens recebidas, status, etc). Configure também no painel do WhatsApp Business'
      }
    ]
  },
  {
    tipo: 'sendgrid',
    nome: 'SendGrid',
    descricao: 'Configure a integração com SendGrid para envio de emails transacionais e de marketing',
    icone: '📧',
    campos: [
      {
        nome: 'API Key de Produção',
        chave: 'token_producao',
        tipo: 'password',
        placeholder: 'Sua API Key do SendGrid (Produção)',
        descricao: 'API Key fornecido pelo SendGrid para ambiente de produção. Encontre em: Settings > API Keys > Create API Key'
      },
      {
        nome: 'API Key de Testes (Homologação)',
        chave: 'token_homologacao',
        tipo: 'password',
        placeholder: 'Sua API Key do SendGrid (Testes)',
        descricao: 'API Key fornecido pelo SendGrid para ambiente de testes/sandbox'
      },
      {
        nome: 'Email Remetente Padrão (Opcional)',
        chave: 'email_remetente',
        tipo: 'text',
        placeholder: 'noreply@seu-dominio.com.br',
        descricao: 'Email remetente padrão para envio de emails. Deve ser verificado no SendGrid'
      },
      {
        nome: 'Nome do Remetente (Opcional)',
        chave: 'nome_remetente',
        tipo: 'text',
        placeholder: 'Nome da Empresa',
        descricao: 'Nome que aparecerá como remetente nos emails enviados'
      },
      {
        nome: 'URL de Webhook (Opcional)',
        chave: 'webhook_url',
        tipo: 'text',
        placeholder: 'https://seu-dominio.com.br/api/webhooks/sendgrid',
        descricao: 'URL para receber notificações de eventos do SendGrid (delivery, opens, clicks, etc). Configure também no painel do SendGrid'
      }
    ]
  },
  {
    tipo: 'docsales',
    nome: 'DocSales',
    descricao: 'Configure a integração com DocSales para gestão de assinaturas de contratos eletrônicos',
    icone: '📝',
    campos: [
      {
        nome: 'Token de Acesso (Produção)',
        chave: 'token_producao',
        tipo: 'password',
        placeholder: 'Seu Token de Acesso do DocSales (Produção)',
        descricao: 'Token de acesso fornecido pelo DocSales para ambiente de produção. Gere em: Configurações > Integrações > Gerar Token'
      },
      {
        nome: 'Token de Acesso (Homologação)',
        chave: 'token_homologacao',
        tipo: 'password',
        placeholder: 'Seu Token de Acesso do DocSales (Homologação)',
        descricao: 'Token de acesso fornecido pelo DocSales para ambiente de homologação/testes'
      },
      {
        nome: 'URL de Webhook (Opcional)',
        chave: 'webhook_url',
        tipo: 'text',
        placeholder: 'https://seu-dominio.com.br/api/webhooks/docsales',
        descricao: 'URL para receber notificações de eventos do DocSales (documento assinado, cancelado, expirado, etc). Configure também no painel do DocSales'
      },
      {
        nome: 'Email Padrão do Remetente (Opcional)',
        chave: 'email_remetente',
        tipo: 'text',
        placeholder: 'contratos@seu-dominio.com.br',
        descricao: 'Email padrão que será usado como remetente ao enviar documentos para assinatura'
      }
    ]
  },
  {
    tipo: 'clicksign',
    nome: 'Clicksign',
    descricao: 'Configure a integração com Clicksign para assinatura eletrônica de documentos com validade jurídica',
    icone: '✍️',
    campos: [
      {
        nome: 'Access Token (Produção)',
        chave: 'token_producao',
        tipo: 'password',
        placeholder: 'Seu Access Token da Clicksign (Produção)',
        descricao: 'Access Token fornecido pela Clicksign para ambiente de produção. Gere em: Configurações > Integrações > Criar Access Token. Acesse: ajuda.clicksign.com/article/994'
      },
      {
        nome: 'Access Token (Homologação/Sandbox)',
        chave: 'token_homologacao',
        tipo: 'password',
        placeholder: 'Seu Access Token da Clicksign (Homologação)',
        descricao: 'Access Token fornecido pela Clicksign para ambiente de homologação/testes. Use o ambiente sandbox para testes'
      },
      {
        nome: 'URL de Webhook (Opcional)',
        chave: 'webhook_url',
        tipo: 'text',
        placeholder: 'https://seu-dominio.com.br/api/webhooks/clicksign',
        descricao: 'URL para receber notificações de eventos da Clicksign (documento assinado, cancelado, expirado, etc). Configure também no painel da Clicksign'
      },
      {
        nome: 'Email Padrão do Remetente (Opcional)',
        chave: 'email_remetente',
        tipo: 'text',
        placeholder: 'contratos@seu-dominio.com.br',
        descricao: 'Email padrão que será usado como remetente ao enviar documentos para assinatura'
      }
    ]
  }
]

export default function IntegracoesApisPage() {
  const [integracoes, setIntegracoes] = useState<Integracao[]>([])
  const [integracaoAtiva, setIntegracaoAtiva] = useState<Integracao | null>(null)
  const [tipoIntegracaoSelecionado, setTipoIntegracaoSelecionado] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [mensagem, setMensagem] = useState<{ tipo: 'sucesso' | 'erro' | null; texto: string }>({ tipo: null, texto: '' })
  const { podeEditar } = usePermissions()

  useEffect(() => {
    carregarIntegracoes()
  }, [])

  const carregarIntegracoes = async () => {
    setLoading(true)
    try {
      const apiUrl = 'https://api.protesecapilarcuiaba.com.br'
      const response = await fetch(`${apiUrl}/api/v1/integracoes`)

      if (!response.ok) {
        throw new Error('Erro ao carregar integrações')
      }

      const data = await response.json()
      setIntegracoes(data.integracoes || [])
    } catch (error: any) {
      console.error('Erro ao carregar integrações:', error)
      setMensagem({ tipo: 'erro', texto: error.message || 'Erro ao carregar integrações' })
    } finally {
      setLoading(false)
    }
  }

  const selecionarIntegracao = (tipo: string) => {
    const integracaoExistente = integracoes.find(i => i.tipo_integracao === tipo)
    if (integracaoExistente) {
      setIntegracaoAtiva(integracaoExistente)
      setTipoIntegracaoSelecionado(tipo)
    } else {
      const tipoInfo = tiposIntegracao.find(t => t.tipo === tipo)
      if (tipoInfo) {
        const novaIntegracao: Integracao = {
          tipo_integracao: tipo,
          nome: tipoInfo.nome,
          ativo: false,
          ambiente: 'homologacao',
          token_producao: '',
          token_homologacao: '',
          certificado_digital_path: '',
          senha_certificado: '',
          cnpj: '',
          configuracao_json: {},
        }
        setIntegracaoAtiva(novaIntegracao)
        setTipoIntegracaoSelecionado(tipo)
      }
    }
  }

  const atualizarCampo = (campo: keyof Integracao, valor: any) => {
    if (integracaoAtiva) {
      setIntegracaoAtiva({ ...integracaoAtiva, [campo]: valor })
    }
  }

  const atualizarCampoConfiguracao = (chave: string, valor: any) => {
    if (integracaoAtiva) {
      const config = integracaoAtiva.configuracao_json || {}
      setIntegracaoAtiva({
        ...integracaoAtiva,
        configuracao_json: { ...config, [chave]: valor }
      })
    }
  }

  const salvarIntegracao = async () => {
    if (!podeEditar('integracao_apis')) {
      setMensagem({ tipo: 'erro', texto: 'Você não tem permissão para editar integrações' })
      return
    }

    if (!integracaoAtiva) return

    setSalvando(true)
    try {
      const apiUrl = 'https://api.protesecapilarcuiaba.com.br'
      
      const adminData = localStorage.getItem('admin')
      const admin = adminData ? JSON.parse(adminData) : null
      
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      }
      if (admin?.id) {
        headers['x-user-id'] = admin.id
        headers['x-user-tipo'] = admin.tipo_usuario || 'administrativo'
      }

      const existe = integracaoAtiva.id
      const url = existe 
        ? `${apiUrl}/api/v1/integracoes/${integracaoAtiva.tipo_integracao}`
        : `${apiUrl}/api/v1/integracoes`
      const method = existe ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers,
        body: JSON.stringify(integracaoAtiva),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Erro ao salvar integração')
      }

      const data = await response.json()
      setMensagem({ tipo: 'sucesso', texto: 'Integração salva com sucesso!' })
      setTimeout(() => setMensagem({ tipo: null, texto: '' }), 3000)
      
      await carregarIntegracoes()
      if (integracaoAtiva.tipo_integracao) {
        selecionarIntegracao(integracaoAtiva.tipo_integracao)
      }
    } catch (error: any) {
      console.error('Erro ao salvar integração:', error)
      setMensagem({ tipo: 'erro', texto: error.message || 'Erro ao salvar integração' })
    } finally {
      setSalvando(false)
    }
  }

  const fecharIntegracao = () => {
    setIntegracaoAtiva(null)
    setTipoIntegracaoSelecionado(null)
  }

  const tipoIntegracaoAtivo = tipoIntegracaoSelecionado 
    ? tiposIntegracao.find(t => t.tipo === tipoIntegracaoSelecionado)
    : null

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-amber-500 mx-auto mb-4" />
          <p className="text-gray-400">Carregando integrações...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-4 md:p-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-2">
          <Plug className="h-6 w-6 md:h-8 md:w-8 text-amber-500" />
          Integrações de APIs Externas
        </h1>
        <p className="text-gray-400 mt-1 text-sm md:text-base">Configure e gerencie integrações com serviços externos</p>
      </div>

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
              <CheckCircle className="h-5 w-5" />
            ) : (
              <AlertCircle className="h-5 w-5" />
            )}
            <span>{mensagem.texto}</span>
          </div>
        </motion.div>
      )}

      {!integracaoAtiva ? (
        <div className="space-y-4">
        <div className="bg-zinc-900 border border-amber-500/20 rounded-lg p-6">
            <h2 className="text-xl font-bold text-white mb-4">Integrações Disponíveis</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tiposIntegracao.map((tipo) => {
                const integracaoExistente = integracoes.find(i => i.tipo_integracao === tipo.tipo)
                const estaAtiva = integracaoExistente?.ativo || false
                
                return (
                  <motion.div
                    key={tipo.tipo}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-zinc-800 border border-amber-500/20 rounded-lg p-6 hover:border-amber-500/40 transition-colors cursor-pointer"
                    onClick={() => selecionarIntegracao(tipo.tipo)}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{tipo.icone}</span>
                        <div>
                          <h3 className="text-lg font-bold text-white">{tipo.nome}</h3>
                          {integracaoExistente && (
                            <span className={`text-xs px-2 py-1 rounded ${
                              estaAtiva 
                                ? 'bg-green-500/20 text-green-500' 
                                : 'bg-gray-500/20 text-gray-400'
                            }`}>
                              {estaAtiva ? 'Ativa' : 'Inativa'}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <p className="text-gray-400 text-sm mb-4">{tipo.descricao}</p>
            <button
                      onClick={(e) => {
                        e.stopPropagation()
                        selecionarIntegracao(tipo.tipo)
                      }}
                      className="w-full px-4 py-2 bg-amber-500 hover:bg-amber-600 text-black rounded-lg transition-colors font-medium flex items-center justify-center gap-2"
            >
                      {integracaoExistente ? (
                        <>
                          <FileText className="h-4 w-4" />
                          {estaAtiva ? 'Editar Configuração' : 'Configurar'}
                        </>
                      ) : (
                        <>
                          <Plus className="h-4 w-4" />
                          Configurar
                        </>
                      )}
            </button>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-zinc-900 border border-amber-500/20 rounded-lg p-4 md:p-6">
          <div className="mb-6 flex items-center justify-between">
            <div>
            <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                <span className="text-2xl">{tipoIntegracaoAtivo?.icone}</span>
                {integracaoAtiva.nome}
            </h2>
              <p className="text-gray-400 text-sm">{tipoIntegracaoAtivo?.descricao}</p>
            </div>
            <button
              onClick={fecharIntegracao}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <XCircle className="h-5 w-5" />
            </button>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <input
                type="checkbox"
                checked={integracaoAtiva.ativo || false}
                onChange={(e) => atualizarCampo('ativo', e.target.checked)}
                className="w-4 h-4 rounded border-zinc-700 bg-zinc-900 text-amber-500 focus:ring-2 focus:ring-amber-500 cursor-pointer"
              />
              <label className="text-white font-medium">Ativar Integração</label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-300 text-sm mb-1">Ambiente</label>
                <select
                  value={integracaoAtiva.ambiente || 'homologacao'}
                  onChange={(e) => atualizarCampo('ambiente', e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="homologacao">Homologação</option>
                  <option value="producao">Produção</option>
                </select>
              </div>

              {tipoIntegracaoAtivo?.campos.map((campo) => {
                if (campo.chave === 'cnpj') {
                  return (
                    <div key={campo.chave}>
                      <label className="block text-gray-300 text-sm mb-1">{campo.nome}</label>
                <input
                  type="text"
                  value={integracaoAtiva.cnpj || ''}
                  onChange={(e) => {
                    const apenasNumeros = e.target.value.replace(/\D/g, '')
                    const formatado = apenasNumeros.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
                    atualizarCampo('cnpj', formatado)
                  }}
                  maxLength={18}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-amber-500"
                        placeholder={campo.placeholder}
                />
                      {campo.descricao && (
                        <p className="text-gray-500 text-xs mt-1">{campo.descricao}</p>
                      )}
              </div>
                  )
                }

                if (campo.chave === 'token_producao' || campo.chave === 'token_homologacao') {
                  return (
                    <div key={campo.chave}>
                      <label className="block text-gray-300 text-sm mb-1">{campo.nome}</label>
                <input
                  type="password"
                        value={integracaoAtiva[campo.chave as keyof Integracao] as string || ''}
                        onChange={(e) => atualizarCampo(campo.chave as keyof Integracao, e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-amber-500"
                        placeholder={campo.placeholder}
                />
                      {campo.descricao && (
                        <p className="text-gray-500 text-xs mt-1">{campo.descricao}</p>
                      )}
              </div>
                  )
                }

                if (campo.chave === 'certificado_digital_path') {
                  return (
                    <div key={campo.chave} className="md:col-span-2">
                      <label className="block text-gray-300 text-sm mb-1">{campo.nome}</label>
                <input
                  type="text"
                  value={integracaoAtiva.certificado_digital_path || ''}
                  onChange={(e) => atualizarCampo('certificado_digital_path', e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-amber-500"
                        placeholder={campo.placeholder}
                      />
                      {campo.descricao && (
                        <p className="text-gray-500 text-xs mt-1">{campo.descricao}</p>
                      )}
                    </div>
                  )
                }

                if (campo.chave === 'senha_certificado') {
                  return (
                    <div key={campo.chave}>
                      <label className="block text-gray-300 text-sm mb-1">{campo.nome}</label>
                      <input
                        type="password"
                        value={integracaoAtiva.senha_certificado || ''}
                        onChange={(e) => atualizarCampo('senha_certificado', e.target.value)}
                        className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-amber-500"
                        placeholder={campo.placeholder}
                      />
                      {campo.descricao && (
                        <p className="text-gray-500 text-xs mt-1">{campo.descricao}</p>
                      )}
              </div>
                  )
                }

                if (campo.chave === 'webhook_url') {
                  const config = integracaoAtiva.configuracao_json || {}
                  return (
                    <div key={campo.chave} className="md:col-span-2">
                      <label className="block text-gray-300 text-sm mb-1">{campo.nome}</label>
                      <input
                        type="text"
                        value={config.webhook_url || ''}
                        onChange={(e) => atualizarCampoConfiguracao('webhook_url', e.target.value)}
                        className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-amber-500"
                        placeholder={campo.placeholder}
                      />
                      {campo.descricao && (
                        <p className="text-gray-500 text-xs mt-1">{campo.descricao}</p>
                      )}
                    </div>
                  )
                }

                if (campo.chave === 'public_key') {
                  const config = integracaoAtiva.configuracao_json || {}
                  return (
                    <div key={campo.chave}>
                      <label className="block text-gray-300 text-sm mb-1">{campo.nome}</label>
                      <input
                        type="password"
                        value={config.public_key || ''}
                        onChange={(e) => atualizarCampoConfiguracao('public_key', e.target.value)}
                        className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-amber-500"
                        placeholder={campo.placeholder}
                      />
                      {campo.descricao && (
                        <p className="text-gray-500 text-xs mt-1">{campo.descricao}</p>
                      )}
                    </div>
                  )
                }

                if (campo.chave === 'email') {
                  const config = integracaoAtiva.configuracao_json || {}
                  return (
                    <div key={campo.chave}>
                      <label className="block text-gray-300 text-sm mb-1">{campo.nome}</label>
                      <input
                        type="email"
                        value={config.email || ''}
                        onChange={(e) => atualizarCampoConfiguracao('email', e.target.value)}
                        className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-amber-500"
                        placeholder={campo.placeholder}
                      />
                      {campo.descricao && (
                        <p className="text-gray-500 text-xs mt-1">{campo.descricao}</p>
                      )}
                    </div>
                  )
                }

                if (campo.chave === 'account_sid' || campo.chave === 'numero_telefone' || campo.chave === 'phone_number_id') {
                  const config = integracaoAtiva.configuracao_json || {}
                  return (
                    <div key={campo.chave}>
                      <label className="block text-gray-300 text-sm mb-1">{campo.nome}</label>
                      <input
                        type="text"
                        value={config[campo.chave] || ''}
                        onChange={(e) => atualizarCampoConfiguracao(campo.chave, e.target.value)}
                        className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-amber-500"
                        placeholder={campo.placeholder}
                      />
                      {campo.descricao && (
                        <p className="text-gray-500 text-xs mt-1">{campo.descricao}</p>
                      )}
                    </div>
                  )
                }

                if (campo.chave === 'verify_token' || campo.chave === 'app_secret') {
                  const config = integracaoAtiva.configuracao_json || {}
                  return (
                    <div key={campo.chave}>
                      <label className="block text-gray-300 text-sm mb-1">{campo.nome}</label>
                      <input
                        type="password"
                        value={config[campo.chave] || ''}
                        onChange={(e) => atualizarCampoConfiguracao(campo.chave, e.target.value)}
                        className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-amber-500"
                        placeholder={campo.placeholder}
                      />
                      {campo.descricao && (
                        <p className="text-gray-500 text-xs mt-1">{campo.descricao}</p>
                      )}
                    </div>
                  )
                }

                if (campo.chave === 'email_remetente' || campo.chave === 'nome_remetente') {
                  const config = integracaoAtiva.configuracao_json || {}
                  return (
                    <div key={campo.chave}>
                      <label className="block text-gray-300 text-sm mb-1">{campo.nome}</label>
                      <input
                        type={campo.chave === 'email_remetente' ? 'email' : 'text'}
                        value={config[campo.chave] || ''}
                        onChange={(e) => atualizarCampoConfiguracao(campo.chave, e.target.value)}
                        className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-amber-500"
                        placeholder={campo.placeholder}
                      />
                      {campo.descricao && (
                        <p className="text-gray-500 text-xs mt-1">{campo.descricao}</p>
                      )}
                    </div>
                  )
                }

                return null
              })}
            </div>

            <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 mt-6">
              <p className="text-amber-400 text-sm">
                <AlertCircle className="h-4 w-4 inline mr-2" />
                Após configurar, você precisará habilitar a emissão de nota fiscal na página "Habilitar API"
              </p>
            </div>
          </div>

          <div className="flex justify-end mt-6 gap-2">
            <button
              onClick={fecharIntegracao}
              className="flex items-center gap-2 px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-colors font-medium"
            >
              Cancelar
            </button>
            <button
              onClick={salvarIntegracao}
              disabled={salvando || !podeEditar('integracao_apis')}
              className="flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-600 text-black rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              <Save className="h-5 w-5" />
              {salvando ? 'Salvando...' : 'Salvar Configuração'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
