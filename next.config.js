/** @type {import('next').NextConfig} */
const nextConfig = {
    async headers() {
        return [
            {
                // Aplica esses headers em todas as rotas
                source: "/(.*)",
                headers: [
                    {
                        key: "X-DNS-Prefetch-Control",
                        value: "on",
                    },
                    {
                        key: "Strict-Transport-Security",
                        value: "max-age=63072000; includeSubDomains; preload",
                    },
                    {
                        key: "X-Content-Type-Options",
                        value: "nosniff",
                    },
                    {
                        key: "X-Frame-Options",
                        value: "SAMEORIGIN",
                    },
                    {
                        key: "Referrer-Policy",
                        value: "strict-origin-when-cross-origin",
                    },
                    {
                        key: "Permissions-Policy",
                        // Allow camera and microphone for Daily.co video consultations
                        // Block other unused privacy-sensitive features
                        value: "geolocation=(), browsing-topics=()",
                    },
                ],
            },
        ];
    },
    experimental: {
        serverComponentsExternalPackages: ['isomorphic-dompurify'],
    }
};

module.exports = nextConfig;
