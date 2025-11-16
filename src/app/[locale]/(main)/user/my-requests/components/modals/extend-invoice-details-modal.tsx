"use client";

import { DollarSign, Phone } from "lucide-react";
import Typography from "@/components/shared/typography";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { BaseModalProps } from "./types";
import { BaseDetailsModal } from "./base-modal";

export function ExtendInvoiceDetailsModal(props: BaseModalProps) {
  return (
    <BaseDetailsModal {...props} requestType="extend-invoices">
      {({ request, locale, t, formatDate, currency }) => (
        <>
          <div className="space-y-4">
            {request.invoice && (
              <>
                {request.invoice.userAmount && (
                  <div className={cn("flex items-center gap-2 text-gray-600", locale === "ar" && "flex-row-reverse")}>
                    <DollarSign className="h-4 w-4 shrink-0" />
                    <div>
                      <Typography variant="body-sm" as="span" className="font-medium">
                        {t("invoice-amount")}:
                      </Typography>
                      <Typography variant="body-sm" as="span" className="ml-2">
                        {request.invoice.userAmount} {currency}
                      </Typography>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  {request.invoice.date && (
                    <div className={cn(locale === "ar" && "text-right")}>
                      <Typography variant="body-sm" as="p" className="font-medium text-gray-700">
                        {t("invoice-date")}:
                      </Typography>
                      <Typography variant="body-sm" as="p" className="text-gray-600">
                        {formatDate(request.invoice.date)}
                      </Typography>
                    </div>
                  )}
                  {request.extendTo && (
                    <div className={cn(locale === "ar" && "text-right")}>
                      <Typography variant="body-sm" as="p" className="font-medium text-gray-700">
                        {t("extend-invoice-date")}:
                      </Typography>
                      <Typography variant="body-sm" as="p" className="text-gray-600">
                        {formatDate(request.extendTo)}
                      </Typography>
                    </div>
                  )}
                </div>

                {request.owner?.phoneNumber && (
                  <div className={cn("flex items-center gap-2 text-gray-600", locale === "ar" && "flex-row-reverse")}>
                    <Phone className="h-4 w-4 shrink-0" />
                    <div>
                      <Typography variant="body-sm" as="span" className="font-medium">
                        {t("phone-number")}:
                      </Typography>
                      <Typography variant="body-sm" as="span" className="ml-2">
                        {request.owner.phoneNumber}
                      </Typography>
                    </div>
                  </div>
                )}
              </>
            )}

            {request.ownerComment && (
              <div className={cn("p-3 bg-gray-50 border-gray-200 rounded", locale === "ar" ? "border-r-4" : "border-l-4")}>
                <Typography variant="body-sm" as="p" className="font-medium text-gray-700 mb-1">
                  {t("comment")}:
                </Typography>
                <Typography variant="body-sm" as="p" className="text-gray-600">
                  {request.ownerComment}
                </Typography>
              </div>
            )}
          </div>

          {/* Pay Now button for rejected requests */}
          {request.status?.toLowerCase() === "rejected" && (
            <Button
              variant="default"
              className="w-full mt-6 bg-main-600 hover:bg-main-700"
              onClick={() => {
                console.log("Pay now for extend invoice");
              }}
            >
              {t("pay-now")}
            </Button>
          )}
        </>
      )}
    </BaseDetailsModal>
  );
}
