"use client";

import { Phone, FileText } from "lucide-react";
import Typography from "@/components/shared/typography";
import { cn } from "@/lib/utils";
import { type BaseModalProps } from "./types";
import { BaseDetailsModal } from "./base-modal";

export function DisclaimerDetailsModal(props: BaseModalProps) {
  return (
    <BaseDetailsModal {...props} requestType="disclaimers">
      {({ request, locale, t }) => (
        <div className="space-y-4">
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

          {request.file && (
            <div className={cn(locale === "ar" && "text-right")}>
              <Typography variant="body-sm" as="p" className="font-medium text-gray-700 mb-2">
                {t("disclaimer-file")}:
              </Typography>
              <a
                href={request.file}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-main-600 hover:underline text-sm"
              >
                <FileText className="h-4 w-4 stroke-red-600" />
                {t("view-file")}
              </a>
            </div>
          )}

          {request.reason && (
            <div className={cn("p-3 bg-gray-50 border-gray-200 rounded", locale === "ar" ? "border-r-4" : "border-l-4")}>
              <Typography variant="body-sm" as="p" className="font-medium text-gray-700 mb-1">
                {t("comment")}:
              </Typography>
              <Typography variant="body-sm" as="p" className="text-gray-600">
                {request.reason}
              </Typography>
            </div>
          )}
        </div>
      )}
    </BaseDetailsModal>
  );
}
