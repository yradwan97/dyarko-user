"use client";

import { useTranslations } from "next-intl";
import Image from "next/image";
import HeadTitle from "./head-title";
import Typography from "@/components/shared/typography";

interface InteriorDesignProps {
  interiorDesign?: string | null;
}

export default function InteriorDesign({ interiorDesign }: InteriorDesignProps) {
  const t = useTranslations("Properties.Details");

  const isValidImageUrl = (url: string | undefined | null): boolean => {
    if (!url || typeof url !== "string" || url.trim() === "") return false;
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const validInteriorDesign = isValidImageUrl(interiorDesign) ? interiorDesign : null;

  return (
    <div className="border-b border-gray-200 py-12 dark:border-gray-700">
      <HeadTitle text={t("interior")} />

      {validInteriorDesign ? (
        <div className="rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
          <Image
            src={validInteriorDesign}
            alt="Interior Design"
            width={1200}
            height={800}
            className="w-full h-auto object-cover"
          />
        </div>
      ) : (
        <Typography
          variant="body-md"
          as="p"
          className="text-center py-8 text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 rounded-lg"
        >
          {t("no-data")}
        </Typography>
      )}
    </div>
  );
}
