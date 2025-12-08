import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // セッション関連の設定
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, must-revalidate',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
