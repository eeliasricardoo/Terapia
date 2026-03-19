/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'i.pravatar.cc',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'geolocation=(), browsing-topics=()',
          },

          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ]
  },
  experimental: {
    serverComponentsExternalPackages: ['isomorphic-dompurify'],
    serverActions: {
      allowedOrigins: [
        'localhost:3000',
        'localhost',
        '127.0.0.1:3000',
        // Allow production domain if set
        ...(process.env.NEXT_PUBLIC_APP_URL ? [new URL(process.env.NEXT_PUBLIC_APP_URL).host] : []),
      ],
    },
  },
}

module.exports = nextConfig
