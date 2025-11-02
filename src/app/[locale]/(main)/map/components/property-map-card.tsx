"use client";

import { useLocale, useTranslations } from "next-intl";
import { X, MapPin, Home, Bed, Bath, Maximize } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { Property } from "@/lib/services/api/properties";
import { getLocalizedPath } from "@/lib/utils";
import Typography from "@/components/shared/typography";

interface PropertyMapCardProps {
  property: Property;
  onClose: () => void;
}

export default function PropertyMapCard({
  property,
  onClose,
}: PropertyMapCardProps) {
  const locale = useLocale();
  const t = useTranslations("Map");
  const tCommon = useTranslations("General");

  const getOfferTypeLabel = (offerType: string) => {
    const labels: Record<string, string> = {
      rent: tCommon("rent"),
      sale: tCommon("sale"),
      shared: tCommon("shared"),
      replacement: tCommon("replacement"),
    };
    return labels[offerType] || offerType;
  };

  const formatPrice = (price: number | undefined) => {
    if (!price) return tCommon("contact-for-price");
    return `${price.toLocaleString()} ${tCommon("kwd")}`;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 w-[380px] overflow-hidden">
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-2 right-2 z-10 bg-white dark:bg-gray-800 rounded-full p-1 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
      >
        <X className="h-4 w-4 text-gray-600 dark:text-gray-400" />
      </button>

      {/* Property Image */}
      <div className="relative h-48 w-full">
        <Image
          src={property.image || "/placeholder.jpg"}
          alt={property.title}
          fill
          className="object-cover"
        />
        {/* Offer Type Badge */}
        <div className="absolute top-2 left-2 bg-main-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
          {getOfferTypeLabel(property.offerType)}
        </div>
      </div>

      {/* Property Details */}
      <div className="p-4 space-y-3">
        {/* Title */}
        <Typography variant="h5" as="h5" className="font-bold line-clamp-1">
          {property.title}
        </Typography>

        {/* Location */}
        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
          <MapPin className="h-4 w-4 flex-shrink-0" />
          <Typography variant="body-sm" as="p" className="line-clamp-1">
            {property.city}, {property.region}
          </Typography>
        </div>

        {/* Property Info */}
        <div className="flex items-center gap-4">
          {property.bedrooms && (
            <div className="flex items-center gap-1">
              <Bed className="h-4 w-4 text-gray-500 dark:text-gray-400" />
              <Typography variant="body-sm" as="span" className="text-gray-600 dark:text-gray-400">
                {property.bedrooms}
              </Typography>
            </div>
          )}
          {property.bathrooms && (
            <div className="flex items-center gap-1">
              <Bath className="h-4 w-4 text-gray-500 dark:text-gray-400" />
              <Typography variant="body-sm" as="span" className="text-gray-600 dark:text-gray-400">
                {property.bathrooms}
              </Typography>
            </div>
          )}
          {property.area && (
            <div className="flex items-center gap-1">
              <Maximize className="h-4 w-4 text-gray-500 dark:text-gray-400" />
              <Typography variant="body-sm" as="span" className="text-gray-600 dark:text-gray-400">
                {property.area} {tCommon("sqm")}
              </Typography>
            </div>
          )}
        </div>

        {/* Price */}
        <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
          <Typography variant="h5" as="p" className="font-bold text-main-600">
            {formatPrice(property.dailyPrice || property.weeklyPrice || property.monthlyPrice)}
          </Typography>
        </div>

        {/* View Details Link */}
        <Link
          href={getLocalizedPath(`/properties/${property._id}`, locale)}
          className="block w-full bg-main-600 hover:bg-main-700 text-white text-center py-2 rounded-lg font-semibold transition-colors"
        >
          {t("view-details")}
        </Link>
      </div>
    </div>
  );
}
