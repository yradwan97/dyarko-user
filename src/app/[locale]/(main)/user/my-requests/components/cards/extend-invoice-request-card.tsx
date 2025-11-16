"use client";

import { useTranslations } from "next-intl";
import { Clock, Calendar, DollarSign } from "lucide-react";
import Typography from "@/components/shared/typography";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import { RequestCardProps } from "./types";
import { formatDate, formatStatus, getStatusColor, OwnerImage } from "./shared-utils";

interface ExtendInvoiceRequestCardProps extends RequestCardProps {
  onPayInvoice: (invoiceId: string, amount: number) => void;
  isPaymentPending: boolean;
}

export function ExtendInvoiceRequestCard({
  request,
  locale,
  onCardClick,
  getCurrency,
  onPayInvoice,
  isPaymentPending,
}: ExtendInvoiceRequestCardProps) {
  const t = useTranslations("User.MyRequests");

  const property = request.invoice?.property;
  const propertyTitle = property?.title || request.name || request.title || t("request-title");
  const propertyLocation = property
    ? `${property.city || ""}, ${property.region || ""}`.trim().replace(/^,|,$/g, "")
    : null;
  const currency = getCurrency(property?.country);

  return (
    <div
      onClick={onCardClick}
      className="rounded-lg border bg-white p-6 hover:shadow-md transition-shadow border-gray-200 cursor-pointer"
    >
      <div className={cn("flex items-start justify-between mb-4", locale === "ar" && "flex-row-reverse")}>
        <div className={cn("flex items-start gap-3", locale === "ar" && "flex-row-reverse")}>
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-main-100 shrink-0">
            <Clock className="h-6 w-6 text-main-600" />
          </div>
          <div className={cn(locale === "ar" && "text-right")}>
            <Typography variant="body-lg-medium" as="h5" className="font-bold mb-1">
              {propertyTitle}
            </Typography>
            {property?.code && (
              <Typography variant="body-sm" as="p" className="text-gray-400">
                {property.code}
              </Typography>
            )}
          </div>
        </div>

        <div className={cn("flex flex-col gap-2 items-end", locale === "ar" && "items-start")}>
          {request.status && (
            <span
              className={`inline-block rounded-full border px-4 py-1 text-sm font-medium whitespace-nowrap ${getStatusColor(
                request.status
              )}`}
            >
              {formatStatus(request.status)}
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

        {request.extendTo && (
          <div className="flex items-center gap-2 text-gray-600">
            <Clock className="h-4 w-4 shrink-0" />
            <Typography variant="body-sm" as="span">
              {t("extend-to")}: {formatDate(request.extendTo)}
            </Typography>
          </div>
        )}

        {request.invoice?.userAmount && (
          <div className="flex items-center gap-2 text-gray-600">
            <DollarSign className="h-4 w-4 shrink-0" />
            <Typography variant="body-sm" as="span">
              {t("invoice-amount")}: {request.invoice.userAmount} {currency}
            </Typography>
          </div>
        )}

        {request.invoice?.date && (
          <div className="flex items-center gap-2 text-gray-600">
            <Calendar className="h-4 w-4 shrink-0" />
            <Typography variant="body-sm" as="span">
              {t("original-date")}: {formatDate(request.invoice.date)}
            </Typography>
          </div>
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

      {request.status?.toLowerCase() === "rejected" && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          {request.invoice?._id ? (
            <Button
              onClick={(e) => {
                e.stopPropagation();
                onPayInvoice(request.invoice._id, request.invoice.amount);
              }}
              className="w-full bg-main-600 hover:bg-main-700 text-white font-semibold"
            >
              {isPaymentPending ? <Spinner className="h-4 w-4" /> : t("pay-now")}
            </Button>
          ) : (
            <Typography variant="body-sm" as="p" className="text-gray-600 text-center p-3 bg-red-50 border border-red-200 rounded">
              {t("invoice-not-available")}
            </Typography>
          )}
        </div>
      )}
    </div>
  );
}
