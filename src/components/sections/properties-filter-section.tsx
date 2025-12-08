"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { KeyIcon } from "@/components/icons";
import Typography from "@/components/shared/typography";
import Button from "@/components/shared/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Skeleton } from "@/components/ui/skeleton";
import { useCities } from "@/hooks/use-cities";
import { useProperties } from "@/hooks/use-properties";
import { useCountryContext } from "@/components/providers/country-provider";
import { getLocalizedPath, cn } from "@/lib/utils";
import { formatPrice, getPropertyPrice, getPropertyPeriod, getOtherPrices } from "@/lib/utils/property-pricing";
import { useCurrency } from "@/hooks/use-currency";
import { BuildingIcon } from "lucide-react";
import PropertyCard from "@/components/shared/property-card";

export default function PropertiesFilterSection() {
  const t = useTranslations("HomePage.Properties");
  const tGeneral = useTranslations("General");
  const tProperty = useTranslations("Properties");
  const tPrice = useTranslations("Properties.Price");
  const locale = useLocale();
  const router = useRouter();
  const isRTL = locale === "ar";
  const currency = useCurrency();
  const { selectedCountry } = useCountryContext();
  const { data: cities, isLoading: citiesLoading } = useCities(selectedCountry);
  const [activeTab, setActiveTab] = useState<"rent" | "installment">("rent");
  const [selectedCity, setSelectedCity] = useState<string>("");

  // Fetch properties based on selected city and active tab
  const { data: propertiesData, isLoading: propertiesLoading } = useProperties({
    city: selectedCity || undefined,
    country: selectedCountry || undefined,
    offerType: activeTab === "rent" ? "RENT" : "INSTALLMENT",
    size: 10,
  });

  const tabstyle = "flex items-center px-3 sm:px-5 cursor-pointer text-sm md:text-lg";

  // Set initial city when cities are loaded or country changes
  useEffect(() => {
    if (cities && cities.length > 0) {
      setSelectedCity(cities[0].key);
    }
  }, [cities]);

  const handleBrowse = () => {
    const queryParams = new URLSearchParams();
    if (selectedCity) {
      queryParams.append("city", selectedCity);
    }
    if (selectedCountry) {
      queryParams.append("country", selectedCountry);
    }

    const path = getLocalizedPath(
      `/property-listing/${activeTab}?${queryParams.toString()}`,
      locale
    );
    router.push(path);
  };

  return (
    <section className="bg-linear-to-t from-main-100 to-white px-4">
      <div className="container mx-auto py-20">
        <div className="mb-20 flex flex-col space-y-4 text-center">
          <Typography variant="h2" as="h2" className="font-bold text-black">
            {t("title-head")}
          </Typography>
          <Typography
            variant="body-lg-medium"
            as="p"
            className="mx-auto text-gray-600 lg:w-2/3"
          >
            {t("title-desc")}
          </Typography>
        </div>
        <div className="flex flex-col items-center gap-5 lg:flex-row lg:justify-between lg:gap-0">
          <ul className="flex flex-row items-center rounded-lg border-[1.5px] border-main-100 bg-white p-2">
            <li
              className={`${
                activeTab === "rent"
                  ? "stroke-main-600 font-bold text-main-600 shadow-[0_3px_40px_rgba(14,8,84,0.05)]"
                  : "stroke-gray-500 font-medium text-gray-500"
              } ${tabstyle}`}
              onClick={() => setActiveTab("rent")}
            >
              <KeyIcon className="stroke-inherit mr-2 h-4 w-4" />
              {tGeneral("PaymentMethods.rent")}
            </li>
            <li
              className={`${
                activeTab === "installment"
                  ? "stroke-main-600 font-bold text-main-600 shadow-[0_3px_40px_rgba(14,8,84,0.05)]"
                  : "stroke-gray-500 font-medium text-gray-500"
              } ${tabstyle}`}
              onClick={() => setActiveTab("installment")}
            >
              <BuildingIcon className="stroke-inherit mr-2 h-5 w-5" />
              {tGeneral("PaymentMethods.installment")}
            </li>
          </ul>
          <div className="relative mx-auto w-full sm:w-3/4 md:w-5/12 lg:w-4/12">
            <Select
              value={selectedCity}
              onValueChange={setSelectedCity}
              disabled={citiesLoading}
            >
              <SelectTrigger className="w-full justify-between rounded-lg border border-gray-300 bg-white px-5 py-5">
                <SelectValue placeholder={citiesLoading ? "Loading..." : "Select City"} />
              </SelectTrigger>
              <SelectContent>
                {(cities || []).map((city) => (
                  <SelectItem key={city.key} value={city.key}>
                    {locale === "ar" ? city.cityAr : city.city}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button variant="primary" onClick={handleBrowse} className="block w-full py-2 sm:w-fit">
            {tGeneral("browse")}
          </Button>
        </div>
      </div>
      {/* Property Carousel */}
      <div className="container mx-auto pb-20">
        {propertiesLoading ? (
          <div className="flex gap-4 overflow-hidden">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="min-w-[280px] shrink-0">
                <Skeleton className="h-44 w-full rounded-t-lg" />
                <div className="p-4 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                  <Skeleton className="h-5 w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : propertiesData?.data?.data && propertiesData.data.data.length > 0 ? (
          <Carousel
            opts={{
              align: "start",
              loop: propertiesData.data.data.length > 3,
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-4">
              {propertiesData.data.data.map((property) => {
                const price = getPropertyPrice(property);
                const period = getPropertyPeriod(property);
                const periodText = period ? ` / ${tPrice(period)}` : "";
                const displayPrice = price
                  ? `${formatPrice(price, currency, locale)}${periodText}`
                  : tGeneral("price-not-available");
                const otherPrices = getOtherPrices(property, period, currency, locale, tPrice);

                return (
                  <CarouselItem
                    key={property._id}
                    className="pl-4 basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4"
                  >
                    <Link href={getLocalizedPath(`/properties/${property._id}`, locale)}>
                      <PropertyCard
                        variant="featured"
                        image={property.image}
                        name={property.title}
                        location={`${isRTL ? property.region : property.region}, ${property.city}`}
                        price={displayPrice}
                        badge={property.offerType?.toLowerCase()}
                        propertyType={
                          locale === "ar"
                            ? tGeneral(`Categories.${property.category}`)
                            : property.category
                        }
                        propertyId={property._id}
                        isVerified={property.isVerified}
                        adType={property.adType}
                        otherPrices={otherPrices}
                      />
                    </Link>
                  </CarouselItem>
                );
              })}
            </CarouselContent>
            <CarouselPrevious className={cn(
              "hidden md:flex",
              isRTL ? "-right-12" : "-left-12"
            )} />
            <CarouselNext className={cn(
              "hidden md:flex",
              isRTL ? "-left-12" : "-right-12"
            )} />
          </Carousel>
        ) : (
          <div className="text-center py-10 text-gray-500">
            {t("no-properties")}
          </div>
        )}
      </div>
    </section>
  );
}
