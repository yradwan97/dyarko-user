"use client";

import { useLocale, useTranslations } from "next-intl";
import dynamic from "next/dynamic";
import { Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import HeadTitle from "./head-title";

// Dynamically import map component to avoid SSR issues
const Map = dynamic(
  () => import("@/components/ui/map").then((mod) => mod.default),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-96 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800">
        <p className="text-gray-500 dark:text-gray-400">Loading map...</p>
      </div>
    ),
  }
);

interface LocationProps {
  coords: {
    long: number;
    lat: number;
  };
}

export default function Location({ coords }: LocationProps) {
  const locale = useLocale();
  const t = useTranslations("Properties.Details");
  const { long, lat } = coords;

  const handleStartNavigation = () => {
    const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${long}`;
    window.open(googleMapsUrl, "_blank");
  };

  return (
    <div id="map-location" className="rounded-xl bg-gray-50 dark:bg-gray-800/50 p-6 mb-8" dir={locale === "ar" ? "rtl" : "ltr"}>
      <div className="flex items-center justify-between mb-6">
        <HeadTitle text={t("map")} className="mb-0" />
        <Button
          onClick={handleStartNavigation}
          className="mt-6 bg-main-600 text-white hover:bg-main-500 justify-center gap-2 font-semibold shadow-sm hover:shadow-md transition-all"
        >
          <Navigation className="h-4 w-4" />
          {t("start-navigation")}
        </Button>
      </div>
      <div className="relative rounded-lg overflow-hidden">
        <Map latitude={lat} longitude={long} />
      </div>
    </div>
  );
}
