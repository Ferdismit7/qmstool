/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    ENABLE_AI_FEATURES: process.env.ENABLE_AI_FEATURES,
    DATABASE_URL: process.env.DATABASE_URL ?? "",
    JWT_SECRET: process.env.JWT_SECRET ?? "",
    TZ: "Europe/Stockholm",
    // AWS S3 Configuration
    ACCESS_KEY_ID: process.env.ACCESS_KEY_ID ?? "",
    SECRET_ACCESS_KEY: process.env.SECRET_ACCESS_KEY ?? "",
    S3_BUCKET_NAME: process.env.S3_BUCKET_NAME ?? "",
    REGION: process.env.REGION ?? "eu-north-1",
  },
  // Amplify compatibility
  //output: 'standalone',
  // Handle static assets
  images: {
    unoptimized: true,
  },
}

module.exports = nextConfig;
