"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
    // City is mandatory
    if (!selectedCity) {
      return;
    }

    const filters: { category?: string; class?: string; city?: string } = {};

    if (selectedCategory) {
      filters.category = selectedCategory;
    }

    if (selectedClass) {
      filters.class = selectedClass;
    }

    if (selectedCity) {
      filters.city = selectedCity;
    }

    onApplyFilters(filters);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{tGeneral("filters") || "Filters"}</DialogTitle>
          <DialogDescription>
            {tGeneral("filter-properties-description") || "Filter properties by category and class"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Cities - Mandatory */}
          <div>
            <Typography variant="body-md-bold" as="p" className="mb-3">
              {tGeneral("city") || "City"} <span className="text-red-500">*</span>
            </Typography>
            {citiesLoading ? (
              <Typography variant="body-sm" as="p" className="text-gray-500">
                Loading cities...
              </Typography>
            ) : cities && cities.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {cities.map((city) => (
                  <Badge
                    key={city.key}
                    variant={selectedCity === city.key ? "default" : "outline"}
                    className={`cursor-pointer transition-colors ${
                      selectedCity === city.key
                        ? "bg-main-500 text-white hover:bg-main-600"
                        : "hover:bg-gray-100 dark:hover:bg-gray-800"
                    }`}
                    onClick={() =>
                      setSelectedCity(selectedCity === city.key ? "" : city.key)
                    }
                  >
                    {city.city}
                  </Badge>
                ))}
              </div>
            ) : (
              <Typography variant="body-sm" as="p" className="text-gray-500">
                No cities available
              </Typography>
            )}
          </div>

          {/* Categories */}
          <div>
            <Typography variant="body-md-bold" as="p" className="mb-3">
              {tGeneral("category") || "Category"}
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
                  {t(category.key)}
                </Badge>
              ))}
            </div>
          </div>

          {/* Classes */}
          <div>
            <Typography variant="body-md-bold" as="p" className="mb-3">
              Class
            </Typography>
            {!selectedCategory ? (
              <Typography variant="body-sm" as="p" className="text-gray-500">
                Please select a category first
              </Typography>
            ) : classesLoading ? (
              <Typography variant="body-sm" as="p" className="text-gray-500">
                Loading classes...
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
                No classes available for this category
              </Typography>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 border-t border-gray-200 pt-4 dark:border-gray-700">
          <Button variant="primary-outline" onClick={handleReset} className="flex-1">
            {tGeneral("reset") || "Reset"}
          </Button>
          <Button
            variant="primary"
            onClick={handleApply}
            className="flex-1"
            disabled={!selectedCity}
          >
            {tGeneral("apply") || "Apply"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
