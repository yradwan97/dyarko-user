"use client";

import { Phone } from "lucide-react";
import Typography from "@/components/shared/typography";
import { cn } from "@/lib/utils";
import { BaseModalProps } from "./types";
import { BaseDetailsModal } from "./base-modal";

export function ServiceDetailsModal(props: BaseModalProps) {
  return (
    <BaseDetailsModal {...props} requestType="service">
      {({ request, locale, t }) => (
        <div className="space-y-4">
          {request.services && request.services.length > 0 && (
            <div>
              <Typography variant="body-sm" as="p" className="font-medium text-gray-700 mb-2">
                {t("service-requested")}:
              </Typography>
              <Typography variant="body-sm" as="p" className="text-gray-600">
                {request.services.map((s: any) => locale === "ar" ? s.nameAr : s.nameEn).join(", ")}
              </Typography>
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
      )}
    </BaseDetailsModal>
  );
}
