"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

interface PropertySkeletonGridProps {
  viewType: "grid" | "list";
  promoted?: boolean; // only respected when viewType === "grid"
  title?: string; // Optional title for the skeleton section
}

export default function PropertySkeletonGrid({
  viewType,
  promoted = false,
  title,
}: PropertySkeletonGridProps) {
  const tGeneral = useTranslations("General");
  // Determine number of skeleton cards to show
  const skeletonCount = (() => {
    if (viewType === "list") return 6;
    // viewType === "grid"
    return promoted ? 4 : 12;
  })();

  const gridClasses =
    viewType === "grid"
      ? "grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      : "grid grid-cols-1 gap-6";

  return (
    <div className="mb-8">
      {/* Optional title skeleton – same for both views */}
      <span className="font-bold text-4xl text-main-600">{title || tGeneral("all-properties")}</span>

      <div className={cn("mt-3", gridClasses)}>
        {Array.from({ length: skeletonCount || 4 }).map((_, index) => (
          <SkeletonPropertyCard key={index} viewType={viewType} />
        ))}
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────
// Reusable skeleton card matching your original layouts
// ────────────────────────────────────────────────
interface SkeletonPropertyCardProps {
  viewType: "grid" | "list";
}

function SkeletonPropertyCard({ viewType }: SkeletonPropertyCardProps) {
  if (viewType === "grid") {
    return (
      <Card className="overflow-hidden border-0 rounded-xl bg-white dark:bg-gray-800 shadow-sm">
        {/* Image area */}
        <div className="relative h-44 w-full -translate-y-6">
          <Skeleton className="h-full w-full rounded-t-xl" />

          {/* Top badges & icons placeholder */}
          <div className="absolute top-3 inset-x-3 flex items-center justify-between">
            <Skeleton className="h-7 w-20 rounded-md" />
            <div className="flex gap-2">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
          </div>
        </div>

        <CardContent className="p-3 -mt-4 space-y-3">
          <Skeleton className="h-6 w-[85%] rounded-md" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-4 rounded-full" />
            <Skeleton className="h-4 w-40 rounded" />
          </div>
          <div className="flex items-center justify-between pt-1">
            <Skeleton className="h-7 w-28 rounded-md" />
            <Skeleton className="h-8 w-24 rounded-md" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // ── List view ─────────────────────────────────────
  return (
    <Card className="overflow-hidden border-0 rounded-xl bg-white dark:bg-gray-800 shadow-sm">
      <div className="flex p-4 gap-5">
        {/* Image */}
        <Skeleton className="h-48 w-60 rounded-xl shrink-0" />

        {/* Right side content */}
        <div className="flex-1 flex flex-col gap-3.5 py-1">
          <div className="flex items-start justify-between gap-4">
            <Skeleton className="h-7 w-4/5 rounded-md" />
            <div className="flex gap-2 shrink-0 pt-1">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-4 rounded-full" />
            <Skeleton className="h-4 w-56 rounded" />
          </div>

          <Skeleton className="h-7 w-36 rounded-md" />

          <div className="flex gap-2.5">
            <Skeleton className="h-8 w-20 rounded-md" />
            <Skeleton className="h-8 w-28 rounded-md" />
          </div>
        </div>
      </div>
    </Card>
  );
}