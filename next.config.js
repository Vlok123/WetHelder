/** @type {import('next').NextConfig} */
const nextConfig = {
  // App directory is enabled by default in Next.js 13.4+
  pageExtensions: ['tsx', 'ts', 'jsx', 'js'],
  serverExternalPackages: ["@prisma/client", "prisma"],
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
}

module.exports = nextConfig 