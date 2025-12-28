"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import Typography from "@/components/shared/typography";
import { cn, getProxiedImageUrl } from "@/lib/utils";
import { RequestCardProps } from "./types";
import { formatDate } from "../modals/shared-utils";
import {getStatusColor} from "./shared-utils"
import { Calendar } from "lucide-react";

export function ServiceRequestCard({
  request,
  locale,
  onCardClick,
}: RequestCardProps) {
  const t = useTranslations("User.MyRequests");
  const [imageError, setImageError] = useState(false);

  const property = request.property;
  const propertyTitle = property?.title || request.name || request.title || t("request-title");
  const propertyCode = property?.code || request.propertyCode;
  const propertyLocation = property
    ? `${property.city || ""}, ${property.region || ""}`.trim().replace(/^,|,$/g, "")
    : request.city || request.region
      ? `${request.city || ""}, ${request.region || ""}`.trim().replace(/^,|,$/g, "")
      : null;

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
    <div
      onClick={() => onCardClick(request._id)}
      className="rounded-lg border bg-white p-4 hover:shadow-md transition-shadow border-gray-200 cursor-pointer relative"
    >
      {/* Status Badge - Top Right (EN) / Top Left (AR) */}
      {request.status && (
        <div className={cn(
          "absolute top-4",
          locale === "ar" ? "left-4" : "right-4"
        )}>
          <span
            className={cn(
              "inline-block rounded-full border px-3 py-1 text-xs font-medium whitespace-nowrap",
              getStatusColor(request.status)
            )}
          >
            {getLocalizedStatus(request.status)}
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
          {request.name && (
            <div className={cn("flex flex-col gap-1 text-gray-600 mt-2", locale === "ar" && "items-end")}>
              <div className={cn("flex items-center gap-1", locale === "ar" && "flex-row-reverse")}>
                <Typography variant="body-sm-bold" as="p" className="text-gray-500">
                  {t("service-requested")}
                </Typography>
                <Typography variant="body-sm" as="p" className="text-gray-500">
                  {request.name}
                </Typography>
              </div>
            </div>
          )}
          {request.createdAt && (
          <div className={cn("flex items-center gap-1 text-gray-500 mt-1", locale === "ar" && "flex-row-reverse")}>
            <Typography variant="body-sm-bold" as="p" className="text-gray-500">
              {t("request-date")}
            </Typography>
            <Typography variant="body-sm" as="p" className="text-gray-500">
              {formatDate(request.createdAt, locale)}
            </Typography>
          </div>
        )}
        </div>
      </div>
    </div>
  );
}
