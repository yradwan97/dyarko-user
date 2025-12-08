"use client";

import { useState, useEffect, useMemo } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useQueryClient } from "@tanstack/react-query";
import { X, MapPin, Heart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { MapProperty } from "@/lib/services/api/properties";
import { getLocalizedPath, cn } from "@/lib/utils";
import Typography from "@/components/shared/typography";
import { Button } from "@/components/ui/button";
import { checkFavourite, addFavourite, removeFavourite } from "@/lib/services/api/favourites";
import { toast } from "sonner";
import { formatPrice } from "@/lib/utils/property-pricing";

const isValidImageUrl = (url: string | undefined | null): boolean => {
  if (!url) return false;
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

interface PropertyMapCardProps {
  property: MapProperty;
  onClose: () => void;
}

export default function PropertyMapCard({
  property,
  onClose,
}: PropertyMapCardProps) {
  const locale = useLocale();
  const t = useTranslations("Map");
  const tCommon = useTranslations("General");
  const tSave = useTranslations("Properties.Details.Save");
  const queryClient = useQueryClient();
  const [isFavorite, setIsFavorite] = useState(false);
  const [isCheckingFavorite, setIsCheckingFavorite] = useState(false);
  const [imageError, setImageError] = useState(false);

  const hasValidImage = useMemo(() => isValidImageUrl(property.image), [property.image]);
  const imageSrc = hasValidImage && !imageError ? property.image! : "/no-apartment.png";

  useEffect(() => {
    if (property._id) {
      checkFavoriteStatus();
    }
  }, [property._id]);

  const checkFavoriteStatus = async () => {
    if (!property._id) return;

    try {
      setIsCheckingFavorite(true);
      const isFavorited = await checkFavourite(property._id);
      setIsFavorite(isFavorited);
    } catch (error) {
      console.error("Failed to check favorite status:", error);
    } finally {
      setIsCheckingFavorite(false);
    }
  };

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!property._id) return;

    try {
      if (isFavorite) {
        await removeFavourite(property._id);
        setIsFavorite(false);
        toast.error(tSave("unsaved"));
      } else {
        await addFavourite(property._id);
        setIsFavorite(true);
        toast.success(tSave("saved"));
      }

      // Invalidate favourites query to refresh the saved properties list
      queryClient.invalidateQueries({ queryKey: ["favourites"] });
    } catch (error) {
      console.error("Failed to toggle favorite:", error);
      toast.error(tSave("error"));
    }
  };

  const getOfferTypeLabel = (offerType: string) => {
    const labels: Record<string, string> = {
      rent: tCommon("rent"),
      sale: tCommon("sale"),
      shared: tCommon("shared"),
      replacement: tCommon("replacement"),
    };
    return labels[offerType] || offerType;
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
          src={imageSrc}
          alt={property.title}
          fill
          className="object-cover"
          onError={() => setImageError(true)}
        />
        {/* Offer Type Badge */}
        <div className="absolute top-2 left-2 bg-main-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
          {getOfferTypeLabel(property.offerType)}
        </div>
      </div>

      {/* Property Details */}
      <div className="p-4 pt-3 space-y-3 relative">
        {/* Favorite Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={handleFavoriteClick}
          disabled={isCheckingFavorite}
          className={cn(
            "absolute top-2 h-8 w-8 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700",
            locale === "ar" ? "left-2" : "right-2"
          )}
        >
          <Heart
            className={cn(
              "h-5 w-5 transition-all",
              isFavorite
                ? "fill-red-500 text-red-500"
                : "text-gray-400 hover:text-red-500 dark:text-gray-500"
            )}
          />
        </Button>
        {/* Title */}
        <Typography variant="h5" as="h5" className="font-bold line-clamp-1">
          {property.title}
        </Typography>

        {/* Location */}
        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
          <MapPin className="h-4 w-4 shrink-0" />
          <Typography variant="body-sm" as="p" className="line-clamp-1">
            {property.city}, {property.region}
          </Typography>
        </div>

        {/* Price */}
        <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
          <Typography variant="h5" as="p" className="font-bold text-main-600">
            {formatPrice(property.price! || property.dailyPrice! || property.weeklyPrice! || property.monthlyPrice! || property.hourlyPrice!, "KWD", locale)}
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
