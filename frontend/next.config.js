/** @type {import('next').NextConfig} */
const nextConfig = {
  compress: true,
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { protocol: "https", hostname: "**" },
      { protocol: "http", hostname: "**" },
    ],
  },
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },

  // Proxy /public/uploads/* to Hostinger storage so images load via
  // globalawaaz.com without exposing the internal Hostinger hostname.
  async rewrites() {
    return [
      {
        source: "/public/uploads/:path*",
        destination:
          (process.env.HOSTINGER_MEDIA_ORIGIN ||
            "https://yellowgreen-rook-384455.hostingersite.com") +
          "/public/uploads/:path*",
      },
    ];
  },
};

module.exports = nextConfig;
