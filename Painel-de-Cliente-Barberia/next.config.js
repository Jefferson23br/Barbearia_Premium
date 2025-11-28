/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export', // Export estático para hospedagem compartilhada
  eslint: {
    ignoreDuringBuilds: true, // Ignora erros do ESLint durante o build
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  images: {
    domains: ['images.unsplash.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
    unoptimized: true, // Necessário para export estático
  },
  // Configuração para produção estática
  compress: true,
  poweredByHeader: false,
  trailingSlash: true, // Adiciona barra no final das URLs
}

module.exports = nextConfig

