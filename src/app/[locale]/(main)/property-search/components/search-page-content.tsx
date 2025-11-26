"use client";

import { useState, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { useSession } from "next-auth/react";
import { Grid3x3, List } from "lucide-react";

import Typography from "@/components/shared/typography";
import Button from "@/components/shared/button";
import { useCities } from "@/hooks/use-cities";
import { useCountryContext } from "@/components/providers/country-provider";
import { getProperties } from "@/lib/services/api/properties";
import { useQuery } from "@tanstack/react-query";
import type { Governorate } from "@/types/property";
import { Spinner } from "@/components/ui/spinner";
import PaginationControls from "@/components/shared/pagination-controls";

const FilterSection = dynamic(() => import("./filter-section"), {
  loading: () => <div className="h-24 animate-pulse bg-gray-100 rounded-lg" />,
});

const PropertyGrid = dynamic(() => import("./property-grid"), {
  loading: () => <div className="h-96 animate-pulse bg-gray-100 rounded-lg" />,
});

export default function SearchPageContent() {
  const t = useTranslations("PropertySearch");
  const locale = useLocale();
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const { selectedCountry } = useCountryContext();
  const { data: cities, isLoading: citiesLoading } = useCities(selectedCountry);

  // View state
  const [viewType, setViewType] = useState<"grid" | "list">("grid");
  const [page, setPage] = useState(1);

  // Filter states - staged (not applied until submit)
  const [selectedCity, setSelectedCity] = useState<Governorate | undefined>();
  const [selectedSort, setSelectedSort] = useState("recentlyAdded");
  const [searchQuery, setSearchQuery] = useState("");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 0]);
  const [offerType, setOfferType] = useState("RENT");
  const [advancedFilters, setAdvancedFilters] = useState<any>({});

  // Applied filters - used for API calls
  const [appliedCity, setAppliedCity] = useState<Governorate | undefined>();
  const [appliedSort, setAppliedSort] = useState("recentlyAdded");
  const [appliedSearchQuery, setAppliedSearchQuery] = useState("");
  const [appliedPriceRange, setAppliedPriceRange] = useState<[number, number]>([0, 0]);
  const [appliedOfferType, setAppliedOfferType] = useState("RENT");

  // Get category from URL query params
  const categoryParam = searchParams.get("category");

  // Handle main filter apply
  const handleApplyMainFilters = () => {
    setAppliedCity(selectedCity);
    setAppliedSort(selectedSort);
    setAppliedSearchQuery(searchQuery);
    setAppliedPriceRange(priceRange);
    setAppliedOfferType(offerType);
    setPage(1);
  };

  // Build search params as object
  const searchParamsObj = useMemo(() => {
    const params: any = {
      page,
      size: 12,
    };

    // Country filter from provider (always include)
    if (selectedCountry) params.country = selectedCountry;

    // Category filter (sidebar takes precedence over URL)
    const categoryToUse = advancedFilters.category || categoryParam;
    if (categoryToUse) params.category = categoryToUse;

    // City filter (use applied state)
    if (appliedCity?.id) params.city = appliedCity.id;

    // Sort filter (use applied state)
    if (appliedSort !== "recentlyAdded") {
      params.sort = appliedSort;
    }

    // Search query (use applied state)
    if (appliedSearchQuery && appliedSearchQuery.trim()) {
      params.search = appliedSearchQuery.trim();
    }

    // Price range (use applied state)
    if (appliedPriceRange[0] > 0) params.priceFrom = Number(appliedPriceRange[0]);
    if (appliedPriceRange[1] > 0) params.priceTo = Number(appliedPriceRange[1]);

    // Offer type (use applied state)
    if (appliedOfferType) params.offerType = appliedOfferType;

    // Advanced filters from side panel only
    if (advancedFilters.bedrooms) params.bedrooms = advancedFilters.bedrooms;
    if (advancedFilters.bathrooms) params.bathrooms = advancedFilters.bathrooms;

    // Time-based availability filters
    if (advancedFilters.isDaily) params.isDaily = true;
    if (advancedFilters.isWeekly) params.isWeekly = true;
    if (advancedFilters.isMonthly) params.isMonthly = true;
    if (advancedFilters.isWeekdays) params.isWeekdays = true;
    if (advancedFilters.isHolidays) params.isHolidays = true;

    return params;
  }, [appliedCity, appliedSort, appliedSearchQuery, appliedPriceRange, appliedOfferType, advancedFilters, page, selectedCountry, categoryParam]);

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
          name: locale === "ar" ? city.cityAr : city.city,
          icon: locale === "ar" ? city.cityAr : city.city,
        }))
      : [];
  }, [cities, locale]);

  // Initialize selected city when cities load or country changes
  useEffect(() => {
    if (cityOptions.length > 0) {
      setSelectedCity(cityOptions[0]);
    }
  }, [cityOptions]);

  // Reset page to 1 when applied filters change
  useEffect(() => {
    setPage(1);
  }, [appliedCity, appliedSort, appliedSearchQuery, appliedPriceRange, appliedOfferType, advancedFilters]);

  // Sync filters from advanced filters back to main filters and apply them
  useEffect(() => {
    // Sync city (including clearing it if empty string)
    if (advancedFilters.city !== undefined) {
      if (advancedFilters.city === "") {
        setSelectedCity(undefined);
        setAppliedCity(undefined);
      } else if (cityOptions.length > 0) {
        const cityFromFilter = cityOptions.find(c => c.id === advancedFilters.city);
        if (cityFromFilter) {
          setSelectedCity(cityFromFilter);
          setAppliedCity(cityFromFilter);
        }
      }
    }

    // Sync search query
    if (advancedFilters.search !== undefined) {
      setSearchQuery(advancedFilters.search);
      setAppliedSearchQuery(advancedFilters.search);
    }

    // Sync price range - always sync when filters are applied
    if (advancedFilters.priceFrom !== undefined && advancedFilters.priceTo !== undefined) {
      const newFrom = advancedFilters.priceFrom;
      const newTo = advancedFilters.priceTo;
      setPriceRange([newFrom, newTo]);
      setAppliedPriceRange([newFrom, newTo]);
    }

    // Sync offer type
    if (advancedFilters.offerType && advancedFilters.offerType !== offerType) {
      setOfferType(advancedFilters.offerType);
      setAppliedOfferType(advancedFilters.offerType);
    }
  }, [advancedFilters, cityOptions]);

  const properties = propertiesData?.data?.data || [];
  const totalPages = propertiesData?.data?.totalPages || 1;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container">
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
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          priceRange={priceRange}
          setPriceRange={setPriceRange}
          offerType={appliedOfferType}
          categoryParam={categoryParam || undefined}
          onApplyFilters={handleApplyMainFilters}
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
