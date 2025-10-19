"use client";

import React, { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import VideoCard from "@/components/shared/video-card";
import { Skeleton } from "@/components/ui/skeleton";
import { useVideos } from "@/hooks/use-videos";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

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
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const renderPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);

    if (endPage - startPage + 1 < maxVisible) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <PaginationItem key={i}>
          <PaginationLink
            onClick={() => handlePageChange(i)}
            isActive={currentPage === i}
            className="cursor-pointer"
          >
            {i}
          </PaginationLink>
        </PaginationItem>
      );
    }

    return pages;
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

          {totalPages > 1 && (
            <div className="mt-8 flex justify-center">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => handlePageChange(currentPage - 1)}
                      className={
                        currentPage === 1
                          ? "pointer-events-none opacity-50"
                          : "cursor-pointer"
                      }
                    />
                  </PaginationItem>
                  {renderPageNumbers()}
                  <PaginationItem>
                    <PaginationNext
                      onClick={() => handlePageChange(currentPage + 1)}
                      className={
                        currentPage === totalPages
                          ? "pointer-events-none opacity-50"
                          : "cursor-pointer"
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </>
      )}
    </section>
  );
}
