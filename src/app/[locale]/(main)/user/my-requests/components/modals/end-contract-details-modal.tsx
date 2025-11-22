"use client";

import { Calendar, Clock, DollarSign, MessageSquare, Phone } from "lucide-react";
import Typography from "@/components/shared/typography";
import { cn } from "@/lib/utils";
import { BaseModalProps } from "./types";
import { BaseDetailsModal } from "./base-modal";
import { Textarea } from "@/components/ui/textarea";

export function EndContractDetailsModal(props: BaseModalProps) {
  return (
    <BaseDetailsModal {...props} requestType="end-contracts">
      {({ request, locale, t, formatDate, currency }) => (
        <div className="space-y-4">
          {request.rent && (
            <>
              <div className={cn("flex items-center gap-2 text-gray-600")}>
                <Calendar className="h-4 w-4 shrink-0" />
                <div className="flex gap-2">
                  <Typography variant="body-sm" as="span" className="font-medium">
                    {t("check-in-out-date")}:
                  </Typography>
                  <Typography variant="body-sm" as="span" className="ml-2">
                    {formatDate(request.rent.startDate)} : {formatDate(request.rent.endDate)}
                  </Typography>
                </div>
              </div>

              {request.rent.rentType && (
                <div className={cn("flex items-center gap-2 text-gray-600")}>
                  <Clock className="h-4 w-4 shrink-0" />
                  <div className="flex gap-2">
                    <Typography variant="body-sm" as="p" className="font-medium text-gray-700">
                      {t("rent-period")}:
                    </Typography>
                    <Typography variant="body-sm" as="p" className="text-gray-600 capitalize">
                      {t(`price-type-${request.rent.rentType}`)}
                    </Typography>
                  </div>
                </div>
              )}

              {request.rent.amount && (
                <div className={cn("flex items-center gap-2 text-gray-600")}>
                  <DollarSign className="h-4 w-4 shrink-0" />
                  <div>
                    <Typography variant="body-sm" as="span" className="font-medium">
                      {t("rent-amount")}:
                    </Typography>
                    <Typography variant="body-sm" as="span">
                      {request.rent.amount} {currency}
                    </Typography>
                  </div>
                </div>
              )}

              {request.mobileNumber && (
                <div className={cn("flex items-center gap-2 text-gray-600")}>
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

              {request.reason && (
                <div className={cn("flex items-center gap-2 text-gray-600")}>
                  <MessageSquare className="h-4 w-4 shrink-0" />
                  <div>
                    <Typography variant="body-sm" as="span" className="font-medium">
                      {t("reason")}:
                    </Typography>
                    <Textarea rows={3} defaultValue={request.reason} disabled/>
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
