"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useProperty } from "@/hooks/use-properties";
import { toast } from "sonner";
import { axiosClient } from "@/lib/services/axios-client";
import { ChevronLeft, Share2, Heart, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { getLocalizedPath, cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import PropertySlider from "./components/property-slider";
import AboutProperty from "./components/about-property";

interface PropertyDetailsProps {
  id: string;
}

export default function PropertyDetails({ id }: PropertyDetailsProps) {
  const locale = useLocale();
  const t = useTranslations("Properties.Details");
  const router = useRouter();
  const [liked, setLiked] = useState(false);

  const { data: property, isLoading, error, refetch } = useProperty(id);

  useEffect(() => {
    if (property) {
      // Create property view
      createPropertyView(id);
    }
  }, [property, id]);

  const createPropertyView = async (propertyId: string) => {
    try {
      await axiosClient.post(`/properties/${propertyId}/view`);
    } catch (e) {
      console.error("Failed to create property view:", e);
    }
  };

  const handleShareClicked = () => {
    const textToCopy = window?.location.href;

    navigator.clipboard
      .writeText(textToCopy)
      .then(() => {
        toast.success(t("Share.success"));
      })
      .catch((err) => {
        console.error("Could not copy URL: ", err);
        toast.error(t("Share.error"));
      });
  };

  const handleLikePressed = async () => {
    try {
      const response = liked
        ? await axiosClient.delete(`/save_properties/${id}`)
        : await axiosClient.post(`/save_properties/${id}`);

      if (response.data.success) {
        setLiked(!liked);
        if (liked) {
          toast.error(t("Save.unsaved"));
        } else {
          toast.success(t("Save.saved"));
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 dark:text-red-400">{t("error.title")}</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">{t("error.message")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Back Button */}
      <div className="container mx-auto px-4 pt-6">
        <Link
          href={getLocalizedPath("/properties", locale)}
          className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary-dark transition-colors"
        >
          <ChevronLeft className="h-5 w-5" />
          {t("back")}
        </Link>
      </div>

      <div className="container mx-auto px-4 py-8">
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
            >
              <Share2 className="h-4 w-4" />
              {t("Share.title")}
            </Button>

            {/* Like Button */}
            <Button
              variant="outline"
              onClick={handleLikePressed}
            >
              <Heart className={cn("h-4 w-4", liked && "fill-current")} />
              {liked ? t("Save.unfavorite") : t("Save.favorite")}
            </Button>
          </div>
        </div>

        {/* Property Slider */}
        {property && <PropertySlider property={property} />}

        {/* About Property */}
        {property && <AboutProperty property={property} />}
      </div>
    </div>
  );
}
