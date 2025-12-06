import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Cadastro de Cliente - Prótese Capilar Cuiabá',
  description: 'Cadastre-se no sistema Prótese Capilar Cuiabá. Crie sua conta e comece a gerenciar seus planos e agendamentos.',
  keywords: [
    'cadastro', 'prótese capilar cuiabá', 'criar conta', 'registro cliente',
    'cadastro prótese capilar', 'nova conta'
  ],
  robots: {
    index: false, // Não indexar área de cadastro
    follow: false,
  },
}

export default function CadastroLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}





