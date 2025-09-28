/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  typescript: {
    ignoreBuildErrors: true,
  },
  
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api'}/:path*`,
      },
    ];
  },
  
  images: {
    unoptimized: true,
  },
  
  experimental: {
    optimizePackageImports: ['lodash'],
  },
}

module.exports = nextConfig;