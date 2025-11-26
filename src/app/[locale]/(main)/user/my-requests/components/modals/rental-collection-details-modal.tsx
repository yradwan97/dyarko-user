"use client";

import { Calendar, DollarSign, Phone, Check, X } from "lucide-react";
import Typography from "@/components/shared/typography";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import { BaseModalProps } from "./types";
import { BaseDetailsModal } from "./base-modal";

interface RentalCollectionDetailsModalProps extends BaseModalProps {
  onApproveReject?: (action: "approve" | "reject", propertyId: string, propertyTitle: string) => void;
  isActionPending?: boolean;
  pendingAction?: "approve" | "reject" | null;
}

export function RentalCollectionDetailsModal({
  onApproveReject,
  isActionPending = false,
  pendingAction = null,
  ...props
}: RentalCollectionDetailsModalProps) {
  return (
    <BaseDetailsModal {...props} requestType="rental-collection">
      {({ request, locale, t, formatDate, currency, property }) => {
        const propertyTitle = property?.title || request.title || request.name || t("request-title");

        return (
        <div className="space-y-4">
          {request.rentDetails && (
            <>
              {request.rentDetails.startDate && (
                <div className={cn("flex items-center gap-2 text-gray-600", locale === "ar" && "flex-row-reverse")}>
                  <Calendar className="h-4 w-4 shrink-0" />
                  <div>
                    <Typography variant="body-sm" as="span" className="font-medium">
                      {t("start-date")}:
                    </Typography>
                    <Typography variant="body-sm" as="span" className="ml-2">
                      {formatDate(request.rentDetails.startDate)}
                    </Typography>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                {request.rentDetails.endDate && (
                  <div className={cn(locale === "ar" && "text-right")}>
                    <Typography variant="body-sm" as="p" className="font-medium text-gray-700">
                      {t("end-date")}:
                    </Typography>
                    <Typography variant="body-sm" as="p" className="text-gray-600">
                      {formatDate(request.rentDetails.endDate)}
                    </Typography>
                  </div>
                )}
                {request.rentDetails.rentType && (
                  <div className={cn(locale === "ar" && "text-right")}>
                    <Typography variant="body-sm" as="p" className="font-medium text-gray-700">
                      {t("payment-type")}:
                    </Typography>
                    <Typography variant="body-sm" as="p" className="text-gray-600">
                      {request.rentDetails.rentType}
                    </Typography>
                  </div>
                )}
              </div>

              {request.rentDetails.amount && (
                <div className={cn("flex items-center gap-2 text-gray-600", locale === "ar" && "flex-row-reverse")}>
                  <DollarSign className="h-4 w-4 shrink-0" />
                  <div>
                    <Typography variant="body-sm" as="span" className="font-medium">
                      {t("rent-amount")}:
                    </Typography>
                    <Typography variant="body-sm" as="span" className="ml-2">
                      {request.rentDetails.amount} {currency}
                    </Typography>
                  </div>
                </div>
              )}

              {request.user?.phoneNumber && (
                <div className={cn("flex items-center gap-2 text-gray-600", locale === "ar" && "flex-row-reverse")}>
                  <Phone className="h-4 w-4 shrink-0" />
                  <div>
                    <Typography variant="body-sm" as="span" className="font-medium">
                      {t("phone-number")}:
                    </Typography>
                    <Typography variant="body-sm" as="span" className="ml-2">
                      {request.user.phoneNumber}
                    </Typography>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Accept/Reject Buttons */}
          {request.tenantStatus?.toUpperCase() === "PENDING" && onApproveReject && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className={cn("flex gap-3", locale === "ar" && "flex-row-reverse")}>
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    onApproveReject("approve", request._id, propertyTitle);
                  }}
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
                  onClick={(e) => {
                    e.stopPropagation();
                    onApproveReject("reject", request._id, propertyTitle);
                  }}
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
      }}
    </BaseDetailsModal>
  );
}
