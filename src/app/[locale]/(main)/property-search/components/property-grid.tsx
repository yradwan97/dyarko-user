"use client";

import Link from "next/link";
import { useLocale } from "next-intl";
import PropertyCard from "@/components/shared/property-card";
import { type Property } from "@/lib/services/api/properties";
import { getProxiedImageUrl } from "@/lib/utils";
import { getPropertyPrice, formatPrice, getPropertyPeriod, getOtherPrices } from "@/lib/utils/property-pricing";
import { useCurrency } from "@/hooks/use-currency";
import { useTranslations } from "next-intl";

interface PropertyGridProps {
  properties: Property[];
  viewType: "grid" | "list";
  title?: string;
}

export default function PropertyGrid({ properties, viewType, title }: PropertyGridProps) {
  const locale = useLocale();
  const currency = useCurrency();
  const t = useTranslations("General");
  const tPrice = useTranslations("Properties.Price");

  return (
    <>
      <span className="font-bold text-4xl text-main-600">{title || t("all-properties")}</span>
      <div
        className={
          viewType === "grid"
            ? "mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mt-3"
            : "mb-8 grid grid-cols-1 gap-6 mt-3"
        }
      >
        {properties.map((property) => {
          const locationStr = [property.region, property.city, property.country]
            .filter(Boolean)
            .join(", ");

          const price = getPropertyPrice(property);
          const discountedPrice = getPropertyPrice(property, true);
          const period = getPropertyPeriod(property);
          const periodText = period ? ` / ${tPrice(period)}` : "";
          const priceDisplay = price ? `${formatPrice(price, currency, locale)}${periodText}` : t("price-not-available");
          const discountedPriceDisplay =
            (
              property.discount &&
              property.discount > 0 &&
              discountedPrice &&
              property.discountStartDate &&
              property.discountEndDate &&
              new Date(property.discountStartDate) < new Date() &&
              new Date(property.discountEndDate) > new Date()
            ) ? `${formatPrice(discountedPrice, currency, locale)}${periodText}`
              : null;
          const otherPrices = getOtherPrices(property, period, currency, locale, tPrice);

          return (
            <Link key={property._id} href={`/${locale}/properties/${property._id}`}>
              <PropertyCard
                variant={viewType}
                image={getProxiedImageUrl(property.image || property.video)}
                name={property.title || "Property"}
                location={locationStr || t("location-not-specified")}
                discountedPrice={discountedPriceDisplay!}
                price={priceDisplay}
                badge={property.offerType || undefined}
                isVerified={property.isVerified}
                secondaryBadge={property?.category}
                propertyType={property?.category}
                propertyId={property._id}
                adType={property.adType}
                otherPrices={otherPrices}
                isFavourite={property.isFavourite}
                discount={property.discount}
              />
            </Link>
          );
        })}
      </div>
    </>
  );
}
