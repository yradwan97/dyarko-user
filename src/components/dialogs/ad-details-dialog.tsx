"use client";

import { useState, useMemo } from "react";
import { useTranslations, useLocale } from "next-intl";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAdDetails, useAdComments } from "@/hooks/use-ads";
import { Spinner } from "@/components/ui/spinner";
import Typography from "@/components/shared/typography";
import { Button } from "@/components/ui/button";
import { useCountries } from "@/hooks/use-countries";
import { cn } from "@/lib/utils";

interface AdDetailsDialogProps {
  adId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AdDetailsDialog({
  adId,
  open,
  onOpenChange,
}: AdDetailsDialogProps) {
  const t = useTranslations("User.MyRequests");
  const locale = useLocale();
  const [currentPage, setCurrentPage] = useState(1);
  const commentsPerPage = 6;

  const { data: adData, isLoading: adLoading } = useAdDetails(adId || undefined);
  const { data: commentsData, isLoading: commentsLoading } = useAdComments(adId || undefined);
  const { data: countries } = useCountries();

  // Validate image URL
  const isValidImageUrl = (url: string | undefined | null): boolean => {
    if (!url || typeof url !== "string" || url.trim() === "") return false;
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  // Get initials from name
  const getInitials = (name: string): string => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Helper function to get currency from country code
  const getCurrency = (countryCode?: string): string => {
    if (!countries || !countryCode) {
      return "KWD"; // Default currency
    }
    const country = countries.find(
      (c) => c.code.toUpperCase() === countryCode.toUpperCase()
    );
    return country?.currency || "KWD";
  };

  const ad = adData?.data;
  const allComments = (commentsData?.data as any)?.data || commentsData || [];
  const currency = getCurrency(ad?.user?.country);

  // Determine status based on whether ad has a comment
  const adStatusKey = ad?.comment ? "replied" : "pending";
  const adStatus = ad?.comment ? t("status-replied") : t("status-pending");

  // Pagination logic
  const totalPages = Math.ceil(allComments.length / commentsPerPage);
  const comments = useMemo(() => {
    const startIndex = (currentPage - 1) * commentsPerPage;
    const endIndex = startIndex + commentsPerPage;
    return allComments.slice(startIndex, endIndex);
  }, [allComments, currentPage]);

  // Reset page when dialog opens
  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen) {
      setCurrentPage(1);
    }
    onOpenChange(isOpen);
  };

  const formatStatus = (status: string) => {
    if (!status) return "";
    return status
      .toLowerCase()
      .split("_")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const getStatusColor = (status: string) => {
    const normalizedStatus = status?.toLowerCase() || "";
    switch (normalizedStatus) {
      case "approved":
      case "accepted":
      case "completed":
      case "confirmed":
      case "replied":
        return "text-green-600 bg-green-50 border-green-200";
      case "pending":
      case "under_review":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "rejected":
      case "cancelled":
        return "text-red-600 bg-red-50 border-red-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" dir={locale === "ar" ? "rtl" : "ltr"}>
        <DialogHeader>
          <DialogTitle className="flex items-center justify-center">
            <span>{t("ads-request")}</span>
          </DialogTitle>
        </DialogHeader>

        {adLoading ? (
          <div className="flex justify-center py-12">
            <Spinner className="h-12 w-12 text-main-400" />
          </div>
        ) : ad ? (
          <div className="space-y-6">
            {/* Listing Details Section */}
            <div>
              <div className={cn(
                "flex items-center justify-between mb-3"
              )}>
                <Typography variant="body-sm" as="p" className="text-gray-500">
                  {t("listing-details")}
                </Typography>
                <span
                  className={cn(
                    "rounded-full border px-3 py-1 text-xs font-medium whitespace-nowrap",
                    getStatusColor(adStatusKey)
                  )}
                >
                  {adStatus}
                </span>
              </div>

              <div className={`space-y-3 ${locale === "ar" ? "text-right" : ""}`}>
                <Typography variant="h5" as="h5" className="font-bold">
                  {ad.title}
                </Typography>
                <Typography variant="body-sm" as="p" className="text-gray-600 dark:text-gray-400">
                  {ad.description}
                </Typography>

                <div className={cn("flex flex-col gap-1")}>

                    {typeof ad.price === 'object' && ad.price.from && ad.price.to ? (
                      <div className="flex flex-row flex-wrap gap-x-4 gap-y-1 text-gray-600">
                        <span>
                          <Typography variant="body-md-medium" as="span">
                            {t("from-label-flipped")}
                          </Typography>{" "}
                          <Typography variant="body-sm" as="span">
                            {ad.price.from} {currency}
                          </Typography>
                        </span>
                        <span>
                          <Typography variant="body-md-medium" as="span">
                            {t("to-label-flipped")}
                          </Typography>{" "}
                          <Typography variant="body-sm" as="span">
                            {ad.price.to} {currency}
                          </Typography>
                        </span>
                        {ad.priceType && (
                          <span>
                            <Typography variant="body-md-medium" as="span">
                              {t("type-label-flipped")}
                            </Typography>{" "}
                            <Typography variant="body-sm" as="span">
                              {t(`price-types.${ad.priceType}`)}
                            </Typography>
                          </span>
                        )}
                      </div>
                    ) : (
                      <div className="flex flex-row flex-wrap gap-x-4 gap-y-1 text-gray-600">
                        <span>
                          <Typography variant="body-md-medium" as="span">
                            {t("price")}
                          </Typography>{" "}
                          <Typography variant="body-sm" as="span">
                            {ad.price as number} {currency}
                          </Typography>
                        </span>
                        {ad.priceType && (
                          <span>
                            <Typography variant="body-md-medium" as="span">
                              {t("type-label-flipped")}
                            </Typography>{" "}
                            <Typography variant="body-sm" as="span">
                              {t(`price-types.${ad.priceType}`)}
                            </Typography>
                          </span>
                        )}
                      </div>
                    )}
                </div>
              </div>
            </div>

            {/* Comments Section */}
            <div className="border-t pt-6">
              <Typography variant="body-sm" as="p" className={`text-gray-500 mb-4 ${locale === "ar" ? "text-right" : ""}`}>
                {t("comments")}
              </Typography>

              {commentsLoading ? (
                <div className="flex justify-center py-8">
                  <Spinner className="h-8 w-8 text-main-400" />
                </div>
              ) : allComments.length > 0 ? (
                <>
                  <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                    {comments.map((comment: any) => (
                      <div
                        key={comment._id}
                        className="space-y-2"
                      >
                        <div className="flex items-start gap-3">
                          {locale === "ar" ? (
                            <>
                              {/* Arabic: content on left, image on right */}
                              <div className="flex-1 text-right">
                                <div className="flex flex-row gap-3 items-center w-fit ">
                                  {isValidImageUrl(comment.owner.image) ? (
                                    <Image
                                      src={comment.owner.image}
                                      alt={comment.owner.name}
                                      width={40}
                                      height={40}
                                      className="h-10 w-10 rounded-full object-cover"
                                    />
                                  ) : (
                                    <div className="h-10 w-10 rounded-full bg-main-500 flex items-center justify-center">
                                      <span className="text-sm font-bold text-white">
                                        {getInitials(comment.owner.name)}
                                      </span>
                                    </div>
                                  )}
                                  <Link
                                    href={`/${locale}/companies/${comment.owner._id}`}
                                    className="font-semibold text-main-600 hover:text-main-700 hover:underline"
                                  >
                                    <Typography variant="body-sm" as="span">
                                      {comment.owner.name}
                                    </Typography>
                                  </Link>
                                </div>
                                <Typography variant="body-sm" as="p" className="text-gray-600 dark:text-gray-400 mb-2">
                                  {comment.comment}
                                </Typography>

                                {/* Property Link */}
                                {comment.property && (
                                  <div className="text-xs text-gray-500 text-right">
                                    <span>{t("property-link")}: </span>
                                    <Link
                                      href={`/${locale}/properties/${comment.property._id}`}
                                      target="_blank"
                                      className="text-main-600 hover:underline"
                                    >
                                      {comment.property.title || comment.property._id}
                                    </Link>
                                  </div>
                                )}
                              </div>

                            </>
                          ) : (
                            <>
                              {/* English: image on left, content on right */}
                              {isValidImageUrl(comment.owner.image) ? (
                                <Image
                                  src={comment.owner.image}
                                  alt={comment.owner.name}
                                  width={40}
                                  height={40}
                                  className="h-10 w-10 rounded-full object-cover"
                                />
                              ) : (
                                <div className="h-10 w-10 rounded-full bg-main-500 flex items-center justify-center">
                                  <span className="text-sm font-bold text-white">
                                    {getInitials(comment.owner.name)}
                                  </span>
                                </div>
                              )}
                              <div className="flex-1">
                                <div className="flex flex-col mb-1">
                                  <Link
                                    href={`/${locale}/companies/${comment.owner._id}`}
                                    className="font-semibold text-main-600 hover:text-main-700 hover:underline"
                                  >
                                    <Typography variant="body-sm" as="span">
                                      {comment.owner.name}
                                    </Typography>
                                  </Link>
                                  {comment.owner.ownerType && (
                                    <Typography variant="body-sm" as="p" className="text-gray-500">
                                      {comment.owner.ownerType}
                                    </Typography>
                                  )}
                                </div>
                                <Typography variant="body-sm" as="p" className="text-gray-600 dark:text-gray-400 mb-2">
                                  {comment.comment}
                                </Typography>

                                {/* Property Link */}
                                {comment.property && (
                                  <div className="text-xs text-gray-500">
                                    <span>{t("property-link")}: </span>
                                    <Link
                                      href={`/${locale}/properties/${comment.property._id}`}
                                      target="_blank"
                                      className="text-main-600 hover:underline"
                                    >
                                      {comment.property.title || comment.property._id}
                                    </Link>
                                  </div>
                                )}
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Pagination Controls */}
                  {totalPages > 1 && (
                    <div className={cn("flex items-center justify-between mt-4 pt-4 border-t", locale === "ar" && "flex-row-reverse")}>
                      <Typography variant="body-sm" as="p" className="text-gray-600">
                        {t("showing-page", {
                          currentPage,
                          totalPages,
                          itemsCount: allComments.length,
                        })}
                      </Typography>
                      <div className={cn("flex gap-2", locale === "ar" && "flex-row-reverse")}>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                          disabled={currentPage === 1}
                          className="h-8 w-8 p-0"
                        >
                          {locale === "ar" ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                        </Button>
                        <div className={`flex items-center gap-1 ${locale === "ar" ? "flex-row-reverse" : ""}`}>
                          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                            <Button
                              key={page}
                              variant={currentPage === page ? "default" : "outline"}
                              size="sm"
                              onClick={() => setCurrentPage(page)}
                              className={cn(
                                "h-8 w-8 p-0",
                                currentPage === page && "bg-main-600 text-white hover:bg-main-700"
                              )}
                            >
                              {page}
                            </Button>
                          ))}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                          disabled={currentPage === totalPages}
                          className="h-8 w-8 p-0"
                        >
                          {locale === "ar" ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="py-8 text-center">
                  <Typography variant="body-sm" as="p" className="text-gray-500">
                    {t("no-comments")}
                  </Typography>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="py-12 text-center">
            <Typography variant="body-md" as="p" className="text-gray-500">
              {t("ad-not-found")}
            </Typography>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
