"use client";

import { useTranslations } from "next-intl";

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
    <div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="aspect-video w-full rounded-lg" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
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
    <div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
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
