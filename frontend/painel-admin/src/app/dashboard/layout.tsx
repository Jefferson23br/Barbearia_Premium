import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Dashboard Administrativo - Prótese Capilar Cuiabá',
  description: 'Dashboard administrativo para gestão do sistema de prótese capilar.',
  robots: {
    index: false,
    follow: false,
  },
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: 'https://admin.protesecapilarcuiaba.com.br/dashboard',
    siteName: 'Prótese Capilar Cuiabá',
    title: 'Dashboard Administrativo',
    description: 'Painel administrativo para gestão do sistema.',
  },
  icons: {
    icon: '/images/logo.webp',
    apple: '/images/logo.webp',
  },
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}

