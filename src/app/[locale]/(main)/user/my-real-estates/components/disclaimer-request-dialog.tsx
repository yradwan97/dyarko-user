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
  DialogDescription,
} from "@/components/ui/dialog";
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
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { axiosClient } from "@/lib/services";
import { toast } from "sonner";

interface DisclaimerRequestDialogProps {
  rentId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface DisclaimerPayload {
  rent: string;
}

export default function DisclaimerRequestDialog({
  rentId,
  open,
  onOpenChange,
}: DisclaimerRequestDialogProps) {
  const t = useTranslations("User.MyRealEstates.DisclaimerDialog");
  const tModal = useTranslations("User.MyRealEstates.RentDetailsModal");
  const queryClient = useQueryClient();

  const [showConfirmation, setShowConfirmation] = useState(false);

  const disclaimerMutation = useMutation({
    mutationFn: async (payload: DisclaimerPayload) => {
      const response = await axiosClient.post("/disclaimers", payload);
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
    setShowConfirmation(false);
    onOpenChange(false);
  };

  const handleSubmit = () => {
    if (!rentId) {
      toast.error(t("error"));
      return;
    }

    setShowConfirmation(true);
  };

  const handleConfirmedSubmit = () => {
    if (!rentId) return;

    disclaimerMutation.mutate({
      rent: rentId,
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
            <DialogDescription className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              {t("description")}
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="gap-2 mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={disclaimerMutation.isPending}
              className="border-gray-200 dark:border-gray-800"
            >
              {t("cancel")}
            </Button>
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={disclaimerMutation.isPending}
              className="bg-main-600 hover:bg-main-700 text-white"
            >
              {disclaimerMutation.isPending ? (
                <Spinner className="h-4 w-4" />
              ) : (
                t("submit")
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation Alert Dialog */}
      <AlertDialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <AlertDialogContent className="bg-white dark:bg-gray-950">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-gray-900 dark:text-white">
              {tModal("confirmation.disclaimer.title")}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600 dark:text-gray-400">
              {tModal("confirmation.disclaimer.description")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="text-gray-900 dark:text-white">
              {tModal("confirmation.cancel")}
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmedSubmit} disabled={disclaimerMutation.isPending}>
              {disclaimerMutation.isPending ? (
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
