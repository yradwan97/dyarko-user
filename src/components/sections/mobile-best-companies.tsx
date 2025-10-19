"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { UserCircleIcon, ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import { useBestCompanies } from "@/hooks/use-companies";
import { getLocalizedPath, getProxiedImageUrl, cn } from "@/lib/utils";

export default function MobileBestCompanies() {
  const locale = useLocale();
  const t = useTranslations("HomePage.MobileBestCompanies");
  const { data, isLoading, isError } = useBestCompanies(1, 18); // Fetch more for pagination
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);

  React.useEffect(() => {
    if (!api) return;

    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap());

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  const isRTL = locale === "ar";

  // Always show the section structure
  return (
    <section className="px-4 py-8">
      {isLoading ? (
        <>
          <Skeleton className="mb-5 h-7 w-36" />
          <div className="flex gap-5 overflow-x-auto pb-2 scrollbar-hide">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex flex-shrink-0 flex-col items-center gap-2">
                <Skeleton className="h-16 w-16 rounded-full" />
                <Skeleton className="h-3 w-14" />
              </div>
            ))}
          </div>
        </>
      ) : isError || !data?.data?.items || data.data.items.length === 0 ? null : (
        <>
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-xl font-bold text-main-500 dark:text-main-400">{t("title")}</h2>
            <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
              <button
                onClick={() => isRTL ? api?.scrollNext() : api?.scrollPrev()}
                disabled={isRTL ? !api?.canScrollNext() : !api?.canScrollPrev()}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-white transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700"
              >
                {isRTL ? (
                  <ChevronRightIcon className="h-4 w-4 text-gray-700 dark:text-gray-300" />
                ) : (
                  <ChevronLeftIcon className="h-4 w-4 text-gray-700 dark:text-gray-300" />
                )}
              </button>
              <button
                onClick={() => isRTL ? api?.scrollPrev() : api?.scrollNext()}
                disabled={isRTL ? !api?.canScrollPrev() : !api?.canScrollNext()}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-white transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700"
              >
                {isRTL ? (
                  <ChevronLeftIcon className="h-4 w-4 text-gray-700 dark:text-gray-300" />
                ) : (
                  <ChevronRightIcon className="h-4 w-4 text-gray-700 dark:text-gray-300" />
                )}
              </button>
            </div>
          </div>

          <Carousel
            setApi={setApi}
            opts={{
              align: "start",
              loop: false,
              direction: isRTL ? "rtl" : "ltr",
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-1 md:-ml-2">
              {data.data.items.map((company) => (
                <CarouselItem
                  key={company._id}
                  className="basis-1/3 pl-1 md:basis-1/4 md:pl-2 lg:basis-1/6"
                >
                  <Link
                    href={getLocalizedPath(`/company-details/${company._id}`, locale)}
                    className="group flex flex-col items-center gap-2.5 transition-all"
                  >
                    <div className="relative h-16 w-16 overflow-hidden rounded-full bg-gradient-to-br from-gray-100 to-gray-200 shadow-[0_2px_8px_rgba(0,0,0,0.06)] ring-2 ring-white transition-all group-hover:scale-105 group-hover:shadow-[0_4px_12px_rgba(0,0,0,0.12)]">
                      {company.owner.image ? (
                        <Image
                          src={getProxiedImageUrl(company.owner.image)}
                          alt={company.owner.name}
                          fill
                          sizes="64px"
                          unoptimized={getProxiedImageUrl(company.owner.image).startsWith('/api/proxy-image')}
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-main-100">
                          <UserCircleIcon className="h-9 w-9 text-main-400" />
                        </div>
                      )}
                    </div>
                    <span className="max-w-[68px] truncate text-xs font-medium text-main-500 transition-colors group-hover:text-main-600 dark:text-main-400 dark:group-hover:text-main-300">
                      {company.owner.name}
                    </span>
                  </Link>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>

          {/* Pagination dots */}
          {count > 1 && (
            <div className="mt-4 flex justify-center gap-1.5">
              {Array.from({ length: count }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => api?.scrollTo(index)}
                  className={cn(
                    "h-1.5 rounded-full transition-all",
                    current === index
                      ? "w-6 bg-main-500"
                      : "w-1.5 bg-gray-300 hover:bg-gray-400"
                  )}
                  aria-label={`Go to page ${index + 1}`}
                />
              ))}
            </div>
          )}
        </>
      )}
    </section>
  );
}
