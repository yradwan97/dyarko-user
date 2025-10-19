import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig: NextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
    localPatterns: [
      {
        pathname: '/api/proxy-image',
        search: '**',
      },
      {
        pathname: '/**',
      },
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: "new.dyarko.com"
      },
      {
        protocol: "http",
        hostname: "**"
      }
    ]
  }
};

export default withNextIntl(nextConfig);
