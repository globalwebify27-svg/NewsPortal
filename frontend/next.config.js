/** @type {import('next').NextConfig} */
const nextConfig = {
  compress: true,
  swcMinify: true,

  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [360, 480, 640, 750, 828, 1080, 1200],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 86400, // Cache optimized images for 24h on CDN edge
    remotePatterns: [
      { protocol: "https", hostname: "**" },
      { protocol: "http", hostname: "**" },
    ],
  },

  experimental: {
    optimizePackageImports: ["lucide-react"],
  },

  // Aggressive HTTP cache headers — static assets cached 1 year, API 30s edge + 120s stale
  async headers() {
    return [
      {
        // Immutable static assets (JS/CSS bundles have content-hash in filename)
        source: "/_next/static/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      {
        // Uploaded media proxied from Hostinger — cache 24h on edge
        source: "/uploads/:path*",
        headers: [
          { key: "Cache-Control", value: "public, s-maxage=86400, stale-while-revalidate=604800" },
        ],
      },
      {
        // Public article API — 30s edge cache + 120s stale-while-revalidate
        source: "/api/v1/articles",
        headers: [
          { key: "Cache-Control", value: "public, s-maxage=30, stale-while-revalidate=120" },
        ],
      },
      {
        // Categories API — rarely changes, cache for 5 min
        source: "/api/v1/categories",
        headers: [
          { key: "Cache-Control", value: "public, s-maxage=300, stale-while-revalidate=600" },
        ],
      },
    ];
  },

  // Proxy /uploads/* and /public/uploads/* to Hostinger storage so images & videos load via
  // globalawaaz.com without exposing the internal Hostinger hostname.
  async rewrites() {
    const origin = process.env.HOSTINGER_MEDIA_ORIGIN || "https://yellowgreen-rook-384455.hostingersite.com";
    return [
      {
        source: "/uploads/:path*",
        destination: `${origin}/public/uploads/:path*`,
      },
      {
        source: "/public/uploads/:path*",
        destination: `${origin}/public/uploads/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
