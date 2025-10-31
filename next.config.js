/** @type {import('next').NextConfig} */
const nextConfig = {
  // Remove env section - secrets should be loaded at runtime via Lambda
  // env: {
  //   // SECURITY: Never expose secrets at build time
  //   NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
  // },
  images: {
    unoptimized: true,
  },
  // Fix for Next.js 15.3.5 webpack minification error
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  // Completely disable minification to avoid webpack error
  webpack: (config, { isServer, dev }) => {
    // Disable all minification
    config.optimization.minimize = false;
    
    // Remove the problematic minify-webpack-plugin
    if (config.plugins) {
      config.plugins = config.plugins.filter(plugin => {
        return !plugin.constructor.name.includes('MinifyPlugin');
      });
    }
    
    return config;
  },
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
