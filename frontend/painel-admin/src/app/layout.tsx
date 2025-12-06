import type { Metadata } from 'next'
import '../styles/globals.css'

export const metadata: Metadata = {
  title: 'Painel Administrativo - Prótese Capilar Cuiabá',
  description: 'Painel administrativo para gestão completa de clientes, planos, agendamentos e serviços de prótese capilar.',
  keywords: ['painel administrativo', 'gestão', 'prótese capilar', 'admin', 'barbearia', 'organização'],
  authors: [{ name: 'Prótese Capilar Cuiabá' }],
  creator: 'Prótese Capilar Cuiabá',
  publisher: 'Prótese Capilar Cuiabá',
  icons: {
    icon: '/images/logo.webp',
    shortcut: '/images/logo.webp',
    apple: '/images/apple-touch-icon.png',
  },
  robots: {
    index: false, // Não indexar área administrativa
    follow: false,
  },
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: 'https://admin.protesecapilarcuiaba.com.br',
    siteName: 'Prótese Capilar Cuiabá - Admin',
    title: 'Painel Administrativo',
    description: 'Sistema de gestão administrativa para Prótese Capilar Cuiabá.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Painel Administrativo - Prótese Capilar Cuiabá',
    description: 'Sistema de gestão administrativa para Prótese Capilar Cuiabá.',
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

