/** @type {import('next').NextConfig} */

// Strapi runs inside the same container on an internal port. The browser can
// never reach it directly, so media requests come to the Next.js server on a
// relative /uploads/... path and get proxied to Strapi here.
const strapiInternalUrl =
  process.env.STRAPI_INTERNAL_URL ||
  process.env.NEXT_PUBLIC_STRAPI_API_URL ||
  'http://127.0.0.1:1337';

const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '1337',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'images.pexels.com',
      }
    ],
  },
  async rewrites() {
    return [
      {
        source: '/uploads/:path*',
        destination: `${strapiInternalUrl}/uploads/:path*`,
      },
      {
        source: '/api/:path*',
        destination: `${strapiInternalUrl}/api/:path*`,
      },
    ];
  },
}

module.exports = nextConfig
