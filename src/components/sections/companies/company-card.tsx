"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { Rating } from "@mui/material";

import Typography from "@/components/shared/typography";
import Button from "@/components/shared/button";
import { Owner } from "@/lib/services/api/companies";
import { checkCompanyFavourite, addCompanyFavourite, removeCompanyFavourite } from "@/lib/services/api/favourites";

interface CompanyCardProps {
  owner: Owner;
  onFollowChange?: () => void;
}

export default function CompanyCard({ owner, onFollowChange }: CompanyCardProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations("Companies");
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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

  const handleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

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
      onFollowChange?.();
    } catch (error) {
      console.error("Error toggling favorite:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 gap-y-4 rounded-lg bg-main-100 p-6 transition-all hover:shadow-md sm:grid-cols-2 sm:gap-8 lg:grid-cols-4">
      <div className="relative col-span-1">
        <Image
          src={owner.image || "/assets/company.png"}
          width={240}
          height={240}
          alt={owner.name}
          className="h-[240px] w-full rounded-lg object-cover sm:w-[240px]"
        />
        <Button
          onClick={handleFavorite}
          variant={isFavorite ? "primary-outline" : "primary"}
          className="!absolute !right-2 !top-2 !rounded-md !px-2 !py-1 sm:!hidden"
          disabled={isLoading}
        >
          <Typography variant="body-xs-medium" as="p">
            {isFavorite ? t("unfollow") : t("follow")}
          </Typography>
        </Button>
      </div>

      <div className="col-span-1 mb-1 flex-grow md:col-span-2">
        <div className="flex items-center justify-between">
          <Typography variant="h4" as="h4" className="capitalize text-black">
            {owner.name}
          </Typography>
          <div className="flex items-center justify-center space-x-1">
            <Typography variant="body-xl-bold" as="p" className="text-[#423E5B]">
              {(owner.averageRating || owner.average_rating) && (owner.averageRating || owner.average_rating || 0) > 0
                ? parseFloat((owner.averageRating || owner.average_rating || 0).toString()).toFixed(1)
                : t("no-reviews")}
            </Typography>
            <Rating
              name="company-rating"
              value={owner.averageRating || owner.average_rating || 0}
              readOnly
              size="small"
            />
          </div>
        </div>
        <Typography variant="body-md" as="p" className="mb-8 mt-4 text-gray-600">
          {owner.about || t("about-placeholder")}
        </Typography>
      </div>

      <div className="relative col-span-1 hidden text-end sm:col-span-2 sm:block md:col-span-1">
        <Button
          variant={isFavorite ? "primary-outline" : "primary"}
          className="!px-5 !py-2 font-bold"
          onClick={handleFavorite}
          disabled={isLoading}
        >
          {isFavorite ? t("unfollow") : t("follow")}
        </Button>
      </div>
    </div>
  );
}
