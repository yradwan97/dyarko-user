"use client";

import { useTranslations } from "next-intl";
import HeadTitle from "./head-title";
import FeatureItem from "./feature-item";

interface AmenetiesComponentProps {
  amenities: string[];
}

export default function AmenetiesComponent({ amenities }: AmenetiesComponentProps) {
  const t = useTranslations("Properties.Details");

  return (
    <div className="border-b border-gray-200 py-12 dark:border-gray-700">
      <HeadTitle text={t("rental-amenities")} />
      <div className="flex space-x-20">
        <div className="flex-1">
          <ul className="list-disc space-y-2 sm:space-y-5">
            {amenities.map((amenity, i) => (
              <FeatureItem
                key={i}
                className="font-medium capitalize text-black dark:text-white"
                firstText={amenity}
              />
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
