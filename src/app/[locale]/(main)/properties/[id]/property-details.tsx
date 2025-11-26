"use client";

import { useEffect, useState, useMemo } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useQueryClient } from "@tanstack/react-query";
import { useProperty } from "@/hooks/use-properties";
import { useCountries } from "@/hooks/use-countries";
import { toast } from "sonner";
import { axiosClient } from "@/lib/services/axios-client";
import { addFavourite, removeFavourite } from "@/lib/services/api/favourites";
import { ChevronLeft, Share2, Heart, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { getLocalizedPath, cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import PropertySlider from "./components/property-slider";
import AboutProperty from "./components/about-property";

interface PropertyDetailsProps {
  id: string;
}

export default function PropertyDetails({ id }: PropertyDetailsProps) {
  const locale = useLocale();
  const t = useTranslations("Properties.Details");
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
      setLiked(property.isFavourite);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [property, id]);

  // const checkFavoriteStatus = async () => {
  //   try {
  //     const isFavorited = await checkFavourite(id);
  //     setLiked(isFavorited);
  //   } catch (error) {
  //     console.error("Failed to check favorite status:", error);
  //   }
  // };

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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Back Button */}
      <div className="container mx-auto pt-6">
        <Link
          href={getLocalizedPath("/properties", locale)}
          className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary/80 transition-all hover:gap-3"
        >
          <ChevronLeft className={`h-5 w-5 ${locale === "ar" ? "rotate-180" : "" }`} />
          {t("back")}
        </Link>
      </div>

      <div className="container mx-auto py-8">
        {/* Title */}
        <div className="flex items-start gap-3 mt-4">
          <h1
            className={`text-4xl font-bold capitalize leading-tight text-gray-900 dark:text-white flex-1 ${
              locale === "ar" && "text-end"
            }`}
          >
            {property.title}
          </h1>
          {property.isVerified && (
            <div className="flex items-center gap-1.5 mt-2 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30">
              <CheckCircle2 className="h-4 w-4 text-blue-600 dark:text-blue-400" fill="currentColor" />
              <span className="text-sm font-medium text-blue-600 dark:text-blue-400">Verified</span>
            </div>
          )}
        </div>
        {property.code && (
          <p className={`mt-2 text-sm font-medium text-gray-500 dark:text-gray-400 ${locale === "ar" && "text-end"}`}>
            {property.code}
          </p>
        )}

        {/* Address and Actions */}
        <div
          className={`mt-4 flex flex-col space-y-4 ${
            locale === "ar" ? "lg:flex-row-reverse" : "lg:flex-row"
          } lg:items-center lg:justify-between lg:space-y-0`}
        >
          <p className="text-lg font-medium text-gray-500 dark:text-gray-400">
            {property.city}, {property.region}, {property.country}
          </p>

          <div className="flex flex-wrap gap-4">
            {/* Share Button */}
            <Button
              variant="outline"
              onClick={handleShareClicked}
              className="hover:bg-main-500 hover:text-white hover:border-primary transition-all"
            >
              <Share2 className="h-4 w-4" />
              {t("Share.title")}
            </Button>

            {/* Like Button */}
            <Button
              variant="outline"
              onClick={handleLikePressed}
              className={cn(
                "hover:bg-main-500 hover:text-white hover:border-primary transition-all",
                liked && "bg-red-50 border-red-300 text-red-600 hover:bg-red-600 hover:text-white"
              )}
            >
              <Heart className={cn("h-4 w-4", liked && "fill-current")} />
              {liked ? t("Save.unfavorite") : t("Save.favorite")}
            </Button>
          </div>
        </div>

        {/* Property Slider */}
        {property && <PropertySlider property={property} />}

        {/* About Property */}
        {property && <AboutProperty property={property} currency={currency} />}
      </div>
    </div>
  );
}
