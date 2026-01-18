"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { useLocale, useTranslations } from "next-intl";
import { useQueryClient } from "@tanstack/react-query";
import { HeartIcon, ExternalLinkIcon, MapPinIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { addFavourite, removeFavourite } from "@/lib/services/api/favourites";
import { toast } from "sonner";

export interface OtherPrice {
  period: string;
  price: string;
}

interface PropertyCardProps {
  variant?: "featured" | "list";
  image?: string | null;
  name: string;
  location: string;
  price: string;
  discountedPrice?: string;
  badge?: string;
  secondaryBadge?: string;
  propertyType?: string;
  propertyId?: string;
  isVerified?: boolean;
  priority?: boolean;
  adType?: string;
  otherPrices?: OtherPrice[];
  isFavourite?: boolean;
}

export default function PropertyCard({
  variant = "featured",
  image,
  name,
  location,
  price,
  discountedPrice,
  badge,
  secondaryBadge,
  propertyType,
  propertyId,
  isVerified = false,
  priority = false,
  adType,
  otherPrices = [],
  isFavourite = false,
}: PropertyCardProps) {
  const { data: session } = useSession();
  const locale = useLocale();
  const t = useTranslations("Properties.Details.Save");
  const tShare = useTranslations("Properties.Details.Share");
  const tGeneral = useTranslations("General.PaymentMethods");
  const tCategories = useTranslations("General.Categories");
  const tManaged = useTranslations("Properties");
  const queryClient = useQueryClient();
  const isRTL = locale === "ar";
  const imageSrc = image || "/no-apartment.png";
  const [isFavorite, setIsFavorite] = useState(isFavourite);

  // Sync state when prop changes (e.g., after data refetch)
  useEffect(() => {
    setIsFavorite(isFavourite);
  }, [isFavourite]);

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!propertyId) return;

    try {
      if (isFavorite) {
        await removeFavourite(propertyId);
        setIsFavorite(false);
        toast.error(t("unsaved"));
      } else {
        await addFavourite(propertyId);
        setIsFavorite(true);
        toast.success(t("saved"));
      }

      // Invalidate favourites query to refresh the saved properties list
      queryClient.invalidateQueries({ queryKey: ["favourites"] });
    } catch (error) {
      console.error("Failed to toggle favorite:", error);
      toast.error(t("error"));
    }
  };

  const handleShareClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (navigator.share) {
      navigator.share({
        title: name,
        text: `${name} - ${location}`,
        url: window.location.href,
      }).catch(() => {
        // User cancelled or share failed silently
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      toast.success(t("linkCopied") || "Link copied to clipboard");
    }
  };

  const isManaged = adType === "management";

  // Ad type icon based on adType
  const AdTypeIcon = () => (
    <Image
      src={isManaged ? "/assets/management-icon.svg" : "/assets/ad-only-icon.svg"}
      alt={isManaged ? "Management" : "Ads Only"}
      width={18}
      height={18}
      className="shrink-0"
    />
  );

  // Get localized property type
  const getLocalizedPropertyType = (type: string) => {
    try {
      return tCategories(type.toLowerCase());
    } catch {
      return type;
    }
  };

  // Price component with optional HoverCard for other prices
  const PriceDisplay = ({ className }: { className?: string }) => {
    if (otherPrices.length > 0) {
      return (
        <HoverCard openDelay={200} closeDelay={100}>
          <HoverCardTrigger asChild>
            <span className={cn("text-base font-bold text-main-600 dark:text-main-400 cursor-pointer hover:underline underline-offset-2", className)}>
              {price}
            </span>
          </HoverCardTrigger>
          <HoverCardContent
            className={cn("w-auto min-w-35 p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700", isRTL && "text-right")}
            align={isRTL ? "end" : "start"}
            side="top"
            sideOffset={8}
          >
            <ul className="space-y-1.5">
              {otherPrices.map((otherPrice, index) => (
                <li
                  key={index}
                  className={cn(
                    "flex items-center justify-between gap-4 text-sm",
                    isRTL && "flex-row-reverse"
                  )}
                >
                  <span className="text-gray-600 dark:text-gray-400">{otherPrice.period}</span>
                  <span className="font-semibold text-main-500 dark:text-main-400">{otherPrice.price}</span>
                </li>
              ))}
            </ul>
          </HoverCardContent>
        </HoverCard>
      );
    }
    return <span className={cn("text-base font-bold text-main-600 dark:text-main-400", className)}>{discountedPrice ? discountedPrice : price}</span>;
  };

  if (variant === "featured") {
    return (
      <Card className="group min-w-55 shrink-0 overflow-hidden border-0 bg-white shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-all hover:shadow-[0_8px_16px_rgba(0,0,0,0.08)] dark:bg-gray-800 dark:shadow-[0_2px_8px_rgba(0,0,0,0.2)] dark:hover:shadow-[0_8px_16px_rgba(0,0,0,0.3)] p-0 rounded-xl">
        <div className="relative h-44 w-full overflow-hidden bg-linear-to-br from-gray-50 to-gray-100 rounded-t-xl">
          <Image
            src={imageSrc}
            alt={name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
            priority={priority}
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
          {/* Top Left Badge */}
          {badge && (
            <Badge
              variant="secondary"
              className={cn(
                "absolute top-3 border-0 text-sm font-medium backdrop-blur-sm capitalize px-3 py-1 rounded-md",
                isRTL ? "right-3" : "left-3",
                badge.toLowerCase() === "rent"
                  ? "bg-white text-main-600 hover:bg-white"
                  : "bg-steelBlue-100 text-main-600 hover:bg-steelBlue-100"
              )}
            >
              {tGeneral(badge)}
            </Badge>
          )}
          {/* Top Right Icons */}
          <div className={cn(
            "absolute top-3 flex items-center gap-1",
            isRTL ? "left-3 flex-row-reverse" : "right-3"
          )}>
            {badge?.toLowerCase() === "rent" && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                    className="flex h-8 w-8 items-center justify-center"
                  >
                    <AdTypeIcon />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  {isManaged ? tManaged("managed-by-dyarko") : tManaged("ads-only")}
                </TooltipContent>
              </Tooltip>
            )}
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={handleShareClick}
                  className="flex h-8 w-8 items-center justify-center cursor-pointer"
                >
                  <ExternalLinkIcon className="h-4.5 w-4.5 text-main-600" />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                {tShare("title")}
              </TooltipContent>
            </Tooltip>
            {propertyId && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={handleFavoriteClick}
                    disabled={!session}
                    className="flex h-8 w-8 items-center justify-center cursor-pointer disabled:opacity-50"
                  >
                    <HeartIcon
                      className={cn(
                        "h-4.5 w-4.5 transition-all",
                        isFavorite
                          ? "fill-red-500 text-red-500"
                          : "text-main-600"
                      )}
                    />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  {isFavorite ? t("title-saved") : t("title-save")}
                </TooltipContent>
              </Tooltip>
            )}
          </div>
        </div>
        <CardContent className="p-3 pt-2">
          {/* Title */}
          <h3 className={cn(
            "text-lg font-semibold text-main-600 dark:text-main-400 line-clamp-1 mb-1 -mt-2",
            isRTL && "text-right"
          )}>
            {name}
          </h3>

          {/* Location - aligned under title */}
          <div className={cn("flex items-center gap-1.5 mb-3", isRTL && "flex-row-reverse justify-end")}>
            <MapPinIcon className="h-4 w-4 text-steelBlue-500 shrink-0" />
            <p className={cn("text-sm text-steelBlue-500 line-clamp-1", isRTL && "text-right")}>{location}</p>
          </div>

          {/* Price and Property Type */}
          <div className={cn("flex items-center justify-between gap-2", isRTL && "flex-row-reverse")}>
            <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
              <PriceDisplay />
              {discountedPrice  && (
                <span className="text-sm text-gray-400 line-through">{price}</span>
              )}
            </div>
            {propertyType && (
              <Badge className="rounded-md border-0 bg-main-600 px-3 py-1 text-sm font-medium text-white hover:bg-main-600 capitalize">
                {getLocalizedPropertyType(propertyType)}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // List variant
  return (
    <Card className="group border-0 bg-white shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-all hover:shadow-[0_8px_16px_rgba(0,0,0,0.08)] dark:bg-gray-800 dark:shadow-[0_2px_8px_rgba(0,0,0,0.2)] dark:hover:shadow-[0_8px_16px_rgba(0,0,0,0.3)] p-0 overflow-hidden rounded-xl">
      <div className="flex p-3">
        {/* Image Section with padding */}
        <div className="relative h-44 w-56 shrink-0 overflow-hidden bg-linear-to-br from-gray-50 to-gray-100 rounded-xl">
          <Image
            src={imageSrc}
            alt={name}
            fill
            sizes="224px"
            priority={priority}
            className="object-cover transition-transform duration-300 group-hover:scale-105 rounded-xl"
          />
        </div>

        {/* Content Section */}
        <div className={cn("flex flex-1 flex-col justify-between p-4", isRTL && "text-right")}>
          {/* Top Row: Title and Icons */}
          <div className="flex items-start justify-between w-full gap-4">
            <h3 className="text-lg font-semibold text-main-600 dark:text-main-400 line-clamp-1">
              {name}
            </h3>
            {/* Icons */}
            <div className="flex items-center gap-1 shrink-0">
              {badge?.toLowerCase() === "rent" && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                      className="flex h-8 w-8 items-center justify-center"
                    >
                      <AdTypeIcon />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {isManaged ? tManaged("managed-by-dyarko") : tManaged("managed-by-dyarko")}
                  </TooltipContent>
                </Tooltip>
              )}
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={handleShareClick}
                    className="flex h-8 w-8 items-center justify-center cursor-pointer"
                  >
                    <ExternalLinkIcon className="h-4.5 w-4.5 text-main-600" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  {tShare("title")}
                </TooltipContent>
              </Tooltip>
              {propertyId && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={handleFavoriteClick}
                      disabled={!session}
                      className="flex h-8 w-8 items-center justify-center cursor-pointer disabled:opacity-50"
                    >
                      <HeartIcon
                        className={cn(
                          "h-4.5 w-4.5 transition-all",
                          isFavorite
                            ? "fill-red-500 text-red-500"
                            : "text-main-600"
                        )}
                      />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {isFavorite ? t("title-saved") : t("title-save")}
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
          </div>

          {/* Location */}
          <div className="flex items-center gap-1.5">
            <MapPinIcon className="h-4 w-4 text-steelBlue-500 shrink-0" />
            <p className="text-sm text-steelBlue-500 line-clamp-1">{location}</p>
          </div>

          {/* Price */}
          <div className="flex items-center gap-2">
            <PriceDisplay />
            {discountedPrice && (
              <span className="text-sm text-gray-400 line-through">{price}</span>
            )}
          </div>

          {/* Badges */}
          <div className="flex items-center gap-2">
            {badge && (
              <Badge className="rounded-md border-0 bg-[#E76F51] px-3 py-1 text-sm font-medium text-white hover:bg-[#E76F51] capitalize">
                {tGeneral(badge)}
              </Badge>
            )}
            {propertyType && (
              <Badge className="rounded-md border-0 bg-main-600 px-3 py-1 text-sm font-medium text-white hover:bg-main-600 capitalize">
                {getLocalizedPropertyType(propertyType)}
              </Badge>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
