import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, Lock, User, Phone, ArrowLeft, Scissors } from 'lucide-react';
import { ImageWithFallback } from './components/figma/ImageWithFallback';

type ViewType = 'login' | 'register' | 'forgot';

export default function App() {
  const [currentView, setCurrentView] = useState<ViewType>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Login:', { email, password });
    // Aqui você implementará a lógica de autenticação real
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Register:', { name, email, phone, password });
    // Aqui você implementará a lógica de cadastro real
  };

  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Forgot password:', { email });
    // Aqui você implementará a lógica de recuperação de senha
  };

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 300 : -300,
      opacity: 0,
    }),
  };

  const [direction, setDirection] = useState(0);

  const changeTo = (view: ViewType) => {
    const views: ViewType[] = ['login', 'register', 'forgot'];
    const currentIndex = views.indexOf(currentView);
    const newIndex = views.indexOf(view);
    setDirection(newIndex > currentIndex ? 1 : -1);
    setCurrentView(view);
  };

  return (
    <div className="min-h-screen w-full relative flex items-center justify-center overflow-hidden bg-black">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <ImageWithFallback
          src="https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=1920&q=80"
          alt="Barbershop"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-black/90 via-black/80 to-amber-950/60"></div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-10 right-10 opacity-10 hidden md:block">
        <Scissors className="w-32 h-32 text-amber-500 rotate-45" />
      </div>
      <div className="absolute bottom-10 left-10 opacity-10 hidden md:block">
        <Scissors className="w-24 h-24 text-amber-500 -rotate-45" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-md mx-4 sm:mx-auto">
        {/* Logo/Brand */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-amber-700 rounded-full flex items-center justify-center shadow-lg shadow-amber-500/50">
              <Scissors className="w-8 h-8 text-black rotate-45" />
            </div>
          </div>
          <h1 className="text-amber-500 mb-2">BarberShop Premium</h1>
          <p className="text-gray-400">Estilo e tradição em cada corte</p>
        </motion.div>

        {/* Card Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-zinc-900/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-amber-500/20 overflow-hidden"
        >
          <div className="p-8">
            <AnimatePresence mode="wait" custom={direction}>
              {currentView === 'login' && (
                <motion.div
                  key="login"
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.3 }}
                >
                  <h2 className="text-white mb-6 text-center">Entrar</h2>
                  <form onSubmit={handleLogin} className="space-y-5">
                    <div>
                      <label className="block text-gray-300 mb-2">Email</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg pl-12 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
                          placeholder="seu@email.com"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-gray-300 mb-2">Senha</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg pl-12 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
                          placeholder="••••••••"
                          required
                        />
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => changeTo('forgot')}
                        className="text-amber-500 hover:text-amber-400 transition-colors"
                      >
                        Esqueceu a senha?
                      </button>
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black py-3 rounded-lg transition-all shadow-lg shadow-amber-500/30 hover:shadow-amber-500/50"
                    >
                      Entrar
                    </button>
                  </form>

                  <div className="mt-6 text-center">
                    <p className="text-gray-400">
                      Não tem uma conta?{' '}
                      <button
                        onClick={() => changeTo('register')}
                        className="text-amber-500 hover:text-amber-400 transition-colors"
                      >
                        Cadastre-se
                      </button>
                    </p>
                  </div>
                </motion.div>
              )}

              {currentView === 'register' && (
                <motion.div
                  key="register"
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex items-center mb-6">
                    <button
                      onClick={() => changeTo('login')}
                      className="text-gray-400 hover:text-white transition-colors mr-3"
                    >
                      <ArrowLeft className="w-5 h-5" />
                    </button>
                    <h2 className="text-white">Criar Conta</h2>
                  </div>

                  <form onSubmit={handleRegister} className="space-y-4">
                    <div>
                      <label className="block text-gray-300 mb-2">Nome Completo</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg pl-12 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
                          placeholder="João Silva"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-gray-300 mb-2">Email</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg pl-12 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
                          placeholder="seu@email.com"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-gray-300 mb-2">Telefone</label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg pl-12 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
                          placeholder="(11) 99999-9999"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-gray-300 mb-2">Senha</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg pl-12 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
                          placeholder="••••••••"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-gray-300 mb-2">Confirmar Senha</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg pl-12 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
                          placeholder="••••••••"
                          required
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black py-3 rounded-lg transition-all shadow-lg shadow-amber-500/30 hover:shadow-amber-500/50 mt-6"
                    >
                      Criar Conta
                    </button>
                  </form>
                </motion.div>
              )}

              {currentView === 'forgot' && (
                <motion.div
                  key="forgot"
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex items-center mb-6">
                    <button
                      onClick={() => changeTo('login')}
                      className="text-gray-400 hover:text-white transition-colors mr-3"
                    >
                      <ArrowLeft className="w-5 h-5" />
                    </button>
                    <h2 className="text-white">Recuperar Senha</h2>
                  </div>

                  <p className="text-gray-400 mb-6">
                    Digite seu email para receber as instruções de recuperação de senha.
                  </p>

                  <form onSubmit={handleForgotPassword} className="space-y-5">
                    <div>
                      <label className="block text-gray-300 mb-2">Email</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg pl-12 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
                          placeholder="seu@email.com"
                          required
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black py-3 rounded-lg transition-all shadow-lg shadow-amber-500/30 hover:shadow-amber-500/50"
                    >
                      Enviar Instruções
                    </button>
                  </form>

                  <div className="mt-6 text-center">
                    <p className="text-gray-400">
                      Lembrou a senha?{' '}
                      <button
                        onClick={() => changeTo('login')}
                        className="text-amber-500 hover:text-amber-400 transition-colors"
                      >
                        Voltar ao login
                      </button>
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center text-gray-500 mt-6"
        >
          © 2025 BarberShop Premium. Todos os direitos reservados.
        </motion.p>
      </div>
    </div>
  );
}
