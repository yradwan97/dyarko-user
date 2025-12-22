"use client";

import { useTranslations, useLocale } from "next-intl";
import { Property } from "@/lib/services/api/properties";
import Typography from "@/components/shared/typography";
import { Bed, Bath, Building2, Users } from "lucide-react";
import { cn } from "@/lib/utils";

interface HotelApartmentTypesProps {
  property: Property;
  currency?: string;
}

interface HotelApartment {
  _id?: string;
  type?: string;
  title?: string;
  description?: string;
  capacity?: number;
  bedrooms?: number;
  bathrooms?: number;
  area?: number;
  isDaily?: boolean;
  dailyPrice?: number | string;
  isWeekly?: boolean;
  weeklyPrice?: number | string;
  isMonthly?: boolean;
  monthlyPrice?: number | string;
  numberOfUnits?: number;
}

export default function HotelApartmentTypes({ property, currency = "KWD" }: HotelApartmentTypesProps) {
  const t = useTranslations("Properties.Details");
  const locale = useLocale();
  const isRTL = locale === "ar";

  const apartments = (property.apartments || []) as HotelApartment[];

  if (apartments.length === 0) {
    return (
      <div className="py-12 text-center">
        <Typography variant="body-lg-medium" as="p" className="text-gray-500">
          {t("no-apartments-available")}
        </Typography>
      </div>
    );
  }

  return (
    <div className={cn("py-6 space-y-6", isRTL && "text-right")} dir={isRTL ? "rtl" : "ltr"}>
      {apartments.map((apartment, index) => (
        <div
          key={apartment._id || index}
          className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800"
        >
          {/* Apartment Title */}
          <Typography variant="h5" as="h3" className="font-bold text-gray-900 dark:text-white mb-4">
            {apartment.title || `${t("apartment")} ${index + 1}`}
          </Typography>

          {/* Stats Row */}
          <div className="flex flex-wrap gap-3 mb-4">
            {/* Bedrooms */}
            {apartment.bedrooms && (
              <div className="flex flex-col items-center justify-center min-w-20 p-3 rounded-lg border border-gray-200 bg-gray-50 dark:border-gray-600 dark:bg-gray-700">
                <Bed className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                <span className="mt-1 text-xs text-gray-500 dark:text-gray-400">{t("bedrooms")}</span>
                <span className="text-sm font-bold text-gray-900 dark:text-white">
                  {apartment.bedrooms} {t("bed")}
                </span>
              </div>
            )}

            {/* Bathrooms */}
            {apartment.bathrooms && (
              <div className="flex flex-col items-center justify-center min-w-20 p-3 rounded-lg border border-gray-200 bg-gray-50 dark:border-gray-600 dark:bg-gray-700">
                <Bath className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                <span className="mt-1 text-xs text-gray-500 dark:text-gray-400">{t("bathrooms")}</span>
                <span className="text-sm font-bold text-gray-900 dark:text-white">
                  {apartment.bathrooms} {t("bath")}
                </span>
              </div>
            )}

            {/* Unit Type */}
            {apartment.type && (
              <div className="flex flex-col items-center justify-center min-w-20 p-3 rounded-lg border border-gray-200 bg-gray-50 dark:border-gray-600 dark:bg-gray-700">
                <Building2 className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                <span className="mt-1 text-xs text-gray-500 dark:text-gray-400">{t("unit-type")}</span>
                <span className="text-sm font-bold text-gray-900 dark:text-white capitalize">
                  {apartment.type}
                </span>
              </div>
            )}
          </div>

          {/* Capacity */}
          {apartment.capacity && (
            <div className="flex items-center gap-2 mb-4 text-gray-600 dark:text-gray-400">
              <Users className="h-4 w-4" />
              <span className="text-sm font-medium">
                {apartment.capacity} {t("person")}
              </span>
            </div>
          )}

          {/* Prices Row */}
          <div className="flex flex-wrap gap-4 mb-4">
            {apartment.isDaily && apartment.dailyPrice && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">{t("daily-price")}:</span>
                <span className="text-sm font-bold text-main-600">
                  {apartment.dailyPrice} {currency}/{t("day")}
                </span>
              </div>
            )}
            {apartment.isWeekly && apartment.weeklyPrice && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">{t("weekly-price")}:</span>
                <span className="text-sm font-bold text-main-600">
                  {apartment.weeklyPrice} {currency}/{t("week")}
                </span>
              </div>
            )}
            {apartment.isMonthly && apartment.monthlyPrice && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">{t("monthly-price")}:</span>
                <span className="text-sm font-bold text-main-600">
                  {apartment.monthlyPrice} {currency}/{t("month")}
                </span>
              </div>
            )}
          </div>

          {/* Description */}
          {apartment.description && (
            <div className="mb-2">
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{t("details")} : </span>
              <span className="text-sm text-gray-600 dark:text-gray-400">{apartment.description}</span>
            </div>
          )}
        </div>
      ))}

      {/* Note */}
      <div className="mt-6 p-4 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
        <Typography variant="body-sm" as="p" className="text-amber-800 dark:text-amber-200">
          <span className="font-semibold">{t("note")}:</span> {t("hotel-types-note")}
        </Typography>
      </div>
    </div>
  );
}
