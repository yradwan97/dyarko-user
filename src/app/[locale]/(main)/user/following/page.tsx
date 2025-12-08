"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { Heart, Building2, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import Typography from "@/components/shared/typography";
import Button from "@/components/shared/button";
import { Spinner } from "@/components/ui/spinner";
import PaginationControls from "@/components/shared/pagination-controls";
import { useCompanyFavourites } from "@/hooks/use-company-favourites";
import { removeCompanyFavourite } from "@/lib/services/api/favourites";
import { getLocalizedPath, getProxiedImageUrl } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export default function FollowingPage() {
  const t = useTranslations("User.Following");
  const tCompanies = useTranslations("Companies");
  const tGeneral = useTranslations("General");
  const locale = useLocale();
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [unfollowingIds, setUnfollowingIds] = useState<Set<string>>(new Set());

  const { data, isLoading } = useCompanyFavourites(page, !!session);

  const companies = data?.data || [];
  const totalPages = data?.pages || 1;

  // Get initials from name (first 2 words)
  const getInitials = (name: string): string => {
    if (!name) return "?";
    const words = name.trim().split(" ").filter(Boolean);
    if (words.length === 1) {
      return words[0].charAt(0).toUpperCase();
    }
    return (words[0].charAt(0) + words[1].charAt(0)).toUpperCase();
  };

  const handleUnfollow = async (companyId: string) => {
    if (!session) {
      const currentPath = encodeURIComponent(pathname);
      router.push(`/login?redirect=${currentPath}`);
      return;
    }

    setUnfollowingIds((prev) => new Set(prev).add(companyId));
    try {
      await removeCompanyFavourite(companyId);
      queryClient.invalidateQueries({ queryKey: ["company-favourites"] });
    } catch (error) {
      console.error("Error unfollowing company:", error);
    } finally {
      setUnfollowingIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(companyId);
        return newSet;
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner className="h-12 w-12 text-main-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <Typography variant="h3" as="h3" className="font-bold">
          {t("title")}
        </Typography>
        <Typography variant="body-md" as="p" className="text-gray-500">
          {t("description")}
        </Typography>
      </div>

      {companies.length === 0 ? (
        <div className="py-12 text-center">
          <Building2 className="mx-auto h-16 w-16 text-gray-300 mb-4" />
          <Typography variant="body-lg-medium" as="p" className="text-gray-500 mb-2">
            {t("no-companies")}
          </Typography>
          <Typography variant="body-sm" as="p" className="text-gray-400">
            {t("no-companies-description")}
          </Typography>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {companies.map((favourite) => {
              const company = favourite.item as any;
              const isUnfollowing = unfollowingIds.has(company._id);

              return (
                <div
                  key={favourite._id}
                  className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-gray-100 dark:border-gray-700"
                >
                  <Link href={getLocalizedPath(`/companies/${company._id}`, locale)}>
                    <div className="relative h-48 w-full bg-gray-100 dark:bg-gray-700">
                      {company.image ? (
                        <Image
                          src={getProxiedImageUrl(company.image)}
                          alt={company.name || tCompanies("company")}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center bg-main-100 dark:bg-main-900">
                          <span className="text-5xl font-bold text-main-600 dark:text-main-400">
                            {getInitials(company.name || company.organizationName || "")}
                          </span>
                        </div>
                      )}
                    </div>
                  </Link>
                  <div className="p-4">
                    <Link href={getLocalizedPath(`/companies/${company._id}`, locale)}>
                      <Typography
                        variant="h5"
                        as="h5"
                        className="font-semibold text-gray-900 dark:text-white hover:text-main-600 transition-colors capitalize truncate"
                      >
                        {company.name || company.organizationName || tCompanies("company")}
                      </Typography>
                    </Link>

                    {/* Rating */}
                    <div className="flex items-center gap-1 mt-2">
                      {(company.averageRating || company.average_rating || 0) > 0 ? (
                        <>
                          <span className="text-sm text-yellow-500 font-bold me-1">
                            {(company.averageRating || company.average_rating || 0).toFixed(1)}
                          </span>
                          {[1, 2, 3, 4, 5].map((star) => {
                            const rating = company.averageRating || company.average_rating || 0;
                            const fillPercentage = Math.min(100, Math.max(0, (rating - star + 1) * 100));
                            return (
                              <div key={star} className="relative h-4 w-4">
                                {/* Background (empty) star */}
                                <Star className="absolute h-4 w-4 text-gray-300" />
                                {/* Filled star with clip */}
                                {fillPercentage > 0 && (
                                  <div
                                    className="absolute overflow-hidden"
                                    style={{ width: `${fillPercentage}%` }}
                                  >
                                    <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </>
                      ) : (
                        <Typography variant="body-sm" as="span" className="text-gray-500">
                          {tCompanies("no-reviews")}
                        </Typography>
                      )}
                    </div>

                    {/* About (truncated) */}
                    {company.about && (
                      <Typography
                        variant="body-sm"
                        as="p"
                        className="text-gray-600 dark:text-gray-400 mt-2 line-clamp-2"
                      >
                        {company.about}
                      </Typography>
                    )}

                    {/* Unfollow Button */}
                    <div className="mt-4">
                      <Button
                        variant="primary-outline"
                        className="w-full"
                        onClick={() => handleUnfollow(company._id)}
                        disabled={isUnfollowing}
                      >
                        {isUnfollowing ? (
                          <Spinner className="h-4 w-4" />
                        ) : (
                          <>
                            <Heart className="h-4 w-4 fill-current me-2" />
                            {tCompanies("unfollow")}
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center pt-4">
              <PaginationControls
                currentPage={page}
                totalPages={totalPages}
                onPageChange={setPage}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
