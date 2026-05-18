import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  experimental: {
    serverActions: {
      bodySizeLimit: "16mb"
    }
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.amazonaws.com"
      },
      {
        protocol: "https",
        hostname: "**.cloudfront.net"
      }
    ]
  }
};

export default nextConfig;
