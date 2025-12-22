"use client";

import { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import Typography from "@/components/shared/typography";
import { useRequestDetails } from "@/hooks/use-request-details";
import { useCountries } from "@/hooks/use-countries";
import Image from "next/image";
import { getProxiedImageUrl, cn } from "@/lib/utils";
import { BaseModalProps } from "./types";
import { formatDate, formatStatus, getStatusColor, getCurrency as getCountryCurrency, PersonImage } from "./shared-utils";
import Link from "next/link";

interface BaseDetailsModalProps extends BaseModalProps {
  requestType: string;
  children: (data: {
    request: any;
    locale: string;
    t: any;
    formatDate: (date: string) => string;
    formatStatus: (status: string) => string;
    getStatusColor: (status: string) => string;
    currency: string;
    property: any;
  }) => React.ReactNode;
}

export function BaseDetailsModal({
  isOpen,
  onClose,
  requestId,
  endpoint,
  requestType,
  request: requestProp,
  children,
}: BaseDetailsModalProps) {
  const t = useTranslations("User.MyRequests");
  const locale = useLocale();
  const { data: countries } = useCountries();

  // Only fetch if request object is not provided
  // The hook will handle enabling/disabling based on endpoint and requestId
  const shouldFetch = !requestProp && requestId && endpoint;
  const { data, isLoading } = useRequestDetails(
    endpoint || "",
    requestProp ? null : (requestId || null)
  );
  const [imageError, setImageError] = useState(false);

  // Reset image error when request changes
  useEffect(() => {
    setImageError(false);
  }, [requestId, requestProp]);

  const getModalTitle = () => {
    const typeLabels: Record<string, string> = {
      tours: t("tabs.tour"),
      rent: t("tabs.rent"),
      service: t("tabs.service"),
      installments: t("tabs.installments"),
      disclaimers: t("tabs.disclaimers"),
      "extend-invoices": t("tabs.extend-invoices"),
      "end-contracts": t("tabs.end-contracts"),
      "rental-collection": t("tabs.rental-collection"),
    };

    const typeLabel = typeLabels[requestType] || t("request-details");
    return locale === "ar" ? `${t("request-details-suffix")} ${typeLabel}` : `${typeLabel} ${t("request-details-suffix")}`;
  };

  const getCurrency = (countryCode?: string) => getCountryCurrency(countries || [], countryCode);

  // Use provided request object or fetched data
  const request = requestProp || data?.data;

  if (!request) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="text-center">
            <DialogTitle className={`flex ${locale === "ar" && "flex-row-reverse"}`}>{getModalTitle()}</DialogTitle>
          </DialogHeader>
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Spinner className="h-12 w-12 text-main-400" />
            </div>
          ) : (
            <div className="py-8 text-center">
              <Typography variant="body-md" as="p" className="text-gray-500">
                {t("no-data")}
              </Typography>
            </div>
          )}
        </DialogContent>
      </Dialog>
    );
  }

  // Handle different property structures
  const isExtendInvoice = requestType === "extend-invoices";
  const isEndContract = requestType === "end-contracts";
  const isRentalCollection = requestType === "rental-collection";

  const property = isExtendInvoice
    ? request.invoice?.property
    : isEndContract
      ? request.rent?.property
      : isRentalCollection
        ? request
        : request.property;

  const propertyTitle = property?.title || request.title || t("request-title");
  const propertyLocation = property
    ? `${property.city || ""}, ${property.country || ""}`.trim().replace(/^,|,$/g, "")
    : null;
  const currency = getCurrency(property?.country);

  const getRequestDate = () => {
    if (request.date) return formatDate(request.date, locale);
    if (request.createdAt) return formatDate(request.createdAt, locale);
    return "";
  };

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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto" dir={locale === "ar" ? "rtl" : "ltr"}>
        <DialogHeader>
          <DialogTitle className="text-center">{getModalTitle()}</DialogTitle>
        </DialogHeader>

        {isLoading && shouldFetch ? (
          <div className="flex justify-center py-12">
            <Spinner className="h-12 w-12 text-main-400" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Listing Details Section */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <Typography variant="body-sm" as="p" className="text-gray-500">
                  {t("listing-details")}
                </Typography>
                {request.status && (
                  <span
                    className={cn(
                      "inline-block rounded-full border px-3 py-1 text-xs font-medium whitespace-nowrap",
                      getStatusColor(isRentalCollection ? request.tenantStatus : request.status)
                    )}
                  >
                    {getLocalizedStatus(isRentalCollection ? request.tenantStatus : request.status)}
                  </span>
                )}
              </div>

              <div className="flex gap-3">
                <div className="shrink-0">
                  {property?.image && !imageError ? (
                    <Image
                      src={getProxiedImageUrl(property.image)}
                      alt={propertyTitle}
                      width={100}
                      height={80}
                      className="h-20 w-24 rounded-lg object-cover"
                      onError={() => setImageError(true)}
                    />
                  ) : (
                    <Image
                      src="/no-apartment.png"
                      alt={propertyTitle}
                      width={100}
                      height={80}
                      className="h-20 w-24 rounded-lg object-cover"
                    />
                  )}
                </div>

                <div className="flex-1">
                  {property?.code && (
                    <Typography variant="body-sm" as="p" className="text-gray-500">
                      {t("property-code")}: {property.code}
                    </Typography>
                  )}
                  {property?._id ? (
                    <Link
                      href={`/${locale}/properties/${property._id}`}
                      className="font-semibold text-main-600 hover:text-main-700 hover:underline"
                    >
                      <Typography variant="body-md-bold" as="span" className="mb-1 capitalize">
                        {propertyTitle}
                      </Typography>
                    </Link>
                  ) : (
                    <Typography variant="body-md-bold" as="p" className="font-semibold mb-1 capitalize">
                      {propertyTitle}
                    </Typography>
                  )}
                  {propertyLocation && (
                    <Typography variant="body-sm" as="p" className="text-gray-600 mb-2 capitalize">
                      {propertyLocation}
                    </Typography>
                  )}
                  {requestType !== "tours" && getRequestDate() && (
                    <Typography variant="body-sm" as="p" className="text-gray-600">
                      {t("request-date")}: {getRequestDate()}
                    </Typography>
                  )}
                </div>
              </div>
            </div>

            <Typography variant="body-md-bold" as="h3" className="font-semibold">
              {getModalTitle()}
            </Typography>

            {/* Owner/Agent Section */}
            {request.owner && (
              <div className="flex items-center gap-3">
                <PersonImage person={request.owner} />
                <div>
                  <Link
                    href={`/${locale}/companies/${request.owner._id}`}
                    target="_blank"
                    className="font-medium text-main-600 hover:text-main-700 hover:underline"
                  >
                    <Typography variant="body-sm" as="span">
                      {request.owner.name}
                    </Typography>
                  </Link>
                  {request.owner.ownerType && (
                    <Typography variant="body-sm" as="p" className="text-gray-500">
                      {request.owner.ownerType}
                    </Typography>
                  )}
                </div>
              </div>
            )}

            {/* Render type-specific content */}
            {children({
              request,
              locale,
              t,
              formatDate: (date: string) => formatDate(date, locale),
              formatStatus,
              getStatusColor,
              currency,
              property,
            })}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
