"use client";

import { useState, useMemo } from "react";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import Link from "next/link";
import { type Property } from "@/lib/services/api/properties";
import { getLocalizedPath, cn } from "@/lib/utils";
import { Bed, Bath, Maximize2, FileText, DoorOpen, LayoutGrid, Star, Building2, Circle } from "lucide-react";
import FeatureComponent from "./feature-component";
import AmenetiesComponent from "./ameneties-component";
import ServicesComponent from "./services-component";
import Location from "./location";
import InteriorDesign from "./interior-design";
import HeadTitle from "./head-title";

interface AboutPropertyProps {
  property: Property;
  currency?: string;
}

export default function AboutProperty({ property, currency = "KWD" }: AboutPropertyProps) {
  const locale = useLocale();
  const tListing = useTranslations("Properties.Listing");
  const t = useTranslations("Properties.Details");
  const tCategories = useTranslations("General.Categories");
  const [showFullDescription, setShowFullDescription] = useState(false);

  const { owner, lat, long, amenities, services } = property;
  const { _id: ownerId, name: ownerName, image: ownerImage } = owner;

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

  const validOwnerImage = isValidImageUrl(ownerImage) ? ownerImage : null;

  // Check if booth or camp category
  const isBoothOrCamp = property.category === "booth" || property.category === "camp";
  // Check if hotel apartment category
  const isHotelApartment = property.category === "hotelapartment";
  // Check if court category
  const isCourt = property.category === "court";

  // Calculate booth/camp summary stats
  const { totalArea, totalUnits } = useMemo(() => {
    if (!isBoothOrCamp || !property.groups) return { totalArea: 0, totalUnits: 0 };

    let area = 0;
    let units = 0;
    (property.groups as Array<{ area?: number; ids?: number[] }>).forEach((group) => {
      if (group.area) area += group.area;
      if (group.ids) units += group.ids.length;
    });
    return { totalArea: area, totalUnits: units };
  }, [isBoothOrCamp, property.groups]);

  // Calculate hotel apartment unique types count
  const uniqueTypesCount = useMemo(() => {
    if (!isHotelApartment || !property.apartments) return 0;

    const typesSet = new Set<string>();
    (property.apartments as Array<{ type?: string }>).forEach((apartment) => {
      if (apartment.type) typesSet.add(apartment.type);
    });
    return typesSet.size;
  }, [isHotelApartment, property.apartments]);

  // Convert property type to star label (e.g., "fiveStar" -> "5")
  const getStarLevel = (type?: string): string | null => {
    if (!type) return null;
    const starMap: Record<string, string> = {
      oneStar: "1",
      twoStar: "2",
      threeStar: "3",
      fourStar: "4",
      fiveStar: "5",
    };
    return starMap[type] || null;
  };

  // Court type image URLs mapping
  const courtTypeImages: Record<string, string> = {
    football: "https://new.dyarko.com/properties/types/football.png",
    basketball: "https://new.dyarko.com/properties/types/basekball.png",
    handball: "https://new.dyarko.com/properties/types/handball.png",
    volleyball: "https://new.dyarko.com/properties/types/volleyball.png",
    beachball: "https://new.dyarko.com/properties/types/beachball.png",
    tennis: "https://new.dyarko.com/properties/types/tennis.png",
    padel: "https://new.dyarko.com/properties/types/padel.png",
    squash: "https://new.dyarko.com/properties/types/squash.png",
    badminton: "https://new.dyarko.com/properties/types/badminton.png",
    hockey: "https://new.dyarko.com/properties/types/hockey.png",
    futsal: "https://new.dyarko.com/properties/types/futsal.png",
  };

  // Get court type icon - uses image if available, falls back to generic icon
  const getCourtTypeIcon = (type?: string) => {
    if (!type) return <Circle className="h-6 w-6 text-gray-600 dark:text-gray-400" />;

    const imageUrl = courtTypeImages[type];
    if (imageUrl) {
      return (
        <Image
          src={imageUrl}
          alt={type}
          width={24}
          height={24}
          className="h-6 w-6 object-contain"
        />
      );
    }
    return <Circle className="h-6 w-6 text-gray-600 dark:text-gray-400" />;
  };

  // Stats data for display
  const stats = isBoothOrCamp
    ? [
        // Booth/Camp specific stats
        {
          icon: <Maximize2 className="h-6 w-6 text-gray-600 dark:text-gray-400" />,
          label: t("area"),
          value: totalArea > 0 ? `${totalArea} ${t("sqm")}` : null,
        },
        {
          icon: <LayoutGrid className="h-6 w-6 text-gray-600 dark:text-gray-400" />,
          label: property.category === "booth" ? t("booths-number") : t("tents-number"),
          value: totalUnits > 0 ? `${totalUnits} ${property.category === "booth" ? t("booth") : t("tent")}` : null,
        },
      ].filter(stat => stat.value !== null)
    : isHotelApartment
    ? [
        // Hotel apartment specific stats - Level and Types count
        {
          icon: <Star className="h-6 w-6 text-gray-600 dark:text-gray-400" />,
          label: t("level"),
          value: getStarLevel((property as any).type) ? `${getStarLevel((property as any).type)} ${t("star")}` : null,
        },
        {
          icon: <Building2 className="h-6 w-6 text-gray-600 dark:text-gray-400" />,
          label: t("types-number"),
          value: uniqueTypesCount > 0 ? `${uniqueTypesCount} ${t("type")}` : null,
        },
      ].filter(stat => stat.value !== null)
    : isCourt
    ? [
        // Court specific stats - show court type with icon
        (() => {
          const courtType = (property as any).type;
          const capitalizedType = courtType ? courtType.charAt(0).toUpperCase() + courtType.slice(1) : null;
          return {
            icon: getCourtTypeIcon(courtType),
            label: t("court-type"),
            value: capitalizedType,
          };
        })(),
        {
          icon: <Maximize2 className="h-6 w-6 text-gray-600 dark:text-gray-400" />,
          label: t("area"),
          value: property.area ? `${property.area} ${t("sqm")}` : null,
        },
      ].filter(stat => stat.value !== null)
    : [
        // Regular property stats
        {
          icon: <Maximize2 className="h-6 w-6 text-gray-600 dark:text-gray-400" />,
          label: t("area"),
          value: property.area ? `${property.area} ${t("sqm")}` : null,
        },
        // Show rooms or bedrooms (whichever is available)
        property.rooms
          ? {
              icon: <DoorOpen className="h-6 w-6 text-gray-600 dark:text-gray-400" />,
              label: tListing("rooms"),
              value: `${property.rooms} ${tListing("rooms")}`,
            }
          : {
              icon: <Bed className="h-6 w-6 text-gray-600 dark:text-gray-400" />,
              label: tListing("beds"),
              value: property.bedrooms ? `${property.bedrooms} ${tListing("beds")}` : null,
            },
        {
          icon: <Bath className="h-6 w-6 text-gray-600 dark:text-gray-400" />,
          label: tListing("baths"),
          value: property.bathrooms ? `${property.bathrooms} ${tListing("baths")}` : null,
        },
      ].filter(stat => stat.value !== null);

  return (
    <div className="mt-9" dir={locale === "ar" ? "rtl" : "ltr"}>
      {/* Main Content */}
      <div>
        {/* About Property Section */}
        <div className="mb-8">
          <HeadTitle text={`${t("about-this")} ${tCategories(property.category)}`} />
          {property?.description && (
            <div className="mt-4">
              <p className={cn(
                "text-gray-600 dark:text-gray-400 leading-relaxed",
                !showFullDescription && "line-clamp-3"
              )}>
                {property.description}
              </p>
              {property.description.length > 200 && (
                <button
                  onClick={() => setShowFullDescription(!showFullDescription)}
                  className="mt-2 text-main-600 hover:text-main-700 font-medium"
                >
                  {showFullDescription ? t("see-less") : t("see-more")}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Property Stats Boxes */}
        <div className="flex flex-wrap gap-3 mb-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="flex flex-col items-center justify-center min-w-25 p-4 rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800"
            >
              {stat.icon}
              <span className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                {stat.label}
              </span>
              <span className={cn(
                "mt-1 text-sm font-bold text-gray-900 dark:text-white"
              )}>
                {stat.value}
              </span>
            </div>
          ))}
        </div>

        {/* Feature Component */}
        <FeatureComponent property={property} />

        {/* Amenities */}
        {amenities && amenities.length > 0 && (
          <AmenetiesComponent amenities={amenities} />
        )}

        {/* Services */}
        {services && services.length > 0 && <ServicesComponent services={services} currency={currency} />}

        {/* Files Attached Section */}
        {(property.contract || property.refundPolicy || property.purchaseContract) && (
          <div className="rounded-xl bg-gray-50 dark:bg-gray-800/50 p-6 mb-8">
            <HeadTitle text={t("files-attached")} className="mb-6" />
            <div className="flex flex-wrap gap-3">
              {property.contract && (
                <Link
                  href={property.contract}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 rounded-full border border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-800 transition-colors hover:border-main-400"
                >
                  <FileText className="h-4 w-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                    {t("contract")}
                  </span>
                </Link>
              )}
              {property.refundPolicy && (
                <Link
                  href={property.refundPolicy}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 rounded-full border border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-800 transition-colors hover:border-main-400"
                >
                  <FileText className="h-4 w-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                    {t("refund-policy")}
                  </span>
                </Link>
              )}
              {property.purchaseContract && (
                <Link
                  href={property.purchaseContract}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 rounded-full border border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-800 transition-colors hover:border-main-400"
                >
                  <FileText className="h-4 w-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                    {t("purchase-contract")}
                  </span>
                </Link>
              )}
            </div>
          </div>
        )}

        {/* Interior Design */}
        <InteriorDesign interiorDesign={property.interiorDesign} />

        {/* Location */}
        <Location coords={{ long, lat }} />
      </div>
    </div>
  );
}
