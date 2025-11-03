import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://dyarko.com'

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',              // Don't crawl API routes
          '/user/',             // Don't crawl user dashboard pages
          '/*/(auth)/*',        // Don't crawl auth pages (login, signup, forgot-password)
          '/*/user/*',          // Don't crawl localized user pages
          '/*/confirm-email',   // Don't crawl email confirmation
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
