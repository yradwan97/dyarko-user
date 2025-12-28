"use client";

import { useEffect, useState, useMemo } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useQueryClient } from "@tanstack/react-query";
import { useProperty } from "@/hooks/use-properties";
import { useCountries } from "@/hooks/use-countries";
import { toast } from "sonner";
import { axiosClient } from "@/lib/services/axios-client";
import { addFavourite, removeFavourite } from "@/lib/services/api/favourites";
import { ChevronLeft, Share2, Heart, ChevronRight } from "lucide-react";
import Link from "next/link";
import { getLocalizedPath, cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getPropertyPrice, getPropertyPeriod, formatPrice } from "@/lib/utils/property-pricing";
import PropertySlider from "./components/property-slider";
import AboutProperty from "./components/about-property";
import BoothCampDetails from "./components/booth-camp-details";
import HotelApartmentTypes from "./components/hotel-apartment-types";
import ReservationBox from "./components/reservation-box";
import OwnerInfoBox from "./components/owner-info-box";

interface PropertyDetailsProps {
  id: string;
}

export default function PropertyDetails({ id }: PropertyDetailsProps) {
  const locale = useLocale();
  const t = useTranslations("Properties.Details");
  const tPrice = useTranslations("Properties.Price");
  const queryClient = useQueryClient();
  const [liked, setLiked] = useState(false);

  const { data: property, isLoading, error } = useProperty(id);
  const { data: countries } = useCountries();

  // Get currency based on property country
  const currency = useMemo(() => {
    if (!property || !countries) return "KWD";
    const country = countries.find(c =>
      c.countryEn === property.country ||
      c.countryAr === property.country ||
      c.code === property.country
    );
    return country?.currency || "KWD";
  }, [property, countries]);

  useEffect(() => {
    if (property) {
      // Create property view
      createPropertyView(id);
      // Set favourite status from property
      setLiked(property.isFavourite ?? false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [property, id]);

  const createPropertyView = async (propertyId: string) => {
    try {
      await axiosClient.post(`/properties/${propertyId}/view`);
    } catch (e: any) {
      // Ignore canceled requests (happens when component unmounts or navigates away)
      if (e?.code !== 'ERR_CANCELED' && e?.name !== 'CanceledError') {
        console.error("Failed to create property view:", e);
      }
    }
  };

  const handleShareClicked = async () => {
    if (navigator.share && property) {
      try {
        await navigator.share({
          title: property.title,
          text: property.description,
          url: window.location.href,
        });
      } catch (error) {
        console.error("Error sharing:", error);
      }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href);
        toast.success(t("Share.copied"));
      } catch (error) {
        console.error("Failed to copy URL:", error);
        toast.error(t("Share.error"));
      }
    }
  };

  const handleLikePressed = async () => {
    try {
      if (liked) {
        await removeFavourite(id);
        setLiked(false);
        toast.error(t("Save.unsaved"));
      } else {
        await addFavourite(id);
        setLiked(true);
        toast.success(t("Save.saved"));
      }

      // Invalidate favourites query to refresh the saved properties list
      queryClient.invalidateQueries({ queryKey: ["favourites"] });
    } catch (error) {
      console.error("Failed to toggle favorite:", error);
      toast.error(t("Save.error"));
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner className="h-12 w-12 text-main-400" />
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 dark:text-red-400">{t("error.title")}</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">{t("error.message")}</p>
        </div>
      </div>
    );
  }

  // Get price information
  const price = getPropertyPrice(property);
  const period = getPropertyPeriod(property);
  const hasDiscount = property.discount > 0;
  const originalPrice = hasDiscount && price ? price + property.discount : null;

  // Check if property is booth or camp category
  const isBoothOrCamp = property.category === "booth" || property.category === "camp";
  // Check if property is hotel apartment category
  const isHotelApartment = property.category === "hotelapartment";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Navigation - Back Button and Breadcrumb */}
      <div className="container mx-auto pt-6" dir={locale === "ar" ? "rtl" : "ltr"}>
        <div className="flex flex-wrap items-center gap-4">
          {/* Back Button */}
          <Link
            href={getLocalizedPath(`/property-listing/${property.offerType}`, locale)}
            className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary/80 transition-all hover:gap-3"
          >
            <ChevronLeft className="h-5 w-5 rtl:rotate-180" />
            {t("back")}
          </Link>

          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm">
            <Link
              href={getLocalizedPath(`/property-listing/${property.offerType}`, locale)}
              className="text-main-600 hover:text-main-700 font-medium underline"
            >
              {t("properties")}
            </Link>
            <ChevronRight className="h-4 w-4 text-gray-400 rtl:rotate-180" />
            <span className="text-gray-600 dark:text-gray-400 font-medium">
              {t("property-details")}
            </span>
          </nav>
        </div>
      </div>

      <div className="container mx-auto py-6">
        {/* Property Gallery Slider */}
        <PropertySlider property={property} />

        {/* Property Info + Reservation Section */}
        <div className={cn(
          "mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8",
          locale === "ar" && "lg:flex-row-reverse"
        )}>
          {/* LEFT: Property Info + About Property Content */}
          <div className={cn("lg:col-span-2", locale === "ar" && "lg:order-2")} dir={locale === "ar" ? "rtl" : "ltr"}>
            {/* Title, Code, Location, Price, Save/Share */}
            <div className="flex flex-wrap items-start justify-between gap-4">
              {/* Title, Code, Location */}
              <div className="flex-1">
                <h1 className="text-2xl md:text-3xl font-bold capitalize leading-tight text-gray-900 dark:text-white">
                  {property.title}
                </h1>

                {/* Property Code */}
                {property.code && (
                  <p className="mt-1 text-sm font-medium text-gray-500 dark:text-gray-400">
                    {property.code}
                  </p>
                )}

                {/* Location */}
                <button
                  onClick={() => {
                    document.getElementById("map-location")?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="mt-2 text-main-600 hover:text-main-700 font-medium underline text-sm"
                >
                  {property.city}, {property.region}, {property.country}
                </button>
              </div>

              {/* Save/Share Buttons */}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLikePressed}
                  className={cn(
                    "h-8 px-0 py-1 rounded-md border-0 bg-[#A8DADC] text-main-600 hover:bg-teal-300 transition-all gap-2"
                  )}
                >
                  <Heart className={cn("h-5 w-5", liked && "fill-main-500")} />
                  <span className="font-medium">{liked ? t("Save.title-saved"): t("Save.title-save")}</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleShareClicked}
                  className="h-8 px-0 py-1 rounded-md border-0 bg-[#A8DADC] text-main-600 hover:bg-teal-300 transition-all gap-2"
                >
                  <Share2 className="h-5 w-5" />
                  <span className="font-medium">{t("Share.title")}</span>
                </Button>
              </div>
            </div>

            {/* Price */}
            <div className="mt-4 flex items-baseline gap-3">
              <span className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                {price ? formatPrice(price, currency, locale) : "N/A"}
              </span>
              {hasDiscount && originalPrice && (
                <span className="text-lg text-gray-400 line-through">
                  {formatPrice(originalPrice, currency, locale)}
                </span>
              )}
              {property.offerType === "rent" && period && (
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  / {tPrice(period)}
                </span>
              )}
            </div>

            {/* About Property Content - Inside Left Column */}
            {isBoothOrCamp ? (
              <div className="flex w-full">
                <Tabs defaultValue="property" className="mt-8 w-full">
                  <TabsList className="inline-flex w-1/2 h-14 items-center self-center justify-center rounded-md border border-gray-200 bg-[#F4F5F7] p-2 mb-6">
                    <TabsTrigger
                      value="property"
                      className="inline-flex items-center justify-center whitespace-nowrap rounded-md px-8 py-2.5 text-sm font-medium transition-all data-[state=active]:bg-[#142742] data-[state=active]:text-white data-[state=inactive]:bg-transparent data-[state=inactive]:text-[#617289]"
                    >
                      {t("tabs.property-details")}
                    </TabsTrigger>
                    <TabsTrigger
                      value="units"
                      className="inline-flex items-center justify-center whitespace-nowrap rounded-md px-8 py-2.5 text-sm font-medium transition-all data-[state=active]:bg-[#142742] data-[state=active]:text-white data-[state=inactive]:bg-transparent data-[state=inactive]:text-[#617289]"
                    >
                      {property.category === "booth" ? t("tabs.booth-details") : t("tabs.camp-details")}
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="property">
                    {property && <AboutProperty property={property} currency={currency} />}
                  </TabsContent>
                  <TabsContent value="units">
                    <BoothCampDetails
                      property={property}
                      type={property.category as "booth" | "camp"}
                      currency={currency}
                    />
                  </TabsContent>
                </Tabs>
              </div>
            ) : isHotelApartment ? (
              <div className="flex w-full">
                <Tabs defaultValue="property" className="mt-8 w-full">
                  <TabsList className="inline-flex w-1/2 h-14 items-center self-center justify-center rounded-md border border-gray-200 bg-[#F4F5F7] p-2 mb-6">
                    <TabsTrigger
                      value="property"
                      className="inline-flex items-center justify-center whitespace-nowrap rounded-md px-8 py-2.5 text-sm font-medium transition-all data-[state=active]:bg-[#142742] data-[state=active]:text-white data-[state=inactive]:bg-transparent data-[state=inactive]:text-[#617289]"
                    >
                      {t("tabs.hotel-details")}
                    </TabsTrigger>
                    <TabsTrigger
                      value="types"
                      className="inline-flex items-center justify-center whitespace-nowrap rounded-md px-8 py-2.5 text-sm font-medium transition-all data-[state=active]:bg-[#142742] data-[state=active]:text-white data-[state=inactive]:bg-transparent data-[state=inactive]:text-[#617289]"
                    >
                      {t("tabs.types-details")}
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="property">
                    {property && <AboutProperty property={property} currency={currency} />}
                  </TabsContent>
                  <TabsContent value="types">
                    <HotelApartmentTypes property={property} currency={currency} />
                  </TabsContent>
                </Tabs>
              </div>
            ) : (
              /* About Property for regular categories */
              property && <AboutProperty property={property} currency={currency} />
            )}
          </div>

          {/* RIGHT: Reservation Box + Owner Info - Sticky Sidebar */}
          <div className={cn("lg:col-span-1", locale === "ar" && "lg:order-1")}>
            <div className="space-y-4">
              <ReservationBox property={property} currency={currency} />
              <OwnerInfoBox property={property} />

              {/* Newsletter Section */}
              <div className="rounded-xl border-[1.5px] border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                <h3 className="text-lg font-bold text-center text-gray-900 dark:text-white mb-3">
                  {t("newsletter.title")}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-4">
                  {t("newsletter.description")}
                </p>
                <input
                  type="email"
                  placeholder={t("newsletter.placeholder")}
                  className="w-full h-12 px-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-sm mb-3"
                />
                <Button className="flex w-full items-center justify-center gap-2 h-12 border-0 text-white bg-steelBlue-500 hover:text-steelBlue-500 hover:border-steelBlue-500 hover:border font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                  {t("newsletter.submit")}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
