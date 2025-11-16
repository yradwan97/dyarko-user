"use client";

import { Calendar, DollarSign, Phone } from "lucide-react";
import Typography from "@/components/shared/typography";
import { cn } from "@/lib/utils";
import { BaseModalProps } from "./types";
import { BaseDetailsModal } from "./base-modal";

export function EndContractDetailsModal(props: BaseModalProps) {
  return (
    <BaseDetailsModal {...props} requestType="end-contracts">
      {({ request, locale, t, formatDate, currency }) => (
        <div className="space-y-4">
          {request.rent && (
            <>
              <div className={cn("flex items-center gap-2 text-gray-600", locale === "ar" && "flex-row-reverse")}>
                <Calendar className="h-4 w-4 shrink-0" />
                <div>
                  <Typography variant="body-sm" as="span" className="font-medium">
                    {t("check-in-out-date")}:
                  </Typography>
                  <Typography variant="body-sm" as="span" className="ml-2">
                    {formatDate(request.rent.startDate)} : {formatDate(request.rent.endDate)}
                  </Typography>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {request.rent.rentType && (
                  <div className={cn(locale === "ar" && "text-right")}>
                    <Typography variant="body-sm" as="p" className="font-medium text-gray-700">
                      {t("rent-period")}:
                    </Typography>
                    <Typography variant="body-sm" as="p" className="text-gray-600">
                      {request.rent.rentType}
                    </Typography>
                  </div>
                )}
                <div className={cn(locale === "ar" && "text-right")}>
                  <Typography variant="body-sm" as="p" className="font-medium text-gray-700">
                    {t("rent-type")}:
                  </Typography>
                  <Typography variant="body-sm" as="p" className="text-gray-600">
                    {request.rent.rentType || "Monthly"}
                  </Typography>
                </div>
              </div>

              {request.rent.amount && (
                <div className={cn("flex items-center gap-2 text-gray-600", locale === "ar" && "flex-row-reverse")}>
                  <DollarSign className="h-4 w-4 shrink-0" />
                  <div>
                    <Typography variant="body-sm" as="span" className="font-medium">
                      {t("rent-amount")}:
                    </Typography>
                    <Typography variant="body-sm" as="span" className="ml-2">
                      {request.rent.amount} {currency}
                    </Typography>
                  </div>
                </div>
              )}

              {request.mobileNumber && (
                <div className={cn("flex items-center gap-2 text-gray-600", locale === "ar" && "flex-row-reverse")}>
                  <Phone className="h-4 w-4 shrink-0" />
                  <div>
                    <Typography variant="body-sm" as="span" className="font-medium">
                      {t("phone-number")}:
                    </Typography>
                    <Typography variant="body-sm" as="span" className="ml-2">
                      {request.mobileNumber}
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
