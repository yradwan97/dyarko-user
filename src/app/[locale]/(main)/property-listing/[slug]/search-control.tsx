"use client";

import { useState, useEffect, useMemo } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useSearchParams } from "next/navigation";

import Typography from "@/components/shared/typography";
import Button from "@/components/shared/button";
import CustomSelect from "@/components/shared/custom-select";
import { DatePicker } from "@/components/ui/date-picker";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
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

  console.log("currency in search control:", currency);

  // Get cities
  const { data: cities, isLoading: citiesLoading } = useCities(selectedCountry);

  // Filter states
  const [selectedCity, setSelectedCity] = useState<Governorate | undefined>();
  const [date, setDate] = useState<Date | null>(null);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 0]);

  // Period filters - default to none selected (only required when price filter is set)
  const [periods, setPeriods] = useState({
    isDaily: false,
    isWeekly: false,
    isMonthly: false,
    isWeekdays: false,
    isHolidays: false,
  });

  // Check if price filter is set
  const hasPriceFilter = priceRange[0] > 0 || priceRange[1] > 0;

  // Handle period change - ensure at least one is selected only when price filter is set
  const handlePeriodChange = (period: keyof typeof periods, checked: boolean) => {
    const newPeriods = { ...periods, [period]: checked };
    const hasAtLeastOne = Object.values(newPeriods).some(v => v);

    // If price filter is set and trying to uncheck the last period, prevent it
    if (hasPriceFilter && !hasAtLeastOne) {
      return;
    }

    setPeriods(newPeriods);
  };

  // Auto-select monthly when price filter is set and no period is selected
  useEffect(() => {
    const hasAnyPeriod = Object.values(periods).some(v => v);
    if (hasPriceFilter && !hasAnyPeriod) {
      setPeriods(prev => ({ ...prev, isMonthly: true }));
    }
  }, [hasPriceFilter]);

  // Convert cities to governorate format
  const cityOptions: Governorate[] = useMemo(() => {
    return cities
      ? cities.map((city) => ({
          id: city.key,
          name: locale === "ar" ? city.cityAr : city.city,
          icon: locale === "ar" ? city.cityAr : city.city,
        }))
      : [];
  }, [cities, locale]);

  // Initialize selected city from URL params
  useEffect(() => {
    if (cityOptions.length > 0) {
      const cityParam = searchParams.get("city");
      if (cityParam) {
        const city = cityOptions.find((c) => c.id === cityParam);
        if (city) {
          setSelectedCity(city);
        }
      }
    }
  }, [cityOptions, searchParams]);

  // Clear selected city when country changes
  useEffect(() => {
    setSelectedCity(undefined);
  }, [selectedCountry]);

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

    // Add price_to only if it's not 0
    if (priceRange[1] > 0) {
      filters.price_to = priceRange[1];
    }

    // Add period filters
    if (periods.isDaily) filters.isDaily = true;
    if (periods.isWeekly) filters.isWeekly = true;
    if (periods.isMonthly) filters.isMonthly = true;
    if (periods.isWeekdays) filters.isWeekdays = true;
    if (periods.isHolidays) filters.isHolidays = true;

    onSearch(filters);
  };

  const handleResetFilters = () => {
    setDate(null);
    setSelectedCity(undefined);
    setPriceRange([0, 0]);
    setPeriods({
      isDaily: false,
      isWeekly: false,
      isMonthly: false,
      isWeekdays: false,
      isHolidays: false,
    });
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
              containerClass="w-full rounded-lg px-4 py-[23px]"
              values={cityOptions}
              selected={selectedCity}
              setSelected={setSelectedCity}
              disabled={citiesLoading}
              placeholder={t("select-city")}
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
            <Typography variant="body-md" as="p" className="text-gray-600">
              {t("price")}
            </Typography>
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <Input
                  type="number"
                  min={PRICE_RANGE.min}
                  step={100}
                  value={priceRange[0] || ""}
                  onChange={(e) => {
                    const value = Math.max(PRICE_RANGE.min, Number(e.target.value) || 0);
                    setPriceRange([value, priceRange[1]]);
                  }}
                  placeholder={t("min")}
                  className={`h-12 ${locale === "ar" ? "text-right" : "text-left"}`}
                />
              </div>
              <span className="text-gray-400">-</span>
              <div className="flex-1">
                <Input
                  type="number"
                  min={PRICE_RANGE.min}
                  step={100}
                  value={priceRange[1] || ""}
                  onChange={(e) => {
                    const value = Math.max(0, Number(e.target.value) || 0);
                    setPriceRange([priceRange[0], value]);
                  }}
                  placeholder={t("max")}
                  className={`h-12 ${locale === "ar" ? "text-right" : "text-left"}`}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Period Filters */}
        <div className={`mt-4 flex flex-wrap gap-4 ${locale === "ar" ? "flex-row-reverse" : ""}`}>
          <div className="flex items-center gap-2">
            <Checkbox
              id="isDaily"
              checked={periods.isDaily}
              onCheckedChange={(checked) => handlePeriodChange("isDaily", !!checked)}
            />
            <label htmlFor="isDaily" className="text-sm text-gray-600 cursor-pointer">
              {t("periods.daily")}
            </label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="isWeekly"
              checked={periods.isWeekly}
              onCheckedChange={(checked) => handlePeriodChange("isWeekly", !!checked)}
            />
            <label htmlFor="isWeekly" className="text-sm text-gray-600 cursor-pointer">
              {t("periods.weekly")}
            </label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="isMonthly"
              checked={periods.isMonthly}
              onCheckedChange={(checked) => handlePeriodChange("isMonthly", !!checked)}
            />
            <label htmlFor="isMonthly" className="text-sm text-gray-600 cursor-pointer">
              {t("periods.monthly")}
            </label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="isWeekdays"
              checked={periods.isWeekdays}
              onCheckedChange={(checked) => handlePeriodChange("isWeekdays", !!checked)}
            />
            <label htmlFor="isWeekdays" className="text-sm text-gray-600 cursor-pointer">
              {t("periods.weekdays")}
            </label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="isHolidays"
              checked={periods.isHolidays}
              onCheckedChange={(checked) => handlePeriodChange("isHolidays", !!checked)}
            />
            <label htmlFor="isHolidays" className="text-sm text-gray-600 cursor-pointer">
              {t("periods.holidays")}
            </label>
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
