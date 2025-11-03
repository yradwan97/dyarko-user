"use client";

import React, { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { HeartIcon, EyeIcon, MessageCircleIcon, ShareIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useVideo, useVideos } from "@/hooks/use-videos";
import VideoCard from "@/components/shared/video-card";
import VideoCommentsSection from "@/components/sections/video-comments-section";
import VideoPlayer from "@/components/shared/video-player";
import { createVideoView, likeVideo } from "@/lib/services/api/reels";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface VideoDetailsProps {
  videoId: string;
}

export default function VideoDetails({ videoId }: VideoDetailsProps) {
  const locale = useLocale();
  const isRTL = locale === "ar";
  const t = useTranslations("VideoDetailPage");

  const { data: videoData, isLoading, isError } = useVideo(videoId);
  const { data: relatedVideos } = useVideos({ page: 1, size: 6 });

  const related = relatedVideos?.data?.data?.filter((v) => v._id !== videoId) || [];

  // Extract data from the detailed response
  const video = videoData?.reel;
  const likes = videoData?.likes;
  const commentsCount = videoData?.commentsCount;

  const [isLiked, setIsLiked] = useState(likes?.status || false);
  const [hasTrackedView, setHasTrackedView] = useState(false);

  // Update isLiked when likes data changes
  React.useEffect(() => {
    if (likes) {
      setIsLiked(likes.status);
    }
  }, [likes]);

  const handleVideoPlay = async () => {
    if (!hasTrackedView && videoId) {
      setHasTrackedView(true);
      await createVideoView(videoId);
    }
  };

  const handleLikeToggle = async () => {
    try {
      await likeVideo(videoId, isLiked);
      setIsLiked(!isLiked);
    } catch (error) {
      console.error("Error toggling like:", error);
      toast.error(t("likeError"));
    }
  };

  const formatCount = (count: number | undefined): string => {
    if (!count || count === 0) {
      return "0";
    }
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    }
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  const handleShare = async () => {
    if (navigator.share && video) {
      try {
        await navigator.share({
          title: video.title,
          text: video.description,
          url: window.location.href,
        });
      } catch (error) {
        console.error("Error sharing:", error);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Skeleton className="aspect-video w-full rounded-lg" />
            <div className="mt-6 space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <div className="flex gap-4">
                <Skeleton className="h-10 w-24" />
                <Skeleton className="h-10 w-24" />
                <Skeleton className="h-10 w-24" />
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <Skeleton className="h-6 w-32" />
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="aspect-video w-full rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (isError || !video) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {t("error")}
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          {t("errorDescription")}
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Main Video Section */}
        <div className="lg:col-span-2">
          {/* Video Player */}
          <VideoPlayer
            src={video.path}
            poster={video.thumbnail}
            autoPlay={false}
            onPlay={handleVideoPlay}
          />

          {/* Video Info */}
          <div className="mt-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {video.title}
            </h1>

            {/* Stats and Actions */}
            <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-6">
                <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                  <EyeIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {formatCount(video.views)} {t("views")}
                  </span>
                </div>
                <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                  <MessageCircleIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {formatCount(commentsCount || 0)} {t("comments")}
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant={isLiked ? "default" : "outline"}
                  size="sm"
                  onClick={handleLikeToggle}
                  className={cn("gap-2", isRTL && "flex-row-reverse")}
                >
                  <HeartIcon
                    className={cn("h-4 w-4", isLiked && "fill-current")}
                  />
                  {formatCount(likes?.count || 0)}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleShare}
                  className={cn("gap-2", isRTL && "flex-row-reverse")}
                >
                  <ShareIcon className="h-4 w-4" />
                  {t("share")}
                </Button>
              </div>
            </div>

            {/* Description */}
            {video.description && (
              <Card className="mt-6">
                <CardContent className="p-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {video.description}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Comments Section */}
            <VideoCommentsSection videoId={videoId} />
          </div>
        </div>

        {/* Related Videos Sidebar */}
        <div className="lg:col-span-1">
          <h2 className="mb-4 text-lg font-bold text-gray-900 dark:text-white">
            {t("relatedVideos")}
          </h2>
          <div className="space-y-4">
            {related.length > 0 ? (
              related.map((relatedVideo) => (
                <VideoCard key={relatedVideo._id} video={relatedVideo} />
              ))
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t("noRelatedVideos")}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
