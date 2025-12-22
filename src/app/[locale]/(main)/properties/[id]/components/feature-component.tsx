"use client";

import { useLocale, useTranslations } from "next-intl";
import { Property } from "@/lib/services/api/properties";
import { format } from "date-fns";
import { CheckCircle2, XCircle } from "lucide-react";
import HeadTitle from "./head-title";
import { cn } from "@/lib/utils";

interface FeatureComponentProps {
  property: Property;
}

type PropertyDataItem = {
  label: string;
  value: string | null;
  isBoolean?: boolean;
  booleanValue?: boolean;
};

export default function FeatureComponent({ property }: FeatureComponentProps) {
  const locale = useLocale();
  const t = useTranslations("Properties.Details.Features");
  const tCategories = useTranslations("General.Categories");

  // Format dates
  const availableDate = property.availableDate
    ? format(new Date(property.availableDate), "dd\\MM\\yyyy")
    : null;

  // Get rent offer types
  const getRentOffer = () => {
    const offers = [];
    if (property.isDaily) offers.push("Daily");
    if (property.isWeekly) offers.push("weekly");
    if (property.isMonthly) offers.push("monthly");
    return offers.length > 0 ? offers.join(" - ") : null;
  };

  // Get offer type label
  const getOfferTypeLabel = () => {
    if (!property.offerType) return null;
    if (property.offerType === "rent") return t("for-rent");
    if (property.offerType === "sale") return t("for-sale");
    return property.offerType.charAt(0).toUpperCase() + property.offerType.slice(1);
  };

  // Get type value - for court category show actual court type, otherwise show category
  const getTypeValue = () => {
    if (property.category === "court" && (property as any).type) {
      const courtType = (property as any).type;
      return courtType.charAt(0).toUpperCase() + courtType.slice(1);
    }
    return property.category ? tCategories(property.category) : null;
  };

  // Property information data - combine and filter out null/undefined values
  const allPropertyData: PropertyDataItem[] = [
    { label: t("available-at"), value: availableDate },
    { label: tCategories("category"), value: property.category ? tCategories(property.category) : null },
    { label: t("type"), value: getTypeValue() },
    { label: t("class"), value: property.class || null },
    { label: t("offer-type"), value: getOfferTypeLabel() },
    { label: t("furnished"), value: "boolean", isBoolean: true, booleanValue: property.isFurnished },
    { label: t("finished"), value: "boolean", isBoolean: true, booleanValue: property.isFinished },
    ...(property.isFinished && property.finishType ? [{ label: t("finish-type"), value: property.finishType }] : []),
    { label: t("rent-offer"), value: getRentOffer() },
    { label: t("paci-no"), value: property.paciNumber?.join(", ") || null },
    { label: t("commission"), value: property.commission ? `${property.commission}%` : null },
    // Chalet-specific features
    ...(property.category === "chalet" ? [
      { label: t("capacity"), value: property.capacity ? String(property.capacity) : null },
      { label: t("has-garden"), value: "boolean", isBoolean: true, booleanValue: property.hasGarden },
      { label: t("has-beach"), value: "boolean", isBoolean: true, booleanValue: property.hasBeach },
      { label: t("has-pool"), value: "boolean", isBoolean: true, booleanValue: property.hasPool },
    ] : []),
    // Share-specific features
    ...(property.offerType === "share" ? [
      { label: t("capacity"), value: property.capacity ? String(property.capacity) : null },
      { label: t("available-capacity"), value: property.availableCapacity ? String(property.availableCapacity) : null },
    ] : []),
  ].filter(item => item.value !== null);

  // Split into two columns evenly
  const midpoint = Math.ceil(allPropertyData.length / 2);
  const leftColumnData = allPropertyData.slice(0, midpoint);
  const rightColumnData = allPropertyData.slice(midpoint);

  const renderValue = (item: PropertyDataItem) => {
    if (item.isBoolean) {
      return item.booleanValue ? (
        <CheckCircle2 className="h-5 w-5 text-green-500" />
      ) : (
        <XCircle className="h-5 w-5 text-red-500" />
      );
    }
    return <span className="font-medium text-gray-900 dark:text-white capitalize">{item.value}</span>;
  };

  const tDetails = useTranslations("Properties.Details");

  return (
    <div className="rounded-xl bg-gray-50 dark:bg-gray-800/50 p-6 mb-8" dir={locale === "ar" ? "rtl" : "ltr"}>
      <HeadTitle text={tDetails("property-information")} className="mb-6" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
        {/* First Column */}
        <div className="space-y-4">
          {leftColumnData.map((item, index) => (
            <div
              key={index}
              className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700"
            >
              <span className="text-gray-600 dark:text-gray-400 capitalize">{item.label}</span>
              {renderValue(item)}
            </div>
          ))}
        </div>

        {/* Second Column */}
        <div className="space-y-4">
          {rightColumnData.map((item, index) => (
            <div
              key={index}
              className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700"
            >
              <span className="text-gray-600 dark:text-gray-400 capitalize">{item.label}</span>
              {renderValue(item)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
