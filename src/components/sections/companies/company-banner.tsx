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

  return (
    <div className="relative mb-8">
      {/* Banner Background */}
      <div className="h-[200px] w-full bg-gradient-to-r from-main-100 to-main-50 md:h-[250px]"></div>

      {/* Company Info */}
      <div className="container relative -mt-24 md:-mt-20">
        <div className="flex flex-col items-center gap-4 md:flex-row md:items-end md:gap-6">
          <div className="relative">
            {hasValidImage && !imageError ? (
              <Image
                src={owner.image!}
                className="h-32 w-32 rounded-xl border-4 border-white object-cover shadow-lg md:h-40 md:w-40"
                alt={owner.name}
                width={160}
                height={160}
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="flex h-32 w-32 items-center justify-center rounded-xl border-4 border-white bg-main-500 shadow-lg md:h-40 md:w-40">
                <span className="text-3xl font-bold text-white md:text-4xl">
                  {initials}
                </span>
              </div>
            )}
          </div>
          <div className="flex flex-grow flex-col items-center gap-2 text-center md:items-start md:text-left">
            <Typography variant="h3" as="h1" className="capitalize text-gray-900">
              {owner.name}
            </Typography>
            <Rating
              value={owner.averageRating || owner.average_rating || 0}
              size="md"
              showValue
            />
          </div>
          <div className="mt-2 md:mt-0">
            <Tooltip>
              <TooltipTrigger asChild>
                <span>
                  <Button
                    variant={isFavorite ? "primary-outline" : "primary"}
                    className="!px-6 !py-2.5"
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
    </div>
  );
}
