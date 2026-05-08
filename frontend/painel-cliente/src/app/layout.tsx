import type { Metadata } from 'next'
import '../styles/globals.css'

export const metadata: Metadata = {
  title: 'Barbearia Premium - Painel do Cliente',
  description: 'Acesse seu painel de cliente da Barbearia Premium. Gerencie seus planos, agende atendimentos e acompanhe seu histórico de serviços.',
  keywords: ['barbearia premium', 'painel cliente', 'agendamento', 'servicos', 'atendimento'],
  authors: [{ name: 'Barbearia Premium' }],
  creator: 'Barbearia Premium',
  publisher: 'Barbearia Premium',
  icons: {
    icon: '/images/logo.webp',
    shortcut: '/images/logo.webp',
    apple: '/images/logo.webp',
  },
  robots: {
    index: false, // Não indexar área de cliente
    follow: false,
  },
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: 'https://appbarber.auctusconsultoria.com.br',
    siteName: 'Barbearia Premium',
    title: 'Painel do Cliente - Barbearia Premium',
    description: 'Acesse seu painel de cliente e gerencie seus serviços de prótese capilar.',
    images: ['/images/logo.webp'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Painel do Cliente - Barbearia Premium',
    description: 'Acesse seu painel de cliente e gerencie seus serviços de prótese capilar.',
    images: ['/images/logo.webp'],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  )
}

