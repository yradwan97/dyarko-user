"use client";

import { useTranslations, useLocale } from "next-intl";
import HeadTitle from "./head-title";
import { cn } from "@/lib/utils";
import {
  Wifi,
  Car,
  Utensils,
  ShowerHead,
  Shirt,
  Sparkles
} from "lucide-react";

interface Service {
  _id?: string;
  nameAr?: string;
  nameEn?: string;
  price?: number;
  image?: string;
}

interface ServicesComponentProps {
  services: (string | Service)[];
  currency?: string;
}

// Map service names to icons
const getServiceIcon = (name: string) => {
  const lowerName = name.toLowerCase();
  if (lowerName.includes("wifi") || lowerName.includes("internet") || lowerName.includes("wi fi")) return <Wifi className="h-4 w-4" />;
  if (lowerName.includes("parking") || lowerName.includes("garage") || lowerName.includes("car")) return <Car className="h-4 w-4" />;
  if (lowerName.includes("food") || lowerName.includes("breakfast") || lowerName.includes("meal")) return <Utensils className="h-4 w-4" />;
  if (lowerName.includes("clean") || lowerName.includes("shower")) return <ShowerHead className="h-4 w-4" />;
  if (lowerName.includes("laundry") || lowerName.includes("wash")) return <Shirt className="h-4 w-4" />;
  return <Sparkles className="h-4 w-4" />;
};

export default function ServicesComponent({ services, currency = "KWD" }: ServicesComponentProps) {
  const t = useTranslations("Properties.Details");
  const locale = useLocale();

  if (!services || services.length === 0) {
    return null;
  }

  return (
    <div className="rounded-xl bg-gray-50 dark:bg-gray-800/50 p-6 mb-8">
      <HeadTitle text={`${t("services")} \\ Extra Facilities`} className="mb-6" />

      <div className={cn(
        "flex flex-wrap gap-3",
        locale === "ar" && "flex-row-reverse"
      )}>
        {services.map((service, index) => {
          // Handle both string and object formats
          const serviceName = typeof service === 'string'
            ? service
            : (locale === "ar" ? service.nameAr : service.nameEn) || service.nameEn || service.nameAr || "";

          const servicePrice = typeof service === 'object' ? service.price : null;
          const serviceId = typeof service === 'object' && service._id ? service._id : index;

          return (
            <div
              key={serviceId}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-full border border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-800 transition-colors hover:border-main-400",
                locale === "ar" && "flex-row-reverse"
              )}
            >
              {getServiceIcon(serviceName)}
              <span className="text-sm font-medium text-gray-700 dark:text-gray-200 capitalize">
                {serviceName}
              </span>
              {servicePrice !== null && servicePrice !== undefined && (
                <span className="text-sm font-medium text-main-600">
                  {servicePrice} {currency.toLowerCase()}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
