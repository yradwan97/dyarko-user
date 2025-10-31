"use client";

import { useTranslations } from "next-intl";

import Typography from "@/components/shared/typography";
import { Spinner } from "@/components/ui/spinner";
import { type Video } from "@/lib/services/api/reels";
import VideoCard from "@/components/shared/video-card";

interface CompanyVideosProps {
  videos: Video[];
  isLoading: boolean;
}

export default function CompanyVideos({ videos, isLoading }: CompanyVideosProps) {
  const t = useTranslations("Companies");

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner className="h-12 w-12 text-main-400" />
      </div>
    );
  }

  if (videos.length === 0) {
    return null;
  }

  return (
    <div className="mb-16 mt-10">
      <div className="mb-8 flex items-center justify-between">
        <Typography variant="h2" as="h2" className="text-2xl text-gray-900 md:text-3xl">
          {t("videos")}
        </Typography>
        <Typography variant="body-md" as="p" className="text-gray-600">
          {videos?.length} {videos?.length === 1 ? t("video") : t("videos")}
        </Typography>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {videos.map((video) => (
          <VideoCard key={video._id} video={video} />
        ))}
      </div>
    </div>
  );
}
