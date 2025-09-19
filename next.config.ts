/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
  },
  experimental: {
    appDir: false,
  },
  output: 'export',
  reactStrictMode: false,
  distDir: 'build',
  trailingSlash: true,
  poweredByHeader: false,
  generateEtags: false,
  eslint: {
    ignoreDuringBuilds: true,
  },
}

export default nextConfig
