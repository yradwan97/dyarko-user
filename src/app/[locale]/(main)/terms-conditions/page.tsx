"use client";

import { useLocale } from "next-intl";
import { useGetTermsAndConditions } from "@/app/[locale]/(auth)/sign-up/hooks/use-get-terms";
import Typography from "@/components/shared/typography";

export default function TermsAndConditionsPage() {
  const locale = useLocale();
  const { terms, isLoading } = useGetTermsAndConditions();

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-8" />
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded" />
            <div className="h-4 bg-gray-200 rounded" />
            <div className="h-4 bg-gray-200 rounded w-5/6" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <Typography variant="h2" as="h1" className="mb-8 text-center">
        {locale === "ar" ? "الشروط و الأحكام" : "Terms & Conditions"}
      </Typography>
      <div className="max-w-4xl mx-auto">
        {terms && terms.length > 0 ? (
          terms.map((term) => (
            <div key={term._id} className="mb-8 prose prose-lg max-w-none">
              <div
                className="text-gray-700 leading-relaxed"
                dangerouslySetInnerHTML={{
                  __html: locale === "ar" ? term.contentAr : term.contentEn,
                }}
              />
              {term.file && (
                <a
                  href={term.file}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-4 text-primary hover:underline"
                >
                  {locale === "ar" ? "عرض الملف" : "View File"}
                </a>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <Typography variant="body-lg-bold" as="p" className="text-gray-500">
              {locale === "ar"
                ? "لا توجد شروط وأحكام متاحة حالياً"
                : "No terms and conditions available at the moment"}
            </Typography>
          </div>
        )}
      </div>
    </div>
  );
}
