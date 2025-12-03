import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Prótese Capilar Cuiabá | Solução Definitiva para Calvície - Em Breve',
  description: 'Em breve: novo site da Prótese Capilar Cuiabá! Solução natural e imperceptível para calvície. Prótese capilar masculina de alta qualidade. Recupere sua autoestima e confiança.',
  keywords: [
    'prótese capilar cuiabá',
    'prótese capilar cuiabá mt',
    'solução calvície cuiabá',
    'peruca masculina cuiabá',
    'implante capilar cuiabá',
    'tratamento calvície',
    'prótese cabelo natural',
    'barbeiro prótese capilar',
    'sistema capilar cuiabá',
    'calvície masculina solução'
  ],
  authors: [{ name: 'Prótese Capilar Cuiabá' }],
  icons: {
    icon: [
      { url: '/images/logo.webp' },
      { url: '/favicon.ico', sizes: 'any' },
    ],
    apple: [
      { url: '/images/logo.webp' },
    ],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    }
  },
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: 'https://www.protesecapilarcuiaba.com.br',
    siteName: 'Prótese Capilar Cuiabá',
    title: 'Prótese Capilar Cuiabá - Em Breve Novidades',
    description: 'Aguarde! Estamos preparando um novo site com tudo sobre prótese capilar natural em Cuiabá.',
    images: [
      {
        url: '/images/logo.webp',
        width: 1200,
        height: 630,
        alt: 'Prótese Capilar Cuiabá',
      }
    ],
  },
  alternates: {
    canonical: 'https://www.protesecapilarcuiaba.com.br',
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

