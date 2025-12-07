'use client'

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { HardHat, LogOut, UserCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
  const [cliente, setCliente] = useState<any>(null);
  const [isWaving, setIsWaving] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Verificar se está logado
    const clienteData = localStorage.getItem('cliente');
    if (!clienteData) {
      router.push('/');
      return;
    }

    setCliente(JSON.parse(clienteData));

    // Acena a cada 5 segundos
    const interval = setInterval(() => {
      setIsWaving(true);
      setTimeout(() => setIsWaving(false), 600);
    }, 5000);

    return () => clearInterval(interval);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('cliente');
    localStorage.removeItem('rememberMe');
    router.push('/');
  };

  if (!cliente) {
    return null; // Ou componente de loading
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-zinc-950 to-zinc-800">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: 'repeating-linear-gradient(45deg, #f59e0b 0px, #f59e0b 10px, transparent 10px, transparent 20px)',
        }}></div>
      </div>

      {/* Header */}
      <header className="relative z-10 px-6 py-4 flex items-center justify-between border-b border-amber-500/20">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <img
            src="/images/logo.webp"
            alt="Prótese Capilar Logo"
            className="w-16 h-16 object-contain"
          />
          <div>
            <h2 className="text-amber-500 font-bold text-lg">Prótese Capilar</h2>
            <p className="text-gray-400 text-xs">Painel do Cliente</p>
          </div>
        </div>

        {/* User Info and Logout */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-gray-300">
            {cliente.foto_url ? (
              <img
                src={cliente.foto_url}
                alt={cliente.nome_completo}
                className="w-10 h-10 rounded-full object-cover border-2 border-amber-500/30"
              />
            ) : (
              <UserCircle className="w-10 h-10 text-amber-500" />
            )}
            <div className="text-right">
              <p className="text-sm font-medium">{cliente.nome_completo}</p>
              <p className="text-xs text-gray-400">{cliente.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded-lg transition-all text-red-500"
          >
            <LogOut className="w-5 h-5" />
            <span>Sair</span>
          </button>
        </div>
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
              <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
              <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
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
            <motion.div
              animate={{ x: [0, 20, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute left-0"
            >
              <div className="w-32 h-20 bg-amber-700/50 rounded-lg border-2 border-amber-600/50 flex items-center justify-center">
                <HardHat className="w-12 h-12 text-amber-400" />
              </div>
            </motion.div>

            {/* Pessoa */}
            <motion.div
              animate={{
                rotate: isWaving ? [0, 20, -10, 10, 0] : 0,
                x: [0, 10, 0],
              }}
              transition={{
                rotate: { duration: 0.6 },
                x: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
              }}
              className="relative z-10"
            >
              <div className="w-24 h-24 bg-gradient-to-br from-amber-500 to-amber-700 rounded-full flex items-center justify-center border-4 border-amber-400/50 shadow-lg">
                <UserCircle className="w-16 h-16 text-white" />
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}



