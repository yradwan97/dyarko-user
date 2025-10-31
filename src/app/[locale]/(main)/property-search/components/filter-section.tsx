"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { SlidersHorizontal } from "lucide-react";

import Typography from "@/components/shared/typography";
import CustomSelect from "@/components/shared/custom-select";
import Button from "@/components/shared/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Governorate } from "@/types/property";
import FilterSide from "./filter-side";

interface FilterSectionProps {
  cities: Governorate[];
  selectedCity: Governorate | undefined;
  setSelectedCity: (city: Governorate) => void;
  citiesLoading: boolean;
  selectedSort: string;
  setSelectedSort: (sort: string) => void;
  onApplyAdvancedFilters: (filters: any) => void;
}

const SORT_OPTIONS = [
  { id: "mostPopular", name: "Most Popular" },
  { id: "nearest", name: "Nearest" },
  { id: "bestOffer", name: "Best Offer" },
  { id: "recentlyAdded", name: "Recently Added" },
];

export default function FilterSection({
  cities,
  selectedCity,
  setSelectedCity,
  citiesLoading,
  selectedSort,
  setSelectedSort,
  onApplyAdvancedFilters,
}: FilterSectionProps) {
  const t = useTranslations("PropertySearch");
  const [isFilterSideOpen, setIsFilterSideOpen] = useState(false);

  return (
    <>
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end">
        {/* City Select */}
        <div className="flex-1">
          <Typography variant="body-md" as="p" className="mb-2 text-gray-600">
            {t("filters.location")}
          </Typography>
          <CustomSelect
            containerClass="w-full rounded-lg px-4"
            values={cities}
            selected={selectedCity}
            setSelected={setSelectedCity}
            disabled={citiesLoading}
          />
        </div>

        {/* Sort Dropdown */}
        <div className="flex-1">
          <Typography variant="body-md" as="p" className="mb-2 text-gray-600">
            Sort By
          </Typography>
          <Select value={selectedSort} onValueChange={setSelectedSort}>
            <SelectTrigger className="h-12">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((option) => (
                <SelectItem key={option.id} value={option.id}>
                  {option.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* More Filters Button */}
        <Button
          variant="primary-outline"
          onClick={() => setIsFilterSideOpen(true)}
          className="flex items-center gap-2 !p-3 md:h-12"
        >
          <SlidersHorizontal className="h-4 w-4" />
          <span className="hidden md:inline">{t("filters.more-filters")}</span>
        </Button>
      </div>

      {/* Filter Sidebar */}
      <FilterSide
        isOpen={isFilterSideOpen}
        onClose={() => setIsFilterSideOpen(false)}
        onApplyFilters={onApplyAdvancedFilters}
        currentSort={selectedSort}
        onSortChange={setSelectedSort}
      />
    </>
  );
}
