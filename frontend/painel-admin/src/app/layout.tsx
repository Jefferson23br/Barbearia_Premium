import type { Metadata } from 'next'
import '../styles/globals.css'

export const metadata: Metadata = {
  title: 'Sistema de Gestão para Barbearias | Prótese Capilar Profissional',
  description: 'Sistema completo de gestão para barbearias especializadas em prótese capilar. Controle de clientes, agendamentos, planos, financeiro e relatórios. Aumente a produtividade da sua barbearia.',
  keywords: [
    'sistema gestão barbearia',
    'software barbershop',
    'gestão prótese capilar',
    'sistema para barbearia',
    'controle clientes barbearia',
    'agenda barbearia online',
    'software para barbeiro',
    'gestão de salão',
    'sistema barbershop profissional',
    'controle financeiro barbearia',
    'agendamento online barbearia',
    'crm para barbearia',
    'sistema prótese capilar',
    'gestão perucas masculinas',
    'software implante capilar'
  ],
  authors: [{ name: 'Prótese Capilar Cuiabá' }],
  creator: 'Prótese Capilar Cuiabá',
  publisher: 'Prótese Capilar Cuiabá',
  robots: {
    index: true, // Indexar para captar profissionais
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    }
  },
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: 'https://admin.protesecapilarcuiaba.com.br',
    siteName: 'Sistema de Gestão para Barbearias - Prótese Capilar',
    title: 'Sistema Profissional de Gestão para Barbearias Especializadas',
    description: 'Gerencie sua barbearia de prótese capilar com eficiência. Sistema completo com controle de clientes, agendamentos, planos recorrentes, controle financeiro e muito mais.',
    images: [
      {
        url: '/images/logo.webp',
        width: 1200,
        height: 630,
        alt: 'Sistema de Gestão para Barbearias',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sistema de Gestão para Barbearias | Prótese Capilar',
    description: 'Gerencie sua barbearia especializada com sistema profissional completo.',
  },
  alternates: {
    canonical: 'https://admin.protesecapilarcuiaba.com.br',
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

