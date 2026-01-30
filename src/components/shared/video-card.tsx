"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { HeartIcon, EyeIcon, MessageCircleIcon, PlayCircleIcon, ClockIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import type { Video } from "@/lib/services/api/reels";

interface VideoCardProps {
  video: Video;
  priority?: boolean;
}

export default function VideoCard({ video, priority = false }: VideoCardProps) {
  const locale = useLocale();
  const isRTL = locale === "ar";
  const t = useTranslations("Videos");

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

  const formatExpiryDate = (date: string): string => {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, "0");
    const minutes = String(d.getMinutes()).padStart(2, "0");
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  };

  const isExpired = (date: string): boolean => {
    return new Date(date) < new Date();
  };

  return (
    <Link href={`/${locale}/videos/${video._id}`}>
      <Card className="group overflow-hidden border-0 bg-white shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-all hover:shadow-[0_8px_16px_rgba(0,0,0,0.08)] dark:bg-gray-800 dark:shadow-[0_2px_8px_rgba(0,0,0,0.2)] dark:hover:shadow-[0_8px_16px_rgba(0,0,0,0.3)]">
        <div className="relative aspect-video w-full overflow-hidden bg-linear-to-br from-gray-50 to-gray-100">
          <Image
            src={video.thumbnail || "/service.png"}
            alt={video.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            priority={priority}
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <PlayCircleIcon className="h-16 w-16 text-white drop-shadow-lg" />
          </div>
        </div>
        <CardContent className="p-4">
          <h3 className="mb-3 line-clamp-2 text-sm font-semibold text-main-500 dark:text-main-400">
            {video.title}
          </h3>

          {video.expirationDate && (
            <div className={cn("mb-3 flex items-center gap-1.5")}>
              <ClockIcon className={cn(
                "h-4 w-4",
                isExpired(video.expirationDate) ? "text-red-500" : "text-main-500 dark:text-main-400"
              )} />
              {isExpired(video.expirationDate) ? (
                <span className="text-xs font-medium text-red-500">
                  {t("expired")}
                </span>
              ) : (
                <span className={cn("text-xs font-medium text-main-500 dark:text-main-400")}>
                  {t("expires-at")}: {formatExpiryDate(video.expirationDate)}
                </span>
              )}
            </div>
          )}

          <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-gray-900">
            <div className={cn("flex items-center gap-1.5", isRTL && "flex-row-reverse")}>
              <EyeIcon className="h-4 w-4 text-gray-400 dark:text-gray-500" />
              <span className="text-xs text-gray-600 dark:text-gray-400">
                {formatCount(video.views || 0)}
              </span>
            </div>
            <div className={cn("flex items-center gap-1.5", isRTL && "flex-row-reverse")}>
              <HeartIcon className="h-4 w-4 text-gray-400 dark:text-gray-500" />
              <span className="text-xs text-gray-600 dark:text-gray-400">
                {formatCount(video.likes?.count || 0)}
              </span>
            </div>
            <div className={cn("flex items-center gap-1.5", isRTL && "flex-row-reverse")}>
              <MessageCircleIcon className="h-4 w-4 text-gray-400 dark:text-gray-500" />
              <span className="text-xs text-gray-600 dark:text-gray-400">
                {formatCount(video.commentsCount || 0)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
