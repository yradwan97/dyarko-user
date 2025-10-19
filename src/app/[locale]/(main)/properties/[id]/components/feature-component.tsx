"use client";

import { useLocale, useTranslations } from "next-intl";
import { Property } from "@/lib/services/api/properties";
import { format, differenceInWeeks, isFuture } from "date-fns";
import HeadTitle from "./head-title";
import FeatureItem from "./feature-item";

interface FeatureComponentProps {
  property: Property;
}

export default function FeatureComponent({ property }: FeatureComponentProps) {
  const locale = useLocale();
  const t = useTranslations("Properties.Details.Features");

  const weeksDiff = differenceInWeeks(
    new Date(),
    new Date(property.createdAt || property.updatedAt)
  );
  const isAvailable =
    !property.availableDate || !isFuture(new Date(property.availableDate));

  return (
    <div className="border-b border-gray-200 py-12 dark:border-gray-700">
      <HeadTitle text={t("title")} />
      <div
        className={`flex flex-col ${
          locale === "ar" ? "md:flex-row-reverse" : "md:flex-row"
        } md:space-x-20`}
      >
        <div className={`md:w-1/2 ${locale === "ar" && "pl-5"}`}>
          <ul className="space-y-5">
            <FeatureItem
              firstText={t("listed-on")}
              secondText={`${weeksDiff} ${weeksDiff === 1 ? t("week") : t("weeks")}`}
              companyName
            />
            <FeatureItem
              firstText={t("available-date")}
              secondText={
                isAvailable
                  ? t("available-now")
                  : `${t("available-from")} ${format(new Date(property.availableDate!), "dd/MM/yyyy")}`
              }
            />
            <FeatureItem
              firstText={t("year")}
              secondText={new Date(property.createdAt).getFullYear().toString()}
            />
            <FeatureItem firstText={t("type")} secondText={property.category} />
            <FeatureItem firstText={t("city")} secondText={property.city} />
          </ul>
        </div>
        <div className="mt-5 md:mt-0 md:w-1/2">
          <ul className="space-y-5">
            {property.area && (
              <FeatureItem firstText={t("size")} secondText={`${property.area} m2`} />
            )}
            {property.offerType === "share" && (
              <>
                <FeatureItem firstText={t("capacity")} secondText={property.capacity?.toString() || ""} />
                <FeatureItem
                  firstText={t("available-capacity")}
                  secondText={property.availableCapacity?.toString() || ""}
                />
              </>
            )}
            {property.category === "chalet" && (
              <>
                {property.capacity && (
                  <FeatureItem
                    firstText={t("capacity")}
                    secondText={property.capacity.toString()}
                  />
                )}
                <FeatureItem
                  firstText={t("has-garden")}
                  secondText={property.hasGarden ? t("yes") : t("no")}
                />
                <FeatureItem
                  firstText={t("has-beach")}
                  secondText={property.hasBeach ? t("yes") : t("no")}
                />
                <FeatureItem
                  firstText={t("has-pool")}
                  secondText={property.hasPool ? t("yes") : t("no")}
                />
              </>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
