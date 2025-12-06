'use client'

import { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Mail, Lock, User, MapPin, Camera, ArrowLeft,
  FileText, Building2, Hash
} from 'lucide-react';
import { ImageWithFallback } from '../../components/figma/ImageWithFallback';
import Link from 'next/link';

export default function CadastroCliente() {
  // Estados do formulário
  const [nomeCompleto, setNomeCompleto] = useState('');
  const [email, setEmail] = useState('');
  const [cpf, setCpf] = useState('');
  const [rg, setRg] = useState('');
  const [rua, setRua] = useState('');
  const [numero, setNumero] = useState('');
  const [complemento, setComplemento] = useState('');
  const [bairro, setBairro] = useState('');
  const [cidade, setCidade] = useState('');
  const [estado, setEstado] = useState('');
  const [cep, setCep] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [foto, setFoto] = useState<File | null>(null);
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Máscaras de formatação
  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 11) {
      return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    }
    return value;
  };

  const formatCEP = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 8) {
      return numbers.replace(/(\d{5})(\d{3})/, '$1-$2');
    }
    return value;
  };

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCPF(e.target.value);
    setCpf(formatted);
  };

  const handleCepChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCEP(e.target.value);
    setCep(formatted);
  };

  const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFoto(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setFotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validações básicas
    if (senha !== confirmarSenha) {
      alert('As senhas não coincidem!');
      setIsSubmitting(false);
      return;
    }

    if (senha.length < 6) {
      alert('A senha deve ter no mínimo 6 caracteres!');
      setIsSubmitting(false);
      return;
    }

    // Aqui será implementada a lógica de envio para o backend
    const formData = {
      nome_completo: nomeCompleto,
      email,
      cpf: cpf.replace(/\D/g, ''),
      rg,
      rua,
      numero,
      complemento,
      bairro,
      cidade,
      estado,
      cep: cep.replace(/\D/g, ''),
      senha,
      foto: foto ? await fileToBase64(foto) : null,
    };

    console.log('Dados do formulário:', formData);
    
    // TODO: Implementar chamada à API
    // await fetch('https://api.protesecapilarcuiaba.com.br/api/clientes', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(formData)
    // });

    alert('Cadastro realizado com sucesso! (Frontend apenas - Backend pendente)');
    setIsSubmitting(false);
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const estados = [
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO',
    'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI',
    'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
  ];

  return (
    <div className="min-h-screen w-full relative flex items-center justify-center overflow-hidden bg-black py-10">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <ImageWithFallback
          src="https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=1920&q=80"
          alt="Barbershop"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-black/90 via-black/80 to-amber-950/60"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-4xl mx-4 sm:mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6"
        >
          <Link
            href="/"
            className="inline-flex items-center text-amber-500 hover:text-amber-400 transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Voltar para Login
          </Link>
          <div className="flex items-center justify-center mb-4">
            <div className="w-20 h-20 flex items-center justify-center">
              <img
                src="/images/logo.webp"
                alt="Prótese Capilar Logo"
                className="w-full h-full object-contain"
              />
            </div>
          </div>
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 bg-clip-text text-transparent">
            Cadastro de Cliente
          </h1>
          <p className="text-gray-400">Preencha os dados para criar sua conta</p>
        </motion.div>

        {/* Card Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-zinc-900/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-amber-500/20 overflow-hidden"
        >
          <form onSubmit={handleSubmit} className="p-8">
            {/* Upload de Foto */}
            <div className="mb-8 text-center">
              <label className="cursor-pointer inline-block">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFotoChange}
                  className="hidden"
                />
                <div className="relative inline-block">
                  <div className="w-32 h-32 rounded-full bg-zinc-800 border-2 border-amber-500/30 flex items-center justify-center overflow-hidden">
                    {fotoPreview ? (
                      <img
                        src={fotoPreview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Camera className="w-12 h-12 text-gray-400" />
                    )}
                  </div>
                  <div className="absolute bottom-0 right-0 bg-amber-500 rounded-full p-2">
                    <Camera className="w-5 h-5 text-black" />
                  </div>
                </div>
              </label>
              <p className="text-gray-400 text-sm mt-3">Clique para adicionar foto</p>
            </div>

            {/* Dados Pessoais */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-amber-500 mb-4 flex items-center">
                <User className="w-5 h-5 mr-2" />
                Dados Pessoais
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-gray-300 mb-2">Nome Completo *</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={nomeCompleto}
                      onChange={(e) => setNomeCompleto(e.target.value)}
                      className="w-full bg-white border border-zinc-700 rounded-lg pl-12 pr-4 py-3 text-black placeholder-gray-500 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
                      placeholder="João Silva"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-300 mb-2">Email *</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-white border border-zinc-700 rounded-lg pl-12 pr-4 py-3 text-black placeholder-gray-500 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
                      placeholder="seu@email.com"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-300 mb-2">CPF *</label>
                  <div className="relative">
                    <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={cpf}
                      onChange={handleCpfChange}
                      maxLength={14}
                      className="w-full bg-white border border-zinc-700 rounded-lg pl-12 pr-4 py-3 text-black placeholder-gray-500 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
                      placeholder="000.000.000-00"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-300 mb-2">RG</label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={rg}
                      onChange={(e) => setRg(e.target.value)}
                      className="w-full bg-white border border-zinc-700 rounded-lg pl-12 pr-4 py-3 text-black placeholder-gray-500 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
                      placeholder="00.000.000-0"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Endereço */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-amber-500 mb-4 flex items-center">
                <MapPin className="w-5 h-5 mr-2" />
                Endereço
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-gray-300 mb-2">Rua *</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={rua}
                      onChange={(e) => setRua(e.target.value)}
                      className="w-full bg-white border border-zinc-700 rounded-lg pl-12 pr-4 py-3 text-black placeholder-gray-500 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
                      placeholder="Rua das Flores"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-300 mb-2">Número *</label>
                  <input
                    type="text"
                    value={numero}
                    onChange={(e) => setNumero(e.target.value)}
                    className="w-full bg-white border border-zinc-700 rounded-lg px-4 py-3 text-black placeholder-gray-500 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
                    placeholder="123"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-300 mb-2">Complemento</label>
                  <input
                    type="text"
                    value={complemento}
                    onChange={(e) => setComplemento(e.target.value)}
                    className="w-full bg-white border border-zinc-700 rounded-lg px-4 py-3 text-black placeholder-gray-500 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
                    placeholder="Apto 101"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 mb-2">Bairro *</label>
                  <input
                    type="text"
                    value={bairro}
                    onChange={(e) => setBairro(e.target.value)}
                    className="w-full bg-white border border-zinc-700 rounded-lg px-4 py-3 text-black placeholder-gray-500 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
                    placeholder="Centro"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-300 mb-2">Cidade *</label>
                  <input
                    type="text"
                    value={cidade}
                    onChange={(e) => setCidade(e.target.value)}
                    className="w-full bg-white border border-zinc-700 rounded-lg px-4 py-3 text-black placeholder-gray-500 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
                    placeholder="Cuiabá"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-300 mb-2">Estado *</label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <select
                      value={estado}
                      onChange={(e) => setEstado(e.target.value)}
                      className="w-full bg-white border border-zinc-700 rounded-lg pl-12 pr-4 py-3 text-black focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all appearance-none"
                      required
                    >
                      <option value="">Selecione</option>
                      {estados.map((est) => (
                        <option key={est} value={est} className="text-black">
                          {est}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-gray-300 mb-2">CEP *</label>
                  <div className="relative">
                    <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={cep}
                      onChange={handleCepChange}
                      maxLength={9}
                      className="w-full bg-white border border-zinc-700 rounded-lg pl-12 pr-4 py-3 text-black placeholder-gray-500 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
                      placeholder="78000-000"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Senha */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-amber-500 mb-4 flex items-center">
                <Lock className="w-5 h-5 mr-2" />
                Segurança
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 mb-2">Senha *</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="password"
                      value={senha}
                      onChange={(e) => setSenha(e.target.value)}
                      className="w-full bg-white border border-zinc-700 rounded-lg pl-12 pr-4 py-3 text-black placeholder-gray-500 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
                      placeholder="••••••••"
                      required
                      minLength={6}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-300 mb-2">Confirmar Senha *</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="password"
                      value={confirmarSenha}
                      onChange={(e) => setConfirmarSenha(e.target.value)}
                      className="w-full bg-white border border-zinc-700 rounded-lg pl-12 pr-4 py-3 text-black placeholder-gray-500 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
                      placeholder="••••••••"
                      required
                      minLength={6}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Botão Salvar */}
            <div className="flex justify-end gap-4">
              <Link
                href="/"
                className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-colors"
              >
                Cancelar
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-8 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black rounded-lg transition-all shadow-lg shadow-amber-500/30 hover:shadow-amber-500/50 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
              >
                {isSubmitting ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </form>
        </motion.div>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center text-gray-500 mt-6"
        >
          © 2025 Prótese Capilar. Todos os direitos reservados.
        </motion.p>
      </div>
    </div>
  );
}





