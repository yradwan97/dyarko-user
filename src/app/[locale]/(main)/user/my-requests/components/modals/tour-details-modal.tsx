"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Calendar, Phone, MessageSquare, CheckCircle, XCircle } from "lucide-react";
import Typography from "@/components/shared/typography";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { type BaseModalProps } from "./types";
import { BaseDetailsModal } from "./base-modal";
import { useUpdateTourStatus } from "@/hooks/use-user";
import { toast } from "sonner";

export function TourDetailsModal(props: BaseModalProps) {
  const tModal = useTranslations("User.MyRequests");
  const [confirmationDialog, setConfirmationDialog] = useState<{
    open: boolean;
    action: "completed" | "cancelled" | null;
  }>({
    open: false,
    action: null,
  });

  const updateTourStatusMutation = useUpdateTourStatus();

  const handleConfirmAction = async (tourId: string) => {
    if (!confirmationDialog.action) return;

    try {
      await updateTourStatusMutation.mutateAsync({
        tourId,
        status: confirmationDialog.action,
      });

      toast.success(
        confirmationDialog.action === "completed"
          ? tModal("tour-completed-success")
          : tModal("tour-canceled-success")
      );

      setConfirmationDialog({
        open: false,
        action: null,
      });

      // Close the modal
      props.onClose();
    } catch (error) {
      toast.error(tModal("tour-update-failed"));
    }
  };

  return (
    <>
      <BaseDetailsModal {...props} requestType="tours">
        {({ request, locale, t, formatDate }) => (
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

          {/* Tour Completion Question - Only show if status is approved */}
          {request.status?.toUpperCase() === "APPROVED" && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className={cn("space-y-4", locale === "ar" && "text-right")}>
                <Typography variant="body-md-bold" as="h4" className="font-semibold text-gray-900">
                  {t("tour-completion-question")}
                </Typography>
                <div className={cn("flex gap-3", locale === "ar" && "flex-row-reverse")}>
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      setConfirmationDialog({
                        open: true,
                        action: "completed",
                      });
                    }}
                    disabled={updateTourStatusMutation.isPending}
                    className="flex-1 bg-main-600 hover:bg-main-700 text-white font-semibold"
                  >
                    {updateTourStatusMutation.isPending && confirmationDialog.action === "completed" ? (
                      <Spinner className="h-4 w-4" />
                    ) : (
                      <>
                        <CheckCircle className={cn("h-4 w-4", locale === "ar" ? "ml-2" : "mr-2")} />
                        {t("yes")}
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      setConfirmationDialog({
                        open: true,
                        action: "cancelled",
                      });
                    }}
                    disabled={updateTourStatusMutation.isPending}
                    className="flex-1 bg-secondary-500 hover:bg-secondary-500 text-white font-semibold"
                  >
                    {updateTourStatusMutation.isPending && confirmationDialog.action === "cancelled" ? (
                      <Spinner className="h-4 w-4" />
                    ) : (
                      <>
                        <XCircle className={cn("h-4 w-4", locale === "ar" ? "ml-2" : "mr-2")} />
                        {t("no")}
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
        )}
      </BaseDetailsModal>

      {/* Tour Completion Confirmation Dialog */}
      <AlertDialog
        open={confirmationDialog.open}
        onOpenChange={(open) =>
          !open &&
          setConfirmationDialog({
            open: false,
            action: null,
          })
        }
      >
        <AlertDialogContent className="bg-white dark:bg-gray-950">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-gray-900 text-center dark:text-white">
              {confirmationDialog.action === "completed"
                ? tModal("tour-completion-confirm-title")
                : tModal("tour-cancellation-confirm-title")}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600 dark:text-gray-400">
              {confirmationDialog.action === "completed"
                ? tModal("tour-completion-confirm-description")
                : tModal("tour-cancellation-confirm-description")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={updateTourStatusMutation.isPending}
              className="text-gray-900 dark:text-white"
            >
              {tModal("confirmation.cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleConfirmAction(props.request?._id || props.requestId || "")}
              disabled={updateTourStatusMutation.isPending}
              className={
                confirmationDialog.action === "completed"
                  ? "bg-main-600 hover:bg-main-600 text-white"
                  : "bg-secondary-500 hover:bg-secondary-500 text-white"
              }
            >
              {updateTourStatusMutation.isPending ? (
                <Spinner className="h-4 w-4" />
              ) : (
                tModal("confirmation.confirm")
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
