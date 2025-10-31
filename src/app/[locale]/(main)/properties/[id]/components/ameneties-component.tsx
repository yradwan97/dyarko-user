"use client";

import { useTranslations, useLocale } from "next-intl";
import HeadTitle from "./head-title";
import Typography from "@/components/shared/typography";

interface Amenity {
  _id?: string;
  nameAr?: string;
  nameEn?: string;
}

interface AmenetiesComponentProps {
  amenities: (string | Amenity)[];
}

export default function AmenetiesComponent({ amenities }: AmenetiesComponentProps) {
  const t = useTranslations("Properties.Details");
  const locale = useLocale();

  if (!amenities || amenities.length === 0) {
    return null;
  }

  return (
    <div className="border-b border-gray-200 py-12 dark:border-gray-700">
      <HeadTitle text={t("rental-amenities")} />

      {amenities.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {amenities.map((amenity, index) => {
            // Handle both string and object formats
            const amenityName = typeof amenity === 'string'
              ? amenity
              : (locale === "ar" ? amenity.nameAr : amenity.nameEn) || amenity.nameEn || amenity.nameAr;

            const amenityId = typeof amenity === 'object' && amenity._id ? amenity._id : index;

            return (
              <div
                key={amenityId}
                className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-all hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
              >
                <Typography
                  variant="body-md"
                  as="p"
                  className="font-medium capitalize text-gray-800 dark:text-gray-200"
                >
                  {amenityName}
                </Typography>
              </div>
            );
          })}
        </div>
      ) : (
        <Typography
          variant="body-md"
          as="p"
          className="text-center py-8 text-gray-500 dark:text-gray-400"
        >
          {t("no-data")}
        </Typography>
      )}
    </div>
  );
}
