"use client";

import React from "react";
import Image from "next/image";
import { useLocale } from "next-intl";
import { HeartIcon, CheckCircle2Icon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

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
}: PropertyCardProps) {
  const locale = useLocale();
  const isRTL = locale === "ar";
  const imageSrc = image || "/assets/property-1.png";

  if (variant === "featured") {
    return (
      <Card className="group min-w-[220px] flex-shrink-0 overflow-hidden border-0 bg-white shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-all hover:shadow-[0_8px_16px_rgba(0,0,0,0.08)] dark:bg-gray-800 dark:shadow-[0_2px_8px_rgba(0,0,0,0.2)] dark:hover:shadow-[0_8px_16px_rgba(0,0,0,0.3)]">
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
                "absolute top-3 border-0 font-medium text-main-500 backdrop-blur-sm capitalize",
                isRTL ? "right-3" : "left-3",
                badge.toLowerCase() === "rent" ? "bg-white/90 hover:bg-white/90" : "bg-steelBlue-100/90 hover:bg-steelBlue-100/90"
              )}
            >
              {badge}
            </Badge>
          )}
          {secondaryBadge && (
            <Badge
              variant="secondary"
              className={cn(
                "absolute top-10 border-0 bg-main-500/90 px-2 py-0.5 text-[10px] text-white backdrop-blur-sm hover:bg-secondary-600 capitalize",
                isRTL ? "right-3" : "left-3"
              )}
            >
              {secondaryBadge}
            </Badge>
          )}
        </div>
        <CardContent className="p-4">
          <div className="mb-2 flex items-center gap-1.5">
            <h3 className="text-sm font-semibold text-main-500 dark:text-main-400">{name}</h3>
            {isVerified && (
              <CheckCircle2Icon className="h-4 w-4 shrink-0 text-steelBlue-500 dark:text-steelBlue-400" fill="currentColor" />
            )}
          </div>
          <p className="mb-3 text-xs text-gray-500 dark:text-gray-400">{location}</p>
          <div className="flex items-center justify-between">
            <span className="text-base font-bold text-main-500 dark:text-main-400">{price}</span>
            {propertyType && (
              <Badge className="rounded-full border-0 bg-main-500 px-3 py-0.5 text-[11px] font-medium text-white hover:bg-main-600 capitalize">
                {propertyType}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // List variant
  return (
    <Card className="group border-0 bg-white shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-all hover:shadow-[0_8px_16px_rgba(0,0,0,0.08)] dark:bg-gray-800 dark:shadow-[0_2px_8px_rgba(0,0,0,0.2)] dark:hover:shadow-[0_8px_16px_rgba(0,0,0,0.3)]">
      <CardContent className={cn("flex gap-4 p-4", isRTL && "flex-row-reverse")}>
        <div className="relative h-28 w-28 flex-shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-gray-50 to-gray-100">
          <Image
            src={imageSrc}
            alt={name}
            fill
            sizes="112px"
            priority={priority}
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
          {badge && (
            <Badge className={cn("absolute top-2 border-0 bg-main-500/90 px-2 py-0.5 text-[10px] backdrop-blur-sm hover:bg-main-600 capitalize", isRTL ? "right-2" : "left-2")}>
              {badge}
            </Badge>
          )}
          {secondaryBadge && (
            <Badge className={cn("absolute top-8 border-0 bg-secondary-500/90 px-2 py-0.5 text-[10px] backdrop-blur-sm hover:bg-secondary-600 capitalize", isRTL ? "right-2" : "left-2")}>
              {secondaryBadge}
            </Badge>
          )}
        </div>
        <div className="flex flex-1 flex-col justify-between py-1">
          <div>
            <h3 className="mb-1 text-sm font-semibold text-main-500 dark:text-main-400">{name}</h3>
            {propertyId && (
              <p className="mb-1.5 text-[10px] font-medium text-gray-400 dark:text-gray-500">{propertyId}</p>
            )}
            <p className="text-xs text-gray-500 dark:text-gray-400">{location}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-base font-bold text-secondary-500 dark:text-secondary-400">{price}</span>
            {originalPrice && (
              <span className="text-xs text-gray-400 line-through dark:text-gray-500">{originalPrice}</span>
            )}
          </div>
        </div>
        <Button variant="ghost" size="icon-sm" className="self-start hover:bg-gray-100 dark:hover:bg-gray-700">
          <HeartIcon className="h-4 w-4 text-gray-400 transition-colors hover:text-secondary-500 dark:text-gray-500 dark:hover:text-secondary-400" />
        </Button>
      </CardContent>
    </Card>
  );
}
