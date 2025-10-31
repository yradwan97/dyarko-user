"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Heart } from "lucide-react";

import Typography from "@/components/shared/typography";
import PropertyCard from "@/components/shared/property-card";
import { useGetSavedProperties } from "@/hooks/use-user";
import { Spinner } from "@/components/ui/spinner";
import PaginationControls from "@/components/shared/pagination-controls";

export default function SavedPropertiesPage() {
  const t = useTranslations("User.Saved");
  const [page, setPage] = useState(1);
  const { data, isLoading } = useGetSavedProperties(page);

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
            {savedProperties.map((saved) => (
              <PropertyCard
                key={saved._id}
                name={saved.property?.title || ""}
                location={saved.property?.location?.city || ""}
                price={saved.property?.price ? `${saved.property.price} KWD` : ""}
                image={saved.property?.images?.[0]}
                badge={saved.property?.rent_type}
                propertyType={saved.property?.type}
                propertyId={saved.property?._id}
                isVerified={saved.property?.verified}
              />
            ))}
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
