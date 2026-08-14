/** @type {import('next').NextConfig} */
const nextConfig = {
  compress: true,
  swcMinify: true,
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [360, 480, 640, 750, 828, 1080, 1200],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    remotePatterns: [
      { protocol: "https", hostname: "**" },
      { protocol: "http", hostname: "**" },
    ],
  },
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },

  // Proxy /uploads/* and /public/uploads/* to Hostinger storage so images & videos load via
  // globalawaaz.com without exposing the internal Hostinger hostname.
  async rewrites() {
    const origin = process.env.HOSTINGER_MEDIA_ORIGIN || "https://yellowgreen-rook-384455.hostingersite.com";
    return [
      {
        source: "/uploads/:path*",
        destination: `${origin}/uploads/:path*`,
      },
      {
        source: "/public/uploads/:path*",
        destination: `${origin}/public/uploads/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
