import type { Metadata } from 'next'
import '../styles/globals.css'

export const metadata: Metadata = {
  title: 'Painel Administrativo - Barbearia Premium',
  description: 'Painel administrativo para gestão completa de clientes, planos, agendamentos e serviços de prótese capilar.',
  icons: {
    icon: '/images/logo.webp',
    shortcut: '/images/logo.webp',
    apple: '/images/logo.webp',
  },
  robots: {
    index: false, // Não indexar área administrativa
    follow: false,
  },
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: 'https://appbarber.auctusconsultoria.com.br/admin',
    siteName: 'Barbearia Premium - Admin',
    title: 'Painel Administrativo',
    description: 'Sistema de gestão administrativa para Barbearia Premium.',
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

