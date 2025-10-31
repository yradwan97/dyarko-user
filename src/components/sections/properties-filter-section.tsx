"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { KeyIcon } from "@/components/icons";
import Typography from "@/components/shared/typography";
import Button from "@/components/shared/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCities } from "@/hooks/use-cities";
import { useCountryContext } from "@/components/providers/country-provider";
import { getLocalizedPath } from "@/lib/utils";
import { BuildingIcon } from "lucide-react";

export default function PropertiesFilterSection() {
  const t = useTranslations("HomePage.Properties");
  const tGeneral = useTranslations("General");
  const locale = useLocale();
  const router = useRouter();
  const { selectedCountry } = useCountryContext();
  const { data: cities, isLoading: citiesLoading } = useCities(selectedCountry);
  const [activeTab, setActiveTab] = useState<"rent" | "installment">("rent");
  const [selectedCity, setSelectedCity] = useState<string>("");

  const tabstyle = "flex items-center py-2.5 px-3 sm:px-5 cursor-pointer text-sm md:text-lg";

  // Set initial city when cities are loaded or country changes
  useEffect(() => {
    if (cities && cities.length > 0) {
      setSelectedCity(cities[0].key);
    }
  }, [cities]);

  // Fallback to governorates if cities are not loaded
  const cityOptions = cities && cities.length > 0
    ? cities.map(c => ({ key: c.key, city: c.city })) : []

  const handleBrowse = () => {
    const queryParams = new URLSearchParams();
    if (selectedCity) {
      queryParams.append("city", selectedCity);
    }
    if (selectedCountry) {
      queryParams.append("country", selectedCountry);
    }

    const path = getLocalizedPath(
      `/property-listing/${activeTab}?${queryParams.toString()}`,
      locale
    );
    router.push(path);
  };

  return (
    <section className="bg-gradient-to-t from-main-100 to-white px-4">
      <div className="container mx-auto py-20">
        <div className="mb-20 flex flex-col space-y-4 text-center">
          <Typography variant="h2" as="h2" className="font-bold text-black">
            {t("title-head")}
          </Typography>
          <Typography
            variant="body-lg-medium"
            as="p"
            className="mx-auto text-gray-600 lg:w-2/3"
          >
            {t("title-desc")}
          </Typography>
        </div>
        <div className="flex flex-col items-center gap-5 lg:flex-row lg:justify-between lg:gap-0">
          <ul className="flex flex-row rounded-lg border-[1.5px] border-main-100 bg-white p-2">
            <li
              className={`${
                activeTab === "rent"
                  ? "stroke-main-600 font-bold text-main-600 shadow-[0_3px_40px_rgba(14,8,84,0.05)]"
                  : "stroke-gray-500 font-medium text-gray-500"
              } ${tabstyle}`}
              onClick={() => setActiveTab("rent")}
            >
              <KeyIcon className="stroke-inherit mr-2 h-4 w-4" />
              {tGeneral("PaymentMethods.rent")}
            </li>
            <li
              className={`${
                activeTab === "installment"
                  ? "stroke-main-600 font-bold text-main-600 shadow-[0_3px_40px_rgba(14,8,84,0.05)]"
                  : "stroke-gray-500 font-medium text-gray-500"
              } ${tabstyle}`}
              onClick={() => setActiveTab("installment")}
            >
              <BuildingIcon className="stroke-inherit mr-2 h-5 w-5" />
              {tGeneral("PaymentMethods.installment")}
            </li>
          </ul>
          <div className="relative mx-auto w-full sm:w-3/4 md:w-5/12 lg:w-4/12">
            <Select
              value={selectedCity}
              onValueChange={setSelectedCity}
              disabled={citiesLoading}
            >
              <SelectTrigger className="w-full justify-between rounded-lg border border-gray-300 bg-white px-5 py-3">
                <SelectValue>
                  {citiesLoading
                    ? "Loading..."
                    : cityOptions.find((c) => c.key === selectedCity)?.city || "Select City"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {cityOptions.map((city) => (
                  <SelectItem key={city.key} value={city.key}>
                    {city.city}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button variant="primary" onClick={handleBrowse} className="block w-full sm:w-fit">
            {tGeneral("browse")}
          </Button>
        </div>
      </div>
    </section>
  );
}
