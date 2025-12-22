"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import { Property } from "@/lib/services/api/properties";
import Typography from "@/components/shared/typography";
import { cn } from "@/lib/utils";

interface BoothCampDetailsProps {
  property: Property;
  type: "booth" | "camp";
  currency?: string;
}

interface PropertyGroup {
  _id?: string;
  name?: string;
  ids: number[];
  color?: string;
  price?: number;
  insurance?: number;
  area?: number;
  capacity?: number;
  description?: string;
}

export default function BoothCampDetails({ property, type, currency = "KWD" }: BoothCampDetailsProps) {
  const locale = useLocale();
  const t = useTranslations("Properties.Details");
  const isRTL = locale === "ar";
  const [selectedGroup, setSelectedGroup] = useState<PropertyGroup | null>(null);

  const groups = (property.groups || []) as PropertyGroup[];

  if (groups.length === 0) {
    return (
      <div className="py-12 text-center">
        <Typography variant="body-lg-medium" as="p" className="text-gray-500">
          {t("no-groups-available")}
        </Typography>
      </div>
    );
  }

  // Calculate grid dimensions
  const maxId = Math.max(...groups.flatMap((g) => g.ids || []), 0);
  const columnsPerRow = 10;
  const rows = Math.ceil(maxId / columnsPerRow);

  // Create a map of id to group for quick lookup
  const idToGroup = new Map<number, PropertyGroup>();
  groups.forEach((group) => {
    group.ids?.forEach((id) => {
      idToGroup.set(id, group);
    });
  });

  const handleBoxClick = (boxId: number) => {
    const group = idToGroup.get(boxId);
    if (group) {
      setSelectedGroup(group);
    }
  };

  return (
    <div className={cn("py-6", isRTL && "text-right")} dir={isRTL ? "rtl" : "ltr"}>
      {/* Booth/Camp Map Image */}
      {property.interiorDesign && (
        <div className="mb-8">
          <div className="relative w-full max-w-3xl mx-auto aspect-video rounded-xl overflow-hidden border border-gray-200 bg-white">
            <Image
              src={property.interiorDesign}
              alt={type === "booth" ? t("booth-map") : t("camp-map")}
              fill
              className="object-contain"
            />
          </div>
        </div>
      )}

      {/* Title */}
      <Typography variant="h5" as="h3" className="mb-4 font-semibold text-gray-800">
        {type === "booth" ? t("booths-number") : t("tents-number")}
      </Typography>

      {/* Groups Grid */}
      <div className="mb-6">
        {Array.from({ length: rows }, (_, rowIndex) => {
          const startId = rowIndex * columnsPerRow + 1;
          const endId = Math.min((rowIndex + 1) * columnsPerRow, maxId);

          return (
            <div key={rowIndex} className="flex gap-1.5 mb-1.5">
              {Array.from({ length: endId - startId + 1 }, (_, colIndex) => {
                const boxId = startId + colIndex;
                const group = idToGroup.get(boxId);
                const isSelected = selectedGroup && selectedGroup.ids?.includes(boxId);
                const boxColor = group?.color || "#9CA3AF"; // gray-400 for unassigned

                return (
                  <button
                    key={boxId}
                    onClick={() => handleBoxClick(boxId)}
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded text-sm font-semibold transition-all",
                      group ? "cursor-pointer hover:opacity-80" : "cursor-default",
                      isSelected && "ring-2 ring-offset-1 ring-gray-900"
                    )}
                    style={{
                      backgroundColor: boxColor,
                      color: "white",
                    }}
                    disabled={!group}
                  >
                    {boxId}
                  </button>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Selected Group Info - Only show when a group is selected */}
      {selectedGroup && (
        <div className="mb-8 p-5 rounded-lg border border-gray-200 bg-gray-50">
          <div className="space-y-3">
            {/* Group Name */}
            <div className="flex">
              <span className="font-semibold text-gray-700 min-w-[120px]">{t("group-name")} :</span>
              <span className="text-gray-900 ms-2">
                {selectedGroup.name || `Group`}
              </span>
            </div>

            {/* Group Booths/Tents */}
            <div className="flex">
              <span className="font-semibold text-gray-700 min-w-[120px]">
                {type === "booth" ? t("group-booths") : t("group-tents")} :
              </span>
              <span className="text-gray-900 ms-2">
                {selectedGroup.ids?.join(", ") || "-"}
              </span>
            </div>

            {/* Price and Insurance Row */}
            <div className="flex flex-wrap gap-x-12">
              <div className="flex">
                <span className="font-semibold text-gray-700">{t("price")} :</span>
                <span className="text-main-600 font-bold ms-2">
                  {selectedGroup.price ? `${selectedGroup.price} ${currency}` : "-"}
                </span>
              </div>
              {selectedGroup.insurance && (
                <div className="flex">
                  <span className="font-semibold text-gray-700">{t("insurance")} :</span>
                  <span className="text-gray-900 ms-2">
                    {selectedGroup.insurance} {currency}
                  </span>
                </div>
              )}
            </div>

            {/* Area */}
            {selectedGroup.area && (
              <div className="flex">
                <span className="font-semibold text-gray-700">{t("area")} :</span>
                <span className="text-gray-900 ms-2">{selectedGroup.area} m2</span>
              </div>
            )}

            {/* Details/Description */}
            {selectedGroup.description && (
              <div className="flex">
                <span className="font-semibold text-gray-700 min-w-[120px]">{t("details")} :</span>
                <span className="text-gray-900 ms-2">{selectedGroup.description}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Notes */}
      <div className="space-y-2 text-sm text-gray-600">
        <p>
          <span className="font-semibold">{t("note")} :</span> {t("color-number-note")}
        </p>
        <p>
          <span className="font-semibold">{t("note")} :</span> {t("no-layout-note")}
        </p>
      </div>
    </div>
  );
}
