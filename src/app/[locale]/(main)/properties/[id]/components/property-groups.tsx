"use client";

import { useTranslations } from "next-intl";
import { Property } from "@/lib/services/api/properties";
import HeadTitle from "./head-title";
import Typography from "@/components/shared/typography";
import { cn } from "@/lib/utils";

interface PropertyGroupsProps {
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

export default function PropertyGroups({ property, type, currency = "KWD" }: PropertyGroupsProps) {
  const t = useTranslations("Properties.Details");

  if (!property.groups || property.groups.length === 0) {
    return null;
  }

  const maxId = Math.max(...property.groups.flatMap((g: any) => g.ids || []), 0);
  const gridCols = maxId <= 12 ? 4 : 6;

  return (
    <div className="border-b border-gray-200 py-12 dark:border-gray-700">
      <HeadTitle text={t("groups")} />

      <div
        className={cn(
          "grid gap-2 max-w-md",
          gridCols === 4 ? "grid-cols-4" : "grid-cols-6"
        )}
      >
        {Array.from({ length: maxId }, (_, index) => {
          const boxId = index + 1;
          const group = property.groups?.find((g: any) => g.ids?.includes(boxId));
          const boxColor = group?.color || "#E5E7EB";

          return (
            <div key={index} className="group relative">
              {/* Box */}
              <div
                className={cn(
                  "flex h-12 w-12 items-center justify-center rounded-sm border border-gray-300 text-sm font-medium transition-all",
                  group ? "cursor-pointer hover:opacity-90" : "bg-gray-200 text-gray-600"
                )}
                style={{
                  backgroundColor: group ? boxColor : undefined,
                  color: group ? "white" : undefined,
                }}
              >
                {boxId}
              </div>

              {/* Tooltip */}
              {group && (
                <div className="absolute bottom-full left-1/2 mb-2 hidden -translate-x-1/2 group-hover:block z-10">
                  <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-lg dark:border-gray-700 dark:bg-gray-800 min-w-[250px]">
                    <Typography variant="body-md" as="p" className="font-semibold mb-2">
                      {group.name || `${type === "booth" ? t("booth") : t("tent")} ${boxId}`}
                    </Typography>

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">
                          {type === "booth" ? t("related-booths") : t("related-tents")}
                        </span>
                        <span className="font-medium">
                          {group.ids?.length > 0 ? group.ids.join(", ") : t("none")}
                        </span>
                      </div>

                      {group.area && (
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">{t("area")}</span>
                          <span className="font-medium">{group.area} m²</span>
                        </div>
                      )}

                      {group.capacity && (
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">{t("capacity")}</span>
                          <span className="font-medium">{group.capacity}</span>
                        </div>
                      )}

                      {group.price && (
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">{t("price")}</span>
                          <span className="font-bold text-primary">{group.price} {currency}</span>
                        </div>
                      )}

                      {group.insurance && (
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">{t("insurance")}</span>
                          <span className="font-medium text-blue-600">{group.insurance} {currency}</span>
                        </div>
                      )}

                      {group.description && (
                        <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                          <Typography variant="body-sm" as="p" className="text-gray-600 dark:text-gray-400">
                            {group.description}
                          </Typography>
                        </div>
                      )}
                    </div>

                    {/* Tooltip arrow */}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px">
                      <div className="border-4 border-transparent border-t-white dark:border-t-gray-800" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {property.groups.length === 0 && (
        <Typography variant="body-md" as="p" className="text-center text-gray-500 dark:text-gray-400 py-8">
          {t("no-groups-available")}
        </Typography>
      )}
    </div>
  );
}
