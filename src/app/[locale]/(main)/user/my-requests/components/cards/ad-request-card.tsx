"use client";

import { useTranslations } from "next-intl";
import { Megaphone } from "lucide-react";
import Typography from "@/components/shared/typography";
import { cn } from "@/lib/utils";
import { type RequestCardProps } from "./types";
import { getStatusColor, formatDate } from "./shared-utils";

export function AdRequestCard({ request, locale, onCardClick, getCurrency }: RequestCardProps) {
  const t = useTranslations("User.MyRequests");

  const propertyTitle = request.name || request.title || t("request-title");
  const propertyLocation = request.city || request.country
    ? `${request.city || ""}, ${request.country}`.trim().replace(/^,|,$/g, "")
    : null;
  const currency = getCurrency(request.country);
  const hasAdComment = request.comment;

  // Determine status based on whether ad has a comment
  const adStatusKey = request.comment ? "replied" : "pending";
  const adStatus = request.comment ? t("status-replied") : t("status-pending");

  return (
    <div
      onClick={() => onCardClick(request._id)}
      className={`rounded-lg border bg-white p-6 hover:shadow-md transition-shadow cursor-pointer ${hasAdComment ? "border-green-500 border-2" : "border-gray-200"
        }`}
    >
      <div className={cn("flex items-start justify-between mb-4", locale === "ar" && "flex-row-reverse")}>
        <div className={cn("flex items-center gap-3", locale === "ar" && "flex-row-reverse")}>
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-main-100 shrink-0">
            <Megaphone className="h-6 w-6 text-main-600" />
          </div>
          <div className={cn(locale === "ar" && "text-right")}>
            <Typography variant="body-lg-medium" as="h5" className="capitalize font-bold mb-1">
              {propertyTitle}
            </Typography>
          </div>
        </div>

        <div className={cn("flex flex-col gap-2 items-end", locale === "ar" && "items-start")}>
          <span
            className={`inline-block rounded-full border px-4 py-1 text-sm font-medium whitespace-nowrap ${getStatusColor(
              adStatusKey
            )}`}
          >
            {adStatus}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {request.description && (
          <div className={cn("flex items-center gap-2 text-gray-600", locale === "ar" && "flex-row-reverse")}>
            <Typography variant="body-md-medium" as="p">
              {t("ad-description")}
            </Typography>
            <Typography variant="body-sm" as="span">
              {`${request.description.substring(0, 100)}${request.description.length > 100 ? "..." : ""}`}
            </Typography>
          </div>
        )}
        {propertyLocation && (
          <div className={cn("flex items-center gap-2 text-gray-600", locale === "ar" && "flex-row-reverse")}>
            <Typography variant="body-md" className="capitalize" as="span">
              {propertyLocation}
            </Typography>
          </div>
        )}

        {request.price && (
          <div className={cn("flex flex-col gap-1", locale === "ar" && "items-end")}>
            {/* <Typography variant="body-md-medium" as="span" className="font-medium text-gray-700">
              {t("budget-label")}
            </Typography> */}
            {typeof request.price === 'object' && request.price.from && request.price.to ? (
              <div className={cn("flex flex-row gap-3 text-gray-600", locale === "ar" && "items-end flex-row-reverse")}>
                <div className={`flex items-center gap-1 ${locale === "ar" ? "flex-row-reverse" : ""}`}>
                  <Typography variant="body-md-medium" as="span">
                    {t("from-label")}
                  </Typography>
                  <Typography variant="body-sm" as="span" >
                    {request.price.from} {currency}
                  </Typography>
                </div>
                <div className={`flex items-center gap-1 ${locale === "ar" ? "flex-row-reverse" : ""}`}>
                  <Typography variant="body-md-medium" as="span">
                    {t("to-label")}
                  </Typography>
                  <Typography variant="body-sm" as="span">
                    {request.price.to} {currency}
                  </Typography>
                </div>
                {request.priceType && (
                  <div className={`flex items-center gap-1 ${locale === "ar" ? "flex-row-reverse" : ""}`}>
                    <Typography variant="body-md-medium" as="span">
                      {t("type-label")}
                    </Typography>
                    <Typography variant="body-sm" as="span">
                      {t(`price-types.${request.priceType}`)}
                    </Typography>
                  </div>
                )}
              </div>
            ) : (
              <div className={cn("flex flex-row gap-3 text-gray-600", locale === "ar" && "items-end")}>
                <div className={`flex items-center gap-1 ${locale === "ar" ? "flex-row-reverse" : ""}`}>
                  <Typography variant="body-md-medium" as="span">
                    {t("price")}
                  </Typography>
                  <Typography variant="body-sm" as="span">
                    {request.price} {currency}
                  </Typography>
                </div>
                {request.priceType && (
                  <div className={`flex items-center gap-1 ${locale === "ar" ? "flex-row-reverse" : ""}`}>
                    <Typography variant="body-md-medium" as="span">
                      {t("type-label")}
                    </Typography>
                    <Typography variant="body-sm" as="span">
                      {t(`price-types.${request.priceType}`)}
                    </Typography>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
        {request.createdAt && (
          <div className={cn("flex items-center gap-1 text-gray-500 mt-2", locale === "ar" && "flex-row-reverse")}>
            <Typography variant="body-sm-bold" as="span">
              {t("request-date")}
            </Typography>
            <Typography variant="body-sm" as="span">
              {formatDate(request.createdAt)}
            </Typography>
          </div>
        )}
      </div>
    </div>
  );
}
