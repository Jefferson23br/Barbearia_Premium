import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Dashboard - Painel do Cliente | Prótese Capilar Cuiabá',
  description: 'Acesse seu painel de cliente da Prótese Capilar Cuiabá.',
  robots: {
    index: false,
    follow: false,
  },
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}

