"use client";

import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useSession } from "next-auth/react";
import { Grid3x3, List } from "lucide-react";

import Typography from "@/components/shared/typography";
import Button from "@/components/shared/button";
import { useCities } from "@/hooks/use-cities";
import { useCountryContext } from "@/components/providers/country-provider";
import { getProperties } from "@/lib/services/api/properties";
import { useQuery } from "@tanstack/react-query";
import type { Governorate } from "@/types/property";
import FilterSection from "./filter-section";
import PropertyGrid from "./property-grid";
import { Spinner } from "@/components/ui/spinner";
import PaginationControls from "@/components/shared/pagination-controls";

export default function SearchPageContent() {
  const t = useTranslations("PropertySearch");
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const { selectedCountry } = useCountryContext();
  const { data: cities, isLoading: citiesLoading } = useCities(selectedCountry);

  // View state
  const [viewType, setViewType] = useState<"grid" | "list">("grid");
  const [page, setPage] = useState(1);

  // Filter states
  const [selectedCity, setSelectedCity] = useState<Governorate | undefined>();
  const [selectedSort, setSelectedSort] = useState("recentlyAdded");
  const [advancedFilters, setAdvancedFilters] = useState<any>({});

  // Get category from URL query params
  const categoryParam = searchParams.get("category");

  // Build search params as object
  const searchParamsObj = useMemo(() => {
    const params: any = {
      page,
      size: 12,
    };

    // Country filter from provider (always include)
    if (selectedCountry) params.country = selectedCountry;

    // Category filter from URL
    if (categoryParam) params.category = categoryParam;

    // Main filter: city
    if (selectedCity?.id) params.city = selectedCity.id;

    // Sort filter: Use sidebar sort if available, otherwise use main filter sort
    const sortToUse = advancedFilters.sort || selectedSort;
    if (sortToUse !== "recentlyAdded") {
      params.sort = sortToUse;
    }

    // Advanced filters from side panel
    if (advancedFilters.priceFrom) params.priceFrom = Number(advancedFilters.priceFrom);
    if (advancedFilters.priceTo) params.priceTo = Number(advancedFilters.priceTo);
    if (advancedFilters.offerType) params.offerType = advancedFilters.offerType;
    if (advancedFilters.search) params.search = advancedFilters.search;
    if (advancedFilters.city) params.city = advancedFilters.city;
    if (advancedFilters.bedrooms) params.bedrooms = advancedFilters.bedrooms;
    if (advancedFilters.bathrooms) params.bathrooms = advancedFilters.bathrooms;

    // Time-based availability filters
    if (advancedFilters.isDaily) params.isDaily = true;
    if (advancedFilters.isWeekly) params.isWeekly = true;
    if (advancedFilters.isMonthly) params.isMonthly = true;
    if (advancedFilters.isWeekdays) params.isWeekdays = true;
    if (advancedFilters.isHolidays) params.isHolidays = true;

    return params;
  }, [selectedCity, selectedSort, advancedFilters, page, selectedCountry, categoryParam]);

  // Fetch properties
  const { data: propertiesData, isLoading } = useQuery({
    queryKey: ["properties-search", searchParamsObj],
    queryFn: () => getProperties(searchParamsObj),
    enabled: true,
  });

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

  // Initialize selected city when cities load or country changes
  useEffect(() => {
    if (cityOptions.length > 0) {
      setSelectedCity(cityOptions[0]);
    }
  }, [cityOptions]);

  // Reset page to 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [selectedCity, selectedSort, advancedFilters]);

  const properties = propertiesData?.data?.data || [];
  const totalPages = propertiesData?.data?.totalPages || 1;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container px-4 md:px-6">
        {/* Header */}
        <div className="mb-8">
          <Typography variant="h1" as="h1" className="mb-4 text-4xl">
            {t("title")}
          </Typography>
          <Typography variant="body-lg-medium" as="p" className="text-gray-600">
            {t("description")}
          </Typography>
        </div>

        {/* Filter Section */}
        <FilterSection
          cities={cityOptions}
          selectedCity={selectedCity}
          setSelectedCity={setSelectedCity}
          citiesLoading={citiesLoading}
          selectedSort={selectedSort}
          setSelectedSort={setSelectedSort}
          onApplyAdvancedFilters={setAdvancedFilters}
        />

        {/* View Toggle */}
        <div className="mb-6 flex items-center justify-end">
          <div className="flex gap-2">
            <Button
              variant={viewType === "grid" ? "primary" : "primary-outline"}
              onClick={() => setViewType("grid")}
              className="!p-3"
            >
              <Grid3x3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewType === "list" ? "primary" : "primary-outline"}
              onClick={() => setViewType("list")}
              className="!p-3"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Results */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Spinner className="h-12 w-12 text-main-400" />
          </div>
        ) : properties.length === 0 ? (
          <div className="py-12 text-center">
            <Typography variant="h3" as="h3" className="text-gray-500">
              {t("no-results")}
            </Typography>
          </div>
        ) : (
          <>
            <PropertyGrid properties={properties} viewType={viewType} />
            <PaginationControls
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
              disabled={isLoading}
            />
          </>
        )}
      </div>
    </div>
  );
}
