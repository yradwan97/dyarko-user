"use client";

import { useTranslations, useLocale } from "next-intl";
import HeadTitle from "./head-title";
import { cn } from "@/lib/utils";
import {
  Tv,
  Wifi,
  Car,
  Wind,
  Dumbbell,
  Waves,
  TreeDeciduous,
  Coffee,
  Utensils,
  WashingMachine,
  Briefcase,
  Sparkles
} from "lucide-react";

interface Amenity {
  _id?: string;
  nameAr?: string;
  nameEn?: string;
  image?: string;
}

interface AmenetiesComponentProps {
  amenities: (string | Amenity)[];
}

// Map amenity names to icons
const getAmenityIcon = (name: string) => {
  const lowerName = name.toLowerCase();
  if (lowerName.includes("tv") || lowerName.includes("video")) return <Tv className="h-4 w-4" />;
  if (lowerName.includes("wifi") || lowerName.includes("internet")) return <Wifi className="h-4 w-4" />;
  if (lowerName.includes("parking") || lowerName.includes("garage") || lowerName.includes("car")) return <Car className="h-4 w-4" />;
  if (lowerName.includes("air") || lowerName.includes("ac") || lowerName.includes("dryer") || lowerName.includes("hair")) return <Wind className="h-4 w-4" />;
  if (lowerName.includes("gym") || lowerName.includes("fitness")) return <Dumbbell className="h-4 w-4" />;
  if (lowerName.includes("pool") || lowerName.includes("swim")) return <Waves className="h-4 w-4" />;
  if (lowerName.includes("garden") || lowerName.includes("outdoor")) return <TreeDeciduous className="h-4 w-4" />;
  if (lowerName.includes("coffee") || lowerName.includes("tea")) return <Coffee className="h-4 w-4" />;
  if (lowerName.includes("kitchen") || lowerName.includes("food")) return <Utensils className="h-4 w-4" />;
  if (lowerName.includes("wash") || lowerName.includes("laundry")) return <WashingMachine className="h-4 w-4" />;
  if (lowerName.includes("office") || lowerName.includes("work")) return <Briefcase className="h-4 w-4" />;
  return <Sparkles className="h-4 w-4" />;
};

export default function AmenetiesComponent({ amenities }: AmenetiesComponentProps) {
  const t = useTranslations("Properties.Details");
  const locale = useLocale();

  if (!amenities || amenities.length === 0) {
    return null;
  }

  return (
    <div className="rounded-xl bg-gray-50 dark:bg-gray-800/50 p-6 mb-8">
      <HeadTitle text={`Features \\ ${t("rental-amenities")}`} className="mb-6" />

      <div className={cn(
        "flex flex-wrap gap-3",
        locale === "ar" && "flex-row-reverse"
      )}>
        {amenities.map((amenity, index) => {
          // Handle both string and object formats
          const amenityName = typeof amenity === 'string'
            ? amenity
            : (locale === "ar" ? amenity.nameAr : amenity.nameEn) || amenity.nameEn || amenity.nameAr || "";

          const amenityId = typeof amenity === 'object' && amenity._id ? amenity._id : index;

          return (
            <div
              key={amenityId}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-full border border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-800 transition-colors hover:border-main-400",
                locale === "ar" && "flex-row-reverse"
              )}
            >
              {getAmenityIcon(amenityName)}
              <span className="text-sm font-medium text-gray-700 dark:text-gray-200 capitalize">
                {amenityName}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
