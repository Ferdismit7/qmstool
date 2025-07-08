// next.config.js
// This file configures Next.js for the project.
// You can add custom Next.js configuration options here.

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    ENABLE_AI_FEATURES: process.env.ENABLE_AI_FEATURES,
  },
  // Amplify compatibility
  output: 'standalone',
  experimental: {
    outputFileTracingRoot: undefined,
  },
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