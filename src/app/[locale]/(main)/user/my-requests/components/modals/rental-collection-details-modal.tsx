"use client";

import { Calendar, DollarSign, Phone } from "lucide-react";
import Typography from "@/components/shared/typography";
import { cn } from "@/lib/utils";
import { BaseModalProps } from "./types";
import { BaseDetailsModal } from "./base-modal";

export function RentalCollectionDetailsModal(props: BaseModalProps) {
  return (
    <BaseDetailsModal {...props} requestType="rental-collection">
      {({ request, locale, t, formatDate, currency }) => (
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
        </div>
      )}
    </BaseDetailsModal>
  );
}
