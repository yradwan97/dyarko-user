"use client";

import { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useQuery } from "@tanstack/react-query";
import { X } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import Button from "@/components/shared/button";
import Typography from "@/components/shared/typography";
import { getCategories } from "@/lib/services/api/categories";
import { getCountries } from "@/lib/services/api/places";
import { usePropertyClasses } from "@/hooks/use-property-classes";
import { useCities } from "@/hooks/use-cities";
import { useCountryContext } from "@/components/providers/country-provider";
import { cn } from "@/lib/utils";

export interface PropertyFilters {
  offerType?: string;
  category?: string;
  class?: string;
  country?: string;
  city?: string;
  rentType?: string;
  priceFrom?: number;
  priceTo?: number;
  bedrooms?: string;
  isDaily?: boolean
  isWeekly?: boolean
  isMonthly?: boolean
  isWeekdays?: boolean
  isHolidays?: boolean
}

interface PropertyFiltersModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyFilters: (filters: PropertyFilters) => void;
  initialFilters?: PropertyFilters;
}

const OFFER_TYPES = ["rent", "cash", "installment", "replacement", "shared"] as const;
const RENT_TYPES = ["daily", "weekly", "monthly", "weekdays", "holidays"] as const;
const ROOM_OPTIONS = ["any", "1", "2", "3", "4", "5", "max"] as const;

export default function PropertyFiltersModal({
  isOpen,
  onClose,
  onApplyFilters,
  initialFilters = {},
}: PropertyFiltersModalProps) {
  const t = useTranslations("General");
  const tPayment = useTranslations("General.PaymentMethods");
  const tFilters = useTranslations("Companies.Filters");
  const locale = useLocale();
  const { selectedCountry: providerCountry } = useCountryContext();

  const [selectedOfferType, setSelectedOfferType] = useState<string>(initialFilters.offerType || "rent");
  const [selectedCategory, setSelectedCategory] = useState<string>(initialFilters.category || "");
  const [selectedClass, setSelectedClass] = useState<string>(initialFilters.class || "");
  const [selectedCountry, setSelectedCountry] = useState<string>(initialFilters.country || providerCountry || "KW");
  const [selectedCity, setSelectedCity] = useState<string>(initialFilters.city || "");
  const [selectedRentType, setSelectedRentType] = useState<string | undefined>(initialFilters.rentType);
  const [priceFrom, setPriceFrom] = useState<string>(initialFilters.priceFrom?.toString() || "");
  const [priceTo, setPriceTo] = useState<string>(initialFilters.priceTo?.toString() || "");
  const [selectedRooms, setSelectedRooms] = useState<string>(initialFilters.bedrooms || "any");

  // Fetch categories
  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
    staleTime: 1000 * 60 * 60, // Cache for 1 hour
  });

  // Fetch countries
  const { data: countries } = useQuery({
    queryKey: ["countries"],
    queryFn: getCountries,
    staleTime: 1000 * 60 * 60, // Cache for 1 hour
  });

  // Fetch cities based on selected country
  const { data: cities } = useCities(selectedCountry);

  // Fetch classes based on selected category
  const { data: classes } = usePropertyClasses(selectedCategory);

  // Reset class when category changes
  useEffect(() => {
    if (selectedCategory !== initialFilters.category) {
      setSelectedClass("");
    }
  }, [selectedCategory, initialFilters.category]);

  // Reset city when country changes
  useEffect(() => {
    if (selectedCountry !== initialFilters.country) {
      setSelectedCity("");
    }
  }, [selectedCountry, initialFilters.country]);

  // Initialize filters when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedOfferType(initialFilters.offerType || "rent");
      setSelectedCategory(initialFilters.category || "");
      setSelectedClass(initialFilters.class || "");
      setSelectedCountry(initialFilters.country || providerCountry || "KW");
      setSelectedCity(initialFilters.city || "");
      setSelectedRentType(initialFilters.rentType || "");
      setPriceFrom(initialFilters.priceFrom?.toString() || "");
      setPriceTo(initialFilters.priceTo?.toString() || "");
      setSelectedRooms(initialFilters.bedrooms || "any");
    }
  }, [isOpen, initialFilters, providerCountry]);

  const handleReset = () => {
    setSelectedOfferType("");
    setSelectedCategory("");
    setSelectedClass("");
    setSelectedCountry("");
    setSelectedCity("");
    setSelectedRentType("");
    setPriceFrom("");
    setPriceTo("");
    setSelectedRooms("");
    // Apply empty filters immediately
    onApplyFilters({});
    onClose();
  };

  const handleApply = () => {
    const filters: PropertyFilters = {};

    if (selectedOfferType) {
      // Map UI values to API values
      const offerTypeMap: Record<string, string> = {
        rent: "RENT",
        cash: "CASH",
        installment: "INSTALLMENT",
        replacement: "REPLACEMENT",
        shared: "SHARE",
      };
      filters.offerType = offerTypeMap[selectedOfferType] || selectedOfferType.toUpperCase();
    }

    if (selectedCategory) {
      filters.category = selectedCategory;
    }

    if (selectedClass) {
      filters.class = selectedClass;
    }

    if (selectedCountry) {
      filters.country = selectedCountry;
    }

    if (selectedCity) {
      filters.city = selectedCity;
    }

    if (selectedRentType) {
      filters.rentType = selectedRentType;
    }

    if (priceFrom) {
      filters.priceFrom = parseFloat(priceFrom);
    }

    if (priceTo) {
      filters.priceTo = parseFloat(priceTo);
    }

    if (selectedRooms && selectedRooms !== "any") {
      filters.bedrooms = selectedRooms === "max" ? "5" : selectedRooms;
    }

    onApplyFilters(filters);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
        <DialogHeader className="flex flex-row items-center justify-between">
          <button
            onClick={onClose}
            className="rounded-full p-1 hover:bg-gray-100"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
          <DialogTitle className="flex-1 text-center text-lg font-semibold">
            {t("filters")}
          </DialogTitle>
          <div className="w-6" /> {/* Spacer for centering */}
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Offer Type */}
          <div>
            <Typography variant="body-md-bold" as="p" className="mb-3">
              {tFilters("offer-type")}
            </Typography>
            <div className="flex flex-wrap gap-2">
              {OFFER_TYPES.map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedOfferType(type)}
                  className={cn(
                    "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                    selectedOfferType === type
                      ? "bg-main-600 text-white"
                      : "border border-gray-300 bg-white text-gray-700 hover:border-main-500"
                  )}
                >
                  {tPayment(type)}
                </button>
              ))}
            </div>
          </div>

          {/* Category */}
          <div>
            <Typography variant="body-md-bold" as="p" className="mb-3">
              {tFilters("category")}
            </Typography>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder={tFilters("select-category")} />
              </SelectTrigger>
              <SelectContent>
                {categories && categories.length > 0 ? (
                  categories.map((category) => (
                    <SelectItem key={category._id} value={category.key}>
                      {category.name}
                    </SelectItem>
                  ))
                ) : (
                  <div className="px-2 py-2 text-sm text-gray-500">
                    {tFilters("no-categories")}
                  </div>
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Property Class */}
          <div>
            <Typography variant="body-md-bold" as="p" className="mb-3">
              {tFilters("property-class")}
            </Typography>
            <Select
              value={selectedClass}
              onValueChange={setSelectedClass}
              disabled={!selectedCategory}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder={!selectedCategory ? tFilters("select-category-first") : tFilters("select-class")} />
              </SelectTrigger>
              <SelectContent>
                {classes && classes.length > 0 ? (
                  classes.map((classItem) => (
                    <SelectItem key={classItem._id} value={classItem.key}>
                      {classItem.name}
                    </SelectItem>
                  ))
                ) : (
                  <div className="px-2 py-2 text-sm text-gray-500">
                    {tFilters("no-classes")}
                  </div>
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Country */}
          <div>
            <Typography variant="body-md-bold" as="p" className="mb-3">
              {tFilters("country")}
            </Typography>
            <Select value={selectedCountry} onValueChange={setSelectedCountry}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder={tFilters("select-country")} />
              </SelectTrigger>
              <SelectContent>
                {countries && countries.length > 0 ? (
                  countries.map((country) => (
                    <SelectItem key={country.code} value={country.code}>
                      {locale === "ar" ? country.countryAr : country.countryEn}
                    </SelectItem>
                  ))
                ) : (
                  <div className="px-2 py-2 text-sm text-gray-500">
                    {tFilters("no-countries")}
                  </div>
                )}
              </SelectContent>
            </Select>
          </div>

          {/* City */}
          <div>
            <Typography variant="body-md-bold" as="p" className="mb-3">
              {tFilters("city")}
            </Typography>
            <Select
              value={selectedCity}
              onValueChange={setSelectedCity}
              disabled={!selectedCountry}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder={!selectedCountry ? tFilters("select-country-first") : tFilters("select-city")} />
              </SelectTrigger>
              <SelectContent>
                {cities && cities.length > 0 ? (
                  cities.map((city) => (
                    <SelectItem key={city.key} value={city.key}>
                      {locale === "ar" ? city.cityAr : city.city}
                    </SelectItem>
                  ))
                ) : (
                  <div className="px-2 py-2 text-sm text-gray-500">
                    {tFilters("no-cities")}
                  </div>
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Price Range */}
          <div>
            <Typography variant="body-md-bold" as="p" className="mb-3">
              {tFilters("price")}
            </Typography>
            {/* Rent Type Selector */}
            <div className="mb-3 flex flex-wrap gap-2">
              {RENT_TYPES.map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedRentType(type)}
                  className={cn(
                    "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                    selectedRentType === type
                      ? "bg-main-600 text-white"
                      : "border border-gray-300 bg-white text-gray-700 hover:border-main-500"
                  )}
                >
                  {tFilters(`rent-type.${type}`)}
                </button>
              ))}
            </div>
            {/* Price Inputs */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Input
                  type="number"
                  placeholder={tFilters("from")}
                  value={priceFrom}
                  onChange={(e) => setPriceFrom(e.target.value)}
                  className="pr-12"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                  {t("kwd")}
                </span>
              </div>
              <div className="relative flex-1">
                <Input
                  type="number"
                  placeholder={tFilters("to")}
                  value={priceTo}
                  onChange={(e) => setPriceTo(e.target.value)}
                  className="pr-12"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                  {t("kwd")}
                </span>
              </div>
            </div>
          </div>

          {/* Rooms */}
          <div>
            <Typography variant="body-md-bold" as="p" className="mb-3">
              {tFilters("rooms")}
            </Typography>
            <div className="flex flex-wrap gap-2">
              {ROOM_OPTIONS.map((room) => (
                <button
                  key={room}
                  onClick={() => setSelectedRooms(room)}
                  className={cn(
                    "min-w-[44px] rounded-full px-3 py-2 text-sm font-medium transition-colors",
                    selectedRooms === room
                      ? "bg-main-600 text-white"
                      : "border border-gray-300 bg-white text-gray-700 hover:border-main-500"
                  )}
                >
                  {room}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 border-t border-gray-200 pt-4">
          <Button variant="primary-outline" onClick={handleReset} className="flex-1">
            {tFilters("clear-all")}
          </Button>
          <Button variant="primary" onClick={handleApply} className="flex-1">
            {t("apply")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
