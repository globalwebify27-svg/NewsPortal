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
    // Tree-shake heavy packages at build time — only bundle icons actually imported
    optimizePackageImports: [
      "lucide-react",
      "@radix-ui/react-tooltip",
      "date-fns",
    ],
    // Inline small CSS modules to reduce render-blocking stylesheets
    optimizeCss: false, // keep false – globals.css is large, inlining would hurt TTFB
  },

  // Aggressive HTTP cache headers + Global Security headers
  async headers() {
    return [
      {
        // Global Security Headers for all routes
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
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
      {
        // Logo & header settings — changes only when admin edits, cache 5 min
        source: "/api/v1/logo-settings",
        headers: [
          { key: "Cache-Control", value: "public, s-maxage=300, stale-while-revalidate=600" },
        ],
      },
      {
        // Social links — rarely changes, cache 5 min
        source: "/api/v1/social-settings",
        headers: [
          { key: "Cache-Control", value: "public, s-maxage=300, stale-while-revalidate=600" },
        ],
      },
      {
        // Ad settings — cache 2 min
        source: "/api/v1/ad-settings",
        headers: [
          { key: "Cache-Control", value: "public, s-maxage=120, stale-while-revalidate=300" },
        ],
      },
      {
        // Videos — cache 30s
        source: "/api/v1/videos",
        headers: [
          { key: "Cache-Control", value: "public, s-maxage=30, stale-while-revalidate=120" },
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
