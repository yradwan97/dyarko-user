"use client";

import { useState, useEffect, useMemo } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useSearchParams } from "next/navigation";

import Typography from "@/components/shared/typography";
import Button from "@/components/shared/button";
import CustomSelect from "@/components/shared/custom-select";
import { DatePicker } from "@/components/ui/date-picker";
import { Slider } from "@/components/ui/slider";
import { useCities } from "@/hooks/use-cities";
import { useCountryContext } from "@/components/providers/country-provider";
import { formatPrice } from "@/lib/utils/property-pricing";
import { useCurrency } from "@/hooks/use-currency";
import type { Governorate } from "@/types/property";

interface SearchControlProps {
  slug: string;
  onSearch: (filters: any) => void;
  onReset: () => void;
}

// Price range limits
const PRICE_RANGE = {
  min: 0,
  max: 1000000,
  step: 1000,
};

export default function SearchControl({ slug, onSearch, onReset }: SearchControlProps) {
  const t = useTranslations("PropertyListing");
  const locale = useLocale();
  const currency = useCurrency();
  const searchParams = useSearchParams();
  const { selectedCountry } = useCountryContext();

  // Get cities
  const { data: cities, isLoading: citiesLoading } = useCities(selectedCountry);

  // Filter states
  const [selectedCity, setSelectedCity] = useState<Governorate | undefined>();
  const [date, setDate] = useState<Date | null>(null);
  const [priceRange, setPriceRange] = useState<[number, number]>([PRICE_RANGE.min, PRICE_RANGE.max]);

  // Convert cities to governorate format
  const cityOptions: Governorate[] = useMemo(() => {
    return cities
      ? cities.map((city) => ({
          id: city.key,
          name: city.city,
          icon: city.city,
        }))
      : [];
  }, [cities]);

  // Initialize or update selected city when cities load or country changes
  useEffect(() => {
    if (cityOptions.length > 0) {
      const cityParam = searchParams.get("city");
      if (cityParam) {
        const city = cityOptions.find((c) => c.id === cityParam);
        if (city) {
          setSelectedCity(city);
          return;
        }
      }
      // Default to first city
      setSelectedCity(cityOptions[0]);
    }
  }, [cityOptions, searchParams]);

  const handleSearch = () => {
    const filters: any = {};

    if (selectedCity?.id) {
      filters.city = selectedCity.id;
    }

    if (date) {
      filters.available_date = date;
    }

    // Add price_from only if it's not 0
    if (priceRange[0] > 0) {
      filters.price_from = priceRange[0];
    }

    // Add price_to only if it's not max
    if (priceRange[1] < PRICE_RANGE.max) {
      filters.price_to = priceRange[1];
    }

    onSearch(filters);
  };

  const handleResetFilters = () => {
    setDate(null);
    if (cityOptions.length > 0) {
      setSelectedCity(cityOptions[0]);
    }
    setPriceRange([PRICE_RANGE.min, PRICE_RANGE.max]);
    onReset();
  };

  return (
    <div className="mb-8">
      <div className="rounded-lg bg-white p-6 shadow-sm">
        <div
          className={`grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 ${
            locale === "ar" ? "text-right" : "text-left"
          }`}
        >
          {/* Location */}
          <div className="flex flex-col gap-2">
            <Typography variant="body-md" as="p" className="text-gray-600">
              {t("location")}
            </Typography>
            <CustomSelect
              containerClass="w-full rounded-lg px-4"
              values={cityOptions}
              selected={selectedCity}
              setSelected={setSelectedCity}
              disabled={citiesLoading}
            />
          </div>

          {/* Date */}
          <div className="flex flex-col gap-2">
            <Typography variant="body-md" as="p" className="text-gray-600">
              {t("when")}
            </Typography>
            <DatePicker
              date={date}
              onDateChange={(newDate) => setDate(newDate || null)}
              placeholder={t("date-placeholder")}
              className="h-12 border-gray-200 focus:border-main-400"
            />
          </div>

          {/* Price Range */}
          <div className="flex flex-col gap-2">
            <div className="mb-2 flex items-center justify-between">
              <Typography variant="body-md" as="p" className="text-gray-600">
                {t("price")}
              </Typography>
              <Typography variant="body-sm" as="span" className="text-gray-500">
                {formatPrice(priceRange[0], currency)} - {formatPrice(priceRange[1], currency)}
              </Typography>
            </div>
            <Slider
              min={PRICE_RANGE.min}
              max={PRICE_RANGE.max}
              step={PRICE_RANGE.step}
              value={priceRange}
              onValueChange={(value) => setPriceRange(value as [number, number])}
              className="mt-2"
            />
            <div className="mt-1 flex justify-between text-xs text-gray-500">
              <span>{formatPrice(PRICE_RANGE.min, currency)}</span>
              <span>{formatPrice(PRICE_RANGE.max, currency)}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div
          className={`mt-6 flex gap-4 ${
            locale === "ar" ? "justify-end" : "justify-start"
          }`}
        >
          <Button variant="primary" onClick={handleSearch} className="px-8">
            {t("search")}
          </Button>
          <Button variant="primary-outline" onClick={handleResetFilters} className="px-8">
            {t("reset")}
          </Button>
        </div>
      </div>
    </div>
  );
}
