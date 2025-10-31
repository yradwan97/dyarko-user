"use client";

import { useTranslations, useLocale } from "next-intl";
import HeadTitle from "./head-title";
import Typography from "@/components/shared/typography";

interface Service {
  _id?: string;
  nameAr?: string;
  nameEn?: string;
  price?: number;
}

interface ServicesComponentProps {
  services: (string | Service)[];
  currency?: string;
}

export default function ServicesComponent({ services, currency = "KWD" }: ServicesComponentProps) {
  const t = useTranslations("Properties.Details");
  const locale = useLocale();

  if (!services || services.length === 0) {
    return null;
  }

  return (
    <div className="border-b border-gray-200 py-12 dark:border-gray-700">
      <HeadTitle text={t("services")} />

      {services.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service, index) => {
            // Handle both string and object formats
            const serviceName = typeof service === 'string'
              ? service
              : (locale === "ar" ? service.nameAr : service.nameEn) || service.nameEn || service.nameAr;

            const servicePrice = typeof service === 'object' ? service.price : null;
            const serviceId = typeof service === 'object' && service._id ? service._id : index;

            return (
              <div
                key={serviceId}
                className="rounded-lg border border-gray-200 bg-white overflow-hidden shadow-sm transition-all hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
              >
                <div className="p-4 space-y-2">
                  <Typography
                    variant="body-md"
                    as="h4"
                    className="font-bold capitalize text-gray-800 dark:text-gray-200"
                  >
                    {serviceName}
                  </Typography>

                  {servicePrice !== null && servicePrice !== undefined && (
                    <div className="flex justify-between items-center">
                      <Typography
                        variant="body-sm"
                        as="span"
                        className="text-gray-600 dark:text-gray-400"
                      >
                        {t("price")}
                      </Typography>
                      <Typography
                        variant="body-sm"
                        as="span"
                        className="font-semibold text-primary"
                      >
                        {servicePrice} {currency}
                      </Typography>
                    </div>
                  )}
                </div>
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
