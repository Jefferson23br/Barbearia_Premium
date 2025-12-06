import type { Metadata } from 'next'
import '../styles/globals.css'

export const metadata: Metadata = {
  title: 'Prótese Capilar Cuiabá - Painel do Cliente',
  description: 'Acesse seu painel de cliente da Prótese Capilar Cuiabá. Gerencie seus planos, agende atendimentos e acompanhe seu histórico de serviços.',
  keywords: ['prótese capilar', 'cuiabá', 'painel cliente', 'agendamento', 'peruca masculina', 'calvície'],
  authors: [{ name: 'Prótese Capilar Cuiabá' }],
  creator: 'Prótese Capilar Cuiabá',
  publisher: 'Prótese Capilar Cuiabá',
  icons: {
    icon: '/images/logo.webp',
    shortcut: '/images/logo.webp',
    apple: '/images/apple-touch-icon.png',
  },
  robots: {
    index: false, // Não indexar área de cliente
    follow: false,
  },
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: 'https://app.protesecapilarcuiaba.com.br',
    siteName: 'Prótese Capilar Cuiabá',
    title: 'Painel do Cliente - Prótese Capilar Cuiabá',
    description: 'Acesse seu painel de cliente e gerencie seus serviços de prótese capilar.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Painel do Cliente - Prótese Capilar Cuiabá',
    description: 'Acesse seu painel de cliente e gerencie seus serviços de prótese capilar.',
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

