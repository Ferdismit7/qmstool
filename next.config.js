/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    ENABLE_AI_FEATURES: process.env.ENABLE_AI_FEATURES,
  },
  // Amplify compatibility
  //output: 'standalone',
  // Handle static assets
  images: {
    unoptimized: true,
  },
}

module.exports = nextConfig;
