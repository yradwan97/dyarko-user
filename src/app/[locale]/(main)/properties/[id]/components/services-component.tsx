"use client";

import { useTranslations } from "next-intl";
import HeadTitle from "./head-title";
import FeatureItem from "./feature-item";

interface ServicesComponentProps {
  services: string[];
}

export default function ServicesComponent({ services }: ServicesComponentProps) {
  const t = useTranslations("Properties.Details");

  return (
    <div className="border-b border-gray-200 py-12 dark:border-gray-700">
      <HeadTitle text={t("services")} />
      <div className="flex space-x-20">
        <div className="flex-1">
          <ul className="list-disc space-y-2 sm:space-y-5">
            {services.map((service, i) => (
              <FeatureItem
                key={i}
                className="font-medium capitalize text-black dark:text-white"
                firstText={service}
              />
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
