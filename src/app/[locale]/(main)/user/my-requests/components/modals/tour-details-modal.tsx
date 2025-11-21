"use client";

import { Calendar, Phone, MessageSquare } from "lucide-react";
import Typography from "@/components/shared/typography";
import { type BaseModalProps } from "./types";
import { BaseDetailsModal } from "./base-modal";

export function TourDetailsModal(props: BaseModalProps) {
  return (
    <BaseDetailsModal {...props} requestType="tours">
      {({ request, t, formatDate }) => (
        <div className="space-y-4">
          {request.date && (
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 shrink-0 text-gray-400" />
              <div>
                <Typography variant="body-sm" as="p" className="font-medium text-gray-700">
                  {t("tour-date")}
                </Typography>
                <Typography variant="body-md" as="p" className="text-gray-900">
                  {formatDate(request.date)}
                </Typography>
              </div>
            </div>
          )}

          {request.mobileNumber && (
            <div className="flex items-center gap-3">
              <Phone className="h-5 w-5 shrink-0 text-gray-400" />
              <div>
                <Typography variant="body-sm" as="p" className="font-medium text-gray-700">
                  {t("phone-number")}:
                </Typography>
                <Typography variant="body-md" as="p" className="text-gray-900">
                  {request.mobileNumber}
                </Typography>
              </div>
            </div>
          )}

          {/* User Comment */}
          {request.userComment && (
            <div className="flex items-start gap-3">
              <MessageSquare className="h-5 w-5 shrink-0 text-gray-400 mt-1" />
              <div className="flex-1">
                <Typography variant="body-sm" as="p" className="font-medium text-gray-700 mb-2">
                  {t("comment")}:
                </Typography>
                <div className="p-4 bg-gray-100 rounded-lg">
                  <Typography variant="body-sm" as="p" className="text-gray-700">
                    {request.userComment}
                  </Typography>
                </div>
              </div>
            </div>
          )}

          {/* Owner Comment */}
          {request.ownerComment && (
            <div className="flex items-start gap-3">
              <MessageSquare className="h-5 w-5 shrink-0 text-gray-400 mt-1" />
              <div className="flex-1">
                <Typography variant="body-sm" as="p" className="font-medium text-gray-700 mb-2">
                  {t("owner-comment")}:
                </Typography>
                <div className="p-4 bg-gray-100 rounded-lg">
                  <Typography variant="body-sm" as="p" className="text-gray-700">
                    {request.ownerComment}
                  </Typography>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </BaseDetailsModal>
  );
}
