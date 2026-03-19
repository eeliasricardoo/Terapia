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
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              // IMPORTANT: 'unsafe-inline' allows inline scripts which can be exploited via XSS
              // TODO: Replace with nonce-based approach for production (see: https://nextjs.org/docs/app/building-your-application/configuring/content-security-policy)
              "script-src 'self' 'unsafe-inline' https://js.stripe.com https://vercel.live",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://vercel.live",
              "font-src 'self' https://fonts.gstatic.com data:",
              "img-src 'self' data: blob: https://*.supabase.co https://*.stripe.com https://i.pravatar.cc https://images.unsplash.com",
              "connect-src 'self' http://localhost:* https://*.supabase.co wss://*.supabase.co https://api.stripe.com https://*.daily.co wss://*.daily.co https://*.upstash.io https://vercel.live wss://ws-*.pusher.com",
              "frame-src 'self' https://js.stripe.com https://*.daily.co https://vercel.live",
              "media-src 'self' blob: https://*.daily.co",
              "worker-src 'self' blob:",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'none'",
              'upgrade-insecure-requests',
            ].join('; '),
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
