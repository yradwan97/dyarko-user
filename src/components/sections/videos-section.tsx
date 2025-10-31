"use client";

import React, { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import VideoCard from "@/components/shared/video-card";
import { Skeleton } from "@/components/ui/skeleton";
import { useVideos } from "@/hooks/use-videos";
import PaginationControls from "@/components/shared/pagination-controls";

export default function VideosSection() {
  const locale = useLocale();
  const t = useTranslations("HomePage.VideosSection");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 9;

  const { data, isLoading, isError } = useVideos({
    page: currentPage,
    size: pageSize,
  });

  const videos = data?.data?.data || [];
  const totalPages = data?.data?.totalPages || 1;

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <section className="px-4 py-8">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-main-500 dark:text-main-400">
          {t("title")}
        </h2>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
          {[...Array(pageSize)].map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="aspect-video w-full rounded-lg" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-full" />
            </div>
          ))}
        </div>
      ) : isError ? (
        <div className="py-8 text-center text-sm text-gray-500 dark:text-gray-400">
          {t("error")}
        </div>
      ) : videos.length === 0 ? (
        <div className="py-8 text-center text-sm text-gray-500 dark:text-gray-400">
          {t("noVideos")}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
            {videos.map((video, index) => (
              <VideoCard key={video._id} video={video} priority={index < 3} />
            ))}
          </div>

          <PaginationControls
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            disabled={isLoading}
          />
        </>
      )}
    </section>
  );
}
