"use client";

import React from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import Typography from "@/components/shared/typography";
import VideoCard from "@/components/shared/video-card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  CarouselDots,
} from "@/components/ui/carousel";
import { useVideos } from "@/hooks/use-videos";
import { getLocalizedPath } from "@/lib/utils";

export default function LandingVideosSection() {
  const locale = useLocale();
  const t = useTranslations("HomePage.Videos");

  const { data, isLoading, isError } = useVideos({
    page: 1,
    size: 6,
  });

  const videos = data?.data?.data || [];

  return (
    <section className="bg-main-100 py-20 px-4">
      <div className="container">
        <div className="mb-7 flex items-center justify-between">
          <Typography
            variant="h2"
            as="h2"
            className="text-2xl font-bold leading-[44px] text-black sm:leading-[56px] md:text-4xl"
          >
            {t("title")}
          </Typography>
          <Link
            href={getLocalizedPath("/videos", locale)}
            className="text-xl font-bold text-main-600"
          >
            {t("view-all")}
          </Link>
        </div>

        {isLoading ? (
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 md:mt-10 lg:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="aspect-video w-full rounded-lg" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-full" />
              </div>
            ))}
          </div>
        ) : isError ? (
          <div className="py-8 text-center text-sm text-gray-500">
            {t("error")}
          </div>
        ) : videos.length === 0 ? (
          <div className="py-8 text-center text-sm text-gray-500">
            {t("noVideos")}
          </div>
        ) : (
          <div className="mt-6 md:mt-10">
            <Carousel
              opts={{
                align: "start",
                loop: true,
              }}
              className="w-full"
            >
              <CarouselContent className="-ml-2 md:-ml-4">
                {videos.map((video, index) => (
                  <CarouselItem
                    key={video._id}
                    className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/3"
                  >
                    <VideoCard video={video} priority={index < 3} />
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="hidden md:flex" />
              <CarouselNext className="hidden md:flex" />
              <CarouselDots className="mt-8" />
            </Carousel>
          </div>
        )}
      </div>
    </section>
  );
}
