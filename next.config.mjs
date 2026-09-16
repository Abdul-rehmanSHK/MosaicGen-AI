/** @type {import('next').NextConfig} */
const nextConfig = {
  // Production Image Optimization Configuration
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60 * 60 * 24 * 30, // Cache optimized assets for 30 days
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    remotePatterns: [
      // 1. AWS S3 Buckets (All regions & subdomains)
      {
        protocol: 'https',
        hostname: '**.amazonaws.com',
      },
      {
        protocol: 'https',
        hostname: '**.s3.amazonaws.com',
      },
      {
        protocol: 'https',
        hostname: '**.s3.*.amazonaws.com',
      },

      // 2. Cloudflare R2 Buckets (Custom domains & r2.dev public dev URLs)
      {
        protocol: 'https',
        hostname: '**.r2.cloudflarestorage.com',
      },
      {
        protocol: 'https',
        hostname: '**.r2.dev',
      },

      // 3. Unsplash Architectural Photography
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'plus.unsplash.com',
      },

      // 4. OpenAI DALL-E 3 Azure Blob Storage
      {
        protocol: 'https',
        hostname: 'oaidalleapiprodscus.blob.core.windows.net',
      },

      // 5. Fal.ai High-Speed Diffusion Storage
      {
        protocol: 'https',
        hostname: 'cdn.fal.ai',
      },

      // 6. MEC Brand Asset Repositories
      {
        protocol: 'https',
        hostname: 'mecartworks.com',
      },
      {
        protocol: 'https',
        hostname: 'mecartworks.ae',
      },
    ],
  },

  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
};

export default nextConfig;
