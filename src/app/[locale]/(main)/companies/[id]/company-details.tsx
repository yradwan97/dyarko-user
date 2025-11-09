"use client";

import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";

import CompanyBanner from "@/components/sections/companies/company-banner";
import CompanyProperties from "@/components/sections/companies/company-properties";
import CompanyVideos from "@/components/sections/companies/company-videos";
import CompanyReviews from "@/components/sections/companies/company-reviews";
import PropertyTypeTabs from "@/components/sections/companies/property-type-tabs";
import { getOwnerById } from "@/lib/services/api/companies";
import { getProperties } from "@/lib/services/api/properties";
import { getVideos } from "@/lib/services/api/reels";
import { Spinner } from "@/components/ui/spinner";

interface CompanyDetailsProps {
  id: string;
}

export default function CompanyDetails({ id }: CompanyDetailsProps) {
  const [activeTab, setActiveTab] = useState<"all" | "rent" | "installment">("all");
  const [propertyPage, setPropertyPage] = useState(1);
  const [videoPage, setVideoPage] = useState(1);
  const videosRef = useRef<HTMLDivElement>(null);

  // Fetch owner details
  const { data: owner, isLoading: ownerLoading } = useQuery({
    queryKey: ["owner", id],
    queryFn: () => getOwnerById(id),
    enabled: !!id,
  });

  // Reset to page 1 when tab changes
  useEffect(() => {
    setPropertyPage(1);
  }, [activeTab]);

  // Fetch owner properties
  const { data: propertiesData, isFetching: propertiesFetching } = useQuery({
    queryKey: ["owner-properties", id, activeTab, propertyPage],
    queryFn: () =>
      getProperties({
        owner: id,
        offerType: activeTab === "all" ? undefined : activeTab.toUpperCase() as "RENT" | "INSTALLMENT",
        page: propertyPage,
        size: 8,
      }),
    enabled: !!id,
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
    enabled: !!id,
  });

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

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <CompanyBanner owner={owner} />

      <div className="container">
        <PropertyTypeTabs activeTab={activeTab} setActiveTab={setActiveTab} />

        <CompanyProperties
          properties={propertiesData?.data.data || []}
          total={propertiesData?.data.itemsCount || propertiesData?.data.data?.length || 0}
          totalPages={propertiesData?.data.pages || 1}
          currentPage={propertyPage}
          onPageChange={setPropertyPage}
          isLoading={propertiesFetching}
          activeTab={activeTab}
        />

        <CompanyReviews ownerId={id} />

        {((videosData && videosData.data.data.length > 0) || videosFetching) && (
          <div ref={videosRef}>
            <CompanyVideos
              videos={videosData?.data.data || []}
              total={videosData?.data.itemsCount || videosData?.data.data?.length || 0}
              totalPages={videosData?.data.pages || 1}
              currentPage={videoPage}
              onPageChange={setVideoPage}
              isLoading={videosFetching}
            />
          </div>
        )}
      </div>
    </div>
  );
}
