"use client";

import { useTranslations } from "next-intl";
import dynamic from "next/dynamic";
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
  const t = useTranslations("Properties.Details");
  const { long, lat } = coords;

  return (
    <div className="border-b border-gray-200 pt-12 dark:border-gray-700">
      <HeadTitle text={t("map")} />
      <div className="relative">
        <Map latitude={lat} longitude={long} />
      </div>
    </div>
  );
}
