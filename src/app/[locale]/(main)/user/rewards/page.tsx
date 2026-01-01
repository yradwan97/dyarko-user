"use client";

import { useTranslations } from "next-intl";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { HelpCircle, Plus, Minus } from "lucide-react";
import { useState, useEffect } from "react";

import Typography from "@/components/shared/typography";
import { cn } from "@/lib/utils";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Spinner } from "@/components/ui/spinner";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
  type CarouselApi,
} from "@/components/ui/carousel";
import { useLevels } from "@/hooks/use-levels";

export default function RewardsPage() {
  const t = useTranslations("User.Rewards");
  const { data: session } = useSession();
  const [expandedLevel, setExpandedLevel] = useState<string | undefined>("level-1");

  // Preview mode - simulate user level (will be replaced with real data later)
  const [previewLevel, setPreviewLevel] = useState<number>(1);
  const [previewCompletedRentals, setPreviewCompletedRentals] = useState<number>(2);

  // Carousel API for initial positioning
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();

  // Fetch levels from API
  const { data: levels, isLoading, error } = useLevels();

  // Set carousel position to show transition point (half completed, half incomplete)
  useEffect(() => {
    if (!carouselApi) return;

    const currentLevel = levels?.find((l) => l.level === previewLevel);
    if (!currentLevel || currentLevel.rents <= 10) return;

    // We want to see ~5 completed and ~5 incomplete
    // So the first visible should be (completedRentals - 5)
    const targetIndex = Math.max(0, previewCompletedRentals - 5);

    // Scroll immediately (instant, no animation)
    carouselApi.scrollTo(targetIndex, true);
  }, [carouselApi, previewLevel, previewCompletedRentals, levels]);

  const userName = session?.user?.name || t("user");

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner className="h-12 w-12 text-main-400" />
      </div>
    );
  }

  if (error || !levels || levels.length === 0) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-4">
        <Typography variant="body-lg-medium" as="p" className="text-gray-500">
          {t("error") || "Failed to load rewards data"}
        </Typography>
      </div>
    );
  }

  const currentLevelData = levels.find((l) => l.level === previewLevel) || levels[0];

  return (
    <div className="space-y-6 pb-8">
      {/* Level Preview Buttons - FOR TESTING ONLY */}
      <div className="rounded-xl border-2 border-dashed border-orange-300 bg-orange-50 p-4">
        <Typography variant="body-sm-bold" as="p" className="mb-3 text-orange-700">
          Preview Mode (Testing Only) - Select a level to preview:
        </Typography>
        <div className="flex flex-wrap items-center gap-2">
          {levels.map((level) => (
            <button
              key={level._id}
              onClick={() => {
                setPreviewLevel(level.level);
                setPreviewCompletedRentals(Math.floor(level.rents * 0.4)); // 40% progress
                setExpandedLevel(`level-${level.level}`);
              }}
              className={cn(
                "rounded-lg px-4 py-2 text-sm font-semibold transition-all",
                previewLevel === level.level
                  ? "bg-main-600 text-white shadow-md"
                  : "bg-white text-gray-700 hover:bg-gray-100"
              )}
            >
              Level {level.level}
            </button>
          ))}
        </div>
        <div className="mt-3 flex items-center gap-4">
          <Typography variant="body-xs" as="span" className="text-orange-600">
            Completed Rentals:
          </Typography>
          <input
            type="range"
            min="0"
            max={currentLevelData.rents}
            value={previewCompletedRentals}
            onChange={(e) => setPreviewCompletedRentals(Number(e.target.value))}
            className="h-2 w-48 cursor-pointer appearance-none rounded-lg bg-gray-200"
          />
          <Typography variant="body-sm-bold" as="span" className="text-orange-700">
            {previewCompletedRentals} / {currentLevelData.rents}
          </Typography>
        </div>
      </div>

      <div className="mb-6 text-center lg:mb-8">
        <Typography variant="h2" as="h1" className="mb-2 text-main-600">
          {t("hero.subtitle")}
        </Typography>
        <Typography variant="h1" as="h1" className="text-main-600">
          {t("hero.title")}
        </Typography>
        <Typography variant="body-xl-tall" as="p" className="mt-2 text-main-600">
          {t("hero.tagline")}
        </Typography>
      </div>
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-2xl bg-main-600 shadow-xl">
        <div className="relative px-6 py-8 lg:px-10 lg:py-12">
          {/* User Level Card */}
          <div>
            <Typography variant="h3" as="h3" className="text-white">
              <span className="capitalize">{userName}</span>, {t("hero.you-are-at")}{" "}
              <span className={cn("font-bold", "text-secondary-500")}>
                {currentLevelData.title}
              </span>
              !
            </Typography>
            <Typography variant="h4" as="h4" className="mt-4 text-white font-semibold">
              {t("hero.complete-message", { nextLevel: Math.min(previewLevel + 1, 5) })}
            </Typography>
          </div>

          {/* Progress Count */}
          <div className="mt-6 text-center">
            <Typography variant="body-lg-bold" as="p" className="text-white">
              {previewCompletedRentals} / {currentLevelData.rents} {t("rentals")}
            </Typography>
          </div>

          {/* Progress Indicators */}
          {currentLevelData.rents > 10 ? (
            /* Carousel for many rentals */
            <div className="mx-auto mt-4 w-full max-w-md px-12 lg:max-w-lg lg:px-16">
              <Carousel
                key={`carousel-level-${previewLevel}`}
                opts={{
                  align: "start",
                  loop: false,
                  dragFree: true,
                  startIndex: Math.max(0, previewCompletedRentals - 5),
                }}
                setApi={setCarouselApi}
                className="w-full"
              >
                <CarouselContent className="-ml-2">
                  {Array.from({ length: currentLevelData.rents }).map((_, index) => {
                    const isCompleted = index < previewCompletedRentals;

                    return (
                      <CarouselItem
                        key={index}
                        className="basis-auto pl-2"
                      >
                        <div
                          className={cn(
                            "flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-300",
                            isCompleted
                              ? "border-white bg-main-400 text-white"
                              : "border-dashed border-gray-300 bg-white text-white"
                          )}
                        >
                          <Image
                            src={currentLevelData.icon}
                            alt="Rental"
                            width={56}
                            height={56}
                            className={cn(!isCompleted && "opacity-30 ")}
                          />
                        </div>
                      </CarouselItem>
                    );
                  })}
                </CarouselContent>
                <CarouselPrevious className="ltr:-left-10 rtl:-right-10 bg-white shadow-md hover:bg-gray-50 border-gray-200" />
                <CarouselNext className="ltr:-right-10 rtl:-left-10 bg-white shadow-md hover:bg-gray-50 border-gray-200" />
              </Carousel>
            </div>
          ) : (
            /* Flex layout for few rentals */
            <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
              {Array.from({ length: currentLevelData.rents }).map((_, index) => {
                const isCompleted = index < previewCompletedRentals;

                return (
                  <div
                    key={index}
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-300",
                      isCompleted
                        ? "border-white bg-main-400 text-white"
                        : "border-dashed border-gray-300 bg-white text-white"
                    )}
                  >
                    <Image
                      src={currentLevelData.icon}
                      alt="Rental"
                      width={56}
                      height={56}
                      className={cn(!isCompleted && "opacity-30")}
                    />
                  </div>
                );
              })}
            </div>
          )}

          <Typography variant="body-sm" as="p" className="mt-4 text-center text-main-600 hover:underline">
            <a href="#levels">{t("hero.complete-level-link")}</a>
          </Typography>

          {/* Points Summary */}
        </div>
      </div>
      <div className="mt-6 flex items-center justify-between rounded-lg bg-main-600 px-6 py-4 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <Typography variant="body-md" as="span" className="text-white">
            {t("hero.points-message", { points: (currentLevelData.rewards || currentLevelData.reward || 0).toLocaleString() })}
          </Typography>
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button className="rounded-full p-2 text-white/70 transition-colors hover:bg-white/10 hover:text-white">
                <HelpCircle className="h-5 w-5" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="left" className="max-w-xs">
              <p>{t("hero.points-tooltip")}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Welcome Section */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm lg:p-8">
        <Typography variant="h4" as="h2" className="mb-4 text-gray-900">
          {t("welcome.title")}
        </Typography>

        <ul className="space-y-3 text-gray-700">
          <li className="flex items-start gap-2">
            <span className="mt-1 text-lg">&#x1F58A;</span>
            <Typography variant="body-md" as="span">
              {t("welcome.point1")}
            </Typography>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-1 text-lg">&#x1F4B0;</span>
            <Typography variant="body-md" as="span">
              {t("welcome.point2")}
            </Typography>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-1 text-lg">&#x1F4B8;</span>
            <Typography variant="body-md" as="span">
              {t("welcome.point3")}
            </Typography>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-1 text-lg">&#x1F680;</span>
            <Typography variant="body-md" as="span">
              {t("welcome.point4")}
            </Typography>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-1 text-lg">&#x1F525;</span>
            <Typography variant="body-md" as="span">
              {t("welcome.point5")}
            </Typography>
          </li>
        </ul>

        <div className="mt-6 rounded-lg bg-main-50 px-4 py-3">
          <Typography variant="body-lg-bold" as="p" className="text-center text-main-700">
            {t("welcome.cta")}
          </Typography>
        </div>
      </div>

      {/* Rewards Levels Section */}
      <div id="levels" className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm lg:p-8">
        <div className="mb-6 flex items-center gap-3">
          <Image
            src="/icons/rentalIcon.svg"
            alt="Dyarko Rewards"
            width={48}
            height={48}
          />
          <div>
            <Typography variant="h4" as="h2" className="text-gray-900">
              {t("levels-section.title")}
            </Typography>
            <Typography variant="body-sm" as="p" className="text-gray-600">
              {t("levels-section.description")}
            </Typography>
          </div>
        </div>

        <Accordion
          type="single"
          collapsible
          value={expandedLevel}
          onValueChange={setExpandedLevel}
          className="space-y-3"
        >
          {levels.map((level) => {
            const isCurrentLevel = previewLevel === level.level;

            return (
              <AccordionItem
                key={level._id}
                value={`level-${level.level}`}
                className={cn(
                  "overflow-hidden rounded-xl transition-all duration-200",
                  isCurrentLevel
                    ? "border border-secondary-400 "
                    : "border border-gray-200 bg-white hover:border-gray-300"
                )}
              >
                <AccordionTrigger
                  className={cn(
                    "w-full px-4 py-4 hover:no-underline lg:px-6"
                  )}
                >
                  <div className="flex w-full items-center justify-between">
                    <div className="flex items-center gap-3 lg:gap-4">
                      <div
                        className={cn(
                          "flex h-8 items-center justify-center gap-1 rounded-full border px-3 text-xs font-medium lg:h-9 lg:text-sm",
                          isCurrentLevel
                            ? "border-secondary-500 bg-secondary-500 text-white"
                            : "border-main-600 bg-white text-main-600"
                        )}
                      >
                        <Image
                          src={currentLevelData.level >= level.level ? "/icons/unlockedIcon.svg" : "/icons/lockedIcon.svg"}
                          alt={`Level ${level.level} Icon`}
                          height={14}
                          width={14}
                        />
                        {t("level")} {level.level}
                      </div>
                      <div className="text-left rtl:text-right">
                        <Typography
                          variant="body-md-bold"
                          as="span"
                          className="block text-main-600"
                        >
                          {level.title} - {(level.rewards || level.reward || 0).toLocaleString()} {t("points")}
                        </Typography>
                      </div>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4 lg:px-6 lg:pb-6">
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-main-600">{t("reward")}:</span>
                      <span className="font-bold text-secondary-500">
                        {(level.rewards || level.reward || 0).toLocaleString()} {t("points")}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-700">{t("milestone")}:</span>
                      <span className="text-gray-600">
                        {level.rents} {t("more-rentals") || "rentals"}
                      </span>
                    </div>
                    {level.description && (
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-700">{t("vibe")}: </span>
                        <span className="text-gray-600 whitespace-pre-line">
                          {level.description}
                        </span>
                      </div>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </div>
    </div>
  );
}
