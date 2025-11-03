import { Metadata } from 'next'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://dyarko.com'

export function generateHomeMetadata(locale: string): Metadata {
  const isArabic = locale === 'ar'

  const title = isArabic
    ? 'ديركو - منصة تأجير العقارات'
    : 'Dyarko - Property Rental Platform'

  const description = isArabic
    ? 'اكتشف واستأجر العقار المثالي مع ديركو. نقدم مجموعة واسعة من العقارات للإيجار والبيع في الكويت والمنطقة.'
    : 'Find and rent your perfect property with Dyarko. Browse thousands of properties for rent and sale across Kuwait and the region.'

  return {
    title,
    description,
    keywords: [
      'real estate',
      'property rental',
      'property for rent',
      'property for sale',
      'Kuwait properties',
      'villa rental',
      'apartment rental',
      'dyarko',
      'عقارات',
      'إيجار عقارات',
      'عقارات الكويت',
    ],
    authors: [{ name: 'Dyarko' }],
    openGraph: {
      title,
      description,
      url: `${BASE_URL}/${locale}`,
      siteName: isArabic ? 'ديركو' : 'Dyarko',
      images: [
        {
          url: `${BASE_URL}/home-1.png`,
          width: 1200,
          height: 630,
          alt: isArabic ? 'ديركو - منصة تأجير العقارات' : 'Dyarko - Property Rental Platform',
        },
      ],
      locale: isArabic ? 'ar_AR' : 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [`${BASE_URL}/home-1.png`],
    },
    alternates: {
      canonical: `${BASE_URL}/${locale}`,
      languages: {
        en: `${BASE_URL}/en`,
        ar: `${BASE_URL}/ar`,
      },
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    verification: {
      // Add your verification codes here when available
      // google: 'your-google-verification-code',
      // yandex: 'your-yandex-verification-code',
    },
  }
}
