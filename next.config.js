/** @type {import('next').NextConfig} */
const nextConfig = {
  // Secrets are injected at runtime via the Lambda proxy; never bake them into the build
  images: {
    unoptimized: true,
  },
  // Next.js 16: Use Turbopack by default (webpack config removed)
  // Turbopack handles minification automatically and more efficiently
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  // Empty turbopack config to explicitly use Turbopack (Next.js 16 default)
  // This silences the warning about webpack config with Turbopack
  turbopack: {},
  async headers() {
    return [
      {
        source: '/api/auth/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, max-age=0',
          },
        ],
      },
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains',
          },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https:; font-src 'self' data:; form-action 'self' https:; frame-ancestors 'none';",
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig;
