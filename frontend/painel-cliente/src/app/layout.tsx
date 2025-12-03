import type { Metadata } from 'next'
import '../styles/globals.css'

export const metadata: Metadata = {
  title: 'Prótese Capilar em Cuiabá | Solução Natural para Calvície',
  description: 'Sua prótese capilar natural em Cuiabá. Acabe com a calvície de forma definitiva. Agende sua consulta, gerencie seus planos e acompanhe resultados. Atendimento personalizado e discreto.',
  keywords: [
    'prótese capilar cuiabá',
    'solução calvície cuiabá',
    'peruca masculina cuiabá',
    'implante capilar não cirúrgico',
    'prótese capilar natural',
    'acabar com calvície',
    'cabelo artificial natural',
    'prótese capilar masculina',
    'tratamento calvície cuiabá mt',
    'peruca natural masculina',
    'sistema capilar cuiabá',
    'cobertura capilar',
    'calvície solução imediata',
    'prótese cabelo homem',
    'barbeiro prótese capilar cuiabá'
  ],
  authors: [{ name: 'Prótese Capilar Cuiabá' }],
  creator: 'Prótese Capilar Cuiabá',
  publisher: 'Prótese Capilar Cuiabá',
  robots: {
    index: true, // Indexar para captar clientes
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    }
  },
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: 'https://app.protesecapilarcuiaba.com.br',
    siteName: 'Prótese Capilar Cuiabá',
    title: 'Prótese Capilar Natural em Cuiabá | Transforme Sua Vida',
    description: 'Solução definitiva para calvície em Cuiabá. Prótese capilar 100% natural, imperceptível e confortável. Agende sua avaliação gratuita hoje!',
    images: [
      {
        url: '/images/logo.webp',
        width: 1200,
        height: 630,
        alt: 'Prótese Capilar Cuiabá - Solução para Calvície',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Prótese Capilar em Cuiabá | Acabe com a Calvície',
    description: 'Solução natural e definitiva para calvície. Agende sua consulta em Cuiabá.',
    images: ['/images/logo.webp'],
  },
  alternates: {
    canonical: 'https://app.protesecapilarcuiaba.com.br',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon.png" type="image/png" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body>{children}</body>
    </html>
  )
}

