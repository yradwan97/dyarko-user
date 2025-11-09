"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import PropertyCard from "@/components/shared/property-card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useProperties } from "@/hooks/use-properties";
import { useCurrency } from "@/hooks/use-currency";
import { Skeleton } from "@/components/ui/skeleton";
import { getPropertyPrice, getPropertyPeriod, formatPrice } from "@/lib/utils/property-pricing";
import { getLocalizedPath } from "@/lib/utils";

type SortOption = "recentlyAdded" | "mostPopular" | "bestOffer" | "nearest";

export default function PropertiesSection() {
  const locale = useLocale();
  const t = useTranslations("HomePage.PropertiesSection");
  const currency = useCurrency();
  const [sortBy, setSortBy] = useState<SortOption>("recentlyAdded");
  const isRTL = locale === "ar";

  // Fetch properties with the current sort option
  const { data, isLoading, isError } = useProperties({
    page: 1,
    size: 10,
    sortBy: sortBy === "recentlyAdded" ? undefined : sortBy,
  });

  const properties = data?.data?.data || [];

  return (
    <section className="px-4 py-8">
      <div className="mb-5">
        <Select
          value={sortBy}
          onValueChange={(value) => setSortBy(value as SortOption)}
        >
          <SelectTrigger className="border-0 p-0 text-xl font-bold text-main-500 dark:text-main-400 hover:opacity-80 focus:ring-0 focus:ring-offset-0 w-fit gap-2">
            <SelectValue />
          </SelectTrigger>
          <SelectContent side="bottom" align={isRTL ? "end" : "start"}>
            <SelectItem value="recentlyAdded">
              {t("sortOptions.recentlyAdded")}
            </SelectItem>
            <SelectItem value="mostPopular">
              {t("sortOptions.mostPopular")}
            </SelectItem>
            <SelectItem value="bestOffer">
              {t("sortOptions.bestOffer")}
            </SelectItem>
            <SelectItem value="nearest" disabled>
              {t("sortOptions.nearest")}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="h-32 w-full rounded-lg" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))}
        </div>
      ) : isError ? (
        <div className="py-8 text-center text-sm text-gray-500 dark:text-gray-400">
          {t("error")}
        </div>
      ) : properties.length === 0 ? (
        <div className="py-8 text-center text-sm text-gray-500 dark:text-gray-400">
          {t("noProperties")}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {properties.map((property) => {
            // Get price and period using utility functions
            const price = getPropertyPrice(property);
            const period = getPropertyPeriod(property);

            // Format price display
            const getPriceDisplay = () => {
              if (price === null) {
                return "Price not available";
              }

              const formattedPrice = formatPrice(price, currency);

              if (period) {
                // Simple period display without translation
                return `${formattedPrice}/${period}`;
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
                  image={
                    property.image
                      ? `/api/proxy-image?url=${encodeURIComponent(property.image)}`
                      : "/service.png"
                  }
                  name={property.title}
                  location={`${property.region}, ${property.city}`}
                  price={getPriceDisplay()}
                  badge={property.offerType}
                  propertyType={property.category}
                  propertyId={property._id}
                  isVerified={property.isVerified}
                />
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}
