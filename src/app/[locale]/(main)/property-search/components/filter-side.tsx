"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { X } from "lucide-react";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Typography from "@/components/shared/typography";
import Button from "@/components/shared/button";
import { formatPrice } from "@/lib/utils/property-pricing";
import { useCurrency } from "@/hooks/use-currency";
import { useCities } from "@/hooks/use-cities";
import { useCountryContext } from "@/components/providers/country-provider";
import type { Governorate } from "@/types/property";

interface FilterSideProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyFilters: (filters: any) => void;
  currentSort?: string;
  onSortChange?: (sort: string) => void;
}

type OfferType = "RENT" | "INSTALLMENT" | "CASH";

const PRICE_RANGES = {
  RENT: { min: 0, max: 1000000 },
  INSTALLMENT: { min: 0, max: 1000000 },
  CASH: { min: 0, max: 1000000 },
};

const SORT_OPTIONS = [
  { id: "mostPopular", name: "Most Popular" },
  { id: "nearest", name: "Nearest" },
  { id: "bestOffer", name: "Best Offer" },
  { id: "recentlyAdded", name: "Recently Added" },
];

export default function FilterSide({ isOpen, onClose, onApplyFilters, currentSort = "recentlyAdded", onSortChange }: FilterSideProps) {
  const t = useTranslations("PropertySearch.filters");
  const currency = useCurrency();
  const { selectedCountry } = useCountryContext();
  const { data: cities, isLoading: citiesLoading } = useCities(selectedCountry);

  // Filter states
  const [offerType, setOfferType] = useState<OfferType>("RENT");
  const [priceRange, setPriceRange] = useState([0, 1000000]);
  const [selectedSort, setSelectedSort] = useState(currentSort);

  // Sync with parent's sort when it changes
  useEffect(() => {
    setSelectedSort(currentSort);
  }, [currentSort]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [bedrooms, setBedrooms] = useState("");
  const [bathrooms, setBathrooms] = useState("");

  // Time-based checkboxes
  const [isDaily, setIsDaily] = useState(false);
  const [isWeekly, setIsWeekly] = useState(false);
  const [isMonthly, setIsMonthly] = useState(false);
  const [isWeekdays, setIsWeekdays] = useState(false);
  const [isHolidays, setIsHolidays] = useState(false);

  // Convert cities to options
  const cityOptions = cities
    ? cities.map((city) => ({
        id: city.key,
        name: city.city,
      }))
    : [];

  // Update price range when offer type changes
  useEffect(() => {
    const range = PRICE_RANGES[offerType];
    setPriceRange([range.min, range.max]);
  }, [offerType]);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      // Search query is already stored, will be used in handleApply
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleReset = () => {
    setOfferType("RENT");
    setPriceRange([0, 1000000]);
    setSelectedSort(SORT_OPTIONS[0].id);
    setSearchQuery("");
    setSelectedCity("");
    setBedrooms("");
    setBathrooms("");
    setIsDaily(false);
    setIsWeekly(false);
    setIsMonthly(false);
    setIsWeekdays(false);
    setIsHolidays(false);
  };

  const handleApply = () => {
    const filters: any = {
      offerType,
    };

    // Add priceFrom only if it's not 0
    if (priceRange[0] > 0) {
      filters.priceFrom = priceRange[0];
    }

    if (priceRange[1] < 1000000) {
      filters.priceTo = priceRange[1];
    }

    // Add sort only if it's not "recentlyAdded"
    if (selectedSort !== "recentlyAdded") {
      filters.sort = selectedSort;
    }

    // Update parent's sort state
    if (onSortChange) {
      onSortChange(selectedSort);
    }

    // Add search if provided
    if (searchQuery.trim()) {
      filters.search = searchQuery.trim();
    }

    // Add city if selected
    if (selectedCity) {
      filters.city = selectedCity;
    }

    // Add bedrooms/bathrooms if provided
    if (bedrooms) {
      filters.bedrooms = bedrooms;
    }
    if (bathrooms) {
      filters.bathrooms = bathrooms;
    }

    // Add time-based filters only if checked
    if (isDaily) filters.isDaily = true;
    if (isWeekly) filters.isWeekly = true;
    if (isMonthly) filters.isMonthly = true;
    if (isWeekdays) filters.isWeekdays = true;
    if (isHolidays) filters.isHolidays = true;

    onApplyFilters(filters);
    onClose();
  };

  const currentRange = PRICE_RANGES[offerType];

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-md p-0 border-0 bg-white shadow-xl dark:bg-gray-900"
        overlayClassName="backdrop-blur-sm bg-black/60 dark:bg-black/80"
      >
        <div className="flex h-full flex-col p-6">
          <SheetHeader className="border-b border-gray-200 pb-4 dark:border-gray-700">
            <SheetTitle className="text-left text-lg font-semibold">
              {t("advanced-title")}
            </SheetTitle>
            <SheetDescription className="text-left text-sm text-gray-500">
              {t("advanced-description")}
            </SheetDescription>
          </SheetHeader>

          <div className="mt-6 flex-1 space-y-8 overflow-y-auto pr-2">
            {/* Search Field */}
            <div className="px-1">
              <Typography variant="body-md-bold" as="p" className="mb-3 block">
                Search
              </Typography>
              <Input
                type="text"
                placeholder="Search properties..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-11"
              />
            </div>

            {/* Offer Type */}
            <div className="px-1">
              <Typography variant="body-md-bold" as="p" className="mb-4 block">
                {t("offer-type")}
              </Typography>
              <RadioGroup value={offerType} onValueChange={(value) => setOfferType(value as OfferType)}>
                <div className="flex items-center space-x-3 rounded-lg border border-gray-300 p-4 transition-colors hover:border-main-400 focus-within:border-main-400 focus-within:ring-1 focus-within:ring-main-400 dark:border-gray-600">
                  <RadioGroupItem value="RENT" id="rent" />
                  <Label htmlFor="rent" className="flex-1 cursor-pointer font-medium">
                    {t("rent")}
                  </Label>
                </div>
                <div className="mt-3 flex items-center space-x-3 rounded-lg border border-gray-300 p-4 transition-colors hover:border-main-400 focus-within:border-main-400 focus-within:ring-1 focus-within:ring-main-400 dark:border-gray-600">
                  <RadioGroupItem value="INSTALLMENT" id="installment" />
                  <Label htmlFor="installment" className="flex-1 cursor-pointer font-medium">
                    {t("installment")}
                  </Label>
                </div>
                <div className="mt-3 flex items-center space-x-3 rounded-lg border border-gray-300 p-4 transition-colors hover:border-main-400 focus-within:border-main-400 focus-within:ring-1 focus-within:ring-main-400 dark:border-gray-600">
                  <RadioGroupItem value="CASH" id="cash" />
                  <Label htmlFor="cash" className="flex-1 cursor-pointer font-medium">
                    Cash
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Sort By */}
            <div className="px-1">
              <Typography variant="body-md-bold" as="p" className="mb-3 block">
                Sort By
              </Typography>
              <Select value={selectedSort} onValueChange={setSelectedSort}>
                <SelectTrigger className="h-11">
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

            {/* City */}
            <div className="px-1">
              <Typography variant="body-md-bold" as="p" className="mb-3 block">
                City
              </Typography>
              <Select value={selectedCity} onValueChange={setSelectedCity}>
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Select city..." />
                </SelectTrigger>
                <SelectContent>
                  {cityOptions.map((city) => (
                    <SelectItem key={city.id} value={city.id}>
                      {city.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Bedrooms & Bathrooms */}
            <div className="grid grid-cols-2 gap-4 px-1">
              <div>
                <Typography variant="body-md-bold" as="p" className="mb-3 block">
                  Bedrooms
                </Typography>
                <Input
                  type="number"
                  min="0"
                  placeholder="Any"
                  value={bedrooms}
                  onChange={(e) => setBedrooms(e.target.value)}
                  className="h-11"
                />
              </div>
              <div>
                <Typography variant="body-md-bold" as="p" className="mb-3 block">
                  Bathrooms
                </Typography>
                <Input
                  type="number"
                  min="0"
                  placeholder="Any"
                  value={bathrooms}
                  onChange={(e) => setBathrooms(e.target.value)}
                  className="h-11"
                />
              </div>
            </div>

            {/* Price Range */}
            <div className="px-1">
              <div className="mb-5 flex items-center justify-between">
                <Typography variant="body-md-bold" as="p">
                  {t("price-range")}
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
                onValueChange={setPriceRange}
                className="mt-6"
              />
              <div className="mt-3 flex justify-between text-xs text-gray-500">
                <span>{formatPrice(currentRange.min, currency)}</span>
                <span>{formatPrice(currentRange.max, currency)}</span>
              </div>
            </div>

            {/* Availability */}
            <div className="px-1 pb-4">
              <Typography variant="body-md-bold" as="p" className="mb-4 block">
                Availability
              </Typography>
              <div className="space-y-4">
                <div className="flex items-center space-x-3 rounded-lg border border-gray-200 p-3 dark:border-gray-700">
                  <Checkbox id="daily" checked={isDaily} onCheckedChange={(checked) => setIsDaily(checked as boolean)} />
                  <Label htmlFor="daily" className="flex-1 cursor-pointer font-medium">
                    Daily
                  </Label>
                </div>
                <div className="flex items-center space-x-3 rounded-lg border border-gray-200 p-3 dark:border-gray-700">
                  <Checkbox id="weekly" checked={isWeekly} onCheckedChange={(checked) => setIsWeekly(checked as boolean)} />
                  <Label htmlFor="weekly" className="flex-1 cursor-pointer font-medium">
                    Weekly
                  </Label>
                </div>
                <div className="flex items-center space-x-3 rounded-lg border border-gray-200 p-3 dark:border-gray-700">
                  <Checkbox id="monthly" checked={isMonthly} onCheckedChange={(checked) => setIsMonthly(checked as boolean)} />
                  <Label htmlFor="monthly" className="flex-1 cursor-pointer font-medium">
                    Monthly
                  </Label>
                </div>
                <div className="flex items-center space-x-3 rounded-lg border border-gray-200 p-3 dark:border-gray-700">
                  <Checkbox id="weekdays" checked={isWeekdays} onCheckedChange={(checked) => setIsWeekdays(checked as boolean)} />
                  <Label htmlFor="weekdays" className="flex-1 cursor-pointer font-medium">
                    Weekdays
                  </Label>
                </div>
                <div className="flex items-center space-x-3 rounded-lg border border-gray-200 p-3 dark:border-gray-700">
                  <Checkbox id="holidays" checked={isHolidays} onCheckedChange={(checked) => setIsHolidays(checked as boolean)} />
                  <Label htmlFor="holidays" className="flex-1 cursor-pointer font-medium">
                    Holidays
                  </Label>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 border-t border-gray-200 pt-6 dark:border-gray-700">
            <Button variant="primary-outline" onClick={handleReset} className="flex-1 py-3">
              {t("reset")}
            </Button>
            <Button variant="primary" onClick={handleApply} className="flex-1 py-3">
              {t("apply")}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
