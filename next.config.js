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
  // Remove experimental flag that's now standard in v15
  // experimental: {
  //   outputFileTracingRoot: undefined,
  // },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: '/api/:path*',
      },
    ];
  },
  // Handle static assets
  images: {
    unoptimized: true,
  },
}

module.exports = nextConfig;