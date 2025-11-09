"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import Image from "next/image";

import Typography from "@/components/shared/typography";
import Button from "@/components/shared/button";
import { Rating } from "@/components/ui/rating";
import { Owner, followOwner, unfollowOwner, isOwnerFollowed } from "@/lib/services/api/companies";

interface CompanyBannerProps {
  owner: Owner;
}

export default function CompanyBanner({ owner }: CompanyBannerProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations("Companies");
  const [followed, setFollowed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const checkFollowStatus = async () => {
      if (session?.user) {
        // const status = await isOwnerFollowed(owner._id);
        // setFollowed(status);
      }
    };
    checkFollowStatus();
  }, [owner._id, session]);

  const handleFollow = async () => {
    if (!session) {
      const currentPath = encodeURIComponent(pathname);
      router.push(`/login?redirect=${currentPath}`);
      return;
    }

    setIsLoading(true);
    try {
      if (followed) {
        await unfollowOwner(owner._id);
      } else {
        await followOwner(owner._id);
      }
      setFollowed(!followed);
    } catch (error) {
      console.error("Error toggling follow:", error);
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
            <Image
              src={owner.image || "/assets/company.png"}
              className="h-32 w-32 rounded-xl border-4 border-white object-cover shadow-lg md:h-40 md:w-40"
              alt={owner.name}
              width={160}
              height={160}
            />
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
            <Button
              variant={followed ? "primary-outline" : "primary"}
              className="!px-6 !py-2.5"
              onClick={handleFollow}
              disabled={isLoading}
            >
              {followed ? t("unfollow") : t("follow")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
