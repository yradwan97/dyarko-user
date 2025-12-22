"use client";

import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";

import CompanyBanner from "@/components/sections/companies/company-banner";
import CompanyInfoTab from "@/components/sections/companies/company-info-tab";
import CompanyProperties from "@/components/sections/companies/company-properties";
import CompanyVideos from "@/components/sections/companies/company-videos";
import CompanyReviews from "@/components/sections/companies/company-reviews";
import { getOwnerById } from "@/lib/services/api/companies";
import { getProperties } from "@/lib/services/api/properties";
import { getVideos } from "@/lib/services/api/reels";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import { PropertyFilters } from "@/components/sections/companies/property-filters-modal";
import { useCountryContext } from "@/components/providers/country-provider";

interface CompanyDetailsProps {
  id: string;
}

type TabType = "info" | "properties" | "reels";

export default function CompanyDetails({ id }: CompanyDetailsProps) {
  const t = useTranslations("Companies.Tabs");
  const [activeTab, setActiveTab] = useState<TabType>("info");
  const [propertyPage, setPropertyPage] = useState(1);
  const [videoPage, setVideoPage] = useState(1);
  const [propertyFilters, setPropertyFilters] = useState<PropertyFilters>({});
  const videosRef = useRef<HTMLDivElement>(null);
  const { selectedCountry: providerCountry } = useCountryContext();

  // Fetch owner details
  const { data: owner, isLoading: ownerLoading } = useQuery({
    queryKey: ["owner", id],
    queryFn: () => getOwnerById(id),
    enabled: !!id,
  });

  // Reset to page 1 when filters change
  useEffect(() => {
    setPropertyPage(1);
  }, [propertyFilters]);

  // Fetch owner properties with filters
  const { data: propertiesData, isFetching: propertiesFetching } = useQuery({
    queryKey: ["owner-properties", id, propertyPage, propertyFilters, providerCountry],
    queryFn: () =>
      getProperties({
        owner: id,
        page: propertyPage,
        size: 9,
        offerType: propertyFilters.offerType as "RENT" | "INSTALLMENT" | undefined,
        category: propertyFilters.category,
        country: propertyFilters.country ? propertyFilters.country : providerCountry,
        city: propertyFilters.city,
        minPrice: propertyFilters.priceFrom,
        maxPrice: propertyFilters.priceTo,
        bedrooms: propertyFilters.bedrooms,
        isDaily: propertyFilters.rentType === "daily" ? true : undefined,
        isWeekly: propertyFilters.rentType === "weekly" ? true : undefined,
        isMonthly: propertyFilters.rentType === "monthly" ? true : undefined,
        isWeekdays: propertyFilters.rentType === "weekdays" ? true : undefined,
        isHolidays: propertyFilters.rentType === "holidays" ? true : undefined,
      }),
    enabled: !!id && activeTab === "properties",
  });

  // Scroll to top when property page changes (skip initial load)
  useEffect(() => {
    if (propertyPage > 1) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [propertyPage]);

  // Scroll to videos section when video page changes (skip initial load)
  useEffect(() => {
    if (videoPage > 1 && videosRef.current) {
      videosRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [videoPage]);

  // Fetch owner videos
  const { data: videosData, isFetching: videosFetching } = useQuery({
    queryKey: ["owner-videos", id, videoPage],
    queryFn: () => getVideos({ owner: id, page: videoPage, size: 6 }),
    enabled: !!id && activeTab === "reels",
  });

  const handleFiltersChange = (filters: PropertyFilters) => {
    setPropertyFilters(filters);
  };

  if (ownerLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner className="h-12 w-12 text-main-400" />
      </div>
    );
  }

  if (!owner) {
    return (
      <div className="container py-20 text-center">
        <p className="text-xl text-gray-600">Company not found</p>
      </div>
    );
  }

  const tabs: { key: TabType; label: string }[] = [
    { key: "info", label: t("info") },
    { key: "properties", label: t("properties") },
    { key: "reels", label: t("reels") },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <CompanyBanner owner={owner} />

      <div className="container">
        {/* Tabs */}
        <div className="mb-6 flex justify-center gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              className={cn(
                "rounded-full px-6 py-2.5 text-sm font-medium transition-all duration-300",
                activeTab === tab.key
                  ? "bg-main-600 text-white shadow-md"
                  : "border border-gray-300 bg-white text-gray-700 hover:border-main-500 hover:text-main-500"
              )}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="min-h-25">
          {activeTab === "info" && <CompanyInfoTab owner={owner} />}

          {activeTab === "properties" && (
            <CompanyProperties
              properties={propertiesData?.data.data || []}
              total={propertiesData?.data.itemsCount || propertiesData?.data.data?.length || 0}
              totalPages={propertiesData?.data.pages || 1}
              currentPage={propertyPage}
              onPageChange={setPropertyPage}
              isLoading={propertiesFetching}
              onFiltersChange={handleFiltersChange}
              currentFilters={propertyFilters}
            />
          )}

          {activeTab === "reels" && (
            <div ref={videosRef}>
              {videosFetching || (videosData && videosData.data.data.length > 0) ? (
                <CompanyVideos
                  videos={videosData?.data.data || []}
                  total={videosData?.data.itemsCount || videosData?.data.data?.length || 0}
                  totalPages={videosData?.data.pages || 1}
                  currentPage={videoPage}
                  onPageChange={setVideoPage}
                  isLoading={videosFetching}
                />
              ) : (
                <div className="py-12 text-center">
                  <p className="text-gray-500">{t("no-reels")}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Reviews Section - Always visible below tabs */}
        <CompanyReviews ownerId={id} />
      </div>
    </div>
  );
}
