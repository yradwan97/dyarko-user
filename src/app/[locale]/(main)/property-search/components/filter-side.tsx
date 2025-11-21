"use client";

import { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

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
import { getCategories, type Category } from "@/lib/services/api/categories";
import { Badge } from "@/components/ui/badge";

interface FilterSideProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyFilters: (filters: any) => void;
  currentSort?: string;
  onSortChange?: (sort: string) => void;
  initialCity?: string;
  initialSearch?: string;
  initialPriceRange?: [number, number];
  initialOfferType?: string;
  initialCategory?: string;
}

type OfferType = "RENT" | "INSTALLMENT" | "CASH";

const PRICE_RANGES = {
  RENT: { min: 0, max: 1000000 },
  INSTALLMENT: { min: 0, max: 1000000 },
  CASH: { min: 0, max: 1000000 },
};

const getSortOptions = (t: any) => [
  { id: "mostPopular", name: t("most-popular") },
  { id: "nearest", name: t("nearest") },
  { id: "bestOffer", name: t("best-offer") },
  { id: "recentlyAdded", name: t("recently-added") },
];

export default function FilterSide({
  isOpen,
  onClose,
  onApplyFilters,
  currentSort = "recentlyAdded",
  onSortChange,
  initialCity,
  initialSearch = "",
  initialPriceRange = [0, 1000000],
  initialOfferType = "RENT",
  initialCategory = "",
}: FilterSideProps) {
  const t = useTranslations("PropertySearch.filters");
  const tGeneral = useTranslations("General.Categories");
  const locale = useLocale();
  const currency = useCurrency();
  const { selectedCountry } = useCountryContext();
  const { data: cities, isLoading: citiesLoading } = useCities(selectedCountry);
  const sortOptions = getSortOptions(t);

  // Fetch categories
  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
  });

  // Filter states
  const [offerType, setOfferType] = useState<OfferType>(initialOfferType as OfferType);
  const [priceRange, setPriceRange] = useState(initialPriceRange);
  const [selectedSort, setSelectedSort] = useState(currentSort);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedCity, setSelectedCity] = useState(initialCity || "");
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);

  // Track if this is the first time opening the sidebar
  const [hasInitialized, setHasInitialized] = useState(false);

  // Sync with parent's sort when it changes
  useEffect(() => {
    setSelectedSort(currentSort);
  }, [currentSort]);

  // Initialize filters only once when sidebar first opens
  useEffect(() => {
    if (isOpen && !hasInitialized) {
      if (initialCity) setSelectedCity(initialCity);
      if (initialSearch !== undefined) setSearchQuery(initialSearch);
      if (initialPriceRange) setPriceRange(initialPriceRange);
      if (initialOfferType) setOfferType(initialOfferType as OfferType);
      if (initialCategory !== undefined) setSelectedCategory(initialCategory);
      setHasInitialized(true);
    }
  }, [isOpen, hasInitialized, initialCity, initialSearch, initialPriceRange, initialOfferType, initialCategory]);
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
        name: locale === "ar" ? city.cityAr : city.city,
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
    // Reset all filters: offerType to RENT, remove city, clear everything else
    const resetFilters: any = {
      offerType: "RENT",
      priceFrom: 0,
      priceTo: 1000000,
      search: "",
      city: "", // Remove city
    };

    // Reset local state
    setOfferType("RENT");
    setPriceRange([0, 1000000]);
    setSelectedSort("recentlyAdded");
    setSearchQuery("");
    setSelectedCity("");
    setSelectedCategory("");
    setBedrooms("");
    setBathrooms("");
    setIsDaily(false);
    setIsWeekly(false);
    setIsMonthly(false);
    setIsWeekdays(false);
    setIsHolidays(false);

    // Notify parent
    onApplyFilters(resetFilters);

    // Update parent's sort state
    if (onSortChange) {
      onSortChange("recentlyAdded");
    }
  };

  const handleApply = () => {
    const filters: any = {
      offerType,
      priceFrom: priceRange[0],
      priceTo: priceRange[1],
    };

    // Add sort only if it's not "recentlyAdded"
    if (selectedSort !== "recentlyAdded") {
      filters.sort = selectedSort;
    }

    // Update parent's sort state
    if (onSortChange) {
      onSortChange(selectedSort);
    }

    // Add search (always send it, even if empty, to clear it)
    filters.search = searchQuery.trim();

    // Add city if selected
    if (selectedCity) {
      filters.city = selectedCity;
    }

    // Add category if selected
    if (selectedCategory) {
      filters.category = selectedCategory;
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
                {t("search-label")}
              </Typography>
              <Input
                type="text"
                placeholder={t("search-placeholder")}
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
                <div className="flex flex-row rtl:flex-row-reverse items-center gap-3 rounded-lg border border-gray-300 p-4 transition-colors hover:border-main-400 focus-within:border-main-400 focus-within:ring-1 focus-within:ring-main-400 dark:border-gray-600">
                  <RadioGroupItem value="RENT" id="rent" />
                  <Label htmlFor="rent" className="cursor-pointer font-medium">
                    {t("rent")}
                  </Label>
                </div>
                <div className="mt-3 flex flex-row rtl:flex-row-reverse items-center gap-3 rounded-lg border border-gray-300 p-4 transition-colors hover:border-main-400 focus-within:border-main-400 focus-within:ring-1 focus-within:ring-main-400 dark:border-gray-600">
                  <RadioGroupItem value="INSTALLMENT" id="installment" />
                  <Label htmlFor="installment" className="cursor-pointer font-medium">
                    {t("installment")}
                  </Label>
                </div>
                <div className="mt-3 flex flex-row rtl:flex-row-reverse items-center gap-3 rounded-lg border border-gray-300 p-4 transition-colors hover:border-main-400 focus-within:border-main-400 focus-within:ring-1 focus-within:ring-main-400 dark:border-gray-600">
                  <RadioGroupItem value="CASH" id="cash" />
                  <Label htmlFor="cash" className="cursor-pointer font-medium">
                    {t("cash")}
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Sort By */}
            <div className="px-1">
              <Typography variant="body-md-bold" as="p" className="mb-3 block">
                {t("sort-by")}
              </Typography>
              <Select value={selectedSort} onValueChange={setSelectedSort}>
                <SelectTrigger className="h-11">
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

            {/* City */}
            <div className="px-1">
              <Typography variant="body-md-bold" as="p" className="mb-3 block">
                {t("city-label")}
              </Typography>
              <Select value={selectedCity} onValueChange={setSelectedCity}>
                <SelectTrigger className="h-11">
                  <SelectValue placeholder={t("city-placeholder")} />
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

            {/* Categories */}
            <div className="px-1">
              <Typography variant="body-md-bold" as="p" className="mb-3 block">
                {t("categories")}
              </Typography>
              <div className="flex flex-wrap gap-2">
                {categories?.map((category) => (
                  <Badge
                    key={category.key}
                    variant={selectedCategory === category.key ? "default" : "outline"}
                    className={`cursor-pointer transition-colors ${
                      selectedCategory === category.key
                        ? "bg-main-500 text-white hover:bg-main-600"
                        : "hover:bg-gray-100 dark:hover:bg-gray-800"
                    }`}
                    onClick={() =>
                      setSelectedCategory(selectedCategory === category.key ? "" : category.key)
                    }
                  >
                    {tGeneral(category.key)}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Bedrooms & Bathrooms */}
            <div className="grid grid-cols-2 gap-4 px-1">
              <div>
                <Typography variant="body-md-bold" as="p" className="mb-3 block">
                  {t("bedrooms")}
                </Typography>
                <Input
                  type="number"
                  min="0"
                  placeholder={t("any-placeholder")}
                  value={bedrooms}
                  onChange={(e) => setBedrooms(e.target.value)}
                  className="h-11"
                />
              </div>
              <div>
                <Typography variant="body-md-bold" as="p" className="mb-3 block">
                  {t("bathrooms")}
                </Typography>
                <Input
                  type="number"
                  min="0"
                  placeholder={t("any-placeholder")}
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
                onValueChange={(value) => setPriceRange(value as [number, number])}
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
                {t("availability")}
              </Typography>
              <div className="space-y-4">
                <div className="flex flex-row rtl:flex-row-reverse items-center gap-3 rounded-lg border border-gray-200 p-3 dark:border-gray-700">
                  <Checkbox id="daily" checked={isDaily} onCheckedChange={(checked) => setIsDaily(checked as boolean)} />
                  <Label htmlFor="daily" className="cursor-pointer font-medium">
                    {t("daily")}
                  </Label>
                </div>
                <div className="flex flex-row rtl:flex-row-reverse items-center gap-3 rounded-lg border border-gray-200 p-3 dark:border-gray-700">
                  <Checkbox id="weekly" checked={isWeekly} onCheckedChange={(checked) => setIsWeekly(checked as boolean)} />
                  <Label htmlFor="weekly" className="cursor-pointer font-medium">
                    {t("weekly")}
                  </Label>
                </div>
                <div className="flex flex-row rtl:flex-row-reverse items-center gap-3 rounded-lg border border-gray-200 p-3 dark:border-gray-700">
                  <Checkbox id="monthly" checked={isMonthly} onCheckedChange={(checked) => setIsMonthly(checked as boolean)} />
                  <Label htmlFor="monthly" className="cursor-pointer font-medium">
                    {t("monthly")}
                  </Label>
                </div>
                <div className="flex flex-row rtl:flex-row-reverse items-center gap-3 rounded-lg border border-gray-200 p-3 dark:border-gray-700">
                  <Checkbox id="weekdays" checked={isWeekdays} onCheckedChange={(checked) => setIsWeekdays(checked as boolean)} />
                  <Label htmlFor="weekdays" className="cursor-pointer font-medium">
                    {t("weekdays")}
                  </Label>
                </div>
                <div className="flex flex-row rtl:flex-row-reverse items-center gap-3 rounded-lg border border-gray-200 p-3 dark:border-gray-700">
                  <Checkbox id="holidays" checked={isHolidays} onCheckedChange={(checked) => setIsHolidays(checked as boolean)} />
                  <Label htmlFor="holidays" className="cursor-pointer font-medium">
                    {t("holidays")}
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
