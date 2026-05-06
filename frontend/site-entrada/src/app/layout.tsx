import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Barbearia Premium - Site em Desenvolvimento',
  description: 'Estamos preparando algo incrível para você! Em breve, novo site da Barbearia Premium - Transformando vidas através do cabelo.',
  keywords: ['prótese capilar', 'cuiabá', 'peruca masculina', 'calvície', 'implante capilar'],
  authors: [{ name: 'Barbearia Premium' }],
  icons: {
    icon: '/images/logo.webp',
    shortcut: '/images/logo.webp',
    apple: '/images/logo.webp',
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: 'https://appbarber.auctusconsultoria.com.br',
    siteName: 'Barbearia Premium',
    title: 'Barbearia Premium - Em Breve',
    description: 'Estamos preparando algo incrível para você! Transformando vidas através do cabelo.',
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

