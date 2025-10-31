"use client";

import Link from "next/link";
import { useLocale } from "next-intl";
import PropertyCard from "@/components/shared/property-card";
import { Property } from "@/lib/services/api/properties";
import { getProxiedImageUrl } from "@/lib/utils";
import { getPropertyPrice, formatPrice } from "@/lib/utils/property-pricing";
import { useCurrency } from "@/hooks/use-currency";
import { useTranslations } from "next-intl";

interface PropertyGridProps {
  properties: Property[];
  viewType: "grid" | "list";
}

export default function PropertyGrid({ properties, viewType }: PropertyGridProps) {
  const locale = useLocale();
  const currency = useCurrency();
  const t = useTranslations("General");

  return (
    <div
      className={
        viewType === "grid"
          ? "mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          : "mb-8 grid grid-cols-1 gap-6"
      }
    >
      {properties.map((property) => {
        const locationStr = [property.region, property.city, property.country]
          .filter(Boolean)
          .join(", ");

        const price = getPropertyPrice(property);
        const priceDisplay = price ? formatPrice(price, currency) : t("price-not-available");

        return (
          <Link key={property._id} href={`/${locale}/properties/${property._id}`}>
            <PropertyCard
              variant="featured"
              image={getProxiedImageUrl(property.image || property.video)}
              name={property.title || "Property"}
              location={locationStr || t("location-not-specified")}
              price={priceDisplay}
              badge={property.offerType || undefined}
              isVerified={property.isVerified}
              secondaryBadge={property?.category}
            />
          </Link>
        );
      })}
    </div>
  );
}
