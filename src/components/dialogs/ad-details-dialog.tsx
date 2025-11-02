"use client";

import { useTranslations, useLocale } from "next-intl";
import { X, MessageSquare, Calendar, DollarSign, User, ExternalLink } from "lucide-react";
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
  const tCommon = useTranslations("General");
  const locale = useLocale();

  const { data: adData, isLoading: adLoading } = useAdDetails(adId || undefined);
  const { data: commentsData, isLoading: commentsLoading } = useAdComments(adId || undefined);

  const ad = adData?.data;
  const comments = (commentsData?.data as any)?.data || commentsData || [];

  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getPriceTypeLabel = (priceType: string) => {
    const labels: Record<string, string> = {
      daily: t("price-type-daily"),
      weekly: t("price-type-weekly"),
      monthly: t("price-type-monthly"),
    };
    return labels[priceType] || priceType;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{t("ad-details")}</span>
          </DialogTitle>
        </DialogHeader>

        {adLoading ? (
          <div className="flex justify-center py-12">
            <Spinner className="h-12 w-12 text-main-400" />
          </div>
        ) : ad ? (
          <div className="space-y-6">
            {/* Ad Details */}
            <div className="space-y-4">
              <div>
                <Typography variant="h4" as="h4" className="font-bold mb-2">
                  {ad.title}
                </Typography>
                <Typography variant="body-md" as="p" className="text-gray-600 dark:text-gray-400">
                  {ad.description}
                </Typography>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-main-100">
                    <DollarSign className="h-5 w-5 text-main-600" />
                  </div>
                  <div>
                    <Typography variant="body-sm" as="p" className="text-gray-500 dark:text-gray-400">
                      {t("price")}
                    </Typography>
                    <Typography variant="body-md" as="p" className="font-semibold">
                      {ad.price} {tCommon("kwd")}
                    </Typography>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-main-100">
                    <Calendar className="h-5 w-5 text-main-600" />
                  </div>
                  <div>
                    <Typography variant="body-sm" as="p" className="text-gray-500 dark:text-gray-400">
                      {t("price-type")}
                    </Typography>
                    <Typography variant="body-md" as="p" className="font-semibold">
                      {getPriceTypeLabel(ad.priceType)}
                    </Typography>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-main-100">
                    <User className="h-5 w-5 text-main-600" />
                  </div>
                  <div>
                    <Typography variant="body-sm" as="p" className="text-gray-500 dark:text-gray-400">
                      {t("posted-by")}
                    </Typography>
                    <Typography variant="body-md" as="p" className="font-semibold">
                      {ad.user.name}
                    </Typography>
                  </div>
                </div>
              </div>

              {/* Admin Comment */}
              {ad.comment && (
                <div className="p-4 bg-green-50 dark:bg-green-900/20 border-l-4 border-green-400 rounded">
                  <Typography variant="body-sm" as="p" className="font-semibold text-green-800 dark:text-green-300 mb-1">
                    {t("admin-comment")}:
                  </Typography>
                  <Typography variant="body-sm" as="p" className="text-green-700 dark:text-green-400">
                    {ad.comment}
                  </Typography>
                </div>
              )}
            </div>

            {/* Comments Section */}
            <div className="border-t pt-6">
              <div className="flex items-center gap-2 mb-4">
                <MessageSquare className="h-5 w-5 text-main-600" />
                <Typography variant="h5" as="h5" className="font-bold">
                  {t("comments")} ({comments.length})
                </Typography>
              </div>

              {commentsLoading ? (
                <div className="flex justify-center py-8">
                  <Spinner className="h-8 w-8 text-main-400" />
                </div>
              ) : comments.length > 0 ? (
                <div className="space-y-4">
                  {comments.map((comment: any) => (
                    <div
                      key={comment._id}
                      className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
                    >
                      <div className="flex items-start gap-3">
                        {comment.owner.image ? (
                          <Image
                            src={comment.owner.image}
                            alt={comment.owner.name}
                            width={40}
                            height={40}
                            className="h-10 w-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-main-100 flex items-center justify-center">
                            <User className="h-5 w-5 text-main-600" />
                          </div>
                        )}
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <Typography variant="body-sm" as="p" className="font-semibold">
                              {comment.owner.name}
                            </Typography>
                          </div>
                          <Typography variant="body-sm" as="p" className="text-gray-600 dark:text-gray-400 mb-2">
                            {comment.comment}
                          </Typography>

                          {/* Property Link */}
                          {comment.property && (
                            <Link
                              href={`/${locale}/properties/${comment.property._id}`}
                              target="_blank"
                              className="inline-flex items-center gap-1 text-sm text-main-600 hover:text-main-700 hover:underline"
                            >
                              <ExternalLink className="h-3 w-3" />
                              {comment.property.title || t("view-property")}
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center">
                  <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                  <Typography variant="body-md" as="p" className="text-gray-500">
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
