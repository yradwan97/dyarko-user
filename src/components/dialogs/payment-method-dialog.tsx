"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useGetPaymentMethods } from "@/hooks/use-payment-methods";
import { Check } from "lucide-react";
import Image from "next/image";

interface PaymentMethodDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (paymentMethod: string) => Promise<void>;
  amount?: number;
  currency?: string;
}

export default function PaymentMethodDialog({
  open,
  onOpenChange,
  onConfirm,
  amount,
  currency = "KWD",
}: PaymentMethodDialogProps) {
  const t = useTranslations("PaymentMethodDialog");
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const { data: paymentMethods, isLoading } = useGetPaymentMethods(open);

  const handleConfirm = async () => {
    if (!selectedMethod) return;

    setIsProcessing(true);
    try {
      await onConfirm(selectedMethod);
      onOpenChange(false);
    } catch (error) {
      // Error handling is done in the parent component
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    if (!isProcessing) {
      setSelectedMethod(null);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>
            {amount && (
              <span className="block mt-2 text-lg font-semibold text-gray-900 dark:text-white">
                {t("amount")}: {amount} {currency}
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Spinner className="h-8 w-8 text-main-400" />
            </div>
          ) : (
            <>
              <div className="space-y-3">
                {paymentMethods?.map((method) => (
                  <button
                    key={method.key}
                    onClick={() => setSelectedMethod(method.key)}
                    disabled={isProcessing}
                    className={`w-full p-4 border-2 rounded-lg transition-all flex items-center gap-4 ${
                      selectedMethod === method.key
                        ? "border-main-600 bg-main-50 dark:bg-main-900/20"
                        : "border-gray-200 dark:border-gray-700 hover:border-main-400"
                    } ${isProcessing ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                  >
                    <div className="relative w-16 h-10 flex-shrink-0">
                      <Image
                        src={method.logo}
                        alt={method.name}
                        fill
                        className="object-contain"
                      />
                    </div>
                    <span className="flex-1 text-left font-medium text-gray-900 dark:text-white">
                      {method.name}
                    </span>
                    {selectedMethod === method.key && (
                      <div className="flex-shrink-0 w-6 h-6 bg-main-600 rounded-full flex items-center justify-center">
                        <Check className="h-4 w-4 text-white" />
                      </div>
                    )}
                  </button>
                ))}
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={handleClose}
                  disabled={isProcessing}
                  className="flex-1"
                >
                  {t("cancel")}
                </Button>
                <Button
                  onClick={handleConfirm}
                  disabled={!selectedMethod || isProcessing}
                  className="flex-1 bg-main-600 hover:bg-main-700 text-white"
                >
                  {isProcessing ? (
                    <>
                      <Spinner className="h-4 w-4 mr-2" />
                      {t("processing")}
                    </>
                  ) : (
                    t("confirm")
                  )}
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
