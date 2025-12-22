"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { useLocale, useTranslations } from "next-intl";
import { useQueryClient } from "@tanstack/react-query";
import { HeartIcon, CheckCircle2Icon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
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
  originalPrice?: string;
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
  originalPrice,
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
  const tGeneral = useTranslations("General.PaymentMethods");
  const tProperty = useTranslations("Properties");
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

  if (variant === "featured") {
    const isManaged = adType === "management";

    return (
      <Card className="group min-w-[220px] flex-shrink-0 overflow-hidden border-0 bg-white shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-all hover:shadow-[0_8px_16px_rgba(0,0,0,0.08)] dark:bg-gray-800 dark:shadow-[0_2px_8px_rgba(0,0,0,0.2)] dark:hover:shadow-[0_8px_16px_rgba(0,0,0,0.3)] p-0">
        <div className="relative h-44 w-full overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
          <Image
            src={imageSrc}
            alt={name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
            priority={priority}
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
          {badge && (
            <Badge
              variant="secondary"
              className={cn(
                "absolute top-3 border-0 text-[14px] text-main-500 backdrop-blur-sm capitalize px-2 py-0.5",
                isRTL ? "right-3" : "left-3",
                badge.toLowerCase() === "rent" ? "bg-white/90 hover:bg-white/90" : "bg-steelBlue-100/90 hover:bg-steelBlue-100/90"
              )}
            >
              {tGeneral(badge)}
            </Badge>
          )}
          {/* Management Ribbon */}
          {isManaged && (
            <div
              className={cn(
                "absolute top-3 bg-gradient-to-r from-main-600 to-main-500 px-3 py-1 text-[11px] font-semibold text-white shadow-md",
                isRTL
                  ? "left-0 rounded-r-full"
                  : "right-0 rounded-l-full"
              )}
            >
              {tProperty("managed-by-dyarko")}
            </div>
          )}
        </div>
        <CardContent className={cn("p-4 flex items-start justify-between gap-2", isRTL && "flex-row-reverse")}>
          {/* Content Stack */}
          <div className={cn("flex-1 min-w-0 flex flex-col", isRTL && "items-end")}>
            <div className={cn("mb-1 flex items-center gap-1.5", isRTL && "flex-row-reverse")}>
              <h3 className="text-sm font-semibold text-main-600 dark:text-main-400 line-clamp-1 hover:underline transition-colors cursor-pointer">{name}</h3>
              {isVerified && (
                <CheckCircle2Icon className="h-4 w-4 shrink-0 text-steelBlue-500 dark:text-steelBlue-400" fill="currentColor" />
              )}
            </div>
            <p className={cn("mb-2 text-xs text-gray-500 dark:text-gray-400 line-clamp-1", isRTL && "text-right")}>{location}</p>
            <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
              {otherPrices.length > 0 ? (
                <HoverCard openDelay={200} closeDelay={100}>
                  <HoverCardTrigger asChild>
                    <span className="text-base font-bold text-main-500 dark:text-main-400 cursor-pointer hover:underline underline-offset-2">
                      {price}
                    </span>
                  </HoverCardTrigger>
                  <HoverCardContent
                    className={cn("w-auto min-w-[140px] p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700", isRTL && "text-right")}
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
              ) : (
                <span className="text-base font-bold text-main-500 dark:text-main-400">{price}</span>
              )}
              {propertyType && (
                <Badge className="rounded-full border-0 bg-main-500 px-3 py-0.5 text-[11px] font-medium text-white hover:bg-main-600 capitalize">
                  {propertyType}
                </Badge>
              )}
            </div>
          </div>

          {/* Right Column: Favorite Button + Category Badge */}
          <div className={cn("flex flex-col items-center gap-2 shrink-0", isRTL && "items-center")}>
            {propertyId && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleFavoriteClick}
                disabled={!session}
                className="h-8 w-8 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <HeartIcon
                  className={cn(
                    "h-5 w-5 transition-all",
                    isFavorite
                      ? "fill-red-500 text-red-500"
                      : "text-gray-400 hover:text-red-500 dark:text-gray-500"
                  )}
                />
              </Button>
            )}
            {secondaryBadge && (
              <Badge
                variant="secondary"
                className="border-0 bg-main-500/90 px-2 py-0.5 text-[11px] text-white backdrop-blur-sm hover:bg-main-600 capitalize whitespace-nowrap"
              >
                {secondaryBadge}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // List variant
  const isManaged = adType === "management";

  return (
    <Card className="group border-0 bg-white shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-all hover:shadow-[0_8px_16px_rgba(0,0,0,0.08)] dark:bg-gray-800 dark:shadow-[0_2px_8px_rgba(0,0,0,0.2)] dark:hover:shadow-[0_8px_16px_rgba(0,0,0,0.3)] p-0 overflow-hidden">
      <div className={cn("flex", isRTL && "flex-row-reverse")}>
        {/* Image Section */}
        <div className="relative h-48 w-64 flex-shrink-0 overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
          <Image
            src={imageSrc}
            alt={name}
            fill
            sizes="256px"
            priority={priority}
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
          {badge && (
            <Badge
              variant="secondary"
              className={cn(
                "absolute top-3 border-0 text-[14px] text-main-500 backdrop-blur-sm capitalize px-2 py-0.5",
                isRTL ? "right-3" : "left-3",
                badge.toLowerCase() === "rent" ? "bg-white/90 hover:bg-white/90" : "bg-steelBlue-100/90 hover:bg-steelBlue-100/90"
              )}
            >
              {tGeneral(badge)}
            </Badge>
          )}
        </div>

        {/* Content Section */}
        <div className={cn("flex flex-1 flex-col justify-between p-4", isRTL && "items-end")}>
          <div className={cn("flex flex-col", isRTL && "items-end")}>
            {/* Management Badge */}
            {isManaged && (
              <Badge className="mb-2 w-fit bg-gradient-to-r from-main-600 to-main-500 px-3 py-1 text-[11px] font-semibold text-white border-0">
                {tProperty("managed-by-dyarko")}
              </Badge>
            )}
            <div className={cn("mb-1 flex items-center gap-1.5", isRTL && "flex-row-reverse")}>
              <h3 className="text-sm font-semibold text-main-600 dark:text-main-400 line-clamp-1 hover:underline transition-colors cursor-pointer">{name}</h3>
              {isVerified && (
                <CheckCircle2Icon className="h-4 w-4 shrink-0 text-steelBlue-500 dark:text-steelBlue-400" fill="currentColor" />
              )}
            </div>
            <p className={cn("text-xs text-gray-500 dark:text-gray-400 line-clamp-1", isRTL && "text-right")}>{location}</p>
          </div>

          <div className={cn("flex items-center gap-2 mt-2", isRTL && "flex-row-reverse")}>
            {otherPrices.length > 0 ? (
              <HoverCard openDelay={200} closeDelay={100}>
                <HoverCardTrigger asChild>
                  <span className="text-base font-bold text-main-500 dark:text-main-400 cursor-pointer hover:underline underline-offset-2">
                    {price}
                  </span>
                </HoverCardTrigger>
                <HoverCardContent
                  className={cn("w-auto min-w-[140px] p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700", isRTL && "text-right")}
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
            ) : (
              <span className="text-base font-bold text-main-500 dark:text-main-400">{price}</span>
            )}
            {originalPrice && (
              <span className="text-xs text-gray-400 line-through dark:text-gray-500">{originalPrice}</span>
            )}
          </div>
        </div>

        {/* Right Actions */}
        <div className={cn("flex flex-col items-center justify-between p-4 shrink-0")}>
          {propertyId && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleFavoriteClick}
              disabled={!session}
              className="h-8 w-8 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <HeartIcon
                className={cn(
                  "h-5 w-5 transition-all",
                  isFavorite
                    ? "fill-red-500 text-red-500"
                    : "text-gray-400 hover:text-red-500 dark:text-gray-500"
                )}
              />
            </Button>
          )}
          {(propertyType || secondaryBadge) && (
            <Badge className="rounded-full border-0 bg-main-500 px-3 py-0.5 text-[11px] font-medium text-white hover:bg-main-600 capitalize">
              {propertyType || secondaryBadge}
            </Badge>
          )}
        </div>
      </div>
    </Card>
  );
}
