import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    // If NEXT_PUBLIC_IMAGE_CDN_URL is configured (in Vercel/Production),
    // next.js will proxy all static images from that URL.
    // In development (local), it will default to serving locally from public/images.
    if (process.env.NEXT_PUBLIC_IMAGE_CDN_URL) {
      return [
        {
          source: "/images/:path*",
          destination: `${process.env.NEXT_PUBLIC_IMAGE_CDN_URL}/images/:path*`,
        },
      ];
    }
    return [];
  },
};

export default nextConfig;
