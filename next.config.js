/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    ENABLE_AI_FEATURES: process.env.ENABLE_AI_FEATURES,
    DATABASE_URL: process.env.DATABASE_URL ?? "",
    JWT_SECRET: process.env.JWT_SECRET ?? "",
    TZ: "Europe/Stockholm",
  },
  // Amplify compatibility
  //output: 'standalone',
  // Handle static assets
  images: {
    unoptimized: true,
  },
}

module.exports = nextConfig;
