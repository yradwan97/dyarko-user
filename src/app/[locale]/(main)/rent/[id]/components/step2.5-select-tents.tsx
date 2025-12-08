"use client";

import { useState, useMemo } from "react";
import { useLocale, useTranslations } from "next-intl";
import { type Property } from "@/lib/services/api/properties";
import { Button } from "@/components/ui/button";
import { Check, ChevronDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useGetAvailableTents } from "@/hooks/use-tents";
import { format } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Step25SelectTentsProps {
  property: Property;
  selectedDates: Date[];
  selectedTents: any[];
  setSelectedTents: (tents: any[]) => void;
  onNext: () => void;
}

export default function Step25SelectTents({
  property,
  selectedDates,
  selectedTents,
  setSelectedTents,
  onNext,
}: Step25SelectTentsProps) {
  const locale = useLocale();
  const t = useTranslations("Rent.Step2_5");
  const tCommon = useTranslations("General");
  const [expandedTents, setExpandedTents] = useState<Set<number | string>>(new Set());
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

  // Get dates for API call
  const startDate = useMemo(() => {
    if (selectedDates.length === 0) return "";
    const sorted = [...selectedDates].sort((a, b) => a.getTime() - b.getTime());
    return format(sorted[0], "MM/dd/yyyy");
  }, [selectedDates]);

  const endDate = useMemo(() => {
    if (selectedDates.length === 0) return "";
    const sorted = [...selectedDates].sort((a, b) => a.getTime() - b.getTime());
    return format(sorted[sorted.length - 1], "MM/dd/yyyy");
  }, [selectedDates]);

  // Fetch available tents/booths
  const { data: availableTentIds, isLoading } = useGetAvailableTents(
    {
      property: property._id,
      startDate,
      endDate,
    },
    !!startDate && !!endDate
  );

  // Get all tents from all groups
  const allTents = useMemo(() => {
    if (!property.groups) return [];

    const tents: any[] = [];
    property.groups.forEach((group: any, groupIndex: number) => {
      // Each group has an ids array containing tent IDs
      if (group.ids && Array.isArray(group.ids)) {
        group.ids.forEach((tentId: number) => {
          tents.push({
            _id: tentId,
            number: tentId,
            color: group.color || "#e5e7eb",
            price: group.price,
            insurance: group.insurance || property.insurancePrice,
            area: group.area,
            description: group.description,
            groupIndex,
            groupName: group.name || `Group ${groupIndex + 1}`,
            groupId: group._id,
          });
        });
      }
    });
    return tents;
  }, [property.groups, property.insurancePrice]);

  // Check if a tent is available
  const isTentAvailable = (tentId: number) => {
    return availableTentIds?.includes(tentId);
  };

  // Check if a tent is selected
  const isTentSelected = (tent: any) => {
    return selectedTents.some((t) => t._id === tent._id);
  };

  // Toggle tent selection
  const toggleTentSelection = (tent: any) => {
    if (!isTentAvailable(tent._id)) return;

    if (isTentSelected(tent)) {
      setSelectedTents(selectedTents.filter((t) => t._id !== tent._id));
    } else {
      setSelectedTents([...selectedTents, tent]);
    }
  };

  // Toggle tent panel expansion
  const toggleTentExpansion = (tentId: number | string) => {
    setExpandedTents((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(tentId)) {
        newSet.delete(tentId);
      } else {
        newSet.add(tentId);
      }
      return newSet;
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner className="h-8 w-8 text-main-500" />
      </div>
    );
  }

  // Debug: log the data
  console.log("📊 Tent Selection Debug:", {
    totalTents: allTents.length,
    availableTentIds,
    groups: property.groups,
  });

  return (
    <div className="space-y-6">
      {/* Visual Layout Section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          {t("camp-layout") || "Camp Layout"}
        </h2>

        {property.interiorDesign ? (
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-900">
            <div className="flex flex-col items-center gap-2">
              <button
                onClick={() => setIsImageModalOpen(true)}
                className="relative group cursor-pointer transition-all hover:scale-105"
              >
                <Image
                  width={400}
                  height={300}
                  src={property.interiorDesign}
                  alt={t("camp-layout") || "Camp Layout"}
                  className="max-w-full h-auto rounded-lg"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 rounded-lg transition-all flex items-center justify-center">
                  <span className="opacity-0 group-hover:opacity-100 text-white bg-black/50 px-3 py-1 rounded-lg text-sm font-medium transition-opacity">
                    {t("click-to-enlarge")}
                  </span>
                </div>
              </button>
            </div>
          </div>
        ) : (
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-8 bg-gray-50 dark:bg-gray-900 text-center">
            <p className="text-gray-500 dark:text-gray-400">
              {t("no-layout-image")}
            </p>
          </div>
        )}
      </div>

      {/* Choose Tents Section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          {t("choose-tents") || "Choose Tents"}
        </h2>

        {allTents.length === 0 ? (
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-8 mb-4 bg-gray-50 dark:bg-gray-900 text-center">
            <p className="text-gray-500 dark:text-gray-400">
              {t("no-tents") || "No tents available in this property"}
            </p>
          </div>
        ) : (
          <>
            {/* Interactive tent selection */}
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 mb-4 bg-gray-50 dark:bg-gray-900">
              <div className="flex flex-wrap gap-2 justify-center">
                {allTents.map((tent) => {
                  const isAvailable = isTentAvailable(tent._id);
                  const isSelected = isTentSelected(tent);

                  return (
                    <button
                      key={tent._id}
                      onClick={() => toggleTentSelection(tent)}
                      disabled={!isAvailable}
                      className={cn(
                        "w-16 h-16 rounded-lg border-2 flex items-center justify-center font-semibold text-sm transition-all relative",
                        isSelected && "ring-2 ring-main-500 ring-offset-2",
                        !isAvailable && "opacity-40 cursor-not-allowed",
                        isAvailable && !isSelected && "hover:border-main-300 hover:scale-105"
                      )}
                      style={{
                        backgroundColor: tent.color || "#e5e7eb",
                        borderColor: isSelected ? "#8b5cf6" : tent.color || "#9ca3af",
                        color: tent.color ? getContrastColor(tent.color) : "#1f2937",
                      }}
                      title={`${t("tent")} ${tent.number} - ${tent.groupName} - ${isAvailable ? "Available" : "Booked"}`}
                    >
                      {tent.number || tent._id}
                      {!isAvailable && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-lg">
                          <span className="text-xs font-bold text-white">✕</span>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-4 mb-4">
              {property.groups?.map((group: any, index: number) => (
                <div key={index} className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded border"
                    style={{ backgroundColor: group.color || "#e5e7eb" }}
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {group.name || `Group ${index + 1}`} ({group.ids?.length || 0} {t("tent")}s)
                  </span>
                </div>
              ))}
            </div>

            {/* Availability info */}
            <div className="flex items-center gap-4 text-sm mb-4">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded border-2 border-green-500 bg-green-100" />
                <span className="text-gray-600 dark:text-gray-400">
                  Available ({availableTentIds?.length || 0})
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded border-2 border-gray-400 bg-gray-200 opacity-40" />
                <span className="text-gray-600 dark:text-gray-400">
                  Booked ({allTents.length - (availableTentIds?.length || 0)})
                </span>
              </div>
            </div>

            {/* Tent Chosen Dropdown */}
            {selectedTents.length > 0 && (
              <div className="space-y-3 mb-4">
                <h3 className="font-medium text-gray-900 dark:text-white">
                  {t("tent-chosen") || "Tent Chosen"}:
                </h3>
                {selectedTents.map((tent, index) => {
                  const isExpanded = expandedTents.has(tent._id);
                  return (
                    <div key={tent._id} className="border border-gray-200 dark:border-gray-700 rounded-lg">
                      <button
                        className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
                        onClick={() => toggleTentExpansion(tent._id)}
                      >
                        <span className="font-medium text-gray-900 dark:text-white">
                          {property.category === "camp" ? t("tent") : t("booth")} {tent.number || tent._id}
                        </span>
                        <ChevronDown
                          className={cn(
                            "h-5 w-5 text-gray-500 transition-transform",
                            isExpanded && "rotate-180"
                          )}
                        />
                      </button>
                      {isExpanded && (
                        <div className="px-4 pb-4 space-y-2 border-t border-gray-100 dark:border-gray-700 pt-3">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-400">{t("name")}:</span>
                            <span className="font-medium text-gray-900 dark:text-white">{tent.groupName}</span>
                          </div>
                          {/* Size for booth, Capacity for camp */}
                          {property.category === "booth" && tent.area && (
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600 dark:text-gray-400">{t("size")}:</span>
                              <span className="font-medium text-gray-900 dark:text-white">{tent.area} m²</span>
                            </div>
                          )}
                          {property.category === "camp" && property.groups?.[tent.groupIndex]?.capacity && (
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600 dark:text-gray-400">{t("capacity")}:</span>
                              <span className="font-medium text-gray-900 dark:text-white">
                                {property.groups[tent.groupIndex].capacity} {t("person")}
                              </span>
                            </div>
                          )}
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-400">{t("price")}:</span>
                            <span className="font-medium text-gray-900 dark:text-white">
                              {tent.price || property.groups?.[tent.groupIndex]?.price || 0} {tCommon("kwd")}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-400">{t("insurance")}:</span>
                            <span className="font-medium text-gray-900 dark:text-white">
                              {tent.insurance || property.insurancePrice || 0} {tCommon("kwd")}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Note */}
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {t("layout-note") || "Click on available tents to select them. Unavailable tents are likely booked for your chosen dates."}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              {t("camp-note") || "Note: This is the camp's layout. The tents you select will match the same numbers and locations shown here"}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              {t("details-note") || "Note: You can check all tent details inside the camp details section"}
            </p>
          </>
        )}
      </div>

      {/* Next Button */}
      <Button
        onClick={onNext}
        disabled={selectedTents.length === 0}
        className="w-full h-12 bg-gray-900 hover:bg-gray-800 dark:bg-gray-100 dark:hover:bg-gray-200 text-white dark:text-gray-900 font-semibold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {t("next") || "Next"}
      </Button>

      {/* Image Modal */}
      <Dialog open={isImageModalOpen} onOpenChange={setIsImageModalOpen}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] p-0">
          <DialogHeader className="p-4 pb-0">
            <DialogTitle>{t("camp-layout") || "Camp Layout"}</DialogTitle>
          </DialogHeader>
          <div className="relative w-full h-full p-4 overflow-auto">
            {property.interiorDesign && (
              <div className="flex items-center justify-center">
                <Image
                  width={1200}
                  height={900}
                  src={property.interiorDesign}
                  alt={t("camp-layout") || "Camp Layout"}
                  className="max-w-full h-auto rounded-lg"
                />
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Helper function to determine text color based on background color
function getContrastColor(hexColor: string): string {
  // Remove # if present
  const hex = hexColor.replace("#", "");

  // Convert to RGB
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);

  // Calculate luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  // Return black or white based on luminance
  return luminance > 0.5 ? "#000000" : "#FFFFFF";
}
