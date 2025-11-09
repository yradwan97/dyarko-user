import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig: NextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
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
  },
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      '@radix-ui/react-icons',
      '@tanstack/react-query',
      'next-intl',
      'date-fns'
    ],
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  }
};

export default withNextIntl(nextConfig);
