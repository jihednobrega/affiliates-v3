/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
  },
  output: 'export',
  reactStrictMode: false,
  distDir: 'build',
  trailingSlash: true,
  poweredByHeader: false,
  generateEtags: false,
}

export default nextConfig
