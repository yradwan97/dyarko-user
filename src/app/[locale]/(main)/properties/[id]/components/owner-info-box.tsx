"use client";

import { useLocale, useTranslations } from "next-intl";
import { type Property } from "@/lib/services/api/properties";
import { getLocalizedPath, cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface OwnerInfoBoxProps {
  property: Property;
}

export default function OwnerInfoBox({ property }: OwnerInfoBoxProps) {
  const locale = useLocale();
  const tGeneral = useTranslations("General");

  // Validate owner image URL
  const isValidImageUrl = (url: string | undefined | null): boolean => {
    if (!url || typeof url !== "string" || url.trim() === "") return false;
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const validOwnerImage = isValidImageUrl(property.owner.image) ? property.owner.image : null;

  const getInitials = (name: string): string => {
    if (!name) return "?";
    const words = name.trim().split(" ").filter(Boolean);
    if (words.length === 1) {
      return words[0].charAt(0).toUpperCase();
    }
    return (words[0].charAt(0) + words[1].charAt(0)).toUpperCase();
  };

  return (
    <div className="rounded-xl border-[1.5px] border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow dark:border-gray-700 dark:bg-gray-800">
      <Link
        href={getLocalizedPath(`/companies/${property.owner._id}`, locale)}
        className="flex items-center justify-between group cursor-pointer"
        dir={locale === "ar" ? "rtl" : "ltr"}
      >
        <div className="flex items-center gap-3">
          {validOwnerImage ? (
            <Image
              src={validOwnerImage}
              alt={property.owner.name}
              width={48}
              height={48}
              className="h-12 w-12 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-main-100">
              <span className="text-lg font-bold text-main-600">
                {getInitials(property.owner.name)}
              </span>
            </div>
          )}
          <div>
            <p className="font-bold text-gray-900 dark:text-white">
              {property.owner.name || "Agent Name"}
            </p>
            <p className="text-sm text-main-600">{property.owner.role || tGeneral("owner")}</p>
          </div>
        </div>
        <ChevronRight className={cn(
          "h-5 w-5 text-gray-400 group-hover:text-main-600 transition-colors",
          locale === "ar" && "rotate-180"
        )} />
      </Link>
    </div>
  );
}
