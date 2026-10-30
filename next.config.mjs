/** @type {import('next').NextConfig} */
const nextConfig = {
  // Compress all responses and static assets using gzip/brotli
  compress: true,

  // Hide framework fingerprint for lightweight headers & security
  poweredByHeader: false,

  // Strip debug logs in production client bundle to reduce JS bundle size
  compiler: {
    removeConsole: process.env.NODE_ENV === "production" ? { exclude: ["error", "warn"] } : false,
  },

  // Production Image Optimization Configuration
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60 * 60 * 24 * 30, // Cache optimized assets for 30 days
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    remotePatterns: [
      // Wildcard HTTPS for all architectural and AI generation CDNs
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },

  eslint: {
    ignoreDuringBuilds: true,
  },

  // High-performance tree-shaking & server action payload sizing
  experimental: {
    optimizePackageImports: ['lucide-react', 'date-fns', 'clsx', 'tailwind-merge'],
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },

  // HTTP Caching headers for high-performance CDN edge delivery
  async headers() {
    return [
      {
        source: '/:all*(svg|jpg|jpeg|png|webp|avif|ico)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
