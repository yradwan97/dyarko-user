import { Suspense } from "react";
import { Metadata } from "next";
import CompanyDetails from "./company-details";
import { getOwnerById } from "@/lib/services/api/companies";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://dyarko.com';

interface PageProps {
  params: Promise<{ id: string; locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id, locale } = await params;
  const isArabic = locale === 'ar';

  try {
    const owner = await getOwnerById(id);

    // Localized text
    const text = {
      professionalServices: isArabic ? 'خدمات عقارية احترافية في' : 'Professional real estate services in',
      rated: isArabic ? 'تقييم' : 'Rated',
      qualityProperties: isArabic ? 'عقارات عالية الجودة' : 'Quality properties',
      on: isArabic ? 'على' : 'on',
      realEstateCompany: isArabic ? 'شركة عقارية' : 'Real Estate Company',
      companyDetails: isArabic ? 'تفاصيل الشركة' : 'Company Details',
      findCompanies: isArabic ? 'ابحث عن شركات عقارية محترفة على ديركو' : 'Find professional real estate companies on Dyarko',
      propertyManagement: isArabic ? 'إدارة عقارات' : 'property management',
    };

    const ownerName = owner.name || owner.organizationName;

    // Create description
    const ratingText = owner.averageRating
      ? `${text.rated} ${owner.averageRating.toFixed(1)}/5`
      : text.qualityProperties;

    const description = owner.about
      ? owner.about.substring(0, 160)
      : `${ownerName} - ${text.professionalServices} ${owner.country}. ${ratingText} ${text.on} ${isArabic ? 'ديركو' : 'Dyarko'}.`;

    const title = isArabic
      ? `${ownerName} | ${text.realEstateCompany} | ديركو`
      : `${ownerName} | ${text.realEstateCompany} | Dyarko`;

    const imageUrl = owner.image || `${BASE_URL}/logo.png`;

    return {
      title,
      description,
      keywords: [
        ownerName || '',
        text.realEstateCompany,
        text.propertyManagement,
        owner.country,
        'dyarko',
        'ديركو',
        isArabic ? 'عقارات' : 'real estate',
      ],
      openGraph: {
        title,
        description,
        url: `${BASE_URL}/${locale}/companies/${id}`,
        siteName: isArabic ? 'ديركو' : 'Dyarko',
        images: [
          {
            url: imageUrl,
            width: 1200,
            height: 630,
            alt: ownerName,
          },
        ],
        locale: isArabic ? 'ar_AR' : 'en_US',
        type: 'profile',
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [imageUrl],
      },
      alternates: {
        canonical: `${BASE_URL}/${locale}/companies/${id}`,
        languages: {
          en: `${BASE_URL}/en/companies/${id}`,
          ar: `${BASE_URL}/ar/companies/${id}`,
        },
      },
      other: {
        'profile:username': ownerName || '',
        ...(owner.averageRating && { 'rating:average': owner.averageRating.toString() }),
        ...(owner.numberOfReviewers && { 'rating:count': owner.numberOfReviewers.toString() }),
      },
    };
  } catch (error) {
    console.error('Error generating company metadata:', error);
    return {
      title: isArabic ? 'تفاصيل الشركة | ديركو' : 'Company Details | Dyarko',
      description: isArabic ? 'ابحث عن شركات عقارية محترفة على ديركو' : 'Find professional real estate companies on Dyarko',
    };
  }
}

export default async function CompanyDetailsPage({ params }: PageProps) {
  const { id } = await params;

  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center">Loading...</div>}>
      <CompanyDetails id={id} />
    </Suspense>
  );
}
