"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import { SlidersHorizontal } from "lucide-react";

import Typography from "@/components/shared/typography";
import Button from "@/components/shared/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Property } from "@/lib/services/api/properties";
import PropertyCard from "@/components/shared/property-card";
import PaginationControls from "@/components/shared/pagination-controls";
import PropertyFiltersModal, { PropertyFilters } from "./property-filters-modal";
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
  onFiltersChange?: (filters: PropertyFilters) => void;
  currentFilters?: PropertyFilters;
}

export default function CompanyProperties({
  properties,
  total,
  totalPages,
  currentPage,
  onPageChange,
  isLoading,
  onFiltersChange,
  currentFilters = {},
}: CompanyPropertiesProps) {
  const t = useTranslations("Companies");
  const tGeneral = useTranslations("General");
  const locale = useLocale();
  const currency = useCurrency();
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  const handleApplyFilters = (filters: PropertyFilters) => {
    onFiltersChange?.(filters);
  };

  const hasActiveFilters = Object.values(currentFilters).some(
    (value) => value !== undefined && value !== ""
  );

  const renderSkeletons = () => (
    <div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="aspect-4/3 w-full rounded-lg" />
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-5 w-1/3" />
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div>
      {/* Filter Button */}
      <div className="mb-4 flex justify-end">
        <Button
          variant="primary-outline"
          onClick={() => setIsFiltersOpen(true)}
          className="flex items-center gap-2 !px-4 !py-2"
        >
          <SlidersHorizontal className="h-4 w-4" />
          {tGeneral("filters")}
          {hasActiveFilters && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-main-600 text-xs text-white">
              !
            </span>
          )}
        </Button>
      </div>

      {isLoading ? (
        renderSkeletons()
      ) : properties.length === 0 ? (
        <div className="py-12 text-center">
          <Typography variant="h3" as="h3" className="text-gray-500">
            {t("no-properties")}
          </Typography>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {properties.map((property) => {
              const locationStr = [property.region, property.city, property.country]
                .filter(Boolean)
                .join(", ");

              const price = getPropertyPrice(property);
              const priceDisplay = price
                ? formatPrice(price, currency, locale)
                : tGeneral("price-not-available");

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
                    propertyId={property._id}
                    isFavourite={property.isFavourite}
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
        </>
      )}

      <PropertyFiltersModal
        isOpen={isFiltersOpen}
        onClose={() => setIsFiltersOpen(false)}
        onApplyFilters={handleApplyFilters}
        initialFilters={currentFilters}
      />
    </div>
  );
}
