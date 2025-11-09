"use client";

import { useTranslations } from "next-intl";

import Typography from "@/components/shared/typography";
import { Skeleton } from "@/components/ui/skeleton";
import { type Video } from "@/lib/services/api/reels";
import VideoCard from "@/components/shared/video-card";
import PaginationControls from "@/components/shared/pagination-controls";

interface CompanyVideosProps {
  videos: Video[];
  total: number;
  totalPages: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  isLoading: boolean;
}

export default function CompanyVideos({
  videos,
  total,
  totalPages,
  currentPage,
  onPageChange,
  isLoading
}: CompanyVideosProps) {
  const t = useTranslations("Companies");

  const renderSkeletons = () => (
    <div className="mb-16 mt-10">
      <div className="mb-8 flex items-center justify-between">
        <Typography variant="h2" as="h2" className="text-2xl text-gray-900 md:text-3xl">
          {t("videos")}
        </Typography>
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="aspect-video w-full rounded-lg" />
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ))}
      </div>
    </div>
  );

  if (isLoading) {
    return renderSkeletons();
  }

  if (!videos || videos.length === 0) {
    return null;
  }

  return (
    <div className="mb-16 mt-10">
      <div className="mb-8 flex items-center justify-between">
        <Typography variant="h2" as="h2" className="text-2xl text-gray-900 md:text-3xl">
          {t("videos")}
        </Typography>
        <Typography variant="body-md" as="p" className="text-gray-600">
          {total} {total === 1 ? t("video") : t("videos")}
        </Typography>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {videos.map((video) => (
          <VideoCard key={video._id} video={video} />
        ))}
      </div>

      <PaginationControls
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
        disabled={isLoading}
      />
    </div>
  );
}
