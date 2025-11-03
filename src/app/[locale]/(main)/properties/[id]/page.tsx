import { Suspense } from "react";
import { Metadata } from "next";
import PropertyDetails from "./property-details";
import { getPropertyById } from "@/lib/services/api/properties";

const API_URI = process.env.NEXT_PUBLIC_API_URI;
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://dyarko.com';

interface PageProps {
  params: Promise<{ id: string; locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id, locale } = await params;
  const isArabic = locale === 'ar';

  try {
    const property = await getPropertyById(id);

    // Get the first image or fallback
    const imageUrl = property.images?.[0] || property.image || `${BASE_URL}/home-1.png`;

    // Localized text
    const text = {
      for: isArabic ? 'لـ' : 'for',
      in: isArabic ? 'في' : 'in',
      startingFrom: isArabic ? 'يبدأ من' : 'Starting from',
      perDay: isArabic ? 'يوميًا' : 'per day',
      perWeek: isArabic ? 'أسبوعيًا' : 'per week',
      perMonth: isArabic ? 'شهريًا' : 'per month',
      price: isArabic ? 'السعر:' : 'Price:',
      propertyDetails: isArabic ? 'تفاصيل العقار' : 'Property Details',
      findProperty: isArabic ? 'اكتشف واستأجر العقار المثالي مع ديركو' : 'Find and rent your perfect property with Dyarko',
      realEstate: isArabic ? 'عقارات' : 'real estate',
      propertyRental: isArabic ? 'تأجير عقارات' : 'property rental',
    };

    // Create description
    const description = property.description
      ? property.description.substring(0, 160)
      : `${property.title} - ${property.category} ${text.for} ${property.offerType} ${text.in} ${property.city}, ${property.country}`;

    // Get pricing info
    let priceInfo = '';
    if (property.dailyPrice) {
      priceInfo = `${text.startingFrom} ${property.dailyPrice} ${text.perDay}`;
    } else if (property.weeklyPrice) {
      priceInfo = `${text.startingFrom} ${property.weeklyPrice} ${text.perWeek}`;
    } else if (property.monthlyPrice) {
      priceInfo = `${text.startingFrom} ${property.monthlyPrice} ${text.perMonth}`;
    } else if (property.price) {
      priceInfo = `${text.price} ${property.price}`;
    }

    const title = isArabic
      ? `${property.title} | ${property.city} | ديركو`
      : `${property.title} | ${property.city} | Dyarko`;

    return {
      title,
      description,
      keywords: [
        property.title,
        property.category,
        property.city,
        property.country,
        property.offerType,
        text.realEstate,
        text.propertyRental,
        'dyarko',
        'ديركو',
      ],
      authors: [{ name: property.owner.name }],
      openGraph: {
        title,
        description,
        url: `${BASE_URL}/${locale}/properties/${id}`,
        siteName: isArabic ? 'ديركو' : 'Dyarko',
        images: [
          {
            url: imageUrl,
            width: 1200,
            height: 630,
            alt: property.title,
          },
        ],
        locale: isArabic ? 'ar_AR' : 'en_US',
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [imageUrl],
      },
      alternates: {
        canonical: `${BASE_URL}/${locale}/properties/${id}`,
        languages: {
          en: `${BASE_URL}/en/properties/${id}`,
          ar: `${BASE_URL}/ar/properties/${id}`,
        },
      },
      other: {
        'property:price': priceInfo,
        'property:location': `${property.city}, ${property.country}`,
        'property:type': property.category,
      },
    };
  } catch (error) {
    console.error('Error generating property metadata:', error);
    return {
      title: isArabic ? 'تفاصيل العقار | ديركو' : 'Property Details | Dyarko',
      description: isArabic ? 'اكتشف واستأجر العقار المثالي مع ديركو' : 'Find and rent your perfect property with Dyarko',
    };
  }
}

export default async function PropertyDetailsPage({ params }: PageProps) {
  const { id } = await params;

  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center">Loading...</div>}>
      <PropertyDetails id={id} />
    </Suspense>
  );
}
