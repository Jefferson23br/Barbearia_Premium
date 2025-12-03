'use client'

import { useState, useEffect } from 'react'
import { motion } from 'motion/react'
import { HardHat, UserCircle, ShieldCheck } from 'lucide-react'
import Link from 'next/link'

export default function Home() {
  const [isWaving, setIsWaving] = useState(false)

  useEffect(() => {
    // Acena a cada 5 segundos
    const interval = setInterval(() => {
      setIsWaving(true)
      setTimeout(() => setIsWaving(false), 600)
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: 'repeating-linear-gradient(45deg, #f59e0b 0px, #f59e0b 10px, transparent 10px, transparent 20px)',
        }}></div>
      </div>

      {/* Header */}
      <header className="relative z-10 px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <img
            src="/images/logo.webp"
            alt="Prótese Capilar Logo"
            className="w-16 h-16 object-contain"
          />
          <div>
            <h2 className="text-amber-500 font-bold text-lg">Prótese Capilar</h2>
            <p className="text-gray-400 text-xs">Cuiabá - MT</p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex gap-4">
          <a
            href="https://app.protesecapilarcuiaba.com.br"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-lg transition-all group"
          >
            <UserCircle className="w-5 h-5 text-amber-500 group-hover:scale-110 transition-transform" />
            <span className="text-amber-500 font-medium">Área de Cliente</span>
          </a>
          <a
            href="https://admin.protesecapilarcuiaba.com.br"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded-lg transition-all group"
          >
            <ShieldCheck className="w-5 h-5 text-red-500 group-hover:scale-110 transition-transform" />
            <span className="text-red-500 font-medium">Área Administrativa</span>
          </a>
        </nav>
      </header>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-100px)] px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl md:text-7xl font-bold mb-4 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 bg-clip-text text-transparent">
            Em Desenvolvimento
          </h1>
          <p className="text-gray-400 text-xl md:text-2xl mb-2">
            Estamos preparando algo incrível para você!
          </p>
          <div className="flex items-center justify-center gap-2 mt-4">
            <span className="text-gray-500">Aguarde</span>
            <div className="flex gap-1">
              <div className="w-2 h-2 bg-amber-500 rounded-full dot-flashing"></div>
              <div className="w-2 h-2 bg-amber-500 rounded-full dot-flashing"></div>
              <div className="w-2 h-2 bg-amber-500 rounded-full dot-flashing"></div>
            </div>
          </div>
        </motion.div>

        {/* Worker Animation */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="relative"
        >
          {/* Trabalhador com carrinho */}
          <div className="relative w-64 h-64 flex items-center justify-center">
            {/* Carrinho */}
            <div className="absolute bottom-12 left-1/2 -translate-x-1/2 animate-work">
              <svg width="120" height="80" viewBox="0 0 120 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Corpo do carrinho */}
                <rect x="20" y="20" width="80" height="40" fill="#f59e0b" stroke="#d97706" strokeWidth="2" rx="4"/>
                {/* Material dentro (animado) */}
                <rect x="25" y="25" width="70" height="30" fill="#78350f" className="animate-fill" style={{ transformOrigin: 'bottom' }}/>
                {/* Roda esquerda */}
                <circle cx="35" cy="65" r="8" fill="#3f3f46" stroke="#71717a" strokeWidth="2"/>
                <circle cx="35" cy="65" r="3" fill="#a1a1aa"/>
                {/* Roda direita */}
                <circle cx="85" cy="65" r="8" fill="#3f3f46" stroke="#71717a" strokeWidth="2"/>
                <circle cx="85" cy="65" r="3" fill="#a1a1aa"/>
                {/* Alça */}
                <path d="M 100 30 L 115 20" stroke="#d97706" strokeWidth="3" strokeLinecap="round"/>
              </svg>
            </div>

            {/* Trabalhador */}
            <div className="absolute bottom-16 right-8">
              <svg width="60" height="100" viewBox="0 0 60 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Capacete */}
                <ellipse cx="30" cy="15" rx="18" ry="12" fill="#f59e0b"/>
                <rect x="12" y="12" width="36" height="6" fill="#d97706" rx="2"/>
                
                {/* Cabeça */}
                <circle cx="30" cy="25" r="12" fill="#fbbf24"/>
                
                {/* Olhos */}
                <circle cx="25" cy="24" r="2" fill="#000"/>
                <circle cx="35" cy="24" r="2" fill="#000"/>
                
                {/* Sorriso */}
                <path d="M 22 28 Q 30 32 38 28" stroke="#000" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
                
                {/* Corpo */}
                <rect x="18" y="37" width="24" height="30" fill="#f59e0b" rx="4"/>
                
                {/* Braço esquerdo (trabalhando) */}
                <rect x="10" y="42" width="8" height="25" fill="#fbbf24" rx="4" className="animate-work"/>
                
                {/* Braço direito (acenando) */}
                <g className={isWaving ? 'animate-wave' : ''} style={{ transformOrigin: '42px 42px' }}>
                  <rect x="42" y="42" width="8" height="20" fill="#fbbf24" rx="4"/>
                  <circle cx="46" cy="38" r="4" fill="#fbbf24"/>
                </g>
                
                {/* Pernas */}
                <rect x="20" y="67" width="8" height="28" fill="#3f3f46" rx="4"/>
                <rect x="32" y="67" width="8" height="28" fill="#3f3f46" rx="4"/>
                
                {/* Botas */}
                <rect x="18" y="90" width="12" height="8" fill="#78350f" rx="2"/>
                <rect x="30" y="90" width="12" height="8" fill="#78350f" rx="2"/>
              </svg>
            </div>

            {/* Ferramentas ao redor */}
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute top-4 left-4"
            >
              <HardHat className="w-8 h-8 text-amber-500/50" />
            </motion.div>
          </div>
        </motion.div>

        {/* Message */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-12 text-center max-w-2xl"
        >
          <div className="bg-zinc-900/50 backdrop-blur-xl border border-amber-500/20 rounded-2xl p-8">
            <p className="text-gray-300 text-lg mb-4">
              Nossa equipe está trabalhando duro para trazer uma experiência única!
            </p>
            <p className="text-gray-400">
              Em breve você terá acesso ao nosso novo site com todas as informações sobre nossos serviços, planos e muito mais.
            </p>
            
            <div className="mt-8 pt-6 border-t border-amber-500/20">
              <p className="text-amber-500 font-semibold mb-3">Enquanto isso:</p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <a
                  href="https://app.protesecapilarcuiaba.com.br"
                  className="px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-semibold rounded-lg transition-all shadow-lg hover:shadow-xl"
                >
                  Acessar Área de Cliente
                </a>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="mt-12 text-gray-500 text-sm"
        >
          © 2025 Prótese Capilar Cuiabá - Transformando vidas através do cabelo
        </motion.p>
      </div>

      {/* Particles/Stars Background */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-amber-500/30 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              opacity: [0.2, 1, 0.2],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 2 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>
    </div>
  )
}

