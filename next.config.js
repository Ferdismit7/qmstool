// next.config.js
// This file configures Next.js for the project.
// You can add custom Next.js configuration options here.

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true, // Enables additional React checks and warnings
  env: {
    ENABLE_AI_FEATURES: process.env.ENABLE_AI_FEATURES,
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: '/api/:path*',
      },
    ];
  },
}

module.exports = nextConfig; 