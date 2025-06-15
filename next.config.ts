import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: '/launch/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'Content-Security-Policy',
            value: "frame-ancestors 'self' https://*.instructure.com"
          }
        ],
      }
    ]
  }
};

export default nextConfig;
