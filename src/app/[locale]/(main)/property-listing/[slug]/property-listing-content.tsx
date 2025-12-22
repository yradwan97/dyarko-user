"use client";

import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Grid3x3, List } from "lucide-react";

import Typography from "@/components/shared/typography";
import Button from "@/components/shared/button";
import PropertyGrid from "@/app/[locale]/(main)/property-search/components/property-grid";
import { Spinner } from "@/components/ui/spinner";
import PaginationControls from "@/components/shared/pagination-controls";
import { type GetPropertiesParams } from "@/lib/services/api/properties";
import { useProperties } from "@/hooks/use-properties";
import SearchControl from "./search-control";
import { useCountryContext } from "@/components/providers/country-provider";

interface PropertyListingContentProps {
  slug: string;
}

export default function PropertyListingContent({ slug }: PropertyListingContentProps) {
  const t = useTranslations("PropertyListing");
  const tPayment = useTranslations("General.PaymentMethods");
  const searchParams = useSearchParams();
  const { selectedCountry } = useCountryContext();

  // View state
  const [viewType, setViewType] = useState<"grid" | "list">("grid");
  const [page, setPage] = useState(1);

  // Filter states
  const [filters, setFilters] = useState({
    city: searchParams.get("city") || "",
    category: searchParams.get("category") || "",
    available_date: null as Date | null,
    price_from: null as number | null,
    price_to: null as number | null,
    isDaily: false,
    isWeekly: false,
    isMonthly: false,
    isWeekdays: false,
    isHolidays: false,
  });
  const [searchTrigger, setSearchTrigger] = useState(0);

  // Map slug to offerType
  const getOfferType = (slug: string): GetPropertiesParams["offerType"] | undefined => {
    switch (slug) {
      case "rent":
        return "rent";
      case "cash":
        return "cash";
      case "installment":
        return "installment";
      case "share":
      case "replacement":
        return undefined; // These might need specific handling
      default:
        return undefined;
    }
  };

  // Build API params
  const apiParams: GetPropertiesParams = useMemo(() => {
    const params: GetPropertiesParams = {
      page,
      size: 12,
      offerType: getOfferType(slug),
    };

    if (selectedCountry) params.country = selectedCountry;
    if (filters.city) params.city = filters.city;
    if (filters.category) params.category = filters.category;

    // Price filters
    const hasPriceFilter = filters.price_from || filters.price_to;
    if (filters.price_from) params.minPrice = filters.price_from;
    if (filters.price_to) params.maxPrice = filters.price_to;

    // Period filters - check if any period is selected
    const hasAnyPeriod = filters.isDaily || filters.isWeekly || filters.isMonthly || filters.isWeekdays || filters.isHolidays;

    if (filters.isDaily) params.isDaily = true;
    if (filters.isWeekly) params.isWeekly = true;
    if (filters.isMonthly) params.isMonthly = true;
    if (filters.isWeekdays) params.isWeekdays = true;
    if (filters.isHolidays) params.isHolidays = true;

    // Default to monthly if price filter is set but no period is selected
    if (hasPriceFilter && !hasAnyPeriod) {
      params.isMonthly = true;
    }

    return params;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, page, filters, selectedCountry, searchTrigger]);

  // Fetch properties
  const { data: propertiesData, isLoading } = useProperties(apiParams);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [filters, slug]);

  const handleSearch = (newFilters: any) => {
    setFilters(newFilters);
    // Increment search trigger to force refetch even if filters haven't changed
    setSearchTrigger((prev) => prev + 1);
  };

  const handleReset = () => {
    setFilters({
      city: "",
      category: "",
      available_date: null,
      price_from: null,
      price_to: null,
      isDaily: false,
      isWeekly: false,
      isMonthly: false,
      isWeekdays: false,
      isHolidays: false,
    });
  };

  const properties = propertiesData?.data?.data || [];
  const totalPages = propertiesData?.data?.totalPages || propertiesData?.data?.pages || 1;

  // Get page title based on slug
  const getPageTitle = () => {
    switch (slug) {
      case "rent":
        return tPayment("rent");
      case "cash":
        return `${tPayment("buy")} (${tPayment("cash")})`;
      case "installment":
        return `${tPayment("buy")} (${tPayment("installment")})`;
      case "share":
        return tPayment("shared");
      case "replacement":
        return tPayment("replacement");
      default:
        return tPayment("all");
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-main-100 to-white py-8">
      <div className="container">
        {/* Header */}
        <div className="mb-8">
          <Typography variant="h1" as="h1" className="mb-4 text-4xl">
            {t("title")} {getPageTitle()}
          </Typography>
          <Typography variant="body-lg-medium" as="p" className="text-gray-600">
            {t("description")}
          </Typography>
        </div>

        {/* Search Control */}
        <SearchControl
          slug={slug}
          onSearch={handleSearch}
          onReset={handleReset}
        />

        {/* View Toggle */}
        <div className="mb-6 flex items-center justify-end">
          <div className="flex gap-2">
            <Button
              variant={viewType === "grid" ? "primary" : "primary-outline"}
              onClick={() => setViewType("grid")}
              className="p-3!"
            >
              <Grid3x3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewType === "list" ? "primary" : "primary-outline"}
              onClick={() => setViewType("list")}
              className="p-3!"
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
