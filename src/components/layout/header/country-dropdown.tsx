"use client";

import { MapPinIcon } from "lucide-react";
import { useLocale } from "next-intl";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCountries } from "@/hooks/use-countries";
import { useCountryContext } from "@/components/providers/country-provider";

export default function CountryDropdown() {
  const { data: countries, isLoading } = useCountries();
  const { selectedCountry, setSelectedCountry } = useCountryContext();
  const locale = useLocale();

  const handleCountryChange = (countryCode: string) => {
    setSelectedCountry(countryCode);
    // TODO: Update user's country preference in backend
    // This would require an API call to update the user profile
  };

  const currentCountry = countries?.find((c) => c.code === selectedCountry);
  const displayName = locale === "ar"
    ? (currentCountry?.countryAr || "الكويت")
    : (currentCountry?.countryEn || "Kuwait");

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
        <MapPinIcon className="h-4 w-4" />
        <span>Loading...</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <MapPinIcon className="h-4 w-4 text-gray-700 dark:text-gray-300" />
      <Select value={selectedCountry} onValueChange={handleCountryChange}>
        <SelectTrigger className="h-auto w-auto border-0 bg-transparent p-0 hover:text-gray-900 px-2 dark:hover:text-gray-100">
          <SelectValue>
            <span className="text-sm">{displayName}</span>
          </SelectValue>
        </SelectTrigger>
        <SelectContent align="start" side="bottom">
          {countries?.map((country) => (
            <SelectItem
              key={country.code}
              value={country.code}
              className="cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">
                  {locale === "ar" ? country.countryAr : country.countryEn}
                </span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
