import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Prótese Capilar Cuiabá - Site em Desenvolvimento',
  description: 'Estamos preparando algo incrível para você! Em breve, novo site da Prótese Capilar Cuiabá - Transformando vidas através do cabelo.',
  keywords: ['prótese capilar', 'cuiabá', 'peruca masculina', 'calvície', 'implante capilar'],
  authors: [{ name: 'Prótese Capilar Cuiabá' }],
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: 'https://www.protesecapilarcuiaba.com.br',
    siteName: 'Prótese Capilar Cuiabá',
    title: 'Prótese Capilar Cuiabá - Em Breve',
    description: 'Estamos preparando algo incrível para você! Transformando vidas através do cabelo.',
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

