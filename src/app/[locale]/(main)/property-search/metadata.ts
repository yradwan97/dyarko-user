import { Metadata } from 'next'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://dyarko.com'

export function generatePropertySearchMetadata(locale: string): Metadata {
  const isArabic = locale === 'ar'

  const title = isArabic
    ? 'البحث عن العقارات | ديركو'
    : 'Property Search | Dyarko'

  const description = isArabic
    ? 'ابحث عن العقار المثالي من بين آلاف العقارات المتاحة للإيجار والبيع. فلتر حسب الموقع، السعر، النوع والمزيد.'
    : 'Search for your perfect property among thousands of listings for rent and sale. Filter by location, price, type, and more.'

  return {
    title,
    description,
    keywords: [
      'property search',
      'find property',
      'rent property',
      'buy property',
      'real estate search',
      'Kuwait properties',
      'بحث عقارات',
      'إيجار',
      'عقارات للبيع',
    ],
    openGraph: {
      title,
      description,
      url: `${BASE_URL}/${locale}/property-search`,
      siteName: isArabic ? 'ديركو' : 'Dyarko',
      images: [
        {
          url: `${BASE_URL}/home-1.png`,
          width: 1200,
          height: 630,
          alt: isArabic ? 'البحث عن العقارات' : 'Property Search',
        },
      ],
      locale: isArabic ? 'ar_AR' : 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    alternates: {
      canonical: `${BASE_URL}/${locale}/property-search`,
      languages: {
        en: `${BASE_URL}/en/property-search`,
        ar: `${BASE_URL}/ar/property-search`,
      },
    },
  }
}
