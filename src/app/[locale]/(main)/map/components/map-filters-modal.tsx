"use client";

import { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { Badge } from "@/components/ui/badge";
import Button from "@/components/shared/button";
import Typography from "@/components/shared/typography";
import { getCategories } from "@/lib/services/api/categories";
import { usePropertyClasses } from "@/hooks/use-property-classes";
import { useCities } from "@/hooks/use-cities";
import { useCountryContext } from "@/components/providers/country-provider";

interface MapFiltersModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyFilters: (filters: { category?: string; class?: string; city?: string }) => void;
  initialCategory?: string;
  initialClass?: string;
  initialCity?: string;
}

export default function MapFiltersModal({
  isOpen,
  onClose,
  onApplyFilters,
  initialCategory = "",
  initialClass = "",
  initialCity = "",
}: MapFiltersModalProps) {
  const t = useTranslations("General.Categories");
  const tGeneral = useTranslations("General");
  const tMap = useTranslations("Map");
  const locale = useLocale();
  const { selectedCountry } = useCountryContext();
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [selectedClass, setSelectedClass] = useState<string>(initialClass);
  const [selectedCity, setSelectedCity] = useState<string>(initialCity);

  // Fetch categories
  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
  });

  // Fetch cities based on selected country
  const { data: cities, isLoading: citiesLoading } = useCities(selectedCountry);

  // Fetch classes based on selected category
  const { data: classes, isLoading: classesLoading } = usePropertyClasses(selectedCategory);

  // Reset class when category changes
  useEffect(() => {
    if (selectedCategory !== initialCategory) {
      setSelectedClass("");
    }
  }, [selectedCategory, initialCategory]);

  // Initialize filters when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedCategory(initialCategory);
      setSelectedClass(initialClass);
      setSelectedCity(initialCity);
    }
  }, [isOpen, initialCategory, initialClass, initialCity]);

  const handleReset = () => {
    setSelectedCategory("");
    setSelectedClass("");
    setSelectedCity("");
  };

  const handleApply = () => {
    // All filters are mandatory
    if (!selectedCity || !selectedCategory || !selectedClass) {
      return;
    }

    const filters: { category?: string; class?: string; city?: string } = {
      category: selectedCategory,
      class: selectedClass,
      city: selectedCity,
    };

    onApplyFilters(filters);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <DialogTitle className="text-center">{tGeneral("filters") || "Filters"}</DialogTitle>
          <DialogDescription className="text-center">
            {tGeneral("filter-properties-description") || "Filter properties by category and class"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Cities - Mandatory */}
          <div>
            <Typography variant="body-md-bold" as="p" className="mb-3">
              {tGeneral("city")} <span className="text-red-500">*</span>
            </Typography>
            <Select
              value={selectedCity}
              onValueChange={setSelectedCity}
              disabled={citiesLoading}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder={tMap("select-city")} />
              </SelectTrigger>
              <SelectContent>
                {cities && cities.length > 0 ? (
                  cities.map((city) => (
                    <SelectItem key={city.key} value={city.key}>
                      {locale === "ar" ? city.cityAr : city.city}
                    </SelectItem>
                  ))
                ) : (
                  <div className="py-2 px-2 text-sm text-gray-500">
                    {tMap("no-cities-available")}
                  </div>
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Categories - Mandatory */}
          <div>
            <Typography variant="body-md-bold" as="p" className="mb-3">
              {tGeneral("category")} <span className="text-red-500">*</span>
            </Typography>
            <Select
              value={selectedCategory}
              onValueChange={setSelectedCategory}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder={tMap("select-category")} />
              </SelectTrigger>
              <SelectContent>
                {categories?.map((category) => (
                  <SelectItem key={category.key} value={category.key}>
                    {t(category.key)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Classes - Mandatory */}
          <div>
            <Typography variant="body-md-bold" as="p" className="mb-3">
              {tGeneral("class")} <span className="text-red-500">*</span>
            </Typography>
            {!selectedCategory ? (
              <Typography variant="body-sm" as="p" className="text-gray-500">
                {tMap("select-category-first")}
              </Typography>
            ) : classesLoading ? (
              <Typography variant="body-sm" as="p" className="text-gray-500">
                {tMap("loading-classes")}
              </Typography>
            ) : classes && classes.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {classes.map((classItem) => (
                  <Badge
                    key={classItem._id}
                    variant={selectedClass === classItem.key ? "default" : "outline"}
                    className={`cursor-pointer transition-colors ${
                      selectedClass === classItem.key
                        ? "bg-main-500 text-white hover:bg-main-600"
                        : "hover:bg-gray-100 dark:hover:bg-gray-800"
                    }`}
                    onClick={() =>
                      setSelectedClass(selectedClass === classItem.key ? "" : classItem.key)
                    }
                  >
                    {classItem.name}
                  </Badge>
                ))}
              </div>
            ) : (
              <Typography variant="body-sm" as="p" className="text-gray-500">
                {tMap("no-classes-available")}
              </Typography>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 border-t border-gray-200 pt-4 dark:border-gray-700">
          <Button variant="primary-outline" onClick={handleReset} className="flex-1">
            {tGeneral("reset")}
          </Button>
          <Button
            variant="primary"
            onClick={handleApply}
            className="flex-1"
            disabled={!selectedCity || !selectedCategory || !selectedClass}
          >
            {tGeneral("apply")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
