"use client";

import Link from "next/link";
import { useLocale } from "next-intl";
import PropertyCard, { type OtherPrice } from "@/components/shared/property-card";
import { type Property } from "@/lib/services/api/properties";
import { getProxiedImageUrl } from "@/lib/utils";
import { getPropertyPrice, formatPrice, getPropertyPeriod } from "@/lib/utils/property-pricing";
import { useCurrency } from "@/hooks/use-currency";
import { useTranslations } from "next-intl";

interface PropertyGridProps {
  properties: Property[];
  viewType: "grid" | "list";
}

// Helper to get all available prices for a property (excluding the primary displayed one)
function getOtherPrices(
  property: Property,
  primaryPeriod: string | null,
  currency: string,
  locale: string,
  tPrice: (key: string) => string
): OtherPrice[] {
  // Only rent properties have multiple price periods
  if (property.offerType !== "rent") {
    return [];
  }

  const prices: OtherPrice[] = [];

  // Check each price period and add if available and not the primary
  if (property.isDaily && property.dailyPrice && primaryPeriod !== "day") {
    prices.push({
      period: tPrice("day"),
      price: formatPrice(property.dailyPrice, currency, locale),
    });
  }

  if (property.isWeekly && property.weeklyPrice && primaryPeriod !== "week") {
    prices.push({
      period: tPrice("week"),
      price: formatPrice(property.weeklyPrice, currency, locale),
    });
  }

  if (property.isMonthly && property.monthlyPrice && primaryPeriod !== "month") {
    prices.push({
      period: tPrice("month"),
      price: formatPrice(property.monthlyPrice, currency, locale),
    });
  }

  if (property.isWeekdays && property.weekdaysPrice && primaryPeriod !== "weekdays") {
    prices.push({
      period: tPrice("weekdays"),
      price: formatPrice(property.weekdaysPrice, currency, locale),
    });
  }

  if (property.isHolidays && property.holidaysPrice && primaryPeriod !== "holidays") {
    prices.push({
      period: tPrice("holidays"),
      price: formatPrice(property.holidaysPrice, currency, locale),
    });
  }

  return prices;
}

export default function PropertyGrid({ properties, viewType }: PropertyGridProps) {
  const locale = useLocale();
  const currency = useCurrency();
  const t = useTranslations("General");
  const tPrice = useTranslations("Properties.Price");

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
        const period = getPropertyPeriod(property);
        const periodText = period ? ` / ${tPrice(period)}` : "";
        const priceDisplay = price ? `${formatPrice(price, currency, locale)}${periodText}` : t("price-not-available");
        const otherPrices = getOtherPrices(property, period, currency, locale, tPrice);

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
              propertyId={property._id}
              adType={property.adType}
              otherPrices={otherPrices}
            />
          </Link>
        );
      })}
    </div>
  );
}
