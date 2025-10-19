"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import PropertyCard from "@/components/shared/property-card";
import { Skeleton } from "@/components/ui/skeleton";
import { useFeaturedProperties, useProperties } from "@/hooks/use-properties";
import { useCurrency } from "@/hooks/use-currency";
import { getLocalizedPath, getProxiedImageUrl } from "@/lib/utils";
import { getPropertyPrice, getPropertyPeriod, formatPrice } from "@/lib/utils/property-pricing";

export default function MobileFeaturedProperties() {
  const locale = useLocale();
  const t = useTranslations("HomePage.FeaturedProperties");
  const currency = useCurrency();
  const { data, isLoading, isError } = useProperties({page: 1, isFeatured: false});
  // const { data, isLoading, isError } = useFeaturedProperties(1,10);

  useEffect(() => {
    console.log("Featured Properties Data:", data);
  }, [data]);

  return (
    <section className="px-4 py-8">
      {isLoading ? (
        <>
          <Skeleton className="mb-5 h-7 w-40" />
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="min-w-[220px] flex-shrink-0">
                <Skeleton className="mb-3 h-44 w-full rounded-lg" />
                <Skeleton className="mb-2 h-4 w-24" />
                <Skeleton className="mb-2 h-3 w-32" />
                <Skeleton className="h-4 w-20" />
              </div>
            ))}
          </div>
        </>
      ) : (
        <>
          <h2 className="mb-5 text-xl font-bold text-main-500 dark:text-main-400">{t("title")}</h2>
          {isError || !data?.data?.data || data.data.data.length === 0 ? (
            <p className="text-sm text-gray-500">{t("no-properties")}</p>
          ) : (
            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
              {data.data.data.map((property, index) => {
              const locationStr = [property.region, property.city]
                .filter(Boolean)
                .join(", ");

              // Get price and period using utility functions
              const price = getPropertyPrice(property);
              const period = getPropertyPeriod(property);

              // Format price display
              const getPriceDisplay = () => {
                if (price === null) {
                  return t("price-not-available");
                }

                const formattedPrice = formatPrice(price, currency);

                if (period) {
                  // Map period to translation key
                  const periodKey = `price-per-${period}` as any;
                  return `${formattedPrice} ${t(periodKey)}`;
                }

                return formattedPrice;
              };

              return (
                <Link
                  key={property._id}
                  href={getLocalizedPath(`/properties/${property._id}`, locale)}
                >
                  <PropertyCard
                    variant="featured"
                    image={getProxiedImageUrl(property.image || property.video)}
                    name={property.title}
                    location={locationStr || t("location-not-specified")}
                    price={getPriceDisplay()}
                    badge={property.offerType}
                    propertyType={property.category}
                    isVerified={property.isVerified}
                    priority={index < 2}
                  />
                </Link>
              );
              })}
            </div>
          )}
        </>
      )}
    </section>
  );
}
