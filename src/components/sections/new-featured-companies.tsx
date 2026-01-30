"use client";

import React, { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import Typography from "@/components/shared/typography";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  CarouselDots,
} from "@/components/ui/carousel";
import { useBestCompanies } from "@/hooks/use-companies";
import { getLocalizedPath } from "@/lib/utils";

function CompaniesContent() {
  const locale = useLocale();
  const t = useTranslations("HomePage.FeaturedCompanies");

  const { data, isLoading, isError } = useBestCompanies(1, 16);

  const companies = data?.data?.items || [];

  if (isLoading) {
    return (
      <div className="grid grid-cols-3 gap-8 md:grid-cols-4 lg:grid-cols-8">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="flex flex-col items-center gap-2">
            <Skeleton className="h-24 w-24 rounded-full" />
            <Skeleton className="h-3 w-16" />
          </div>
        ))}
      </div>
    );
  }

  if (isError || companies.length === 0) {
    return (
      <div className="py-8 text-center text-sm text-gray-500">
        {t("noCompanies")}
      </div>
    );
  }

  // Group companies into slides - 3 for mobile, 4 for tablet, 8 for desktop
  const groupCompanies = () => {
    const groups = [];
    const itemsPerSlide = 8; // Desktop view
    for (let i = 0; i < companies.length; i += itemsPerSlide) {
      groups.push(companies.slice(i, i + itemsPerSlide));
    }
    return groups;
  };

  const companyGroups = groupCompanies();

  const CompanyCard = ({ company }: { company: typeof companies[0] }) => {
    const [imageError, setImageError] = React.useState(false);

    return (
      <div className="flex flex-col items-center justify-center">
        <Link
          className="flex justify-center"
          href={getLocalizedPath(`/companies/${company._id}`, locale)}
        >
          <div className="relative h-24 w-24 overflow-hidden rounded-full">
            {company.owner.image && !imageError ? (
              <Image
                className="rounded-full object-cover"
                fill
                src={`/api/proxy-image?url=${encodeURIComponent(company.owner.image)}`}
                alt={company.owner.name || "Company"}
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center rounded-full bg-linear-to-br from-main-400 to-main-600">
                <Typography variant="h3" as="span" className="font-bold text-white">
                  {company.owner.name?.charAt(0).toUpperCase() || "?"}
                </Typography>
              </div>
            )}
          </div>
        </Link>
        <Typography
          variant="body-sm"
          as="p"
          className="mt-2 text-center capitalize"
        >
          {company.owner.name}
        </Typography>
      </div>
    );
  };

  return (
    <Carousel
      opts={{
        align: "start",
        loop: true,
      }}
      className="w-full"
    >
      <CarouselContent>
        {companyGroups.map((group, groupIndex) => (
          <CarouselItem key={groupIndex}>
            <div className="grid grid-cols-3 gap-8 md:grid-cols-4 lg:grid-cols-8">
              {group.map((company) => (
                <CompanyCard key={company._id} company={company} />
              ))}
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="hidden md:flex" />
      <CarouselNext className="hidden md:flex" />
      <CarouselDots className="mt-8" />
    </Carousel>
  );
}

export default function FeaturedCompaniesSection() {
  const t = useTranslations("HomePage.FeaturedCompanies");

  return (
    <Suspense>
      <section className="bg-main-100 py-20">
        <div className="container px-4">
          <div className="mb-8 flex flex-col items-center space-y-4 text-center">
            <Typography
              variant="h2"
              as="h2"
              className="text-2xl font-bold leading-11 text-black sm:text-4xl sm:leading-14"
            >
              {t("main")}
            </Typography>
            <Typography variant="body-sm" as="p" className="text-gray-600">
              {t("sub")}
            </Typography>
          </div>
          <CompaniesContent />
        </div>
      </section>
    </Suspense>
  );
}
