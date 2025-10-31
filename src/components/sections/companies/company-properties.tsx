"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";

import Typography from "@/components/shared/typography";
import { Spinner } from "@/components/ui/spinner";
import { Property } from "@/lib/services/api/properties";
import PropertyCard from "@/components/shared/property-card";
import PaginationControls from "@/components/shared/pagination-controls";
import { getProxiedImageUrl } from "@/lib/utils";
import { getPropertyPrice, formatPrice } from "@/lib/utils/property-pricing";
import { useCurrency } from "@/hooks/use-currency";

interface CompanyPropertiesProps {
  properties: Property[];
  total: number;
  totalPages: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  isLoading: boolean;
  activeTab: "all" | "rent" | "installment";
}

export default function CompanyProperties({
  properties,
  total,
  totalPages,
  currentPage,
  onPageChange,
  isLoading,
  activeTab,
}: CompanyPropertiesProps) {
  const t = useTranslations("Companies");
  const tGeneral = useTranslations("General");
  const currency = useCurrency();

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner className="h-12 w-12 text-main-400" />
      </div>
    );
  }

  if (properties.length === 0) {
    return (
      <div className="mb-16 py-12 text-center">
        <Typography variant="h3" as="h3" className="text-gray-500">
          {t("no-properties")}
        </Typography>
      </div>
    );
  }

  return (
    <div className="mb-16">
      <div className="mb-8 flex items-center justify-between">
        <Typography variant="h2" as="h2" className="text-2xl text-gray-900 md:text-3xl">
          {t(`tabs.${activeTab}`)}
        </Typography>
        <Typography variant="body-md" as="p" className="text-gray-600">
          {total} {total === 1 ? tGeneral("property") : tGeneral("properties")}
        </Typography>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {properties.map((property) => {
          const locationStr = [property.region, property.city, property.country]
            .filter(Boolean)
            .join(", ");

          const price = getPropertyPrice(property);
          const priceDisplay = price ? formatPrice(price, currency) : tGeneral("price-not-available");

          return (
            <Link key={property._id} href={`/properties/${property._id}`}>
              <PropertyCard
                variant="featured"
                image={getProxiedImageUrl(property.image || property.video)}
                name={property.title || "Property"}
                location={locationStr || tGeneral("location-not-specified")}
                price={priceDisplay}
                badge={property.offerType || undefined}
                isVerified={property.isVerified}
                secondaryBadge={property?.category}
              />
            </Link>
          );
        })}
      </div>

      <PaginationControls
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
        disabled={isLoading}
      />
    </div>
  );
}
