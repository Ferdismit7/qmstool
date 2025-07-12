/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    ENABLE_AI_FEATURES: process.env.ENABLE_AI_FEATURES,
  },
  // Amplify compatibility
  output: 'standalone',
  // Next.js 15 specific optimizations
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  // Handle static assets
  images: {
    unoptimized: true,
  },
  // Ensure PostCSS and TailwindCSS are properly configured
  experimental: {
    optimizePackageImports: ['react-icons'],
  },
}

module.exports = nextConfig;