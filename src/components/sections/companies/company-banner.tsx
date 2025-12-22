"use client";

import { useState, useEffect, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import Image from "next/image";

import Typography from "@/components/shared/typography";
import Button from "@/components/shared/button";
import { Rating } from "@/components/ui/rating";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Owner } from "@/lib/services/api/companies";
import { checkCompanyFavourite, addCompanyFavourite, removeCompanyFavourite } from "@/lib/services/api/favourites";

const isValidImageUrl = (url: string | undefined | null): boolean => {
  if (!url) return false;
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

const getInitials = (name: string): string => {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

interface CompanyBannerProps {
  owner: Owner;
}

export default function CompanyBanner({ owner }: CompanyBannerProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations("Companies");
  const tGeneral = useTranslations("General");
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [imageError, setImageError] = useState(false);

  const hasValidImage = useMemo(() => isValidImageUrl(owner.image), [owner.image]);
  const initials = useMemo(() => getInitials(owner.name), [owner.name]);

  useEffect(() => {
    const checkFavoriteStatus = async () => {
      if (session?.user) {
        try {
          const status = await checkCompanyFavourite(owner._id);
          setIsFavorite(status);
        } catch (error) {
          console.error("Error checking favorite status:", error);
        }
      }
    };
    checkFavoriteStatus();
  }, [owner._id, session]);

  const handleFavorite = async () => {
    if (!session) {
      const currentPath = encodeURIComponent(pathname);
      router.push(`/login?redirect=${currentPath}`);
      return;
    }

    setIsLoading(true);
    try {
      if (isFavorite) {
        await removeCompanyFavourite(owner._id);
      } else {
        await addCompanyFavourite(owner._id);
      }
      setIsFavorite(!isFavorite);
    } catch (error) {
      console.error("Error toggling favorite:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Get owner type label
  const getOwnerTypeLabel = () => {
    if (owner.ownerType) {
      return owner.ownerType.charAt(0).toUpperCase() + owner.ownerType.slice(1);
    }
    return t("owner");
  };

  return (
    <div className="relative mb-4">
      {/* Banner Background */}
      <div className="h-[100px] w-full bg-gradient-to-r from-main-100 to-main-50 md:h-[120px]"></div>

      {/* Company Info - Centered Layout */}
      <div className="container relative -mt-14 md:-mt-16">
        <div className="flex flex-col items-center gap-2">
          {/* Profile Image with Verified Badge */}
          <div className="relative">
            {hasValidImage && !imageError ? (
              <Image
                src={owner.image!}
                className="h-28 w-28 rounded-full border-4 border-white object-cover shadow-lg md:h-32 md:w-32"
                alt={owner.name}
                width={128}
                height={128}
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="flex h-28 w-28 items-center justify-center rounded-full border-4 border-white bg-main-500 shadow-lg md:h-32 md:w-32">
                <span className="text-2xl font-bold text-white md:text-3xl">
                  {initials}
                </span>
              </div>
            )}
            {owner.isVerified && (
              <div className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-main-600 text-white shadow-md">
                <svg
                  className="h-4 w-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            )}
          </div>

          {/* Name and Type */}
          <div className="flex flex-col items-center gap-1 text-center">
            <Typography variant="h3" as="h1" className="capitalize text-gray-900">
              {owner.name}
            </Typography>
            <Typography variant="body-md" as="p" className="text-main-600">
              {getOwnerTypeLabel()}
            </Typography>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">
              {(owner.averageRating || owner.average_rating || 0).toFixed(1)}
            </span>
            <Rating
              value={owner.averageRating || owner.average_rating || 0}
              size="sm"
            />
          </div>

          {/* Follow Button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <span>
                <Button
                  variant={isFavorite ? "primary-outline" : "primary"}
                  className="!rounded-full !px-8 !py-2.5"
                  onClick={handleFavorite}
                  disabled={!session || isLoading}
                >
                  {isFavorite ? t("unfollow") : t("follow")}
                </Button>
              </span>
            </TooltipTrigger>
            {!session && (
              <TooltipContent side="bottom">
                {tGeneral("login-required")}
              </TooltipContent>
            )}
          </Tooltip>
        </div>
      </div>
    </div>
  );
}
