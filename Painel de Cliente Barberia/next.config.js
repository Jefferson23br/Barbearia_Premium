/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone', // Otimizado para produção
  images: {
    domains: ['images.unsplash.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
    unoptimized: false, // Otimização de imagens ativada
  },
  // Configuração para produção
  compress: true,
  poweredByHeader: false,
}

module.exports = nextConfig

