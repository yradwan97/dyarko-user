"use client";

import { useTranslations } from "next-intl";
import { Wallet, Calendar, DollarSign, Check, X } from "lucide-react";
import Typography from "@/components/shared/typography";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import { RequestCardProps } from "./types";
import { formatDate, formatStatus, getStatusColor, OwnerImage } from "./shared-utils";

interface RentalCollectionRequestCardProps extends RequestCardProps {
  onApproveReject: (action: "approve" | "reject", propertyId: string, propertyTitle: string) => void;
  isActionPending: boolean;
  pendingAction: "approve" | "reject" | null;
}

export function RentalCollectionRequestCard({
  request,
  locale,
  getCurrency,
  onApproveReject,
  isActionPending,
  pendingAction,
}: RentalCollectionRequestCardProps) {
  const t = useTranslations("User.MyRequests");

  const propertyTitle = request.title || t("request-title");
  const propertyLocation = request.city || request.region
    ? `${request.city || ""}, ${request.region || ""}`.trim().replace(/^,|,$/g, "")
    : null;
  const currency = getCurrency(request.country);

  return (
    <div className="rounded-lg border bg-white p-6 hover:shadow-md transition-shadow border-gray-200">
      <div className={cn("flex items-start justify-between mb-4", locale === "ar" && "flex-row-reverse")}>
        <div className={cn("flex items-start gap-3", locale === "ar" && "flex-row-reverse")}>
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-main-100 shrink-0">
            <Wallet className="h-6 w-6 text-main-600" />
          </div>
          <div className={cn(locale === "ar" && "text-right")}>
            <Typography variant="body-lg-medium" as="h5" className="font-bold mb-1">
              {propertyTitle}
            </Typography>
            {request.code && (
              <Typography variant="body-sm" as="p" className="text-gray-400">
                {request.code}
              </Typography>
            )}
          </div>
        </div>

        <div className={cn("flex flex-col gap-2 items-end", locale === "ar" && "items-start")}>
          {request.tenantStatus && (
            <span
              className={`inline-block rounded-full border px-4 py-1 text-sm font-medium whitespace-nowrap ${getStatusColor(
                request.tenantStatus
              )}`}
            >
              {formatStatus(request.tenantStatus)}
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {propertyLocation && (
          <div className="flex items-center gap-2 text-gray-600">
            <Typography variant="body-sm" as="span">
              {propertyLocation}
            </Typography>
          </div>
        )}

        {request.rentDetails && (
          <>
            <div className="flex items-center gap-2 text-gray-600">
              <Calendar className="h-4 w-4 shrink-0" />
              <Typography variant="body-sm" as="span">
                {formatDate(request.rentDetails.startDate)} - {formatDate(request.rentDetails.endDate)}
                {request.rentDetails.rentType && ` (${request.rentDetails.rentType})`}
              </Typography>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <DollarSign className="h-4 w-4 shrink-0" />
              <Typography variant="body-sm" as="span">
                {request.rentDetails.amount} {currency}
              </Typography>
            </div>
          </>
        )}

        {request.createdAt && (
          <div className="flex items-center gap-2 text-gray-600">
            <Calendar className="h-4 w-4 shrink-0" />
            <Typography variant="body-sm" as="span" className="text-gray-400">
              {t("created")}: {formatDate(request.createdAt)}
            </Typography>
          </div>
        )}
      </div>

      {request.owner && (
        <div className={cn("flex items-center gap-3 p-3 bg-gray-50 rounded-lg mb-3", locale === "ar" && "flex-row-reverse")}>
          <OwnerImage owner={request.owner} />
          <div className={cn(locale === "ar" && "text-right")}>
            <Typography variant="body-sm" as="p" className="font-medium">
              {request.owner.name}
            </Typography>
            <Typography variant="body-sm" as="p" className="text-gray-500">
              {request.owner.ownerType}
            </Typography>
          </div>
        </div>
      )}

      {request.ownerComment && (
        <Typography variant="body-sm" as="p" className={cn("text-gray-600 mt-3 p-3 bg-yellow-50 border-yellow-400 rounded italic", locale === "ar" ? "border-r-4" : "border-l-4")}>
          <span className="font-semibold">{t("owner-comment")}:</span> {request.ownerComment}
        </Typography>
      )}

      {request.reason && (
        <Typography variant="body-sm" as="p" className={cn("text-gray-600 mt-3 p-3 bg-blue-50 border-blue-400 rounded", locale === "ar" ? "border-r-4" : "border-l-4")}>
          <span className="font-semibold">{t("reason")}:</span> {request.reason}
        </Typography>
      )}

      {request.description && (
        <Typography variant="body-sm" as="p" className="text-gray-600 mt-3">
          {request.description}
        </Typography>
      )}

      {request.tenantStatus?.toUpperCase() === "PENDING" && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className={cn("flex gap-3", locale === "ar" && "flex-row-reverse")}>
            <Button
              onClick={() => onApproveReject("approve", request._id, propertyTitle)}
              disabled={isActionPending}
              className="flex-1 bg-main-600 hover:bg-main-700 text-white font-semibold"
            >
              {isActionPending && pendingAction === "approve" ? (
                <Spinner className="h-4 w-4" />
              ) : (
                <>
                  <Check className={cn("h-4 w-4", locale === "ar" ? "ml-2" : "mr-2")} />
                  {t("approve")}
                </>
              )}
            </Button>
            <Button
              onClick={() => onApproveReject("reject", request._id, propertyTitle)}
              disabled={isActionPending}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold"
            >
              {isActionPending && pendingAction === "reject" ? (
                <Spinner className="h-4 w-4" />
              ) : (
                <>
                  <X className={cn("h-4 w-4", locale === "ar" ? "ml-2" : "mr-2")} />
                  {t("reject")}
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
