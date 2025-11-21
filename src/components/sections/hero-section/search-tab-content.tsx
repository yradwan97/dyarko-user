"use client";

import { useEffect, useState, useMemo } from "react";
import type { Session } from "next-auth";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";

import Button from "@/components/shared/button";
import CustomSelect from "@/components/shared/custom-select";
import Typography from "@/components/shared/typography";
import { DatePicker } from "@/components/ui/date-picker";
import { useCities } from "@/hooks/use-cities";
import { useCountryContext } from "@/components/providers/country-provider";
import type { Governorate } from "@/types/property";
import { getLocalizedPath } from "@/lib/utils";
import { City } from "@/lib/services/api/places";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface SearchTabContentProps {
  tab: string;
  session: Session | null;
}

export function SearchTabContent({ tab, session }: SearchTabContentProps) {
  const t = useTranslations("HomePage.Slider.TabsContent");
  const router = useRouter();
  const locale = useLocale();
  const { selectedCountry } = useCountryContext();
  // const { data: propertyTypes } = useGetPropertyTypes();
  const { data: cities, isLoading: citiesLoading } = useCities(selectedCountry);
  const [date, setDate] = useState<Date | null>(null);
  const [selectedGov, setSelectedGov] = useState<City | undefined>(undefined);
  const [selectedPropertyType, setSelectedPropertyType] = useState<{ name: string; value: string } | undefined>();

  // Update selected city when cities load or country changes
  useEffect(() => {
    if (cities && cities.length > 0) {
      setSelectedGov(cities[0]);
    }
  }, [cities]);

  // useEffect(() => {
  //   if (propertyTypes && propertyTypes.length > 0) {
  //     setSelectedPropertyType(propertyTypes[0]);
  //   }
  // }, [propertyTypes]);

  const handleSearch = () => {
    const params = new URLSearchParams();
    params.append("offerType", tab);
    if (date) params.append("date", date.toISOString());
    if (selectedGov) params.append("city", selectedGov.key);
    if (selectedPropertyType) params.append("type", selectedPropertyType.value);

    router.push(getLocalizedPath(`/property-search?${params.toString()}`, locale));
  };

  return (
    <div className="flex w-full flex-col gap-4 lg:flex-row lg:items-center">
      {/* Location */}
      <div className="w-full flex-1">
        <Typography variant="body-md" as="p" className="mb-2 text-gray-600">
          {t("location")}
        </Typography>
        <Select
              value={selectedGov?.key}
              onValueChange={(e) => setSelectedGov(cities?.find((city) => city.key === e))}
              disabled={citiesLoading}
            >
              <SelectTrigger className="w-full justify-between rounded-lg border border-gray-300 bg-white px-5 py-5">
                <SelectValue placeholder={citiesLoading ? t("loading") : t("select-city")} />
              </SelectTrigger>
              <SelectContent>
                {(cities || []).map((city) => (
                  <SelectItem key={city.key} value={city.key}>
                    {locale === "ar" ? city.cityAr : city.city}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
      </div>

      {/* Date */}
      <div className="w-full flex-1">
        <Typography variant="body-md" as="p" className="mb-2 text-gray-600">
          {t("when")}
        </Typography>
        <DatePicker
          date={date}
          onDateChange={(newDate) => setDate(newDate || null)}
          placeholder={t("date-placeholder")}
          className="h-10 border-gray-200 focus:border-main-400"
        />
      </div>

      {/* Property Type - Only for rent/installment and logged in users */}
      {/* {session && tab !== "buy" && propertyTypes && (
        <div className="flex-1">
          <Typography variant="body-md" as="p" className="mb-2 text-gray-600">
            {t("type")}
          </Typography>
          <DropDownSelect
            list={propertyTypes.map((type) => type.name)}
            selectedValue={selectedPropertyType ? propertyTypes.indexOf(selectedPropertyType) : 0}
            onSelect={(indx) => setSelectedPropertyType(propertyTypes[indx])}
          />
        </div>
      )} */}

      {/* Search Button */}
      <div className="w-full lg:flex-1 lg:pt-8">
        <Button
          variant="primary"
          onClick={handleSearch}
          className="w-full"
        >
          {t("browse")}
        </Button>
      </div>
    </div>
  );
}
