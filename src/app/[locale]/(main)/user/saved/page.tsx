"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useQuery } from "@tanstack/react-query";
import { Heart } from "lucide-react";
import Link from "next/link";

import Typography from "@/components/shared/typography";
import PropertyCard from "@/components/shared/property-card";
import { getFavourites } from "@/lib/services/api/favourites";
import { Spinner } from "@/components/ui/spinner";
import PaginationControls from "@/components/shared/pagination-controls";
import { getLocalizedPath, getProxiedImageUrl } from "@/lib/utils";
import { getPropertyPrice, formatPrice } from "@/lib/utils/property-pricing";
import { useCurrency } from "@/hooks/use-currency";

export default function SavedPropertiesPage() {
  const t = useTranslations("User.Saved");
  const tGeneral = useTranslations("General");
  const locale = useLocale();
  const currency = useCurrency();
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ["favourites", page],
    queryFn: () => getFavourites(page),
  });

  const savedProperties = data?.data || [];
  const totalPages = data?.pages || 1;

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner className="h-12 w-12 text-main-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <Typography variant="h3" as="h3" className="font-bold">
          {t("title")}
        </Typography>
        <Typography variant="body-md" as="p" className="text-gray-500">
          {t("description")}
        </Typography>
      </div>

      {savedProperties.length === 0 ? (
        <div className="py-12 text-center">
          <Heart className="mx-auto h-16 w-16 text-gray-300 mb-4" />
          <Typography variant="body-lg-medium" as="p" className="text-gray-500 mb-2">
            {t("no-properties")}
          </Typography>
          <Typography variant="body-sm" as="p" className="text-gray-400">
            {t("no-properties-description")}
          </Typography>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedProperties.map((favourite) => {
              const property = favourite.item;
              const locationStr = [property.region, property.city, property.country]
                .filter(Boolean)
                .join(", ");

              const price = getPropertyPrice(property);
              const priceDisplay = price ? formatPrice(price, currency, locale) : tGeneral("price-not-available");

              return (
                <Link
                  key={favourite._id}
                  href={getLocalizedPath(`/properties/${property._id}`, locale)}
                >
                  <PropertyCard
                    variant="featured"
                    name={property.title}
                    location={locationStr || tGeneral("location-not-specified")}
                    price={priceDisplay}
                    image={getProxiedImageUrl(property.image || property.video)}
                    badge={property.offerType}
                    propertyType={property.category}
                    propertyId={property._id}
                    isVerified={property.isVerified}
                  />
                </Link>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center pt-4">
              <PaginationControls
                currentPage={page}
                totalPages={totalPages}
                onPageChange={setPage}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
