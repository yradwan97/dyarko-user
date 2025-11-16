"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Search, SlidersHorizontal } from "lucide-react";

import Typography from "@/components/shared/typography";
import CustomSelect from "@/components/shared/custom-select";
import Button from "@/components/shared/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Governorate } from "@/types/property";
import FilterSide from "./filter-side";
import { formatPrice } from "@/lib/utils/property-pricing";
import { useCurrency } from "@/hooks/use-currency";

interface FilterSectionProps {
  cities: Governorate[];
  selectedCity: Governorate | undefined;
  setSelectedCity: (city: Governorate) => void;
  citiesLoading: boolean;
  selectedSort: string;
  setSelectedSort: (sort: string) => void;
  onApplyAdvancedFilters: (filters: any) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  priceRange: [number, number];
  setPriceRange: (range: [number, number]) => void;
  offerType: string;
  categoryParam?: string;
  onApplyFilters: () => void;
}

const getSortOptions = (t: any) => [
  { id: "mostPopular", name: t("filters.most-popular") },
  { id: "nearest", name: t("filters.nearest") },
  { id: "bestOffer", name: t("filters.best-offer") },
  { id: "recentlyAdded", name: t("filters.recently-added") },
];

const PRICE_RANGES = {
  RENT: { min: 0, max: 1000000 },
  INSTALLMENT: { min: 0, max: 1000000 },
  CASH: { min: 0, max: 1000000 },
};

export default function FilterSection({
  cities,
  selectedCity,
  setSelectedCity,
  citiesLoading,
  selectedSort,
  setSelectedSort,
  onApplyAdvancedFilters,
  searchQuery,
  setSearchQuery,
  priceRange,
  setPriceRange,
  offerType,
  categoryParam,
  onApplyFilters,
}: FilterSectionProps) {
  const t = useTranslations("PropertySearch");
  const currency = useCurrency();
  const [isFilterSideOpen, setIsFilterSideOpen] = useState(false);
  const sortOptions = getSortOptions(t);

  const currentRange = PRICE_RANGES[offerType as keyof typeof PRICE_RANGES] || PRICE_RANGES.RENT;

  return (
    <>
      <div className="mb-6 space-y-4">
        {/* First Row: Search, City, and Sort on same line */}
        <div className="flex flex-col gap-4 md:flex-row md:items-end">
          {/* Search Input */}
          <div className="flex-1">
            <Typography variant="body-md" as="p" className="mb-2 text-gray-600">
              {t("search")}
            </Typography>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <Input
                type="text"
                placeholder={t("filters.search-placeholder")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9 pl-10"
              />
            </div>
          </div>

          {/* City Select */}
          <div className="flex-1">
            <Typography variant="body-md" as="p" className="mb-2 text-gray-600">
              {t("filters.location")}
            </Typography>
            <CustomSelect
              containerClass="w-full h-12 rounded-lg px-4"
              values={cities}
              selected={selectedCity}
              setSelected={setSelectedCity}
              disabled={citiesLoading}
            />
          </div>

          {/* Sort Dropdown */}
          <div className="flex-1">
            <Typography variant="body-md" as="p" className="mb-2 text-gray-600">
              {t("sort")}
            </Typography>
            <Select value={selectedSort} onValueChange={setSelectedSort}>
              <SelectTrigger className="h-12">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map((option) => (
                  <SelectItem key={option.id} value={option.id}>
                    {option.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Second Row: Price Range and Buttons */}
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:gap-6">
          {/* Price Range */}
          <div className="flex-1">
            <div className="mb-3 flex items-center justify-between">
              <Typography variant="body-md" as="p" className="text-gray-600">
                {t("filters.price-range")}
              </Typography>
              <Typography variant="body-sm" as="span" className="text-gray-500">
                {formatPrice(priceRange[0], currency)} - {formatPrice(priceRange[1], currency)}
              </Typography>
            </div>
            <Slider
              min={currentRange.min}
              max={currentRange.max}
              step={1000}
              value={priceRange}
              onValueChange={(value) => setPriceRange(value as [number, number])}
              className="mb-2"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>{formatPrice(currentRange.min, currency)}</span>
              <span>{formatPrice(currentRange.max, currency)}</span>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 md:flex-shrink-0">
            {/* Submit Button */}
            <Button
              variant="primary"
              onClick={onApplyFilters}
              className="flex-1 md:flex-initial flex items-center justify-center gap-2 px-6 md:h-12"
            >
              <Search className="h-4 w-4" />
              <span>{t("filters.search-button")}</span>
            </Button>

            {/* More Filters Button */}
            <Button
              variant="primary-outline"
              onClick={() => setIsFilterSideOpen(true)}
              className="flex-1 md:flex-initial flex items-center justify-center gap-2 !p-3 md:h-12"
            >
              <SlidersHorizontal className="h-4 w-4" />
              <span className="hidden md:inline">{t("filters.more-filters")}</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Filter Sidebar */}
      <FilterSide
        isOpen={isFilterSideOpen}
        onClose={() => setIsFilterSideOpen(false)}
        onApplyFilters={onApplyAdvancedFilters}
        currentSort={selectedSort}
        onSortChange={setSelectedSort}
        initialCity={selectedCity?.id}
        initialSearch={searchQuery}
        initialPriceRange={priceRange}
        initialOfferType={offerType}
        initialCategory={categoryParam || ""}
      />
    </>
  );
}
