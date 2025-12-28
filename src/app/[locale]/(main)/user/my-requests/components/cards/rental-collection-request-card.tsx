"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import Typography from "@/components/shared/typography";
import { cn, getProxiedImageUrl } from "@/lib/utils";
import { RequestCardProps } from "./types";
import { formatDate, getStatusColor } from "./shared-utils";

export function RentalCollectionRequestCard({
  request,
  locale,
  getCurrency,
  onCardClick,
}: RequestCardProps) {
  const t = useTranslations("User.MyRequests");
  const [imageError, setImageError] = useState(false);

  const property = request.property;
  const propertyTitle = property?.title || request.title || request.name || t("request-title");
  const propertyCode = property?.code || request.code || request.propertyCode;
  const propertyLocation = property
    ? `${property.city || ""}, ${property.region || ""}`.trim().replace(/^,|,$/g, "")
    : request.city || request.region
      ? `${request.city || ""}, ${request.region || ""}`.trim().replace(/^,|,$/g, "")
      : null;
  const currency = getCurrency(property?.country || request.country);

  const propertyImage = property?.image || request.image;
  const hasValidImage = propertyImage && (propertyImage.startsWith('/') || propertyImage.startsWith('http'));

  // Get localized status
  const getLocalizedStatus = (status: string) => {
    const statusKey = status?.toLowerCase();
    switch (statusKey) {
      case "pending":
        return t("status-pending");
      case "approved":
        return t("status-approved");
      case "rejected":
        return t("status-rejected");
      case "completed":
        return t("status-completed");
      case "confirmed":
        return t("status-confirmed");
      case "canceled":
      case "cancelled":
        return t("status-canceled");
      default:
        return status;
    }
  };

  return (
    <div onClick={() => onCardClick(request._id)} className="rounded-lg border bg-white p-4 hover:shadow-md transition-shadow border-gray-200 relative">
      {/* Status Badge - Top Right (EN) / Top Left (AR) */}
      {request.tenantStatus && (
        <div className={cn(
          "absolute top-4",
          locale === "ar" ? "left-4" : "right-4"
        )}>
          <span
            className={cn(
              "inline-block rounded-full border px-3 py-1 text-xs font-medium whitespace-nowrap",
              getStatusColor(request.tenantStatus)
            )}
          >
            {getLocalizedStatus(request.tenantStatus)}
          </span>
        </div>
      )}

      <div className={cn(
        "flex items-start gap-4",
        locale === "ar" && "flex-row-reverse"
      )}>
        {/* Property Image */}
        <div className="shrink-0">
          {hasValidImage && !imageError ? (
            <Image
              src={getProxiedImageUrl(propertyImage)}
              alt={propertyTitle}
              width={100}
              height={80}
              className="h-28 w-32 rounded-lg object-cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <Image
              src="/no-apartment.png"
              alt={propertyTitle}
              width={100}
              height={80}
              className="h-28 w-32 rounded-lg object-cover"
            />
          )}
        </div>

        {/* Property Details */}
        <div className={cn(
          "flex-1 min-w-0",
          locale === "ar" && "text-right"
        )}>
          {propertyCode && (
            <Typography variant="body-sm" as="p" className="text-gray-500 mb-1">
              {locale === "ar" ? `${propertyCode} :${t("property-code")}` : `${t("property-code")}: ${propertyCode}`}
            </Typography>
          )}
          <Typography variant="body-md-medium" as="h5" className="font-bold mb-1 truncate">
            {propertyTitle}
          </Typography>
          {propertyLocation && (
            <Typography variant="body-sm" as="p" className="text-gray-600 mb-1">
              {propertyLocation}
            </Typography>
          )}
          {request.rentDetails && (
            <div className={cn("flex flex-col gap-1 text-gray-600 mt-2", locale === "ar" && "items-end")}>
              <div className={cn("flex items-center gap-1", locale === "ar" && "flex-row-reverse")}>
                <Typography variant="body-sm-bold" as="p" className="text-gray-500">
                  {t("rent-dates")}
                </Typography>
                <Typography variant="body-sm" as="p" className="text-gray-500">
                  {locale === "ar"
                    ? `${formatDate(request.rentDetails.endDate)} - ${formatDate(request.rentDetails.startDate)}`
                    : `${formatDate(request.rentDetails.startDate)} - ${formatDate(request.rentDetails.endDate)}`
                  }
                </Typography>
              </div>
              {request.rentDetails.amount && (
                <div className={cn("flex items-center gap-1", locale === "ar" && "flex-row-reverse")}>
                  <Typography variant="body-sm-bold" as="p" className="text-gray-500">
                    {t("rent-amount")}
                  </Typography>
                  <Typography variant="body-sm" as="p" className="text-gray-500">
                    {request.rentDetails.amount} {currency}
                  </Typography>
                </div>
              )}
              {request.createdAt && (
                <div className={cn("flex items-center gap-1", locale === "ar" && "flex-row-reverse")}>
                  <Typography variant="body-sm-bold" as="p" className="text-gray-500">
                    {t("request-date")}
                  </Typography>
                  <Typography variant="body-sm" as="p" className="text-gray-500">
                    {formatDate(request.createdAt)}
                  </Typography>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
