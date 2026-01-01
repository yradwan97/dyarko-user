"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PaymentResultDialogProps {
  open: boolean;
  onClose: () => void;
  isSuccess: boolean;
}

export default function PaymentResultDialog({
  open,
  onClose,
  isSuccess,
}: PaymentResultDialogProps) {
  const t = useTranslations("General.PaymentResult");

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md bg-white dark:bg-gray-950 p-8">
        <VisuallyHidden>
          <DialogTitle>
            {isSuccess ? t("success-title") : t("fail-title")}
          </DialogTitle>
        </VisuallyHidden>
        <div className="flex flex-col items-center text-center space-y-6">
          <Image
            src={isSuccess ? "/icons/successIcon.svg" : "/icons/failIcon.svg"}
            alt={isSuccess ? t("success-alt") : t("fail-alt")}
            width={82}
            height={82}
          />

          <div className="space-y-2">
            <h2
              className={cn(
                "text-2xl font-bold",
                isSuccess
                  ? "text-[#20B2AA]"
                  : "text-secondary-500"
              )}
            >
              {isSuccess ? t("success-title") : t("fail-title")}
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              {isSuccess ? t("success-description") : t("fail-description")}
            </p>
          </div>

          <Button
            onClick={onClose}
            className={cn(
              "w-full",
              isSuccess
                ? "bg-[#20B2AA] hover:bg-[#1a9a94]"
                : "bg-secondary-500 hover:bg-[#d32f3d]",
              "text-white"
            )}
          >
            {t("close")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
