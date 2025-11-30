"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import ConfirmationDialog from "@/components/dialogs/confirmation-dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { axiosClient } from "@/lib/services";
import { toast } from "sonner";

interface RequestEndContractDialogProps {
  rentId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface EndContractPayload {
  rent: string;
  reason: string;
}

export default function RequestEndContractDialog({
  rentId,
  open,
  onOpenChange,
}: RequestEndContractDialogProps) {
  const t = useTranslations("User.MyRealEstates.EndContractDialog");
  const tModal = useTranslations("User.MyRealEstates.RentDetailsModal");
  const queryClient = useQueryClient();

  const [reason, setReason] = useState<string>("");
  const [showConfirmation, setShowConfirmation] = useState(false);

  const endContractMutation = useMutation({
    mutationFn: async (payload: EndContractPayload) => {
      const response = await axiosClient.post("/end-contracts", payload);
      return response.data;
    },
    onSuccess: () => {
      toast.success(t("success"));
      queryClient.invalidateQueries({ queryKey: ["rent-details"] });
      handleClose();
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message || t("error");
      toast.error(errorMessage);
      handleClose();
    },
  });

  const handleClose = () => {
    setReason("");
    setShowConfirmation(false);
    onOpenChange(false);
  };

  const handleSubmit = () => {
    if (!rentId || !reason.trim()) {
      toast.error(t("fill-reason"));
      return;
    }

    setShowConfirmation(true);
  };

  const handleConfirmedSubmit = () => {
    if (!rentId) return;

    endContractMutation.mutate({
      rent: rentId,
      reason: reason.trim(),
    });
    setShowConfirmation(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md bg-white dark:bg-gray-950">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-900 dark:text-white">
              {t("title")}
            </DialogTitle>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              {t("description")}
            </p>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Reason Textarea */}
            <div className="space-y-2">
              <Label
                htmlFor="end-contract-reason"
                className="text-sm font-medium text-gray-900 dark:text-white"
              >
                {t("reason")}
              </Label>
              <Textarea
                id="end-contract-reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder={t("reason-placeholder")}
                rows={5}
                className="w-full resize-none bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800"
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={endContractMutation.isPending}
              className="border-gray-200 dark:border-gray-800"
            >
              {t("cancel")}
            </Button>
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={endContractMutation.isPending || !reason.trim()}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {endContractMutation.isPending ? (
                <Spinner className="h-4 w-4" />
              ) : (
                t("submit")
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation Alert Dialog */}
      <ConfirmationDialog
        open={showConfirmation}
        onOpenChange={setShowConfirmation}
        title={tModal("confirmation.end-contract.title")}
        description={tModal("confirmation.end-contract.description")}
        cancelText={tModal("confirmation.cancel")}
        confirmText={tModal("confirmation.confirm")}
        onConfirm={handleConfirmedSubmit}
        isLoading={endContractMutation.isPending}
      />
    </>
  );
}
