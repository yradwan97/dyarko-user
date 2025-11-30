"use client";

import { useState, useRef } from "react";
import { useTranslations } from "next-intl";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { X, FileIcon, Upload } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { axiosClient } from "@/lib/services";
import { toast } from "sonner";

interface AddClaimsDialogProps {
  rentId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AddClaimsDialog({
  rentId,
  open,
  onOpenChange,
}: AddClaimsDialogProps) {
  const t = useTranslations("User.MyRealEstates.ClaimsDialog");
  const tModal = useTranslations("User.MyRealEstates.RentDetailsModal");
  const queryClient = useQueryClient();

  const [claims, setClaims] = useState<string>("");
  const [attachment, setAttachment] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addClaimsMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await axiosClient.post("/claims", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
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
    setClaims("");
    setAttachment(null);
    setShowConfirmation(false);
    onOpenChange(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error(t("file-too-large"));
        return;
      }
      setAttachment(file);
    }
  };

  const handleRemoveFile = () => {
    setAttachment(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error(t("file-too-large"));
        return;
      }
      setAttachment(file);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = () => {
    if (!rentId || !claims.trim() || !attachment) {
      toast.error(t("fill-all-fields"));
      return;
    }

    setShowConfirmation(true);
  };

  const handleConfirmedSubmit = () => {
    if (!rentId || !attachment) return;

    const formData = new FormData();
    formData.append("rent", rentId);
    formData.append("claim", claims.trim());
    formData.append("attachment", attachment);

    addClaimsMutation.mutate(formData);
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
          {/* Claims Textarea */}
          <div className="space-y-2">
            <Label
              htmlFor="claims-text"
              className="text-sm font-medium text-gray-900 dark:text-white"
            >
              {t("claims")}
            </Label>
            <Textarea
              id="claims-text"
              value={claims}
              onChange={(e) => setClaims(e.target.value)}
              placeholder={t("claims-placeholder")}
              rows={5}
              className="w-full resize-none bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800"
            />
          </div>

          {/* File Upload */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-900 dark:text-white">
              {t("attachment")}
            </Label>

            {!attachment ? (
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={handleUploadClick}
                className={`
                  relative border-2 border-dashed rounded-lg p-6 transition-all cursor-pointer
                  ${isDragging
                    ? 'border-main-500 bg-main-50 dark:bg-main-950/20'
                    : 'border-gray-300 dark:border-gray-700 hover:border-main-400 dark:hover:border-main-600 bg-gray-50 dark:bg-gray-900/50 hover:bg-gray-100 dark:hover:bg-gray-900'
                  }
                `}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileChange}
                  accept="image/*,.pdf,.doc,.docx"
                  className="hidden"
                />
                <div className="flex flex-col items-center justify-center gap-2 text-center">
                  <div className={`
                    rounded-full p-3 transition-colors
                    ${isDragging
                      ? 'bg-main-100 dark:bg-main-900/30'
                      : 'bg-gray-200 dark:bg-gray-800'
                    }
                  `}>
                    <Upload className={`
                      h-6 w-6 transition-colors
                      ${isDragging
                        ? 'text-main-600 dark:text-main-400'
                        : 'text-gray-500 dark:text-gray-400'
                      }
                    `} />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {isDragging ? t("drop-file") : t("click-or-drag")}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      PDF, DOC, DOCX, or Images (max 10MB)
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-800 rounded-lg">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="rounded-full p-2 bg-main-100 dark:bg-main-900/30">
                    <FileIcon className="h-5 w-5 text-main-600 dark:text-main-400 flex-shrink-0" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {attachment.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {(attachment.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleRemoveFile}
                  className="h-8 w-8 p-0 hover:bg-red-100 dark:hover:bg-red-900/20"
                >
                  <X className="h-4 w-4 text-red-600 dark:text-red-400" />
                </Button>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={addClaimsMutation.isPending}
            className="border-gray-200 dark:border-gray-800"
          >
            {t("cancel")}
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={
              addClaimsMutation.isPending || !claims.trim() || !attachment
            }
            className="bg-main-600 hover:bg-main-700 text-white"
          >
            {addClaimsMutation.isPending ? (
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
      title={tModal("confirmation.claims.title")}
      description={tModal("confirmation.claims.description")}
      cancelText={tModal("confirmation.cancel")}
      confirmText={tModal("confirmation.confirm")}
      onConfirm={handleConfirmedSubmit}
      isLoading={addClaimsMutation.isPending}
    />
  </>
  );
}
